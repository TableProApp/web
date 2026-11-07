import { test } from 'node:test';
import assert from 'node:assert/strict';

import { docsHref, engineItems, factText, factValues, fillFacts, pagePaidIds, paidByTier, partIds, wherePlatforms } from '../../resources/js/components/features/model.ts';
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

test('collects the paid features of a page in data order, from its bands and its list', () => {
    const page = {
        bands: [
            { id: 'a', title: 'A', text: [], paid: ['result-charts'], where: { linux: 'no', ios: 'no' } },
            { id: 'b', title: 'B', text: [], where: { linux: 'yes', ios: 'no' } },
        ],
        more: [{ id: 'c', title: 'C', text: [], paid: ['data-rewind', 'result-charts'] }],
    } as unknown as FeaturePageContent;

    assert.deepEqual(pagePaidIds(page, ['compare-sync', 'query-insights', 'result-charts', 'data-rewind']), ['result-charts', 'data-rewind']);
});

test('answers to its own id first, then to the ids of the sections it replaced', () => {
    assert.deepEqual(partIds({ id: 'explain', also: ['performance'] }), ['explain', 'performance']);
    assert.deepEqual(partIds({ id: 'mcp' }), ['mcp']);
});

test('names the Mac, then each platform that has the part, a partial one included', () => {
    const names = { mac: 'Mac', linux: 'Linux', ios: 'iPhone & iPad' };

    assert.deepEqual(wherePlatforms({ linux: 'no', ios: 'no' }, names), ['Mac']);
    assert.deepEqual(wherePlatforms({ linux: 'partial', ios: 'no' }, names), ['Mac', 'Linux']);
    assert.deepEqual(wherePlatforms({ linux: 'yes', ios: 'partial' }, names), ['Mac', 'Linux', 'iPhone & iPad']);
});

test('groups paid features by plan in the order given, skipping unknown ids', () => {
    const features = [
        { id: 'query-insights', tier: 'starter', name: 'Query Insights' },
        { id: 'team-library', tier: 'team', name: 'Team Library' },
        { id: 'result-charts', tier: 'starter', name: 'Result Charts' },
    ];

    assert.deepEqual(
        paidByTier(['query-insights', 'nope', 'team-library', 'result-charts'], features).map((group) => [group.tier, group.features.map((feature) => feature.id)]),
        [
            ['starter', ['query-insights', 'result-charts']],
            ['team', ['team-library']],
        ],
    );
});

test('joins docs paths without doubled or missing slashes', () => {
    assert.equal(docsHref('https://docs.tablepro.app', '/features/mcp'), 'https://docs.tablepro.app/features/mcp');
    assert.equal(docsHref('https://docs.tablepro.app/', 'features/mcp#setup'), 'https://docs.tablepro.app/features/mcp#setup');
});
