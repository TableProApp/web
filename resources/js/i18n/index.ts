/**
 * Strings, plurals and locale-aware paths for components.
 *
 * The current locale comes from the shared `locale` prop on every render.
 * There is no module-level "current locale": the SSR process renders requests
 * for both languages concurrently, so a global would leak one reader's
 * language into another's page.
 *
 * Both locales' UI catalogs ship in the bundle. They are small; page copy
 * arrives per request as the `content` prop instead.
 */
import { createElement, Fragment, type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import localeTable from '@data/locales.json';
import en from './messages/en/index.ts';
import vi from './messages/vi/index.ts';
import { interpolate, plural as pluralize, splitTags, type Values } from './core.ts';
import * as format from './format.ts';
import { localePath as toLocalePath, resolveLink, type ResolvedLink } from './paths.ts';
import type { Locale, LocaleTable, Messages, PluralNode } from './types.ts';

export type { Locale, Messages, PluralNode } from './types.ts';
export type { Values } from './core.ts';
export type { ResolvedLink } from './paths.ts';
export { isPlatformPath, PLATFORM_PATHS } from './paths.ts';

export const LOCALES: LocaleTable = localeTable;

export const DEFAULT_LOCALE = localeTable.default as Locale;

const catalogs: Record<Locale, Messages> = { en, vi };

export function isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && Object.hasOwn(catalogs, value);
}

export function messagesFor(locale: Locale): Messages {
    return catalogs[locale];
}

/** `localePath('/download', 'vi')` → `/vi/download`; `/account` stays `/account`. See ./paths.ts. */
export function localePath(path: string, locale: Locale): string {
    return toLocalePath(path, locale, LOCALES);
}

/** How `<LocaleLink>` renders `href` on a `current` page, linking to `locale`. See ./paths.ts. */
export function localeLink(href: string, locale: Locale, current: Locale): ResolvedLink {
    return resolveLink(href, locale, current, LOCALES);
}

/**
 * The current locale and everything bound to it.
 *
 * - `m`: the catalog, by property access (`m.errors.notFound.title`), so a
 *   missing key is a type error rather than a blank on the page.
 * - `fmt`: fills `{name}` slots.
 * - `plural`: picks the CLDR plural form for a count.
 * - `path`: prefixes a root-relative path with the current locale.
 * - `format`: deterministic number, price and list formatting.
 */
export function useI18n() {
    const raw = usePage().props.locale;
    const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

    return {
        locale,
        m: catalogs[locale],
        fmt: interpolate,
        plural: (node: PluralNode, count: number, values?: Values): string =>
            pluralize(node, count, LOCALES.supported[locale].intl, values),
        path: (path: string): string => localePath(path, locale),
        format,
    };
}

interface TransProps {
    /** A catalog string with `<tag>…</tag>` markers and `{name}` slots. */
    text: string;
    /** Renders each marker's text: `{ link: (text) => <LocaleLink href="/pricing">{text}</LocaleLink> }`. */
    tags?: Record<string, (text: string) => ReactNode>;
    values?: Values;
}

/**
 * Inline markup inside a translated sentence, without splitting the sentence.
 *
 * `<Trans text={m.x} tags={{ link: (t) => <a href="/x">{t}</a> }} />` lets the
 * translator place the link wherever their grammar puts it. A marker with no
 * renderer prints its text plainly.
 */
export function Trans({ text, tags = {}, values = {} }: TransProps): ReactNode {
    const children = splitTags(text).map((token, index) => {
        const filled = interpolate(token.text, values);

        if (token.type === 'text') {
            return filled;
        }

        const render = tags[token.name];

        return createElement(Fragment, { key: index }, render ? render(filled) : filled);
    });

    return createElement(Fragment, null, ...children);
}
