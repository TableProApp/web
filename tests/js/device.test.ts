import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { appStoreFirst, classifyDevice } from '../../resources/js/lib/device.ts';

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

test('the App Store card leads only on an iPhone or iPad', () => {
    assert.equal(appStoreFirst('ios'), true);
    assert.equal(appStoreFirst('mac'), false);
    assert.equal(appStoreFirst('other'), false);
});

/*
 * The root template marks an iPhone or iPad with an `ios` class before first
 * paint, which puts the App Store badge first and keeps the license banner off
 * the iPhone and iPad page. It cannot import this module, so it repeats the
 * rule; this runs it against `classifyDevice` for every user agent above.
 */
test('the head script marks exactly the devices classifyDevice calls ios', () => {
    const blade = readFileSync(new URL('../../resources/views/app.blade.php', import.meta.url), 'utf8');
    const start = blade.indexOf('var ua = navigator.userAgent;');
    const end = blade.indexOf('})();', start);

    assert.ok(start > 0 && end > start, 'the device script is in app.blade.php');
    assert.ok(start < blade.indexOf("document.documentElement.classList.remove('has-banner')"), 'the device is known before the banner rule reads it');

    const run = new Function('navigator', 'document', blade.slice(start, end));

    for (const [name, userAgent] of Object.entries(UA)) {
        for (const maxTouchPoints of [0, 1, 5]) {
            const added: string[] = [];

            run({ userAgent, maxTouchPoints }, { documentElement: { classList: { add: (cls: string) => added.push(cls) } } });

            assert.deepEqual(added, appStoreFirst(classifyDevice(userAgent, maxTouchPoints)) ? ['ios'] : [], `${name}, ${maxTouchPoints} touch points`);
        }
    }
});
