<?php


use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();
});

function getOnWebDomain(string $path)
{
    return test()->get('http://' . config('app.web_domain') . $path);
}

dataset('comparisonSlugs', function (): array {
    $entries = json_decode(file_get_contents(__DIR__ . '/../../../resources/data/comparisons.json'), true);

    return array_map(static fn(array $entry): array => [$entry['slug']], $entries);
});

dataset('databaseSlugs', function (): array {
    $entries = json_decode(file_get_contents(__DIR__ . '/../../../resources/data/databases.json'), true);

    return array_map(static fn(array $entry): array => [$entry['slug']], $entries);
});

it('serves a Compare Inertia response for slug [%s]', function (string $slug): void {
    getOnWebDomain('/compare/' . $slug)
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Compare')
                ->where('slug', $slug)
                ->has('downloadUrls'),
        );
})->with('comparisonSlugs');

it('serves a DatabaseClient Inertia response for slug [%s]', function (string $slug): void {
    getOnWebDomain('/' . $slug)
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('DatabaseClient')
                ->where('slug', $slug)
                ->has('downloadUrls'),
        );
})->with('databaseSlugs');

it('serves the download, faq, privacy, terms, and refund-policy landing pages', function (string $url, string $component): void {
    getOnWebDomain($url)
        ->assertOk()
        ->assertInertia(fn($page) => $page->component($component));
})->with([
    ['/download', 'Download'],
    ['/faq', 'Faq'],
    ['/privacy', 'Privacy'],
    ['/terms', 'Terms'],
    ['/refund-policy', 'RefundPolicy'],
]);


it('keeps the comparison data shape stable with required SEO fields', function (): void {
    $entries = json_decode(file_get_contents(__DIR__ . '/../../../resources/data/comparisons.json'), true);

    expect($entries)->toHaveCount(10);

    foreach ($entries as $entry) {
        expect($entry)
            ->toHaveKeys(['slug', 'name', 'tagline', 'description', 'verdict', 'keywords']);
        expect($entry['description'])->toBeString()->not->toBeEmpty();
        expect($entry['verdict'])->toBeString()->not->toBeEmpty();
    }
});

it('returns 410 Gone for the retired /compare/tableplus URL', function (): void {
    getOnWebDomain('/compare/tableplus')->assertStatus(410);
});

it('keeps the database data shape stable with required SEO fields', function (): void {
    $entries = json_decode(file_get_contents(__DIR__ . '/../../../resources/data/databases.json'), true);

    expect($entries)->toHaveCount(26);

    foreach ($entries as $entry) {
        expect($entry)
            ->toHaveKeys(['slug', 'name', 'tagline', 'description', 'icon', 'keywords']);
        expect($entry['description'])->toBeString()->not->toBeEmpty();
    }
});
