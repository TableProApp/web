import SegmentedControl from '@/components/ui/segmented-control';
import { useI18n, type Messages } from '@/i18n';
import { PRICING, yearlySavingsPercent, type BillingCycle } from '@/lib/data/pricing';

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
 */
export default function BillingCycleControl({ value, onChange, className }: BillingCycleControlProps) {
    const { m, fmt } = useI18n();

    return (
        <SegmentedControl<BillingCycle>
            legend={m.pricing.cycles.legend}
            value={value}
            onChange={onChange}
            options={PRICING.cycles.map((cycle) => ({ value: cycle, label: m.pricing.cycles[cycle] }))}
            caption={cycleCaption(value, m, fmt)}
            className={className}
        />
    );
}
