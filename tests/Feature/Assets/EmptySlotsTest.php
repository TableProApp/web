<?php

use App\Support\Assets\AssetManifest;
use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use Dom\HTMLDocument;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();
    // Not `*`: that would also answer the SSR gateway.
    Http::fake(['api.github.com/*' => Http::response([], 500), 'github.com/*' => Http::response([], 500), 'raw.githubusercontent.com/*' => Http::response([], 500)]);
});

/**
 * @return array<string, list<string>> page path => the slots it places that have no image
 */
function emptySlotPages(): array
{
    $manifest = new AssetManifest();
    $pages = [];

    foreach ($manifest->assets() as $id => $entry) {
        if (! $entry['slot'] || $manifest->isSupplied($id)) {
            continue;
        }

        foreach ($entry['usedOn'] as $use) {
            $pages[$use['path']][] = $id;
        }
    }

    return $pages;
}

it('shows placeholders everywhere but production', function (string $environment, bool $shown): void {
    app()->detectEnvironment(fn(): string => $environment);

    get('/ios')->assertInertia(fn(AssertableInertia $page) => $page->where('assetPlaceholders', $shown));
})->with([
    'production' => ['production', false],
    'staging' => ['staging', true],
    'local' => ['local', true],
    'testing' => ['testing', true],
]);

it('leaves no trace of a slot with no image on a production page', function (): void {
    requireSsr();
    app()->detectEnvironment(fn(): string => 'production');

    $manifest = new AssetManifest();
    $checked = 0;

    foreach (emptySlotPages() as $page => $ids) {
        foreach (Locales::codes() as $locale) {
            $path = LocalizedUrl::path($page, $locale);
            $response = get($path);

            if ($response->getStatusCode() === 404) {
                continue;
            }

            $response->assertOk();
            $html = (string) $response->getContent();
            $main = HTMLDocument::createFromString($html, LIBXML_NOERROR)->querySelector('main');
            $checked++;

            Assert::assertNotNull($main, "{$path} has no <main>");
            Assert::assertCount(0, $main->querySelectorAll('[data-asset-id], [data-asset-status]:not([data-asset-status="supplied"])'), "{$path} renders a placeholder");

            $words = (string) $main->textContent;

            foreach ($main->querySelectorAll('[aria-label]') as $labelled) {
                $words .= "\n" . $labelled->getAttribute('aria-label');
            }

            foreach ($ids as $id) {
                $entry = $manifest->entry($id);
                $files = '/' . trim(preg_replace('#^public/?#', '', $entry['replacement']['dir']), '/') . '/' . $entry['replacement']['base'] . '-';

                Assert::assertStringNotContainsString($id, $main->innerHTML, "{$path} names {$id}");
                Assert::assertStringNotContainsString($entry['description'][$locale] ?? $entry['description']['en'], $words, "{$path} prints or speaks the brief of {$id}");
                // Head included: no preload, Open Graph tag or JSON-LD node may name a file that is not there.
                Assert::assertStringNotContainsString($files, $html, "{$path} links a file of {$id}");
            }

            Assert::assertCount(0, $main->querySelectorAll('div:empty, figure:empty'), "{$path} keeps an empty box where a slot was");

            foreach ($main->querySelectorAll('[class~="lg:grid-cols-12"]') as $grid) {
                $columns = 0;

                foreach ($grid->children as $cell) {
                    $columns += preg_match('/(?:^|\s)lg:col-span-(\d+)(?:\s|$)/', (string) $cell->getAttribute('class'), $span) === 1 ? (int) $span[1] : 1;
                }

                Assert::assertSame(0, $columns % 12, "{$path}: a 12-column grid has a row with an empty column");
            }
        }
    }

    expect($checked)->toBeGreaterThanOrEqual(count(emptySlotPages()));
})->group('ssr');
