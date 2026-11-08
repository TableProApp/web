<?php

use App\Support\Localization\Locales;
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

it('counts a license in computers, not Macs, and never says Linux lacks the paid features, once Linux ships', function (): void {
    if (platformsEntry('linux')['status'] !== 'released') {
        $this->markTestSkipped('Linux is not released.');
    }

    $sources = [...File::allFiles(resource_path('data/content/en')), ...File::files(resource_path('data/legal/en')), resource_path('js/i18n/messages/en/pricing.ts')];

    foreach ($sources as $source) {
        $path = (string) $source;

        expect(File::get($path))
            ->not->toMatch('/\{(deviceLimit|activations|count)\} Macs/', "{$path} counts a license in Macs")
            ->not->toMatch('/Linux prototype/', "{$path} calls Linux a prototype")
            ->not->toMatch('/on the Mac for now|in the Mac app only|In TablePro for macOS|(features|these|\\}) to the Mac app|includes in the Mac app|features of the Mac app|rest of the Mac app|Mac app renews/', "{$path} says Linux lacks the paid features");
    }
});

it('never ties the paid plans to the Mac app in any language, once Linux ships', function (): void {
    if (platformsEntry('linux')['status'] !== 'released') {
        $this->markTestSkipped('Linux is not released.');
    }

    $keys = [
        'pricing.json' => ['seo.description', 'header.lead'],
        'about.json' => ['facts.funding.text', 'principles.items.3.text'],
        'black-friday.json' => ['includes.lead'],
        'databases/index.json' => ['closing.body'],
        'features/index.json' => ['closing.body'],
        'compare/index.json' => ['labels.tablepro.priceFree'],
    ];

    foreach (Locales::codes() as $locale) {
        foreach ($keys as $file => $paths) {
            $content = json_decode(File::get(resource_path("data/content/{$locale}/{$file}")), true, 512, JSON_THROW_ON_ERROR);

            foreach ($paths as $path) {
                expect(data_get($content, $path))->toBeString()->not->toMatch('/Mac/', "{$locale}/{$file} {$path}");
            }
        }

        $faq = File::get(resource_path("data/content/{$locale}/faq.json"));
        preg_match('/"[^"\\n]*\\{starterFeatures\\}[^"\\n]*"/u', $faq, $answer);

        expect($answer)->not->toBeEmpty("{$locale} faq has no {starterFeatures} answer")
            ->and($answer[0])->not->toMatch('/Mac/', "{$locale} faq says Pro adds features to the Mac app");

        $pricing = File::get(resource_path("js/i18n/messages/{$locale}/pricing.ts"));
        preg_match_all('/^\\s*"?(lead|caption)"?: .*$/m', $pricing, $lines);

        foreach ($lines[0] as $line) {
            expect($line)->not->toMatch('/Mac/', "{$locale} pricing.ts: {$line}");
        }
    }
});

it('labels a link to the platform chooser Download, not Download for Mac, once Linux ships', function (): void {
    if (platformsEntry('linux')['status'] !== 'released') {
        $this->markTestSkipped('Linux is not released.');
    }

    // The DMG button on /download is the only Mac-specific download.
    $allowed = ['components/download/mac-download.tsx'];

    foreach (File::allFiles(resource_path('js')) as $file) {
        $path = str_replace(resource_path('js') . '/', '', $file->getPathname());

        if (str_starts_with($path, 'i18n/') || in_array($path, $allowed, true)) {
            continue;
        }

        expect($file->getContents())->not->toMatch('/m\\.download\\.macCta/', "{$path} labels a link to /download Download for Mac");
    }
});

it('gives a released platform everything a page needs and an unreleased one nothing', function (): void {
    foreach (platformsJson()['platforms'] as $platform) {
        // Linux carries its record before it ships, so the pages can be built against it; its status alone shows it.
        if ($platform['status'] !== 'released' && $platform['id'] !== 'linux') {
            expect(array_keys($platform))->toBe(['id', 'status'], "{$platform['id']} is not released, so it carries nothing else");

            continue;
        }

        if ($platform['id'] === 'linux') {
            expect($platform)->toHaveKeys(['channel', 'deviceNames', 'page', 'distributions', 'architectures', 'destinations', 'release', 'appLanguages']);

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

it('installs Linux from a repository on its channel, or from a release file of a known name', function (): void {
    $linux = platformsEntry('linux');
    $destinations = collect($linux['destinations'])->keyBy('kind');
    $suffix = $linux['channel'] === 'beta' ? '-beta' : '';

    expect($linux['channel'])->toBeIn(['beta', 'stable'])
        ->and($linux['release']['version'])->toMatch('/^\d+\.\d+\.\d+(-beta\.\d+)?$/')
        ->and($linux['architectures'])->toBe(['x86_64', 'arm64'])
        ->and($destinations->keys()->all())->toBe(['ppa', 'copr', 'flatpak', 'packages'])
        ->and($destinations['ppa']['repository'])->toBe("ppa:tablepro/tablepro{$suffix}")
        ->and($destinations['copr']['repository'])->toBe("@tablepro/tablepro{$suffix}")
        ->and($destinations['flatpak']['url'])->toStartWith('https://flatpak.tablepro.app/' . ($linux['channel'] === 'beta' ? 'beta-repo' : 'repo') . '/');

    foreach (['ppa', 'copr', 'flatpak'] as $kind) {
        expect($destinations[$kind]['channel'])->toBe($linux['channel'])
            ->and($destinations[$kind]['commands'])->not->toBeEmpty();

        foreach ($destinations[$kind]['commands'] as $command) {
            expect($command)->toMatch('/^(sudo |flatpak )/')->not->toContain('$ ');
        }
    }

    expect(collect($linux['distributions'])->pluck('via')->all())->toBe(['ppa', 'copr', 'flatpak']);

    foreach ($destinations['packages']['assets'] as $asset) {
        expect($asset['template'])->toContain('{version}')->toContain('{arch}')
            ->and(array_keys($asset['arch']))->toBe($linux['architectures']);
    }
});

it('lists the platforms desktop first: Mac, Windows, Linux, then iPhone and iPad', function (): void {
    $ids = array_column(platformsJson()['platforms'], 'id');

    expect($ids)->toBe(['mac', 'windows', 'linux', 'ios']);
});
