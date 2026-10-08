/**
 * Turns a product's dated facts and TablePro's own data into the cells, lines
 * and source markers the compare pages render. Pure, with relative imports
 * only, so `node --test` loads it (tests/js/compare-model.test.ts).
 *
 * Rules it keeps (sitemap §E.3, architecture §1.8):
 *
 * - A competitor fact comes from its `comparisons.json` entry and carries the
 *   source it cites. A row with no verified cell for the product is left out,
 *   never guessed. The one derived row is iPhone and iPad: a product whose
 *   sourced platform list has no `ios` gets "No" citing that list.
 * - TablePro's column is never stored with the competitors. It is built here
 *   from pricing, platforms, paid features and facts, which the caller reads.
 * - No sentence is assembled from fragments: every phrase is one template
 *   with named slots, from the `labels` block of the hub's content file.
 * - Prices are formatted with the deterministic `formatUsd`; dates arrive
 *   already formatted by PHP (`dates`), so the server and the browser agree.
 */
import { interpolate, type Values } from '../../i18n/core.ts';
import { formatUsd, joinList, type CurrencyStyle, type ListStyle } from '../../i18n/format.ts';
import type { ComparisonCell, ComparisonPlatform, ComparisonPrice, ComparisonProduct } from '../../lib/data/comparisons.ts';
import type { CompareLabels, ContentPlural, DateLabels } from './types.ts';

/** The rows TablePro's column can be derived for, in `comparisons.json` → `rows` order. */
export const STANDARD_ROWS = ['platforms', 'price', 'licence', 'databases', 'ai', 'mcp', 'ios', 'sync', 'import'] as const;

export type StandardRow = (typeof STANDARD_ROWS)[number];

/** `yes` a tick, `no` a dash, `none` words only. */
export type Mark = 'yes' | 'no' | 'none';

export interface CellLine {
    text: string;
    /** A secondary line: a price's condition, a note shared by several prices. */
    muted?: boolean;
}

export interface CellView {
    mark: Mark;
    lines: CellLine[];
    /** Source ids in the product's `sources`, in citation order, without repeats. */
    sources: string[];
    /** The first line already says yes or no, so the mark is not read out as well. */
    worded?: boolean;
    /** An internal link under the lines (TablePro's cells only). */
    link?: { href: string; label: string };
}

export interface RowView {
    key: string;
    label: string;
    tablepro: CellView;
    /** Null when the row spans both columns (`span`). */
    competitor: CellView | null;
    /** One cell across both product columns: the import row. */
    span?: CellView;
}

/** TablePro's facts, read by the caller from `resources/data` and the catalogs. */
export interface TableProFacts {
    /** `Mac, iPhone and iPad`, already joined with the page's list style. */
    devices: string;
    /** `macOS 13 Ventura or later`, from the `platforms` catalog. */
    macRequirement: string;
    /** `iOS and iPadOS 18 or later`, or null while there is no iPhone and iPad app. */
    iosRequirement: string | null;
    macArchitectures: ('arm64' | 'x86_64')[];
    /** `activations`: the Macs one Starter license covers. */
    starter: { monthly: number; yearly: number; lifetime: number; activations: number };
    team: { monthly: number; yearly: number; lifetime: number; minSeats: number };
    /** The iPhone and iPad app is free and sells nothing. */
    iosFree: boolean;
    /** `AGPL-3.0`. */
    licence: string;
    featuredEngines: string[];
    /** The lowest plan that includes iCloud Sync on the Mac, or null if no plan does. */
    syncTier: 'starter' | 'team' | null;
    /** TablePro's importer for this product (`facts.json` → `connectionImport`), or null. */
    importer: { app: string; passwords: boolean; format: string | null } | null;
}

export interface ModelContext {
    labels: CompareLabels;
    /** The product's note texts: its page's `notes`, keyed by note id. */
    notes: Record<string, string>;
    dates: DateLabels;
    list: ListStyle;
    plural: (node: ContentPlural, count: number, values?: Values) => string;
}

export function currencyStyle(labels: CompareLabels): CurrencyStyle {
    return labels.currency;
}

/** A date from data as the page shows it; the ISO string when PHP sent no label for it. */
export function dateLabel(dates: DateLabels, iso: string | null | undefined): string {
    if (!iso) {
        return '';
    }

    return dates[iso] ?? iso;
}

/**
 * The `{token}` values every compare sentence may use: the product's name, its
 * last release, its macOS floor, what it is built with, its license, every
 * cell's version, date, value and edition, and the caller's extras (such as
 * `{starterExamples}`). A token with no value is left as written, so a typo
 * shows on the page and in tests instead of vanishing.
 */
export function productTokens(product: ComparisonProduct, dates: DateLabels, extra: Values = {}): Values {
    const values: Values = {
        name: product.name,
        'status.version': product.status.lastRelease.version,
        'status.date': dateLabel(dates, product.status.lastRelease.date),
        ...extra,
    };

    if (product.mac?.minVersion) {
        values['mac.minVersion'] = product.mac.minVersion;
    }

    if (product.technology) {
        values.technology = product.technology.name;
    }

    if (product.licence.name) {
        values.licence = product.licence.name;
    }

    for (const [key, cell] of Object.entries(product.cells)) {
        if (cell.version !== undefined) {
            values[`cells.${key}.version`] = cell.version;
        }

        if (cell.date !== undefined) {
            values[`cells.${key}.date`] = dateLabel(dates, cell.date);
        }

        if (cell.value !== undefined) {
            values[`cells.${key}.value`] = cell.value;
        }

        if (cell.edition !== undefined) {
            values[`cells.${key}.edition`] = cell.edition;
        }
    }

    return values;
}

/** A note's text with the slots of the fact that cites it: `{value}`, `{version}`, `{date}`, `{edition}`. */
export function noteText(
    context: Pick<ModelContext, 'notes' | 'dates'>,
    id: string | undefined,
    carrier: { value?: number; version?: string; date?: string; edition?: string | null },
): string | null {
    if (!id) {
        return null;
    }

    const template = context.notes[id];

    if (template === undefined) {
        return null;
    }

    const values: Values = {};

    if (carrier.value !== undefined) {
        values.value = carrier.value;
    }

    if (carrier.version !== undefined) {
        values.version = carrier.version;
    }

    if (carrier.date !== undefined) {
        values.date = dateLabel(context.dates, carrier.date);
    }

    if (carrier.edition) {
        values.edition = carrier.edition;
    }

    return interpolate(template, values);
}

function unique<T>(items: T[]): T[] {
    return [...new Set(items)];
}

function cellSources(cell: Pick<ComparisonCell, 'source'>): string[] {
    return typeof cell.source === 'string' ? [cell.source] : cell.source;
}

/**
 * The source ids behind a list item's `cite` entries: `platforms`, `licence`,
 * `status`, `mac`, `technology`, `prices` or `cells.{key}`. An entry that
 * names nothing in the data is ignored here; `CompareContentTest` rejects it.
 */
export function citedSources(product: ComparisonProduct, cite: readonly string[]): string[] {
    const ids: string[] = [];

    for (const entry of cite) {
        if (entry.startsWith('cells.')) {
            const cell = product.cells[entry.slice('cells.'.length)];

            if (cell) {
                ids.push(...cellSources(cell));
            }

            continue;
        }

        switch (entry) {
            case 'platforms':
                if (product.platformsSource) {
                    ids.push(product.platformsSource);
                }
                break;
            case 'licence':
                ids.push(product.licence.source);
                break;
            case 'status':
                ids.push(product.status.lastRelease.source);
                break;
            case 'mac':
                if (product.mac) {
                    ids.push(product.mac.source);
                }
                break;
            case 'technology':
                if (product.technology) {
                    ids.push(product.technology.source);
                }
                break;
            case 'prices':
                ids.push(...product.prices.map((price) => price.source));
                break;
        }
    }

    return unique(ids);
}

/** Whether a `cite` entry names a fact the product's data has. */
export function isCitable(product: ComparisonProduct, entry: string): boolean {
    return citedSources(product, [entry]).length > 0;
}

/** One cell of a product's data, in words. */
export function cellView(product: ComparisonProduct, cell: ComparisonCell, context: ModelContext): CellView {
    const { labels } = context;
    const lines: CellLine[] = [];
    const note = noteText(context, cell.note, cell);

    if (note !== null) {
        lines.push({ text: note });
    } else if (cell.edition && cell.state === 'qualified') {
        lines.push({ text: interpolate(labels.cell.edition, { edition: cell.edition }) });
    } else if (cell.value !== undefined && cell.version === undefined) {
        lines.push({ text: String(cell.value) });
    } else if (cell.state === 'qualified' && cell.version === undefined) {
        lines.push({ text: labels.cell.partial });
    }

    // A note that already names the version ("Version {version} is in
    // development") must not be followed by "Since version …".
    const noteNamesVersion = cell.note !== undefined && (context.notes[cell.note] ?? '').includes('{version}');

    if (cell.version !== undefined && !noteNamesVersion) {
        lines.push({
            text: cell.date
                ? interpolate(labels.cell.sinceDated, { version: cell.version, date: dateLabel(context.dates, cell.date) })
                : interpolate(labels.cell.since, { version: cell.version }),
            muted: note !== null,
        });
    }

    return {
        mark: cell.state === 'qualified' ? 'none' : cell.state,
        lines,
        sources: cellSources(cell),
    };
}

/** The platform names a product's data lists, joined for a table cell. */
export function platformNames(platforms: readonly ComparisonPlatform[], labels: CompareLabels): string {
    return platforms.map((platform) => labels.platforms[platform]).join(', ');
}

/**
 * How a Mac app runs on each architecture: separate builds, one universal
 * app, or one architecture only. `universal` is set in the data only where the
 * vendor ships a single app for both, so "separate builds" is never claimed
 * for it.
 */
function buildsLabel(architectures: readonly ('arm64' | 'x86_64')[], labels: CompareLabels, universal = false): string | null {
    if (architectures.includes('arm64') && architectures.includes('x86_64')) {
        return universal ? labels.builds.universal : labels.builds.both;
    }

    if (architectures.length === 1) {
        return labels.builds[architectures[0]];
    }

    return null;
}

/** "$99 once per license, for one device": a price's amount, period, unit and quantity. */
export function priceValue(price: ComparisonPrice, context: ModelContext): string {
    const { labels } = context;

    if (price.amount === 0) {
        return labels.price.free;
    }

    const amount = formatUsd(price.amount, currencyStyle(labels));
    const period = price.kind === 'renewal' || price.period === null ? 'none' : price.period;
    let text = interpolate(labels.price.amount[period], { amount });

    text = interpolate(labels.price.per[price.per ?? 'none'], { price: text });

    if (price.units !== undefined) {
        text = context.plural(labels.price.units, price.units, { price: text });
    }

    if (price.minUnits !== undefined) {
        text = context.plural(labels.price.minUnits, price.minUnits, { price: text });
    }

    return text;
}

/** What a price is for: an edition, an audience, the iPhone app, a store, a renewal; null for a plain free tier. */
export function priceLabel(price: ComparisonPrice, labels: CompareLabels): string | null {
    let label: string | null =
        price.edition ??
        (price.audience ? labels.price.audience[price.audience] : null) ??
        (price.platform === 'ios' ? labels.price.ios : null) ??
        (price.channel === 'mac-app-store' ? labels.price.macAppStore : null) ??
        (price.kind === 'renewal' ? labels.price.renewal : null);

    if (label !== null && price.continuityYear !== undefined) {
        const year = labels.price.continuity[String(price.continuityYear) as keyof CompareLabels['price']['continuity']];

        if (year !== undefined) {
            label = interpolate(labels.price.withContinuity, { label, year });
        }
    }

    return label;
}

/** One price as a table line: `Basic: $99 once per license, for one device`. */
export function priceLine(price: ComparisonPrice, context: ModelContext): string {
    const value = priceValue(price, context);
    const label = priceLabel(price, context.labels);

    return label === null ? value : interpolate(context.labels.price.labelled, { label, price: value });
}

/**
 * Every price a product's data lists, in data order. A note used by one price
 * follows that price; a note several prices share is printed once, after the
 * last of them.
 */
export function priceCell(product: ComparisonProduct, context: ModelContext): CellView {
    const counts = new Map<string, number>();

    for (const price of product.prices) {
        if (price.note) {
            counts.set(price.note, (counts.get(price.note) ?? 0) + 1);
        }
    }

    const lines: CellLine[] = [];
    const seen = new Map<string, number>();

    product.prices.forEach((price) => {
        lines.push({ text: priceLine(price, context) });

        if (!price.note) {
            return;
        }

        const total = counts.get(price.note) ?? 0;
        const index = (seen.get(price.note) ?? 0) + 1;

        seen.set(price.note, index);

        if (index === total) {
            const text = noteText(context, price.note, { value: price.value, edition: price.edition });

            if (text !== null) {
                lines.push({ text, muted: true });
            }
        }
    });

    return { mark: 'none', lines, sources: unique(product.prices.map((price) => price.source)) };
}

/** The product's free tier, if it has one: the first price of zero. */
export function freeTier(product: Pick<ComparisonProduct, 'prices'>): ComparisonPrice | null {
    return product.prices.find((price) => price.amount === 0) ?? null;
}

/**
 * The cheapest way in for a working professional: the paid price with the
 * lowest first payment (its amount times its minimum seats) that is not a
 * renewal, not the iPhone app, not a store copy and not limited to students or
 * non-commercial use. Null when the product sells nothing.
 */
export function entryPrice(product: Pick<ComparisonProduct, 'prices'>): ComparisonPrice | null {
    const candidates = product.prices.filter(
        (price) =>
            price.amount > 0 &&
            price.kind === undefined &&
            price.platform === undefined &&
            price.channel === undefined &&
            price.audience !== 'student' &&
            price.audience !== 'non-commercial',
    );

    if (candidates.length === 0) {
        return null;
    }

    const outlay = (price: ComparisonPrice): number => price.amount * (price.minUnits ?? 1);

    return candidates.reduce((lowest, price) => (outlay(price) < outlay(lowest) ? price : lowest));
}

function competitorPlatforms(product: ComparisonProduct, context: ModelContext): CellView | null {
    const { labels } = context;

    if (product.platforms.length === 0) {
        return null;
    }

    const lines: CellLine[] = [{ text: platformNames(product.platforms, labels) }];
    const sources = product.platformsSource ? [product.platformsSource] : [];

    if (product.mac) {
        if (product.mac.minVersion) {
            lines.push({ text: interpolate(labels.macRequirement, { version: product.mac.minVersion }), muted: true });
        }

        const builds = buildsLabel(product.mac.architectures, labels, product.mac.universal === true);

        if (builds !== null) {
            lines.push({ text: builds, muted: true });
        }

        sources.push(product.mac.source);
    }

    return { mark: 'none', lines, sources: unique(sources) };
}

/**
 * The iPhone and iPad row: the product's own cell, or a yes or no derived from
 * its sourced platform list. A web application is left out of the derived
 * row, because it opens in a phone's browser; "No" would mislead.
 */
function competitorIos(product: ComparisonProduct, context: ModelContext): CellView | null {
    const cell = product.cells.ios;

    if (cell) {
        return cellView(product, cell, context);
    }

    if (!product.platformsSource || product.platforms.includes('web')) {
        return null;
    }

    return {
        mark: product.platforms.includes('ios') ? 'yes' : 'no',
        lines: [],
        sources: [product.platformsSource],
    };
}

function competitorLicence(product: ComparisonProduct, context: ModelContext): CellView {
    const { labels } = context;
    const { name, openSource, edition } = product.licence;

    if (!openSource || name === null) {
        return { mark: 'no', lines: [{ text: labels.licence.no }], sources: [product.licence.source], worded: true };
    }

    return {
        mark: 'yes',
        lines: [{ text: interpolate(edition ? labels.licence.yesEdition : labels.licence.yes, { licence: name, edition: edition ?? '' }) }],
        sources: [product.licence.source],
        worded: true,
    };
}

/** TablePro's side of a standard row, from its own data. */
export function tableproCell(row: Exclude<StandardRow, 'import'> | 'technology', facts: TableProFacts, context: ModelContext): CellView {
    const { labels } = context;
    const t = labels.tablepro;
    const money = (amount: number): string => formatUsd(amount, currencyStyle(labels));

    switch (row) {
        case 'platforms': {
            const lines: CellLine[] = [{ text: facts.devices }, { text: facts.macRequirement, muted: true }];
            const builds = buildsLabel(facts.macArchitectures, labels);

            if (builds !== null) {
                lines.push({ text: builds, muted: true });
            }

            if (facts.iosRequirement !== null) {
                lines.push({ text: facts.iosRequirement, muted: true });
            }

            return { mark: 'none', lines, sources: [] };
        }
        case 'technology':
            return { mark: 'none', lines: [{ text: t.technology }], sources: [] };
        case 'price': {
            const lines: CellLine[] = [
                { text: t.priceFree },
                {
                    // Built like a competitor's line, device limit included, so the two columns compare.
                    text: interpolate(labels.price.labelled, {
                        label: labels.tiers.starter,
                        price: context.plural(labels.price.units, facts.starter.activations, {
                            price: interpolate(t.starter, {
                                monthly: money(facts.starter.monthly),
                                yearly: money(facts.starter.yearly),
                                lifetime: money(facts.starter.lifetime),
                            }),
                        }),
                    }),
                },
                {
                    text: interpolate(labels.price.labelled, {
                        label: labels.tiers.team,
                        price: interpolate(t.team, {
                            monthly: money(facts.team.monthly),
                            yearly: money(facts.team.yearly),
                            lifetime: money(facts.team.lifetime),
                            min: facts.team.minSeats,
                        }),
                    }),
                },
            ];

            if (facts.iosFree) {
                lines.push({ text: t.iosPrice, muted: true });
            }

            return { mark: 'none', lines, sources: [], link: { href: '/pricing', label: labels.cta.pricing } };
        }
        case 'licence':
            return { mark: 'yes', lines: [{ text: interpolate(t.licence, { licence: facts.licence }) }], sources: [], worded: true };
        case 'databases':
            return {
                mark: 'none',
                lines: [{ text: interpolate(t.databases, { engines: facts.featuredEngines.join(', ') }) }],
                sources: [],
                link: { href: '/databases', label: t.databasesLink },
            };
        case 'ai':
            return { mark: 'yes', lines: [{ text: t.ai }], sources: [] };
        case 'mcp':
            return { mark: 'yes', lines: [{ text: t.mcp }], sources: [] };
        case 'ios': {
            const lines: CellLine[] = [{ text: t.ios }];

            if (facts.iosRequirement !== null) {
                lines.push({ text: facts.iosRequirement, muted: true });
            }

            return { mark: facts.iosRequirement !== null ? 'yes' : 'no', lines, sources: [] };
        }
        case 'sync':
            return facts.syncTier === null
                ? { mark: 'no', lines: [], sources: [] }
                : { mark: 'none', lines: [{ text: interpolate(t.sync, { tier: labels.tiers[facts.syncTier] }) }], sources: [] };
    }
}

/** The import row: one sentence across both columns, from `facts.json` → `connectionImport`. */
export function importCell(product: ComparisonProduct, facts: TableProFacts, context: ModelContext): CellView {
    const { labels } = context;
    const importer = facts.importer;
    let text: string;

    if (importer === null) {
        text = interpolate(labels.import.none, { name: product.name });
    } else if (!importer.passwords) {
        text = interpolate(labels.import.noPasswords, { name: product.name });
    } else if (importer.format !== null) {
        text = interpolate(labels.import.yesFile, { name: product.name, format: importer.format });
    } else {
        text = interpolate(labels.import.yes, { name: product.name });
    }

    return {
        mark: importer === null ? 'no' : 'yes',
        lines: [{ text }],
        sources: [],
        link: importer === null ? undefined : { href: '#switching', label: labels.import.link },
    };
}

/**
 * The "At a glance" rows in data order. A row the product has no verified
 * fact for is left out; a `technology` row follows the platforms when the data
 * says what the product is built with.
 */
export function glanceRows(product: ComparisonProduct, rows: readonly string[], facts: TableProFacts, context: ModelContext): RowView[] {
    const { labels } = context;
    const views: RowView[] = [];

    for (const key of rows) {
        let competitor: CellView | null = null;

        switch (key) {
            case 'platforms':
                competitor = competitorPlatforms(product, context);
                break;
            case 'price':
                competitor = product.prices.length > 0 ? priceCell(product, context) : null;
                break;
            case 'licence':
                competitor = competitorLicence(product, context);
                break;
            case 'ios':
                competitor = competitorIos(product, context);
                break;
            case 'import':
                views.push({
                    key,
                    label: labels.rows.import,
                    tablepro: importCell(product, facts, context),
                    competitor: null,
                    span: importCell(product, facts, context),
                });
                continue;
            default: {
                const cell = product.cells[key];
                competitor = cell ? cellView(product, cell, context) : null;
            }
        }

        if (competitor === null || !isStandardRow(key)) {
            continue;
        }

        views.push({
            key,
            label: labels.rows[key as keyof CompareLabels['rows']],
            tablepro: tableproCell(key as Exclude<StandardRow, 'import'>, facts, context),
            competitor,
        });

        if (key === 'platforms' && product.technology) {
            const note = noteText(context, product.technology.note ?? undefined, {});

            views.push({
                key: 'technology',
                label: labels.rows.technology,
                tablepro: tableproCell('technology', facts, context),
                competitor: {
                    mark: 'none',
                    lines: [{ text: product.technology.name }, ...(note !== null ? [{ text: note, muted: true }] : [])],
                    sources: [product.technology.source],
                },
            });
        }
    }

    return views;
}

export function isStandardRow(key: string): key is StandardRow {
    return (STANDARD_ROWS as readonly string[]).includes(key);
}

/** The product's cells that are not standard rows, in data order: the "More about {name}" group. */
export function extraCellKeys(product: Pick<ComparisonProduct, 'cells'>): string[] {
    return Object.keys(product.cells).filter((key) => !isStandardRow(key));
}

/** The "More about {name}" rows: each extra cell, with TablePro's side in words from the page's `rows`. */
export function extraRows(
    product: ComparisonProduct,
    copy: Record<string, { label: string; tablepro: string }>,
    context: ModelContext,
    values: Values = {},
): RowView[] {
    return extraCellKeys(product)
        .filter((key) => copy[key] !== undefined)
        .map((key) => ({
            key,
            label: copy[key].label,
            tablepro: { mark: 'none', lines: [{ text: interpolate(copy[key].tablepro, values) }], sources: [] },
            competitor: cellView(product, product.cells[key], context),
        }));
}

/** `1`-based numbers for a product's sources, in the order its data lists them. */
export function sourceNumbers(product: Pick<ComparisonProduct, 'sources'>): Map<string, number> {
    return new Map(product.sources.map((source, index) => [source.id, index + 1]));
}

/** The fragment a source marker links to: `source-tableplus-s2`. */
export function sourceAnchor(productId: string, sourceId: string): string {
    return `source-${productId}-${sourceId}`;
}

/** Joins names for a sentence during SSR, with the page's list style. */
export function joinNames(names: readonly string[], style: ListStyle): string {
    return joinList(names, style);
}

/** The sources a hub row cites: platforms, license, last release, the free tier and the entry price. */
export function hubCitations(product: Pick<ComparisonProduct, 'platformsSource' | 'licence' | 'status' | 'prices' | 'mac'>): string[] {
    const ids: string[] = [];
    const free = freeTier(product);
    const entry = entryPrice(product);

    if (product.platformsSource) {
        ids.push(product.platformsSource);
    }

    ids.push(product.licence.source, product.status.lastRelease.source);

    if (free !== null) {
        ids.push(free.source);
    }

    if (entry !== null) {
        ids.push(entry.source);
    }

    return unique(ids);
}

export interface NumberedSources {
    productId: string;
    /** The first number of this product's entries. */
    start: number;
    /** Only the cited sources, in the order the product's data lists them. */
    sources: ComparisonProduct['sources'];
    numbers: Map<string, number>;
}

/**
 * One numbered list across several products, for the hub: each product's
 * cited sources in data order, numbered on from the previous product's.
 */
export function numberSources(products: readonly Pick<ComparisonProduct, 'id' | 'sources' | 'platformsSource' | 'licence' | 'status' | 'prices' | 'mac'>[]): NumberedSources[] {
    let next = 1;

    return products.map((product) => {
        const cited = new Set(hubCitations(product));
        const sources = product.sources.filter((source) => cited.has(source.id));
        const start = next;
        const numbers = new Map(sources.map((source, index) => [source.id, start + index]));

        next += sources.length;

        return { productId: product.id, start, sources, numbers };
    });
}
