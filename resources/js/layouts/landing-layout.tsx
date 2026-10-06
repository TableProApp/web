import { useEffect, type ReactNode } from 'react';
import { useLiveChat } from '@/components/site/chat-button';
import ConsentBar from '@/components/site/consent-bar';
import FrameRails from '@/components/shared/frame-rails';
import SiteFooter from '@/components/site/site-footer';
import SiteHeader from '@/components/site/site-header';
import SupportBanner from '@/components/site/support-banner';
import { useI18n } from '@/i18n';
import { syncTheme } from '@/lib/theme';

interface Props {
    children: ReactNode;
    /**
     * False on a page that carries its own newsletter form (the blog index),
     * so the footer does not repeat the same field a screen below it.
     */
    footerNewsletter?: boolean;
}

/**
 * The public page frame: a stack in reading and tab order, drawn as a grid
 * (design-system §4.6, §4.7, §7.2).
 *
 * 1. The skip link, first in the document.
 * 2. The license banner, which scrolls away with the page, then the sticky
 *    header. The header is a real `banner` landmark because it sits outside
 *    `<main>`.
 * 3. `<main id="main-content" tabIndex={-1}>`, so the skip link moves focus
 *    into it rather than only scrolling.
 * 4. The footer, a `contentinfo` landmark for the same reason.
 * 5. The consent bar, last, so it is the last tab stop on the page.
 *
 * The grid is drawn, not laid out: the rails are a decorative overlay on this
 * `relative` root (`FrameRails`, from 1280px), and a full-bleed hairline joins
 * every two blocks of `<main>` (frame.css). Neither moves content or takes a
 * tab stop.
 *
 * Crisp's chat launcher joins every page once it has loaded and the browser is
 * idle (`useLiveChat`, `lib/crisp.ts`); it is not part of the server render.
 *
 * There is no toast region: nothing on the public site calls `toast()`, and
 * Sonner's region carried an English landmark name onto every /vi page.
 *
 * Nothing here clips overflow: `overflow-x: hidden` on an ancestor masked
 * horizontal-scroll regressions instead of preventing them, and would break the
 * sticky header. Anything wide scrolls inside its own region.
 */
export default function LandingLayout({ children, footerNewsletter = true }: Props) {
    const { locale, m } = useI18n();

    /*
     * `<html lang>` is right on the first byte, from Blade. A visit between
     * locales is a full document load (`LocaleLink` renders a plain `<a>` for
     * it), so this only matters if history navigation ever restores a page in
     * the other language without one. It is a safety net, not the mechanism.
     */
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    /* Another tab, or the account app, changed the theme; or the system did while "System" is chosen. */
    useEffect(() => syncTheme(), []);

    useLiveChat();

    return (
        <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:inline-flex focus:min-h-10 focus:items-center focus:rounded-control focus:bg-accent focus:px-4 focus:text-sm focus:font-medium focus:text-accent-foreground"
            >
                {m.a11y.skipToContent}
            </a>
            <SupportBanner />
            <div className="sticky top-0 z-40">
                <SiteHeader />
            </div>
            <main id="main-content" tabIndex={-1} className="flex-1">
                {children}
            </main>
            <SiteFooter newsletter={footerNewsletter} />
            <FrameRails />
            <ConsentBar />
        </div>
    );
}
