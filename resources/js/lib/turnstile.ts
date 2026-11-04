// Cloudflare Turnstile for the newsletter form: tablepro-cloud checks the token (widget action `newsletter`) before it
// emails a confirmation link. The script loads when a reader starts on the form, never with the page.
// No imports, so `node --test` loads it directly.

export const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export const TURNSTILE_ACTION = 'newsletter';

// Turnstile cannot be told to wait forever on a reader who never answers an interactive challenge.
export const TOKEN_WAIT_MS = 120_000;

export interface TurnstileApi {
    render: (container: HTMLElement, options: Record<string, unknown>) => string | null | undefined;
    execute: (container: HTMLElement) => void;
    reset: (widgetId: string) => void;
}

interface TurnstileWindow {
    turnstile?: TurnstileApi;
}

let load: { window: unknown; promise: Promise<TurnstileApi> } | null = null;

// Turnstile's own codes where they differ from the site's route codes.
export function turnstileLanguage(locale: string): string {
    const regional: Record<string, string> = {
        'pt-BR': 'pt-br',
        'zh-Hans': 'zh-cn',
        'zh-Hant': 'zh-tw',
    };

    return regional[locale] ?? locale;
}

function api(): TurnstileApi | null {
    const turnstile = (window as unknown as TurnstileWindow).turnstile;

    return typeof turnstile?.render === 'function' && typeof turnstile.execute === 'function' ? turnstile : null;
}

// A failed load (a blocker, no network) forgets itself, so the next attempt tries again.
export function loadTurnstile(): Promise<TurnstileApi> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.reject(new Error('Turnstile loads only in a browser.'));
    }

    const ready = api();

    if (ready !== null) {
        return Promise.resolve(ready);
    }

    if (load !== null && load.window === window) {
        return load.promise;
    }

    const promise = new Promise<TurnstileApi>((resolve, reject) => {
        const script = document.createElement('script');

        script.src = TURNSTILE_SCRIPT_URL;
        script.async = true;

        script.onload = () => {
            const loaded = api();

            if (loaded !== null) {
                resolve(loaded);

                return;
            }

            load = null;
            reject(new Error('The Turnstile script loaded without its API.'));
        };

        script.onerror = () => {
            load = null;
            script.remove();
            reject(new Error('The Turnstile script did not load.'));
        };

        document.head.appendChild(script);
    });

    load = { window, promise };

    return promise;
}

export interface HumanCheckOptions {
    siteKey: string;
    language: string;
    theme: 'light' | 'dark';
    onInteractive: (interactive: boolean) => void;
}

export interface HumanCheck {
    token: () => Promise<string>;
}

// Rendered once per form, and run on each submit: a token is good for one request, so every run starts afresh.
export function renderHumanCheck(turnstile: TurnstileApi, container: HTMLElement, options: HumanCheckOptions): HumanCheck {
    let waiting: { resolve: (token: string) => void; reject: (error: Error) => void } | null = null;
    let used = false;

    const settle = (outcome: string | Error): void => {
        const current = waiting;

        waiting = null;

        if (current !== null) {
            if (typeof outcome === 'string') {
                current.resolve(outcome);
            } else {
                current.reject(outcome);
            }
        }
    };

    const widgetId = turnstile.render(container, {
        sitekey: options.siteKey,
        action: TURNSTILE_ACTION,
        execution: 'execute',
        appearance: 'interaction-only',
        size: 'flexible',
        theme: options.theme,
        language: options.language,
        callback: (token: string) => settle(token),
        'before-interactive-callback': () => options.onInteractive(true),
        'after-interactive-callback': () => options.onInteractive(false),
        'error-callback': () => {
            settle(new Error('Turnstile could not run its check.'));

            return true;
        },
        'timeout-callback': () => settle(new Error('The interactive check timed out.')),
        'expired-callback': () => settle(new Error('The token expired before it was used.')),
    });

    return {
        token(): Promise<string> {
            settle(new Error('A newer check replaced this one.'));

            return new Promise<string>((resolve, reject) => {
                const timer = setTimeout(() => settle(new Error(`No token after ${TOKEN_WAIT_MS}ms.`)), TOKEN_WAIT_MS);

                waiting = {
                    resolve: (token) => {
                        clearTimeout(timer);
                        resolve(token);
                    },
                    reject: (error) => {
                        clearTimeout(timer);
                        reject(error);
                    },
                };

                if (used && typeof widgetId === 'string') {
                    options.onInteractive(false);
                    turnstile.reset(widgetId);
                }

                used = true;
                turnstile.execute(container);
            });
        },
    };
}
