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
        'verifiedAt', 'links', 'privacyPolicies', 'support', 'publisher', 'openSource', 'ai', 'mcp', 'safeMode', 'filterOperators',
        'connectionImport', 'dataImport', 'export', 'backup', 'sync', 'limits', 'account',
    ])
        ->and(factsJson()['verifiedAt'])->toMatch('/^\d{4}-\d{2}-\d{2}$/')
        ->and(factsJson()['verifiedAt'] <= now()->toDateString())->toBeTrue('verifiedAt is in the future')
        ->and(factsJson()['account']['teamInviteDays'])->toBeInt()->toBeGreaterThan(0)
        ->and(factsJson()['account']['evidence'])->toContain('INVITE_VALID_DAYS');
});

it('links only over HTTPS, and to the App Store destination platforms.json has', function (): void {
    $links = factsJson()['links'];

    foreach ([...$links, ...factsJson()['privacyPolicies']] as $key => $url) {
        expect($url)->toStartWith('https://', $key)
            ->and(filter_var($url, FILTER_VALIDATE_URL))->not->toBeFalse("{$key} is malformed");
    }

    $ios = collect(factsData('platforms.json')['platforms'])->firstWhere('id', 'ios');

    expect($links['appStore'])->toBe(collect($ios['destinations'])->firstWhere('kind', 'app-store')['url']);
});

it('names the publisher in every supported language', function (): void {
    $publisher = factsJson()['publisher'];

    expect($publisher['name'])->toBeString()->not->toBeEmpty()
        ->and(filter_var(factsJson()['support']['email'], FILTER_VALIDATE_EMAIL))->not->toBeFalse()
        ->and(filter_var(factsJson()['support']['securityEmail'], FILTER_VALIDATE_EMAIL))->not->toBeFalse();

    expect(array_keys($publisher['country']))->toEqualCanonicalizing(Locales::codes(), 'publisher.country does not cover every locale')
        ->and($publisher)->not->toHaveKey('city');
});

it('names the TablePro team, not the publisher or a city, outside the legal pages', function (): void {
    $publisher = factsJson()['publisher'];
    $needles = [$publisher['name'], 'Ho Chi Minh', 'Hồ Chí Minh', 'Ho-Chi-Minh', 'Hô Chi Minh', 'ホーチミン', '胡志明', '호찌민'];
    $files = [
        ...File::allFiles(resource_path('data/content')),
        ...File::allFiles(resource_path('js/i18n/messages')),
        ...File::allFiles(base_path('lang')),
    ];

    foreach ($files as $file) {
        $text = $file->getContents();

        expect($text)->not->toMatch('/\\{(maker|city)\\}/u', "{$file->getRelativePathname()} has a maker or city slot");

        foreach ($needles as $needle) {
            expect(str_contains($text, $needle))->toBeFalse("{$file->getRelativePathname()} names {$needle}");
        }
    }
});

it('gives the legal pages the publisher and country, never a city', function (): void {
    foreach (File::allFiles(resource_path('data/legal')) as $file) {
        expect($file->getContents())->not->toContain('{publisherCity}', "{$file->getRelativePathname()} names a city");
    }
});

it('keeps each list free of duplicates', function (): void {
    $facts = factsJson();

    factsUnique($facts['ai']['providers'], 'ai.providers');
    factsUnique($facts['ai']['linux']['providers'], 'ai.linux.providers');
    factsUnique($facts['mcp']['toolGroups'], 'mcp.toolGroups');
    factsUnique($facts['mcp']['linux']['tools'], 'mcp.linux.tools');
    factsUnique($facts['filterOperators']['mac'], 'filterOperators.mac');
    factsUnique($facts['filterOperators']['ios'], 'filterOperators.ios');
    factsUnique(array_column($facts['connectionImport'], 'id'), 'connectionImport');
    factsUnique(array_column($facts['dataImport']['formats'], 'id'), 'dataImport.formats');
    factsUnique(array_column($facts['export']['formats'], 'id'), 'export.formats');
    factsUnique($facts['dataImport']['linux']['formats'], 'dataImport.linux.formats');
    factsUnique($facts['export']['linux']['formats'], 'export.linux.formats');
    factsUnique(array_column($facts['backup']['tools'], 'id'), 'backup.tools');
    factsUnique($facts['sync']['neverSynced'], 'sync.neverSynced');
});

it('defaults Safe Mode to one of its own levels on each platform', function (): void {
    foreach (factsJson()['safeMode'] as $platform => $safeMode) {
        expect($safeMode['default'])->toBeIn(array_column($safeMode['levels'], 'id'), "safeMode.{$platform}.default");
    }
});

it('states the Linux app in the shapes the Mac entries use', function (): void {
    $facts = factsJson();
    $platforms = array_column(factsData('platforms.json')['platforms'], 'id');

    foreach (['ai', 'mcp'] as $section) {
        expect($facts[$section]['platforms'])->toContain('linux')
            ->and(array_diff($facts[$section]['platforms'], $platforms))->toBe([], "{$section}.platforms names an unknown platform");
    }

    foreach (['dataImport', 'export'] as $section) {
        expect(array_diff($facts[$section]['linux']['formats'], array_column($facts[$section]['formats'], 'id')))
            ->toBe([], "{$section}.linux names a format the Mac list does not have");
    }

    expect($facts['safeMode']['linux']['levels'])->not->toBeEmpty();

    foreach ([$facts['ai']['linux'], $facts['mcp']['linux'], $facts['safeMode']['linux'], $facts['dataImport']['linux'], $facts['export']['linux']] as $entry) {
        expect($entry['evidence'])->toBeString()->not->toBeEmpty();
    }

    foreach ($facts['limits'] as $id => $limit) {
        expect(str_ends_with($id, 'Linux'))->toBe($limit['platform'] === 'linux', "limits.{$id}: a Linux limit's id ends in Linux");
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
