<?php

use Illuminate\Support\Facades\File;

/**
 * resources/data/platforms.json: where TablePro runs, what each build needs
 * and where to get it.
 *
 * The hero captions, the download page, the iPhone page, structured data and
 * `release:check` all read it, so a wrong value here is wrong everywhere at
 * once. The facts that drifted on the old site are pinned: the macOS 13
 * Ventura floor (the site said 14), two separate Mac builds (never
 * "Universal"), and an App Store link with no country segment.
 *
 * Values verified 2026-10-02: Mac 0.77.0 on GitHub, Sparkle and, from the
 * same day, the Homebrew cask (`floorVersion`, which trailed at 0.76.1 that
 * morning, re-checked at 0.77.0 in the afternoon); iOS 1.0 (build 22) on the
 * App Store, unchanged since 2026-09-22.
 */

/**
 * @return array{verifiedAt: string, platforms: list<array<string, mixed>>}
 */
function platformsDataFile(): array
{
    return json_decode(File::get(resource_path('data/platforms.json')), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @return array<string, mixed>
 */
function platformsDataEntry(string $id): array
{
    foreach (platformsDataFile()['platforms'] as $platform) {
        if ($platform['id'] === $id) {
            return $platform;
        }
    }

    throw new RuntimeException("platforms.json has no {$id} entry");
}

it('lists the four platforms with a known status', function (): void {
    $data = platformsDataFile();

    expect(array_keys($data))->toBe(['verifiedAt', 'platforms']);
    expect($data['verifiedAt'])->toMatch('/^\d{4}-\d{2}-\d{2}$/');
    expect($data['verifiedAt'] <= now()->toDateString())->toBeTrue('verifiedAt is in the future');
    expect(array_column($data['platforms'], 'id'))->toBe(['mac', 'ios', 'linux', 'windows']);

    foreach ($data['platforms'] as $platform) {
        expect($platform['status'])->toBeIn(['released', 'prototype', 'none']);
    }

    expect(platformsDataEntry('mac')['status'])->toBe('released');
    expect(platformsDataEntry('ios')['status'])->toBe('released');
    expect(platformsDataEntry('linux')['status'])->toBe('prototype');
    expect(platformsDataEntry('windows')['status'])->toBe('none');
});

it('gives a released platform everything a page needs and an unreleased one nothing', function (): void {
    $common = ['id', 'status', 'deviceNames', 'page', 'requirements', 'destinations', 'release', 'appLanguages'];

    foreach (platformsDataFile()['platforms'] as $platform) {
        if ($platform['status'] !== 'released') {
            expect(array_keys($platform))->toBe(['id', 'status'], "{$platform['id']} is not released, so it carries no requirement, destination or date");

            continue;
        }

        foreach ($common as $key) {
            expect($platform)->toHaveKey($key);
        }

        expect($platform['deviceNames'])->toBeArray()->not->toBeEmpty();
        expect($platform['page'] === null || str_starts_with($platform['page'], '/'))->toBeTrue();
        expect(array_keys($platform['requirements']))->toBe(['systems', 'minVersion', 'displayVersion', 'releaseName']);
        expect($platform['requirements']['systems'])->not->toBeEmpty();
        expect($platform['requirements']['minVersion'])->toMatch('/^\d+\.\d+$/');
        expect(str_starts_with($platform['requirements']['minVersion'], $platform['requirements']['displayVersion'] . '.'))->toBeTrue();
        expect($platform['destinations'])->not->toBeEmpty();
        expect(array_keys($platform['release']))->toBe(['version', 'build', 'publishedAt']);
        expect($platform['release']['publishedAt'])->toMatch('/^\d{4}-\d{2}-\d{2}$/');
        expect($platform['release']['publishedAt'] <= now()->toDateString())->toBeTrue();

        foreach ($platform['appLanguages'] as $tag) {
            expect($tag)->toMatch('/^[a-z]{2}(-[A-Z][a-z]{3})?$/', "{$tag} is not a BCP 47 language tag");
        }

        expect($platform['appLanguages'])->toBe(array_values(array_unique($platform['appLanguages'])));
        expect($platform['appLanguages'])->toContain('en')->toContain('vi');
    }
});

it('pins the Mac requirement to macOS 13 Ventura and never says 14 or Sonoma', function (): void {
    $mac = platformsDataEntry('mac');

    expect($mac['deviceNames'])->toBe(['Mac']);
    expect($mac['requirements'])->toBe([
        'systems' => ['macOS'],
        'minVersion' => '13.0',
        'displayVersion' => '13',
        'releaseName' => 'Ventura',
    ]);

    $raw = File::get(resource_path('data/platforms.json'));

    expect($raw)->not->toContain('Sonoma');
    expect(preg_match('/macOS\s*14|"minVersion":\s*"14/', $raw))->toBe(0);
});

it('ships separate Apple silicon and Intel builds, never a universal binary', function (): void {
    $mac = platformsDataEntry('mac');

    expect($mac['universalBinary'])->toBeFalse();
    expect(array_column($mac['architectures'], 'id'))->toBe(['arm64', 'x86_64']);

    foreach ($mac['architectures'] as $architecture) {
        expect($architecture['assetTemplate'])->toBe("TablePro-{version}-{$architecture['id']}.dmg");
    }

    $destinations = collect($mac['destinations'])->keyBy('kind');

    expect($destinations->keys()->all())->toBe(['dmg', 'homebrew', 'releases']);
    expect($destinations['dmg']['urlTemplate'])->toContain('{version}')->toContain('{arch}');
    expect($destinations['homebrew']['command'])->toBe('brew install --cask tablepro');
    expect($destinations['releases']['url'])->toBe('https://github.com/TableProApp/TablePro/releases');
});

it('keeps the Mac floor at or below the current release', function (): void {
    $mac = platformsDataEntry('mac');

    expect($mac['release']['version'])->toMatch('/^\d+\.\d+\.\d+$/');
    expect($mac['floorVersion'])->toMatch('/^\d+\.\d+\.\d+$/');
    expect(version_compare($mac['floorVersion'], $mac['release']['version'], '<='))->toBeTrue('floorVersion is newer than the release');
});

it('pins the iPhone and iPad app: free, no in-app purchases, iOS and iPadOS 18', function (): void {
    $ios = platformsDataEntry('ios');

    expect($ios['deviceNames'])->toBe(['iPhone', 'iPad']);
    expect($ios['page'])->toBe('/ios');
    expect($ios['requirements'])->toBe([
        'systems' => ['iOS', 'iPadOS'],
        'minVersion' => '18.0',
        'displayVersion' => '18',
        'releaseName' => null,
    ]);
    expect($ios['price'])->toBe(['amount' => 0, 'inAppPurchases' => false]);
    expect($ios['release']['version'])->toBe('1.0');
    expect($ios)->not->toHaveKey('architectures')->not->toHaveKey('floorVersion');
});

it('names the App Store build the iPhone and iPad copy was checked against', function (): void {
    /*
     * content/{en,vi}/ios.json, the FAQ and the privacy policy describe what
     * App Store 1.0 (build 22) does, and deliberately leave out what only the
     * unreleased source does: the iPad table list beside the browser, the
     * jump-host refusal, Redis key browsing, waiting for Face ID before a
     * connection opens (merged in the TablePro repository after build 22). A
     * new App Store build changes which of those sentences are true, so it has
     * to change this test and send someone back to that copy.
     */
    $release = platformsDataEntry('ios')['release'];

    expect($release['version'])->toBe('1.0', 'A new iOS version: review content/{en,vi}/ios.json, the FAQ and privacy.md against it, then update this test');
    expect($release['build'])->toBe('22', 'A new iOS build: review content/{en,vi}/ios.json, the FAQ and privacy.md against it, then update this test');
    expect($release['publishedAt'])->toBe('2026-09-22');
});

it('links the App Store without a country segment', function (): void {
    $ios = platformsDataEntry('ios');

    expect($ios['destinations'])->toHaveCount(1);

    $store = $ios['destinations'][0];

    expect($store['kind'])->toBe('app-store');
    expect($store['url'])->toMatch('#^https://apps\.apple\.com/app/[a-z0-9-]+/id\d+$#');
    expect($store['url'])->toEndWith('/id' . $store['appId']);
});

it('keeps the storefront exclusions as storefront codes for release:check only', function (): void {
    $exclusions = platformsDataEntry('ios')['storefrontExclusions'];

    expect($exclusions)->toBeArray();

    foreach ($exclusions as $code) {
        expect($code)->toMatch('/^[a-z]{2}$/');
    }

    expect($exclusions)->toBe(array_values(array_unique($exclusions)));
});

it('names the engines the iOS picker offers', function (): void {
    $engines = collect(json_decode(File::get(resource_path('data/engines.json')), true, 512, JSON_THROW_ON_ERROR))->keyBy('id');
    $iosEngines = platformsDataEntry('ios')['iosEngines'];

    expect($iosEngines)->toBe(array_values(array_unique($iosEngines)));

    foreach ($iosEngines as $id) {
        expect($engines->has($id))->toBeTrue("{$id} is not in engines.json");
        expect($engines[$id]['ios']['inPicker'])->toBeTrue("{$id} is not in the iOS picker");
    }

    $inPicker = $engines->filter(fn(array $engine): bool => $engine['ios']['inPicker'])->keys()->sort()->values()->all();

    expect(collect($iosEngines)->sort()->values()->all())->toBe($inPicker);
});

it('uses HTTPS for every destination URL', function (): void {
    foreach (platformsDataFile()['platforms'] as $platform) {
        foreach ($platform['destinations'] ?? [] as $destination) {
            foreach (['url', 'urlTemplate'] as $key) {
                if (isset($destination[$key])) {
                    expect($destination[$key])->toStartWith('https://');
                }
            }
        }
    }
});
