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
