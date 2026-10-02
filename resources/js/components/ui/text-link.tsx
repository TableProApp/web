/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/text-link.tsx. Change both in the same release. See docs/shared-files.md. */
import type { AriaAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { cn } from '@/lib/utils';

export type TextLinkKind = 'inline' | 'standalone';

/**
 * Two kinds of link (design-system §5.3.2).
 *
 * - `inline`, inside a sentence: the text colour with a muted underline, both
 *   turning `--accent-text` on hover. Never colour alone (WCAG 1.4.1).
 * - `standalone`, a link on its own line that names where it goes ("See
 *   pricing →"): `--accent-text` at 14/500, underlined on hover.
 */
const KINDS: Record<TextLinkKind, string> = {
    inline:
        'text-foreground underline decoration-muted-foreground decoration-1 underline-offset-3 hover:text-accent-text hover:decoration-accent-text',
    standalone:
        'inline-flex items-baseline gap-1 text-sm leading-[1.3] font-medium tracking-[-0.006em] text-accent-text no-underline underline-offset-3 hover:underline',
};

/**
 * The class list, for an element this component cannot render: an internal
 * link the public site renders through `LocaleLink`, or an anchor that also
 * takes a ref.
 */
export function textLinkClasses(kind: TextLinkKind = 'inline', className?: string): string {
    return cn('rounded-[2px] transition-colors duration-(--dur-tap) ease-(--ease-feedback)', KINDS[kind], className);
}

interface TextLinkProps extends AriaAttributes {
    href: string;
    kind?: TextLinkKind;
    /** Leaves the site: adds a trailing ↗. Opens in the same tab unless `newTabLabel` is set. */
    external?: boolean;
    /**
     * Opens in a new tab, which is only for the rare case it cannot be
     * avoided. The text is read after the link ("(opens in a new tab)").
     */
    newTabLabel?: string;
    hrefLang?: string;
    lang?: string;
    rel?: string;
    id?: string;
    ref?: Ref<HTMLAnchorElement>;
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
    className?: string;
    children: ReactNode;
}

/**
 * A plain `<a>`.
 *
 * Always plain, never a client-side visit: links between the public site and
 * the account app cross applications, and each answers with its own HTML and
 * asset version. The public site renders its own internal links through
 * `LocaleLink` with `textLinkClasses()` instead.
 *
 * The link text names its destination. "Learn more" and "Click here" are not
 * link text.
 */
export default function TextLink({
    href,
    kind = 'inline',
    external = false,
    newTabLabel,
    rel,
    className,
    children,
    ...rest
}: TextLinkProps) {
    const newTab = newTabLabel !== undefined;

    return (
        <a
            {...rest}
            href={href}
            target={newTab ? '_blank' : undefined}
            rel={newTab ? ['noopener noreferrer', rel].filter(Boolean).join(' ') : rel}
            className={textLinkClasses(kind, className)}
        >
            {children}
            {kind === 'standalone' && !external && <span aria-hidden="true">→</span>}
            {external && <span aria-hidden="true">{kind === 'standalone' ? '↗' : ' ↗'}</span>}
            {newTab && <span className="sr-only"> {newTabLabel}</span>}
        </a>
    );
}
