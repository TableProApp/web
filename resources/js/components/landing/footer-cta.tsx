import CopyButton from '@/components/ui/copy-button';
import Container from '@/components/ui/container';
import FootNote from '@/components/ui/footnote';
import { FullLine } from '@/components/ui/full-line';
import { PANEL_TITLE, cellBorders, GridCell, type ColumnMap } from '@/components/ui/grid-cell';
import SectionShell from '@/components/ui/section-shell';
import ThemedImage from '@/components/ui/themed-image';
import Button from '@/components/ui/button';
import { AppleGlyph } from '@/components/ui/glyph';
import AppStoreBadge from '@/components/landing/app-store-badge';
import { PROSE_LINK } from '@/components/ui/prose-link';
import { trackDownload } from '@/lib/analytics';

const COLS: ColumnMap = { base: 1, sm: 2 };
const BREW_COMMAND = 'brew install --cask tablepro';

/**
 * The iPhone frame is decorative chrome; the screenshot inside carries the alt
 * text. The positioning percentages belong to this exact SVG, so they move with
 * the asset rather than with the layout.
 */
function PhoneMockup() {
    return (
        <div className="relative mx-auto w-40 sm:w-44">
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
                    alt="TablePro on iPhone, showing the connection list."
                    width={1206}
                    height={2622}
                    className="size-full object-cover object-top"
                />
            </span>
        </div>
    );
}

/**
 * The closing call to action: the Mac download, and the iPhone app beside it.
 *
 * The iPhone panel used to be a section of its own at the midpoint of the page,
 * carrying an H2, a four-row ledger, a seven-item enumeration that the pricing
 * ledger already listed, and a "Join the iOS beta" button whose href was
 * `#footer-cta` — it scrolled here and stopped, leaving the reader to find the
 * real control themselves.
 *
 * Folding it in keeps the `#mobile` anchor alive for the header and the mobile
 * nav, and means "needs a license" is read after the prices rather than as a
 * surprise in the middle of a feature tour.
 *
 * On 2026-09-22 the app shipped on the App Store and this cell stopped being a
 * signup. It held a disclosure button that revealed an email field posting to
 * `/beta/signup` for a TestFlight invite — the whole apparatus is gone, along
 * with the `FlashStatus` helper and the two input class constants that existed
 * only to dress it. `useEmailForm` stays: the footer newsletter is still its
 * caller. What replaces it is a link, because there is nothing left to collect.
 *
 * The engine sentence is deliberately not a count. The old one said "SQLite,
 * DuckDB, MySQL, MariaDB, PostgreSQL, Redis and SQL Server", which was seven of
 * the ten the connection form now offers, and the site had already published
 * "Seven engines on device" as a number that was wrong for six weeks. Naming a
 * subset and saying "and more" cannot go stale the same way; the full list is
 * on /ios, where it can be maintained in one place.
 *
 * The newsletter form moved to the footer. It was a second, non-download
 * conversion goal rendered as a sibling panel at the highest-intent moment on
 * the page.
 */
export default function FooterCTA() {
    return (
        <SectionShell
            id="footer-cta"
            label="Get started"
            headline="Install it and open a database."
            headlineMuted="There is nothing to sign up for."
        >
            <FullLine />
            <Container>
                <div className="grid grid-cols-1 items-start sm:grid-cols-2">
                    <GridCell density="default" className={cellBorders(0, COLS, 2)}>
                        <h3 className={PANEL_TITLE}>Mac</h3>

                        <div className="mt-6">
                            <Button href="/download" onClick={() => trackDownload('footer-cta')}>
                                <AppleGlyph />
                                Download for Mac
                            </Button>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <code tabIndex={0} className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-rule px-3 py-2 font-mono text-xs whitespace-nowrap text-muted-foreground">
                                {BREW_COMMAND}
                            </code>
                            <CopyButton value={BREW_COMMAND} label="the Homebrew command" className="size-9 rounded-lg border border-rule" />
                        </div>

                        <p className="mt-4 text-sm text-muted-foreground text-pretty">
                            No database to hand?{' '}
                            <span className="font-mono text-xs">File &gt; Try Sample Database</span> opens a bundled
                            Chinook.
                        </p>
                    </GridCell>

                    <GridCell density="default" className={cellBorders(1, COLS, 2)}>
                        {/* Carries the anchor the header and the mobile nav both target. */}
                        <div id="mobile" className="scroll-mt-20">
                            <h3 className={PANEL_TITLE}>iPhone and iPad</h3>
                            <p className="mt-3 text-sm text-muted-foreground text-pretty">
                                MySQL, PostgreSQL, SQL Server, Oracle, Redis, SQLite and more, on the phone. SSH
                                tunnels, Face ID and Handoff. Free, with no in-app purchases. Sending your
                                connections from the Mac needs a Starter license.
                            </p>

                            <div className="mt-6">
                                <AppStoreBadge location="footer-cta" />
                            </div>

                            <p className="mt-4 text-sm text-muted-foreground text-pretty">
                                <a href="/ios" className={PROSE_LINK}>What it does on iPhone &rarr;</a>
                            </p>

                            <div className="mt-8">
                                <PhoneMockup />
                            </div>
                        </div>
                    </GridCell>
                </div>
            </Container>
            <FullLine />

            {/*
              * The only place on the page that answers Windows and Linux, now
              * that the platform note has left the iPhone section. It is a real
              * query and the honest answer is short.
              */}
            <FootNote>
                No Windows version. A native Linux app is being built in Rust with GTK4, with nothing to install yet.
            </FootNote>
        </SectionShell>
    );
}
