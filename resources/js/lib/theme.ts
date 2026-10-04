/* Shared with TableProApp/web and TableProApp/license at resources/js/lib/theme.ts. Change both in the same release. See docs/shared-files.md. */

/**
 * The reader's theme: reading it, applying it, and keeping every open tab of
 * both applications on this origin in step.
 *
 * The public site and the account app both live on `tablepro.app`, so they
 * share one `localStorage` and one `theme` key. The pre-paint script in
 * `resources/views/partials/head-theme.blade.php` makes the same decision as
 * `resolveDark()` below before anything is drawn; this module takes over once
 * the page is interactive.
 *
 * Light is the default. A missing key, an unreadable key (storage throws in a
 * private window) and any value other than the three below all mean light, so
 * a visitor whose system is dark still sees light until they choose otherwise.
 *
 * Pure apart from the browser globals it touches at call time, and with
 * relative imports only, so `node --test` loads it directly.
 */

export const THEME_STORAGE_KEY = 'theme';

/** Dispatched on `window` after the theme changes, by a control or by another tab. */
export const THEME_CHANGE_EVENT = 'tablepro:theme-change';

export type ThemeChoice = 'light' | 'dark' | 'system';

export const THEME_CHOICES: readonly ThemeChoice[] = ['light', 'dark', 'system'];

/** `theme-color` per resolved theme: the two `--background` values in tokens.css. */
export const THEME_COLORS = { light: '#ffffff', dark: '#121212' } as const;

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

/** Anything but a known choice reads as light, matching the head script. */
export function parseTheme(value: unknown): ThemeChoice {
    return value === 'dark' || value === 'system' || value === 'light' ? value : 'light';
}

/** The stored choice, or light when there is none or storage refuses. */
export function readTheme(): ThemeChoice {
    try {
        return parseTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
    } catch {
        return 'light';
    }
}

/** Whether the operating system asks for dark. False wherever it cannot be asked. */
export function systemPrefersDark(): boolean {
    try {
        return typeof window.matchMedia === 'function' && window.matchMedia(SYSTEM_DARK_QUERY).matches;
    } catch {
        return false;
    }
}

/** Dark for `dark`, and for `system` when the system is dark. */
export function resolveDark(choice: ThemeChoice, prefersDark: boolean): boolean {
    return choice === 'dark' || (choice === 'system' && prefersDark);
}

/**
 * Paints `choice` on the document without storing it.
 *
 * Toggles `.dark` (every token and every themed image follows that class, never
 * the media query), and updates `data-theme-choice` (which drives the theme
 * control's icon and selected option from CSS), `color-scheme` and the single
 * `theme-color` meta.
 *
 * Transitions are suppressed for one frame with `theme-switching`, so the
 * colour transitions on links and buttons do not ripple across the page as
 * every token changes at once.
 */
export function renderTheme(choice: ThemeChoice): void {
    const root = document.documentElement;
    const dark = resolveDark(choice, systemPrefersDark());

    root.classList.add('theme-switching');
    root.classList.toggle('dark', dark);
    root.dataset.themeChoice = choice;
    root.style.colorScheme = dark ? 'dark' : 'light';

    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? THEME_COLORS.dark : THEME_COLORS.light);

    // Reading a computed value forces the new colours to apply while
    // transitions are still off; the class comes off on the next frame.
    window.getComputedStyle?.(root).getPropertyValue('color');

    const release = (): void => root.classList.remove('theme-switching');

    if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(release);
    } else {
        release();
    }
}

/**
 * The reader chose a theme: store it, paint it, and tell every control.
 *
 * A storage failure is not an error. The choice holds for this page and the
 * next load falls back to light, which is the honest outcome for a browser
 * that cannot remember anything.
 */
export function applyTheme(choice: ThemeChoice): void {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, choice);
    } catch {
        // No storage: the choice lasts for this page only.
    }

    renderTheme(choice);
    announce(choice);
}

function announce(choice: ThemeChoice): void {
    window.dispatchEvent(new CustomEvent<ThemeChoice>(THEME_CHANGE_EVENT, { detail: choice }));
}

/**
 * Calls `listener` with the system's preference whenever it changes. Returns
 * the unsubscribe function.
 */
export function subscribeSystem(listener: (prefersDark: boolean) => void): () => void {
    if (typeof window.matchMedia !== 'function') {
        return () => undefined;
    }

    const query = window.matchMedia(SYSTEM_DARK_QUERY);
    const handle = (event: { matches: boolean }): void => listener(event.matches);

    query.addEventListener('change', handle);

    return () => query.removeEventListener('change', handle);
}

/**
 * Keeps this page in step after load. Returns the cleanup function.
 *
 * - Another tab on this origin (a public page or an account screen) changed
 *   the key: repaint, without writing the key back.
 * - The choice is `system` and the system changes: repaint.
 *
 * Install it once per page, from the layout.
 */
export function syncTheme(): () => void {
    const onStorage = (event: StorageEvent): void => {
        if (event.key !== THEME_STORAGE_KEY && event.key !== null) {
            return;
        }

        const choice = readTheme();

        renderTheme(choice);
        announce(choice);
    };

    window.addEventListener('storage', onStorage);

    const unsubscribe = subscribeSystem(() => {
        if (readTheme() === 'system') {
            renderTheme('system');
        }
    });

    return () => {
        window.removeEventListener('storage', onStorage);
        unsubscribe();
    };
}
