import { useEffect, useState, type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import LatestPost from '@/components/blog/latest-post';
import { requirementLine } from '@/components/download/format';
import IosCard from '@/components/download/ios-card';
import LinuxCard from '@/components/download/linux-card';
import LinuxInstall from '@/components/download/linux-install';
import { distributionFloor } from '@/components/download/linux-text';
import MacCard, { UI_TAGS } from '@/components/download/mac-card';
import PlatformParity, { type ParityPlatform } from '@/components/download/platform-parity';
import type { DownloadPageProps, LinuxProp } from '@/components/download/types';
import SEOHead from '@/components/seo/seo-head';
import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import Badge from '@/components/ui/badge';
import CellGrid from '@/components/ui/cell-grid';
import Container from '@/components/ui/container';
import FaqList, { type FaqListItem } from '@/components/ui/faq-list';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, Trans, useI18n, type Messages } from '@/i18n';
import { joinList, keepTogether } from '@/i18n/format';
import { classifyDevice, type DeviceKind } from '@/lib/device';
import { architecturesText } from '@/lib/data/platforms';
import { PRICING } from '@/lib/data/pricing';
import { absoluteUrl, graph, iosAppNode, linuxAppNode, macAppId, macAppNode, webPageNode, type JsonLdGraph } from '@/lib/structured-data';
import { cn } from '@/lib/utils';
import LandingLayout from '@/layouts/landing-layout';

type PlatformName = keyof Messages['platforms']['names'];

interface JsonLdInput extends Pick<DownloadPageProps, 'content' | 'release' | 'mac' | 'ios' | 'linux' | 'links' | 'featuredEngines'> {
    baseUrl: string;
    inLanguage: string;
    m: Messages;
    fmt: (template: string, values: Record<string, string>) => string;
    path: (path: string) => string;
}

function linuxRequirements(linux: LinuxProp, m: Messages): string {
    return `${linux.distributions.map((distribution) => distributionFloor(distribution, m.download.linux)).join(', ')}; ${linux.architectures.join(', ')}`;
}

// `softwareVersion` only from a release source that answered. No `offers` on the Mac app (this page shows no price),
// no file size, and no BreadcrumbList, because the page shows no breadcrumbs.
function downloadJsonLd({ baseUrl, inLanguage, m, fmt, path, content, release, mac, ios, linux, links, featuredEngines }: JsonLdInput): JsonLdGraph {
    const context = { baseUrl, inLanguage };
    const pageUrl = absoluteUrl(baseUrl, path('/download'));
    const deviceNames = [...mac.deviceNames, ...(ios?.deviceNames ?? []), ...(linux?.deviceNames ?? [])];
    const live = release.source !== 'unavailable' && release.version !== null;

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
                requirements: `${requirementLine(mac.requirements, m.platforms)}, ${architecturesText(m.platforms)}`,
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
        linux !== null &&
            links.license !== null &&
            linuxAppNode(context, {
                alternateName: m.seo.linuxApp.alternateName,
                operatingSystem: linux.deviceNames[0] ?? 'Linux',
                requirements: linuxRequirements(linux, m),
                installUrl: `${pageUrl}#linux`,
                licenseUrl: links.license,
                currency: PRICING.currency,
                version: linux.release?.version ?? null,
            }),
    ]);
}

// The server renders every platform the same way for every reader. After mount the page reads the device only to mark
// the reader's own platform and give its action the filled button; nothing starts a download on its own.
export default function Download({ content, release, mac, ios, linux, unreleased, links, engines, parity, featuredEngines, latestPost }: DownloadPageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path, plural } = useI18n();
    const shown = useShownSlot();
    const [device, setDevice] = useState<DeviceKind | null>(null);

    useEffect(() => {
        setDevice(classifyDevice(navigator.userAgent, navigator.maxTouchPoints ?? 0));
    }, []);

    const marked: ParityPlatform | null = device === 'mac' ? 'mac' : device === 'ios' && ios !== null ? 'ios' : device === 'linux' && linux !== null ? 'linux' : null;
    const primary: ParityPlatform = marked ?? 'mac';

    const names: Record<ParityPlatform, string> = {
        mac: mac.deviceNames[0] ?? 'Mac',
        ios: joinList(ios?.deviceNames ?? [], m.common.shortList),
        linux: linux?.deviceNames[0] ?? 'Linux',
    };
    const platforms: ParityPlatform[] = ['mac', ...(ios !== null ? (['ios'] as const) : []), ...(linux !== null ? (['linux'] as const) : [])];
    const columns = platforms.map((key) => ({ key, name: names[key] }));
    const grid = platforms.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2';

    const version = (value: string | null, date: string | null): string | null => {
        if (value === null) {
            return null;
        }

        return date !== null ? fmt(m.download.release.dated, { version: value, date: keepTogether(date) }) : fmt(m.download.release.undated, { version: value });
    };

    const unreleasedNames = unreleased.filter((id): id is PlatformName => Object.hasOwn(m.platforms.names, id)).map((id) => m.platforms.names[id]);
    const verifyMac = release.asset.sha256 !== null;
    const verifyLinux = linux !== null && linux.verify !== null && linux.packages.length > 0;

    const faq: FaqListItem[] = [
        ...(linux !== null
            ? [
                  { id: 'linux-free', question: m.download.faq.free.question, answer: m.download.faq.free.answer },
                  { id: 'linux-license', question: m.download.faq.license.question, answer: plural(m.download.faq.license.answer, PRICING.license.deviceLimit) },
              ]
            : []),
        ...(unreleasedNames.length > 0
            ? [
                  {
                      id: 'other-platforms',
                      question: fmt(m.download.faq.other.question, { platforms: joinList(unreleasedNames, m.download.orList) }),
                      answer: fmt(content.otherPlatforms.body, { platforms: joinList(unreleasedNames, m.download.orList) }),
                  },
              ]
            : []),
        ...(verifyMac || verifyLinux
            ? [
                  {
                      id: 'verify',
                      question: m.download.faq.verify.question,
                      answer: (
                          <p>
                              {verifyMac && <Trans text={m.download.faq.verify.mac} tags={UI_TAGS} />}
                              {verifyMac && verifyLinux && ' '}
                              {verifyLinux && <Trans text={m.download.faq.verify.linux} tags={UI_TAGS} />}
                          </p>
                      ),
                  },
              ]
            : []),
    ];

    const cell = (platform: ParityPlatform, children: ReactNode) => (
        <div key={platform}>
            <h3 className="type-label text-foreground">{names[platform]}</h3>
            {children}
        </div>
    );

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
                    linux,
                    links,
                    featuredEngines,
                })}
            />

            <PageHeader title={content.header.title} lead={content.header.lead} />

            <div>
                <Container>
                    {/* On a phone the reader's platform comes first: an iPhone's before first paint, from the root template's class. */}
                    <CellGrid className={cn('items-stretch', platforms.length > 2 ? 'lg:grid-cols-3' : 'lg:grid-cols-2')}>
                        <MacCard content={content} release={release} mac={mac} marked={marked === 'mac'} primary={primary === 'mac'} />
                        {ios !== null && <IosCard content={content} ios={ios} marked={marked === 'ios'} className="max-md:in-[.ios]:order-first" />}
                        {linux !== null && (
                            <LinuxCard linux={linux} marked={marked === 'linux'} primary={primary === 'linux'} className={cn(marked === 'linux' && 'max-md:order-first')} />
                        )}
                    </CellGrid>
                </Container>
            </div>

            {linux !== null && (
                <Section
                    id="linux"
                    title={
                        <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
                            {m.download.linux.title}
                            {linux.channel === 'beta' && <Badge>{m.download.card.beta}</Badge>}
                        </span>
                    }
                    lead={
                        <Trans
                            text={m.download.linux.beta}
                            tags={{ link: (text) => (links.issues !== null ? <TextLink href={links.issues}>{text}</TextLink> : text) }}
                        />
                    }
                >
                    <LinuxInstall linux={linux} />
                    {shown('linux-main-window') && (
                        <div className="mt-12 md:mt-16">
                            <AssetSlot id="linux-main-window" />
                        </div>
                    )}
                </Section>
            )}

            <Section id="platforms" title={m.download.platforms.title} lead={m.download.platforms.lead}>
                <CellGrid density="compact" className={grid}>
                    {platforms.map((platform) =>
                        cell(
                            platform,
                            <>
                                <p className="type-h3 mt-1 text-foreground tabular-nums">
                                    {plural(m.download.platforms.databases, platform === 'linux' ? engines.linux.length : engines[platform])}
                                </p>
                                {platform === 'linux' && <p className="type-small mt-2 text-muted-foreground">{joinList(engines.linux, m.common.list)}</p>}
                            </>,
                        ),
                    )}
                </CellGrid>
                <p className="mt-6">
                    <LocaleLink href="/databases" className={textLinkClasses('standalone')}>
                        {content.platforms.databases}
                        <span aria-hidden="true">→</span>
                    </LocaleLink>
                </p>
                <div className="mt-10">
                    <PlatformParity parity={parity} columns={columns} />
                </div>
            </Section>

            <Section id="updates" title={content.updates.title} flush>
                <CellGrid density="compact" className={grid}>
                    {cell('mac', <p className="type-small mt-2 text-foreground">{content.updates.mac}</p>)}
                    {ios !== null && cell('ios', <p className="type-small mt-2 text-foreground">{m.download.updates.ios}</p>)}
                    {linux !== null && cell('linux', <p className="type-small mt-2 text-foreground">{m.download.updates.linux}</p>)}
                </CellGrid>
            </Section>

            <Section id="older-versions" title={content.olderVersions.title} flush>
                <CellGrid density="compact" className={grid}>
                    {cell(
                        'mac',
                        <>
                            <p className="type-small mt-1 text-muted-foreground tabular-nums">{version(release.version, release.publishedAtFormatted)}</p>
                            <ul className="type-small mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                                {release.source !== 'unavailable' && (
                                    <li>
                                        <TextLink href={release.releaseUrl} kind="standalone" external hrefLang="en">
                                            {m.download.release.notes}
                                        </TextLink>
                                    </li>
                                )}
                                {links.changelog !== null && (
                                    <li>
                                        <TextLink href={links.changelog} kind="standalone" external hrefLang="en">
                                            {content.olderVersions.changelog}
                                        </TextLink>
                                    </li>
                                )}
                                <li>
                                    <TextLink href={release.releasesUrl} kind="standalone" external>
                                        {content.olderVersions.releases}
                                    </TextLink>
                                </li>
                                {links.source !== null && (
                                    <li>
                                        <TextLink href={links.source} kind="standalone" external>
                                            {content.mac.source}
                                        </TextLink>
                                    </li>
                                )}
                            </ul>
                            {latestPost !== null && (
                                <p className="type-small mt-3 text-foreground">
                                    <LatestPost post={latestPost} />
                                </p>
                            )}
                        </>,
                    )}
                    {ios !== null &&
                        cell(
                            'ios',
                            <>
                                <p className="type-small mt-1 text-muted-foreground tabular-nums">{version(ios.version, ios.publishedAtFormatted)}</p>
                                <p className="type-small mt-3">
                                    <LocaleLink href="/ios" className={textLinkClasses('standalone')}>
                                        {fmt(content.ios.link, { devices: names.ios })}
                                        <span aria-hidden="true">→</span>
                                    </LocaleLink>
                                </p>
                            </>,
                        )}
                    {linux !== null &&
                        cell(
                            'linux',
                            <>
                                <p className="type-small mt-1 text-muted-foreground tabular-nums">{version(linux.release?.version ?? null, linux.release?.publishedOn ?? null)}</p>
                                {linux.release !== null && (
                                    <ul className="type-small mt-3 grid gap-1.5">
                                        <li>
                                            <TextLink href={linux.release.releaseUrl} kind="standalone" external hrefLang="en">
                                                {m.download.release.notes}
                                            </TextLink>
                                        </li>
                                        <li>
                                            <TextLink href={linux.release.releasesUrl} kind="standalone" external>
                                                {content.olderVersions.releases}
                                            </TextLink>
                                        </li>
                                    </ul>
                                )}
                            </>,
                        )}
                </CellGrid>
            </Section>

            {faq.length > 0 && (
                <Section id="faq" title={m.download.faq.title}>
                    <FaqList collapsible className="frame-rows" items={faq} />
                    <p className="mt-8">
                        <LocaleLink href="/faq#platforms" className={textLinkClasses('standalone')}>
                            {content.otherPlatforms.faq}
                            <span aria-hidden="true">→</span>
                        </LocaleLink>
                    </p>
                </Section>
            )}
        </LandingLayout>
    );
}
