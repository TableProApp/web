/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/copy-button.tsx. Change both in the same release. See docs/shared-files.md. */
import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CopyButtonLabels {
    /** The visible label in the `md` size: "Copy". */
    copy: string;
    /** Shown for two seconds after a copy, and announced: "Copied". */
    copied: string;
    /** The accessible name, with `{label}` for what is copied: "Copy {label}". */
    copyNamed: string;
    /** Shown when the clipboard refuses. */
    failed: string;
}

/** English, for callers that have not passed their language yet. Localized pages pass `labels`. */
const ENGLISH: CopyButtonLabels = {
    copy: 'Copy',
    copied: 'Copied',
    copyNamed: 'Copy {label}',
    failed: "Couldn't copy. Select the text and copy it.",
};

interface CopyButtonProps {
    /** What lands on the clipboard. */
    value: string;
    /** Names what is copied, for the accessible name: "the Homebrew command". */
    label: string;
    /** `sm`: a 32px icon button. `md`: icon and the word "Copy". */
    size?: 'sm' | 'md';
    labels?: CopyButtonLabels;
    className?: string;
}

/**
 * Copy to clipboard (design-system §5.3.12).
 *
 * On success the icon becomes a check in `--accent-text` and the label reads
 * "Copied" for two seconds, announced through a polite live region instead of
 * a toast. On failure a line says so beside the button, and stays until the
 * next attempt.
 */
export default function CopyButton({ value, label, size = 'sm', labels = ENGLISH, className }: CopyButtonProps) {
    const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
        },
        [],
    );

    async function copy(): Promise<void> {
        if (timer.current) {
            clearTimeout(timer.current);
        }

        try {
            await navigator.clipboard.writeText(value);
            setState('copied');
            timer.current = setTimeout(() => setState('idle'), 2000);
        } catch {
            setState('failed');
        }
    }

    const copied = state === 'copied';
    const name = labels.copyNamed.replace('{label}', label);

    return (
        <span className={cn('relative inline-flex', className)}>
            <button
                type="button"
                onClick={copy}
                aria-label={size === 'sm' ? name : undefined}
                title={size === 'sm' ? name : undefined}
                className={cn(
                    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-control border border-transparent text-sm leading-[1.3] font-medium text-foreground',
                    'transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface active:bg-surface-strong',
                    size === 'sm' ? 'size-8' : 'min-h-8 px-3',
                )}
            >
                {copied ? (
                    <Check className="size-4 shrink-0 text-accent-text" strokeWidth={2} aria-hidden="true" />
                ) : (
                    <Copy className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                )}
                {size === 'md' && (
                    <span>
                        {copied ? labels.copied : labels.copy}
                        <span className="sr-only"> {label}</span>
                    </span>
                )}
            </button>
            <span className="sr-only" aria-live="polite">
                {copied ? labels.copied : ''}
            </span>
            {state === 'failed' && (
                <span role="alert" className="type-small absolute top-full right-0 z-10 mt-1 w-max max-w-64 rounded-control border border-rule bg-raised px-3 py-2 text-danger shadow-overlay">
                    {labels.failed}
                </span>
            )}
        </span>
    );
}
