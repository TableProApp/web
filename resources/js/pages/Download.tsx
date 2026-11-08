import { usePage } from '@inertiajs/react';
import { BAND_NOTES, BAND_TEXT } from '@/components/databases/engine-band';
import CommandBlock from '@/components/download/command-block';
import DownloadHero, { IosAction } from '@/components/download/download-hero';
import { requirementLine } from '@/components/download/format';
import { distributionFloor } from '@/components/download/linux-text';
import MacDownload from '@/components/download/mac-download';
import QrCode from '@/components/download/qr-code';
import type { DownloadPageProps, LinuxMethod, LinuxProp } from '@/components/download/types';
import { BandFrame } from '@/components/features/feature-band';
import { AlsoAnchors } from '@/components/features/feature-part';
import SEOHead from '@/components/seo/seo-head';
import Badge from '@/components/ui/badge';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { LOCALES, useI18n, type Messages } from '@/i18n';
import { joinList } from '@/i18n/format';
import { trackDownload } from '@/lib/analytics';
import { architecturesText } from '@/lib/data/platforms';
import { PRICING } from '@/lib/data/pricing';
import { absoluteUrl, graph, iosAppNode, linuxAppNode, macAppId, macAppNode, webPageNode, type JsonLdGraph } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

type PlatformName = keyof Messages['platforms']['names'];

const METHOD_TITLE = 'text-[0.9375rem] leading-[1.35] font-semibold tracking-[-0.009em] text-foreground';

const SMALL_TITLE = 'text-sm leading-[1.3] font-medium tracking-[-0.006em] text-muted-foreground md:col-span-4 lg:col-span-3';

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

// `/download` in every locale (sitemap §A.1, §E.5; design-system §8.7): the release and the one action for the reader's
// machine, then a band per platform with everything shown, Windows in one line, and the older releases. Every download is
// a server-rendered link; nothing starts on its own.
export default function Download({ content, release, mac, ios, linux, unreleased, links, featuredEngines }: DownloadPageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    useRevealOnScroll('main > section:not(#top)');

    const store = ios !== null ? ios.appStoreUrl : null;
    const unreleasedNames = unreleased.filter((id): id is PlatformName => Object.hasOwn(m.platforms.names, id)).map((id) => m.platforms.names[id]);

    const methodTitle = (method: LinuxMethod, distributions: LinuxProp['distributions']): string => {
        const distribution = distributions.find((each) => each.via === method.kind && each.name !== null);

        return distribution !== undefined && distribution.name !== null
            ? fmt(content.linux.distribution, { name: distribution.name, versions: joinList(distribution.versions, m.common.list) })
            : content.linux.flatpak;
    };

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

            <DownloadHero content={content} release={release} mac={mac} linux={linux} ios={ios} />

            {/* Security's "Download and updates" lands here; each band says how its platform updates. */}
            <BandFrame id="mac" also={['updates']} title={mac.deviceNames[0] ?? 'Mac'}>
                {mac.requirements !== null && (
                    <p className={BAND_TEXT}>
                        {fmt(content.mac.text, { requirement: requirementLine(mac.requirements, m.platforms), architectures: architecturesText(m.platforms) })}
                    </p>
                )}
                <div className="mt-6">
                    <MacDownload content={content} release={release} variant="secondary" location="download-page-dmg" />
                </div>
                {mac.homebrewCommand !== null && (
                    <div className="mt-10">
                        <h3 className={METHOD_TITLE}>{content.mac.homebrew}</h3>
                        <CommandBlock
                            className="mt-3"
                            lines={[mac.homebrewCommand]}
                            title={m.download.homebrew.terminal}
                            label={m.download.homebrew.label}
                            onCopied={() => trackDownload('download-page-homebrew', 'mac')}
                        />
                    </div>
                )}
            </BandFrame>

            {linux !== null && (
                <BandFrame
                    id="linux"
                    title={linux.deviceNames[0] ?? 'Linux'}
                    marker={
                        linux.channel === 'beta' && (
                            <Badge variant="outline" className="mt-3">
                                {m.download.panel.beta}
                            </Badge>
                        )
                    }
                >
                    <p className={BAND_TEXT}>{fmt(content.linux.architectures, { architectures: joinList(linux.architectures, m.common.list) })}</p>
                    <div className="mt-8 space-y-8">
                        {linux.methods.map((method) => {
                            const title = methodTitle(method, linux.distributions);

                            return (
                                <div key={method.kind}>
                                    <h3 className={METHOD_TITLE}>{title}</h3>
                                    <CommandBlock
                                        className="mt-3"
                                        lines={method.commands}
                                        title={m.download.homebrew.terminal}
                                        label={fmt(m.download.linux.commands, { method: title })}
                                        onCopied={() => trackDownload(`download-page-${method.kind}`, 'linux')}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <p className="mt-8">
                        <TextLink
                            href={linux.release?.releaseUrl ?? release.releasesUrl}
                            kind="standalone"
                            external
                            hrefLang="en"
                            onClick={() => trackDownload('download-page-files', 'linux')}
                        >
                            {content.linux.packages}
                        </TextLink>
                    </p>
                </BandFrame>
            )}

            {ios !== null && (
                <BandFrame id="ios" title={joinList(ios.deviceNames, m.common.shortList)}>
                    <div className="flex flex-wrap items-start gap-x-16 gap-y-6">
                        <div className="grid justify-items-start gap-6">
                            {store !== null ? (
                                <IosAction content={content} ios={ios} store={store} location="download-page-app-store" />
                            ) : (
                                <p className="type-small text-muted-foreground">{fmt(content.hero.requires, { requirement: requirementLine(ios.requirements, m.platforms) })}</p>
                            )}
                            <LocaleLink href="/ios" className={textLinkClasses('standalone')}>
                                {fmt(content.ios.link, { devices: joinList(ios.deviceNames, m.common.shortList) })}
                                <span aria-hidden="true">→</span>
                            </LocaleLink>
                        </div>
                        {/* For a desktop reader with a phone at hand; never on the phone itself. */}
                        {store !== null && (
                            <div data-device="mac linux other" className="hidden sm:block">
                                <QrCode value={store} className="size-28" />
                            </div>
                        )}
                    </div>
                </BandFrame>
            )}

            {unreleasedNames.length > 0 && (
                <section id="other-platforms" aria-labelledby="other-platforms-title" className="py-10 md:py-12">
                    <Container>
                        <div className="md:grid md:grid-cols-12 md:gap-x-8">
                            <h2 id="other-platforms-title" className={`max-w-[42rem] md:col-span-8 md:col-start-5 lg:col-span-9 lg:col-start-4 ${BAND_TEXT}`}>
                                {unreleasedNames.map((platform) => fmt(content.otherPlatforms.body, { platform })).join(' ')}
                            </h2>
                        </div>
                    </Container>
                </section>
            )}

            <section id="older-versions" aria-labelledby="older-versions-title" className="py-12 md:py-16">
                <AlsoAnchors part={{ id: 'older-versions', also: ['release-notes'] }} />
                <Container>
                    <div className="grid gap-5 md:grid-cols-12 md:gap-x-8">
                        <h2 id="older-versions-title" className={SMALL_TITLE}>
                            {content.more.title}
                        </h2>
                        <ul className={`space-y-3 md:col-span-8 lg:col-span-9 ${BAND_NOTES}`}>
                            <li>
                                <TextLink href={release.releasesUrl} kind="standalone" external>
                                    {content.more.releases}
                                </TextLink>
                            </li>
                            {links.source !== null && (
                                <li>
                                    <TextLink href={links.source} kind="standalone" external>
                                        {content.more.source}
                                    </TextLink>
                                </li>
                            )}
                            {links.changelog !== null && (
                                <li>
                                    <TextLink href={links.changelog} kind="standalone" external hrefLang="en">
                                        {locale === 'en' ? content.more.changelog : `${content.more.changelog} ${m.common.englishOnly}`}
                                    </TextLink>
                                </li>
                            )}
                        </ul>
                    </div>
                </Container>
            </section>
        </LandingLayout>
    );
}
