import { ReactNode } from 'react';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import SectionShell from '@/components/ui/section-shell';
import { cellBorders, GridCell, type ColumnMap } from '@/components/ui/grid-cell';

/** 6 items divide evenly into 1, 2 and 3 columns, so no filler cells are needed. */
const COLS: ColumnMap = { base: 1, sm: 2, lg: 3 };

interface DepthItem {
    title: string;
    /** One sentence. A node only where the copy carries an inline mono token. */
    body: ReactNode;
}

function Mono({ children }: { children: ReactNode }) {
    return <span className="font-mono text-[0.9em]">{children}</span>;
}

const ITEMS: DepthItem[] = [
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
        body: 'Fuzzy search across tables, databases, saved queries and history, ranked by frecency.',
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

/**
 * The long tail, kept to one flush grid so it reads as an index rather than
 * six more pitches. The mono ordinal is the only accent in each cell.
 *
 * Six, not twelve. Three of the originals repeated a section above — Vim mode
 * from the workbench ledger, connection import from the whole SwitchFrom
 * section, plugin verification from the database grid's own lede — and three
 * were table stakes every competitor also ships. What is left is the set a
 * reader could not assume.
 *
 * The `spec` line went with them. It carried shortcuts, thresholds and defaults
 * — genuinely useful, genuinely documentation, and roughly 250 words standing
 * between the reader and the next call to action.
 */
export default function DepthGrid() {
    return (
        <SectionShell tier="reference"
            tone="raised" id="more" label="Depth" headline="Six more things" headlineMuted="you would expect to pay for.">
            <FullLine />
            <Container>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {ITEMS.map((item, i) => (
                        <GridCell
                            key={item.title}
                            className={`p-6 transition-colors sm:p-8 ${cellBorders(i, COLS, ITEMS.length)}`}
                        >
                            <p
                                className="font-mono text-xs font-semibold tabular-nums text-primary-strong"
                                aria-hidden="true"
                            >
                                {String(i + 1).padStart(2, '0')}
                            </p>
                            <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                        </GridCell>
                    ))}
                </div>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
