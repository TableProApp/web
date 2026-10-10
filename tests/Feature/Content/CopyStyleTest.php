<?php

require_once __DIR__ . '/helpers.php';

/**
 * House style for the English homepage, feature and iPhone copy: sentences a
 * reader can hold, American spelling as the app, the pricing page and the
 * legal pages use, one name for TLS, and leads that say what the app does
 * rather than how the page is laid out.
 */

/**
 * The visible strings of the English files this style covers, keyed by
 * "file key".
 *
 * @return array<string, string>
 */
function copyStyleStrings(bool $withIos = true): array
{
    static $memo = [];

    if (isset($memo[$withIos])) {
        return $memo[$withIos];
    }

    $root = resource_path('data/content/en');
    $files = ["{$root}/home.json", ...contentGuardFiles("{$root}/features", 'json')];

    if ($withIos) {
        $files[] = "{$root}/ios.json";
    }

    $strings = [];

    foreach ($files as $file) {
        foreach (contentGuardJsonStrings(contentGuardDecode($file)) as $key => $text) {
            $strings[contentGuardRelative($file) . ' ' . $key] = $text;
        }
    }

    return $memo[$withIos] = $strings;
}

/**
 * A string as sentences, with its inline tags removed. A `{slot}` counts as
 * one word, so a sentence that names a list from data is measured by what is
 * typed.
 *
 * @return list<string>
 */
function copyStyleSentences(string $text): array
{
    return preg_split('/(?<=[.!?])\s+/u', trim((string) preg_replace('/<[^>]+>/', '', $text))) ?: [];
}

it('keeps every sentence of the homepage and feature copy under 40 words', function (): void {
    $long = [];
    $read = 0;

    foreach (copyStyleStrings(withIos: false) as $where => $text) {
        foreach (copyStyleSentences($text) as $sentence) {
            $read++;
            $words = count(preg_split('/\s+/u', $sentence, -1, PREG_SPLIT_NO_EMPTY) ?: []);

            if ($words >= 40) {
                $long[] = "{$where}: {$words} words: {$sentence}";
            }
        }
    }

    expect($read)->toBeGreaterThan(500)
        ->and($long)->toBe([], "Split these sentences and keep every fact:\n  " . implode("\n  ", $long));
});

/**
 * British forms of words this copy uses or is likely to. A verb in -ise is
 * matched by its endings, so "precise" and "otherwise" pass.
 */
const COPY_STYLE_BRITISH = '/\b(colou(?:r|rs|red|ring)|favou(?:r|rs|rite|rites)|behaviours?|honou(?:r|rs|red)|neighbours?|(?:organ|recogn|custom|optim|synchron|author|initial|normal|summar|categor|priorit)is(?:e|es|ed|ing|ation|ations)|analys(?:e|ed|ing)|labell(?:ed|ing)|cancell(?:ed|ing)|modell(?:ed|ing)|travell(?:ed|ing)|licences?|centres?|grey|whilst|catalogues?|dialogues?|programmes?|untick(?:s|ed|ing)?|tick(?:s|ed|ing)?)\b/iu';

it('writes American English', function (): void {
    $offences = [];

    foreach (copyStyleStrings() as $where => $text) {
        if (preg_match_all(COPY_STYLE_BRITISH, contentGuardText($text), $matches) > 0) {
            $offences[] = "{$where}: " . implode(', ', $matches[0]);
        }
    }

    expect($offences)->toBe([], "British spelling (the app, the pricing page and the legal pages are American):\n  " . implode("\n  ", $offences));
});

it('catches British forms and leaves their American ones alone', function (string $text, bool $flagged): void {
    expect(preg_match(COPY_STYLE_BRITISH, $text) === 1)->toBe($flagged);
})->with([
    ['Give a connection a colour', true],
    ['Give a connection a color', false],
    ['Highlight rules colour rows', true],
    ['An organisation can enforce', true],
    ['An organization can enforce', false],
    ['the tables you tick', true],
    ['a support ticket', false],
    ['unless you untick it', true],
    ['the licence text', true],
    ['the license key', false],
    ['star them as favorites', false],
    ['otherwise a precise value', false],
]);

it('says TLS for the protocol, and SSL only inside a quoted app label', function (): void {
    $offences = [];

    foreach (copyStyleStrings() as $where => $text) {
        // The app's own setting is labelled "SSL Mode"; a label quoted in <ui> keeps the app's word.
        $prose = (string) preg_replace('#<ui>.*?</ui>#su', ' ', $text);

        if (preg_match('/\bSSL\b/', $prose) === 1) {
            $offences[] = "{$where}: {$text}";
        }
    }

    expect($offences)->toBe([], "SSL and TLS named the same setting on these pages; prose says TLS:\n  " . implode("\n  ", $offences));
});

it('opens no section by describing the page layout', function (): void {
    $layout = '/\b(in this section|described further down|further down|every page below|each page ends with|the last section|the section below|the sections? above)\b/i';
    $offences = [];

    foreach (copyStyleStrings() as $where => $text) {
        if (preg_match('/(^|\.)(lead|subtitle)$/', explode(' ', $where)[1]) === 1 && preg_match($layout, $text, $match) === 1) {
            $offences[] = "{$where}: \"{$match[0]}\"";
        }
    }

    expect($offences)->toBe([], "A lead says what the app does, not where things are on the page:\n  " . implode("\n  ", $offences));
});

it('opens feature pages with tasks rather than audience boilerplate', function (): void {
    foreach (contentGuardFiles(resource_path('data/content/en/features'), 'json') as $file) {
        $copy = contentGuardDecode($file);
        $lead = $copy['header']['lead'];

        expect($lead)->not->toMatch('/^For (anyone|developers|working|changing|moving|when)\b/i', "{$file}: name the task directly")
            ->not->toContain('Everything here is in the Mac app')
            ->not->toContain('does part of it');
    }
});
