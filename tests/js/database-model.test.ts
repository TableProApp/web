import { test } from 'node:test';
import assert from 'node:assert/strict';

import { connectWith, groupRows, iosStatus, namedPaidIds, resolveHref, shownPort, versionFloorText } from '../../resources/js/components/databases/format.ts';
import type { EngineSummary } from '../../resources/js/components/databases/types.ts';

function engine(id: string, category: string): EngineSummary {
    return {
        id,
        name: id,
        page: 'own',
        path: `/${id}-client`,
        anchor: null,
        category,
        featured: false,
        distribution: 'bundled',
        release: null,
        queryLanguage: 'SQL',
        docsSlug: id,
        ios: { inPicker: false, openable: false },
        linux: 'none',
    };
}

test('lists a merged band category by category, and lands each old category id on its first engine', () => {
    const engines = [engine('redis', 'key-value'), engine('mongodb', 'document'), engine('dynamodb', 'key-value'), engine('kafka', 'streaming'), engine('postgresql', 'relational')];
    const rows = groupRows({ id: 'nosql', categories: ['document', 'key-value', 'streaming'] }, engines);

    assert.deepEqual(
        rows.map((row) => [row.engine.id, row.anchor]),
        [
            ['mongodb', 'document'],
            ['redis', 'key-value'],
            ['dynamodb', null],
            ['kafka', 'streaming'],
        ],
    );
    assert.deepEqual(
        groupRows({ id: 'relational', categories: ['relational'] }, engines).map((row) => row.anchor),
        [null],
    );
});

test('names the paid features a page links through their plan token, in data order', () => {
    const order = ['compare-sync', 'icloud-sync', 'encrypted-export'];

    assert.deepEqual(namedPaidIds(['Share it ({encryptedExportTier}).', 'Sync it ({icloudSyncTier}) and {compareSyncTier}.'], order), order);
    assert.deepEqual(namedPaidIds(['No plan here.'], order), []);
});

test('reads the iPhone and iPad status, the port, the floor and the ways in from data', () => {
    const labels = { file: 'A file', network: 'Host and port', api: 'The service’s API', ssh: 'SSH tunnel', ssl: 'SSL/TLS', awsIam: 'AWS IAM', cloudSqlProxy: 'Cloud SQL Auth Proxy' };

    assert.equal(iosStatus({ ios: { inPicker: false, openable: true } }), 'synced');
    assert.equal(iosStatus({ ios: { inPicker: true, openable: true } }), 'picker');
    assert.equal(shownPort({ connectionMode: 'api', defaultPort: 443 }), null);
    assert.equal(shownPort({ connectionMode: 'network', defaultPort: 5432 }), 5432);
    assert.equal(versionFloorText({ text: '11.1', enforced: true }, { enforced: '{version}, enforced', noMinimum: 'None' }), '11.1, enforced');
    assert.equal(versionFloorText({ text: null, enforced: false }, { enforced: '{version}, enforced', noMinimum: 'None' }), 'None');
    assert.deepEqual(connectWith({ connectionMode: 'network', capabilities: { ssh: true, ssl: false, awsSignIn: true, cloudSqlProxy: false, nativeDump: null } }, labels), ['Host and port', 'SSH tunnel', 'AWS IAM']);
});

test('resolves a content link to the site, the page or the docs, and nothing else', () => {
    assert.deepEqual(resolveHref('/features/schema#structure', null), { kind: 'internal', href: '/features/schema#structure' });
    assert.deepEqual(resolveHref('#libsql', null), { kind: 'fragment', href: '#libsql' });
    assert.deepEqual(resolveHref('docs:/databases/redis', 'https://docs.tablepro.app/'), { kind: 'docs', href: 'https://docs.tablepro.app/databases/redis' });
    assert.equal(resolveHref('docs:/databases/redis', null), null);
    assert.equal(resolveHref('https://example.com', null), null);
    assert.equal(resolveHref('//example.com', null), null);
});
