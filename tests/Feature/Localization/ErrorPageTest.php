<?php

use App\Support\Seo\RedirectMap;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;

/**
 * The branded error page, in the language of the path.
 *
 * A 404 for an unknown URL matched no route, so `SetLocale` never ran for it.
 * The renderer takes the locale from the path instead, which is what makes
 * `/vi/nope` fail in Vietnamese. Every error page is `noindex, follow` with no
 * canonical, so a crawler can follow its links home without indexing it.
 */
beforeEach(function (): void {
    Route::middleware('web')->group(function (): void {
        Route::get('/_test/gone', fn() => abort(410));
        Route::get('/_test/crash', fn() => throw new RuntimeException('Boom.'));
        Route::get('/_test/maintenance', fn() => abort(503));
        Route::get('/vi/_test/crash', fn() => throw new RuntimeException('Boom.'));
    });
});

it('renders an unknown English URL as the English 404 page', function (): void {
    $response = $this->get('/no-such-page');

    $response->assertNotFound()->assertInertia(fn(AssertableInertia $page) => $page
        ->component('Error')
        ->where('status', 404)
        ->missing('suggestion')
        ->where('locale', 'en')
        ->where('seo.robots', 'noindex, follow')
        ->where('seo.canonical', null)
        ->where('seo.alternates', [])
        ->where('seo.xDefault', null)
        ->where('seo.ogLocale', 'en_US')
        ->where('localization.switcher.0.href', '/no-such-page')
        ->where('localization.switcher.0.current', true)
        ->where('localization.switcher.1.href', '/vi')
        ->where('localization.switcher.1.fallback', false));

    expect($response->getContent())->toContain('<html lang="en"');
});

it('renders an unknown Vietnamese URL as the Vietnamese 404 page', function (): void {
    $response = $this->get('/vi/khong-co-trang-nay');

    $response->assertNotFound()->assertInertia(fn(AssertableInertia $page) => $page
        ->component('Error')
        ->where('status', 404)
        ->where('locale', 'vi')
        ->where('seo.robots', 'noindex, follow')
        ->where('seo.ogLocale', 'vi_VN')
        ->where('localization.switcher.0.href', '/')
        ->where('localization.switcher.1.href', '/vi/khong-co-trang-nay')
        ->where('localization.switcher.1.current', true));

    expect($response->getContent())->toContain('<html lang="vi"');
});

it('offers the English post on /vi/blog/{slug} instead of its English body', function (): void {
    // An English-only post that is still a page: a post merged elsewhere answers 301 (sitemap §C.5).
    $slug = pathinfo((string) collect(glob(resource_path('blog/*.md')))->first(
        fn(string $post): bool => ! is_file(resource_path('blog/vi/' . basename($post)))
            && ! app(RedirectMap::class)->retires('/blog/' . pathinfo($post, PATHINFO_FILENAME)),
    ), PATHINFO_FILENAME);

    $this->get("/vi/blog/{$slug}")
        ->assertNotFound()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Error')
            ->where('locale', 'vi')
            ->where('suggestion.href', "/blog/{$slug}")
            ->where('suggestion.hreflang', 'en')
            ->where('suggestion.locale', 'en')
            ->where('seo.robots', 'noindex, follow')
            ->where('localization.switcher.0.href', "/blog/{$slug}"));
});

it('preloads the Vietnamese font subset only on Vietnamese pages', function (): void {
    expect(substr_count($this->get('/no-such-page')->getContent(), 'as="font"'))->toBe(1);
    expect(substr_count($this->get('/vi/khong-co-trang-nay')->getContent(), 'as="font"'))->toBe(2);
});

it('renders 410 as the branded page', function (): void {
    $this->get('/_test/gone')
        ->assertStatus(410)
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Error')
            ->where('status', 410)
            ->where('seo.robots', 'noindex, follow'));
});

it('renders 500 and 503 as the branded page when debug is off, in the path locale', function (): void {
    config(['app.debug' => false]);

    $this->get('/_test/crash')
        ->assertStatus(500)
        ->assertInertia(fn(AssertableInertia $page) => $page->component('Error')->where('status', 500)->where('locale', 'en'));

    $this->get('/vi/_test/crash')
        ->assertStatus(500)
        ->assertInertia(fn(AssertableInertia $page) => $page->component('Error')->where('locale', 'vi'));

    $this->get('/_test/maintenance')
        ->assertStatus(503)
        ->assertInertia(fn(AssertableInertia $page) => $page->component('Error')->where('status', 503));
});

it("keeps Laravel's own 500 page while debugging", function (): void {
    config(['app.debug' => true]);

    $response = $this->get('/_test/crash');

    $response->assertStatus(500);
    expect($response->getContent())->not->toContain('"component":"Error"');
});

it('answers JSON requests with JSON', function (): void {
    $this->getJson('/no-such-page')->assertNotFound()->assertJsonStructure(['message']);
});

it('answers an Inertia visit to a missing page with the Error component', function (): void {
    $version = json_decode(
        html_entity_decode((string) preg_replace('/.*<script data-page="app" type="application\/json">(.*?)<\/script>.*/s', '$1', $this->get('/download')->getContent())),
        true,
    )['version'];

    $this->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => (string) $version, 'X-Requested-With' => 'XMLHttpRequest'])
        ->get('/vi/khong-co-trang-nay')
        ->assertNotFound()
        ->assertHeader('X-Inertia', 'true')
        ->assertJsonPath('component', 'Error')
        ->assertJsonPath('props.locale', 'vi');
});

it('falls back to static Blade pages that need no build, in both languages', function (string $locale, string $title503, string $title500): void {
    App::setLocale($locale);

    $maintenance = view('errors.503')->render();
    $failure = view('errors.500')->render();

    foreach ([$maintenance, $failure] as $html) {
        expect($html)
            ->toContain("<html lang=\"{$locale}\"")
            ->toContain('<meta name="robots" content="noindex" />')
            ->toContain("localStorage.getItem('theme')")
            ->not->toContain('/build/');
    }

    expect($maintenance)->toContain($title503);
    expect($failure)->toContain($title500)->toContain('hello@tablepro.app');
})->with([
    'English' => ['en', 'Down for maintenance', 'Something went wrong'],
    'Vietnamese' => ['vi', 'Đang bảo trì', 'Đã xảy ra lỗi'],
]);

it('serves the static page for 503 while debugging, in the locale of the path', function (): void {
    config(['app.debug' => true]);

    /*
     * Registered without the locale middleware, like a request no route
     * matched: the locale can only come from the path.
     */
    Route::middleware('web')->get('/vi/_test/maintenance', fn() => abort(503));

    $response = $this->get('/vi/_test/maintenance');

    $response->assertStatus(503);
    expect($response->getContent())->toContain('Đang bảo trì')->toContain('<html lang="vi"');
});
