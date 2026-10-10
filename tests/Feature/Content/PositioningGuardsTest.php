<?php

use App\Services\Content\SiteFacts;
use App\Services\Legal\LegalDocuments;
use App\Services\Releases\PlatformCatalog;
use App\Support\Features\FeatureFacts;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageRegistry;
use Dom\HTMLDocument;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Assert;

require_once __DIR__ . '/helpers.php';

/**
 * Positioning §13's guard tests: what must not change, and what must change
 * only through data, when a platform ships.
 *
 * 1. Identity keys name no platform, version or digit (here).
 * 2. The banned list and allowlist: `Content/BannedClaimsTest`.
 * 3. Title and description lengths after interpolation, in both locales.
 *    `Seo/SeoLengthsTest` checks every content file's `seo` block with the
 *    tokens filled the way the pages fill them; the legal pages' front matter
 *    is checked here; both run on every machine. A third case measures what
 *    the server actually renders, on every registry page, behind the SSR gate.
 * 4. Availability renders no platform whose `status` is not released (here):
 *    the PHP props with the iPhone and iPad app switched off, including the
 *    App Store action the database pages hand to their header, on every
 *    machine; and the rendered chrome, home hero, title and JSON-LD app
 *    nodes behind the SSR gate.
 *
 * Guard 5 is `Data/EnginesDataTest`; guard 6 is `Chrome/SiteChromeTest`.
 */
beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

/**
 * The identity keys of positioning §13, in one locale, keyed by where they
 * live. The homepage keys are the pillar headings P1-P5 (hero, databases,
 * safety and the workflow rows); the rest are catalog namespaces.
 *
 * @return array<string, string>
 */
function identityKeys(string $locale): array
{
    $home = contentGuardDecode(resource_path("data/content/{$locale}/home.json"));
    $catalog = fn(string $namespace): array => contentGuardCatalogStrings(resource_path("js/i18n/messages/{$locale}/{$namespace}.ts"));
    $keys = [
        "home.json hero.title" => $home['hero']['title'] ?? null,
        "home.json hero.subtitle" => $home['hero']['subtitle'] ?? null,
        "home.json databases.title" => $home['databases']['title'] ?? null,
        "home.json safety.title" => $home['safety']['title'] ?? null,
        "seo.ts product.short" => $catalog('seo')['product.short'] ?? null,
    ];

    foreach ($home['workflows']['rows'] ?? [] as $index => $row) {
        $keys["home.json workflows.rows.{$index}.title"] = $row['title'] ?? null;
    }

    foreach ($catalog('nav') as $key => $text) {
        $keys["nav.ts {$key}"] = $text;
    }

    foreach ($catalog('footer') as $key => $text) {
        if (str_starts_with($key, 'groups.')) {
            $keys["footer.ts {$key}"] = $text;
        }
    }

    foreach ($keys as $where => $text) {
        Assert::assertIsString($text, "content/{$locale}: the identity key {$where} is missing");
    }

    return $keys;
}

it('keeps platform names, versions and digits out of every identity key (guard 1)', function (string $locale): void {
    $keys = identityKeys($locale);
    $offences = [];

    foreach ($keys as $where => $text) {
        if (preg_match('/\b(Mac|macOS|iPhone|iPad|iOS|iPadOS|Windows|Linux)\b|\d/', $text, $match) === 1) {
            $offences[] = "{$where}: \"{$match[0]}\" in \"{$text}\"";
        }
    }

    expect(count($keys))->toBeGreaterThan(30)
        ->and($offences)->toBe([], "Identity keys must stay true when a platform ships (positioning §13):\n  " . implode("\n  ", $offences));
})->with(['en', 'vi']);

/**
 * A registry page that is a release post: an archive whose title and
 * description are kept as published (sitemap §E.6).
 */
function positioningIsReleasePost(PageEntry $entry): bool
{
    if ($entry->route !== 'landing.blog.show') {
        return false;
    }

    $file = resource_path('blog/' . ($entry->params['slug'] ?? '') . '.md');

    return is_file($file) && contentGuardIsReleasePost($file);
}

it('renders every title in 60 characters and every description within its locale\'s limit (guard 3)', function (): void {
    requireSsr();

    $offences = [];
    $checked = 0;

    foreach (app(PageRegistry::class)->all() as $entry) {
        if (positioningIsReleasePost($entry)) {
            continue;
        }

        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);
            $document = HTMLDocument::createFromString(ssrHtml($path), LIBXML_NOERROR);
            $title = trim((string) $document->querySelector('title')?->textContent);
            $description = trim((string) $document->querySelector('meta[name="description"]')?->getAttribute('content'));
            $limit = $locale === 'vi' ? 160 : 155;

            if ($title === '' || mb_strlen($title) > 60 || str_contains($title, '{')) {
                $offences[] = "{$path}: title \"{$title}\" (" . mb_strlen($title) . ')';
            }

            if ($description === '' || mb_strlen($description) > $limit || str_contains($description, '{')) {
                $offences[] = "{$path}: description of " . mb_strlen($description) . " characters: \"{$description}\"";
            }

            $checked++;
        }
    }

    expect($checked)->toBeGreaterThan(50)
        ->and($offences)->toBe([], "Search titles and descriptions out of bounds:\n  " . implode("\n  ", $offences));
})->group('ssr');

it('keeps the legal pages\' titles and descriptions within the same bounds (guard 3)', function (string $locale): void {
    /*
     * `Seo/SeoLengthsTest` reads the `seo` blocks of the content files. The
     * legal pages take theirs from the markdown front matter, so they are
     * measured here, on every machine, as LegalDocuments fills them and with
     * the site's title template.
     */
    $template = contentGuardCatalogStrings(resource_path("js/i18n/messages/{$locale}/seo.ts"))['titleTemplate'];
    $limit = $locale === 'vi' ? 160 : 155;
    $offences = [];
    $files = contentGuardFiles(resource_path("data/legal/{$locale}"), 'md');

    foreach ($files as $file) {
        $document = app(LegalDocuments::class)->render(pathinfo($file, PATHINFO_FILENAME), $locale);
        $title = str_replace('{title}', $document['title'], $template);
        $description = $document['description'];

        if (mb_strlen($title) > 60) {
            $offences[] = basename($file) . ": title \"{$title}\" (" . mb_strlen($title) . ')';
        }

        if ($description === '' || mb_strlen($description) > $limit) {
            $offences[] = basename($file) . ': description of ' . mb_strlen($description) . " characters, over {$limit}";
        }
    }

    expect($files)->not->toBe([])
        ->and($offences)->toBe([], "legal/{$locale}:\n  " . implode("\n  ", $offences));
})->with(fn(): array => array_keys(json_decode((string) file_get_contents(dirname(__DIR__, 3) . '/resources/data/locales.json'), true)['supported']));

/**
 * Points the platform catalog and the fact services at a copy of
 * `resources/data` in which one platform is not released, as it would read
 * the day an app is withdrawn. Returns the copy's directory.
 */
function positioningWithdraw(string $platform): string
{
    $directory = storage_path('framework/testing/data-' . uniqid());
    File::copyDirectory(resource_path('data'), $directory);

    $data = contentGuardDecode("{$directory}/platforms.json");

    foreach ($data['platforms'] as $index => $entry) {
        if (($entry['id'] ?? null) === $platform) {
            $data['platforms'][$index]['status'] = 'prototype';
        }
    }

    File::put("{$directory}/platforms.json", json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

    app()->instance(PlatformCatalog::class, new PlatformCatalog("{$directory}/platforms.json"));
    app()->instance(SiteFacts::class, new SiteFacts($directory));
    app()->instance(FeatureFacts::class, new FeatureFacts($directory));

    // A route keeps the controller it built, with the catalog it was built with.
    foreach (app('router')->getRoutes() as $route) {
        $route->flushController();
    }

    return $directory;
}

/**
 * The props of every registry page in every locale it renders in.
 *
 * @return array<string, array{route: string, props: array<string, mixed>}>
 */
function positioningRegistryProps(): array
{
    $pages = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);
            $response = test()->get($path);

            Assert::assertSame(200, $response->getStatusCode(), "{$path} does not render");

            $pages[$path] = ['route' => $entry->route, 'props' => $response->viewData('page')['props']];
        }
    }

    return $pages;
}

/**
 * Every availability fact a page's props carry for the iPhone and iPad app:
 * a device list naming its devices, an App Store URL handed to a page as an
 * action, and the per-page platform summaries. Null-valued facts are absent.
 *
 * @param  array<string, mixed>  $props
 * @param  list<string>  $devices
 * @return list<string>
 */
function positioningIosAvailability(string $route, array $props, array $devices): array
{
    $found = [];

    $walk = function (mixed $value, string $path) use (&$walk, &$found, $devices): void {
        if (! is_array($value)) {
            return;
        }

        foreach ($value as $key => $child) {
            $where = $path === '' ? (string) $key : "{$path}.{$key}";

            if ($key === 'deviceNames' && is_array($child) && array_intersect($child, $devices) !== []) {
                $found[] = "{$where} names " . implode(', ', array_intersect($child, $devices));
            }

            if ($key === 'appStoreUrl' && $child !== null) {
                $found[] = "{$where} is {$child}";
            }

            $walk($child, $where);
        }
    };

    $walk($props, '');

    $summaries = match ($route) {
        'landing.download', 'landing.ios' => ['ios' => $props['ios'] ?? null],
        'landing.faq', 'landing.databases.index', 'landing.databaseClient' => ['platforms.ios' => $props['platforms']['ios'] ?? null],
        'landing.compare', 'landing.compare.index' => ['tablepro.ios' => $props['tablepro']['ios'] ?? null],
        default => [],
    };

    if ($route === 'landing.home') {
        $summaries['iosEngines'] = array_filter((array) ($props['iosEngines'] ?? []), fn(mixed $list): bool => $list !== []) === [] ? null : $props['iosEngines'];
    }

    foreach ($summaries as $where => $value) {
        if ($value !== null) {
            $found[] = "{$where} is set";
        }
    }

    return $found;
}

it('drops a platform from every availability prop the day it is not released (guard 4)', function (): void {
    $ios = collect(contentGuardDecode(resource_path('data/platforms.json'))['platforms'])->firstWhere('id', 'ios');
    $devices = $ios['deviceNames'];

    // Today the app is released, so each family hands its availability to the page.
    $released = [];

    foreach (positioningRegistryProps() as $path => $page) {
        $released[$page['route']] = ($released[$page['route']] ?? false) || positioningIosAvailability($page['route'], $page['props'], $devices) !== [];
    }

    foreach (['landing.home', 'landing.download', 'landing.ios', 'landing.faq', 'landing.databases.index', 'landing.databaseClient', 'landing.compare', 'landing.compare.index'] as $route) {
        expect($released[$route] ?? false)->toBeTrue("{$route} carries no iPhone and iPad availability while the app is released, so this guard would see nothing there");
    }

    $directory = positioningWithdraw('ios');
    $offences = [];

    try {
        foreach (positioningRegistryProps() as $path => $page) {
            foreach (positioningIosAvailability($page['route'], $page['props'], $devices) as $fact) {
                $offences[] = "{$path}: {$fact}";
            }

            if ($page['route'] === 'landing.download') {
                expect($page['props']['unreleased'] ?? [])->toContain('ios');
            }
        }
    } finally {
        File::deleteDirectory($directory);
    }

    expect($offences)->toBe([], "Availability rendered for a platform that is not released:\n  " . implode("\n  ", $offences));
});

it('withholds the App Store action on the database pages while the iPhone and iPad app is not released (guard 4)', function (): void {
    /*
     * The engine header shows the App Store badge for an engine in the iPhone
     * picker whenever `links.appStore` is set (components/databases/
     * engine-header.tsx), so the prop itself must follow the release status,
     * as `appStoreUrl` does on /download and /ios.
     */
    $databasePages = fn(): array => array_filter(positioningRegistryProps(), fn(array $page): bool => in_array($page['route'], ['landing.databases.index', 'landing.databaseClient'], true));

    expect(array_filter($databasePages(), fn(array $page): bool => ($page['props']['links']['appStore'] ?? null) !== null))->not->toBe([], 'No database page carries the App Store action while the app is released, so this guard would see nothing');

    $directory = positioningWithdraw('ios');

    try {
        $offences = array_keys(array_filter($databasePages(), fn(array $page): bool => ($page['props']['links']['appStore'] ?? null) !== null));
    } finally {
        File::deleteDirectory($directory);
    }

    expect($offences)->toBe([], "These pages still hand the App Store action to the page:\n  " . implode("\n  ", $offences));
});

/**
 * The names a page would use for each platform that is not released, in one
 * locale, from the `platforms` catalog (`names.{id}`).
 *
 * @return list<string>
 */
function positioningUnreleasedNames(string $locale): array
{
    $names = contentGuardCatalogStrings(resource_path("js/i18n/messages/{$locale}/platforms.ts"));
    $unreleased = [];

    foreach (contentGuardDecode(resource_path('data/platforms.json'))['platforms'] as $platform) {
        if (($platform['status'] ?? null) !== 'released') {
            $unreleased[] = $names["names.{$platform['id']}"] ?? ucfirst((string) $platform['id']);
        }
    }

    return $unreleased;
}

it('renders no unreleased platform in the chrome, the home hero and title, or an app node (guard 4)', function (): void {
    requireSsr();

    $offences = [];
    $platforms = contentGuardDecode(resource_path('data/platforms.json'))['platforms'];
    $released = array_values(array_filter($platforms, fn(array $platform): bool => ($platform['status'] ?? null) === 'released'));

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);
            $names = positioningUnreleasedNames($locale);
            $pattern = '/\b(' . implode('|', array_map(fn(string $name): string => preg_quote($name, '/'), $names)) . ')\b/u';
            $document = HTMLDocument::createFromString(ssrHtml($path), LIBXML_NOERROR);
            $footers = $document->querySelectorAll('footer');

            $surfaces = [
                'the site header' => $document->querySelector('header')?->textContent,
                'the site footer' => $footers->length > 0 ? $footers->item($footers->length - 1)->textContent : null,
            ];

            if ($entry->route === 'landing.home') {
                $surfaces['the title'] = $document->querySelector('title')?->textContent;
                $surfaces['the hero'] = $document->querySelector('#top')?->textContent;
                $surfaces['the platforms section'] = $document->querySelector('#platforms')?->textContent;

                foreach ($released as $platform) {
                    foreach ($platform['deviceNames'] as $device) {
                        Assert::assertStringContainsString($device, (string) $surfaces['the title'], "{$path}: the title does not list {$device}");
                    }
                }
            }

            foreach ($surfaces as $surface => $text) {
                Assert::assertNotNull($text, "{$path} has no {$surface}");

                if ($names !== [] && preg_match($pattern, (string) $text, $match) === 1) {
                    $offences[] = "{$path}: {$surface} names {$match[1]}";
                }
            }

            foreach ($document->querySelectorAll('script[type="application/ld+json"]') as $script) {
                $nodes = json_decode((string) $script->textContent, true)['@graph'] ?? [];

                foreach (is_array($nodes) ? $nodes : [] as $node) {
                    $type = (array) ($node['@type'] ?? []);

                    if (array_intersect($type, ['SoftwareApplication', 'MobileApplication']) !== [] && $names !== [] && preg_match($pattern, json_encode($node['operatingSystem'] ?? '') ?: '', $match) === 1) {
                        $offences[] = "{$path}: the app node {$node['@id']} runs on {$match[1]}";
                    }
                }
            }
        }
    }

    expect($offences)->toBe([], "An unreleased platform rendered as available:\n  " . implode("\n  ", $offences));
})->group('ssr');
