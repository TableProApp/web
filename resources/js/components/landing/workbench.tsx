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
        body: 'Tree-sitter highlighting, schema-aware autocomplete that resolves aliases through JOINs and CTEs from the first character, and multi-statement batches that run inside one transaction where the engine supports it. If statement three of five fails, the error names statement three and the whole batch rolls back.',
        shot: {
            name: 'sql-editor',
            alt: 'The SQL editor with a multi-statement query and its result tabs below.',
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
                value: '10,000 by default, 100 to 500,000. The SQL is never rewritten, so your own LIMIT always wins.',
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
        body: 'Edit cells inline with the right editor for the type: a calendar for timestamps, a searchable list of referenced values for foreign keys, a three-state checkbox for nullable booleans, multi-select for MySQL SET columns. Nothing reaches the database until you press Save.',
        shot: {
            name: 'data-grid',
            alt: 'The data grid with edited cells highlighted and a pending-changes count in the toolbar.',
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
        body: 'Thirteen providers, all bring your own key or your own account. Claude, OpenAI, Gemini, xAI, OpenRouter, GitHub Copilot, Cursor, OpenCode Zen, or fully local with Ollama, llama.cpp and MLX. Keys live in the macOS Keychain and are deleted with the provider.',
        shot: {
            name: 'ai-assistant',
            alt: 'The AI assistant showing a before and after diff of a rewritten query with numbered explanation steps.',
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
            { label: 'Apply', value: 'Nothing reaches your editor until you press Apply' },
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
        body: 'Three views of the plan: a cost-coloured diagram, an expandable tree, and the raw text.',
    },
    {
        title: 'Server dashboard',
        body: 'Active sessions, per-engine metrics and slow queries, with Cancel Query and Terminate Session behind a confirmation.',
    },
    {
        title: 'Users and roles',
        body: 'Grant and revoke without hand-writing GRANT, from the server down to a single column.',
    },
    {
        title: 'Quick Switcher',
        body: 'Fuzzy search across tables, databases, saved queries and history, with the ones you use most at the top.',
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
                            <div
                                className={`lg:grid lg:grid-cols-[minmax(0,24rem)_1fr] lg:items-stretch ${
                                    isEven ? 'lg:[&>*:first-child]:order-2' : ''
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
                                        className={`lg:w-[145%] lg:max-w-none ${isEven ? 'lg:-translate-x-[31%]' : ''}`}
                                    />
                                </div>
                            </div>
                            <FullLine />
                        </div>
                    );
                })}
            </Container>

            <Container>
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
