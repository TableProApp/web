<?php

use App\Support\Localization\Locales;
use Illuminate\Support\Facades\File;

function factsJson(): array
{
    static $data = null;

    return $data ??= json_decode(File::get(resource_path('data/facts.json')), true, 512, JSON_THROW_ON_ERROR);
}

function factsData(string $file): array
{
    return json_decode(File::get(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

function factsUnique(array $list, string $label): void
{
    expect($list)->not->toBeEmpty("{$label} is empty")
        ->and($list)->toBe(array_values(array_unique($list, SORT_REGULAR)), "{$label} has duplicates");
}

it('is dated and has the sections the pages read', function (): void {
    expect(factsJson())->toHaveKeys([
        'verifiedAt', 'links', 'support', 'publisher', 'openSource', 'ai', 'mcp', 'safeMode', 'filterOperators',
        'connectionImport', 'dataImport', 'export', 'backup', 'sync', 'limits',
    ])
        ->and(factsJson()['verifiedAt'])->toMatch('/^\d{4}-\d{2}-\d{2}$/')
        ->and(factsJson()['verifiedAt'] <= now()->toDateString())->toBeTrue('verifiedAt is in the future');
});

it('links only over HTTPS, and to the App Store destination platforms.json has', function (): void {
    $links = factsJson()['links'];

    foreach ($links as $key => $url) {
        expect($url)->toStartWith('https://', "links.{$key}")
            ->and(filter_var($url, FILTER_VALIDATE_URL))->not->toBeFalse("links.{$key} is malformed");
    }

    $ios = collect(factsData('platforms.json')['platforms'])->firstWhere('id', 'ios');

    expect($links['appStore'])->toBe(collect($ios['destinations'])->firstWhere('kind', 'app-store')['url']);
});

it('names the publisher in every supported language', function (): void {
    $publisher = factsJson()['publisher'];

    expect($publisher['name'])->toBeString()->not->toBeEmpty()
        ->and(filter_var(factsJson()['support']['email'], FILTER_VALIDATE_EMAIL))->not->toBeFalse();

    foreach (['city', 'country'] as $field) {
        expect(array_keys($publisher[$field]))->toEqualCanonicalizing(Locales::codes(), "publisher.{$field} does not cover every locale");
    }
});

it('keeps each list free of duplicates', function (): void {
    $facts = factsJson();

    factsUnique($facts['ai']['providers'], 'ai.providers');
    factsUnique($facts['mcp']['toolGroups'], 'mcp.toolGroups');
    factsUnique($facts['filterOperators']['mac'], 'filterOperators.mac');
    factsUnique($facts['filterOperators']['ios'], 'filterOperators.ios');
    factsUnique(array_column($facts['connectionImport'], 'id'), 'connectionImport');
    factsUnique(array_column($facts['dataImport']['formats'], 'id'), 'dataImport.formats');
    factsUnique(array_column($facts['export']['formats'], 'id'), 'export.formats');
    factsUnique(array_column($facts['backup']['tools'], 'id'), 'backup.tools');
    factsUnique($facts['sync']['neverSynced'], 'sync.neverSynced');
});

it('defaults Safe Mode to one of its own levels on each platform', function (): void {
    foreach (factsJson()['safeMode'] as $platform => $safeMode) {
        expect($safeMode['default'])->toBeIn(array_column($safeMode['levels'], 'id'), "safeMode.{$platform}.default");
    }
});

it('refers only to engines, compared products and platforms the other data files have', function (): void {
    $facts = factsJson();
    $engines = array_column(factsData('engines.json'), 'id');
    $products = array_column(factsData('comparisons.json')['products'], 'id');
    $platforms = array_column(factsData('platforms.json')['platforms'], 'id');

    expect(array_diff(array_column($facts['connectionImport'], 'id'), $products))->toBe([]);

    foreach ([...$facts['dataImport']['formats'], ...$facts['export']['formats']] as $format) {
        expect(array_diff([...$format['engines'] ?? [], ...$format['exceptEngines']], $engines))->toBe([], "{$format['id']} names an unknown engine");
    }

    expect(array_diff($facts['backup']['serverSideExport'], $engines))->toBe([]);

    foreach ($facts['limits'] as $id => $limit) {
        expect($limit['value'])->toBeInt()
            ->and($limit['max'] === null || $limit['max'] >= $limit['value'])->toBeTrue("limits.{$id}.max")
            ->and($platforms)->toContain($limit['platform']);
    }
});

it('keeps the backup tools in step with the engines that dump natively', function (): void {
    $fromEngines = collect(factsData('engines.json'))
        ->filter(fn(array $engine): bool => $engine['capabilities']['nativeDump'] !== null)
        ->mapWithKeys(fn(array $engine): array => [$engine['id'] => $engine['capabilities']['nativeDump']])
        ->all();
    $fromTools = collect(factsJson()['backup']['tools'])
        ->flatMap(fn(array $tool): array => array_fill_keys($tool['engines'], $tool['id']))
        ->all();

    ksort($fromEngines);
    ksort($fromTools);

    expect($fromTools)->toBe($fromEngines);
});

it('dates no sync category after the current Mac release', function (): void {
    $release = collect(factsData('platforms.json')['platforms'])->firstWhere('id', 'mac')['release']['version'];

    foreach (['mac', 'ios'] as $platform) {
        foreach (factsJson()['sync'][$platform]['categories'] as $category) {
            if ($category['sinceAppVersion'] !== null) {
                expect(version_compare($category['sinceAppVersion'], $release, '<='))->toBeTrue("sync.{$platform}.{$category['id']}");
            }
        }
    }
});
