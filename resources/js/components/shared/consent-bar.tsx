/* Shared with TableProApp/web and TableProApp/license at resources/js/components/shared/consent-bar.tsx. Change both in the same release. See docs/shared-files.md. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Button from '@/components/ui/button';
import { textLinkClasses } from '@/components/ui/text-link';
import { CONSENT_OPEN_EVENT, readConsent, saveConsent, type ConsentChoice } from '@/lib/consent';

export interface ConsentBarLabels {
    /** The region's name: "Analytics cookies". */
    label: string;
    /**
     * One short question naming the tool and its purpose. Kept to one line at
     * 1440px and two at 375px, so the bar stays within 96px and 120px.
     */
    body: string;
    /** The privacy link's text. */
    privacy: string;
    allow: string;
    decline: string;
}

interface ConsentBarProps {
    labels: ConsentBarLabels;
    /** The cookies section of the privacy policy in the page's language: `/privacy#cookies`, `/vi/privacy#cookies`. */
    privacyHref: string;
}

/**
 * Asks once whether Google Analytics may set cookies, and again whenever a
 * "Cookie settings" control reopens it (design-system §5.3.17).
 *
 * **Declining is as easy as allowing.** Allow and Decline are the same
 * variant, the same size and the same width, side by side. A filled "Allow"
 * beside an outlined "Decline" is the pattern regulators single out.
 *
 * **It never renders on the server.** Whether it is needed depends on
 * `localStorage`, which SSR cannot see, so the first render is nothing and the
 * check runs after hydration.
 *
 * **It exists only where the tag does.** With no measurement ID there is no
 * `gtag` and nothing to consent to, so development never shows it.
 *
 * **It never hides what it sits on.** Compact (one sentence, one row of
 * buttons), bottom-left, last in the DOM so it is the last tab stop, and while
 * it is open it sets `scroll-padding-bottom` to its own height so a focused
 * element is never scrolled underneath it. Where it reaches the bottom-right
 * corner (on a phone it spans the width), the chat launcher hides until it
 * closes (`lib/crisp.ts` finds it by `data-consent-bar`).
 */
export default function ConsentBar({ labels, privacyHref }: ConsentBarProps) {
    const [open, setOpen] = useState(false);
    const bar = useRef<HTMLElement>(null);

    useEffect(() => {
        if (typeof (window as unknown as { gtag?: unknown }).gtag !== 'function') {
            return;
        }

        if (readConsent() === null) {
            setOpen(true);
        }

        const reopen = (): void => setOpen(true);

        window.addEventListener(CONSENT_OPEN_EVENT, reopen);

        return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
    }, []);

    useLayoutEffect(() => {
        const node = bar.current;

        if (!open || !node) {
            return;
        }

        const root = document.documentElement;
        const reserve = (): void => {
            root.style.scrollPaddingBottom = `${node.offsetHeight + 16}px`;
        };

        reserve();

        const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(reserve) : null;

        observer?.observe(node);

        return () => {
            observer?.disconnect();
            root.style.scrollPaddingBottom = '';
        };
    }, [open]);

    if (!open) {
        return null;
    }

    function choose(choice: ConsentChoice): void {
        saveConsent(choice);
        setOpen(false);
    }

    return (
        <section
            ref={bar}
            data-consent-bar
            aria-label={labels.label}
            className="fixed right-4 bottom-4 left-4 z-60 rounded-panel border border-rule bg-raised p-4 text-foreground shadow-overlay sm:right-auto sm:w-[26rem] print:hidden"
        >
            <p className="type-small">
                {labels.body}{' '}
                <a href={privacyHref} className={textLinkClasses('inline')}>
                    {labels.privacy}
                </a>
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" onClick={() => choose('granted')}>
                    {labels.allow}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => choose('denied')}>
                    {labels.decline}
                </Button>
            </div>
        </section>
    );
}
