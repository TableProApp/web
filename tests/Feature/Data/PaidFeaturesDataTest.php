<?php

use Illuminate\Support\Facades\File;

/**
 * resources/data/paid-features.json: the features a Starter or Team license
 * adds to the Mac app.
 *
 * The list is the app's `ProFeature` enum, unchanged from v0.76.1 to v0.77.0
 * (TablePro/Models/Settings/ProFeature.swift @ v0.77.0, `displayName` and
 * `requiredTier`). The names are pinned byte for byte, because pricing, the
 * FAQ, feature pages and structured data all print them and the reader then
 * looks for the same words in the app. Everything not listed is free, and the
 * iPhone and iPad app gates nothing, so `platforms` only ever names the Mac.
 *
 * Lapse behaviour (each `ProFeature` call site at v0.77.0): only Result
 * Charts and Query Insights show an overlay; the others alert, hide, disable or
 * stop silently.
 */

/**
 * @return list<array{id: string, proFeature: string, name: string, tier: string, platforms: list<string>, sinceAppVersion: string, lapse: list<string>, highlight: bool, page: array{path: string, anchor: string}}>
 */
function paidFeaturesJson(): array
{
    static $features = null;

    return $features ??= json_decode(File::get(resource_path('data/paid-features.json')), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * The section ids each feature page keeps (sitemap §A.2). Redirects and
 * cross-links target them, so a paid feature may only point at one of these.
 *
 * @return array<string, list<string>>
 */
function paidFeaturePageAnchors(): array
{
    return [
        '/features/querying' => ['editor', 'history', 'performance', 'results', 'other-languages', 'iphone'],
        '/features/data-editing' => ['browse', 'edit', 'safe-mode', 'data-rewind', 'documents-and-keys', 'iphone'],
        '/features/schema' => ['structure', 'er-diagram', 'compare-sync', 'copy', 'administer', 'iphone'],
        '/features/import-export' => ['import', 'export', 'data-files', 'backup', 'files', 'iphone'],
        '/features/ai-mcp' => ['assistant', 'agent-mode', 'mcp', 'outside-servers', 'automation', 'privacy'],
        '/features/connections' => ['organize', 'import', 'network', 'cloud-auth', 'credentials', 'policies', 'iphone'],
        '/features/sync-and-teams' => ['icloud-sync', 'handoff', 'share', 'linked-folders', 'team', 'seats'],
    ];
}

it('lists the ten ProFeature cases in display order, with the app names byte for byte', function (): void {
    $features = paidFeaturesJson();

    expect(array_column($features, 'name', 'proFeature'))->toBe([
        'compareSync' => 'Compare & Sync',
        'queryInsights' => 'Query Insights',
        'resultCharts' => 'Result Charts',
        'dataRewind' => 'Data Rewind',
        'iCloudSync' => 'iCloud Sync',
        'linkedFolders' => 'Linked Folders',
        'encryptedExport' => 'Encrypted Export',
        'envVarReferences' => 'Environment Variables',
        'teamCatalog' => 'Team Catalog',
        'teamLibrary' => 'Team Library',
    ]);

    $ids = array_column($features, 'id');

    expect($ids)->toBe(array_values(array_unique($ids)));

    foreach ($features as $feature) {
        expect(array_keys($feature))->toBe(['id', 'proFeature', 'name', 'tier', 'platforms', 'sinceAppVersion', 'lapse', 'highlight', 'page']);
        expect($feature['id'])->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/');
    }
});

it('splits eight Starter features from two Team features, as requiredTier does', function (): void {
    $tiers = array_column(paidFeaturesJson(), 'tier', 'proFeature');

    expect(array_keys(array_filter($tiers, fn(string $tier): bool => $tier === 'starter')))->toBe([
        'compareSync', 'queryInsights', 'resultCharts', 'dataRewind', 'iCloudSync', 'linkedFolders', 'encryptedExport', 'envVarReferences',
    ]);
    expect(array_keys(array_filter($tiers, fn(string $tier): bool => $tier === 'team')))->toBe(['teamCatalog', 'teamLibrary']);
    expect(array_values(array_unique($tiers)))->toBe(['starter', 'team']);
});

it('gates only the Mac app, a released platform', function (): void {
    $platforms = collect(json_decode(File::get(resource_path('data/platforms.json')), true, 512, JSON_THROW_ON_ERROR)['platforms'])
        ->keyBy('id');

    foreach (paidFeaturesJson() as $feature) {
        expect($feature['platforms'])->toBe(['mac'], "{$feature['name']}: the iPhone and iPad app gates nothing");

        foreach ($feature['platforms'] as $platform) {
            expect($platforms[$platform]['status'] ?? null)->toBe('released');
        }
    }
});

it('dates each feature by the Mac release that shipped it', function (): void {
    $platforms = collect(json_decode(File::get(resource_path('data/platforms.json')), true, 512, JSON_THROW_ON_ERROR)['platforms'])
        ->keyBy('id');
    $release = $platforms['mac']['release']['version'];

    expect(array_column(paidFeaturesJson(), 'sinceAppVersion', 'proFeature'))->toBe([
        'compareSync' => '0.68.0',
        'queryInsights' => '0.66.0',
        'resultCharts' => '0.67.0',
        'dataRewind' => '0.69.0',
        'iCloudSync' => '0.19.0',
        'linkedFolders' => '0.25.0',
        'encryptedExport' => '0.25.0',
        'envVarReferences' => '0.25.0',
        'teamCatalog' => '0.56.0',
        'teamLibrary' => '0.56.0',
    ]);

    foreach (paidFeaturesJson() as $feature) {
        expect(version_compare($feature['sinceAppVersion'], $release, '<='))->toBeTrue("{$feature['name']} is newer than the current release");
    }
});

it('describes what each feature does when the license lapses', function (): void {
    $kinds = ['overlay', 'alert', 'hidden', 'disabled', 'silent'];

    foreach (paidFeaturesJson() as $feature) {
        expect($feature['lapse'])->not->toBeEmpty();
        expect($feature['lapse'])->toBe(array_values(array_unique($feature['lapse'])));

        foreach ($feature['lapse'] as $kind) {
            expect($kind)->toBeIn($kinds);
        }
    }

    $lapse = array_column(paidFeaturesJson(), 'lapse', 'proFeature');
    $with = fn(string $kind): array => array_keys(array_filter($lapse, fn(array $kinds): bool => in_array($kind, $kinds, true)));

    expect($with('overlay'))->toBe(['queryInsights', 'resultCharts'], 'Only Charts and Insights show the license overlay');
    expect($with('silent'))->toContain('envVarReferences')->toContain('dataRewind');
    expect($lapse['envVarReferences'])->toBe(['silent'], '$VAR stops resolving with no message');
    expect($lapse['compareSync'])->toBe(['alert']);
    expect($lapse['teamCatalog'])->toBe(['hidden']);
    expect($lapse['teamLibrary'])->toBe(['hidden']);
});

it('highlights the examples positioning names for each tier', function (): void {
    $highlighted = array_column(array_filter(paidFeaturesJson(), fn(array $feature): bool => $feature['highlight'] === true), 'name');

    expect(array_values($highlighted))->toBe(['Compare & Sync', 'Query Insights', 'Data Rewind', 'iCloud Sync', 'Team Catalog', 'Team Library']);
});

it('links every feature to a fixed section of a feature page', function (): void {
    $anchors = paidFeaturePageAnchors();

    foreach (paidFeaturesJson() as $feature) {
        expect(array_keys($feature['page']))->toBe(['path', 'anchor']);
        expect($anchors)->toHaveKey($feature['page']['path']);
        expect($anchors[$feature['page']['path']])->toContain($feature['page']['anchor']);
    }

    expect(array_column(array_column(paidFeaturesJson(), 'page', 'proFeature'), 'anchor'))->toContain('compare-sync');
});

it('finds each linked section in the feature page content', function (): void {
    foreach (paidFeaturesJson() as $feature) {
        $slug = basename($feature['page']['path']);
        $file = resource_path("data/content/en/features/{$slug}.json");

        expect(File::exists($file))->toBeTrue("content/en/features/{$slug}.json is missing");
        expect(File::get($file))->toContain('"' . $feature['page']['anchor'] . '"');
    }
});

it('gives every feature a detail line', function (): void {
    $locale = 'en';
    $details = json_decode(File::get(resource_path("data/content/{$locale}/paid-features.json")), true, 512, JSON_THROW_ON_ERROR);

    foreach (paidFeaturesJson() as $feature) {
        expect(data_get($details, "{$feature['id']}.detail"))->toBeString()->not->toBe('', "{$locale}: {$feature['id']} has no detail");
    }
});
