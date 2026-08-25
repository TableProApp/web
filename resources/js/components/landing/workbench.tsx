import { ReactNode } from 'react';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { cellBorders, GridCell, ITEM_TITLE, PANEL_TITLE, type ColumnMap } from '@/components/ui/grid-cell';
import Kbd from '@/components/ui/kbd';
import { Ledger, LedgerRow } from '@/components/ui/ledger';
import SectionShell from '@/components/ui/section-shell';
import ThemedImage from '@/components/ui/themed-image';

interface Shot {
    /** Basename under `/images/features/`, without the theme suffix. */
    name: string;
    alt: string;
    /** Which edge of the capture stays in frame when it overflows its column. */
    anchor: 'left' | 'right';
}

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

function Mono({ children }: { children: ReactNode }) {
    return <span className="font-mono text-xs text-foreground/80">{children}</span>;
}

const SHOT_BORDER_ODD = 'border-rule max-lg:border-t lg:border-l';
const SHOT_BORDER_EVEN = 'border-rule max-lg:border-t lg:border-r';

/**
 * Three screenshots, each with one paragraph and a short ledger.
 *
 * The paragraphs used to carry three technical claims apiece in two sentences,
 * at 14px muted, above a ledger that made the same claims again in a form you
 * could actually scan. The ledger wins that fight every time: it is the artifact
 * and the paragraph is the caption. So each body says what the thing *is* and
 * stops, and anything specific enough to have a keystroke or a number attached
 * moved into a row.
 *
 * Row 02 also absorbed the three "what the numbers buy on day two" cells that
 * used to sit under the spec table behind an H3 of their own. All three were
 * about the data grid's loading behaviour, so they are rows on the data grid.
 */
const ROWS: Row[] = [
    {
        index: '01',
        title: 'SQL Editor',
        body: 'Autocomplete resolves aliases through JOINs and CTEs. A batch runs in one transaction.',
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
                label: 'Rollback',
                value: 'A failed statement is named, and the batch rolls back.',
            },
            {
                label: 'Row cap',
                value: '10,000 by default, up to 500,000. Your own LIMIT wins.',
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
        body: 'Every column type gets its own editor. Nothing lands until you press Save.',
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
                        <Kbd>⌘S</Kbd> saves. <Kbd>⌘⇧P</Kbd> shows the parameterized SQL first.
                    </>
                ),
            },
            {
                label: 'Loading',
                value: 'Rows arrive before metadata, and a hidden column is never fetched.',
            },
            {
                label: 'Paging',
                value: 'Past 100,000 rows the pager estimates instead of counting.',
            },
            { label: 'Copy as', value: 'CSV, JSON, Markdown, IN clause, INSERT, UPDATE' },
        ],
    },
    {
        index: '03',
        title: 'AI Assistant',
        body: 'Explain a query, optimize it, or fix one that failed.',
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
                        <Kbd>⌘L</Kbd>. <Kbd>⌘⌥L</Kbd> optimizes. A failed query grows a Fix button.
                    </>
                ),
            },
            { label: 'Apply', value: 'Arrives as a diff. Nothing lands until you press Apply.' },
        ],
    },
];

const DEPTH_ITEMS: { title: string; body: ReactNode }[] = [
    {
        title: 'EXPLAIN, visualized',
        body: 'A cost-coloured diagram, an expandable tree, the raw text.',
    },
    {
        title: 'Server dashboard',
        body: 'Sessions, per-engine metrics and slow queries.',
    },
    {
        title: 'Users and roles',
        body: 'Grant and revoke down to a single column, without writing GRANT.',
    },
    {
        title: 'Quick Switcher',
        body: 'Fuzzy search across tables, queries and history, most-used first.',
    },
    {
        title: 'CSV inspector',
        body: (
            <>
                Open a <Mono>.csv</Mono> or <Mono>.tsv</Mono> as a document. No import step.
            </>
        ),
    },
    {
        title: 'Backup and restore',
        body: "PostgreSQL and Redshift dumps, through the existing SSH tunnel.",
    },
];

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
                            {/* Text and shot swap sides each row; the shot bleeds off the outer edge. */}
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
                                    <h3 className={`mt-4 ${PANEL_TITLE}`}>{row.title}</h3>
                                    <p className="mt-3 max-w-[46ch] text-base text-muted-foreground text-pretty">
                                        {row.body}
                                    </p>

                                    <Ledger className="mt-8 -mx-6 border-t border-rule sm:-mx-8 lg:-mx-10">
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
                {/* The long tail, headed rather than listed, so it reads as a boundary. */}
                <h3 className="px-4 py-5 text-lg font-semibold sm:py-6">
                    Six more things you would expect to pay for.
                </h3>
            </Container>
            <FullLine />
            <Container>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {DEPTH_ITEMS.map((item, i) => (
                        <GridCell
                            key={item.title}
                            density="default"
                            className={`transition-colors ${cellBorders(i, DEPTH_COLS, DEPTH_ITEMS.length)}`}
                        >
                            <h4 className={ITEM_TITLE}>{item.title}</h4>
                            <p className="mt-3 text-sm text-muted-foreground text-pretty">{item.body}</p>
                        </GridCell>
                    ))}
                </div>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
