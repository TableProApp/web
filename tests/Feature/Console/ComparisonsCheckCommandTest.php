<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

/**
 * `php artisan comparisons:check`: the age of each product's check, and its
 * last release against GitHub. GitHub is faked from the data file itself, so
 * a re-check of a competitor's release never needs an edit here.
 */

/**
 * `owner/repo` => the product whose last release cites that repository's releases page.
 *
 * @return array<string, array<string, mixed>>
 */
function comparisonsOnGitHub(): array
{
    $products = json_decode(File::get(resource_path('data/comparisons.json')), true, 512, JSON_THROW_ON_ERROR)['products'];
    $byRepository = [];

    foreach ($products as $product) {
        $source = collect($product['sources'])->firstWhere('id', $product['status']['lastRelease']['source']);

        if (preg_match('#^https://github\.com/([^/]+/[^/]+)/releases$#', $source['url'], $matches) === 1) {
            $byRepository[$matches[1]] = $product;
        }
    }

    return $byRepository;
}

/**
 * Fakes GitHub's latest release for every such product as the data records it.
 *
 * @param  array<string, array{tag_name: string, published_at: string}|int>  $overrides  by product id: a payload, or a status code
 */
function fakeComparisonReleases(array $overrides = []): void
{
    $products = comparisonsOnGitHub();

    Http::fake(['api.github.com/repos/*' => function (Request $request) use ($products, $overrides) {
        preg_match('#/repos/([^/]+/[^/]+)/releases/latest$#', $request->url(), $matches);
        $product = $products[$matches[1]];
        $override = $overrides[$product['id']] ?? null;

        if (is_int($override)) {
            return Http::response([], $override);
        }

        return Http::response($override ?? [
            'tag_name' => 'v' . $product['status']['lastRelease']['version'],
            'published_at' => $product['status']['lastRelease']['date'] . 'T10:00:00Z',
        ]);
    }]);
}

function newestComparisonCheck(): string
{
    return json_decode(File::get(resource_path('data/comparisons.json')), true)['checkedAt'];
}

it('passes while every check is recent and GitHub has the recorded releases', function (): void {
    $this->travelTo(newestComparisonCheck() . ' 12:00:00');
    fakeComparisonReleases();

    $this->artisan('comparisons:check')
        ->doesntExpectOutputToContain('DRIFT')
        ->doesntExpectOutputToContain('STALE')
        ->assertSuccessful();

    expect(comparisonsOnGitHub())->toHaveKey('dbeaver/dbeaver');
    Http::assertSentCount(count(comparisonsOnGitHub()));
});

it('fails when GitHub has a newer release than the data records', function (): void {
    $this->travelTo(newestComparisonCheck() . ' 12:00:00');
    fakeComparisonReleases(['dbeaver' => ['tag_name' => '99.0.0', 'published_at' => '2027-01-01T00:00:00Z']]);

    expect(Artisan::call('comparisons:check'))->toBe(1)
        ->and(Artisan::output())->toMatch('/dbeaver +\| release +\| \S+ +\| 99\.0\.0 +\| DRIFT/');
});

it('reads the version out of a prefixed or suffixed tag', function (): void {
    $this->travelTo(newestComparisonCheck() . ' 12:00:00');

    $sequelAce = comparisonsOnGitHub()['Sequel-Ace/Sequel-Ace']['status']['lastRelease'];

    fakeComparisonReleases(['sequel-ace' => ['tag_name' => "production/{$sequelAce['version']}-20115", 'published_at' => $sequelAce['date'] . 'T03:34:07Z']]);

    $this->artisan('comparisons:check')->assertSuccessful();
});

it('fails once a product was checked longer ago than the limit', function (): void {
    $this->travelTo(newestComparisonCheck() . ' 12:00:00');
    $this->travel(45)->days();
    fakeComparisonReleases();

    $this->artisan('comparisons:check')->expectsOutputToContain('STALE')->assertFailed();
    $this->artisan('comparisons:check', ['--max-age' => 90])->doesntExpectOutputToContain('STALE')->assertSuccessful();
});

it('fails, rather than passing silently, when GitHub cannot be read', function (): void {
    $this->travelTo(newestComparisonCheck() . ' 12:00:00');
    fakeComparisonReleases(['beekeeper-studio' => 503]);

    $this->artisan('comparisons:check')->expectsOutputToContain('UNREADABLE')->assertFailed();
});
