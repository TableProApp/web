import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A literal inside prose: a file name, a flag, a command.
 *
 * Five treatments were in circulation, including one still filling with
 * `bg-black/5 dark:bg-white/10` after the two-weight rule migration had removed
 * every other raw alpha pair from the site.
 */
export function InlineCode({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <code className={cn('rounded-key bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground', className)}>
            {children}
        </code>
    );
}

interface CodeBlockProps {
    children: ReactNode;
    /**
     * Names what the block contains, for the region label. A scrollable block
     * with no focusable children is unreachable by keyboard without one — and
     * three of these shipped that way.
     */
    label: string;
    className?: string;
}

/**
 * A block of code that may be wider than its column.
 *
 * `tabIndex` is the point of this component, not the styling. A container that
 * scrolls but holds nothing focusable cannot be reached or scrolled from the
 * keyboard at all, which is WCAG 2.1.1; the two containers on the site that
 * *do* hold focusable children are fine without it and deliberately do not use
 * this.
 */
export function CodeBlock({ children, label, className }: CodeBlockProps) {
    return (
        <div
            tabIndex={0}
            role="region"
            aria-label={label}
            className={cn('overflow-x-auto', className)}
        >
            {children}
        </div>
    );
}
