import type { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { BandFrame } from '@/components/features/feature-band';
import { ClosingFrame } from '@/components/features/feature-closing';
import FeatureHero from '@/components/features/feature-hero';
import InstallAction from '@/components/integrations/install-action';
import { relFor, reportUrl } from '@/components/integrations/model';
import type { AppPlatform, IntegrationPageProps } from '@/components/integrations/types';
import SEOHead from '@/components/seo/seo-head';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import Callout from '@/components/ui/callout';
import DatabaseMark from '@/components/ui/database-mark';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import LocaleLink from '@/components/ui/locale-link';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { LOCALES, Trans, useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import LandingLayout from '@/layouts/landing-layout';
import { docsUrl, FACTS } from '@/lib/data/facts';
import { iosPlatform, linuxPlatform, macPlatform } from '@/lib/data/platforms';
import { absoluteUrl, breadcrumbNode, graph, iosAppId, linuxAppId, macAppId, webPageNode } from '@/lib/structured-data';

const LINK =
    'inline-flex items-center gap-1 text-[0.9375rem] font-medium tracking-[-0.009em] text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground';

const DEVICES: Record<AppPlatform, () => { deviceNames: string[] }> = { mac: macPlatform, linux: linuxPlatform, ios: iosPlatform };

// The hero says what it is and how to get it; the rest is two sets of term rows and the way to report a problem. The
// old #about lands on #details.
export default function IntegrationShow({ content, integration, dates }: IntegrationPageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    useRevealOnScroll('main > section:not(#top)');

    const { labels, show } = content;
    const uses = show.uses;
    const rel = relFor(integration.tier);
    const list = (items: string[]) => joinList(items, m.common.list);
    const appName = (platform: AppPlatform) => joinList(DEVICES[platform]().deviceNames, m.common.shortList);

    const external = (href: string, label: ReactNode, className = LINK) => (
        <a href={href} rel={rel} className={className}>
            {label}
            <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground" />
        </a>
    );

    const title = fmt(show.seoTitle, { name: integration.name });
    const pageUrl = absoluteUrl(canonicalBaseUrl, path(`/integrations/${integration.slug}`));
    const pageContext = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };
    const crumbs = [
        { name: m.seo.breadcrumbs.integrations, path: path('/integrations') },
        { name: integration.name, path: path(`/integrations/${integration.slug}`) },
    ];
    const only = integration.platforms.length === 1 ? integration.platforms[0] : null;
    const about = only === 'ios' ? iosAppId(canonicalBaseUrl) : only === 'linux' ? linuxAppId(canonicalBaseUrl) : macAppId(canonicalBaseUrl);

    const archived = integration.archived;
    const reason = archived?.reason ?? null;
    const host = integration.host;
    const hostText = host === null ? null : host.minVersion !== null ? fmt(show.details.hostVersion, { host: host.name, version: host.minVersion }) : host.name;
    const payment = integration.payment === 'optional' || integration.payment === 'paid' ? integration.payment : null;

    return (
        <LandingLayout>
            <SEOHead
                title={title}
                description={integration.summary}
                jsonLd={graph([
                    webPageNode(pageContext, { url: pageUrl, name: title, description: integration.summary, about, breadcrumb: `${pageUrl}#breadcrumb` }),
                    breadcrumbNode(pageContext, pageUrl, crumbs),
                ])}
            />

            <FeatureHero
                eyebrow={
                    <div className="mb-8 md:mb-10">
                        <Breadcrumbs items={[{ label: m.seo.breadcrumbs.integrations, href: '/integrations' }, { label: integration.name }]} />
                        <DatabaseMark icon={integration.icon?.src} name={integration.name} size={40} tile={false} className="mt-6 md:mt-8" />
                    </div>
                }
                title={integration.name}
                lead={integration.summary}
                more={
                    <>
                        {integration.description.length > 0 && (
                            <div className="mt-4 max-w-[34rem] space-y-3 text-base leading-[1.55] text-pretty text-muted-foreground">
                                {integration.description.map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        )}
                        {archived !== null && (
                            <Callout tone="warning" title={show.archived.badge} className="mt-6 max-w-[40rem]">
                                <p>
                                    {dates.archived !== null && `${fmt(show.archived.since, { date: dates.archived })} `}
                                    {reason !== null && (
                                        <Trans
                                            text={show.archived.reasons[reason]}
                                            values={{ name: archived.replacement?.name ?? '' }}
                                            tags={{
                                                link: (text) =>
                                                    archived.replacement !== null ? (
                                                        <LocaleLink href={`/integrations/${archived.replacement.slug}`} className={textLinkClasses('inline')}>
                                                            {text}
                                                        </LocaleLink>
                                                    ) : (
                                                        text
                                                    ),
                                            }}
                                        />
                                    )}
                                </p>
                                {archived.note !== null && <p>{archived.note}</p>}
                            </Callout>
                        )}
                    </>
                }
                actions={
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                        <InstallAction integration={integration} labels={show} />
                        {integration.source !== null && external(integration.source, show.source)}
                    </div>
                }
            />

            <BandFrame id="details" also={['about']} title={show.details.title}>
                <DescriptionList>
                    <DescriptionItem term={show.details.publisher} size="body">
                        {integration.publisher.url !== null ? (
                            <TextLink href={integration.publisher.url} external rel={rel}>
                                {integration.publisher.name}
                            </TextLink>
                        ) : (
                            integration.publisher.name
                        )}
                    </DescriptionItem>
                    <DescriptionItem term={show.details.tier} size="body">
                        {labels.tiers[integration.tier]}
                    </DescriptionItem>
                    {integration.categories.length > 0 && (
                        <DescriptionItem term={show.details.category} size="body">
                            {list(integration.categories.map((category) => labels.categories[category]))}
                        </DescriptionItem>
                    )}
                    {host !== null && (
                        <DescriptionItem term={show.details.host} size="body">
                            {host.url !== null ? (
                                <TextLink href={host.url} external rel={rel}>
                                    {hostText}
                                </TextLink>
                            ) : (
                                hostText
                            )}
                            {host.note !== null && <span className="mt-1 block">{host.note}</span>}
                        </DescriptionItem>
                    )}
                    {integration.platforms.length > 0 && (
                        <DescriptionItem term={show.details.apps} size="body">
                            {integration.platforms.map((platform) => {
                                const version = integration.versions[platform];

                                return (
                                    <span key={platform} className="block">
                                        {version !== null ? fmt(show.details.appVersion, { app: appName(platform), version }) : appName(platform)}
                                    </span>
                                );
                            })}
                        </DescriptionItem>
                    )}
                    <DescriptionItem term={show.details.license} size="body">
                        {integration.license ?? labels.closedSource}
                    </DescriptionItem>
                    {dates.added !== null && (
                        <DescriptionItem term={show.details.added} size="body">
                            {dates.added}
                        </DescriptionItem>
                    )}
                    {dates.verified !== null && (
                        <DescriptionItem term={show.details.verified} size="body">
                            {dates.verified}
                        </DescriptionItem>
                    )}
                </DescriptionList>
            </BandFrame>

            {integration.screenshots.length > 0 && (
                <BandFrame id="screenshots" title={show.screenshots}>
                    <div className="grid gap-6 sm:grid-cols-2">
                        {integration.screenshots.map((shot) => (
                            <a key={shot.src} href={shot.src}>
                                <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" className="h-auto w-full rounded-control border border-rule" />
                            </a>
                        ))}
                    </div>
                </BandFrame>
            )}

            <BandFrame id="uses" title={uses.title}>
                <DescriptionList>
                    {integration.surfaces.length > 0 && (
                        <DescriptionItem term={uses.surfaces} size="body">
                            <ul className="space-y-1">
                                {integration.surfaces.map((surface) => (
                                    <li key={surface}>
                                        <TextLink href={docsUrl(uses.surface[surface].docs)} external>
                                            {uses.surface[surface].label}
                                        </TextLink>
                                    </li>
                                ))}
                            </ul>
                        </DescriptionItem>
                    )}
                    <DescriptionItem term={uses.reads} size="body">
                        {integration.reads.length > 0 ? list(integration.reads.map((value) => uses.data[value])) : uses.none}
                    </DescriptionItem>
                    <DescriptionItem term={uses.writes} size="body">
                        {integration.writes.length > 0 ? list(integration.writes.map((value) => uses.data[value])) : uses.none}
                    </DescriptionItem>
                    {integration.network === 'internet' && (
                        <DescriptionItem term={uses.terms.internet} size="body">
                            {integration.networkNote ?? uses.internet}
                        </DescriptionItem>
                    )}
                    {integration.account && (
                        <DescriptionItem term={uses.terms.account} size="body">
                            {uses.account}
                            {integration.links.privacy !== null && (
                                <span className="mt-1 block">
                                    <TextLink href={integration.links.privacy} external rel={rel}>
                                        {uses.privacy}
                                    </TextLink>
                                </span>
                            )}
                        </DescriptionItem>
                    )}
                    {payment !== null && (
                        <DescriptionItem term={uses.terms.payment} size="body">
                            {uses.payment[payment]}
                            {integration.paymentNote !== null && <span className="mt-1 block">{integration.paymentNote}</span>}
                        </DescriptionItem>
                    )}
                </DescriptionList>
                {integration.accessNote !== null && <p className="mt-4 text-sm leading-[1.5] text-pretty text-muted-foreground">{integration.accessNote}</p>}
                {integration.lowersSafeMode && (
                    <Callout tone="warning" title={uses.safeMode} className="mt-6">
                        {integration.safeModeNote !== null && <p>{integration.safeModeNote}</p>}
                        <p>
                            <LocaleLink href="/features/data-editing#safe-mode" className={textLinkClasses('inline')}>
                                {uses.safeModeLink}
                            </LocaleLink>
                        </p>
                    </Callout>
                )}
            </BandFrame>

            <ClosingFrame
                id="support"
                title={show.support.title}
                sentence={
                    <Trans
                        text={show.support.sentence}
                        tags={{
                            report: (text) => (
                                <a href={reportUrl(FACTS.links.integrations, integration.slug)} className={textLinkClasses('inline')}>
                                    {text}
                                </a>
                            ),
                        }}
                    />
                }
            >
                {(integration.links.issues !== null || integration.links.docs !== null) && (
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        {integration.links.issues !== null && external(integration.links.issues, fmt(show.support.help, { publisher: integration.publisher.name }))}
                        {integration.links.docs !== null && external(integration.links.docs, show.support.docs)}
                    </div>
                )}
                {integration.tier !== 'official' && (
                    <p className="mt-6 max-w-[40rem] text-sm leading-[1.5] text-pretty text-muted-foreground">
                        {fmt(show.disclaimer, { name: integration.name, publisher: integration.publisher.name })}
                    </p>
                )}
            </ClosingFrame>
        </LandingLayout>
    );
}
