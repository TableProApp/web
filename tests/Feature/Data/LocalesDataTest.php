<?php

use App\Support\Content\Slugs\DatabaseSlugs;
use Illuminate\Routing\Route;

/**
 * resources/data/locales.json, the one list of public locales.
 *
 * It decides which route groups exist, which `lang` a page carries, the
 * hreflang and `og:locale` values, and what TypeScript accepts as a `Locale`.
 * A malformed entry would fail in all of those places at once, so its shape is
 * pinned here. The file is read by route registration too, which is why
 * scripts/deploy.sh rebuilds the route cache when it changes.
 */
function localesData(): array
{
    return json_decode((string) file_get_contents(resource_path('data/locales.json')), true, 512, JSON_THROW_ON_ERROR);
}

it('declares a supported default locale with no prefix', function (): void {
    $data = localesData();

    expect($data)->toHaveKeys(['default', 'supported']);
    expect($data['default'])->toBe('en');
    expect($data['supported'])->toHaveKey('en');
    expect($data['supported']['en']['prefix'])->toBeNull();
});

it('describes each locale completely and consistently', function (): void {
    foreach (localesData()['supported'] as $code => $locale) {
        expect($code)->toMatch('/^[a-z]{2}$/', "{$code} is not an ISO 639-1 code");
        expect(array_keys($locale))->toBe(['native', 'prefix', 'hreflang', 'og', 'intl'], "{$code} has the wrong fields");

        expect($locale['native'])->toBeString()->not->toBe('');
        expect(Normalizer::isNormalized($locale['native'], Normalizer::FORM_C))->toBeTrue("{$code} native name is not NFC");
        expect($locale['hreflang'])->toBe($code);
        expect($locale['og'])->toMatch('/^' . $code . '_[A-Z]{2}$/');
        expect($locale['intl'])->toMatch('/^' . $code . '-[A-Z]{2}$/');

        if ($code !== localesData()['default']) {
            expect($locale['prefix'])->toBe($code, "{$code} must be served under /{$code}");
        }
    }
});

/**
 * @return list<string>
 */
function localePrefixes(): array
{
    return array_values(array_filter(array_column(localesData()['supported'], 'prefix')));
}

it('gives each locale its own prefix', function (): void {
    expect(localePrefixes())->toBe(array_values(array_unique(localePrefixes())));
});

it('collides with no root path the site or the platform serves', function (): void {
    $prefixed = array_map(fn(string $code): string => 'locale:' . $code, array_diff(array_keys(localesData()['supported']), [localesData()['default']]));

    $roots = collect(app('router')->getRoutes()->getRoutes())
        ->reject(fn(Route $route): bool => array_intersect($prefixed, $route->gatherMiddleware()) !== [])
        ->map(fn(Route $route): string => explode('/', $route->uri())[0])
        ->filter(fn(string $segment): bool => $segment !== '' && ! str_starts_with($segment, '{'))
        ->merge(DatabaseSlugs::ALL)
        ->merge([
            // The platform's paths on this origin (nginx sends them to the account app).
            'account', 'checkout', 'webhooks', 'newsletter', 'beta', 'discount', 'thank-you', 'api', 'platform-build',
            // Static directories under public/.
            'build', 'og', 'images', 'sponsors',
        ])
        ->unique();

    expect($roots)->toContain('download')->toContain('compare');

    foreach (localePrefixes() as $prefix) {
        expect($roots->contains($prefix))->toBeFalse("/{$prefix} is already a path, so it cannot be a locale prefix");
        expect(file_exists(public_path($prefix)))->toBeFalse("public/{$prefix} would shadow the /{$prefix} pages");
    }
});
