import { useId, useState, type FormEvent } from 'react';
import Button, { buttonClasses } from '@/components/ui/button';
import Callout from '@/components/ui/callout';
import { CheckGlyph } from '@/components/ui/glyph';
import LocaleLink from '@/components/ui/locale-link';
import RollingText from '@/components/ui/rolling-text';
import Stepper from '@/components/ui/stepper';
import { textLinkClasses } from '@/components/ui/text-link';
import { useCampaign } from '@/hooks/use-campaign';
import { useI18n } from '@/i18n';
import { formatNumber, formatUsd } from '@/i18n/format';
import { trackDownload } from '@/lib/analytics';
import { highlightedFeatures, paidFeaturesForTier } from '@/lib/data/paid-features';
import { PRICING, sells, teamTotal, tierPrice, type BillingCycle, type PaidTierId, type TierId } from '@/lib/data/pricing';
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
    // The one plan a page leads with: its card is raised and its button the only filled one.
    leads?: boolean;
}

// From 1024px the rows sit on the parent's subgrid tracks, so prices, actions and lists line up across the cards.
export default function PricingCard({ tier, cycle, variant, headingLevel, checkout, seats, maxSeats, onSeatsChange, discountCode, regional, leads = false }: PricingCardProps) {
    const { m, plural } = useI18n();
    const { offer } = useCampaign();
    const id = useId();
    const Title = headingLevel;
    const copy = m.pricing.tiers[tier];

    return (
        <article
            aria-labelledby={`${id}-title`}
            className={cn(
                'grid content-start gap-5 lg:grid-rows-subgrid',
                variant === 'full' ? 'lg:row-span-4' : 'lg:row-span-3',
                leads && 'plan-lead',
                // Stacked on a phone or tablet, the paid plans come first and Free last (owner, 2026-11-07).
                tier === 'free' && 'max-lg:order-1',
            )}
        >
            <div>
                <Title id={`${id}-title`} className="type-h3 text-foreground">
                    {copy.name}
                </Title>
                <p className="type-small mt-1 text-muted-foreground">{copy.description}</p>
            </div>

            <div className="grid content-start gap-2">
                {tier === 'free' ? (
                    <Price amount={0} />
                ) : (
                    <PaidPrice
                        tier={tier}
                        cycle={cycle}
                        seats={seats}
                        maxSeats={maxSeats}
                        onSeatsChange={onSeatsChange}
                        regional={regional}
                        typedCode={discountCode}
                    />
                )}
                <p className="type-small text-muted-foreground">
                    {tier === 'free' && m.pricing.tiers.free.activation}
                    {tier === 'starter' && plural(m.pricing.tiers.starter.activation, PRICING.license.deviceLimit)}
                    {tier === 'team' && plural(m.pricing.tiers.team.activation, PRICING.license.deviceLimit)}
                </p>
            </div>

            <div className="grid content-start gap-3">
                {tier === 'free' ? (
                    <LocaleLink href="/download" onClick={() => trackDownload('pricing-free')} className={buttonClasses('secondary', 'md', 'w-full')}>
                        {m.download.macCta}
                    </LocaleLink>
                ) : (
                    <Button
                        variant={leads ? 'primary' : 'secondary'}
                        fullWidth
                        disabled={!sells(tier, cycle)}
                        loading={checkout.pending === tier}
                        onPointerEnter={checkout.warm}
                        onFocus={checkout.warm}
                        onClick={() =>
                            void checkout.start(tier, cycle, {
                                seats: tier === 'team' ? seats : undefined,
                                maxSeats,
                                // A typed code is the reader's choice; otherwise a live sale's, where it applies.
                                discountCode: discountCode ?? offer(tier, cycle, regional?.percent ?? null)?.code ?? null,
                            })
                        }
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

            {variant === 'full' && <Includes tier={tier} />}
        </article>
    );
}

const AMOUNT = 'text-[2.5rem] leading-[1.1] font-semibold tracking-[-0.035em] text-foreground';

// One price on show. The digits roll when it changes; a screen reader hears the price once, in words. A currency symbol
// longer than "$" (US$, $US, USD) is set smaller, so it does not outweigh the number.
function Price({ amount, listAmount, unit }: { amount: number; listAmount?: number; unit?: string }) {
    const { m, fmt } = useI18n();
    const style = m.pricing.currency;
    const text = formatUsd(amount, style);
    const number = formatNumber(amount, style, Number.isInteger(amount) ? 0 : 2);
    const [before, after = ''] = style.pattern.replace(/ /g, '\u00a0').split('{amount}');
    const affix = (part: string) => (part.trim().length > 1 ? <span className="sale-affix">{part}</span> : part);

    return (
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {listAmount !== undefined && (
                <s className="type-body text-muted-foreground tabular-nums">
                    <span className="sr-only">{fmt(m.pricing.regional.listPrice, { price: formatUsd(listAmount, m.pricing.currency) })}</span>
                    <span aria-hidden="true">{formatUsd(listAmount, m.pricing.currency)}</span>
                </s>
            )}
            <span className="sr-only">{text}</span>
            <span aria-hidden="true" className={cn('inline-flex items-baseline tabular-nums', AMOUNT)}>
                {affix(before)}
                <RollingText value={number} />
                {affix(after)}
            </span>
            {unit && <span className="type-small text-muted-foreground">{unit}</span>}
        </p>
    );
}

// The other cycles' prices, in the HTML but not shown, so the page states each price its structured data offers.
function OtherPrice({ text, unit }: { text: string; unit?: string }) {
    return (
        <p hidden>
            {text} {unit}
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
    typedCode: string | null;
}

// Team's total is discounted as a whole, as checkout discounts the order, so it can differ by a cent from the seat price
// times the seats. Team's yearly price shows as a month's share, billed yearly; Team has no one-time price, so that cycle
// says so instead. While a dated sale is live, a cycle it covers shows the sale's price under its tag instead of the
// regional one, unless the regional discount takes more off (`offerFor`): checkout applies one discount, and the card
// shows the one it will.
function PaidPrice({ tier, cycle, seats, maxSeats, onSeatsChange, regional, typedCode }: PaidPriceProps) {
    const { m, fmt, plural } = useI18n();
    const { offer } = useCampaign();
    const id = useId();
    const [bound, setBound] = useState<SeatBound | null>(null);

    const usd = (amount: number): string => formatUsd(amount, m.pricing.currency);
    const charged = (amount: number): number => (regional ? discountedAmount(amount, regional.percent) : amount);
    const units: Partial<Record<BillingCycle, string>> = m.pricing.units[tier];
    const shownAmount = (each: BillingCycle): number | undefined => {
        const amount = tierPrice(tier, each);

        return amount === undefined ? undefined : tier === 'team' && each === 'yearly' ? amount / 12 : amount;
    };
    const saleFor = (each: BillingCycle) => (typedCode !== null && typedCode.toUpperCase() !== PRICING.campaign?.code ? null : offer(tier, each, regional?.percent ?? null));

    const others = PRICING.cycles
        .filter((each) => each !== cycle)
        .map((each) => {
            const shown = shownAmount(each);

            if (shown === undefined) {
                return <OtherPrice key={each} text={m.pricing.tiers.team.subscriptionOnly} />;
            }

            const sale = saleFor(each);

            return <OtherPrice key={each} text={usd(sale ? discountedAmount(shown, sale.percent) : charged(shown))} unit={units[each]} />;
        });

    const shown = shownAmount(cycle);
    const sale = shown === undefined ? null : saleFor(cycle);

    const current =
        shown === undefined ? (
            <p className="type-body text-muted-foreground">{m.pricing.tiers.team.subscriptionOnly}</p>
        ) : sale !== null ? (
            <div className="grid gap-1.5">
                <p className="type-small flex items-center gap-2 font-medium text-foreground">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                    {fmt(m.campaign.offer.tag, { percent: sale.percent })}
                </p>
                <Price amount={discountedAmount(shown, sale.percent)} listAmount={shown} unit={units[cycle]} />
                {sale.firstChargeOnly && <p className="type-caption text-muted-foreground">{fmt(m.campaign.offer.firstYear, { price: usd(shown) })}</p>}
            </div>
        ) : (
            <Price amount={charged(shown)} listAmount={regional ? shown : undefined} unit={units[cycle]} />
        );

    if (tier === 'starter' || cycle === 'lifetime') {
        return (
            <>
                {current}
                {others}
            </>
        );
    }

    const { min } = PRICING.tiers.team.seats;
    const max = maxSeats;
    const boundsId = `${id}-bounds`;
    const total = usd(charged(teamTotal(seats, cycle)));
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
            {current}
            {others}
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
                <span aria-live="polite" className="type-small font-medium text-foreground tabular-nums">
                    {plural(m.pricing.seats.total[cycle], seats, { total })}
                </span>
            </div>
            <p id={boundsId} aria-live="polite" className={cn('type-caption tabular-nums', bound === 'min' || (bound === 'max' && max !== null) ? 'text-foreground' : 'text-muted-foreground')}>
                {caption}
            </p>
        </div>
    );
}

function Includes({ tier }: { tier: TierId }) {
    const { m } = useI18n();
    const copy = m.pricing.tiers[tier];
    const items =
        tier === 'free'
            ? m.pricing.tiers.free.includes
            : [...highlightedFeatures(tier).map((feature) => feature.name), ...(tier === 'team' ? [m.pricing.prioritySupport.name] : [])];
    const more = tier !== 'free' && paidFeaturesForTier(tier).length > highlightedFeatures(tier).length;

    return (
        <div className="-mx-(--cell-bleed) border-t border-rule px-(--cell-bleed) pt-5">
            <p className="text-sm leading-[1.3] font-medium text-foreground">{copy.includesTitle}</p>
            <ul className="type-small mt-3 grid gap-2 text-foreground">
                {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                        <CheckGlyph className="mt-[0.2em] shrink-0" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
            {more && (
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
