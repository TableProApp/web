/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/stepper.tsx. Change both in the same release. See docs/shared-files.md. */
import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
    id: string;
    value: number;
    /** Bounds come from data (seats: the minimum and maximum in pricing). */
    min: number;
    max: number;
    onChange: (value: number) => void;
    /** Names the quantity, for the input and the group. */
    label: string;
    /** "Decrease seats", already in the page's language. */
    decreaseLabel: string;
    increaseLabel: string;
    disabled?: boolean;
    /** Points at the help or the error, so a bound's reason is read with the control. */
    'aria-describedby'?: string;
    className?: string;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/**
 * Minus, a number field, plus (design-system §5.3.20).
 *
 * The middle is a real input with `inputmode="numeric"`, so 50 seats is typed
 * rather than clicked 45 times. What is typed is clamped to the bounds when the
 * field loses focus. A button is disabled at its bound, and the caller says why
 * in the help text.
 *
 * Buttons are 44px on touch screens and 40px elsewhere. The number is set in
 * tabular figures so the control does not change width between 9 and 10.
 */
export default function Stepper({ id, value, min, max, onChange, label, decreaseLabel, increaseLabel, disabled = false, className, ...rest }: StepperProps) {
    const [draft, setDraft] = useState(String(value));

    useEffect(() => {
        setDraft(String(value));
    }, [value]);

    function commit(raw: string): void {
        const parsed = Number.parseInt(raw, 10);
        const next = Number.isNaN(parsed) ? value : clamp(parsed, min, max);

        setDraft(String(next));

        if (next !== value) {
            onChange(next);
        }
    }

    const button =
        'inline-flex size-10 shrink-0 cursor-pointer items-center justify-center text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) pointer-coarse:size-11 focus-visible:-outline-offset-2 ' +
        'hover:bg-surface active:bg-surface-strong disabled:cursor-not-allowed disabled:bg-surface-strong disabled:text-muted-foreground';

    return (
        <div
            role="group"
            aria-label={label}
            className={cn('inline-flex items-stretch overflow-hidden rounded-control border border-rule-strong bg-raised', className)}
        >
            <button
                type="button"
                className={cn(button, 'border-r border-rule')}
                onClick={() => onChange(clamp(value - 1, min, max))}
                disabled={disabled || value <= min}
                aria-label={decreaseLabel}
                aria-controls={id}
            >
                <Minus className="size-4" strokeWidth={2} aria-hidden="true" />
            </button>
            <input
                id={id}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={draft}
                disabled={disabled}
                aria-label={label}
                aria-describedby={rest['aria-describedby']}
                onChange={(event) => setDraft(event.target.value.replace(/[^0-9]/g, ''))}
                onBlur={(event) => commit(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        commit(event.currentTarget.value);
                    }
                }}
                className="w-14 min-w-0 bg-transparent text-center focus-visible:-outline-offset-2 text-base font-medium tabular-nums text-foreground disabled:text-muted-foreground"
            />
            <button
                type="button"
                className={cn(button, 'border-l border-rule')}
                onClick={() => onChange(clamp(value + 1, min, max))}
                disabled={disabled || value >= max}
                aria-label={increaseLabel}
                aria-controls={id}
            >
                <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            </button>
        </div>
    );
}
