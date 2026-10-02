import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import { CheckGlyph } from '@/components/ui/glyph';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { cn } from '@/lib/utils';
import type { CellView, RowView } from './model';
import { SourceMarkers } from './sources';
import type { CompareLabels } from './types';

interface CellContentProps {
    view: CellView;
    productId: string;
    numbers: ReadonlyMap<string, number>;
    labels: CompareLabels;
}

/**
 * One cell: the mark, the words and the source markers.
 *
 * The tick and the dash are drawn but not read; a visually hidden
 * "Supported" or "Not supported" carries the meaning, so a cell never
 * announces as empty (design-system §5.3.8). A qualified cell has no mark at
 * all: its words say what the condition is.
 */
export function CellContent({ view, productId, numbers, labels }: CellContentProps) {
    return (
        <div className="flex items-start gap-2">
            {view.mark === 'yes' && (
                <>
                    <CheckGlyph className="mt-[0.2em] shrink-0" />
                    <span className="sr-only">{labels.cell.yes}</span>
                </>
            )}
            {view.mark === 'no' && (
                <>
                    <span aria-hidden="true" className="w-4 shrink-0 text-center text-muted-foreground">
                        –
                    </span>
                    <span className="sr-only">{labels.cell.no}</span>
                </>
            )}
            <div className="min-w-0 space-y-1">
                {view.lines.map((line, index) => (
                    <p key={index} className={cn(line.muted && 'text-muted-foreground')}>
                        {line.text}
                        {index === view.lines.length - 1 && (
                            <SourceMarkers productId={productId} ids={view.sources} numbers={numbers} label={labels.cell.source} />
                        )}
                    </p>
                ))}
                {view.lines.length === 0 && <SourceMarkers productId={productId} ids={view.sources} numbers={numbers} label={labels.cell.source} />}
                {view.link && (
                    <p>
                        <LocaleLink href={view.link.href} className={textLinkClasses('standalone')}>
                            {view.link.label}
                            <span aria-hidden="true">→</span>
                        </LocaleLink>
                    </p>
                )}
            </div>
        </div>
    );
}

interface ComparisonTableProps {
    caption: string;
    productId: string;
    productName: string;
    /** TablePro's column heading: the brand, from the `common` catalog. */
    brand: string;
    /** The first column's heading: "Compared". */
    rowHeading: string;
    rows: RowView[];
    /** Product-specific rows, under their own heading row. */
    extra?: { heading: string; rows: RowView[] };
    numbers: ReadonlyMap<string, number>;
    labels: CompareLabels;
}

/**
 * TablePro and one other product, row by row (design-system §5.1
 * `ComparisonTable`): a visible dated caption, a sticky first column, and the
 * table scrolling inside its own region on a phone rather than the page.
 */
export default function ComparisonTable({ caption, productId, productName, brand, rowHeading, rows, extra, numbers, labels }: ComparisonTableProps) {
    const body = (list: RowView[]) =>
        list.map((row) => (
            <tr key={row.key} id={`row-${row.key}`} className={TABLE_ROW}>
                <th scope="row" className={cn(TABLE_ROW_HEADER, 'w-[9.5rem] md:w-[12rem]')}>
                    {row.label}
                </th>
                {row.span ? (
                    <td colSpan={2} className={TABLE_CELL}>
                        <CellContent view={row.span} productId={productId} numbers={numbers} labels={labels} />
                    </td>
                ) : (
                    <>
                        <td className={TABLE_CELL}>
                            <CellContent view={row.tablepro} productId={productId} numbers={numbers} labels={labels} />
                        </td>
                        <td className={TABLE_CELL}>
                            {row.competitor && <CellContent view={row.competitor} productId={productId} numbers={numbers} labels={labels} />}
                        </td>
                    </>
                )}
            </tr>
        ));

    return (
        <DataTable caption={caption} captionVisible stickyFirstColumn className="min-w-[40rem] table-fixed">
            <thead>
                <tr>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, 'w-[9.5rem] md:w-[12rem]')}>
                        {rowHeading}
                    </th>
                    <th scope="col" className={TABLE_HEAD_CELL}>
                        {brand}
                    </th>
                    <th scope="col" className={TABLE_HEAD_CELL}>
                        {productName}
                    </th>
                </tr>
            </thead>
            <tbody>{body(rows)}</tbody>
            {extra && extra.rows.length > 0 && (
                <tbody>
                    <tr className={TABLE_ROW}>
                        <th scope="rowgroup" colSpan={3} className={cn(TABLE_HEAD_CELL, 'pt-6')}>
                            {extra.heading}
                        </th>
                    </tr>
                    {body(extra.rows)}
                </tbody>
            )}
        </DataTable>
    );
}
