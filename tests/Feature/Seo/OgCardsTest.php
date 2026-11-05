<?php

use App\Services\Blog\BlogService;
use App\Support\Assets\AssetManifest;
use App\Support\Content\ContentRepository;
use App\Support\Localization\Locales;
use App\Support\Seo\ContentCollection;
use App\Support\Seo\OgImages;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\SeoContext;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Assert;

beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

function ogCardsFile(string $url): string
{
    return base_path('public' . seoPathOf($url));
}

function ogCardsHasOwnCopy(PageEntry $entry, string $locale): bool
{
    if ($entry->ogSlug === null || $entry->ogFamily === 'site') {
        return false;
    }

    if ($entry->ogFamily === 'blog') {
        return true;
    }

    $name = ContentCollection::contentName($entry);
    $content = app(ContentRepository::class);

    if ($name === null || ! $content->has($name, $locale)) {
        return false;
    }

    $og = $content->page($name, $locale)['og'] ?? null;

    return is_array($og) && is_string($og['title'] ?? null) && trim($og['title']) !== '';
}

function ogCardsExpected(): array
{
    $paths = array_map(OgImages::fallbackPath(...), Locales::codes());

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            if (ogCardsHasOwnCopy($entry, $locale)) {
                $paths[] = OgImages::cardPath($entry->ogFamily, (string) $entry->ogSlug, $locale);
            }
        }
    }

    $paths = array_values(array_unique($paths));
    sort($paths);

    return $paths;
}

it('points every page, in every language it renders in, at a card that is on disk', function (): void {
    $checked = 0;

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);
            $image = app(SeoContext::class)->forRequest(seoMatchedRequest($path, $locale))['ogImage'];

            Assert::assertNotNull($image, "{$path} shares no og:image");

            $file = ogCardsFile($image['url']);

            Assert::assertFileExists($file, "{$path} shares {$image['url']}, which is not in public/");

            $size = getimagesize($file);

            Assert::assertIsArray($size, "{$image['url']} is not an image");
            Assert::assertSame(
                [$size[0], $size[1], $size['mime']],
                [$image['width'], $image['height'], $image['type']],
                "{$path}: the og:image width, height or type tags disagree with the file",
            );

            $checked++;
        }
    }

    expect($checked)->toBeGreaterThan(0);
});

it('gives each page with card copy its own card, in its own language', function (): void {
    $images = app(OgImages::class);
    $own = 0;

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            $url = $images->for($entry, $locale)['url'] ?? null;

            if (ogCardsHasOwnCopy($entry, $locale)) {
                Assert::assertSame(
                    OgImages::cardPath($entry->ogFamily, (string) $entry->ogSlug, $locale),
                    seoPathOf((string) $url),
                    "{$entry->key()} ({$locale}) has card copy but no card. Run: php artisan og:generate --type={$entry->ogFamily} --slug={$entry->ogSlug} --locale={$locale}",
                );
                $own++;

                continue;
            }

            Assert::assertSame($images->fallback($locale)['url'] ?? null, $url, "{$entry->key()} ({$locale}) should share its language's generic card");
        }
    }

    expect($own)->toBeGreaterThan(0);
});

it('says what each card shows, in the language of the page that shares it', function (): void {
    $site = app(AssetManifest::class)->entry(OgImages::SITE_CARD)['alt'];
    $blog = app(BlogService::class);
    $content = app(ContentRepository::class);
    $own = 0;

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);
            $alt = app(SeoContext::class)->forRequest(seoMatchedRequest($path, $locale))['ogImage']['alt'] ?? null;

            if (! ogCardsHasOwnCopy($entry, $locale)) {
                Assert::assertSame($site[$locale], $alt, "{$path} does not describe the site card in its language");

                continue;
            }

            $title = $entry->ogFamily === 'blog'
                ? $blog->find((string) $entry->ogSlug, $locale)->title
                : $content->page((string) ContentCollection::contentName($entry), $locale)['og']['title'];

            Assert::assertSame($title, $alt, "{$path} does not describe its own card");
            $own++;
        }
    }

    expect($own)->toBeGreaterThan(0);
});

it('has a generic card for every language', function (): void {
    foreach (Locales::codes() as $locale) {
        $file = base_path('public' . OgImages::fallbackPath($locale));

        expect(File::isFile($file))->toBeTrue(OgImages::fallbackPath($locale) . ' is missing. Run: php artisan og:generate --type=site');
        expect(array_slice((array) getimagesize($file), 0, 2))->toBe([1200, 630]);
    }
});

it('keeps no card that no page shares', function (): void {
    $assets = app(AssetManifest::class);
    $bespoke = array_map(
        fn(string $locale): string => $assets->fileUrl(OgImages::SITE_CARD, 'light', $locale, 1200, 'png'),
        Locales::codes(),
    );

    $onDisk = [];

    foreach (File::allFiles(base_path('public/og')) as $file) {
        $path = '/og/' . str_replace(DIRECTORY_SEPARATOR, '/', $file->getRelativePathname());

        if (! in_array($path, $bespoke, true)) {
            $onDisk[] = $path;
        }
    }

    foreach (File::glob(base_path('public/og*.png')) as $file) {
        $onDisk[] = '/' . basename($file);
    }

    sort($onDisk);

    expect($onDisk)->toBe(ogCardsExpected());
});
