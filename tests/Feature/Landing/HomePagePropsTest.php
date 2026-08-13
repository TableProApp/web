<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();
    Cache::flush();
});

/**
 * @param  array<int, array{tag: string, published: string, app?: bool}>  $releases
 */
function fakeReleases(array $releases): void
{
    Http::fake([
        'api.github.com/repos/TableProApp/TablePro/releases*' => Http::response(
            array_map(static fn(array $release): array => [
                'tag_name' => $release['tag'],
                'published_at' => $release['published'],
                'assets' => ($release['app'] ?? true)
                    ? [
                        [
                            'name' => 'TablePro-' . ltrim($release['tag'], 'v') . '-arm64.dmg',
                            'browser_download_url' => 'https://example.com/' . $release['tag'] . '-arm64.dmg',
                        ],
                        [
                            'name' => 'TablePro-' . ltrim($release['tag'], 'v') . '-x86_64.dmg',
                            'browser_download_url' => 'https://example.com/' . $release['tag'] . '-x86_64.dmg',
                        ],
                    ]
                    : [
                        ['name' => 'EtcdDriverPlugin-arm64.zip', 'browser_download_url' => 'https://example.com/p.zip'],
                    ],
            ], $releases),
        ),
        '*' => Http::response([]),
    ]);
}

it('passes the release details the homepage renders', function (): void {
    fakeReleases([
        ['tag' => 'v0.60.1', 'published' => now()->subDays(3)->toIso8601String()],
        ['tag' => 'v0.60.0', 'published' => now()->subDays(5)->toIso8601String()],
        ['tag' => 'v0.40.0', 'published' => now()->subDays(200)->toIso8601String()],
    ]);

    get(route('landing.home'))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Home')
                ->where('latestRelease.version', '0.60.1')
                ->where('latestRelease.publishedAt', now()->subDays(3)->toDateString())
                ->where('latestRelease.countLast30Days', 2),
        );
});

it('skips plugin releases when reporting the latest version', function (): void {
    fakeReleases([
        ['tag' => 'plugin-etcd-v1.0.25', 'published' => now()->subDay()->toIso8601String(), 'app' => false],
        ['tag' => 'v0.59.0', 'published' => now()->subDays(4)->toIso8601String()],
    ]);

    get(route('landing.home'))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->where('latestRelease.version', '0.59.0')
                ->where('latestRelease.countLast30Days', 1),
        );
});

it('renders with null release details when GitHub fails', function (): void {
    Http::fake([
        'api.github.com/repos/TableProApp/TablePro/releases*' => Http::response([], 500),
        '*' => Http::response([]),
    ]);

    get(route('landing.home'))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Home')
                ->where('latestRelease.version', null)
                ->where('latestRelease.publishedAt', null)
                ->where('latestRelease.countLast30Days', null)
                ->where('downloadUrls.arm64', 'https://github.com/TableProApp/TablePro/releases'),
        );
});

it('no longer sends the dead iosTestFlightUrl prop', function (): void {
    get(route('landing.home'))
        ->assertOk()
        ->assertInertia(fn($page) => $page->component('Home')->missing('iosTestFlightUrl'));
});

it('still sends the props the pricing and download flows depend on', function (): void {
    get(route('landing.home'))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Home')
                ->has('downloadUrls.arm64')
                ->has('downloadUrls.x86_64')
                ->has('paymentProvider')
                ->where('teamMinSeats', 5),
        );
});
