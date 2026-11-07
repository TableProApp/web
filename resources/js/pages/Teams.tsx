import { usePage } from '@inertiajs/react';
import { plainPageJsonLd } from '@/components/faq/structured-data';
import { INQUIRY_SUBJECT } from '@/components/pricing/enterprise-row';
import PricingPlans from '@/components/pricing/pricing-plans';
import SEOHead from '@/components/seo/seo-head';
import { SUPPORT_EMAIL } from '@/components/site/site-links';
import Button from '@/components/ui/button';
import CellGrid from '@/components/ui/cell-grid';
import { CheckGlyph } from '@/components/ui/glyph';
import PageHeader from '@/components/ui/page-header';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, Trans, useI18n } from '@/i18n';
import { examplesText } from '@/lib/data/paid-features';
import { PRICING } from '@/lib/data/pricing';
import LandingLayout from '@/layouts/landing-layout';

type TeamsContent = typeof import('@data/content/en/teams.json');

interface TeamsProps {
    content: TeamsContent;
    organizationProfiles: string[];
}

/**
 * `/teams` in every language: Team for the person who buys it for a company
 * (monetization roadmap R4.2).
 *
 * What a team shares, how seats and members work, the price per seat, how a
 * company pays, and what reaches TablePro's server, each in a few lines with a
 * link to where the site explains it in full: the features page for Team
 * Library and Team Catalog, Pricing for checkout, Security and the privacy
 * policy for the data. Every price, seat bound and day count comes from
 * pricing.json.
 *
 * It promises only what checkout and the account do today. Payment and the
 * invoice are Polar's, as merchant of record; a purchase order or a bank
 * transfer is a conversation with support, not a feature. What a company
 * might need beyond Team goes to the same contact route as the Enterprise
 * card, under its subject, so each inquiry can be counted.
 */
export default function Teams({ content, organizationProfiles }: TeamsProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, plural, path } = useI18n();
    const team = PRICING.tiers.team;
    const enterprise = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(INQUIRY_SUBJECT)}`;

    const values = {
        min: team.seats.min,
        deviceLimit: PRICING.license.deviceLimit,
        merchant: PRICING.merchantOfRecord.name,
        refundDays: PRICING.refund.days,
        email: SUPPORT_EMAIL,
        proExamples: examplesText('starter', m.common.list),
    };

    const tags = {
        ui: (text: string) => <span className="font-medium">{text}</span>,
        email: (text: string) => (
            <a href={`mailto:${SUPPORT_EMAIL}`} className={textLinkClasses('inline')}>
                {text}
            </a>
        ),
    };

    const crumbs = [
        { name: m.common.home, path: path('/') },
        { name: content.breadcrumb, path: path('/teams') },
    ];

    const shared = [
        { copy: content.share.library, href: '/features/sync-and-teams#team' },
        { copy: content.share.catalog, href: '/features/sync-and-teams#team' },
        { copy: content.share.pro, href: '/pricing#features' },
    ];

    const list = (items: string[]) => (
        <ul className="type-body grid max-w-[68ch] gap-3 text-foreground">
            {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5">
                    <CheckGlyph className="mt-[0.3em] shrink-0" />
                    <span>
                        <Trans text={fmt(item, values)} tags={tags} />
                    </span>
                </li>
            ))}
        </ul>
    );

    return (
        <LandingLayout>
            <SEOHead
                title={content.seo.title}
                description={content.seo.description}
                jsonLd={plainPageJsonLd({
                    baseUrl: canonicalBaseUrl,
                    inLanguage: LOCALES.supported[locale].hreflang,
                    path: path('/teams'),
                    name: content.seo.title,
                    description: content.seo.description,
                    crumbs,
                    organization: { description: m.seo.product.short, sameAs: organizationProfiles },
                })}
            />

            <PageHeader
                title={content.header.title}
                lead={content.header.lead}
                breadcrumbs={[{ label: m.common.home, href: '/' }, { label: content.breadcrumb }]}
                actions={
                    <>
                        <Button href="#price">{content.header.primary}</Button>
                        <a href={enterprise} className={textLinkClasses('standalone')}>
                            {content.header.secondary}
                        </a>
                    </>
                }
            />

            <Section id="share" title={content.share.title} lead={content.share.lead} flush>
                <CellGrid className="md:grid-cols-3">
                    {shared.map(({ copy, href }) => (
                        <div key={copy.title} className="grid content-start gap-3">
                            <h3 className="type-h3 text-foreground">{copy.title}</h3>
                            <p className="type-body text-muted-foreground">{fmt(copy.text, values)}</p>
                            <p>
                                <LocaleLink href={href} className={textLinkClasses('standalone')}>
                                    {copy.link}
                                    <span aria-hidden="true">→</span>
                                </LocaleLink>
                            </p>
                        </div>
                    ))}
                </CellGrid>
            </Section>

            <Section id="seats" title={content.seats.title}>
                {list(content.seats.items)}
            </Section>

            <Section id="price" tone="surface" title={content.pricing.title}>
                <div className="grid gap-8 lg:grid-cols-[28rem_minmax(0,1fr)] lg:items-start lg:gap-16">
                    <PricingPlans tiers={['team']} cycles={['monthly', 'yearly']} enterprise={false} />
                    <ul className="type-body grid max-w-[44ch] gap-3 text-muted-foreground lg:pt-14">
                        <li>{plural(m.pricing.prioritySupport.detail, team.prioritySupport.responseBusinessDays)}</li>
                        <li>{content.pricing.note}</li>
                    </ul>
                </div>
            </Section>

            <Section id="buying" title={content.buying.title}>
                {list(content.buying.items)}
            </Section>

            <Section id="data" title={content.data.title}>
                {list(content.data.items)}
                <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                    <LocaleLink href="/security" className={textLinkClasses('standalone')}>
                        {content.data.security}
                    </LocaleLink>
                    <LocaleLink href="/privacy" className={textLinkClasses('standalone')}>
                        {content.data.privacy}
                    </LocaleLink>
                </p>
            </Section>

            <Section id="enterprise" tone="surface" title={content.enterprise.title}>
                <div className="grid max-w-[68ch] gap-4">
                    <p className="type-body text-foreground">{content.enterprise.text}</p>
                    <p>
                        <a href={enterprise} className={textLinkClasses('standalone')}>
                            {content.enterprise.cta}
                            <span aria-hidden="true">→</span>
                        </a>
                    </p>
                </div>
            </Section>
        </LandingLayout>
    );
}
