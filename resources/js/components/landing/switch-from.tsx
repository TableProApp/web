import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { cellBorders, type ColumnMap } from '@/components/ui/grid-cell';
import SectionShell from '@/components/ui/section-shell';
import CompareTable from '@/components/landing/compare-table';

const COLS: ColumnMap = { base: 2, sm: 3, lg: 6 };

interface ImportSource {
    name: string;
    /** Where the credentials are read from. */
    source: string;
    note?: string;
}

/**
 * No competitor logo assets exist in this repo, so every cell is typographic:
 * the name, then where the credentials come from, then any qualifier.
 */
const SOURCES: ImportSource[] = [
    { name: 'TablePlus', source: 'Keychain', note: 'incl. Setapp edition' },
    { name: 'Sequel Ace', source: 'Keychain' },
    { name: 'DBeaver', source: 'config file', note: 'any edition' },
    { name: 'DataGrip', source: 'Keychain or c.kdbx' },
    { name: 'Beekeeper Studio', source: 'app.db', note: 'incl. SSH bastions' },
    { name: 'Navicat', source: 'exported .ncx' },
];

/**
 * Migration and the comparison, under one H2.
 *
 * These were adjacent sections making one argument — leaving your current
 * client is cheap, and here is why you would — over the same four competitors,
 * and each paid a full header stack for it: an eyebrow, a two-line H2, a lede
 * and four rules, about 200px of chrome before either artifact appeared.
 * `CompareTable` is headless now and renders below the import grid under an H3
 * that still carries the competitor names and the `#compare` anchor.
 *
 * No competitor chip row. This used to close with ten links to /compare/*, ten
 * routes out of the page at the moment the reader has been told that moving
 * costs them nothing. The table below links four of them with better anchor
 * text and the footer carries all eleven.
 */
export default function SwitchFrom() {
    return (
        <SectionShell
            tier="reference"
            tone="raised"
            id="switch"
            label="Migration"
            headline="Import your connections from TablePlus or DBeaver."
            headlineMuted="Passwords, tunnels and SSL included."
            lede="The source app does not need to be running, and groups carry over. Or point TablePro at a project folder and it reads your .env."
        >
            <FullLine />
            <Container>
                <h3 className="sr-only">Import sources</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                    {SOURCES.map((source, i) => (
                        <div key={source.name} className={`p-5 ${cellBorders(i, COLS, SOURCES.length)}`}>
                            <p className="text-sm font-semibold">{source.name}</p>
                            <p className="mt-2 font-mono text-2xs text-muted-foreground">{source.source}</p>
                            {source.note && (
                                <p className="mt-1 font-mono text-2xs text-muted-foreground">{source.note}</p>
                            )}
                        </div>
                    ))}
                </div>
            </Container>
            <FullLine />

            <CompareTable />
        </SectionShell>
    );
}
