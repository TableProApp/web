import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createAssetCatalog, type AssetLocaleCopy } from '../../resources/js/lib/data/asset-catalog.ts';
import type { SlotManifestData } from '../../resources/js/lib/data/asset-model.ts';

const fixture = JSON.parse(readFileSync(new URL('../Fixtures/assets/manifest.json', import.meta.url), 'utf8')) as SlotManifestData;
const id = Object.keys(fixture.assets)[0];
const metadata: SlotManifestData = { kinds: fixture.kinds, assets: { [id]: fixture.assets[id] } };

test('concurrent renders keep their language and share only the matching in-flight load', async () => {
    let finishGerman!: (copy: AssetLocaleCopy) => void;
    let finishJapanese!: (copy: AssetLocaleCopy) => void;
    let calls = 0;
    const catalog = createAssetCatalog(metadata, {
        de: () => { calls++; return new Promise((resolve) => { finishGerman = resolve; }); },
        ja: () => new Promise((resolve) => { finishJapanese = resolve; }),
    });
    const german = catalog.load('de');
    assert.equal(catalog.load('de'), german);
    const japanese = catalog.load('ja');
    finishJapanese({ [id]: { description: { ja: '日本語の説明' } } });
    await japanese;
    assert.equal(catalog.manifest('ja').assets[id].description?.ja, '日本語の説明');
    assert.throws(() => catalog.manifest('de'), /has not been loaded/);
    finishGerman({ [id]: { description: { de: 'Deutsche Beschreibung' } } });
    await german;
    await catalog.load('de');
    assert.equal(calls, 1);
    assert.equal(catalog.manifest('de').assets[id].description?.de, 'Deutsche Beschreibung');
    assert.equal(catalog.manifest('ja').assets[id].description?.de, undefined);
    assert.notEqual(catalog.manifest('de').assets[id], metadata.assets[id]);
});

test('missing languages and incomplete catalogs fail without an English fallback', async () => {
    const catalog = createAssetCatalog(metadata, { de: async () => ({}) });
    await assert.rejects(catalog.load('xx'), /Missing asset catalog/);
    await assert.rejects(catalog.load('de'), /Missing asset/);
    assert.throws(() => catalog.manifest('de'), /has not been loaded/);
});

test('a failed import can be retried and never becomes the cached catalog', async () => {
    let attempts = 0;
    const catalog = createAssetCatalog(metadata, {
        de: async () => {
            if (++attempts === 1) throw new Error('Import failed');
            return { [id]: { description: { de: 'Deutsche Beschreibung' } } };
        },
    });
    await assert.rejects(catalog.load('de'), /Import failed/);
    await catalog.load('de');
    assert.equal(attempts, 2);
    assert.equal(catalog.manifest('de').assets[id].description?.de, 'Deutsche Beschreibung');
});
