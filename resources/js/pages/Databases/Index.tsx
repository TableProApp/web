import { usePage } from '@inertiajs/react';
import DownloadBand from '@/components/databases/download-band';
import EngineTable from '@/components/databases/engine-table';
import type { EngineCategory, HubPageProps } from '@/components/databases/types';
import SEOHead from '@/components/seo/seo-head';
import AssetSlot from '@/components/ui/asset-slot';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { isAssetId } from '@/lib/data/assets';
import { absoluteUrl, breadcrumbNode, collectionPageNode, graph, macAppId } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

/**
 * `/databases` and `/vi/databases` (sitemap §A.3, §E.8; design-system §8.3).
 *
 * A table generated from engines.json, one section per category in the
 * sitemap's order, so a category keeps its id (`#wide-column`, `#streaming`)
 * even when it holds one engine. Every published engine appears exactly once:
 * an engine with its own page links to it, a merged engine links to its
 * section on the family page, and a hub-only engine is a row with its own id,
 * its limits and its setup guide. Counts are lengths of the data, never typed.
 */
export default function DatabasesIndex({ content, engines, copy, iosEngines, platforms, links }: HubPageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();

    /* The sitemap's order, as the content file lists it; a category with no published engine is left out, link and all. */
    const categories = (Object.keys(content.categories) as EngineCategory[]).filter((category) =>
        engines.some((engine) => engine.category === category),
    );
    const featured = joinList(
        engines.filter((engine) => engine.featured).map((engine) => engine.name),
        m.common.list,
    );
    const bundled = joinList(
        engines.filter((engine) => engine.distribution === 'bundled').map((engine) => engine.name),
        m.common.list,
    );
    const byId = new Map(engines.map((engine) => [engine.id, engine]));
    const onIos = iosEngines.map((id) => byId.get(id)?.name).filter((name): name is string => name !== undefined);
    const syncedOnly = engines.filter((engine) => engine.ios.openable && !engine.ios.inPicker).map((engine) => engine.name);
    const docsBase = links.docs;
    const slot = isAssetId(content.drivers.asset) ? content.drivers.asset : null;

    const pageUrl = absoluteUrl(canonicalBaseUrl, path('/databases'));
    const context = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };

    return (
        <LandingLayout>
            <SEOHead
                title={content.seo.title}
                description={content.seo.description}
                jsonLd={graph([
                    collectionPageNode(context, {
                        url: pageUrl,
                        name: content.seo.title,
                        description: content.seo.description,
                        about: macAppId(canonicalBaseUrl),
                        breadcrumb: `${pageUrl}#breadcrumb`,
                        items: engines.filter((engine) => engine.page === 'own').map((engine) => ({ name: engine.name, path: path(engine.path) })),
                    }),
                    breadcrumbNode(context, pageUrl, [{ name: m.seo.breadcrumbs.databases, path: path('/databases') }]),
                ])}
            />

            <PageHeader
                title={content.header.title}
                lead={fmt(content.header.lead, { count: engines.length, featured })}
            >
                <nav aria-label={content.jump}>
                    <ul className="type-small flex flex-wrap gap-x-5 gap-y-2">
                        {categories.map((category) => (
                            <li key={category}>
                                <a href={`#${category}`} className={textLinkClasses('inline')}>
                                    {content.categories[category].title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </PageHeader>

            {categories.map((category) => {
                const members = engines.filter((engine) => engine.category === category);

                return (
                    <Section key={category} id={category} title={content.categories[category].title} lead={content.categories[category].intro}>
                        <EngineTable
                            caption={fmt(content.table.caption, { category: content.categories[category].title })}
                            engines={members}
                            copy={copy}
                            table={content.table}
                            labels={content.labels}
                            docsBase={docsBase}
                        />
                    </Section>
                );
            })}

            <Section id="drivers" title={content.drivers.title}>
                <div className="grid items-start gap-8 lg:grid-cols-12">
                    <div className="type-body space-y-4 text-foreground lg:col-span-5">
                        {content.drivers.paragraphs.map((paragraph, index) => (
                            <p key={index}>{fmt(paragraph, { bundled })}</p>
                        ))}
                        {docsBase !== null && (
                            <p>
                                <TextLink href={docsBase + content.drivers.docs.path} kind="standalone" external hrefLang="en">
                                    {content.drivers.docs.label}
                                    {locale !== 'en' && ` ${m.common.englishOnly}`}
                                </TextLink>
                            </p>
                        )}
                    </div>
                    {slot !== null && <AssetSlot id={slot} className="lg:col-span-7" />}
                </div>
            </Section>

            {onIos.length > 0 && (
                <Section id="iphone" title={content.iphone.title} width="text">
                    <div className="type-body space-y-4 text-foreground">
                        <p>{fmt(content.iphone.picker, { engines: joinList(onIos, m.common.list) })}</p>
                        {syncedOnly.length > 0 && <p>{fmt(content.iphone.synced, { engines: joinList(syncedOnly, m.common.list) })}</p>}
                        <p>{content.iphone.others}</p>
                        <p>
                            <LocaleLink href="/ios#databases" className={textLinkClasses('standalone')}>
                                {content.iphone.link}
                                <span aria-hidden="true">→</span>
                            </LocaleLink>
                        </p>
                    </div>
                </Section>
            )}

            <Section id="license" title={content.license.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>{content.license.body}</p>
                    <p>
                        <LocaleLink href="/pricing" className={textLinkClasses('standalone')}>
                            {content.license.link}
                            <span aria-hidden="true">→</span>
                        </LocaleLink>
                    </p>
                </div>
            </Section>

            <Section id="missing" title={content.missing.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>{content.missing.body}</p>
                    <ul className="flex flex-col gap-3">
                        {links.request !== null && (
                            <li>
                                <TextLink href={links.request} kind="standalone" external hrefLang="en">
                                    {content.missing.link}
                                </TextLink>
                            </li>
                        )}
                        {docsBase !== null && (
                            <li>
                                <TextLink href={docsBase + content.docs.path} kind="standalone" external hrefLang="en">
                                    {content.docs.label}
                                    {locale !== 'en' && ` ${m.common.englishOnly}`}
                                </TextLink>
                            </li>
                        )}
                    </ul>
                </div>
            </Section>

            <DownloadBand labels={content.labels} platforms={platforms} showIos appStoreUrl={links.appStore} location="databases" />
        </LandingLayout>
    );
}
