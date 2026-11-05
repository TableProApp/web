<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\PendingCommand;

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

function comparisonOnGitHub(): array
{
    return array_values(comparisonsOnGitHub())[0];
}

// Overrides by product id: a payload, or a status code.
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

function comparisonCheckDates(): array
{
    $dates = array_column(json_decode(File::get(resource_path('data/comparisons.json')), true)['products'], 'checkedAt');

    return ['oldest' => min($dates), 'newest' => max($dates), 'spread' => (int) Carbon::parse(min($dates))->diffInDays(Carbon::parse(max($dates)))];
}

function runComparisonsCheckWhileFresh(): PendingCommand
{
    $dates = comparisonCheckDates();
    test()->travelTo($dates['newest'] . ' 12:00:00');

    return test()->artisan('comparisons:check', ['--max-age' => $dates['spread']]);
}

it('passes while every check is recent and GitHub has the recorded releases', function (): void {
    fakeComparisonReleases();

    runComparisonsCheckWhileFresh()
        ->doesntExpectOutputToContain('DRIFT')
        ->doesntExpectOutputToContain('STALE')
        ->assertSuccessful();

    Http::assertSentCount(count(comparisonsOnGitHub()));
});

it('fails when GitHub has a newer release than the data records', function (): void {
    $product = comparisonOnGitHub();
    fakeComparisonReleases([$product['id'] => ['tag_name' => '99.0.0', 'published_at' => '2027-01-01T00:00:00Z']]);

    runComparisonsCheckWhileFresh()->expectsOutputToContain('DRIFT')->assertFailed();
});

it('reads the version out of a prefixed or suffixed tag', function (): void {
    $product = comparisonOnGitHub();
    $release = $product['status']['lastRelease'];
    fakeComparisonReleases([$product['id'] => ['tag_name' => "production/{$release['version']}-20115", 'published_at' => $release['date'] . 'T03:34:07Z']]);

    runComparisonsCheckWhileFresh()->assertSuccessful();
});

it('fails once a product was checked longer ago than the limit, 30 days unless told otherwise', function (): void {
    $dates = comparisonCheckDates();
    fakeComparisonReleases();

    $this->travelTo($dates['oldest'] . ' 12:00:00');
    $this->travel(31)->days();

    $this->artisan('comparisons:check')->expectsOutputToContain('STALE')->assertFailed();
    $this->artisan('comparisons:check', ['--max-age' => 31])->doesntExpectOutputToContain('STALE')->assertSuccessful();
});

it('fails, rather than passing silently, when GitHub cannot be read', function (): void {
    fakeComparisonReleases([comparisonOnGitHub()['id'] => 503]);

    runComparisonsCheckWhileFresh()->expectsOutputToContain('UNREADABLE')->assertFailed();
});
