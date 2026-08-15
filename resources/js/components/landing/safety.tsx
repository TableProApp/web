import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { cellBorders, GridCell, type ColumnMap } from '@/components/ui/grid-cell';
import SectionShell from '@/components/ui/section-shell';

interface SafeModeLevel {
    name: string;
    write: string;
    read: string;
    auth: string;
    /** 0 to 1. Opacity of the row's left accent bar. */
    accent: number;
}

/** Order matters: this is the ladder, loosest first. */
const LEVELS: SafeModeLevel[] = [
    { name: 'Silent (default)', write: 'runs', read: 'runs', auth: 'none', accent: 0 },
    { name: 'Alert', write: 'confirmation', read: 'runs', auth: 'none', accent: 0 },
    { name: 'Alert (Full)', write: 'confirmation', read: 'confirmation', auth: 'none', accent: 0.2 },
    { name: 'Safe Mode', write: 'confirmation and Touch ID', read: 'runs', auth: 'Touch ID', accent: 0.4 },
    {
        name: 'Safe Mode (Full)',
        write: 'confirmation and Touch ID',
        read: 'confirmation and Touch ID',
        auth: 'Touch ID',
        accent: 0.6,
    },
    { name: 'Read-Only', write: 'blocked', read: 'runs', auth: 'none', accent: 1 },
];

/**
 * Written out literally, one entry per level, so Tailwind's source scan finds
 * every class. The tint grows with the accent bar down the ladder.
 */
const ROW_TINT = ['', '', '', 'bg-primary/[0.02]', 'bg-primary/[0.04]', 'bg-primary/[0.06]'] as const;

const COLUMNS = ['Level', 'Write', 'Read', 'Auth'] as const;

const TRUST_COLS: ColumnMap = { base: 1, sm: 3 };

const TRUST_CELLS: { label: string; body: string }[] = [
    {
        label: 'Credentials',
        body: 'Connection passwords, SSH passphrases, TOTP secrets and AI keys go to the macOS Keychain. Or they never live in TablePro at all: a connection can resolve its password at connect time from a file, an environment variable, a shell command, 1Password, HashiCorp Vault or AWS Secrets Manager.',
    },
    {
        label: 'Network',
        body: 'There is no account, no login and no cloud service in the connection path. Anonymous usage data is a single switch in Settings and carries no personal data and no queries. AI runs against the provider you configured, or entirely on your machine with Ollama, llama.cpp or MLX.',
    },
    {
        label: 'Getting there',
        body: 'A built-in libssh2 client with five auth methods and jump hosts chained in process, no ssh binary. Or Cloudflare Tunnel, Cloud SQL Auth Proxy, or SOCKS5 with DNS always resolved at the proxy. Five TLS modes with per-driver defaults. AWS IAM tokens are valid fifteen minutes and never stored.',
    },
];

const HEAD_CELL =
    'px-4 py-3 text-left font-mono text-[11px] font-semibold tracking-widest text-muted-foreground uppercase';
const BODY_CELL = 'px-4 py-3 align-top text-sm text-muted-foreground';

export default function Safety() {
    return (
        <SectionShell
            id="safety"
            label="Safe Mode"
            headline="Six levels between you and production."
            headlineMuted="Set per connection."
            lede="Even at the loosest setting, DROP, TRUNCATE and a DELETE with no WHERE clause stop and ask."
        >
            <FullLine />
            <Container>
                {/*
                 * The table keeps its own horizontal scroll below md so the four
                 * columns never widen the page. FullLine stays outside it, since
                 * its 200vw bleed would add scroll width in here.
                 */}
                <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Safe Mode levels">
                    <table className="w-full min-w-[38rem] border-collapse">
                        <caption className="sr-only">Safe Mode levels and their behaviour</caption>
                        <thead>
                            <tr className="border-b border-gray-950/5 dark:border-white/10">
                                {COLUMNS.map((column) => (
                                    <th key={column} scope="col" className={HEAD_CELL}>
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {LEVELS.map((level, i) => (
                                <tr
                                    key={level.name}
                                    className={`border-b border-gray-950/5 last:border-b-0 dark:border-white/10 ${ROW_TINT[i]}`}
                                >
                                    <th
                                        scope="row"
                                        className="relative px-4 py-3 text-left align-top text-sm font-semibold whitespace-nowrap text-foreground"
                                    >
                                        {level.accent > 0 && (
                                            <span
                                                className="absolute inset-y-0 left-0 w-0.5 bg-primary"
                                                style={{ opacity: level.accent }}
                                                aria-hidden="true"
                                            />
                                        )}
                                        {level.name}
                                    </th>
                                    <td className={BODY_CELL}>{level.write}</td>
                                    <td className={BODY_CELL}>{level.read}</td>
                                    <td className={BODY_CELL}>{level.auth}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Container>
            <FullLine />

            <Container>
                <p className="px-4 py-3 text-sm text-muted-foreground">
                    Read-Only disables the interface, not just the query: no inline editing, no add or delete rows, no
                    truncate, no drop, no import. The toolbar badge shows the level and changes it in one click. Opening
                    a project folder whose path, host or database name contains &ldquo;prod&rdquo;,
                    &ldquo;production&rdquo; or &ldquo;live&rdquo; raises the level to Alert automatically.
                </p>
            </Container>
            <FullLine />

            <Container>
                <div className="grid grid-cols-1 sm:grid-cols-3">
                    {TRUST_CELLS.map((cell, i) => (
                        <GridCell
                            key={cell.label}
                            className={`p-4 sm:p-6 ${cellBorders(i, TRUST_COLS, TRUST_CELLS.length)}`}
                        >
                            <h3 className="font-mono text-[11px] font-semibold tracking-widest text-primary-strong uppercase">
                                {cell.label}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{cell.body}</p>
                        </GridCell>
                    ))}
                </div>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
