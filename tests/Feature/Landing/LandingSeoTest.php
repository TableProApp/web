<?php


use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();
});

function getOnWebDomainSeo(string $path)
{
    return test()->get('http://' . config('app.web_domain') . $path);
}

it('rejects unknown comparison slugs', function (): void {
    getOnWebDomainSeo('/compare/unknown-tool')->assertNotFound();
});

it('rejects unknown database slugs', function (): void {
    getOnWebDomainSeo('/some-bogus-slug')->assertNotFound();
});

it('serves robots.txt with both sitemaps', function (): void {
    get(route('web.robots'))
        ->assertOk()
        ->assertSee('Sitemap: https://tablepro.app/sitemap.xml')
        ->assertSee('Sitemap: https://docs.tablepro.app/sitemap.xml');
});

it('emits exactly one robots directive per page', function (string $path): void {
    /*
     * `app.blade.php` hardcoded `index,follow` while `SEOHead` conditionally
     * emitted `noindex, nofollow`, so every page shipped two robots tags — and
     * a noindex page shipped two that contradicted each other.
     */
    $html = getOnWebDomain($path)->getContent();

    expect(substr_count($html, 'name="robots"'))->toBe(1, "{$path} emits more than one robots directive");
})->with(['/', '/download', '/faq', '/compare/dbeaver', '/mysql-client']);

it('publishes one application entity and no FAQPage on the homepage', function (): void {
    $html = getOnWebDomain('/')->getContent();

    expect(substr_count($html, '"@type":"SoftwareApplication"'))->toBe(1);
    // /faq owns the FAQPage entity for the site. Google retired the rich result
    // on 7 May 2026, and a second copy here competed with a strict superset.
    expect($html)->not->toContain('"@type":"FAQPage"');
});

it('describes every price point it claims to offer', function (): void {
    $html = getOnWebDomain('/')->getContent();

    preg_match('/"offerCount":(\d+)/', $html, $m);
    expect($m[1] ?? null)->not->toBeNull();

    // Free, plus three Starter cycles, plus three Team cycles.
    expect((int) $m[1])->toBe(7);
    expect(substr_count($html, '"@type":"Offer"'))->toBe(7);

    /*
     * `datePublished` was set to the *latest* release date, so the markup said
     * the app was first published last week and moved that claim forward on
     * every release.
     */
    expect($html)->not->toContain('"datePublished"');
});
