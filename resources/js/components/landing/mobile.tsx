import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { GridCell } from '@/components/ui/grid-cell';
import { Ledger, LedgerRow } from '@/components/ui/ledger';
import SectionShell from '@/components/ui/section-shell';
import ThemedImage from '@/components/ui/themed-image';

/**
 * The iPhone frame is decorative chrome; the screenshot inside carries the alt
 * text. The positioning percentages belong to this exact SVG, so they move with
 * the asset rather than with the layout.
 */
function PhoneMockup() {
    return (
        <div className="relative mx-auto w-48 sm:w-56 lg:w-60">
            <img
                src="/images/iphone-frame.svg"
                alt=""
                aria-hidden="true"
                width={725}
                height={1500}
                loading="lazy"
                className="block w-full"
            />
            <span className="absolute top-[1.8%] left-[4.5%] z-10 block h-[96.5%] w-[91%] overflow-hidden rounded-[14%/7%]">
                <ThemedImage
                    light={{ src: '/images/ios-screenshot-light.png' }}
                    dark={{ src: '/images/ios-screenshot-dark.png' }}
                    alt="TablePro on iPhone showing rows from a PostgreSQL table."
                    width={1206}
                    height={2622}
                    className="size-full object-cover object-top"
                />
            </span>
        </div>
    );
}

export default function Mobile() {
    return (
        <SectionShell
            id="mobile"
            label="Mac and iPhone"
            headline="Your connections, in your pocket."
            headlineMuted="Synced over iCloud."
            lede="Connections, groups and tags sync end to end through your own iCloud account. Passwords go through iCloud Keychain, and only if you ask for them."
        >
            <FullLine />
            <Container>
                <div className="lg:grid lg:grid-cols-[1fr_20rem]">
                    <div className="border-b border-gray-950/5 lg:border-r lg:border-b-0 dark:border-white/10">
                        <Ledger>
                            <LedgerRow label="Syncs to your Macs">
                                Connections, groups, tags, SSH profiles, favourites, saved queries and settings. Each
                                has its own toggle. All of it is off by default and requires a Starter or Team licence.
                            </LedgerRow>
                            <LedgerRow label="Passwords">
                                Opt in, through iCloud Keychain, end to end encrypted. Mark any connection Local only
                                and it never leaves the Mac.
                            </LedgerRow>
                            <LedgerRow label="On iPhone">
                                iOS and iPadOS 18 or later. Seven engines on device: SQLite, DuckDB, MySQL, MariaDB,
                                PostgreSQL, Redis and SQL Server. SSH tunnels, Face ID lock, Handoff with your Mac, and
                                Shortcuts that insert up to 10,000 rows without opening the app.
                            </LedgerRow>
                            <LedgerRow label="Not on iPhone">
                                The plugin registry, AI chat, the MCP server and ER diagrams. iPhone and iPad sync
                                connections, groups and tags only, not settings.
                            </LedgerRow>
                        </Ledger>
                    </div>

                    <GridCell variant="stripe" className="flex items-center justify-center px-4 py-10">
                        <PhoneMockup />
                    </GridCell>
                </div>
            </Container>
            <FullLine />

            <Container>
                <div className="px-4 py-4">
                    <a
                        href="#footer-cta"
                        className="inline-flex items-center gap-2 rounded-full border border-gray-950/5 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-gray-950/[2.5%] dark:border-white/10 dark:hover:bg-white/[2.5%]"
                    >
                        Join the iOS beta <span aria-hidden="true">&rarr;</span>
                    </a>
                </div>
            </Container>
            <FullLine />

            <Container>
                <p className="p-4 font-mono text-xs text-muted-foreground">
                    A separate Linux app is in development, written in Rust with native GTK4 widgets and no HTML
                    rendering. PostgreSQL, MySQL, SQLite and SQL Server work today. It is not ready for a beta and there
                    is nothing to install yet.
                </p>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
