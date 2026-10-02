import { Link } from '@inertiajs/react';
import type { AriaAttributes, MouseEvent, ReactNode } from 'react';
import { LOCALES, localeLink, useI18n, type Locale } from '@/i18n';

interface LocaleLinkProps {
    /**
     * A root-relative path in its base (English) form: `/download`, `/compare/tableplus#pricing`.
     * A platform path (`/account?locale=vi`) or an external URL passes through unchanged.
     */
    href: string;
    /** Link to this locale instead of the current one. */
    locale?: Locale;
    className?: string;
    id?: string;
    title?: string;
    rel?: string;
    target?: string;
    /** Typed for both branches: Inertia's `<Link>` reports a plain element event. */
    onClick?: (event: MouseEvent) => void;
    'aria-label'?: string;
    'aria-current'?: AriaAttributes['aria-current'];
    'aria-describedby'?: string;
    [data: `data-${string}`]: string | undefined;
    children?: ReactNode;
}

/**
 * An internal link that stays in the reader's language.
 *
 * Same locale: an Inertia `<Link>` to the prefixed path, so navigation is a
 * client-side visit. Another locale: a plain `<a href hreflang lang>`, which
 * forces a full document load, so `<html lang>`, the Vietnamese font preload
 * and the theme script all run again for the new language.
 *
 * Anything that is not a root-relative path (an external URL, `#fragment`,
 * `mailto:`) renders as a plain `<a>` untouched. So do the platform's paths
 * (`/account`, `/checkout`, `/thank-you`, … see `PLATFORM_PATHS` in
 * `@/i18n/paths`): they belong to a different application, which nginx
 * routes by its unprefixed path, so they are never prefixed and never an
 * Inertia visit. The account app takes its language from the query, which
 * the caller adds: `/account?locale={locale}`.
 */
export default function LocaleLink({ href, locale, children, ...rest }: LocaleLinkProps) {
    const { locale: current } = useI18n();
    const target = locale ?? current;
    const link = localeLink(href, target, current);

    if (link.kind === 'visit') {
        return (
            <Link href={link.href} {...rest}>
                {children}
            </Link>
        );
    }

    if (link.kind === 'switch') {
        return (
            <a href={link.href} hrefLang={LOCALES.supported[target].hreflang} lang={target} {...rest}>
                {children}
            </a>
        );
    }

    return (
        <a href={link.href} {...rest}>
            {children}
        </a>
    );
}
