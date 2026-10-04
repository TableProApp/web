import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A keyboard shortcut token (design-system §5.3.12): 20px tall, the chip
 * radius, a `--rule-strong` outline, 13px in the muted colour.
 *
 * It renders the literal glyphs the app's menus use (⌘, ⇧, ⌥, ⌃, ⏎) rather
 * than spelling the modifiers out, so what the page shows is what the menu
 * shows.
 *
 * The face is the system UI font, not Plex Mono. Neither shipped subset (Plex
 * Mono or Inter, latin) has ⌘ ⇧ ⌥ ⌃ or ⏎, so they fell back to a symbol font
 * that drew them about 5px tall beside a full-size "L", and "⌘⇧L" could not
 * be told from "⌘⌥L". The system face is what macOS draws its own menus in
 * (San Francisco, which has every one of them at cap height); Segoe UI Symbol
 * covers Windows.
 *
 * It is an inline box, not an inline-flex one: an atomic inline is a line
 * break opportunity on both sides, so "(⌘Y)" broke after the "(". Inline, the
 * chip follows the text's own break rules and never strands punctuation.
 */
export default function Kbd({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <kbd
            className={cn(
                'rounded-chip border border-rule-strong px-1.5 py-0.5 text-[0.8125rem] leading-none font-normal tracking-[0.04em] whitespace-nowrap text-muted-foreground [font-family:system-ui,-apple-system,"Segoe_UI_Symbol",sans-serif]',
                className,
            )}
        >
            {children}
        </kbd>
    );
}
