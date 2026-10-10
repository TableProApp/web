<?php

use App\Support\Content\ContentRepository;
use App\Support\Content\IntegrationCatalog;
use App\Support\Localization\Locales;
use App\Support\Seo\BlogPosts;
use App\Support\Seo\LegalPages;
use App\Support\Seo\PageRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Assert;

/**
 * @return array{root: string, content: string, blog: string, legal: string}
 */
function seoScratch(): array
{
    $root = storage_path('framework/testing/seo-' . uniqid());
    $dirs = [
        'root' => $root,
        'content' => $root . '/content',
        'blog' => $root . '/blog',
        'legal' => $root . '/legal',
    ];

    foreach ($dirs as $dir) {
        File::ensureDirectoryExists($dir);
    }

    app()->instance(ContentRepository::class, new ContentRepository($dirs['content']));
    app()->instance(BlogPosts::class, new BlogPosts($dirs['blog']));
    app()->instance(LegalPages::class, new LegalPages($dirs['legal']));
    seoWriteIntegrations($root, []);

    return $dirs;
}

/**
 * @param  list<array<string, mixed>>  $entries
 */
function seoWriteIntegrations(string $root, array $entries): void
{
    $index = json_decode(File::get(base_path('tests/Fixtures/integrations/index.json')), true, 512, JSON_THROW_ON_ERROR);
    $template = $index['integrations'][0];
    $index['integrations'] = array_map(fn(array $entry): array => array_replace($template, $entry), $entries);

    File::put($root . '/integrations.json', json_encode($index, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    app()->instance(IntegrationCatalog::class, new IntegrationCatalog($root . '/integrations.json'));
    app()->forgetInstance(PageRegistry::class);
}

/**
 * @param  array<string, mixed>  $data
 */
function seoWriteContent(string $dir, string $locale, string $name, array $data = []): void
{
    $data = $data === [] ? ['seo' => ['title' => 'Title', 'description' => 'Description']] : $data;
    $path = "{$dir}/{$locale}/{$name}.json";

    File::ensureDirectoryExists(dirname($path));
    File::put($path, json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE));
}

/**
 * @param  array<string, string>  $matter
 */
function seoWriteMarkdown(string $path, array $matter = ['title' => 'A post', 'date' => '2026-10-02']): void
{
    $yaml = '';

    foreach ($matter as $key => $value) {
        $yaml .= $key . ': ' . json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
    }

    File::ensureDirectoryExists(dirname($path));
    File::put($path, "---\n{$yaml}---\n\nBody.\n");
}

function seoMatchedRequest(string $path, string $locale): Request
{
    $request = Request::create($path);
    $route = app('router')->getRoutes()->match($request);
    $route->bind($request);
    $request->setRouteResolver(fn() => $route);
    App::setLocale($locale);

    return $request;
}

function seoPathOf(string $url): string
{
    $path = (string) parse_url($url, PHP_URL_PATH);

    return $path === '' ? '/' : $path;
}

function seoScratchPublic(): string
{
    $public = storage_path('framework/testing/public-' . uniqid());

    File::ensureDirectoryExists($public);
    File::copy(base_path('public/logo.png'), $public . '/logo.png');
    app()->usePublicPath($public);

    return $public;
}

/**
 * @return list<array<string, mixed>>
 */
function seoRedirectEntries(): array
{
    // Datasets call this before the application exists, so no resource_path().
    return json_decode((string) file_get_contents(dirname(__DIR__, 3) . '/resources/data/redirects.json'), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @return array<string, array{alternates: array<string, string>, lastmod: string|null, elements: list<string>}>
 */
function seoGenerateSitemap(): array
{
    $public = seoScratchPublic();

    test()->artisan('sitemap:generate')->assertSuccessful();

    $xml = (string) file_get_contents($public . '/sitemap.xml');
    File::deleteDirectory($public);

    $document = simplexml_load_string($xml);

    if ($document === false) {
        throw new RuntimeException('sitemap.xml is not well-formed XML.');
    }

    $urls = [];

    foreach ($document->url as $url) {
        $alternates = [];
        $elements = [];

        foreach ($url->children() as $child) {
            $elements[] = $child->getName();
        }

        foreach ($url->children('http://www.w3.org/1999/xhtml') as $link) {
            $elements[] = 'xhtml:' . $link->getName();
            $attributes = $link->attributes();

            if ((string) $attributes['rel'] === 'alternate') {
                $alternates[(string) $attributes['hreflang']] = (string) $attributes['href'];
            }
        }

        $urls[(string) $url->loc] = [
            'alternates' => $alternates,
            'lastmod' => isset($url->lastmod) ? (string) $url->lastmod : null,
            'elements' => $elements,
        ];
    }

    return $urls;
}

/**
 * @return array<string, array{alternates: array<string, string>, lastmod: string|null, elements: list<string>}>
 */
function seoCommittedSitemap(): array
{
    static $urls = null;

    return $urls ??= seoGenerateSitemap();
}

/**
 * @return array<string, array{status: int, lang: string|null, component: string|null, props: array<string, mixed>}>
 */
function seoCrawlProps(): array
{
    // Once per process, so only call it from a test that leaves the content sources alone.
    static $pages = null;

    if ($pages !== null) {
        return $pages;
    }

    Http::fake(['api.github.com/*' => Http::response([], 200)]);
    $crawl = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach (Locales::codes() as $locale) {
            $path = $entry->url($locale, false);
            $response = test()->get($path);
            $page = $response->viewData('page');

            preg_match('/<html lang="([^"]*)"/', (string) $response->getContent(), $lang);

            $crawl[$path] = [
                'status' => $response->getStatusCode(),
                'lang' => $lang[1] ?? null,
                'component' => $page['component'] ?? null,
                'props' => $page['props'] ?? [],
            ];
        }
    }

    return $pages = $crawl;
}

// Deflated: 749 rendered pages held for the whole run would take about 100 MB.
function seoCrawledHtml(string $path): string
{
    return (string) gzinflate(seoCrawlHtml()[$path]);
}

/**
 * @return array<string, string> path => deflated HTML
 */
function seoCrawlHtml(): array
{
    requireSsr();

    // Once per process, so only call it from a test that leaves the content sources alone.
    static $pages = null;

    if ($pages !== null) {
        return $pages;
    }

    Http::fake(['api.github.com/*' => Http::response([], 200)]);
    $crawl = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);
            $response = test()->get($path);

            Assert::assertSame(200, $response->getStatusCode(), "{$path} does not render");

            $crawl[$path] = (string) gzdeflate((string) $response->getContent());
        }
    }

    return $pages = $crawl;
}

function seoPngBytes(): string
{
    return (string) base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
}
