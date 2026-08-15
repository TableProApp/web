import { ReactNode } from 'react';
import { FullLine } from '@/components/ui/full-line';

/**
 * A titled block of body copy, ruled off from the one above it.
 *
 * The legal pages are a stack of these. Privacy and Terms each declared a
 * byte-identical local copy, which is two places for one rule to drift and two
 * places to fix when it does.
 *
 * The heading is an h2 because these sit under the page's single h1.
 */
export function ProseBlock({ title, children }: { title: string; children: ReactNode }) {
    return (
        <>
            <FullLine />
            <div className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
                <div className="mt-4">{children}</div>
            </div>
        </>
    );
}

/**
 * The marker on a bulleted line inside a ProseBlock.
 *
 * `mt-1.5` aligns the dot to the cap height of the first line rather than to
 * the line box, which is why it is not a list-style marker.
 */
export function Bullet() {
    return <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />;
}
