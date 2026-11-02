import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { useI18n } from '@/i18n';
import { trackEvent } from '@/lib/analytics';
import { PRICING } from '@/lib/data/pricing';
import Countdown from './countdown';

/**
 * The dated sale's banner, in the slot above the header while the sale is
 * live (`App\Support\Banner`): on every page but the sale's own, in place of
 * the license banner.
 *
 * One link the height of the band, to the sale's page: the sale's name, what
 * it takes off, the time left and the action. Below 1024px the short form
 * keeps it on one line. It goes when the sale does: `html.campaign-live`,
 * which the head script and `useCampaign` remove at the end, is what shows it
 * (app.css).
 *
 * Unlike the license banner it can be closed, because its countdown updates
 * by itself on every page (WCAG 2.2.2). Closing it stores the sale's id under
 * `CLOSED_KEY`, and the head script in app.blade.php keeps it closed on every
 * later page of the same sale; a new sale has a new id.
 *
 * Black, whatever the theme, like the band: the sale is an event on the site,
 * not part of its chrome (positioning §9, "Dated sales").
 *
 * It reports `campaign_banner_view` and `campaign_banner_click`.
 */
/** Local storage: the id of the sale whose banner the reader closed. Listed in the privacy policy. */
export const CLOSED_KEY = 'tablepro:campaign-closed';

export default function CampaignBanner() {
    const banner = usePage().props.banner;
    const { m, fmt } = useI18n();
    const campaign = PRICING.campaign;
    const shown = banner?.kind === 'campaign' && campaign !== null;

    useEffect(() => {
        const root = document.documentElement.classList;

        if (shown && root.contains('has-banner') && root.contains('campaign-live') && !root.contains('has-language-bar')) {
            trackEvent('campaign_banner_view');
        }
    }, [shown]);

    if (!shown) {
        return null;
    }

    const copy = m.campaign.banner;
    const id = campaign.id;

    function close(): void {
        try {
            localStorage.setItem(CLOSED_KEY, id);
        } catch {
            // Storage refused: closed for this page only.
        }

        document.documentElement.classList.remove('has-banner');
        // The button disappears with the banner, so focus moves to the start of the header rather than the document.
        document.querySelector<HTMLElement>('header a')?.focus({ preventScroll: true });
        trackEvent('campaign_banner_close');
    }

    return (
        <div role="region" aria-label={copy.label} className="campaign-banner campaign-surface dark">
            <Container className="flex h-full items-center gap-3">
                <LocaleLink
                    href={banner.href}
                    onClick={() => trackEvent('campaign_banner_click')}
                    className="type-small flex h-full min-w-0 flex-1 items-center gap-x-3 whitespace-nowrap no-underline"
                >
                    <span className="bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide uppercase">{m.campaign.name}</span>
                    <span className="max-lg:hidden">{fmt(copy.message, { percent: campaign.percent })}</span>
                    <span className="lg:hidden">{fmt(copy.short, { percent: campaign.percent })}</span>
                    <Countdown to="end" variant="inline" className="text-muted-foreground max-sm:hidden" />
                    <span className="ml-auto font-medium text-accent-text">
                        <span className="max-lg:sr-only">{copy.cta} </span>
                        <span aria-hidden="true">→</span>
                    </span>
                </LocaleLink>
                <button
                    type="button"
                    onClick={close}
                    aria-label={copy.close}
                    className="relative -mr-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-control text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) after:absolute after:-inset-1.5 hover:bg-surface-strong"
                >
                    <X className="size-4" aria-hidden="true" />
                </button>
            </Container>
        </div>
    );
}
