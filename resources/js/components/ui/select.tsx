/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/select.tsx. Change both in the same release. See docs/shared-files.md. */
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INPUT_CLASS, INPUT_INVALID_CLASS } from '@/components/ui/field';

interface SelectProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    name?: string;
    required?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    className?: string;
    'aria-describedby'?: string;
}

/**
 * A native `<select>` with the field chrome and a redrawn chevron.
 *
 * Native rather than a listbox built from divs: a real select gets the
 * platform's own picker on iOS and Android, type-ahead and form semantics, none
 * of which a hand-built one reproduces without a lot of code.
 */
export default function Select({ id, value, onChange, options, name, required, disabled, invalid = false, className, ...rest }: SelectProps) {
    return (
        <div className={cn('relative', className)}>
            <select
                id={id}
                name={name}
                value={value}
                required={required}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
                aria-invalid={invalid || undefined}
                aria-describedby={rest['aria-describedby']}
                className={cn(INPUT_CLASS, 'cursor-pointer appearance-none pr-9', invalid && INPUT_INVALID_CLASS)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
        </div>
    );
}
