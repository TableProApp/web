import { usePage } from '@inertiajs/react';
import DownloadBand from '@/components/features/download-band';
import { docsHref, factValues } from '@/components/features/model';
import RichText from '@/components/features/rich-text';
import type { FeatureHubProps } from '@/components/features/types';
import SEOHead from '@/components/seo/seo-head';
import { FEATURE_PAGES } from '@/components/site/site-links';
import Badge from '@/components/ui/badge';
import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { FACTS } from '@/lib/data/facts';
import { featureHref, PAID_FEATURES } from '@/lib/data/paid-features';
import type { PaidTierId } from '@/lib/data/pricing';
import { absoluteUrl, collectionPageNode, graph, organizationNode, organizationProfiles } from '@/lib/structured-data';
import { cn } from '@/lib/utils';
import LandingLayout from '@/layouts/landing-layout';

const TIERS: readonly PaidTierId[] = ['starter', 'team'];

/**
 * The feature hub, `/features` and `/vi/features` (sitemap §A.2, §E.8).
 *
 * An overview list, not a card mosaic: each area is a link named as in the
 * Features menu, two lines of what it covers, and the paid features it
 * describes with their plan, derived from `paid-features.json`. Then the
 * iPhone and iPad app, every paid feature in one table, and the docs. Only
 * pages that render in this locale are listed, so the hub never links a 404.
 *
 * Structured data: a `CollectionPage` listing the same-locale feature pages,
 * and the organization.
 */
export default function FeatureIndex({ content, pages, facts }: FeatureHubProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    const labels = content.labels;
    const values = factValues(facts, labels.number, m.common.list);

    const summaries = new Map(content.areas.items.map((item) => [item.slug, item.summary]));
    const areas = pages.flatMap((slug) => {
        const page = FEATURE_PAGES.find((candidate) => candidate.href === `/features/${slug}`);

        return page !== undefined ? [{ slug, href: page.href, title: m.nav.featureLinks[page.key], summary: summaries.get(slug) ?? '' }] : [];
    });

    const pageTitle = (href: string): string => {
        const page = FEATURE_PAGES.find((candidate) => candidate.href === href);

        return page !== undefined ? m.nav.featureLinks[page.key] : href;
    };

    const context = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };
    const jsonLd = graph([
        organizationNode(canonicalBaseUrl, { description: m.seo.product.short, sameAs: organizationProfiles(FACTS.links) }),
        collectionPageNode(context, {
            url: absoluteUrl(canonicalBaseUrl, path('/features')),
            name: content.header.title,
            description: content.seo.description,
            items: areas.map((area) => ({ name: area.title, path: path(area.href) })),
        }),
    ]);

    return (
        <LandingLayout>
            <SEOHead title={content.seo.title} description={content.seo.description} jsonLd={jsonLd} />

            <PageHeader title={content.header.title} lead={content.header.lead} />

            <Section id="areas" title={content.areas.title} lead={content.areas.lead}>
                <ul data-rule-list className="frame-rows border-t border-rule">
                    {areas.map((area) => {
                        const paid = PAID_FEATURES.filter((feature) => feature.page.path === area.href);

                        return (
                            <li key={area.slug} className="grid gap-2 border-b border-rule py-6 md:grid-cols-12 md:gap-8">
                                <h3 className="type-h3 md:col-span-4">
                                    <LocaleLink href={area.href} className={textLinkClasses('inline')}>
                                        {area.title}
                                    </LocaleLink>
                                </h3>
                                <div className="md:col-span-8">
                                    <p className="type-body text-foreground">
                                        <RichText text={area.summary} values={values} />
                                    </p>
                                    <p className="type-small mt-2 flex flex-wrap gap-2 text-muted-foreground">
                                        {paid.length === 0 && content.areas.noPaid}
                                        {TIERS.map((tier) => {
                                            const names = paid.filter((feature) => feature.tier === tier).map((feature) => feature.name);

                                            return names.length > 0 ? (
                                                <Badge key={tier} variant="accent">
                                                    {fmt(content.areas.paid, { tier: labels.tiers[tier], features: joinList(names, m.common.list) })}
                                                </Badge>
                                            ) : null;
                                        })}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </Section>

            <Section id="ios" title={content.ios.title} width="text">
                <p className="type-body text-foreground">
                    <RichText text={content.ios.body} values={values} />
                </p>
                <p className="mt-4">
                    <LocaleLink href="/ios" className={textLinkClasses('standalone')}>
                        {content.ios.link}
                        <span aria-hidden="true">→</span>
                    </LocaleLink>
                </p>
            </Section>

            <Section id="paid" title={content.paid.title} lead={content.paid.lead}>
                {/* Below 640px, Plan and "Described on" fold into the feature's row header (design-system §5.3.10). */}
                <DataTable wrapperClassName="frame-table" caption={content.paid.caption} className="sm:min-w-[32rem]">
                    <thead>
                        <tr>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {content.paid.columns.feature}
                            </th>
                            <th scope="col" className={cn(TABLE_HEAD_CELL, 'hidden sm:table-cell')}>
                                {content.paid.columns.plan}
                            </th>
                            <th scope="col" className={cn(TABLE_HEAD_CELL, 'hidden sm:table-cell')}>
                                {content.paid.columns.page}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {PAID_FEATURES.map((feature) => {
                            const plan = (
                                <Badge variant="accent" className="whitespace-nowrap">
                                    {fmt(labels.availability.plan, { tier: labels.tiers[feature.tier] })}
                                </Badge>
                            );
                            const page = pages.includes(feature.page.path.replace('/features/', '')) ? (
                                <LocaleLink href={featureHref(feature)} className={textLinkClasses('inline')}>
                                    {pageTitle(feature.page.path)}
                                </LocaleLink>
                            ) : (
                                pageTitle(feature.page.path)
                            );

                            return (
                                <tr key={feature.id} className={TABLE_ROW}>
                                    <th scope="row" className={TABLE_ROW_HEADER}>
                                        {feature.name}
                                        <span className="type-caption mt-1.5 grid justify-items-start gap-1.5 font-normal text-muted-foreground sm:hidden">
                                            {plan}
                                            <span className="block">
                                                {content.paid.columns.page}: {page}
                                            </span>
                                        </span>
                                    </th>
                                    <td className={cn(TABLE_CELL, 'hidden sm:table-cell')}>{plan}</td>
                                    <td className={cn(TABLE_CELL, 'hidden sm:table-cell')}>{page}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </DataTable>
                <p className="mt-6">
                    <LocaleLink href="/pricing" className={textLinkClasses('standalone')}>
                        {content.paid.pricing}
                        <span aria-hidden="true">→</span>
                    </LocaleLink>
                </p>
            </Section>

            <Section id="docs" title={content.docs.title} width="text">
                <p className="type-body text-foreground">{content.docs.body}</p>
                <p className="mt-4">
                    <TextLink href={docsHref(FACTS.links.docs, content.docs.path)} kind="standalone" external hrefLang="en">
                        {locale === 'en' ? content.docs.link : `${content.docs.link} ${m.common.englishOnly}`}
                    </TextLink>
                </p>
            </Section>

            <DownloadBand labels={labels} location="features-hub" />
        </LandingLayout>
    );
}
