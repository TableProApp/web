/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/status-badge.tsx. Change both in the same release. See docs/shared-files.md. */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type Status = 'success' | 'warning' | 'danger' | 'neutral';

/**
 * The dot carries the colour and the word carries the meaning, in
 * `--foreground`. A status shown as a hue alone fails anyone who cannot tell
 * red from green, so the word is never coloured and never left out. The three
 * status colours clear 4.5:1 on every ground in both themes, held to the text
 * threshold although a dot needs only 3:1.
 */
const DOTS: Record<Status, string> = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    neutral: 'bg-muted-foreground',
};

interface StatusBadgeProps {
    status: Status;
    /** The word: "Active", "Expired", "Suspended", "Pending", in the page's language. */
    children: ReactNode;
    className?: string;
}

/** An 8px dot and the status word at 14/500, sentence case. */
export default function StatusBadge({ status, children, className }: StatusBadgeProps) {
    return (
        <span className={cn('inline-flex items-center gap-2 text-sm leading-[1.3] font-medium text-foreground', className)}>
            <span className={cn('size-2 shrink-0 rounded-full forced-colors:bg-[CanvasText]', DOTS[status])} aria-hidden="true" />
            {children}
        </span>
    );
}
