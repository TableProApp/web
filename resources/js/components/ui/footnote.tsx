import type { ReactNode } from 'react';
import Container from '@/components/ui/container';
import { cn } from '@/lib/utils';

/**
 * Footnotes for tables and comparisons (design-system §5.3.13): a numbered
 * marker in the cell, and an ordered list of sources under the table, each
 * with a link back to where it was cited and the date it was checked.
 *
 * Markers and notes find each other by id: `fn-{id}` for the note and
 * `fnref-{id}` for the marker. Ids are locale-neutral, so a note keeps its
 * address in every language.
 */

interface FootnoteMarkerProps {
    /** The note's id, shared with its `FootnoteList` entry. */
    id: string;
    /** The number shown, in citation order. */
    number: number;
    /** Read before the number: "Note" / "Ghi chú". */
    label: string;
}

/** The superscript link from a cell to its note. */
export function FootnoteMarker({ id, number, label }: FootnoteMarkerProps) {
    return (
        <sup className="ml-0.5 font-normal">
            <a
                id={`fnref-${id}`}
                href={`#fn-${id}`}
                className="rounded-[2px] text-accent-text tabular-nums underline-offset-2 hover:underline"
            >
                <span className="sr-only">{label} </span>
                {number}
            </a>
        </sup>
    );
}

export interface FootnoteEntry {
    id: string;
    /** The note itself: a sentence, a source link. */
    content: ReactNode;
    /** When the source was checked, already formatted for the page's language. */
    checked?: ReactNode;
}

interface FootnoteListProps {
    notes: FootnoteEntry[];
    /** The back link's accessible name: "Back to the table" / "Quay lại bảng". */
    backLabel: string;
    /** Names the list for assistive technology: "Notes" / "Ghi chú". */
    label: string;
    className?: string;
}

/** The notes under a table: caption size, muted, numbered in order. */
export function FootnoteList({ notes, backLabel, label, className }: FootnoteListProps) {
    if (notes.length === 0) {
        return null;
    }

    return (
        <ol aria-label={label} className={cn('type-caption mt-4 list-decimal space-y-1 pl-5 text-muted-foreground marker:tabular-nums', className)}>
            {notes.map((note) => (
                <li key={note.id} id={`fn-${note.id}`} className="scroll-mt-24 pl-1">
                    {note.content}
                    {note.checked && <> ({note.checked})</>}{' '}
                    <a href={`#fnref-${note.id}`} aria-label={backLabel} className="rounded-[2px] text-accent-text hover:underline">
                        ↩
                    </a>
                </li>
            ))}
        </ol>
    );
}

/**
 * Retiring. The pre-rebuild caveat band under an artifact: one muted line in
 * the content column. New pages use `FootnoteList` under their tables, or a
 * `Callout` for a limit worth reading. Delete once nothing imports it.
 */
export default function FootNote({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <Container>
            <p className={cn('type-small max-w-[68ch] py-4 text-muted-foreground text-pretty', className)}>{children}</p>
        </Container>
    );
}
