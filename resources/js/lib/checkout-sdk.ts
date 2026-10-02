/**
 * The checkout overlay's script, loaded when a reader shows they mean to buy
 * and never with the page (architecture §1.12).
 *
 * Polar's embed, or Lemon Squeezy's `lemon.js`, used to load in the document
 * head of every page. Now a buy button warms it on its first pointer or focus,
 * and checkout waits for it before opening the overlay. A page nobody buys
 * from requests nothing from either provider.
 *
 * The script sources are data (`checkoutSdk` in resources/data/pricing.json,
 * the Polar build pinned), passed in by the caller. Pure apart from the browser
 * globals it touches at call time, and with no imports, so `node --test` loads
 * it directly (tests/js/checkout.test.ts).
 */

export type CheckoutProvider = 'polar' | 'lemonsqueezy';

export type CheckoutTheme = 'light' | 'dark';

interface ProviderWindow {
    Polar?: { EmbedCheckout?: { create?: (url: string, options?: { theme?: CheckoutTheme }) => Promise<unknown> } };
    LemonSqueezy?: { Url?: { Open?: (url: string) => void } };
    createLemonSqueezy?: () => void;
}

function providerWindow(): ProviderWindow {
    return window as unknown as ProviderWindow;
}

/** One load per provider per page: a second warm-up or click reuses it. */
const loads = new Map<CheckoutProvider, Promise<void>>();

/** Whether the provider's overlay API is on the page. */
export function checkoutSdkReady(provider: CheckoutProvider): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    const w = providerWindow();

    return provider === 'polar' ? typeof w.Polar?.EmbedCheckout?.create === 'function' : typeof w.LemonSqueezy?.Url?.Open === 'function';
}

/**
 * Injects the provider's script once and resolves when its overlay API exists.
 *
 * `lemon.js` sets itself up on the page's load event, which has long passed
 * when it is injected late, so it is started here by hand. A failed load (an
 * ad blocker, no network) rejects and forgets itself, so the next attempt
 * tries again; the caller falls back to the provider's own checkout page.
 */
export function loadCheckoutSdk(provider: CheckoutProvider, src: string): Promise<void> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.reject(new Error('The checkout script loads only in a browser.'));
    }

    if (checkoutSdkReady(provider)) {
        return Promise.resolve();
    }

    const pending = loads.get(provider);

    if (pending) {
        return pending;
    }

    const load = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');

        script.src = src;
        script.async = true;

        script.onload = () => {
            const w = providerWindow();

            if (provider === 'lemonsqueezy' && !checkoutSdkReady(provider) && typeof w.createLemonSqueezy === 'function') {
                w.createLemonSqueezy();
            }

            if (checkoutSdkReady(provider)) {
                resolve();

                return;
            }

            loads.delete(provider);
            reject(new Error(`The ${provider} checkout script loaded without its overlay.`));
        };

        script.onerror = () => {
            loads.delete(provider);
            script.remove();
            reject(new Error(`The ${provider} checkout script did not load.`));
        };

        document.head.appendChild(script);
    });

    loads.set(provider, load);

    return load;
}

/**
 * Opens the provider's overlay on a checkout URL from `POST /checkout`.
 * Rejects when the overlay API is missing, so the caller can send the reader
 * to the checkout page itself instead.
 */
export async function openCheckoutOverlay(provider: CheckoutProvider, url: string, theme: CheckoutTheme): Promise<void> {
    if (!checkoutSdkReady(provider)) {
        throw new Error(`The ${provider} checkout overlay is not loaded.`);
    }

    const w = providerWindow();

    // Called on their objects, not detached: either API may rely on `this`.
    if (provider === 'polar') {
        await w.Polar!.EmbedCheckout!.create!(url, { theme });

        return;
    }

    w.LemonSqueezy!.Url!.Open!(url);
}
