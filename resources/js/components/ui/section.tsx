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
    /** The content column. `wide` for grids and tables, `text` for prose. */
    width?: ContainerWidth;
    /** `h3` for a compact section such as the sponsors strip, whose H2 takes the smaller role. */
    titleStyle?: 'h2' | 'h3';
    /** Anything aligned with the heading on the right from 768px: a standalone link. */
    aside?: ReactNode;
    className?: string;
    children?: ReactNode;
}

/**
 * A page section (design-system §5.1, replacing `SectionShell`).
 *
 * A `<section>` named by its H2, the heading and an optional lead, then the
 * content. No eyebrow, no rules, no muted second line. Spacing is the section
 * rhythm: 64px of padding above and below on phones, 80 from 768px and 96 from
 * 1280px; 24, 32 and 40px between the heading block and the content.
 *
 * Anchors clear the sticky header through `scroll-padding-top` on the root
 * (app.css), so a section needs no scroll margin of its own.
 */
export default function Section({ id, title, lead, tone = 'base', width = 'wide', titleStyle = 'h2', aside, className, children }: SectionProps) {
    const headingId = `${id}-title`;

    return (
        <section id={id} aria-labelledby={headingId} className={cn('py-16 md:py-20 xl:py-24', tone === 'surface' && 'bg-surface', className)}>
            <Container width={width}>
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
            </Container>
        </section>
    );
}
