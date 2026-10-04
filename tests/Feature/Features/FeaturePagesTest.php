<?php

use App\Support\Content\Slugs\FeatureSlugs;
use App\Support\Features\FeatureFacts;
use Dom\HTMLDocument;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/**
 * The feature hub and the feature pages (sitemap §A.2, §E.4, §E.8;
 * design-system §8.2): what the controller sends, the facts it computes from
 * the data files, and what a reader receives once the page is rendered.
 */
beforeEach(function (): void {
    withoutVite();
});

/**
 * @return array<string, mixed>
 */
function featurePagesData(string $file): array
{
    return json_decode(File::get(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * Engine names from engines.json for which `$test` holds, in data order: the
 * expectation is derived from the file, never typed.
 *
 * @param  callable(array<string, mixed>): bool  $test
 * @return list<string>
 */
function featurePagesEngineNames(callable $test): array
{
    return collect(featurePagesData('engines.json'))
        ->filter(fn(array $engine): bool => $engine['state'] === 'published' && $test($engine))
        ->pluck('name')
        ->values()
        ->all();
}

/**
 * @return list<string>
 */
function featurePagesFactItems(string $kind, string $name): array
{
    return array_column((new FeatureFacts())->all()[$name]['items'], $kind);
}

it('renders the hub in both languages with only the pages that exist', function (string $prefix, string $locale): void {
    $hub = featurePagesData("content/{$locale}/features/index.json");
    $pages = array_values(array_filter(FeatureSlugs::ALL, fn(string $slug): bool => File::exists(resource_path("data/content/{$locale}/features/{$slug}.json"))));

    get("{$prefix}/features")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Features/Index')
            ->where('locale', $locale)
            ->where('content.header.title', $hub['header']['title'])
            ->where('pages', $pages)
            ->where('facts.importFormats.kind', 'names')
            ->where('facts.importFormats.items', array_column(featurePagesData('facts.json')['dataImport']['formats'], 'name')));
})->with([['', 'en'], ['/vi', 'vi']]);

it('renders each feature page with its copy, the shared labels and only the facts it names', function (string $prefix, string $locale, string $slug): void {
    $content = featurePagesData("content/{$locale}/features/{$slug}.json");
    $labels = featurePagesData("content/{$locale}/features/index.json")['labels'];
    $named = FeatureFacts::referencedNames($content);

    get("{$prefix}/features/{$slug}")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Features/Show')
            ->where('locale', $locale)
            ->where('slug', $slug)
            ->where('content.header.title', $content['header']['title'])
            ->where('content.sections', $content['sections'])
            ->where('labels.tiers', $labels['tiers'])
            ->where('facts', fn($facts): bool => collect($facts)->keys()->sort()->values()->all() === $named));
})->with(function (): array {
    $cases = [];

    foreach (FeatureSlugs::ALL as $slug) {
        $cases["en {$slug}"] = ['', 'en', $slug];
        $cases["vi {$slug}"] = ['/vi', 'vi', $slug];
    }

    return $cases;
});

it('answers 404 for a slug that is not a feature page', function (): void {
    get('/features/not-a-feature')->assertNotFound();
    get('/vi/features/not-a-feature')->assertNotFound();
});

it('quotes the limits from facts.json', function (): void {
    $limits = featurePagesData('facts.json')['limits'];
    $facts = (new FeatureFacts())->all();

    expect($facts['rowCap'])->toBe(['kind' => 'number', 'value' => $limits['resultRowCap']['value']]);
    expect($facts['rowCapMax'])->toBe(['kind' => 'number', 'value' => $limits['resultRowCap']['max']]);
    expect($facts['historyEntries']['value'])->toBe($limits['historyEntriesMac']['value']);
    expect($facts['historyDays']['value'])->toBe($limits['historyDaysMac']['value']);
    expect($facts['rewindDays']['value'])->toBe($limits['rewindDays']['value']);
    expect($facts['rewindMaxValue']['value'])->toBe($limits['rewindMaxValue']['value']);
    expect($facts['explainNoise']['value'])->toBe($limits['explainNoise']['value']);
    expect($facts['filterOperatorCount']['value'])->toBe(count(featurePagesData('facts.json')['filterOperators']['mac']));
});

it('quotes how often a Mac confirms its license from pricing.json', function (): void {
    // A removed Team member's Mac keeps the paid features until this check (docs/features/team.mdx @v0.77.0).
    expect((new FeatureFacts())->all()['licenseCheckDays'])
        ->toBe(['kind' => 'number', 'value' => featurePagesData('pricing.json')['license']['revalidateDays']]);
});

it('names the Safe Mode levels and defaults from facts.json', function (): void {
    $safeMode = featurePagesData('facts.json')['safeMode'];
    $facts = (new FeatureFacts())->all();

    expect($facts['macSafeModeLevels'])->toBe(['kind' => 'names', 'items' => array_column($safeMode['mac']['levels'], 'name')]);
    expect($facts['iosSafeModeLevels'])->toBe(['kind' => 'names', 'items' => array_column($safeMode['ios']['levels'], 'name')]);
    expect($facts['macSafeModeDefault'])->toBe(['kind' => 'text', 'value' => array_column($safeMode['mac']['levels'], 'name', 'id')[$safeMode['mac']['default']]]);
    expect($facts['iosSafeModeDefault'])->toBe(['kind' => 'text', 'value' => array_column($safeMode['ios']['levels'], 'name', 'id')[$safeMode['ios']['default']]]);
});

it('computes every engine list from engines.json capabilities', function (): void {
    $capability = fn(string $name, mixed $value): callable => fn(array $engine): bool => $engine['capabilities'][$name] === $value;

    expect(featurePagesFactItems('name', 'explainDiagram'))->toBe(featurePagesEngineNames($capability('explainView', 'diagram')));
    expect(featurePagesFactItems('name', 'explainText'))->toBe(featurePagesEngineNames($capability('explainView', 'text')));
    expect(featurePagesFactItems('name', 'explainCost'))->toBe(featurePagesEngineNames($capability('explainView', 'cost')));
    expect(featurePagesFactItems('name', 'explainNoneSql'))->toBe(featurePagesEngineNames(fn(array $engine): bool => $engine['capabilities']['explain'] === [] && $engine['queryLanguage'] === 'SQL'));
    expect(featurePagesFactItems('name', 'everyStatementWrites'))->toBe(featurePagesEngineNames($capability('readOnlyMode', false)));
    expect(featurePagesFactItems('name', 'usersRoles'))->toBe(featurePagesEngineNames($capability('usersRoles', true)));
    expect(featurePagesFactItems('name', 'noImport'))->toBe(featurePagesEngineNames($capability('import', false)));

    $other = featurePagesEngineNames(fn(array $engine): bool => $engine['queryLanguage'] !== 'SQL');
    expect(featurePagesFactItems('name', 'otherLanguages'))->toBe($other);
    expect(featurePagesFactItems('detail', 'otherLanguages'))->toBe(
        collect(featurePagesData('engines.json'))->filter(fn(array $engine): bool => $engine['state'] === 'published' && $engine['queryLanguage'] !== 'SQL')->pluck('queryLanguage')->values()->all(),
    );

    $iosOrder = collect(featurePagesData('platforms.json')['platforms'])->firstWhere('id', 'ios')['iosEngines'];
    $names = collect(featurePagesData('engines.json'))->pluck('name', 'id');
    expect(featurePagesFactItems('name', 'iosPicker'))->toBe(array_map(fn(string $id): string => $names[$id], $iosOrder));
});

it('links each engine to the page that describes it', function (): void {
    $engines = collect(featurePagesData('engines.json'))->keyBy('name');

    foreach ((new FeatureFacts())->all() as $name => $fact) {
        if ($fact['kind'] !== 'engines') {
            continue;
        }

        foreach ($fact['items'] as $item) {
            $engine = $engines[$item['name']];
            $expected = match ($engine['page']) {
                'own' => "/{$engine['slug']}",
                'section' => '/' . $engines->firstWhere('id', $engine['parent'])['slug'] . "#{$engine['anchor']}",
                default => "/databases#{$engine['anchor']}",
            };

            expect($item['href'])->toBe($expected, "{$name}: {$item['name']}");
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
        $items = (new FeatureFacts($directory))->all()['explainDiagram']['items'];

        expect(array_column($items, 'since', 'name'))->toBe(['Older' => null, 'Newer' => '0.77.0']);
    } finally {
        File::deleteDirectory($directory);
    }
});

it('server-renders every section, slot and fact of a feature page', function (string $path, string $slug): void {
    $html = ssrHtml($path);
    $document = HTMLDocument::createFromString($html, LIBXML_NOERROR);
    $main = $document->querySelector('main');
    $locale = str_starts_with($path, '/vi') ? 'vi' : 'en';
    $content = featurePagesData("content/{$locale}/features/{$slug}.json");

    expect($main)->not->toBeNull();

    foreach ($content['sections'] as $section) {
        expect($document->getElementById($section['id']))->not->toBeNull("#{$section['id']} is missing");

        foreach ([$section, ...($section['blocks'] ?? [])] as $block) {
            if (isset($block['asset'])) {
                expect($main->querySelector(renderedSlotSelector($block['asset'], $locale)))->not->toBeNull("{$block['asset']} is not rendered");
            }
        }
    }

    foreach (['availability', 'docs', 'related', 'get-started'] as $id) {
        expect($document->getElementById($id))->not->toBeNull("#{$id} is missing");
    }

    expect($main->textContent)->not->toMatch('/\{[A-Za-z][A-Za-z0-9_.]*\}/', 'A {token} reached the page unfilled');
    expect($main->querySelectorAll('[data-asset-status="placeholder"] img')->length)->toBe(0);
})->with(function (): array {
    $cases = [];

    foreach (FeatureSlugs::ALL as $slug) {
        $cases["en {$slug}"] = ["/features/{$slug}", $slug];
        $cases["vi {$slug}"] = ["/vi/features/{$slug}", $slug];
    }

    return $cases;
});

it('renders every paid feature anchor the pricing page links to', function (): void {
    foreach (featurePagesData('paid-features.json') as $feature) {
        $slug = basename($feature['page']['path']);

        if (! File::exists(resource_path("data/content/en/features/{$slug}.json"))) {
            continue;
        }

        $document = HTMLDocument::createFromString(ssrHtml($feature['page']['path']), LIBXML_NOERROR);

        expect($document->getElementById($feature['page']['anchor']))->not->toBeNull("{$feature['page']['path']}#{$feature['page']['anchor']}");
    }
});

it('labels the English-only docs on Vietnamese pages', function (): void {
    $document = HTMLDocument::createFromString(ssrHtml('/vi/features/querying'), LIBXML_NOERROR);
    $docs = $document->querySelectorAll('#docs a');

    expect($docs->length)->toBeGreaterThan(0);

    foreach ($docs as $link) {
        expect($link->getAttribute('hreflang'))->toBe('en');
        expect($link->getAttribute('href'))->toStartWith(featurePagesData('facts.json')['links']['docs'] . '/');
        expect($link->textContent)->toContain('(tiếng Anh)');
    }
});

it('describes the page in structured data with breadcrumbs that match the visible ones', function (): void {
    $document = HTMLDocument::createFromString(ssrHtml('/features/data-editing'), LIBXML_NOERROR);
    $graph = null;

    foreach ($document->querySelectorAll('script[type="application/ld+json"]') as $script) {
        $decoded = json_decode($script->textContent, true);

        if (is_array($decoded) && isset($decoded['@graph'])) {
            $graph = $decoded['@graph'];
        }
    }

    expect($graph)->toBeArray();

    $types = array_column($graph, '@type');
    expect($types)->toContain('Organization')->toContain('WebPage')->toContain('BreadcrumbList');

    $page = collect($graph)->firstWhere('@type', 'WebPage');
    expect($page['about']['@id'])->toEndWith('/#app');
    expect($page['inLanguage'])->toBe('en');

    $crumbs = collect($graph)->firstWhere('@type', 'BreadcrumbList')['itemListElement'];
    expect(array_column($crumbs, 'name'))->toBe(['Features', 'Data editing']);
    expect(end($crumbs)['item'])->toEndWith('/features/data-editing');
});
