/**
 * Types for the UI catalogs and the locale table.
 *
 * `Messages` is derived from the English catalog, so English is the source of
 * truth for the shape: a key added to `messages/en` makes every other locale
 * fail `npm run typecheck` until it is translated, and a key that exists only
 * in another locale fails too (`satisfies` rejects excess properties).
 *
 * Every import here is type-only, so `node --test` can load modules that
 * import this file without resolving JSON or React.
 */
import type localeTable from '../../data/locales.json';
import type en from './messages/en/index.ts';

/** `'en' | 'vi'`, straight from resources/data/locales.json. */
export type Locale = keyof (typeof localeTable)['supported'];

export interface LocaleDefinition {
    native: string;
    prefix: string | null;
    hreflang: string;
    og: string;
    intl: string;
}

export interface LocaleTable {
    default: string;
    supported: Record<string, LocaleDefinition>;
}

export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * A plural message: `other` always, the rest as the language needs them.
 * English writes `one` and `other`; Vietnamese has no plural forms and writes
 * only `other`.
 */
export type PluralNode = { other: string } & Partial<Record<Exclude<PluralCategory, 'other'>, string>>;

type IsPluralNode<T> = T extends { other: string }
    ? Exclude<keyof T, PluralCategory> extends never
        ? true
        : false
    : false;

/**
 * The English catalog with every string literal widened to `string`, and every
 * plural node widened so other locales may supply a different set of forms.
 */
export type DeepWiden<T> = T extends string
    ? string
    : IsPluralNode<T> extends true
      ? PluralNode
      : { [K in keyof T]: DeepWiden<T[K]> };

export type Messages = DeepWiden<typeof en>;
