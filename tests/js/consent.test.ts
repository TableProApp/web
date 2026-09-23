import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
    CONSENT_STORAGE_KEY,
    analyticsCookieNames,
    parseChoice,
    readConsent,
    saveConsent,
} from '../../resources/js/lib/consent.ts';

/*
 * Behaviour tests for the analytics consent record. Run with `npm run test:js`.
 *
 * `saveConsent` is the one place a withdrawal actually happens: it has to tell
 * the running tag and delete the cookies the tag already wrote. Both are side
 * effects on browser globals, so the browser is faked below rather than the
 * source being read — a source assertion would confirm a `document.cookie`
 * write exists and nothing about whether it names the right domain.
 */

interface FakeBrowser {
    storage: Map<string, string>;
    gtagCalls: unknown[][];
    cookieWrites: string[];
}

function installBrowser(cookies: string, options: { storageThrows?: boolean; gtag?: boolean } = {}): FakeBrowser {
    const fake: FakeBrowser = { storage: new Map(), gtagCalls: [], cookieWrites: [] };

    const localStorage = {
        getItem(key: string): string | null {
            if (options.storageThrows) {
                throw new Error('SecurityError');
            }

            return fake.storage.get(key) ?? null;
        },
        setItem(key: string, value: string): void {
            if (options.storageThrows) {
                throw new Error('QuotaExceededError');
            }

            fake.storage.set(key, value);
        },
    };

    Object.assign(globalThis, {
        window: {
            localStorage,
            location: { hostname: 'tablepro.app' },
            ...(options.gtag === false ? {} : { gtag: (...args: unknown[]) => fake.gtagCalls.push(args) }),
        },
        document: {
            get cookie(): string {
                return cookies;
            },
            set cookie(value: string) {
                fake.cookieWrites.push(value);
            },
        },
    });

    return fake;
}

beforeEach(() => {
    delete (globalThis as Record<string, unknown>).window;
    delete (globalThis as Record<string, unknown>).document;
});

test('reads only the two known answers', () => {
    assert.equal(parseChoice('granted'), 'granted');
    assert.equal(parseChoice('denied'), 'denied');
    assert.equal(parseChoice(null), null);
    assert.equal(parseChoice(''), null);
    assert.equal(parseChoice('true'), null);
    assert.equal(parseChoice('GRANTED'), null);
});

test('treats storage that throws as not asked yet', () => {
    installBrowser('', { storageThrows: true });

    assert.equal(readConsent(), null);
});

test('matches Google Analytics cookies and none of the site’s own', () => {
    const names = analyticsCookieNames('nl_subscribed=1; _ga=GA1.1.123.456; _ga_FG4YV1QXYN=GS2.1.s1; _gab=x; nl_dismissed_at=2026');

    assert.deepEqual(names, ['_ga', '_ga_FG4YV1QXYN']);
});

test('allowing records the answer and grants analytics storage only', () => {
    const browser = installBrowser('');

    saveConsent('granted');

    assert.equal(browser.storage.get(CONSENT_STORAGE_KEY), 'granted');
    assert.deepEqual(browser.gtagCalls, [['consent', 'update', { analytics_storage: 'granted' }]]);
    assert.deepEqual(browser.cookieWrites, []);
});

/*
 * The withdrawal case. Consent Mode stops gtag touching its cookies, but leaves
 * the ones already set in place — so declining after allowing must expire them,
 * on the registrable domain gtag wrote them to, or a two-year identifier
 * outlives the reader's "no".
 */
test('declining expires the analytics cookies on the domain gtag wrote them to', () => {
    const browser = installBrowser('_ga=GA1.1.123.456; nl_subscribed=1; _ga_FG4YV1QXYN=GS2.1.s1');

    saveConsent('denied');

    assert.equal(browser.storage.get(CONSENT_STORAGE_KEY), 'denied');
    assert.deepEqual(browser.gtagCalls, [['consent', 'update', { analytics_storage: 'denied' }]]);
    assert.deepEqual(browser.cookieWrites, [
        '_ga=; Max-Age=0; path=/; domain=.tablepro.app',
        '_ga=; Max-Age=0; path=/',
        '_ga_FG4YV1QXYN=; Max-Age=0; path=/; domain=.tablepro.app',
        '_ga_FG4YV1QXYN=; Max-Age=0; path=/',
    ]);
});

test('still applies the answer when storage refuses it', () => {
    const browser = installBrowser('_ga=1', { storageThrows: true });

    saveConsent('denied');

    assert.deepEqual(browser.gtagCalls, [['consent', 'update', { analytics_storage: 'denied' }]]);
    assert.equal(browser.cookieWrites.length, 2);
});

test('does not throw when the tag is not on the page', () => {
    const browser = installBrowser('', { gtag: false });

    assert.doesNotThrow(() => saveConsent('granted'));
    assert.equal(browser.storage.get(CONSENT_STORAGE_KEY), 'granted');
});
