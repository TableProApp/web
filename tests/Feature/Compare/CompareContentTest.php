<?php

use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;

/**
 * The compare pages' copy follows the schema in
 * resources/js/components/compare/README.md, so the one template can render
 * every comparison and every fact on it stays in resources/data.
 *
 * - The sections are the blueprint's (sitemap §E.3), in a fixed shape, with
 *   3-5 reasons on each side of the short answer and 2-4 questions.
 * - Every product-specific fact in `comparisons.json` has a row label, and
 *   nothing else does.
 * - A sentence cites only facts its product's data has, links only to this
 *   site's own paths, and names only paid features that exist.
 * - Switching steps appear only where TablePro has an importer for the
 *   product (`facts.json` → `connectionImport`).
 * - Copy uses only the tokens the template fills, and types no price, URL or
 *   benchmark: those come from data.
 */
const COMPARE_PAGE_KEYS = ['seo', 'og', 'header', 'shortAnswer', 'glance', 'rows', 'stronger', 'differs', 'limits', 'switching', 'faq', 'notes'];

const COMPARE_STANDARD_ROWS = ['platforms', 'price', 'licence', 'databases', 'ai', 'mcp', 'ios', 'sync', 'import'];

const COMPARE_LIST_SECTIONS = ['stronger', 'differs', 'limits'];

/**
 * @return Collection<string, array<string, mixed>>
 */
function comparedProductsBySlug(): Collection
{
    $data = json_decode(File::get(resource_path('data/comparisons.json')), true, 512, JSON_THROW_ON_ERROR);

    return collect($data['products'])->whereNotNull('slug')->keyBy('slug');
}

/**
 * Every compare page file in both languages: [locale, slug, copy].
 *
 * @return list<array{0: string, 1: string, 2: array<string, mixed>}>
 */
function comparePageCopies(): array
{
    $pages = [];

    foreach (['en', 'vi'] as $locale) {
        foreach (File::glob(resource_path("data/content/{$locale}/compare/*.json")) ?: [] as $path) {
            $slug = pathinfo($path, PATHINFO_FILENAME);

            if ($slug !== 'index') {
                $pages[] = [$locale, $slug, json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR)];
            }
        }
    }

    return $pages;
}

/**
 * @return array<string, mixed>
 */
function compareHubCopy(string $locale): array
{
    return json_decode(File::get(resource_path("data/content/{$locale}/compare/index.json")), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * The `{tokens}` a page's prose may use, from its product's data: the
 * template fills these and nothing else (components/compare/model.ts).
 *
 * @param  array<string, mixed>  $product
 * @return list<string>
 */
function compareProseTokens(array $product): array
{
    $tokens = ['name', 'status.version', 'status.date', 'starterExamples', 'teamExamples', 'macLanguages'];

    if (($product['mac']['minVersion'] ?? null) !== null) {
        $tokens[] = 'mac.minVersion';
    }

    if ($product['technology'] !== null) {
        $tokens[] = 'technology';
    }

    if ($product['licence']['name'] !== null) {
        $tokens[] = 'licence';
    }

    foreach ($product['cells'] as $key => $cell) {
        foreach (['version', 'date', 'value', 'edition'] as $field) {
            if (array_key_exists($field, $cell)) {
                $tokens[] = "cells.{$key}.{$field}";
            }
        }
    }

    return $tokens;
}

/**
 * @return list<string>
 */
function compareTokensIn(string $text): array
{
    preg_match_all('/\{([A-Za-z][A-Za-z0-9_.]*)\}/', $text, $matches);

    return array_values(array_unique($matches[1]));
}

/**
 * Whether a `cite` entry names a fact the product's data has.
 *
 * @param  array<string, mixed>  $product
 */
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

it('gives every page the documented sections', function (): void {
    foreach (comparePageCopies() as [$locale, $slug, $copy]) {
        $where = "content/{$locale}/compare/{$slug}.json";

        expect(array_keys($copy))->toBe(COMPARE_PAGE_KEYS, "{$where} sections");
        expect($copy['seo']['title'])->toBeString()->not->toBe('');
        expect($copy['seo']['description'])->toBeString()->not->toBe('');
        expect(mb_strlen($copy['seo']['description']))->toBeLessThanOrEqual(180, "{$where} seo.description is too long");
        expect(array_keys($copy['og']))->toBe(['kicker', 'title'], "{$where} og");
        expect(array_keys($copy['header']))->toBe(['title', 'lead'], "{$where} header");
        expect(array_keys($copy['glance']))->toBe(['intro'], "{$where} glance");

        foreach (['tablepro', 'competitor'] as $side) {
            expect(count($copy['shortAnswer'][$side]))->toBeGreaterThanOrEqual(3, "{$where} shortAnswer.{$side}")->toBeLessThanOrEqual(5, "{$where} shortAnswer.{$side}");
        }

        expect(array_keys($copy['switching']))->toBe(['intro', 'steps', 'after', 'docs'], "{$where} switching");
        expect(count($copy['faq']))->toBeGreaterThanOrEqual(2, "{$where} faq")->toBeLessThanOrEqual(4, "{$where} faq");

        $ids = array_column($copy['faq'], 'id');

        expect($ids)->toBe(array_values(array_unique($ids)), "{$where} repeats a question id");

        foreach ($copy['faq'] as $item) {
            expect(array_keys($item))->toBe(['id', 'question', 'answer', 'href'], "{$where} faq item");
            expect($item['id'])->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/');
        }
    }
});

it('labels every product-specific fact, and only those', function (): void {
    $products = comparedProductsBySlug();

    foreach (comparePageCopies() as [$locale, $slug, $copy]) {
        $extra = array_values(array_diff(array_keys($products[$slug]['cells']), COMPARE_STANDARD_ROWS));

        expect(array_keys($copy['rows']))->toBe($extra, "content/{$locale}/compare/{$slug}.json rows must label exactly the product's extra cells, in data order");

        foreach ($copy['rows'] as $key => $row) {
            expect(array_keys($row))->toBe(['label', 'tablepro'], "{$slug}.rows.{$key}");
            expect($row['label'])->toBeString()->not->toBe('');
            expect($row['tablepro'])->toBeString()->not->toBe('');
        }
    }
});

it('cites only facts the product has, links only to this site, and names only real paid features', function (): void {
    $products = comparedProductsBySlug();
    $features = collect(json_decode(File::get(resource_path('data/paid-features.json')), true))->pluck('id')->all();

    foreach (comparePageCopies() as [$locale, $slug, $copy]) {
        foreach (COMPARE_LIST_SECTIONS as $section) {
            expect(array_keys($copy[$section]))->toBe(['intro', 'items'], "{$slug}.{$section}");
            expect($copy[$section]['items'])->not->toBeEmpty("{$locale}/{$slug}.{$section} has no items");

            foreach ($copy[$section]['items'] as $index => $item) {
                $where = "content/{$locale}/compare/{$slug}.json {$section}.items.{$index}";

                expect(array_keys($item))->toBe(['text', 'cite', 'feature', 'href'], $where);

                foreach ($item['cite'] as $entry) {
                    expect(compareCitable($products[$slug], $entry))->toBeTrue("{$where} cites {$entry}, which the product's data does not have");
                }

                if ($item['feature'] !== null) {
                    expect($features)->toContain($item['feature']);
                }

                if ($item['href'] !== null) {
                    expect($item['href'])->toMatch('#^/(?!/)#', "{$where} href must be a path on this site");
                }

                $linked = $item['href'] !== null || $item['feature'] !== null;

                expect(str_contains($item['text'], '<link>'))->toBe($linked, "{$where}: <link> needs an href or a feature, and an href needs <link>");
            }
        }

        foreach ($copy['faq'] as $item) {
            expect(str_contains($item['answer'], '<link>'))->toBe($item['href'] !== null, "{$locale}/{$slug} faq {$item['id']}: <link> and href go together");
        }
    }
});

it('states switching steps only where TablePro has an importer', function (): void {
    $importers = collect(json_decode(File::get(resource_path('data/facts.json')), true)['connectionImport'])->pluck('id')->all();

    foreach (comparePageCopies() as [$locale, $slug, $copy]) {
        $where = "content/{$locale}/compare/{$slug}.json";

        if (in_array($slug, $importers, true)) {
            expect($copy['switching']['steps'])->not->toBeEmpty("{$where}: TablePro imports {$slug}, so the page needs the steps");
            expect(str_contains($copy['switching']['steps'][0], '<ui>'))->toBeTrue("{$where}: the first step names the menu path");
        } else {
            expect($copy['switching']['steps'])->toBe([], "{$where}: TablePro has no importer for {$slug}, so there are no import steps");
        }

        if ($copy['switching']['docs'] !== null) {
            expect($copy['switching']['docs'])->toMatch('#^/[a-z0-9/-]+$#');
        }
    }
});

it('uses only the tokens and tags the template fills', function (): void {
    $products = comparedProductsBySlug();

    foreach (comparePageCopies() as [$locale, $slug, $copy]) {
        $prose = compareProseTokens($products[$slug]);

        foreach (Arr::dot($copy) as $path => $value) {
            if (! is_string($value)) {
                continue;
            }

            $allowed = str_starts_with($path, 'notes.') ? ['value', 'version', 'date', 'edition'] : $prose;

            foreach (compareTokensIn($value) as $token) {
                expect(in_array($token, $allowed, true))->toBeTrue("content/{$locale}/compare/{$slug}.json {$path} uses {{$token}}, which the template does not fill");
            }

            preg_match_all('/<([a-zA-Z]+)>/', $value, $tags);

            foreach ($tags[1] as $tag) {
                expect(in_array($tag, ['link', 'ui'], true))->toBeTrue("{$slug} {$path}: <{$tag}> is not a compare tag");
            }
        }
    }
});

it('types no price, URL or benchmark into compare copy', function (): void {
    $files = File::glob(resource_path('data/content/{en,vi}/compare/*.json'), GLOB_BRACE) ?: [];

    expect($files)->not->toBeEmpty();

    foreach ($files as $path) {
        foreach (Arr::dot(json_decode(File::get($path), true)) as $key => $value) {
            if (! is_string($value) || str_starts_with($key, 'labels.currency.')) {
                continue;
            }

            $where = basename(dirname($path, 2)) . '/' . basename($path) . " {$key}";

            expect(preg_match('/\$\s?\d|\d\s?US\$|\bUSD\s?\d|€\s?\d/u', $value))->toBe(0, "{$where} types a price; prices come from data");
            expect(preg_match('#https?://#', $value))->toBe(0, "{$where} types a URL; sources and links come from data");
            expect(preg_match('/\d+(\.\d+)?\s?(MB|GB|ms)\b|\d+\s?[x×]\s?(faster|lighter|less)|faster than|nhanh hơn|nhẹ hơn/iu', $value))->toBe(0, "{$where} looks like a benchmark");
        }
    }
});

it('gives the hub one line per compared product, in data order', function (): void {
    $slugs = comparedProductsBySlug()->keys()->all();

    foreach (['en', 'vi'] as $locale) {
        $hub = compareHubCopy($locale);

        expect(array_keys($hub['bySituation']['items']))->toBe($slugs, "content/{$locale}/compare/index.json bySituation.items");

        foreach ($hub['bySituation']['items'] as $slug => $line) {
            foreach (compareTokensIn($line) as $token) {
                expect(in_array($token, ['name', 'status.version', 'status.date', 'mac.minVersion'], true))->toBeTrue("{$locale} hub line for {$slug} uses {{$token}}");
            }
        }

        expect($hub['labels'])->toHaveKeys(['factsChecked', 'rows', 'cell', 'price', 'tablepro', 'import', 'sections', 'sources', 'hub']);
        expect(array_keys($hub['labels']['rows']))->toBe([...array_slice(COMPARE_STANDARD_ROWS, 0, 1), 'technology', ...array_slice(COMPARE_STANDARD_ROWS, 1)]);
    }
});

it('keeps the Vietnamese currency pattern in US dollars', function (): void {
    expect(compareHubCopy('en')['labels']['currency'])->toBe(['pattern' => '${amount}', 'decimal' => '.', 'group' => ',']);
    expect(compareHubCopy('vi')['labels']['currency'])->toBe(['pattern' => '{amount} US$', 'decimal' => ',', 'group' => '.']);
});
