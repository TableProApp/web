import { test } from 'node:test';
import assert from 'node:assert/strict';

import { trackDownload, trackEvent } from '../../resources/js/lib/analytics.ts';
import { CONSENT_STORAGE_KEY } from '../../resources/js/lib/consent.ts';

// Consent Mode still sends a cookieless ping, so an event can only be held back before gtag is called.

function installBrowser(answer: string | null, options: { storageThrows?: boolean; gtag?: boolean } = {}): unknown[][] {
    const calls: unknown[][] = [];

    Object.assign(globalThis, {
        window: {
            localStorage: {
                getItem(key: string): string | null {
                    if (options.storageThrows) {
                        throw new Error('SecurityError');
                    }

                    return key === CONSENT_STORAGE_KEY ? answer : null;
                },
            },
            ...(options.gtag === false ? {} : { gtag: (...args: unknown[]) => calls.push(args) }),
        },
    });

    return calls;
}

test('sends an event once the reader has allowed analytics', () => {
    const calls = installBrowser('granted');

    trackEvent('checkout_started', { tier: 'starter', cycle: 'yearly' });
    trackDownload('header');
    trackDownload('ios-page', 'ios');
    trackDownload('download-page-ppa', 'linux');

    assert.deepEqual(calls, [
        ['event', 'checkout_started', { tier: 'starter', cycle: 'yearly' }],
        ['event', 'download_click', { location: 'header', platform: 'mac' }],
        ['event', 'download_click', { location: 'ios-page', platform: 'ios' }],
        ['event', 'download_click', { location: 'download-page-ppa', platform: 'linux' }],
    ]);
});

for (const [state, answer] of [
    ['declined', 'denied'],
    ['not answered', null],
    ['holding a value nobody wrote', 'yes'],
] as const) {
    test(`sends nothing while analytics is ${state}`, () => {
        const calls = installBrowser(answer);

        trackEvent('license_banner_view');
        trackDownload('hero');

        assert.deepEqual(calls, []);
    });
}

test('sends nothing when storage cannot be read', () => {
    const calls = installBrowser('granted', { storageThrows: true });

    trackDownload('hero');

    assert.deepEqual(calls, []);
});

test('stays silent without the tag, and during the server render', () => {
    installBrowser('granted', { gtag: false });
    assert.doesNotThrow(() => trackDownload('hero'));

    Object.assign(globalThis, { window: undefined });
    assert.doesNotThrow(() => trackDownload('hero'));
});
