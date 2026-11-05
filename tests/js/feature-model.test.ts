import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    blockPaidIds,
    docsHref,
    engineItems,
    factText,
    factValues,
    fillFacts,
    pageOnIos,
    pageOnMac,
    pagePaidIds,
    slotLayout,
} from '../../resources/js/components/features/model.ts';
import type { Facts, FeaturePageContent } from '../../resources/js/components/features/types.ts';

const en = { number: { decimal: '.', group: ',' }, list: { separator: ', ', last: ' and ' } };
const vi = { number: { decimal: ',', group: '.' }, list: { separator: ', ', last: ' và ' } };

const facts: Facts = {
    rowCap: { kind: 'number', value: 10000 },
    level: { kind: 'text', value: 'Silent' },
    levels: { kind: 'names', items: ['Off', 'Confirm Writes', 'Read-Only'] },
    engines: {
        kind: 'engines',
        items: [
            { name: 'PostgreSQL', href: '/postgresql-client', detail: null, since: null },
            { name: 'MariaDB', href: '/mysql-client#mariadb', detail: null, since: null },
        ],
    },
};

test('writes numbers with the locale separators and joins names with its list style', () => {
    assert.equal(factText(facts.rowCap, en.number, en.list), '10,000');
    assert.equal(factText(facts.rowCap, vi.number, vi.list), '10.000');
    assert.equal(factText(facts.level, en.number, en.list), 'Silent');
    assert.equal(factText(facts.levels, en.number, en.list), 'Off, Confirm Writes and Read-Only');
    assert.equal(factText(facts.levels, vi.number, vi.list), 'Off, Confirm Writes và Read-Only');
    assert.equal(factText(facts.engines, en.number, en.list), 'PostgreSQL and MariaDB');
});

test('fills token slots from the facts and leaves unknown ones visible', () => {
    const values = factValues(facts, en.number, en.list);

    assert.equal(fillFacts('At most {rowCap} rows, {nothing} else.', values), 'At most 10,000 rows, {nothing} else.');
});

test('returns engine items only for engine facts', () => {
    assert.equal(engineItems(facts, 'engines').length, 2);
    assert.deepEqual(engineItems(facts, 'levels'), []);
    assert.deepEqual(engineItems(facts, 'missing'), []);
});

test('collects the paid features of a page in data order, from sections, blocks and the table', () => {
    const page = {
        sections: [
            { id: 'a', title: 'A', paragraphs: [], paid: ['result-charts'] },
            { id: 'b', title: 'B', paragraphs: [], blocks: [{ title: 'B1', paragraphs: [], paid: ['query-insights'] }] },
        ],
        availability: [{ label: 'X', paid: 'data-rewind', ios: 'no' }],
    } as unknown as FeaturePageContent;

    assert.deepEqual(blockPaidIds(page.sections[1]), ['query-insights']);
    assert.deepEqual(pagePaidIds(page, ['compare-sync', 'query-insights', 'result-charts', 'data-rewind']), ['query-insights', 'result-charts', 'data-rewind']);
});

test('reads the platforms a page covers from its availability rows', () => {
    const page = { availability: [{ label: 'X', ios: 'no' }, { label: 'Y', ios: 'partial', iosNote: 'n' }] } as unknown as FeaturePageContent;
    const macOnly = { availability: [{ label: 'X', ios: 'no' }] } as unknown as FeaturePageContent;

    assert.equal(pageOnIos(page), true);
    assert.equal(pageOnIos(macOnly), false);
    assert.equal(pageOnMac(macOnly), true);
});

test('joins docs paths without doubled or missing slashes', () => {
    assert.equal(docsHref('https://docs.tablepro.app', '/features/mcp'), 'https://docs.tablepro.app/features/mcp');
    assert.equal(docsHref('https://docs.tablepro.app/', 'features/mcp#setup'), 'https://docs.tablepro.app/features/mcp#setup');
});

test('puts a detail crop beside its text and a window below it', () => {
    assert.equal(slotLayout('detail'), 'beside');
    assert.equal(slotLayout('window'), 'below');
    assert.equal(slotLayout('diagram'), 'below');
    assert.equal(slotLayout('illustration'), 'below');
});
