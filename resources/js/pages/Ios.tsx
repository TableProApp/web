import { usePage } from '@inertiajs/react';
import { BAND_NOTES, BAND_TEXT } from '@/components/databases/engine-band';
import AppStoreBadge from '@/components/download/app-store-badge';
import { requirementLine } from '@/components/download/format';
import { useContentTags } from '@/components/faq/content-links';
import { ClosingFrame } from '@/components/features/feature-closing';
import FeatureHero from '@/components/features/feature-hero';
import { FeatureLinkItem } from '@/components/features/feature-links';
import { MoreFrame, MoreItem } from '@/components/features/more-list';
import { EngineWords } from '@/components/home/index-bands';
import DevicePair from '@/components/ios/device-pair';
import IosBand from '@/components/ios/ios-band';
import type { IosPageProps } from '@/components/ios/types';
import SEOHead from '@/components/seo/seo-head';
import { useShownSlot } from '@/components/ui/asset-slot';
import Container from '@/components/ui/container';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { LOCALES, Trans, useI18n, type Values } from '@/i18n';
import { joinList } from '@/i18n/format';
import { PRICING } from '@/lib/data/pricing';
import { absoluteUrl, graph, iosAppId, iosAppNode, organizationNode, webPageNode } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

const ITEM_TEXT = 'mt-2 space-y-2 text-[0.9375rem] leading-[1.55] text-pretty text-muted-foreground';

// `/ios` in every locale (sitemap §A.1, §E.5; design-system §8.8): the App Store release on the grid Home, feature and
// database pages share. The hero's devices, the engines the app opens, six bands, the Also list and the badge again.
export default function Ios({ content, ios, engines, safeModeLevels, limits, links, organizationProfiles, heroSizes }: IosPageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path, format } = useI18n();
    const shown = useShownSlot();
    const tags = useContentTags(links);
    useRevealOnScroll('main > section:not(#top)');

    const number = m.download.file.number;
    const values: Values = {
        levels: joinList(safeModeLevels, m.common.list),
        engines: joinList(
            engines.syncedOnly.map((engine) => engine.name),
            m.common.list,
        ),
        ...(limits.history !== null && { history: format.formatNumber(limits.history, number) }),
        ...(limits.results !== null && { results: format.formatNumber(limits.results, number) }),
    };
    const paragraphs = (texts: string[]) =>
        texts.map((text, index) => (
            <p key={index}>
                <Trans text={text} tags={tags} values={values} />
            </p>
        ));

    const requirement = ios?.requirements ? requirementLine(ios.requirements, m.platforms) : null;
    const requirementText = requirement === null ? null : fmt(ios?.free && !ios.inAppPurchases ? content.hero.requirement : m.platforms.requires, { requirement });
    const store = ios?.appStoreUrl ?? null;

    const pageUrl = absoluteUrl(canonicalBaseUrl, path('/ios'));
    const context = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };
    const jsonLd = graph([
        organizationNode(canonicalBaseUrl, { description: m.seo.product.short, sameAs: organizationProfiles }),
        webPageNode(context, {
            url: pageUrl,
            name: content.seo.title,
            description: content.seo.description,
            about: iosAppId(canonicalBaseUrl),
        }),
        ios !== null &&
            ios.requirements !== null &&
            store !== null &&
            links.license !== null &&
            iosAppNode(context, {
                alternateName: m.seo.iosApp.alternateName,
                description: content.seo.description,
                operatingSystem: ios.requirements.systems.join(', '),
                requirements: requirementLine(ios.requirements, m.platforms),
                installUrl: store,
                licenseUrl: links.license,
                currency: PRICING.currency,
            }),
    ]);

    return (
        <LandingLayout>
            <SEOHead title={content.seo.title} titleTemplate={false} description={content.seo.description} jsonLd={jsonLd} />

            <FeatureHero
                title={content.hero.title}
                lead={content.hero.lead}
                actions={
                    <div className="grid justify-items-start gap-3">
                        {store !== null && <AppStoreBadge href={store} location="ios-page" />}
                        {requirementText !== null && <p className="type-small text-muted-foreground">{requirementText}</p>}
                    </div>
                }
                settle={false}
            >
                {shown('ios-hero-ipad') !== null || shown('ios-hero-iphone') !== null ? <DevicePair ipadSizes={heroSizes} /> : undefined}
            </FeatureHero>

            {/* Home's DatabaseBand on the bands' columns, so the text lines up with theirs from 768px. */}
            <section id="databases" aria-labelledby="databases-title" className="py-10 md:py-14">
                <Container>
                    <div className="grid gap-6 md:grid-cols-12 md:gap-x-8">
                        <h2 id="databases-title" className="text-sm leading-[1.3] font-medium tracking-[-0.006em] text-muted-foreground md:col-span-4 lg:col-span-3">
                            {content.databases.title}
                        </h2>
                        <div className="md:col-span-8 lg:col-span-9">
                            <EngineWords engines={engines.picker} />
                            <div className={`mt-6 max-w-[42rem] ${BAND_NOTES}`}>
                                {engines.syncedOnly.length > 0 && paragraphs([content.databases.syncedOnly])}
                                {paragraphs([content.databases.files])}
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {content.bands.map((band) => (
                <IosBand key={band.id} band={band}>
                    <div className={BAND_TEXT}>{paragraphs(band.text)}</div>
                </IosBand>
            ))}

            <MoreFrame title={content.more.title}>
                {content.more.items.map((item) => (
                    <MoreItem key={item.id} id={item.id} also={item.also} title={item.title}>
                        <div className={ITEM_TEXT}>{paragraphs(item.text)}</div>
                        {item.links !== undefined && (
                            <ul className="mt-3 space-y-2">
                                {item.links.map((link) => (
                                    <li key={link.href}>
                                        <FeatureLinkItem link={link} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </MoreItem>
                ))}
            </MoreFrame>

            {store !== null && (
                <ClosingFrame id="get" title={content.closing.title} sentence={content.closing.text}>
                    <AppStoreBadge href={store} location="ios-page-end" />
                </ClosingFrame>
            )}
        </LandingLayout>
    );
}
