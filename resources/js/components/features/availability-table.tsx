import type { ReactNode } from 'react';
import Badge from '@/components/ui/badge';
import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import { Availability } from '@/components/ui/glyph';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { PAID_FEATURES } from '@/lib/data/paid-features';
import { iosPlatform, macPlatform } from '@/lib/data/platforms';
import { cn } from '@/lib/utils';
import RichText from './rich-text';
import type { AvailabilityRow, FeatureLabels } from './types';

interface AvailabilityTableProps {
    rows: AvailabilityRow[];
    labels: FeatureLabels;
    values: Record<string, string>;
}

/** The two platform columns: shown from 640px, folded into the row header below it. */
const PLATFORM_COLUMN = 'hidden sm:table-cell';

/**
 * "Where it works" (sitemap §E.4 block 4): one row per capability on the
 * page, with its plan on the Mac and what exists of it on iPhone and iPad.
 *
 * The plan comes from `paid-features.json` by id, so a row never retypes a
 * tier; anything not listed there is free. The iPhone and iPad app has no
 * plans at all, so its column says what exists, not what it costs. Device
 * names come from `platforms.json`.
 *
 * Below 640px the table uses priority columns (design-system §5.3.10): the two
 * platform columns are hidden and their values fold into the capability's row
 * header as caption lines ("Mac: Free", "iPhone and iPad: Not available"), in
 * words rather than a dash, so a phone shows every fact without scrolling and
 * a screen reader hears them once, with the row.
 */
export default function AvailabilityTable({ rows, labels, values }: AvailabilityTableProps) {
    const { fmt, m } = useI18n();
    const marks = { included: labels.availability.free, notIncluded: labels.availability.notAvailable };
    const mac = joinList(macPlatform().deviceNames, m.common.list);
    const ios = joinList(iosPlatform().deviceNames, m.common.list);

    function macValue(row: AvailabilityRow, folded: boolean): ReactNode {
        const paid = row.paid !== undefined ? PAID_FEATURES.find((feature) => feature.id === row.paid) : undefined;

        if (row.mac === 'no') {
            return folded ? labels.availability.notAvailable : <Availability included={false} labels={marks} />;
        }

        if (paid !== undefined) {
            return (
                <Badge variant="accent" className="whitespace-nowrap">
                    {fmt(labels.availability.plan, { tier: labels.tiers[paid.tier] })}
                </Badge>
            );
        }

        return labels.availability.free;
    }

    function iosValue(row: AvailabilityRow, folded: boolean): ReactNode {
        if (row.ios === 'yes') {
            return labels.availability.free;
        }

        if (row.ios === 'no') {
            return folded ? labels.availability.notAvailable : <Availability included={false} labels={marks} />;
        }

        return <RichText text={row.iosNote ?? ''} values={values} />;
    }

    return (
        <DataTable wrapperClassName="frame-table" caption={labels.availability.caption} className="sm:min-w-[36rem]">
            <thead>
                <tr>
                    <th scope="col" className={TABLE_HEAD_CELL}>
                        {labels.availability.capability}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, PLATFORM_COLUMN)}>
                        {mac}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, PLATFORM_COLUMN)}>
                        {ios}
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.label} className={TABLE_ROW}>
                        <th scope="row" className={TABLE_ROW_HEADER}>
                            <RichText text={row.label} values={values} />
                            <span className="type-caption mt-1.5 grid gap-1 font-normal text-muted-foreground sm:hidden">
                                <span className="block">
                                    {mac}: <span className="text-foreground">{macValue(row, true)}</span>
                                </span>
                                <span className="block">
                                    {ios}: <span className="text-foreground">{iosValue(row, true)}</span>
                                </span>
                            </span>
                        </th>
                        <td className={cn(TABLE_CELL, PLATFORM_COLUMN)}>{macValue(row, false)}</td>
                        <td className={cn(TABLE_CELL, PLATFORM_COLUMN)}>{iosValue(row, false)}</td>
                    </tr>
                ))}
            </tbody>
        </DataTable>
    );
}
