<?php

use App\Support\Content\Slugs\CompareSlugs;
use Illuminate\Support\Facades\File;

function comparisonsJson(): array
{
    static $data = null;

    return $data ??= json_decode(File::get(resource_path('data/comparisons.json')), true, 512, JSON_THROW_ON_ERROR);
}

function comparisonLeaves(array $node, string $path = ''): array
{
    $leaves = [];

    foreach ($node as $key => $value) {
        $here = $path === '' ? (string) $key : "{$path}.{$key}";
        $leaves += is_array($value) ? comparisonLeaves($value, $here) : [$here => $value];
    }

    return $leaves;
}

function comparisonSourceRefs(array $node, string $path = ''): array
{
    $refs = [];

    foreach ($node as $key => $value) {
        $here = $path === '' ? (string) $key : "{$path}.{$key}";

        if ($key === 'source' || $key === 'platformsSource') {
            foreach ((array) $value as $id) {
                $refs[] = [$here, $id];
            }
        } elseif (is_array($value) && $key !== 'sources') {
            $refs = [...$refs, ...comparisonSourceRefs($value, $here)];
        }
    }

    return $refs;
}

it('has a dated hub and nothing dated in the future', function (): void {
    $data = comparisonsJson();

    expect($data)->toHaveKeys(['checkedAt', 'rows', 'products'])
        ->and($data['checkedAt'])->toBe(max(array_column($data['products'], 'checkedAt')));

    foreach (comparisonLeaves($data) as $path => $value) {
        if (is_string($value) && preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $date) === 1) {
            expect(checkdate((int) $date[2], (int) $date[3], (int) $date[1]))->toBeTrue("{$path} is not a date")
                ->and($value <= now()->toDateString())->toBeTrue("{$path} is in the future");
        }
    }
});

it('gives each product the documented fields', function (): void {
    $ids = array_column(comparisonsJson()['products'], 'id');

    expect($ids)->toBe(array_values(array_unique($ids)));

    foreach (comparisonsJson()['products'] as $product) {
        expect($product)->toHaveKeys(['id', 'name', 'slug', 'checkedAt', 'status', 'platforms', 'mac', 'licence', 'prices', 'cells', 'sources'])
            ->and($product['id'])->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/')
            ->and($product['status']['state'])->toBeIn(['active', 'discontinued'])
            ->and($product['licence']['openSource'])->toBeBool();

        foreach ($product['platforms'] as $platform) {
            expect($platform)->toBeIn(['mac', 'windows', 'linux', 'ios', 'web']);
        }

        foreach ($product['prices'] as $price) {
            expect(is_int($price['amount']) || is_float($price['amount']))->toBeTrue("{$product['id']} has a price that is not a number")
                ->and($price['currency'])->toBe('USD')
                ->and($price['period'])->toBeIn([null, 'once', 'month', 'year']);
        }

        foreach ($product['cells'] as $row => $cell) {
            expect($cell['state'])->toBeIn(['yes', 'no', 'qualified'], "{$product['id']}.cells.{$row}")
                ->and((array) $cell['source'])->not->toBeEmpty("{$product['id']}.cells.{$row} cites nothing");
        }
    }
});

it('resolves every cited source to an HTTPS page of the product', function (): void {
    foreach (comparisonsJson()['products'] as $product) {
        $sources = collect($product['sources'])->keyBy('id');

        expect($sources)->toHaveCount(count($product['sources']), "{$product['id']} repeats a source id");

        foreach ($product['sources'] as $source) {
            expect($source['url'])->toStartWith('https://')
                ->and($source['retrievedAt'] <= $product['checkedAt'])->toBeTrue("{$product['id']} {$source['id']} was retrieved after the check");
        }

        foreach (comparisonSourceRefs($product) as [$path, $id]) {
            expect($sources->has($id))->toBeTrue("{$product['id']}.{$path} cites {$id}, which is not in its sources");
        }
    }
});

it('names only engines engines.json has', function (): void {
    $engines = array_column(json_decode(File::get(resource_path('data/engines.json')), true, 512, JSON_THROW_ON_ERROR), 'id');

    foreach (comparisonsJson()['products'] as $product) {
        foreach ($product['cells'] as $row => $cell) {
            expect(array_values(array_diff($cell['engines'] ?? [], $engines)))->toBe([], "{$product['id']}.cells.{$row} names an unknown engine");
        }
    }
});

it('routes exactly the compared products, each with a page that explains its notes', function (): void {
    $compared = collect(comparisonsJson()['products'])->whereNotNull('slug')->keyBy('slug');

    expect(CompareSlugs::ALL)->toEqualCanonicalizing($compared->keys()->all());

    foreach ($compared as $slug => $product) {
        expect($slug)->toBe($product['id']);

        $copy = json_decode(File::get(resource_path("data/content/en/compare/{$slug}.json")), true, 512, JSON_THROW_ON_ERROR);
        $notes = collect(comparisonLeaves($product))
            ->filter(fn(mixed $value, string $path): bool => str_ends_with($path, '.note') && is_string($value))
            ->unique()
            ->values()
            ->all();

        expect(array_keys($copy['notes'] ?? []))->toEqualCanonicalizing($notes, "compare/{$slug}.json must explain exactly the notes its product cites");
    }
});
