import type { ReactNode } from 'react';
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
    // The Linux column's heading, or null while Linux is not released.
    linux: string | null;
}

// Shown from 640px; below it their values fold into the row header (design-system §5.3.10, priority columns).
const PLATFORM_COLUMN = 'hidden sm:table-cell';

// The Linux app and the iPhone and iPad app have no plans, so their columns say what exists there, not what it costs.
export default function AvailabilityTable({ rows, labels, values, linux }: AvailabilityTableProps) {
    const { m } = useI18n();
    const columns: { key: string; name: string; cell: (row: AvailabilityRow, folded: boolean) => ReactNode }[] = [
        { key: 'mac', name: joinList(macPlatform().deviceNames, m.common.list), cell: (row, folded) => macAvailability(row, labels, folded) },
        ...(linux !== null
            ? [
                  {
                      key: 'linux',
                      name: linux,
                      cell: (row: AvailabilityRow, folded: boolean) => platformAvailability(row.linux, row.linuxNote, { labels, values, folded, yes: labels.availability.free }),
                  },
              ]
            : []),
        {
            key: 'ios',
            name: joinList(iosPlatform().deviceNames, m.common.list),
            cell: (row, folded) => platformAvailability(row.ios, row.iosNote, { labels, values, folded, yes: labels.availability.free }),
        },
    ];

    return (
        <DataTable wrapperClassName="frame-table" caption={labels.availability.caption} className={linux !== null ? 'sm:min-w-[40rem]' : 'sm:min-w-[36rem]'}>
            <thead>
                <tr>
                    <th scope="col" className={TABLE_HEAD_CELL}>
                        {labels.availability.capability}
                    </th>
                    {columns.map((column) => (
                        <th key={column.key} scope="col" className={cn(TABLE_HEAD_CELL, PLATFORM_COLUMN)}>
                            {column.name}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.label} className={TABLE_ROW}>
                        <th scope="row" className={TABLE_ROW_HEADER}>
                            <RichText text={row.label} values={values} />
                            <span className="type-caption mt-1.5 grid gap-1 font-normal text-muted-foreground sm:hidden">
                                {columns.map((column) => (
                                    <span key={column.key} className="block">
                                        {column.name}: <span className="text-foreground">{column.cell(row, true)}</span>
                                    </span>
                                ))}
                            </span>
                        </th>
                        {columns.map((column) => (
                            <td key={column.key} className={cn(TABLE_CELL, PLATFORM_COLUMN)}>
                                {column.cell(row, false)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </DataTable>
    );
}
