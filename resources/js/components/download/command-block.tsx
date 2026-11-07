import { Fragment } from 'react';
import { CodeBlock } from '@/components/ui/code';
import { useI18n } from '@/i18n';

interface CommandBlockProps {
    // One command per line, exactly as copied: no prompt.
    lines: string[];
    title: string;
    label: string;
    onCopied?: () => void;
    className?: string;
}

// One copy button takes every line. A line wraps only at a space (a browser would also break after a hyphen, so every
// token is kept whole), its continuation indented so it never reads as the next command; a token wider than the block
// (a URL) scrolls inside it.
export default function CommandBlock({ lines, title, label, onCopied, className }: CommandBlockProps) {
    const { m } = useI18n();

    return (
        <CodeBlock label={label} title={title} copyLabels={m.controls.copy} copyValue={lines.join('\n')} onCopied={onCopied} className={className}>
            <pre className="type-mono p-4 break-normal whitespace-pre-wrap text-foreground">
                <code>
                    {lines.map((line, index) => (
                        <span key={index} className="block pl-[2ch] -indent-[2ch]">
                            {line.split(' ').map((token, position) => (
                                <Fragment key={position}>
                                    {position > 0 && ' '}
                                    <span className="whitespace-nowrap">{token}</span>
                                </Fragment>
                            ))}
                        </span>
                    ))}
                </code>
            </pre>
        </CodeBlock>
    );
}
