import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { checkoutOutcome, discountOutcome, seatsMessage } from '../../resources/js/components/pricing/checkout-response.ts';
import { placeholders } from '../../resources/js/i18n/core.ts';
import en from '../../resources/js/i18n/messages/en/pricing.ts';
import { checkoutSdkReady, loadCheckoutSdk, openCheckoutOverlay, SDK_WAIT_MS, withTimeout } from '../../resources/js/lib/checkout-sdk.ts';

// Checkout from the plan cards: what they say for each answer of tablepro-cloud's /v2, and Polar's overlay script,
// which loads at checkout intent and never with the page, once however many buttons are hovered.

const strings = {
    failed: 'Couldn’t start checkout.',
    tooMany: 'Too many attempts.',
    planUnavailable: 'This plan isn’t for sale right now.',
    seats: 'Choose between 5 and 200 seats.',
};

const problem = (status: number, code: string, extra: Record<string, unknown> = {}) => ({
    type: `https://api.tablepro.app/problems/${code}`,
    title: 'Problem',
    status,
    code,
    detail: 'English text the reader never sees.',
    ...extra,
});

test('a checkout URL opens; anything else is a message the reader can act on', () => {
    assert.deepEqual(checkoutOutcome(201, { url: 'https://polar.sh/checkout/abc' }, strings), { kind: 'open', url: 'https://polar.sh/checkout/abc' });

    // No URL, or one that is not https, is not something to open.
    assert.deepEqual(checkoutOutcome(201, {}, strings), { kind: 'error', message: strings.failed });
    assert.deepEqual(checkoutOutcome(201, { url: 'javascript:alert(1)' }, strings), { kind: 'error', message: strings.failed });
});

test('each problem code api.md lists for POST /v2/checkouts has its own message, in the page\'s language', () => {
    assert.deepEqual(checkoutOutcome(422, problem(422, 'plan_unavailable'), strings), { kind: 'error', message: strings.planUnavailable });
    assert.deepEqual(
        checkoutOutcome(422, problem(422, 'validation_failed', { errors: [{ location: 'body.seats', message: 'seats out of range', value: 900 }] }), strings),
        { kind: 'error', message: strings.seats },
    );
    assert.deepEqual(checkoutOutcome(422, problem(422, 'validation_failed', { errors: [{ location: 'body', message: 'invalid' }] }), strings), { kind: 'error', message: strings.failed });
    assert.deepEqual(checkoutOutcome(429, problem(429, 'rate_limited'), strings), { kind: 'error', message: strings.tooMany });
    assert.deepEqual(checkoutOutcome(500, problem(500, 'internal_error'), strings), { kind: 'error', message: strings.failed });

    // A gateway's own page, or no body at all.
    assert.deepEqual(checkoutOutcome(502, {}, strings), { kind: 'error', message: strings.failed });
    assert.deepEqual(checkoutOutcome(422, null, strings), { kind: 'error', message: strings.failed });
});

test('a 422 on seats names the range only once /v2/pricing gave a maximum, and otherwise asks for fewer', () => {
    const range = (max: number) => `Choose between 5 and ${max} seats.`;

    assert.equal(seatsMessage(1000, range, 'Choose fewer seats.'), 'Choose between 5 and 1000 seats.');

    // Before /v2/pricing answers, after it failed, or when Polar sets no maximum: the seat field already keeps the
    // minimum, so the count was over a maximum the page does not know (MaxCheckoutSeats in tablepro-cloud).
    assert.equal(seatsMessage(undefined, range, 'Choose fewer seats.'), 'Choose fewer seats.');
    assert.equal(seatsMessage(null, range, 'Choose fewer seats.'), 'Choose fewer seats.');
    assert.deepEqual(placeholders(en.checkout.seatsFewer), []);
});

test('a discount preview reports a percentage, a fixed amount in cents, or a code that does not apply', () => {
    assert.deepEqual(discountOutcome(200, { valid: true, amount_type: 'percent', amount: 20 }), { kind: 'percent', amount: 20 });
    assert.deepEqual(discountOutcome(200, { valid: true, amount_type: 'fixed', amount: 500, currency: 'USD' }), { kind: 'fixed', cents: 500 });
    assert.deepEqual(discountOutcome(200, { valid: true, amount_type: 'fixed', amount: 500, currency: 'usd' }), { kind: 'fixed', cents: 500 });
    // The page prices in US dollars, so an amount in another currency is accepted without being restated.
    assert.deepEqual(discountOutcome(200, { valid: true, amount_type: 'fixed', amount: 500, currency: 'EUR' }), { kind: 'accepted' });
    assert.deepEqual(discountOutcome(200, { valid: false }), { kind: 'invalid' });
    assert.deepEqual(discountOutcome(200, { valid: true, amount_type: 'percent' }), { kind: 'invalid' });
    assert.deepEqual(discountOutcome(200, { valid: true, amount_type: 'free', amount: 1 }), { kind: 'invalid' });
    assert.deepEqual(discountOutcome(422, problem(422, 'validation_failed', { errors: [{ location: 'body.code' }] })), { kind: 'invalid' });
    assert.deepEqual(discountOutcome(429, problem(429, 'rate_limited')), { kind: 'tooMany' });
    assert.deepEqual(discountOutcome(500, problem(500, 'internal_error')), { kind: 'failed' });
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

const pricing = JSON.parse(readFileSync(new URL('../../resources/data/pricing.json', import.meta.url), 'utf8')) as { checkoutSdk: string };

beforeEach(() => {
    delete (globalThis as Record<string, unknown>).window;
    delete (globalThis as Record<string, unknown>).document;
});

test('nothing loads until checkout is wanted, and then the Polar embed loads once', async () => {
    const browser = installBrowser();

    assert.equal(browser.scripts.length, 0);
    assert.equal(checkoutSdkReady(), false);

    const first = loadCheckoutSdk(pricing.checkoutSdk);
    const second = loadCheckoutSdk(pricing.checkoutSdk);

    assert.equal(first, second);
    assert.equal(browser.scripts.length, 1);
    assert.equal(browser.scripts[0].src, pricing.checkoutSdk);
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

    assert.equal(checkoutSdkReady(), true);

    // Ready now: no second script, however often it is asked for.
    await loadCheckoutSdk(pricing.checkoutSdk);
    assert.equal(browser.scripts.length, 1);

    await openCheckoutOverlay('https://polar.sh/checkout/abc', 'dark');
    assert.deepEqual(opened, [{ url: 'https://polar.sh/checkout/abc', theme: 'dark' }]);
});

test('a script that fails to load is forgotten, so the next click tries again', async () => {
    const browser = installBrowser();

    const failing = loadCheckoutSdk(pricing.checkoutSdk);

    browser.scripts[0].onerror?.();
    await assert.rejects(failing);
    assert.equal(browser.scripts.length, 0);

    const retry = loadCheckoutSdk(pricing.checkoutSdk);

    assert.equal(browser.scripts.length, 1);

    // A script that loads without the overlay is a failure too.
    browser.scripts[0].onload?.();
    await assert.rejects(retry);

    const third = loadCheckoutSdk(pricing.checkoutSdk);

    browser.window.Polar = { EmbedCheckout: { create: async () => undefined } };
    browser.scripts.at(-1)?.onload?.();
    await third;
});

test('opening an overlay that is not there rejects, so the reader is sent to the checkout page instead', async () => {
    installBrowser();

    await assert.rejects(openCheckoutOverlay('https://polar.sh/checkout/abc', 'light'));
});

test('a stalled overlay script times out, so checkout falls back to the provider page instead of spinning', async () => {
    const stalled = new Promise<void>(() => undefined);

    await assert.rejects(withTimeout(stalled, 20), /Timed out after 20ms/);
    assert.equal(await withTimeout(Promise.resolve('loaded'), 20), 'loaded');
    await assert.rejects(withTimeout(Promise.reject(new Error('did not load')), 20), /did not load/);
    assert.ok(SDK_WAIT_MS >= 3000 && SDK_WAIT_MS <= 5000, 'the wait stays a few seconds');

    const flow = readFileSync(new URL('../../resources/js/components/pricing/use-checkout.ts', import.meta.url), 'utf8');

    assert.match(flow, /await withTimeout\(sdk, SDK_WAIT_MS\);/);
});
