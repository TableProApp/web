import { useState } from 'react';
import pricingData from '@data/pricing.json';
import { useApi } from '@/hooks/use-api';
import { useI18n } from '@/i18n';
import { trackEvent } from '@/lib/analytics';
import { currentAttribution, type Attribution } from '@/lib/attribution';
import { loadCheckoutSdk, openCheckoutOverlay, SDK_WAIT_MS, withTimeout } from '@/lib/checkout-sdk';
import { PRICING, type BillingCycle, type PaidTierId } from '@/lib/data/pricing';
import { checkoutOutcome } from './checkout-response';

const SDK_SOURCE: string = pricingData.checkoutSdk;

// A plan and cycle, never a Polar product ID: tablepro-cloud resolves the product and never trusts a price from here.
interface CheckoutBody {
    plan: PaidTierId;
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
    seats?: number;
    discountCode?: string | null;
}

function overlayTheme(): 'light' | 'dark' {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

// `checkout_started` fires on intent: the sale completes inside Polar's overlay, where nothing here can see it.
export function useCheckout() {
    const { locale, m, fmt } = useI18n();
    const api = useApi();
    const [pending, setPending] = useState<PaidTierId | null>(null);
    const [error, setError] = useState<CheckoutError | null>(null);

    function warm(): void {
        loadCheckoutSdk(SDK_SOURCE).catch(() => undefined);
    }

    async function start(tier: PaidTierId, cycle: BillingCycle, options: StartOptions = {}): Promise<void> {
        if (pending !== null) {
            return;
        }

        setPending(tier);
        setError(null);

        trackEvent('checkout_started', { tier, cycle });

        const sdk = loadCheckoutSdk(SDK_SOURCE);

        // Awaited below only once a URL exists; until then a failed load must not surface as unhandled.
        sdk.catch(() => undefined);

        try {
            const body: CheckoutBody = { plan: tier, cycle, locale };

            if (tier === 'team' && options.seats !== undefined) {
                body.seats = options.seats;
            }

            if (options.discountCode) {
                body.discount_code = options.discountCode;
            }

            // Attached last, so nothing between here and the request can drop it.
            const attribution = currentAttribution();

            if (attribution !== null) {
                body.attribution = attribution;
            }

            const res = await fetch(api('/v2/checkouts'), {
                method: 'POST',
                credentials: 'omit',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(body),
            });
            const data: unknown = await res.json().catch(() => ({}));
            const outcome = checkoutOutcome(res.status, data, {
                failed: m.pricing.checkout.failed,
                tooMany: m.forms.tooMany,
                planUnavailable: m.pricing.checkout.planUnavailable,
                seats: fmt(m.pricing.checkout.seats, PRICING.tiers.team.seats),
            });

            if (outcome.kind === 'error') {
                setError({ tier, message: outcome.message });

                return;
            }

            try {
                await withTimeout(sdk, SDK_WAIT_MS);
                await openCheckoutOverlay(outcome.url, overlayTheme());
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
