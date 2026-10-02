import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisclosureProps {
    /** What the reader opens: "Which Mac do I have?", "On this page", "Older versions". */
    summary: ReactNode;
    /** Open on first render. */
    open?: boolean;
    id?: string;
    className?: string;
    children: ReactNode;
}

/**
 * Optional detail behind a native `<details>` (design-system §5.3.6).
 *
 * The summary is 14/500 in the text colour with a leading 16px chevron that
 * turns a quarter while it opens (instantly with reduced motion). The body is
 * indented 24px.
 *
 * Only for detail a reader may skip. Never for data: engine lists, plan
 * matrices and comparisons always render in full, so Ctrl+F and search engines
 * see them. Native, so it opens without JavaScript and the browser's find
 * opens it when a match is inside.
 */
export default function Disclosure({ summary, open = false, id, className, children }: DisclosureProps) {
    return (
        <details id={id} open={open} className={cn('group', className)}>
            <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-2 rounded-control text-sm leading-[1.3] font-medium text-foreground [&::-webkit-details-marker]:hidden">
                <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-state) ease-(--ease-feedback) group-open:rotate-90"
                    aria-hidden="true"
                />
                {summary}
            </summary>
            <div className="type-small mt-2 pl-6 text-foreground">{children}</div>
        </details>
    );
}
