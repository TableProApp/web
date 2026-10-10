import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
    LANGUAGE_STORAGE_KEY,
    chooseLanguage,
    dismissSuggestion,
    firstSupportedLanguage,
    languageFromRegion,
    matchLanguageTag,
    parseTraceCountry,
    readLanguageRecord,
    suggestionFor,
    withChoice,
    withDismissal,
    type LanguageTables,
} from '../../resources/js/lib/language-suggestion.ts';

/*
 * Which language the bar offers, and the head script that decides it before
 * first paint. Run with `npm run test:js`.
 *
 * The head script in app.blade.php cannot import this module, so it repeats
 * the rule in plain JavaScript; the parity test runs that script against
 * `suggestionFor` for every case, the way banner.test.ts does for the license
 * banner.
 */

const read = (path: string): string => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

const detection = JSON.parse(read('resources/data/language-detection.json')) as Omit<LanguageTables, 'supported'>;
const codes = Object.keys((JSON.parse(read('resources/data/locales.json')) as { supported: Record<string, unknown> }).supported);

const tables: LanguageTables = {
    supported: Object.fromEntries(codes.map((code) => [code.toLowerCase(), code])),
    tags: detection.tags,
    countries: detection.countries,
    timeZones: detection.timeZones,
};

test('a browser tag matches the locale it asks for', () => {
    const cases: [string, string | null][] = [
        ['vi', 'vi'],
        ['vi-VN', 'vi'],
        ['vi_VN', 'vi'],
        ['en-GB', 'en'],
        ['es-419', 'es'],
        ['de-AT', 'de'],
        ['zh-TW', 'zh-Hant'],
        ['zh-HK', 'zh-Hant'],
        ['zh-Hant', 'zh-Hant'],
        ['zh-Hant-HK', 'zh-Hant'],
        ['zh', 'zh-Hans'],
        ['zh-CN', 'zh-Hans'],
        ['zh-SG', 'zh-Hans'],
        ['zh-Hans-CN', 'zh-Hans'],
        ['pt', 'pt-BR'],
        ['pt-PT', 'pt-BR'],
        ['pt-BR', 'pt-BR'],
        ['in', 'id'],
        ['nb-NO', null],
        ['hu', null],
        ['constructor', null],
        ['', null],
    ];

    for (const [tag, locale] of cases) {
        assert.equal(matchLanguageTag(tag, tables), locale, tag);
    }

    assert.equal(firstSupportedLanguage(['nb-NO', 'nb', 'de-DE', 'en'], tables), 'de', 'the first supported one, in the browser\'s order');
    assert.equal(firstSupportedLanguage(['hu', 'nb'], tables), null);
});

test('the stored record keeps only what is readable and supported', () => {
    assert.deepEqual(readLanguageRecord(null, tables), { chosen: null, dismissed: [] });
    assert.deepEqual(readLanguageRecord('not json', tables), { chosen: null, dismissed: [] });
    assert.deepEqual(readLanguageRecord('[]', tables), { chosen: null, dismissed: [] });
    assert.deepEqual(readLanguageRecord('{"chosen":5,"dismissed":"vi"}', tables), { chosen: null, dismissed: [] });
    assert.deepEqual(readLanguageRecord('{"chosen":"xx","dismissed":["vi","xx","VI"]}', tables), { chosen: null, dismissed: ['vi'] });
    assert.deepEqual(readLanguageRecord('{"chosen":"pt-BR","dismissed":[]}', tables), { chosen: 'pt-BR', dismissed: [] });
});

test('a pick becomes the reader\'s and is no longer closed; a close stops it for good', () => {
    assert.deepEqual(withChoice({ chosen: null, dismissed: ['vi', 'de'] }, 'vi'), { chosen: 'vi', dismissed: ['de'] });
    assert.deepEqual(withDismissal({ chosen: 'vi', dismissed: [] }, 'vi'), { chosen: null, dismissed: ['vi'] });
    assert.deepEqual(withDismissal({ chosen: 'en', dismissed: ['vi'] }, 'vi'), { chosen: 'en', dismissed: ['vi'] });
});

test('choosing and dismissing write the record, and survive a storage that throws', () => {
    const stored: Record<string, string> = {};
    const removed: string[] = [];

    Object.assign(globalThis, {
        window: {
            localStorage: {
                getItem: (key: string) => stored[key] ?? null,
                setItem: (key: string, value: string) => {
                    stored[key] = value;
                },
            },
        },
        document: { documentElement: { classList: { remove: (cls: string) => removed.push(cls) } } },
    });

    chooseLanguage('ja', tables);
    assert.deepEqual(JSON.parse(stored[LANGUAGE_STORAGE_KEY]), { chosen: 'ja', dismissed: [] });

    dismissSuggestion('vi', tables);
    assert.deepEqual(JSON.parse(stored[LANGUAGE_STORAGE_KEY]), { chosen: 'ja', dismissed: ['vi'] });
    assert.deepEqual(removed, ['has-language-bar']);

    Object.assign(globalThis, {
        window: {
            localStorage: {
                getItem: () => {
                    throw new Error('private window');
                },
            },
        },
    });

    assert.doesNotThrow(() => chooseLanguage('vi', tables));
    dismissSuggestion('vi', tables);
    assert.equal(removed.length, 2, 'the bar still goes away for this page');
});

test('a country, or else a time zone, gives its one language', () => {
    assert.equal(languageFromRegion('VN', null, tables), 'vi');
    assert.equal(languageFromRegion('BR', null, tables), 'pt-BR');
    assert.equal(languageFromRegion('US', 'Asia/Ho_Chi_Minh', tables), 'en', 'the country wins over the time zone');
    assert.equal(languageFromRegion('CH', 'Europe/Zurich', tables), null, 'a country with several languages gives none');
    assert.equal(languageFromRegion('CA', 'America/New_York', tables), null, 'and its time zone is not asked');
    assert.equal(languageFromRegion(null, 'Asia/Saigon', tables), 'vi');
    assert.equal(languageFromRegion(null, 'Asia/Ho_Chi_Minh', tables), 'vi');
    assert.equal(languageFromRegion(null, 'Europe/Zurich', tables), null);
    assert.equal(languageFromRegion(null, null, tables), null);
});

test('Cloudflare\'s trace names the country, and nothing for unknown or Tor', () => {
    const trace = (loc: string): string => `fl=123\nh=tablepro.app\nip=203.0.113.9\nts=1\nvisit_scheme=https\nloc=${loc}\ntls=TLSv1.3\n`;

    assert.equal(parseTraceCountry(trace('VN')), 'VN');
    assert.equal(parseTraceCountry(trace('XX')), null);
    assert.equal(parseTraceCountry(trace('T1')), null);
    assert.equal(parseTraceCountry('<!doctype html><p>Not found</p>'), null);
});

test('every table maps only to what exists', () => {
    for (const [tag, locale] of Object.entries(tables.tags)) {
        assert.equal(tag, tag.toLowerCase(), `${tag} is matched lowercased`);
        assert.ok(codes.includes(locale), `tag ${tag} → ${locale}`);
    }

    for (const [country, locale] of Object.entries(tables.countries)) {
        assert.match(country, /^[A-Z]{2}$/);
        assert.ok(codes.includes(locale), `country ${country} → ${locale}`);
    }

    for (const [zone, country] of Object.entries(tables.timeZones)) {
        assert.ok(Object.hasOwn(tables.countries, country), `${zone} names ${country}, which has no language`);
    }

    for (const country of ['CA', 'CH', 'BE', 'LU', 'IN', 'SG']) {
        assert.ok(!Object.hasOwn(tables.countries, country), `${country} has several languages`);
    }
});

/** [name, stored record, browser languages, page, suggestable, offered locale or null, settled] */
const cases: [string, string | null, string[], string, string[], string | null, boolean][] = [
    ['a vietnamese browser on an english page', null, ['vi-VN', 'vi', 'en'], 'en', ['vi', 'de'], 'vi', true],
    ['taiwan', null, ['zh-TW'], 'en', ['zh-Hant'], 'zh-Hant', true],
    ['a traditional script with a region', null, ['zh-Hant-HK'], 'en', ['zh-Hant'], 'zh-Hant', true],
    ['simplified chinese', null, ['zh-Hans-CN'], 'en', ['zh-Hans'], 'zh-Hans', true],
    ['portugal', null, ['pt-PT'], 'en', ['pt-BR'], 'pt-BR', true],
    ['an english browser on a vietnamese page', null, ['en-GB'], 'vi', ['en'], 'en', true],
    ['the browser\'s language is the page\'s', null, ['en-US', 'vi'], 'en', ['vi'], null, true],
    ['the first supported language wins', null, ['nb', 'de'], 'en', ['de', 'vi'], 'de', true],
    ['no supported browser language', null, ['hu', 'nb'], 'en', ['vi'], null, false],
    ['no browser language at all', null, [], 'en', ['vi'], null, false],
    ['a pick beats the browser', '{"chosen":"ja","dismissed":[]}', ['vi'], 'en', ['vi', 'ja'], 'ja', true],
    ['a pick of the page\'s language', '{"chosen":"en","dismissed":[]}', ['vi'], 'en', ['vi'], null, true],
    ['a pick the page does not exist in', '{"chosen":"ja","dismissed":[]}', ['vi'], 'en', ['vi'], null, true],
    ['a closed language', '{"chosen":null,"dismissed":["vi"]}', ['vi'], 'en', ['vi'], null, true],
    ['another closed language', '{"dismissed":["de"]}', ['vi'], 'en', ['vi', 'de'], 'vi', true],
    ['a page with no vietnamese version', null, ['vi'], 'en', ['de'], null, true],
    ['an unsupported pick', '{"chosen":"xx"}', ['vi'], 'en', ['vi'], 'vi', true],
    ['an unreadable record', '{chosen', ['vi'], 'en', ['vi'], 'vi', true],
    ['a record of the wrong shape', '[]', ['vi'], 'en', ['vi'], 'vi', true],
];

test('suggestionFor offers the reader\'s language only where the page exists in it', () => {
    for (const [name, stored, languages, page, suggestable, offered, settled] of cases) {
        const decision = suggestionFor({ page, suggestable, record: readLanguageRecord(stored, tables), languages, tables });

        assert.deepEqual(decision, { locale: offered, settled }, name);
    }
});

test('the head script shows the bar exactly when suggestionFor offers a language', () => {
    const blade = read('resources/views/app.blade.php');
    const start = blade.indexOf('/* language-suggestion:start */');
    const end = blade.indexOf('/* language-suggestion:end */', start);

    assert.ok(start > 0 && end > start, 'the suggestion script is in app.blade.php');
    assert.ok(!blade.slice(start, end).includes('has-banner'), 'it leaves the license banner\'s class alone');

    const body = blade.slice(start, end);

    for (const [name, stored, languages, page, suggestable, offered] of cases) {
        const added: string[] = [];
        // The script's own guard, as it stands in the template around this body.
        const run = new Function('config', 'localStorage', 'navigator', 'document', `try { ${body} } catch (e) {}`);

        run(
            { page, suggestable, supported: tables.supported, tags: tables.tags },
            { getItem: (key: string) => (key === LANGUAGE_STORAGE_KEY ? stored : null) },
            { languages, language: languages[0] ?? '' },
            { documentElement: { classList: { add: (cls: string) => added.push(cls) } } },
        );

        assert.equal(added.includes('has-language-bar'), offered !== null, `head script: ${name}`);
    }

    const added: string[] = [];

    new Function('config', 'localStorage', 'navigator', 'document', `try { ${body} } catch (e) {}`)(
        { page: 'en', suggestable: ['vi'], supported: tables.supported, tags: tables.tags },
        {
            getItem: () => {
                throw new Error('private window');
            },
        },
        { languages: ['vi'], language: 'vi' },
        { documentElement: { classList: { add: (cls: string) => added.push(cls) } } },
    );

    assert.deepEqual(added, ['has-language-bar'], 'a storage that throws still lets the browser language count');
});
