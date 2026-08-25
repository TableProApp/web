import { ReactNode } from 'react';
import Container from '@/components/ui/container';
import DataTable, { TABLE_COLUMN_RULE, TABLE_ROW_RULE } from '@/components/ui/data-table';
import { FullLine } from '@/components/ui/full-line';
import { CELL_DENSITY, cellBorders, type ColumnMap } from '@/components/ui/grid-cell';
import SectionShell from '@/components/ui/section-shell';

const BEHAVIOUR_COLS: ColumnMap = { base: 1, sm: 3 };

interface Behaviour {
    title: string;
    body: string;
}

/**
 * Consequences of what the table measures, in the order you would meet them.
 *
 * Relocated from `architecture.tsx`, which was 321 words of prose with no data
 * artifact of its own, an H2 that restated the H1 and a closing paragraph that
 * recommended two competitors. These three cells were the only content in it a
 * competitor could not also claim, and they belong under the numbers that
 * explain them rather than under a second headline about Swift.
 */
const BEHAVIOURS: Behaviour[] = [
    {
        title: 'Results before metadata',
        body: 'Rows appear as soon as they come back. Column metadata loads in behind them.',
    },
    {
        title: 'Hiding a column makes the table load faster',
        body: 'A hidden column is not fetched at all. Widths, order and hidden state are remembered per table.',
    },
    {
        title: 'No accidental COUNT(*)',
        body: 'Past 100,000 rows the pager estimates the total instead of counting the whole table.',
    },
];

interface Props {
    latestRelease?: { version: string | null; publishedAt: string | null; countLast30Days: number | null } | null;
    /** DMG downloads, and how many releases that figure was counted over. */
    downloads?: { total: number | null; releases: number } | null;
}

const GITHUB_REPO_URL = 'https://github.com/TableProApp/TablePro';

interface Spec {
    label: string;
    /** The SQL type the value would have. Carries the metric's unit for free. */
    type: string;
    value: string;
    sub?: ReactNode;
    /** Right-aligned, tabular. Set on anything that is a quantity. */
    numeric?: boolean;
}

function formatReleaseDate(iso: string): string {
    const parsed = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    return parsed.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

/**
 * The page's proof section: what the app costs to run, as a result set.
 *
 * This used to render under a bare `aria-label` with no heading, which made it
 * decoration. A magnitude with an `aria-label` is not citable by anything —
 * a reader scanning headings never meets it, and an answer engine has no
 * statement to lift. It carries an H2 now, and a stated measurement basis,
 * which is the one thing on this page no competitor can copy.
 *
 * This is a real `<table>` rather than six divs, and the change is not
 * cosmetic: a flat run of divs gives a screen reader no header association at
 * all, so the numbers arrived as an unlabelled stream. `th scope="col"` plus a
 * caption is strictly better, and it happens to be the most on-brand element
 * the page can carry — a database client's own result grid, with the column
 * types spelled out.
 *
 * Below `lg` the row transposes to label/value pairs rather than scrolling.
 * Six columns need about 170px each before the 24px value and its 11px
 * subtitle stop wrapping, which is why the wide form waits for lg — the
 * grid this replaced reached six columns at exactly the same breakpoint.
 * Adding a fifth unlabelled scroll container while the rest of this work is
 * busy labelling the two that exist would be a poor trade.
 */
export default function SpecStrip({ latestRelease, downloads }: Props) {
    const specs: Spec[] = [
        { label: 'databases', type: 'int', value: '25', sub: '9 bundled · 16 on demand', numeric: true },
        /*
         * The subs say how each number was produced, not what it proves.
         * "Nothing to bootstrap" and "No JVM, no Chromium" were the third and
         * fourth statements of the no-runtime claim; the headline above carries
         * it once, and a measured figure is worth more with a method than with
         * a slogan.
         */
        { label: 'cold_start', type: 'interval', value: 'Under 1s', sub: 'Cold, to first window', numeric: true },
        { label: 'idle_rss', type: 'bytes', value: '~80 MB', sub: 'One connection, open and idle', numeric: true },
        /*
         * Download count, not download size. The size is already in the hero
         * fine print and again in the closing call to action, and a third copy
         * bought nothing; an adoption number is the most persuasive thing this
         * slot can hold and it costs no new request — the controller was
         * already fetching it and throwing it away.
         *
         * Falls back to the size when the GitHub API is unreachable, so the
         * table never renders a hole.
         */
        downloads?.total
            ? {
                label: 'downloads',
                type: 'int',
                value: downloads.total.toLocaleString('en-US'),
                sub: `Across ${downloads.releases} releases`,
                numeric: true,
            }
            : { label: 'download', type: 'bytes', value: '~20 MB', sub: 'Apple Silicon or Intel', numeric: true },
        {
            label: 'license',
            type: 'text',
            value: 'AGPLv3',
            sub: (
                <a
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 transition-colors hover:text-foreground"
                >
                    Read the source &rarr;
                </a>
            ),
        },
        {
            label: 'latest',
            type: 'version',
            value: latestRelease?.version ? `v${latestRelease.version}` : 'Shipping',
            /*
             * The cadence lives here now. It used to render as its own
             * paragraph below this table — "{n} releases in the last thirty
             * days. Development happens in the open on GitHub." — and again,
             * from the same prop, roughly two thousand words later in the
             * open-source section. Same sentence, twice, one page.
             */
            sub: [
                latestRelease?.publishedAt ? formatReleaseDate(latestRelease.publishedAt) : 'Weekly releases',
                latestRelease?.countLast30Days ? `${latestRelease.countLast30Days} releases in 30 days` : null,
            ]
                .filter(Boolean)
                .join(' · '),
        },
    ];

    return (
        <SectionShell
            id="specs"
            label="Specification"
            headline="Written in Swift, not in Electron."
            headlineMuted="Here is what that costs to run."
        >
            <FullLine />
            <Container>
                <DataTable
                    className="table-fixed"
                    caption="TablePro in numbers: database count, cold start, idle memory, download size, license and latest release."
                >

                    {/*
                      * Column separators take the strong weight and the single
                      * row separator takes the hairline, because that is how a
                      * grid draws: columns are stable structure, rows are data.
                      */}
                    <thead>
                        <tr>
                            {specs.map((spec) => (
                                <th
                                    key={spec.label}
                                    scope="col"
                                    className={`max-lg:hidden border-r ${TABLE_COLUMN_RULE} p-4 text-left align-bottom font-normal last:border-r-0 sm:p-6`}
                                >
                                    <span className="block font-mono text-2xs tracking-widest text-muted-foreground uppercase">
                                        {spec.label}
                                    </span>
                                    <span className="mt-1 block font-mono text-2xs text-muted-foreground-subtle">
                                        {spec.type}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        <tr className={`max-lg:hidden border-t ${TABLE_ROW_RULE}`}>
                            {specs.map((spec) => (
                                <td
                                    key={spec.label}
                                    className={`border-r ${TABLE_COLUMN_RULE} p-4 align-top last:border-r-0 sm:p-6 ${
                                        spec.numeric ? 'tabular-nums slashed-zero' : ''
                                    }`}
                                >
                                    <span className="block text-2xl font-bold sm:text-3xl">{spec.value}</span>
                                    {spec.sub && (
                                        <span className="mt-1 block font-mono text-2xs text-muted-foreground">
                                            {spec.sub}
                                        </span>
                                    )}
                                </td>
                            ))}
                        </tr>

                        {/* Transposed below sm: one row per metric, header in the row. */}
                        {specs.map((spec) => (
                            <tr key={spec.label} className="border-t border-rule lg:hidden">
                                <th scope="row" className="p-4 text-left align-top font-normal">
                                    <span className="block font-mono text-2xs tracking-widest text-muted-foreground uppercase">
                                        {spec.label}
                                    </span>
                                    <span className="mt-1 block font-mono text-2xs text-muted-foreground-subtle">
                                        {spec.type}
                                    </span>
                                </th>
                                <td
                                    className={`p-4 text-right align-top ${
                                        spec.numeric ? 'tabular-nums slashed-zero' : ''
                                    }`}
                                >
                                    <span className="block text-2xl font-bold">{spec.value}</span>
                                    {spec.sub && (
                                        <span className="mt-1 block font-mono text-2xs text-muted-foreground">
                                            {spec.sub}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
            </Container>
            <FullLine />

            {/*
              * The measurement basis. A stated method is what separates a
              * number from a slogan, and it is the most falsifiable sentence on
              * the page — which is exactly why it is worth the twenty-five
              * words. If a figure cannot be reproduced here, delete it rather
              * than soften it into an adjective.
              */}
            <Container>
                <p className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    Measured on an M4 MacBook Pro, macOS 27: cold launch to first window, one PostgreSQL connection
                    open.
                </p>
            </Container>
            <FullLine />

            {/*
              * The only social proof on this page, and every word of it is
              * somebody else's judgement rather than ours — which is the whole
              * point. It is linked so a reader can check it in one click.
              *
              * Written as fine print on purpose. A trophy row would be louder
              * than the numbers above it, and the numbers are the argument.
              */}
            <Container>
                <p className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    <a
                        href="https://trendshift.io/repositories/24114"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                        #1 on GitHub Trending
                    </a>{' '}
                    on 23 March 2026, and Trendshift&rsquo;s #1 Swift repository that week.
                </p>
            </Container>
            <FullLine />

            <Container>
                <h3 className="px-4 py-3 font-mono text-2xs font-semibold tracking-widest text-muted-foreground uppercase">
                    What the numbers buy on day two
                </h3>
            </Container>
            <FullLine />
            <Container>
                <div className="grid grid-cols-1 sm:grid-cols-3">
                    {BEHAVIOURS.map((behaviour, i) => (
                        <div
                            key={behaviour.title}
                            className={`${CELL_DENSITY.default} ${cellBorders(i, BEHAVIOUR_COLS, BEHAVIOURS.length)} border-rule`}
                        >
                            <h4 className="text-base font-semibold text-pretty">{behaviour.title}</h4>
                            <p className="mt-3 text-sm text-muted-foreground text-pretty">{behaviour.body}</p>
                        </div>
                    ))}
                </div>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
