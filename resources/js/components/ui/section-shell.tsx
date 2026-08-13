import { ReactNode } from 'react';
import Container from '@/components/ui/container';
import { AccentLine, FullLine } from '@/components/ui/full-line';

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
    className?: string;
    children: ReactNode;
}

/**
 * The vertical rhythm every landing section shares: leading space, an accented
 * label rule, the two-tone headline sandwich, an optional lede, then the
 * section body.
 */
export default function SectionShell({
    id,
    label,
    headline,
    headlineMuted,
    lede,
    className,
    children,
}: SectionShellProps) {
    const headingId = `${id}-heading`;

    return (
        <section id={id} aria-labelledby={headingId} className={`scroll-mt-20 ${className ?? ''}`}>
            <div className="h-12 sm:h-16 lg:h-24" />

            <Container>
                <AccentLine />
                <p className="pl-4 font-mono text-xs font-semibold tracking-widest text-primary-strong uppercase">
                    {label}
                </p>
                <FullLine />
            </Container>

            <div className="h-4" />

            <Container>
                <FullLine />
                <h2 id={headingId} className="pl-4 text-3xl font-bold tracking-tight text-pretty sm:text-4xl">
                    {headline}
                    {headlineMuted && (
                        <>
                            <br />
                            <span className="text-muted-foreground">{headlineMuted}</span>
                        </>
                    )}
                </h2>
                <FullLine />
            </Container>

            {lede && (
                <>
                    <div className="h-2" />
                    <Container>
                        <FullLine />
                        <p className="max-w-3xl pl-4 text-base text-muted-foreground text-pretty">{lede}</p>
                        <FullLine />
                    </Container>
                </>
            )}

            <div className="h-6 sm:h-8 lg:h-10" />

            {children}
        </section>
    );
}
