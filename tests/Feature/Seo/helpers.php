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

/*
|--------------------------------------------------------------------------
| SEO test helpers
|--------------------------------------------------------------------------
|
| Shared by the tests under tests/Feature/Seo, the sitemap and OG command
| tests and RedirectsDataTest. Not a test file: the suffix is not `Test.php`,
| so PHPUnit never collects it, and each file that needs it requires it once.
|
| The scratch helpers point the registry's families at temporary directories,
| so a rule can be proven on pages that exist only for the test: a real pair,
| an English-only post, a page that renders without being indexed. Real
| content lands family by family, and these tests hold before and after it.
|
*/

/**
 * Points the content, blog, legal and integration families at empty scratch sources.
 *
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
 * Binds the integration catalog to a scratch index: each entry is the fixture's
 * command-line entry with the given fields replaced.
 *
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
 * Writes one content file, such as `seoWriteContent($dir, 'vi', 'features/querying')`.
 *
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
 * Writes a markdown file with front matter.
 *
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

/**
 * A request for a path, matched and bound the way the router leaves it, with
 * the locale its route group would set.
 */
function seoMatchedRequest(string $path, string $locale): Request
{
    $request = Request::create($path);
    $route = app('router')->getRoutes()->match($request);
    $route->bind($request);
    $request->setRouteResolver(fn() => $route);
    App::setLocale($locale);

    return $request;
}

/**
 * The root-relative path of an absolute URL on the canonical origin.
 */
function seoPathOf(string $url): string
{
    $path = (string) parse_url($url, PHP_URL_PATH);

    return $path === '' ? '/' : $path;
}

/**
 * Swaps `public_path()` for a scratch directory holding a copy of the logo, so
 * a command under test never writes over the committed cards or `/og.png`.
 */
function seoScratchPublic(): string
{
    $public = storage_path('framework/testing/public-' . uniqid());

    File::ensureDirectoryExists($public);
    File::copy(base_path('public/logo.png'), $public . '/logo.png');
    app()->usePublicPath($public);

    return $public;
}

/**
 * The entries of `resources/data/redirects.json`, as written.
 *
 * Read by path rather than through `resource_path()`, because datasets call
 * this before the application exists.
 *
 * @return list<array<string, mixed>>
 */
function seoRedirectEntries(): array
{
    return json_decode((string) file_get_contents(dirname(__DIR__, 3) . '/resources/data/redirects.json'), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * Runs `sitemap:generate` into a scratch public directory and parses it.
 *
 * Keyed by `<loc>`, in document order. `alternates` maps each `xhtml:link`'s
 * hreflang to its href; `elements` lists every child element's local name, so
 * a test can see what else the entry carries.
 *
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
 * `seoGenerateSitemap()` on the committed site, generated once per process.
 *
 * @return array<string, array{alternates: array<string, string>, lastmod: string|null, elements: list<string>}>
 */
function seoCommittedSitemap(): array
{
    static $urls = null;

    return $urls ??= seoGenerateSitemap();
}

/**
 * Every registry page in every locale, rendered and 404 alike, requested once
 * per process with SSR off. Only for tests that leave the content sources alone.
 *
 * @return array<string, array{status: int, lang: string|null, component: string|null, props: array<string, mixed>}>
 */
function seoCrawlProps(): array
{
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

/**
 * The server-rendered HTML of every registry page in each locale it renders
 * in, requested once per process. Only for tests that leave the content
 * sources alone.
 *
 * @return array<string, string>
 */
function seoCrawlHtml(): array
{
    requireSsr();

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

            $crawl[$path] = (string) $response->getContent();
        }
    }

    return $pages = $crawl;
}

/**
 * The smallest valid PNG: one transparent pixel.
 */
function seoPngBytes(): string
{
    return (string) base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
}
