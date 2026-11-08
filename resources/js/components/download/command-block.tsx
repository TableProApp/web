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

// One copy button takes every line. A command keeps its line and the block scrolls sideways, as a terminal would, so
// a wrapped URL never reads as two commands (owner, 2026-11-08).
export default function CommandBlock({ lines, title, label, onCopied, className }: CommandBlockProps) {
    const { m } = useI18n();

    return (
        <CodeBlock label={label} title={title} copyLabels={m.controls.copy} copySize="md" copyValue={lines.join('\n')} onCopied={onCopied} className={className}>
            <pre className="type-mono w-max min-w-full p-4 whitespace-pre text-foreground">
                <code>{lines.join('\n')}</code>
            </pre>
        </CodeBlock>
    );
}
