<?php

use App\Http\Controllers\IosController;
use App\Services\Legal\LegalDocuments;
use App\Support\Assets\AssetManifest;
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
    'iPhone and iPad' => ['/ios', 'engines'],
]);

it('preloads the LCP image only once it is supplied', function (string $path, Closure $descriptor): void {
    get($path)->assertOk()->assertInertia(fn(AssertableInertia $page) => $page->where('lcpAsset', $descriptor(app(AssetManifest::class))));
})->with([
    'home' => ['/', fn(AssetManifest $assets): ?array => $assets->lcpDescriptor('home-hero-mac', 'en')],
    'iPhone and iPad' => ['/ios', fn(AssetManifest $assets): ?array => $assets->lcpDescriptor('ios-hero-ipad', 'en', priority: true, sizes: IosController::HERO_SIZES, media: AssetManifest::WIDE_MEDIA)],
]);

it('sends the homepage every published engine once, with its name, page and featured flag', function (string $locale): void {
    get(LocalizedUrl::path('/', $locale))->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
        ->where('engines', fn($engines): bool => collect($engines)->pluck('id')->all() === staticPagePublishedEngines()->pluck('id')->all())
        ->where('engines.0', fn($engine): bool => array_keys(collect($engine)->all()) === ['id', 'name', 'path', 'featured'])
        ->missing('categories')
        ->missing('iosEngines'));
})->with(['en', 'vi']);

it('sends the homepage every quote, the featured ones first and then the reader\'s language', function (): void {
    get('/ja')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
        ->has('testimonials', count(staticPageData('testimonials.json')['quotes']))
        ->where('testimonials.0.featured', true)
        ->where('testimonials.3.featured', false)
        ->where('testimonials.3.lang', 'ja')
        ->where('testimonials.3.translation', null));
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

// The server never asks GET /v2/pricing, so its HTML is the closed state the page keeps until the answer opens it. Until
// then the FAQ's education id lands on its Pricing band, as #cost does since that question moved to /pricing.
it('server-renders neither the education section nor its FAQ question', function (string $locale): void {
    $pricing = HTMLDocument::createFromString(ssrHtml(LocalizedUrl::path('/pricing', $locale)), LIBXML_NOERROR);
    $faq = HTMLDocument::createFromString(ssrHtml(LocalizedUrl::path('/faq', $locale)), LIBXML_NOERROR);

    expect($pricing->getElementById('at-work'))->not->toBeNull()
        ->and($pricing->getElementById('education'))->toBeNull()
        ->and($faq->getElementById('cost')?->closest('section')?->getAttribute('id'))->toBe('pricing')
        ->and($faq->getElementById('students-teachers')?->tagName)->toBe('SPAN')
        ->and($faq->getElementById('students-teachers')?->closest('section')?->getAttribute('id'))->toBe('pricing');
})->with(['en', 'vi'])->group('ssr');

// The sections these anchors named became questions of one FAQ; sites and posts still link them.
it('keeps every pricing anchor other pages link to, and states each cycle\'s price', function (string $locale): void {
    $html = ssrHtml(LocalizedUrl::path('/pricing', $locale));
    $pricing = HTMLDocument::createFromString($html, LIBXML_NOERROR);
    $prices = staticPageData('pricing.json')['tiers'];

    foreach (['plans', 'features', 'faq', 'license', 'billing', 'refunds', 'team', 'at-work', 'open-source'] as $id) {
        expect($pricing->getElementById($id))->not->toBeNull("#{$id} is gone from /pricing");
    }

    expect($pricing->getElementById('refunds')->tagName)->toBe('DETAILS')
        ->and($html)->not->toContain('new-prices-2026');

    foreach ([$prices['starter']['prices']['monthly'], $prices['starter']['prices']['yearly'], $prices['starter']['prices']['lifetime'], $prices['team']['prices']['monthly']] as $amount) {
        expect($pricing->getElementById('plans')->textContent)->toContain(str_replace('.', $locale === 'en' ? '.' : ',', (string) $amount));
    }
})->with(['en', 'vi'])->group('ssr');

it('prints prices on the pricing card the way the page does', function (string $locale): void {
    $catalog = (string) file_get_contents(resource_path("js/i18n/messages/{$locale}/pricing.ts"));

    preg_match('/pattern["\']?\s*:\s*["\']([^"\']+)["\']/', $catalog, $pattern);
    preg_match('/free["\']?\s*:\s*\{\s*["\']?name["\']?\s*:\s*["\']([^"\']+)["\']/', $catalog, $free);

    expect(trans('og.currency', [], $locale))->toBe($pattern[1])
        ->and(trans('og.free', [], $locale))->toBe($free[1]);
})->with('locales');

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

it('sends the FAQ\'s Linux answer to the Linux downloads', function (string $locale): void {
    $answer = collect(data_get(staticPageData("content/{$locale}/faq.json"), 'groups.*.items.*'))->firstWhere('id', 'windows-linux')['answer'] ?? null;
    $links = (string) file_get_contents(resource_path('js/components/faq/content-links.tsx'));

    expect(implode(' ', (array) $answer))->toContain('<downloadLinux>')
        ->and($links)->toContain("downloadLinux: '/download#linux'");
})->with('locales');

it('server-renders the FAQ\'s Linux link to a section that exists', function (string $locale): void {
    $faq = HTMLDocument::createFromString(ssrHtml(LocalizedUrl::path('/faq', $locale)), LIBXML_NOERROR);
    $download = HTMLDocument::createFromString(ssrHtml(LocalizedUrl::path('/download', $locale)), LIBXML_NOERROR);
    $answer = $faq->getElementById('windows-linux');

    expect($answer->querySelector('a[href="' . LocalizedUrl::path('/download', $locale) . '#linux"]'))->not->toBeNull()
        ->and($download->getElementById('linux'))->not->toBeNull();
})->with(['en', 'vi'])->group('ssr');

it('asks the FAQ’s platform questions Mac first, then Linux, then iPhone and iPad, and names the Linux app’s languages', function (string $locale): void {
    $platforms = collect(data_get(staticPageData("content/{$locale}/faq.json"), 'groups'))->firstWhere('id', 'platforms')['items'];
    $languages = implode(' ', (array) collect($platforms)->firstWhere('id', 'languages')['answer']);

    expect(array_slice(array_column($platforms, 'id'), 0, 3))->toBe(['mac-requirements', 'windows-linux', 'iphone-ipad'])
        ->and(strpos($languages, '{macLanguages}'))->toBeLessThan(strpos($languages, '{linuxLanguages}'))
        ->and(strpos($languages, '{linuxLanguages}'))->toBeLessThan(strpos($languages, '{iosLanguages}'));
})->with('locales');

it('sends the FAQ the Linux app’s languages from platforms.json', function (): void {
    $linux = collect(staticPageData('platforms.json')['platforms'])->firstWhere('id', 'linux');

    get('/faq')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page->where('platforms.linuxLanguages', $linux['appLanguages']));
});
