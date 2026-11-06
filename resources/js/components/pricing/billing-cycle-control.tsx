import { useEffect, useRef, useState } from 'react';
import SegmentedControl from '@/components/ui/segmented-control';
import { useI18n, type Messages } from '@/i18n';
import { PRICING, yearlySavingsPercent, type BillingCycle, type PaidTierId } from '@/lib/data/pricing';
import { cn } from '@/lib/utils';

type Interpolate = (template: string, values: Record<string, string | number>) => string;

export function cycleCaption(cycle: BillingCycle, m: Messages, fmt: Interpolate, tiers: readonly PaidTierId[] = ['starter', 'team']): string {
    if (cycle === 'monthly') {
        return m.pricing.captions.monthly;
    }

    if (cycle === 'lifetime') {
        return m.pricing.captions.lifetime;
    }

    const percents = tiers.map((tier) => yearlySavingsPercent(tier));

    if (tiers.length === 1 || percents.every((percent) => percent === percents[0])) {
        return fmt(m.pricing.captions.yearly, { percent: percents[0] });
    }

    return fmt(m.pricing.captions.yearlyByTier, { starterPercent: yearlySavingsPercent('starter'), teamPercent: yearlySavingsPercent('team') });
}

// `top-16`: the sticky header's height.
const PINNED_TOP = 64;

interface BillingCycleControlProps {
    value: BillingCycle;
    onChange: (cycle: BillingCycle) => void;
    cycles?: readonly BillingCycle[];
    // The paid plans on show, for the yearly caption's percentages.
    tiers?: readonly PaidTierId[];
    align?: 'start' | 'center';
    className?: string;
}

export default function BillingCycleControl({ value, onChange, cycles = PRICING.cycles, tiers, align = 'start', className }: BillingCycleControlProps) {
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
        <div className={cn(align === 'center' && 'text-center', className)}>
            <div
                ref={row}
                data-pinned={pinned || undefined}
                className={cn(
                    'max-lg:top-16 max-lg:z-30 max-lg:-mx-(--cell-bleed) max-lg:-my-2 max-lg:bg-[color:var(--table-ground,var(--background))] max-lg:px-(--cell-bleed) max-lg:py-2',
                    'max-lg:[@media(min-height:40rem)]:sticky max-lg:[@media(min-height:40rem)]:data-pinned:shadow-[0_1px_0_var(--rule)]',
                )}
            >
                <SegmentedControl<BillingCycle>
                    legend={m.pricing.cycles.legend}
                    value={value}
                    onChange={onChange}
                    options={cycles.map((cycle) => ({ value: cycle, label: m.pricing.cycles[cycle] }))}
                />
            </div>
            {/* Every caption sits in one cell, so the row keeps the height of the longest and nothing below moves. */}
            <div className="mt-2 grid">
                <p aria-live="polite" className="type-small col-start-1 row-start-1 min-h-[1.6em] text-muted-foreground">
                    {cycleCaption(value, m, fmt, tiers)}
                </p>
                {cycles
                    .filter((cycle) => cycle !== value)
                    .map((cycle) => (
                        <p key={cycle} aria-hidden="true" className="type-small invisible col-start-1 row-start-1">
                            {cycleCaption(cycle, m, fmt, tiers)}
                        </p>
                    ))}
            </div>
        </div>
    );
}
