import { useState } from 'react';
import CellGrid from '@/components/ui/cell-grid';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useRegionalPricing } from '@/hooks/use-regional-pricing';
import { Trans, useI18n } from '@/i18n';
import { PRICING, type BillingCycle, type TierId } from '@/lib/data/pricing';
import { cn } from '@/lib/utils';
import BillingCycleControl from './billing-cycle-control';
import DiscountField from './discount-field';
import PricingCard, { type PricingCardVariant } from './pricing-card';
import RegionalNote from './regional-note';
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
 * the refund window from pricing.json, the discount code where this site
 * takes one, and the line on currency and the merchant of record.
 *
 * Yearly is selected first, as before the rebuild, and Team starts at its
 * minimum seats. Both render on the server, so the block reads the same
 * before and after hydration.
 *
 * Where checkout applies a regional discount, the platform says so after the
 * block has rendered (`useRegionalPricing`): the paid prices then show what
 * checkout will charge beside the struck list price, and a line above the
 * notes names the country. The server render, and so the cached page and its
 * structured data, always carries the list prices.
 *
 * The cards are joined cells of the page grid (design-system §4.7), so the
 * block belongs in a wide section.
 */
export default function PricingPlans({ checkout, variant = 'full', headingLevel = 'h3', className }: PricingPlansProps) {
    const { m, fmt, plural } = useI18n();
    const [cycle, setCycle] = useState<BillingCycle>('yearly');
    const [seats, setSeats] = useState<number>(PRICING.tiers.team.seats.min);
    const [discountCode, setDiscountCode] = useState<string | null>(null);
    const flow = useCheckout(checkout.provider);
    /*
     * A typed code replaces the regional discount at checkout; the two never
     * stack. So while one is applied, the cards show the list prices again.
     */
    const regionalDiscount = useRegionalPricing();
    const regional = discountCode === null ? regionalDiscount : null;

    /*
     * pricing.json names the merchant of record (Polar). Only its own checkout
     * may be described as such; another provider's gets the currency alone.
     */
    const merchantCheckout = checkout.provider === PRICING.merchantOfRecord.name.toLowerCase();

    return (
        // While the cycle control is pinned, a focused control must not scroll in under it.
        <div className={cn('max-lg:[&_:is(a,button,input:not([type=radio]),summary)]:scroll-mt-14', className)}>
            <BillingCycleControl value={cycle} onChange={setCycle} />

            <CellGrid className="mt-6 items-stretch lg:grid-cols-3">
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
                        regional={regional}
                    />
                ))}
            </CellGrid>

            <div className="mt-6 grid gap-3">
                {regional && <RegionalNote regional={regional} />}
                <p className="type-small text-muted-foreground">
                    <Trans
                        text={plural(m.pricing.refund, PRICING.refund.days)}
                        tags={{
                            link: (text) => (
                                <LocaleLink href="/refund-policy" className={textLinkClasses('inline')}>
                                    {text}
                                </LocaleLink>
                            ),
                        }}
                    />
                </p>
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
