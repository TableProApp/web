<?php

namespace App\Services\Releases;

use Illuminate\Support\Carbon;

/**
 * The Mac release the download buttons point at, from wherever it was found.
 *
 * `source` says where: `github` (the releases API, with file sizes),
 * `appcast` (the Sparkle feed, no sizes) or `unavailable` (neither answered
 * and there is no earlier good copy). An unavailable release has no version,
 * and both of its asset URLs are GitHub's "latest release" page, so a button
 * still leads somewhere real while the page states no version it cannot
 * stand behind.
 *
 * `toArray()` is the cached, locale-neutral form. `toProps()` adds the date
 * formatted for the reader's locale, which is why the date is never cached
 * pre-formatted.
 *
 * @phpstan-type Asset array{name: string|null, url: string, bytes: int|null}
 * @phpstan-type Cached array{version: string|null, publishedAt: string|null, assets: array{arm64: Asset, x86_64: Asset}, releaseUrl: string, releasesUrl: string, source: string}
 */
final readonly class MacRelease
{
    public const SOURCE_GITHUB = 'github';

    public const SOURCE_APPCAST = 'appcast';

    public const SOURCE_UNAVAILABLE = 'unavailable';

    /**
     * @param  string|null  $version  e.g. `0.77.0`, without the `v`
     * @param  string|null  $publishedAt  `Y-m-d`
     * @param  array{arm64: array{name: string|null, url: string, bytes: int|null}, x86_64: array{name: string|null, url: string, bytes: int|null}}  $assets
     * @param  string  $releaseUrl  this release's page (notes and every asset), or the latest-release page
     * @param  string  $releasesUrl  every release
     */
    public function __construct(
        public ?string $version,
        public ?string $publishedAt,
        public array $assets,
        public string $releaseUrl,
        public string $releasesUrl,
        public string $source,
    ) {}

    /**
     * No release data at all: both buttons go to GitHub's latest-release page.
     */
    public static function unavailable(string $repo, string $releasesUrl): self
    {
        $latest = "https://github.com/{$repo}/releases/latest";
        $asset = ['name' => null, 'url' => $latest, 'bytes' => null];

        return new self(
            version: null,
            publishedAt: null,
            assets: ['arm64' => $asset, 'x86_64' => $asset],
            releaseUrl: $latest,
            releasesUrl: $releasesUrl,
            source: self::SOURCE_UNAVAILABLE,
        );
    }

    /**
     * Rebuilds a cached copy, or returns null when the copy is not one.
     *
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): ?self
    {
        $assets = $data['assets'] ?? null;

        if (! is_array($assets) || ! is_string($data['releaseUrl'] ?? null) || ! is_string($data['releasesUrl'] ?? null) || ! is_string($data['source'] ?? null)) {
            return null;
        }

        $normalized = [];

        foreach (PlatformCatalog::MAC_ARCHITECTURES as $arch) {
            $asset = $assets[$arch] ?? null;

            if (! is_array($asset) || ! is_string($asset['url'] ?? null)) {
                return null;
            }

            $normalized[$arch] = [
                'name' => is_string($asset['name'] ?? null) ? $asset['name'] : null,
                'url' => $asset['url'],
                'bytes' => is_int($asset['bytes'] ?? null) ? $asset['bytes'] : null,
            ];
        }

        return new self(
            version: is_string($data['version'] ?? null) ? $data['version'] : null,
            publishedAt: is_string($data['publishedAt'] ?? null) ? $data['publishedAt'] : null,
            assets: $normalized,
            releaseUrl: $data['releaseUrl'],
            releasesUrl: $data['releasesUrl'],
            source: $data['source'],
        );
    }

    public function isAvailable(): bool
    {
        return $this->source !== self::SOURCE_UNAVAILABLE;
    }

    /**
     * @return array{version: string|null, publishedAt: string|null, assets: array{arm64: array{name: string|null, url: string, bytes: int|null}, x86_64: array{name: string|null, url: string, bytes: int|null}}, releaseUrl: string, releasesUrl: string, source: string}
     */
    public function toArray(): array
    {
        return [
            'version' => $this->version,
            'publishedAt' => $this->publishedAt,
            'assets' => $this->assets,
            'releaseUrl' => $this->releaseUrl,
            'releasesUrl' => $this->releasesUrl,
            'source' => $this->source,
        ];
    }

    /**
     * The page prop: the cached form plus the date as the reader writes it.
     *
     * The date is formatted here, in PHP, and not in the browser: the ICU data
     * in the SSR process and in the reader's browser can differ, and a date
     * that renders differently on each side is a hydration mismatch
     * (architecture §1.5). `LL` is "October 2, 2026" in English and
     * "2 tháng 10 năm 2026" in Vietnamese.
     *
     * @return array{version: string|null, publishedAt: string|null, publishedAtFormatted: string|null, assets: array{arm64: array{name: string|null, url: string, bytes: int|null}, x86_64: array{name: string|null, url: string, bytes: int|null}}, releaseUrl: string, releasesUrl: string, source: string}
     */
    public function toProps(string $locale): array
    {
        $formatted = null;

        if ($this->publishedAt !== null) {
            try {
                $formatted = Carbon::createFromFormat('!Y-m-d', $this->publishedAt)?->locale($locale)->isoFormat('LL');
            } catch (\Throwable) {
                $formatted = null;
            }
        }

        return [
            ...$this->toArray(),
            'publishedAtFormatted' => $formatted ?: null,
        ];
    }
}
