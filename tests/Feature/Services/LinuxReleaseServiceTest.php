<?php

use App\Services\Releases\LinuxRelease;
use App\Services\Releases\LinuxReleaseService;
use App\Services\Releases\PlatformCatalog;
use Illuminate\Console\Scheduling\Event;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    Cache::flush();
    Storage::fake(LinuxReleaseService::LAST_GOOD_DISK);
    app()->instance(PlatformCatalog::class, new PlatformCatalog());
});

function linuxReleases(): LinuxReleaseService
{
    return app(LinuxReleaseService::class);
}

function linuxAsset(string $name, ?string $digest = null): array
{
    return [
        'name' => $name,
        'state' => 'uploaded',
        'size' => 31_000_000,
        'digest' => $digest,
        'browser_download_url' => "https://github.com/TableProApp/TablePro/releases/download/linux-v0.1.0-beta.2/{$name}",
    ];
}

function linuxReleaseList(): array
{
    return [
        ['tag_name' => 'v0.86.0', 'draft' => false, 'prerelease' => false, 'published_at' => '2026-11-12T08:00:00Z', 'assets' => []],
        ['tag_name' => 'linux-v0.2.0-beta.1', 'draft' => true, 'prerelease' => true, 'published_at' => null, 'assets' => [linuxAsset('tablepro-0.2.0-beta.1-x86_64.flatpak')]],
        [
            'tag_name' => 'linux-v0.1.0-beta.2',
            'draft' => false,
            'prerelease' => true,
            'published_at' => '2026-11-10T09:30:00Z',
            'html_url' => 'https://github.com/TableProApp/TablePro/releases/tag/linux-v0.1.0-beta.2',
            'assets' => [
                linuxAsset('tablepro-0.1.0-beta.2-ubuntu-26.04-amd64.deb', 'sha256:' . str_repeat('a', 64)),
                linuxAsset('tablepro-0.1.0-beta.2-fedora-44-aarch64.rpm'),
                linuxAsset('tablepro-0.1.0-beta.2-x86_64.flatpak'),
                linuxAsset('SHA256SUMS'),
                linuxAsset('tablepro.pot'),
            ],
        ],
        ['tag_name' => 'linux-v0.1.0-beta.1', 'draft' => false, 'prerelease' => true, 'published_at' => '2026-11-06T10:00:00Z', 'assets' => [linuxAsset('tablepro-0.1.0-beta.1-x86_64.flatpak')]],
    ];
}

it('takes the newest published linux-v release on the beta channel, with its packages, digests and checksums', function (): void {
    Http::fake(['api.github.com/repos/*/releases*' => Http::response(linuxReleaseList())]);

    $release = linuxReleases()->refresh();

    expect($release->source)->toBe(LinuxRelease::SOURCE_GITHUB)
        ->and($release->version)->toBe('0.1.0-beta.2')
        ->and($release->prerelease)->toBeTrue()
        ->and($release->publishedAt)->toBe('2026-11-10')
        ->and(array_column($release->assets, 'name'))->toBe([
            'tablepro-0.1.0-beta.2-ubuntu-26.04-amd64.deb',
            'tablepro-0.1.0-beta.2-fedora-44-aarch64.rpm',
            'tablepro-0.1.0-beta.2-x86_64.flatpak',
        ])
        ->and($release->assets[0]['sha256'])->toBe(str_repeat('a', 64))
        ->and($release->assets[1]['sha256'])->toBeNull()
        ->and($release->checksumsUrl)->toEndWith('/linux-v0.1.0-beta.2/SHA256SUMS')
        ->and(linuxReleases()->latest()->version)->toBe('0.1.0-beta.2');
});

it('skips pre-releases once the channel is stable', function (): void {
    $data = json_decode(File::get(resource_path('data/platforms.json')), true);
    $data['platforms'] = array_map(fn(array $platform): array => $platform['id'] === 'linux' ? [...$platform, 'channel' => 'stable'] : $platform, $data['platforms']);
    $path = storage_path('framework/testing/platforms-stable-' . uniqid() . '.json');
    File::ensureDirectoryExists(dirname($path));
    File::put($path, json_encode($data));
    app()->instance(PlatformCatalog::class, new PlatformCatalog($path));

    $list = linuxReleaseList();
    $list[] = ['tag_name' => 'linux-v0.1.0', 'draft' => false, 'prerelease' => false, 'published_at' => '2026-12-01T09:00:00Z', 'assets' => [linuxAsset('tablepro-0.1.0-x86_64.flatpak')]];
    Http::fake(['api.github.com/repos/*/releases*' => Http::response($list)]);

    expect(linuxReleases()->refresh()->version)->toBe('0.1.0');

    File::delete($path);
});

it('stands in with the release platforms.json records until GitHub has one', function (): void {
    Http::fake(['api.github.com/repos/*/releases*' => Http::response([['tag_name' => 'v0.85.0', 'draft' => false, 'prerelease' => false, 'assets' => []]])]);

    expect(linuxReleases()->refresh())->toBeNull()
        ->and(linuxReleases()->failing())->toBeTrue();

    $release = linuxReleases()->latest();
    $recorded = app(PlatformCatalog::class)->linuxDataRelease();

    expect($release->source)->toBe(LinuxRelease::SOURCE_DATA)
        ->and($release->version)->toBe($recorded['version'])
        ->and($release->prerelease)->toBe(str_contains($recorded['version'], '-'))
        ->and($release->assets)->not->toBeEmpty()
        ->and(collect($release->assets)->every(fn(array $asset): bool => str_starts_with($asset['url'], "https://github.com/TableProApp/TablePro/releases/download/linux-v{$recorded['version']}/") && $asset['sha256'] === null))->toBeTrue();
});

it('names every package file of a release for each series and architecture', function (): void {
    $names = app(PlatformCatalog::class)->linuxAssetNames('0.1.0-beta.1');

    expect($names)->toContain(
        'tablepro-0.1.0-beta.1-ubuntu-26.04-amd64.deb',
        'tablepro-0.1.0-beta.1-ubuntu-26.10-arm64.deb',
        'tablepro-0.1.0-beta.1-fedora-45-aarch64.rpm',
        'tablepro-0.1.0-beta.1-x86_64.flatpak',
        'tablepro-0.1.0-beta.1-aarch64.flatpak',
    )->and($names)->toBe(array_values(array_unique($names)));
});

it('refreshes the Linux release on the same schedule as the Mac one', function (): void {
    $events = collect(app(Schedule::class)->events())->filter(fn(Event $event): bool => str_contains((string) $event->command, 'release:refresh-linux'));

    expect($events)->toHaveCount(1)
        ->and($events->first()->expression)->toBe('*/15 * * * *');
});
