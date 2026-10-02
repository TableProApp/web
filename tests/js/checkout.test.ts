import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { checkoutOutcome, discountOutcome } from '../../resources/js/components/pricing/checkout-response.ts';
import { checkoutSdkReady, loadCheckoutSdk, openCheckoutOverlay } from '../../resources/js/lib/checkout-sdk.ts';

/*
 * Checkout from the plan cards. Run with `npm run test:js`.
 *
 * Two halves: what the cards say for each answer from the platform, and the
 * provider's overlay script, which loads at checkout intent and never with the
 * page, once however many buttons are hovered.
 */

const strings = { failed: 'Couldn’t start checkout.', tooMany: 'Too many attempts.' };

test('a checkout URL opens; anything else is a message the reader can act on', () => {
    assert.deepEqual(checkoutOutcome(200, { url: 'https://polar.sh/checkout/abc' }, strings), { kind: 'open', url: 'https://polar.sh/checkout/abc' });

    // No URL, or one that is not https, is not something to open.
    assert.deepEqual(checkoutOutcome(200, {}, strings), { kind: 'error', message: strings.failed });
    assert.deepEqual(checkoutOutcome(200, { url: 'javascript:alert(1)' }, strings), { kind: 'error', message: strings.failed });

    // The platform writes a 422 in the request's language, so it is shown as it comes.
    assert.deepEqual(checkoutOutcome(422, { message: 'Gói Team cần tối thiểu 5 seat.' }, strings), { kind: 'error', message: 'Gói Team cần tối thiểu 5 seat.' });
    assert.deepEqual(checkoutOutcome(422, {}, strings), { kind: 'error', message: strings.failed });

    // The throttle's text is shared with the license API and stays English: the catalog speaks instead.
    assert.deepEqual(checkoutOutcome(429, { message: 'Too Many Attempts.' }, strings), { kind: 'error', message: strings.tooMany });

    // Framework errors never reach the reader.
    assert.deepEqual(checkoutOutcome(500, { message: 'Server Error' }, strings), { kind: 'error', message: strings.failed });
    assert.deepEqual(checkoutOutcome(419, { message: 'CSRF token mismatch.' }, strings), { kind: 'error', message: strings.failed });
});

test('a discount preview reports a percentage, a fixed amount in cents, or a code that does not apply', () => {
    assert.deepEqual(discountOutcome(200, { valid: true, amount_type: 'percent', amount: 20 }), { kind: 'percent', amount: 20 });
    assert.deepEqual(discountOutcome(200, { valid: true, amount_type: 'fixed', amount: 500 }), { kind: 'fixed', cents: 500 });
    assert.deepEqual(discountOutcome(200, { valid: false }), { kind: 'invalid' });
    assert.deepEqual(discountOutcome(200, { valid: true, amount_type: 'percent' }), { kind: 'invalid' });
    assert.deepEqual(discountOutcome(200, { valid: true, amount_type: 'free', amount: 1 }), { kind: 'invalid' });
    assert.deepEqual(discountOutcome(422, { message: 'The code field is required.' }), { kind: 'invalid' });
    assert.deepEqual(discountOutcome(429, {}), { kind: 'tooMany' });
    assert.deepEqual(discountOutcome(500, {}), { kind: 'failed' });
});

interface FakeScript {
    src: string;
    async: boolean;
    onload: (() => void) | null;
    onerror: (() => void) | null;
    remove: () => void;
}

interface ProviderGlobals {
    Polar?: { EmbedCheckout: { create: (url: string, options?: { theme?: string }) => Promise<unknown> } };
    LemonSqueezy?: { Url: { Open: (url: string) => void } };
    createLemonSqueezy?: () => void;
}

function installBrowser(): { scripts: FakeScript[]; window: ProviderGlobals } {
    const scripts: FakeScript[] = [];
    const win: ProviderGlobals = {};

    Object.assign(globalThis, {
        window: win,
        document: {
            head: { appendChild: (node: FakeScript) => scripts.push(node) },
            createElement: () => {
                const script: FakeScript = {
                    src: '',
                    async: false,
                    onload: null,
                    onerror: null,
                    remove: () => scripts.splice(scripts.indexOf(script), 1),
                };

                return script;
            },
        },
    });

    return { scripts, window: win };
}

const pricing = JSON.parse(readFileSync(new URL('../../resources/data/pricing.json', import.meta.url), 'utf8')) as {
    checkoutSdk: { polar: string; lemonsqueezy: string };
};

beforeEach(() => {
    delete (globalThis as Record<string, unknown>).window;
    delete (globalThis as Record<string, unknown>).document;
});

test('nothing loads until checkout is wanted, and then the Polar embed loads once', async () => {
    const browser = installBrowser();

    assert.equal(browser.scripts.length, 0);
    assert.equal(checkoutSdkReady('polar'), false);

    const first = loadCheckoutSdk('polar', pricing.checkoutSdk.polar);
    const second = loadCheckoutSdk('polar', pricing.checkoutSdk.polar);

    assert.equal(first, second);
    assert.equal(browser.scripts.length, 1);
    assert.equal(browser.scripts[0].src, pricing.checkoutSdk.polar);
    assert.equal(browser.scripts[0].async, true);

    const opened: { url: string; theme?: string }[] = [];

    browser.window.Polar = {
        EmbedCheckout: {
            async create(url, options) {
                opened.push({ url, theme: options?.theme });
            },
        },
    };
    browser.scripts[0].onload?.();
    await first;

    assert.equal(checkoutSdkReady('polar'), true);

    // Ready now: no second script, however often it is asked for.
    await loadCheckoutSdk('polar', pricing.checkoutSdk.polar);
    assert.equal(browser.scripts.length, 1);

    await openCheckoutOverlay('polar', 'https://polar.sh/checkout/abc', 'dark');
    assert.deepEqual(opened, [{ url: 'https://polar.sh/checkout/abc', theme: 'dark' }]);
});

test('a script that fails to load is forgotten, so the next click tries again', async () => {
    const browser = installBrowser();

    const failing = loadCheckoutSdk('lemonsqueezy', pricing.checkoutSdk.lemonsqueezy);

    browser.scripts[0].onerror?.();
    await assert.rejects(failing);
    assert.equal(browser.scripts.length, 0);

    const retry = loadCheckoutSdk('lemonsqueezy', pricing.checkoutSdk.lemonsqueezy);

    assert.equal(browser.scripts.length, 1);

    // lemon.js loaded after the page did: it is started by hand.
    const urls: string[] = [];

    browser.window.createLemonSqueezy = () => {
        browser.window.LemonSqueezy = { Url: { Open: (url: string) => urls.push(url) } };
    };
    browser.scripts[0].onload?.();
    await retry;

    await openCheckoutOverlay('lemonsqueezy', 'https://tablepro.lemonsqueezy.com/checkout/x', 'light');
    assert.deepEqual(urls, ['https://tablepro.lemonsqueezy.com/checkout/x']);
});

test('opening an overlay that is not there rejects, so the reader is sent to the checkout page instead', async () => {
    installBrowser();

    await assert.rejects(openCheckoutOverlay('polar', 'https://polar.sh/checkout/abc', 'light'));
    await assert.rejects(openCheckoutOverlay('lemonsqueezy', 'https://tablepro.lemonsqueezy.com/checkout/x', 'light'));
});
