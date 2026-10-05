/* Shared with TableProApp/web and TableProApp/license at resources/js/lib/crisp.ts. Change both in the same release. See docs/shared-files.md. */

/**
 * Live chat on every page.
 *
 * Each layout calls `loadChatWhenIdle()` once it has mounted. Crisp's loader is
 * requested after the page has finished loading and the browser is idle, so it
 * never competes with the first render, and from then on its launcher sits in
 * the bottom-right corner. A "Live chat" button calls `openChat()`, which opens
 * the same widget, loading it first if it has not arrived yet.
 *
 * Crisp's loader sets its `crisp-client/` cookies on `.tablepro.app` as soon as
 * it runs. The privacy policy describes them and what Crisp receives.
 *
 * Crisp is given the page's language and nothing else: no email, no license,
 * no account details, on either application.
 *
 * The launcher never covers the consent bar. While the bar reaches the
 * bottom-right corner (on a phone it spans the width), the launcher is hidden,
 * and it comes back when the bar closes or the window widens.
 *
 * Pure apart from the browser globals it touches at call time, and with no
 * imports, so `node --test` loads it directly.
 */

export const CRISP_SCRIPT_URL = 'https://client.crisp.chat/l.js';

/** The attribute the consent bar carries (shared `components/shared/consent-bar.tsx`). */
export const CONSENT_BAR_SELECTOR = '[data-consent-bar]';

/** How far in from the right edge Crisp's launcher reaches: its 60px button, its margin and some room. */
export const LAUNCHER_REACH = 100;

type CrispCommand = unknown[];

interface CrispWindow {
    $crisp?: { push: (command: CrispCommand) => unknown };
    CRISP_WEBSITE_ID?: string;
    CRISP_RUNTIME_CONFIG?: { locale: string };
    /** Set once the consent-bar guard is watching the page. */
    TABLEPRO_CHAT_GUARDED?: boolean;
    /** Set once a reader has opened the chat themselves; the guard then leaves the launcher alone. */
    TABLEPRO_CHAT_OPENED?: boolean;
    innerWidth: number;
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    addEventListener: (type: string, listener: () => void, options?: { once: boolean }) => void;
    removeEventListener: (type: string, listener: () => void) => void;
}

function crispWindow(): CrispWindow {
    return window as unknown as CrispWindow;
}

/** Whether the chat loader has been requested on this page. */
export function chatRequested(): boolean {
    return document.querySelector(`script[src="${CRISP_SCRIPT_URL}"]`) !== null;
}

/** Whether the consent bar is open and reaches the corner the launcher sits in. */
export function consentBarCoversLauncher(): boolean {
    const bar = document.querySelector(CONSENT_BAR_SELECTOR);

    return bar !== null && bar.getBoundingClientRect().right > crispWindow().innerWidth - LAUNCHER_REACH;
}

/**
 * Hides the launcher while the consent bar covers its corner and shows it
 * again when the bar is gone, watching the page for the bar opening and closing.
 * Commands pushed before Crisp boots are replayed when it does, so a bar that is
 * already open when the loader arrives keeps the launcher hidden from the start.
 */
function guardLauncher(w: CrispWindow): void {
    if (w.TABLEPRO_CHAT_GUARDED || typeof MutationObserver === 'undefined') {
        return;
    }

    w.TABLEPRO_CHAT_GUARDED = true;

    let hidden = false;
    const update = (): void => {
        if (w.TABLEPRO_CHAT_OPENED) {
            return;
        }

        const covered = consentBarCoversLauncher();

        if (covered !== hidden) {
            hidden = covered;
            w.$crisp?.push(['do', covered ? 'chat:hide' : 'chat:show']);
        }
    };

    new MutationObserver(update).observe(document.body, { childList: true, subtree: true });
    w.addEventListener('resize', update);
    update();
}

/**
 * Requests Crisp's loader, once per page, in the page's language.
 *
 * Before the loader arrives, `$crisp` is a plain array that Crisp replays when
 * it boots. Does nothing without a website ID, so an unconfigured environment
 * never loads a third-party script.
 */
export function loadChat(websiteId: string | null | undefined, locale: string): void {
    if (!websiteId) {
        return;
    }

    const w = crispWindow();

    w.$crisp ??= [] as CrispCommand[];

    if (!chatRequested()) {
        w.CRISP_WEBSITE_ID = websiteId;
        w.CRISP_RUNTIME_CONFIG = { locale };

        const script = document.createElement('script');

        script.src = CRISP_SCRIPT_URL;
        script.async = true;
        document.head.appendChild(script);
    }

    guardLauncher(w);
}

/**
 * Loads the chat once the page has finished loading and the browser is idle,
 * or two seconds after the load where there is no idle callback (Safari).
 * Returns a function that cancels a load that has not started, for an effect's
 * cleanup.
 */
export function loadChatWhenIdle(websiteId: string | null | undefined, locale: string): () => void {
    if (!websiteId || chatRequested()) {
        return () => {};
    }

    const w = crispWindow();
    let cancelled = false;

    const load = (): void => {
        if (!cancelled) {
            loadChat(websiteId, locale);
        }
    };
    const whenIdle = (): void => {
        if (typeof w.requestIdleCallback === 'function') {
            w.requestIdleCallback(load, { timeout: 4000 });
        } else {
            setTimeout(load, 2000);
        }
    };

    if (document.readyState === 'complete') {
        whenIdle();
    } else {
        w.addEventListener('load', whenIdle, { once: true });
    }

    return () => {
        cancelled = true;
        w.removeEventListener('load', whenIdle);
    };
}

/**
 * Opens the chat for a reader who asked for it, loading Crisp first if it has
 * not arrived yet. A second click pushes another open command and loads
 * nothing.
 */
export function openChat(websiteId: string | null | undefined, locale: string): void {
    if (!websiteId) {
        return;
    }

    const w = crispWindow();

    w.TABLEPRO_CHAT_OPENED = true;
    loadChat(websiteId, locale);
    w.$crisp?.push(['do', 'chat:show']);
    w.$crisp?.push(['do', 'chat:open']);
}
