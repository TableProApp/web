import { Children, isValidElement, type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import AppStoreBadge from '@/components/download/app-store-badge';
import { requirementLine } from '@/components/download/format';
import { useContentTags, type SiteLinks } from '@/components/faq/content-links';
import SEOHead from '@/components/seo/seo-head';
import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import Container from '@/components/ui/container';
import DotList from '@/components/ui/dot-list';
import FaqList from '@/components/ui/faq-list';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, Trans, useI18n, type Values } from '@/i18n';
import { joinList, keepTogether } from '@/i18n/format';
import { PUBLISHER } from '@/lib/data/facts';
import type { Requirements } from '@/lib/data/platforms';
import { PRICING } from '@/lib/data/pricing';
import { absoluteUrl, graph, iosAppId, iosAppNode, organizationNode, webPageNode } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

type IosContent = typeof import('@data/content/en/ios.json');

interface EngineLink {
    id: string;
    name: string;
    /** The page that describes the engine, when the site has one. */
    href: string | null;
}

interface IosProps {
    content: IosContent;
    /** The App Store release from platforms.json, or null while the app is not released. */
    ios: {
        deviceNames: string[];
        requirements: Requirements | null;
        appStoreUrl: string | null;
        free: boolean;
        inAppPurchases: boolean;
        version: string | null;
        publishedAt: string | null;
        publishedAtFormatted: string | null;
    } | null;
    macRequirements: Requirements | null;
    engines: { picker: EngineLink[]; syncedOnly: EngineLink[] };
    safeModeLevels: string[];
    limits: { history: number | null; results: number | null };
    links: SiteLinks;
    /** The organization's own profiles, for `sameAs`. */
    organizationProfiles: string[];
    /** The header iPad slot's `sizes`, the same string its preload (`lcpAsset`) was built with. */
    ipadSizes: string;
}

/** One block of copy: paragraphs with `{token}` slots and link tags. */
function Paragraphs({ items, tags, values }: { items: string[]; tags: Record<string, (text: string) => ReactNode>; values: Values }) {
    return (
        <div className="type-body max-w-[44rem] space-y-4 text-foreground">
            {items.map((paragraph, index) => (
                <p key={index}>
                    <Trans text={paragraph} tags={tags} values={values} />
                </p>
            ))}
        </div>
    );
}

/**
 * Text beside its phone screens from 1024px (text in columns 1–6, the screens
 * from column 7 on one left edge, whether there are one or two), and below
 * that the screens centred above their text (design-system §6.2, §8.8). A
 * right-aligned single slot left a 340px hole between it and its text. The
 * children are `AssetSlot`s; with none to show, the row is its text.
 */
function Row({ text, children }: { text: ReactNode; children: ReactNode }) {
    const shown = useShownSlot();
    const screens = Children.toArray(children).filter((slot) => isValidElement<{ id: unknown }>(slot) && shown(slot.props.id) !== null);

    if (screens.length === 0) {
        return text;
    }

    return (
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">{text}</div>
            <div className="order-first flex flex-wrap items-start justify-center gap-6 lg:order-none lg:col-span-6 lg:justify-start">{screens}</div>
        </div>
    );
}

/**
 * `/ios` and `/vi/ios` (sitemap §A.1, §E.5; design-system §8.8).
 *
 * The App Store app as released: version 1.0 (build 22), nothing merged after
 * it. Engines are named from data and never counted, Safe Mode has its own
 * three levels, export goes through the clipboard and the share sheet, and
 * the page says plainly what the app leaves to the Mac: jump hosts, Redis key
 * browsing, the AI assistant and the rest of `#limits`. What is wrong in the
 * released version sits in `#known-issues`, under that version's number, and
 * not inside the feature copy.
 *
 * Every image is an `AssetSlot` from the manifest; one the owner has not
 * supplied yet leaves no gap in production. The App Store badge is Apple's
 * artwork.
 */
export default function Ios({ content, ios, macRequirements, engines, safeModeLevels, limits, links, organizationProfiles, ipadSizes }: IosProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path, format } = useI18n();
    const shown = useShownSlot();
    const tags = useContentTags(links);
    const number = m.download.file.number;
    const list = (items: string[]): string => joinList(items, m.common.list);

    const values: Values = {
        levels: list(safeModeLevels),
        engines: list(engines.syncedOnly.map((engine) => engine.name)),
        ...(limits.history !== null && { history: format.formatNumber(limits.history, number) }),
        ...(limits.results !== null && { results: format.formatNumber(limits.results, number) }),
    };

    const requirement = ios?.requirements ? requirementLine(ios.requirements, m.platforms) : null;
    const pageUrl = absoluteUrl(canonicalBaseUrl, path('/ios'));
    const context = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };

    const jsonLd = graph([
        organizationNode(canonicalBaseUrl, { description: m.seo.product.short, sameAs: organizationProfiles, publisher: PUBLISHER }),
        webPageNode(context, {
            url: pageUrl,
            name: content.seo.title,
            description: content.seo.description,
            about: iosAppId(canonicalBaseUrl),
        }),
        ios !== null &&
            ios.requirements !== null &&
            ios.appStoreUrl !== null &&
            links.license !== null &&
            iosAppNode(context, {
                alternateName: m.seo.iosApp.alternateName,
                description: content.seo.description,
                operatingSystem: ios.requirements.systems.join(', '),
                requirements: requirementLine(ios.requirements, m.platforms),
                installUrl: ios.appStoreUrl,
                licenseUrl: links.license,
                currency: PRICING.currency,
            }),
    ]);

    return (
        <LandingLayout>
            <SEOHead title={content.seo.title} titleTemplate={false} description={content.seo.description} jsonLd={jsonLd} />

            <PageHeader title={content.hero.title} lead={content.hero.lead}>
                {/*
                  * The badge with its requirement 8px under it (the AvailabilityLine,
                  * design-system §5.3.18), then the other facts as one dotted line.
                  */}
                <div className="space-y-4">
                    <div className="grid justify-items-start gap-2">
                        {ios?.appStoreUrl && (
                            <AppStoreBadge href={ios.appStoreUrl} location="ios-page" />
                        )}
                        {requirement !== null && <p className="type-small text-muted-foreground">{fmt(m.platforms.requires, { requirement })}</p>}
                    </div>
                    <p className="type-small text-muted-foreground">
                        <DotList
                            items={[
                                ios?.free && !ios.inAppPurchases && m.platforms.free,
                                content.hero.noSignUp,
                                ios?.version && (
                                    <span className="tabular-nums">
                                        {ios.publishedAtFormatted !== null
                                            ? fmt(m.download.release.dated, { version: ios.version, date: keepTogether(ios.publishedAtFormatted) })
                                            : fmt(m.download.release.undated, { version: ios.version })}
                                    </span>
                                ),
                            ]}
                        />
                    </p>
                    <p className="type-small text-foreground">
                        <Trans text={content.hero.mac} tags={tags} />
                        {macRequirements !== null && (
                            <span className="text-muted-foreground"> {fmt(m.platforms.requires, { requirement: requirementLine(macRequirements, m.platforms) })}</span>
                        )}
                    </p>
                </div>
            </PageHeader>

            {(shown('ios-connection-list') || shown('ipad-table-browse')) && (
                <div className="py-8 md:py-10 xl:py-12">
                    <Container>
                        {/* The page's first images: eager, with high fetch priority, and the iPad is preloaded (`lcpAsset`). A block of their own, between two joins. */}
                        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-end">
                            <AssetSlot id="ios-connection-list" priority />
                            {shown('ipad-table-browse') && (
                                <div className="w-full min-w-0 lg:flex-1">
                                    <AssetSlot id="ipad-table-browse" priority sizes={ipadSizes} />
                                </div>
                            )}
                        </div>
                    </Container>
                </div>
            )}

            <Section id="databases" title={content.databases.title} lead={content.databases.lead}>
                <ul className="grid max-w-[44rem] grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                    {engines.picker.map((engine) => (
                        <li key={engine.id} className="type-body font-medium text-foreground">
                            {engine.href !== null ? (
                                <LocaleLink href={engine.href} className={textLinkClasses('inline')}>
                                    {engine.name}
                                </LocaleLink>
                            ) : (
                                engine.name
                            )}
                        </li>
                    ))}
                </ul>
                <div className="mt-8">
                    <Paragraphs
                        items={[
                            ...(engines.syncedOnly.length > 0 ? [content.databases.syncedOnly] : []),
                            content.databases.others,
                            content.databases.files,
                            content.databases.redis,
                            content.databases.sample,
                        ]}
                        tags={tags}
                        values={values}
                    />
                </div>
            </Section>

            <Section id="browse" title={content.browse.title}>
                <Row text={<Paragraphs items={content.browse.paragraphs} tags={tags} values={values} />}>
                    <AssetSlot id="ios-table-browse" />
                    <AssetSlot id="ios-row-edit" />
                </Row>
            </Section>

            <Section id="query" title={content.query.title}>
                <Row text={<Paragraphs items={content.query.paragraphs} tags={tags} values={values} />}>
                    <AssetSlot id="ios-query" />
                    <AssetSlot id="ios-live-activity" />
                </Row>
            </Section>

            <Section id="security" title={content.security.title}>
                <Row text={<Paragraphs items={content.security.paragraphs} tags={tags} values={values} />}>
                    <AssetSlot id="ios-connection-form" />
                </Row>
            </Section>

            <Section id="safe-mode" title={content.safeMode.title}>
                <Row text={<Paragraphs items={content.safeMode.paragraphs} tags={tags} values={values} />}>
                    <AssetSlot id="ios-safe-mode-confirm" />
                </Row>
            </Section>

            <Section id="ipad" title={content.ipad.title}>
                <Paragraphs items={content.ipad.paragraphs} tags={tags} values={values} />
                {/* Columns 2-11 of the 12-column grid, the iPad kind's 1008 x 756 at 1280 and wider. */}
                {shown('ipad-two-windows') && (
                    <div className="mt-10 lg:mx-auto lg:w-[calc(83.333%-5.333px)]">
                        <AssetSlot id="ipad-two-windows" />
                    </div>
                )}
            </Section>

            <Section id="mac" title={content.mac.title}>
                <Paragraphs items={content.mac.paragraphs} tags={tags} values={values} />
                {(shown('diagram-icloud-sync') || shown('mac-handoff-ios')) && (
                    <div className="mt-10 grid gap-8">
                        <AssetSlot id="diagram-icloud-sync" />
                        <AssetSlot id="mac-handoff-ios" />
                    </div>
                )}
            </Section>

            <Section id="automation" title={content.automation.title}>
                <Row text={<Paragraphs items={content.automation.paragraphs} tags={tags} values={values} />}>
                    <AssetSlot id="ios-widgets" />
                    <AssetSlot id="ios-shortcuts-add-rows" />
                </Row>
            </Section>

            <Section id="limits" title={content.limits.title} width="text">
                <p className="type-body text-foreground">{content.limits.lead}</p>
                <ul className="type-body mt-4 list-disc space-y-2 pl-6 text-foreground marker:text-muted-foreground">
                    {content.limits.items.map((item) => (
                        <li key={item} className="pl-1">
                            {item}
                        </li>
                    ))}
                </ul>
                <p className="mt-6">
                    <Trans
                        text={content.limits.mac}
                        tags={{
                            ...tags,
                            download: (text) => (
                                <LocaleLink href="/download" className={textLinkClasses('standalone')}>
                                    {text}
                                    <span aria-hidden="true">→</span>
                                </LocaleLink>
                            ),
                        }}
                    />
                </p>
            </Section>

            {ios?.version && (
                <Section id="known-issues" title={fmt(content.knownIssues.title, { version: ios.version })} width="text">
                    <ul className="type-body list-disc space-y-2 pl-6 text-foreground marker:text-muted-foreground">
                        {content.knownIssues.items.map((item) => (
                            <li key={item} className="pl-1">
                                {item}
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            <Section id="privacy" title={content.privacy.title}>
                <Row text={<Paragraphs items={content.privacy.paragraphs} tags={tags} values={values} />}>
                    <AssetSlot id="ios-settings-privacy" />
                </Row>
            </Section>

            <Section id="get" title={content.get.title} width="text">
                <div className="space-y-4">
                    {ios?.appStoreUrl && (
                        <AppStoreBadge href={ios.appStoreUrl} location="ios-page-end" />
                    )}
                    {requirement !== null && <p className="type-small text-muted-foreground">{fmt(m.platforms.requires, { requirement })}</p>}
                </div>
                <FaqList
                    className="frame-rows-text mt-10"
                    items={content.get.faq.map((item) => ({
                        question: item.question,
                        answer: <p><Trans text={item.answer} tags={tags} values={values} /></p>,
                    }))}
                />
                <p className="type-body mt-8 text-foreground">
                    <Trans text={content.get.source} tags={tags} />
                </p>
            </Section>
        </LandingLayout>
    );
}
