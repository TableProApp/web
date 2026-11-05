import { test } from 'node:test';
import assert from 'node:assert/strict';

import { GLIDE_TIMEOUT_MS, glideTarget, installAnchorGlide, type GlideWindow } from '../../resources/js/lib/anchor-glide.ts';

interface Fake {
    win: GlideWindow;
    click(event: Partial<MouseEvent> & { target: unknown }): void;
    endScroll(): void;
    runTimers(): void;
    style: { scrollBehavior: string };
}

function fakeWindow(reducedMotion = false): Fake {
    const style = { scrollBehavior: '' };
    let onClick: ((event: MouseEvent) => void) | null = null;
    let onScrollEnd: (() => void) | null = null;
    const timers: (() => void)[] = [];

    const win: GlideWindow = {
        document: {
            documentElement: { style },
            addEventListener: (_type, listener) => {
                onClick = listener;
            },
        },
        matchMedia: (query) => ({ matches: query.includes('no-preference') ? !reducedMotion : reducedMotion }),
        addEventListener: (_type, listener) => {
            onScrollEnd = listener;
        },
        removeEventListener: () => {
            onScrollEnd = null;
        },
        setTimeout: (handler, timeout) => {
            assert.equal(timeout, GLIDE_TIMEOUT_MS);
            timers.push(handler);

            return timers.length;
        },
    };

    installAnchorGlide(win);

    return {
        win,
        style,
        click: (event) => onClick?.({ defaultPrevented: false, button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, ...event } as MouseEvent),
        endScroll: () => onScrollEnd?.(),
        runTimers: () => timers.splice(0).forEach((timer) => timer()),
    };
}

const inside = (href: string | null) => ({
    closest: (selector: string) => {
        assert.equal(selector, 'a[href^="#"]');

        return href === null ? null : { getAttribute: () => href };
    },
});

test('a click on a same-page anchor glides once, then the root goes back to instant', () => {
    const fake = fakeWindow();

    fake.click({ target: inside('#features') });
    assert.equal(fake.style.scrollBehavior, 'smooth');

    fake.endScroll();
    assert.equal(fake.style.scrollBehavior, '');
});

test('the glide is switched off by a timer when nothing scrolls', () => {
    const fake = fakeWindow();

    fake.click({ target: inside('#top') });
    fake.runTimers();
    assert.equal(fake.style.scrollBehavior, '');
});

test('reduced motion, other links, modified clicks and handled clicks never glide', () => {
    const reduced = fakeWindow(true);

    reduced.click({ target: inside('#features') });
    assert.equal(reduced.style.scrollBehavior, '');

    const fake = fakeWindow();

    for (const event of [
        { target: inside(null) },
        { target: inside('#') },
        { target: inside('#faq'), metaKey: true },
        { target: inside('#faq'), button: 1 },
        { target: inside('#faq'), defaultPrevented: true },
        { target: null },
        { target: {} },
    ]) {
        fake.click(event as Partial<MouseEvent> & { target: unknown });
        assert.equal(fake.style.scrollBehavior, '', JSON.stringify(event));
    }
});

test('glideTarget reads the fragment without the hash', () => {
    assert.equal(glideTarget({ defaultPrevented: false, button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, target: inside('#plans') } as never), 'plans');
});
