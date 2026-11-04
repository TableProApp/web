import { useId, useRef, useState, type FormEvent } from 'react';
import Button from '@/components/ui/button';
import Disclosure from '@/components/ui/disclosure';
import { FieldError, FieldLabel, Input } from '@/components/ui/field';
import { useApi } from '@/hooks/use-api';
import { useI18n } from '@/i18n';
import { formatUsd } from '@/i18n/format';
import { discountOutcome } from './checkout-response';

type Preview = { kind: 'idle' } | { kind: 'checking' } | { kind: 'applied'; message: string } | { kind: 'error'; message: string };

interface DiscountFieldProps {
    onApplied: (code: string | null) => void;
}

// Under a regional discount Polar's checkout locks its own code field, so a code is typed here and checked first.
// The answer says what the code is worth, not a recomputed price: which cycles and seats it covers is Polar's rule.
export default function DiscountField({ onApplied }: DiscountFieldProps) {
    const { m, fmt } = useI18n();
    const api = useApi();
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

        // Every keystroke takes a new ticket, so the answer for a code since edited is dropped, never applied to the new one.
        const mine = ++ticket.current;
        const current = (): boolean => mine === ticket.current;

        try {
            const res = await fetch(api('/v2/discounts/preview'), {
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
                case 'accepted':
                    setPreview({ kind: 'applied', message: m.pricing.discount.accepted });
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
                        maxLength={64}
                        value={code}
                        invalid={preview.kind === 'error'}
                        aria-describedby={preview.kind === 'error' ? errorId : undefined}
                        onChange={(event) => {
                            setCode(event.target.value);
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
