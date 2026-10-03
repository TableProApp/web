/**
 * Smooth scrolling for in-page anchors only (design-system §7.1).
 *
 * A global `html { scroll-behavior: smooth }` also animates every scroll the
 * page makes for itself, and Inertia resets the scroll after each visit with a
 * plain `window.scrollTo(0, 0)`. With the rule in place, a link clicked low on
 * a long page opened the next page mid-way and glided it to the top for over a
 * second, and history navigation glided back the same way.
 *
 * So the rule is gone, and smooth scrolling is switched on for one jump at a
 * time: a primary click on a same-page `#fragment` link sets it inline on the
 * root, the browser's own fragment navigation then scrolls smoothly (keeping
 * its history entry, `:target` and the focus starting point), and the inline
 * value is removed when the scroll ends. Readers who ask for less motion get
 * the browser's instant jump.
 */

/** The parts of `window` this needs, so a test can pass a stand-in. */
export interface GlideWindow {
    document: {
        documentElement: { style: { scrollBehavior: string } };
        addEventListener(type: 'click', listener: (event: MouseEvent) => void): void;
    };
    matchMedia(query: string): { matches: boolean };
    addEventListener(type: 'scrollend', listener: () => void, options?: { once?: boolean }): void;
    removeEventListener(type: 'scrollend', listener: () => void): void;
    setTimeout(handler: () => void, timeout: number): unknown;
}

/** The longest a glide is allowed before the inline value is removed anyway (no `scrollend` when nothing moved). */
export const GLIDE_TIMEOUT_MS = 1500;

/** The `#fragment` a click is following on this page, or null when it is not one to glide to. */
export function glideTarget(event: Pick<MouseEvent, 'defaultPrevented' | 'button' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey' | 'target'>): string | null {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return null;
    }

    const target = event.target as { closest?: (selector: string) => { getAttribute(name: string): string | null } | null } | null;
    const link = typeof target?.closest === 'function' ? target.closest('a[href^="#"]') : null;
    const href = link?.getAttribute('href') ?? '';

    return href.length > 1 ? href.slice(1) : null;
}

export function installAnchorGlide(win: GlideWindow): void {
    const root = win.document.documentElement;

    win.document.addEventListener('click', (event) => {
        if (glideTarget(event) === null || !win.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
            return;
        }

        root.style.scrollBehavior = 'smooth';

        const restore = (): void => {
            root.style.scrollBehavior = '';
            win.removeEventListener('scrollend', restore);
        };

        win.addEventListener('scrollend', restore, { once: true });
        win.setTimeout(restore, GLIDE_TIMEOUT_MS);
    });
}
