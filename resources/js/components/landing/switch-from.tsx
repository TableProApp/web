import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { CELL_DENSITY, cellBorders, type ColumnMap } from '@/components/ui/grid-cell';
import SectionShell from '@/components/ui/section-shell';
import CompareTable from '@/components/landing/compare-table';

const COLS: ColumnMap = { base: 2, sm: 3, lg: 6 };

interface ImportSource {
    name: string;
    /**
     * Where the credentials come from, and any qualifier, as one line.
     *
     * These were two fields rendered as two more paragraphs under the name, so
     * six tiles emitted eighteen `<p>` elements — the highest paragraph count of
     * any section on the page, for eighteen fragments averaging three words.
     */
    source: string;
}

const SOURCES: ImportSource[] = [
    { name: 'TablePlus', source: 'Keychain, incl. Setapp' },
    { name: 'Sequel Ace', source: 'Keychain' },
    { name: 'DBeaver', source: 'Config file, any edition' },
    { name: 'DataGrip', source: 'Keychain or c.kdbx' },
    { name: 'Beekeeper Studio', source: 'app.db, incl. SSH bastions' },
    { name: 'Navicat', source: 'Exported .ncx' },
];

export default function SwitchFrom() {
    return (
        <SectionShell
            tier="reference"
            tone="raised"
            id="switch"
            label="Migration"
            headline="Import your connections from TablePlus or DBeaver."
            headlineMuted="Passwords, tunnels and SSL included."
            lede="The source app does not need to be running. Or point TablePro at a project folder and it reads your .env."
        >
            <FullLine />
            <Container>
                <h3 className="sr-only">Import sources</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                    {SOURCES.map((source, i) => (
                        <div key={source.name} className={`${CELL_DENSITY.compact} ${cellBorders(i, COLS, SOURCES.length)}`}>
                            <p className="text-sm font-semibold text-pretty">{source.name}</p>
                            <p className="mt-2 text-xs text-muted-foreground text-pretty">{source.source}</p>
                        </div>
                    ))}
                </div>
            </Container>
            <FullLine />

            <CompareTable />
        </SectionShell>
    );
}
