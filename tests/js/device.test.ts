import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    appStoreFirst,
    archFromHint,
    archHint,
    buildVariant,
    classifyDevice,
    type ArchitectureHintSource,
} from '../../resources/js/lib/device.ts';

/*
 * The download page's device rules (architecture §1.13). Nothing here may make
 * the page start a download; these only decide emphasis.
 */

const UA = {
    iPhone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    iPadMobile: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    iPadDesktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    iPod: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    safariMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    firefoxMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6; rv:131.0) Gecko/20100101 Firefox/131.0',
    chromeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    chromeWindows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
    linux: 'Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0',
};

function hints(architecture: string | undefined): ArchitectureHintSource {
    return { getHighEntropyValues: async () => ({ architecture }) };
}

test('an iPhone is never a Mac, although its user agent says "like Mac OS X"', () => {
    assert.equal(classifyDevice(UA.iPhone, 5), 'ios');
    assert.equal(classifyDevice(UA.iPhone, 0), 'ios');
    assert.equal(classifyDevice(UA.iPod, 5), 'ios');
});

test('an iPad is never a Mac, including iPadOS Safari with its desktop user agent', () => {
    assert.equal(classifyDevice(UA.iPadMobile, 5), 'ios');
    assert.equal(classifyDevice(UA.iPadDesktop, 5), 'ios');
});

test('a Mac browser is a Mac, whatever chip its user agent claims', () => {
    assert.equal(classifyDevice(UA.safariMac, 0), 'mac');
    assert.equal(classifyDevice(UA.firefoxMac, 0), 'mac');
    assert.equal(classifyDevice(UA.chromeMac, 0), 'mac');
    // A trackpad reports no touch points; a single touch point is still not an iPad.
    assert.equal(classifyDevice(UA.safariMac, 1), 'mac');
});

test('Windows, Linux and Android are neither', () => {
    assert.equal(classifyDevice(UA.chromeWindows, 0), 'other');
    assert.equal(classifyDevice(UA.linux, 0), 'other');
    assert.equal(classifyDevice(UA.android, 5), 'other');
    assert.equal(classifyDevice('', 0), 'other');
});

test('the Chromium architecture hint maps to a build, and nothing else does', () => {
    assert.equal(archFromHint('arm'), 'arm64');
    assert.equal(archFromHint('x86'), 'x86_64');
    assert.equal(archFromHint(''), null);
    assert.equal(archFromHint('ARM'), null);
    assert.equal(archFromHint(undefined), null);
    assert.equal(archFromHint(null), null);
});

test('Intel Chrome reports x86 and Apple silicon Chrome reports arm', async () => {
    assert.equal(await archHint(hints('x86')), 'x86_64');
    assert.equal(await archHint(hints('arm')), 'arm64');
});

test('Safari and Firefox have no hint, so the page does not guess', async () => {
    assert.equal(await archHint(undefined), null);
    assert.equal(await archHint(null), null);
    assert.equal(await archHint({} as ArchitectureHintSource), null);
    assert.equal(await archHint(hints(undefined)), null);
});

test('a refused or failing hint is no hint', async () => {
    const failing: ArchitectureHintSource = {
        getHighEntropyValues: async () => {
            throw new Error('NotAllowedError');
        },
    };

    assert.equal(await archHint(failing), null);
});

test('only the build a Mac hint names becomes primary', () => {
    assert.equal(buildVariant('x86_64', 'mac', 'x86_64'), 'primary');
    assert.equal(buildVariant('arm64', 'mac', 'x86_64'), 'secondary');
    assert.equal(buildVariant('arm64', 'mac', 'arm64'), 'primary');
    assert.equal(buildVariant('x86_64', 'mac', 'arm64'), 'secondary');
});

test('with no hint, both builds stay equal: Safari on an Intel Mac is not pointed at Apple silicon', () => {
    assert.equal(buildVariant('arm64', 'mac', null), 'secondary');
    assert.equal(buildVariant('x86_64', 'mac', null), 'secondary');
});

test('on an iPhone, an iPad or another system, neither Mac build is primary', () => {
    for (const device of ['ios', 'other'] as const) {
        assert.equal(buildVariant('arm64', device, 'arm64'), 'secondary');
        assert.equal(buildVariant('x86_64', device, 'x86_64'), 'secondary');
        assert.equal(buildVariant('arm64', device, null), 'secondary');
    }
});

test('the App Store card leads only on an iPhone or iPad', () => {
    assert.equal(appStoreFirst('ios'), true);
    assert.equal(appStoreFirst('mac'), false);
    assert.equal(appStoreFirst('other'), false);
});
