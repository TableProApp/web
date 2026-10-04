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
     * A hairline above and below, for a compact strip such as the sponsors.
     * A ruled section keeps its own padding on both sides of its rules.
     */
    ruled?: boolean;
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
 * content. No eyebrow, no rules, no muted second line.
 *
 * Spacing is the section rhythm, `--space-section`: 64px on phones, 80 from
 * 768px and 96 from 1280px between one section and the next, applied once.
 * Each section pads above and below, and a plain section that directly
 * follows another plain section drops its top padding (`data-rhythm`, app.css),
 * so two neighbours are one rhythm apart rather than two. A band (`surface`)
 * or a ruled strip keeps its padding on both sides, inside its own ground.
 * 24, 32 and 40px separate the heading block from the content.
 *
 * A `surface` band also sets `--table-ground`, so a sticky table column on it
 * is painted with the band and not the page.
 *
 * Anchors clear the sticky header through `scroll-padding-top` on the root
 * (app.css), so a section needs no scroll margin of its own.
 */
export default function Section({ id, title, lead, tone = 'base', width = 'wide', ruled = false, titleStyle = 'h2', aside, className, children }: SectionProps) {
    const headingId = `${id}-title`;

    return (
        <section
            id={id}
            aria-labelledby={headingId}
            data-rhythm={tone === 'base' && !ruled ? 'collapse' : undefined}
            className={cn(
                'py-16 md:py-20 xl:py-24',
                tone === 'surface' && 'bg-surface [--table-ground:var(--surface)]',
                ruled && 'border-y border-rule',
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
