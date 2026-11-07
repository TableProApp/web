<?php

use App\Support\Content\Slugs\FeatureSlugs;
use App\Support\Features\FeatureFacts;
use App\Support\Localization\Locales;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;

function featuresData(string $file): array
{
    return json_decode(File::get(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

function featuresPublishedEngines(callable $test): array
{
    return collect(featuresData('engines.json'))
        ->filter(fn(array $engine): bool => $engine['state'] === 'published' && $test($engine))
        ->pluck('name')
        ->values()
        ->all();
}

function featuresFactItems(string $name, string $field = 'name'): array
{
    return array_column((new FeatureFacts())->all()[$name]['items'], $field);
}

function featuresParts(array $content): array
{
    return [...$content['bands'], ...$content['more']];
}

// Every id a feature page answers to: its bands' and list items' own, the ids they replaced, and the template's.
function featuresIds(array $content): array
{
    return [
        'top', 'more', 'get-started',
        ...array_merge(...array_map(fn(array $part): array => [$part['id'], ...($part['also'] ?? [])], featuresParts($content))),
    ];
}

it('renders the hub with the feature pages that exist in its language', function (string $prefix, string $locale): void {
    $pages = array_values(array_filter(FeatureSlugs::ALL, fn(string $slug): bool => File::exists(resource_path("data/content/{$locale}/features/{$slug}.json"))));

    get("{$prefix}/features")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('areas', fn($areas): bool => collect($areas)->pluck('slug')->all() === $pages)
            ->where('areas.0.bands', fn($bands): bool => collect($bands)->pluck('id')->all() === array_column(featuresData("content/{$locale}/features/{$pages[0]}.json")['bands'], 'id')));
})->with([['', 'en'], ['/vi', 'vi']]);

it('sends a feature page the facts its copy names, and only those', function (string $slug): void {
    $named = FeatureFacts::referencedNames(featuresData("content/en/features/{$slug}.json"));

    expect(array_diff($named, array_keys((new FeatureFacts())->all())))->toBe([]);

    get("/features/{$slug}")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('facts', fn($facts): bool => collect($facts)->keys()->sort()->values()->all() === $named));
})->with(FeatureSlugs::ALL);

it('names only facts the server computes on the hub', function (): void {
    expect(array_diff(FeatureFacts::referencedNames(featuresData('content/en/features/index.json')), array_keys((new FeatureFacts())->all())))->toBe([]);
});

it('links, lists, marks and places only what exists', function (string $slug): void {
    $content = featuresData("content/en/features/{$slug}.json");
    $facts = (new FeatureFacts())->all();
    $paid = array_column(featuresData('paid-features.json'), 'id');
    $assets = featuresData('assets.json')['assets'];
    $ids = featuresIds($content);

    expect($ids)->toBe(array_values(array_unique($ids)), "{$slug}: an id is used twice")
        ->and(in_array(['path' => "/features/{$slug}", 'section' => 'top'], $assets[$content['header']['asset']]['usedOn'] ?? [], true))->toBeTrue("{$slug}: the hero window is not placed at #top in assets.json")
        ->and(count($content['bands']))->toBeGreaterThanOrEqual(3)->toBeLessThanOrEqual(5);

    foreach (featuresParts($content) as $part) {
        expect(array_diff($part['paid'] ?? [], $paid))->toBe([], "{$slug}#{$part['id']}: unknown paid feature")
            ->and(trim(implode(' ', $part['text'])))->not->toBe('', "{$slug}#{$part['id']}: no text");

        if (isset($part['where'])) {
            expect(array_keys($part['where']))->toBe(['linux', 'ios'], "{$slug}#{$part['id']}: where names linux and ios")
                ->and(array_diff($part['where'], ['yes', 'partial', 'no']))->toBe([], "{$slug}#{$part['id']}: where is yes, partial or no");
        }

        if (isset($part['asset'])) {
            expect(in_array(['path' => "/features/{$slug}", 'section' => $part['id']], $assets[$part['asset']]['usedOn'] ?? [], true))->toBeTrue("{$slug}#{$part['id']}: {$part['asset']} is not placed here in assets.json");
        }

        foreach ($part['engines'] ?? [] as $list) {
            expect($facts[$list['list']]['kind'] ?? null)->toBe('engines', "{$slug}: {$list['list']} is not an engine list");
        }

        foreach ([...($part['links'] ?? []), ...(isset($part['docs']) ? [['label' => 'docs', 'docs' => $part['docs']]] : [])] as $link) {
            $targets = array_intersect_key($link, array_flip(['href', 'docs', 'account']));

            expect($link['label'] ?? '')->not->toBe('')
                ->and($targets)->toHaveCount(1, "{$slug}: a link has one of href, docs or account");

            foreach (['href', 'docs'] as $key) {
                if (isset($link[$key])) {
                    expect($link[$key])->toMatch('#^/(?!/)#', "{$slug}: {$link[$key]} is not a path");
                }
            }
        }
    }

    foreach ($content['bands'] as $band) {
        expect(isset($band['where']))->toBeTrue("{$slug}#{$band['id']}: a band says where it runs");
    }
})->with(FeatureSlugs::ALL);

it('keeps every language on the English ids, platforms, plans and windows', function (string $slug): void {
    $shape = fn(array $content): array => [
        'asset' => $content['header']['asset'],
        'parts' => array_map(fn(array $part): array => array_intersect_key($part, array_flip(['id', 'also', 'paid', 'where', 'asset', 'docs'])), featuresParts($content)),
    ];
    $english = $shape(featuresData("content/en/features/{$slug}.json"));

    foreach (Locales::codes() as $locale) {
        if (File::exists(resource_path("data/content/{$locale}/features/{$slug}.json"))) {
            expect($shape(featuresData("content/{$locale}/features/{$slug}.json")))->toBe($english, "{$locale}/{$slug}");
        }
    }
})->with(FeatureSlugs::ALL);

it('keeps every link into a feature page landing on an id it still has', function (): void {
    $sources = [
        ...File::allFiles(resource_path('data/content')),
        ...File::allFiles(resource_path('blog')),
        ...File::allFiles(resource_path('js')),
        resource_path('data/redirects.json'),
        app_path('Services/Blog/PostTopics.php'),
    ];
    $ids = [];

    foreach (FeatureSlugs::ALL as $slug) {
        $ids[$slug] = featuresIds(featuresData("content/en/features/{$slug}.json"));
    }

    $pattern = '~features/(' . implode('|', array_map(fn(string $slug): string => preg_quote($slug, '~'), FeatureSlugs::ALL)) . ')#([a-z0-9-]+)~';
    $anchors = 0;

    foreach ($sources as $source) {
        preg_match_all($pattern, File::get((string) $source), $matches, PREG_SET_ORDER);

        foreach ($matches as [$link, $slug, $anchor]) {
            $anchors++;
            expect(in_array($anchor, $ids[$slug], true))->toBeTrue("{$source}: {$link}");
        }
    }

    // paid-features.json names the page and the anchor in two fields.
    foreach (featuresData('paid-features.json') as $feature) {
        $anchors++;
        expect(in_array($feature['page']['anchor'], $ids[basename($feature['page']['path'])] ?? [], true))->toBeTrue("paid-features.json: {$feature['id']}");
    }

    expect($anchors)->toBeGreaterThan(150);
});

it('quotes limits, the device limit and Safe Mode levels from the data files', function (): void {
    $facts = (new FeatureFacts())->all();
    $data = featuresData('facts.json');
    $safeMode = $data['safeMode'];

    expect($facts['rowCap'])->toBe(['kind' => 'number', 'value' => $data['limits']['resultRowCap']['value']])
        ->and($facts['historyDays']['value'])->toBe($data['limits']['historyDaysMac']['value'])
        ->and($facts['filterOperatorCount']['value'])->toBe(count($data['filterOperators']['mac']))
        ->and($facts['deviceLimit'])->toBe(['kind' => 'number', 'value' => featuresData('pricing.json')['license']['deviceLimit']])
        ->and($facts['macSafeModeLevels']['items'])->toBe(array_column($safeMode['mac']['levels'], 'name'))
        ->and($facts['iosSafeModeDefault']['value'])->toBe(array_column($safeMode['ios']['levels'], 'name', 'id')[$safeMode['ios']['default']])
        ->and($facts['linuxSafeModeLevels']['items'])->toBe(array_column($safeMode['linux']['levels'], 'name'))
        ->and($facts['aiProvidersLinux']['items'])->toBe($data['ai']['linux']['providers'])
        ->and($facts['mcpToolCountLinux']['value'])->toBe(count($data['mcp']['linux']['tools']));
});

it('derives every engine list from engines.json capabilities', function (): void {
    $capability = fn(string $name, mixed $value): callable => fn(array $engine): bool => $engine['capabilities'][$name] === $value;

    expect(featuresFactItems('explainDiagram'))->toBe(featuresPublishedEngines($capability('explainView', 'diagram')))
        ->and(featuresFactItems('explainText'))->toBe(featuresPublishedEngines($capability('explainView', 'text')))
        ->and(featuresFactItems('everyStatementWrites'))->toBe(featuresPublishedEngines($capability('readOnlyMode', false)))
        ->and(featuresFactItems('usersRoles'))->toBe(featuresPublishedEngines($capability('usersRoles', true)))
        ->and(featuresFactItems('noImport'))->toBe(featuresPublishedEngines($capability('import', false)))
        ->and(featuresFactItems('otherLanguages'))->toBe(featuresPublishedEngines(fn(array $engine): bool => $engine['queryLanguage'] !== 'SQL'));

    $names = collect(featuresData('engines.json'))->pluck('name', 'id');
    $picker = collect(featuresData('platforms.json')['platforms'])->firstWhere('id', 'ios')['iosEngines'];

    expect(featuresFactItems('iosPicker'))->toBe(array_map(fn(string $id): string => $names[$id], $picker));
});

it('links each listed engine to the page that describes it', function (): void {
    $engines = collect(featuresData('engines.json'))->keyBy('name');

    foreach ((new FeatureFacts())->all() as $name => $fact) {
        foreach ($fact['kind'] === 'engines' ? $fact['items'] : [] as $item) {
            $engine = $engines[$item['name']];

            expect($item['href'])->toBe(match ($engine['page']) {
                'own' => "/{$engine['slug']}",
                'section' => '/' . $engines->firstWhere('id', $engine['parent'])['slug'] . "#{$engine['anchor']}",
                default => "/databases#{$engine['anchor']}",
            }, "{$name}: {$item['name']}");
        }
    }
});

it('labels an engine with its version only while an older Mac build is still served', function (): void {
    $directory = storage_path('framework/testing/feature-facts-' . uniqid());
    File::ensureDirectoryExists($directory);

    $engine = fn(string $id, string $since): array => [
        'id' => $id, 'name' => ucfirst($id), 'page' => 'hub', 'slug' => null, 'parent' => null, 'anchor' => $id,
        'state' => 'published', 'queryLanguage' => 'SQL', 'connectionMode' => 'network', 'sinceAppVersion' => $since,
        'capabilities' => ['explainView' => 'diagram', 'explain' => ['Plan']], 'ios' => ['openable' => false, 'inPicker' => false],
    ];

    File::put("{$directory}/engines.json", json_encode([$engine('older', '0.76.1'), $engine('newer', '0.77.0')]));
    File::put("{$directory}/platforms.json", json_encode(['platforms' => [['id' => 'mac', 'floorVersion' => '0.76.1']]]));
    File::put("{$directory}/facts.json", json_encode([]));

    try {
        expect(array_column((new FeatureFacts($directory))->all()['explainDiagram']['items'], 'since', 'name'))
            ->toBe(['Older' => null, 'Newer' => '0.77.0']);
    } finally {
        File::deleteDirectory($directory);
    }
});

function featuresDocument(string $path): Dom\HTMLDocument
{
    requireSsr();

    return Dom\HTMLDocument::createFromString((string) get($path)->assertOk()->getContent(), LIBXML_NOERROR);
}

it('renders the area nav, the bands in order with the ids they replaced, and one paid sentence', function (string $slug): void {
    bindPlatformsWithLinux('released');
    $content = featuresData("content/en/features/{$slug}.json");
    $labels = featuresData('content/en/features/index.json')['labels'];
    $document = featuresDocument("/features/{$slug}");
    $named = array_merge(...array_map(fn(array $part): array => $part['paid'] ?? [], featuresParts($content)));
    $paid = collect(featuresData('paid-features.json'))->filter(fn(array $feature): bool => in_array($feature['id'], $named, true));

    $bands = array_map(fn(Dom\Element $band): string => $band->getAttribute('id'), iterator_to_array($document->querySelectorAll('main > section:not(#top):not(#more):not(#get-started)')));
    $closing = trim((string) $document->querySelector('#get-started p')?->textContent);

    expect($bands)->toBe(array_column($content['bands'], 'id'))
        ->and($document->querySelector('main > nav a[aria-current="page"]')?->getAttribute('href'))->toBe("/features/{$slug}")
        ->and($document->querySelectorAll('main h1'))->toHaveCount(1);

    foreach (featuresIds($content) as $id) {
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
})->with(FeatureSlugs::ALL)->group('ssr');

it('names Linux where a band runs on it only once Linux is released', function (string $status): void {
    $name = bindPlatformsWithLinux($status)['deviceNames'][0];
    $document = featuresDocument('/features/querying');

    expect(str_contains((string) $document->querySelector('#editor')?->textContent, $name))->toBe($status === 'released')
        ->and((string) $document->querySelector('#explain')?->textContent)->not->toContain($name);
})->with(['released', 'prototype'])->group('ssr');
