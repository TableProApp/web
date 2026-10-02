import type { ReactNode } from 'react';
import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import { Availability } from '@/components/ui/glyph';
import LocaleLink from '@/components/ui/locale-link';
import { useI18n } from '@/i18n';
import { featureHref, PAID_FEATURES } from '@/lib/data/paid-features';
import { PRICING, type TierId } from '@/lib/data/pricing';
import { cn } from '@/lib/utils';
import type { PaidFeatureCopy } from './types';

const TIERS: readonly TierId[] = ['free', 'starter', 'team'];

/** A cell's content: a plain yes or no, or a short visible word. */
type Value = boolean | string;

interface Row {
    key: string;
    name: ReactNode;
    detail?: string;
    values: Record<TierId, Value>;
}

interface PlanMatrixProps {
    /** `content/{locale}/paid-features.json`: each feature's one-line detail. */
    details: PaidFeatureCopy;
    className?: string;
}

/**
 * Every paid feature against Free, Starter and Team (design-system §5.3.18
 * `PlanMatrix`), from paid-features.json in its display order, then the Macs a
 * license covers, Priority support and everything else in the app.
 *
 * Each feature is named here once and links to the section of its feature
 * page that describes it. A cell carries its meaning in words as well as a
 * mark (`Availability`), so a screen reader never meets an empty cell. The
 * first column stays in place while the plan columns scroll on a narrow
 * screen.
 */
export default function PlanMatrix({ details, className }: PlanMatrixProps) {
    const { m, plural } = useI18n();

    const rows: Row[] = [
        ...PAID_FEATURES.map(
            (feature): Row => ({
                key: feature.id,
                name: (
                    <LocaleLink href={featureHref(feature)} className="underline decoration-muted-foreground decoration-1 underline-offset-3 hover:text-accent-text hover:decoration-accent-text">
                        {feature.name}
                    </LocaleLink>
                ),
                detail: details[feature.id]?.detail,
                values: { free: false, starter: feature.tier === 'starter', team: true },
            }),
        ),
        {
            key: 'macs',
            name: m.pricing.matrix.macs,
            values: {
                free: m.pricing.matrix.macsFree,
                starter: plural(m.pricing.matrix.macsStarter, PRICING.tiers.starter.activations),
                team: m.pricing.matrix.macsTeam,
            },
        },
        {
            key: 'priority-support',
            name: m.pricing.prioritySupport.name,
            detail: plural(m.pricing.prioritySupport.detail, PRICING.tiers.team.prioritySupport.responseBusinessDays),
            values: { free: false, starter: false, team: true },
        },
        {
            key: 'everything-else',
            name: m.pricing.matrix.everythingElse,
            detail: m.pricing.matrix.everythingElseDetail,
            values: { free: true, starter: true, team: true },
        },
    ];

    return (
        <div className={className}>
            <DataTable caption={m.pricing.matrix.caption} captionVisible stickyFirstColumn className="min-w-[36rem]">
                <thead>
                    <tr>
                        <th scope="col" className={TABLE_HEAD_CELL}>
                            {m.pricing.matrix.feature}
                        </th>
                        {TIERS.map((tier) => (
                            <th key={tier} scope="col" className={cn(TABLE_HEAD_CELL, 'w-[18%] text-center')}>
                                {m.pricing.tiers[tier].name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.key} className={TABLE_ROW}>
                            <th scope="row" className={TABLE_ROW_HEADER}>
                                <span className="block">{row.name}</span>
                                {row.detail && <span className="type-caption mt-1 block font-normal text-pretty text-muted-foreground">{row.detail}</span>}
                            </th>
                            {TIERS.map((tier) => {
                                const value = row.values[tier];

                                return (
                                    <td key={tier} className={cn(TABLE_CELL, 'text-center')}>
                                        <Availability
                                            included={value !== false}
                                            labels={m.controls.availability}
                                            partial={typeof value === 'string' ? value : undefined}
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </DataTable>
            <p className="type-small mt-4 max-w-[44rem] text-muted-foreground">{m.pricing.matrix.iphoneNote}</p>
        </div>
    );
}
