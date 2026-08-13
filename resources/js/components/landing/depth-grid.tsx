import { ReactNode } from 'react';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import SectionShell from '@/components/ui/section-shell';
import { cellBorders, GridCell, type ColumnMap } from '@/components/ui/grid-cell';

/** 12 items divide evenly into 1, 2 and 3 columns, so no filler cells are needed. */
const COLS: ColumnMap = { base: 1, sm: 2, lg: 3 };

interface DepthItem {
    title: string;
    /** One sentence. A node only where the copy carries an inline mono token. */
    body: ReactNode;
    /** Rendered mono already, so shortcuts and identifiers stay plain text. */
    spec: string;
}

function Mono({ children }: { children: ReactNode }) {
    return <span className="font-mono text-[0.9em]">{children}</span>;
}

const ITEMS: DepthItem[] = [
    {
        title: 'ER diagram',
        body: 'Automatic two-dimensional layout that groups tables by foreign key instead of stacking one tall column.',
        spec: "crow's foot from PKs and unique indexes · junction tables collapse · export PNG or CREATE TABLE",
    },
    {
        title: 'EXPLAIN, visualized',
        body: 'Three views of the plan: a cost-coloured diagram, an expandable tree, and the raw text.',
        spec: '⌘⌥E · ClickHouse Plan/Pipeline/AST · Trino Logical/Distributed/IO · BigQuery dry-run cost',
    },
    {
        title: 'Server dashboard',
        body: 'Active sessions, per-engine metrics and slow queries, with Cancel Query and Terminate Session behind a confirmation.',
        spec: 'pg_cancel_backend and KILL QUERY · slow = over 1s · refresh 1s to 30s, default 5s',
    },
    {
        title: 'Users and roles',
        body: 'Grant and revoke without hand-writing GRANT, from the server down to a single column.',
        spec: 'MySQL, MariaDB, PostgreSQL, PGlite · staged as a diff · PostgreSQL applies in one transaction',
    },
    {
        title: 'Vim mode',
        body: (
            <>
                Six modes with the full motion and operator set, so <Mono>:w</Mono> runs the query.
            </>
        ),
        spec: 'counts, text objects, registers "a to "z, marks, macros capped at 50 recursions',
    },
    {
        title: 'Query history',
        body: 'Every query you run is saved, successful or not, and searchable.',
        spec: 'local SQLite with an FTS5 index · 10,000 entries, 90 days, both configurable · ⌘Y',
    },
    {
        title: 'Quick Switcher',
        body: 'Fuzzy search across tables, databases, saved queries and history, ranked by frecency.',
        spec: '⌘⇧O · four scopes on ⌘1 to ⌘4 · ⌘K switches database, and says Keyspace on Cassandra',
    },
    {
        title: 'CSV inspector',
        body: (
            <>
                Open a <Mono>.csv</Mono> or <Mono>.tsv</Mono> as a document, with no scratch database and no import
                step.
            </>
        ),
        spec: 'detects delimiter, encoding and line ending · split by regex, merge columns · saves byte-faithfully',
    },
    {
        title: 'Import and export',
        body: 'Five export formats, streaming at constant memory with no row limit, written atomically.',
        spec: 'CSV, JSON, SQL, MQL, XLSX · imports SQL, JSON, CSV with rollback, commit or skip',
    },
    {
        title: 'Connection import',
        body: 'Bring your connections from six other clients, passwords and tunnels included.',
        spec: 'TablePlus, Sequel Ace, DBeaver, DataGrip, Beekeeper Studio, Navicat · source app need not be running',
    },
    {
        title: 'Backup and restore',
        body: "PostgreSQL and Redshift dumps through the connection's existing SSH tunnel.",
        spec: 'pg_dump -Fc · live byte counter · restore runs --no-owner --no-acl',
    },
    {
        title: 'Plugins and themes',
        body: 'Drivers install when you pick them and update without a restart.',
        spec: 'SHA-256 and code signature checked before load · staged updates · four built-in themes, more from the registry',
    },
];

/**
 * The long tail, kept to one flush grid so it reads as an index rather than
 * twelve more pitches. The mono ordinal is the only accent in each cell.
 */
export default function DepthGrid() {
    return (
        <SectionShell id="more" label="Depth" headline="Twelve more things" headlineMuted="you would expect to pay for.">
            <FullLine />
            <Container>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {ITEMS.map((item, i) => (
                        <GridCell
                            key={item.title}
                            className={`p-6 transition-colors hover:bg-gray-950/[2.5%] sm:p-8 dark:hover:bg-white/[2.5%] ${cellBorders(i, COLS, ITEMS.length)}`}
                        >
                            <p
                                className="font-mono text-xs font-semibold tabular-nums text-primary-strong"
                                aria-hidden="true"
                            >
                                {String(i + 1).padStart(2, '0')}
                            </p>
                            <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                            <p className="mt-4 font-mono text-xs leading-relaxed break-words text-muted-foreground">
                                {item.spec}
                            </p>
                        </GridCell>
                    ))}
                </div>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
