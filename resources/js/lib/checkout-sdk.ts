// Polar's embed loads at checkout intent, never with the page. No imports, so `node --test` loads it directly.

export type CheckoutTheme = 'light' | 'dark';

interface PolarWindow {
    Polar?: { EmbedCheckout?: { create?: (url: string, options?: { theme?: CheckoutTheme }) => Promise<unknown> } };
}

function polarWindow(): PolarWindow {
    return window as unknown as PolarWindow;
}

// Keyed by the window it was started in, which a test replaces between cases.
let load: { window: unknown; promise: Promise<void> } | null = null;

export function checkoutSdkReady(): boolean {
    return typeof window !== 'undefined' && typeof polarWindow().Polar?.EmbedCheckout?.create === 'function';
}

// A failed load forgets itself, so the next click tries again; the caller falls back to Polar's own page.
export function loadCheckoutSdk(src: string): Promise<void> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.reject(new Error('The checkout script loads only in a browser.'));
    }

    if (checkoutSdkReady()) {
        return Promise.resolve();
    }

    if (load !== null && load.window === window) {
        return load.promise;
    }

    const promise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');

        script.src = src;
        script.async = true;

        script.onload = () => {
            if (checkoutSdkReady()) {
                resolve();

                return;
            }

            load = null;
            reject(new Error('The checkout script loaded without its overlay.'));
        };

        script.onerror = () => {
            load = null;
            script.remove();
            reject(new Error('The checkout script did not load.'));
        };

        document.head.appendChild(script);
    });

    load = { window, promise };

    return promise;
}

export async function openCheckoutOverlay(url: string, theme: CheckoutTheme): Promise<void> {
    if (!checkoutSdkReady()) {
        throw new Error('The checkout overlay is not loaded.');
    }

    // Called on its object, not detached: the embed may rely on `this`.
    await polarWindow().Polar!.EmbedCheckout!.create!(url, { theme });
}

export const SDK_WAIT_MS = 4000;

// The script settles only on load or error, and a stalled request fires neither: without this the Buy button spun forever.
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms.`)), ms);

        promise.then(
            (value) => {
                clearTimeout(timer);
                resolve(value);
            },
            (error: unknown) => {
                clearTimeout(timer);
                reject(error);
            },
        );
    });
}
