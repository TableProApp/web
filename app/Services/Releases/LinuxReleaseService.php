<?php

namespace App\Services\Releases;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

use function Illuminate\Support\defer;

// Linux releases are published with --latest=false, so this lists releases and keeps the newest linux-v* tag on the
// channel platforms.json names. Until GitHub has answered once, the release recorded there stands in.
class LinuxReleaseService
{
    public const CACHE_KEY = 'releases:linux';

    public const LAST_GOOD_DISK = 'local';

    public const LAST_GOOD_FILE = 'releases/linux-last-good.json';

    public const FAILURE_KEY = 'releases:linux:failed';

    public const FRESH_SECONDS = 1800;

    public const FAILURE_SECONDS = 900;

    public const REFRESH_LOCK = 'releases:linux:refreshing';

    public const REFRESH_LOCK_SECONDS = 15;

    private const TIMEOUT_SECONDS = 5;

    public function __construct(
        private readonly PlatformCatalog $platforms,
    ) {}

    public function latest(): ?LinuxRelease
    {
        $value = Cache::get(self::CACHE_KEY);
        $fresh = is_array($value) ? LinuxRelease::fromArray($value) : null;

        if ($fresh !== null) {
            return $fresh;
        }

        $this->refreshAfterResponse();

        return $this->lastGood() ?? $this->fromData();
    }

    public function refresh(): ?LinuxRelease
    {
        $lock = Cache::lock(self::REFRESH_LOCK, self::REFRESH_LOCK_SECONDS);

        if (! $lock->get()) {
            return null;
        }

        try {
            $release = $this->fromGitHub();

            if ($release === null) {
                Cache::put(self::FAILURE_KEY, true, self::FAILURE_SECONDS);

                return null;
            }

            Cache::put(self::CACHE_KEY, $release->toArray(), self::FRESH_SECONDS);
            Cache::forget(self::FAILURE_KEY);
            $this->keepLastGood($release);

            return $release;
        } finally {
            $lock->release();
        }
    }

    public function failing(): bool
    {
        return Cache::has(self::FAILURE_KEY);
    }

    public function fromGitHub(): ?LinuxRelease
    {
        $packages = $this->platforms->linuxPackages();

        if ($packages === null) {
            return null;
        }

        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->withHeaders(['Accept' => 'application/vnd.github+json', 'X-GitHub-Api-Version' => '2022-11-28'])
                ->get('https://api.github.com/repos/' . $this->repo() . '/releases', ['per_page' => 30]);
        } catch (\Throwable) {
            return null;
        }

        if (! $response->ok() || ! is_array($response->json()) || ! array_is_list($response->json())) {
            return null;
        }

        $stableOnly = $this->platforms->linuxChannel() === 'stable';

        foreach ($response->json() as $release) {
            if (! is_array($release) || ($release['draft'] ?? false) === true || ($stableOnly && ($release['prerelease'] ?? false) === true)) {
                continue;
            }

            $version = $this->versionFromTag((string) ($release['tag_name'] ?? ''), $packages['tagPrefix']);

            if ($version === null) {
                continue;
            }

            $assets = $this->assets($release['assets'] ?? [], $this->platforms->linuxAssetNames($version));

            if ($assets === []) {
                continue;
            }

            $htmlUrl = $release['html_url'] ?? null;

            return new LinuxRelease(
                version: $version,
                publishedAt: $this->date($release['published_at'] ?? null),
                prerelease: ($release['prerelease'] ?? false) === true,
                assets: $assets,
                checksumsUrl: $this->checksumsUrl($release['assets'] ?? [], $packages['checksums']),
                releaseUrl: is_string($htmlUrl) && str_starts_with($htmlUrl, 'https://') ? $htmlUrl : ($this->platforms->linuxTagUrl($version) ?? $this->releasesUrl()),
                releasesUrl: $this->releasesUrl(),
                source: LinuxRelease::SOURCE_GITHUB,
            );
        }

        return null;
    }

    public function fromData(): ?LinuxRelease
    {
        $release = $this->platforms->linuxDataRelease();
        $packages = $this->platforms->linuxPackages();

        if ($release === null || $packages === null) {
            return null;
        }

        $version = $release['version'];
        $base = 'https://github.com/' . $this->repo() . '/releases/download/' . $packages['tagPrefix'] . $version . '/';

        return new LinuxRelease(
            version: $version,
            publishedAt: $release['publishedAt'],
            prerelease: str_contains($version, '-'),
            assets: array_map(fn(string $name): array => ['name' => $name, 'url' => $base . rawurlencode($name), 'bytes' => null, 'sha256' => null], $this->platforms->linuxAssetNames($version)),
            checksumsUrl: $base . rawurlencode($packages['checksums']),
            releaseUrl: $this->platforms->linuxTagUrl($version) ?? $this->releasesUrl(),
            releasesUrl: $this->releasesUrl(),
            source: LinuxRelease::SOURCE_DATA,
        );
    }

    public function lastGood(): ?LinuxRelease
    {
        try {
            $raw = Storage::disk(self::LAST_GOOD_DISK)->get(self::LAST_GOOD_FILE);
        } catch (\Throwable) {
            return null;
        }

        $value = is_string($raw) ? json_decode($raw, true) : null;

        return is_array($value) ? LinuxRelease::fromArray($value) : null;
    }

    private function refreshAfterResponse(): void
    {
        if ($this->failing()) {
            return;
        }

        defer(function (): void {
            if (Cache::get(self::CACHE_KEY) === null && ! $this->failing()) {
                $this->refresh();
            }
        }, self::REFRESH_LOCK);
    }

    private function keepLastGood(LinuxRelease $release): void
    {
        try {
            $json = json_encode($release->toArray(), JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
            $disk = Storage::disk(self::LAST_GOOD_DISK);

            if ($disk->get(self::LAST_GOOD_FILE) !== $json) {
                $disk->put(self::LAST_GOOD_FILE, $json);
            }
        } catch (\Throwable) {
            return;
        }
    }

    private function versionFromTag(string $tag, string $prefix): ?string
    {
        $pattern = '/^' . preg_quote($prefix, '/') . '(\d+\.\d+\.\d+(?:-beta\.\d+)?)$/';

        return preg_match($pattern, $tag, $matches) === 1 ? $matches[1] : null;
    }

    /**
     * @param  list<string>  $names
     * @return list<array{name: string, url: string, bytes: int|null, sha256: string|null}>
     */
    private function assets(mixed $assets, array $names): array
    {
        if (! is_array($assets)) {
            return [];
        }

        $byName = [];

        foreach ($assets as $asset) {
            if (! is_array($asset) || ! is_string($asset['name'] ?? null) || ($asset['state'] ?? 'uploaded') !== 'uploaded') {
                continue;
            }

            $url = $asset['browser_download_url'] ?? null;

            if (! is_string($url) || ! str_starts_with($url, 'https://')) {
                continue;
            }

            $bytes = $asset['size'] ?? null;
            $digest = $asset['digest'] ?? null;

            $byName[$asset['name']] = [
                'name' => $asset['name'],
                'url' => $url,
                'bytes' => is_int($bytes) && $bytes > 0 ? $bytes : null,
                'sha256' => is_string($digest) && preg_match('/^sha256:([0-9a-f]{64})$/', $digest, $matches) === 1 ? $matches[1] : null,
            ];
        }

        $found = [];

        foreach ($names as $name) {
            if (isset($byName[$name])) {
                $found[] = $byName[$name];
            }
        }

        return $found;
    }

    private function checksumsUrl(mixed $assets, string $name): ?string
    {
        foreach (is_array($assets) ? $assets : [] as $asset) {
            if (is_array($asset) && ($asset['name'] ?? null) === $name && is_string($asset['browser_download_url'] ?? null) && str_starts_with($asset['browser_download_url'], 'https://')) {
                return $asset['browser_download_url'];
            }
        }

        return null;
    }

    private function date(mixed $timestamp): ?string
    {
        if (! is_string($timestamp) || $timestamp === '') {
            return null;
        }

        try {
            return Carbon::parse($timestamp)->utc()->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }

    private function repo(): string
    {
        return (string) config('services.github.repo');
    }

    private function releasesUrl(): string
    {
        $url = $this->platforms->linuxPackages()['url'] ?? null;

        return is_string($url) && str_starts_with($url, 'https://') ? $url : 'https://github.com/' . $this->repo() . '/releases';
    }
}
