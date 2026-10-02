import { usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';

/** The dismissal record: the banner version the reader closed. Read before paint in app.blade.php. */
export const BANNER_STORAGE_KEY = 'tablepro:banner-dismissed';

/**
 * The optional standing line above the header (design-system §5.3.17).
 *
 * Off by default (`config/banner.php`). When on, the shared `banner` prop
 * carries its link and version, and the words come from the `banner` catalog
 * in the page's language. It is a quiet `--surface` band, not an orange fill.
 *
 * Visibility is CSS, settled before paint: the element renders whenever the
 * config enables it, `html.has-banner` decides whether it is seen, and the
 * head script removes that class when this browser dismissed the current
 * version. Deciding it in React state would flash the bar on every load for
 * every reader who had closed it. `--banner-h` (app.css) is its height and
 * feeds the sticky header's scroll padding, so the two always agree.
 *
 * One 40px line at every width, never truncated: the sentence and its link
 * show from 1024px, and below that only the short link, which is the whole
 * message. TopBannerTest holds the catalog strings in both languages to
 * lengths that fit.
 */
export default function SupportBanner() {
    const banner = usePage().props.banner;
    const { m } = useI18n();

    if (!banner) {
        return null;
    }

    const version = banner.version;

    function dismiss(): void {
        try {
            window.localStorage.setItem(BANNER_STORAGE_KEY, version);
        } catch {
            // No storage: the dismissal lasts for this page only.
        }

        document.documentElement.classList.remove('has-banner');
    }

    return (
        <div role="region" aria-label={m.banner.label} className="support-banner border-b border-rule bg-surface">
            <Container className="flex h-full items-center gap-3">
                <p className="type-small min-w-0 flex-1 text-foreground">
                    <span className="max-lg:hidden">{m.banner.message} </span>
                    <LocaleLink href={banner.href} className={textLinkClasses('standalone', 'whitespace-nowrap')}>
                        <span className="max-lg:hidden">{m.banner.cta}</span>
                        <span className="lg:hidden">{m.banner.short}</span>
                        <span aria-hidden="true">→</span>
                    </LocaleLink>
                </p>
                <button
                    type="button"
                    onClick={dismiss}
                    aria-label={m.controls.dismiss}
                    className="-mr-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-control text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface-strong"
                >
                    <X className="size-4" aria-hidden="true" />
                </button>
            </Container>
        </div>
    );
}
