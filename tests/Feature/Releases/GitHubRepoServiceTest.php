<?php

use App\Services\Releases\GitHubRepoService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

/**
 * The star count follows the release service's pattern (architecture §1.13):
 * six hours fresh, a last-good copy on disk that outlives `cache:clear`, and
 * a ten-minute failure marker.
 */
beforeEach(function (): void {
    Cache::flush();
    Storage::fake(GitHubRepoService::LAST_GOOD_DISK);
});

const RELEASES_FAKE_GITHUB_REPO = 'api.github.com/repos/TableProApp/TablePro';

function repoStars(): ?int
{
    return app(GitHubRepoService::class)->stars();
}

it('reads the star count and keeps it for six hours', function (): void {
    Http::fake([RELEASES_FAKE_GITHUB_REPO => Http::response(['stargazers_count' => 4321])]);

    expect(repoStars())->toBe(4321);

    $this->travel(5)->hours();
    expect(repoStars())->toBe(4321);
    Http::assertSentCount(1);

    $this->travel(2)->hours();
    repoStars();
    Http::assertSentCount(2);
});

it('serves the last good count when GitHub fails, and waits ten minutes before retrying', function (): void {
    Http::fakeSequence(RELEASES_FAKE_GITHUB_REPO)
        ->push(['stargazers_count' => 4321])
        ->whenEmpty(Http::response(['message' => 'API rate limit exceeded'], 403));

    repoStars();
    $this->travel(7)->hours();

    expect(repoStars())->toBe(4321);
    Http::assertSentCount(2);

    $this->travel(9)->minutes();
    expect(repoStars())->toBe(4321);
    Http::assertSentCount(2);

    $this->travel(2)->minutes();
    repoStars();
    Http::assertSentCount(3);
});

it('is null only when GitHub has never answered', function (): void {
    Http::fake([RELEASES_FAKE_GITHUB_REPO => Http::failedConnection()]);

    expect(repoStars())->toBeNull()
        ->and(repoStars())->toBeNull();

    Http::assertSentCount(1);
});

it('ignores a response without a count', function (): void {
    Http::fake([RELEASES_FAKE_GITHUB_REPO => Http::response(['stargazers_count' => 'many'])]);

    expect(repoStars())->toBeNull();
});

it('keeps the last good count through cache:clear', function (): void {
    Http::fakeSequence(RELEASES_FAKE_GITHUB_REPO)
        ->push(['stargazers_count' => 4321])
        ->whenEmpty(Http::response('', 502));

    expect(repoStars())->toBe(4321);

    Artisan::call('cache:clear');

    expect(repoStars())->toBe(4321);
    Http::assertSentCount(2);
});
