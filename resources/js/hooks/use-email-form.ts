import { usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { emailFormOutcome, type FlashMessage } from '@/hooks/email-form-response';
import { useApi } from '@/hooks/use-api';
import { useI18n } from '@/i18n';
import { loadTurnstile, renderHumanCheck, turnstileLanguage, type HumanCheck } from '@/lib/turnstile';

export type { FlashMessage } from '@/hooks/email-form-response';

// Names the wording the form shows, footer.newsletter's body and note in every locale; tablepro-cloud keeps it in the
// consent record, so it changes whenever that wording does.
export const NEWSLETTER_CONSENT_VERSION = '2026-10-28';

// The newsletter signup. This app has no session, so the result lives in React state, never in a flash bag.
export function useEmailForm() {
    const { locale, m } = useI18n();
    const api = useApi();
    const siteKey = usePage().props.turnstileSiteKey;
    const widget = useRef<HTMLDivElement>(null);
    const check = useRef<Promise<HumanCheck> | null>(null);
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [flash, setFlash] = useState<FlashMessage | null>(null);
    const [challenge, setChallenge] = useState(false);

    function humanCheck(): Promise<HumanCheck> {
        const container = widget.current;

        if (!siteKey || container === null) {
            return Promise.reject(new Error('Turnstile is not configured.'));
        }

        check.current ??= loadTurnstile()
            .then((turnstile) =>
                renderHumanCheck(turnstile, container, {
                    siteKey,
                    language: turnstileLanguage(locale),
                    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
                    onInteractive: setChallenge,
                }),
            )
            .catch((reason: unknown) => {
                check.current = null;
                throw reason;
            });

        return check.current;
    }

    // On the first focus or pointer on the form, so the check is ready by the time the reader submits.
    function warm(): void {
        humanCheck().catch(() => undefined);
    }

    async function submit(): Promise<void> {
        // The busy button stays focusable (`aria-disabled`, not `disabled`), so a second press must not post twice.
        if (processing) {
            return;
        }

        setProcessing(true);
        setError(null);
        setFlash(null);

        try {
            let token: string;

            try {
                token = await (await humanCheck()).token();
            } catch {
                setFlash({ type: 'error', message: m.forms.verification });

                return;
            }

            const res = await fetch(api('/v2/newsletter/subscriptions'), {
                method: 'POST',
                credentials: 'omit',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                // The page without its query or fragment, which may carry more than where the form was.
                body: JSON.stringify({
                    email,
                    locale,
                    turnstile_token: token,
                    source: window.location.origin + window.location.pathname,
                    consent_version: NEWSLETTER_CONSENT_VERSION,
                }),
            });
            const data: unknown = await res.json().catch(() => ({}));
            const outcome = emailFormOutcome(res.status, data, m.forms);

            if (outcome.kind === 'field') {
                setError(outcome.error);

                return;
            }

            setFlash(outcome.flash);

            if (outcome.reset) {
                setEmail('');
            }
        } catch {
            setFlash({ type: 'error', message: m.forms.network });
        } finally {
            setProcessing(false);
        }
    }

    return { email, setEmail, processing, error, flash, submit, warm, widget, challenge };
}
