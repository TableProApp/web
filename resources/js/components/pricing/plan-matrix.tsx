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

/** The feature column: a little less padding on a phone, where every pixel goes to the plan columns. */
const FEATURE_CELL = 'max-sm:pr-2 max-sm:pl-3';
/** A plan column: 64px on a phone (6px padding), 18% from 640px; the mark or word centred. */
const PLAN_CELL = 'w-16 text-center max-sm:px-1.5 sm:w-[18%]';

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
 * mark (`Availability`), so a screen reader never meets an empty cell.
 *
 * All four columns fit a 343px phone (design-system §8.6): below 640px each
 * plan column is 64px with 6px of padding and its glyph centred, the feature's
 * one-line detail is already a caption under its name, and the Macs row's
 * words wrap inside their column. Nothing scrolls, so no plan is ever off
 * screen. The first column stays sticky for the rare narrow window where it
 * would.
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
            <DataTable wrapperClassName="frame-table" caption={m.pricing.matrix.caption} captionVisible stickyFirstColumn>
                <thead>
                    <tr>
                        <th scope="col" className={cn(TABLE_HEAD_CELL, FEATURE_CELL)}>
                            {m.pricing.matrix.feature}
                        </th>
                        {TIERS.map((tier) => (
                            <th key={tier} scope="col" className={cn(TABLE_HEAD_CELL, PLAN_CELL)}>
                                {m.pricing.tiers[tier].name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.key} className={TABLE_ROW}>
                            <th scope="row" className={cn(TABLE_ROW_HEADER, FEATURE_CELL)}>
                                <span className="block">{row.name}</span>
                                {row.detail && <span className="type-caption mt-1 block font-normal text-pretty text-muted-foreground">{row.detail}</span>}
                            </th>
                            {TIERS.map((tier) => {
                                const value = row.values[tier];

                                return (
                                    <td key={tier} className={cn(TABLE_CELL, PLAN_CELL, 'break-words')}>
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
