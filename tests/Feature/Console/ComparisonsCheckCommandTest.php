<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\PendingCommand;

/**
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

/**
 * @return array{oldest: string, newest: string, spread: int}
 */
function comparisonCheckDates(): array
{
    $dates = array_column(json_decode(File::get(resource_path('data/comparisons.json')), true)['products'], 'checkedAt');

    return [
        'oldest' => min($dates),
        'newest' => max($dates),
        'spread' => (int) Carbon::parse(min($dates))->diffInDays(Carbon::parse(max($dates))),
    ];
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

    expect(comparisonsOnGitHub())->toHaveKey('dbeaver/dbeaver');
    Http::assertSentCount(count(comparisonsOnGitHub()));
});

it('fails when GitHub has a newer release than the data records', function (): void {
    $dates = comparisonCheckDates();

    fakeComparisonReleases(['dbeaver' => ['tag_name' => '99.0.0', 'published_at' => '2027-01-01T00:00:00Z']]);
    $this->travelTo($dates['newest'] . ' 12:00:00');

    expect(Artisan::call('comparisons:check', ['--max-age' => $dates['spread']]))->toBe(1)
        ->and(Artisan::output())->toMatch('/dbeaver +\| release +\| \S+ +\| 99\.0\.0 +\| DRIFT/');
});

it('reads the version out of a prefixed or suffixed tag', function (): void {
    $sequelAce = comparisonsOnGitHub()['Sequel-Ace/Sequel-Ace']['status']['lastRelease'];

    fakeComparisonReleases(['sequel-ace' => ['tag_name' => "production/{$sequelAce['version']}-20115", 'published_at' => $sequelAce['date'] . 'T03:34:07Z']]);

    runComparisonsCheckWhileFresh()->assertSuccessful();
});

it('fails once a product was checked longer ago than the limit, 30 days unless told otherwise', function (): void {
    $dates = comparisonCheckDates();
    fakeComparisonReleases();

    $this->travelTo($dates['oldest'] . ' 12:00:00');
    $this->travel(31)->days();

    $this->artisan('comparisons:check')->expectsOutputToContain('STALE')->assertFailed();
    $this->artisan('comparisons:check', ['--max-age' => 31])->doesntExpectOutputToContain('STALE')->assertSuccessful();

    $this->travelBack();
    $this->travelTo($dates['oldest'] . ' 12:00:00');
    $this->travel(30)->days();

    $this->artisan('comparisons:check')->doesntExpectOutputToContain('STALE')->assertSuccessful();
});

it('fails, rather than passing silently, when GitHub cannot be read', function (): void {
    fakeComparisonReleases(['beekeeper-studio' => 503]);

    runComparisonsCheckWhileFresh()->expectsOutputToContain('UNREADABLE')->assertFailed();
});
