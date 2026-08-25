import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A hairline definition list. The label column names the thing, the value
 * column carries the prose, so a stack of rows reads as a spec sheet.
 */
export function Ledger({ className, children }: { className?: string; children: ReactNode }) {
    return <dl className={cn('divide-y divide-rule', className)}>{children}</dl>;
}

interface LedgerRowProps {
    label: string;
    children: ReactNode;
    /** Optional short qualifier shown next to the label. */
    aside?: string;
    /** 0 to 1. Draws a left accent bar at that opacity, for ladder-style rows. */
    accent?: number;
    className?: string;
}

/**
 * Deliberately not `data-row`. A ledger row is a definition list entry with
 * nothing to activate, so the shared row-selection treatment would advertise
 * an affordance that is not there — and on the row holding the comparison
 * chips it lit the whitespace more strongly than the links inside it.
 * `data-row` belongs on things you can actually click or select.
 *
 * The label is sans and sentence case. It was `font-mono text-2xs
 * tracking-widest uppercase`, which is the site's *eyebrow* treatment — a
 * deliberate friction reserved for the one label that opens a section. Forty
 * eight ledger rows wearing it meant the page shouted a heading at the reader
 * once every few centimetres of scroll, and 11px letterspaced small caps is the
 * slowest thing on the page to read. Mono stays where it earns its keep: the
 * *values*, which are tool names, keystrokes and identifiers.
 *
 * The label also takes `--foreground` rather than `--muted-foreground`. A
 * definition list where both halves are muted has no term/definition contrast
 * at all, and the label is the thing you scan for.
 */
export function LedgerRow({ label, children, aside, accent, className }: LedgerRowProps) {
    return (
        <div
            {...(accent !== undefined && accent > 0 ? { 'data-accent': '' } : {})}
            className={cn(
                'relative grid grid-cols-1 items-baseline gap-x-8 gap-y-1.5 px-4 py-4 sm:grid-cols-[11rem_1fr] sm:py-5',
                className,
            )}
        >
            {accent !== undefined && accent > 0 && (
                <div
                    className="absolute inset-y-0 left-0 w-0.5 bg-primary"
                    style={{ opacity: accent }}
                    aria-hidden="true"
                />
            )}
            <dt className="text-sm font-semibold text-foreground">
                {label}
                {aside && <span className="ml-2 text-xs font-normal text-muted-foreground-subtle">{aside}</span>}
            </dt>
            <dd className="text-sm text-muted-foreground text-pretty">{children}</dd>
        </div>
    );
}
