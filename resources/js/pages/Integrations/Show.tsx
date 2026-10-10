import { usePage } from '@inertiajs/react';
import InstallAction from '@/components/integrations/install-action';
import { relFor, reportUrl } from '@/components/integrations/model';
import type { AppPlatform, IntegrationPageProps } from '@/components/integrations/types';
import SEOHead from '@/components/seo/seo-head';
import Badge from '@/components/ui/badge';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import Callout from '@/components/ui/callout';
import Card from '@/components/ui/card';
import CellGrid from '@/components/ui/cell-grid';
import Container from '@/components/ui/container';
import DatabaseMark from '@/components/ui/database-mark';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import DotList from '@/components/ui/dot-list';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import StatusBadge from '@/components/ui/status-badge';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, Trans, useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import LandingLayout from '@/layouts/landing-layout';
import { docsUrl, FACTS } from '@/lib/data/facts';
import { devicesOf, iosPlatform, macPlatform } from '@/lib/data/platforms';
import { absoluteUrl, breadcrumbNode, graph, iosAppId, macAppId, webPageNode } from '@/lib/structured-data';

export default function IntegrationShow({ content, integration, dates }: IntegrationPageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    const { labels, show } = content;
    const uses = show.uses;
    const rel = relFor(integration.tier);
    const list = (items: string[]) => joinList(items, m.common.list);
    const appName = (platform: AppPlatform) => devicesOf(platform === 'mac' ? macPlatform() : iosPlatform(), m.common.shortList);

    const title = fmt(show.seoTitle, { name: integration.name });
    const pageUrl = absoluteUrl(canonicalBaseUrl, path(`/integrations/${integration.slug}`));
    const pageContext = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };
    const crumbs = [
        { name: m.seo.breadcrumbs.integrations, path: path('/integrations') },
        { name: integration.name, path: path(`/integrations/${integration.slug}`) },
    ];
    const about = integration.platforms.length === 1 && integration.platforms[0] === 'ios' ? iosAppId(canonicalBaseUrl) : macAppId(canonicalBaseUrl);

    const archived = integration.archived;
    const reason = archived?.reason ?? null;

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

            <header className="pt-10 pb-8 md:pt-14 md:pb-10 xl:pt-18 xl:pb-12">
                <Container>
                    <Breadcrumbs items={[{ label: m.seo.breadcrumbs.integrations, href: '/integrations' }, { label: integration.name }]} className="mb-4" />
                    <div className="grid items-start gap-8 lg:grid-cols-12">
                        <div className="min-w-0 lg:col-span-8">
                            <div className="flex items-start gap-4">
                                <DatabaseMark icon={integration.icon?.src} name={integration.name} size={40} className="-my-1" />
                                <h1 className="type-h1 min-w-0 text-foreground">{integration.name}</h1>
                            </div>
                            <p className="type-lead mt-4 max-w-[56ch] text-muted-foreground">{integration.summary}</p>
                            <p className="type-small mt-4 text-muted-foreground">
                                <DotList
                                    items={[
                                        fmt(labels.by, { publisher: integration.publisher.name }),
                                        <Badge variant={integration.tier === 'community' ? 'outline' : 'neutral'}>{labels.tiers[integration.tier]}</Badge>,
                                        integration.closedSource && <Badge variant="outline">{labels.closedSource}</Badge>,
                                        archived !== null && <StatusBadge status="warning">{show.archived.badge}</StatusBadge>,
                                    ]}
                                />
                            </p>
                            {archived !== null && (
                                <Callout tone="warning" className="mt-6 max-w-[44rem]">
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
                            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                                <InstallAction integration={integration} labels={show} />
                                {integration.source !== null && (
                                    <TextLink href={integration.source} kind="standalone" external rel={rel}>
                                        {show.source}
                                    </TextLink>
                                )}
                            </div>
                        </div>
                        <Card title={show.details.title} titleAs="h2" className="lg:col-span-4">
                            <DescriptionList className="mt-1 [&_dt]:hyphens-auto">
                                <DescriptionItem term={show.details.publisher}>
                                    {integration.publisher.url !== null ? (
                                        <TextLink href={integration.publisher.url} external rel={rel}>
                                            {integration.publisher.name}
                                        </TextLink>
                                    ) : (
                                        integration.publisher.name
                                    )}
                                </DescriptionItem>
                                <DescriptionItem term={show.details.category}>{list(integration.categories.map((category) => labels.categories[category]))}</DescriptionItem>
                                {integration.host !== null && (
                                    <DescriptionItem term={show.details.host}>
                                        {integration.host.url !== null ? (
                                            <TextLink href={integration.host.url} external rel={rel}>
                                                {integration.host.minVersion !== null
                                                    ? fmt(show.details.hostVersion, { host: integration.host.name, version: integration.host.minVersion })
                                                    : integration.host.name}
                                            </TextLink>
                                        ) : integration.host.minVersion !== null ? (
                                            fmt(show.details.hostVersion, { host: integration.host.name, version: integration.host.minVersion })
                                        ) : (
                                            integration.host.name
                                        )}
                                        {integration.host.note !== null && <span className="block text-muted-foreground">{integration.host.note}</span>}
                                    </DescriptionItem>
                                )}
                                <DescriptionItem term={show.details.apps}>
                                    {integration.platforms.map((platform) => {
                                        const version = integration.versions[platform];

                                        return (
                                            <span key={platform} className="block">
                                                {version !== null ? fmt(show.details.appVersion, { app: appName(platform), version }) : appName(platform)}
                                            </span>
                                        );
                                    })}
                                </DescriptionItem>
                                <DescriptionItem term={show.details.license}>{integration.license ?? labels.closedSource}</DescriptionItem>
                                {dates.added !== null && <DescriptionItem term={show.details.added}>{dates.added}</DescriptionItem>}
                                {dates.verified !== null && <DescriptionItem term={show.details.verified}>{dates.verified}</DescriptionItem>}
                            </DescriptionList>
                        </Card>
                    </div>
                </Container>
            </header>

            {integration.description.length > 0 && (
                <Section id="about" title={show.about} width="text">
                    <div className="type-body space-y-4 text-foreground">
                        {integration.description.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </Section>
            )}

            {integration.screenshots.length > 0 && (
                <Section id="screenshots" title={show.screenshots} flush>
                    <CellGrid className="md:grid-cols-2">
                        {integration.screenshots.map((shot) => (
                            <figure key={shot.src}>
                                <a href={shot.src}>
                                    <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" className="h-auto w-full rounded-control border border-rule" />
                                </a>
                            </figure>
                        ))}
                    </CellGrid>
                </Section>
            )}

            <Section id="uses" title={uses.title} width="text">
                <DescriptionList>
                    <DescriptionItem term={uses.surfaces}>
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
                    <DescriptionItem term={uses.reads}>{integration.reads.length > 0 ? list(integration.reads.map((value) => uses.data[value])) : uses.none}</DescriptionItem>
                    <DescriptionItem term={uses.writes}>{integration.writes.length > 0 ? list(integration.writes.map((value) => uses.data[value])) : uses.none}</DescriptionItem>
                </DescriptionList>
                {integration.accessNote !== null && <p className="type-small mt-4 text-muted-foreground">{integration.accessNote}</p>}
                <div className="mt-6 space-y-4 empty:hidden">
                    {integration.lowersSafeMode && (
                        <Callout tone="warning" title={uses.safeMode}>
                            {integration.safeModeNote !== null && <p>{integration.safeModeNote}</p>}
                            <p>
                                <LocaleLink href="/features/data-editing#safe-mode" className={textLinkClasses('inline')}>
                                    {uses.safeModeLink}
                                </LocaleLink>
                            </p>
                        </Callout>
                    )}
                    {integration.network === 'internet' && (
                        <Callout tone="warning" title={uses.internet}>
                            {integration.networkNote !== null && <p>{integration.networkNote}</p>}
                        </Callout>
                    )}
                    {integration.account && (
                        <Callout title={uses.account}>
                            {integration.links.privacy !== null && (
                                <p>
                                    <TextLink href={integration.links.privacy} external rel={rel}>
                                        {uses.privacy}
                                    </TextLink>
                                </p>
                            )}
                        </Callout>
                    )}
                    {(integration.payment === 'optional' || integration.payment === 'paid') && (
                        <Callout title={uses.payment[integration.payment]}>{integration.paymentNote !== null && <p>{integration.paymentNote}</p>}</Callout>
                    )}
                </div>
            </Section>

            <Section id="support" title={show.support.title} width="text">
                <ul className="space-y-2">
                    <li>
                        <TextLink href={reportUrl(FACTS.links.integrations, integration.slug)} kind="standalone" external>
                            {show.support.report}
                        </TextLink>
                    </li>
                    {integration.links.issues !== null && (
                        <li>
                            <TextLink href={integration.links.issues} kind="standalone" external rel={rel}>
                                {fmt(show.support.help, { publisher: integration.publisher.name })}
                            </TextLink>
                        </li>
                    )}
                    {integration.links.docs !== null && (
                        <li>
                            <TextLink href={integration.links.docs} kind="standalone" external rel={rel}>
                                {show.support.docs}
                            </TextLink>
                        </li>
                    )}
                </ul>
                {integration.tier !== 'official' && (
                    <Callout className="mt-6">
                        <p>{fmt(show.disclaimer, { name: integration.name, publisher: integration.publisher.name })}</p>
                    </Callout>
                )}
            </Section>
        </LandingLayout>
    );
}
