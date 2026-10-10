<?php

namespace App\Support\Localization;

use JsonException;
use RuntimeException;

/**
 * What the root template's pre-paint script needs from
 * `resources/data/language-detection.json`, which maps a reader's browser
 * language, country or time zone to a supported locale for the language bar.
 *
 * The suggestion is decided in the browser and never here: the HTML is cached
 * at the edge for every reader alike (docs/deployment.md, "Caching"). PHP only
 * writes the per-page half of it (`headConfig()`). The TypeScript side imports
 * the whole file through `@data`.
 */
final class LanguageDetection
{
    /**
     * What the pre-paint script decides a suggestion from: the page's locale,
     * the locales this page may offer, every supported code by its lowercase
     * form, and the tag aliases. Countries and time zones stay out, because
     * the script only reads what the browser already knows; the page looks a
     * country up after load, and only when no browser language is supported.
     *
     * @param  list<string>  $suggestable
     * @return array{page: string, suggestable: list<string>, supported: array<string, string>, tags: array<string, string>}
     */
    public static function headConfig(string $page, array $suggestable): array
    {
        $supported = [];

        foreach (Locales::codes() as $code) {
            $supported[strtolower($code)] = $code;
        }

        return [
            'page' => $page,
            'suggestable' => $suggestable,
            'supported' => $supported,
            'tags' => self::tags(),
        ];
    }

    /**
     * The lowercase browser-tag aliases: `{"zh-tw": "zh-Hant", "pt": "pt-BR"}`.
     *
     * @return array<string, string>
     */
    private static function tags(): array
    {
        $path = resource_path('data/language-detection.json');

        try {
            $decoded = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $e) {
            throw new RuntimeException("{$path} is not valid JSON: {$e->getMessage()}", previous: $e);
        }

        if (! is_array($decoded) || ! is_array($decoded['tags'] ?? null)) {
            throw new RuntimeException("{$path} must declare its tag aliases.");
        }

        return $decoded['tags'];
    }
}
