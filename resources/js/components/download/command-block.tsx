import CopyButton from '@/components/ui/copy-button';
import { useI18n } from '@/i18n';

interface CommandBlockProps {
    /** The command exactly as it is copied, without a prompt. */
    command: string;
    /** The title bar's text, such as "Terminal". */
    title: string;
    /** Names the command for the copy button and the scroll region: "Homebrew command". */
    label: string;
}

/**
 * A shell command with a copy button (design-system §5.3.12, `command` variant).
 *
 * The `$` prompt is drawn but never selected or copied. The command sits in a
 * focusable scroll region, so a narrow screen can scroll it from the keyboard
 * instead of clipping it. No version is printed beside it: the Homebrew cask
 * can trail a release, so any version here would be wrong some of the time.
 */
export default function CommandBlock({ command, title, label }: CommandBlockProps) {
    const { m } = useI18n();

    return (
        <div className="rounded-panel border border-rule bg-raised">
            <div className="flex min-h-9 items-center justify-between gap-2 border-b border-rule pr-1 pl-4">
                <span className="type-caption text-muted-foreground">{title}</span>
                <CopyButton value={command} label={label} labels={m.controls.copy} />
            </div>
            <div role="region" aria-label={label} tabIndex={0} className="overflow-x-auto rounded-b-panel px-4 py-3">
                <pre className="type-mono text-foreground">
                    <span aria-hidden="true" className="text-muted-foreground select-none">
                        ${' '}
                    </span>
                    <code>{command}</code>
                </pre>
            </div>
        </div>
    );
}
