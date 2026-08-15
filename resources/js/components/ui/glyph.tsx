import { cn } from '@/lib/utils';

interface GlyphProps {
    className?: string;
}

/**
 * The Apple mark, for the "Download for Mac" buttons.
 *
 * It was inlined eight times in four shapes, and four of those copies carried
 * no size class at all — inside a flex button, an SVG with no width collapses
 * to whatever the browser guesses. Half of them were also missing
 * `aria-hidden`, so a screen reader read an unlabelled graphic in the middle of
 * a button that already says "Download for Mac".
 *
 * `size-4` is the default because that is what the buttons around it use; the
 * hero passes `size-5` because its button is a rung larger.
 */
export function AppleGlyph({ className }: GlyphProps) {
    return (
        <svg className={cn('size-4', className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
    );
}

/**
 * The "included" tick.
 *
 * Three copies existed and they did not agree on colour: two used
 * `--primary-strong`, one used bare `--primary` at 2.62:1 — the exact failure
 * `SectionLabel` was created to stop, surviving in a glyph that is the sole
 * carrier of meaning in a comparison column.
 *
 * `aria-hidden` on purpose. Wherever this appears the cell must also carry
 * visually hidden text, because a tick with no text alternative announces as
 * nothing and the reader is told the feature is absent.
 */
export function CheckGlyph({ className }: GlyphProps) {
    return (
        <svg
            className={cn('size-4 text-primary-strong', className)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    );
}

/** The "not included" cross. Same rule: it needs text beside it, not instead of it. */
export function CrossGlyph({ className }: GlyphProps) {
    return (
        <svg
            className={cn('size-3.5 text-muted-foreground', className)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

/**
 * Availability in a comparison cell: the glyph plus the word.
 *
 * This pair exists as one component because separating them is exactly how the
 * bug keeps coming back. Both glyphs are `aria-hidden`, so a cell holding only
 * one announces as empty — and an empty cell in a comparison table does not
 * read as "no answer", it reads as "not included". The pricing table shipped
 * that way, was fixed, and Compare then lost the same fix when its local
 * wrappers were replaced.
 */
export function Availability({ included }: { included: boolean }) {
    return (
        <>
            <span className="sr-only">{included ? 'Included' : 'Not included'}</span>
            {included ? <CheckGlyph /> : <CrossGlyph />}
        </>
    );
}
