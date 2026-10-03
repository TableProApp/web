/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/data-table.tsx. Change both in the same release. See docs/shared-files.md. */
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Cell classes for tables built on this shell (design-system §5.3.10).
 *
 * - Header cells: 14/600 in the text colour on `--surface`, sentence case, a
 *   hairline below.
 * - Body cells: 14px, 12px vertical and 16px horizontal padding.
 * - Row headers (`th scope="row"`): weight 500.
 * - Numbers: right-aligned, tabular figures.
 *
 * No zebra striping and no hover bar: these tables are read, not selected.
 */
export const TABLE_HEAD_CELL =
    'border-b border-rule bg-surface px-4 py-3 text-left align-bottom text-sm leading-[1.4] font-semibold text-foreground';
export const TABLE_CELL = 'px-4 py-3 text-left align-top text-sm leading-[1.55] text-foreground';
export const TABLE_ROW_HEADER = 'px-4 py-3 text-left align-top text-sm leading-[1.55] font-medium text-foreground';
export const TABLE_NUMERIC = 'text-right tabular-nums';

/** Row separators: a hairline between rows. */
export const TABLE_ROW_RULE = 'border-rule';

/**
 * Column separators, for the rare table whose columns carry the meaning (a
 * comparison). The same hairline: there is no heavier rule in this system.
 */
export const TABLE_COLUMN_RULE = 'border-rule';

/** A body row: the hairline above it. */
export const TABLE_ROW = 'border-t border-rule';

interface DataTableProps {
    /**
     * Required. A table without a caption gives a screen reader nothing to
     * announce before it starts reading cells.
     */
    caption: ReactNode;
    /**
     * Shows the caption as a muted line above the table, for a table that
     * needs one in sight ("Compared on 2 October 2026. Sources below."). Hidden
     * by default. The visible line sits above the scroll region, so it never
     * scrolls or clips with a table wider than the screen; the `<caption>`
     * itself stays in the table for screen readers, and the visible copy is
     * hidden from them so they hear it once. Plain text only when visible.
     */
    captionVisible?: boolean;
    /**
     * Keeps the first column in place while the rest scrolls sideways, for
     * comparison and plan tables wider than the screen. The sticky cells are
     * painted with `--table-ground` (the page background unless an ancestor,
     * such as a `surface` band, sets it), so the column matches the cells
     * beside it and only covers what scrolls under it.
     */
    stickyFirstColumn?: boolean;
    /** On the `<table>`: a minimum width, for one. */
    className?: string;
    /** On the scroll region around the table. */
    wrapperClassName?: string;
    children: ReactNode;
}

/**
 * A captioned `<table>` inside its own scroll region.
 *
 * A table wider than the screen scrolls inside the region, not the page. The
 * region is focusable and named by the caption, so a keyboard user can reach
 * it and scroll it. Tables are never turned into `display: block`, which strips
 * their roles in Safari; on a phone, the caller folds secondary columns into
 * the first cell instead.
 *
 * The region is `position: relative` on purpose. Cells carry visually hidden
 * words (`sr-only` is `position: absolute`), and an absolutely positioned box
 * is clipped by an `overflow` ancestor only when that ancestor, or something
 * inside it, is its containing block. Without it, the hidden words in a
 * column scrolled out of view escaped the region and widened the whole page
 * on a phone (design-system §4.4: `scrollWidth` equals the viewport).
 */
export default function DataTable({ caption, captionVisible = false, stickyFirstColumn = false, className, wrapperClassName, children }: DataTableProps) {
    const captionId = useId();

    const region = (
        <div role="region" aria-labelledby={captionId} tabIndex={0} className={cn('relative overflow-x-auto focus-visible:outline-offset-2', wrapperClassName)}>
            <table
                className={cn(
                    'w-full border-collapse',
                    stickyFirstColumn &&
                        '[&_tbody_tr>*:first-child]:sticky [&_tbody_tr>*:first-child]:left-0 [&_tbody_tr>*:first-child]:z-[1] [&_tbody_tr>*:first-child]:bg-[color:var(--table-ground,var(--background))] [&_thead_tr>*:first-child]:sticky [&_thead_tr>*:first-child]:left-0 [&_thead_tr>*:first-child]:z-[1]',
                    className,
                )}
            >
                <caption id={captionId} className="sr-only">
                    {caption}
                </caption>
                {children}
            </table>
        </div>
    );

    if (!captionVisible) {
        return region;
    }

    return (
        <>
            <p aria-hidden="true" className="type-small mb-3 text-muted-foreground">
                {caption}
            </p>
            {region}
        </>
    );
}
