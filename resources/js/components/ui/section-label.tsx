import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionLabelProps {
    children: ReactNode;
    className?: string;
}

/**
 * The mono uppercase eyebrow that opens a section.
 *
 * This exists as a primitive because the colour had forked. Twenty-three call
 * sites used bare `text-primary`, which measures 2.62:1 on white and fails AA,
 * while the landing sections used `text-primary-strong` at 5.9:1 — and the
 * class *order* differed between the two groups, which is the fingerprint of a
 * migration that fixed the homepage and left the other eight pages behind.
 *
 * Fixing twenty-three strings would only have let them diverge again.
 *
 * Rendered as a <p>, never a heading: it is a taxonomy tag above the real
 * heading, and promoting it to one would put two headings in every section.
 *
 * Tracking is set here rather than inherited from the type scale. The scale's
 * values come from Inter's optical-compensation curve for proportional text;
 * letterspacing 11px uppercase monospace is a different problem with a
 * different answer.
 */
export default function SectionLabel({ children, className }: SectionLabelProps) {
    return (
        <p
            className={cn(
                'font-mono text-xs font-semibold tracking-widest text-primary-strong uppercase',
                className,
            )}
        >
            {children}
        </p>
    );
}
