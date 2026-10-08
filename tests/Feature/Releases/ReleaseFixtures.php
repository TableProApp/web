<?php

use App\Services\Releases\PlatformCatalog;
use Illuminate\Support\Arr;

/*
|--------------------------------------------------------------------------
| Release fixtures
|--------------------------------------------------------------------------
|
| Shared by the release, download-page and `release:check` tests. Not a test
| file itself (Pest loads only `*Test.php`), so each test file requires it.
|
| The tests never read the live resources/data/platforms.json: its values move
| with every release, and a test pinned to them would fail for a reason that
| has nothing to do with the code. `Data/PlatformsDataTest` guards that file.
| They bind a fixture with the same schema (architecture §1.8) instead.
|
*/

const RELEASES_FAKE_GITHUB_LATEST = 'api.github.com/repos/TableProApp/TablePro/releases/latest';

const RELEASES_FAKE_APPCAST = 'raw.githubusercontent.com/TableProApp/TablePro/main/appcast.xml';

/**
 * A platforms.json with the architecture §1.8 schema, merged with `$overrides`
 * (dot keys on the `mac`/`ios` entries, e.g. `['mac.floorVersion' => '0.77.0']`),
 * bound as the `PlatformCatalog` every service resolves.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function bindReleaseFixturePlatforms(array $overrides = []): array
{
    $platforms = [
        'mac' => [
            'id' => 'mac',
            'status' => 'released',
            'deviceNames' => ['Mac'],
            'requirements' => ['systems' => ['macOS'], 'minVersion' => '13.0', 'displayVersion' => '13', 'releaseName' => 'Ventura'],
            'architectures' => [
                ['id' => 'arm64', 'assetTemplate' => 'TablePro-{version}-arm64.dmg'],
                ['id' => 'x86_64', 'assetTemplate' => 'TablePro-{version}-x86_64.dmg'],
            ],
            'universalBinary' => false,
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
            'storefrontExclusions' => ['at', 'be', 'de', 'fr'],
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

/**
 * A GitHub `releases/latest` payload for an app release with both DMGs.
 *
 * @param  array<string, mixed>  $overrides
 * @param  list<array<string, mixed>>|null  $assets
 * @return array<string, mixed>
 */
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
            githubAsset("TablePro-{$version}-arm64.dmg", 22_943_352),
            githubAsset("TablePro-{$version}-x86_64.dmg", 26_202_607),
            githubAsset("TablePro-{$version}-arm64.zip", 31_475_263),
            githubAsset("TablePro-{$version}-x86_64.zip", 33_766_590),
        ],
        ...$overrides,
    ];
}

/**
 * `$digest` is the API's `digest` field, `sha256:…` on a current upload and
 * null on an asset uploaded before GitHub computed one.
 *
 * @return array{name: string, size: int, state: string, browser_download_url: string, digest: string|null}
 */
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

/**
 * A release whose two DMGs carry the given SHA-256 digests.
 *
 * @return array<string, mixed>
 */
function githubReleasePayloadWithDigests(string $arm64, string $x86_64): array
{
    return githubReleasePayload(assets: [
        githubAsset('TablePro-0.77.0-arm64.dmg', 22_943_352, digest: "sha256:{$arm64}"),
        githubAsset('TablePro-0.77.0-x86_64.dmg', 26_202_607, digest: "sha256:{$x86_64}"),
    ]);
}

/**
 * A Sparkle feed whose top items are `$version`, the way the release job writes it.
 */
function appcastXml(string $version = '0.77.0', string $pubDate = 'Fri, 02 Oct 2026 04:15:25 +0000', string $minimum = '13.0'): string
{
    return <<<XML
        <?xml version="1.0" standalone="yes"?>
        <rss xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle" version="2.0">
            <channel>
                <title>TablePro</title>
                <item>
                    <title>{$version}</title>
                    <pubDate>{$pubDate}</pubDate>
                    <sparkle:version>134</sparkle:version>
                    <sparkle:shortVersionString>{$version}</sparkle:shortVersionString>
                    <sparkle:minimumSystemVersion>{$minimum}</sparkle:minimumSystemVersion>
                    <sparkle:hardwareRequirements>arm64</sparkle:hardwareRequirements>
                    <enclosure url="https://github.com/TableProApp/TablePro/releases/download/v{$version}/TablePro-{$version}-arm64.zip" length="32493803" type="application/octet-stream"/>
                </item>
                <item>
                    <title>{$version}</title>
                    <pubDate>{$pubDate}</pubDate>
                    <sparkle:version>134</sparkle:version>
                    <sparkle:shortVersionString>{$version}</sparkle:shortVersionString>
                    <sparkle:minimumSystemVersion>{$minimum}</sparkle:minimumSystemVersion>
                    <enclosure url="https://github.com/TableProApp/TablePro/releases/download/v{$version}/TablePro-{$version}-x86_64.zip" length="34904573" type="application/octet-stream"/>
                </item>
                <item>
                    <title>0.76.1</title>
                    <pubDate>Mon, 28 Sep 2026 22:46:49 +0000</pubDate>
                    <sparkle:version>133</sparkle:version>
                    <sparkle:shortVersionString>0.76.1</sparkle:shortVersionString>
                    <sparkle:minimumSystemVersion>13.0</sparkle:minimumSystemVersion>
                </item>
            </channel>
        </rss>
        XML;
}
