/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/empty-state.tsx. Change both in the same release. See docs/shared-files.md. */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title: ReactNode;
    description?: ReactNode;
    /** At most one action. */
    action?: ReactNode;
    /** The title's element. It takes the h3 style whatever its level, so the outline decides. */
    headingLevel?: 'h2' | 'h3' | 'h4' | 'p';
    className?: string;
}

/**
 * What a list says when it has nothing in it: a title, one sentence and at most
 * one action, centred in its panel. No illustration and no icon circle; the
 * sentence does the work.
 */
export default function EmptyState({ title, description, action, headingLevel = 'h3', className }: EmptyStateProps) {
    const Heading = headingLevel;

    return (
        <div className={cn('px-4 py-10 text-center sm:px-6', className)}>
            <Heading className="type-h3 text-foreground">{title}</Heading>
            {description && <p className="type-small mx-auto mt-2 max-w-sm text-muted-foreground">{description}</p>}
            {action && <div className="mt-6 flex justify-center">{action}</div>}
        </div>
    );
}
