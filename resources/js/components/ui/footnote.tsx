import { ReactNode } from 'react';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { cn } from '@/lib/utils';

/**
 * The caveat band under the artifact it qualifies, and the rule that closes it.
 *
 * This existed twelve times as a hand-written
 * `px-4 py-3 font-mono text-xs text-muted-foreground` inside a `Container`,
 * followed by a `FullLine`, in seven different section files. Twelve copies of
 * one idea is how a rhythm stops being one — and it is also how the page ended
 * up with twelve mono bands, each restating a measurement condition at the same
 * visual weight as the argument above it.
 *
 * Sans, not mono. A footnote is prose about data, not data. Mono is reserved
 * for values, identifiers and the section eyebrow; spending it on caveats made
 * IBM Plex Mono the page's most common voice at 206 render sites, where its job
 * is to be the rarest.
 *
 * `py-4` rather than `py-3`, and `text-sm` rather than `text-xs`: a line nobody
 * can read is not a disclosure, and 12px mono at `--muted-foreground` was the
 * smallest type on the page.
 */
export default function FootNote({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <>
            <Container>
                <p className={cn('max-w-[68ch] px-4 py-4 text-sm text-muted-foreground text-pretty', className)}>
                    {children}
                </p>
            </Container>
            <FullLine />
        </>
    );
}
