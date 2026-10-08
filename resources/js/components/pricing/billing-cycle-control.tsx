import { useEffect, useRef, useState } from 'react';
import SegmentedControl from '@/components/ui/segmented-control';
import { useI18n, type Messages } from '@/i18n';
import { PRICING, yearlySavingsPercent, type BillingCycle } from '@/lib/data/pricing';
import { cn } from '@/lib/utils';

type Interpolate = (template: string, values: Record<string, string | number>) => string;

/**
 * The line under the control for a cycle. The yearly saving is arithmetic on
 * pricing.json (twelve monthly payments against one yearly payment, rounded
 * down), so it can never claim more than the published prices give, and it
 * follows a price change by itself. One percentage when both plans share it,
 * one per plan when they differ.
 */
export function cycleCaption(cycle: BillingCycle, m: Messages, fmt: Interpolate): string {
    if (cycle === 'monthly') {
        return m.pricing.captions.monthly;
    }

    if (cycle === 'lifetime') {
        return m.pricing.captions.lifetime;
    }

    const starter = yearlySavingsPercent('starter');
    const team = yearlySavingsPercent('team');

    return starter === team ? fmt(m.pricing.captions.yearly, { percent: starter }) : fmt(m.pricing.captions.yearlyByTier, { starterPercent: starter, teamPercent: team });
}

// `top-16`: the sticky header's height.
const PINNED_TOP = 64;

interface BillingCycleControlProps {
    value: BillingCycle;
    onChange: (cycle: BillingCycle) => void;
    className?: string;
}

/**
 * Monthly, yearly or one-time (design-system §5.3.5): a native radio group
 * from `ui/segmented-control`, with the computed caption announced politely
 * below it. Nothing inverts and no badge sits inside a segment, so the saving
 * never lands on a ground that changes with the selection (design-system
 * §2.4). Server-rendered with yearly checked, so it works before hydration.
 *
 * Below 1024px the cards stack, so the control stays under the header while
 * its parent is on screen and a price is never changed out of sight. The
 * caption is a sibling, not part of the pinned row, and the row draws a line
 * under itself only while it is pinned. A short viewport (a phone on its
 * side, a zoomed desktop) keeps the control in the flow.
 *
 * The other cycles' captions sit unseen in the caption's own grid cell, so it
 * is always as tall as the longest one and a change of cycle moves no card.
 */
export default function BillingCycleControl({ value, onChange, className }: BillingCycleControlProps) {
    const { m, fmt } = useI18n();
    const row = useRef<HTMLDivElement>(null);
    const [pinned, setPinned] = useState(false);

    useEffect(() => {
        const element = row.current;

        if (!element) {
            return;
        }

        // The root stops one pixel below where the row pins, so the row is cut by it exactly while it is pinned.
        const observer = new IntersectionObserver(
            ([entry]) => setPinned(entry.intersectionRatio < 1 && entry.boundingClientRect.top <= PINNED_TOP && getComputedStyle(element).position === 'sticky'),
            { rootMargin: `-${PINNED_TOP + 1}px 0px 0px`, threshold: 1 },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <div
                ref={row}
                data-pinned={pinned || undefined}
                className={cn(
                    'max-lg:top-16 max-lg:z-30 max-lg:-mx-(--cell-bleed) max-lg:-my-2 max-lg:bg-[color:var(--table-ground,var(--background))] max-lg:px-(--cell-bleed) max-lg:py-2',
                    'max-lg:[@media(min-height:40rem)]:sticky max-lg:[@media(min-height:40rem)]:data-pinned:shadow-[0_1px_0_var(--rule)]',
                    className,
                )}
            >
                <SegmentedControl<BillingCycle>
                    legend={m.pricing.cycles.legend}
                    value={value}
                    onChange={onChange}
                    options={PRICING.cycles.map((cycle) => ({ value: cycle, label: m.pricing.cycles[cycle] }))}
                />
            </div>
            <div className="mt-2 grid">
                <p aria-live="polite" className="type-small col-start-1 row-start-1 min-h-[1.6em] text-muted-foreground">
                    {cycleCaption(value, m, fmt)}
                </p>
                {PRICING.cycles
                    .filter((cycle) => cycle !== value)
                    .map((cycle) => (
                        <p key={cycle} className="type-small invisible col-start-1 row-start-1">
                            {cycleCaption(cycle, m, fmt)}
                        </p>
                    ))}
            </div>
        </>
    );
}
