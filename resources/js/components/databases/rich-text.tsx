import { createContext, useContext, type ReactNode } from 'react';
import { InlineCode } from '@/components/ui/code';
import LocaleLink from '@/components/ui/locale-link';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { Trans, useI18n, type Values } from '@/i18n';
import { splitTags } from '@/i18n/core';
import { resolveHref } from './format';

interface RichTextScope {
    /** The page's link tags: tag name → path, `#fragment` or `docs:/path`. */
    links: Record<string, string>;
    /** docs.tablepro.app, with no trailing slash. */
    docsBase: string | null;
    /** The `{token}` values every string on the page can use. */
    values: Values;
}

const RichTextContext = createContext<RichTextScope>({ links: {}, docsBase: null, values: {} });

export function RichTextProvider({ scope, children }: { scope: RichTextScope; children: ReactNode }) {
    return <RichTextContext.Provider value={scope}>{children}</RichTextContext.Provider>;
}

interface RichTextProps {
    text: string;
    /** Values for this string only, over the page's: a family section fills `{dumpTool}` with its own engine's tool. */
    values?: Values;
}

const TIER_SLOT = /\{[A-Za-z][A-Za-z0-9]*Tier\}/g;

// Tags do not nest, so a plan-name slot is wrapped only where it sits outside one.
function linkPlanNames(text: string): string {
    return splitTags(text)
        .map((token) => (token.type === 'text' ? token.text.replace(TIER_SLOT, '<plan>$&</plan>') : `<${token.name}>${token.text}</${token.name}>`))
        .join('');
}

/**
 * One string of database-page copy, with its inline markup.
 *
 * - `<ui>Label</ui>`: an app control's name, in medium weight.
 * - `<code>text</code>`: a literal: a command, a URL scheme, a statement.
 * - `<name>text</name>`, where `name` is a key of the page's `links`: a link.
 *   Site paths stay in the reader's language. Docs links leave the site for
 *   English pages, so outside English they say so in words, not only with ↗.
 * - `{compareSyncTier}` and the other plan-name slots link to pricing.
 *
 * Tags do not nest, and a tag with no renderer prints its text plainly, so a
 * typo in a link name degrades to words rather than breaking the sentence.
 */
export default function RichText({ text, values }: RichTextProps) {
    const scope = useContext(RichTextContext);
    const { locale, m } = useI18n();
    const tags: Record<string, (content: string) => ReactNode> = {
        ui: (content) => <span className="font-medium">{content}</span>,
        code: (content) => <InlineCode>{content}</InlineCode>,
        plan: (content) => (
            <LocaleLink href="/pricing" className={textLinkClasses('inline')}>
                {content}
            </LocaleLink>
        ),
    };

    for (const [name, value] of Object.entries(scope.links)) {
        const target = resolveHref(value, scope.docsBase);

        if (target === null) {
            continue;
        }

        tags[name] = (content) => {
            if (target.kind === 'internal') {
                return (
                    <LocaleLink href={target.href} className={textLinkClasses('inline')}>
                        {content}
                    </LocaleLink>
                );
            }

            if (target.kind === 'fragment') {
                return (
                    <a href={target.href} className={textLinkClasses('inline')}>
                        {content}
                    </a>
                );
            }

            return (
                <TextLink href={target.href} external hrefLang="en">
                    {content}
                    {locale !== 'en' && ` ${m.common.englishOnly}`}
                </TextLink>
            );
        };
    }

    return <Trans text={linkPlanNames(text)} tags={tags} values={{ ...scope.values, ...values }} />;
}
