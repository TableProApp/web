import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import SEOHead from '@/components/seo/seo-head';
import Container from '@/components/ui/container';
import DotList from '@/components/ui/dot-list';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { requirementLine } from '@/components/download/format';
import IosCard from '@/components/download/ios-card';
import MacCard, { UI_TAGS } from '@/components/download/mac-card';
import PageSection from '@/components/download/page-section';
import type { DownloadPageProps } from '@/components/download/types';
import { LOCALES, Trans, useI18n, type Messages } from '@/i18n';
import { joinList, keepTogether } from '@/i18n/format';
import { PRICING } from '@/lib/data/pricing';
import { appStoreFirst, archHint, classifyDevice, type DeviceKind, type MacArch } from '@/lib/device';
import { absoluteUrl, graph, iosAppNode, macAppId, macAppNode, webPageNode, type JsonLdGraph } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

type PlatformName = keyof Messages['platforms']['names'];

interface JsonLdInput extends Pick<DownloadPageProps, 'content' | 'release' | 'mac' | 'ios' | 'links' | 'featuredEngines'> {
    baseUrl: string;
    inLanguage: string;
    m: Messages;
    fmt: (template: string, values: Record<string, string>) => string;
    path: (path: string) => string;
}

/**
 * The page's structured data (architecture §1.6, positioning §6.3), from the
 * shared builders, so `#app` and `#ios-app` say the same thing on every page
 * that emits them: a `WebPage` about the Mac app, the Mac app, and the iPhone
 * and iPad app while it is released.
 *
 * `softwareVersion` appears only when a release source answered, never from a
 * guess. There is no `offers` on the Mac app (this page shows no price), no
 * rating, no file size, and no `BreadcrumbList`, because the page shows no
 * breadcrumbs.
 */
function downloadJsonLd({ baseUrl, inLanguage, m, fmt, path, content, release, mac, ios, links, featuredEngines }: JsonLdInput): JsonLdGraph {
    const context = { baseUrl, inLanguage };
    const pageUrl = absoluteUrl(baseUrl, path('/download'));
    const deviceNames = [...mac.deviceNames, ...(ios?.deviceNames ?? [])];
    const live = release.source !== 'unavailable' && release.version !== null;
    const architectures = joinList(
        (Object.keys(release.assets) as MacArch[]).map((arch) => m.platforms.architectures[arch]),
        { separator: ', ', last: m.platforms.architectures.joiner },
    );

    return graph([
        webPageNode(context, {
            url: pageUrl,
            name: content.seo.title,
            description: content.seo.description,
            about: macAppId(baseUrl),
        }),
        mac.requirements !== null &&
            links.license !== null &&
            macAppNode(context, {
                description: fmt(m.seo.product.long, {
                    // The template ends "… and more", so the names take commas only.
                    featuredEngines: featuredEngines.join(', '),
                    deviceList: joinList(deviceNames, m.common.list),
                }),
                alternateName: m.seo.macApp.alternateName,
                subCategory: m.seo.macApp.subCategory,
                operatingSystem: mac.requirements.systems.join(', '),
                requirements: `${requirementLine(mac.requirements, m.platforms)}, ${architectures}`,
                licenseUrl: links.license,
                version: live ? release.version : null,
                downloadUrl: pageUrl,
            }),
        ios !== null &&
            ios.appStoreUrl !== null &&
            links.license !== null &&
            iosAppNode(context, {
                alternateName: m.seo.iosApp.alternateName,
                operatingSystem: ios.requirements.systems.join(', '),
                requirements: requirementLine(ios.requirements, m.platforms),
                installUrl: ios.appStoreUrl,
                licenseUrl: links.license,
                currency: PRICING.currency,
            }),
    ]);
}

/**
 * `/download` and `/vi/download` (sitemap §A.1, design-system §8.7).
 *
 * The server renders everything a reader needs: both Mac builds with their
 * real DMG URLs, the Homebrew command and the App Store card. After mount the
 * page reads the device only to adjust emphasis (resources/js/lib/device.ts):
 * on an iPhone or iPad the App Store card comes first and neither Mac build is
 * highlighted; on a Mac whose Chromium browser reports its architecture, that
 * build's button becomes primary. Nothing starts a download on its own, and no
 * copy says a download started.
 *
 * If no release source has ever answered, both buttons open GitHub's latest
 * release, no version is shown, and the Mac card says why.
 */
export default function Download({ content, release, mac, ios, unreleased, links, featuredEngines }: DownloadPageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    const [device, setDevice] = useState<DeviceKind | null>(null);
    const [hint, setHint] = useState<MacArch | null>(null);

    useEffect(() => {
        let cancelled = false;
        const kind = classifyDevice(navigator.userAgent, navigator.maxTouchPoints ?? 0);

        setDevice(kind);

        if (kind === 'mac') {
            void archHint(navigator.userAgentData).then((arch) => {
                if (!cancelled) {
                    setHint(arch);
                }
            });
        }

        return () => {
            cancelled = true;
        };
    }, []);

    const available = release.source !== 'unavailable' && release.version !== null;
    const iosFirst = ios !== null && device !== null && appStoreFirst(device);

    const unreleasedNames = unreleased
        .filter((id): id is PlatformName => Object.hasOwn(m.platforms.names, id))
        .map((id) => m.platforms.names[id]);

    const macCard = (
        <MacCard content={content} release={release} mac={mac} links={links} device={device} hint={hint} className="lg:col-span-7" />
    );
    const iosCard = ios !== null ? <IosCard content={content} ios={ios} className="lg:col-span-5" /> : null;

    return (
        <LandingLayout>
            <SEOHead
                title={content.seo.title}
                titleTemplate={false}
                description={content.seo.description}
                jsonLd={downloadJsonLd({
                    baseUrl: canonicalBaseUrl,
                    inLanguage: LOCALES.supported[locale].hreflang,
                    m,
                    fmt,
                    path,
                    content,
                    release,
                    mac,
                    ios,
                    links,
                    featuredEngines,
                })}
            />

            {/* The shared header, so the lead is muted and 56 characters wide like every other page's. */}
            <PageHeader
                title={content.header.title}
                lead={content.header.lead}
                meta={
                    available ? (
                        <DotList
                            items={[
                                <span key="version" className="tabular-nums">
                                    {release.publishedAtFormatted !== null
                                        ? fmt(m.download.release.dated, { version: release.version ?? '', date: keepTogether(release.publishedAtFormatted) })
                                        : fmt(m.download.release.undated, { version: release.version ?? '' })}
                                </span>,
                                <TextLink key="notes" href={release.releaseUrl} kind="standalone" external hrefLang="en">
                                    {m.download.release.notes}
                                </TextLink>,
                            ]}
                        />
                    ) : undefined
                }
            />

            <Container className="pb-16 md:pb-20 xl:pb-24">
                <div className="grid items-start gap-6 lg:grid-cols-12">
                    {iosFirst ? (
                        <>
                            {iosCard}
                            {macCard}
                        </>
                    ) : (
                        <>
                            {macCard}
                            {iosCard}
                        </>
                    )}
                </div>

                <div className="mt-16 max-w-[44rem] space-y-12 md:mt-20">
                    <PageSection id="install" title={content.install.title}>
                        <ol className="type-body list-decimal space-y-3 pl-6 text-foreground marker:text-muted-foreground">
                            {content.install.steps.map((step, index) => (
                                <li key={index} className="pl-1">
                                    <Trans text={step} tags={UI_TAGS} />
                                </li>
                            ))}
                        </ol>
                        <p className="type-body text-foreground">{content.install.signing}</p>
                        <p className="type-body text-foreground">{content.install.drivers}</p>
                        <ul className="flex flex-wrap gap-x-6 gap-y-2">
                            <li>
                                <LocaleLink href="/databases" className={textLinkClasses('standalone')}>
                                    {content.install.databases}
                                    <span aria-hidden="true">→</span>
                                </LocaleLink>
                            </li>
                            {links.docs !== null && (
                                <li>
                                    <TextLink
                                        href={links.docs.replace(/\/+$/, '') + content.install.guide.path}
                                        kind="standalone"
                                        external
                                        hrefLang="en"
                                    >
                                        {content.install.guide.label}
                                    </TextLink>
                                </li>
                            )}
                        </ul>
                    </PageSection>

                    <PageSection id="updates" title={content.updates.title}>
                        {content.updates.paragraphs.map((paragraph, index) => (
                            <p key={index} className="type-body text-foreground">
                                <Trans text={paragraph} tags={UI_TAGS} />
                            </p>
                        ))}
                    </PageSection>

                    {unreleasedNames.length > 0 && (
                        <PageSection id="other-platforms" title={content.otherPlatforms.title}>
                            <p className="type-body text-foreground">
                                {fmt(content.otherPlatforms.body, { platforms: joinList(unreleasedNames, m.download.otherPlatforms.joiner) })}
                            </p>
                            <p>
                                <LocaleLink href="/faq#platforms" className={textLinkClasses('standalone')}>
                                    {content.otherPlatforms.faq}
                                    <span aria-hidden="true">→</span>
                                </LocaleLink>
                            </p>
                        </PageSection>
                    )}

                    <PageSection id="older-versions" title={content.olderVersions.title}>
                        <p className="type-body text-foreground">{content.olderVersions.body}</p>
                        <ul className="flex flex-wrap gap-x-6 gap-y-2">
                            <li>
                                <TextLink href={release.releasesUrl} kind="standalone" external>
                                    {content.olderVersions.releases}
                                </TextLink>
                            </li>
                            {links.changelog !== null && (
                                <li>
                                    <TextLink href={links.changelog} kind="standalone" external hrefLang="en">
                                        {content.olderVersions.changelog}
                                    </TextLink>
                                </li>
                            )}
                        </ul>
                    </PageSection>
                </div>
            </Container>
        </LandingLayout>
    );
}
