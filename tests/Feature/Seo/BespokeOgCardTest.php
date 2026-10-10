<?php

use App\Support\Assets\AssetManifest;
use App\Support\Localization\Locales;
use App\Support\Seo\OgImages;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\SeoContext;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Assert;

require_once __DIR__ . '/helpers.php';

beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);

    $this->scratch = storage_path('framework/testing/og-site-' . uniqid());
    File::ensureDirectoryExists($this->scratch);
});

afterEach(function (): void {
    File::deleteDirectory($this->scratch);
});

function bespokeSuppliedManifest(string $dir): AssetManifest
{
    $data = json_decode((string) file_get_contents(resource_path('data/assets.json')), true, 512, JSON_THROW_ON_ERROR);
    $entry = &$data['assets'][OgImages::SITE_CARD];

    if ($entry['status'] !== 'supplied') {
        $entry['status'] = 'supplied';
        $entry['src'] = array_fill_keys(Locales::codes(), [
            'light' => ['widths' => [1200], 'formats' => ['png'], 'width' => 1200, 'height' => 630],
        ]);
    }

    unset($entry);

    $path = "{$dir}/assets.json";
    File::put($path, json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

    $manifest = new AssetManifest($path);
    app()->instance(AssetManifest::class, $manifest);

    return $manifest;
}

/**
 * @return list<string>
 */
function bespokePngChunks(string $bytes): array
{
    $chunks = [];
    $offset = 8;

    while ($offset + 8 <= strlen($bytes)) {
        $length = unpack('N', substr($bytes, $offset, 4))[1];
        $chunks[] = substr($bytes, $offset + 4, 4);
        $offset += 12 + $length;
    }

    return $chunks;
}

it('ships the card as an opaque 1200 × 630 PNG within budget, one per locale', function (): void {
    // A link preview has no theme, so no alpha channel (IHDR colour types 4 and 6) and no tRNS chunk.
    $manifest = new AssetManifest();
    $budget = $manifest->kindOf(OgImages::SITE_CARD)['maxBytes'];
    $hashes = [];

    foreach (Locales::codes() as $locale) {
        $url = $manifest->fileUrl(OgImages::SITE_CARD, 'light', $locale, 1200, 'png');
        $file = public_path(ltrim($url, '/'));

        Assert::assertFileExists($file, "{$url} is missing");

        $bytes = (string) file_get_contents($file);
        $size = getimagesize($file);

        Assert::assertIsArray($size, "{$url} is not an image");
        Assert::assertSame([1200, 630, 'image/png'], [$size[0], $size[1], $size['mime']], "{$url} is not a 1200 × 630 PNG");
        Assert::assertLessThanOrEqual($budget, strlen($bytes), "{$url} is over the {$budget}-byte og-card budget");
        Assert::assertContains(ord($bytes[25]), [0, 2, 3], "{$url} has an alpha channel");
        Assert::assertNotContains('tRNS', bespokePngChunks($bytes), "{$url} has transparent pixels");

        $hashes[$locale] = md5($bytes);
    }

    expect(array_unique($hashes))->toHaveCount(count(Locales::codes()));
});

it('puts the card on every page without its own, in its language, instead of the generated one', function (): void {
    $manifest = bespokeSuppliedManifest($this->scratch);
    $generated = array_map(OgImages::fallbackPath(...), array_values(array_diff(Locales::codes(), [Locales::default()])));

    foreach (Locales::codes() as $locale) {
        expect($manifest->ogCard(OgImages::SITE_CARD, $locale))->toBe($locale === Locales::default() ? '/og.png' : "/og/bespoke/og-site-{$locale}.png");
    }

    $sharing = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);
            $image = app(SeoContext::class)->forRequest(seoMatchedRequest($path, $locale))['ogImage'];

            Assert::assertNotNull($image, "{$path} shares no og:image");

            $shared = seoPathOf($image['url']);

            Assert::assertNotContains($shared, $generated, "{$path} still shares the generated generic card");

            if ($shared === $manifest->ogCard(OgImages::SITE_CARD, $locale)) {
                Assert::assertSame([1200, 630, 'image/png'], [$image['width'], $image['height'], $image['type']], "{$path}: the og:image tags disagree with the card");
                $sharing[] = $path;

                continue;
            }

            Assert::assertSame(
                OgImages::cardPath($entry->ogFamily, (string) $entry->ogSlug, $locale),
                $shared,
                "{$path} shares neither its own card nor the og-site card for its language",
            );
        }
    }

    $registry = app(PageRegistry::class);
    $named = 0;

    foreach ($manifest->entry(OgImages::SITE_CARD)['usedOn'] as $use) {
        $entry = collect($registry->all())->first(fn(PageEntry $entry): bool => $entry->url(Locales::default(), false) === $use['path']);

        Assert::assertNotNull($entry, "og-site names {$use['path']}, which is not a page");

        foreach ($entry->renderLocales as $locale) {
            Assert::assertContains($entry->url($locale, false), $sharing, "{$entry->url($locale, false)} does not share the og-site card");
            $named++;
        }
    }

    expect($named)->toBeGreaterThanOrEqual(2 * 12);
});
