import type { ReactNode } from 'react';
import AppStoreBadge from '@/components/download/app-store-badge';
import Badge from '@/components/ui/badge';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { buttonClasses } from '@/components/ui/button';
import Container from '@/components/ui/container';
import DatabaseMark from '@/components/ui/database-mark';
import DotList from '@/components/ui/dot-list';
import LocaleLink from '@/components/ui/locale-link';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { Trans, useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { trackDownload } from '@/lib/analytics';
import FactsCard from './facts-card';
import { availableDeviceNames, deviceNamesFor, docsUrl, iosStatus } from './format';
import RichText from './rich-text';
import type { DatabaseLinks, DatabaseLabels, DatabasePlatforms, EngineDetail, EnginePageContent, ProductFacts } from './types';

interface EngineHeaderProps {
    content: EnginePageContent;
    labels: DatabaseLabels;
    engine: EngineDetail;
    platforms: DatabasePlatforms;
    links: DatabaseLinks;
    product: ProductFacts;
    // A detail-crop lead, in the text column beside the facts card. A window lead spans the page under the header.
    lead?: ReactNode;
}

// Columns 1-8 hold the text and actions, 9-12 the facts card, which follows the actions below 1024px. A detail lead
// sits under the actions: placed under both columns it left a hole under the actions and an empty half beside it.
export default function EngineHeader({ content, labels, engine, platforms, links, product, lead }: EngineHeaderProps) {
    const { locale, m, fmt } = useI18n();
    const devices = joinList(deviceNamesFor(engine, platforms), m.common.list);
    const worksOn = joinList(availableDeviceNames(engine, platforms), m.common.list);
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
                <div className="grid items-start gap-8 lg:grid-cols-12">
                    <div className="min-w-0 lg:col-span-8">
                        {/* The vendor's mark when there is one; a two-letter monogram this large reads as a missing image. */}
                        <div className="flex items-start gap-4">
                            {engine.icon && <DatabaseMark icon={engine.icon} name={engine.name} size={40} className="-my-1" />}
                            <h1 className="type-h1 min-w-0 text-foreground">{fmt(content.header.title, { devices, macDevices })}</h1>
                        </div>
                        <p className="type-lead mt-4 max-w-[56ch] text-muted-foreground">
                            <RichText text={content.header.lead} />
                        </p>
                        <p className="type-small mt-4 text-muted-foreground">
                            <DotList
                                items={[
                                    fmt(labels.availability.devices, { devices: worksOn }),
                                    fmt(labels.availability[engine.distribution], { name: engine.name }),
                                    engine.release !== null && (
                                        <Badge variant="accent" className="whitespace-nowrap">
                                            {fmt(labels.release, { version: engine.release })}
                                        </Badge>
                                    ),
                                ]}
                            />
                        </p>
                        <p className="type-small mt-1 text-muted-foreground">
                            <DotList
                                items={[
                                    product.free && (
                                        <Trans
                                            text={labels.availability.free}
                                            tags={{
                                                pricing: (text) => (
                                                    <LocaleLink href="/pricing" className={textLinkClasses('inline')}>
                                                        {text}
                                                    </LocaleLink>
                                                ),
                                            }}
                                        />
                                    ),
                                    product.licence !== null &&
                                        (links.source !== null ? (
                                            <TextLink href={links.source} external>
                                                {fmt(labels.otherTools.openSource, { licence: product.licence })}
                                            </TextLink>
                                        ) : (
                                            fmt(labels.otherTools.openSource, { licence: product.licence })
                                        )),
                                ]}
                            />
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                            <LocaleLink href="/download" onClick={() => trackDownload(`database-${engine.id}`, 'mac')} className={buttonClasses('primary', 'md')}>
                                {m.nav.download}
                            </LocaleLink>
                            {onIos && links.appStore !== null && (
                                <AppStoreBadge href={links.appStore} location={`database-${engine.id}`} />
                            )}
                            {docs !== null && (
                                <TextLink href={docs} kind="standalone" external hrefLang="en">
                                    {fmt(labels.docs, { name: engine.name })}
                                    {locale !== 'en' && ` ${m.common.englishOnly}`}
                                </TextLink>
                            )}
                        </div>
                        {lead && <div className="mt-10 lg:max-w-[43.5rem]">{lead}</div>}
                    </div>
                    <FactsCard engine={engine} labels={labels} linux={platforms.linux} className="lg:col-span-4" />
                </div>
            </Container>
        </header>
    );
}
