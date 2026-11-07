import { usePage } from '@inertiajs/react';
import AreaNav from '@/components/features/area-nav';
import FeatureClosing from '@/components/features/feature-closing';
import { PlanPills } from '@/components/features/feature-part';
import FeatureHero from '@/components/features/feature-hero';
import { factValues } from '@/components/features/model';
import RichText from '@/components/features/rich-text';
import type { FeatureArea, FeatureHubProps } from '@/components/features/types';
import SEOHead from '@/components/seo/seo-head';
import { FEATURE_PAGES } from '@/components/site/site-links';
import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { LOCALES, useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { FACTS } from '@/lib/data/facts';
import { iosPlatform } from '@/lib/data/platforms';
import { absoluteUrl, collectionPageNode, graph, organizationNode, organizationProfiles } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

const WINDOW_SIZES = '(min-width: 1280px) 900px, (min-width: 768px) 66vw, calc(100vw - 32px)';

const LINK = 'text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground';

// One area on the hub, on the same index grid as the pages: its menu name, what it covers, its bands as links, its
// window.
function AreaBand({ area, label, summary, values, labels }: { area: FeatureArea; label: string; summary: string; values: Record<string, string>; labels: FeatureHubProps['content']['labels'] }) {
    const shown = useShownSlot();
    const asset = shown(area.asset);
    const href = `/features/${area.slug}`;

    return (
        <section id={area.slug} aria-labelledby={`${area.slug}-title`} className="py-14 md:py-20">
            <Container>
                <div className="grid gap-5 md:grid-cols-12 md:gap-x-8">
                    <h2 id={`${area.slug}-title`} className="md:col-span-4 lg:col-span-3">
                        <LocaleLink href={href} className="text-[1.5rem] leading-[1.15] font-[520] tracking-[-0.022em] text-balance text-foreground hover:underline md:text-[1.75rem]">
                            {label}
                        </LocaleLink>
                    </h2>
                    <div className="md:col-span-8 lg:col-span-9">
                        <p className="max-w-[40rem] text-[1.0625rem] leading-[1.55] tracking-[-0.011em] text-pretty text-foreground">
                            <RichText text={summary} values={values} />
                        </p>
                        <ul className="mt-5 flex max-w-[44rem] flex-wrap gap-x-5 gap-y-2 text-[0.9375rem] leading-[1.5]">
                            {area.bands.map((band) => (
                                <li key={band.id} className="inline-flex items-center gap-2">
                                    <LocaleLink href={`${href}#${band.id}`} className={LINK}>
                                        {band.title}
                                    </LocaleLink>
                                    <PlanPills paid={band.paid} labels={labels} />
                                </li>
                            ))}
                        </ul>
                        {asset !== null && (
                            <div className="mt-10">
                                <AssetSlot id={asset} sizes={WINDOW_SIZES} caption={false} />
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </section>
    );
}

// The feature hub, `/features` in every locale (sitemap §A.2, §E.8): the area nav, a short hero, one band per area
// in the menu's order (only areas that render in this locale, so it never links a 404), and the closing line on
// what is free. Structured data: a CollectionPage of the same-locale pages.
export default function FeatureIndex({ content, areas, facts }: FeatureHubProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    useRevealOnScroll('main > section:not(#top)');

    const labels = content.labels;
    const values = factValues(facts, labels.number, m.common.list);
    const summaries = new Map(content.areas.map((item) => [item.slug, item.summary]));
    const label = (slug: string): string => {
        const page = FEATURE_PAGES.find((candidate) => candidate.href === `/features/${slug}`);

        return page !== undefined ? m.nav.featureLinks[page.key] : slug;
    };

    const jsonLd = graph([
        organizationNode(canonicalBaseUrl, { description: m.seo.product.short, sameAs: organizationProfiles(FACTS.links) }),
        collectionPageNode(
            { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang },
            {
                url: absoluteUrl(canonicalBaseUrl, path('/features')),
                name: content.header.title,
                description: content.seo.description,
                items: areas.map((area) => ({ name: label(area.slug), path: path(`/features/${area.slug}`) })),
            },
        ),
    ]);

    return (
        <LandingLayout>
            <SEOHead title={content.seo.title} description={content.seo.description} jsonLd={jsonLd} />

            <AreaNav current="/features" />
            <FeatureHero title={content.header.title} lead={content.header.lead} docs="/features/overview" docsLabel={labels.docs} />

            {areas.map((area) => (
                <AreaBand key={area.slug} area={area} label={label(area.slug)} summary={summaries.get(area.slug) ?? ''} values={values} labels={labels} />
            ))}

            <FeatureClosing
                labels={labels}
                paid={[]}
                body={content.closing.body}
                extra={{ href: iosPlatform().page ?? '/ios', label: fmt(content.closing.ios, { devices: joinList(iosPlatform().deviceNames, m.common.shortList) }) }}
                location="features-hub"
            />
        </LandingLayout>
    );
}
