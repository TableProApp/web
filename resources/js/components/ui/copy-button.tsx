import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
    /** What lands on the clipboard. */
    value: string;
    /** Names the thing being copied, for the button's accessible name. */
    label: string;
    className?: string;
}

/**
 * Copy to clipboard, with the tick that confirms it.
 *
 * The identical logic existed twice — the MCP config block and the Homebrew
 * command — down to the same 1200ms timeout, the same toast strings and the
 * same cleanup effect, but with forked chrome: one had a visible boundary and
 * one did not.
 *
 * The timeout is cleared on unmount and before each restart, because a copy
 * button that unmounts mid-timer otherwise sets state on a gone component.
 */
export default function CopyButton({ value, label, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        },
        [],
    );

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(value);
            toast('Copied');
            setCopied(true);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => setCopied(false), 1200);
        } catch {
            toast.error('Could not copy. Select the text and copy it by hand.');
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy ${label}`}
            className={cn(
                'inline-flex size-7 shrink-0 items-center justify-center rounded-key text-muted-foreground',
                'transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground',
                className,
            )}
        >
            {copied ? (
                <Check className="size-4 text-primary-strong" strokeWidth={1.75} aria-hidden="true" />
            ) : (
                <Copy className="size-4" strokeWidth={1.75} aria-hidden="true" />
            )}
        </button>
    );
}
