<?php

use App\Support\Content\Slugs\CompareSlugs;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;

beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 503)]);
});

function compareData(): array
{
    return json_decode(File::get(resource_path('data/comparisons.json')), true, 512, JSON_THROW_ON_ERROR);
}

function compareProduct(string $slug): array
{
    return collect(compareData()['products'])->firstWhere('slug', $slug);
}

function compareCopy(string $slug, string $locale = 'en'): array
{
    return json_decode(File::get(resource_path("data/content/{$locale}/compare/{$slug}.json")), true, 512, JSON_THROW_ON_ERROR);
}

function compareTokensIn(string $text): array
{
    preg_match_all('/\{([A-Za-z][A-Za-z0-9_.]*)\}/', $text, $matches);

    return array_values(array_unique($matches[1]));
}

function compareTemplateTokens(array $product): array
{
    $tokens = ['name', 'status.version', 'status.date', 'starterExamples', 'teamExamples', 'macLanguages'];

    foreach (['mac.minVersion' => $product['mac']['minVersion'] ?? null, 'technology' => $product['technology'], 'licence' => $product['licence']['name']] as $token => $value) {
        if ($value !== null) {
            $tokens[] = $token;
        }
    }

    foreach ($product['cells'] as $key => $cell) {
        foreach (array_intersect(['version', 'date', 'value', 'edition'], array_keys($cell)) as $field) {
            $tokens[] = "cells.{$key}.{$field}";
        }
    }

    return $tokens;
}

function compareCitable(array $product, string $entry): bool
{
    if (str_starts_with($entry, 'cells.')) {
        return array_key_exists(substr($entry, 6), $product['cells']);
    }

    return match ($entry) {
        'platforms' => $product['platformsSource'] !== null,
        'licence', 'status' => true,
        'mac' => $product['mac'] !== null,
        'technology' => $product['technology'] !== null,
        'prices' => $product['prices'] !== [],
        default => false,
    };
}

it('renders the hub with every compared product and the title of each page', function (string $path, string $locale): void {
    $compared = collect(compareData()['products'])->whereNotNull('slug')->pluck('slug')->all();
    $titles = collect(CompareSlugs::ALL)->mapWithKeys(fn(string $slug): array => [$slug => compareCopy($slug, $locale)['header']['title']])->all();

    get($path)
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Compare/Index')
            ->where('products', fn($products): bool => collect($products)->pluck('slug')->all() === $compared)
            ->where('titles', $titles));
})->with([['/compare', 'en'], ['/vi/compare', 'vi']]);

it('renders a comparison from its product data, dated in the page language, linking the other comparisons', function (string $slug): void {
    $product = compareProduct($slug);

    get("/vi/compare/{$slug}")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('product.id', $product['id'])
            ->where('rows', compareData()['rows'])
            ->where("dates.{$product['checkedAt']}", Carbon::createFromFormat('!Y-m-d', $product['checkedAt'])->locale('vi')->isoFormat('LL'))
            ->where('others', fn($others): bool => collect($others)->pluck('slug')->all() === array_values(array_diff(CompareSlugs::ALL, [$slug]))));
})->with(CompareSlugs::ALL);

it('uses only the tokens and tags the template fills', function (string $slug): void {
    $tokens = compareTemplateTokens(compareProduct($slug));

    foreach (Arr::dot(compareCopy($slug)) as $path => $value) {
        if (! is_string($value)) {
            continue;
        }

        $allowed = str_starts_with($path, 'notes.') ? ['value', 'version', 'date', 'edition'] : $tokens;
        preg_match_all('/<([a-zA-Z]+)>/', $value, $tags);

        expect(array_diff(compareTokensIn($value), $allowed))->toBe([], "{$slug} {$path}: a token the template does not fill")
            ->and(array_diff($tags[1], ['link', 'ui']))->toBe([], "{$slug} {$path}: an unknown tag");
    }
})->with(CompareSlugs::ALL);

it('cites only facts the product has, labels its own rows, and links only what exists', function (string $slug): void {
    $product = compareProduct($slug);
    $copy = compareCopy($slug);
    $features = array_column(json_decode(File::get(resource_path('data/paid-features.json')), true), 'id');

    expect(array_keys($copy['rows']))->toBe(array_values(array_diff(array_keys($product['cells']), compareData()['rows'])));

    foreach (['stronger', 'differs', 'limits'] as $section) {
        foreach ($copy[$section]['items'] as $item) {
            foreach ($item['cite'] as $entry) {
                expect(compareCitable($product, $entry))->toBeTrue("{$slug} {$section} cites {$entry}, which the data does not have");
            }

            if ($item['feature'] !== null) {
                expect($features)->toContain($item['feature']);
            }

            if ($item['href'] !== null) {
                expect($item['href'])->toMatch('#^/(?!/)#');
            }

            expect(str_contains($item['text'], '<link>'))->toBe($item['href'] !== null || $item['feature'] !== null, "{$slug} {$section}: <link> needs a target");
        }
    }
})->with(CompareSlugs::ALL);

it('gives the hub a line for every compared product, with tokens it can fill', function (): void {
    $lines = json_decode(File::get(resource_path('data/content/en/compare/index.json')), true)['bySituation']['items'];

    expect(array_keys($lines))->toEqualCanonicalizing(CompareSlugs::ALL);

    foreach ($lines as $slug => $line) {
        expect(array_diff(compareTokensIn($line), ['name', 'status.version', 'status.date', 'mac.minVersion']))->toBe([], "the hub line for {$slug}");
    }
});

// With no cached or last good Linux release, the page reports the one platforms.json records.
function compareBindLinux(string $status): array
{
    Cache::flush();
    Storage::fake('local');

    return bindPlatformsWithLinux($status);
}

it('sends TablePro’s Linux release and distributions only once Linux is released', function (string $status): void {
    $linux = compareBindLinux($status);
    $slug = CompareSlugs::ALL[0];

    get("/compare/{$slug}")->assertInertia(fn(AssertableInertia $page) => $status === 'released'
        ? $page
            ->where('tablepro.linux.version', $linux['release']['version'])
            ->where('tablepro.linux.date', $linux['release']['publishedAt'])
            ->where('tablepro.linux.deviceNames', $linux['deviceNames'])
            ->where('tablepro.linux.channel', $linux['channel'])
            ->where('tablepro.linux.distributions', $linux['distributions'])
            ->has("dates.{$linux['release']['publishedAt']}")
        : $page->where('tablepro.linux', null));
    get('/compare')->assertInertia(fn(AssertableInertia $page) => $status === 'released'
        ? $page->where('tablepro.linux.version', $linux['release']['version'])
        : $page->where('tablepro.linux', null));
})->with(['released', 'prototype']);

it('lists Linux and its distributions in TablePro’s platforms cell, and its version in the sources', function (string $status): void {
    $linux = compareBindLinux($status);
    $platforms = collect(json_decode(File::get(resource_path('data/platforms.json')), true)['platforms'])->keyBy('id');
    $labels = json_decode(File::get(resource_path('data/content/en/compare/index.json')), true)['labels'];
    requireSsr();
    $document = Dom\HTMLDocument::createFromString((string) get('/compare/' . CompareSlugs::ALL[0])->assertOk()->getContent(), LIBXML_NOERROR);

    $glance = (string) $document->getElementById('at-a-glance')?->textContent;
    $sources = (string) $document->getElementById('sources')?->textContent;
    $floors = collect($linux['distributions'])->whereNotNull('name')->map(fn(array $distribution): string => "{$distribution['name']} {$distribution['versions'][0]}+");
    $named = strtr($labels['sources']['tableproLinux'], [
        '{macVersion}' => $platforms['mac']['release']['version'],
        '{iosVersion}' => $platforms['ios']['release']['version'],
        '{linuxVersion}' => $linux['release']['version'],
    ]);

    expect($floors)->not->toBeEmpty()
        ->and($floors->every(fn(string $floor): bool => str_contains($glance, $floor)))->toBe($status === 'released')
        ->and(str_contains($sources, $named))->toBe($status === 'released')
        ->and(str_contains($sources, $linux['release']['version']))->toBe($status === 'released');
})->with(['released', 'prototype'])->group('ssr');
