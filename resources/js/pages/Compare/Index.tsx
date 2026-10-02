import { usePage } from '@inertiajs/react';
import { CellContent } from '@/components/compare/comparison-table';
import {
    currencyStyle,
    dateLabel,
    entryPrice,
    freeTier,
    numberSources,
    platformNames,
    priceLabel,
    priceValue,
    productTokens,
    type CellView,
    type ModelContext,
} from '@/components/compare/model';
import RichText from '@/components/compare/rich-text';
import { SourceList } from '@/components/compare/sources';
import { tableproFacts } from '@/components/compare/tablepro-facts';
import type { CompareHubProps, HubProduct } from '@/components/compare/types';
import SEOHead from '@/components/seo/seo-head';
import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import StatusBadge from '@/components/ui/status-badge';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, useI18n } from '@/i18n';
import { formatUsd, joinList } from '@/i18n/format';
import LandingLayout from '@/layouts/landing-layout';
import { docsUrl, FACTS } from '@/lib/data/facts';
import { absoluteUrl, collectionPageNode, graph } from '@/lib/structured-data';

/**
 * `/compare` and `/vi/compare` (sitemap §A.4, §E.8): the comparisons in one
 * place, with a dated summary table.
 *
 * Sections and ids: `#by-situation`, `#at-a-glance`, `#open-source` (where
 * the retired open-source roundup post redirects), `#switching` and
 * `#method`. Every competitor fact is the product's `comparisons.json` entry
 * with a numbered, dated source; TablePro's row comes from its own data.
 */
export default function CompareIndex({ content, products, freeNotes, checkedAt, dates, tablepro }: CompareHubProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, plural, path } = useI18n();
    const labels = content.labels;

    const context: ModelContext = {
        labels,
        notes: {},
        dates,
        list: m.common.list,
        plural: (node, count, values) => plural(node, count, values),
    };
    const facts = tableproFacts(null, tablepro.featuredEngines, m);
    const checked = dateLabel(dates, checkedAt);
    const numbered = numberSources(products);
    const numbersOf = (id: string) => numbered.find((entry) => entry.productId === id)?.numbers ?? new Map<string, number>();
    const openSource = products.filter((product) => product.licence.openSource);
    const docsInEnglish = locale !== 'en';

    const importers = FACTS.connectionImport.map((entry) => entry.app);
    const imported = new Set(FACTS.connectionImport.map((entry) => entry.id));
    const withoutImporter = products.filter((product) => !imported.has(product.id)).map((product) => product.name);

    const pageUrl = absoluteUrl(canonicalBaseUrl, path('/compare'));
    const pageContext = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };

    const tokens = (product: HubProduct) => productTokens({ ...product, cells: {} }, dates);

    const freeCell = (product: HubProduct): CellView => {
        const free = freeTier(product);

        if (free === null) {
            return { mark: 'no', lines: [{ text: labels.hub.freeNo }], sources: [] };
        }

        const qualifier = free.edition ?? (free.audience ? labels.price.audience[free.audience] : null);
        const template = free.note ? (freeNotes[product.slug ?? ''] ?? null) : null;
        const note = template !== null ? fmt(template, { ...(free.value !== undefined ? { value: free.value } : {}), edition: free.edition ?? '' }) : null;
        const lines = [
            ...(qualifier !== null ? [{ text: qualifier }] : []),
            ...(note !== null ? [{ text: note, muted: qualifier !== null }] : []),
        ];

        return { mark: 'yes', lines: lines.length > 0 ? lines : [{ text: labels.hub.freeYes }], sources: [free.source] };
    };

    const paidCell = (product: HubProduct): CellView => {
        const entry = entryPrice(product);

        if (entry === null) {
            return { mark: 'none', lines: [{ text: labels.hub.noPaid }], sources: [] };
        }

        const label = priceLabel(entry, labels);

        return {
            mark: 'none',
            lines: [{ text: fmt(labels.hub.paidFrom, { price: priceValue(entry, context) }) }, ...(label !== null ? [{ text: label, muted: true }] : [])],
            sources: [entry.source],
        };
    };

    const tableproRow = {
        platforms: { mark: 'none', lines: [{ text: facts.devices }], sources: [] },
        licence: { mark: 'yes', lines: [{ text: facts.licence }], sources: [] },
        free: { mark: 'yes', lines: [{ text: labels.tablepro.priceFree }], sources: [] },
        paid: {
            mark: 'none',
            lines: [
                { text: fmt(labels.hub.paidFrom, { price: fmt(labels.price.amount.month, { amount: formatUsd(facts.starter.monthly, currencyStyle(labels)) }) }) },
                { text: labels.tiers.starter, muted: true },
            ],
            sources: [],
            link: { href: '/pricing', label: labels.cta.pricing },
        },
    } satisfies Record<string, CellView>;

    const productLink = (product: HubProduct) =>
        product.slug !== null ? (
            <LocaleLink href={`/compare/${product.slug}`} className={textLinkClasses('inline')}>
                {product.name}
            </LocaleLink>
        ) : (
            product.name
        );

    return (
        <LandingLayout>
            <SEOHead
                title={content.seo.title}
                titleTemplate={false}
                description={content.seo.description}
                jsonLd={graph([
                    collectionPageNode(pageContext, {
                        url: pageUrl,
                        name: content.seo.title,
                        description: content.seo.description,
                        items: products
                            .filter((product) => product.slug !== null)
                            .map((product) => ({ name: fmt(labels.hub.compareLink, { name: product.name }), path: path(`/compare/${product.slug}`) })),
                    }),
                ])}
            />

            <PageHeader title={content.header.title} lead={content.header.lead} meta={fmt(labels.factsChecked, { date: checked })} />

            <Section id="by-situation" title={content.bySituation.title} lead={content.bySituation.lead} width="text" className="pt-0 md:pt-0 xl:pt-0">
                <ul className="border-t border-rule">
                    {products
                        .filter((product) => product.slug !== null)
                        .map((product) => {
                            const line = content.bySituation.items[product.slug as keyof typeof content.bySituation.items];

                            return (
                                <li key={product.id} className="border-b border-rule py-4">
                                    <p className="type-body text-foreground">{line !== undefined ? <RichText text={line} values={tokens(product)} /> : product.name}</p>
                                    <p className="mt-2">
                                        <LocaleLink href={`/compare/${product.slug}`} className={textLinkClasses('standalone')}>
                                            {fmt(labels.hub.compareLink, { name: product.name })}
                                            <span aria-hidden="true">→</span>
                                        </LocaleLink>
                                    </p>
                                </li>
                            );
                        })}
                </ul>
            </Section>

            <Section id="at-a-glance" title={content.atAGlance.title} lead={content.atAGlance.lead}>
                <DataTable caption={fmt(content.atAGlance.caption, { date: checked })} captionVisible stickyFirstColumn className="min-w-[52rem]">
                    <thead>
                        <tr>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {labels.hub.client}
                            </th>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {labels.hub.platforms}
                            </th>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {labels.hub.openSource}
                            </th>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {labels.hub.free}
                            </th>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {labels.hub.paid}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className={TABLE_ROW}>
                            <th scope="row" className={TABLE_ROW_HEADER}>
                                {m.common.brand}
                            </th>
                            {[tableproRow.platforms, tableproRow.licence, tableproRow.free, tableproRow.paid].map((view, index) => (
                                <td key={index} className={TABLE_CELL}>
                                    <CellContent view={view} productId="tablepro" numbers={new Map()} labels={labels} />
                                </td>
                            ))}
                        </tr>
                        {products.map((product) => {
                            const numbers = numbersOf(product.id);
                            const cells: CellView[] = [
                                {
                                    mark: 'none',
                                    lines: [{ text: platformNames(product.platforms, labels) }],
                                    sources: product.platformsSource ? [product.platformsSource] : [],
                                },
                                product.licence.openSource && product.licence.name !== null
                                    ? {
                                          mark: 'yes',
                                          lines: [{ text: product.licence.edition ? `${product.licence.name} (${product.licence.edition})` : product.licence.name }],
                                          sources: [product.licence.source],
                                      }
                                    : { mark: 'no', lines: [{ text: labels.licence.no }], sources: [product.licence.source] },
                                freeCell(product),
                                paidCell(product),
                            ];

                            return (
                                <tr key={product.id} className={TABLE_ROW}>
                                    <th scope="row" className={TABLE_ROW_HEADER}>
                                        {productLink(product)}
                                    </th>
                                    {cells.map((view, index) => (
                                        <td key={index} className={TABLE_CELL}>
                                            <CellContent view={view} productId={product.id} numbers={numbers} labels={labels} />
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </DataTable>
            </Section>

            <Section id="open-source" title={content.openSource.title} lead={content.openSource.lead}>
                <DataTable caption={fmt(content.openSource.caption, { date: checked })} captionVisible stickyFirstColumn className="min-w-[44rem]">
                    <thead>
                        <tr>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {labels.hub.client}
                            </th>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {labels.hub.license}
                            </th>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {labels.hub.platforms}
                            </th>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {labels.hub.status}
                            </th>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {labels.hub.latest}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className={TABLE_ROW}>
                            <th scope="row" className={TABLE_ROW_HEADER}>
                                {m.common.brand}
                            </th>
                            <td className={TABLE_CELL}>{facts.licence}</td>
                            <td className={TABLE_CELL}>{facts.devices}</td>
                            <td className={TABLE_CELL}>
                                <StatusBadge status="success">{labels.status.active}</StatusBadge>
                            </td>
                            <td className={`${TABLE_CELL} tabular-nums`}>
                                {tablepro.mac !== null && fmt(labels.hub.latestValue, { version: tablepro.mac.version, date: dateLabel(dates, tablepro.mac.date) })}
                            </td>
                        </tr>
                        {openSource.map((product) => {
                            const numbers = numbersOf(product.id);

                            return (
                                <tr key={product.id} className={TABLE_ROW}>
                                    <th scope="row" className={TABLE_ROW_HEADER}>
                                        {productLink(product)}
                                    </th>
                                    <td className={TABLE_CELL}>
                                        <CellContent
                                            view={{
                                                mark: 'none',
                                                lines: [{ text: product.licence.edition ? `${product.licence.name} (${product.licence.edition})` : (product.licence.name ?? '') }],
                                                sources: [product.licence.source],
                                            }}
                                            productId={product.id}
                                            numbers={numbers}
                                            labels={labels}
                                        />
                                    </td>
                                    <td className={TABLE_CELL}>
                                        <CellContent
                                            view={{
                                                mark: 'none',
                                                lines: [{ text: platformNames(product.platforms, labels) }],
                                                sources: product.platformsSource ? [product.platformsSource] : [],
                                            }}
                                            productId={product.id}
                                            numbers={numbers}
                                            labels={labels}
                                        />
                                    </td>
                                    <td className={TABLE_CELL}>
                                        <StatusBadge status={product.status.state === 'active' ? 'success' : 'neutral'}>{labels.status[product.status.state]}</StatusBadge>
                                    </td>
                                    <td className={`${TABLE_CELL} tabular-nums`}>
                                        <CellContent
                                            view={{
                                                mark: 'none',
                                                lines: [
                                                    {
                                                        text: fmt(labels.hub.latestValue, {
                                                            version: product.status.lastRelease.version,
                                                            date: dateLabel(dates, product.status.lastRelease.date),
                                                        }),
                                                    },
                                                ],
                                                sources: [product.status.lastRelease.source],
                                            }}
                                            productId={product.id}
                                            numbers={numbers}
                                            labels={labels}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </DataTable>

                <div className="mt-10 max-w-[44rem]">
                    <h3 id="hub-sources" className="type-h3 text-foreground">
                        {labels.sections.sources}
                    </h3>
                    <div className="mt-4 space-y-4">
                        {numbered
                            .filter((entry) => entry.sources.length > 0)
                            .map((entry) => {
                                const product = products.find((candidate) => candidate.id === entry.productId);

                                return (
                                    <div key={entry.productId}>
                                        <p className="type-small font-medium text-foreground">{product?.name}</p>
                                        <SourceList
                                            productId={entry.productId}
                                            sources={entry.sources}
                                            dates={dates}
                                            start={entry.start}
                                            retrievedTemplate={(date) => fmt(labels.sources.retrieved, { date })}
                                            label={product?.name ?? labels.sections.sources}
                                            className="mt-1"
                                        />
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </Section>

            <Section id="switching" title={content.switching.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>{fmt(content.switching.body, { apps: joinList(importers, m.common.list) })}</p>
                    {withoutImporter.length > 0 && <p>{fmt(content.switching.none, { others: joinList(withoutImporter, labels.orList) })}</p>}
                    <ul className="flex flex-wrap gap-x-6 gap-y-2">
                        <li>
                            <LocaleLink href="/features/connections#import" className={textLinkClasses('standalone')}>
                                {content.switching.link}
                                <span aria-hidden="true">→</span>
                            </LocaleLink>
                        </li>
                        <li>
                            <TextLink href={docsUrl('/switching')} kind="standalone" external hrefLang="en">
                                {content.switching.docs}
                                {docsInEnglish && ` ${m.common.englishOnly}`}
                            </TextLink>
                        </li>
                    </ul>
                </div>
            </Section>

            <Section id="method" title={content.method.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    {content.method.paragraphs.map((paragraph, index) => (
                        <p key={index}>
                            <RichText text={paragraph} external={{ issues: FACTS.links.issues }} />
                        </p>
                    ))}
                </div>
            </Section>
        </LandingLayout>
    );
}
