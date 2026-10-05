import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
    CONSENT_BAR_SELECTOR,
    CRISP_SCRIPT_URL,
    LAUNCHER_REACH,
    chatRequested,
    loadChatWhenIdle,
    openChat,
} from '../../resources/js/lib/crisp.ts';

/*
 * Live chat on every page, after the page has loaded and the browser is idle.
 * Run with `npm run test:js`.
 *
 * Crisp's loader sets cookies the moment it runs, so the guarantees are about
 * requests and timing: nothing from Crisp is in the document before the page's
 * load event and an idle moment, exactly one loader arrives after any number of
 * calls, and the launcher never sits on top of the consent bar.
 */

interface FakeScript {
    src: string;
    async: boolean;
}

interface FakeBar {
    right: number;
}

interface CrispGlobals {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
    CRISP_RUNTIME_CONFIG?: { locale: string };
}

interface Browser {
    scripts: FakeScript[];
    window: CrispGlobals;
    /** Fires the page's load event. */
    load: () => void;
    /** Runs the pending idle callback. */
    idle: () => void;
    /** Opens the consent bar with its right edge at `right`, or closes it with null, and tells the observers. */
    setBar: (bar: FakeBar | null) => void;
}

function installBrowser({ readyState = 'loading', width = 390 } = {}): Browser {
    const scripts: FakeScript[] = [];
    const listeners: Record<string, Array<() => void>> = {};
    const observers: Array<() => void> = [];
    let idleCallback: (() => void) | null = null;
    let bar: FakeBar | null = null;

    const win = {
        innerWidth: width,
        requestIdleCallback: (callback: () => void) => {
            idleCallback = callback;

            return 1;
        },
        addEventListener: (type: string, listener: () => void) => {
            (listeners[type] ??= []).push(listener);
        },
        removeEventListener: (type: string, listener: () => void) => {
            listeners[type] = (listeners[type] ?? []).filter((l) => l !== listener);
        },
    };

    Object.assign(globalThis, {
        window: win,
        MutationObserver: class {
            constructor(callback: () => void) {
                observers.push(callback);
            }

            observe(): void {}
        },
        document: {
            readyState,
            body: {},
            head: { appendChild: (node: FakeScript) => scripts.push(node) },
            createElement: () => ({ src: '', async: false }),
            querySelector: (selector: string) => {
                if (selector === CONSENT_BAR_SELECTOR) {
                    const current = bar;

                    return current === null ? null : { getBoundingClientRect: () => ({ right: current.right }) };
                }

                return scripts.find((s) => selector === `script[src="${s.src}"]`) ?? null;
            },
        },
    });

    return {
        scripts,
        window: win as unknown as CrispGlobals,
        load: () => {
            const pending = listeners.load ?? [];

            listeners.load = [];
            pending.forEach((listener) => listener());
        },
        idle: () => {
            const callback = idleCallback;

            idleCallback = null;
            callback?.();
        },
        setBar: (next) => {
            bar = next;
            observers.forEach((observer) => observer());
        },
    };
}

/** The commands queued for Crisp. */
function commands(browser: Browser): unknown[] {
    return browser.window.$crisp ?? [];
}

beforeEach(() => {
    for (const name of ['window', 'document', 'MutationObserver']) {
        delete (globalThis as Record<string, unknown>)[name];
    }
});

test('nothing from Crisp is requested before the page has loaded and the browser is idle', () => {
    const browser = installBrowser();

    loadChatWhenIdle('website-id', 'en');
    assert.equal(chatRequested(), false, 'not while the page is loading');

    browser.load();
    assert.equal(chatRequested(), false, 'not at the load event itself');

    browser.idle();
    assert.equal(browser.scripts.length, 1);
    assert.equal(browser.scripts[0].src, CRISP_SCRIPT_URL);
    assert.equal(browser.scripts[0].async, true);
});

test('a page that has already loaded waits only for an idle moment', () => {
    const browser = installBrowser({ readyState: 'complete' });

    loadChatWhenIdle('website-id', 'vi');
    assert.equal(chatRequested(), false);

    browser.idle();
    assert.equal(browser.scripts.length, 1);
    assert.equal(browser.window.CRISP_WEBSITE_ID, 'website-id');
    assert.deepEqual(browser.window.CRISP_RUNTIME_CONFIG, { locale: 'vi' });
});

test('every page asks, and the loader still arrives once', () => {
    const browser = installBrowser({ readyState: 'complete' });

    loadChatWhenIdle('website-id', 'en');
    browser.idle();
    loadChatWhenIdle('website-id', 'en');
    browser.idle();
    openChat('website-id', 'en');

    assert.equal(browser.scripts.length, 1);
});

test('a page left before the idle moment loads nothing', () => {
    const browser = installBrowser({ readyState: 'complete' });

    const cancel = loadChatWhenIdle('website-id', 'en');

    cancel();
    browser.idle();

    assert.equal(chatRequested(), false);
});

test('an unconfigured site loads nothing', () => {
    const browser = installBrowser({ readyState: 'complete' });

    loadChatWhenIdle(null, 'en');
    loadChatWhenIdle('', 'en');
    browser.idle();
    openChat(null, 'en');
    openChat(undefined, 'en');

    assert.equal(browser.scripts.length, 0);
    assert.equal(browser.window.$crisp, undefined);
});

test('a chat button opens the chat, loading it first if it has not arrived', () => {
    const browser = installBrowser();

    openChat('website-id', 'en');

    assert.equal(browser.scripts.length, 1);
    assert.deepEqual(commands(browser), [
        ['do', 'chat:show'],
        ['do', 'chat:open'],
    ]);

    openChat('website-id', 'en');

    assert.equal(browser.scripts.length, 1);
    assert.equal(commands(browser).length, 4);
});

test('the launcher hides while a full-width consent bar covers its corner, and comes back when it closes', () => {
    const width = 390;
    const browser = installBrowser({ readyState: 'complete', width });

    browser.setBar({ right: width - 16 });
    loadChatWhenIdle('website-id', 'en');
    browser.idle();

    assert.deepEqual(commands(browser), [['do', 'chat:hide']], 'hidden before Crisp has booted');

    browser.setBar(null);

    assert.deepEqual(commands(browser), [
        ['do', 'chat:hide'],
        ['do', 'chat:show'],
    ]);
});

test('a consent bar clear of the corner leaves the launcher alone', () => {
    const width = 1440;
    const browser = installBrowser({ readyState: 'complete', width });
    const barRight = 16 + 416;

    browser.setBar({ right: barRight });
    loadChatWhenIdle('website-id', 'en');
    browser.idle();

    assert.ok(barRight < width - LAUNCHER_REACH);
    assert.deepEqual(commands(browser), []);
});

test('a chat the reader opened is never hidden by the consent bar', () => {
    const width = 390;
    const browser = installBrowser({ readyState: 'complete', width });

    openChat('website-id', 'en');
    browser.setBar({ right: width - 16 });

    assert.deepEqual(commands(browser), [
        ['do', 'chat:show'],
        ['do', 'chat:open'],
    ]);
});

test('Crisp is given the language and nothing about the reader', () => {
    const browser = installBrowser({ readyState: 'complete' });

    loadChatWhenIdle('website-id', 'en');
    browser.idle();
    openChat('website-id', 'en');

    assert.deepEqual(browser.window.CRISP_RUNTIME_CONFIG, { locale: 'en' });
    assert.ok(
        !commands(browser).some((command) => /user:|session:data/.test(JSON.stringify(command))),
        'no user:email, user:nickname, session data or similar is pushed',
    );
});
