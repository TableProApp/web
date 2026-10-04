<?php

namespace App\Support\Localization;

use JsonException;
use RuntimeException;

/**
 * The public site's locale allowlist, read from `resources/data/locales.json`.
 *
 * The locale of a public page is a function of its URL and nothing else: the
 * route group a request matched decides it, never a cookie, a header or an IP.
 * This class is the one PHP reader of the file that decides those groups. The
 * TypeScript side imports the same file through the `@data` alias.
 *
 * The file is decoded once per process and kept in a static memo. PHP-FPM is
 * shared-nothing, so in production that is once per request.
 */
final class Locales
{
    /**
     * @var array{default: string, supported: array<string, array{native: string, prefix: ?string, hreflang: string, og: string, intl: string}>}|null
     */
    private static ?array $data = null;

    /**
     * Every supported locale, keyed by its code, in file order.
     *
     * @return array<string, array{native: string, prefix: ?string, hreflang: string, og: string, intl: string}>
     */
    public static function all(): array
    {
        return self::data()['supported'];
    }

    /**
     * The locale served at the root, with no prefix.
     */
    public static function default(): string
    {
        return self::data()['default'];
    }

    /**
     * @return list<string>
     */
    public static function codes(): array
    {
        return array_keys(self::all());
    }

    public static function isSupported(string $code): bool
    {
        return array_key_exists($code, self::all());
    }

    /**
     * The URL prefix for a locale, or null for the default locale.
     */
    public static function prefixFor(string $code): ?string
    {
        return self::definition($code)['prefix'];
    }

    /**
     * @return array{native: string, prefix: ?string, hreflang: string, og: string, intl: string}
     */
    public static function definition(string $code): array
    {
        $all = self::all();

        if (! array_key_exists($code, $all)) {
            throw new RuntimeException("Unsupported locale [{$code}].");
        }

        return $all[$code];
    }

    /**
     * The locale a path belongs to, for requests no route matched.
     *
     * The first path segment must equal a prefix exactly, so `/vi/blog` is
     * Vietnamese and `/video` is not. Anything else is the default locale.
     * The 404 handler and the Blade error fallbacks use this, because route
     * middleware never ran for them.
     */
    public static function fromPath(string $path): string
    {
        $segment = explode('/', trim($path, '/'))[0];

        foreach (self::all() as $code => $locale) {
            if ($locale['prefix'] !== null && $locale['prefix'] === $segment) {
                return $code;
            }
        }

        return self::default();
    }

    /**
     * Drops the memo, for tests that rewrite the file.
     */
    public static function flush(): void
    {
        self::$data = null;
    }

    /**
     * @return array{default: string, supported: array<string, array{native: string, prefix: ?string, hreflang: string, og: string, intl: string}>}
     */
    private static function data(): array
    {
        if (self::$data !== null) {
            return self::$data;
        }

        $path = resource_path('data/locales.json');

        try {
            $decoded = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $e) {
            throw new RuntimeException("{$path} is not valid JSON: {$e->getMessage()}", previous: $e);
        }

        if (! is_array($decoded) || ! is_string($decoded['default'] ?? null) || ! is_array($decoded['supported'] ?? null)) {
            throw new RuntimeException("{$path} must declare a default locale and the supported locales.");
        }

        if (! array_key_exists($decoded['default'], $decoded['supported'])) {
            throw new RuntimeException("{$path} declares a default locale it does not support.");
        }

        return self::$data = $decoded;
    }
}
