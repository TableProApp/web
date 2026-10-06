import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CellGridProps {
    /** `ul` when the cells are a list (engines, sponsors); `div` otherwise. */
    as?: ElementType;
    /**
     * Cell padding. `compact` for a wall of short items (logos, engines,
     * download actions); `regular` for a cell that holds a paragraph or a
     * screenshot.
     */
    density?: 'compact' | 'regular';
    /** The grid's columns, per breakpoint, as Tailwind classes. Each direct child is one cell. */
    className?: string;
    children: ReactNode;
}

/**
 * Cells that share one 1px `--rule` line, with no gaps and no corners
 * (design-system §4.7).
 *
 * The grid reaches the wide Container's outer edge: from 1280px each outer
 * line lands on a page rail, and below 1280 the grid runs to the screen edge,
 * so a phone sees only horizontals. A cell's padding puts its content back on
 * the page's left edge. Every direct child is a cell and draws its lines with
 * a 1px spread shadow, so neighbours share a line instead of doubling it, and
 * a short last row leaves blank page rather than a block of line colour
 * (app.css, `.cell-grid`).
 *
 * Use it only in a wide section, for content that already is a set of like
 * items. Prose keeps its reading measure and stays unlined.
 */
export default function CellGrid({ as: Element = 'div', density = 'regular', className, children }: CellGridProps) {
    return (
        <Element data-density={density} className={cn('cell-grid', className)}>
            {children}
        </Element>
    );
}
