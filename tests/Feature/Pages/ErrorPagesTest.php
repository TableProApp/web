<?php

use App\Support\Seo\RedirectMap;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\getJson;
use function Pest\Laravel\withHeaders;

beforeEach(function (): void {
    Route::middleware('web')->group(function (): void {
        Route::get('/_test/gone', fn() => abort(410));
        Route::get('/_test/crash', fn() => throw new RuntimeException('Boom.'));
        Route::get('/_test/maintenance', fn() => abort(503));
        Route::get('/vi/_test/crash', fn() => throw new RuntimeException('Boom.'));
    });
});

function errorPagesEnglishOnlyPost(string $locale): string
{
    $post = collect(glob(resource_path('blog/*.md')))->first(
        fn(string $post): bool => ! is_file(resource_path("blog/{$locale}/" . basename($post)))
            && ! app(RedirectMap::class)->retires('/blog/' . pathinfo($post, PATHINFO_FILENAME)),
    );

    return pathinfo((string) $post, PATHINFO_FILENAME);
}

it('renders an unknown URL as the 404 page of its path language', function (string $path, string $locale, string $og): void {
    $response = get($path);

    $response->assertNotFound()->assertInertia(fn(AssertableInertia $page) => $page
        ->component('Error')
        ->where('status', 404)
        ->where('locale', $locale)
        ->missing('suggestion')
        ->where('seo.robots', 'noindex, follow')
        ->where('seo.canonical', null)
        ->where('seo.alternates', [])
        ->where('seo.ogLocale', $og));

    expect($response->getContent())->toContain("<html lang=\"{$locale}\"");
})->with([
    'English' => ['/no-such-page', 'en', 'en_US'],
    'Vietnamese' => ['/vi/khong-co-trang-nay', 'vi', 'vi_VN'],
]);

it('switches an unknown path to each home page', function (): void {
    get('/de/blog/no-such-post')
        ->assertNotFound()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('localization.switcher.0.href', '/')
            ->where('localization.switcher.2.href', '/es')
            ->where('localization.switcher.2.fallback', false));
});

it('offers the English post on a translated post URL that has no translation', function (): void {
    $slug = errorPagesEnglishOnlyPost('vi');

    get("/vi/blog/{$slug}")
        ->assertNotFound()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Error')
            ->where('locale', 'vi')
            ->where('suggestion.href', "/blog/{$slug}")
            ->where('suggestion.locale', 'en')
            ->where('localization.switcher.0.href', "/blog/{$slug}"));
});

it('switches a missing post to the post where it exists and to the blog index elsewhere', function (): void {
    $slug = errorPagesEnglishOnlyPost('de');

    get("/de/blog/{$slug}")
        ->assertNotFound()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('localization.switcher.0.href', "/blog/{$slug}")
            ->where('localization.switcher.0.fallback', false)
            ->where('localization.switcher.2.href', '/es/blog')
            ->where('localization.switcher.2.fallback', true)
            ->where('localization.switcher.3.current', true));
});

it('renders 410, 500 and 503 as the branded page when debug is off', function (string $path, int $status, string $locale): void {
    config(['app.debug' => false]);

    get($path)
        ->assertStatus($status)
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Error')
            ->where('status', $status)
            ->where('locale', $locale)
            ->where('seo.robots', 'noindex, follow'));
})->with([
    'gone' => ['/_test/gone', 410, 'en'],
    'server error' => ['/_test/crash', 500, 'en'],
    'server error in Vietnamese' => ['/vi/_test/crash', 500, 'vi'],
    'maintenance' => ['/_test/maintenance', 503, 'en'],
]);

it("keeps Laravel's own 500 page while debugging", function (): void {
    config(['app.debug' => true]);

    expect(get('/_test/crash')->assertStatus(500)->getContent())->not->toContain('"component":"Error"');
});

it('answers JSON requests with JSON', function (): void {
    getJson('/no-such-page')->assertNotFound()->assertJsonStructure(['message']);
});

it('answers an Inertia visit to a missing page with the Error component', function (): void {
    preg_match('/<script data-page="app" type="application\/json">(.*?)<\/script>/s', get('/download')->getContent(), $page);
    $version = json_decode(html_entity_decode($page[1]), true)['version'];

    withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => (string) $version, 'X-Requested-With' => 'XMLHttpRequest'])
        ->get('/vi/khong-co-trang-nay')
        ->assertNotFound()
        ->assertHeader('X-Inertia', 'true')
        ->assertJsonPath('component', 'Error')
        ->assertJsonPath('props.locale', 'vi');
});

it('falls back to static Blade pages that need no build', function (string $view, string $locale): void {
    App::setLocale($locale);

    expect(view("errors.{$view}")->render())
        ->toContain("<html lang=\"{$locale}\"")
        ->toContain('<meta name="robots" content="noindex" />')
        ->toContain(e(__("errors.{$view}.title")))
        ->not->toContain('/build/');
})->with(['500', '503'])->with(['en', 'vi']);

it('serves the static 503 page while debugging, in the locale of the path', function (): void {
    config(['app.debug' => true]);
    Route::middleware('web')->get('/vi/_test/maintenance', fn() => abort(503));

    expect(get('/vi/_test/maintenance')->assertStatus(503)->getContent())
        ->toContain('<html lang="vi"')
        ->toContain(__('errors.503.title', locale: 'vi'));
});

it('links the account in the requested language from a prefixed account or checkout 404', function (string $locale, string $path): void {
    get("/{$locale}/{$path}")
        ->assertNotFound()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Error')
            ->where('locale', $locale)
            ->where('account', "https://account.tablepro.app/?locale={$locale}"));
})->with(['vi', 'pt-BR'])->with(['account', 'account/login', 'checkout/starter']);

it('offers the account only on account and checkout paths', function (string $path): void {
    get($path)
        ->assertNotFound()
        ->assertInertia(fn(AssertableInertia $page) => $page->component('Error')->missing('account'));
})->with(['/vi/khong-co-trang-nay', '/vi/accounting', '/this-page-does-not-exist']);
