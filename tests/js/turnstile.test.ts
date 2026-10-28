import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { TURNSTILE_ACTION, TURNSTILE_SCRIPT_URL, loadTurnstile, renderHumanCheck, turnstileLanguage, type TurnstileApi } from '../../resources/js/lib/turnstile.ts';

// The newsletter form's Turnstile check: the script loads once, on intent, and each submit gets a fresh token.

interface FakeScript {
    src: string;
    async: boolean;
    onload: (() => void) | null;
    onerror: (() => void) | null;
    remove: () => void;
}

interface FakeWidget {
    container: unknown;
    options: Record<string, unknown>;
    executed: number;
    resets: number;
}

function fakeTurnstile(): { api: TurnstileApi; widgets: FakeWidget[] } {
    const widgets: FakeWidget[] = [];

    return {
        widgets,
        api: {
            render: (container, options) => {
                widgets.push({ container, options, executed: 0, resets: 0 });

                return `widget-${widgets.length}`;
            },
            execute: (container) => {
                const widget = widgets.find((each) => each.container === container);

                assert.ok(widget, 'executes a rendered widget');
                widget.executed++;
            },
            reset: (id) => {
                widgets[Number(id.split('-')[1]) - 1].resets++;
            },
        },
    };
}

function installBrowser(): { scripts: FakeScript[]; window: { turnstile?: TurnstileApi } } {
    const scripts: FakeScript[] = [];
    const win: { turnstile?: TurnstileApi } = {};

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

beforeEach(() => {
    delete (globalThis as Record<string, unknown>).window;
    delete (globalThis as Record<string, unknown>).document;
});

test('the script loads once, explicitly rendered, and a failed load is tried again', async () => {
    const browser = installBrowser();

    const first = loadTurnstile();

    assert.equal(loadTurnstile(), first);
    assert.equal(browser.scripts.length, 1);
    assert.equal(browser.scripts[0].src, TURNSTILE_SCRIPT_URL);
    assert.match(TURNSTILE_SCRIPT_URL, /^https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?render=explicit$/);

    browser.scripts[0].onerror?.();
    await assert.rejects(first);
    assert.equal(browser.scripts.length, 0);

    const retry = loadTurnstile();
    const { api } = fakeTurnstile();

    browser.window.turnstile = api;
    browser.scripts[0].onload?.();

    assert.equal(await retry, api);
    assert.equal(await loadTurnstile(), api);
    assert.equal(browser.scripts.length, 1);
});

test('the widget names the newsletter action, follows the page, and shows itself only to ask for an answer', () => {
    const { api, widgets } = fakeTurnstile();
    const container = {} as HTMLElement;

    renderHumanCheck(api, container, { siteKey: '1x00000000000000000000AA', language: turnstileLanguage('zh-Hant'), theme: 'dark' });

    assert.equal(widgets.length, 1);
    assert.equal(widgets[0].container, container);
    assert.equal(widgets[0].executed, 0, 'nothing runs before the reader submits');
    assert.deepEqual(
        Object.fromEntries(Object.entries(widgets[0].options).filter(([, value]) => typeof value !== 'function')),
        {
            sitekey: '1x00000000000000000000AA',
            action: 'newsletter',
            execution: 'execute',
            appearance: 'interaction-only',
            size: 'flexible',
            theme: 'dark',
            language: 'zh-tw',
        },
    );
    assert.equal(TURNSTILE_ACTION, 'newsletter');
    assert.deepEqual(['en', 'vi', 'pt-BR', 'zh-Hans', 'zh-Hant', 'ko'].map(turnstileLanguage), ['en', 'vi', 'pt-br', 'zh-cn', 'zh-tw', 'ko']);
});

test('each submit runs the check again and waits for its own token', async () => {
    const { api, widgets } = fakeTurnstile();
    const check = renderHumanCheck(api, {} as HTMLElement, { siteKey: 'key', language: 'en', theme: 'light' });
    const options = widgets[0].options as { callback: (token: string) => void };

    const first = check.token();

    assert.equal(widgets[0].executed, 1);
    assert.equal(widgets[0].resets, 0);
    options.callback('token-1');
    assert.equal(await first, 'token-1');

    // A token is good for one request, so the next submit starts from a reset widget.
    const second = check.token();

    assert.equal(widgets[0].resets, 1);
    assert.equal(widgets[0].executed, 2);
    options.callback('token-2');
    assert.equal(await second, 'token-2');
});

test('an error, a timed-out challenge or an expired token rejects, so the form says to reload', async () => {
    const { api, widgets } = fakeTurnstile();
    const check = renderHumanCheck(api, {} as HTMLElement, { siteKey: 'key', language: 'en', theme: 'light' });
    const options = widgets[0].options as Record<string, () => unknown>;

    for (const callback of ['error-callback', 'timeout-callback', 'expired-callback']) {
        const waiting = check.token();
        const handled = options[callback]();

        await assert.rejects(waiting, undefined, callback);

        if (callback === 'error-callback') {
            assert.equal(handled, true, 'the error is handled here, not retried behind the reader');
        }
    }
});
