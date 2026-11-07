<?php

namespace App\Services\Releases;

use Illuminate\Support\Facades\File;
use JsonException;

/**
 * Reads `resources/data/platforms.json`, the one record of where TablePro runs.
 *
 * The file is edited by hand (architecture §1.8); this class only reads it,
 * for the release service, `release:check` and the download page. It never
 * types a fact of its own except the DMG naming pattern, which is a fallback
 * for a file that names none: since 0.82.0 the app's release workflow uploads
 * one universal `TablePro-{version}.dmg`.
 *
 * A missing or unreadable file reads as empty rather than throwing, so a
 * broken data file degrades the download page to its GitHub fallback instead
 * of taking it down. `Data/PlatformsDataTest` is what keeps the file valid.
 *
 * @phpstan-type Requirements array{systems: list<string>, minVersion: string, displayVersion: string, releaseName: string|null}
 * @phpstan-type Destination array{kind: string, url?: string, command?: string}
 * @phpstan-type Platform array{id: string, status: string, deviceNames?: list<string>, requirements?: Requirements, architectures?: list<string>, universalBinary?: bool, assetTemplate?: string, destinations?: list<Destination>, release?: array{version?: string, build?: string, publishedAt?: string}, floorVersion?: string, price?: array{amount?: int|float, inAppPurchases?: bool}, storefrontExclusions?: list<string>}
 */
class PlatformCatalog
{
    private const DEFAULT_ASSET_TEMPLATE = 'TablePro-{version}.dmg';

    /**
     * @var list<array<string, mixed>>|null
     */
    private ?array $platforms = null;

    private readonly string $path;

    public function __construct(?string $path = null)
    {
        $this->path = $path ?? resource_path('data/platforms.json');
    }

    /**
     * Every platform entry, in data order.
     *
     * @return list<array<string, mixed>>
     */
    public function all(): array
    {
        if ($this->platforms !== null) {
            return $this->platforms;
        }

        $platforms = [];

        if (File::isFile($this->path)) {
            try {
                $decoded = json_decode((string) File::get($this->path), true, 512, JSON_THROW_ON_ERROR);
            } catch (JsonException) {
                $decoded = null;
            }

            if (is_array($decoded) && is_array($decoded['platforms'] ?? null)) {
                $platforms = array_values(array_filter($decoded['platforms'], 'is_array'));
            }
        }

        return $this->platforms = $platforms;
    }

    /**
     * One platform by id (`mac`, `ios`, `linux`, `windows`), or null.
     *
     * @return array<string, mixed>|null
     */
    public function find(string $id): ?array
    {
        foreach ($this->all() as $platform) {
            if (($platform['id'] ?? null) === $id) {
                return $platform;
            }
        }

        return null;
    }

    public function isReleased(string $id): bool
    {
        return ($this->find($id)['status'] ?? null) === 'released';
    }

    /**
     * The ids of the platforms with nothing to install, in data order.
     *
     * @return list<string>
     */
    public function unreleased(): array
    {
        $ids = [];

        foreach ($this->all() as $platform) {
            if (($platform['status'] ?? null) !== 'released' && is_string($platform['id'] ?? null)) {
                $ids[] = $platform['id'];
            }
        }

        return $ids;
    }

    /**
     * A platform's destination of one kind (`dmg`, `homebrew`, `releases`, `app-store`), or null.
     *
     * @return array<string, mixed>|null
     */
    public function destination(string $id, string $kind): ?array
    {
        foreach ($this->find($id)['destinations'] ?? [] as $destination) {
            if (is_array($destination) && ($destination['kind'] ?? null) === $kind) {
                return $destination;
            }
        }

        return null;
    }

    /**
     * The DMG file name for one Mac version.
     */
    public function macAssetName(string $version): string
    {
        $template = $this->find('mac')['assetTemplate'] ?? null;

        return strtr(is_string($template) && $template !== '' ? $template : self::DEFAULT_ASSET_TEMPLATE, ['{version}' => $version]);
    }

    /**
     * The DMG's download URL for one Mac version, from the `dmg` destination's
     * `urlTemplate`, or null when the file names none.
     */
    public function macAssetUrl(string $version): ?string
    {
        $template = $this->destination('mac', 'dmg')['urlTemplate'] ?? null;

        if (! is_string($template) || ! str_starts_with($template, 'https://')) {
            return null;
        }

        return strtr($template, ['{version}' => $version]);
    }

    /**
     * The version every channel serves at least: the Homebrew cask's while it
     * trails GitHub and Sparkle. Null when the file does not say.
     */
    public function macFloorVersion(): ?string
    {
        $floor = $this->find('mac')['floorVersion'] ?? null;

        return is_string($floor) && $floor !== '' ? $floor : null;
    }

    /**
     * The Linux packages destination: GitHub release file templates, the tag prefix and how to verify a file.
     *
     * @return array{url: string, tagPrefix: string, tagTemplate: string, assets: list<array{format: string, template: string, series: list<string>, arch: array<string, string>}>, checksums: string, verify: string}|null
     */
    public function linuxPackages(): ?array
    {
        $packages = $this->destination('linux', 'packages');

        if ($packages === null || ! is_string($packages['tagPrefix'] ?? null) || ! is_array($packages['assets'] ?? null)) {
            return null;
        }

        return $packages;
    }

    public function linuxChannel(): string
    {
        return ($this->find('linux')['channel'] ?? null) === 'stable' ? 'stable' : 'beta';
    }

    /**
     * @return array{deviceNames: list<string>, channel: string, distributions: list<array{id: string, name: string|null, versions: list<string>, via: string}>}|null
     */
    public function linuxSummary(): ?array
    {
        if (! $this->isReleased('linux')) {
            return null;
        }

        $platform = $this->find('linux') ?? [];
        $distributions = [];

        foreach (is_array($platform['distributions'] ?? null) ? $platform['distributions'] : [] as $distribution) {
            if (is_array($distribution) && is_string($distribution['id'] ?? null) && is_string($distribution['via'] ?? null)) {
                $distributions[] = [
                    'id' => $distribution['id'],
                    'name' => is_string($distribution['name'] ?? null) && $distribution['name'] !== '' ? $distribution['name'] : null,
                    'versions' => array_values(array_filter(is_array($distribution['versions'] ?? null) ? $distribution['versions'] : [], 'is_string')),
                    'via' => $distribution['via'],
                ];
            }
        }

        return [
            'deviceNames' => array_values(array_filter(is_array($platform['deviceNames'] ?? null) ? $platform['deviceNames'] : [], 'is_string')),
            'channel' => $this->linuxChannel(),
            'distributions' => $distributions,
        ];
    }

    /**
     * Every file a Linux release carries for each format, series and architecture, in data order.
     *
     * @return list<string>
     */
    public function linuxAssetNames(string $version): array
    {
        $names = [];

        foreach ($this->linuxPackages()['assets'] ?? [] as $asset) {
            $series = $asset['series'] === [] ? [null] : $asset['series'];

            foreach ($series as $one) {
                foreach ($asset['arch'] as $arch) {
                    $names[] = strtr($asset['template'], ['{version}' => $version, '{series}' => (string) $one, '{arch}' => $arch]);
                }
            }
        }

        return $names;
    }

    public function linuxTagUrl(string $version): ?string
    {
        $template = $this->linuxPackages()['tagTemplate'] ?? null;

        return is_string($template) && str_starts_with($template, 'https://') ? strtr($template, ['{version}' => $version]) : null;
    }

    /**
     * The release platforms.json records, for the page to show until GitHub answers.
     *
     * @return array{version: string, publishedAt: string|null}|null
     */
    public function linuxDataRelease(): ?array
    {
        $release = $this->find('linux')['release'] ?? null;

        if (! is_array($release) || ! is_string($release['version'] ?? null)) {
            return null;
        }

        return [
            'version' => $release['version'],
            'publishedAt' => is_string($release['publishedAt'] ?? null) ? $release['publishedAt'] : null,
        ];
    }

    /**
     * @return array{deviceNames: list<string>, requirements: array{systems: list<string>, minVersion: string, displayVersion: string, releaseName: string|null}}|null
     */
    public function summary(string $id): ?array
    {
        $platform = $this->find($id);

        if ($platform === null || ($platform['status'] ?? null) !== 'released') {
            return null;
        }

        $requirements = is_array($platform['requirements'] ?? null) ? $platform['requirements'] : [];

        return [
            'deviceNames' => array_values(array_filter($platform['deviceNames'] ?? [], 'is_string')),
            'requirements' => [
                'systems' => array_values(array_filter($requirements['systems'] ?? [], 'is_string')),
                'minVersion' => (string) ($requirements['minVersion'] ?? ''),
                'displayVersion' => (string) ($requirements['displayVersion'] ?? ''),
                'releaseName' => is_string($requirements['releaseName'] ?? null) ? $requirements['releaseName'] : null,
            ],
        ];
    }
}
