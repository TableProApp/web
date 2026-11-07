import { useState, type CSSProperties, type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { CalendarPlus } from 'lucide-react';
import CampaignCode from '@/components/campaign/campaign-code';
import CampaignGround from '@/components/campaign/campaign-ground';
import Countdown from '@/components/campaign/countdown';
import ProFeatures, { type ProFeatureTab } from '@/components/campaign/pro-features';
import SalePrice from '@/components/campaign/sale-price';
import { plainPageJsonLd } from '@/components/faq/structured-data';
import NewsletterSignup from '@/components/blog/newsletter-signup';
import type { PaidFeatureCopy } from '@/components/pricing/types';
import { useCheckout } from '@/components/pricing/use-checkout';
import SEOHead from '@/components/seo/seo-head';
import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import Button, { buttonClasses } from '@/components/ui/button';
import Callout from '@/components/ui/callout';
import Container from '@/components/ui/container';
import FaqList from '@/components/ui/faq-list';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { useCampaign } from '@/hooks/use-campaign';
import { useRegionalPricing } from '@/hooks/use-regional-pricing';
import { LOCALES, Trans, useI18n } from '@/i18n';
import { formatUsd } from '@/i18n/format';
import { calendarHref } from '@/lib/campaign';
import type { AssetId } from '@/lib/data/assets';
import { featureHref, paidFeaturesForTier } from '@/lib/data/paid-features';
import { PRICING } from '@/lib/data/pricing';
import { discountedAmount } from '@/lib/regional-pricing';
import LandingLayout from '@/layouts/landing-layout';

type CampaignContent = typeof import('@data/content/en/black-friday.json');

interface BlackFridayProps {
    content: CampaignContent;
    paidFeatures: PaidFeatureCopy;
    organizationProfiles: string[];
}

type SaleCycle = 'lifetime' | 'yearly';

const PRICE_CHANGE_POST = 'new-prices-2026';

// The Pro features that have a capture showing them, in the order the tabs show them. The rest are listed by name.
// Written out as literal slots, so the asset references scan sees them (AssetReferences reads only literals).
const CAPTURE_SIZES = '(min-width: 1280px) 900px, (min-width: 1024px) 70vw, 100vw';
const CAPTURES: Record<string, { asset: AssetId; slot: ReactNode }> = {
    'query-insights': { asset: 'mac-query-insights', slot: <AssetSlot id="mac-query-insights" caption={false} sizes={CAPTURE_SIZES} /> },
    'compare-sync': { asset: 'mac-compare-sync-structure', slot: <AssetSlot id="mac-compare-sync-structure" caption={false} sizes={CAPTURE_SIZES} /> },
    'data-rewind': { asset: 'mac-data-rewind-review', slot: <AssetSlot id="mac-data-rewind-review" caption={false} sizes={CAPTURE_SIZES} /> },
    'result-charts': { asset: 'mac-result-chart', slot: <AssetSlot id="mac-result-chart" caption={false} sizes={CAPTURE_SIZES} /> },
    'icloud-sync': { asset: 'diagram-icloud-sync', slot: <AssetSlot id="diagram-icloud-sync" caption={false} sizes={CAPTURE_SIZES} /> },
};

const delay = (ms: number): CSSProperties => ({ '--sale-delay': `${ms}ms` }) as CSSProperties;

export default function BlackFriday({ content, paidFeatures, organizationProfiles }: BlackFridayProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    const { prop, phase, offer } = useCampaign();
    const regional = useRegionalPricing();
    const flow = useCheckout();
    const shownSlot = useShownSlot();
    // Both offers are Pro, so the checkout's pending tier cannot tell which button started it.
    const [buying, setBuying] = useState<SaleCycle | null>(null);
    const campaign = PRICING.campaign;

    if (campaign === null || prop === null || phase === null) {
        return null;
    }

    const usd = (amount: number): string => formatUsd(amount, m.pricing.currency);
    const prices = PRICING.tiers.starter.prices;
    const values = {
        percent: campaign.percent,
        startsOn: prop.startsOn,
        endsOn: prop.endsOn,
        endsAtTime: prop.endsAtTime,
        listPriceSince: prop.listPriceSince,
        code: campaign.code,
        lifetime: usd(discountedAmount(prices.lifetime, campaign.percent)),
        lifetimeList: usd(prices.lifetime),
        yearly: usd(discountedAmount(prices.yearly, campaign.percent)),
        yearlyList: usd(prices.yearly),
        activations: PRICING.license.deviceLimit,
        refundDays: PRICING.refund.days,
    };

    const pagePath = path('/black-friday');
    const crumbs = [
        { name: m.common.home, path: path('/') },
        { name: content.breadcrumb, path: pagePath },
    ];
    // Once it has ended the page no longer offers anything, so neither may its title or its description.
    const title = fmt(phase === 'ended' ? content.seo.endedTitle : content.seo.title, values);
    const description = fmt(phase === 'ended' ? content.seo.endedDescription : content.seo.description, values);

    const features = paidFeaturesForTier('starter');
    const tabs: ProFeatureTab[] = Object.entries(CAPTURES).flatMap(([id, { asset, slot }]) => {
        const feature = features.find((candidate) => candidate.id === id);

        return feature && shownSlot(asset) !== null
            ? [
                  {
                      id,
                      name: feature.name,
                      detail: paidFeatures[id]?.detail ?? '',
                      href: featureHref(feature),
                      link: fmt(content.includes.link, { feature: feature.name }),
                      capture: slot,
                  },
              ]
            : [];
    });
    const others = features.filter((feature) => !tabs.some((tab) => tab.id === feature.id));

    const cycles: SaleCycle[] = ['lifetime', 'yearly'];
    const big = { big: (text: string) => <span className="sale-display block pb-2 text-foreground">{text}</span> };

    return (
        <LandingLayout footerNewsletter={phase === 'live'}>
            <SEOHead
                title={title}
                description={description}
                jsonLd={plainPageJsonLd({
                    baseUrl: canonicalBaseUrl,
                    inLanguage: LOCALES.supported[locale].hreflang,
                    path: pagePath,
                    name: title,
                    description,
                    crumbs,
                    organization: { description: m.seo.product.short, sameAs: organizationProfiles },
                })}
            />

            <CampaignGround labelledBy="sale-title">
                <Container className="relative grid gap-10 pt-12 pb-10 @container md:gap-14 md:pt-16 md:pb-12 xl:pt-20">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
                        <div className="grid gap-6">
                            <p className="sale-rise type-small flex items-center gap-2 font-medium text-foreground">
                                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                                {content.hero.eyebrow}
                            </p>
                            <h1 id="sale-title" className="sale-rise type-display text-balance text-muted-foreground" style={delay(60)}>
                                <Trans text={fmt(phase === 'ended' ? content.ended.title : content.hero.title, values)} tags={big} />
                            </h1>
                            <p className="sale-rise type-lead max-w-[52ch] text-muted-foreground" style={delay(160)}>
                                {fmt(phase === 'ended' ? content.ended.lead : content.hero[phase], values)}
                            </p>
                        </div>
                        {phase !== 'ended' && <Countdown to={phase === 'upcoming' ? 'start' : 'end'} variant="digits" className="sale-rise" />}
                    </div>

                    {phase === 'ended' ? (
                        <p>
                            <LocaleLink href="/pricing" className={buttonClasses('primary', 'lg')}>
                                {content.ended.action}
                                <span aria-hidden="true">→</span>
                            </LocaleLink>
                        </p>
                    ) : (
                        <div className="grid gap-6">
                            <ul className="frame-rows border-t border-rule">
                                {cycles.map((cycle, row) => {
                                    const copy = content.offers[cycle];
                                    const list = prices[cycle];
                                    const sale = discountedAmount(list, campaign.percent);
                                    const code = offer('starter', cycle, regional?.percent ?? null)?.code ?? null;
                                    const leads = cycle === 'lifetime';

                                    return (
                                        <li
                                            key={cycle}
                                            className="grid gap-x-10 gap-y-4 border-b border-rule py-6 transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface/40 md:grid-cols-[minmax(0,1fr)_auto_15rem] md:items-center md:py-7"
                                        >
                                            <div className="grid gap-1">
                                                <h2 className={leads ? 'type-h2' : 'type-h3'}>{copy.name}</h2>
                                                <p className="type-small text-muted-foreground">{fmt(copy.detail, values)}</p>
                                            </div>
                                            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                                <s className={`sale-strike sale-rise font-medium text-muted-foreground tabular-nums ${leads ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`} style={delay(320 + row * 80)}>
                                                    <span className="sr-only">{fmt(m.campaign.offer.listPrice, { price: usd(list) })}</span>
                                                    <span aria-hidden="true">{usd(list)}</span>
                                                </s>
                                                <span className="sale-rise" style={delay(640 + row * 80)}>
                                                    <SalePrice
                                                        amount={sale}
                                                        className={`font-semibold tracking-[-0.035em] ${leads ? 'text-[3rem] leading-none md:text-[4rem]' : 'text-[2.25rem] leading-none md:text-[2.75rem]'}`}
                                                    />
                                                </span>
                                                <span className="type-small text-muted-foreground">{copy.unit}</span>
                                            </p>
                                            <div className="grid gap-3">
                                                {phase === 'live' ? (
                                                    <Button
                                                        size="lg"
                                                        variant={leads ? 'primary' : 'secondary'}
                                                        fullWidth
                                                        loading={flow.pending !== null && buying === cycle}
                                                        onPointerEnter={flow.warm}
                                                        onFocus={flow.warm}
                                                        onClick={() => {
                                                            setBuying(cycle);
                                                            void flow.start('starter', cycle, { discountCode: code });
                                                        }}
                                                    >
                                                        {fmt(content.offers.buy, { price: usd(sale) })}
                                                    </Button>
                                                ) : (
                                                    <p className="type-small font-medium text-muted-foreground md:text-right">{fmt(content.offers.soon, values)}</p>
                                                )}
                                                {flow.error !== null && buying === cycle && (
                                                    <Callout tone="danger" role="alert">
                                                        <p>{flow.error.message}</p>
                                                    </Callout>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
                                <div className="grid gap-1.5">
                                    <CampaignCode />
                                    <p className="type-small text-muted-foreground">{fmt(content.offers.footnote, values)}</p>
                                </div>
                                {phase === 'upcoming' && (
                                    <a
                                        href={calendarHref(campaign, {
                                            summary: fmt(content.offers.calendarSummary, values),
                                            description: fmt(content.offers.calendarDescription, values),
                                            url: `${canonicalBaseUrl}${pagePath}`,
                                        })}
                                        download={`tablepro-${campaign.id}.ics`}
                                        className={buttonClasses('secondary', 'md')}
                                    >
                                        <CalendarPlus aria-hidden="true" />
                                        {content.offers.calendar}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </Container>
            </CampaignGround>

            {phase !== 'ended' && (
                <Section id="pro" title={content.includes.title} lead={fmt(content.includes.lead, values)}>
                    {tabs.length > 0 && <ProFeatures items={tabs} label={content.includes.title} />}
                    {others.length > 0 && (
                        <div className="type-small mt-10 flex flex-wrap items-baseline gap-x-5 gap-y-2">
                            <span className="text-muted-foreground">{content.includes.more}</span>
                            <ul className="contents">
                                {others.map((feature) => (
                                    <li key={feature.id}>
                                        <LocaleLink href={featureHref(feature)} className="font-medium text-foreground hover:underline">
                                            {feature.name}
                                        </LocaleLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Section>
            )}

            {phase !== 'ended' && (
                <Section id="questions" tone="surface" title={content.faq.title}>
                    <FaqList
                        collapsible
                        className="frame-rows"
                        items={content.faq.items.map((item) => ({
                            question: fmt(item.question, values),
                            answer: (
                                <p>
                                    <Trans
                                        text={fmt(item.answer, values)}
                                        tags={{
                                            prices: (text) => (
                                                <TextLink
                                                    href={locale === 'vi' ? `/vi/blog/${PRICE_CHANGE_POST}` : `/blog/${PRICE_CHANGE_POST}`}
                                                    hrefLang={locale === 'vi' || locale === 'en' ? undefined : 'en'}
                                                >
                                                    {text}
                                                </TextLink>
                                            ),
                                            refund: (text) => (
                                                <LocaleLink href="/refund-policy" className={textLinkClasses('inline')}>
                                                    {text}
                                                </LocaleLink>
                                            ),
                                            portal: (text) => <TextLink href={PRICING.billingPortalUrl}>{text}</TextLink>,
                                        }}
                                    />
                                </p>
                            ),
                        }))}
                    />
                </Section>
            )}

            {phase !== 'live' && (
                <Section
                    id="newsletter"
                    title={phase === 'ended' ? content.ended.newsletterTitle : content.notify.title}
                    lead={phase === 'ended' ? content.ended.newsletterLead : content.notify.lead}
                >
                    <NewsletterSignup />
                </Section>
            )}
        </LandingLayout>
    );
}
