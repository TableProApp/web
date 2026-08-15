import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { Ledger, LedgerRow } from '@/components/ui/ledger';
import SectionShell from '@/components/ui/section-shell';

interface Props {
    latestRelease?: { version: string | null; publishedAt: string | null; countLast30Days: number | null } | null;
}

const GITHUB_REPO_URL = 'https://github.com/TableProApp/TablePro';

function formatReleaseDate(iso: string): string {
    const parsed = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    return parsed.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

/**
 * Sits immediately above pricing. The adjacency is the argument: read what is
 * free, then read what a licence adds, in that order.
 */
export default function OpenSource({ latestRelease }: Props) {
    const latest =
        [
            latestRelease?.version ? `v${latestRelease.version}` : null,
            latestRelease?.publishedAt ? formatReleaseDate(latestRelease.publishedAt) : null,
        ]
            .filter(Boolean)
            .join(' · ') || 'Shipping';

    return (
        <SectionShell
            tier="reference"
            id="open-source"
            label="Open source"
            headline="Nothing is behind a paywall."
            headlineMuted="Here is what a licence actually buys."
        >
            <FullLine />
            <Container>
                <div className="lg:grid lg:grid-cols-[1fr_18rem]">
                    <div className="border-rule max-lg:border-b lg:border-r">
                        <div className="max-w-2xl space-y-4 p-6 text-base text-muted-foreground text-pretty sm:p-8">
                            <p>
                                TablePro is AGPLv3. All 25 databases, the SQL editor, the data grid, the AI assistant,
                                the MCP server, Safe Mode with Touch ID, SSH tunnels, ER diagrams, the server dashboard,
                                Users and Roles and XLSX export are free. There is no trial countdown and no time limit,
                                and the app does not care how many Macs you install it on. You can read the source,
                                build it yourself, and use it at work.
                            </p>
                            <p>
                                A licence adds four things: iCloud Sync, a second Mac, encrypted connection export, and
                                environment variables in connection fields. A Team seat adds a shared catalog and a
                                shared query library. That is the entire paid surface.
                            </p>
                            <p>
                                Mostly it buys my time to keep shipping. If you use TablePro at work, please buy a
                                licence. If you cannot afford one, use the free version. That is why it is free.
                            </p>
                        </div>
                    </div>

                    <Ledger>
                        <LedgerRow label="Latest" className="sm:grid-cols-1">
                            <span className="font-mono text-xs tabular-nums">{latest}</span>
                        </LedgerRow>

                        {latestRelease?.countLast30Days != null && (
                            <LedgerRow label="Cadence" className="sm:grid-cols-1">
                                <span className="tabular-nums">{latestRelease.countLast30Days}</span> releases in the
                                last thirty days
                            </LedgerRow>
                        )}

                        <LedgerRow label="License" className="sm:grid-cols-1">
                            AGPLv3 ·{' '}
                            <a
                                href={GITHUB_REPO_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs break-all underline underline-offset-4 transition-colors hover:text-foreground"
                            >
                                github.com/TableProApp/TablePro
                            </a>
                        </LedgerRow>
                    </Ledger>
                </div>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
