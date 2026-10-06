import { useId, type ReactNode } from 'react';
import Button, { buttonClasses } from '@/components/ui/button';
import Callout from '@/components/ui/callout';
import { CheckGlyph } from '@/components/ui/glyph';
import LocaleLink from '@/components/ui/locale-link';
import Stepper from '@/components/ui/stepper';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { formatUsd } from '@/i18n/format';
import { trackDownload } from '@/lib/analytics';
import { highlightedFeatures, paidFeaturesForTier } from '@/lib/data/paid-features';
import { PRICING, teamTotal, tierPrice, type BillingCycle, type PaidTierId, type TierId } from '@/lib/data/pricing';
import { cn } from '@/lib/utils';
import type { Checkout } from './use-checkout';

export type PricingCardVariant = 'full' | 'compact';

interface PricingCardProps {
    tier: TierId;
    cycle: BillingCycle;
    /** `compact` (the homepage) leaves out the Includes list. */
    variant: PricingCardVariant;
    /** The title's element: `h3` under a section's `h2`, `h2` when the cards sit directly under the page's `h1`. */
    headingLevel: 'h2' | 'h3';
    checkout: Checkout;
    /** Team only. */
    seats: number;
    onSeatsChange: (seats: number) => void;
    /** A previewed, valid discount code, sent with checkout. */
    discountCode: string | null;
}

/**
 * One plan (design-system §5.3.18 `PricingCard`): the name and one line, the
 * price with its unit, Team's seat stepper and live total, what one license
 * covers, the action, and (on `/pricing`) what the plan includes.
 *
 * The three cards are equal: same width, same `secondary` buttons, no badge
 * and no highlighted card. Each is a cell of the plans' `CellGrid`, so it has
 * no border, corner or fill of its own (design-system §4.7). No plan is "most popular", and the price is the
 * focal point.
 *
 * From 1024px the parent grid lays the cards' rows on shared tracks
 * (`grid-rows-subgrid`), so the prices, the actions and the lists line up
 * across the three cards whatever each one holds. The price and what one
 * license covers share one track: Team's seat stepper makes that track tall,
 * and the spare height in Free and Starter then falls under their activation
 * line, above the button, instead of between the price and the line that
 * explains it.
 *
 * From 768 to 1023px the cards stack full width, so a full card has two
 * columns inside (design-system §5.3.18): the price, activation and action on
 * the left, what the plan includes on the right. A compact card keeps one
 * column with its button at a readable width. Below 768px each card is one
 * column.
 */
export default function PricingCard({ tier, cycle, variant, headingLevel, checkout, seats, onSeatsChange, discountCode }: PricingCardProps) {
    const { m, plural } = useI18n();
    const id = useId();
    const Title = headingLevel;
    const copy = m.pricing.tiers[tier];

    return (
        <article
            aria-labelledby={`${id}-title`}
            className={cn(
                'grid content-start gap-4 lg:grid-rows-subgrid',
                variant === 'full' ? 'md:max-lg:grid-cols-2 md:max-lg:gap-x-8 lg:row-span-4' : 'lg:row-span-3',
            )}
        >
            <div className="md:max-lg:col-span-2">
                <Title id={`${id}-title`} className="type-h3 text-foreground">
                    {copy.name}
                </Title>
                <p className="type-small mt-1 text-muted-foreground">{copy.description}</p>
            </div>

            <div className="grid content-start gap-4 md:max-lg:col-start-1">
                <div>{tier === 'free' ? <Price amount={0} /> : <PaidPrice tier={tier} cycle={cycle} seats={seats} onSeatsChange={onSeatsChange} />}</div>

                <p className="type-small text-foreground">
                    {tier === 'free' && m.pricing.tiers.free.activation}
                    {tier === 'starter' && plural(m.pricing.tiers.starter.activation, PRICING.tiers.starter.activations)}
                    {tier === 'team' && m.pricing.tiers.team.activation}
                </p>
            </div>

            <div className={cn('grid content-start gap-3 md:max-lg:col-start-1', variant === 'compact' && 'md:max-lg:max-w-sm')}>
                {tier === 'free' ? (
                    <LocaleLink href="/download" onClick={() => trackDownload('pricing-free')} className={buttonClasses('secondary', 'md', 'w-full')}>
                        {m.download.macCta}
                    </LocaleLink>
                ) : (
                    <Button
                        variant="secondary"
                        fullWidth
                        loading={checkout.pending === tier}
                        onPointerEnter={checkout.warm}
                        onFocus={checkout.warm}
                        onClick={() => void checkout.start(tier, cycle, { seats: tier === 'team' ? seats : undefined, discountCode })}
                    >
                        {m.pricing.tiers[tier].cta}
                    </Button>
                )}
                {tier !== 'free' && checkout.error?.tier === tier && (
                    <Callout tone="danger" role="alert">
                        <p>{checkout.error.message}</p>
                    </Callout>
                )}
            </div>

            {variant === 'full' && <Includes tier={tier} className="md:max-lg:col-start-2 md:max-lg:row-span-2 md:max-lg:row-start-2 md:max-lg:border-t-0 md:max-lg:pt-0" />}
        </article>
    );
}

function Price({ amount, unit }: { amount: number; unit?: string }) {
    const { m } = useI18n();

    return (
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="type-h1 text-foreground tabular-nums">{formatUsd(amount, m.pricing.currency)}</span>
            {unit && <span className="type-small text-muted-foreground">{unit}</span>}
        </p>
    );
}

interface PaidPriceProps {
    tier: PaidTierId;
    cycle: BillingCycle;
    seats: number;
    onSeatsChange: (seats: number) => void;
}

/**
 * A paid plan's price for the chosen cycle. Team adds the seat stepper, its
 * bounds from pricing.json and the total for the seats chosen, announced as it
 * changes. The total line keeps its height, so stepping moves nothing.
 */
function PaidPrice({ tier, cycle, seats, onSeatsChange }: PaidPriceProps) {
    const { m, fmt, plural } = useI18n();
    const id = useId();

    const price = <Price amount={tierPrice(tier, cycle)} unit={m.pricing.units[tier][cycle]} />;

    if (tier === 'starter') {
        return price;
    }

    const { min, max } = PRICING.tiers.team.seats;
    const boundsId = `${id}-bounds`;
    const total = formatUsd(teamTotal(seats, cycle), m.pricing.currency);

    return (
        <div className="grid gap-3">
            {price}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-sm leading-[1.3] font-medium text-foreground" aria-hidden="true">
                    {m.pricing.seats.label}
                </span>
                <Stepper
                    id={`${id}-seats`}
                    value={seats}
                    min={min}
                    max={max}
                    onChange={onSeatsChange}
                    label={m.pricing.seats.label}
                    decreaseLabel={fmt(m.controls.stepper.decrease, { label: m.pricing.seats.noun })}
                    increaseLabel={fmt(m.controls.stepper.increase, { label: m.pricing.seats.noun })}
                    aria-describedby={boundsId}
                />
            </div>
            <p aria-live="polite" className="type-small min-h-[1.6em] font-medium text-foreground tabular-nums">
                {plural(m.pricing.seats.total[cycle], seats, { total })}
            </p>
            <p id={boundsId} className="type-caption text-muted-foreground tabular-nums">
                {fmt(m.pricing.seats.bounds, { min, max })}
            </p>
        </div>
    );
}

function IncludesItem({ children }: { children: ReactNode }) {
    return (
        <li className="flex items-start gap-2.5">
            <CheckGlyph className="mt-[0.2em] shrink-0" />
            <span>{children}</span>
        </li>
    );
}

/**
 * What a plan adds, on `/pricing` only. Free lists what needs no license;
 * Starter and Team name their highlighted features from paid-features.json
 * and point to the full table below, which names every one of them.
 */
function Includes({ tier, className }: { tier: TierId; className?: string }) {
    const { m, plural } = useI18n();
    const copy = m.pricing.tiers[tier];

    let items: ReactNode[];

    if (tier === 'free') {
        items = m.pricing.tiers.free.includes;
    } else {
        items = highlightedFeatures(tier).map((feature) => feature.name);

        if (tier === 'team') {
            items = [...items, m.pricing.prioritySupport.name];
        }
    }

    const more = tier !== 'free' && paidFeaturesForTier(tier).length > highlightedFeatures(tier).length;

    return (
        <div className={cn('-mx-(--cell-bleed) border-t border-rule px-(--cell-bleed) pt-4', className)}>
            <p className="text-sm leading-[1.3] font-medium text-foreground">{copy.includesTitle}</p>
            <ul className="type-small mt-3 grid gap-2 text-foreground">
                {items.map((item, index) => (
                    <IncludesItem key={index}>{item}</IncludesItem>
                ))}
            </ul>
            {tier === 'team' && (
                <p className="type-caption mt-2 text-muted-foreground">
                    {plural(m.pricing.prioritySupport.detail, PRICING.tiers.team.prioritySupport.responseBusinessDays)}
                </p>
            )}
            {(more || tier === 'team') && (
                <p className="mt-3">
                    <a href="#features" className={textLinkClasses('standalone')}>
                        {m.pricing.allFeatures}
                        <span aria-hidden="true">↓</span>
                    </a>
                </p>
            )}
        </div>
    );
}
