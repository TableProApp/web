import { InlineCode } from '@/components/ui/code';
import Kbd from '@/components/ui/kbd';
import { Trans } from '@/i18n';

/**
 * The inline markup a feature content string may use (README.md):
 *
 * - `<code>…</code>`: a literal, such as `:customer_id` or `.sql`;
 * - `<kbd>…</kbd>`: a shortcut, with the app's glyphs (`⌘⇧P`);
 * - `<ui>…</ui>`: an app label or menu command, such as Restore Previous Values.
 *
 * Tags do not nest, and nothing else is markup: links go in a block's
 * `links`, never inside a sentence.
 */
const TAGS = {
    code: (text: string) => <InlineCode>{text}</InlineCode>,
    kbd: (text: string) => <Kbd>{text}</Kbd>,
    ui: (text: string) => <span className="font-medium">{text}</span>,
};

interface RichTextProps {
    text: string;
    /** The page's facts as text, for `{token}` slots. */
    values: Record<string, string>;
}

export default function RichText({ text, values }: RichTextProps) {
    return <Trans text={text} tags={TAGS} values={values} />;
}
