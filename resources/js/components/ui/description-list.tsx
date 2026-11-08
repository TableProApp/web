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
    // `body`: a /teams row, the term in the text's colour and the sentence muted, at reading size.
    size?: 'small' | 'body';
    className?: string;
    children: ReactNode;
}

export function DescriptionItem({ term, size = 'small', className, children }: DescriptionItemProps) {
    const body = size === 'body';

    return (
        <div className={cn('grid gap-1 border-b border-rule sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6', body ? 'py-4' : 'py-3', className)}>
            <dt className={body ? 'text-base leading-[1.5] font-medium tracking-[-0.011em] text-foreground' : 'text-sm leading-[1.4] font-medium text-muted-foreground'}>{term}</dt>
            <dd className={cn('min-w-0', body ? 'type-body text-pretty text-muted-foreground' : 'type-small text-foreground')}>{children}</dd>
        </div>
    );
}
