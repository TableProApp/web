import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import { PROSE_LINK } from '@/components/ui/prose-link';
import { CONSENT_OPEN_EVENT, readConsent, saveConsent, type ConsentChoice } from '@/lib/consent';

/**
 * Asks once whether Google Analytics may set cookies, and again whenever a
 * "Cookie settings" control reopens it.
 *
 * **Declining is as easy as allowing.** The two buttons are the same variant
 * at the same size, side by side. A filled "Allow" beside an outlined
 * "Decline" is the pattern regulators single out, and a choice nudged that way
 * is not freely given.
 *
 * **It never renders on the server.** Whether it is needed depends on
 * `localStorage`, which SSR cannot see, so the first render is always nothing
 * and the check runs after hydration. The cost is that it appears a beat after
 * the page — acceptable for a non-modal bar, and the alternative is a hydration
 * mismatch on every page for every first-time reader.
 *
 * **It exists only where the tag does.** With no measurement ID configured
 * there is no `gtag` and nothing to consent to, so development and staging
 * never show it.
 *
 * **It stays clear of the chat bubble.** Crisp pins its launcher to the
 * bottom-right corner above every z-index on the page — measured on the live
 * site at 54px square, 14px in from the corner on a phone and 24px on a
 * desktop. So the bar takes the bottom-left: a card from `sm` up, and on a
 * phone the full width minus 5.5rem, which is the launcher's 68px column plus a
 * 20px gap, rather than a bar the launcher would sit on top of.
 */
export default function ConsentBar() {
    const [open, setOpen] = useState(false);

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

    if (!open) {
        return null;
    }

    function choose(choice: ConsentChoice): void {
        saveConsent(choice);
        setOpen(false);
    }

    return (
        <section
            aria-label="Analytics cookies"
            className="consent-bar fixed bottom-3 left-3 right-[5.5rem] z-50 rounded-xl border border-rule-strong bg-popover p-4 text-popover-foreground shadow-lg sm:bottom-4 sm:left-4 sm:right-auto sm:w-[23rem]"
        >
            <p className="text-sm font-semibold">Analytics cookies</p>
            <p className="mt-1 text-sm text-muted-foreground">
                May Google Analytics set cookies so we can see which pages bring people to TablePro? Declining changes nothing else.{' '}
                <a href="/privacy#cookies" className={PROSE_LINK}>
                    Privacy policy
                </a>
            </p>
            <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => choose('granted')} className="flex-1">
                    Allow
                </Button>
                <Button variant="secondary" size="sm" onClick={() => choose('denied')} className="flex-1">
                    Decline
                </Button>
            </div>
        </section>
    );
}
