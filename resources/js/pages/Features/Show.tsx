import { usePage } from '@inertiajs/react';
import AvailabilityTable from '@/components/features/availability-table';
import DownloadBand from '@/components/features/download-band';
import FeatureLinkList from '@/components/features/feature-links';
import FeatureSection from '@/components/features/feature-section';
import { docsHref, factValues, pageOnIos, pageOnMac, pagePaidIds } from '@/components/features/model';
import RichText from '@/components/features/rich-text';
import type { FeaturePageProps } from '@/components/features/types';
import SEOHead from '@/components/seo/seo-head';
import { FEATURE_PAGES } from '@/components/site/site-links';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Callout from '@/components/ui/callout';
import Container from '@/components/ui/container';
import { AppleGlyph } from '@/components/ui/glyph';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import TextLink from '@/components/ui/text-link';
import { LOCALES, useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { trackDownload } from '@/lib/analytics';
import { FACTS } from '@/lib/data/facts';
import { PAID_FEATURES } from '@/lib/data/paid-features';
import { iosPlatform, macPlatform } from '@/lib/data/platforms';
import { absoluteUrl, breadcrumbNode, graph, macAppId, organizationNode, organizationProfiles, webPageNode } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

/**
 * A feature page, `/features/{slug}` and `/vi/features/{slug}` (sitemap §A.2,
 * §E.4; design-system §8.2).
 *
 * Everything on it comes from the page's content file, the shared `labels`
 * and the facts the server computed for it. The order is fixed: the header,
 * one section per sub-workflow in the sitemap's order and with its ids, then
 * "Where it works", the limits that change a decision, the docs and related
 * pages, and the closing band. There is no page-level overview image: the
 * first section's slot is the page's lead image.
 *
 * Structured data: a `WebPage` about the Mac app (`#app`) with its
 * `BreadcrumbList`, matching the visible breadcrumbs, and the organization.
 */
export default function FeatureShow({ slug, content, labels, facts }: FeaturePageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();

    const values = factValues(facts, labels.number, m.common.list);
    const pageName = FEATURE_PAGES.find((page) => page.href === `/features/${slug}`);
    const crumbLabel = pageName !== undefined ? m.nav.featureLinks[pageName.key] : content.header.title;

    const paid = pagePaidIds(
        content,
        PAID_FEATURES.map((feature) => feature.id),
    ).flatMap((id) => PAID_FEATURES.filter((feature) => feature.id === id));
    const paidLine =
        paid.length > 0
            ? fmt(labels.header.paid, {
                  features: joinList(
                      paid.map((feature) => fmt(labels.header.paidItem, { name: feature.name, tier: labels.tiers[feature.tier] })),
                      m.common.list,
                  ),
              })
            : labels.header.allFree;

    const platforms = [
        ...(pageOnMac(content) ? [joinList(macPlatform().deviceNames, m.common.shortList)] : []),
        ...(pageOnIos(content) ? [joinList(iosPlatform().deviceNames, m.common.shortList)] : []),
    ];

    const pageUrl = absoluteUrl(canonicalBaseUrl, path(`/features/${slug}`));
    const context = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };
    const jsonLd = graph([
        organizationNode(canonicalBaseUrl, { description: m.seo.product.short, sameAs: organizationProfiles(FACTS.links) }),
        webPageNode(context, {
            url: pageUrl,
            name: content.header.title,
            description: content.seo.description,
            about: macAppId(canonicalBaseUrl),
            breadcrumb: `${pageUrl}#breadcrumb`,
        }),
        breadcrumbNode(context, pageUrl, [
            { name: m.seo.breadcrumbs.features, path: path('/features') },
            { name: crumbLabel, path: path(`/features/${slug}`) },
        ]),
    ]);

    return (
        <LandingLayout>
            <SEOHead title={content.seo.title} description={content.seo.description} jsonLd={jsonLd} />

            <PageHeader
                breadcrumbs={[{ label: m.seo.breadcrumbs.features, href: '/features' }, { label: crumbLabel }]}
                title={content.header.title}
                lead={content.header.lead}
                actions={
                    <>
                        <Button
                            href={path('/download')}
                            variant="secondary"
                            icon={<AppleGlyph />}
                            onClick={() => trackDownload('feature-header', 'mac')}
                        >
                            {m.download.macCta}
                        </Button>
                        <TextLink href={docsHref(FACTS.links.docs, content.header.docs)} kind="standalone" external hrefLang="en">
                            {locale === 'en' ? labels.header.docs : `${labels.header.docs} ${m.common.englishOnly}`}
                        </TextLink>
                    </>
                }
            >
                <div className="flex flex-wrap items-center gap-2">
                    {platforms.map((name) => (
                        <Badge key={name} variant="outline">
                            {name}
                        </Badge>
                    ))}
                </div>
                <p className="type-small mt-3 max-w-[56ch] text-muted-foreground">{paidLine}</p>
            </PageHeader>

            {content.sections.map((section) => (
                <FeatureSection key={section.id} section={section} facts={facts} values={values} labels={labels} />
            ))}

            <Section id="availability" title={labels.sections.availability}>
                <AvailabilityTable rows={content.availability} labels={labels} values={values} />
                {content.limits.length > 0 && (
                    <Callout id="limits" title={labels.sections.limits} className="mt-8 max-w-[44rem]">
                        <ul className="list-disc space-y-1 pl-5">
                            {content.limits.map((limit, index) => (
                                <li key={index}>
                                    <RichText text={limit} values={values} />
                                </li>
                            ))}
                        </ul>
                    </Callout>
                )}
            </Section>

            <Container className="grid gap-12 border-t border-rule py-16 md:grid-cols-2 md:py-20">
                <section id="docs" aria-labelledby="docs-title">
                    <h2 id="docs-title" className="type-h3 text-foreground">
                        {labels.sections.docs}
                    </h2>
                    <FeatureLinkList links={content.docs} direction="column" className="mt-4" />
                </section>
                <section id="related" aria-labelledby="related-title">
                    <h2 id="related-title" className="type-h3 text-foreground">
                        {labels.sections.related}
                    </h2>
                    <FeatureLinkList links={content.related} direction="column" className="mt-4" />
                </section>
            </Container>

            <DownloadBand labels={labels} location="feature-page" />
        </LandingLayout>
    );
}
