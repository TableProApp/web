import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { CellContent, FoldedCells, WIDE_COLUMN, WIDER_COLUMN } from '@/components/compare/comparison-table';
import GetStarted from '@/components/compare/get-started';
import JumpList from '@/components/compare/jump-list';
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
import { buttonClasses } from '@/components/ui/button';
import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import { AppleGlyph } from '@/components/ui/glyph';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import StatusBadge from '@/components/ui/status-badge';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, useI18n } from '@/i18n';
import { formatUsd, joinList, keepTogether } from '@/i18n/format';
import LandingLayout from '@/layouts/landing-layout';
import { trackDownload } from '@/lib/analytics';
import { docsUrl, FACTS } from '@/lib/data/facts';
import { absoluteUrl, collectionPageNode, graph } from '@/lib/structured-data';
import { cn } from '@/lib/utils';

/**
 * `/compare` and `/vi/compare` (sitemap §A.4, §E.8): the comparisons in one
 * place, with a dated summary table.
 *
 * Sections and ids: `#by-situation`, `#at-a-glance`, `#open-source` (where
 * the retired open-source roundup post redirects), `#switching`, `#method`,
 * `#sources` and `#get-started`. Every competitor fact is the product's `comparisons.json` entry
 * with a numbered, dated source; TablePro's row comes from its own data.
 */
export default function CompareIndex({ content, products, freeNotes, titles, checkedAt, dates, tablepro }: CompareHubProps) {
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
    // The check date never breaks across lines in the meta line or the captions.
    const checked = keepTogether(dateLabel(dates, checkedAt));
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
    // A link reads as the page it opens: its H1.
    const pageTitle = (product: HubProduct) => titles[product.slug ?? ''] ?? fmt(labels.hub.compareLink, { name: product.name });

    const freeCell = (product: HubProduct): CellView => {
        const free = freeTier(product);

        if (free === null) {
            return { mark: 'no', lines: [{ text: labels.hub.freeNo }], sources: [], worded: true };
        }

        const qualifier = free.edition ? fmt(labels.cell.edition, { edition: free.edition }) : free.audience ? labels.price.audience[free.audience] : null;
        const template = free.note ? (freeNotes[product.slug ?? ''] ?? null) : null;
        const note = template !== null ? fmt(template, { ...(free.value !== undefined ? { value: free.value } : {}), edition: free.edition ?? '' }) : null;
        const lines = [
            ...(qualifier !== null ? [{ text: qualifier }] : []),
            ...(note !== null ? [{ text: note, muted: qualifier !== null }] : []),
        ];

        return { mark: 'yes', lines: lines.length > 0 ? lines : [{ text: labels.hub.freeYes }], sources: [free.source], worded: lines.length === 0 };
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

    const tableproCells: CellView[] = [tableproRow.platforms, tableproRow.licence, tableproRow.free, tableproRow.paid];

    const glanceHeadings = [labels.hub.platforms, labels.hub.openSource, labels.hub.free, labels.hub.paid];

    const glanceCells = (product: HubProduct): CellView[] => [
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
            : { mark: 'no', lines: [{ text: labels.licence.no }], sources: [product.licence.source], worded: true },
        freeCell(product),
        paidCell(product),
    ];

    const openSourceHeadings = [labels.hub.license, labels.hub.platforms, labels.hub.status, labels.hub.latest];

    const productLink = (product: HubProduct) =>
        product.slug !== null ? (
            <LocaleLink href={`/compare/${product.slug}`} className={textLinkClasses('inline')}>
                {product.name}
            </LocaleLink>
        ) : (
            product.name
        );

    const sections = [
        { id: 'by-situation', label: content.bySituation.title },
        { id: 'at-a-glance', label: content.atAGlance.title },
        { id: 'open-source', label: content.openSource.title },
        { id: 'switching', label: content.switching.title },
        { id: 'method', label: content.method.title },
        { id: 'sources', label: labels.sections.sources },
    ];

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
                            .map((product) => ({ name: pageTitle(product), path: path(`/compare/${product.slug}`) })),
                    }),
                ])}
            />

            <PageHeader
                title={content.header.title}
                lead={content.header.lead}
                meta={fmt(labels.factsChecked, { date: checked })}
                actions={
                    <>
                        <LocaleLink href="/download" onClick={() => trackDownload('compare-hub', 'mac')} className={buttonClasses('primary', 'md')}>
                            <AppleGlyph />
                            {m.download.macCta}
                        </LocaleLink>
                        <LocaleLink href="/pricing" className={textLinkClasses('standalone')}>
                            {labels.cta.pricing}
                            <span aria-hidden="true">→</span>
                        </LocaleLink>
                    </>
                }
            >
                <JumpList items={sections} />
            </PageHeader>

            <Section id="by-situation" title={content.bySituation.title} lead={content.bySituation.lead} width="text">
                <ul data-rule-list className="frame-rows-text border-t border-rule">
                    <li className="border-b border-rule py-4">
                        <p className="type-body text-foreground">{fmt(content.bySituation.tablepro, { apps: joinList(importers, m.common.list) })}</p>
                        <p className="mt-2">
                            <LocaleLink href="/download" onClick={() => trackDownload('compare-hub-situation', 'mac')} className={textLinkClasses('standalone')}>
                                {m.download.macCta}
                                <span aria-hidden="true">→</span>
                            </LocaleLink>
                        </p>
                    </li>
                    {products
                        .filter((product) => product.slug !== null)
                        .map((product) => {
                            const line = content.bySituation.items[product.slug as keyof typeof content.bySituation.items];

                            return (
                                <li key={product.id} className="border-b border-rule py-4">
                                    <p className="type-body text-foreground">{line !== undefined ? <RichText text={line} values={tokens(product)} /> : product.name}</p>
                                    <p className="mt-2">
                                        <LocaleLink href={`/compare/${product.slug}`} className={textLinkClasses('standalone')}>
                                            {pageTitle(product)}
                                            <span aria-hidden="true">→</span>
                                        </LocaleLink>
                                    </p>
                                </li>
                            );
                        })}
                </ul>
            </Section>

            <Section id="at-a-glance" title={content.atAGlance.title} lead={content.atAGlance.lead}>
                {/* Below 1024px the four value columns fold under each client's name (design-system §5.3.10): five columns need about 832px. */}
                <DataTable wrapperClassName="frame-table" caption={fmt(content.atAGlance.caption, { date: checked })} captionVisible stickyFirstColumn className="lg:min-w-[52rem]">
                    <thead>
                        <tr>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {labels.hub.client}
                            </th>
                            {glanceHeadings.map((heading) => (
                                <th key={heading} scope="col" className={cn(TABLE_HEAD_CELL, WIDER_COLUMN)}>
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { id: 'tablepro', name: m.common.brand as ReactNode, numbers: new Map<string, number>(), cells: tableproCells },
                            ...products.map((product) => ({
                                id: product.id,
                                name:
                                    product.status.state === 'discontinued' ? (
                                        <>
                                            {productLink(product)} <StatusBadge status="neutral">{labels.status.discontinued}</StatusBadge>
                                        </>
                                    ) : (
                                        productLink(product)
                                    ),
                                numbers: numbersOf(product.id),
                                cells: glanceCells(product),
                            })),
                        ].map((row) => {
                            const content = row.cells.map((view) => <CellContent view={view} productId={row.id} numbers={row.numbers} labels={labels} />);

                            return (
                                <tr key={row.id} className={TABLE_ROW}>
                                    <th scope="row" className={TABLE_ROW_HEADER}>
                                        {row.name}
                                        <FoldedCells from="lg" cells={glanceHeadings.map((heading, index) => ({ heading, content: content[index] }))} />
                                    </th>
                                    {content.map((cell, index) => (
                                        <td key={index} className={cn(TABLE_CELL, WIDER_COLUMN)}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </DataTable>
            </Section>

            <Section id="open-source" title={content.openSource.title} lead={content.openSource.lead}>
                {/* Below 640px the four value columns fold under each client's name (design-system §5.3.10). */}
                <DataTable wrapperClassName="frame-table" caption={fmt(content.openSource.caption, { date: checked })} captionVisible stickyFirstColumn className="sm:min-w-[44rem]">
                    <thead>
                        <tr>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {labels.hub.client}
                            </th>
                            {openSourceHeadings.map((heading) => (
                                <th key={heading} scope="col" className={cn(TABLE_HEAD_CELL, WIDE_COLUMN)}>
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            {
                                id: 'tablepro',
                                name: m.common.brand as ReactNode,
                                cells: [
                                    facts.licence,
                                    facts.devices,
                                    <StatusBadge status="success">{labels.status.active}</StatusBadge>,
                                    <span className="tabular-nums">
                                        {tablepro.mac !== null && fmt(labels.hub.latestValue, { version: tablepro.mac.version, date: dateLabel(dates, tablepro.mac.date) })}
                                    </span>,
                                ] as ReactNode[],
                            },
                            ...openSource.map((product) => {
                                const numbers = numbersOf(product.id);
                                const view = (text: string, sources: string[]) => (
                                    <CellContent view={{ mark: 'none', lines: [{ text }], sources }} productId={product.id} numbers={numbers} labels={labels} />
                                );

                                return {
                                    id: product.id,
                                    name: productLink(product),
                                    cells: [
                                        view(product.licence.edition ? `${product.licence.name} (${product.licence.edition})` : (product.licence.name ?? ''), [product.licence.source]),
                                        view(platformNames(product.platforms, labels), product.platformsSource ? [product.platformsSource] : []),
                                        <StatusBadge status={product.status.state === 'active' ? 'success' : 'neutral'}>{labels.status[product.status.state]}</StatusBadge>,
                                        <span className="tabular-nums">
                                            {view(
                                                fmt(labels.hub.latestValue, {
                                                    version: product.status.lastRelease.version,
                                                    date: dateLabel(dates, product.status.lastRelease.date),
                                                }),
                                                [product.status.lastRelease.source],
                                            )}
                                        </span>,
                                    ] as ReactNode[],
                                };
                            }),
                        ].map((row) => (
                            <tr key={row.id} className={TABLE_ROW}>
                                <th scope="row" className={TABLE_ROW_HEADER}>
                                    {row.name}
                                    <FoldedCells cells={openSourceHeadings.map((heading, index) => ({ heading, content: row.cells[index] }))} />
                                </th>
                                {row.cells.map((cell, index) => (
                                    <td key={index} className={cn(TABLE_CELL, WIDE_COLUMN)}>
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
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

            {/* After both tables whose markers it numbers, as the captions say: "Sources are listed at the end of the page". */}
            <Section id="sources" title={labels.sections.sources} width="text">
                <div className="space-y-4">
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
                    <p className="type-small text-muted-foreground">{labels.sources.trademarks}</p>
                </div>
            </Section>

            <GetStarted labels={labels} location="compare-hub-end" hubLink={false} />
        </LandingLayout>
    );
}
