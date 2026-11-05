<?php

use App\Support\Content\Slugs\CompareSlugs;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
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
