import type { ReactNode } from 'react';
import CopyButton, { type CopyButtonLabels } from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

// Up to this many characters, inline code never breaks: a flag split after `--` reads as two tokens.
const NOWRAP_LIMIT = 32;

export function InlineCode({ children, className }: { children: ReactNode; className?: string }) {
    const text = typeof children === 'string' ? children : null;
    // A short token stays whole; a long one (a full command, a path) may break anywhere rather than overflow a phone.
    const wrap = text !== null && text.length <= NOWRAP_LIMIT ? 'whitespace-nowrap' : '[overflow-wrap:anywhere]';

    return (
        <code className={cn('rounded-chip bg-surface px-1.5 py-0.5 font-mono text-[0.875em] text-foreground', wrap, className)}>
            {children}
        </code>
    );
}

interface CodeBlockProps {
    // Names the block for its scroll region and its copy button: "Homebrew command". A region that scrolls but holds
    // nothing focusable is unreachable from the keyboard without it.
    label: string;
    // "Terminal" or a file name. Without it there is no bar and the copy button sits in the corner.
    title?: ReactNode;
    // Rendered in `<pre><code>` and copied. Leave it out to pass markup as `children`.
    code?: string;
    // Draws a `$` prompt that is never selected or copied.
    command?: boolean;
    // Without them there is no copy button.
    copyLabels?: CopyButtonLabels;
    // `md` writes "Copy" and "Copied" beside the icon.
    copySize?: 'sm' | 'md';
    // What to copy when `code` is not given.
    copyValue?: string;
    onCopied?: () => void;
    className?: string;
    children?: ReactNode;
}

// A line wider than the column scrolls inside the block, from the keyboard too, instead of widening the page.
export function CodeBlock({ label, title, code, command = false, copyLabels, copySize, copyValue, onCopied, className, children }: CodeBlockProps) {
    const value = code ?? copyValue;
    const copy = copyLabels && value !== undefined ? <CopyButton value={value} label={label} size={copySize} labels={copyLabels} onCopied={onCopied} /> : null;

    return (
        <div className={cn('relative min-w-0 rounded-panel border border-(--code-border) bg-(--code-background)', className)}>
            {title !== undefined && (
                <div className="flex min-h-9 items-center justify-between gap-2 border-b border-rule pr-1 pl-4">
                    <span className="type-caption text-muted-foreground">{title}</span>
                    {copy}
                </div>
            )}
            {title === undefined && copy && <div className="absolute top-1 right-1 z-[1]">{copy}</div>}
            <div role="region" aria-label={label} tabIndex={0} className="overflow-x-auto rounded-b-panel focus-visible:-outline-offset-2">
                {code !== undefined ? (
                    <pre className={cn('type-mono p-4 text-foreground', title === undefined && copy && 'pr-12')}>
                        {command && (
                            <span aria-hidden="true" className="text-muted-foreground select-none">
                                ${' '}
                            </span>
                        )}
                        <code>{code}</code>
                    </pre>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}

export default CodeBlock;
