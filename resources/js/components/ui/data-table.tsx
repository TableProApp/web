import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Column separators. Columns are stable structure, so they take the heavier
 * rule — the same distinction the hairline system makes everywhere else.
 */
export const TABLE_COLUMN_RULE = 'border-rule-strong';

/** Row separators. Rows are data, so they take the hairline. */
export const TABLE_ROW_RULE = 'border-rule';

interface DataTableProps {
    /**
     * Required, and visually hidden.
     *
     * Three tables on this site carry real tabular data, and a table without a
     * caption gives a screen reader no way to know what it is looking at before
     * it starts reading cells. Making it a required prop is the only reliable
     * way to keep that true.
     */
    caption: string;
    className?: string;
    children: ReactNode;
}

/**
 * The shared shell for the site's data tables.
 *
 * Deliberately small. The three tables it serves — the spec result set, the
 * Safe Mode ladder and the plan comparison — have genuinely different
 * typography and density, and a primitive that tried to parameterise all of
 * that would be harder to read than the markup it replaced.
 *
 * What it does own is the part that had already drifted: the plan comparison
 * drew its column separators with the row weight, so the one table where
 * columns carry the entire meaning was the one drawing them faintest. Exporting
 * the two weights by name is what stops that happening again.
 */
export default function DataTable({ caption, className, children }: DataTableProps) {
    return (
        <table className={cn('w-full border-collapse', className)}>
            <caption className="sr-only">{caption}</caption>
            {children}
        </table>
    );
}
