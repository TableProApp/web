<?php

use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;

/**
 * The PHP half of locale-aware URLs. The TypeScript half, with the same edge
 * cases, is tests/js/paths.test.ts.
 */
it('reads the allowlist from resources/data/locales.json', function (): void {
    expect(Locales::default())->toBe('en');
    expect(Locales::codes())->toBe(['en', 'vi', 'es', 'de', 'fr', 'ja', 'pt-BR', 'zh-Hans', 'ko', 'zh-Hant', 'it', 'id']);
    expect(Locales::isSupported('vi'))->toBeTrue();
    expect(Locales::isSupported('xx'))->toBeFalse();
    expect(Locales::isSupported('VI'))->toBeFalse();
    expect(Locales::prefixFor('en'))->toBeNull();
    expect(Locales::prefixFor('vi'))->toBe('vi');
    expect(Locales::definition('vi'))->toBe([
        'native' => 'Tiếng Việt',
        'prefix' => 'vi',
        'hreflang' => 'vi',
        'og' => 'vi_VN',
        'intl' => 'vi-VN',
    ]);
});

it('refuses a locale it does not support', function (): void {
    Locales::definition('xx');
})->throws(RuntimeException::class);

it('finds the locale of a path no route matched', function (string $path, string $locale): void {
    expect(Locales::fromPath($path))->toBe($locale);
})->with([
    ['/', 'en'],
    ['', 'en'],
    ['vi', 'vi'],
    ['/vi', 'vi'],
    ['vi/blog/x', 'vi'],
    ['/vi/', 'vi'],
    ['video', 'en'],
    ['/vietnam', 'en'],
    ['blog/vi', 'en'],
    ['VI/blog', 'en'],
    ['/pt-BR/download', 'pt-BR'],
    ['/zh-Hans/blog', 'zh-Hans'],
    ['/zh-Hant', 'zh-Hant'],
    ['/zh-hant', 'en'],
]);

it('names routes per locale and strips the prefix back off', function (): void {
    expect(LocalizedUrl::routeName('landing.home', 'en'))->toBe('landing.home');
    expect(LocalizedUrl::routeName('landing.home', 'vi'))->toBe('vi.landing.home');
    expect(LocalizedUrl::baseName('vi.landing.compare'))->toBe('landing.compare');
    expect(LocalizedUrl::baseName('landing.compare'))->toBe('landing.compare');
    expect(LocalizedUrl::baseName('web.robots'))->toBe('web.robots');
    expect(LocalizedUrl::baseName(null))->toBeNull();
});

it('builds URLs from the canonical origin', function (): void {
    expect(LocalizedUrl::base())->toBe('https://localhost');
    expect(LocalizedUrl::route('landing.home', [], 'en'))->toBe('https://localhost/');
    expect(LocalizedUrl::route('landing.home', [], 'vi'))->toBe('https://localhost/vi');
    expect(LocalizedUrl::route('landing.databaseClient', ['slug' => 'mysql-client'], 'vi', false))->toBe('/vi/mysql-client');
});

it('prefixes a path with a locale, keeping its query and fragment', function (string $path, string $locale, string $expected): void {
    expect(LocalizedUrl::path($path, $locale))->toBe($expected);
})->with([
    ['/', 'en', '/'],
    ['/', 'vi', '/vi'],
    ['/download', 'vi', '/vi/download'],
    ['/?ref=app#pricing', 'vi', '/vi?ref=app#pricing'],
    ['/download#mac', 'vi', '/vi/download#mac'],
    ['/compare/tableplus?x=1', 'vi', '/vi/compare/tableplus?x=1'],
    ['/download', 'en', '/download'],
    ['/download', 'pt-BR', '/pt-BR/download'],
    ['/pricing?plan=pro#plans', 'zh-Hant', '/zh-Hant/pricing?plan=pro#plans'],
]);

it('never prefixes a path the platform app answers', function (string $path): void {
    expect(LocalizedUrl::isPlatformPath($path))->toBeTrue();
    expect(LocalizedUrl::path($path, 'vi'))->toBe($path);
    expect(LocalizedUrl::path($path, 'en'))->toBe($path);
})->with([
    '/account',
    '/account?locale=vi',
    '/account/login#form',
    '/checkout',
    '/discount/preview',
    '/newsletter/subscribe',
    '/thank-you?order=signed',
    '/api/newsletter/stats',
    '/platform-build/app.js',
    '/webhooks/polar',
    '/beta',
]);

it('still prefixes public paths that only start like a platform one', function (string $path): void {
    expect(LocalizedUrl::isPlatformPath($path))->toBeFalse();
    expect(LocalizedUrl::path($path, 'vi'))->toBe('/vi' . $path);
})->with(['/accounting', '/checkouts', '/newsletters', '/betamax', '/api/other', '/blog/checkout-notes']);

it('matches the platform paths the TypeScript helper and the dev proxy use', function (): void {
    $pattern = trim(LocalizedUrl::PLATFORM_PATHS, '~');
    $javascript = '/' . str_replace('/', '\\/', $pattern) . '/;';

    expect(file_get_contents(resource_path('js/i18n/paths.ts')))->toContain('export const PLATFORM_PATHS = ' . $javascript);
    expect(file_get_contents(base_path('scripts/dev-proxy.mjs')))->toContain('export const PLATFORM_PATHS = ' . $javascript);
});
