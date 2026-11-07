import { usePage } from '@inertiajs/react';
import { Laptop, SquareTerminal, TabletSmartphone } from 'lucide-react';
import { requirementLine } from '@/components/download/format';
import IosPanel from '@/components/download/ios-panel';
import LinuxPanel from '@/components/download/linux-panel';
import { distributionFloor } from '@/components/download/linux-text';
import MacPanel from '@/components/download/mac-panel';
import PlatformSwitch, { type PlatformTab } from '@/components/download/platform-switch';
import type { DownloadPageProps, LinuxProp } from '@/components/download/types';
import SEOHead from '@/components/seo/seo-head';
import Badge from '@/components/ui/badge';
import CellGrid from '@/components/ui/cell-grid';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, useI18n, type Messages } from '@/i18n';
import { joinList } from '@/i18n/format';
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
    const deviceNames = [...mac.deviceNames, ...(linux?.deviceNames ?? []), ...(ios?.deviceNames ?? [])];
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

// The visitor's platform opens first, decided in the browser (PlatformSwitch); the server renders the Mac panel and
// every panel's links, so nothing depends on JavaScript to download.
export default function Download({ content, release, mac, ios, linux, unreleased, links, featuredEngines }: DownloadPageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();

    const names = {
        mac: mac.deviceNames[0] ?? 'Mac',
        linux: linux?.deviceNames[0] ?? 'Linux',
        ios: joinList(ios?.deviceNames ?? [], m.common.shortList),
    };

    const tabs: PlatformTab[] = [
        { key: 'mac', name: names.mac, label: names.mac, icon: <Laptop aria-hidden="true" className="size-6" />, panel: <MacPanel content={content} release={release} mac={mac} /> },
        ...(linux !== null
            ? [
                  {
                      key: 'linux' as const,
                      name: names.linux,
                      label: (
                          <span className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
                              {names.linux}
                              {linux.channel === 'beta' && <Badge variant="outline">{m.download.panel.beta}</Badge>}
                          </span>
                      ),
                      icon: <SquareTerminal aria-hidden="true" className="size-6" />,
                      panel: <LinuxPanel linux={linux} issues={links.issues} />,
                  },
              ]
            : []),
        ...(ios !== null
            ? [{ key: 'ios' as const, name: names.ios, label: names.ios, icon: <TabletSmartphone aria-hidden="true" className="size-6" />, panel: <IosPanel content={content} ios={ios} /> }]
            : []),
    ];

    const unreleasedNames = unreleased.filter((id): id is PlatformName => Object.hasOwn(m.platforms.names, id)).map((id) => m.platforms.names[id]);
    const others = joinList(unreleasedNames, m.download.orList);

    const notes = [
        release.source !== 'unavailable' && { href: release.releaseUrl, label: names.mac },
        linux !== null && linux.release !== null && { href: linux.release.releaseUrl, label: names.linux },
        links.changelog !== null && { href: links.changelog, label: content.olderVersions.changelog },
    ].filter((link): link is { href: string; label: string } => link !== false);

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

            <div className="pt-10 pb-16 md:pt-14 md:pb-20 xl:pt-16 xl:pb-24">
                <Container>
                    <div className="mx-auto max-w-[40rem]">
                        <header className="grid justify-items-center text-center">
                            <img
                                src="/images/brand/tablepro-icon-128.png"
                                srcSet="/images/brand/tablepro-icon-128.png 1x, /images/brand/tablepro-icon-256.png 2x"
                                alt=""
                                width={72}
                                height={72}
                                className="size-18"
                            />
                            <h1 className="type-h1 mt-5 text-foreground">{content.header.title}</h1>
                        </header>

                        {/* Security links "Download and updates" here; each panel says how its platform updates. */}
                        <span id="updates" className="block" />
                        <div className="mt-10">
                            <PlatformSwitch legend={m.download.panel.legend} tabs={tabs} />
                        </div>
                    </div>
                </Container>
            </div>

            <div>
                <Container>
                    <CellGrid density="compact" className={cn('md:grid-cols-2', unreleasedNames.length > 0 && 'lg:grid-cols-3')}>
                        {notes.length > 0 && (
                            <section id="release-notes" aria-labelledby="release-notes-title">
                                <h2 id="release-notes-title" className="type-label text-foreground">
                                    {m.download.release.notes}
                                </h2>
                                <ul className="type-small mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                                    {notes.map((link) => (
                                        <li key={link.href}>
                                            <TextLink href={link.href} kind="standalone" external hrefLang="en">
                                                {link.label}
                                            </TextLink>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <section id="older-versions" aria-labelledby="older-versions-title">
                            <h2 id="older-versions-title" className="type-label text-foreground">
                                {content.olderVersions.title}
                            </h2>
                            <ul className="type-small mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
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
                        </section>

                        {unreleasedNames.length > 0 && (
                            <section id="other-platforms" aria-labelledby="other-platforms-title">
                                <h2 id="other-platforms-title" className="type-label text-foreground">
                                    {fmt(m.download.otherPlatforms.question, { platforms: others })}
                                </h2>
                                <p className="type-small mt-3 text-foreground">{fmt(content.otherPlatforms.body, { platforms: others })}</p>
                                <p className="type-small mt-2">
                                    <LocaleLink href="/faq#platforms" className={textLinkClasses('standalone')}>
                                        {content.otherPlatforms.faq}
                                        <span aria-hidden="true">→</span>
                                    </LocaleLink>
                                </p>
                            </section>
                        )}
                    </CellGrid>
                </Container>
            </div>
        </LandingLayout>
    );
}
