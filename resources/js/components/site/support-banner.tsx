import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { trackEvent } from '@/lib/analytics';
import { dismissBanner } from '@/lib/banner';

/**
 * The license banner: one line above the header asking a regular user to buy
 * a license, saying what it adds and what it pays for (design-system §5.3.17).
 *
 * On by default and off Pricing (`App\Support\Banner`). When shown, the shared
 * `banner` prop carries its link and version, and the words come from the
 * `banner` catalog in the page's language. It is a quiet `--surface` band, not
 * an orange fill, and it scrolls away with the page instead of sticking.
 *
 * Visibility is CSS, settled before paint: the element renders whenever the
 * page shows the banner, `html.has-banner` decides whether it is seen, and the
 * head script removes that class while this browser's dismissal lasts
 * (`lib/banner.ts`). Deciding it in React state would flash the bar on every
 * load for every reader who had closed it. `--banner-h` (app.css) is its
 * height.
 *
 * One 40px line at every width, never truncated: the sentence and its link
 * show from 1024px, and below that only the short link, which is the whole
 * message. "Have a license? Hide this" joins from 1280px, where the line has
 * room for it. TopBannerTest holds the catalog strings in both languages to
 * lengths that fit.
 *
 * It reports `license_banner_view`, `_click` and `_dismiss` to Google
 * Analytics, which applies the reader's consent choice itself.
 */
export default function SupportBanner() {
    const banner = usePage().props.banner;
    const { m } = useI18n();
    const version = banner?.version ?? '';

    useEffect(() => {
        if (version !== '' && document.documentElement.classList.contains('has-banner')) {
            trackEvent('license_banner_view', { version });
        }
    }, [version]);

    if (!banner) {
        return null;
    }

    function dismiss(licensed: boolean): void {
        dismissBanner(version, licensed);
        trackEvent('license_banner_dismiss', { version, reason: licensed ? 'licensed' : 'closed' });
    }

    return (
        <div role="region" aria-label={m.banner.label} className="support-banner border-b border-rule bg-surface">
            <Container className="flex h-full items-center gap-3">
                <p className="type-small min-w-0 flex-1 text-foreground">
                    <span className="max-lg:hidden">{m.banner.message} </span>
                    <LocaleLink
                        href={banner.href}
                        onClick={() => trackEvent('license_banner_click', { version })}
                        className={textLinkClasses('standalone', 'whitespace-nowrap')}
                    >
                        <span className="max-lg:hidden">{m.banner.cta}</span>
                        <span className="lg:hidden">{m.banner.short}</span>
                        <span aria-hidden="true">→</span>
                    </LocaleLink>
                </p>
                <button
                    type="button"
                    onClick={() => dismiss(true)}
                    className="type-small shrink-0 cursor-pointer whitespace-nowrap text-muted-foreground underline-offset-4 hover:text-foreground hover:underline max-xl:hidden"
                >
                    {m.banner.licensed}
                </button>
                <button
                    type="button"
                    onClick={() => dismiss(false)}
                    aria-label={m.controls.dismiss}
                    className="-mr-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-control text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface-strong"
                >
                    <X className="size-4" aria-hidden="true" />
                </button>
            </Container>
        </div>
    );
}
