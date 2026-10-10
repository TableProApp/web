import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
    THEME_CHANGE_EVENT,
    THEME_COLORS,
    THEME_STORAGE_KEY,
    applyTheme,
    parseTheme,
    readTheme,
    renderTheme,
    resolveDark,
    syncTheme,
} from '../../resources/js/lib/theme.ts';

/*
 * The theme choice, executed against a fake browser. Run with `npm run test:js`.
 *
 * The head script decides the theme before paint; this module decides it after
 * load. Both must agree, and both must fall back to the system whenever storage
 * is missing, unreadable or holds something unexpected. The head script is run
 * here too, from the shared partial, so the two cannot drift apart unnoticed.
 */

interface FakeElement {
    classes: Set<string>;
    dataset: Record<string, string>;
    style: { colorScheme?: string };
}

interface FakeBrowser {
    storage: Map<string, string>;
    root: FakeElement;
    themeColor: { content: string; setAttribute(name: string, value: string): void };
    events: string[];
    listeners: Map<string, ((event: unknown) => void)[]>;
    systemListeners: ((event: { matches: boolean }) => void)[];
    frames: (() => void)[];
    setSystemDark(dark: boolean): void;
}

function installBrowser(options: { stored?: string; storageThrows?: boolean; systemDark?: boolean } = {}): FakeBrowser {
    let systemDark = options.systemDark ?? false;
    const classes = new Set<string>();
    const fake: FakeBrowser = {
        storage: new Map(options.stored === undefined ? [] : [[THEME_STORAGE_KEY, options.stored]]),
        root: {
            classes,
            dataset: {},
            style: {},
        },
        themeColor: {
            content: '#ffffff',
            setAttribute(name: string, value: string): void {
                if (name === 'content') {
                    fake.themeColor.content = value;
                }
            },
        },
        events: [],
        listeners: new Map(),
        systemListeners: [],
        frames: [],
        setSystemDark(dark: boolean): void {
            systemDark = dark;
            for (const listener of fake.systemListeners) {
                listener({ matches: dark });
            }
        },
    };

    const classList = {
        add: (name: string) => classes.add(name),
        remove: (name: string) => classes.delete(name),
        toggle: (name: string, force?: boolean) => {
            const on = force ?? !classes.has(name);
            if (on) {
                classes.add(name);
            } else {
                classes.delete(name);
            }
            return on;
        },
        contains: (name: string) => classes.has(name),
    };

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

    const root = { classList, dataset: fake.root.dataset, style: fake.root.style };

    Object.assign(globalThis, {
        window: {
            localStorage,
            matchMedia: () => ({
                get matches() {
                    return systemDark;
                },
                addEventListener: (_: string, listener: (event: { matches: boolean }) => void) => fake.systemListeners.push(listener),
                removeEventListener: (_: string, listener: (event: { matches: boolean }) => void) => {
                    fake.systemListeners = fake.systemListeners.filter((l) => l !== listener);
                },
            }),
            getComputedStyle: () => ({ getPropertyValue: () => '' }),
            requestAnimationFrame: (callback: () => void) => fake.frames.push(callback),
            addEventListener: (type: string, listener: (event: unknown) => void) => {
                fake.listeners.set(type, [...(fake.listeners.get(type) ?? []), listener]);
            },
            removeEventListener: (type: string, listener: (event: unknown) => void) => {
                fake.listeners.set(type, (fake.listeners.get(type) ?? []).filter((l) => l !== listener));
            },
            dispatchEvent: (event: Event) => {
                fake.events.push(`${event.type}:${(event as CustomEvent).detail}`);
                return true;
            },
        },
        document: {
            documentElement: root,
            querySelector: (selector: string) => (selector === 'meta[name="theme-color"]' ? fake.themeColor : null),
            createElement: () => ({}),
        },
    });

    return fake;
}

beforeEach(() => {
    delete (globalThis as Record<string, unknown>).window;
    delete (globalThis as Record<string, unknown>).document;
});

test('reads only the three known choices, and anything else as system', () => {
    assert.equal(parseTheme('light'), 'light');
    assert.equal(parseTheme('dark'), 'dark');
    assert.equal(parseTheme('system'), 'system');
    assert.equal(parseTheme(null), 'system');
    assert.equal(parseTheme(''), 'system');
    assert.equal(parseTheme('Dark'), 'system');
    assert.equal(parseTheme('auto'), 'system');
});

test('follows the system for a visitor who never chose', () => {
    installBrowser({ systemDark: true });

    assert.equal(readTheme(), 'system');
    assert.equal(resolveDark(readTheme(), true), true);
    assert.equal(resolveDark(readTheme(), false), false);
});

test('follows the system when storage throws', () => {
    installBrowser({ storageThrows: true, stored: 'dark' });

    assert.equal(readTheme(), 'system');
});

test('follows the system only when the reader chose system', () => {
    assert.equal(resolveDark('system', true), true);
    assert.equal(resolveDark('system', false), false);
    assert.equal(resolveDark('dark', false), true);
    assert.equal(resolveDark('light', true), false);
});

test('applying a choice stores it, paints it and tells every control', () => {
    const browser = installBrowser();

    applyTheme('dark');

    assert.equal(browser.storage.get(THEME_STORAGE_KEY), 'dark');
    assert.ok(browser.root.classes.has('dark'));
    assert.equal(browser.root.dataset.themeChoice, 'dark');
    assert.equal(browser.root.style.colorScheme, 'dark');
    assert.equal(browser.themeColor.content, THEME_COLORS.dark);
    assert.deepEqual(browser.events, [`${THEME_CHANGE_EVENT}:dark`]);

    applyTheme('light');

    assert.ok(!browser.root.classes.has('dark'));
    assert.equal(browser.root.style.colorScheme, 'light');
    assert.equal(browser.themeColor.content, THEME_COLORS.light);
});

test('suppresses transitions for one frame while the theme changes', () => {
    const browser = installBrowser();

    renderTheme('dark');

    assert.ok(browser.root.classes.has('theme-switching'));
    browser.frames.forEach((frame) => frame());
    assert.ok(!browser.root.classes.has('theme-switching'));
});

test('still paints the choice when storage refuses to keep it', () => {
    const browser = installBrowser({ storageThrows: true });

    assert.doesNotThrow(() => applyTheme('dark'));
    assert.ok(browser.root.classes.has('dark'));
    assert.equal(browser.root.dataset.themeChoice, 'dark');
});

test('system follows the operating system while it is chosen', () => {
    const browser = installBrowser({ stored: 'system', systemDark: false });
    const stop = syncTheme();

    browser.setSystemDark(true);
    assert.ok(browser.root.classes.has('dark'));
    assert.equal(browser.root.dataset.themeChoice, 'system');

    browser.setSystemDark(false);
    assert.ok(!browser.root.classes.has('dark'));

    stop();
    assert.equal(browser.systemListeners.length, 0);
});

test('an explicit choice ignores the operating system', () => {
    const browser = installBrowser({ stored: 'light', systemDark: false });

    syncTheme();
    browser.setSystemDark(true);

    assert.ok(!browser.root.classes.has('dark'));
});

test('another tab changing the key repaints this one without writing it back', () => {
    const browser = installBrowser({ stored: 'light' });

    syncTheme();
    browser.storage.set(THEME_STORAGE_KEY, 'dark');

    for (const listener of browser.listeners.get('storage') ?? []) {
        listener({ key: THEME_STORAGE_KEY });
    }

    assert.ok(browser.root.classes.has('dark'));
    assert.deepEqual(browser.events, [`${THEME_CHANGE_EVENT}:dark`]);

    for (const listener of browser.listeners.get('storage') ?? []) {
        listener({ key: 'tablepro:analytics-consent' });
    }

    assert.equal(browser.events.length, 1, 'an unrelated key changes nothing');
});

/*
 * The pre-paint script in the shared Blade partial is the other half of this
 * module. It is executed here against the same fake document, for each stored
 * value, and must reach the same decision as `resolveDark(readTheme())`.
 */
test('the head script and this module make the same decision', () => {
    const partial = readFileSync(
        fileURLToPath(new URL('../../resources/views/partials/head-theme.blade.php', import.meta.url)),
        'utf8',
    );
    const script = partial.match(/<script>([\s\S]*?)<\/script>/)?.[1];

    assert.ok(script, 'the partial holds an inline script');

    const cases: { stored?: string; storageThrows?: boolean; systemDark: boolean }[] = [
        { systemDark: false },
        { systemDark: true },
        { stored: 'light', systemDark: true },
        { stored: 'dark', systemDark: false },
        { stored: 'system', systemDark: true },
        { stored: 'system', systemDark: false },
        { stored: 'nonsense', systemDark: true },
        { stored: 'dark', storageThrows: true, systemDark: true },
    ];

    for (const options of cases) {
        const browser = installBrowser(options);

        new Function('window', 'localStorage', 'document', script)(
            (globalThis as Record<string, unknown>).window,
            (globalThis as unknown as { window: { localStorage: unknown } }).window.localStorage,
            (globalThis as Record<string, unknown>).document,
        );

        const expected = resolveDark(readTheme(), options.systemDark);

        assert.equal(browser.root.classes.has('dark'), expected, JSON.stringify(options));
        assert.equal(browser.root.dataset.themeChoice, readTheme(), JSON.stringify(options));
        assert.equal(browser.root.style.colorScheme, expected ? 'dark' : 'light', JSON.stringify(options));
        assert.equal(browser.themeColor.content, expected ? THEME_COLORS.dark : THEME_COLORS.light, JSON.stringify(options));
    }
});
