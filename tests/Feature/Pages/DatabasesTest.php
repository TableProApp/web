<?php

use App\Http\Controllers\DatabaseController;
use App\Support\Content\EnginePaths;
use App\Support\Content\Slugs\DatabaseSlugs;
use App\Support\Seo\RedirectMap;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use Symfony\Component\HttpKernel\Exception\HttpException;

use function Pest\Laravel\get;

const DATABASES_BANDS = ['connect', 'work', 'schema', 'operate'];

function databasesData(string $file): array
{
    return json_decode((string) file_get_contents(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

function databasesPublished(): Illuminate\Support\Collection
{
    return collect(databasesData('engines.json'))->where('state', 'published')->values();
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

function databasesOpensOnIos(array $engine): bool
{
    return $engine['ios']['inPicker'] || $engine['ios']['openable'];
}

// Every id an engine page answers to, as Databases/Show.tsx renders it with the live platforms.json.
function databasesPageIds(string $slug): array
{
    $content = databasesData("content/en/databases/{$slug}.json");
    $engines = databasesPublished()->keyBy('id');
    $engine = $engines[$content['engine']];

    return [
        'top', 'more', 'get-started', 'move-data',
        ...array_merge(...array_map(fn(array $band): array => [$band['id'], ...($band['also'] ?? [])], $content['bands'])),
        ...array_map(fn(array $member): string => $engines[$member['engine']]['anchor'], $content['family']),
        ...(databasesOpensOnIos($engine) ? ['iphone'] : []),
        ...($engine['limits'] !== [] ? ['limits'] : []),
        ...array_column($content['faq'], 'id'),
        ...($content['otherTools'] !== null ? ['other-tools', ...($content['otherTools']['also'] ?? [])] : []),
    ];
}

// Every id the hub answers to with Linux and the iPhone and iPad app released.
function databasesHubIds(): array
{
    $engines = databasesPublished();

    return [
        'top', 'more', 'get-started', 'drivers', 'linux', 'iphone', 'missing',
        ...array_keys(DatabaseController::GROUPS),
        ...array_merge(...array_values(DatabaseController::GROUPS)),
        ...$engines->where('page', 'hub')->pluck('anchor')->all(),
    ];
}

function databasesDocument(string $path): Dom\HTMLDocument
{
    requireSsr();

    return Dom\HTMLDocument::createFromString((string) get($path)->assertOk()->getContent(), LIBXML_NOERROR);
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

it('puts every category in one hub band, each band titled', function (): void {
    $categories = array_merge(...array_values(DatabaseController::GROUPS));
    $titles = databasesData('content/en/databases/index.json')['groups'];

    expect($categories)->toBe(array_values(array_unique($categories)))
        ->and($categories)->toEqualCanonicalizing(databasesPublished()->pluck('category')->unique()->values()->all())
        ->and(array_keys($titles))->toBe(array_keys(DatabaseController::GROUPS));

    foreach (DatabaseController::GROUPS as $id => $members) {
        $count = databasesPublished()->whereIn('category', $members)->count();

        expect($count > 2 || count($members) === 1)->toBeTrue("{$id}: a merged band should hold more than two engines")
            ->and($count)->toBeGreaterThan(0, "{$id} lists no engine");
    }
});

it('sends the hub every published engine once, with its tagline', function (string $path): void {
    $published = databasesPublished()->pluck('id')->all();

    get($path)
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('engines', fn($engines): bool => collect($engines)->pluck('id')->all() === $published)
            ->where('taglines', fn($taglines): bool => collect($taglines)->keys()->all() === $published && collect($taglines)->every(fn(string $tagline): bool => $tagline !== ''))
            ->where('groups', fn($groups): bool => collect($groups)->pluck('id')->all() === array_keys(DatabaseController::GROUPS)));
})->with(['/databases', '/vi/databases']);

it('fills each engine page only with tokens, tags and links the data has', function (string $slug): void {
    $copy = databasesData("content/en/databases/{$slug}.json");
    $engines = databasesPublished()->keyBy('id');
    $assets = databasesData('assets.json')['assets'];
    $tiers = array_map(
        fn(array $feature): string => lcfirst(str_replace(' ', '', ucwords(str_replace('-', ' ', $feature['id'])))) . 'Tier',
        databasesData('paid-features.json'),
    );
    $engine = $engines->get($copy['engine']);
    $hero = $assets[$copy['header']['asset']] ?? null;
    $members = $engines->filter(fn(array $candidate): bool => $candidate['page'] === 'section' && $candidate['parent'] === $engine['id'])->pluck('id')->values()->all();
    $bands = array_column($copy['bands'], 'id');
    $ids = databasesPageIds($slug);
    $used = [];

    expect($engine['slug'] ?? null)->toBe($slug)
        ->and($copy['header']['asset'])->toBe("databases-{$engine['id']}")
        ->and($hero['kind'] ?? null)->toBe('window-whole')
        ->and(in_array(['path' => "/{$slug}", 'section' => 'top'], $hero['usedOn'] ?? [], true))->toBeTrue("{$slug}: the window is not placed at #top in assets.json")
        ->and($bands)->toBe(array_values(array_intersect(DATABASES_BANDS, $bands)), "{$slug}: bands come from connect, work, schema, operate, in that order")
        ->and(count($bands))->toBeGreaterThanOrEqual(2)->toBeLessThanOrEqual(4)
        ->and(array_column($copy['family'], 'engine'))->toBe($members, "{$slug}: one family band per section engine, in engines.json order")
        ->and($copy['iphone'] === [] || databasesOpensOnIos($engine))->toBeTrue("{$slug}: iPhone copy for an engine that does not open there")
        ->and($ids)->toBe(array_values(array_unique($ids)), "{$slug}: an id is used twice");

    foreach ($copy['bands'] as $band) {
        expect(array_diff($band['also'] ?? [], DATABASES_BANDS))->toBe([], "{$slug}#{$band['id']}: also names an unknown band");
    }

    foreach ([...array_column($copy['faq'], 'id'), ...($copy['otherTools']['also'] ?? [])] as $id) {
        expect($id)->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/');
    }

    foreach ($copy['links'] as $target) {
        if (! str_starts_with($target, 'docs:/') && ! str_starts_with($target, '#')) {
            expect(databasesIsSitePage($target))->toBeTrue("{$slug}: {$target} is not a site page");
        }
    }

    foreach (Arr::dot($copy) as $path => $text) {
        if (! is_string($text)) {
            continue;
        }

        $allowed = match (true) {
            $path === 'seo.title' => ['devices', 'macDevices'],
            str_starts_with($path, 'family.') => databasesTokens($engines->get($copy['family'][(int) explode('.', $path)[1]]['engine']), $tiers),
            default => databasesTokens($engine, $tiers),
        };

        preg_match_all('/\{([A-Za-z][A-Za-z0-9_.]*)\}/', $text, $tokens);
        preg_match_all('/<\/?([a-zA-Z][a-zA-Z0-9]*)>/', $text, $tags);
        $used = [...$used, ...$tags[1]];

        expect(array_diff($tokens[1], $allowed))->toBe([], "{$slug} {$path}: a token the data cannot fill")
            ->and(array_diff($tags[1], ['ui', 'code', ...array_keys($copy['links'])]))->toBe([], "{$slug} {$path}: an unknown tag")
            ->and(str_contains($text, '—'))->toBeFalse("{$slug} {$path}: an em dash");
    }

    expect(array_diff(array_keys($copy['links']), $used))->toBe([], "{$slug}: a link no sentence uses");
})->with(DatabaseSlugs::ALL);

it('keeps every link into a database page landing on an id it still has', function (): void {
    $sources = [
        ...File::allFiles(resource_path('data/content')),
        ...File::allFiles(resource_path('blog')),
        ...File::allFiles(resource_path('js')),
        resource_path('data/redirects.json'),
    ];
    $ids = ['databases' => databasesHubIds()];

    foreach (DatabaseSlugs::ALL as $slug) {
        $ids[$slug] = databasesPageIds($slug);
    }

    $pattern = '~/(' . implode('|', array_map(fn(string $page): string => preg_quote($page, '~'), array_keys($ids))) . ')#([a-z0-9-]+)~';
    $anchors = 0;

    foreach ($sources as $source) {
        preg_match_all($pattern, File::get((string) $source), $matches, PREG_SET_ORDER);

        foreach ($matches as [$link, $page, $anchor]) {
            $anchors++;
            expect(in_array($anchor, $ids[$page], true))->toBeTrue("{$source}: {$link}");
        }
    }

    // Engine lists, the iOS page and the `/databases/{docsSlug}` redirects link every engine through EnginePaths.
    $byId = EnginePaths::byId(databasesData('engines.json'));

    foreach (databasesPublished() as $engine) {
        $path = (string) EnginePaths::pathFor($engine, $byId);

        if (str_contains($path, '#')) {
            $anchors++;
            [$page, $anchor] = explode('#', ltrim($path, '/'));
            expect(in_array($anchor, $ids[$page] ?? [], true))->toBeTrue("engines.json: {$engine['id']} → {$path}");
        }
    }

    expect($anchors)->toBeGreaterThan(20);
});

it('leaves a format out of an engine’s imports when its plugin refuses that engine', function (): void {
    get('/mongodb-client')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('engine.formats.import', fn($formats): bool => collect($formats)->contains('JSON') && ! collect($formats)->contains('SQL')));
    get('/postgresql-client')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('engine.formats.import', fn($formats): bool => collect($formats)->contains('SQL')));
});

it('sends the hub the Linux app only once it is released', function (string $status): void {
    $linux = bindPlatformsWithLinux($status);

    get('/databases')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('engines', fn($sent): bool => collect($sent)->pluck('linux')->all() === databasesPublished()->pluck('linux.support')->all())
        ->where('platforms.linux', $status === 'released' ? ['deviceNames' => $linux['deviceNames']] : null));
})->with(['released', 'prototype']);

it('renders an engine page as hero, bands, family, Also and one closing line, with no platform row', function (string $slug): void {
    $content = databasesData("content/en/databases/{$slug}.json");
    $labels = databasesData('content/en/databases/index.json')['labels'];
    $document = databasesDocument("/{$slug}");
    $terms = array_map(fn(Dom\Element $term): string => trim((string) $term->textContent), iterator_to_array($document->querySelectorAll('#top dl dt')));
    $sections = array_map(fn(Dom\Element $section): string => $section->getAttribute('id'), iterator_to_array($document->querySelectorAll('main > section')));
    $engine = databasesPublished()->firstWhere('slug', $slug);
    $paid = collect(databasesData('paid-features.json'))->filter(fn(array $feature): bool => str_contains(json_encode($content, JSON_UNESCAPED_UNICODE), '{' . lcfirst(str_replace(' ', '', ucwords(str_replace('-', ' ', $feature['id'])))) . 'Tier}'));
    $closing = trim((string) $document->querySelector('#get-started p')?->textContent);

    expect($document->querySelectorAll('main h1'))->toHaveCount(1)
        ->and($document->querySelector('#top nav [aria-current="page"]')?->textContent)->toBe($content['breadcrumb'])
        ->and(array_diff($terms, array_values($labels['facts'])))->toBe([], "{$slug}: a facts row that is not a fact")
        ->and($sections)->toBe(['top', ...array_column($content['bands'], 'id'), ...array_map(fn(array $member): string => databasesPublished()->firstWhere('id', $member['engine'])['anchor'], $content['family']), 'more', 'get-started'])
        ->and($document->querySelector('a[href="/download#linux"]'))->toBeNull()
        ->and($document->querySelector('[id="iphone"]') !== null)->toBe(databasesOpensOnIos($engine));

    foreach (databasesPageIds($slug) as $id) {
        expect($document->getElementById($id))->not->toBeNull("{$slug}: #{$id} is missing");
    }

    if ($paid->isEmpty()) {
        expect($closing)->toBe($labels['closing']['allFree']);
    } else {
        expect($closing)->toEndWith($labels['closing']['rest']);

        foreach ($paid as $feature) {
            expect($closing)->toContain($feature['name']);
        }
    }
})->with(DatabaseSlugs::ALL)->group('ssr');

it('renders the hub as one band per category with every engine once, and Linux only once released', function (string $status): void {
    bindPlatformsWithLinux($status);
    $document = databasesDocument('/databases');
    $rows = iterator_to_array($document->querySelectorAll('main section[data-reveal] li'));
    $bands = array_map(fn(Dom\Element $section): string => $section->getAttribute('id'), iterator_to_array($document->querySelectorAll('main section[data-reveal]')));

    expect($document->querySelector('main > nav a[aria-current="page"]')?->getAttribute('href'))->toBe('/databases')
        ->and($bands)->toBe(array_keys(DatabaseController::GROUPS))
        ->and($rows)->toHaveCount(databasesPublished()->count())
        ->and($document->getElementById('linux') !== null)->toBe($status === 'released')
        ->and($document->querySelector('a[href="/download#linux"]') !== null)->toBe($status === 'released');

    foreach (array_diff(databasesHubIds(), $status === 'released' ? [] : ['linux']) as $id) {
        expect($document->getElementById($id))->not->toBeNull("/databases: #{$id} is missing");
    }

    foreach (databasesPublished()->where('page', 'hub') as $engine) {
        expect($document->getElementById($engine['anchor'])?->textContent)->toContain($engine['name']);
    }
})->with(['released', 'prototype'])->group('ssr');
