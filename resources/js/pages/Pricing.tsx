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

interface ProseSectionProps {
    id: string;
    title: string;
    children: ReactNode;
}

/** One reading-width section below the table: a ruled `<h2>` and its body. */
function ProseSection({ id, title, children }: ProseSectionProps) {
    return (
        <section id={id} aria-labelledby={`${id}-title`} className="border-t border-rule pt-10 md:pt-12">
            <h2 id={`${id}-title`} className="type-h2 text-foreground">
                {title}
            </h2>
            <div className="type-body mt-4 space-y-4 text-foreground">{children}</div>
        </section>
    );
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
export default function Pricing({ content, paidFeatures, checkout, featuredEngines }: PricingPageProps) {
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

            <section id="plans" aria-labelledby="plans-title" className="pb-16 md:pb-20 xl:pb-24">
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

            <Container width="text" className="space-y-12 py-16 md:py-20 xl:py-24">
                <ProseSection id="license" title={content.license.title}>
                    <DescriptionList>
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
                </ProseSection>

                <ProseSection id="billing" title={content.billing.title}>
                    <p>{rich(content.billing.merchant)}</p>
                    <p>{rich(content.billing.renewal)}</p>
                    <p>{rich(content.billing.portal)}</p>
                </ProseSection>

                <ProseSection id="refunds" title={content.refunds.title}>
                    <p>{rich(content.refunds.body)}</p>
                </ProseSection>

                <ProseSection id="team" title={content.team.title}>
                    <p>{rich(content.team.seats)}</p>
                    <p>{rich(content.team.invites)}</p>
                    <p>{rich(content.team.changes)}</p>
                    <DescriptionList>
                        <DescriptionItem term={m.pricing.prioritySupport.name}>
                            {plural(m.pricing.prioritySupport.detail, PRICING.tiers.team.prioritySupport.responseBusinessDays)}
                        </DescriptionItem>
                    </DescriptionList>
                    <p>
                        <TextLink href={account} kind="standalone">
                            {content.team.account}
                        </TextLink>
                    </p>
                </ProseSection>

                <ProseSection id="open-source" title={content.openSource.title}>
                    <p>{content.openSource.body}</p>
                    <p>{content.openSource.agpl}</p>
                    <p>
                        <TextLink href={FACTS.links.github} kind="standalone" external>
                            {content.openSource.github}
                        </TextLink>
                    </p>
                </ProseSection>

                <section id="faq" aria-labelledby="faq-title" className="border-t border-rule pt-10 md:pt-12">
                    <h2 id="faq-title" className="type-h2 text-foreground">
                        {content.faq.title}
                    </h2>
                    <FaqList
                        className="mt-6"
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
                </section>
            </Container>
        </LandingLayout>
    );
}
