<?php

use Illuminate\Support\Facades\File;
use Symfony\Component\Finder\SplFileInfo;

/**
 * resources/data/facts.json: the product facts that repeat across pages
 * (links, AI providers, MCP, Safe Mode, import and export formats, backup
 * tools, sync categories, grid and editor limits).
 *
 * Names, never counts: a number the site shows is a list length or a `limits`
 * value. The facts that drifted on the old site are pinned against the app at
 * v0.77.0 (Mac) and 232e8dae6 (iOS App Store 1.0): 14 AI provider types, MCP
 * on 127.0.0.1 only and off by default, six Mac Safe Mode levels with Silent
 * as the default, three on iOS with Off as the default.
 *
 * It also holds the "external URLs live only in data files" guard
 * (architecture §1.8), which closes the gap the old FundingModelTest left:
 * it scans single, double and backtick literals.
 */

/**
 * @return array<string, mixed>
 */
function factsJson(): array
{
    return json_decode(File::get(resource_path('data/facts.json')), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * Engine ids from engines.json.
 *
 * @return list<string>
 */
function factsEngineIds(): array
{
    return array_column(json_decode(File::get(resource_path('data/engines.json')), true, 512, JSON_THROW_ON_ERROR), 'id');
}

/**
 * The released platforms from platforms.json, keyed by id.
 *
 * @return array<string, array<string, mixed>>
 */
function factsReleasedPlatforms(): array
{
    return collect(json_decode(File::get(resource_path('data/platforms.json')), true, 512, JSON_THROW_ON_ERROR)['platforms'])
        ->filter(fn(array $platform): bool => $platform['status'] === 'released')
        ->keyBy('id')
        ->all();
}

/**
 * @param  list<mixed>  $list
 */
function factsAssertUniqueList(array $list, string $label): void
{
    expect($list)->not->toBeEmpty("{$label} is empty");
    expect($list)->toBe(array_values(array_unique($list, SORT_REGULAR)), "{$label} has duplicates");
}

it('is dated and has the documented sections', function (): void {
    $facts = factsJson();

    expect(array_keys($facts))->toBe([
        'verifiedAt', 'links', 'support', 'openSource', 'ai', 'mcp', 'safeMode', 'filterOperators',
        'connectionImport', 'dataImport', 'export', 'backup', 'sync', 'limits',
    ]);
    expect($facts['verifiedAt'])->toMatch('/^\d{4}-\d{2}-\d{2}$/');
    expect($facts['verifiedAt'] <= now()->toDateString())->toBeTrue('verifiedAt is in the future');
});

it('keeps every outbound link in one place, over HTTPS', function (): void {
    $links = factsJson()['links'];

    foreach ($links as $key => $url) {
        expect($url)->toStartWith('https://', "links.{$key}");
        expect(filter_var($url, FILTER_VALIDATE_URL))->not->toBeFalse("links.{$key} is malformed");
    }

    expect($links['github'])->toBe('https://github.com/TableProApp/TablePro');
    expect($links['issues'])->toStartWith($links['github'] . '/');
    expect($links['license'])->toStartWith($links['github'] . '/');
    expect($links['docs'])->toBe('https://docs.tablepro.app');
    expect($links['changelog'])->toStartWith($links['docs'] . '/');
    expect($links['sponsorsProgram'])->toBe('https://github.com/sponsors/datlechin');

    $store = collect(factsReleasedPlatforms()['ios']['destinations'])->firstWhere('kind', 'app-store');

    expect($links['appStore'])->toBe($store['url'], 'links.appStore must equal the iOS App Store destination in platforms.json');
});

it('names the support address and the open-source licence', function (): void {
    $facts = factsJson();

    expect($facts['support'])->toBe(['email' => 'hello@tablepro.app']);
    expect($facts['openSource'])->toBe(['license' => 'AGPL-3.0']);
});

it('names the AI providers in the app order, Mac only', function (): void {
    $ai = factsJson()['ai'];

    factsAssertUniqueList($ai['providers'], 'ai.providers');

    // AIProviderType in TablePro/Models/AI/AIModels.swift @ v0.77.0, displayName in case order.
    expect($ai['providers'])->toBe([
        'GitHub Copilot', 'ChatGPT', 'Cursor', 'Claude', 'Claude Agent', 'OpenAI', 'OpenRouter',
        'Gemini', 'xAI', 'Ollama', 'llama.cpp', 'MLX', 'OpenCode Zen', 'OpenAI-compatible',
    ]);
    expect($ai['platforms'])->toBe(['mac']);
    expect($ai['evidence'])->toBeString()->not->toBe('');
});

it('describes the MCP server as local, off by default and Mac only', function (): void {
    $mcp = factsJson()['mcp'];

    expect($mcp['platforms'])->toBe(['mac']);
    expect($mcp['host'])->toBe('127.0.0.1');
    expect($mcp['defaultPort'])->toBe(23508);
    expect($mcp['enabledByDefault'])->toBeFalse();

    factsAssertUniqueList($mcp['toolGroups'], 'mcp.toolGroups');
    factsAssertUniqueList($mcp['clients']['setupSheet'], 'mcp.clients.setupSheet');
    factsAssertUniqueList($mcp['clients']['bridge'], 'mcp.clients.bridge');

    expect($mcp['clients']['setupSheet'])->toBe(['Claude Code', 'Claude Desktop', 'Cursor', 'Zed']);
    expect(array_diff($mcp['clients']['setupSheet'], $mcp['clients']['bridge']))->toBe([], 'Every client the setup sheet covers also works through the bridge');

    foreach ($mcp['toolGroups'] as $group) {
        expect($group)->toMatch('/^[a-z]+(-[a-z]+)*$/', 'Tool groups are ids; their names are copy');
    }
});

it('pins the Safe Mode levels on each platform', function (): void {
    $safeMode = factsJson()['safeMode'];

    expect(array_column($safeMode['mac']['levels'], 'name', 'id'))->toBe([
        'silent' => 'Silent',
        'alert' => 'Alert',
        'alertFull' => 'Alert (Full)',
        'safeMode' => 'Safe Mode',
        'safeModeFull' => 'Safe Mode (Full)',
        'readOnly' => 'Read-Only',
    ]);
    expect($safeMode['mac']['default'])->toBe('silent');

    expect(array_column($safeMode['ios']['levels'], 'name', 'id'))->toBe([
        'off' => 'Off',
        'confirmWrites' => 'Confirm Writes',
        'readOnly' => 'Read-Only',
    ]);
    expect($safeMode['ios']['default'])->toBe('off');
});

it('lists the filter operators per platform without duplicates', function (): void {
    $operators = factsJson()['filterOperators'];

    factsAssertUniqueList($operators['mac'], 'filterOperators.mac');
    factsAssertUniqueList($operators['ios'], 'filterOperators.ios');
    expect($operators['mac'])->toContain('REGEX')->toContain('BETWEEN');
    expect($operators['ios'])->toContain('LIKE')->not->toContain('REGEX');
});

it('names the apps TablePro imports connections from, each a compared product', function (): void {
    $imports = factsJson()['connectionImport'];
    $products = array_column(json_decode(File::get(resource_path('data/comparisons.json')), true, 512, JSON_THROW_ON_ERROR)['products'], 'id');

    factsAssertUniqueList(array_column($imports, 'id'), 'connectionImport ids');

    expect(array_column($imports, 'app'))->toBe(['TablePlus', 'Sequel Ace', 'DBeaver', 'DataGrip', 'Beekeeper Studio', 'Navicat']);

    foreach ($imports as $import) {
        expect(array_keys($import))->toBe(['id', 'app', 'passwords', 'format']);
        expect($import['passwords'])->toBeBool();
        expect($products)->toContain($import['id']);
    }

    expect(collect($imports)->firstWhere('id', 'navicat')['format'])->toBe('.ncx');
});

it('lists import and export formats with known engines', function (): void {
    $facts = factsJson();
    $engines = factsEngineIds();

    factsAssertUniqueList(array_column($facts['dataImport']['formats'], 'id'), 'dataImport.formats');
    factsAssertUniqueList(array_column($facts['export']['formats'], 'id'), 'export.formats');

    foreach ($facts['dataImport']['formats'] as $format) {
        expect(array_keys($format))->toBe(['id', 'name', 'exceptEngines']);

        foreach ($format['exceptEngines'] as $engine) {
            expect($engines)->toContain($engine);
        }
    }

    // SQLImportPlugin.excludedDatabaseTypeIds at v0.77.0.
    expect(collect($facts['dataImport']['formats'])->firstWhere('id', 'sql')['exceptEngines'])->toBe(['mongodb', 'redis']);

    foreach ($facts['export']['formats'] as $format) {
        expect(array_keys($format))->toBe(['id', 'name', 'engines', 'exceptEngines', 'via']);
        expect($format['via'])->toBeIn([null, 'plugin']);

        foreach (array_merge($format['engines'] ?? [], $format['exceptEngines']) as $engine) {
            expect($engines)->toContain($engine);
        }
    }

    $formats = collect($facts['export']['formats'])->keyBy('id');

    expect($formats['mql']['engines'])->toBe(['mongodb']);
    expect($formats['parquet']['via'])->toBe('plugin');
});

it('keeps the backup tools in step with engines.json', function (): void {
    $backup = factsJson()['backup'];
    $engines = collect(json_decode(File::get(resource_path('data/engines.json')), true, 512, JSON_THROW_ON_ERROR))->keyBy('id');

    factsAssertUniqueList(array_column($backup['tools'], 'id'), 'backup.tools');

    foreach ($backup['tools'] as $tool) {
        expect(array_keys($tool))->toBe(['id', 'name', 'engines', 'external']);
        expect($tool['engines'])->not->toBeEmpty();

        foreach ($tool['engines'] as $id) {
            expect($engines->has($id))->toBeTrue("{$tool['id']} names an unknown engine {$id}");
            expect($engines[$id]['capabilities']['nativeDump'])->toBe($tool['id'], "{$id} must use {$tool['id']} in engines.json");
        }
    }

    $fromEngines = $engines
        ->filter(fn(array $engine): bool => $engine['capabilities']['nativeDump'] !== null)
        ->map(fn(array $engine): string => $engine['capabilities']['nativeDump'])
        ->all();
    $fromTools = collect($backup['tools'])
        ->flatMap(fn(array $tool): array => array_fill_keys($tool['engines'], $tool['id']))
        ->all();

    ksort($fromEngines);
    ksort($fromTools);

    expect($fromEngines)->toBe($fromTools, 'Every engine with a nativeDump appears under that tool, and nowhere else');

    foreach ($backup['serverSideExport'] as $id) {
        expect($engines->has($id))->toBeTrue();
    }
});

it('names what syncs on each platform and what never does', function (): void {
    $sync = factsJson()['sync'];
    $release = factsReleasedPlatforms()['mac']['release']['version'];

    foreach (['mac', 'ios'] as $platform) {
        factsAssertUniqueList(array_column($sync[$platform]['categories'], 'id'), "sync.{$platform}.categories");
        expect($sync[$platform]['enabledByDefault'])->toBeFalse("iCloud Sync is off by default on {$platform}");

        foreach ($sync[$platform]['categories'] as $category) {
            expect(array_keys($category))->toBe(['id', 'defaultOn', 'sinceAppVersion']);

            if ($category['sinceAppVersion'] !== null) {
                expect(version_compare($category['sinceAppVersion'], $release, '<='))->toBeTrue();
            }
        }
    }

    expect(array_column($sync['ios']['categories'], 'id'))->toBe(['connections', 'groups-and-tags']);
    expect(collect($sync['mac']['categories'])->firstWhere('id', 'passwords')['defaultOn'])->toBeFalse();
    expect(in_array('credential-profiles', array_column($sync['mac']['categories'], 'id'), true))->toBeFalse('Credential profile sync is contested (credential-profiles.mdx and SyncSettings.swift disagree at v0.77.0); do not claim it');

    factsAssertUniqueList($sync['neverSynced'], 'sync.neverSynced');
    expect($sync['neverSynced'])->toContain('query-history')->toContain('data-rewind');
});

it('gives every limit a number, a unit, a platform and evidence', function (): void {
    $limits = factsJson()['limits'];
    $platforms = array_keys(factsReleasedPlatforms());

    expect($limits)->not->toBeEmpty();

    foreach ($limits as $id => $limit) {
        expect(array_keys($limit))->toBe(['value', 'max', 'unit', 'platform', 'evidence'], "limits.{$id}");
        expect($limit['value'])->toBeInt();
        expect($limit['max'] === null || $limit['max'] >= $limit['value'])->toBeTrue("limits.{$id}.max");
        expect($limit['unit'])->toBeString()->not->toBe('');
        expect($platforms)->toContain($limit['platform']);
        expect($limit['evidence'])->toBeString()->not->toBe('');
    }

    expect($limits['resultRowCap']['value'])->toBe(10000);
    expect($limits['resultRowCap']['max'])->toBe(500000);
    expect($limits['rewindDays']['value'])->toBe(7);
    expect($limits['historyEntriesIos']['value'])->toBe(200);

    // Data Rewind skips a value over 1,048,576 bytes; EXPLAIN Compare calls a run within 1.15× of its baseline unchanged.
    expect($limits['rewindMaxValue'])->toMatchArray(['value' => 1, 'unit' => 'MB', 'platform' => 'mac']);
    expect($limits['explainNoise'])->toMatchArray(['value' => 15, 'unit' => 'percent', 'platform' => 'mac']);
});

it('keeps external URLs in data files, not in components, catalogs or content', function (): void {
    /*
     * Not links: the schema.org vocabulary in JSON-LD, the site's own origin,
     * and XML namespaces in inline SVG.
     */
    $ignoredHosts = ['schema.org', 'tablepro.app', 'www.w3.org'];

    /*
     * Each entry is one file and the exact URLs it may hold, so an edit that
     * keeps the file name still cannot add a new one.
     */
    $allowed = [
        // A script source, not a link (architecture §1.12: Crisp loads on click).
        'js/lib/crisp.ts' => ['https://client.crisp.chat/l.js'],
    ];

    $files = collect([resource_path('js'), resource_path('data/content')])
        ->filter(fn(string $root): bool => File::isDirectory($root))
        ->flatMap(fn(string $root): array => File::allFiles($root))
        ->filter(fn(SplFileInfo $file): bool => in_array($file->getExtension(), ['ts', 'tsx', 'js', 'jsx', 'json'], true));

    $found = [];

    foreach ($files as $file) {
        $relative = ltrim(str_replace(resource_path(), '', $file->getPathname()), '/');

        // UTF-8 mode: in byte mode \R also matches 0x85, the last byte of "ễ".
        foreach (preg_split('/\R/u', $file->getContents()) as $number => $line) {
            if (preg_match('#^\s*(\*|//|/\*)#', $line) === 1) {
                continue;
            }

            preg_match_all('#[\'"`](https?://[^\'"`\s]+)#', $line, $matches);

            foreach ($matches[1] as $url) {
                $host = (string) parse_url(str_replace(['${', '}'], '', $url), PHP_URL_HOST);

                if (in_array($host, $ignoredHosts, true) || in_array($url, $allowed[$relative] ?? [], true)) {
                    continue;
                }

                $found[] = "{$relative}:" . ($number + 1) . " {$url}";
            }
        }
    }

    expect($found)->toBe([], "External URLs belong in resources/data (facts, sponsors, comparisons, platforms, redirects). Docs links join a path to facts.links.docs:\n" . implode("\n", $found));
});
