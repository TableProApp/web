/**
 * Locale-aware paths. Pure, with the locale table passed in, so `node --test`
 * can load this module without importing JSON.
 *
 * Components use the bound versions in `./index.ts` (`localePath`,
 * `useI18n().path`) or `<LocaleLink>`, never these directly.
 *
 * Only root-relative paths of this app are touched. External URLs,
 * `#fragments`, `mailto:`, relative paths and the platform's paths come back
 * unchanged.
 */
import type { LocaleTable } from './types.ts';

/**
 * The paths nginx sends to the platform (account) app instead of this one.
 *
 * nginx matches them at the root only, so they never take a locale prefix:
 * `/vi/account` would reach this app and answer 404. The platform reads the
 * reader's language from `?locale=`, which the caller adds; nothing here
 * appends it, because a signed URL (`/thank-you?order=…`) must reach the
 * platform exactly as it was signed.
 *
 * The same pattern as `scripts/dev-proxy.mjs` (tests/js/paths.test.ts holds
 * them equal) and as the production nginx routing.
 * nginx matches the path alone, so it needs no `?` or `#` alternative; an
 * href carries both.
 */
export const PLATFORM_PATHS = /^\/(account|checkout|webhooks|newsletter|beta|discount|thank-you|api\/newsletter|platform-build)(\/|\?|#|$)/;

/** `/account?locale=vi` and `/checkout` are the platform's; `/accounting` is not. */
export function isPlatformPath(path: string): boolean {
    return PLATFORM_PATHS.test(path);
}

function prefixOf(locale: string, table: LocaleTable): string | null {
    return table.supported[locale]?.prefix ?? null;
}

function splitSuffix(path: string): [pathname: string, suffix: string] {
    const cut = path.search(/[?#]/);

    return cut === -1 ? [path, ''] : [path.slice(0, cut), path.slice(cut)];
}

/**
 * Which locale a path belongs to, and the path without its prefix.
 *
 * `/vi/blog` → `{locale: 'vi', path: '/blog'}`; `/vi` → `{locale: 'vi', path: '/'}`;
 * `/video` → the default locale, unchanged. A query or fragment is kept on `path`.
 */
export function splitLocale(path: string, table: LocaleTable): { locale: string; path: string } {
    const [pathname, suffix] = splitSuffix(path);
    const segment = pathname.split('/')[1] ?? '';

    for (const [code, definition] of Object.entries(table.supported)) {
        if (definition.prefix !== null && definition.prefix === segment) {
            const rest = pathname.slice(segment.length + 1);

            return { locale: code, path: (rest === '' ? '/' : rest) + suffix };
        }
    }

    return { locale: table.default, path: pathname + suffix };
}

/**
 * The same page in `locale`: `localePath('/download', 'vi')` is `/vi/download`,
 * `localePath('/', 'vi')` is `/vi`. A path that already carries a locale
 * prefix is moved, not double-prefixed, so `localePath('/vi/blog', 'en')` is
 * `/blog`. Query strings and fragments are kept.
 *
 * A platform path is never prefixed, in any locale:
 * `localePath('/account?locale=vi', 'vi')` is `/account?locale=vi`, and a
 * stray `/vi/account` comes back as `/account`.
 */
export function localePath(path: string, locale: string, table: LocaleTable): string {
    if (!path.startsWith('/') || path.startsWith('//')) {
        return path;
    }

    const base = splitLocale(path, table).path;

    if (isPlatformPath(base)) {
        return base;
    }

    const prefix = prefixOf(locale, table);

    if (prefix === null) {
        return base;
    }

    const [pathname, suffix] = splitSuffix(base);

    return (pathname === '/' ? `/${prefix}` : `/${prefix}${pathname}`) + suffix;
}

/**
 * How `<LocaleLink>` renders an href.
 *
 * - `visit`: a page of this app in the current locale, so an Inertia `<Link>`
 *   and a client-side visit.
 * - `switch`: a page of this app in another locale, so a plain `<a>` with
 *   `hreflang` and `lang`, and a full document load.
 * - `plain`: anything this app does not render (an external URL, a
 *   `#fragment`, `mailto:`, a platform path), so a plain `<a>`. A platform
 *   path is never an Inertia visit: that would send an XHR into the other
 *   application and expect an Inertia response back.
 */
export interface ResolvedLink {
    href: string;
    kind: 'visit' | 'switch' | 'plain';
}

/**
 * `href` (in its base, English form) for a reader on a `current` page, going
 * to `locale`.
 */
export function resolveLink(href: string, locale: string, current: string, table: LocaleTable): ResolvedLink {
    const url = localePath(href, locale, table);

    if (!url.startsWith('/') || url.startsWith('//') || isPlatformPath(url)) {
        return { href: url, kind: 'plain' };
    }

    return { href: url, kind: locale === current ? 'visit' : 'switch' };
}
