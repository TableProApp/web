import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { cellBorders, type ColumnMap } from '@/components/ui/grid-cell';
import { Ledger, LedgerRow } from '@/components/ui/ledger';
import SectionShell from '@/components/ui/section-shell';

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
 * Every comparison page that resolves. TablePlus is deliberately absent:
 * /compare/tableplus returns 410 Gone. It appears above as an import source
 * only, never as a link.
 */
const COMPARISONS: { name: string; slug: string }[] = [
    { name: 'DBeaver', slug: 'dbeaver' },
    { name: 'DataGrip', slug: 'datagrip' },
    { name: 'Navicat', slug: 'navicat' },
    { name: 'Beekeeper Studio', slug: 'beekeeper-studio' },
    { name: 'Sequel Pro', slug: 'sequel-pro' },
    { name: 'Postico', slug: 'postico' },
    { name: 'Sequel Ace', slug: 'sequel-ace' },
    { name: 'HeidiSQL', slug: 'heidisql' },
    { name: 'Azimutt', slug: 'azimutt' },
    { name: 'phpMyAdmin', slug: 'phpmyadmin' },
];

export default function SwitchFrom() {
    return (
        <SectionShell
            tier="reference"
            id="switch"
            label="Migration"
            headline="Bring your connections with you."
            headlineMuted="Passwords, tunnels and SSL included."
            lede="The source app does not even need to be running. Groups and folders carry over. Or point TablePro at a project folder and it reads the connection out of your .env, wp-config.php, schema.prisma, database.yml, docker-compose.yml, application.yml or appsettings.json without you copying anything by hand."
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

            <Container>
                <h3 className="sr-only">Comparisons</h3>
                <Ledger>
                    <LedgerRow label="Compare">
                        <span className="flex flex-wrap gap-x-2 gap-y-1">
                            {COMPARISONS.map((comparison) => (
                                <a
                                    key={comparison.slug}
                                    href={`/compare/${comparison.slug}`}
                                    className="rounded-key border border-rule-strong px-2 py-1 font-mono text-2xs whitespace-nowrap transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:border-primary/40 hover:text-foreground"
                                >
                                    {comparison.name}
                                </a>
                            ))}
                        </span>
                    </LedgerRow>
                </Ledger>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
