<?php

use App\Support\Content\Slugs\CompareSlugs;
use App\Support\Content\Slugs\DatabaseSlugs;
use App\Support\Content\Slugs\FeatureSlugs;
use App\Support\Localization\LanguageDetection;
use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use App\Support\Pricing\Campaign;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route as Router;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\travelTo;
use function Pest\Laravel\withHeaders;

beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

function localeRoutingRetiredStatus(string $path): ?int
{
    $entry = collect(json_decode((string) file_get_contents(resource_path('data/redirects.json')), true))
        ->firstWhere('from', $path);

    return $entry === null ? null : (int) $entry['status'];
}

describe('routing', function (): void {
    it('still answers every URL the pre-rebuild English site served', function (): void {
        // Written down, not derived from the routes: a route that disappears must not take its URL with it.
        $urls = ['/', '/download', '/ios', '/faq', '/privacy', '/terms', '/refund-policy', '/blog'];

        foreach (glob(resource_path('blog/*.md')) ?: [] as $post) {
            $urls[] = '/blog/' . pathinfo($post, PATHINFO_FILENAME);
        }

        foreach (['tableplus', 'dbeaver', 'datagrip', 'navicat', 'beekeeper-studio', 'sequel-pro', 'postico', 'sequel-ace', 'heidisql', 'azimutt', 'phpmyadmin'] as $slug) {
            $urls[] = "/compare/{$slug}";
        }

        foreach ([
            'mysql-client', 'postgresql-client', 'sqlite-client', 'mongodb-client', 'redis-gui', 'sql-server-client',
            'oracle-client', 'clickhouse-client', 'duckdb-client', 'cassandra-client', 'mariadb-client', 'redshift-client',
            'cloudflare-d1-client', 'turso-client', 'dynamodb-gui', 'bigquery-client', 'etcd-gui', 'snowflake-client',
            'cockroachdb-client', 'elasticsearch-client', 'scylladb-client', 'pglite-client', 'surrealdb-client',
            'teradata-client', 'trino-client', 'beancount-client',
        ] as $slug) {
            $urls[] = "/{$slug}";
        }

        foreach ($urls as $path) {
            $expected = localeRoutingRetiredStatus($path) ?? 200;

            expect(get($path)->getStatusCode())->toBe($expected, "{$path} should answer {$expected}");
        }
    });

    it('mounts every localized route once per locale, under the same name', function (): void {
        $routes = collect(app('router')->getRoutes()->getRoutes());
        $english = $routes->filter(fn(Route $route): bool => str_starts_with((string) $route->getName(), 'landing.'));

        expect($english)->not->toBeEmpty();

        foreach (Locales::all() as $code => $locale) {
            foreach ($english as $route) {
                $name = LocalizedUrl::routeName((string) $route->getName(), $code);
                $twin = $routes->first(fn(Route $candidate): bool => $candidate->getName() === $name);

                expect($twin)->not->toBeNull("{$name} is not registered");

                $uri = $locale['prefix'] === null
                    ? $route->uri()
                    : trim($locale['prefix'] . '/' . ($route->uri() === '/' ? '' : $route->uri()), '/');

                expect($twin->uri())->toBe($uri, "{$name} is mounted at the wrong path")
                    ->and($twin->gatherMiddleware())->toContain("locale:{$code}", 'page');
            }
        }
    });

    it('never lets a slug list swallow a root path or a locale prefix', function (array $slugs): void {
        $reserved = [
            'ios', 'download', 'pricing', 'teams', 'faq', 'about', 'security', 'sponsors', 'black-friday', 'privacy', 'terms',
            'refund-policy', 'brand', 'blog', 'features', 'databases', 'compare', 'integrations', 'robots.txt', 'sitemap.xml',
            'up', 'account', 'checkout', 'og', 'images', 'build',
            ...array_filter(array_column(Locales::all(), 'prefix')),
        ];

        expect(array_intersect($slugs, $reserved))->toBe([])
            ->and($slugs)->toBe(array_values(array_unique($slugs)))
            ->each->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/');
    })->with([
        'databases' => [DatabaseSlugs::ALL],
        'compare' => [CompareSlugs::ALL],
        'features' => [FeatureSlugs::ALL],
    ]);

    it('has a content file in every locale for each slug constant', function (string $family, array $slugs): void {
        sort($slugs);

        foreach (Locales::codes() as $locale) {
            $names = array_map(
                fn(string $file): string => pathinfo($file, PATHINFO_FILENAME),
                glob(resource_path("data/content/{$locale}/{$family}/*.json")) ?: [],
            );
            $names = array_values(array_diff($names, ['index']));
            sort($names);

            expect($names)->toBe($slugs, "content/{$locale}/{$family} and the slug constant disagree");
        }
    })->with([
        'databases' => ['databases', DatabaseSlugs::ALL],
        'compare' => ['compare', CompareSlugs::ALL],
        'features' => ['features', FeatureSlugs::ALL],
    ]);

    it('serves no locale outside the allowlist', function (string $path): void {
        get($path)->assertNotFound();
    })->with(['/xx', '/xx/download', '/vi/vi', '/vi/vi/download', '/vi/en', '/vi/en/download']);

    it('refuses a locale outside the allowlist even if a route asks for it', function (): void {
        Router::middleware(['web', 'locale:xx'])->get('/_test/unsupported', fn() => 'bonjour');

        get('/_test/unsupported')->assertNotFound();
    });
});

describe('the locale is the URL and nothing else', function (): void {
    it('serves every reader the same page, whatever their browser or country says', function (string $path): void {
        travelTo(Campaign::current()?->endsAt ?? now());

        $plain = get($path)->assertOk();
        $guess = withHeaders(['Accept-Language' => 'vi-VN,vi;q=0.9', 'CF-IPCountry' => 'VN'])->get($path)->assertOk();

        expect($guess->getContent())->toBe($plain->getContent())
            ->and($guess->headers->has('Location'))->toBeFalse();
    })->with(['/', '/pricing', '/vi']);

    it('never varies on language', function (string $path): void {
        expect(strtolower((string) get($path)->headers->get('Vary')))->not->toContain('accept-language');
    })->with(['/', '/vi', '/vi/download', '/nope', '/vi/nope']);

    it('sends a locale prefix in another case, or the default locale spelled out, to the canonical URL in one hop', function (string $path, string $canonical): void {
        get($path)->assertStatus(301)->assertHeader('Location', 'https://localhost' . $canonical);
        get($canonical)->assertOk();
    })->with([
        'a lowercase region' => ['/pt-br', '/pt-BR'],
        'a lowercase script, with a page' => ['/zh-hans/pricing', '/zh-Hans/pricing'],
        'uppercase' => ['/ZH-HANT/download', '/zh-Hant/download'],
        'mixed case' => ['/Vi/download', '/vi/download'],
        'the default locale' => ['/en', '/'],
        'a page under the default locale, keeping the query' => ['/en/pricing?ref=x', '/pricing?ref=x'],
        'a trailing slash too' => ['/pt-br/pricing/?ref=x', '/pt-BR/pricing?ref=x'],
    ]);
});

describe('the language bar', function (): void {
    beforeEach(function (): void {
        travelTo(Campaign::current()?->endsAt ?? now());
    });

    it('offers the equivalent pages only, never the current one or a fallback', function (): void {
        get('/')->assertInertia(fn(AssertableInertia $page) => $page
            ->where('localization.suggestable', array_values(array_diff(Locales::codes(), ['en']))));

        get('/vi')->assertInertia(fn(AssertableInertia $page) => $page
            ->where('localization.suggestable', fn($locales): bool => collect($locales)->contains('en') && ! collect($locales)->contains('vi')));

        get('/blog/tablepro-0-67')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page->where('localization.suggestable', []));
    });

    it('ships its head script only where the page exists in another language', function (string $path, int $status, bool $shipped): void {
        $html = get($path)->assertStatus($status)->getContent();

        expect(str_contains($html, '/* language-suggestion:start */'))->toBe($shipped)
            ->and(str_contains($html, 'tablepro:language'))->toBe($shipped);
    })->with([
        'home' => ['/', 200, true],
        'a translated page' => ['/vi/download', 200, true],
        'pricing' => ['/pricing', 200, true],
        'an English-only release post' => ['/blog/tablepro-0-67', 200, false],
        'a missing page' => ['/no-such-page', 404, false],
    ]);

    it('gives the head script locale codes and aliases, never a country or a time zone', function (): void {
        expect(LanguageDetection::headConfig('en', ['vi']))
            ->toHaveKeys(['page', 'suggestable', 'supported', 'tags'])
            ->not->toHaveKeys(['countries', 'timeZones']);
    });
});

describe('LocalizedUrl', function (): void {
    it('knows the default locale and refuses one it does not support', function (): void {
        expect(Locales::default())->toBe('en')
            ->and(Locales::prefixFor('en'))->toBeNull()
            ->and(Locales::prefixFor('vi'))->toBe('vi')
            ->and(Locales::isSupported('vi'))->toBeTrue()
            ->and(Locales::isSupported('VI'))->toBeFalse()
            ->and(fn() => Locales::definition('xx'))->toThrow(RuntimeException::class);
    });

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
        expect(LocalizedUrl::routeName('landing.home', 'en'))->toBe('landing.home')
            ->and(LocalizedUrl::routeName('landing.home', 'vi'))->toBe('vi.landing.home')
            ->and(LocalizedUrl::baseName('vi.landing.compare'))->toBe('landing.compare')
            ->and(LocalizedUrl::baseName('landing.compare'))->toBe('landing.compare')
            ->and(LocalizedUrl::baseName(null))->toBeNull();
    });

    it('builds URLs from the canonical origin', function (): void {
        expect(LocalizedUrl::route('landing.home', [], 'en'))->toBe('https://localhost/')
            ->and(LocalizedUrl::route('landing.home', [], 'vi'))->toBe('https://localhost/vi')
            ->and(LocalizedUrl::route('landing.databaseClient', ['slug' => 'mysql-client'], 'vi', false))->toBe('/vi/mysql-client');
    });

    it('prefixes a path with a locale, keeping its query and fragment', function (string $path, string $locale, string $expected): void {
        expect(LocalizedUrl::path($path, $locale))->toBe($expected);
    })->with([
        ['/', 'en', '/'],
        ['/', 'vi', '/vi'],
        ['/download', 'en', '/download'],
        ['/download', 'pt-BR', '/pt-BR/download'],
        ['/?ref=app#pricing', 'vi', '/vi?ref=app#pricing'],
        ['/compare/tableplus?x=1', 'vi', '/vi/compare/tableplus?x=1'],
        ['/pricing?plan=pro#plans', 'zh-Hant', '/zh-Hant/pricing?plan=pro#plans'],
    ]);

    it('never prefixes a path nginx answers without this app', function (string $path): void {
        expect(LocalizedUrl::isPlatformPath($path))->toBeTrue()
            ->and(LocalizedUrl::path($path, 'vi'))->toBe($path);
    })->with(['/account', '/account?locale=vi', '/account/login#form', '/checkout', '/thank-you?order=signed', '/newsletter/unsubscribe/42?signature=x', '/webhooks/polar']);

    it('still prefixes public paths that only start like a platform one', function (string $path): void {
        expect(LocalizedUrl::isPlatformPath($path))->toBeFalse()
            ->and(LocalizedUrl::path($path, 'vi'))->toBe("/vi{$path}");
    })->with(['/accounting', '/checkouts', '/newsletters', '/blog/checkout-notes', '/discount/preview', '/newsletter/subscribe']);

    it('matches the platform paths the TypeScript helper and the nginx config use', function (): void {
        $javascript = '/' . str_replace('/', '\\/', trim(LocalizedUrl::PLATFORM_PATHS, '~')) . '/;';

        expect(file_get_contents(resource_path('js/i18n/paths.ts')))->toContain("export const PLATFORM_PATHS = {$javascript}");

        $config = (string) file_get_contents(base_path('docs/deploy/tablepro.app.nginx.conf'));
        preg_match_all('/^\s*location (?:=|\^~) (\/[^ ]*) \{/m', substr($config, 0, (int) strpos($config, 'Everything else: the public site.')), $locations);

        expect($locations[1])->not->toBeEmpty();

        foreach ($locations[1] as $path) {
            expect(LocalizedUrl::isPlatformPath(rtrim($path, '/') . '/x'))->toBeTrue("nginx answers {$path} without this app");
        }
    });

    it('links the account portal with the language in the query', function (string $locale): void {
        expect(LocalizedUrl::account($locale))->toBe("https://account.tablepro.app/?locale={$locale}");
    })->with(['vi', 'zh-Hant']);
});
