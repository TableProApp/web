import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { buttonClasses } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { PANEL_TITLE, cellBorders, GridCell, type ColumnMap } from '@/components/ui/grid-cell';
import SectionShell from '@/components/ui/section-shell';
import Button from '@/components/ui/button';
import { AppleGlyph } from '@/components/ui/glyph';

interface FlashMessage {
    type: 'success' | 'warning' | 'error';
    message: string;
}

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
 * A minimal stand-in for Inertia's useForm, used by the two anonymous email
 * forms. Their endpoints are handled by the TablePro backend and take no part
 * in this app's Inertia page lifecycle, so a plain JSON fetch keeps the whole
 * exchange inside React — no session, no CSRF token, no flash bag.
 */
function useEmailForm(endpoint: string) {
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [flash, setFlash] = useState<FlashMessage | null>(null);

    async function submit() {
        setProcessing(true);
        setError(null);
        setFlash(null);

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json().catch(() => ({}));

            if (res.status === 422) {
                setError(data?.errors?.email?.[0] ?? 'Enter a valid email address.');

                return;
            }

            if (!res.ok) {
                setFlash({ type: 'error', message: data?.message ?? 'Something went wrong. Try again.' });

                return;
            }

            setFlash({ type: data?.type ?? 'success', message: data?.message ?? 'Thanks, check your inbox.' });
            setEmail('');
        } catch {
            setFlash({ type: 'error', message: 'Network error. Try again.' });
        } finally {
            setProcessing(false);
        }
    }

    return { email, setEmail, processing, error, flash, submit };
}

/**
 * No `focus:outline-none` here. It used to suppress the global focus ring from
 * `app.css` — 2px solid `--primary-strong`, which measures 5.9:1 — and replace
 * it with `ring-primary/50` at roughly 1.6:1, on the one control that converts.
 */
const INPUT_CLASS =
    'min-w-0 flex-1 rounded-lg border border-rule bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50';
const SUBMIT_CLASS = buttonClasses('primary', 'sm', 'shrink-0 disabled:opacity-50');

export default function FooterCTA() {
    const [showBeta, setShowBeta] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const statsAnchorRef = useRef<HTMLDivElement>(null);
    const betaForm = useEmailForm('/beta/signup');
    const newsletterForm = useEmailForm('/newsletter/subscribe');

    /**
     * The subscriber count is decoration, so it must not cost a request on page
     * load. The fetch waits until the newsletter cell is within 200px of the
     * viewport, and the AbortController still cancels an in-flight request if
     * the section unmounts first.
     */
    useEffect(() => {
        const controller = new AbortController();

        function loadStats() {
            fetch('/api/newsletter/stats', { signal: controller.signal, headers: { Accept: 'application/json' } })
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data && typeof data.count === 'number') {
                        setSubscriberCount(data.count);
                    }
                })
                .catch(() => undefined);
        }

        const node = statsAnchorRef.current;

        if (!node || typeof IntersectionObserver === 'undefined') {
            loadStats();

            return () => controller.abort();
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    observer.disconnect();
                    loadStats();
                }
            },
            { rootMargin: '200px' },
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
            controller.abort();
        };
    }, []);

    useEffect(
        () => () => {
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
        },
        [],
    );

    function trackEvent(name: string, payload: Record<string, string>) {
        if (typeof window === 'undefined') {
            return;
        }

        const win = window as unknown as {
            plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
        };

        if (typeof win.plausible === 'function') {
            win.plausible(name, { props: payload });
        }
    }

    async function handleCopyBrew() {
        try {
            await navigator.clipboard.writeText(BREW_COMMAND);
            toast('Copied');
            setCopied(true);

            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
            copyTimeoutRef.current = setTimeout(() => setCopied(false), 1200);
        } catch {
            toast.error('Could not copy. Select the text and copy it by hand.');
        }
    }

    function handleBetaSubmit(event: React.FormEvent) {
        event.preventDefault();
        betaForm.submit();
    }

    function handleNewsletterSubmit(event: React.FormEvent) {
        event.preventDefault();
        trackEvent('newsletter_signup_clicked', { source: 'footer' });
        newsletterForm.submit();
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
                    <GridCell className={`p-6 sm:p-8 ${cellBorders(0, COLS, 2)}`}>
                        <h3 className={PANEL_TITLE}>Download</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            macOS 14 or later. Apple Silicon and Intel. About 20 MB.
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <Button
                                href="/download"
                            >
                                <AppleGlyph />
                                Download for Mac
                            </Button>
                            <button
                                type="button"
                                data-beta-toggle
                                aria-expanded={showBeta}
                                aria-controls="beta-invite"
                                onClick={() => setShowBeta(true)}
                                className={buttonClasses('secondary')}
                            >
                                Get for iPhone
                            </button>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <code tabIndex={0} className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-rule px-3 py-2 font-mono text-xs whitespace-nowrap text-muted-foreground">
                                {BREW_COMMAND}
                            </code>
                            <button
                                type="button"
                                onClick={handleCopyBrew}
                                aria-label={`Copy ${BREW_COMMAND}`}
                                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-rule text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {copied ? (
                                    <Check className="size-4 text-primary-strong" strokeWidth={1.75} aria-hidden="true" />
                                ) : (
                                    <Copy className="size-4" strokeWidth={1.75} aria-hidden="true" />
                                )}
                            </button>
                        </div>

                        <p className="mt-4 text-sm text-muted-foreground">
                            With no connection to hand,{' '}
                            <span className="font-mono text-xs">File &gt; Try Sample Database</span> opens a bundled
                            Chinook SQLite.
                        </p>

                        <p className="mt-4 font-mono text-xs text-muted-foreground">
                            Free and open source · AGPLv3 · macOS 14+ · Apple Silicon and Intel · No account
                        </p>

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
                    </GridCell>

                    <GridCell className={`p-6 sm:p-8 ${cellBorders(1, COLS, 2)}`}>
                        <div ref={statsAnchorRef}>
                            <h3 className={PANEL_TITLE}>Stay updated</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Release notes and database notes. About one email a month, unsubscribe any time.
                            </p>
                            {subscriberCount !== null && subscriberCount > 0 && (
                                <p className="mt-2 font-mono text-xs text-muted-foreground">
                                    Join {subscriberCount.toLocaleString()}{' '}
                                    {subscriberCount === 1 ? 'developer' : 'developers'}.
                                </p>
                            )}
                            <form
                                onSubmit={handleNewsletterSubmit}
                                className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3"
                            >
                                <label htmlFor="newsletter-email" className="sr-only">
                                    Email address
                                </label>
                                <input
                                    id="newsletter-email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={newsletterForm.email}
                                    onChange={(e) => newsletterForm.setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    disabled={newsletterForm.processing}
                                    className={INPUT_CLASS}
                                />
                                <button type="submit" disabled={newsletterForm.processing} className={SUBMIT_CLASS}>
                                    {newsletterForm.processing ? 'Subscribing...' : 'Subscribe'}
                                </button>
                            </form>
                            {newsletterForm.error && (
                                <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                                    {newsletterForm.error}
                                </p>
                            )}
                            <FlashStatus flash={newsletterForm.flash} />
                        </div>
                    </GridCell>
                </div>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
