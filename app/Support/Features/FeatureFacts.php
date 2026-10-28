<?php

namespace App\Support\Features;

use App\Support\Content\EnginePaths;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

// What each {token} and engines list in feature copy means, so the copy stays true when the data changes; FeatureContentTest fails on a name it does not know.
/**
 * @phpstan-type EngineItem array{name: string, href: string|null, detail: string|null, since: string|null}
 * @phpstan-type Fact array{kind: 'number', value: int}|array{kind: 'text', value: string}|array{kind: 'names', items: list<string>}|array{kind: 'engines', items: list<EngineItem>}
 */
final class FeatureFacts
{
    // Hub keys whose slots the page fills from the paid features and plan names, not from facts.
    /**
     * @var list<string>
     */
    public const TEMPLATE_PATHS = ['labels', 'areas.paid'];

    /**
     * @var array<string, Fact>|null
     */
    private ?array $all = null;

    // engineItem() asks for the Mac floor once per engine.
    /**
     * @var array<string, array<array-key, mixed>>
     */
    private array $decoded = [];

    /**
     * @param  string|null  $dataPath  the `resources/data` directory; tests may point it elsewhere
     */
    public function __construct(
        private readonly ?string $dataPath = null,
    ) {}

    /**
     * @return array<string, Fact>
     */
    public function all(): array
    {
        if ($this->all !== null) {
            return $this->all;
        }

        $facts = $this->json('facts.json');
        $engines = $this->publishedEngines();

        return $this->all = [
            ...$this->limits($facts, $this->json('pricing.json')),
            ...$this->lists($facts),
            ...$this->engineLists($facts, $engines),
        ];
    }

    // Only what a page renders goes into its props.
    /**
     * @param  array<array-key, mixed>  ...$contents  decoded content files
     * @return array<string, Fact>
     */
    public function for(array ...$contents): array
    {
        $names = [];

        foreach ($contents as $content) {
            array_push($names, ...self::referencedNames($content));
        }

        return array_intersect_key($this->all(), array_flip($names));
    }

    /**
     * @param  array<array-key, mixed>  $content
     * @return list<string>
     */
    public static function referencedNames(array $content): array
    {
        Arr::forget($content, self::TEMPLATE_PATHS);

        $names = [];

        array_walk_recursive($content, function (mixed $value, int|string $key) use (&$names): void {
            if (! is_string($value)) {
                return;
            }

            if ($key === 'list') {
                $names[] = $value;

                return;
            }

            preg_match_all('/\{([A-Za-z][A-Za-z0-9_.]*)\}/', $value, $matches);
            array_push($names, ...$matches[1]);
        });

        $names = array_values(array_unique($names));
        sort($names);

        return $names;
    }

    // offlineDays bounds when a removed Team member's Mac loses Team's features.
    /**
     * @param  array<string, mixed>  $facts
     * @param  array<string, mixed>  $pricing
     * @return array<string, Fact>
     */
    private function limits(array $facts, array $pricing): array
    {
        $limit = fn(string $id, string $field = 'value'): array => [
            'kind' => 'number',
            'value' => (int) ($facts['limits'][$id][$field] ?? 0),
        ];

        return [
            'rowCap' => $limit('resultRowCap'),
            'rowCapMax' => $limit('resultRowCap', 'max'),
            'countEstimate' => $limit('countEstimateThreshold'),
            'chartPoints' => $limit('chartPoints'),
            'chartSeries' => $limit('chartSeries'),
            'chartInspectedRows' => $limit('chartInspectedRows'),
            'historyEntries' => $limit('historyEntriesMac'),
            'historyDays' => $limit('historyDaysMac'),
            'historyEntriesIos' => $limit('historyEntriesIos'),
            'resultBufferIos' => $limit('resultBufferIos'),
            'rewindDays' => $limit('rewindDays'),
            'rewindMaxValue' => $limit('rewindMaxValue'),
            'explainNoise' => $limit('explainNoise'),
            'filterOperatorCount' => ['kind' => 'number', 'value' => count($facts['filterOperators']['mac'] ?? [])],
            'filterOperatorCountIos' => ['kind' => 'number', 'value' => count($facts['filterOperators']['ios'] ?? [])],
            'deviceLimit' => ['kind' => 'number', 'value' => (int) ($pricing['license']['deviceLimit'] ?? 0)],
            'offlineDays' => ['kind' => 'number', 'value' => (int) ($pricing['license']['offlineDays'] ?? 0)],
        ];
    }

    /**
     * @param  array<string, mixed>  $facts
     * @return array<string, Fact>
     */
    private function lists(array $facts): array
    {
        $levels = fn(string $platform): array => array_values(array_column($facts['safeMode'][$platform]['levels'] ?? [], 'name'));
        $default = function (string $platform) use ($facts): array {
            $levels = array_column($facts['safeMode'][$platform]['levels'] ?? [], 'name', 'id');

            return ['kind' => 'text', 'value' => (string) ($levels[$facts['safeMode'][$platform]['default'] ?? ''] ?? '')];
        };
        $names = fn(array $items): array => ['kind' => 'names', 'items' => array_values(array_map('strval', $items))];

        return [
            'macSafeModeLevels' => $names($levels('mac')),
            'macSafeModeDefault' => $default('mac'),
            'iosSafeModeLevels' => $names($levels('ios')),
            'iosSafeModeDefault' => $default('ios'),
            'aiProviders' => $names($facts['ai']['providers'] ?? []),
            'mcpHost' => ['kind' => 'text', 'value' => (string) ($facts['mcp']['host'] ?? '')],
            'mcpPort' => ['kind' => 'text', 'value' => (string) ($facts['mcp']['defaultPort'] ?? '')],
            'mcpSetupClients' => $names($facts['mcp']['clients']['setupSheet'] ?? []),
            'mcpBridgeClients' => $names($facts['mcp']['clients']['bridge'] ?? []),
            'connectionImportApps' => $names(array_column($facts['connectionImport'] ?? [], 'app')),
            'importFormats' => $names(array_column($facts['dataImport']['formats'] ?? [], 'name')),
            'exportFormats' => $names(array_column(array_filter($facts['export']['formats'] ?? [], fn(array $format): bool => $format['engines'] === null && $format['via'] === null), 'name')),
            'exportPluginFormats' => $names(array_column(array_filter($facts['export']['formats'] ?? [], fn(array $format): bool => $format['via'] === 'plugin'), 'name')),
            'backupTools' => $names(array_column($facts['backup']['tools'] ?? [], 'name')),
        ];
    }

    /**
     * @param  array<string, mixed>  $facts
     * @param  list<array<string, mixed>>  $engines
     * @return array<string, Fact>
     */
    private function engineLists(array $facts, array $engines): array
    {
        $where = fn(callable $test, ?callable $detail = null): array => [
            'kind' => 'engines',
            'items' => array_values(array_map(
                fn(array $engine): array => $this->engineItem($engine, $engines, $detail !== null ? $detail($engine) : null),
                array_values(array_filter($engines, $test)),
            )),
        ];
        $capability = fn(array $engine, string $name): mixed => $engine['capabilities'][$name] ?? null;
        $tools = array_column($facts['backup']['tools'] ?? [], 'name', 'id');
        $serverSide = $facts['backup']['serverSideExport'] ?? [];
        $iosOrder = $this->iosEngineOrder();
        $byId = array_column($engines, null, 'id');

        return [
            'explainDiagram' => $where(fn(array $engine): bool => $capability($engine, 'explainView') === 'diagram'),
            'explainText' => $where(fn(array $engine): bool => $capability($engine, 'explainView') === 'text'),
            'explainCost' => $where(fn(array $engine): bool => $capability($engine, 'explainView') === 'cost'),
            'explainNoneSql' => $where(fn(array $engine): bool => $capability($engine, 'explain') === [] && $engine['queryLanguage'] === 'SQL'),
            'otherLanguages' => $where(
                fn(array $engine): bool => $engine['queryLanguage'] !== 'SQL',
                fn(array $engine): string => (string) $engine['queryLanguage'],
            ),
            'everyStatementWrites' => $where(fn(array $engine): bool => $capability($engine, 'readOnlyMode') === false),
            'alwaysReadOnly' => $where(fn(array $engine): bool => $capability($engine, 'alwaysReadOnly') === true),
            'schemaReadOnly' => $where(fn(array $engine): bool => $capability($engine, 'schemaEditing') === 'read-only'),
            'schemaPartial' => $where(fn(array $engine): bool => $capability($engine, 'schemaEditing') === 'partial'),
            'dashboard' => $where(fn(array $engine): bool => $capability($engine, 'dashboard') === true),
            'usersRoles' => $where(fn(array $engine): bool => $capability($engine, 'usersRoles') === true),
            'noImport' => $where(fn(array $engine): bool => $capability($engine, 'import') === false),
            'noSsh' => $where(fn(array $engine): bool => $capability($engine, 'ssh') === false && $engine['connectionMode'] !== 'file'),
            'awsIam' => $where(fn(array $engine): bool => $capability($engine, 'awsIam') === true),
            'cloudSqlProxy' => $where(fn(array $engine): bool => $capability($engine, 'cloudSqlProxy') === true),
            'backupEngines' => $where(
                fn(array $engine): bool => is_string($capability($engine, 'nativeDump')),
                fn(array $engine): string => (string) ($tools[$capability($engine, 'nativeDump')] ?? $capability($engine, 'nativeDump')),
            ),
            'serverSideExport' => $where(fn(array $engine): bool => in_array($engine['id'], $serverSide, true)),
            'iosPicker' => [
                'kind' => 'engines',
                'items' => array_values(array_map(
                    fn(string $id): array => $this->engineItem($byId[$id], $engines, null),
                    array_values(array_filter($iosOrder, fn(string $id): bool => isset($byId[$id]))),
                )),
            ],
            'iosSyncedOnly' => $where(fn(array $engine): bool => ($engine['ios']['openable'] ?? false) === true && ($engine['ios']['inPicker'] ?? false) === false),
        ];
    }

    /**
     * @param  array<string, mixed>  $engine
     * @param  list<array<string, mixed>>  $engines
     * @return EngineItem
     */
    private function engineItem(array $engine, array $engines, ?string $detail): array
    {
        return [
            'name' => (string) $engine['name'],
            'href' => EnginePaths::pathFor($engine, EnginePaths::byId($engines)),
            'detail' => $detail,
            'since' => $this->releaseLabel((string) ($engine['sinceAppVersion'] ?? '')),
        ];
    }

    // Only a version newer than the oldest Mac build any channel still serves is worth naming.
    private function releaseLabel(string $since): ?string
    {
        $floor = $this->macFloorVersion();

        if ($since === '' || $floor === null) {
            return null;
        }

        return version_compare($since, $floor, '>') ? $since : null;
    }

    private function macFloorVersion(): ?string
    {
        foreach ($this->json('platforms.json')['platforms'] ?? [] as $platform) {
            if (($platform['id'] ?? null) === 'mac' && is_string($platform['floorVersion'] ?? null)) {
                return $platform['floorVersion'];
            }
        }

        return null;
    }

    /**
     * @return list<string>
     */
    private function iosEngineOrder(): array
    {
        foreach ($this->json('platforms.json')['platforms'] ?? [] as $platform) {
            if (($platform['id'] ?? null) === 'ios' && is_array($platform['iosEngines'] ?? null)) {
                return array_values(array_filter($platform['iosEngines'], 'is_string'));
            }
        }

        return [];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function publishedEngines(): array
    {
        return array_values(array_filter(
            $this->json('engines.json'),
            fn(mixed $engine): bool => is_array($engine) && ($engine['state'] ?? null) === 'published',
        ));
    }

    // Each file's Data test keeps it valid, so a missing or malformed file degrades to an empty array.
    /**
     * @return array<array-key, mixed>
     */
    private function json(string $file): array
    {
        if (array_key_exists($file, $this->decoded)) {
            return $this->decoded[$file];
        }

        $path = rtrim($this->dataPath ?? resource_path('data'), '/') . '/' . $file;
        $decoded = File::isFile($path) ? json_decode((string) File::get($path), true) : null;

        return $this->decoded[$file] = is_array($decoded) ? $decoded : [];
    }
}
