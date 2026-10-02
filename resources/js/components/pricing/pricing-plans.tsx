import { useState } from 'react';
import { useI18n } from '@/i18n';
import { PRICING, type BillingCycle, type TierId } from '@/lib/data/pricing';
import BillingCycleControl from './billing-cycle-control';
import DiscountField from './discount-field';
import PricingCard, { type PricingCardVariant } from './pricing-card';
import type { CheckoutProp } from './types';
import { useCheckout } from './use-checkout';

const TIERS: readonly TierId[] = ['free', 'starter', 'team'];

interface PricingPlansProps {
    checkout: CheckoutProp;
    /** `full` on `/pricing`; `compact` (no Includes lists) in the homepage section. */
    variant?: PricingCardVariant;
    /** The cards' heading element: `h3` under a section heading (default), `h2` directly under the page's `h1`. */
    headingLevel?: 'h2' | 'h3';
    className?: string;
}

/**
 * The working plan block, the same on `/pricing` and on the homepage: the
 * billing-cycle control and its caption, the Free, Starter and Team cards,
 * the discount code where this site takes one, and the line on currency and
 * the merchant of record.
 *
 * Yearly is selected first, as before the rebuild, and Team starts at its
 * minimum seats. Both render on the server, so the block reads the same
 * before and after hydration.
 */
export default function PricingPlans({ checkout, variant = 'full', headingLevel = 'h3', className }: PricingPlansProps) {
    const { m, fmt } = useI18n();
    const [cycle, setCycle] = useState<BillingCycle>('yearly');
    const [seats, setSeats] = useState<number>(PRICING.tiers.team.seats.min);
    const [discountCode, setDiscountCode] = useState<string | null>(null);
    const flow = useCheckout(checkout.provider);

    /*
     * pricing.json names the merchant of record (Polar). Only its own checkout
     * may be described as such; another provider's gets the currency alone.
     */
    const merchantCheckout = checkout.provider === PRICING.merchantOfRecord.name.toLowerCase();

    return (
        <div className={className}>
            <BillingCycleControl value={cycle} onChange={setCycle} />

            <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-3">
                {TIERS.map((tier) => (
                    <PricingCard
                        key={tier}
                        tier={tier}
                        cycle={cycle}
                        variant={variant}
                        headingLevel={headingLevel}
                        checkout={flow}
                        seats={seats}
                        onSeatsChange={setSeats}
                        discountCode={discountCode}
                    />
                ))}
            </div>

            <div className="mt-6 grid gap-3">
                {checkout.couponField ? (
                    <DiscountField onApplied={setDiscountCode} />
                ) : (
                    <p className="type-small text-muted-foreground">{m.pricing.discount.atCheckout}</p>
                )}
                <p className="type-small text-muted-foreground">
                    {merchantCheckout ? fmt(m.pricing.finePrint, { merchant: PRICING.merchantOfRecord.name }) : m.pricing.finePrintCurrency}
                </p>
            </div>
        </div>
    );
}
