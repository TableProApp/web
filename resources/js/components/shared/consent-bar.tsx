/* Shared with TableProApp/web and TableProApp/license at resources/js/components/shared/consent-bar.tsx. Change both in the same release. See docs/shared-files.md. */
import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/button';
import { textLinkClasses } from '@/components/ui/text-link';
import { CONSENT_OPEN_EVENT, saveConsent, type ConsentChoice } from '@/lib/consent';
import { cn } from '@/lib/utils';

export interface ConsentBarLabels {
    label: string;
    // One line at 1440px and two at 375px, so the bar stays within 96px and 120px.
    body: string;
    privacy: string;
    allow: string;
    decline: string;
}

interface ConsentBarProps {
    labels: ConsentBarLabels;
    privacyHref: string;
}

// Each app's head script sets this on <html> before first paint when no answer is stored.
const OPEN = 'consent-open';

const FLOATING = 'sticky bottom-4 z-60 m-4 rounded-panel border p-4 shadow-overlay sm:w-[26rem] sm:self-start';
const IN_PAGE_ON_PHONES =
    'max-sm:static max-sm:order-first max-sm:m-0 max-sm:rounded-none max-sm:border-x-0 max-sm:border-t-0 max-sm:py-2.5 max-sm:shadow-none';

// A live region speaks only for what changes after it exists, so the question is put back once per document.
let announced = false;

// Design-system §5.3.17. In the server's HTML and shown by the class above, so it paints with the page and
// nothing moves on hydration. It floats at the bottom and rests after the footer at the end of the page.
// Below 640px the first ask sits in the page above the header instead, so it covers nothing.
export default function ConsentBar({ labels, privacyHref }: ConsentBarProps) {
    const bar = useRef<HTMLElement>(null);
    const [announce, setAnnounce] = useState(false);
    const [reopened, setReopened] = useState(0);

    useEffect(() => {
        const node = bar.current;

        // No tag, nothing to consent to.
        if (!node || typeof (window as unknown as { gtag?: unknown }).gtag !== 'function') {
            return;
        }

        const root = document.documentElement;
        const reserve = (): void => {
            const covers = node.offsetHeight > 0 && getComputedStyle(node).position !== 'static';

            // Keeps a focused element from scrolling underneath it.
            root.style.scrollPaddingBottom = covers ? `${node.offsetHeight + 16}px` : '';
        };
        const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(reserve) : null;
        const reopen = (): void => setReopened((count) => count + 1);

        reserve();
        observer?.observe(node);
        window.addEventListener(CONSENT_OPEN_EVENT, reopen);

        if (!announced && root.classList.contains(OPEN)) {
            announced = true;
            setAnnounce(true);
        }

        return () => {
            observer?.disconnect();
            window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
            root.style.scrollPaddingBottom = '';
        };
    }, []);

    // After the render, so the bar is already floating when it shows.
    useEffect(() => {
        if (reopened > 0) {
            document.documentElement.classList.add(OPEN);
            bar.current?.focus({ preventScroll: true });
        }
    }, [reopened]);

    function choose(choice: ConsentChoice): void {
        saveConsent(choice);
        document.documentElement.classList.remove(OPEN);
    }

    return (
        <section
            ref={bar}
            data-consent-bar
            aria-label={labels.label}
            aria-live="polite"
            tabIndex={-1}
            className={cn(
                'hidden border-rule bg-raised text-foreground outline-none in-[.consent-open]:block print:hidden',
                FLOATING,
                reopened === 0 && IN_PAGE_ON_PHONES,
            )}
        >
            <p key={announce ? 'announced' : 'server'} className="type-small">
                {labels.body}{' '}
                <a href={privacyHref} className={textLinkClasses('inline')}>
                    {labels.privacy}
                </a>
            </p>
            {/* Same variant, size and width: declining is as easy as allowing. */}
            <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" className="pointer-coarse:min-h-11" onClick={() => choose('granted')}>
                    {labels.allow}
                </Button>
                <Button variant="secondary" size="sm" className="pointer-coarse:min-h-11" onClick={() => choose('denied')}>
                    {labels.decline}
                </Button>
            </div>
        </section>
    );
}
