import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A keyboard shortcut token (design-system §5.3.12): 20px tall, the chip
 * radius, a `--rule-strong` outline, mono at 12px in the muted colour.
 *
 * It renders the literal glyphs the app's menus use (⌘, ⇧, ⌥, ⌃, ⏎) rather
 * than spelling the modifiers out, so what the page shows is what the menu
 * shows.
 */
export default function Kbd({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <kbd
            className={cn(
                'inline-flex h-5 min-w-5 items-center justify-center rounded-chip border border-rule-strong px-1.5 font-mono text-xs leading-none text-muted-foreground',
                className,
            )}
        >
            {children}
        </kbd>
    );
}
