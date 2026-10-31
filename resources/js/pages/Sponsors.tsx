import { usePage } from '@inertiajs/react';
import { plainPageJsonLd } from '@/components/faq/structured-data';
import SEOHead from '@/components/seo/seo-head';
import SponsorGrid from '@/components/sponsors/sponsor-grid';
import Button from '@/components/ui/button';
import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, useI18n } from '@/i18n';
import { FACTS, PUBLISHER } from '@/lib/data/facts';
import { SPONSORS } from '@/lib/data/sponsors';
import { byName, onHomepage, openSlots } from '@/lib/sponsors';
import { cn } from '@/lib/utils';
import LandingLayout from '@/layouts/landing-layout';

type SponsorsContent = typeof import('@data/content/en/sponsors.json');

interface SponsorsProps {
    content: SponsorsContent;
    organizationProfiles: string[];
}

// The price columns shrink to their content, so the benefit takes the rest of the row.
const PRICE = 'w-px whitespace-nowrap tabular-nums';

// No amounts per sponsor, no totals and no goal: what each placement costs is the tiers table.
export default function Sponsors({ content, organizationProfiles }: SponsorsProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, plural, path, format } = useI18n();
    const companies = onHomepage(SPONSORS);
    const people = byName(SPONSORS);
    const open = openSlots(SPONSORS);
    const total = SPONSORS.homepageSlots;
    const usd = (amount: number): string => format.formatUsd(amount, m.pricing.currency);

    const crumbs = [
        { name: m.common.home, path: path('/') },
        { name: content.breadcrumb, path: path('/sponsors') },
    ];

    return (
        <LandingLayout>
            <SEOHead
                title={content.seo.title}
                description={content.seo.description}
                jsonLd={plainPageJsonLd({
                    baseUrl: canonicalBaseUrl,
                    inLanguage: LOCALES.supported[locale].hreflang,
                    path: path('/sponsors'),
                    name: content.seo.title,
                    description: content.seo.description,
                    crumbs,
                    organization: { description: m.seo.product.short, sameAs: organizationProfiles, publisher: PUBLISHER },
                })}
            />

            <PageHeader
                variant="utility"
                title={content.header.title}
                lead={content.header.lead}
                breadcrumbs={[{ label: m.common.home, href: '/' }, { label: content.breadcrumb }]}
                actions={
                    <Button href={FACTS.links.sponsorsProgram}>
                        {content.header.action}
                        <span aria-hidden="true">↗</span>
                    </Button>
                }
            />

            <Section
                id="companies"
                title={content.companies.title}
                lead={open > 0 ? plural(content.companies.open, open, { total }) : fmt(content.companies.full, { total })}
                flush={companies.length > 0}
            >
                {companies.length > 0 && <SponsorGrid sponsors={companies} />}
            </Section>

            {people.length > 0 && (
                <Section id="individuals" title={content.people.title}>
                    <ul className="type-body flex flex-wrap gap-x-6 gap-y-2">
                        {people.map((sponsor) => (
                            <li key={sponsor.id}>
                                <a href={sponsor.url} rel="sponsored noopener" translate="no" className={textLinkClasses('inline')}>
                                    {sponsor.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            <Section id="tiers" title={content.tiers.title} lead={plural(content.tiers.lead, SPONSORS.oneTime.months)}>
                {/* Below 640px the one-time price folds under the monthly one, in the row header. */}
                <DataTable wrapperClassName="frame-table" caption={content.tiers.caption} className="sm:min-w-[36rem]">
                    <thead>
                        <tr>
                            <th scope="col" className={cn(TABLE_HEAD_CELL, PRICE)}>
                                {content.tiers.columns.monthly}
                            </th>
                            <th scope="col" className={cn(TABLE_HEAD_CELL, PRICE, 'hidden sm:table-cell')}>
                                {content.tiers.columns.oneTime}
                            </th>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {content.tiers.columns.benefit}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {SPONSORS.tiers.map((tier) => {
                            const once = usd(tier.monthly * SPONSORS.oneTime.multiplier);

                            return (
                                <tr key={tier.placement} className={TABLE_ROW}>
                                    <th scope="row" className={cn(TABLE_ROW_HEADER, PRICE)}>
                                        {usd(tier.monthly)}
                                        <span className="type-caption mt-1.5 block font-normal text-muted-foreground sm:hidden">
                                            {fmt(content.tiers.oneTimePrice, { price: once })}
                                        </span>
                                    </th>
                                    <td className={cn(TABLE_CELL, PRICE, 'hidden sm:table-cell')}>{once}</td>
                                    <td className={TABLE_CELL}>{fmt(content.tiers.benefit[tier.placement], { total })}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </DataTable>
                <p className="mt-6">
                    <TextLink href={FACTS.links.sponsorsProgram} kind="standalone" external>
                        {content.tiers.link}
                    </TextLink>
                </p>
            </Section>
        </LandingLayout>
    );
}
