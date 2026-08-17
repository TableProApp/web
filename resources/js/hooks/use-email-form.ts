import { useState } from 'react';

export interface FlashMessage {
    type: 'success' | 'warning' | 'error';
    message: string;
}

/**
 * A minimal stand-in for Inertia's useForm, for the anonymous email forms.
 *
 * Their endpoints are handled by the TablePro backend and take no part in this
 * app's Inertia page lifecycle, so a plain JSON fetch keeps the whole exchange
 * inside React — no session, no CSRF token, no flash bag. This app runs without
 * `StartSession`, so `useForm().post()` and `->with('flash')` are not available
 * to it at all. See docs/architecture.md.
 *
 * Extracted from `footer-cta.tsx` so the newsletter can live in the footer and
 * the TestFlight form can stay in the closing call to action without the two
 * keeping separate copies of this.
 */
export function useEmailForm(endpoint: string) {
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [flash, setFlash] = useState<FlashMessage | null>(null);

    async function submit(): Promise<void> {
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
