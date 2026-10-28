import { useState } from 'react';
import CellGrid from '@/components/ui/cell-grid';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useRegionalPricing, useTeamMaxSeats } from '@/hooks/use-regional-pricing';
import { Trans, useI18n } from '@/i18n';
import { PRICING, type BillingCycle, type TierId } from '@/lib/data/pricing';
import { cn } from '@/lib/utils';
import BillingCycleControl from './billing-cycle-control';
import DiscountField from './discount-field';
import PricingCard, { type PricingCardVariant } from './pricing-card';
import RegionalNote from './regional-note';
import { useCheckout } from './use-checkout';

const TIERS: readonly TierId[] = ['free', 'starter', 'team'];

interface PricingPlansProps {
    // `compact` (no Includes lists) in the homepage section.
    variant?: PricingCardVariant;
    headingLevel?: 'h2' | 'h3';
    className?: string;
}

// The regional price and the seat maximum arrive after the first render, so the cached page and its structured data
// carry the list prices and no maximum.
export default function PricingPlans({ variant = 'full', headingLevel = 'h3', className }: PricingPlansProps) {
    const { m, fmt, plural } = useI18n();
    const [cycle, setCycle] = useState<BillingCycle>('yearly');
    const [seats, setSeats] = useState<number>(PRICING.tiers.team.seats.min);
    const [discountCode, setDiscountCode] = useState<string | null>(null);
    const flow = useCheckout();
    // A typed code replaces the regional discount at checkout; the two never stack.
    const regionalDiscount = useRegionalPricing();
    const regional = discountCode === null ? regionalDiscount : null;
    const maxSeats = useTeamMaxSeats()[cycle] ?? null;
    const teamSeats = maxSeats === null ? seats : Math.min(seats, maxSeats);

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
                        seats={teamSeats}
                        maxSeats={maxSeats}
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
                <DiscountField onApplied={setDiscountCode} />
                <p className="type-small text-muted-foreground">{fmt(m.pricing.finePrint, { merchant: PRICING.merchantOfRecord.name })}</p>
            </div>
        </div>
    );
}
