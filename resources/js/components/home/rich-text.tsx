import { InlineCode } from '@/components/ui/code';
import { Trans, type Values } from '@/i18n';

/** The inline markers the homepage copy uses: `<code>` for literals such as `:name` or `.env`. */
const TAGS = {
    code: (text: string) => <InlineCode>{text}</InlineCode>,
};

/**
 * A sentence from the page copy, with its `{slots}` filled and its `<code>`
 * markers rendered. Never splits a sentence into translated fragments.
 */
export default function RichText({ text, values }: { text: string; values?: Values }) {
    return <Trans text={text} values={values} tags={TAGS} />;
}
