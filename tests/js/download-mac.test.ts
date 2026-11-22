import { test } from 'node:test';
import assert from 'node:assert/strict';

import { hasBuildPerArchitecture, MAC_ARCHITECTURES, macAsset, reportedArchitecture } from '../../resources/js/components/download/mac-asset.ts';
import type { ReleaseAsset } from '../../resources/js/components/download/types.ts';

const dmg = (name: string): ReleaseAsset => ({ name, url: `https://example.com/${name}`, bytes: null, sha256: null });
const arm64 = dmg('TablePro-0.88.0-arm64.dmg');
const x86_64 = dmg('TablePro-0.88.0-x86_64.dmg');
const universal = dmg('TablePro-0.87.0.dmg');

test('offers Apple silicon first, and each chip its own DMG', () => {
    assert.deepEqual(MAC_ARCHITECTURES, ['arm64', 'x86_64']);
    assert.equal(hasBuildPerArchitecture({ arm64, x86_64 }), true);
    assert.equal(macAsset({ arm64, x86_64 }, 'arm64'), arm64);
    assert.equal(macAsset({ arm64, x86_64 }, 'x86_64'), x86_64);
});

test('asks no chip for a universal DMG, whichever one the page holds', () => {
    assert.equal(hasBuildPerArchitecture({ universal }), false);

    for (const architecture of MAC_ARCHITECTURES) {
        assert.equal(macAsset({ universal }, architecture), universal);
    }
});

test('has no file when no release source answered', () => {
    assert.equal(hasBuildPerArchitecture({}), false);
    assert.equal(macAsset({}, 'arm64'), null);
});

test('never hands one chip the other chip’s DMG', () => {
    assert.equal(hasBuildPerArchitecture({ arm64 }), false);
    assert.equal(macAsset({ arm64 }, 'x86_64'), null);
});

test('takes the chip a Chromium browser reports, and none from a browser that reports nothing', async () => {
    const reporting = (architecture: string) => ({ getHighEntropyValues: async () => ({ architecture }) });

    assert.equal(await reportedArchitecture(reporting('arm')), 'arm64');
    assert.equal(await reportedArchitecture(reporting('x86')), 'x86_64');
    assert.equal(await reportedArchitecture(reporting('')), null);
    assert.equal(await reportedArchitecture(undefined), null);
    assert.equal(await reportedArchitecture({ getHighEntropyValues: () => Promise.reject(new Error('denied')) }), null);
});
