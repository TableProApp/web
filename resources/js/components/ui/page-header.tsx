import type { ReactNode } from 'react';
import Breadcrumbs, { type Crumb } from '@/components/ui/breadcrumbs';
import Container, { type ContainerWidth } from '@/components/ui/container';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    /** The H1. Left-aligned, one colour. */
    title: ReactNode;
    /** The page lead: one paragraph, at most 56 characters wide, muted. */
    lead?: ReactNode;
    /** A small muted line under the lead: "Updated 2 October 2026", a version, a date. */
    meta?: ReactNode;
    /** Ancestors first, the current page last. Shown 16px above the H1. */
    breadcrumbs?: Crumb[];
    /** The page's actions: one primary button at most, and standalone links. */
    actions?: ReactNode;
    /**
     * - `marketing`: the page-top spacing, for hubs, feature, database and
     *   comparison pages.
     * - `utility`: a compact top, for download, legal and FAQ pages.
     */
    variant?: 'marketing' | 'utility';
    /** `display` only for the homepage H1; every other page uses `h1`. */
    titleSize?: 'h1' | 'display';
    /** The column: `wide` with the page grid, `text` above a reading-width article. */
    width?: ContainerWidth;
    className?: string;
    /** Anything under the actions, still inside the header: an availability line, a facts card. */
    children?: ReactNode;
}

/**
 * The top of a public page (design-system §5.1, replacing the ledger
 * `PageHeader` in `section-shell.tsx`): breadcrumbs, the H1, the lead, a meta
 * line and the actions.
 *
 * Spacing is the page rhythm: 40, 56 and 72px below the header at 375, 768 and
 * 1280px (24, 32 and 40 in the compact `utility` form), and 32, 40 and 48px
 * from the header block to the first content.
 *
 * The H1 is the page's only one. Headings are left-aligned everywhere; a
 * centred stack reads as a template.
 */
export default function PageHeader({
    title,
    lead,
    meta,
    breadcrumbs,
    actions,
    variant = 'marketing',
    titleSize = 'h1',
    width = 'wide',
    className,
    children,
}: PageHeaderProps) {
    return (
        <header
            className={cn(
                variant === 'marketing' ? 'pt-10 md:pt-14 xl:pt-18' : 'pt-6 md:pt-8 xl:pt-10',
                'pb-8 md:pb-10 xl:pb-12',
                className,
            )}
        >
            <Container width={width}>
                {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} className="mb-4" />}
                <h1 className={cn(titleSize === 'display' ? 'type-display' : 'type-h1', 'text-foreground')}>{title}</h1>
                {lead && <div className="type-lead mt-4 max-w-[56ch] text-muted-foreground">{lead}</div>}
                {meta && <p className="type-small mt-3 text-muted-foreground">{meta}</p>}
                {actions && <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">{actions}</div>}
                {children && <div className="mt-8">{children}</div>}
            </Container>
        </header>
    );
}
