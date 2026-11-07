<?php

namespace App\Http\Controllers;

use App\Services\Releases\PlatformCatalog;
use App\Support\Assets\AssetManifest;
use App\Support\Content\ContentRepository;
use App\Support\Content\EnginePaths;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

// Only the fields a page renders are sent, so the evidence strings in the data files never reach the browser.
class DatabaseController extends Controller
{
    // A category of one or two engines shares a band; its id still lands on its first engine.
    /** @var array<string, list<string>> */
    public const GROUPS = [
        'relational' => ['relational'],
        'analytical' => ['analytical'],
        'cloud' => ['cloud'],
        'nosql' => ['document', 'key-value', 'wide-column', 'streaming', 'coordination'],
        'search' => ['search'],
        'files' => ['files'],
    ];

    /** @var array<string, array<array-key, mixed>> */
    private array $data = [];

    public function __construct(
        private readonly ContentRepository $content,
        private readonly PlatformCatalog $platforms,
    ) {}

    public function index(): Response
    {
        $locale = App::getLocale();
        $engines = $this->publishedEngines();
        $copy = $this->content->page('engines', $locale);
        $issues = $this->url($this->json('facts.json')['links']['issues'] ?? null);

        return Inertia::render('Databases/Index', [
            'content' => $this->content->page('databases/index', $locale),
            'groups' => array_map(fn(string $id, array $categories): array => ['id' => $id, 'categories' => $categories], array_keys(self::GROUPS), self::GROUPS),
            'engines' => array_map(fn(array $engine): array => $this->summary($engine), $engines),
            'taglines' => array_combine(
                array_column($engines, 'id'),
                array_map(fn(array $engine): string => (string) ($copy[$engine['id']]['tagline'] ?? ''), $engines),
            ),
            'iosEngines' => $this->platforms->isReleased('ios') ? array_values(array_filter($this->platforms->find('ios')['iosEngines'] ?? [], 'is_string')) : [],
            'platforms' => [
                'ios' => $this->deviceNames('ios'),
                'linux' => $this->deviceNames('linux'),
            ],
            'request' => $issues !== null ? rtrim($issues, '/') . '/new?template=feature_request.yml' : null,
        ]);
    }

    public function show(AssetManifest $assets, string $slug): Response
    {
        $locale = App::getLocale();
        $page = $this->content->page("databases/{$slug}", $locale);
        $engine = $this->engineBySlug($slug);

        abort_if($engine === null, 404);

        $family = array_values(array_filter(
            $this->publishedEngines(),
            fn(array $candidate): bool => ($candidate['page'] ?? null) === 'section' && ($candidate['parent'] ?? null) === $engine['id'],
        ));
        $hero = is_string($page['header']['asset'] ?? null) ? $page['header']['asset'] : null;

        return Inertia::render('Databases/Show', [
            'slug' => $slug,
            'content' => $page,
            'labels' => $this->content->page('databases/index', $locale)['labels'] ?? [],
            'engine' => $this->detail($engine),
            'family' => array_map(fn(array $member): array => $this->detail($member), $family),
            'copy' => $this->engineCopy($locale, [$engine['id'], ...array_column($family, 'id')]),
            'platforms' => [
                'mac' => $this->platforms->summary('mac'),
                'ios' => $this->platforms->summary('ios'),
            ],
            'heroSizes' => FeatureController::HERO_SIZES,
            'lcpAsset' => $hero !== null && $assets->has($hero) ? $assets->lcpDescriptor($hero, $locale, priority: true, sizes: FeatureController::HERO_SIZES) : null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $engine
     * @return array{id: string, name: string, page: string, path: string|null, anchor: string|null, category: string, featured: bool, distribution: string, release: string|null, queryLanguage: string, docsSlug: string|null, ios: array{inPicker: bool, openable: bool}, linux: string}
     */
    private function summary(array $engine): array
    {
        $linux = $engine['linux']['support'] ?? null;

        return [
            'id' => (string) $engine['id'],
            'name' => (string) $engine['name'],
            'page' => (string) $engine['page'],
            'path' => EnginePaths::pathFor($engine, EnginePaths::byId($this->publishedEngines())),
            'anchor' => is_string($engine['anchor'] ?? null) ? $engine['anchor'] : null,
            'category' => (string) $engine['category'],
            'featured' => ($engine['featured'] ?? false) === true,
            'distribution' => (string) $engine['distribution'],
            'release' => $this->releaseLabel(is_string($engine['sinceAppVersion'] ?? null) ? $engine['sinceAppVersion'] : null),
            'queryLanguage' => (string) $engine['queryLanguage'],
            'docsSlug' => $this->docsSlug($engine),
            'ios' => $this->ios($engine),
            'linux' => in_array($linux, ['tested', 'untested', 'blocked', 'none'], true) ? $linux : 'none',
        ];
    }

    /**
     * @param  array<string, mixed>  $engine
     * @return array<string, mixed>
     */
    private function detail(array $engine): array
    {
        $capabilities = is_array($engine['capabilities'] ?? null) ? $engine['capabilities'] : [];
        $floor = is_array($engine['versionFloor'] ?? null) ? $engine['versionFloor'] : null;

        return [
            'id' => (string) $engine['id'],
            'name' => (string) $engine['name'],
            'path' => EnginePaths::pathFor($engine, EnginePaths::byId($this->publishedEngines())),
            'anchor' => is_string($engine['anchor'] ?? null) ? $engine['anchor'] : null,
            'release' => $this->releaseLabel(is_string($engine['sinceAppVersion'] ?? null) ? $engine['sinceAppVersion'] : null),
            'queryLanguage' => (string) $engine['queryLanguage'],
            'icon' => is_string($engine['icon'] ?? null) ? $engine['icon'] : null,
            'docsSlug' => $this->docsSlug($engine),
            'distribution' => (string) $engine['distribution'],
            'ios' => $this->ios($engine),
            'limits' => array_map(
                fn(array $limit): array => ['id' => (string) $limit['id'], 'value' => is_int($limit['value'] ?? null) ? $limit['value'] : null],
                is_array($engine['limits'] ?? null) ? $engine['limits'] : [],
            ),
            'defaultPort' => is_int($engine['defaultPort'] ?? null) ? $engine['defaultPort'] : null,
            'connectionMode' => (string) $engine['connectionMode'],
            'bundledVersion' => is_string($engine['bundledVersion'] ?? null) ? $engine['bundledVersion'] : null,
            'versionFloor' => $floor === null ? null : ['text' => is_string($floor['text'] ?? null) ? $floor['text'] : null, 'enforced' => ($floor['enforced'] ?? false) === true],
            'capabilities' => [
                'ssh' => ($capabilities['ssh'] ?? false) === true,
                'ssl' => ($capabilities['ssl'] ?? false) === true,
                'awsSignIn' => ($capabilities['awsSignIn'] ?? false) === true,
                'cloudSqlProxy' => ($capabilities['cloudSqlProxy'] ?? false) === true,
                'nativeDump' => $this->dumpToolName($capabilities['nativeDump'] ?? null),
            ],
            'formats' => $this->formats($engine),
            'sharedWith' => array_values(array_map(
                fn(array $other): string => (string) $other['name'],
                array_filter(
                    $this->publishedEngines(),
                    fn(array $other): bool => $other['id'] !== $engine['id'] && ($other['driverPlugin'] ?? null) === ($engine['driverPlugin'] ?? false),
                ),
            )),
        ];
    }

    /**
     * @param  array<string, mixed>  $engine
     * @return array{inPicker: bool, openable: bool}
     */
    private function ios(array $engine): array
    {
        return [
            'inPicker' => ($engine['ios']['inPicker'] ?? false) === true,
            'openable' => ($engine['ios']['openable'] ?? false) === true,
        ];
    }

    /**
     * @param  list<string>  $ids
     * @return array<string, array{tagline: string, limits: array<string, string>}>
     */
    private function engineCopy(string $locale, array $ids): array
    {
        $copy = $this->content->page('engines', $locale);
        $entries = [];

        foreach ($ids as $id) {
            $entry = is_array($copy[$id] ?? null) ? $copy[$id] : [];

            $entries[$id] = [
                'tagline' => is_string($entry['tagline'] ?? null) ? $entry['tagline'] : '',
                'limits' => array_filter(is_array($entry['limits'] ?? null) ? $entry['limits'] : [], 'is_string'),
            ];
        }

        return $entries;
    }

    /**
     * @return array{deviceNames: list<string>}|null
     */
    private function deviceNames(string $platform): ?array
    {
        $summary = $platform === 'linux' ? $this->platforms->linuxSummary() : $this->platforms->summary($platform);

        return $summary === null ? null : ['deviceNames' => $summary['deviceNames']];
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

    /**
     * @return array<string, mixed>|null
     */
    private function engineBySlug(string $slug): ?array
    {
        foreach ($this->publishedEngines() as $engine) {
            if (($engine['page'] ?? null) === 'own' && ($engine['slug'] ?? null) === $slug) {
                return $engine;
            }
        }

        return null;
    }

    // ScyllaDB has no docs page of its own; it shares Cassandra's driver and docs.
    /** @param  array<string, mixed>  $engine */
    private function docsSlug(array $engine): ?string
    {
        if (is_string($engine['docsSlug'] ?? null)) {
            return $engine['docsSlug'];
        }

        foreach ($this->publishedEngines() as $other) {
            if ($other['id'] !== $engine['id'] && ($other['driverPlugin'] ?? null) === ($engine['driverPlugin'] ?? false) && is_string($other['docsSlug'] ?? null)) {
                return $other['docsSlug'];
            }
        }

        return null;
    }

    // Import leaves out a format whose plugin refuses the engine (SQL on MongoDB); export leaves out the ones a separate
    // plugin adds, such as Parquet.
    /**
     * @param  array<string, mixed>  $engine
     * @return array{import: list<string>, export: list<string>}
     */
    private function formats(array $engine): array
    {
        $facts = $this->json('facts.json');
        $capabilities = is_array($engine['capabilities'] ?? null) ? $engine['capabilities'] : [];
        $import = [];
        $export = [];

        if (($capabilities['import'] ?? false) === true) {
            foreach ($facts['dataImport']['formats'] ?? [] as $format) {
                if (is_array($format) && is_string($format['name'] ?? null) && ! in_array($engine['id'], (array) ($format['exceptEngines'] ?? []), true)) {
                    $import[] = $format['name'];
                }
            }
        }

        if (($capabilities['export'] ?? false) === true) {
            foreach ($facts['export']['formats'] ?? [] as $format) {
                if (! is_array($format) || ! is_string($format['name'] ?? null) || ($format['via'] ?? null) !== null) {
                    continue;
                }

                $only = $format['engines'] ?? null;

                if ((is_array($only) && ! in_array($engine['id'], $only, true)) || in_array($engine['id'], (array) ($format['exceptEngines'] ?? []), true)) {
                    continue;
                }

                $export[] = $format['name'];
            }
        }

        return ['import' => $import, 'export' => $export];
    }

    private function dumpToolName(mixed $id): ?string
    {
        if (! is_string($id)) {
            return null;
        }

        foreach ($this->json('facts.json')['backup']['tools'] ?? [] as $tool) {
            if (is_array($tool) && ($tool['id'] ?? null) === $id) {
                return (string) ($tool['name'] ?? $id);
            }
        }

        return $id;
    }

    // `0.77` while the oldest Mac build a channel still serves lacks the engine (architecture §1.8).
    private function releaseLabel(?string $since): ?string
    {
        $floor = $this->platforms->macFloorVersion();

        if ($since === null || $floor === null || version_compare($since, $floor, '<=')) {
            return null;
        }

        [$major, $minor] = array_pad(explode('.', $since), 2, '0');

        return "{$major}.{$minor}";
    }

    /**
     * @return array<array-key, mixed>
     */
    private function json(string $file): array
    {
        if (array_key_exists($file, $this->data)) {
            return $this->data[$file];
        }

        $path = resource_path('data/' . $file);
        $decoded = File::isFile($path) ? json_decode((string) File::get($path), true) : null;

        return $this->data[$file] = is_array($decoded) ? $decoded : [];
    }

    private function url(mixed $value): ?string
    {
        return is_string($value) && str_starts_with($value, 'https://') ? $value : null;
    }
}
