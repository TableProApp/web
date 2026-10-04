import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { CRISP_SCRIPT_URL, chatRequested, openChat } from '../../resources/js/lib/crisp.ts';

/*
 * Live chat loads on a click, never with the page. Run with `npm run test:js`.
 *
 * Crisp's loader sets cookies the moment it runs, so the guarantee is about
 * requests: nothing from Crisp is in the document until `openChat()` is
 * called, and exactly one loader after any number of calls.
 */

interface FakeScript {
    src: string;
    async: boolean;
}

interface CrispGlobals {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
    CRISP_RUNTIME_CONFIG?: { locale: string };
}

function installBrowser(): { scripts: FakeScript[]; window: CrispGlobals } {
    const scripts: FakeScript[] = [];
    const win: CrispGlobals = {};

    Object.assign(globalThis, {
        window: win,
        document: {
            head: { appendChild: (node: FakeScript) => scripts.push(node) },
            createElement: () => ({ src: '', async: false }),
            querySelector: (selector: string) => scripts.find((s) => selector === `script[src="${s.src}"]`) ?? null,
        },
    });

    return { scripts, window: win };
}

beforeEach(() => {
    delete (globalThis as Record<string, unknown>).window;
    delete (globalThis as Record<string, unknown>).document;
});

test('nothing from Crisp is on the page before a click', () => {
    const browser = installBrowser();

    assert.equal(chatRequested(), false);
    assert.equal(browser.scripts.length, 0);
    assert.equal(browser.window.$crisp, undefined);
    assert.equal(browser.window.CRISP_WEBSITE_ID, undefined);
});

test('the first click loads the widget once, in the page language, and opens it', () => {
    const browser = installBrowser();

    openChat('website-id', 'vi');

    assert.equal(browser.scripts.length, 1);
    assert.equal(browser.scripts[0].src, CRISP_SCRIPT_URL);
    assert.equal(browser.scripts[0].async, true);
    assert.equal(browser.window.CRISP_WEBSITE_ID, 'website-id');
    assert.deepEqual(browser.window.CRISP_RUNTIME_CONFIG, { locale: 'vi' });
    assert.deepEqual(browser.window.$crisp, [
        ['do', 'chat:show'],
        ['do', 'chat:open'],
    ]);
});

test('later clicks reopen the chat without loading it again', () => {
    const browser = installBrowser();

    openChat('website-id', 'en');
    openChat('website-id', 'en');
    openChat('website-id', 'en');

    assert.equal(browser.scripts.length, 1);
    assert.equal(browser.window.$crisp?.length, 6);
});

test('an unconfigured site loads nothing', () => {
    const browser = installBrowser();

    openChat(null, 'en');
    openChat('', 'en');

    assert.equal(browser.scripts.length, 0);
    assert.equal(browser.window.$crisp, undefined);
});

test('Crisp is given the language and nothing about the reader', () => {
    const browser = installBrowser();

    openChat('website-id', 'en');

    const keys = Object.keys(browser.window).sort();

    assert.deepEqual(keys, ['$crisp', 'CRISP_RUNTIME_CONFIG', 'CRISP_WEBSITE_ID']);
    assert.ok(
        !(browser.window.$crisp ?? []).some((command) => JSON.stringify(command).includes('user:')),
        'no user:email, user:nickname or similar is pushed',
    );
});
