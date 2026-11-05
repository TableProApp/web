import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { interpolate } from '../../resources/js/i18n/core.ts';
import { formatUsd } from '../../resources/js/i18n/format.ts';
import type { ComparisonCell, ComparisonPrice, ComparisonProduct } from '../../resources/js/lib/data/comparisons.ts';
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
    priceLine,
    productTokens,
    tableproCell,
    type ModelContext,
    type TableProFacts,
} from '../../resources/js/components/compare/model.ts';

const read = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

const rows: string[] = read('../../resources/data/comparisons.json').rows;
const labels = read('../../resources/data/content/en/compare/index.json').labels;

function context(notes: Record<string, string> = {}): ModelContext {
    return {
        labels,
        notes,
        dates: { '2026-06-10': 'June 10, 2026' },
        list: { separator: ', ', last: ' and ' },
        plural: (node, count, values = {}) => interpolate(count === 1 ? node.one : node.other, { count, ...values }),
    };
}

function price(amount: number, extra: Partial<ComparisonPrice> = {}): ComparisonPrice {
    return { edition: null, amount, currency: 'USD', per: null, period: 'once', source: 's2', ...extra };
}

function product(extra: Partial<ComparisonProduct> = {}): ComparisonProduct {
    return {
        id: 'acme',
        name: 'Acme',
        slug: 'acme',
        checkedAt: '2026-06-10',
        status: { state: 'active', lastRelease: { version: '1.0', date: '2026-06-10', source: 's3' } },
        platforms: ['mac', 'windows'],
        platformsSource: 's1',
        mac: { minVersion: '13', architectures: ['arm64', 'x86_64'], source: 's1' },
        technology: null,
        licence: { name: null, openSource: false, edition: null, source: 's4' },
        prices: [price(0, { source: 's2' })],
        cells: { ai: { state: 'yes', source: 's5' } },
        sources: ['s1', 's2', 's3', 's4', 's5', 's6'].map((id) => ({ id, url: `https://acme.example/${id}`, title: id, retrievedAt: '2026-06-10' })),
        ...extra,
    };
}

const facts: TableProFacts = {
    devices: 'Mac, iPhone and iPad',
    macRequirement: 'macOS 13 or later',
    iosRequirement: 'iOS 18 or later',
    macArchitectures: ['arm64', 'x86_64'],
    macUniversal: true,
    starter: { monthly: 5, yearly: 40, lifetime: 80, activations: 3 },
    team: { monthly: 12, yearly: 120, minSeats: 2 },
    iosFree: true,
    licence: 'AGPL-3.0',
    featuredEngines: ['PostgreSQL', 'MySQL'],
    syncTier: 'starter',
    importer: { app: 'Acme', passwords: true, format: null },
};

const row = (subject: ComparisonProduct, key: string, overrides: Partial<TableProFacts> = {}) =>
    glanceRows(subject, rows, { ...facts, ...overrides }, context()).find((view) => view.key === key);

test('lists every price in data order, with a shared note once after its last price', () => {
    const prices = [
        price(0, { source: 's1' }),
        price(10, { note: 'shared', source: 's2' }),
        price(20, { note: 'shared', source: 's2' }),
        price(5, { period: 'month', source: 's3' }),
    ];
    const ctx = context({ shared: 'A shared note' });
    const cell = priceCell(product({ prices }), ctx);

    assert.deepEqual(cell.lines, [
        { text: priceLine(prices[0], ctx) },
        { text: priceLine(prices[1], ctx) },
        { text: priceLine(prices[2], ctx) },
        { text: 'A shared note', muted: true },
        { text: priceLine(prices[3], ctx) },
    ]);
    assert.deepEqual(cell.sources, ['s1', 's2', 's3']);
});

test('picks the cheapest professional way in for the hub', () => {
    const prices = [
        price(0),
        price(1, { kind: 'renewal' }),
        price(2, { audience: 'student' }),
        price(3, { audience: 'non-commercial' }),
        price(4, { platform: 'ios' }),
        price(30, { minUnits: 3 }),
        price(79),
    ];

    assert.equal(entryPrice({ prices })?.amount, 79, 'a seat minimum counts toward the outlay');
    assert.equal(entryPrice({ prices: [price(0), price(1, { audience: 'student' })] }), null);
});

test('leaves out a row the product has no verified fact for, and derives iPhone and iPad from the sourced platforms', () => {
    const keys = glanceRows(product(), rows, facts, context()).map((view) => view.key);

    assert.ok(keys.includes('ai'));
    assert.ok(!keys.includes('mcp') && !keys.includes('sync'));
    assert.deepEqual(row(product(), 'ios')?.competitor, { mark: 'no', lines: [], sources: ['s1'] });
    assert.equal(row(product({ platforms: ['mac', 'ios'] }), 'ios')?.competitor?.mark, 'yes');
});

test('derives no iPhone and iPad row for a web application, which opens in a phone’s browser', () => {
    assert.equal(row(product({ platforms: ['web'] }), 'ios'), undefined);
});

test('adds a technology row after the platforms when the data names one', () => {
    const keys = glanceRows(product({ technology: { name: 'Java', note: null, source: 's6' } }), rows, facts, context()).map((view) => view.key);

    assert.equal(keys.indexOf('technology'), keys.indexOf('platforms') + 1);
});

test('adds no "since version" line under a note that already names the version', () => {
    const cell: ComparisonCell = { state: 'qualified', version: '6.0', note: 'in-development', source: 's5' };
    const view = cellView(product(), cell, context({ 'in-development': 'Version {version} is in development' }));

    assert.deepEqual(view.lines.map((line) => line.text), ['Version 6.0 is in development']);
});

test('builds TablePro’s price cell from the facts it is given', () => {
    const cell = tableproCell('price', facts, context());
    const money = (amount: number) => formatUsd(amount, labels.currency);

    assert.equal(cell.lines[0].text, labels.tablepro.priceFree);

    for (const amount of [facts.starter.monthly, facts.starter.yearly, facts.starter.lifetime]) {
        assert.ok(cell.lines[1].text.includes(money(amount)), cell.lines[1].text);
    }

    for (const amount of [facts.team.monthly, facts.team.yearly]) {
        assert.ok(cell.lines[2].text.includes(money(amount)), cell.lines[2].text);
    }

    assert.equal(cell.link?.href, '/pricing');
});

test('states the importer from facts, or that there is none', () => {
    const line = (importer: TableProFacts['importer']) => importCell(product(), { ...facts, importer }, context()).lines[0].text;

    assert.equal(line(null), interpolate(labels.import.none, { name: 'Acme' }));
    assert.equal(line({ app: 'Acme', passwords: true, format: null }), interpolate(labels.import.yes, { name: 'Acme' }));
    assert.equal(line({ app: 'Acme', passwords: false, format: null }), interpolate(labels.import.noPasswords, { name: 'Acme' }));
    assert.equal(line({ app: 'Acme', passwords: true, format: '.ncx' }), interpolate(labels.import.yesFile, { name: 'Acme', format: '.ncx' }));
    assert.equal(importCell(product(), { ...facts, importer: null }, context()).mark, 'no');
});

test('resolves citations to the product’s own source ids, once each', () => {
    const subject = product({ cells: { diagram: { state: 'yes', source: 's5' } } });

    assert.deepEqual(citedSources(subject, ['platforms', 'cells.diagram', 'prices', 'cells.nope', 'mac']), ['s1', 's5', 's2']);
});

test('cites every source of a fact that no single page states', () => {
    const cell: ComparisonCell = { state: 'yes', version: '2.0', note: 'since', source: ['s5', 's6'] };
    const subject = product({ cells: { mcp: cell } });
    const view = cellView(subject, cell, context({ since: 'From version {version}' }));

    assert.deepEqual(view.sources, ['s5', 's6']);
    assert.deepEqual(view.lines.map((line) => line.text), ['From version 2.0']);
    assert.deepEqual(citedSources(subject, ['cells.mcp']), ['s5', 's6']);
});

test('does not read a mark aloud when the cell’s words already say yes or no', () => {
    const subject = product({ cells: { mcp: { state: 'yes', source: 's5' } } });

    assert.equal(row(subject, 'licence')?.competitor?.worded, true);
    assert.equal(row(subject, 'licence')?.tablepro.worded, true);
    assert.equal(row(subject, 'mcp')?.competitor?.worded, undefined);
});

test('fills a note with the slots of the fact that cites it', () => {
    assert.equal(noteText(context({ levels: '{value} levels' }), 'levels', { value: 5 }), '5 levels');
    assert.equal(noteText(context(), 'missing', {}), null);
});

test('offers the cells’ versions and dates as tokens, with dates as PHP formatted them', () => {
    const tokens = productTokens(product({ cells: { mcp: { state: 'yes', version: '7.1', date: '2026-06-10', source: 's5' } } }), context().dates);

    assert.equal(tokens['cells.mcp.version'], '7.1');
    assert.equal(tokens['cells.mcp.date'], 'June 10, 2026');
    assert.equal(tokens.name, 'Acme');
});

test('keeps product-specific facts out of the standard rows', () => {
    const subject = product({ cells: { ai: { state: 'yes', source: 's5' }, diagram: { state: 'yes', source: 's5' }, safeMode: { state: 'no', source: 's5' } } });

    assert.deepEqual(extraCellKeys(subject), ['diagram', 'safeMode']);
});

test('numbers the hub’s cited sources consecutively across products', () => {
    const numbered = numberSources([product(), product({ id: 'other' })]);

    assert.equal(numbered[0].start, 1);
    assert.equal(numbered[1].start, numbered[0].sources.length + 1);
    assert.ok(numbered.every((entry) => entry.sources.length === entry.numbers.size));
});

test('calls one app for both architectures universal, and separate builds otherwise', () => {
    const lines = (universal: boolean) =>
        row(product({ mac: { minVersion: null, architectures: ['arm64', 'x86_64'], universal, source: 's1' } }), 'platforms')?.competitor?.lines.map((line) => line.text) ?? [];

    assert.ok(lines(true).includes(labels.builds.universal));
    assert.ok(!lines(true).includes(labels.builds.both));
    assert.ok(lines(false).includes(labels.builds.both));

    const ours = (macUniversal: boolean) => row(product(), 'platforms', { macUniversal })?.tablepro.lines.map((line) => line.text) ?? [];

    assert.ok(ours(true).includes(labels.builds.universal));
    assert.ok(ours(false).includes(labels.builds.both));
});
