/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/field.tsx. Change both in the same release. See docs/shared-files.md. */
import type { InputHTMLAttributes, ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The text input (design-system §5.3.20): 40px, `--raised` fill, a
 * `--rule-strong` outline that clears 3:1 on every ground, 8px radius, and
 * 16px text, which also stops iOS zooming into the field.
 *
 * There is no `focus:` rule here on purpose. tokens.css draws the one focus
 * ring every focusable element uses; a field that suppressed it with
 * `outline-none` and drew its own ring measured about 1.6:1.
 */
export const INPUT_CLASS =
    'block min-h-10 w-full min-w-0 rounded-control border border-rule-strong bg-raised px-3 py-2 text-base leading-[1.4] text-foreground placeholder:text-muted-foreground ' +
    'disabled:cursor-not-allowed disabled:bg-surface-strong disabled:text-muted-foreground';

/** The invalid outline. Always paired with the message, never colour alone. */
export const INPUT_INVALID_CLASS = 'border-danger';

/** The `aria-describedby` a control needs: the error when there is one, otherwise the help. */
export function describedBy(id: string, { help, error }: { help?: ReactNode; error?: ReactNode }): string | undefined {
    if (error) {
        return `${id}-error`;
    }

    return help ? `${id}-help` : undefined;
}

interface FieldLabelProps {
    htmlFor: string;
    /** "(required)" in the page's language, shown after the label. Optional fields stay unmarked. */
    requiredLabel?: string;
    hidden?: boolean;
    className?: string;
    children: ReactNode;
}

/** 14/500 in the text colour, sentence case. Never uppercase, never a placeholder. */
export function FieldLabel({ htmlFor, requiredLabel, hidden = false, className, children }: FieldLabelProps) {
    return (
        <label htmlFor={htmlFor} className={cn('block text-sm leading-[1.3] font-medium text-foreground', hidden && 'sr-only', className)}>
            {children}
            {requiredLabel && <span className="font-normal text-muted-foreground"> {requiredLabel}</span>}
        </label>
    );
}

/** Help shown before anything is wrong. The error replaces it. */
export function FieldHint({ id, children }: { id?: string; children: ReactNode }) {
    return (
        <p id={id} className="type-small text-muted-foreground">
            {children}
        </p>
    );
}

/**
 * A field's error: the one place status text is coloured, with an icon so the
 * colour is never the only signal. `role="alert"` announces it when it
 * appears; the control points at it with `aria-describedby`.
 */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
    return (
        <p id={id} role="alert" className="type-small flex items-start gap-1.5 text-danger">
            <CircleAlert className="mt-[0.2em] size-4 shrink-0" aria-hidden="true" />
            <span>{children}</span>
        </p>
    );
}

/** A group of related controls with its own accessible name. */
export function Fieldset({ legend, legendHidden = true, children, className }: { legend: string; legendHidden?: boolean; children: ReactNode; className?: string }) {
    return (
        <fieldset className={cn('min-w-0', className)}>
            <legend className={cn(legendHidden ? 'sr-only' : 'mb-1.5 text-sm leading-[1.3] font-medium text-foreground')}>{legend}</legend>
            {children}
        </fieldset>
    );
}

interface FieldProps {
    /** The control's id. The help and error ids derive from it: `{id}-help`, `{id}-error`. */
    id: string;
    label: ReactNode;
    labelHidden?: boolean;
    requiredLabel?: string;
    help?: ReactNode;
    error?: ReactNode;
    className?: string;
    /** The control. Give it `aria-describedby={describedBy(id, { help, error })}`. */
    children: ReactNode;
}

/** Label 6px above the control, then the help or the error below it. */
export default function Field({ id, label, labelHidden, requiredLabel, help, error, className, children }: FieldProps) {
    return (
        <div className={cn('grid gap-1.5', className)}>
            <FieldLabel htmlFor={id} requiredLabel={requiredLabel} hidden={labelHidden}>
                {label}
            </FieldLabel>
            {children}
            {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : help ? <FieldHint id={`${id}-help`}>{help}</FieldHint> : null}
        </div>
    );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    invalid?: boolean;
}

/** A native input with the field chrome. `invalid` sets `aria-invalid` and the danger outline. */
export function Input({ invalid = false, className, ...props }: InputProps) {
    return <input {...props} aria-invalid={invalid || undefined} className={cn(INPUT_CLASS, invalid && INPUT_INVALID_CLASS, className)} />;
}

/**
 * A native checkbox or radio at 16px. `accent-color` is the indicator token,
 * so the browser draws the mark in a contrasting colour itself.
 */
export function Checkbox({ className, type = 'checkbox', ...props }: InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} type={type} className={cn('size-4 shrink-0 cursor-pointer accent-accent-indicator disabled:cursor-not-allowed', className)} />;
}
