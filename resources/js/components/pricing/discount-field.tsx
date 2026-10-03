import { useId, useRef, useState, type FormEvent } from 'react';
import Button from '@/components/ui/button';
import Disclosure from '@/components/ui/disclosure';
import { FieldError, FieldLabel, Input } from '@/components/ui/field';
import { useI18n } from '@/i18n';
import { formatUsd } from '@/i18n/format';
import { discountOutcome } from './checkout-response';

type Preview = { kind: 'idle' } | { kind: 'checking' } | { kind: 'applied'; message: string } | { kind: 'error'; message: string };

interface DiscountFieldProps {
    /** The code checkout should carry: a previewed, valid one, or null. */
    onApplied: (code: string | null) => void;
}

/**
 * "Have a discount code?" for a provider whose checkout takes the code from
 * this site (today Lemon Squeezy; under Polar the overlay has its own field
 * and this never renders).
 *
 * The code is checked with `POST /discount/preview` when the reader applies
 * it, and only a code the platform accepted travels with checkout. The answer
 * is a line under the field, not a recomputed price: whether a code applies
 * to every cycle and every seat is the provider's rule, so the page says what
 * the code is worth and leaves the arithmetic to checkout.
 *
 * Editing the code abandons a check still in flight: each check carries a
 * ticket, every keystroke takes a new one, and an answer whose ticket is no
 * longer current is dropped. Otherwise the answer for the old code arrived
 * after an edit, showed "applied" under a different code, and the next Buy
 * sent the old one.
 */
export default function DiscountField({ onApplied }: DiscountFieldProps) {
    const { m, fmt } = useI18n();
    const id = useId();
    const [code, setCode] = useState('');
    const [preview, setPreview] = useState<Preview>({ kind: 'idle' });
    const ticket = useRef(0);

    async function apply(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        const trimmed = code.trim();

        if (trimmed === '' || preview.kind === 'checking') {
            return;
        }

        setPreview({ kind: 'checking' });
        onApplied(null);

        const mine = ++ticket.current;
        const current = (): boolean => mine === ticket.current;

        try {
            const res = await fetch('/discount/preview', {
                method: 'POST',
                credentials: 'omit',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ code: trimmed }),
            });
            const outcome = discountOutcome(res.status, await res.json().catch(() => ({})));

            if (!current()) {
                return;
            }

            switch (outcome.kind) {
                case 'percent':
                    setPreview({ kind: 'applied', message: fmt(m.pricing.discount.percent, { amount: outcome.amount }) });
                    onApplied(trimmed);
                    break;
                case 'fixed':
                    setPreview({ kind: 'applied', message: fmt(m.pricing.discount.fixed, { amount: formatUsd(outcome.cents / 100, m.pricing.currency) }) });
                    onApplied(trimmed);
                    break;
                case 'invalid':
                    setPreview({ kind: 'error', message: m.pricing.discount.invalid });
                    break;
                case 'tooMany':
                    setPreview({ kind: 'error', message: m.forms.tooMany });
                    break;
                default:
                    setPreview({ kind: 'error', message: m.forms.failed });
            }
        } catch {
            if (current()) {
                setPreview({ kind: 'error', message: m.forms.network });
            }
        }
    }

    const inputId = `${id}-code`;
    const errorId = `${inputId}-error`;

    return (
        <Disclosure summary={m.pricing.discount.summary}>
            <form onSubmit={apply} className="grid max-w-[28rem] gap-1.5" noValidate>
                <FieldLabel htmlFor={inputId}>{m.pricing.discount.label}</FieldLabel>
                <div className="flex gap-2">
                    <Input
                        id={inputId}
                        name="discount_code"
                        autoComplete="off"
                        maxLength={50}
                        value={code}
                        invalid={preview.kind === 'error'}
                        aria-describedby={preview.kind === 'error' ? errorId : undefined}
                        onChange={(event) => {
                            setCode(event.target.value);
                            // Any check still in flight is for the code as it was.
                            ticket.current++;

                            if (preview.kind !== 'idle') {
                                setPreview({ kind: 'idle' });
                                onApplied(null);
                            }
                        }}
                    />
                    <Button type="submit" variant="secondary" loading={preview.kind === 'checking'} className="shrink-0">
                        {m.pricing.discount.apply}
                    </Button>
                </div>
                {preview.kind === 'error' && <FieldError id={errorId}>{preview.message}</FieldError>}
                <p role="status" className="type-small min-h-[1.6em] text-foreground">
                    {preview.kind === 'checking' ? m.pricing.discount.checking : preview.kind === 'applied' ? preview.message : ''}
                </p>
            </form>
        </Disclosure>
    );
}
