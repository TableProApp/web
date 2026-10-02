<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

require_once __DIR__ . '/ReleaseFixtures.php';

/**
 * `/ios` still renders the pre-rebuild page until its phase-C rewrite, but
 * its release data now comes from the release services (architecture §1.13):
 * `releases/latest` and the cached last-good copy, never the full releases
 * list that plugin releases crowd. What this file pins outlives the rewrite:
 * the page answers, and nothing on it asks GitHub for that list.
 */
beforeEach(function (): void {
    withoutVite();
    Cache::flush();
    Storage::fake('local');
    bindReleaseFixturePlatforms();
});

it('never reads the crowded releases list', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload()),
        'api.github.com/repos/TableProApp/TablePro' => Http::response(['stargazers_count' => 4321]),
    ]);

    get('/ios')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page->component('Ios'));

    Http::assertNotSent(fn(Request $request): bool => (bool) preg_match('#/releases(\?|$)#', $request->url()));
});

it('shares the download page’s cached release, so both pages cost one GitHub call', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload()),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml()),
        'api.github.com/repos/TableProApp/TablePro' => Http::response(['stargazers_count' => 4321]),
    ]);

    get('/download')->assertOk();
    get('/ios')->assertOk();

    expect(Http::recorded(fn(Request $request): bool => str_ends_with($request->url(), '/releases/latest'))->count())->toBe(1);
});

it('still answers when GitHub does not', function (): void {
    Http::fake(['*' => Http::failedConnection()]);

    get('/ios')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page->component('Ios'));
});
