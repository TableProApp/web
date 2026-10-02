import type { Messages } from '@/i18n';
import { PRICING, type TierId } from '@/lib/data/pricing';
import { pricingOffers, type OfferInput } from '@/lib/structured-data';

type Interpolate = (template: string, values: Record<string, string | number>) => string;

/**
 * One structured-data offer per price the plan cards show, named in the
 * page's language ("Starter, Yearly", "Starter, Theo năm"). Prices stay
 * locale-neutral strings, and the currency is pricing.json's.
 *
 * For any page that renders `PricingPlans` and so shows every price: `/pricing`
 * and the homepage. Pass the result as the Mac app node's `offers`.
 */
export function planOffers(m: Messages, fmt: Interpolate): OfferInput[] {
    return pricingOffers(
        PRICING,
        (tier, cycle) => {
            const plan = m.pricing.tiers[tier as TierId].name;

            return cycle === null ? plan : fmt(m.pricing.offers.name, { plan, cycle: m.pricing.cycles[cycle] });
        },
        (unit) => (unit === 'seat' ? m.pricing.offers.seat : undefined),
    );
}
