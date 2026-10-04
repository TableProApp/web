import type { ReactNode } from 'react';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { Trans, type Values } from '@/i18n';

/**
 * The inline markup compare copy may use (./README.md):
 *
 * - `<link>…</link>`: an internal link to the item's `href`, in the reader's
 *   language. Without an `href` the text prints plainly.
 * - `<ui>…</ui>`: a label the app shows, such as a menu path.
 * - `<issues>…</issues>`: the issue tracker, passed by the hub's method section.
 *
 * Sentences stay whole: the tags only wrap words inside them, so a translator
 * can move a link wherever their grammar puts it.
 */
interface RichTextProps {
    text: string;
    values?: Values;
    /** A root-relative path for `<link>`. */
    href?: string | null;
    /** External targets by tag name, rendered as plain links: `{ issues: url }`. */
    external?: Record<string, string>;
}

export default function RichText({ text, values = {}, href = null, external = {} }: RichTextProps): ReactNode {
    const tags: Record<string, (content: string) => ReactNode> = {
        ui: (content) => <span className="font-medium">{content}</span>,
    };

    if (href !== null) {
        tags.link = (content) => (
            <LocaleLink href={href} className={textLinkClasses('inline')}>
                {content}
            </LocaleLink>
        );
    }

    for (const [name, url] of Object.entries(external)) {
        tags[name] = (content) => (
            <a href={url} className={textLinkClasses('inline')}>
                {content}
                <span aria-hidden="true">{'\u00a0↗'}</span>
            </a>
        );
    }

    return <Trans text={text} tags={tags} values={values} />;
}
