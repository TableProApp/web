import type { ReactNode } from 'react';
import CopyButton, { type CopyButtonLabels } from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

/**
 * A literal inside prose: a file name, a flag, a command (design-system
 * §5.3.12). Mono at 0.875em of the surrounding text, on `--surface` with the
 * chip radius, in the text colour.
 */
export function InlineCode({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <code className={cn('rounded-chip bg-surface px-1.5 py-0.5 font-mono text-[0.875em] text-foreground', className)}>
            {children}
        </code>
    );
}

interface CodeBlockProps {
    /**
     * Names what the block holds, for its scroll region and its copy button:
     * "MCP client configuration", "Homebrew command". A region that scrolls but
     * holds nothing focusable is unreachable from the keyboard without it.
     */
    label: string;
    /** The title bar: a file name, or "Terminal" for a command. Omitted, there is no bar. */
    title?: ReactNode;
    /**
     * The code as text. Rendered in `<pre><code>`, and what the copy button
     * copies. Leave it out to pass already-highlighted markup as `children`.
     */
    code?: string;
    /**
     * A shell command: a `$` prompt is drawn before it in the muted colour,
     * and never selected or copied.
     */
    command?: boolean;
    /** The copy button's words, in the page's language. Omitted, there is no copy button. */
    copyLabels?: CopyButtonLabels;
    /** The value to copy when `code` is not given (highlighted `children`). */
    copyValue?: string;
    className?: string;
    children?: ReactNode;
}

/**
 * A block of code (design-system §5.3.12).
 *
 * `--code-background` (the white `--raised`, where the lightest Phiki colour
 * still clears 4.5:1) inside a hairline, at the panel radius. An optional 36px
 * title bar carries the file name and the copy button; without a title the
 * copy button sits in the top-right corner.
 *
 * The body is a focusable scroll region, so a line wider than the column
 * scrolls inside the block, from the keyboard too, instead of widening the
 * page.
 */
export function CodeBlock({ label, title, code, command = false, copyLabels, copyValue, className, children }: CodeBlockProps) {
    const value = code ?? copyValue;
    const copy = copyLabels && value !== undefined ? <CopyButton value={value} label={label} labels={copyLabels} /> : null;

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
