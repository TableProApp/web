import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
    id: string;
    value: number;
    min: number;
    // Null is no upper bound.
    max: number | null;
    onChange: (value: number) => void;
    label: string;
    decreaseLabel: string;
    increaseLabel: string;
    disabled?: boolean;
    'aria-describedby'?: string;
    className?: string;
}

function clamp(value: number, min: number, max: number | null): number {
    return Math.max(min, max === null ? value : Math.min(max, value));
}

// A typed count is clamped on blur or Enter; a button at its bound is disabled, and the caller's help text says why.
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
        'hover:bg-surface active:bg-surface-strong disabled:cursor-not-allowed disabled:bg-control-disabled disabled:text-muted-foreground';

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
                disabled={disabled || (max !== null && value >= max)}
                aria-label={increaseLabel}
                aria-controls={id}
            >
                <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            </button>
        </div>
    );
}
