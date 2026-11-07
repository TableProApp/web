import type { ReactNode } from 'react';
import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';

export interface FactTableContent {
    caption: string;
    columns: string[];
    // One string per column; the first names the row.
    rows: string[][];
}

// Flush with the band's text: no fill behind the header, no inset on the outer columns.
const EDGES = 'bg-transparent first:pl-0 last:pr-0';

interface FactTableProps {
    table: FactTableContent;
    render: (text: string) => ReactNode;
    // "When:" from "When", in the page's language (French puts a no-break space before the colon).
    label: (column: string) => string;
}

// Below 640px a phone keeps the first two columns and folds the rest under the second as labelled lines
// (design-system §5.3.10, priority columns).
export default function FactTable({ table, render, label }: FactTableProps) {
    const [first, second, ...rest] = table.columns;

    return (
        <DataTable caption={table.caption} className="[&_tbody>tr:first-child]:border-t-0">
            <thead>
                <tr>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, EDGES, 'w-[36%] sm:w-[22%]')}>
                        {first}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, EDGES)}>
                        {second}
                    </th>
                    {rest.map((column) => (
                        <th key={column} scope="col" className={cn(TABLE_HEAD_CELL, EDGES, 'hidden sm:table-cell')}>
                            {column}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {table.rows.map(([name, value, ...more]) => (
                    <tr key={name} className={TABLE_ROW}>
                        <th scope="row" className={cn(TABLE_ROW_HEADER, EDGES)}>
                            {render(name)}
                        </th>
                        <td className={cn(TABLE_CELL, EDGES)}>
                            {render(value)}
                            {more.map((text, index) => (
                                <span key={rest[index]} className="mt-1.5 block text-muted-foreground sm:hidden">
                                    <span className="font-medium text-foreground">{label(rest[index])}</span> {render(text)}
                                </span>
                            ))}
                        </td>
                        {more.map((text, index) => (
                            <td key={rest[index]} className={cn(TABLE_CELL, EDGES, 'hidden sm:table-cell')}>
                                {render(text)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </DataTable>
    );
}
