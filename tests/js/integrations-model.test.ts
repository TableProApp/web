import { test } from 'node:test';
import assert from 'node:assert/strict';

import { facetOptions, filterIntegrations, filtersToSearch, NO_FILTERS, relFor, reportUrl } from '../../resources/js/components/integrations/model.ts';
import type { Category, IntegrationSummary } from '../../resources/js/components/integrations/types.ts';

const labels = {
    'ai-clients': 'Client AI',
    automation: 'Tự động hóa',
    'cloud-hosting': 'Cloud hosting',
    'command-line': 'Dòng lệnh',
    editors: 'Editors',
    launchers: 'Launchers',
    'local-development': 'Phát triển cục bộ',
    other: 'Khác',
} satisfies Record<Category, string>;

const entry = (overrides: Partial<IntegrationSummary>): IntegrationSummary => ({
    slug: 'claude-code',
    name: 'Claude Code',
    publisher: 'TablePro',
    tier: 'official',
    categories: ['ai-clients'],
    platforms: ['mac'],
    closedSource: false,
    tagline: 'Kết nối Claude Code với cơ sở dữ liệu của bạn.',
    keywords: ['mcp', 'anthropic'],
    icon: null,
    ...overrides,
});

const entries = [
    entry({}),
    entry({ slug: 'shortcuts', name: 'Shortcuts', categories: ['automation'], platforms: ['ios'], tagline: 'Thêm dòng vào table từ Phím tắt.', keywords: [] }),
    entry({ slug: 'acme', name: 'Acme', publisher: 'Acme Inc', tier: 'community', categories: ['command-line', 'local-development'], platforms: ['mac'], closedSource: true, tagline: 'Mở connection từ terminal.', keywords: ['docker'] }),
];

const slugs = (list: IntegrationSummary[]) => list.map((item) => item.slug);

test('lists everything with no filter, in the order it was given', () => {
    assert.deepEqual(slugs(filterIntegrations(entries, NO_FILTERS, labels)), ['claude-code', 'shortcuts', 'acme']);
});

test('matches the name, publisher, tagline, category label and keywords, ignoring case and accents', () => {
    const search = (q: string) => slugs(filterIntegrations(entries, { ...NO_FILTERS, q }, labels));

    assert.deepEqual(search('CLAUDE'), ['claude-code']);
    assert.deepEqual(search('acme inc'), ['acme']);
    assert.deepEqual(search('phim tat'), ['shortcuts']);
    assert.deepEqual(search('tu dong hoa'), ['shortcuts']);
    assert.deepEqual(search('docker'), ['acme']);
    assert.deepEqual(search('dong'), ['shortcuts', 'acme']);
    assert.deepEqual(search('  '), ['claude-code', 'shortcuts', 'acme']);
    assert.deepEqual(search('claude docker'), []);
});

test('narrows by category, TablePro app and type together', () => {
    const filter = (filters: Partial<typeof NO_FILTERS>) => slugs(filterIntegrations(entries, { ...NO_FILTERS, ...filters }, labels));

    assert.deepEqual(filter({ category: 'local-development' }), ['acme']);
    assert.deepEqual(filter({ platform: 'mac' }), ['claude-code', 'acme']);
    assert.deepEqual(filter({ tier: 'official', platform: 'mac' }), ['claude-code']);
    assert.deepEqual(filter({ tier: 'partner' }), []);
});

test('offers only the facet values some entry has, in the order the labels list them', () => {
    assert.deepEqual(facetOptions(entries, labels), {
        categories: ['ai-clients', 'automation', 'command-line', 'local-development'],
        platforms: ['mac', 'ios'],
        tiers: ['official', 'community'],
    });
    assert.deepEqual(facetOptions([], labels), { categories: [], platforms: [], tiers: [] });
});

test('writes the filters as a query in one order, leaving out empty ones', () => {
    assert.equal(filtersToSearch(NO_FILTERS), '');
    assert.equal(filtersToSearch({ q: ' ', category: null, platform: null, tier: null }), '');
    assert.equal(filtersToSearch({ tier: 'community', platform: 'ios', category: 'automation', q: 'add rows' }), '?q=add+rows&category=automation&platform=ios&tier=community');
});

test('marks only Community links as user content that is not endorsed', () => {
    assert.equal(relFor('community'), 'ugc nofollow');
    assert.equal(relFor('official'), undefined);
    assert.equal(relFor('partner'), undefined);
});

test('opens the registry report form with the slug filled in', () => {
    assert.equal(
        reportUrl('https://github.com/TableProApp/integrations', 'claude-code'),
        'https://github.com/TableProApp/integrations/issues/new?template=report-integration.yml&slug=claude-code',
    );
});
