<?php

use App\Http\Controllers\IosController;
use App\Support\Assets\AssetManifest;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;

beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 500), 'github.com/*' => Http::response([], 500)]);
});

function iosData(string $file): array
{
    return json_decode(File::get(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

function iosRelease(): array
{
    return collect(iosData('platforms.json')['platforms'])->firstWhere('id', 'ios');
}

// Every id /ios answers to: its sections, its bands and Also items, and the ids of the sections they replaced.
function iosPageIds(array $content): array
{
    $parts = [...$content['bands'], ...$content['more']['items']];

    return ['top', 'databases', 'more', 'get', ...array_merge(...array_map(fn(array $part): array => [$part['id'], ...($part['also'] ?? [])], $parts))];
}

function iosUpright(array $entry): bool
{
    [$width, $height] = array_map('intval', explode(':', (string) $entry['aspect']));

    return $width < $height;
}

it('sends the release, the engines, the facts and the hero iPad preload, asking GitHub for nothing', function (): void {
    $ios = iosRelease();
    $levels = array_column(iosData('facts.json')['safeMode']['ios']['levels'], 'name');

    get('/ios')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
        ->component('Ios')
        ->where('content', iosData('content/en/ios.json'))
        ->where('ios.appStoreUrl', collect($ios['destinations'])->firstWhere('kind', 'app-store')['url'])
        ->where('ios.requirements.systems', $ios['requirements']['systems'])
        ->where('ios.free', (float) $ios['price']['amount'] === 0.0)
        ->where('ios.inAppPurchases', $ios['price']['inAppPurchases'])
        ->where('engines.picker', fn($engines): bool => collect($engines)->pluck('id')->all() === $ios['iosEngines'])
        ->where('safeModeLevels', $levels)
        ->where('limits.history', iosData('facts.json')['limits']['historyEntriesIos']['value'])
        ->where('limits.results', iosData('facts.json')['limits']['resultBufferIos']['value'])
        ->where('heroSizes', IosController::HERO_SIZES)
        ->where('lcpAsset', app(AssetManifest::class)->lcpDescriptor('ios-hero-ipad', 'en', priority: true, sizes: IosController::HERO_SIZES, media: AssetManifest::WIDE_MEDIA))
        ->has('links')
        ->has('organizationProfiles')
        ->missing('macRequirements')
        ->missing('ipadSizes'));

    Http::assertNotSent(fn(Request $request): bool => str_contains($request->url(), 'github'));
});

it('describes six bands, each with an iPhone beside its text or an iPad or the sync diagram below it', function (): void {
    $content = iosData('content/en/ios.json');
    $assets = iosData('assets.json')['assets'];

    expect(array_column($content['bands'], 'id'))->toBe(['connect', 'browse', 'query', 'safe-mode', 'shortcuts', 'mac'])
        ->and(array_column($content['bands'], 'asset'))->toBe(['ios-connect', 'ios-browse', 'ios-query', 'ios-safe-mode', 'ios-shortcuts', 'diagram-icloud-sync'])
        ->and(array_column($content['more']['items'], 'id'))->toBe(['limits', 'ipad', 'privacy', 'source']);

    foreach ($content['bands'] as $band) {
        expect(in_array(['path' => '/ios', 'section' => $band['id']], $assets[$band['asset']]['usedOn'], true))->toBeTrue("{$band['asset']} is not placed at /ios#{$band['id']}");
    }

    foreach (['ios-hero-ipad', 'ios-hero-iphone'] as $id) {
        expect($assets[$id]['usedOn'])->toBe([['path' => '/ios', 'section' => 'top']]);
    }

    foreach (['ios-hero-iphone', 'ios-connect', 'ios-query', 'ios-safe-mode', 'ios-shortcuts'] as $id) {
        expect(iosUpright($assets[$id]))->toBeTrue("{$id} is an iPhone, upright");
    }

    foreach (['ios-hero-ipad', 'ios-browse'] as $id) {
        expect(iosUpright($assets[$id]))->toBeFalse("{$id} is an iPad, in landscape");
    }

    foreach (array_filter($assets, fn(array $entry): bool => $entry['family'] === 'ios') as $id => $entry) {
        expect($entry['kind'])->toBe('framed-device', "{$id} is a framed device")
            ->and($entry['theme'])->toBe('both', "{$id}: the frame follows the theme");
    }
});

it('keeps every link into /ios landing on an id the page still has', function (): void {
    $ids = iosPageIds(iosData('content/en/ios.json'));
    $sources = [
        ...File::allFiles(resource_path('data')),
        ...File::allFiles(resource_path('blog')),
        ...File::allFiles(resource_path('js')),
        app_path('Services/Blog/PostTopics.php'),
    ];
    $anchors = 0;

    expect($ids)->toBe(array_values(array_unique($ids)));

    foreach (['databases', 'browse', 'query', 'security', 'safe-mode', 'ipad', 'mac', 'automation', 'limits', 'known-issues', 'privacy', 'get'] as $id) {
        expect(in_array($id, $ids, true))->toBeTrue("#{$id} no longer lands on /ios");
    }

    foreach ($sources as $source) {
        preg_match_all('~/ios#([a-z0-9-]+)~', File::get((string) $source), $matches, PREG_SET_ORDER);

        foreach ($matches as [$link, $anchor]) {
            $anchors++;
            expect(in_array($anchor, $ids, true))->toBeTrue("{$source}: {$link}");
        }
    }

    expect($anchors)->toBeGreaterThan(80);
});

it('keeps every language on the English ids, slots and links', function (string $locale): void {
    $shape = fn(array $content): array => [
        'bands' => array_map(fn(array $band): array => array_intersect_key($band, array_flip(['id', 'also', 'asset'])), $content['bands'] ?? []),
        'items' => array_map(fn(array $item): array => [...array_intersect_key($item, array_flip(['id', 'also'])), 'links' => array_column($item['links'] ?? [], 'href')], $content['more']['items'] ?? []),
    ];

    expect($shape(iosData("content/{$locale}/ios.json")))->toBe($shape(iosData('content/en/ios.json')));
})->with('locales');

it('records France as the one storefront without the app, and names no country on the page', function (): void {
    $copy = mb_strtolower(json_encode(array_diff_key(iosData('content/en/ios.json'), array_flip(['seo', 'og'])), JSON_UNESCAPED_UNICODE));

    expect(iosRelease()['storefrontExclusions'])->toBe(['fr'])
        ->and(substr_count($copy, 'free'))->toBe(1, 'Free, with no in-app purchases: said once');

    foreach (['france', 'storefront', 'country', 'countries', 'region', 'europe'] as $word) {
        expect(str_contains($copy, $word))->toBeFalse("ios.json mentions {$word}");
    }
});

it('renders the hero, the engines, six bands, the Also list and the closing, in that order', function (): void {
    requireSsr();
    $content = iosData('content/en/ios.json');
    $document = Dom\HTMLDocument::createFromString((string) get('/ios')->assertOk()->getContent(), LIBXML_NOERROR);
    $sections = array_map(fn(Dom\Element $section): string => $section->getAttribute('id'), iterator_to_array($document->querySelectorAll('main > section')));
    $engines = array_map(fn(Dom\Element $item): string => trim((string) $item->textContent), iterator_to_array($document->querySelectorAll('#databases li')));
    $names = collect(iosData('engines.json'))->keyBy('id');

    expect($sections)->toBe(['top', 'databases', ...array_column($content['bands'], 'id'), 'more', 'get'])
        ->and($document->querySelectorAll('main h1'))->toHaveCount(1)
        ->and($document->querySelectorAll('main h2'))->toHaveCount(count($content['bands']) + 3)
        ->and($document->querySelectorAll('main a[href^="https://apps.apple.com/"]'))->toHaveCount(2)
        ->and($engines)->toBe(array_map(fn(string $id): string => $names[$id]['name'], iosRelease()['iosEngines']));

    foreach (iosPageIds($content) as $id) {
        expect($document->getElementById($id))->not->toBeNull("#{$id} is missing");
    }
})->group('ssr');
