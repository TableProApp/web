<?php

namespace App\Http\Controllers;

use App\Support\Content\EnginePaths;
use App\Services\Releases\PlatformCatalog;
use App\Support\Content\ContentRepository;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The database hub, `/databases`, and each engine page, such as `/mysql-client`
 * (sitemap §A.3, §E.1, §E.8; design-system §8.3, §8.4).
 *
 * Every fact a page states about an engine arrives here from data, never from
 * its copy: `engines.json` (distribution, query language, capabilities, the
 * version floor, limits, iPhone and iPad availability), `platforms.json`
 * (device names, the App Store listing, the release floor that decides the
 * "0.77" labels), `facts.json` (the docs and issue tracker URLs) and
 * `comparisons.json` (the dated facts of the tools an engine page cites). The
 * page copy is `content/{locale}/databases/{slug}.json`, the shared labels are
 * the hub file's `labels`, and each engine's tagline and limit sentences are
 * `content/{locale}/engines.json`. `components/databases/README.md` documents
 * the content schema.
 *
 * Only the fields a page renders are sent, so the evidence strings in the data
 * files never reach the browser.
 */
class DatabaseController extends Controller
{
    /**
     * The hub's category order and section ids (sitemap §A.3).
     *
     * @var list<string>
     */
    public const CATEGORIES = [
        'relational', 'analytical', 'cloud', 'document', 'key-value', 'wide-column', 'search', 'streaming', 'coordination', 'files',
    ];

    /**
     * Decoded data files, once per request.
     *
     * @var array<string, array<array-key, mixed>>
     */
    private array $data = [];

    public function __construct(
        private readonly ContentRepository $content,
        private readonly PlatformCatalog $platforms,
    ) {}

    public function index(): Response
    {
        $locale = App::getLocale();
        $engines = $this->publishedEngines();

        return Inertia::render('Databases/Index', [
            'content' => $this->content->page('databases/index', $locale),
            'engines' => array_map(fn(array $engine): array => $this->summary($engine), $engines),
            'copy' => $this->engineCopy($locale, array_column($engines, 'id')),
            'iosEngines' => $this->iosEngines(),
            'platforms' => $this->platformSummaries(),
            'links' => $this->links(),
        ]);
    }

    public function show(string $slug): Response
    {
        $locale = App::getLocale();
        $page = $this->content->page("databases/{$slug}", $locale);
        $engine = $this->engineBySlug($slug);

        abort_if($engine === null, 404);

        $family = array_values(array_filter(
            $this->publishedEngines(),
            fn(array $candidate): bool => ($candidate['page'] ?? null) === 'section' && ($candidate['parent'] ?? null) === $engine['id'],
        ));

        return Inertia::render('Databases/Show', [
            'slug' => $slug,
            'content' => $page,
            'labels' => $this->content->page('databases/index', $locale)['labels'] ?? [],
            'engine' => $this->summary($engine, true),
            'family' => array_map(fn(array $member): array => $this->summary($member, true), $family),
            'copy' => $this->engineCopy($locale, [$engine['id'], ...array_column($family, 'id')]),
            'tools' => $this->citedTools($page, $locale),
            'comparisons' => $this->moreComparisons($page, (string) $engine['id'], $locale),
            'platforms' => $this->platformSummaries(),
            'links' => $this->links(),
        ]);
    }

    /**
     * What a page renders about one engine.
     *
     * `path` is where the site describes the engine (its page, its section on
     * a family page, or its row on the hub), as a locale-neutral path. `release`
     * is the "0.77" label, set only while some channel still serves a Mac build
     * without the engine. `sharedWith` names the engines on the same driver.
     *
     * @param  array<string, mixed>  $engine
     * @return array<string, mixed>
     */
    private function summary(array $engine, bool $detailed = false): array
    {
        $capabilities = is_array($engine['capabilities'] ?? null) ? $engine['capabilities'] : [];
        $floor = is_array($engine['versionFloor'] ?? null) ? $engine['versionFloor'] : null;

        $summary = [
            'id' => (string) $engine['id'],
            'name' => (string) $engine['name'],
            'page' => (string) $engine['page'],
            'path' => $this->path($engine),
            'anchor' => $engine['anchor'] ?? null,
            'category' => (string) $engine['category'],
            'featured' => ($engine['featured'] ?? false) === true,
            'distribution' => (string) $engine['distribution'],
            'release' => $this->releaseLabel(is_string($engine['sinceAppVersion'] ?? null) ? $engine['sinceAppVersion'] : null),
            'queryLanguage' => (string) $engine['queryLanguage'],
            'icon' => $engine['icon'] ?? null,
            'monogram' => (string) ($engine['monogram'] ?? ''),
            'docsSlug' => $this->docsSlug($engine),
            'ios' => [
                'inPicker' => ($engine['ios']['inPicker'] ?? false) === true,
                'openable' => ($engine['ios']['openable'] ?? false) === true,
            ],
            'limits' => array_map(
                fn(array $limit): array => ['id' => (string) $limit['id'], 'value' => is_int($limit['value'] ?? null) ? $limit['value'] : null],
                is_array($engine['limits'] ?? null) ? $engine['limits'] : [],
            ),
        ];

        if (! $detailed) {
            return $summary;
        }

        return [
            ...$summary,
            'defaultPort' => is_int($engine['defaultPort'] ?? null) ? $engine['defaultPort'] : null,
            'connectionMode' => (string) $engine['connectionMode'],
            'bundledVersion' => is_string($engine['bundledVersion'] ?? null) ? $engine['bundledVersion'] : null,
            'versionFloor' => $floor === null ? null : ['text' => (string) $floor['text'], 'enforced' => ($floor['enforced'] ?? false) === true],
            'capabilities' => [
                'ssh' => ($capabilities['ssh'] ?? false) === true,
                'ssl' => ($capabilities['ssl'] ?? false) === true,
                'import' => ($capabilities['import'] ?? false) === true,
                'export' => ($capabilities['export'] ?? false) === true,
                'schemaEditing' => (string) ($capabilities['schemaEditing'] ?? 'read-only'),
                'explain' => array_values(array_filter($capabilities['explain'] ?? [], 'is_string')),
                'explainView' => $capabilities['explainView'] ?? null,
                'dashboard' => ($capabilities['dashboard'] ?? false) === true,
                'usersRoles' => ($capabilities['usersRoles'] ?? false) === true,
                'awsIam' => ($capabilities['awsIam'] ?? false) === true,
                'awsSignIn' => ($capabilities['awsSignIn'] ?? false) === true,
                'cloudSqlProxy' => ($capabilities['cloudSqlProxy'] ?? false) === true,
                'nativeDump' => $this->dumpToolName($capabilities['nativeDump'] ?? null),
                'readOnlyMode' => ($capabilities['readOnlyMode'] ?? true) === true,
                'alwaysReadOnly' => ($capabilities['alwaysReadOnly'] ?? false) === true,
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
     * Each engine's tagline and limit sentences in this locale, for the ids asked.
     *
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
     * The dated facts of each tool a page's "Other tools" paragraph cites,
     * from `comparisons.json`, in the order the copy cites them. Dates are
     * formatted here, in the page's locale, so the server and the browser
     * render the same text.
     *
     * @param  array<string, mixed>  $page
     * @return list<array{id: string, name: string, comparePath: string|null, compareTitle: string|null, state: string, version: string|null, released: string|null, platforms: list<string>, licence: array{name: string|null, openSource: bool}, free: bool, checked: string|null, sources: list<array{title: string, url: string}>}>
     */
    private function citedTools(array $page, string $locale): array
    {
        $items = $page['otherTools']['items'] ?? [];

        if (! is_array($items)) {
            return [];
        }

        $products = collect($this->json('comparisons.json')['products'] ?? [])->keyBy('id');
        $tools = [];

        foreach ($items as $item) {
            $product = is_array($item) ? $products->get($item['product'] ?? '') : null;

            if (! is_array($product)) {
                continue;
            }

            $prices = is_array($product['prices'] ?? null) ? $product['prices'] : [];
            $release = $product['status']['lastRelease'] ?? null;

            $tools[] = [
                'id' => (string) $product['id'],
                'name' => (string) $product['name'],
                'comparePath' => is_string($product['slug'] ?? null) ? '/compare/' . $product['slug'] : null,
                'compareTitle' => is_string($product['slug'] ?? null) ? $this->compareTitle($product['slug'], $locale) : null,
                'state' => (string) ($product['status']['state'] ?? 'active'),
                'version' => is_array($release) && is_string($release['version'] ?? null) ? $release['version'] : null,
                'released' => is_array($release) ? $this->date($release['date'] ?? null, $locale) : null,
                'platforms' => array_values(array_filter($product['platforms'] ?? [], 'is_string')),
                'licence' => [
                    'name' => is_string($product['licence']['name'] ?? null) ? $product['licence']['name'] : null,
                    'openSource' => ($product['licence']['openSource'] ?? false) === true,
                ],
                'free' => $prices !== [] && collect($prices)->every(fn(mixed $price): bool => is_array($price) && ($price['amount'] ?? null) === 0),
                'checked' => $this->date($product['checkedAt'] ?? null, $locale),
                'sources' => array_values(array_map(
                    fn(array $source): array => ['title' => (string) $source['title'], 'url' => (string) $source['url']],
                    array_filter($product['sources'] ?? [], fn(mixed $source): bool => is_array($source) && is_string($source['url'] ?? null) && str_starts_with($source['url'], 'https://')),
                )),
            ];
        }

        return $tools;
    }

    /**
     * The comparisons with a client that connects to this engine and that the
     * page's "Other tools" paragraphs do not already link, in data order. An
     * engine is matched through the `engines` list of the product's sourced
     * `databases` cell. Empty on a page with no "Other tools" block.
     *
     * @param  array<string, mixed>  $page
     * @return list<array{path: string, title: string}>
     */
    private function moreComparisons(array $page, string $engineId, string $locale): array
    {
        $items = $page['otherTools']['items'] ?? null;

        if (! is_array($items) || $items === []) {
            return [];
        }

        $cited = array_column(array_filter($items, 'is_array'), 'product');
        $comparisons = [];

        foreach ($this->json('comparisons.json')['products'] ?? [] as $product) {
            if (! is_array($product) || ! is_string($product['slug'] ?? null) || in_array($product['id'] ?? null, $cited, true)) {
                continue;
            }

            $title = $this->compareTitle($product['slug'], $locale);

            if ($title !== null && in_array($engineId, $product['cells']['databases']['engines'] ?? [], true)) {
                $comparisons[] = ['path' => '/compare/' . $product['slug'], 'title' => $title];
            }
        }

        return $comparisons;
    }

    /**
     * A comparison page's H1 in this locale, or null where it has no copy.
     */
    private function compareTitle(string $slug, string $locale): ?string
    {
        $title = $this->content->entry('compare', $slug, $locale)['header']['title'] ?? null;

        return is_string($title) && $title !== '' ? $title : null;
    }

    /**
     * The outbound links the pages build: docs paths are joined to `docs`, and
     * the request form is the issue tracker's feature request template. The
     * App Store action is null while the iPhone and iPad app is not released,
     * as `appStoreUrl` is on /download and /ios.
     *
     * @return array{docs: string|null, request: string|null, appStore: string|null}
     */
    private function links(): array
    {
        $links = $this->json('facts.json')['links'] ?? [];
        $docs = $this->url($links['docs'] ?? null);
        $issues = $this->url($links['issues'] ?? null);

        return [
            'docs' => $docs !== null ? rtrim($docs, '/') : null,
            'request' => $issues !== null ? rtrim($issues, '/') . '/new?template=feature_request.yml' : null,
            'appStore' => $this->platforms->isReleased('ios')
                ? ($this->url($this->platforms->destination('ios', 'app-store')['url'] ?? null) ?? $this->url($links['appStore'] ?? null))
                : null,
        ];
    }

    /**
     * The released apps' device names and requirements, for the H1's device
     * list and the closing band's requirement line. Null for an app that is
     * not released.
     *
     * @return array{mac: array{deviceNames: list<string>, requirements: array{systems: list<string>, minVersion: string, displayVersion: string, releaseName: string|null}}|null, ios: array{deviceNames: list<string>, requirements: array{systems: list<string>, minVersion: string, displayVersion: string, releaseName: string|null}}|null}
     */
    private function platformSummaries(): array
    {
        return [
            'mac' => $this->platforms->summary('mac'),
            'ios' => $this->platforms->summary('ios'),
        ];
    }

    /**
     * The engines offered in the iPhone and iPad app's connection picker, in
     * its order, or none while that app is not released.
     *
     * @return list<string>
     */
    private function iosEngines(): array
    {
        if (! $this->platforms->isReleased('ios')) {
            return [];
        }

        return array_values(array_filter($this->platforms->find('ios')['iosEngines'] ?? [], 'is_string'));
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

    /**
     * The engine's page, family section or hub row, or null when it has none
     * (one rule for the whole site: `EnginePaths`). A family page's parent must
     * be published for its section to be linked.
     *
     * @param  array<string, mixed>  $engine
     */
    private function path(array $engine): ?string
    {
        return EnginePaths::pathFor($engine, EnginePaths::byId($this->publishedEngines()));
    }

    /**
     * @return array<string, mixed>|null
     */
    private function engineById(string $id): ?array
    {
        foreach ($this->publishedEngines() as $engine) {
            if ($engine['id'] === $id) {
                return $engine;
            }
        }

        return null;
    }

    /**
     * The engine's docs page, or the page of the engine whose driver it shares
     * (ScyllaDB is documented with Cassandra, Turso with libSQL).
     *
     * @param  array<string, mixed>  $engine
     */
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

    /**
     * The file formats an engine imports and exports, by name, from
     * `facts.json`. Import is empty on an engine without it, and leaves out a
     * format whose plugin refuses the engine (SQL on MongoDB). Export leaves
     * out formats that need a separate plugin, such as Parquet.
     *
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
                if (! is_array($format) || ! is_string($format['name'] ?? null)) {
                    continue;
                }

                if (in_array($engine['id'], is_array($format['exceptEngines'] ?? null) ? $format['exceptEngines'] : [], true)) {
                    continue;
                }

                $import[] = $format['name'];
            }
        }

        if (($capabilities['export'] ?? false) === true) {
            foreach ($facts['export']['formats'] ?? [] as $format) {
                if (! is_array($format) || ! is_string($format['name'] ?? null) || ($format['via'] ?? null) !== null) {
                    continue;
                }

                $only = $format['engines'] ?? null;
                $except = is_array($format['exceptEngines'] ?? null) ? $format['exceptEngines'] : [];

                if ((is_array($only) && ! in_array($engine['id'], $only, true)) || in_array($engine['id'], $except, true)) {
                    continue;
                }

                $export[] = $format['name'];
            }
        }

        return ['import' => $import, 'export' => $export];
    }

    /**
     * A backup tool's display name from `facts.json`, or null.
     */
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

    /**
     * `0.77` for an engine that shipped after the oldest Mac build a channel
     * still serves, else null (architecture §1.8, "Release-dependent labels").
     */
    private function releaseLabel(?string $since): ?string
    {
        $floor = $this->platforms->macFloorVersion();

        if ($since === null || $floor === null || version_compare($since, $floor, '<=')) {
            return null;
        }

        [$major, $minor] = array_pad(explode('.', $since), 2, '0');

        return "{$major}.{$minor}";
    }

    private function date(mixed $value, string $locale): ?string
    {
        if (! is_string($value) || preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) !== 1) {
            return null;
        }

        return Carbon::parse($value)->locale($locale)->isoFormat('LL');
    }

    /**
     * A file in `resources/data`, decoded once, or an empty array when it is
     * missing or malformed. Each file's `Data` test keeps it valid.
     *
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
