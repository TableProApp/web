import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { trackEvent } from '@/lib/analytics';

/**
 * The license banner: one line above the header asking a regular user to buy
 * a license, saying what it adds and what it pays for (design-system §5.3.17).
 *
 * On by default and off Pricing (`App\Support\Banner`). When shown, the shared
 * `banner` prop carries its link, and the words come from the `banner` catalog
 * in the page's language. It cannot be closed: there is no close button, no
 * stored record and no head script reading one, so every reader sees it on
 * every page it belongs on. Its ground is a wash of the brand hue (app.css),
 * a tint under `--foreground` text rather than an orange fill, and it scrolls
 * away with the page instead of sticking.
 *
 * Visibility is CSS, settled before paint: the element renders whenever the
 * page shows the banner, `html.has-banner`, stamped by the server, decides
 * whether it is seen, and `--banner-h` (app.css) is its height. The one
 * exception is the iPhone and iPad page, where the head script drops the
 * class for a reader on one of those devices, whose app has no license.
 *
 * One 40px line at every width, never truncated: the sentence and its link
 * show from 1024px, and below that the short question and the same link, so a
 * phone reader is still asked whether they are a regular user. TopBannerTest
 * holds the catalog strings in every language to lengths that fit. The link
 * takes the band's height as its target.
 *
 * It shares its slot with the language bar, which takes it over when it
 * applies (TopBanner, app.css).
 *
 * It reports `license_banner_view` and `license_banner_click` to Google
 * Analytics, which applies the reader's consent choice itself.
 */
export default function SupportBanner() {
    const banner = usePage().props.banner;
    const { m } = useI18n();
    const shown = banner !== null;

    useEffect(() => {
        const root = document.documentElement.classList;

        // Seen only while it holds the slot: the language bar takes it over (TopBanner).
        if (shown && root.contains('has-banner') && !root.contains('has-language-bar')) {
            trackEvent('license_banner_view');
        }
    }, [shown]);

    if (!banner) {
        return null;
    }

    return (
        <div role="region" aria-label={m.banner.label} className="support-banner border-b bg-surface">
            <Container className="flex h-full items-center">
                <p className="type-small min-w-0 flex-1 text-foreground max-lg:whitespace-nowrap">
                    <span className="max-lg:hidden">{m.banner.message} </span>
                    <span className="lg:hidden">{m.banner.short} </span>
                    <LocaleLink
                        href={banner.href}
                        onClick={() => trackEvent('license_banner_click')}
                        className={textLinkClasses('standalone', 'relative whitespace-nowrap after:absolute after:-inset-x-1 after:-inset-y-3')}
                    >
                        {m.banner.cta}
                        <span aria-hidden="true">→</span>
                    </LocaleLink>
                </p>
            </Container>
        </div>
    );
}
