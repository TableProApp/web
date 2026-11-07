import type { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import CampaignBand from '@/components/campaign/campaign-band';
import PlanMatrix from '@/components/pricing/plan-matrix';
import { planOffers } from '@/components/pricing/offers';
import PricingFaq, { type PricingFaqGroup } from '@/components/pricing/pricing-faq';
import PricingPlans from '@/components/pricing/pricing-plans';
import type { PricingContent, PricingPageProps } from '@/components/pricing/types';
import { useEducationOpen } from '@/hooks/use-regional-pricing';
import SEOHead from '@/components/seo/seo-head';
import { accountHref, SUPPORT_EMAIL } from '@/components/site/site-links';
import Container from '@/components/ui/container';
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

function copyValues(): Record<string, string | number> {
    return {
        deviceLimit: PRICING.license.deviceLimit,
        offlineDays: PRICING.license.offlineDays,
        revalidateDays: PRICING.license.legacy.revalidateDays,
        graceDays: PRICING.license.legacy.offlineGraceDays,
        merchant: PRICING.merchantOfRecord.name,
        refundDays: PRICING.refund.days,
        min: PRICING.tiers.team.seats.min,
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

// The same macAppNode() as /download, so #app says the same thing on both pages.
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

// No conversion furniture: no "most popular", no typed saving, no countdown. The one exception is a dated sale while it
// is live: its band above the header, with the time left to its real end, and its price on the cards it covers
// (positioning §9, "Dated sales").
export default function Pricing({ content, paidFeatures, featuredEngines, comparisons }: PricingPageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    const values = copyValues();
    const educationOpen = useEducationOpen();

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
        teams: (text: string) => (
            <LocaleLink href="/teams" className={textLinkClasses('inline')}>
                {text}
            </LocaleLink>
        ),
        github: (text: string) => (
            <TextLink href={FACTS.links.github} external>
                {text}
            </TextLink>
        ),
    };

    const rich = (text: string): ReactNode => <Trans text={text} tags={tags} values={values} />;

    // Extra lines some answers carry from data: what each paid feature does when a plan ends, and the comparison links.
    const extras: Record<string, ReactNode> = {
        ends: (
            <ul className="type-small grid gap-1.5">
                {PAID_FEATURES.map((feature) => (
                    <li key={feature.id}>
                        <span className="font-medium text-foreground">{feature.name}</span> {paidFeatures[feature.id]?.lapse}
                    </li>
                ))}
            </ul>
        ),
        compare: (
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                {comparisons.map((comparison) => (
                    <li key={comparison.path}>
                        <LocaleLink href={comparison.path} className={textLinkClasses('inline')}>
                            {comparison.title}
                        </LocaleLink>
                    </li>
                ))}
            </ul>
        ),
    };

    const hidden = (id: string): boolean => (id === 'education' && !educationOpen) || (id === 'compare' && comparisons.length === 0);

    const groups: PricingFaqGroup[] = Object.entries(content.faq.groups).map(([id, group]) => ({
        id,
        title: group.title,
        items: Object.entries(group.items as Record<string, { question: string; answer: string }>)
            .filter(([key]) => !hidden(key))
            .map(([key, item]) => ({
                id: key,
                question: item.question,
                answer: (
                    <>
                        <p>{rich(item.answer)}</p>
                        {extras[key]}
                    </>
                ),
            })),
    }));

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

            <CampaignBand variant="pricing" />
            <PageHeader title={content.header.title} lead={content.header.lead} />

            <section id="plans" aria-labelledby="plans-title" className="py-8 md:py-10 xl:py-12">
                <Container>
                    <h2 id="plans-title" className="sr-only">
                        {content.plans.title}
                    </h2>
                    <PricingPlans variant="full" />
                </Container>
            </section>

            <Section id="features" tone="surface" title={content.features.title} lead={content.features.lead}>
                <PlanMatrix details={paidFeatures} />
            </Section>

            <Section id="faq" title={content.faq.title}>
                <PricingFaq groups={groups} />
                <p className="mt-8">
                    <LocaleLink href="/faq" className={textLinkClasses('standalone')}>
                        {content.faq.more}
                        <span aria-hidden="true">→</span>
                    </LocaleLink>
                </p>
            </Section>
        </LandingLayout>
    );
}
