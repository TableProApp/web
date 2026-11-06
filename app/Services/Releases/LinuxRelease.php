<?php

namespace App\Services\Releases;

use Illuminate\Support\Carbon;

final readonly class LinuxRelease
{
    public const SOURCE_GITHUB = 'github';

    public const SOURCE_DATA = 'data';

    /**
     * @param  list<array{name: string, url: string, bytes: int|null, sha256: string|null}>  $assets
     */
    public function __construct(
        public string $version,
        public ?string $publishedAt,
        public bool $prerelease,
        public array $assets,
        public ?string $checksumsUrl,
        public string $releaseUrl,
        public string $releasesUrl,
        public string $source,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): ?self
    {
        if (! is_string($data['version'] ?? null) || ! is_string($data['releaseUrl'] ?? null) || ! is_string($data['releasesUrl'] ?? null) || ! is_string($data['source'] ?? null)) {
            return null;
        }

        $assets = [];

        foreach (is_array($data['assets'] ?? null) ? $data['assets'] : [] as $asset) {
            if (is_array($asset) && is_string($asset['name'] ?? null) && is_string($asset['url'] ?? null)) {
                $assets[] = [
                    'name' => $asset['name'],
                    'url' => $asset['url'],
                    'bytes' => is_int($asset['bytes'] ?? null) ? $asset['bytes'] : null,
                    'sha256' => is_string($asset['sha256'] ?? null) ? $asset['sha256'] : null,
                ];
            }
        }

        return new self(
            version: $data['version'],
            publishedAt: is_string($data['publishedAt'] ?? null) ? $data['publishedAt'] : null,
            prerelease: ($data['prerelease'] ?? false) === true,
            assets: $assets,
            checksumsUrl: is_string($data['checksumsUrl'] ?? null) ? $data['checksumsUrl'] : null,
            releaseUrl: $data['releaseUrl'],
            releasesUrl: $data['releasesUrl'],
            source: $data['source'],
        );
    }

    /**
     * @return array{version: string, publishedAt: string|null, prerelease: bool, assets: list<array{name: string, url: string, bytes: int|null, sha256: string|null}>, checksumsUrl: string|null, releaseUrl: string, releasesUrl: string, source: string}
     */
    public function toArray(): array
    {
        return [
            'version' => $this->version,
            'publishedAt' => $this->publishedAt,
            'prerelease' => $this->prerelease,
            'assets' => $this->assets,
            'checksumsUrl' => $this->checksumsUrl,
            'releaseUrl' => $this->releaseUrl,
            'releasesUrl' => $this->releasesUrl,
            'source' => $this->source,
        ];
    }

    /**
     * The date is written in the page's language here, so the server render and the browser agree.
     *
     * @return array<string, mixed>
     */
    public function toProps(string $locale): array
    {
        return [
            ...$this->toArray(),
            'publishedOn' => $this->publishedAt === null ? null : Carbon::parse($this->publishedAt)->locale($locale)->isoFormat('LL'),
        ];
    }
}
