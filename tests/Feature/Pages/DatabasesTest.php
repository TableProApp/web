<?php

use App\Support\Content\EnginePaths;
use App\Support\Content\Slugs\DatabaseSlugs;
use App\Support\Seo\RedirectMap;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use Symfony\Component\HttpKernel\Exception\HttpException;

use function Pest\Laravel\get;

function databasesData(string $file): array
{
    return json_decode((string) file_get_contents(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

function databasesIsSitePage(string $path): bool
{
    try {
        return str_starts_with((string) Route::getRoutes()->match(Request::create(strtok($path, '#') ?: '/'))->getName(), 'landing.');
    } catch (HttpException) {
        return false;
    }
}

function databasesTokens(array $engine, array $tiers): array
{
    return [
        'name', 'exportFormats', ...$tiers,
        ...($engine['capabilities']['nativeDump'] !== null ? ['dumpTool'] : []),
        ...($engine['capabilities']['import'] ? ['importFormats'] : []),
        ...(($engine['bundledVersion'] ?? null) !== null ? ['engineVersion'] : []),
    ];
}

it('gives every engine the path its page kind says', function (): void {
    $engines = databasesData('engines.json');
    $byId = EnginePaths::byId($engines);

    foreach ($engines as $engine) {
        expect(EnginePaths::pathFor($engine, $byId))->toBe(match ($engine['page']) {
            'own' => '/' . $engine['slug'],
            'section' => '/' . $byId[$engine['parent']]['slug'] . '#' . $engine['anchor'],
            'hub' => '/databases#' . $engine['anchor'],
        }, $engine['id']);
    }
});

it('links nothing it cannot resolve', function (array $engine, array $byId): void {
    expect(EnginePaths::pathFor($engine, $byId))->toBeNull();
})->with([
    'a section of a parent with no page' => [['page' => 'section', 'parent' => 'parent', 'anchor' => 'child'], ['parent' => ['id' => 'parent', 'page' => 'hub', 'slug' => null, 'anchor' => 'parent']]],
    'a section of a missing parent' => [['page' => 'section', 'parent' => 'missing', 'anchor' => 'child'], []],
    'an own page with no route' => [['page' => 'own', 'slug' => 'not-a-routed-page'], []],
    'a hub anchor that is not one' => [['page' => 'hub', 'anchor' => 'Not An Anchor'], []],
    'an unknown page kind' => [['page' => 'unknown'], []],
]);

it('routes one page per own-page engine and redirects the merged ones', function (): void {
    $own = array_column(array_filter(databasesData('engines.json'), fn(array $engine): bool => $engine['page'] === 'own'), 'slug');

    expect(DatabaseSlugs::ALL)->toEqualCanonicalizing($own);

    foreach (DatabaseSlugs::MERGED as $slug) {
        expect(app(RedirectMap::class)->retires("/{$slug}"))->toBeTrue("/{$slug} must stay a redirect");
    }
});

it('renders the hub with every published engine once and copy for each', function (string $path): void {
    $published = array_column(array_filter(databasesData('engines.json'), fn(array $engine): bool => $engine['state'] === 'published'), 'id');

    get($path)
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('engines', fn($engines): bool => collect($engines)->pluck('id')->all() === $published)
            ->where('copy', fn($copy): bool => collect($copy)->keys()->sort()->values()->all() === collect($published)->sort()->values()->all()));
})->with(['/databases', '/vi/databases']);

it('fills each engine page only with tokens, tags and links the data has', function (string $slug): void {
    $copy = databasesData("content/en/databases/{$slug}.json");
    $engines = collect(databasesData('engines.json'))->keyBy('id');
    $products = collect(databasesData('comparisons.json')['products'])->keyBy('id');
    $tiers = array_map(
        fn(array $feature): string => lcfirst(str_replace(' ', '', ucwords(str_replace('-', ' ', $feature['id'])))) . 'Tier',
        databasesData('paid-features.json'),
    );
    $engine = $engines->get($copy['engine']);

    expect($engine['slug'] ?? null)->toBe($slug);

    foreach ($copy['related'] as $link) {
        expect(databasesIsSitePage($link['href']))->toBeTrue("{$slug}: related {$link['href']} is not a site page");
    }

    foreach ($copy['links'] as $target) {
        if (! str_starts_with($target, 'docs:/') && ! str_starts_with($target, '#')) {
            expect(databasesIsSitePage($target))->toBeTrue("{$slug}: {$target} is not a site page");
        }
    }

    foreach ($copy['otherTools']['items'] ?? [] as $item) {
        expect($products)->toHaveKey($item['product']);
    }

    foreach (Arr::dot($copy) as $path => $text) {
        if (! is_string($text)) {
            continue;
        }

        $allowed = match (true) {
            in_array($path, ['header.title', 'seo.title'], true) => ['devices', 'macDevices'],
            str_starts_with($path, 'family.') => databasesTokens($engines->get($copy['family'][(int) explode('.', $path)[1]]['engine']), $tiers),
            default => databasesTokens($engine, $tiers),
        };

        preg_match_all('/\{([A-Za-z][A-Za-z0-9_.]*)\}/', $text, $tokens);
        preg_match_all('/<\/?([a-zA-Z][a-zA-Z0-9]*)>/', $text, $tags);

        expect(array_diff($tokens[1], $allowed))->toBe([], "{$slug} {$path}: a token the data cannot fill")
            ->and(array_diff($tags[1], ['ui', 'code', ...array_keys($copy['links'])]))->toBe([], "{$slug} {$path}: an unknown tag");
    }
})->with(DatabaseSlugs::ALL);

it('leaves a format out of an engine’s imports when its plugin refuses that engine', function (): void {
    get('/mongodb-client')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('engine.formats.import', fn($formats): bool => collect($formats)->contains('JSON') && ! collect($formats)->contains('SQL')));
    get('/postgresql-client')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('engine.formats.import', fn($formats): bool => collect($formats)->contains('SQL')));
});

it('dates the tools a page cites from comparisons.json, in the page’s language', function (string $prefix, string $locale): void {
    $products = collect(databasesData('comparisons.json')['products'])->keyBy('id');

    get("{$prefix}/postgresql-client")->assertInertia(fn(AssertableInertia $page) => $page
        ->where('tools', fn($tools): bool => collect($tools)->every(fn(array $tool): bool => $tool['version'] === $products[$tool['id']]['status']['lastRelease']['version']
            && $tool['checked'] === Carbon::createFromFormat('!Y-m-d', $products[$tool['id']]['checkedAt'])->locale($locale)->isoFormat('LL'))));
})->with([['', 'en'], ['/vi', 'vi']]);

it('links the comparisons for its engine that its Other tools block does not already cite', function (string $slug, string $engine): void {
    $items = databasesData("content/en/databases/{$slug}.json")['otherTools']['items'] ?? [];
    $expected = $items === [] ? [] : collect(databasesData('comparisons.json')['products'])
        ->filter(fn(array $product): bool => $product['slug'] !== null
            && ! in_array($product['id'], array_column($items, 'product'), true)
            && in_array($engine, $product['cells']['databases']['engines'] ?? [], true))
        ->map(fn(array $product): string => '/compare/' . $product['slug'])
        ->values()
        ->all();

    get("/{$slug}")->assertInertia(fn(AssertableInertia $page) => $page
        ->where('comparisons', fn($comparisons): bool => collect($comparisons)->pluck('path')->all() === $expected));
})->with([
    'a page with Other tools' => ['postgresql-client', 'postgresql'],
    'a page without' => ['sqlite-client', 'sqlite'],
]);
