import { buttonClasses } from '@/components/ui/button';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { useCampaign } from '@/hooks/use-campaign';
import { useI18n } from '@/i18n';
import { formatUsd } from '@/i18n/format';
import { trackEvent } from '@/lib/analytics';
import { PRICING } from '@/lib/data/pricing';
import { discountedAmount } from '@/lib/regional-pricing';
import CampaignCode from './campaign-code';
import Countdown from './countdown';

interface CampaignBandProps {
    /** `home` leads to the sale's page; `pricing` says the cards below already carry it. */
    variant: 'home' | 'pricing';
}

/**
 * The dated sale at the top of the homepage and Pricing while it is live: its
 * name, what it takes off which plans with both prices, the code, the time
 * left, and on the homepage the way to the sale's page.
 *
 * A black band whatever the theme, full width above the page's own first
 * section, which stays as it is below it: the sale is a week's event, not a
 * new identity. Rendered only while the server says the sale is live, and
 * shown only under `html.campaign-live` (app.css), which the head script and
 * `useCampaign` take away at the end, so it never outlives the code.
 *
 * Both prices come from pricing.json: the list price and the sale's
 * percentage off it, rounded as checkout rounds. The yearly price is the
 * first year's, and the sentence says so.
 */
export default function CampaignBand({ variant }: CampaignBandProps) {
    const { m, fmt } = useI18n();
    const { prop } = useCampaign();
    const campaign = PRICING.campaign;

    if (campaign === null || prop?.phase !== 'live') {
        return null;
    }

    const usd = (amount: number): string => formatUsd(amount, m.pricing.currency);
    const { lifetime, yearly } = PRICING.tiers.starter.prices;
    const copy = m.campaign.band;

    return (
        <section aria-labelledby="campaign-band-title" className="campaign-band campaign-surface campaign-glow dark">
            <Container className="grid gap-8 py-10 md:py-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
                <div className="grid max-w-[44rem] gap-4">
                    <p>
                        <span className="bg-accent text-accent-foreground rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase">{m.campaign.name}</span>
                    </p>
                    {/* Not a heading: the band comes before the page's own h1, which must open the outline. It names the region instead. */}
                    <p id="campaign-band-title" className="type-display text-balance">
                        {fmt(copy.title, { percent: campaign.percent })}
                    </p>
                    <p className="text-muted-foreground type-lead max-w-[60ch]">
                        {fmt(copy.lead, {
                            lifetime: usd(discountedAmount(lifetime, campaign.percent)),
                            lifetimeList: usd(lifetime),
                            yearly: usd(discountedAmount(yearly, campaign.percent)),
                            yearlyList: usd(yearly),
                        })}
                    </p>
                    <CampaignCode className="mt-1" />
                    {variant === 'home' ? (
                        <p className="mt-2">
                            <LocaleLink href="/black-friday" onClick={() => trackEvent('campaign_band_click')} className={buttonClasses('primary', 'lg')}>
                                {copy.cta}
                                <span aria-hidden="true">→</span>
                            </LocaleLink>
                        </p>
                    ) : (
                        <p className="type-body font-medium">{copy.onPricing}</p>
                    )}
                </div>
                <Countdown to="end" variant="blocks" />
            </Container>
        </section>
    );
}
