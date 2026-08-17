import Container from '@/components/ui/container';
import DataTable, { TABLE_COLUMN_RULE, TABLE_ROW_RULE } from '@/components/ui/data-table';
import { FullLine } from '@/components/ui/full-line';
import SectionShell from '@/components/ui/section-shell';
import { getComparisonBySlug, type ComparisonInfo } from '@/data/comparisons';

/**
 * Three competitors, one per runtime: a JVM desktop app, a JVM IDE, and an
 * Electron app. The point of the table is the category, not the vendor, which
 * is also the shape least likely to compete with the ten /compare/* pages that
 * each own their competitor's name.
 *
 * TablePlus is deliberately absent. /compare/tableplus returns 410, and
 * StaleClaimsTest fails the build on any landing component that links it. It
 * appears in SwitchFrom as an import source only.
 */
const SLUGS = ['dbeaver', 'datagrip', 'beekeeper-studio'] as const;

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
        return comparison.benchmarks?.[side][metric.benchmark] ?? '';
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
        <SectionShell
            tier="reference"
            tone="raised"
            id="compare"
            label="Comparison"
            headline="TablePro, DBeaver, DataGrip and Beekeeper Studio."
            headlineMuted="Startup, memory, runtime and price."
        >
            <FullLine />
            <Container>
                {/*
                  * The scrolling-table pattern from safety.tsx: the region is
                  * focusable and labelled because it scrolls and holds links,
                  * and FullLine stays outside it, since its 200vw bleed would
                  * add scroll width in here.
                  */}
                <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="TablePro compared with three other clients">
                    <DataTable
                        className="min-w-[40rem]"
                        caption="Cold start, idle memory, runtime and price, compared across TablePro, DBeaver, DataGrip and Beekeeper Studio."
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

            <Container>
                <p className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    Every competitor figure comes from its own comparison page, which is where the version tested is
                    written down.
                </p>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
