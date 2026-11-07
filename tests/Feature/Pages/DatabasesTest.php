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

function databasesDocument(string $path): Dom\HTMLDocument
{
    requireSsr();

    return Dom\HTMLDocument::createFromString((string) get($path)->assertOk()->getContent(), LIBXML_NOERROR);
}

function databasesPublished(): Illuminate\Support\Collection
{
    return collect(databasesData('engines.json'))->where('state', 'published')->values();
}

function databasesWorksOn(Dom\HTMLDocument $document): string
{
    $prefix = explode('{devices}', databasesData('content/en/databases/index.json')['labels']['availability']['devices'])[0];

    foreach ($document->querySelectorAll('header p') as $line) {
        if (str_contains((string) $line->textContent, $prefix)) {
            return (string) $line->textContent;
        }
    }

    return '';
}

function databasesFacts(Dom\HTMLDocument $document): array
{
    $facts = [];

    foreach ($document->querySelectorAll('header dl dt') as $term) {
        $facts[trim((string) $term->textContent)] = trim((string) $term->nextElementSibling?->textContent);
    }

    return $facts;
}

it('sends every engine its Linux support from engines.json, and Linux itself only once released', function (string $status): void {
    $linux = bindPlatformsWithLinux($status);
    $engines = databasesPublished();

    get('/databases')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('engines', fn($sent): bool => collect($sent)->pluck('linux')->all() === $engines->map(fn(array $engine): array => [
            'support' => $engine['linux']['support'],
            'tested' => $engine['linux']['support'] === 'tested' ? $engine['linux']['tested'] : [],
        ])->all())
        ->where('platforms.linux', $status === 'released' ? ['deviceNames' => $linux['deviceNames'], 'channel' => $linux['channel'], 'distributions' => $linux['distributions']] : null));
})->with(['released', 'prototype']);

it('states an engine’s Linux support in its header, its facts and its download band', function (string $support): void {
    $name = bindPlatformsWithLinux('released')['deviceNames'][0];
    $engine = databasesPublished()->first(fn(array $engine): bool => $engine['page'] === 'own' && $engine['linux']['support'] === $support);
    $labels = databasesData('content/en/databases/index.json')['labels']['linux'];
    $document = databasesDocument("/{$engine['slug']}");

    expect(databasesFacts($document)[$name] ?? null)->toBe(match ($support) {
        'tested' => str_replace('{versions}', implode(', ', $engine['linux']['tested']), $labels['versions']),
        'untested' => $labels['untested'],
        default => $labels['none'],
    })
        ->and(str_contains(databasesWorksOn($document), $name))->toBe($support === 'tested')
        ->and($support !== 'tested' || ! str_contains(databasesWorksOn($document), 'iPhone') || strpos(databasesWorksOn($document), $name) < strpos(databasesWorksOn($document), 'iPhone'))->toBeTrue()
        ->and(array_search($name, array_keys(databasesFacts($document)), true))->toBeLessThan(array_search(databasesData('content/en/databases/index.json')['labels']['facts']['ios'], array_keys(databasesFacts($document)), true))
        ->and($document->querySelector('#get-tablepro a[href="/download#linux"]') !== null)->toBe($support === 'tested');
})->with(['tested', 'untested', 'blocked', 'none'])->group('ssr');

it('gives the hub a Linux column before the iPhone one, and a Linux section before the iPhone one that names the engines tested on Linux', function (): void {
    $name = bindPlatformsWithLinux('released')['deviceNames'][0];
    $hub = databasesData('content/en/databases/index.json');
    $engines = databasesPublished();
    $names = fn(array $support): array => $engines->filter(fn(array $engine): bool => in_array($engine['linux']['support'], $support, true))->pluck('name')->all();
    $list = fn(array $items): string => count($items) > 1 ? implode(', ', array_slice($items, 0, -1)) . ' and ' . end($items) : implode('', $items);
    $document = databasesDocument('/databases');

    $cells = array_count_values(array_map(
        fn(Dom\Element $row): string => trim((string) $row->querySelectorAll('td')->item(2)?->textContent),
        iterator_to_array($document->querySelectorAll('section table tbody tr')),
    ));
    $section = (string) $document->getElementById('linux')?->textContent;
    $linuxHeads = array_filter(iterator_to_array($document->querySelectorAll('section table thead th:nth-child(4)')), fn(Dom\Element $head): bool => trim((string) $head->textContent) === $name);
    $sections = array_map(fn(Dom\Element $section): string => (string) $section->getAttribute('id'), iterator_to_array($document->querySelectorAll('main section[id]')));

    expect($linuxHeads)->toHaveCount($document->querySelectorAll('section table')->length)
        ->and($cells[$hub['labels']['linux']['tested']] ?? 0)->toBe(count($names(['tested'])))
        ->and($cells[$hub['labels']['linux']['untested']] ?? 0)->toBe(count($names(['untested'])))
        ->and($cells[$hub['labels']['linux']['none']] ?? 0)->toBe(count($names(['blocked', 'none'])))
        ->and($section)->toContain(str_replace('{engines}', $list($names(['tested'])), $hub['linux']['tested']))
        ->and($section)->toContain(str_replace('{engines}', $list($names(['untested'])), $hub['linux']['untested']))
        ->and(array_search('linux', $sections, true))->toBeLessThan(array_search('iphone', $sections, true))
        ->and($document->querySelector('#linux a[href="/download#linux"]'))->not->toBeNull()
        ->and($document->querySelector('#get-tablepro a[href="/download#linux"]'))->not->toBeNull();
})->group('ssr');

it('leaves Linux off the engine pages and the hub until it is released', function (): void {
    $name = bindPlatformsWithLinux('prototype')['deviceNames'][0];
    $engine = databasesPublished()->first(fn(array $engine): bool => $engine['page'] === 'own' && $engine['linux']['support'] === 'tested');
    $page = databasesDocument("/{$engine['slug']}");
    $hub = databasesDocument('/databases');

    expect(databasesFacts($page))->not->toHaveKey($name)
        ->and(databasesWorksOn($page))->not->toContain($name)
        ->and($page->querySelector('a[href="/download#linux"]'))->toBeNull()
        ->and($hub->getElementById('linux'))->toBeNull()
        ->and($hub->querySelector('a[href="/download#linux"]'))->toBeNull()
        ->and(array_map(fn(Dom\Element $head): string => trim((string) $head->textContent), iterator_to_array($hub->querySelectorAll('section table thead th'))))->not->toContain($name);
})->group('ssr');
