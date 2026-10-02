/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/description-list.tsx. Change both in the same release. See docs/shared-files.md. */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DescriptionListProps {
    className?: string;
    children: ReactNode;
}

/**
 * Key and value rows in a real `<dl>`: database facts, license details.
 *
 * Each row is a `<div>` holding one `dt` and one `dd`, which is valid HTML and
 * lets a row be a grid. Two columns from 640px (the term takes about a third),
 * stacked below.
 */
export default function DescriptionList({ className, children }: DescriptionListProps) {
    return <dl className={cn('border-t border-rule', className)}>{children}</dl>;
}

interface DescriptionItemProps {
    term: ReactNode;
    className?: string;
    children: ReactNode;
}

export function DescriptionItem({ term, className, children }: DescriptionItemProps) {
    return (
        <div className={cn('grid gap-1 border-b border-rule py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6', className)}>
            <dt className="text-sm leading-[1.4] font-medium text-muted-foreground">{term}</dt>
            <dd className="type-small min-w-0 text-foreground">{children}</dd>
        </div>
    );
}
