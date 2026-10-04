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
 * for a file that names none: `TablePro-{version}-{arch}.dmg` has held from
 * 0.73 to 0.77 and is enforced by the app's release job (`build.yml:254-270`).
 *
 * A missing or unreadable file reads as empty rather than throwing, so a
 * broken data file degrades the download page to its GitHub fallback instead
 * of taking it down. `Data/PlatformsDataTest` is what keeps the file valid.
 *
 * @phpstan-type Requirements array{systems: list<string>, minVersion: string, displayVersion: string, releaseName: string|null}
 * @phpstan-type Destination array{kind: string, url?: string, command?: string}
 * @phpstan-type Platform array{id: string, status: string, deviceNames?: list<string>, requirements?: Requirements, architectures?: list<array{id: string, assetTemplate?: string}>, destinations?: list<Destination>, release?: array{version?: string, build?: string, publishedAt?: string}, floorVersion?: string, price?: array{amount?: int|float, inAppPurchases?: bool}, storefrontExclusions?: list<string>}
 */
class PlatformCatalog
{
    /**
     * The two architectures the Mac app ships as separate builds, in display order.
     */
    public const MAC_ARCHITECTURES = ['arm64', 'x86_64'];

    private const DEFAULT_ASSET_TEMPLATE = 'TablePro-{version}-{arch}.dmg';

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
     * The DMG file name for one Mac architecture and version.
     */
    public function macAssetName(string $arch, string $version): string
    {
        $template = self::DEFAULT_ASSET_TEMPLATE;

        foreach ($this->find('mac')['architectures'] ?? [] as $architecture) {
            if (is_array($architecture) && ($architecture['id'] ?? null) === $arch && is_string($architecture['assetTemplate'] ?? null)) {
                $template = $architecture['assetTemplate'];
            }
        }

        return strtr($template, ['{version}' => $version, '{arch}' => $arch]);
    }

    /**
     * The DMG's download URL for one Mac architecture and version, from the
     * `dmg` destination's `urlTemplate`, or null when the file names none.
     */
    public function macAssetUrl(string $arch, string $version): ?string
    {
        $template = $this->destination('mac', 'dmg')['urlTemplate'] ?? null;

        if (! is_string($template) || ! str_starts_with($template, 'https://')) {
            return null;
        }

        return strtr($template, ['{version}' => $version, '{arch}' => $arch]);
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
     * The facts the download page states about a released platform, or null
     * when the platform is not released.
     *
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
