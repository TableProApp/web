import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DotListProps {
    /** The facts, in order. `null`, `false` and empty strings are left out. */
    items: ReactNode[];
    // `center`: one fact per line on a phone, with no dots; from 640px one centred line, the first item without its dot.
    align?: 'start' | 'center';
    className?: string;
}

/**
 * A line of short facts separated by middle dots ("Works on Mac, iPhone and
 * iPad · Bundled in the Mac app · 0.77 and later"), for meta and availability
 * lines.
 *
 * A dot never starts or ends a line. Each item draws its own dot in its left
 * padding, and the list is pulled left by that padding inside a box that clips
 * its overflow, so the dot of whichever item starts a line falls outside the
 * box and is not painted. Typed separators were flex items or plain text, so a
 * wrapped Vietnamese line ended with a lone "·" or began with one. Items wrap
 * whole; the dots are generated content with empty alternative text, so a
 * screen reader reads the facts without them.
 *
 * The 4px of padding inside the clip keeps a focus ring on a leading link
 * visible.
 */
export default function DotList({ items, align = 'start', className }: DotListProps) {
    const shown = items.filter((item) => item !== null && item !== false && item !== undefined && item !== '');

    if (align === 'center') {
        return (
            <span className={cn('flex flex-col items-center gap-y-1 sm:flex-row sm:flex-wrap sm:justify-center', className)}>
                {shown.map((item, index) => (
                    <span
                        key={index}
                        className="relative min-w-0 sm:pl-5 sm:before:absolute sm:before:left-[0.5625rem] sm:before:content-['·'_/_''] sm:before:text-muted-foreground sm:first:pl-0 sm:first:before:content-none"
                    >
                        {item}
                    </span>
                ))}
            </span>
        );
    }

    return (
        <span className={cn('-ml-1 block overflow-hidden pl-1', className)}>
            <span className="-ml-5 flex flex-wrap items-center gap-y-1">
                {shown.map((item, index) => (
                    <span key={index} className="relative min-w-0 pl-5 before:absolute before:left-[0.5625rem] before:content-['·'_/_''] before:text-muted-foreground">
                        {item}
                    </span>
                ))}
            </span>
        </span>
    );
}
