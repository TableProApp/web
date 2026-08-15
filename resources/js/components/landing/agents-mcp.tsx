import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { CodeBlock } from '@/components/ui/code';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { Ledger, LedgerRow } from '@/components/ui/ledger';
import SectionShell from '@/components/ui/section-shell';
import { relocatedFaq } from '@/data/home-faqs';
import { cellBorders, type ColumnMap } from '@/components/ui/grid-cell';

/** Kept byte-identical to the tokenized block below, since this is what gets copied. */
const CONFIG_JSON = `{
  "mcpServers": {
    "tablepro": {
      "command": "/Applications/TablePro.app/Contents/MacOS/tablepro-mcp"
    }
  }
}`;

const PANE_COLS: ColumnMap = { base: 1, lg: 2 };

const CLIENTS = [
    'Claude Code',
    'Claude Desktop',
    'Cursor',
    'Zed',
    'VS Code',
    'Windsurf',
    'Cline',
    'Continue',
    'Goose',
    'Antigravity',
    'Raycast',
];

const PROVIDERS = [
    'GitHub Copilot',
    'ChatGPT',
    'Claude',
    'OpenAI',
    'Cursor',
    'Gemini',
    'xAI',
    'OpenRouter',
    'OpenCode Zen',
    'Ollama',
    'llama.cpp',
    'MLX',
    'any OpenAI-compatible endpoint',
];

const CHIP_CLASS =
    'rounded-full border border-rule px-2.5 py-1 font-mono text-2xs text-muted-foreground';

function Chips({ items, label }: { items: string[]; label: string }) {
    return (
        <ul aria-label={label} className="flex flex-wrap gap-1.5">
            {items.map((item) => (
                <li key={item} className={CHIP_CLASS}>
                    {item}
                </li>
            ))}
        </ul>
    );
}

/** A tool or function name inside prose. */
function Tool({ children }: { children: string }) {
    return <span className="font-mono text-sm">{children}</span>;
}

function CopyButton() {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        },
        [],
    );

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(CONFIG_JSON);
            toast('Copied');
            setCopied(true);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => setCopied(false), 1200);
        } catch {
            toast.error('Could not copy. Select the text and copy it by hand.');
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy configuration"
            className="inline-flex size-7 items-center justify-center rounded-key text-muted-foreground transition-colors hover:text-foreground"
        >
            {copied ? (
                <Check className="size-4 text-primary-strong" strokeWidth={1.75} aria-hidden="true" />
            ) : (
                <Copy className="size-4" strokeWidth={1.75} aria-hidden="true" />
            )}
        </button>
    );
}

const aiSafetyFaq = relocatedFaq('Can the AI drop a table on production?');

/**
 * No screenshot exists for the MCP server, so this section stays typographic:
 * the config you paste on the left, the permission ladder on the right.
 */
export default function AgentsMcp() {
    return (
        <SectionShell
            id="mcp"
            label="Agents"
            headline="Let Claude query your database."
            headlineMuted="Without giving it your password."
            lede="TablePro runs an MCP server over your saved connections. The client receives a scoped token, never a credential, and every call lands in an activity log kept for ninety days."
        >
            <FullLine />
            <Container>
                <div className="lg:grid lg:grid-cols-2">
                    <div className={`min-w-0 border-rule ${cellBorders(0, PANE_COLS, 2)}`}>
                        <h3 className="sr-only">Configuration</h3>

                        <div className="flex items-center justify-between border-b border-rule px-4 py-2">
                            <span className="font-mono text-2xs text-muted-foreground">
                                claude_desktop_config.json
                            </span>
                            <CopyButton />
                        </div>

                        <CodeBlock label="MCP client configuration">
                            <pre className="p-4 font-mono text-xs leading-relaxed">
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

                        <p className="border-t border-rule px-4 py-3 font-mono text-xs text-muted-foreground">
                            No token in the config. The bridge launches TablePro if it is not already running.
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
                                <Tool>execute_query</Tool> for SELECT, INSERT, UPDATE, DELETE. Destructive DDL is still
                                blocked.
                            </LedgerRow>
                            <LedgerRow label="Agent" aside="adds the tool loop" accent={1}>
                                <Tool>confirm_destructive_operation</Tool>. You type "I understand this is irreversible"
                                every single time. It can never be pre-approved.
                            </LedgerRow>
                        </Ledger>

                        <p className="border-t border-rule px-4 py-3 font-mono text-xs text-muted-foreground">
                            Fresh installs start in Ask.
                        </p>
                    </div>
                </div>
            </Container>
            <FullLine />

            <Container>
                <Ledger>
                    <LedgerRow label="16 tools">
                        4 connection · 5 schema · 5 query · 4 navigation · 1 history. Plus 3 resources for connections,
                        schema and history.
                    </LedgerRow>
                    <LedgerRow label="Clients">
                        <Chips items={CLIENTS} label="Supported MCP clients" />
                    </LedgerRow>
                    <LedgerRow label="Providers">
                        <p className="mb-2">Thirteen, bring your own key or account:</p>
                        <Chips items={PROVIDERS} label="Supported AI providers" />
                    </LedgerRow>
                </Ledger>
            </Container>
            <FullLine />

            {/*
              * This section raises the most alarming claim on the page, so it
              * carries the first half of the answer rather than deferring all of
              * it to the FAQ. Verbatim from relocatedFaqs — one copy of the
              * answer, and /faq still lists it.
              */}
            <Container>
                <div className="border-l-2 border-primary p-4 sm:p-6">
                    <h3 className="text-base font-semibold text-foreground">{aiSafetyFaq.question}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {aiSafetyFaq.answer}
                    </p>
                </div>
            </Container>
            <FullLine />

            <Container>
                <p className="p-4 font-mono text-xs text-muted-foreground">
                    Remote access is off by default. Turning it on switches authentication and TLS on automatically,
                    generates a self-signed certificate valid for one year, and writes its fingerprint to the handshake
                    file so the bridge can pin it.
                </p>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
