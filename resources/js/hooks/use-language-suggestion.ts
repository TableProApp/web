import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { isLocale, type Locale } from '@/i18n';
import { LANGUAGE_TABLES } from '@/lib/data/language-detection';
import { dismissSuggestion, isOfferable, languageFromRegion, loadLanguageRecord, parseTraceCountry, suggestionFor } from '@/lib/language-suggestion';

let regionLanguage: Promise<string | null> | null = null;

/**
 * The language of the reader's country, asked once per document and only for
 * a reader whose browser names no supported language.
 *
 * The country is Cloudflare's, from `/cdn-cgi/trace` on this origin, which
 * the edge answers itself; nothing reaches the server and nothing is kept.
 * Without it (local development, a blocker, a timeout), the time zone's
 * country stands in.
 */
function lookUpRegionLanguage(): Promise<string | null> {
    regionLanguage ??= (async (): Promise<string | null> => {
        let country: string | null = null;
        let timeZone: string | null = null;

        try {
            const res = await fetch('/cdn-cgi/trace', { credentials: 'omit', signal: AbortSignal.timeout(2500) });

            country = res.ok ? parseTraceCountry(await res.text()) : null;
        } catch {
            // No edge answer: the time zone decides alone.
        }

        try {
            timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
        } catch {
            // No time zone either: no suggestion.
        }

        return languageFromRegion(country, timeZone, LANGUAGE_TABLES);
    })();

    return regionLanguage;
}

/**
 * The language the bar offers on this page, or null, and how to close it.
 *
 * Null on the server and on the first render, so hydration matches the
 * cached HTML; the effect then runs the head script's rule again
 * (`suggestionFor`) and keeps `html.has-language-bar` in step with it. That
 * class outlives an Inertia visit, so it is set or cleared on every page,
 * not only the first.
 */
export function useLanguageSuggestion(): { target: Locale | null; dismiss: () => void } {
    const page = usePage();
    const current = page.props.locale;
    const suggestable = page.props.localization?.suggestable;
    const [target, setTarget] = useState<Locale | null>(null);

    useEffect(() => {
        let active = true;
        const locales = suggestable ?? [];
        const record = loadLanguageRecord(LANGUAGE_TABLES);
        const languages = navigator.languages.length > 0 ? navigator.languages : [navigator.language];
        const decision = suggestionFor({ page: current, suggestable: locales, record, languages, tables: LANGUAGE_TABLES });

        function show(locale: string | null): void {
            if (!active) {
                return;
            }

            const shown = locale !== null && isLocale(locale) ? locale : null;

            document.documentElement.classList.toggle('has-language-bar', shown !== null);
            setTarget(shown);
        }

        if (decision.settled || locales.length === 0) {
            show(decision.locale);
        } else {
            void lookUpRegionLanguage().then((found) => show(found !== null && isOfferable(found, current, locales, record) ? found : null));
        }

        return () => {
            active = false;
        };
    }, [current, suggestable, page.url]);

    function dismiss(): void {
        if (target !== null) {
            dismissSuggestion(target, LANGUAGE_TABLES);
            setTarget(null);
        }
    }

    return { target, dismiss };
}
