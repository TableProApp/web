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

require_once __DIR__ . '/helpers.php';

/**
 * The Open Graph cards committed under `public/og`, checked against the pages
 * that share them (architecture §1.15, sitemap §C.7).
 *
 * Cards are rendered on a developer machine and committed; production never
 * generates one. So nothing but these cases stands between a new page and a
 * share preview that 404s, or between a retired page and a card that still
 * carries its old claims. Five database pages once shipped a missing card on
 * a green suite, because the only coverage check walked scratch content.
 *
 * Every case here reads the committed content and the real `public`
 * directory. Regenerate with `php artisan og:generate` (see CLAUDE.md).
 */
beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

/**
 * The committed file behind a URL on the canonical origin.
 */
function ogCardsFile(string $url): string
{
    return base_path('public' . seoPathOf($url));
}

/**
 * Whether a page has card copy of its own in a locale: a post, or an `og`
 * title in the content file of a feature, database or comparison page. Every
 * other page shares its language's generic card.
 */
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

/**
 * Every card `og:generate` writes for the committed content, as public paths:
 * each locale's generic card and each page's own card.
 *
 * @return list<string>
 */
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
    /*
     * Through `SeoContext`, which is the shared `seo` prop the head renders,
     * so this is the URL a share preview actually fetches.
     */
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

    expect($checked)->toBeGreaterThan(100);
});

it('gives each page with card copy its own card, in its own language', function (): void {
    /*
     * A page whose card is missing falls back to the generic card without a
     * sound, so the fallback alone cannot show that a card was forgotten.
     */
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

    expect($own)->toBeGreaterThan(80);
});

it('says what each card shows, in the language of the page that shares it', function (): void {
    /*
     * A card is text set in an image, so its `alt` is that text: the title
     * `og:generate` printed on a page's own card, or what the manifest says
     * the designed site card shows.
     */
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

    expect($own)->toBeGreaterThan(80);
});

it('has a generic card for every language', function (): void {
    foreach (Locales::codes() as $locale) {
        $file = base_path('public' . OgImages::fallbackPath($locale));

        expect(File::isFile($file))->toBeTrue(OgImages::fallbackPath($locale) . ' is missing. Run: php artisan og:generate --type=site');
        expect(array_slice((array) getimagesize($file), 0, 2))->toBe([1200, 630]);
    }
});

it('keeps no card that no page shares', function (): void {
    /*
     * A retired page's card stays reachable at its old URL for as long as the
     * file exists, with whatever the page used to claim baked into the image
     * ("10x LESS RAM" on the pre-rebuild comparison cards). Merged and removed
     * pages lose their cards (sitemap §C.7).
     *
     * The bespoke generic card the owner may supply (`og-site` in
     * resources/data/assets.json) is the one file allowed beside the generated
     * ones.
     */
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

    /*
     * Beside `/og.png` at the root: the pre-rebuild `/og@2x.png` sat there,
     * unreferenced but public, still saying "Native speed.".
     */
    foreach (File::glob(base_path('public/og*.png')) as $file) {
        $onDisk[] = '/' . basename($file);
    }

    sort($onDisk);

    expect($onDisk)->toBe(ogCardsExpected());
});

it('draws every generated card on the current template', function (): void {
    /*
     * A card rendered by an older template still says whatever that template
     * printed: the pre-rebuild cards were dark and carried "Native speed.",
     * "29 databases" and benchmark claims. The ground colour of
     * resources/views/og/layout.blade.php is the cheapest proof that a card
     * was drawn by the current one. If the template's ground changes, every
     * card has to be regenerated, and this case fails until it is.
     */
    $layout = (string) file_get_contents(resource_path('views/og/layout.blade.php'));

    expect(preg_match('/html,\s*body\s*\{[^}]*?background:\s*#([0-9a-f]{6})\s*;/i', $layout, $match))->toBe(1);

    $ground = array_map(hexdec(...), str_split(strtolower($match[1]), 2));

    foreach (ogCardsExpected() as $path) {
        // Supplied artwork occupies the canonical English default URL.
        // Its geometry, opacity and budget are checked in BespokeOgCardTest.
        if ($path === '/og.png' && app(AssetManifest::class)->ogCard(OgImages::SITE_CARD, Locales::default()) === $path) {
            continue;
        }

        $image = imagecreatefrompng(base_path('public' . $path));

        Assert::assertNotFalse($image, "{$path} is not a PNG");
        Assert::assertSame([1200, 630], [imagesx($image), imagesy($image)], "{$path} is not 1200 × 630");

        foreach ([[8, 8], [1191, 8], [8, 621], [1191, 621]] as [$x, $y]) {
            $pixel = imagecolorsforindex($image, (int) imagecolorat($image, $x, $y));

            Assert::assertSame(
                $ground,
                [$pixel['red'], $pixel['green'], $pixel['blue']],
                "{$path} was not drawn by the current template. Run: php artisan og:generate",
            );
        }
    }
});
