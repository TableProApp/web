/**
 * Strings, plurals and locale-aware paths for components.
 *
 * The current locale comes from the shared `locale` prop on every render.
 * There is no module-level "current locale": the SSR process renders requests
 * for different languages concurrently, so a global would leak one reader's
 * language into another's page.
 *
 * English ships in the entry bundle. Every other language's UI catalog is its
 * own chunk, loaded by the page resolver before SSR or hydration renders, and
 * kept in a cache keyed by locale. Page copy arrives per request as the
 * `content` prop instead.
 */
import { createElement, Fragment, type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import localeTable from '@data/locales.json';
import en from './messages/en/index.ts';
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

const loaders = import.meta.glob<Messages>(['./messages/*/index.ts', '!./messages/en/index.ts'], { import: 'default' });

const catalogs: Partial<Record<Locale, Messages>> = { en };

/** The language switcher names a missing page in the language it would have been in, so these few words ship for every locale. */
const controls = import.meta.glob<Messages['controls']>('./messages/*/controls.ts', { eager: true, import: 'default' });

export function isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && Object.hasOwn(localeTable.supported, value);
}

/** Loads a locale's catalog. The page resolver awaits it, so a render never finds it missing. */
export async function loadMessages(locale: Locale): Promise<void> {
    catalogs[locale] ??= await loaders[`./messages/${locale}/index.ts`]();
}

/** The catalog of the page's own locale, or of English. Any other locale is not loaded, and this throws. */
export function messagesFor(locale: Locale): Messages {
    const messages = catalogs[locale];

    if (messages === undefined) {
        throw new Error(`The ${locale} catalog is not loaded.`);
    }

    return messages;
}

export function languageCopy(locale: Locale): Messages['controls']['language'] {
    return controls[`./messages/${locale}/controls.ts`].language;
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
        m: messagesFor(locale),
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
