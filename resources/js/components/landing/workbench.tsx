import { ReactNode } from 'react';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { cellBorders, GridCell, type ColumnMap } from '@/components/ui/grid-cell';
import Kbd from '@/components/ui/kbd';
import { Ledger, LedgerRow } from '@/components/ui/ledger';
import SectionShell from '@/components/ui/section-shell';
import ThemedImage from '@/components/ui/themed-image';

interface Shot {
    /** Base name under /images/features. The 1216/2432 WebP ladder is derived from it. */
    name: string;
    alt: string;
    /**
     * Which edge of the screenshot carries its subject.
     *
     * The cell blows every shot up to 145% and clips it, so only 1/1.45 of the
     * image — 69% — is ever on the page. Anchoring used to follow row parity,
     * which is a fact about the layout and not about the picture: it put the
     * AI assistant's panel, which lives on the right of that shot, in the 31%
     * that gets cut. The row was captioned "AI Assistant" above a screenshot
     * with no assistant in it. Parity still decides which side the cell sits on
     * and where its hairline goes; the picture decides this.
     */
    anchor: 'left' | 'right';
}

/**
 * `ThemedImage` has always supported a WebP ladder; this section simply never
 * passed one, and shipped 4.46 MB of raw PNG instead. At 2x the same three
 * screenshots now cost about 0.50 MB.
 *
 * Widths are 1216 and 2432 because the cell renders at 1216 CSS px at most, so
 * 2432 is an exact 2x and nothing is resampled on a retina Mac.
 */
function shotSources(name: string, theme: 'light' | 'dark') {
    const stem = `/images/features/${name}-${theme}`;

    return {
        src: `${stem}.png`,
        webpSrcSet: `${stem}-1216.webp 1216w, ${stem}-2432.webp 2432w`,
    };
}

interface Row {
    index: string;
    title: string;
    body: string;
    shot: Shot;
    rows: { label: string; value: ReactNode }[];
}

/** Inline literal, for file extensions and vim commands that are not shortcuts. */
function Mono({ children }: { children: ReactNode }) {
    return <span className="font-mono text-xs text-foreground/80">{children}</span>;
}

/**
 * The screenshot cell carries the row's only interior hairline: a top rule while
 * the row is stacked, and the vertical divider once the row splits at lg. Which
 * vertical side it lands on flips with the row's parity, because the copy cell
 * reorders past it.
 */
const SHOT_BORDER_ODD = 'border-rule max-lg:border-t lg:border-l';
const SHOT_BORDER_EVEN = 'border-rule max-lg:border-t lg:border-r';

const ROWS: Row[] = [
    {
        index: '01',
        title: 'SQL Editor',
        body: 'Tree-sitter highlighting, and autocomplete that resolves aliases through JOINs and CTEs. A batch runs in one transaction: a failure names the statement and rolls the lot back.',
        shot: {
            name: 'sql-editor',
            alt: 'The SQL editor with a multi-statement query and its result tabs below.',
            anchor: 'left',
        },
        rows: [
            {
                label: 'Run',
                value: (
                    <>
                        <Kbd>⌘⏎</Kbd> statement at cursor · <Kbd>⌘⇧⏎</Kbd> all · <Kbd>⌘⌥⏎</Kbd> uncapped ·{' '}
                        <Kbd>⌘.</Kbd> cancel
                    </>
                ),
            },
            {
                label: 'Row cap',
                value: '10,000 by default, up to 500,000. Your own LIMIT always wins.',
            },
            {
                label: 'Vim',
                value: (
                    <>
                        Six modes, motions, text objects, registers, marks, macros. <Mono>:w</Mono> runs the query.
                    </>
                ),
            },
        ],
    },
    {
        index: '02',
        title: 'Data Grid',
        body: 'Every column type gets its own editor, down to a three-state checkbox for a nullable boolean. Nothing reaches the database until you press Save.',
        shot: {
            name: 'data-grid',
            alt: 'The data grid with an edited cell highlighted and the save control live, the change still only in memory.',
            anchor: 'right',
        },
        rows: [
            {
                label: 'Commit',
                value: (
                    <>
                        <Kbd>⌘S</Kbd> saves. <Kbd>⌘⇧P</Kbd> shows the exact parameterized SQL first, values inlined.
                    </>
                ),
            },
            { label: 'Copy as', value: 'CSV, JSON, Markdown, IN clause, INSERT, UPDATE' },
        ],
    },
    {
        index: '03',
        title: 'AI Assistant',
        // Was a list of the thirteen providers, which the Agents section
        // enumerates as chips. This says what the assistant does instead.
        body: 'Explain a query, optimize it, or fix one that failed. Suggestions arrive as a before-and-after diff you apply, or do not.',
        shot: {
            name: 'ai-assistant',
            alt: 'The AI assistant answering a question in a side panel, with the SQL it generated and a step-by-step explanation.',
            anchor: 'right',
        },
        rows: [
            {
                label: 'Explain',
                value: (
                    <>
                        <Kbd>⌘L</Kbd>. <Kbd>⌘⌥L</Kbd> optimizes. A failed query grows a Fix with AI button.
                    </>
                ),
            },
            { label: 'Apply', value: 'Nothing reaches your editor until you press Apply.' },
        ],
    },
];

/**
 * The long tail, folded in from what used to be its own section.
 *
 * `DepthGrid` carried an H2, an eyebrow and roughly 430px of header chrome for
 * six cells, and its `#more` anchor had no inbound link anywhere in the repo.
 * Every item here is something you do inside the app window, which is what this
 * section is about, so it reads as the end of the tour rather than as a seventh
 * pitch.
 */
const DEPTH_ITEMS: { title: string; body: ReactNode }[] = [
    {
        title: 'EXPLAIN, visualized',
        body: 'A cost-coloured diagram, an expandable tree, and the raw text.',
    },
    {
        title: 'Server dashboard',
        body: 'Active sessions, per-engine metrics and slow queries. Cancel and terminate behind a confirmation.',
    },
    {
        title: 'Users and roles',
        body: 'Grant and revoke without hand-writing GRANT, from the server down to a single column.',
    },
    {
        title: 'Quick Switcher',
        body: 'Fuzzy search across tables, databases, saved queries and history, most-used first.',
    },
    {
        title: 'CSV inspector',
        body: (
            <>
                Open a <Mono>.csv</Mono> or <Mono>.tsv</Mono> as a document, with no scratch database and no import
                step.
            </>
        ),
    },
    {
        title: 'Backup and restore',
        body: "PostgreSQL and Redshift dumps through the connection's existing SSH tunnel.",
    },
];

/** 6 items divide evenly into 1, 2 and 3 columns, so no filler cells are needed. */
const DEPTH_COLS: ColumnMap = { base: 1, sm: 2, lg: 3 };

export default function Workbench() {
    return (
        <SectionShell
            id="features"
            label="The workbench"
            headline="Write SQL, edit rows, commit."
            headlineMuted="In one window."
            lede="Every result is a tab. Every edit queues in memory until you save."
        >
            <FullLine />
            <Container>
                {ROWS.map((row, i) => {
                    const isEven = (i + 1) % 2 === 0;

                    return (
                        <div key={row.index}>
                            {/*
                              * The column template flips with the row, not just the
                              * order. `order-2` moves the copy cell past the shot in
                              * placement order but leaves the track sizes alone, so a
                              * fixed `[minmax(0,24rem)_1fr]` handed every even row's
                              * screenshot the 24rem track and its prose the 1fr one.
                              * Row 02 rendered a 2432px shot into 384px of cell — the
                              * width `shotSources` sizes the whole ladder against is
                              * 1216 — and nothing in that window was legible.
                              */}
                            <div
                                className={`lg:grid lg:items-stretch ${
                                    isEven
                                        ? 'lg:grid-cols-[1fr_minmax(0,24rem)] lg:[&>*:first-child]:order-2'
                                        : 'lg:grid-cols-[minmax(0,24rem)_1fr]'
                                }`}
                            >
                                <div className="p-6 sm:p-8 lg:p-10">
                                    <p
                                        className="font-mono text-xs font-semibold tracking-widest text-primary-strong"
                                        aria-hidden="true"
                                    >
                                        {row.index}
                                    </p>
                                    <h3 className="mt-3 text-lg font-semibold">{row.title}</h3>
                                    <p className="mt-3 text-sm text-muted-foreground text-pretty">
                                        {row.body}
                                    </p>

                                    <Ledger className="mt-6 -mx-6 border-t border-rule sm:-mx-8 lg:-mx-10">
                                        {row.rows.map((item) => (
                                            <LedgerRow key={item.label} label={item.label}>
                                                {item.value}
                                            </LedgerRow>
                                        ))}
                                    </Ledger>
                                </div>

                                <div
                                    className={`relative overflow-hidden ${isEven ? SHOT_BORDER_EVEN : SHOT_BORDER_ODD}`}
                                >
                                    <ThemedImage
                                        light={shotSources(row.shot.name, 'light')}
                                        dark={shotSources(row.shot.name, 'dark')}
                                        alt={row.shot.alt}
                                        width={2432}
                                        height={1385}
                                        sizes="(min-width: 1024px) 1216px, 100vw"
                                        className={`lg:w-[145%] lg:max-w-none ${row.shot.anchor === 'right' ? 'lg:-translate-x-[31%]' : ''}`}
                                    />
                                </div>
                            </div>
                            <FullLine />
                        </div>
                    );
                })}
            </Container>

            <Container>
                {/*
                  * The 17-word subtitle under this heading is gone. It said
                  * each item is "usually a separate tool, a paid add-on, or a
                  * command you have to remember", which is the heading's own
                  * claim written out a second time.
                  */}
                <h3 className="px-4 py-4 text-lg font-semibold">Six more things you would expect to pay for.</h3>
            </Container>
            <FullLine />
            <Container>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {DEPTH_ITEMS.map((item, i) => (
                        <GridCell
                            key={item.title}
                            className={`p-6 transition-colors sm:p-8 ${cellBorders(i, DEPTH_COLS, DEPTH_ITEMS.length)}`}
                        >
                            <h4 className="text-base font-semibold">{item.title}</h4>
                            <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                        </GridCell>
                    ))}
                </div>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
