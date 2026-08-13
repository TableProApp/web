import { cn } from '@/lib/utils';

/**
 * A keyboard shortcut token. Renders the literal glyphs the app's menus use
 * (⌘, ⇧, ⌥, ⌃, ⏎) rather than spelling the modifiers out.
 */
export default function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <kbd
            className={cn(
                'inline-flex h-5 items-center rounded-[4px] border border-gray-950/10 px-1.5 font-mono text-[11px] leading-none text-muted-foreground dark:border-white/15',
                className,
            )}
        >
            {children}
        </kbd>
    );
}
