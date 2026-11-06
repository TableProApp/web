import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { iosPlatform, macPlatform } from '@/lib/data/platforms';
import { cn } from '@/lib/utils';
import { macAvailability, platformAvailability } from './availability-cells';
import RichText from './rich-text';
import type { AvailabilityRow, FeatureLabels } from './types';

interface AvailabilityTableProps {
    rows: AvailabilityRow[];
    labels: FeatureLabels;
    values: Record<string, string>;
}

// Shown from 640px; below it their values fold into the row header (design-system §5.3.10, priority columns).
const PLATFORM_COLUMN = 'hidden sm:table-cell';

// The iPhone and iPad app has no plans, so its column says what exists there, not what it costs.
export default function AvailabilityTable({ rows, labels, values }: AvailabilityTableProps) {
    const { m } = useI18n();
    const mac = joinList(macPlatform().deviceNames, m.common.list);
    const ios = joinList(iosPlatform().deviceNames, m.common.list);
    const iosValue = (row: AvailabilityRow, folded: boolean) =>
        platformAvailability(row.ios, row.iosNote, { labels, values, folded, yes: labels.availability.free });

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
                                    {mac}: <span className="text-foreground">{macAvailability(row, labels, true)}</span>
                                </span>
                                <span className="block">
                                    {ios}: <span className="text-foreground">{iosValue(row, true)}</span>
                                </span>
                            </span>
                        </th>
                        <td className={cn(TABLE_CELL, PLATFORM_COLUMN)}>{macAvailability(row, labels, false)}</td>
                        <td className={cn(TABLE_CELL, PLATFORM_COLUMN)}>{iosValue(row, false)}</td>
                    </tr>
                ))}
            </tbody>
        </DataTable>
    );
}
