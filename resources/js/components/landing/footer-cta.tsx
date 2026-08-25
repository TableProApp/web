import { useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import CopyButton from '@/components/ui/copy-button';
import Container from '@/components/ui/container';
import FootNote from '@/components/ui/footnote';
import { FullLine } from '@/components/ui/full-line';
import { PANEL_TITLE, cellBorders, GridCell, type ColumnMap } from '@/components/ui/grid-cell';
import SectionShell from '@/components/ui/section-shell';
import ThemedImage from '@/components/ui/themed-image';
import Button from '@/components/ui/button';
import { AppleGlyph } from '@/components/ui/glyph';
import { trackDownload } from '@/lib/analytics';
import { useEmailForm, type FlashMessage } from '@/hooks/use-email-form';

const COLS: ColumnMap = { base: 1, sm: 2 };
const BREW_COMMAND = 'brew install --cask tablepro';

const flashColors = {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
};

function FlashStatus({ flash }: { flash?: FlashMessage | null }) {
    if (!flash?.message) {
        return null;
    }

    return (
        <p role="status" className={`mt-3 text-sm ${flashColors[flash.type]}`}>
            {flash.message}
        </p>
    );
}

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
                    alt="TablePro on iPhone showing rows from a PostgreSQL table."
                    width={1206}
                    height={2622}
                    className="size-full object-cover object-top"
                />
            </span>
        </div>
    );
}

/**
 * No `focus:outline-none` here. It used to suppress the global focus ring from
 * `app.css` — 2px solid `--primary-strong`, which measures 5.9:1 — and replace
 * it with `ring-primary/50` at roughly 1.6:1, on the one control that converts.
 */
const INPUT_CLASS =
    'min-w-0 flex-1 rounded-lg border border-rule bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50';
const SUBMIT_CLASS = buttonClasses('primary', 'sm', 'shrink-0 disabled:opacity-50');

/**
 * The closing call to action: the Mac download, and the iPhone app beside it.
 *
 * The iPhone panel used to be a section of its own at the midpoint of the page,
 * carrying an H2, a four-row ledger, a seven-item enumeration that the pricing
 * ledger already listed, and a "Join the iOS beta" button whose href was
 * `#footer-cta` — it scrolled here and stopped, leaving the reader to find the
 * real control themselves. The `data-beta-toggle` hook that looked like the
 * intended wiring was referenced nowhere else in the repository.
 *
 * Folding it in keeps the `#mobile` anchor alive for the header and the mobile
 * nav, puts the copy that motivates the beta in the same cell as the button that
 * opens it, and means "needs a license" is read after the prices rather than as
 * a surprise in the middle of a feature tour.
 *
 * The newsletter form moved to the footer. It was a second, non-download
 * conversion goal rendered as a sibling panel at the highest-intent moment on
 * the page.
 */
export default function FooterCTA() {
    const [showBeta, setShowBeta] = useState(false);
    const betaForm = useEmailForm('/beta/signup');

    function handleBetaSubmit(event: React.FormEvent) {
        event.preventDefault();
        betaForm.submit();
    }

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
                        <h3 className={PANEL_TITLE}>Download</h3>

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
                                SQLite, DuckDB, MySQL, MariaDB, PostgreSQL, Redis and SQL Server on device, with SSH
                                tunnels, Face ID and Handoff. Free, like the Mac app; syncing needs a license.
                            </p>

                            <div className="mt-6">
                                <button
                                    type="button"
                                    aria-expanded={showBeta}
                                    aria-controls="beta-invite"
                                    onClick={() => setShowBeta(true)}
                                    className={buttonClasses('secondary')}
                                >
                                    Get for iPhone
                                </button>
                            </div>

                            {showBeta && (
                                <div id="beta-invite" className="mt-6">
                                    <p className="text-sm text-muted-foreground">
                                        Enter your email to get a TestFlight invite.
                                    </p>
                                    <form onSubmit={handleBetaSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
                                        <label htmlFor="beta-email" className="sr-only">
                                            Email address
                                        </label>
                                        <input
                                            id="beta-email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={betaForm.email}
                                            onChange={(e) => betaForm.setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            disabled={betaForm.processing}
                                            className={INPUT_CLASS}
                                        />
                                        <button type="submit" disabled={betaForm.processing} className={SUBMIT_CLASS}>
                                            {betaForm.processing ? 'Joining...' : 'Join Beta'}
                                        </button>
                                    </form>
                                    {betaForm.error && (
                                        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                                            {betaForm.error}
                                        </p>
                                    )}
                                    <FlashStatus flash={betaForm.flash} />
                                </div>
                            )}

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
