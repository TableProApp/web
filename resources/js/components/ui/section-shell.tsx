import { ReactNode } from 'react';
import Container from '@/components/ui/container';
import { AccentLine, FullLine } from '@/components/ui/full-line';
import SectionLabel from '@/components/ui/section-label';

interface SectionShellProps {
    id: string;
    /** Mono uppercase eyebrow. Rendered as a <p>, never a heading. */
    label: string;
    /** First line of the H2. */
    headline: string;
    /** Second line of the H2, rendered muted. Optional. */
    headlineMuted?: string;
    /** Optional paragraph under the headline. */
    lede?: string;
    /**
     * `argument` carries the page's case and keeps the full headline size.
     * `reference` is supporting material — the long tail, the platform notes,
     * the FAQ — and drops a step.
     *
     * All thirteen headlines used to render at the same size and weight, so a
     * reader scanning for eight seconds had no signal for which sections were
     * the argument and which were the appendix.
     */
    tier?: 'argument' | 'reference';
    /**
     * `raised` puts the section on the second ground.
     *
     * Reserved for sections that are already conceptually inset. Two grounds,
     * not five — a page that changes background every section has no rhythm
     * either, it just has noise.
     */
    tone?: 'base' | 'raised';
    className?: string;
    children: ReactNode;
}

const HEADLINE_CLASS: Record<'argument' | 'reference', string> = {
    argument: 'text-3xl sm:text-4xl',
    reference: 'text-2xl',
};

/**
 * The vertical rhythm every landing section shares: leading space, an accented
 * label rule, the two-tone headline sandwich, an optional lede, then the
 * section body.
 *
 * One rule per boundary. This used to emit `FullLine → h-4 → FullLine` and
 * again `FullLine → h-2 → FullLine`, so every section drew four rules where it
 * needed two — and a 1px rule, 16px gap, 1px rule band does not read as a
 * ledger, it reads as a mis-rendered table border. Separation now comes from
 * the rows' own vertical padding, which also fixes 30px type sitting 3px off
 * its rule while 12px fine print got 12px.
 */
export default function SectionShell({
    id,
    label,
    headline,
    headlineMuted,
    lede,
    tier = 'argument',
    tone = 'base',
    className,
    children,
}: SectionShellProps) {
    const headingId = `${id}-heading`;

    return (
        <section
            id={id}
            aria-labelledby={headingId}
            data-tone={tone === 'raised' ? 'raised' : undefined}
            className={`scroll-mt-20 ${className ?? ''}`}
        >
            <div className="h-12 sm:h-16 lg:h-24" />

            <Container>
                <AccentLine />
                <SectionLabel className="px-4 py-3">{label}</SectionLabel>
                <FullLine />
                <h2
                    id={headingId}
                    className={`px-4 py-4 font-bold text-pretty sm:py-5 ${HEADLINE_CLASS[tier]}`}
                >
                    {headline}
                    {headlineMuted && (
                        <>
                            <br />
                            <span className="text-muted-foreground">{headlineMuted}</span>
                        </>
                    )}
                </h2>
                {lede && (
                    <>
                        <FullLine />
                        <p className="max-w-3xl px-4 py-4 text-base text-muted-foreground text-pretty sm:py-5">
                            {lede}
                        </p>
                    </>
                )}
                <FullLine />
            </Container>

            <div className="h-6 sm:h-8 lg:h-10" />

            {children}
        </section>
    );
}
