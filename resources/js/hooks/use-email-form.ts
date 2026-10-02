import { useState } from 'react';
import { emailFormOutcome, type FlashMessage } from '@/hooks/email-form-response';
import { useI18n } from '@/i18n';

export type { FlashMessage } from '@/hooks/email-form-response';

/**
 * A minimal stand-in for Inertia's useForm, for the anonymous email forms.
 *
 * Their endpoints belong to the platform app on this origin and take no part
 * in this app's Inertia page lifecycle, so a plain JSON fetch keeps the whole
 * exchange inside React: no session, no CSRF token, no flash bag. This app runs
 * without `StartSession`, so `useForm().post()` and `->with('flash')` are not
 * available to it at all. See docs/architecture.md.
 *
 * `credentials: 'omit'`: the public site sets no cookies (docs/architecture.md,
 * "The endpoints the pages call"). The platform's subscribe route sits in its
 * `web` group, so its responses carry `tablepro-session` and `XSRF-TOKEN`, and
 * a same-origin fetch would store both and send them with every later public
 * page. Omitted credentials neither send cookies nor keep any `Set-Cookie`
 * from the answer.
 * Subscribing needs neither: the throttle is per IP and the locale travels in
 * the body.
 *
 * The body carries the page's `locale`, so the confirmation email arrives in
 * the reader's language. The endpoint stays the root path in every language:
 * nginx routes `/newsletter/*` to the platform by its unprefixed path.
 *
 * Which message shows for which answer is `emailFormOutcome()`: the server's
 * own text only where the platform localizes it, the `forms` catalog
 * everywhere else.
 */
export function useEmailForm(endpoint: string) {
    const { locale, m } = useI18n();
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [flash, setFlash] = useState<FlashMessage | null>(null);

    async function submit(): Promise<void> {
        // The busy button stays focusable (it is `aria-disabled`, not
        // `disabled`), so a second press must not post a second request.
        if (processing) {
            return;
        }

        setProcessing(true);
        setError(null);
        setFlash(null);

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                credentials: 'omit',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ email, locale }),
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

    return { email, setEmail, processing, error, flash, submit };
}
