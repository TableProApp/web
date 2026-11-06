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
import CampaignGround from './campaign-ground';
import Countdown from './countdown';

interface CampaignBandProps {
    variant: 'home' | 'pricing';
}

// Shown only under `html.campaign-live` (app.css), which the head script and `useCampaign` take away at the end.
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
        <CampaignGround labelledBy="campaign-band-title" className="campaign-band">
            <Container className="relative grid gap-8 py-10 md:py-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
                <div className="grid max-w-[46rem] gap-5">
                    <p className="type-small flex items-center gap-2 font-medium">
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                        {m.campaign.name}
                    </p>
                    {/* Not a heading: the band comes before the page's own h1, which must open the outline. */}
                    <p id="campaign-band-title" className="text-[2.5rem] leading-[0.95] font-semibold tracking-[-0.04em] text-balance md:text-[3.75rem]">
                        {fmt(copy.title, { percent: campaign.percent })}
                    </p>
                    <p className="type-lead max-w-[56ch] text-muted-foreground">
                        {fmt(copy.lead, {
                            lifetime: usd(discountedAmount(lifetime, campaign.percent)),
                            lifetimeList: usd(lifetime),
                            yearly: usd(discountedAmount(yearly, campaign.percent)),
                            yearlyList: usd(yearly),
                        })}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                        {variant === 'home' ? (
                            <LocaleLink href="/black-friday" onClick={() => trackEvent('campaign_band_click')} className={buttonClasses('primary', 'lg')}>
                                {copy.cta}
                                <span aria-hidden="true">→</span>
                            </LocaleLink>
                        ) : (
                            <p className="type-body font-medium">{copy.onPricing}</p>
                        )}
                        <CampaignCode />
                    </div>
                </div>
                <Countdown to="end" variant="digits" />
            </Container>
        </CampaignGround>
    );
}
