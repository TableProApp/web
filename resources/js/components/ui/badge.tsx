/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/badge.tsx. Change both in the same release. See docs/shared-files.md. */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'neutral' | 'accent' | 'outline';

/**
 * Each variant carries its own ground, so no parent state can change its
 * contrast: the old "Save 33%" badge sat on whatever its selected button was
 * filled with, and measured 1.69:1 in dark (design-system §2.4).
 *
 * - `neutral`: muted text on `--surface-strong`, 5.18:1 light, 6.38:1 dark.
 * - `accent`: `--accent-text` on `--accent-subtle`, 5.15:1 light, 8.09:1 dark.
 * - `outline`: the text colour inside a hairline.
 *
 * The transparent border on the filled variants keeps them outlined in
 * forced-colours mode.
 */
const VARIANTS: Record<BadgeVariant, string> = {
    neutral: 'border-transparent bg-surface-strong text-muted-foreground',
    accent: 'border-transparent bg-accent-subtle text-accent-text',
    outline: 'border-rule text-foreground',
};

interface BadgeProps {
    variant?: BadgeVariant;
    className?: string;
    children: ReactNode;
}

/** A label, never a button: 22px tall, 13/500, sentence case, tabular figures. */
export default function Badge({ variant = 'neutral', className, children }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex min-h-[22px] items-center gap-1 rounded-chip border px-2 text-[0.8125rem] leading-[1.3] font-medium tracking-[-0.003em] tabular-nums',
                VARIANTS[variant],
                className,
            )}
        >
            {children}
        </span>
    );
}
