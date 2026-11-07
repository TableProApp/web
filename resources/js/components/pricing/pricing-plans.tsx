import { useState, type ReactNode } from 'react';
import CellGrid from '@/components/ui/cell-grid';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useRegionalPricing, useTeamMaxSeats } from '@/hooks/use-regional-pricing';
import { Trans, useI18n } from '@/i18n';
import { PRICING, type BillingCycle, type PaidTierId, type TierId } from '@/lib/data/pricing';
import { cn } from '@/lib/utils';
import BillingCycleControl from './billing-cycle-control';
import DiscountField from './discount-field';
import EnterpriseRow from './enterprise-row';
import PricingCard, { type PricingCardVariant } from './pricing-card';
import RegionalNote from './regional-note';
import { useCheckout } from './use-checkout';

const ALL_TIERS: readonly TierId[] = ['free', 'starter', 'team'];

interface PricingPlansProps {
    // `compact` (no Includes lists) in the homepage section.
    variant?: PricingCardVariant;
    headingLevel?: 'h2' | 'h3';
    // /teams shows Team alone, sold monthly or yearly.
    tiers?: readonly TierId[];
    cycles?: readonly BillingCycle[];
    enterprise?: boolean;
    className?: string;
}

// The regional price and the seat maximum arrive after the first render, so the cached page and its structured data
// carry the list prices and no maximum.
export default function PricingPlans({ variant = 'full', headingLevel = 'h3', tiers = ALL_TIERS, cycles = PRICING.cycles, enterprise = true, className }: PricingPlansProps) {
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
    const paid = tiers.filter((tier): tier is PaidTierId => tier !== 'free');
    const single = tiers.length === 1;

    return (
        // While the cycle control is pinned, a focused control must not scroll in under it.
        <div className={cn('max-lg:[&_:is(a,button,input:not([type=radio]),summary)]:scroll-mt-14', className)}>
            <BillingCycleControl value={cycle} onChange={setCycle} cycles={cycles} tiers={paid} align={single ? 'start' : 'center'} />

            {/* A grid of cells draws its edges through the page, so one plan on its own sits in a panel instead. */}
            <PlanGrid single={single}>
                {tiers.map((tier) => (
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
                        leads={single || tier === 'starter'}
                    />
                ))}
                {enterprise && <EnterpriseRow headingLevel={headingLevel} className="max-lg:order-2 lg:col-span-3" />}
            </PlanGrid>

            <div className="mt-6 grid gap-2">
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
                    />{' '}
                    {fmt(m.pricing.finePrint, { merchant: PRICING.merchantOfRecord.name })}
                </p>
                <DiscountField onApplied={setDiscountCode} />
            </div>
        </div>
    );
}

function PlanGrid({ single, children }: { single: boolean; children: ReactNode }) {
    return single ? (
        <div className="mt-6 grid rounded-panel border border-rule bg-background px-(--cell-bleed) py-6">{children}</div>
    ) : (
        <CellGrid className="mt-6 items-stretch lg:grid-cols-3">{children}</CellGrid>
    );
}
