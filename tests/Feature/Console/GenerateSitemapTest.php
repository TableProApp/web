<?php

use Illuminate\Support\Facades\File;

beforeEach(function (): void {
    File::delete(public_path('sitemap.xml'));
});

afterEach(function (): void {
    File::delete(public_path('sitemap.xml'));
});

function loadSlugs(string $file): array
{
    $entries = json_decode(File::get(resource_path('data/' . $file)), true);

    return array_values(array_filter(array_map(
        static fn(array $entry): ?string => $entry['slug'] ?? null,
        $entries,
    )));
}

it('writes sitemap.xml to public directory', function (): void {
    $this->artisan('sitemap:generate')->assertSuccessful();

    expect(File::exists(public_path('sitemap.xml')))->toBeTrue();
});

it('contains every comparison slug from comparisons.json', function (): void {
    $this->artisan('sitemap:generate')->assertSuccessful();

    $content = File::get(public_path('sitemap.xml'));
    $baseUrl = 'https://' . config('app.web_domain');

    foreach (loadSlugs('comparisons.json') as $slug) {
        expect($content)->toContain($baseUrl . '/compare/' . $slug);
    }
});

it('contains every database slug from databases.json', function (): void {
    $this->artisan('sitemap:generate')->assertSuccessful();

    $content = File::get(public_path('sitemap.xml'));
    $baseUrl = 'https://' . config('app.web_domain');

    foreach (loadSlugs('databases.json') as $slug) {
        expect($content)->toContain($baseUrl . '/' . $slug);
    }
});

it('only includes URLs derived from the data files plus the static landing pages', function (): void {
    $this->artisan('sitemap:generate')->assertSuccessful();

    $content = File::get(public_path('sitemap.xml'));
    preg_match_all('#<loc>([^<]+)</loc>#', $content, $matches);
    $urls = $matches[1];

    $baseUrl = 'https://' . config('app.web_domain');

    $expected = [
        $baseUrl . '/',
        $baseUrl . '/blog',
        $baseUrl . '/download',
        $baseUrl . '/privacy',
        $baseUrl . '/terms',
        $baseUrl . '/refund-policy',
        $baseUrl . '/faq',
    ];

    foreach (loadSlugs('databases.json') as $slug) {
        $expected[] = $baseUrl . '/' . $slug;
    }

    foreach (loadSlugs('comparisons.json') as $slug) {
        $expected[] = $baseUrl . '/compare/' . $slug;
    }

    foreach (app(\App\Services\Blog\BlogService::class)->all() as $post) {
        $expected[] = $baseUrl . '/blog/' . $post->slug;
    }

    sort($expected);
    sort($urls);

    expect($urls)->toBe($expected);
});

it('omits admin and api routes', function (): void {
    $this->artisan('sitemap:generate')->assertSuccessful();

    $content = File::get(public_path('sitemap.xml'));

    expect($content)
        ->not->toContain('/licenses')
        ->not->toContain('/api/')
        ->not->toContain('/newsletter/subscribe');
});
