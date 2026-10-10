/**
 * resources/data/language-detection.json and the locale allowlist, as the
 * tables `lib/language-suggestion.ts` takes. The language bar and the
 * switcher read them here; the root template's head script gets the same
 * aliases and codes from `App\Support\Localization\LanguageDetection`.
 */
import data from '@data/language-detection.json';
import { LOCALES } from '@/i18n';
import type { LanguageTables } from '@/lib/language-suggestion';

export const LANGUAGE_TABLES: LanguageTables = {
    supported: Object.fromEntries(Object.keys(LOCALES.supported).map((code) => [code.toLowerCase(), code])),
    tags: data.tags,
    countries: data.countries,
    timeZones: data.timeZones,
};
