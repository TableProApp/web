import { ReactNode } from 'react';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { CELL_DENSITY, cellBorders, type ColumnMap } from '@/components/ui/grid-cell';
import Kbd from '@/components/ui/kbd';
import SectionShell from '@/components/ui/section-shell';

const COLS: ColumnMap = { base: 1, sm: 3 };


const STRIP_LABEL_CLASS = 'px-4 py-3 font-mono text-2xs font-semibold tracking-widest text-muted-foreground uppercase';

interface Material {
    label: string;
    body: ReactNode;
}

/** Part A. Named parts, not adjectives: every item here is checkable. */
const MATERIALS: Material[] = [
    {
        label: 'UI',
        body: (
            <>
                SwiftUI and AppKit. Every query tab is a real NSWindow tab in a system tab group, so you can drag one
                out to its own window, merge windows back together and cycle with <Kbd>⌃⇥</Kbd>.
            </>
        ),
    },
    {
        label: 'Drivers',
        body: 'libpq, libmariadb, hiredis, libmongoc, libcassandra, FreeTDS, OracleNIO. Teradata and Trino speak their wire protocols in pure Swift. No JDBC jar, no ODBC bridge, anywhere.',
    },
    {
        label: 'Bundle',
        body: 'About 20 MB, in separate Apple Silicon and Intel builds. No Java, no .NET, no Node. Plugins load over a Library Evolution stable ABI, so an app update never breaks a driver.',
    },
];

interface Behaviour {
    title: string;
    body: string;
}

/** Part B. Consequences of Part A, in the order you would meet them. */
const BEHAVIOURS: Behaviour[] = [
    {
        title: 'Results before metadata',
        body: 'Rows appear as soon as they come back. Column metadata loads behind them, so a slow remote database no longer costs you a multi-second wait before you see anything.',
    },
    {
        title: 'Hiding a column makes the table load faster',
        body: 'A hidden column is not fetched at all. Hide a large TEXT or BLOB column and the query gets smaller. Widths, order and hidden state are remembered per table, scoped to connection, database and schema.',
    },
    {
        title: 'No accidental COUNT(*)',
        body: 'Above the row-count threshold, which defaults to 100,000, the pager shows an estimated total instead of running a full count against a large table.',
    },
];


export default function Architecture() {
    return (
        <SectionShell
            id="speed"
            label="Architecture"
            headline="Written in Swift."
            headlineMuted="Not in a browser."
            lede="SwiftUI and AppKit for the interface, native C client libraries for the wire protocols. There is nothing to bootstrap before the first window appears."
        >
            <FullLine />
            <Container>
                <p className="max-w-4xl px-4 py-5 text-base text-muted-foreground text-pretty">
                    Native macOS database clients come in three shapes today. Single database and open source, like
                    Sequel Ace and Postico. Multi database and closed source, like TablePlus. Multi database but not
                    native, like DBeaver on the JVM or Beekeeper Studio and DBGate on Electron.{' '}
                    <span className="text-foreground">
                        TablePro is the fourth: native, multi database, and open source.
                    </span>
                </p>
            </Container>
            <FullLine />


            <Container>
                <h3 className={STRIP_LABEL_CLASS}>Bill of materials</h3>
            </Container>
            <FullLine />
            <Container>
                <div className="grid grid-cols-1 sm:grid-cols-3">
                    {MATERIALS.map((material, i) => (
                        <div
                            key={material.label}
                            className={`${CELL_DENSITY.default} ${cellBorders(i, COLS, MATERIALS.length)} border-rule`}
                        >
                            <h4 className="font-mono text-2xs font-semibold tracking-widest text-primary-strong uppercase">
                                {material.label}
                            </h4>
                            <p className="mt-3 text-sm text-muted-foreground text-pretty">
                                {material.body}
                            </p>
                        </div>
                    ))}
                </div>
            </Container>
            <FullLine />

            <Container>
                <h3 className={STRIP_LABEL_CLASS}>Speed you notice on day two</h3>
            </Container>
            <FullLine />
            <Container>
                <div className="grid grid-cols-1 sm:grid-cols-3">
                    {BEHAVIOURS.map((behaviour, i) => (
                        <div
                            key={behaviour.title}
                            className={`${CELL_DENSITY.default} ${cellBorders(i, COLS, BEHAVIOURS.length)} border-rule`}
                        >
                            <h4 className="text-base font-semibold text-pretty">{behaviour.title}</h4>
                            <p className="mt-3 text-sm text-muted-foreground text-pretty">
                                {behaviour.body}
                            </p>
                        </div>
                    ))}
                </div>
            </Container>
            <FullLine />

            <Container>
                <p className="p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                    DBeaver runs on Linux and Windows and speaks far more engines over JDBC. DataGrip is part of a
                    JetBrains subscription and understands your codebase. If that is what you need, use those.
                </p>
            </Container>
            <FullLine />

        </SectionShell>
    );
}
