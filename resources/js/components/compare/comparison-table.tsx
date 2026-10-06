import type { ReactNode } from 'react';
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
 * all: its words say what the condition is. A marked cell with no words of
 * its own shows the yes or no word beside the mark, so a source marker never
 * floats beside a bare glyph.
 */
export function CellContent({ view, productId, numbers, labels }: CellContentProps) {
    const word = view.lines.length === 0 && view.mark !== 'none' ? (view.mark === 'yes' ? labels.cell.yes : labels.cell.no) : null;
    const lines = word !== null ? [{ text: word, muted: false }] : view.lines;

    return (
        <div className="flex items-start gap-2">
            {view.mark === 'yes' && (
                <>
                    <CheckGlyph className="mt-[0.2em] shrink-0" />
                    {word === null && <span className="sr-only">{labels.cell.yes}</span>}
                </>
            )}
            {view.mark === 'no' && (
                <>
                    <span aria-hidden="true" className="w-4 shrink-0 text-center text-muted-foreground">
                        –
                    </span>
                    {word === null && <span className="sr-only">{labels.cell.no}</span>}
                </>
            )}
            <div className="min-w-0 space-y-1">
                {lines.map((line, index) => (
                    <p key={index} className={cn(line.muted && 'text-muted-foreground')}>
                        {line.text}
                        {index === lines.length - 1 && (
                            <SourceMarkers productId={productId} ids={view.sources} numbers={numbers} label={labels.cell.source} />
                        )}
                    </p>
                ))}
                {lines.length === 0 && <SourceMarkers productId={productId} ids={view.sources} numbers={numbers} label={labels.cell.source} />}
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

/** A competitor cell for a row that is about TablePro alone ("Moving to TablePro"): a dash, read as "Does not apply". */
export function NotApplicable({ labels }: { labels: CompareLabels }) {
    return (
        <>
            <span aria-hidden="true" className="text-muted-foreground">
                —
            </span>
            <span className="sr-only">{labels.cell.none}</span>
        </>
    );
}

/** A value column: its own column from 640px, folded into the row header below it. */
export const WIDE_COLUMN = 'hidden sm:table-cell';

/** The same from 1024px, for a table too wide for a tablet's 720px (the hub's five columns). */
export const WIDER_COLUMN = 'hidden lg:table-cell';

/**
 * The folded columns of one row, under its row header (design-system §5.3.10,
 * priority columns): each column's heading as a muted caption line, then its
 * value. Hidden from 640px (`sm`), or from 1024px (`lg`) for a table whose
 * columns only fit from there, where the columns return.
 */
export function FoldedCells({ cells, from = 'sm' }: { cells: { heading: string; content: ReactNode }[]; from?: 'sm' | 'lg' }) {
    return (
        <div className={cn('mt-3 space-y-3 font-normal', from === 'sm' ? 'sm:hidden' : 'lg:hidden')}>
            {cells.map((cell) => (
                <div key={cell.heading}>
                    <p className="type-caption font-medium text-muted-foreground">{cell.heading}</p>
                    <div className="mt-0.5">{cell.content}</div>
                </div>
            ))}
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
 * table scrolling inside its own region rather than the page between 640 and
 * 768px.
 *
 * On a phone (below 640px) it uses priority columns: both product columns
 * fold into the row header as two labelled blocks, "TablePro" then the other
 * product, so the competitor's side, the point of the page, is never off
 * screen and nothing is cut mid-word.
 */
export default function ComparisonTable({ caption, productId, productName, brand, rowHeading, rows, extra, numbers, labels }: ComparisonTableProps) {
    const cell = (view: CellView | null | undefined) =>
        view ? <CellContent view={view} productId={productId} numbers={numbers} labels={labels} /> : <NotApplicable labels={labels} />;

    /*
     * A row about TablePro alone (the import row, `span`) puts its words in
     * TablePro's column and an explicit "Does not apply" dash in the other: a
     * cell spanning both columns read as an empty competitor cell.
     */
    const body = (list: RowView[]) =>
        list.map((row) => {
            const tablepro = row.span ?? row.tablepro;
            const competitor = row.span ? null : row.competitor;

            return (
                <tr key={row.key} id={`row-${row.key}`} className={TABLE_ROW}>
                    <th scope="row" className={cn(TABLE_ROW_HEADER, 'sm:w-[9.5rem] md:w-[12rem]')}>
                        {row.label}
                        <FoldedCells
                            cells={[
                                { heading: brand, content: cell(tablepro) },
                                { heading: productName, content: cell(competitor) },
                            ]}
                        />
                    </th>
                    <td className={cn(TABLE_CELL, WIDE_COLUMN)}>{cell(tablepro)}</td>
                    <td className={cn(TABLE_CELL, WIDE_COLUMN)}>{cell(competitor)}</td>
                </tr>
            );
        });

    return (
        <DataTable wrapperClassName="frame-table" caption={caption} captionVisible stickyFirstColumn className="table-fixed sm:min-w-[40rem]">
            <thead>
                <tr>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, 'sm:w-[9.5rem] md:w-[12rem]')}>
                        {rowHeading}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, WIDE_COLUMN)}>
                        {brand}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, WIDE_COLUMN)}>
                        {productName}
                    </th>
                </tr>
            </thead>
            <tbody>{body(rows)}</tbody>
            {extra && extra.rows.length > 0 && (
                <tbody>
                    <tr className={TABLE_ROW}>
                        {/* One heading per layout: a span of three would add two empty columns to the phone's one-column table. */}
                        <th scope="rowgroup" colSpan={3} className={cn(TABLE_HEAD_CELL, 'hidden pt-6 sm:table-cell')}>
                            {extra.heading}
                        </th>
                        <th scope="rowgroup" className={cn(TABLE_HEAD_CELL, 'pt-6 sm:hidden')}>
                            {extra.heading}
                        </th>
                    </tr>
                    {body(extra.rows)}
                </tbody>
            )}
        </DataTable>
    );
}
