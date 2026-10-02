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
     *
     * SSR-gated: head tags come from a React component, so without a rendering
     * service the response is the Blade shell and carries none of them. The
     * first version of this test was not gated, counted zero on every page and
     * failed in CI for a reason that had nothing to do with robots directives.
     */
    $html = ssrHtml($path);

    expect(substr_count($html, 'name="robots"'))->toBe(1, "{$path} emits more than one robots directive");
})->with(['/', '/download', '/faq', '/compare/dbeaver', '/mysql-client']);

it('publishes one application entity and no FAQPage on the homepage', function (): void {
    $html = ssrHtml('/');

    expect(substr_count($html, '"@type":"SoftwareApplication"'))->toBe(1);
    // /faq owns the FAQPage entity for the site. Google retired the rich result
    // on 7 May 2026, and a second copy here competed with a strict superset.
    expect($html)->not->toContain('"@type":"FAQPage"');
});

it('describes every price point it claims to offer', function (): void {
    $html = ssrHtml('/');
    $tiers = json_decode((string) file_get_contents(resource_path('data/pricing.json')), true, 512, JSON_THROW_ON_ERROR)['tiers'];
    $app = null;

    preg_match_all('#<script type="application/ld\+json"[^>]*>(.*?)</script>#s', $html, $blocks);

    foreach ($blocks[1] as $block) {
        $data = json_decode($block, true, 512, JSON_THROW_ON_ERROR);

        foreach ($data['@graph'] ?? [$data] as $node) {
            if (str_ends_with((string) ($node['@id'] ?? ''), '/#app')) {
                $app = $node;
            }
        }
    }

    expect($app)->not->toBeNull();

    // The free tier plus one offer per paid tier and cycle, each priced from pricing.json.
    $prices = collect([$tiers['free']['price']]);

    foreach ($tiers as $tier) {
        $prices = $prices->merge(array_values($tier['prices'] ?? []));
    }

    expect(collect($app['offers'])->pluck('@type')->unique()->all())->toBe(['Offer']);
    expect(collect($app['offers'])->pluck('price')->map(fn(string $price): float => (float) $price)->all())
        ->toBe($prices->map(fn(int|float $price): float => (float) $price)->all());

    /*
     * `datePublished` was set to the *latest* release date, so the markup said
     * the app was first published last week and moved that claim forward on
     * every release.
     */
    expect($html)->not->toContain('"datePublished"');
});
