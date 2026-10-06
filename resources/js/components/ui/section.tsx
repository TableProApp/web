import type { ReactNode } from 'react';
import Container, { type ContainerWidth } from '@/components/ui/container';
import { cn } from '@/lib/utils';

interface SectionProps {
    /**
     * The section's id: its anchor (`/#pricing`) and the base of its heading's
     * id. Ids are English in every language, so a link keeps its target when
     * the reader switches language (sitemap §B.4).
     */
    id: string;
    /** The H2. One colour, one line of thought; a second thought belongs in `lead`. */
    title: ReactNode;
    /** One paragraph under the heading, at most 56 characters wide, in the muted colour. */
    lead?: ReactNode;
    /**
     * `surface` paints the sunken band. A page has at most one, and the
     * section right before the footer is never one, so two bands never merge
     * (design-system §4.3).
     */
    tone?: 'base' | 'surface';
    /**
     * The content measure. `wide` for grids and tables; `text` (704px) for
     * prose and `narrow` (576px). Every width sits on the same left edge as the
     * page grid: a narrower section is a left-aligned column inside the wide
     * container, never a centred one, so headings never zigzag between two
     * left edges (design-system §3.4, §4.2).
     */
    width?: ContainerWidth;
    /**
     * The content ends on the section's bottom line: no padding below it, so a
     * cell grid closing the section shares its last rule with the join to the
     * next block (design-system §4.7).
     */
    flush?: boolean;
    /** `h3` for a compact section such as the sponsors strip, whose H2 takes the smaller role. */
    titleStyle?: 'h2' | 'h3';
    /** Anything aligned with the heading on the right from 768px: a standalone link. */
    aside?: ReactNode;
    className?: string;
    children?: ReactNode;
}

/** A narrower measure inside the wide grid, left-aligned. */
const MEASURES: Record<ContainerWidth, string | undefined> = {
    wide: undefined,
    text: 'max-w-[44rem]',
    narrow: 'max-w-[36rem]',
};

/**
 * A page section (design-system §5.1, replacing `SectionShell`).
 *
 * A `<section>` named by its H2, the heading and an optional lead, then the
 * content. No eyebrow, no muted second line.
 *
 * Spacing is the section rhythm, `--space-section`: 64px on phones, 80 from
 * 768px and 96 from 1280px between one section's content and the next. The
 * page frame's join, a full-bleed hairline (app.css, design-system §4.7),
 * sits in the middle of it: every section pads half the rhythm above and
 * below, so the line has the same air on both sides at every join, bands and
 * strips included. 24, 32 and 40px separate the heading block from the
 * content.
 *
 * A `surface` band also sets `--table-ground`, so a sticky table column on it
 * is painted with the band and not the page.
 */
export default function Section({ id, title, lead, tone = 'base', width = 'wide', flush = false, titleStyle = 'h2', aside, className, children }: SectionProps) {
    const headingId = `${id}-title`;

    return (
        <section
            id={id}
            aria-labelledby={headingId}
            className={cn(
                'py-8 md:py-10 xl:py-12',
                flush && 'pb-0 md:pb-0 xl:pb-0',
                tone === 'surface' && 'bg-surface [--table-ground:var(--surface)]',
                className,
            )}
        >
            <Container>
                <div className={MEASURES[width]}>
                    <div className={cn(aside && 'md:flex md:items-end md:justify-between md:gap-8')}>
                        <div className="min-w-0">
                            <h2 id={headingId} className={cn(titleStyle === 'h2' ? 'type-h2' : 'type-h3', 'text-foreground')}>
                                {title}
                            </h2>
                            {lead && <div className="type-lead mt-4 max-w-[56ch] text-muted-foreground">{lead}</div>}
                        </div>
                        {aside && <div className="mt-4 shrink-0 md:mt-0">{aside}</div>}
                    </div>
                    {children && <div className="mt-6 md:mt-8 xl:mt-10">{children}</div>}
                </div>
            </Container>
        </section>
    );
}
