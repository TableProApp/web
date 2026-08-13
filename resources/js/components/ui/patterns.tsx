import { cn } from '@/lib/utils';

interface PatternProps {
    className?: string;
    mask?: 'fade-edges' | 'fade-center' | 'fade-top' | 'fade-bottom' | 'none';
}

const masks: Record<string, string> = {
    'fade-edges': 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%)',
    'fade-center': 'radial-gradient(ellipse 60% 50% at 50% 30%, black 20%, transparent 70%)',
    'fade-top': 'linear-gradient(to bottom, black, transparent)',
    'fade-bottom': 'linear-gradient(to top, black, transparent)',
};

function maskStyle(mask?: string) {
    if (!mask || mask === 'none') return undefined;
    const value = masks[mask];
    if (!value) return undefined;
    return { maskImage: value, WebkitMaskImage: value };
}

export function DotPattern({ className, mask = 'fade-center' }: PatternProps) {
    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-0 bg-[image:radial-gradient(circle,_var(--pattern-fg)_1px,_transparent_1px)] bg-[size:24px_24px] [--pattern-fg:var(--color-black)]/5 dark:[--pattern-fg:var(--color-white)]/10',
                className,
            )}
            style={maskStyle(mask)}
            aria-hidden="true"
        />
    );
}

export function StripePattern({ className, mask = 'fade-edges' }: PatternProps) {
    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-[size:10px_10px] [--pattern-fg:var(--color-black)]/5 dark:[--pattern-fg:var(--color-white)]/10',
                className,
            )}
            style={maskStyle(mask)}
            aria-hidden="true"
        />
    );
}

interface GridPatternProps extends PatternProps {
    size?: number;
}

export function GridPattern({ className, mask = 'fade-edges', size = 64 }: GridPatternProps) {
    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-0 [--pattern-fg:var(--color-black)]/5 dark:[--pattern-fg:var(--color-white)]/10',
                className,
            )}
            style={{
                backgroundImage: `linear-gradient(var(--pattern-fg) 1px, transparent 1px), linear-gradient(90deg, var(--pattern-fg) 1px, transparent 1px)`,
                backgroundSize: `${size}px ${size}px`,
                ...maskStyle(mask),
            }}
            aria-hidden="true"
        />
    );
}

interface BorderLinesProps {
    className?: string;
    sides?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function BorderLines({ className, sides = ['top', 'bottom', 'left', 'right'] }: BorderLinesProps) {
    return (
        <>
            {sides.includes('top') && (
                <div className={cn('absolute top-0 left-0 right-0 h-px bg-gray-950/6 dark:bg-white/10', className)} aria-hidden="true" />
            )}
            {sides.includes('bottom') && (
                <div className={cn('absolute bottom-0 left-0 right-0 h-px bg-gray-950/6 dark:bg-white/10', className)} aria-hidden="true" />
            )}
            {sides.includes('left') && (
                <div className={cn('absolute top-0 bottom-0 left-0 w-px bg-gray-950/6 dark:bg-white/10', className)} aria-hidden="true" />
            )}
            {sides.includes('right') && (
                <div className={cn('absolute top-0 bottom-0 right-0 w-px bg-gray-950/6 dark:bg-white/10', className)} aria-hidden="true" />
            )}
        </>
    );
}
