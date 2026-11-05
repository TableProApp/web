<?php

use Illuminate\Support\Facades\File;

function platformsJson(): array
{
    static $data = null;

    return $data ??= json_decode(File::get(resource_path('data/platforms.json')), true, 512, JSON_THROW_ON_ERROR);
}

function platformsEntry(string $id): array
{
    return collect(platformsJson()['platforms'])->firstWhere('id', $id) ?? throw new RuntimeException("platforms.json has no {$id}");
}

it('is dated and gives every platform a known status', function (): void {
    $ids = array_column(platformsJson()['platforms'], 'id');

    expect(platformsJson()['verifiedAt'] <= now()->toDateString())->toBeTrue('verifiedAt is in the future')
        ->and($ids)->toBe(array_values(array_unique($ids)))
        ->and(platformsEntry('mac')['status'])->toBe('released');

    foreach (platformsJson()['platforms'] as $platform) {
        expect($platform['status'])->toBeIn(['released', 'prototype', 'none']);
    }
});

it('gives a released platform everything a page needs and an unreleased one nothing', function (): void {
    foreach (platformsJson()['platforms'] as $platform) {
        if ($platform['status'] !== 'released') {
            expect(array_keys($platform))->toBe(['id', 'status'], "{$platform['id']} is not released, so it carries nothing else");

            continue;
        }

        expect($platform)->toHaveKeys(['deviceNames', 'page', 'requirements', 'destinations', 'release', 'appLanguages'])
            ->and($platform['requirements']['minVersion'])->toMatch('/^\d+\.\d+$/')
            ->and($platform['release']['publishedAt'] <= now()->toDateString())->toBeTrue("{$platform['id']} is released in the future")
            ->and($platform['destinations'])->not->toBeEmpty()
            ->and($platform['appLanguages'])->toBe(array_values(array_unique($platform['appLanguages'])));

        foreach ($platform['destinations'] as $destination) {
            foreach (['url', 'urlTemplate'] as $key) {
                if (isset($destination[$key])) {
                    expect($destination[$key])->toStartWith('https://');
                }
            }
        }
    }
});

it('keeps the oldest Mac build served at or below the current release', function (): void {
    $mac = platformsEntry('mac');

    expect($mac['release']['version'])->toMatch('/^\d+\.\d+\.\d+$/')
        ->and(version_compare($mac['floorVersion'], $mac['release']['version'], '<='))->toBeTrue();
});

it('builds the DMG link from the version alone', function (): void {
    $dmg = collect(platformsEntry('mac')['destinations'])->firstWhere('kind', 'dmg');

    expect($dmg['urlTemplate'])->toContain('{version}')->not->toContain('{arch}');
});

it('links the App Store without a country segment', function (): void {
    $store = collect(platformsEntry('ios')['destinations'])->firstWhere('kind', 'app-store');

    expect($store['url'])->toMatch('#^https://apps\.apple\.com/app/[a-z0-9-]+/id\d+$#')
        ->and($store['url'])->toEndWith('/id' . $store['appId']);

    foreach (platformsEntry('ios')['storefrontExclusions'] as $code) {
        expect($code)->toMatch('/^[a-z]{2}$/');
    }
});
