import { X } from 'lucide-react';
import { usePage } from '@inertiajs/react';

export interface BannerConfig {
    message: string;
    messageShort: string;
    cta: string;
    href: string;
    version: string;
}

/** Shared by `HandleInertiaRequests::share()`, so every page has it. */
export function useBanner(): BannerConfig | null {
    return usePage<{ banner: BannerConfig | null }>().props.banner ?? null;
}

export const BANNER_STORAGE_KEY = 'tablepro:banner-dismissed';

/**
 * A standing line above the header saying what funds TablePro.
 *
 * This is the loudest surface on the site: it is the only thing every visitor
 * sees on every page, and it sits directly above a headline that reads "The app
 * is free." Three rules keep the two from arguing.
 *
 * **It states, it does not plead.** The message is a fact about the business
 * model and the control next to it is an offer. `FundingModelTest` scans the
 * rendered page for the plea vocabulary — "need your help", "cannot afford",
 * "don't cover" — and fails if any of it appears, here included. A standing ask
 * that sounds like it needs the money costs more from a Team buyer evaluating
 * whether this project outlives their purchase order than it collects from
 * everyone else.
 *
 * **It is seen, and that was measured.** It began on `--surface-raised`, which
 * is one step off the base ground — and one step is 0.0731 of relative
 * luminance in light and *0.0033* in dark. A bar nobody can see is not a quiet
 * bar, it is a bar that is not there, and in dark mode that is what it was.
 * `--primary` is 0.6490 and 0.3479 against the two grounds, the only option
 * that reads as a bar in both.
 *
 * The cost is real and taken deliberately: `app.css` records an accent scale
 * that stops at `/10` for "a filled chip or step marker", and a full-bleed
 * primary fill is off the top of it. Nothing else on the site is painted this
 * way, which is exactly why it registers — and why it must stay the only one.
 * If it proves too loud, `bg-primary/15` is a one-word change and keeps AA
 * (4.77:1 for the message); it also gives back most of the dark-mode
 * visibility, so make that trade knowingly.
 *
 * Every pairing here clears AAA and was computed rather than eyeballed:
 * `--primary-foreground` on `--primary` is 7.45:1, in both themes, because both
 * tokens are theme-invariant. It was 6.18:1 when this shipped — clearing AA but
 * reading flat, because the mark and the fill share hue 55 and a same-hue pair
 * has no hue separation helping it. Darkening the token fixed the banner and
 * the three buttons that wear the same pairing.
 *
 * **It can be closed, and stays closed.** Dismissal writes the config's version
 * to `localStorage` — the browser is the only place it can live, because this
 * domain has no session and no cookies. Reach is a first-impression property,
 * so nothing is lost by letting a reader who has already read it, or already
 * paid, put it away.
 *
 * Visibility is entirely CSS. The element renders whenever the config enables
 * it and `html.has-banner` decides whether it is seen, which is what lets the
 * pre-paint script in `app.blade.php` settle the question before first paint.
 * Deciding it in React state instead would flash the bar on every load for
 * every reader who had dismissed it.
 */
export default function SupportBanner() {
    const banner = useBanner();

    if (!banner) {
        return null;
    }

    function dismiss() {
        /*
         * Storage first, then the class. A private window throws on write, and
         * the reader closing the bar should still see it close — they just get
         * it again next time, which is the honest outcome for a browser that
         * cannot remember anything.
         */
        try {
            window.localStorage.setItem(BANNER_STORAGE_KEY, banner!.version);
        } catch {
            // No storage available. The dismissal lasts for this page only.
        }

        document.documentElement.classList.remove('has-banner');
    }

    return (
        /*
          * No height here. `app.css` sets it from `--banner-h`, the same token
          * the header's offset, `<main>`'s padding and `scroll-padding-top`
          * read — a second copy in this file is how the four stop agreeing.
          * 2.75rem is 44px, the smallest comfortable touch target, which the
          * dismiss control needs.
          */
        <div className="support-banner fixed inset-x-0 top-0 z-50 bg-primary text-primary-foreground">
            {/*
              * No hairline. `--rule` is a 7% black that vanishes on a saturated
              * fill, and the fill is its own boundary.
              */}
            <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
                <p className="min-w-0 flex-1 truncate text-sm">
                    <span className="max-sm:hidden">{banner.message}</span>
                    <span className="sm:hidden">{banner.messageShort}</span>
                </p>

                {/*
                  * Weight and an underline carry the call to action, not colour.
                  * `--primary-strong` is tuned to sit on a *ground*, and on
                  * this fill it measures 2.24:1 in light and 1.36:1 in dark —
                  * the one place on the site where the accent token is the
                  * wrong tool.
                  */}
                <a
                    href={banner.href}
                    className="shrink-0 text-sm font-semibold underline underline-offset-4 transition-opacity duration-(--dur-tap) ease-(--ease-feedback) hover:opacity-70"
                >
                    {banner.cta}
                    <span aria-hidden="true"> &rarr;</span>
                </a>

                <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Dismiss"
                    className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center transition-opacity duration-(--dur-tap) ease-(--ease-feedback) hover:opacity-70"
                >
                    <X className="size-4" strokeWidth={2} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
