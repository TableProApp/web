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

// Less padding on a phone, where every pixel goes to the plan columns.
const FEATURE_CELL = 'max-sm:pr-2 max-sm:pl-3';
const PLAN_CELL = 'w-16 text-center max-sm:px-1.5 sm:w-[18%]';
// The plan names stay in view under the site header while the reader scrolls the rows.
const STICKY_HEAD = 'sticky top-16 z-[2] bg-[color:var(--table-ground,var(--background))]';

type Value = boolean | string;

interface Row {
    key: string;
    name: ReactNode;
    detail?: string;
    values: Record<TierId, Value>;
}

interface PlanMatrixProps {
    details: PaidFeatureCopy;
    className?: string;
}

// All four columns fit a 343px phone with nothing scrolling (design-system §8.6), so the table needs no scroll box and
// its head can stick to the page. Each cell says its meaning in words too, for screen readers.
export default function PlanMatrix({ details, className }: PlanMatrixProps) {
    const { m, plural } = useI18n();

    const feature = (tier: 'starter' | 'team') =>
        PAID_FEATURES.filter((each) => each.tier === tier).map(
            (each): Row => ({
                key: each.id,
                name: (
                    <LocaleLink href={featureHref(each)} className="underline decoration-muted-foreground decoration-1 underline-offset-3 hover:text-accent-text hover:decoration-accent-text">
                        {each.name}
                    </LocaleLink>
                ),
                detail: details[each.id]?.detail,
                values: { free: false, starter: tier === 'starter', team: true },
            }),
        );

    const groups: { key: string; label: string; rows: Row[] }[] = [
        { key: 'starter', label: m.pricing.matrix.groups.starter, rows: feature('starter') },
        {
            key: 'team',
            label: m.pricing.matrix.groups.team,
            rows: [
                ...feature('team'),
                {
                    key: 'priority-support',
                    name: m.pricing.prioritySupport.name,
                    detail: plural(m.pricing.prioritySupport.detail, PRICING.tiers.team.prioritySupport.responseBusinessDays),
                    values: { free: false, starter: false, team: true },
                },
            ],
        },
        {
            key: 'all',
            label: m.pricing.matrix.groups.all,
            rows: [
                {
                    key: 'macs',
                    name: m.pricing.matrix.macs,
                    values: {
                        free: m.pricing.matrix.macsFree,
                        starter: plural(m.pricing.matrix.macsStarter, PRICING.license.deviceLimit),
                        team: plural(m.pricing.matrix.macsTeam, PRICING.license.deviceLimit),
                    },
                },
                {
                    key: 'everything-else',
                    name: m.pricing.matrix.everythingElse,
                    detail: m.pricing.matrix.everythingElseDetail,
                    values: { free: true, starter: true, team: true },
                },
            ],
        },
    ];

    return (
        <div className={className}>
            <DataTable wrapperClassName="frame-table overflow-visible" caption={m.pricing.matrix.caption}>
                <thead>
                    <tr>
                        <th scope="col" className={cn(TABLE_HEAD_CELL, FEATURE_CELL, STICKY_HEAD)}>
                            {m.pricing.matrix.feature}
                        </th>
                        {TIERS.map((tier) => (
                            <th key={tier} scope="col" className={cn(TABLE_HEAD_CELL, PLAN_CELL, STICKY_HEAD)}>
                                {m.pricing.tiers[tier].name}
                            </th>
                        ))}
                    </tr>
                </thead>
                {groups.map((group) => (
                    <tbody key={group.key}>
                        <tr className={TABLE_ROW}>
                            <th scope="rowgroup" colSpan={TIERS.length + 1} className={cn('px-4 pt-6 pb-2 text-left text-sm leading-[1.4] font-semibold text-muted-foreground', FEATURE_CELL)}>
                                {group.label}
                            </th>
                        </tr>
                        {group.rows.map((row) => (
                            <tr key={row.key} className={cn(TABLE_ROW, 'plan-row transition-colors duration-(--dur-tap) ease-(--ease-feedback)')}>
                                <th scope="row" className={cn(TABLE_ROW_HEADER, FEATURE_CELL)}>
                                    <span className="block">{row.name}</span>
                                    {row.detail && <span className="type-caption mt-0.5 block font-normal text-pretty text-muted-foreground">{row.detail}</span>}
                                </th>
                                {TIERS.map((tier) => {
                                    const value = row.values[tier];

                                    return (
                                        <td key={tier} className={cn(TABLE_CELL, PLAN_CELL, 'break-words')}>
                                            <Availability included={value !== false} labels={m.controls.availability} partial={typeof value === 'string' ? value : undefined} />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                ))}
            </DataTable>
            <p className="type-small mt-4 max-w-[44rem] text-muted-foreground">{m.pricing.matrix.iphoneNote}</p>
        </div>
    );
}
