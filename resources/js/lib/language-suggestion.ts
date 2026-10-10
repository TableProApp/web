/**
 * Which language to offer a reader who may prefer another one, and what the
 * reader has said about it.
 *
 * The page's language is its URL's and nothing changes that: there is no
 * redirect, cookie or server decision. This only picks the one bar that
 * offers the same page in another language (`LanguageBar`), decided in the
 * browser because the HTML is cached at the edge for every reader alike.
 *
 * The reader's language, first match wins:
 *
 * 1. the language they picked, in the switcher or in the bar (`chosen`);
 * 2. the first browser language that maps to a supported locale;
 * 3. only when neither exists: the country Cloudflare names, then the time
 *    zone's country, mapped to its one language (`languageFromRegion`).
 *
 * It is offered only when it is not the page's, the page exists in it
 * (`suggestable`), and the reader has not closed the bar for it.
 *
 * The record lives in `localStorage` under `tablepro:language` as
 * `{"chosen": "vi", "dismissed": ["de"]}`. The root template's head script
 * runs steps 1 and 2 before first paint with the same rule as
 * `suggestionFor`; tests/js/language-suggestion.test.ts runs that script
 * against this module.
 *
 * Pure apart from the browser globals `chooseLanguage` and
 * `dismissSuggestion` touch, and with no imports, so `node --test` loads it
 * directly. The tables come from resources/data/language-detection.json and
 * locales.json (`lib/data/language-detection.ts`).
 */

export const LANGUAGE_STORAGE_KEY = 'tablepro:language';

export interface LanguageTables {
    /** Every supported code, keyed by its lowercase form: `{ 'pt-br': 'pt-BR' }`. */
    supported: Readonly<Record<string, string>>;
    /** Lowercase tag aliases: `{ 'zh-tw': 'zh-Hant', pt: 'pt-BR' }`. */
    tags: Readonly<Record<string, string>>;
    /** Country to locale, for countries with one dominant supported language. */
    countries: Readonly<Record<string, string>>;
    /** IANA time zone to country. */
    timeZones: Readonly<Record<string, string>>;
}

export interface LanguageRecord {
    chosen: string | null;
    dismissed: string[];
}

export interface Suggestion {
    /** The locale to offer, or null. */
    locale: string | null;
    /** False when the reader's language is unknown, so the page may look up their region. */
    settled: boolean;
}

function lookup(table: Readonly<Record<string, string>>, key: string): string | null {
    return Object.hasOwn(table, key) ? table[key] : null;
}

function isSupported(code: unknown, tables: Pick<LanguageTables, 'supported'>): code is string {
    return typeof code === 'string' && lookup(tables.supported, code.toLowerCase()) === code;
}

/**
 * The supported locale a browser language tag asks for, or null. The tag is
 * lowercased and loses its last subtag until it is an alias or a supported
 * code: `zh-Hant-HK` → `zh-hant`, `pt-PT` → `pt` → `pt-BR`, `en-GB` → `en`.
 */
export function matchLanguageTag(tag: string, tables: Pick<LanguageTables, 'supported' | 'tags'>): string | null {
    let candidate = tag.trim().toLowerCase().replace(/_/g, '-');

    while (candidate !== '') {
        const match = lookup(tables.tags, candidate) ?? lookup(tables.supported, candidate);

        if (match !== null) {
            return isSupported(match, tables) ? match : null;
        }

        candidate = candidate.slice(0, Math.max(0, candidate.lastIndexOf('-')));
    }

    return null;
}

/** The first of the browser's languages, in its order, that maps to a supported locale. */
export function firstSupportedLanguage(languages: readonly string[], tables: Pick<LanguageTables, 'supported' | 'tags'>): string | null {
    for (const tag of languages) {
        const match = matchLanguageTag(tag, tables);

        if (match !== null) {
            return match;
        }
    }

    return null;
}

/** The stored record. Anything unreadable, and any code that is not supported, counts as nothing said. */
export function readLanguageRecord(stored: string | null, tables: Pick<LanguageTables, 'supported'>): LanguageRecord {
    let record: unknown;

    try {
        record = JSON.parse(stored ?? 'null');
    } catch {
        record = null;
    }

    if (record === null || typeof record !== 'object') {
        return { chosen: null, dismissed: [] };
    }

    const { chosen, dismissed } = record as Partial<Record<keyof LanguageRecord, unknown>>;

    return {
        chosen: isSupported(chosen, tables) ? chosen : null,
        dismissed: Array.isArray(dismissed) ? dismissed.filter((code): code is string => isSupported(code, tables)) : [],
    };
}

/** Whether a reader's language is worth a bar on this page. */
export function isOfferable(locale: string, page: string, suggestable: readonly string[], record: LanguageRecord): boolean {
    return locale !== page && suggestable.includes(locale) && !record.dismissed.includes(locale);
}

/**
 * Steps 1 and 2: the reader's chosen or browser language, offered when
 * `isOfferable`. Unsettled only when neither is known; then, and only then,
 * the page may ask for the reader's region.
 */
export function suggestionFor(input: {
    page: string;
    suggestable: readonly string[];
    record: LanguageRecord;
    languages: readonly string[];
    tables: Pick<LanguageTables, 'supported' | 'tags'>;
}): Suggestion {
    const wanted = input.record.chosen ?? firstSupportedLanguage(input.languages, input.tables);

    if (wanted === null) {
        return { locale: null, settled: false };
    }

    return { locale: isOfferable(wanted, input.page, input.suggestable, input.record) ? wanted : null, settled: true };
}

/**
 * Step 3: the language of the reader's country, or of their time zone's
 * country when the country is unknown. A country with several languages
 * (CH, CA, IN, …) gives none, and its time zone is not asked.
 */
export function languageFromRegion(country: string | null, timeZone: string | null, tables: LanguageTables): string | null {
    const region = country ?? (timeZone === null ? null : lookup(tables.timeZones, timeZone));
    const locale = region === null ? null : lookup(tables.countries, region);

    return isSupported(locale, tables) ? locale : null;
}

/** The country in the body of Cloudflare's `/cdn-cgi/trace`, or null for none, unknown (XX) or Tor (T1). */
export function parseTraceCountry(body: string): string | null {
    const country = /^loc=([A-Z]{2})$/m.exec(body)?.[1] ?? null;

    return country === 'XX' || country === 'T1' ? null : country;
}

/** The record after the reader picks a language: it becomes theirs, and is no longer closed. */
export function withChoice(record: LanguageRecord, locale: string): LanguageRecord {
    return { chosen: locale, dismissed: record.dismissed.filter((code) => code !== locale) };
}

/** The record after the reader closes the bar for a language: never offered again, and no longer their pick. */
export function withDismissal(record: LanguageRecord, locale: string): LanguageRecord {
    return {
        chosen: record.chosen === locale ? null : record.chosen,
        dismissed: record.dismissed.includes(locale) ? record.dismissed : [...record.dismissed, locale],
    };
}

/** This browser's record, or an empty one where storage is unavailable (a private window). */
export function loadLanguageRecord(tables: Pick<LanguageTables, 'supported'>): LanguageRecord {
    try {
        return readLanguageRecord(window.localStorage.getItem(LANGUAGE_STORAGE_KEY), tables);
    } catch {
        return readLanguageRecord(null, tables);
    }
}

function update(change: (record: LanguageRecord) => LanguageRecord, tables: Pick<LanguageTables, 'supported'>): void {
    try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(change(loadLanguageRecord(tables))));
    } catch {
        // No storage: the choice lasts for this page only.
    }
}

/** Records a language the reader picked, in the switcher or in the bar. */
export function chooseLanguage(locale: string, tables: Pick<LanguageTables, 'supported'>): void {
    update((record) => withChoice(record, locale), tables);
}

/** Records that the reader closed the bar for a language, and hides the bar now. */
export function dismissSuggestion(locale: string, tables: Pick<LanguageTables, 'supported'>): void {
    update((record) => withDismissal(record, locale), tables);
    document.documentElement.classList.remove('has-language-bar');
}
