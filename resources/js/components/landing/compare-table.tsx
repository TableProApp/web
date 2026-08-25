import Container from '@/components/ui/container';
import FootNote from '@/components/ui/footnote';
import DataTable, { TABLE_COLUMN_RULE, TABLE_ROW_RULE } from '@/components/ui/data-table';
import { FullLine } from '@/components/ui/full-line';
import { getComparisonBySlug, type ComparisonInfo } from '@/data/comparisons';

/**
 * Four competitors: a JVM desktop app, a JVM IDE, an Electron app, and the one
 * other native Mac client. The first three lose the runtime argument on the
 * Technology row; TablePlus does not, and that is the honest reason it is here.
 * Against TablePlus the row that separates the two is Price.
 *
 * Ordered so the runtime contrast reads first and the like-for-like comparison
 * closes it.
 *
 * Headless since the merge. This was a section of its own directly below
 * Migration, listing the same competitor set for a different question — two
 * full header stacks, eyebrow through lede plus four rules apiece, for one
 * argument. `switch-from.tsx` owns the shell now and renders this after its
 * import grid. The `#compare` anchor moved onto the H3, so nothing that
 * pointed at it breaks.
 */
const SLUGS = ['dbeaver', 'datagrip', 'beekeeper-studio', 'tableplus'] as const;

/**
 * Rendered where a competitor has no measurement for a metric.
 *
 * TablePlus ships without a `benchmarks` block, because it is native like
 * TablePro and nothing published about either app's cold start survives
 * scrutiny — the tidy figures in circulation trace back to competitor
 * comparison pages, this site's included. An em-dash and a footnote say "not
 * measured", which is true; a number here would not be.
 */
const UNMEASURED = '—';

interface Metric {
    label: string;
    /** Reads `benchmarks`, which owns the performance figures. */
    benchmark?: 'startup' | 'memory';
    /** Reads a `rows` entry by label, which owns everything else. */
    row?: string;
}

const METRICS: Metric[] = [
    { label: 'Cold start', benchmark: 'startup' },
    { label: 'Idle memory', benchmark: 'memory' },
    { label: 'Runtime', row: 'Technology' },
    { label: 'Price', row: 'Price' },
];

/**
 * Every value comes out of comparisons.json and none is retyped here — which
 * matters most for the Price row, because a price literal in a component is
 * exactly what CLAUDE.md forbids. TablePro's own column is identical across all
 * three entries, so it renders from the first.
 */
function valueFor(comparison: ComparisonInfo, metric: Metric, side: 'tablePro' | 'competitor'): string {
    if (metric.benchmark) {
        return comparison.benchmarks?.[side][metric.benchmark] ?? UNMEASURED;
    }

    const row = comparison.rows.find((candidate) => candidate.label === metric.row);
    const value = row?.[side];

    return typeof value === 'string' ? value : '';
}

const HEAD_CELL = 'p-4 text-center text-sm font-medium sm:p-5';
const BODY_CELL = 'p-4 text-center text-sm sm:p-5';

export default function CompareTable() {
    const entries = SLUGS.map((slug) => getComparisonBySlug(slug)).filter(
        (entry): entry is ComparisonInfo => entry !== undefined,
    );

    if (entries.length === 0) {
        return null;
    }

    return (
        <>
            <Container>
                {/*
                  * The four names are links in the table header directly below,
                  * so the heading spent nine words re-listing them. It says what
                  * the table measures instead.
                  */}
                <h3 id="compare" className="scroll-mt-20 px-4 py-5 text-lg font-semibold sm:py-6">
                    Cold start, memory, runtime and price.
                </h3>
            </Container>
            <FullLine />
            <Container>
                {/*
                  * The scrolling-table pattern from safety.tsx: the region is
                  * focusable and labelled because it scrolls and holds links,
                  * and FullLine stays outside it, since its 200vw bleed would
                  * add scroll width in here.
                  */}
                <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="TablePro compared with four other clients">
                    <DataTable
                        className="min-w-[48rem]"
                        caption="Cold start, idle memory, runtime and price, compared across TablePro, DBeaver, DataGrip, Beekeeper Studio and TablePlus."
                    >
                        <thead>
                            <tr>
                                <th scope="col" className="p-4 text-left text-sm font-medium text-muted-foreground sm:p-5">
                                    Metric
                                </th>
                                <th
                                    scope="col"
                                    className={`border-l ${TABLE_COLUMN_RULE} bg-primary/5 ${HEAD_CELL} font-bold text-primary-strong`}
                                >
                                    TablePro
                                </th>
                                {entries.map((entry) => (
                                    <th
                                        key={entry.slug}
                                        scope="col"
                                        className={`border-l ${TABLE_COLUMN_RULE} ${HEAD_CELL} text-muted-foreground`}
                                    >
                                        <a
                                            href={`/compare/${entry.slug}`}
                                            aria-label={`Compare TablePro and ${entry.name}`}
                                            className="underline underline-offset-4 transition-colors hover:text-foreground"
                                        >
                                            {entry.name}
                                        </a>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {METRICS.map((metric) => (
                                <tr key={metric.label} className={`border-t ${TABLE_ROW_RULE}`}>
                                    <th scope="row" className="p-4 text-left text-sm font-normal text-foreground sm:p-5">
                                        {metric.label}
                                    </th>
                                    <td
                                        className={`border-l ${TABLE_COLUMN_RULE} bg-primary/5 ${BODY_CELL} font-semibold text-foreground`}
                                    >
                                        {valueFor(entries[0], metric, 'tablePro')}
                                    </td>
                                    {entries.map((entry) => (
                                        <td
                                            key={entry.slug}
                                            className={`border-l ${TABLE_COLUMN_RULE} ${BODY_CELL} text-muted-foreground`}
                                        >
                                            {valueFor(entry, metric, 'competitor')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </DataTable>
                </div>
            </Container>
            <FullLine />

            <FootNote>
                Every competitor figure comes from its own comparison page, which names the version tested. TablePlus
                is native too, and unmeasured rather than estimated.
            </FootNote>
        </>
    );
}
