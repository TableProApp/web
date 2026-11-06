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

function featuresBlocks(array $content): array
{
    $blocks = [];

    foreach ($content['sections'] as $section) {
        $blocks[] = $section;
        array_push($blocks, ...($section['blocks'] ?? []));
    }

    return $blocks;
}

it('renders the hub with the feature pages that exist in its language', function (string $prefix, string $locale): void {
    $pages = array_values(array_filter(FeatureSlugs::ALL, fn(string $slug): bool => File::exists(resource_path("data/content/{$locale}/features/{$slug}.json"))));

    get("{$prefix}/features")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page->where('pages', $pages));
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

it('links, lists and marks only what exists', function (string $slug): void {
    $content = featuresData("content/en/features/{$slug}.json");
    $facts = (new FeatureFacts())->all();
    $paid = array_column(featuresData('paid-features.json'), 'id');
    $links = [...$content['docs'], ...$content['related']];

    foreach (featuresBlocks($content) as $block) {
        expect(array_diff($block['paid'] ?? [], $paid))->toBe([], "{$slug}: unknown paid feature");

        foreach ($block['engines'] ?? [] as $list) {
            expect($facts[$list['list']]['kind'] ?? null)->toBe('engines', "{$slug}: {$list['list']} is not an engine list");
        }

        array_push($links, ...($block['links'] ?? []));
    }

    foreach ($links as $link) {
        $targets = array_intersect_key($link, array_flip(['href', 'docs', 'account']));

        expect($link['label'] ?? '')->not->toBe('')
            ->and($targets)->toHaveCount(1, "{$slug}: a link has one of href, docs or account");

        if (isset($link['href'])) {
            expect($link['href'])->toMatch('#^/(?!/)#', "{$slug}: {$link['href']} is not a path on this site");
        }
    }
})->with(FeatureSlugs::ALL);

it('marks each availability row on Linux the same in every language', function (string $slug): void {
    $english = featuresData("content/en/features/{$slug}.json")['availability'];
    $paidPlatforms = array_column(featuresData('paid-features.json'), 'platforms', 'id');

    foreach (Locales::codes() as $locale) {
        $path = "content/{$locale}/features/{$slug}.json";

        if (! File::exists(resource_path("data/{$path}"))) {
            continue;
        }

        $rows = featuresData($path)['availability'];

        expect(array_column($rows, 'linux'))->toBe(array_column($english, 'linux'), "{$locale}/{$slug}: a row's Linux value differs from English");

        foreach ($rows as $index => $row) {
            $where = "{$locale}/{$slug} availability.{$index}";

            expect($row['linux'] ?? null)->toBeIn(['yes', 'partial', 'no'], "{$where}.linux")
                ->and(array_key_exists('linuxNote', $row))->toBe($row['linux'] === 'partial', "{$where}: linuxNote exactly when partial");

            if (array_key_exists('linuxNote', $row)) {
                expect(trim($row['linuxNote']))->not->toBe('', "{$where}.linuxNote");
            }

            if (isset($row['paid']) && ! in_array('linux', $paidPlatforms[$row['paid']], true)) {
                expect($row['linux'])->toBe('no', "{$where}: {$row['paid']} is not in the Linux app");
            }
        }
    }
})->with(FeatureSlugs::ALL);

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

function featuresBadges(Dom\HTMLDocument $document): array
{
    return array_map(fn(Dom\Element $badge): string => trim((string) $badge->textContent), iterator_to_array($document->querySelectorAll('span.rounded-chip')));
}

it('sends a feature page the Linux record only once Linux is released', function (string $status): void {
    $linux = bindPlatformsWithLinux($status);

    get('/features/querying')->assertInertia(fn(AssertableInertia $page) => $status === 'released'
        ? $page->where('linux.deviceNames', $linux['deviceNames'])->where('linux.channel', $linux['channel'])->where('linux.distributions', fn($distributions): bool => count($distributions) === count($linux['distributions']))
        : $page->where('linux', null));
})->with(['released', 'prototype']);

it('gives Where it works a Linux column that follows each row, and a Linux badge where a row is on Linux', function (string $slug): void {
    $name = bindPlatformsWithLinux('released')['deviceNames'][0];
    $rows = featuresData("content/en/features/{$slug}.json")['availability'];
    $labels = featuresData('content/en/features/index.json')['labels']['availability'];
    $document = featuresDocument("/features/{$slug}");

    $heads = array_map(fn(Dom\Element $head): string => trim((string) $head->textContent), iterator_to_array($document->querySelectorAll('#availability thead th')));
    $cells = array_map(fn(Dom\Element $row): string => trim((string) $row->querySelector('td:last-child')?->textContent), iterator_to_array($document->querySelectorAll('#availability tbody tr')));

    expect($heads)->toHaveCount(4)
        ->and(end($heads))->toBe($name)
        ->and($cells)->toHaveCount(count($rows))
        ->and($document->querySelectorAll('#availability tbody th span.grid > span'))->toHaveCount(3 * count($rows))
        ->and(in_array($name, featuresBadges($document), true))->toBe(collect($rows)->contains(fn(array $row): bool => $row['linux'] !== 'no'));

    foreach ($rows as $index => $row) {
        match ($row['linux']) {
            'yes' => expect($cells[$index])->toBe($labels['free'], "{$slug} row {$index}"),
            'no' => expect($cells[$index])->toStartWith($labels['notAvailable'], "{$slug} row {$index}"),
            'partial' => expect($cells[$index])->not->toBe($labels['free'])->not->toStartWith($labels['notAvailable']),
        };
    }
})->with(FeatureSlugs::ALL)->group('ssr');

it('shows no Linux column or badge while Linux is not released', function (): void {
    $name = bindPlatformsWithLinux('prototype')['deviceNames'][0];
    $document = featuresDocument('/features/querying');

    expect($document->querySelectorAll('#availability thead th'))->toHaveCount(3)
        ->and(featuresBadges($document))->not->toContain($name)
        ->and((string) $document->querySelector('#availability table')?->textContent)->not->toContain($name);
})->group('ssr');
