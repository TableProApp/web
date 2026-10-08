import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { interpolate } from '../../resources/js/i18n/core.ts';
import {
    cellView,
    citedSources,
    entryPrice,
    extraCellKeys,
    glanceRows,
    importCell,
    noteText,
    numberSources,
    priceCell,
    productTokens,
    tableproCell,
    type ModelContext,
    type TableProFacts,
} from '../../resources/js/components/compare/model.ts';

/*
 * The compare pages' cells. Facts about other products come only from
 * comparisons.json and keep their source; a row with no verified cell is left
 * out; TablePro's prices come from pricing.json; nothing is glued from
 * fragments, and prices are formatted the same way on server and client.
 */
const read = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

const comparisons = read('../../resources/data/comparisons.json');
const pricing = read('../../resources/data/pricing.json');
const hub = { en: read('../../resources/data/content/en/compare/index.json'), vi: read('../../resources/data/content/vi/compare/index.json') };
const pages = {
    en: { tableplus: read('../../resources/data/content/en/compare/tableplus.json') },
    vi: { tableplus: read('../../resources/data/content/vi/compare/tableplus.json') },
};

const product = (id: string) => comparisons.products.find((entry: { id: string }) => entry.id === id);

function context(locale: 'en' | 'vi', notes: Record<string, string> = {}): ModelContext {
    return {
        labels: hub[locale].labels,
        notes,
        dates: { '2026-06-10': locale === 'en' ? 'June 10, 2026' : '10 tháng 6 năm 2026' },
        list: locale === 'en' ? { separator: ', ', last: ' and ' } : { separator: ', ', last: ' và ' },
        plural: (node, count, values = {}) => interpolate(count === 1 ? node.one : node.other, { count, ...values }),
    };
}

const facts: TableProFacts = {
    devices: 'Mac, iPhone and iPad',
    macRequirement: 'macOS 13 Ventura or later',
    iosRequirement: 'iOS and iPadOS 18 or later',
    macArchitectures: ['arm64', 'x86_64'],
    starter: { ...pricing.tiers.starter.prices, activations: pricing.tiers.starter.activations },
    team: { ...pricing.tiers.team.prices, minSeats: pricing.tiers.team.seats.min },
    iosFree: true,
    licence: 'AGPL-3.0',
    featuredEngines: ['PostgreSQL', 'MySQL'],
    syncTier: 'starter',
    importer: { app: 'TablePlus', passwords: true, format: null },
};

test('lists every price in data order, with a shared note once after its last price', () => {
    const cell = priceCell(product('tableplus'), context('en', pages.en.tableplus.notes));
    const texts = cell.lines.map((line) => line.text);

    assert.equal(texts[0], 'Free');
    assert.equal(texts[1], 'No time limit, but at most 2 open tabs, 2 windows and 2 advanced filters at a time');
    assert.equal(cell.lines[1].muted, true);
    assert.ok(texts.includes('Basic: $99 once per license, for one device'));
    assert.ok(texts.includes('Standard: $129 once per license, for up to 2 devices'));
    assert.ok(texts.includes('Team: $79 once per seat, at least 3 seats'));
    assert.ok(texts.includes('Renewal: $59 per device'));
    assert.ok(texts.includes('iPhone and iPad app: $3.99 a month'));
    assert.equal(texts.filter((text) => text.startsWith('Paid once, with a year of updates')).length, 1);
    assert.equal(texts.indexOf('Paid once, with a year of updates. The app keeps working after that.'), texts.indexOf('Team: $79 once per seat, at least 3 seats') + 1);
    assert.deepEqual(cell.sources, ['s2', 's5']);
});

test('writes Vietnamese prices in US dollars with Vietnamese separators', () => {
    const texts = priceCell(product('tableplus'), context('vi', pages.vi.tableplus.notes)).lines.map((line) => line.text);

    assert.ok(texts.includes('Basic: 99\u00a0US$ mua một lần cho mỗi license, dùng trên một thiết bị'));
    assert.ok(texts.includes('Ứng dụng cho iPhone và iPad: 3,99\u00a0US$ mỗi tháng'));
});

test('picks the cheapest professional way in for the hub', () => {
    assert.equal(entryPrice(product('tableplus'))?.amount, 99);
    assert.equal(entryPrice(product('datagrip'))?.amount, 10.9);
    assert.equal(entryPrice(product('navicat'))?.amount, 74.99, 'a subscription is the cheapest way in, and the non-commercial edition is not a professional price');
    assert.equal(entryPrice(product('navicat'))?.period, 'month');
    assert.equal(entryPrice(product('sequel-ace')), null);
    assert.equal(entryPrice(product('dbgate'))?.edition, 'Premium', 'a team edition with a seat minimum costs more up front');
    assert.equal(entryPrice(product('dbgate'))?.period, 'month');
    assert.equal(entryPrice(product('pgadmin')), null);
});

test('leaves out a row the product has no verified fact for, and derives iPhone and iPad from the sourced platforms', () => {
    const dbeaver = glanceRows(product('dbeaver'), comparisons.rows, facts, context('en'));
    const keys = dbeaver.map((row) => row.key);

    assert.deepEqual(keys, ['platforms', 'technology', 'price', 'licence', 'databases', 'ai', 'mcp', 'ios', 'sync', 'import']);
    assert.deepEqual(dbeaver.find((row) => row.key === 'ios')?.competitor, { mark: 'no', lines: [], sources: ['s1'] });

    const tableplus = glanceRows(product('tableplus'), comparisons.rows, facts, context('en'));
    const datagrip = glanceRows(product('datagrip'), comparisons.rows, facts, context('en'));

    assert.ok(!datagrip.some((row) => row.key === 'sync'), 'DataGrip has no verified sync fact');
    assert.ok(tableplus.some((row) => row.key === 'sync'), 'TablePlus syncs through a cloud folder');
    assert.ok(!tableplus.some((row) => row.key === 'technology'));

    const workbench = glanceRows(product('mysql-workbench'), comparisons.rows, facts, context('en'));
    const platforms = workbench.find((row) => row.key === 'platforms')?.competitor?.lines.map((line) => line.text);

    assert.ok(platforms?.includes('Apple silicon only'), 'the new Workbench ships a Mac build for Apple silicon only');
    assert.ok(!workbench.some((row) => row.key === 'ai' || row.key === 'mcp'), 'no source states AI or MCP for MySQL Workbench');
});

test('derives no iPhone and iPad row for a web application, which opens in a phone’s browser', () => {
    const phpmyadmin = glanceRows(product('phpmyadmin'), comparisons.rows, facts, context('en'));

    assert.ok(product('phpmyadmin').platforms.includes('web'));
    assert.ok(!phpmyadmin.some((row) => row.key === 'ios'));
});

test('adds no "since version" line under a note that already names the version', () => {
    const notes = { 'phpmyadmin-in-development': 'Version {version} is in development' };
    const cell = product('phpmyadmin').cells.nextMajor;

    assert.ok(cell && cell.version !== undefined && cell.note === 'phpmyadmin-in-development');

    const view = cellView(product('phpmyadmin'), cell, context('en', notes));

    assert.deepEqual(
        view.lines.map((line) => line.text),
        [`Version ${cell.version} is in development`],
    );
});

test('builds TablePro’s price cell from pricing.json, never a bare "Free"', () => {
    const cell = tableproCell('price', facts, context('en'));

    assert.equal(cell.lines[0].text, hub.en.labels.tablepro.priceFree);
    assert.equal(
        cell.lines[1].text,
        `Starter: $${pricing.tiers.starter.prices.monthly} a month, $${pricing.tiers.starter.prices.yearly} a year or $${pricing.tiers.starter.prices.lifetime} once, for up to ${pricing.tiers.starter.activations} devices`,
    );
    assert.ok(pricing.tiers.starter.activations > 1, 'the sentence above is the plural form');
    assert.match(cell.lines[2].text, new RegExp(`at least ${pricing.tiers.team.seats.min} seats$`));
    assert.notEqual(cell.lines[0].text, 'Free');
});

test('states the importer from facts, or that there is none', () => {
    assert.equal(importCell(product('tableplus'), facts, context('en')).lines[0].text, 'TablePro imports TablePlus connections, including saved passwords.');
    assert.equal(
        importCell(product('heidisql'), { ...facts, importer: null }, context('en')).lines[0].text,
        'TablePro has no importer for HeidiSQL.',
    );
    assert.equal(
        importCell(product('navicat'), { ...facts, importer: { app: 'Navicat', passwords: true, format: '.ncx' } }, context('en')).lines[0].text,
        `TablePro imports ${product('navicat').name} connections from a .ncx file you export in ${product('navicat').name}, including saved passwords.`,
    );
});

test('resolves citations to the product’s own source ids', () => {
    assert.deepEqual(citedSources(product('tableplus'), ['platforms', 'cells.diagram', 'prices', 'cells.nope']), ['s1', 's3', 's2', 's5']);
});

test('cites every source of a fact that no single page states', () => {
    const dbeaver = product('dbeaver');
    const view = cellView(dbeaver, dbeaver.cells.mcp, context('en', { 'dbeaver-mcp-server': 'From version {version}' }));

    assert.ok(Array.isArray(dbeaver.cells.mcp.source) && dbeaver.cells.mcp.source.length > 1);
    assert.deepEqual(view.sources, dbeaver.cells.mcp.source);
    assert.deepEqual(view.lines.map((line) => line.text), ['From version 26.3'], 'the note names the version, so no "since" line follows');
    assert.deepEqual(citedSources(dbeaver, ['cells.mcp', 'cells.sync']), [...dbeaver.cells.mcp.source, dbeaver.cells.sync.source]);
});

test('does not read a mark aloud when the cell’s words already say yes or no', () => {
    const rows = glanceRows(product('tableplus'), comparisons.rows, facts, context('en'));
    const licence = rows.find((row) => row.key === 'licence');

    assert.equal(licence?.competitor?.worded, true);
    assert.equal(licence?.tablepro.worded, true);
    assert.equal(rows.find((row) => row.key === 'mcp')?.competitor?.worded, undefined);
    assert.deepEqual([hub.en.labels.cell.yes, hub.en.labels.cell.no], ['Yes', 'No']);
});

test('fills a note with the slots of the fact that cites it', () => {
    const tableplus = product('tableplus');

    assert.equal(noteText(context('en', pages.en.tableplus.notes), 'tableplus-safe-mode-levels', tableplus.cells.safeMode), '5 levels, with Touch ID support');
    assert.equal(noteText(context('en', {}), 'missing', {}), null);
});

test('offers the cells’ versions and dates as tokens, with dates as PHP formatted them', () => {
    const tokens = productTokens(product('tableplus'), { '2026-06-10': 'June 10, 2026' });

    assert.equal(tokens['cells.mcp.version'], '7.1.8');
    assert.equal(tokens['cells.mcp.date'], 'June 10, 2026');
    assert.equal(tokens.name, 'TablePlus');
});

test('keeps product-specific facts out of the standard rows', () => {
    assert.deepEqual(extraCellKeys(product('tableplus')), ['diagram', 'excelExport', 'safeMode', 'setapp']);
});

test('numbers the hub’s cited sources consecutively across products', () => {
    const numbered = numberSources([product('tableplus'), product('dbeaver')]);

    assert.equal(numbered[0].start, 1);
    assert.equal(numbered[1].start, numbered[0].sources.length + 1);
    assert.ok(numbered.every((entry) => entry.sources.length === entry.numbers.size));
});

test('calls a single app for both architectures universal, and keeps "separate builds" for products that ship one per architecture', () => {
    const lines = (id: string, locale: 'en' | 'vi' = 'en') =>
        glanceRows(product(id), comparisons.rows, facts, context(locale))
            .find((row) => row.key === 'platforms')
            ?.competitor?.lines.map((line) => line.text) ?? [];

    // Sequel Ace ships one zip with no per-architecture asset; Postico offers one download.
    for (const id of ['sequel-ace', 'postico']) {
        assert.ok(lines(id).includes(hub.en.labels.builds.universal), `${id} is one universal app`);
        assert.ok(!lines(id).includes(hub.en.labels.builds.both), `${id} must not claim separate builds`);
        assert.ok(lines(id, 'vi').includes(hub.vi.labels.builds.universal));
    }

    assert.ok(lines('dbeaver').includes(hub.en.labels.builds.both), 'DBeaver ships a DMG per architecture');
});

