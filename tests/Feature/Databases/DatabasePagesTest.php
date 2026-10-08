<?php

use App\Http\Controllers\DatabaseController;
use App\Support\Content\Slugs\DatabaseSlugs;
use App\Support\Seo\RedirectMap;
use Dom\HTMLDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;
use Symfony\Component\HttpKernel\Exception\HttpException;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/**
 * The database hub and the engine pages (sitemap §A.3, §E.1, §E.2, §E.8).
 *
 * Every page file is held to the schema in
 * `resources/js/components/databases/README.md`, so a batch of pages written
 * by different hands still renders through one template: the facts come from
 * engines.json and the other data files, and the copy only adds what data
 * cannot say. The guards here are the ones a wrong page would slip past the
 * shared tests with: a family section missing its anchor, a slot borrowed
 * from another engine, a link to a URL, a fact typed into copy, a SQL
 * narrative on an engine iOS cannot open.
 */
beforeEach(function (): void {
    withoutVite();
});

/**
 * @return list<array<string, mixed>>
 */
function databasePagesEngines(): array
{
    return json_decode((string) file_get_contents(resource_path('data/engines.json')), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * The page files of one locale, slug => decoded copy.
 *
 * @return array<string, array<string, mixed>>
 */
function databasePagesFiles(string $locale): array
{
    $files = [];

    foreach (glob(resource_path("data/content/{$locale}/databases/*.json")) ?: [] as $file) {
        $slug = basename($file, '.json');

        if ($slug !== 'index') {
            $files[$slug] = json_decode((string) file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
        }
    }

    ksort($files);

    return $files;
}

/**
 * Every string leaf of a decoded file, keyed by its dotted path.
 *
 * @param  array<array-key, mixed>  $data
 * @return array<string, string>
 */
function databasePagesStrings(array $data, string $prefix = ''): array
{
    $strings = [];

    foreach ($data as $key => $value) {
        $path = $prefix === '' ? (string) $key : "{$prefix}.{$key}";

        if (is_string($value)) {
            $strings[$path] = $value;
        } elseif (is_array($value)) {
            $strings = [...$strings, ...databasePagesStrings($value, $path)];
        }
    }

    return $strings;
}

/**
 * The route a site path answers on, or null.
 */
function databasePagesRoute(string $path): ?string
{
    try {
        return Route::getRoutes()->match(Request::create(strtok($path, '#') ?: '/'))->getName();
    } catch (HttpException) {
        return null;
    }
}

it('routes the final engine pages, in data order, and never the merged ones', function (): void {
    $own = array_values(array_filter(array_column(array_filter(databasePagesEngines(), fn(array $engine): bool => $engine['page'] === 'own'), 'slug')));

    expect(DatabaseSlugs::ALL)->toBe($own);
    expect(array_intersect(DatabaseSlugs::MERGED, DatabaseSlugs::ALL))->toBe([]);

    $map = app(RedirectMap::class);

    foreach (DatabaseSlugs::MERGED as $slug) {
        expect($map->retires("/{$slug}"))->toBeTrue("/{$slug} must stay a redirect");
    }
});

it('answers each merged page with one 301 to its section on the family page', function (string $from, string $to): void {
    get("{$from}?ref=app")
        ->assertStatus(301)
        ->assertHeader('Location', 'https://' . config('app.web_domain') . $to);
})->with([
    ['/mariadb-client', '/mysql-client?ref=app#mariadb'],
    ['/cockroachdb-client', '/postgresql-client?ref=app#cockroachdb'],
    ['/pglite-client', '/postgresql-client?ref=app#pglite'],
    ['/scylladb-client', '/cassandra-client?ref=app#scylladb'],
]);

it('writes the same pages in every language', function (): void {
    expect(array_keys(databasePagesFiles('vi')))->toBe(array_keys(databasePagesFiles('en')));
    expect(array_diff(array_keys(databasePagesFiles('en')), DatabaseSlugs::ALL))->toBe([], 'A page file has no route');
});

it('holds every page file to the schema in components/databases/README.md', function (): void {
    $engines = collect(databasePagesEngines())->keyBy('id');
    $assets = json_decode((string) file_get_contents(resource_path('data/assets.json')), true, 512, JSON_THROW_ON_ERROR)['assets'];
    $products = collect(json_decode((string) file_get_contents(resource_path('data/comparisons.json')), true, 512, JSON_THROW_ON_ERROR)['products'])->keyBy('id');
    $tiers = array_map(
        fn(array $feature): string => lcfirst(str_replace(' ', '', ucwords(str_replace('-', ' ', $feature['id'])))) . 'Tier',
        json_decode((string) file_get_contents(resource_path('data/paid-features.json')), true, 512, JSON_THROW_ON_ERROR),
    );
    $order = ['connect', 'work', 'schema', 'operate', 'move-data', 'iphone'];
    foreach (['en', 'vi'] as $locale) {
        foreach (databasePagesFiles($locale) as $slug => $copy) {
            $where = "content/{$locale}/databases/{$slug}.json";

            expect(array_keys($copy))->toBe(
                ['seo', 'og', 'engine', 'breadcrumb', 'header', 'asset', 'links', 'sections', 'family', 'otherTools', 'faq', 'related'],
                "{$where} has the wrong top-level keys",
            );

            $engine = $engines->get($copy['engine']);

            expect($engine)->not->toBeNull("{$where}: no engine {$copy['engine']}");
            expect($engine['page'])->toBe('own');
            expect($engine['slug'])->toBe($slug, "{$where} describes {$copy['engine']}, whose page is {$engine['slug']}");

            expect(array_keys($copy['seo']))->toBe(['title', 'description']);
            expect(array_keys($copy['og']))->toBe(['kicker', 'title']);
            expect(mb_strlen($copy['seo']['description']))->toBeLessThanOrEqual(170, "{$where}: seo.description is too long");

            foreach ([$copy['seo']['description'], ...array_values($copy['og'])] as $text) {
                expect($text)->toBeString()->not->toBe('')->not->toContain('{');
            }

            /*
             * The search title names the platforms the way the H1 does, from
             * platforms.json (sitemap §A.3, spec §5 "keep Mac-specific search
             * titles"), and the two never disagree.
             */
            expect($copy['seo']['title'])->toBe($copy['header']['title'], "{$where}: seo.title must match the H1");

            expect(array_keys($copy['header']))->toBe(['title', 'lead']);
            expect(preg_match('/\{(devices|macDevices)\}/', $copy['header']['title']))->toBe(1, "{$where}: the H1 names its platforms from data");
            expect($copy['breadcrumb'])->toBeString()->not->toBe('');

            $slot = static function (string $id) use ($assets, $slug, $where): void {
                expect($assets[$id] ?? null)->not->toBeNull("{$where}: no asset {$id}");
                expect($assets[$id]['slot'])->toBeTrue("{$where}: {$id} is not a slot");
                Assert::assertContains("/{$slug}", array_column($assets[$id]['usedOn'], 'path'), "{$where}: {$id} is not briefed for /{$slug}");
            };

            $slot($copy['asset']);
            expect($assets[$copy['asset']]['family'])->toBe('databases', "{$where}: the lead slot must be this engine's own");

            foreach ($copy['links'] as $name => $target) {
                expect($name)->toMatch('/^[a-z][A-Za-z0-9]*$/')->not->toBeIn(['ui', 'code']);
                expect($target)->toBeString();

                if (str_starts_with($target, 'docs:/')) {
                    continue;
                }

                if (str_starts_with($target, '#')) {
                    expect($target)->toMatch('/^#[a-z0-9-]+$/');

                    continue;
                }

                expect($target)->toStartWith('/');
                expect(databasePagesRoute($target))->toStartWith('landing.', "{$where}: link {$name} → {$target} is not a site page");
            }

            $ids = array_column($copy['sections'], 'id');

            expect($ids)->toBe(array_values(array_intersect($order, $ids)), "{$where}: sections out of order or unknown");
            expect($ids)->toBe(array_values(array_unique($ids)));
            expect($ids)->toContain('connect', 'work');

            $opens = $engine['ios']['inPicker'] || $engine['ios']['openable'];

            if (! $opens) {
                Assert::assertNotContains('iphone', $ids, "{$where}: {$engine['name']} does not open on iPhone or iPad");
            }

            foreach ($copy['sections'] as $section) {
                expect(array_diff(array_keys($section), ['id', 'title', 'paragraphs', 'points', 'asset']))->toBe([]);
                expect($section['paragraphs'])->toBeArray()->not->toBeEmpty();

                if (isset($section['asset'])) {
                    $slot($section['asset']);
                }
            }

            $members = array_values(array_column(
                array_filter(databasePagesEngines(), fn(array $other): bool => $other['page'] === 'section' && $other['parent'] === $engine['id']),
                'id',
            ));

            expect(array_column($copy['family'], 'engine'))->toBe($members, "{$where}: the family sections must be every merged engine, in data order");

            foreach ($copy['family'] as $member) {
                expect(array_diff(array_keys($member), ['engine', 'title', 'paragraphs', 'points']))->toBe([]);
            }

            if ($copy['otherTools'] !== null) {
                expect(array_keys($copy['otherTools']))->toBe(['items', 'notes']);

                $used = [];

                foreach ($copy['otherTools']['items'] as $item) {
                    expect(array_diff(array_keys($item), ['product', 'text', 'notes', 'anchor']))->toBe([]);

                    if (isset($item['anchor'])) {
                        expect($item['anchor'])->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/');
                    }

                    $product = $products->get($item['product']);

                    expect($product)->not->toBeNull("{$where}: comparisons.json has no {$item['product']}");

                    $cellNotes = collect($product['cells'] ?? [])->pluck('note')->filter()->values()->all();

                    foreach ($item['notes'] ?? [] as $note) {
                        expect($cellNotes)->toContain($note);
                        expect($copy['otherTools']['notes'][$note] ?? null)->toBeString("{$where}: no sentence for note {$note}");
                        $used[] = $note;
                    }

                    if ($product['slug'] === null) {
                        expect($item['notes'] ?? [])->toEqualCanonicalizing($cellNotes, "{$where}: {$item['product']} has no comparison page, so each of its notes needs a sentence here");
                    }
                }

                expect(array_keys($copy['otherTools']['notes']))->toEqualCanonicalizing($used);
            }

            expect(count($copy['faq']))->toBeLessThanOrEqual(4);
            expect(array_column($copy['faq'], 'id'))->toBe(array_values(array_unique(array_column($copy['faq'], 'id'))));

            foreach ($copy['faq'] as $entry) {
                expect(array_keys($entry))->toBe(['id', 'question', 'answer']);
                expect($entry['id'])->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/');
            }

            foreach ($copy['related'] as $link) {
                expect(array_keys($link))->toBe(['label', 'href']);
                expect(databasePagesRoute($link['href']))->toStartWith('landing.', "{$where}: related {$link['href']} is not a site page");
            }

            $tags = ['ui', 'code', ...array_keys($copy['links'])];
            $tokens = ['name', 'exportFormats', ...$tiers];

            if ($engine['capabilities']['nativeDump'] !== null) {
                $tokens[] = 'dumpTool';
            }

            if ($engine['capabilities']['import']) {
                $tokens[] = 'importFormats';
            }

            if ($engine['bundledVersion'] !== null) {
                $tokens[] = 'engineVersion';
            }

            foreach (databasePagesStrings($copy) as $path => $text) {
                expect(preg_match('#https?://#', $text))->toBe(0, "{$where} {$path}: URLs live in data files");

                preg_match_all('/<\/?([a-zA-Z][a-zA-Z0-9]*)>/', $text, $found);
                expect(array_diff($found[1], $tags))->toBe([], "{$where} {$path}: unknown tag");

                preg_match_all('/\{([A-Za-z][A-Za-z0-9_.]*)\}/', $text, $found);
                $allowed = in_array($path, ['header.title', 'seo.title'], true) ? ['devices', 'macDevices'] : $tokens;

                if (str_starts_with($path, 'family.')) {
                    $member = $engines->get($copy['family'][(int) explode('.', $path)[1]]['engine']);
                    $allowed = ['name', 'exportFormats', ...$tiers];

                    if ($member['capabilities']['nativeDump'] !== null) {
                        $allowed[] = 'dumpTool';
                    }

                    if ($member['capabilities']['import']) {
                        $allowed[] = 'importFormats';
                    }
                }

                expect(array_diff($found[1], $allowed))->toBe([], "{$where} {$path}: a token data cannot fill");
            }
        }
    }
});

it('types no count, number-led claim or banned phrase into database copy', function (string $locale): void {
    $files = [
        "content/{$locale}/engines.json" => json_decode((string) file_get_contents(resource_path("data/content/{$locale}/engines.json")), true),
        "content/{$locale}/databases/index.json" => json_decode((string) file_get_contents(resource_path("data/content/{$locale}/databases/index.json")), true),
    ];

    foreach (databasePagesFiles($locale) as $slug => $copy) {
        $files["content/{$locale}/databases/{$slug}.json"] = $copy;
    }

    /*
     * The positioning §12 phrases a database page is most likely to reach
     * for. `Content/BannedClaimsTest` holds the whole list for every page;
     * this catches them where the batch pages are written.
     */
    $banned = [
        'every database', 'all databases', 'any database', 'cross-platform', 'all platforms', 'unlock', 'unlocks', 'seamless',
        'powerful', 'effortless', 'blazing', 'lightweight', 'free forever', 'no feature gating', 'Mac App Store', 'Setapp',
        'MySQL Workbench', 'coming soon', 'mọi cơ sở dữ liệu', 'tất cả cơ sở dữ liệu', 'đa nền tảng', 'mở khóa', 'mạnh mẽ',
        'liền mạch', 'siêu nhanh', 'tức thì', 'sắp ra mắt', 'miễn phí mãi mãi',
    ];
    $counted = '/\b\d+\s+(databases?|engines?|drivers?|features?|tools?|providers?|plugins?|cơ sở dữ liệu|tính năng|công cụ|nhà cung cấp)\b/iu';

    foreach ($files as $where => $data) {
        foreach (databasePagesStrings($data) as $path => $text) {
            expect(preg_match($counted, $text))->toBe(0, "{$where} {$path} types a count");

            foreach ($banned as $phrase) {
                expect(preg_match('/(?<!\p{L})' . preg_quote($phrase, '/') . '(?!\p{L})/iu', $text))->toBe(0, "{$where} {$path} says \"{$phrase}\"");
            }
        }
    }
})->with(['en', 'vi']);

it('keeps the hub in the sitemap’s category order with every label both languages need', function (string $locale): void {
    $hub = json_decode((string) file_get_contents(resource_path("data/content/{$locale}/databases/index.json")), true, 512, JSON_THROW_ON_ERROR);

    expect(array_keys($hub['categories']))->toBe(DatabaseController::CATEGORIES);
    expect(array_keys($hub['labels']['platformNames']))->toEqualCanonicalizing(['mac', 'windows', 'linux', 'ios', 'web']);
    expect($hub['drivers']['docs']['path'])->toStartWith('/');
    expect($hub['docs']['path'])->toStartWith('/');

    foreach (databasePagesEngines() as $engine) {
        expect($hub['categories'])->toHaveKey($engine['category']);
    }
})->with(['en', 'vi']);

it('renders the hub from data in both languages, listing every published engine once', function (string $prefix, string $locale): void {
    $published = array_values(array_filter(databasePagesEngines(), fn(array $engine): bool => $engine['state'] === 'published'));

    get("{$prefix}/databases")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Databases/Index')
            ->where('locale', $locale)
            ->where('content.header.title', json_decode((string) file_get_contents(resource_path("data/content/{$locale}/databases/index.json")), true)['header']['title'])
            ->has('engines', count($published))
            ->where('engines', fn($engines): bool => collect($engines)->pluck('id')->all() === array_column($published, 'id'))
            ->where('engines.0.path', '/postgresql-client')
            ->where('copy', fn($copy): bool => collect($copy)->keys()->sort()->values()->all() === collect($published)->pluck('id')->sort()->values()->all())
            ->where('iosEngines', fn($ids): bool => collect($ids)->every(fn(string $id): bool => in_array($id, array_column($published, 'id'), true)))
            ->where('links.docs', 'https://docs.tablepro.app')
            ->where('links.request', fn(string $url): bool => str_starts_with($url, 'https://github.com/'))
            ->where('platforms.mac.requirements.minVersion', '13.0'));
})->with([
    'English' => ['', 'en'],
    'Vietnamese' => ['/vi', 'vi'],
]);

it('places every engine where the site describes it', function (): void {
    get('/databases')->assertInertia(fn(AssertableInertia $page) => $page->where('engines', function ($engines): bool {
        $paths = collect($engines)->pluck('path', 'id');

        Assert::assertSame('/mysql-client', $paths['mysql']);
        Assert::assertSame('/mysql-client#mariadb', $paths['mariadb']);
        Assert::assertSame('/postgresql-client#pglite', $paths['pglite']);
        Assert::assertSame('/cassandra-client#scylladb', $paths['scylladb']);
        Assert::assertSame('/turso-client#libsql', $paths['libsql']);
        Assert::assertSame('/databases#spanner', $paths['spanner']);
        Assert::assertSame('/databases#sap-hana', $paths['sap-hana']);

        return true;
    }));
});

it('renders each written engine page in both languages from its copy and the data', function (): void {
    $engines = collect(databasePagesEngines())->keyBy('id');

    foreach (databasePagesFiles('en') as $slug => $copy) {
        $engine = $engines[$copy['engine']];
        $members = array_values(array_column(array_filter(
            databasePagesEngines(),
            fn(array $other): bool => $other['page'] === 'section' && $other['parent'] === $engine['id'],
        ), 'id'));

        foreach (['' => 'en', '/vi' => 'vi'] as $prefix => $locale) {
            $file = json_decode((string) file_get_contents(resource_path("data/content/{$locale}/databases/{$slug}.json")), true);

            get("{$prefix}/{$slug}")
                ->assertOk()
                ->assertInertia(fn(AssertableInertia $page) => $page
                    ->component('Databases/Show')
                    ->where('slug', $slug)
                    ->where('locale', $locale)
                    ->where('content.header.title', $file['header']['title'])
                    ->where('engine.id', $engine['id'])
                    ->where('engine.distribution', $engine['distribution'])
                    ->where('engine.queryLanguage', $engine['queryLanguage'])
                    ->where('engine.versionFloor', $engine['versionFloor'] === null ? null : ['text' => $engine['versionFloor']['text'], 'enforced' => $engine['versionFloor']['enforced']])
                    ->where('engine.limits', array_map(fn(array $limit): array => ['id' => $limit['id'], 'value' => $limit['value']], $engine['limits']))
                    ->where('family', fn($family): bool => collect($family)->pluck('id')->all() === $members)
                    ->where('copy', fn($copy): bool => collect($copy)->keys()->all() === [$engine['id'], ...$members])
                    ->has('labels.facts')
                    ->has('platforms.mac.deviceNames'));
        }
    }
});

it('derives the MySQL page’s facts from data: the shared driver, the formats and the backup tool', function (): void {
    get('/mysql-client')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('engine.sharedWith', ['MariaDB', 'TiDB', 'OceanBase', 'Databend'])
        ->where('engine.capabilities.nativeDump', 'mysqldump')
        ->where('engine.formats.import', fn($formats): bool => collect($formats)->contains('CSV') && collect($formats)->contains('XLSX'))
        ->where('engine.formats.export', fn($formats): bool => collect($formats)->contains('SQL') && ! collect($formats)->contains('MQL') && ! collect($formats)->contains('Parquet'))
        ->where('engine.ios', ['inPicker' => true, 'openable' => true])
        ->where('family.3.id', 'databend')
        ->where('family.3.ios', ['inPicker' => false, 'openable' => false])
        ->where('family.0.capabilities.cloudSqlProxy', false));
});

it('leaves a format out of an engine’s imports when its plugin refuses that engine', function (): void {
    get('/mongodb-client')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('engine.formats.import', fn($formats): bool => collect($formats)->contains('JSON') && ! collect($formats)->contains('SQL')));
    get('/postgresql-client')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('engine.formats.import', fn($formats): bool => collect($formats)->contains('SQL')));
});

it('dates the tools the PostgreSQL page cites from comparisons.json, in the page’s language', function (string $prefix, string $date): void {
    $products = collect(json_decode((string) file_get_contents(resource_path('data/comparisons.json')), true)['products'])->keyBy('id');

    get("{$prefix}/postgresql-client")->assertInertia(fn(AssertableInertia $page) => $page
        ->where('tools.0.id', 'pgadmin')
        ->where('tools.0.comparePath', null)
        ->where('tools.0.version', $products['pgadmin']['status']['lastRelease']['version'])
        ->where('tools.0.checked', $date)
        ->where('tools.0.free', true)
        ->where('tools.0.licence.openSource', true)
        ->where('tools.0.sources', fn($sources): bool => collect($sources)->every(fn(array $source): bool => str_starts_with($source['url'], 'https://')))
        ->where('tools.1.id', 'postico')
        ->where('tools.1.comparePath', '/compare/postico')
        ->where('tools.1.free', false));
})->with([
    'English' => ['', 'October 2, 2026'],
    'Vietnamese' => ['/vi', '2 tháng 10 năm 2026'],
]);

it('links the comparisons with clients for the page’s engine that its paragraphs do not already link', function (string $slug, string $engine): void {
    $products = collect(json_decode((string) file_get_contents(resource_path('data/comparisons.json')), true)['products']);
    $cited = array_column(json_decode((string) file_get_contents(resource_path("data/content/en/databases/{$slug}.json")), true)['otherTools']['items'], 'product');
    $expected = $products
        ->filter(fn(array $product): bool => $product['slug'] !== null
            && ! in_array($product['id'], $cited, true)
            && in_array($engine, $product['cells']['databases']['engines'] ?? [], true))
        ->map(fn(array $product): array => [
            'path' => '/compare/' . $product['slug'],
            'title' => json_decode((string) file_get_contents(resource_path("data/content/en/compare/{$product['slug']}.json")), true)['header']['title'],
        ])
        ->values()
        ->all();

    expect(array_column($expected, 'path'))->toContain('/compare/tableplus', '/compare/dbeaver', '/compare/datagrip', '/compare/navicat', '/compare/beekeeper-studio');

    get("/{$slug}")->assertInertia(fn(AssertableInertia $page) => $page->where('comparisons', $expected));
})->with([
    ['mysql-client', 'mysql'],
    ['postgresql-client', 'postgresql'],
    ['sql-server-client', 'sqlserver'],
    ['mongodb-client', 'mongodb'],
    ['redis-gui', 'redis'],
]);

it('keeps a single-engine client’s comparison off another engine’s page', function (): void {
    get('/postgresql-client')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('comparisons', fn($comparisons): bool => collect($comparisons)->pluck('path')->intersect(['/compare/sequel-ace', '/compare/sequel-pro', '/compare/phpmyadmin', '/compare/postico'])->isEmpty())
        ->where('tools.1.compareTitle', 'TablePro vs Postico'));

    get('/sqlite-client')->assertInertia(fn(AssertableInertia $page) => $page->where('comparisons', []));
});

it('calls a tool with published code under a non-open licence source available, not closed source', function (): void {
    requireSsr();

    // The block's text, not the page's: the props beside it carry every label.
    $otherTools = fn(string $path): string => HTMLDocument::createFromString(ssrHtml($path), LIBXML_NOERROR)->querySelector('#other-tools')->textContent;

    foreach (['/mongodb-client' => 'mongodb-compass', '/redis-gui' => 'redis-insight'] as $path => $id) {
        get($path)->assertInertia(fn(AssertableInertia $page) => $page->where('tools.0.id', $id)->where('tools.0.licence', ['name' => 'SSPL-1.0', 'openSource' => false]));

        expect($otherTools($path))->toContain('Source available (SSPL-1.0)')->not->toContain('Closed source');
    }

    expect($otherTools('/mongodb-client'))->toContain('Platforms: Mac, Windows and Linux');
    expect($otherTools('/postgresql-client'))->toContain('Open source (PostgreSQL License)');
    expect($otherTools('/sql-server-client'))->toContain('Closed source');
});

it('renders every anchor a redirect or a link aims at, in both languages', function (): void {
    requireSsr();

    foreach (databasePagesFiles('en') as $slug => $copy) {
        foreach (['', '/vi'] as $prefix) {
            $html = (string) get("{$prefix}/{$slug}")->assertOk()->getContent();

            foreach ($copy['family'] as $member) {
                $anchor = collect(databasePagesEngines())->firstWhere('id', $member['engine'])['anchor'];

                Assert::assertStringContainsString("id=\"{$anchor}\"", $html, "{$prefix}/{$slug} has no #{$anchor}");
            }

            foreach ([...array_column($copy['sections'], 'id'), 'iphone', 'related'] as $id) {
                Assert::assertStringContainsString("id=\"{$id}\"", $html, "{$prefix}/{$slug} has no #{$id}");
            }

            foreach (json_decode((string) file_get_contents(resource_path('data/redirects.json')), true) as $redirect) {
                if (preg_match('#^/' . preg_quote($slug, '#') . '\#([a-z0-9-]+)$#', (string) ($redirect['to'] ?? ''), $match) === 1) {
                    Assert::assertStringContainsString("id=\"{$match[1]}\"", $html, "{$redirect['from']} lands on {$prefix}/{$slug}#{$match[1]}, which is missing");
                }
            }

            Assert::assertSame(1, substr_count($html, '<h1'), "{$prefix}/{$slug} must have one h1");
            Assert::assertStringNotContainsString('FAQPage', $html);
            Assert::assertStringNotContainsString('aggregateRating', $html);
        }
    }

    foreach (['', '/vi'] as $prefix) {
        $html = (string) get("{$prefix}/databases")->assertOk()->getContent();

        foreach ([...DatabaseController::CATEGORIES, 'drivers', 'iphone', 'missing'] as $id) {
            Assert::assertStringContainsString("id=\"{$id}\"", $html, "{$prefix}/databases has no #{$id}");
        }

        foreach (databasePagesEngines() as $engine) {
            if ($engine['page'] === 'hub') {
                Assert::assertStringContainsString("id=\"{$engine['anchor']}\"", $html, "{$prefix}/databases has no row #{$engine['anchor']}");
            }
        }
    }
});

it('describes an engine reached through its service API with no host or port', function (): void {
    requireSsr();

    $engines = collect(databasePagesEngines())->filter(fn(array $engine): bool => $engine['connectionMode'] === 'api' && $engine['page'] === 'own');

    expect($engines)->not->toBeEmpty();

    foreach (['' => 'en', '/vi' => 'vi'] as $prefix => $locale) {
        $labels = json_decode((string) file_get_contents(resource_path("data/content/{$locale}/databases/index.json")), true)['labels'];

        foreach ($engines as $engine) {
            $html = html_entity_decode((string) get("{$prefix}/{$engine['slug']}")->assertOk()->getContent(), ENT_QUOTES | ENT_HTML5);

            Assert::assertStringContainsString($labels['connect']['api'], $html, "{$prefix}/{$engine['slug']} does not say it connects through the service API");
            Assert::assertStringNotContainsString('>' . $labels['connect']['network'], $html, "{$prefix}/{$engine['slug']} offers a host and port the form does not have");
            Assert::assertStringNotContainsString('>' . $labels['facts']['defaultPort'] . '<', $html, "{$prefix}/{$engine['slug']} shows a port the form does not have");
        }
    }
});

it('titles each engine page with the platforms its heading names, and keeps the iPhone app out of the Redis title', function (): void {
    requireSsr();

    $html = static fn(string $path): string => html_entity_decode((string) get($path)->assertOk()->getContent(), ENT_QUOTES | ENT_HTML5);

    $title = static fn(string $text): string => '#<title[^>]*>' . preg_quote($text, '#') . '</title>#u';

    expect($html('/postgresql-client'))->toMatch($title('PostgreSQL client for Mac, iPhone and iPad – TablePro'));
    expect($html('/vi/postgresql-client'))->toMatch($title('Client PostgreSQL cho Mac, iPhone và iPad – TablePro'));
    // Key browsing is Mac-only in iOS 1.0 (positioning §12), so the heading and title promise only the Mac.
    expect($html('/redis-gui'))->toMatch($title('Redis GUI for Mac – TablePro'))->toMatch('#>Redis GUI for Mac</h1>#');
    expect($html('/vi/redis-gui'))->toMatch($title('GUI Redis cho Mac – TablePro'));
});

it('shows AWS IAM on the facts card wherever the engine has an AWS sign-in, not only RDS IAM', function (): void {
    requireSsr();

    $labels = json_decode((string) file_get_contents(resource_path('data/content/en/databases/index.json')), true)['labels'];

    // The facts card's "Connect with" row, as rendered.
    $connectRow = static function (string $slug) use ($labels): string {
        $html = html_entity_decode((string) get("/{$slug}")->getContent(), ENT_QUOTES | ENT_HTML5);
        $main = substr($html, (int) strpos($html, '<main'));
        $start = (int) strpos($main, '>' . $labels['facts']['connect'] . '<');

        return substr($main, $start, 400);
    };

    foreach (['mongodb-client', 'redis-gui', 'cassandra-client', 'postgresql-client'] as $slug) {
        expect($connectRow($slug))->toContain($labels['connect']['awsIam']);
    }

    expect($connectRow('redshift-client'))->not->toContain($labels['connect']['awsIam']);
});

it('writes the iPhone status line without an article in front of the engine name', function (): void {
    requireSsr();

    foreach (['/kafka-client', '/dynamodb-gui', '/elasticsearch-client', '/etcd-gui', '/redshift-client'] as $path) {
        expect(html_entity_decode((string) get($path)->getContent(), ENT_QUOTES | ENT_HTML5))
            ->not->toMatch('/\b[Aa] (Apache Kafka|Amazon DynamoDB|Elasticsearch|etcd|Amazon Redshift) connection/');
    }
});
