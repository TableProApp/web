import { useId, useState, type FormEvent, type ReactNode } from 'react';
import Button, { buttonClasses } from '@/components/ui/button';
import Callout from '@/components/ui/callout';
import { CheckGlyph } from '@/components/ui/glyph';
import LocaleLink from '@/components/ui/locale-link';
import Stepper from '@/components/ui/stepper';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { formatUsd } from '@/i18n/format';
import { trackDownload } from '@/lib/analytics';
import { examplesText, highlightedFeatures, paidFeaturesForTier } from '@/lib/data/paid-features';
import { PRICING, teamTotal, tierPrice, type BillingCycle, type PaidTierId, type TierId } from '@/lib/data/pricing';
import { discountedAmount, type Regional } from '@/lib/regional-pricing';
import { cn } from '@/lib/utils';
import { typedSeats, type SeatBound } from './seats';
import type { Checkout } from './use-checkout';

export type PricingCardVariant = 'full' | 'compact';

interface PricingCardProps {
    tier: TierId;
    cycle: BillingCycle;
    // `compact` (the homepage) leaves out the Includes list.
    variant: PricingCardVariant;
    headingLevel: 'h2' | 'h3';
    checkout: Checkout;
    seats: number;
    // Null until GET /v2/pricing names one for this cycle, and when Polar sets none.
    maxSeats: number | null;
    onSeatsChange: (seats: number) => void;
    discountCode: string | null;
    // Null until GET /v2/pricing says checkout applies one to this reader.
    regional: Regional | null;
}

// From 1024px the rows sit on the parent's subgrid tracks, so prices, actions and lists line up across the cards, and
// the spare height in Free and Starter falls under the activation line rather than between the price and that line.
export default function PricingCard({ tier, cycle, variant, headingLevel, checkout, seats, maxSeats, onSeatsChange, discountCode, regional }: PricingCardProps) {
    const { m, fmt, plural } = useI18n();
    const id = useId();
    const Title = headingLevel;
    const copy = m.pricing.tiers[tier];
    const description = tier === 'starter' ? fmt(copy.description, { examples: examplesText('starter', m.common.list) }) : copy.description;

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
                <p className="type-small mt-1 text-muted-foreground">{description}</p>
            </div>

            <div className="grid content-start gap-4 md:max-lg:col-start-1">
                <div>{tier === 'free' ? <Price amount={0} /> : <PaidPrice tier={tier} cycle={cycle} seats={seats} maxSeats={maxSeats} onSeatsChange={onSeatsChange} regional={regional} />}</div>

                <p className="type-small text-foreground">
                    {tier === 'free' && m.pricing.tiers.free.activation}
                    {tier === 'starter' && plural(m.pricing.tiers.starter.activation, PRICING.license.deviceLimit)}
                    {tier === 'team' && plural(m.pricing.tiers.team.activation, PRICING.license.deviceLimit)}
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
                        onClick={() => void checkout.start(tier, cycle, { seats: tier === 'team' ? seats : undefined, maxSeats, discountCode })}
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

// A screen reader reads no strikethrough, so the struck list price is named in words too.
function Price({ amount, listAmount, unit, hidden = false }: { amount: number; listAmount?: number; unit?: string; hidden?: boolean }) {
    const { m, fmt } = useI18n();

    return (
        <p hidden={hidden} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {listAmount !== undefined && (
                <s className="type-body text-muted-foreground tabular-nums">
                    <span className="sr-only">{fmt(m.pricing.regional.listPrice, { price: formatUsd(listAmount, m.pricing.currency) })}</span>
                    <span aria-hidden="true">{formatUsd(listAmount, m.pricing.currency)}</span>
                </s>
            )}
            <span className="type-h1 text-foreground tabular-nums">{formatUsd(amount, m.pricing.currency)}</span>
            {unit && <span className="type-small text-muted-foreground">{unit}</span>}
        </p>
    );
}

interface PaidPriceProps {
    tier: PaidTierId;
    cycle: BillingCycle;
    seats: number;
    maxSeats: number | null;
    onSeatsChange: (seats: number) => void;
    regional: Regional | null;
}

// Every cycle's price is in the HTML, so the page states each price its structured data offers. Team's total is
// discounted as a whole, as checkout discounts the order, so it can differ by a cent from the seat price times the seats.
function PaidPrice({ tier, cycle, seats, maxSeats, onSeatsChange, regional }: PaidPriceProps) {
    const { m, fmt, plural } = useI18n();
    const id = useId();
    const [bound, setBound] = useState<SeatBound | null>(null);

    const charged = (amount: number): number => (regional ? discountedAmount(amount, regional.percent) : amount);
    const prices = PRICING.cycles.map((each) => (
        <Price
            key={each}
            amount={charged(tierPrice(tier, each))}
            listAmount={regional ? tierPrice(tier, each) : undefined}
            unit={m.pricing.units[tier][each]}
            hidden={each !== cycle}
        />
    ));

    if (tier === 'starter') {
        return <>{prices}</>;
    }

    const { min } = PRICING.tiers.team.seats;
    const max = maxSeats;
    const boundsId = `${id}-bounds`;
    const total = formatUsd(charged(teamTotal(seats, cycle)), m.pricing.currency);
    // A cycle without a maximum can follow one that had it, so a stale `max` bound reads as the plain caption.
    const caption =
        bound === 'min'
            ? fmt(m.pricing.seats.clamped.min, { min })
            : max === null
              ? fmt(m.pricing.seats.minimum, { min })
              : fmt(bound === 'max' ? m.pricing.seats.clamped.max : m.pricing.seats.bounds, { min, max });

    function change(next: number): void {
        setBound(null);
        onSeatsChange(next);
    }

    // The shared Stepper reports a typed count only on blur or Enter. Its input's events bubble, so the total follows the digits instead.
    function follow(event: FormEvent<HTMLDivElement>): void {
        if (event.target instanceof HTMLInputElement) {
            const typed = typedSeats(event.target.value, min, max).seats;

            if (typed !== null) {
                change(typed);
            }
        }
    }

    // Runs after the Stepper has clamped the field, to say which limit it was changed to.
    function settle(target: EventTarget): void {
        if (target instanceof HTMLInputElement) {
            setBound(typedSeats(target.value, min, max).bound);
        }
    }

    return (
        <div className="grid gap-3">
            {prices}
            <div
                className="flex flex-wrap items-center gap-x-3 gap-y-2"
                onChange={follow}
                onBlur={(event) => settle(event.target)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        settle(event.target);
                    }
                }}
            >
                <span className="text-sm leading-[1.3] font-medium text-foreground" aria-hidden="true">
                    {m.pricing.seats.label}
                </span>
                <Stepper
                    id={`${id}-seats`}
                    value={seats}
                    min={min}
                    max={max}
                    onChange={change}
                    label={m.pricing.seats.label}
                    decreaseLabel={fmt(m.controls.stepper.decrease, { label: m.pricing.seats.noun })}
                    increaseLabel={fmt(m.controls.stepper.increase, { label: m.pricing.seats.noun })}
                    aria-describedby={boundsId}
                />
            </div>
            <p aria-live="polite" className="type-small min-h-[1.6em] font-medium text-foreground tabular-nums">
                {plural(m.pricing.seats.total[cycle], seats, { total })}
            </p>
            <p id={boundsId} aria-live="polite" className={cn('type-caption tabular-nums', bound === 'min' || (bound === 'max' && max !== null) ? 'text-foreground' : 'text-muted-foreground')}>
                {caption}
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
