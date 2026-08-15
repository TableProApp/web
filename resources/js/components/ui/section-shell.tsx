import { ReactNode } from 'react';
import Container from '@/components/ui/container';
import { AccentLine, FullLine } from '@/components/ui/full-line';
import SectionLabel from '@/components/ui/section-label';

type Tier = 'argument' | 'reference';

const HEADLINE_CLASS: Record<Tier, string> = {
    argument: 'text-3xl sm:text-4xl',
    reference: 'text-2xl',
};

interface HeaderStackProps {
    headingId?: string;
    level: 'h1' | 'h2';
    label: ReactNode;
    /** Turns the eyebrow into a link. The blog post header uses it to go back. */
    labelHref?: string;
    headline: ReactNode;
    headlineMuted?: string;
    lede?: ReactNode;
    tier: Tier;
}

/**
 * The header rhythm, in one place.
 *
 * Leading space, an accented label rule, the headline, an optional lede, and a
 * rule to close. One rule per boundary — this used to emit `FullLine → h-4 →
 * FullLine` and again `FullLine → h-2 → FullLine`, so every header drew four
 * rules where it needed two, and a 1px rule / 16px gap / 1px rule band does not
 * read as a ledger, it reads as a mis-rendered table border.
 *
 * Separation comes from each row's own vertical padding, which also fixes 30px
 * type sitting 3px off its rule while 12px fine print got a full 12px.
 *
 * Shared between `SectionShell` and `PageHeader` rather than written twice. Six
 * pages hand-rolled this stack forty-one times and every copy had drifted: no
 * accent tick, no vertical padding, `pl-4` instead of `px-4`, and the retired
 * four-rule pattern intact. Duplicating a rhythm is how a rhythm stops being one.
 */
function HeaderStack({ headingId, level, label, labelHref, headline, headlineMuted, lede, tier }: HeaderStackProps) {
    const Heading = level;

    return (
        <>
            <div className="h-12 sm:h-16 lg:h-24" />

            <Container>
                <AccentLine />
                {labelHref ? (
                    <SectionLabel className="block px-4 py-3 transition-opacity duration-(--dur-tap) ease-(--ease-feedback) hover:opacity-70">
                        <a href={labelHref}>{label}</a>
                    </SectionLabel>
                ) : (
                    <SectionLabel className="px-4 py-3">{label}</SectionLabel>
                )}
                <FullLine />
                <Heading
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
                </Heading>
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
        </>
    );
}

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
    tier?: Tier;
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

/** A section of a page, with an H2 and a landmark. */
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
            <HeaderStack
                headingId={headingId}
                level="h2"
                label={label}
                headline={headline}
                headlineMuted={headlineMuted}
                lede={lede}
                tier={tier}
            />
            {children}
        </section>
    );
}

interface PageHeaderProps {
    label: ReactNode;
    labelHref?: string;
    headline: string;
    headlineMuted?: string;
    /**
     * The lede, or a metadata line such as "Last updated: May 2026". Either way
     * it is the row under the headline and gets the same treatment; the pages
     * that hand-rolled this gave the two roles different type and padding for
     * no reason anyone recorded.
     *
     * A node rather than a string, because one of them carries a link.
     */
    lede?: ReactNode;
    children?: ReactNode;
}

/**
 * The same stack, opening a page rather than a section, so it carries the H1.
 *
 * Eight pages built this by hand and none of them agreed: three h1 size ramps,
 * three padding treatments, and the four-rule pattern this component's own
 * docblock says was deleted.
 */
export function PageHeader({ label, labelHref, headline, headlineMuted, lede, children }: PageHeaderProps) {
    return (
        <>
            <HeaderStack
                headingId="page-heading"
                level="h1"
                label={label}
                labelHref={labelHref}
                headline={headline}
                headlineMuted={headlineMuted}
                lede={lede}
                tier="argument"
            />
            {children}
        </>
    );
}

interface SectionHeaderProps {
    label: ReactNode;
    headline: ReactNode;
    headlineMuted?: string;
    lede?: ReactNode;
    tier?: Tier;
}

/**
 * The header stack on its own, for a section that cannot be wrapped.
 *
 * `SectionShell` is the right thing wherever the section's body is a single
 * block, because it also supplies the landmark, the id and the scroll offset.
 * Compare and DatabaseClient build their sections inside conditional fragments
 * whose boundaries do not line up with a component wrapper, so they take the
 * header alone rather than keeping a second, drifting copy of the rhythm.
 *
 * The heading gets no id here: without the `<section aria-labelledby>` that
 * SectionShell provides there is nothing to point at it, and an id that labels
 * nothing is worse than none.
 */
export function SectionHeader({ label, headline, headlineMuted, lede, tier = 'argument' }: SectionHeaderProps) {
    return (
        <HeaderStack
            level="h2"
            label={label}
            headline={headline}
            headlineMuted={headlineMuted}
            lede={lede}
            tier={tier}
        />
    );
}
