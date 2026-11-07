<?php

use App\Services\Releases\PlatformCatalog;
use Illuminate\Support\Arr;

const RELEASES_FAKE_GITHUB_LATEST = 'api.github.com/repos/TableProApp/TablePro/releases/latest';

const RELEASES_FAKE_APPCAST = 'updates.tablepro.app/appcast.xml';

function bindReleaseFixturePlatforms(array $overrides = []): array
{
    // The live platforms.json moves with every release, so these tests bind a fixture with its schema.
    $platforms = [
        'mac' => [
            'id' => 'mac',
            'status' => 'released',
            'deviceNames' => ['Mac'],
            'requirements' => ['systems' => ['macOS'], 'minVersion' => '13.0', 'displayVersion' => '13', 'releaseName' => 'Ventura'],
            'architectures' => ['arm64', 'x86_64'],
            'universalBinary' => true,
            'assetTemplate' => 'TablePro-{version}.dmg',
            'destinations' => [
                ['kind' => 'dmg'],
                ['kind' => 'homebrew', 'command' => 'brew install --cask tablepro'],
                ['kind' => 'releases', 'url' => 'https://github.com/TableProApp/TablePro/releases'],
            ],
            'release' => ['version' => '0.77.0', 'publishedAt' => '2026-10-02'],
            'floorVersion' => '0.76.1',
        ],
        'ios' => [
            'id' => 'ios',
            'status' => 'released',
            'deviceNames' => ['iPhone', 'iPad'],
            'requirements' => ['systems' => ['iOS', 'iPadOS'], 'minVersion' => '18.0', 'displayVersion' => '18', 'releaseName' => null],
            'destinations' => [['kind' => 'app-store', 'url' => 'https://apps.apple.com/app/tablepro/id6761621829']],
            'release' => ['version' => '1.0', 'build' => '22', 'publishedAt' => '2026-09-22'],
            'storefrontExclusions' => ['fr'],
            'price' => ['amount' => 0, 'inAppPurchases' => false],
        ],
        'linux' => ['id' => 'linux', 'status' => 'prototype'],
        'windows' => ['id' => 'windows', 'status' => 'none'],
    ];

    foreach ($overrides as $key => $value) {
        Arr::set($platforms, $key, $value);
    }

    $data = ['verifiedAt' => '2026-10-02', 'platforms' => array_values(array_filter($platforms, fn(mixed $entry): bool => is_array($entry)))];

    $path = tempnam(sys_get_temp_dir(), 'platforms') ?: throw new RuntimeException('No temp file.');
    file_put_contents($path, json_encode($data, JSON_THROW_ON_ERROR));
    register_shutdown_function(static fn(): bool => @unlink($path));

    app()->instance(PlatformCatalog::class, new PlatformCatalog($path));

    return $data;
}

// The live platforms.json with Linux at `$status`, for the pages that show Linux only once it ships. Returns the Linux record.
function bindPlatformsWithLinux(string $status): array
{
    $data = json_decode((string) file_get_contents(resource_path('data/platforms.json')), true, 512, JSON_THROW_ON_ERROR);
    $data['platforms'] = array_map(fn(array $platform): array => $platform['id'] === 'linux' ? [...$platform, 'status' => $status] : $platform, $data['platforms']);

    $path = tempnam(sys_get_temp_dir(), 'platforms') ?: throw new RuntimeException('No temp file.');
    file_put_contents($path, json_encode($data, JSON_THROW_ON_ERROR));
    register_shutdown_function(static fn(): bool => @unlink($path));

    app()->instance(PlatformCatalog::class, new PlatformCatalog($path));

    return collect($data['platforms'])->firstWhere('id', 'linux');
}

function githubReleasePayload(string $tag = 'v0.77.0', array $overrides = [], ?array $assets = null): array
{
    $version = ltrim($tag, 'v');

    return [
        'tag_name' => $tag,
        'name' => $tag,
        'draft' => false,
        'prerelease' => false,
        'html_url' => "https://github.com/TableProApp/TablePro/releases/tag/{$tag}",
        'published_at' => '2026-10-02T04:15:45Z',
        'assets' => $assets ?? [
            githubAsset("OracleDriver-{$version}.zip", 10_224_221, $tag),
            githubAsset("TablePro-{$version}-dSYMs.zip", 182_735_436, $tag),
            githubAsset("TablePro-{$version}.dmg", 65_432_179, $tag),
            githubAsset("TablePro-{$version}.tar.xz", 41_754_460, $tag),
        ],
        ...$overrides,
    ];
}

function githubAsset(string $name, int $size, string $tag = 'v0.77.0', ?string $digest = null): array
{
    return [
        'name' => $name,
        'size' => $size,
        'state' => 'uploaded',
        'browser_download_url' => "https://github.com/TableProApp/TablePro/releases/download/{$tag}/{$name}",
        'digest' => $digest,
    ];
}

function githubReleasePayloadWithDigest(string $sha256): array
{
    return githubReleasePayload(assets: [
        githubAsset('TablePro-0.77.0.dmg', 65_432_179, digest: "sha256:{$sha256}"),
    ]);
}

function appcastBuild(string $version): int
{
    [$major, $minor, $patch] = array_map('intval', explode('.', $version . '.0.0'));

    return (($major * 1000 + $minor) * 100 + $patch) * 100 + 99;
}

function appcastXml(string $version = '0.77.0', string $pubDate = 'Fri, 02 Oct 2026 04:15:25 +0000', string $minimum = '13.0'): string
{
    $build = appcastBuild($version);

    return <<<XML
        <?xml version="1.0" standalone="yes"?>
        <rss xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle" version="2.0">
            <channel>
                <title>TablePro</title>
                <item>
                    <title>0.99.0-beta.1</title>
                    <pubDate>Sat, 03 Oct 2026 04:15:25 +0000</pubDate>
                    <sparkle:channel>beta</sparkle:channel>
                    <sparkle:version>990001</sparkle:version>
                    <sparkle:shortVersionString>0.99.0-beta.1</sparkle:shortVersionString>
                    <sparkle:minimumSystemVersion>14.0</sparkle:minimumSystemVersion>
                    <enclosure url="https://github.com/TableProApp/TablePro/releases/download/v0.99.0-beta.1/TablePro-0.99.0-beta.1.tar.xz" length="41754460" type="application/octet-stream"/>
                </item>
                <item>
                    <title>{$version}</title>
                    <pubDate>{$pubDate}</pubDate>
                    <sparkle:version>{$build}</sparkle:version>
                    <sparkle:shortVersionString>{$version}</sparkle:shortVersionString>
                    <sparkle:minimumSystemVersion>{$minimum}</sparkle:minimumSystemVersion>
                    <enclosure url="https://github.com/TableProApp/TablePro/releases/download/v{$version}/TablePro-{$version}.tar.xz" length="41754460" type="application/octet-stream"/>
                </item>
                <item>
                    <title>0.76.1</title>
                    <pubDate>Mon, 28 Sep 2026 22:46:49 +0000</pubDate>
                    <sparkle:version>760199</sparkle:version>
                    <sparkle:shortVersionString>0.76.1</sparkle:shortVersionString>
                    <sparkle:minimumSystemVersion>13.0</sparkle:minimumSystemVersion>
                </item>
            </channel>
        </rss>
        XML;
}
