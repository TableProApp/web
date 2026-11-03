import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import CampaignCode from '@/components/campaign/campaign-code';
import Countdown from '@/components/campaign/countdown';
import { plainPageJsonLd } from '@/components/faq/structured-data';
import NewsletterSignup from '@/components/blog/newsletter-signup';
import type { PaidFeatureCopy } from '@/components/pricing/types';
import { useCheckout } from '@/components/pricing/use-checkout';
import SEOHead from '@/components/seo/seo-head';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import Button, { buttonClasses } from '@/components/ui/button';
import Callout from '@/components/ui/callout';
import Container from '@/components/ui/container';
import FaqList from '@/components/ui/faq-list';
import { CheckGlyph } from '@/components/ui/glyph';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { useCampaign } from '@/hooks/use-campaign';
import { useRegionalPricing } from '@/hooks/use-regional-pricing';
import { LOCALES, Trans, useI18n } from '@/i18n';
import { formatUsd } from '@/i18n/format';
import { PUBLISHER } from '@/lib/data/facts';
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

/** The post that explains the prices the sale is taken off. */
const PRICE_CHANGE_POST = 'new-prices-2026';

/**
 * `/black-friday` in every language: the dated sale in pricing.json's
 * `campaign`, on one URL kept from year to year (positioning §9, "Dated sales").
 *
 * The top is the sale's own black ground, like its band elsewhere: the
 * name and year, what it takes off, the time to its start or its end, and the
 * two offers with both prices. Below it, what Pro adds, the questions a buyer
 * asks, and, before and after the sale, the newsletter.
 *
 * The page follows the sale's phase (`useCampaign`):
 *
 * - `upcoming`: the window, a countdown to the start, the offers with their
 *   sale prices and a button that says when they can be bought.
 * - `live`: a countdown to the end, and each offer bought from the page with
 *   the sale's code attached, unless the reader's regional discount takes
 *   more off, which checkout then applies instead (`offerFor`).
 * - `ended`: that the sale is over and when it ran, and the way to Pricing.
 *
 * Every struck price is dated: `listPriceSince` says since when it is the
 * regular price, and a question says the prices went up then. A price is only
 * honest as a reference with its history beside it.
 */
export default function BlackFriday({ content, paidFeatures, organizationProfiles }: BlackFridayProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    const { prop, phase, offer } = useCampaign();
    const regional = useRegionalPricing();
    const flow = useCheckout();
    // Both offers are Pro, so the checkout's pending tier cannot tell which button started it.
    const [buying, setBuying] = useState<SaleCycle | null>(null);
    const campaign = PRICING.campaign;

    if (campaign === null || prop === null || phase === null) {
        return null;
    }

    const usd = (amount: number): string => formatUsd(amount, m.pricing.currency);
    const prices = PRICING.tiers.starter.prices;
    const activations = PRICING.license.deviceLimit;
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
        activations,
        refundDays: PRICING.refund.days,
    };

    const crumbs = [
        { name: m.common.home, path: path('/') },
        { name: content.breadcrumb, path: path('/black-friday') },
    ];
    // Once it has ended the page no longer offers anything, so neither may its title or its description.
    const title = fmt(phase === 'ended' ? content.seo.endedTitle : content.seo.title, values);
    const description = fmt(phase === 'ended' ? content.seo.endedDescription : content.seo.description, values);

    const cycles: SaleCycle[] = ['lifetime', 'yearly'];

    return (
        <LandingLayout>
            <SEOHead
                title={title}
                description={description}
                jsonLd={plainPageJsonLd({
                    baseUrl: canonicalBaseUrl,
                    inLanguage: LOCALES.supported[locale].hreflang,
                    path: path('/black-friday'),
                    name: title,
                    description,
                    crumbs,
                    organization: { description: m.seo.product.short, sameAs: organizationProfiles, publisher: PUBLISHER },
                })}
            />

            <section aria-labelledby="sale-title" className="campaign-surface campaign-glow dark">
                <Container className="grid gap-10 pt-8 pb-12 md:pt-10 md:pb-16">
                    <Breadcrumbs items={[{ label: m.common.home, href: '/' }, { label: content.breadcrumb }]} />

                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                        <div className="grid max-w-[46rem] gap-4">
                            <p>
                                <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold tracking-wide text-accent-foreground uppercase">
                                    {content.hero.eyebrow}
                                </span>
                            </p>
                            <h1 id="sale-title" className="type-display text-balance">
                                {phase === 'ended' ? content.ended.title : fmt(content.hero.title, values)}
                            </h1>
                            <p className="type-lead max-w-[60ch] text-muted-foreground">{fmt(content.hero[phase], values)}</p>
                        </div>
                        {phase !== 'ended' && <Countdown to={phase === 'upcoming' ? 'start' : 'end'} variant="blocks" />}
                    </div>

                    {phase === 'ended' ? (
                        <p>
                            <LocaleLink href="/pricing" className={buttonClasses('primary', 'lg')}>
                                {content.ended.action}
                                <span aria-hidden="true">→</span>
                            </LocaleLink>
                        </p>
                    ) : (
                        <>
                            <ul className="grid gap-4 md:grid-cols-2">
                                {cycles.map((cycle) => {
                                    const copy = content.offers[cycle];
                                    const list = prices[cycle];
                                    const sale = discountedAmount(list, campaign.percent);
                                    const code = offer('starter', cycle, regional?.percent ?? null)?.code ?? null;

                                    return (
                                        <li key={cycle} className="grid content-start gap-4 rounded-panel border border-rule bg-surface p-6">
                                            <h2 className="type-h3">{copy.name}</h2>
                                            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                                <s className="type-h3 text-muted-foreground tabular-nums">
                                                    <span className="sr-only">{fmt(m.campaign.offer.listPrice, { price: usd(list) })}</span>
                                                    <span aria-hidden="true">{usd(list)}</span>
                                                </s>
                                                <span className="type-display tabular-nums">{usd(sale)}</span>
                                                <span className="type-small text-muted-foreground">{m.pricing.units.starter[cycle]}</span>
                                            </p>
                                            <p className="type-small text-muted-foreground">{fmt(copy.detail, values)}</p>
                                            {phase === 'live' ? (
                                                <Button
                                                    size="lg"
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
                                                <Button size="lg" fullWidth disabled>
                                                    {fmt(content.offers.soon, values)}
                                                </Button>
                                            )}
                                            {flow.error !== null && buying === cycle && (
                                                <Callout tone="danger" role="alert">
                                                    <p>{flow.error.message}</p>
                                                </Callout>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                                <div className="grid gap-1.5">
                                    <p className="type-small text-muted-foreground">{fmt(content.offers.regularSince, values)}</p>
                                    <p className="type-small text-muted-foreground">{content.offers.notIncluded}</p>
                                </div>
                                <CampaignCode />
                            </div>
                        </>
                    )}
                </Container>
            </section>

            {phase === 'ended' ? (
                <Section id="newsletter" title={content.ended.newsletterTitle} lead={content.ended.newsletterLead}>
                    <NewsletterSignup />
                </Section>
            ) : (
                <Section id="pro" title={content.includes.title} lead={fmt(content.includes.lead, values)}>
                    <ul className="type-body grid gap-3 md:grid-cols-2">
                        {paidFeaturesForTier('starter').map((feature) => (
                            <li key={feature.id} className="flex items-start gap-2.5">
                                <CheckGlyph className="mt-[0.3em] shrink-0" />
                                <span>
                                    <LocaleLink href={featureHref(feature)} className="font-medium text-foreground hover:underline">
                                        {feature.name}
                                    </LocaleLink>
                                    {paidFeatures[feature.id] && <span className="text-muted-foreground"> {paidFeatures[feature.id].detail}</span>}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            <Section id="questions" tone="surface" title={content.faq.title}>
                <FaqList
                    items={content.faq.items.map((item) => ({
                        question: fmt(item.question, values),
                        answer: (
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
                        ),
                    }))}
                />
            </Section>

            {phase === 'upcoming' && (
                <Section id="newsletter" title={content.notify.title} lead={content.notify.lead}>
                    <NewsletterSignup />
                </Section>
            )}
        </LandingLayout>
    );
}
