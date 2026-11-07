import { usePage } from '@inertiajs/react';
import AreaNav from '@/components/features/area-nav';
import FeatureBand from '@/components/features/feature-band';
import FeatureClosing from '@/components/features/feature-closing';
import FeatureHero from '@/components/features/feature-hero';
import { factValues, pagePaidIds } from '@/components/features/model';
import MoreList from '@/components/features/more-list';
import type { FeaturePageProps } from '@/components/features/types';
import SEOHead from '@/components/seo/seo-head';
import { FEATURE_PAGES } from '@/components/site/site-links';
import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { LOCALES, useI18n } from '@/i18n';
import { FACTS } from '@/lib/data/facts';
import { PAID_FEATURES } from '@/lib/data/paid-features';
import { absoluteUrl, breadcrumbNode, graph, macAppId, organizationNode, organizationProfiles, webPageNode } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

// `/features/{slug}` in every locale it has content in (sitemap §A.2, §E.4; README.md): the area nav, a hero with the
// area's Mac window, four or five bands, the smaller features as a list, and one closing line on what is paid.
export default function FeatureShow({ slug, content, labels, facts, heroSizes }: FeaturePageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, path } = useI18n();
    const shown = useShownSlot();
    useRevealOnScroll('main > section:not(#top)');

    const values = factValues(facts, labels.number, m.common.list);
    const context = { labels, facts, values };
    const hero = shown(content.header.asset);
    const page = FEATURE_PAGES.find((candidate) => candidate.href === `/features/${slug}`);
    const crumb = page !== undefined ? m.nav.featureLinks[page.key] : content.header.title;

    const pageUrl = absoluteUrl(canonicalBaseUrl, path(`/features/${slug}`));
    const jsonLdContext = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };
    const jsonLd = graph([
        organizationNode(canonicalBaseUrl, { description: m.seo.product.short, sameAs: organizationProfiles(FACTS.links) }),
        webPageNode(jsonLdContext, {
            url: pageUrl,
            name: content.header.title,
            description: content.seo.description,
            about: macAppId(canonicalBaseUrl),
            breadcrumb: `${pageUrl}#breadcrumb`,
        }),
        breadcrumbNode(jsonLdContext, pageUrl, [
            { name: m.seo.breadcrumbs.features, path: path('/features') },
            { name: crumb, path: path(`/features/${slug}`) },
        ]),
    ]);

    return (
        <LandingLayout>
            <SEOHead title={content.seo.title} description={content.seo.description} jsonLd={jsonLd} />

            <AreaNav current={`/features/${slug}`} />
            <FeatureHero title={content.header.title} lead={content.header.lead} docs={content.header.docs} docsLabel={labels.docs}>
                {hero !== null ? <AssetSlot id={hero} sizes={heroSizes} caption={false} priority /> : undefined}
            </FeatureHero>

            {content.bands.map((band) => (
                <FeatureBand key={band.id} band={band} context={context} />
            ))}

            <MoreList items={content.more} title={labels.more} context={context} />
            <FeatureClosing
                labels={labels}
                paid={pagePaidIds(
                    content,
                    PAID_FEATURES.map((feature) => feature.id),
                )}
                location="feature-page"
            />
        </LandingLayout>
    );
}
