import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A hairline definition list. The label column is mono and fixed-ish, the value
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

export function LedgerRow({ label, children, aside, accent, className }: LedgerRowProps) {
    return (
        <div
            data-row
            className={cn(
                'relative grid grid-cols-1 items-baseline gap-x-6 gap-y-1 px-4 py-3 sm:grid-cols-[13rem_1fr] sm:py-4',
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
            <dt className="font-mono text-2xs tracking-widest text-muted-foreground uppercase">
                {label}
                {aside && <span className="ml-2 normal-case text-muted-foreground-subtle">{aside}</span>}
            </dt>
            <dd className="text-sm leading-relaxed text-muted-foreground">{children}</dd>
        </div>
    );
}
