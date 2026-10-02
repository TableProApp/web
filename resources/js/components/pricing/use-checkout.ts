import { useState } from 'react';
import pricingData from '@data/pricing.json';
import { useI18n } from '@/i18n';
import { trackEvent } from '@/lib/analytics';
import { currentAttribution, type Attribution } from '@/lib/attribution';
import { loadCheckoutSdk, openCheckoutOverlay, type CheckoutProvider } from '@/lib/checkout-sdk';
import type { BillingCycle, PaidTierId } from '@/lib/data/pricing';
import { checkoutOutcome } from './checkout-response';

/** The provider scripts, pinned in resources/data/pricing.json. */
const SDK_SOURCES: Record<CheckoutProvider, string> = pricingData.checkoutSdk;

/**
 * `POST /checkout`'s body. The tier and cycle, never a provider product id:
 * the platform resolves the product, so no provider identifier exists in this
 * repository. `locale` is the page's, so the purchase emails arrive in the
 * reader's language; it changes nothing about the price.
 */
interface CheckoutBody {
    tier: PaidTierId;
    cycle: BillingCycle;
    locale: string;
    seats?: number;
    discount_code?: string;
    attribution?: Attribution;
}

export interface CheckoutError {
    tier: PaidTierId;
    message: string;
}

export interface StartOptions {
    /** Team only: the seats chosen on the card. */
    seats?: number;
    /** A code this page has already previewed as valid. */
    discountCode?: string | null;
}

function overlayTheme(): 'light' | 'dark' {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Starting a purchase from a plan card.
 *
 * Checkout belongs to the platform app on this origin, so this is a plain JSON
 * request held in React state, like `useEmailForm`: this app has no session
 * and no CSRF token. `credentials: 'omit'` keeps the platform's session
 * cookies off public pages; checkout needs none.
 *
 * The endpoint is the root path in every language, because nginx routes
 * `/checkout` to the platform by its unprefixed path.
 *
 * `checkout_started` fires on intent, not success: success happens inside the
 * provider's overlay, where nothing here can see it. Read against the
 * platform's own completion count, it is the overlay's abandonment rate.
 *
 * The overlay's script starts loading with the request, or earlier through
 * `warm()`. If it cannot load or open, the reader goes to the provider's
 * checkout page itself, which is the same purchase without the overlay.
 */
export function useCheckout(provider: CheckoutProvider) {
    const { locale, m } = useI18n();
    const [pending, setPending] = useState<PaidTierId | null>(null);
    const [error, setError] = useState<CheckoutError | null>(null);

    /** Starts fetching the overlay's script on the first sign of intent: a pointer or focus on a buy button. */
    function warm(): void {
        loadCheckoutSdk(provider, SDK_SOURCES[provider]).catch(() => undefined);
    }

    async function start(tier: PaidTierId, cycle: BillingCycle, options: StartOptions = {}): Promise<void> {
        if (pending !== null) {
            return;
        }

        setPending(tier);
        setError(null);

        trackEvent('checkout_started', { tier, cycle });

        const sdk = loadCheckoutSdk(provider, SDK_SOURCES[provider]);

        // Awaited below only once a URL exists; until then a failed load must not surface as unhandled.
        sdk.catch(() => undefined);

        try {
            const body: CheckoutBody = { tier, cycle, locale };

            if (tier === 'team' && options.seats !== undefined) {
                body.seats = options.seats;
            }

            if (options.discountCode) {
                body.discount_code = options.discountCode;
            }

            /*
             * Where the reader first came from, attached last, so nothing
             * between here and the request can drop it. Absent for an untagged
             * first visit or a browser that refuses storage.
             */
            const attribution = currentAttribution();

            if (attribution !== null) {
                body.attribution = attribution;
            }

            const res = await fetch('/checkout', {
                method: 'POST',
                credentials: 'omit',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(body),
            });
            const data: unknown = await res.json().catch(() => ({}));
            const outcome = checkoutOutcome(res.status, data, { failed: m.pricing.checkout.failed, tooMany: m.forms.tooMany });

            if (outcome.kind === 'error') {
                setError({ tier, message: outcome.message });

                return;
            }

            try {
                await sdk;
                await openCheckoutOverlay(provider, outcome.url, overlayTheme());
            } catch {
                window.location.assign(outcome.url);
            }
        } catch {
            setError({ tier, message: m.forms.network });
        } finally {
            setPending(null);
        }
    }

    return { pending, error, start, warm };
}

export type Checkout = ReturnType<typeof useCheckout>;
