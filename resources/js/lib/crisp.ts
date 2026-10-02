/* Shared with TableProApp/web and TableProApp/license at resources/js/lib/crisp.ts. Change both in the same release. See docs/shared-files.md. */

/**
 * Live chat that loads only when the reader asks for it.
 *
 * Crisp's loader sets cookies on `.tablepro.app` the moment it runs, so it is
 * never part of a page. Nothing from Crisp is requested, and nothing is set,
 * until a reader clicks a chat button and that button calls `openChat()`. The
 * privacy policy describes what Crisp sets after that click.
 *
 * Crisp is given the page's language and nothing else: no email, no license,
 * no account details, on either application.
 *
 * Pure apart from the browser globals it touches at call time, and with no
 * imports, so `node --test` loads it directly.
 */

export const CRISP_SCRIPT_URL = 'https://client.crisp.chat/l.js';

type CrispCommand = unknown[];

interface CrispWindow {
    $crisp?: { push: (command: CrispCommand) => unknown };
    CRISP_WEBSITE_ID?: string;
    CRISP_RUNTIME_CONFIG?: { locale: string };
}

function crispWindow(): CrispWindow {
    return window as unknown as CrispWindow;
}

/** Whether the chat loader has been requested on this page. */
export function chatRequested(): boolean {
    return document.querySelector(`script[src="${CRISP_SCRIPT_URL}"]`) !== null;
}

/**
 * Opens the chat, loading Crisp first if this is the first request on the page.
 *
 * Before the loader arrives, `$crisp` is a plain array that Crisp replays when
 * it boots, so the open command queued here runs as soon as the widget exists.
 * A second click pushes another open command and injects nothing.
 *
 * Does nothing without a website ID, so an unconfigured environment never
 * loads a third-party script.
 */
export function openChat(websiteId: string | null | undefined, locale: string): void {
    if (!websiteId) {
        return;
    }

    const w = crispWindow();
    const queue = w.$crisp ?? (w.$crisp = [] as CrispCommand[]);

    if (!chatRequested()) {
        w.CRISP_WEBSITE_ID = websiteId;
        w.CRISP_RUNTIME_CONFIG = { locale };

        const script = document.createElement('script');

        script.src = CRISP_SCRIPT_URL;
        script.async = true;
        document.head.appendChild(script);
    }

    queue.push(['do', 'chat:show']);
    queue.push(['do', 'chat:open']);
}
