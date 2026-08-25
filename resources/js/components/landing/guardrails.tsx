import { useRef, useState } from 'react';
import { CodeBlock } from '@/components/ui/code';
import Container from '@/components/ui/container';
import CopyButton from '@/components/ui/copy-button';
import DataTable from '@/components/ui/data-table';
import FootNote from '@/components/ui/footnote';
import { FullLine } from '@/components/ui/full-line';
import { cellBorders, type ColumnMap } from '@/components/ui/grid-cell';
import { Ledger, LedgerRow } from '@/components/ui/ledger';
import SectionShell from '@/components/ui/section-shell';

/*
 * Agents and Safe Mode, in one section.
 *
 * They shipped as two, adjacent on purpose: Agents raises the most alarming
 * claim on the page — "let Claude query your database" — and Safety is the
 * answer, so `Home.tsx` put them next to each other and noted that "adjacency
 * does that work, and adjacency is free".
 *
 * Adjacency is free; a second header stack is not. Two eyebrows, two H2s and
 * two ledes — thirty five words of chrome and eight hairlines — were being
 * spent to split one argument in half at exactly the point where the reader
 * needs the two halves joined. Merged, the permission ladder and the Safe Mode
 * ladder read as what they are: the same idea applied to an agent and to you.
 *
 * The ids survive the merge. `#mcp` is the section, `#safety` the sub-heading
 * on the second artifact, in that order, which is what
 * `LandingStructureTest` actually asserts.
 */

const CONFIG_JSON = `{
  "mcpServers": {
    "tablepro": {
      "command": "/Applications/TablePro.app/Contents/MacOS/tablepro-mcp"
    }
  }
}`;

const PANE_COLS: ColumnMap = { base: 1, lg: 2 };

/**
 * Names, not chips.
 *
 * Twenty four bordered pills — eleven clients, thirteen providers — each in
 * 11px mono, was forty one mono runs and twenty four extra rules in one band.
 * A reader scans this list for one name, theirs, and a comma-separated line
 * answers that as fast as a pill wall while drawing nothing.
 */
const CLIENTS =
    'Claude Code, Claude Desktop, Cursor, Zed, VS Code, Windsurf, Cline, Continue, Goose, Antigravity and Raycast.';

const PROVIDERS =
    'GitHub Copilot, ChatGPT, Claude, OpenAI, Gemini, xAI, OpenRouter, OpenCode Zen, Ollama, llama.cpp, MLX, or any OpenAI-compatible endpoint.';

function Tool({ children }: { children: string }) {
    return <span className="font-mono text-sm text-foreground/80">{children}</span>;
}

interface SafeModeLevel {
    name: string;
    write: string;
    read: string;
    auth: string;
    /** 0 to 1. How far up the ladder the row sits; drives the tint and the bar. */
    accent: number;
}

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

const ROW_TINT = ['', '', '', 'bg-primary/[0.02]', 'bg-primary/[0.04]', 'bg-primary/[0.06]'] as const;

const COLUMNS = ['Level', 'Write', 'Read', 'Auth'] as const;

const HEAD_CELL =
    'px-4 py-3 text-left font-mono text-2xs font-semibold tracking-widest text-muted-foreground uppercase';
const BODY_CELL = 'px-4 py-4 align-top text-sm text-muted-foreground';

/**
 * The table's nouns, as verb phrases.
 *
 * The live sentence below read "At Alert, a scoped UPDATE confirmation." for
 * four of the six levels: it interpolated the `write` column straight into
 * prose, and `write` holds the noun a table cell wants under a heading that
 * already says "Write". A table column and a sentence need different words for
 * the same fact.
 */
const PHRASE: Record<string, string> = {
    runs: 'runs without asking',
    confirmation: 'asks for confirmation',
    'confirmation and Touch ID': 'asks for confirmation and Touch ID',
    blocked: 'is blocked outright',
};

/** The floor: an unguarded DELETE always asks, even where a scoped write does not. */
function unguardedOutcome(level: SafeModeLevel): string {
    return level.write === 'runs' ? 'confirmation' : level.write;
}

function LevelPicker({ selected, onSelect }: { selected: number; onSelect: (index: number) => void }) {
    const refs = useRef<(HTMLButtonElement | null)[]>([]);

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1
            : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1
            : 0;

        if (step === 0) {
            return;
        }

        event.preventDefault();
        const next = (selected + step + LEVELS.length) % LEVELS.length;
        onSelect(next);
        refs.current[next]?.focus();
    }

    return (
        <div
            role="radiogroup"
            aria-label="Safe Mode level"
            onKeyDown={handleKeyDown}
            className="flex flex-wrap gap-2 px-4 py-5"
        >
            {LEVELS.map((level, i) => (
                <button
                    key={level.name}
                    ref={(el) => { refs.current[i] = el; }}
                    type="button"
                    role="radio"
                    aria-checked={i === selected}
                    tabIndex={i === selected ? 0 : -1}
                    onClick={() => onSelect(i)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-(--dur-tap) ease-(--ease-feedback) ${
                        i === selected
                            ? 'border-primary bg-primary/10 text-primary-strong'
                            : 'border-rule text-muted-foreground hover:text-foreground'
                    }`}
                >
                    {level.name}
                </button>
            ))}
        </div>
    );
}

export default function Guardrails() {
    const [selected, setSelected] = useState(0);
    const level = LEVELS[selected];

    return (
        <SectionShell
            id="mcp"
            label="Guardrails"
            headline="Let an agent query your database."
            headlineMuted="Without giving it your password."
            lede="Sixteen MCP tools over your saved connections. The client gets a scoped token, never a credential."
        >
            <FullLine />
            <Container>
                <div className="lg:grid lg:grid-cols-2">
                    <div className={`min-w-0 border-rule ${cellBorders(0, PANE_COLS, 2)}`}>
                        <h3 className="sr-only">Configuration</h3>

                        <div className="flex items-center justify-between border-b border-rule px-4 py-2.5">
                            <span className="font-mono text-2xs text-muted-foreground">
                                claude_desktop_config.json
                            </span>
                            <CopyButton value={CONFIG_JSON} label="the MCP configuration" />
                        </div>

                        <CodeBlock label="MCP client configuration">
                            <pre className="p-4 font-mono text-xs leading-relaxed sm:p-6">
                            <code>
                                <span className="text-muted-foreground">{'{'}</span>
                                {'\n'}
                                {'  '}
                                <span className="text-foreground">"mcpServers"</span>
                                <span className="text-muted-foreground">{': {'}</span>
                                {'\n'}
                                {'    '}
                                <span className="text-foreground">"tablepro"</span>
                                <span className="text-muted-foreground">{': {'}</span>
                                {'\n'}
                                {'      '}
                                <span className="text-foreground">"command"</span>
                                <span className="text-muted-foreground">{': '}</span>
                                <span className="text-primary-strong">
                                    "/Applications/TablePro.app/Contents/MacOS/tablepro-mcp"
                                </span>
                                {'\n'}
                                {'    '}
                                <span className="text-muted-foreground">{'}'}</span>
                                {'\n'}
                                {'  '}
                                <span className="text-muted-foreground">{'}'}</span>
                                {'\n'}
                                <span className="text-muted-foreground">{'}'}</span>
                            </code>
                            </pre>
                        </CodeBlock>

                        <p className="border-t border-rule px-4 py-4 text-sm text-muted-foreground">
                            No token in the config. The bridge launches TablePro if it is not running.
                        </p>
                    </div>

                    <div className="min-w-0">
                        <h3 className="sr-only">Permission levels</h3>

                        <Ledger>
                            <LedgerRow label="Ask" aside="read only" accent={0.3}>
                                <Tool>list_connections</Tool> · <Tool>list_tables</Tool> · <Tool>describe_table</Tool> ·{' '}
                                <Tool>get_table_ddl</Tool>
                            </LedgerRow>
                            <LedgerRow label="Edit" aside="adds writes" accent={0.6}>
                                <Tool>execute_query</Tool> for SELECT, INSERT, UPDATE and DELETE. Destructive DDL
                                stays blocked.
                            </LedgerRow>
                            <LedgerRow label="Agent" aside="adds the tool loop" accent={1}>
                                <Tool>confirm_destructive_operation</Tool>. You type &ldquo;I understand this is
                                irreversible&rdquo; every time. It can never be pre-approved.
                            </LedgerRow>
                        </Ledger>

                        <p className="border-t border-rule px-4 py-4 text-sm text-muted-foreground">
                            Fresh installs start in Ask.
                        </p>
                    </div>
                </div>
            </Container>
            <FullLine />

            <Container>
                <Ledger>
                    <LedgerRow label="Works with">{CLIENTS}</LedgerRow>
                    <LedgerRow label="Providers" aside="your own key">
                        {PROVIDERS}
                    </LedgerRow>
                </Ledger>
            </Container>
            <FullLine />

            <FootNote>
                Remote access is off by default; turning it on switches on authentication and TLS.
            </FootNote>

            {/*
              * The second artifact. `#safety` rides the sub-heading rather than
              * a section of its own: the nav never pointed at it, and every
              * assertion that mentions it only cares that it lands after `#mcp`
              * and after the tool that answers the question `#mcp` raises.
              */}
            <div className="h-8 sm:h-10 lg:h-14" />
            <Container>
                <h3 id="safety" className="scroll-mt-20 px-4 py-5 text-2xl font-bold text-pretty sm:py-6">
                    Six levels between you and production.
                    <br />
                    <span className="text-muted-foreground">Set per connection.</span>
                </h3>
            </Container>
            <FullLine />
            <Container>
                <p className="max-w-[58ch] px-4 py-5 text-lg text-muted-foreground text-pretty sm:py-6">
                    Even at the loosest setting, DROP, TRUNCATE and a DELETE with no WHERE clause stop and ask.
                </p>
            </Container>
            <FullLine />
            <Container>
                <LevelPicker selected={selected} onSelect={setSelected} />
            </Container>
            <FullLine />
            <Container>
                <p className="px-4 py-5 text-base text-muted-foreground text-pretty">
                    At <span className="font-semibold text-foreground">{level.name}</span>, a scoped{' '}
                    <code className="font-mono text-sm text-foreground">UPDATE</code> {PHRASE[level.write]}. An
                    unguarded <code className="font-mono text-sm text-foreground">DELETE FROM users</code>{' '}
                    {PHRASE[unguardedOutcome(level)]} — that floor holds at every level.
                </p>
            </Container>
            <FullLine />
            <Container>
                {/* Scrollable and focusable: four columns do not fit a phone. */}
                <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Safe Mode levels">
                    <DataTable className="min-w-[38rem]" caption="Safe Mode levels and their behaviour">
                        <thead>
                            <tr className="border-b border-rule">
                                {COLUMNS.map((column) => (
                                    <th key={column} scope="col" className={HEAD_CELL}>
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {LEVELS.map((row, i) => (
                                /*
                                 * No `data-row`. `[data-row]::before` inside a
                                 * `table-row` makes the browser generate an
                                 * anonymous table cell — CSS anonymous-table
                                 * fixup wraps the pseudo-element, and
                                 * `position: absolute` does not exempt it — so
                                 * every `<td>` rendered one column right of its
                                 * `<th>`. Rows 0 and 1 have `accent: 0`, so
                                 * they carried no `data-accent` and the
                                 * `content: none` escape hatch never reached
                                 * them. Nothing here is clickable anyway, which
                                 * is the rule `Ledger` already documents.
                                 *
                                 * Losing `data-row` also loses
                                 * `[data-row][aria-selected="true"]`, which is
                                 * what used to tie the picker above to a row
                                 * down here — so the selected row states its own
                                 * tint. `primary/10`, not the `/5` that rule
                                 * used: the ladder already tints rows up to
                                 * `/[0.06]`, and a selection a reader cannot
                                 * distinguish from a ladder step is not one.
                                 * `aria-current` rather than `aria-selected`,
                                 * because `row` only supports `aria-selected`
                                 * inside a grid, and this is a plain table.
                                 */
                                <tr
                                    key={row.name}
                                    className={`border-b border-rule last:border-b-0 ${
                                        i === selected ? 'bg-primary/10' : ROW_TINT[i]
                                    }`}
                                >
                                    <th
                                        scope="row"
                                        aria-current={i === selected ? 'true' : undefined}
                                        className="relative px-4 py-4 text-left align-top text-sm font-semibold whitespace-nowrap text-foreground"
                                    >
                                        {row.accent > 0 && (
                                            <span
                                                className="absolute inset-y-0 left-0 w-0.5 bg-primary"
                                                style={{ opacity: row.accent }}
                                                aria-hidden="true"
                                            />
                                        )}
                                        {row.name}
                                    </th>
                                    <td className={BODY_CELL}>{row.write}</td>
                                    <td className={BODY_CELL}>{row.read}</td>
                                    <td className={BODY_CELL}>{row.auth}</td>
                                </tr>
                            ))}
                        </tbody>
                    </DataTable>
                </div>
            </Container>
            <FullLine />

            <FootNote>
                Read-Only disables the interface, not just the query. A host or database named &ldquo;prod&rdquo;
                raises the level by itself.
            </FootNote>

            {/*
              * Three grid cells became three ledger rows. Same words, one third
              * of the chrome: the cells carried mono uppercase headings and
              * three sets of borders to say what a label column says for free.
              */}
            <Container>
                <Ledger>
                    <LedgerRow label="Credentials">
                        macOS Keychain, or nowhere: resolved at connect time from 1Password, HashiCorp Vault, AWS
                        Secrets Manager or a shell command.
                    </LedgerRow>
                    <LedgerRow label="Network">
                        No account, no login, no cloud service in the connection path.
                    </LedgerRow>
                    <LedgerRow label="Getting there">
                        SSH tunnels and jump hosts chained in process. Or Cloudflare Tunnel, Cloud SQL Auth Proxy, or
                        SOCKS5.
                    </LedgerRow>
                </Ledger>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
