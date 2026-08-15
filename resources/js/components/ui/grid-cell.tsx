import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Column count per breakpoint. Omitted breakpoints inherit the one below. */
export interface ColumnMap {
    base: number;
    sm?: number;
    md?: number;
    lg?: number;
}

/**
 * Every class string below is written out literally so Tailwind's source scan
 * can find it. Do not build these with template interpolation.
 */
const BORDERS = {
    base: { r: 'border-r', rOff: 'border-r-0', b: 'border-b', bOff: 'border-b-0' },
    'max-sm': {
        r: 'max-sm:border-r',
        rOff: 'max-sm:border-r-0',
        b: 'max-sm:border-b',
        bOff: 'max-sm:border-b-0',
    },
    'max-md': {
        r: 'max-md:border-r',
        rOff: 'max-md:border-r-0',
        b: 'max-md:border-b',
        bOff: 'max-md:border-b-0',
    },
    'max-lg': {
        r: 'max-lg:border-r',
        rOff: 'max-lg:border-r-0',
        b: 'max-lg:border-b',
        bOff: 'max-lg:border-b-0',
    },
    'sm:max-md': {
        r: 'sm:max-md:border-r',
        rOff: 'sm:max-md:border-r-0',
        b: 'sm:max-md:border-b',
        bOff: 'sm:max-md:border-b-0',
    },
    'sm:max-lg': {
        r: 'sm:max-lg:border-r',
        rOff: 'sm:max-lg:border-r-0',
        b: 'sm:max-lg:border-b',
        bOff: 'sm:max-lg:border-b-0',
    },
    'md:max-lg': {
        r: 'md:max-lg:border-r',
        rOff: 'md:max-lg:border-r-0',
        b: 'md:max-lg:border-b',
        bOff: 'md:max-lg:border-b-0',
    },
    sm: { r: 'sm:border-r', rOff: 'sm:border-r-0', b: 'sm:border-b', bOff: 'sm:border-b-0' },
    md: { r: 'md:border-r', rOff: 'md:border-r-0', b: 'md:border-b', bOff: 'md:border-b-0' },
    lg: { r: 'lg:border-r', rOff: 'lg:border-r-0', b: 'lg:border-b', bOff: 'lg:border-b-0' },
} as const;

type BorderKey = keyof typeof BORDERS;

/**
 * Resolve each declared breakpoint to the prefix that scopes it to exactly the
 * range where its column count applies. The largest breakpoint is open-ended;
 * every smaller one is capped by the next declared breakpoint.
 */
function resolvePrefixes(cols: ColumnMap): { key: BorderKey; cols: number }[] {
    const declared: { name: 'base' | 'sm' | 'md' | 'lg'; cols: number }[] = [{ name: 'base', cols: cols.base }];
    if (cols.sm !== undefined) declared.push({ name: 'sm', cols: cols.sm });
    if (cols.md !== undefined) declared.push({ name: 'md', cols: cols.md });
    if (cols.lg !== undefined) declared.push({ name: 'lg', cols: cols.lg });

    return declared.map((entry, i) => {
        const next = declared[i + 1];

        if (!next) {
            return { key: entry.name === 'base' ? 'base' : (entry.name as BorderKey), cols: entry.cols };
        }

        const key = (entry.name === 'base' ? `max-${next.name}` : `${entry.name}:max-${next.name}`) as BorderKey;

        return { key, cols: entry.cols };
    });
}

/**
 * Border classes for one cell of a flush hairline grid.
 *
 * `index` must always be the cell's position in the FULL list, never a filtered
 * one, or the grid's internal rules land in the wrong places when a filter is
 * applied. `total` must include any filler cells.
 */
export function cellBorders(index: number, cols: ColumnMap, total: number): string {
    return resolvePrefixes(cols)
        .flatMap(({ key, cols: columnCount }) => {
            const set = BORDERS[key];
            const rows = Math.ceil(total / columnCount);
            const lastRowStart = (rows - 1) * columnCount;
            const isLastInRow = (index + 1) % columnCount === 0;
            const isLastRow = index >= lastRowStart;

            return [isLastInRow ? set.rOff : set.r, isLastRow ? set.bOff : set.b];
        })
        .join(' ');
}

/**
 * Three densities, replacing five ad-hoc padding scales (`p-4` x13, `p-6` x12,
 * `p-8` x10, `p-5` x8, `p-10` x2) and two local `CELL_CLASS`/`TILE_CLASS`
 * constants that had drifted apart in separate section files.
 */
export const CELL_DENSITY = {
    compact: 'p-4 sm:p-5',
    default: 'p-6 sm:p-8',
    roomy: 'p-6 sm:p-8 lg:p-10',
} as const;

export type CellDensity = keyof typeof CELL_DENSITY;

interface GridCellProps {
    className?: string;
    /** `stripe` fills the cell with the page gutter's 45 degree hatch. */
    variant?: 'plain' | 'stripe';
    density?: CellDensity;
    children?: ReactNode;
}

/**
 * One cell of a flush hairline grid. Zero radius by design: the grid's rules
 * are the page's structure, and rounding them breaks the alignment.
 */
export function GridCell({ className, variant = 'plain', density, children }: GridCellProps) {
    return (
        <div
            className={cn(
                'border-rule',
                density && CELL_DENSITY[density],
                variant === 'stripe' &&
                    'bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-[size:10px_10px] [--pattern-fg:var(--color-black)]/5 dark:[--pattern-fg:var(--color-white)]/10',
                className,
            )}
            aria-hidden={children ? undefined : true}
        >
            {children}
        </div>
    );
}

export default GridCell;
