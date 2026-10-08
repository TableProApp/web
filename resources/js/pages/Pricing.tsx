import type { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import PlanMatrix from '@/components/pricing/plan-matrix';
import { planOffers } from '@/components/pricing/offers';
import PricingPlans from '@/components/pricing/pricing-plans';
import type { PricingContent, PricingPageProps } from '@/components/pricing/types';
import SEOHead from '@/components/seo/seo-head';
import { accountHref, SUPPORT_EMAIL } from '@/components/site/site-links';
import Container from '@/components/ui/container';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import Disclosure from '@/components/ui/disclosure';
import FaqList from '@/components/ui/faq-list';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, Trans, useI18n, type Messages } from '@/i18n';
import { FACTS } from '@/lib/data/facts';
import { PAID_FEATURES } from '@/lib/data/paid-features';
import { architecturesText, deviceList, macPlatform, requirementText } from '@/lib/data/platforms';
import { PRICING } from '@/lib/data/pricing';
import { absoluteUrl, graph, macAppId, macAppNode, webPageNode, type JsonLdGraph } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

type Interpolate = (template: string, values: Record<string, string | number>) => string;

/** The `{slots}` the page copy uses, every one from pricing.json or facts.json. */
function copyValues(): Record<string, string | number> {
    return {
        activations: PRICING.tiers.starter.activations,
        revalidateDays: PRICING.license.revalidateDays,
        graceDays: PRICING.license.offlineGraceDays,
        merchant: PRICING.merchantOfRecord.name,
        refundDays: PRICING.refund.days,
        min: PRICING.tiers.team.seats.min,
        max: PRICING.tiers.team.seats.max,
        email: SUPPORT_EMAIL,
    };
}

interface JsonLdInput {
    baseUrl: string;
    inLanguage: string;
    pageUrl: string;
    content: PricingContent;
    featuredEngines: string[];
    m: Messages;
    fmt: Interpolate;
}

/**
 * The page's structured data (architecture §1.6): a `WebPage` about the Mac
 * app, and the Mac app with one `Offer` per price the plan cards show, built
 * by the same `macAppNode()` as `/download` so `#app` says the same thing on
 * both pages. No rating, no FAQPage.
 */
function pricingJsonLd({ baseUrl, inLanguage, pageUrl, content, featuredEngines, m, fmt }: JsonLdInput): JsonLdGraph {
    const context = { baseUrl, inLanguage };
    const mac = macPlatform();

    return graph([
        webPageNode(context, {
            url: pageUrl,
            name: content.seo.title,
            description: content.seo.description,
            about: macAppId(baseUrl),
        }),
        macAppNode(context, {
            description: fmt(m.seo.product.long, {
                // The template ends "… and more", so the names take commas only.
                featuredEngines: featuredEngines.join(', '),
                deviceList: deviceList(m.common.list),
            }),
            alternateName: m.seo.macApp.alternateName,
            subCategory: m.seo.macApp.subCategory,
            operatingSystem: mac.requirements.systems.join(', '),
            requirements: `${requirementText(mac, m.platforms)}, ${architecturesText(m.platforms)}`,
            licenseUrl: FACTS.links.license,
            offers: planOffers(m, fmt),
        }),
    ]);
}

/**
 * `/pricing` and `/vi/pricing` (sitemap §A.1, §E.5; design-system §8.6).
 *
 * The plans with a working checkout, then what a paid plan adds, how a license
 * behaves, billing, refunds, Team, open source and a short FAQ. Every price,
 * seat bound, day count and the merchant's name comes from pricing.json; the
 * features and their tiers from paid-features.json. Nothing here is
 * conversion furniture: no "most popular", no typed saving, no countdown.
 */
export default function Pricing({ content, paidFeatures, checkout, featuredEngines, comparisons }: PricingPageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, plural, path } = useI18n();
    const values = copyValues();

    const account = accountHref(locale);
    const tags = {
        ui: (text: string) => <span className="font-medium">{text}</span>,
        account: (text: string) => (
            <a href={account} className={textLinkClasses('inline')}>
                {text}
            </a>
        ),
        portal: (text: string) => (
            <TextLink href={PRICING.billingPortalUrl} external>
                {text}
            </TextLink>
        ),
        link: (text: string) => (
            <LocaleLink href="/refund-policy" className={textLinkClasses('inline')}>
                {text}
            </LocaleLink>
        ),
        terms: (text: string) => (
            <LocaleLink href="/terms" className={textLinkClasses('inline')}>
                {text}
            </LocaleLink>
        ),
        email: (text: string) => (
            <a href={`mailto:${text}`} className={textLinkClasses('inline')}>
                {text}
            </a>
        ),
    };

    const rich = (text: string): ReactNode => <Trans text={text} tags={tags} values={values} />;

    return (
        <LandingLayout>
            <SEOHead
                title={content.seo.title}
                description={content.seo.description}
                jsonLd={pricingJsonLd({
                    baseUrl: canonicalBaseUrl,
                    inLanguage: LOCALES.supported[locale].hreflang,
                    pageUrl: absoluteUrl(canonicalBaseUrl, path('/pricing')),
                    content,
                    featuredEngines,
                    m,
                    fmt,
                })}
            />

            <PageHeader title={content.header.title} lead={content.header.lead} />

            <section id="plans" aria-labelledby="plans-title" className="py-8 md:py-10 xl:py-12">
                <Container>
                    <h2 id="plans-title" className="sr-only">
                        {content.plans.title}
                    </h2>
                    <PricingPlans checkout={checkout} variant="full" />
                </Container>
            </section>

            <Section id="features" tone="surface" title={content.features.title} lead={content.features.lead}>
                <PlanMatrix details={paidFeatures} />
            </Section>

            {/*
              * The prose after the table: each topic is a section of its own at the
              * reading measure, so the page frame's joins separate them, and their
              * lists run from rail to rail (design-system §4.7).
              */}
            <Section id="license" title={content.license.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <DescriptionList className="frame-rows-text">
                        {Object.entries(content.license.items).map(([key, item]) => (
                            <DescriptionItem key={key} term={item.term}>
                                {rich(item.body)}
                            </DescriptionItem>
                        ))}
                    </DescriptionList>
                    <Disclosure summary={content.license.lapse.summary}>
                        <p>{content.license.lapse.intro}</p>
                        <ul className="mt-3 space-y-3">
                            {PAID_FEATURES.map((feature) => (
                                <li key={feature.id}>
                                    <span className="block font-medium">{feature.name}</span>
                                    <span className="block">{paidFeatures[feature.id]?.lapse}</span>
                                </li>
                            ))}
                        </ul>
                    </Disclosure>
                    <p>{rich(content.license.terms)}</p>
                </div>
            </Section>

            <Section id="billing" title={content.billing.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>{rich(content.billing.merchant)}</p>
                    <p>{rich(content.billing.renewal)}</p>
                    <p>{rich(content.billing.portal)}</p>
                </div>
            </Section>

            <Section id="refunds" title={content.refunds.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>{rich(content.refunds.body)}</p>
                </div>
            </Section>

            <Section id="team" title={content.team.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>{rich(content.team.seats)}</p>
                    <p>{rich(content.team.invites)}</p>
                    <p>{rich(content.team.changes)}</p>
                    <DescriptionList className="frame-rows-text">
                        <DescriptionItem term={m.pricing.prioritySupport.name}>
                            {plural(m.pricing.prioritySupport.detail, PRICING.tiers.team.prioritySupport.responseBusinessDays)}
                        </DescriptionItem>
                    </DescriptionList>
                    <p>
                        <TextLink href={account} kind="standalone">
                            {content.team.account}
                        </TextLink>
                    </p>
                </div>
            </Section>

            <Section id="open-source" title={content.openSource.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>{content.openSource.body}</p>
                    <p>{content.openSource.agpl}</p>
                    <p>
                        <TextLink href={FACTS.links.github} kind="standalone" external>
                            {content.openSource.github}
                        </TextLink>
                    </p>
                </div>
            </Section>

            {comparisons.length > 0 && (
                <Section id="compare" title={content.compare.title} width="text">
                    <p className="type-body text-foreground">{content.compare.body}</p>
                    <ul className="type-body mt-4 flex flex-wrap gap-x-6 gap-y-2">
                        {comparisons.map((comparison) => (
                            <li key={comparison.path}>
                                <LocaleLink href={comparison.path} className={textLinkClasses('inline')}>
                                    {comparison.title}
                                </LocaleLink>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            <Section id="faq" title={content.faq.title} width="text">
                <FaqList
                    className="frame-rows-text"
                    items={Object.entries(content.faq.items).map(([key, item]) => ({
                        id: key,
                        question: item.question,
                        answer: <p>{rich(item.answer)}</p>,
                    }))}
                />
                <p className="mt-6">
                    <LocaleLink href="/faq#licensing" className={textLinkClasses('standalone')}>
                        {content.faq.more}
                        <span aria-hidden="true">→</span>
                    </LocaleLink>
                </p>
            </Section>
        </LandingLayout>
    );
}
