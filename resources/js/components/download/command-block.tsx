import { Fragment } from 'react';
import { CodeBlock } from '@/components/ui/code';
import { useI18n } from '@/i18n';

const WHOLE_TOKEN = 32;

interface CommandBlockProps {
    // One command per line, exactly as copied: no prompt.
    lines: string[];
    title: string;
    label: string;
    onCopied?: () => void;
    className?: string;
}

// One copy button takes every line. A line wraps at a space, its continuation indented so it never reads as the next
// command. Tokens are kept whole, since a browser would break one after a hyphen; a long one (a URL) may also break
// after a slash, so it wraps on a phone instead of scrolling.
export default function CommandBlock({ lines, title, label, onCopied, className }: CommandBlockProps) {
    const { m } = useI18n();

    return (
        <CodeBlock label={label} title={title} copyLabels={m.controls.copy} copySize="md" copyValue={lines.join('\n')} onCopied={onCopied} className={className}>
            <pre className="type-mono p-4 break-normal whitespace-pre-wrap text-foreground">
                <code>
                    {lines.map((line, index) => (
                        <span key={index} className="block pl-[2ch] -indent-[2ch]">
                            {line.split(' ').map((token, position) => (
                                <Fragment key={position}>
                                    {position > 0 && ' '}
                                    {(token.length > WHOLE_TOKEN ? token.split(/(?<=\/)(?!\/)/) : [token]).map((part, at) => (
                                        <Fragment key={at}>
                                            {at > 0 && <wbr />}
                                            <span className="whitespace-nowrap">{part}</span>
                                        </Fragment>
                                    ))}
                                </Fragment>
                            ))}
                        </span>
                    ))}
                </code>
            </pre>
        </CodeBlock>
    );
}
