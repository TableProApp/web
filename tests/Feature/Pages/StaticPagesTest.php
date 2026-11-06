<?php

use App\Http\Controllers\DatabaseController;
use App\Http\Controllers\IosController;
use App\Services\Legal\LegalDocuments;
use App\Support\Assets\AssetManifest;
use App\Support\Content\Testimonials;
use App\Support\Localization\LocalizedUrl;
use Dom\HTMLDocument;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;

function staticPageData(string $file): array
{
    return json_decode((string) file_get_contents(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

function staticPagePublishedEngines(): Illuminate\Support\Collection
{
    return collect(staticPageData('engines.json'))->where('state', 'published')->values();
}

it('renders every legal document with its slots filled, the same slots as English', function (string $locale): void {
    $documents = app(LegalDocuments::class);
    $translated = $locale === 'en' ? LegalDocuments::DOCUMENTS : array_diff(LegalDocuments::DOCUMENTS, LegalDocuments::ENGLISH_ONLY);

    foreach ($translated as $document) {
        $html = $documents->render($document, $locale)['html'];

        expect($documents->tokenNames($document, $locale))->toBe($documents->tokenNames($document, 'en'))
            ->and($html)->toContain('<h2 id="')
            ->not->toMatch('/\{[a-zA-Z]+\}/')
            ->not->toContain('**');
    }
})->with('locales');

it('formats the legal update date on the server, in the page language', function (string $path, string $pattern): void {
    get($path)->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
        ->component('Privacy')
        ->where('document.updatedAtFormatted', fn(string $date): bool => preg_match($pattern, $date) === 1));
})->with([
    'English' => ['/privacy', '/^[A-Z][a-z]+ \d{1,2}, \d{4}$/'],
    'Vietnamese' => ['/vi/privacy', '/^\d{1,2} tháng \d{1,2} năm \d{4}$/u'],
]);

it('server-renders the cookie settings control in place of its marker', function (string $path): void {
    $markup = (string) preg_replace('#<script data-page="app" type="application/json">.*?</script>#s', '', ssrHtml($path));
    $start = strpos($markup, 'id="cookies"');

    expect($start)->toBeInt()
        ->and(substr($markup, $start, strpos($markup, '<h2', $start) - $start))->toContain('<button type="button"')
        ->and($markup)->not->toContain('<cookie-settings>');
})->with(['/privacy', '/vi/privacy'])->group('ssr');

it('renders the brand guidelines in English only, with the logo files in place', function (): void {
    get('/brand')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
        ->component('Brand')
        ->where('document.html', fn(string $html): bool => str_contains($html, LegalDocuments::BRAND_ASSETS_MARKER)
            && ! str_contains($html, '<p>' . LegalDocuments::BRAND_ASSETS_MARKER)));

    get('/vi/brand')->assertNotFound()->assertInertia(fn(AssertableInertia $page) => $page
        ->component('Error')
        ->where('suggestion.href', '/brand')
        ->where('suggestion.hreflang', 'en'));
});

it('takes the publisher on the about page from facts.json, in the page language', function (string $locale): void {
    $publisher = staticPageData('facts.json')['publisher'];

    get(LocalizedUrl::path('/about', $locale))->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
        ->where('publisher.name', $publisher['name'])
        ->where('publisher.city', $publisher['city'][$locale])
        ->where('publisher.country', $publisher['country'][$locale]));
})->with(['en', 'vi']);

it('names the iPhone engines from platforms.json, asking GitHub for nothing', function (string $path, string $prop): void {
    Http::fake(['api.github.com/*' => Http::response([], 500), 'github.com/*' => Http::response([], 500)]);

    $engines = staticPagePublishedEngines()->keyBy('id');
    $ios = collect(staticPageData('platforms.json')['platforms'])->firstWhere('id', 'ios');
    $picker = collect($ios['iosEngines'])->map(fn(string $id): string => $engines[$id]['name'])->all();
    $syncedOnly = $engines->filter(fn(array $engine): bool => $engine['ios']['openable'] && ! $engine['ios']['inPicker'])->pluck('name')->values()->all();

    get($path)->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
        ->where("{$prop}.picker", fn($names): bool => collect($names)->map(fn($engine) => is_array($engine) ? $engine['name'] : $engine)->all() === $picker)
        ->where("{$prop}.syncedOnly", fn($names): bool => collect($names)->map(fn($engine) => is_array($engine) ? $engine['name'] : $engine)->all() === $syncedOnly));

    Http::assertNotSent(fn(Request $request): bool => str_contains($request->url(), 'github'));
})->with([
    'home' => ['/', 'iosEngines'],
    'iPhone and iPad' => ['/ios', 'engines'],
]);

it('preloads the LCP image only once it is supplied', function (string $path, Closure $descriptor): void {
    get($path)->assertOk()->assertInertia(fn(AssertableInertia $page) => $page->where('lcpAsset', $descriptor(app(AssetManifest::class))));
})->with([
    'home' => ['/', fn(AssetManifest $assets): ?array => $assets->lcpDescriptor('mac-hero-window', 'en')],
    'iPhone and iPad' => ['/ios', fn(AssetManifest $assets): ?array => $assets->lcpDescriptor('ipad-table-browse', 'en', priority: true, sizes: IosController::IPAD_SIZES)],
]);

it('sends the homepage every published engine once, and the categories in hub order', function (string $locale): void {
    $used = staticPagePublishedEngines()->pluck('category')->unique()->all();
    $hub = staticPageData("content/{$locale}/databases/index.json")['categories'];
    $categories = collect(DatabaseController::CATEGORIES)
        ->filter(fn(string $id): bool => in_array($id, $used, true))
        ->map(fn(string $id): array => ['id' => $id, 'title' => $hub[$id]['title']])
        ->values()
        ->all();

    get(LocalizedUrl::path('/', $locale))->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
        ->where('engines', fn($engines): bool => collect($engines)->pluck('id')->all() === staticPagePublishedEngines()->pluck('id')->all())
        ->where('categories', $categories));
})->with(['en', 'vi']);

it('sends the homepage its quotes, the reader\'s language first', function (): void {
    get('/ja')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
        ->has('testimonials', Testimonials::SHOWN)
        ->where('testimonials.0.lang', 'ja')
        ->where('testimonials.0.translation', null));
});

it('sends the pricing page each paid feature\'s lines, the featured engines and the paid clients\' comparisons', function (string $locale): void {
    $engines = staticPagePublishedEngines()->where('featured', true)->pluck('name')->values()->all();
    $comparisons = collect(staticPageData('comparisons.json')['products'])
        ->filter(fn(array $product): bool => $product['slug'] !== null && collect($product['prices'])->contains(fn(array $price): bool => $price['amount'] > 0))
        ->map(fn(array $product): string => '/compare/' . $product['slug'])
        ->values()
        ->all();

    $page = get(LocalizedUrl::path('/pricing', $locale))->assertOk()->viewData('page');

    expect($page['props']['featuredEngines'])->toBe($engines)
        ->and(array_column($page['props']['comparisons'], 'path'))->toBe($comparisons);

    foreach (array_column(staticPageData('paid-features.json'), 'id') as $id) {
        expect($page['props']['paidFeatures'][$id]['detail'] ?? null)->toBeString()->not->toBe('')
            ->and($page['props']['paidFeatures'][$id]['lapse'] ?? null)->toBeString()->not->toBe('');
    }
})->with('locales');

// The server never asks GET /v2/pricing, so its HTML is the closed state the page keeps until the answer opens it.
it('server-renders neither the education section nor its FAQ entry', function (string $locale): void {
    $pricing = HTMLDocument::createFromString(ssrHtml(LocalizedUrl::path('/pricing', $locale)), LIBXML_NOERROR);
    $faq = HTMLDocument::createFromString(ssrHtml(LocalizedUrl::path('/faq', $locale)), LIBXML_NOERROR);

    expect($pricing->getElementById('at-work'))->not->toBeNull()
        ->and($pricing->getElementById('education'))->toBeNull()
        ->and($faq->getElementById('cost'))->not->toBeNull()
        ->and($faq->getElementById('students-teachers'))->toBeNull();
})->with(['en', 'vi'])->group('ssr');

it('lists the engines whose driver ships with the Mac app from engines.json on the FAQ', function (): void {
    $bundled = staticPagePublishedEngines()->where('distribution', 'bundled')->pluck('name')->values()->all();

    get('/faq')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page->where('facts.bundledEngines', $bundled));
});

it('names every app language platforms.json lists, in every locale', function (string $locale): void {
    $tags = collect(staticPageData('platforms.json')['platforms'])->flatMap(fn(array $platform): array => $platform['appLanguages'] ?? [])->unique();

    expect($tags)->not->toBeEmpty();

    foreach (["content/{$locale}/faq.json" => ['languages'], "content/{$locale}/compare/index.json" => ['labels', 'languages']] as $file => $path) {
        $names = data_get(staticPageData($file), implode('.', $path));

        foreach ($tags as $tag) {
            expect($names)->toHaveKey($tag);
        }
    }
})->with('locales');
