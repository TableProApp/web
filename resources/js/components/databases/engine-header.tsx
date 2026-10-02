import AppStoreBadge from '@/components/download/app-store-badge';
import Badge from '@/components/ui/badge';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { buttonClasses } from '@/components/ui/button';
import Container from '@/components/ui/container';
import DatabaseMark from '@/components/ui/database-mark';
import LocaleLink from '@/components/ui/locale-link';
import TextLink from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { trackDownload } from '@/lib/analytics';
import FactsCard from './facts-card';
import { deviceNamesFor, docsUrl, iosStatus } from './format';
import RichText from './rich-text';
import type { DatabaseLinks, DatabaseLabels, EngineDetail, EnginePageContent, PlatformSummary } from './types';

interface EngineHeaderProps {
    content: EnginePageContent;
    labels: DatabaseLabels;
    engine: EngineDetail;
    platforms: { mac: PlatformSummary | null; ios: PlatformSummary | null };
    links: DatabaseLinks;
}

/**
 * The top of an engine page (sitemap §E.1 block 1, design-system §8.4).
 *
 * Columns 1-8: the breadcrumb, the engine's mark and the H1, whose device list
 * comes from data, the lead, an availability line (devices, where the driver
 * comes from, and a version label while some channel still serves a Mac build
 * without the engine), then the actions: Download for Mac, the App Store badge
 * only when the iPhone and iPad app offers the engine, and the setup guide.
 * Columns 9-12: the facts card. Below 1024px the card follows the actions.
 */
export default function EngineHeader({ content, labels, engine, platforms, links }: EngineHeaderProps) {
    const { locale, m, fmt } = useI18n();
    const devices = joinList(deviceNamesFor(engine, platforms), m.common.list);
    const macDevices = joinList(platforms.mac?.deviceNames ?? [], m.common.list);
    const docs = docsUrl(links.docs, engine.docsSlug);
    const onIos = iosStatus(engine) === 'picker' && links.appStore !== null;

    return (
        <header className="pt-10 pb-8 md:pt-14 md:pb-10 xl:pt-18 xl:pb-12">
            <Container>
                <Breadcrumbs
                    items={[{ label: m.seo.breadcrumbs.databases, href: '/databases' }, { label: content.breadcrumb }]}
                    className="mb-4"
                />
                <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-6">
                    <div className="min-w-0 lg:col-span-8">
                        <div className="flex items-start gap-4">
                            <DatabaseMark icon={engine.icon} monogram={engine.monogram} name={engine.name} size={40} className="mt-1" />
                            <h1 className="type-h1 min-w-0 text-foreground">{fmt(content.header.title, { devices, macDevices })}</h1>
                        </div>
                        <p className="type-lead mt-4 max-w-[56ch] text-muted-foreground">
                            <RichText text={content.header.lead} />
                        </p>
                        <p className="type-small mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                            <span>{fmt(labels.availability.devices, { devices })}</span>
                            <span aria-hidden="true">·</span>
                            <span>{fmt(labels.availability[engine.distribution], { name: engine.name })}</span>
                            {engine.release !== null && (
                                <Badge variant="accent">{fmt(labels.release, { version: engine.release })}</Badge>
                            )}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                            <LocaleLink href="/download" onClick={() => trackDownload(`database-${engine.id}`, 'mac')} className={buttonClasses('primary', 'md')}>
                                {m.download.macCta}
                            </LocaleLink>
                            {onIos && links.appStore !== null && (
                                <AppStoreBadge
                                    href={links.appStore}
                                    label={m.download.ios.badge}
                                    labelLang={locale === 'en' ? undefined : 'en'}
                                    location={`database-${engine.id}`}
                                />
                            )}
                            {docs !== null && (
                                <TextLink href={docs} kind="standalone" external hrefLang="en">
                                    {fmt(labels.docs, { name: engine.name })}
                                    {locale !== 'en' && ` ${m.common.englishOnly}`}
                                </TextLink>
                            )}
                        </div>
                    </div>
                    <FactsCard engine={engine} labels={labels} className="lg:col-span-4" />
                </div>
            </Container>
        </header>
    );
}
