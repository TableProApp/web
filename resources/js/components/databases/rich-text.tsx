import { createContext, useContext, type ReactNode } from 'react';
import { InlineCode } from '@/components/ui/code';
import LocaleLink from '@/components/ui/locale-link';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { Trans, useI18n, type Values } from '@/i18n';
import { splitTags } from '@/i18n/core';
import { resolveHref } from './format';

interface RichTextScope {
    // Link tag name → site path, `#fragment` or `docs:/path`.
    links: Record<string, string>;
    docsBase: string | null;
    values: Values;
}

const RichTextContext = createContext<RichTextScope>({ links: {}, docsBase: null, values: {} });

export function RichTextProvider({ scope, children }: { scope: RichTextScope; children: ReactNode }) {
    return <RichTextContext.Provider value={scope}>{children}</RichTextContext.Provider>;
}

const TIER_SLOT = /\{[A-Za-z][A-Za-z0-9]*Tier\}/g;

// Tags do not nest, so a plan-name slot is wrapped only where it sits outside one.
function linkPlanNames(text: string): string {
    return splitTags(text)
        .map((token) => (token.type === 'text' ? token.text.replace(TIER_SLOT, '<plan>$&</plan>') : `<${token.name}>${token.text}</${token.name}>`))
        .join('');
}

// One string of database copy: `<ui>`, `<code>`, a `<name>` link from the page's `links`, and plan names linked to
// pricing. A tag with no renderer prints its text, so a typo in a link name degrades to words.
export default function RichText({ text, values }: { text: string; values?: Values }) {
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

            // The docs are English only, so another language says so in words, not only with the arrow.
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
