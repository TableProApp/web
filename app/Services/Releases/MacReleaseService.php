<?php

namespace App\Services\Releases;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

/**
 * The current Mac release, for the download buttons (architecture §1.13).
 *
 * Primary source: GitHub's `releases/latest` for the app repository. Plugin
 * releases share that repository but are published with `--latest=false`
 * (`build-plugin.yml:325`), so "latest" is the app; a release is still
 * accepted only when it is neither a draft nor a prerelease and carries both
 * DMGs, named for its own version. That rejects a plugin release that slipped
 * through, and an app release caught halfway through its upload.
 *
 * Fallback: the top item of the Sparkle appcast, with the DMG names and URLs
 * built from `platforms.json` (`assetTemplate`, and the `dmg` destination's
 * `urlTemplate`). Never the first item of the full releases list, which plugin
 * releases crowd.
 *
 * Caching, so the unauthenticated API (60 calls an hour per IP, on a host
 * shared with other sites) sees at most four calls an hour in every state,
 * healthy or not:
 *
 * - a fresh copy for 15 minutes under `releases:mac`;
 * - when both sources fail, a 15-minute failure marker stops every request in
 *   that window from retrying, and the last good copy is served. The marker
 *   is as long as the fresh copy, so an outage costs no more calls than a
 *   healthy hour (architecture §1.13 "Rate"; its 5-minute marker would allow
 *   twelve);
 * - every success also writes the last good copy to
 *   `storage/app/private/releases/mac-last-good.json`, kept until the next
 *   success. It is a file and not a cache entry because the deploy runs
 *   `optimize:clear`, whose `cache:clear` empties the cache store: a copy kept
 *   there "forever" was gone after every PHP deploy, exactly when a cold
 *   cache makes the first request depend on GitHub;
 * - with no good copy ever, the release is `unavailable`: both buttons open
 *   GitHub's latest-release page and no version is shown.
 *
 * `Cache::remember()` is deliberately not used: it never stores `null`, which
 * is how the pre-rebuild controller retried a failing API on every request.
 */
class MacReleaseService
{
    public const CACHE_KEY = 'releases:mac';

    /**
     * The disk and path of the last good copy: outside the cache store, so
     * `cache:clear` leaves it alone.
     */
    public const LAST_GOOD_DISK = 'local';

    public const LAST_GOOD_FILE = 'releases/mac-last-good.json';

    public const FAILURE_KEY = 'releases:mac:failed';

    public const FRESH_SECONDS = 900;

    public const FAILURE_SECONDS = 900;

    private const TIMEOUT_SECONDS = 5;

    public function __construct(
        private readonly PlatformCatalog $platforms,
        private readonly SparkleAppcast $appcast,
    ) {}

    public function latest(): MacRelease
    {
        $fresh = $this->cached(self::CACHE_KEY);

        if ($fresh !== null) {
            return $fresh;
        }

        if (! Cache::has(self::FAILURE_KEY)) {
            $release = $this->fromGitHub() ?? $this->fromAppcast();

            if ($release !== null) {
                Cache::put(self::CACHE_KEY, $release->toArray(), self::FRESH_SECONDS);
                $this->keepLastGood($release);

                return $release;
            }

            Cache::put(self::FAILURE_KEY, true, self::FAILURE_SECONDS);
        }

        return $this->lastGood() ?? MacRelease::unavailable($this->repo(), $this->releasesUrl());
    }

    /**
     * The last release either source returned, or null when none ever did.
     */
    public function lastGood(): ?MacRelease
    {
        try {
            $raw = Storage::disk(self::LAST_GOOD_DISK)->get(self::LAST_GOOD_FILE);
        } catch (\Throwable) {
            return null;
        }

        $value = is_string($raw) ? json_decode($raw, true) : null;

        return is_array($value) ? MacRelease::fromArray($value) : null;
    }

    /**
     * Rewrites the last good copy when it changed. A disk that refuses the
     * write costs only the fallback, never the page.
     */
    private function keepLastGood(MacRelease $release): void
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

    /**
     * The release from GitHub's `releases/latest`, or null when it is missing,
     * not an app release, or not complete.
     */
    public function fromGitHub(): ?MacRelease
    {
        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->withHeaders(['Accept' => 'application/vnd.github+json', 'X-GitHub-Api-Version' => '2022-11-28'])
                ->get('https://api.github.com/repos/' . $this->repo() . '/releases/latest');
        } catch (\Throwable) {
            return null;
        }

        if (! $response->ok() || ! is_array($response->json())) {
            return null;
        }

        /** @var array<string, mixed> $release */
        $release = $response->json();

        if (($release['draft'] ?? false) === true || ($release['prerelease'] ?? false) === true) {
            return null;
        }

        $version = $this->versionFromTag((string) ($release['tag_name'] ?? ''));

        if ($version === null) {
            return null;
        }

        $assets = [];

        foreach (PlatformCatalog::MAC_ARCHITECTURES as $arch) {
            $asset = $this->findAsset($release['assets'] ?? [], $this->platforms->macAssetName($arch, $version));

            if ($asset === null) {
                return null;
            }

            $assets[$arch] = $asset;
        }

        $htmlUrl = $release['html_url'] ?? null;

        return new MacRelease(
            version: $version,
            publishedAt: $this->date($release['published_at'] ?? null),
            assets: $assets,
            releaseUrl: is_string($htmlUrl) && str_starts_with($htmlUrl, 'https://') ? $htmlUrl : $this->tagUrl($version),
            releasesUrl: $this->releasesUrl(),
            source: MacRelease::SOURCE_GITHUB,
        );
    }

    /**
     * The release from the Sparkle appcast's top item, or null. Sizes are not
     * in the feed (its enclosures are the update zips), so they stay null.
     */
    public function fromAppcast(): ?MacRelease
    {
        $item = $this->appcast->latest();

        if ($item === null) {
            return null;
        }

        $version = $item['version'];
        $assets = [];

        foreach (PlatformCatalog::MAC_ARCHITECTURES as $arch) {
            $name = $this->platforms->macAssetName($arch, $version);

            $assets[$arch] = [
                'name' => $name,
                'url' => $this->platforms->macAssetUrl($arch, $version)
                    ?? 'https://github.com/' . $this->repo() . "/releases/download/v{$version}/" . rawurlencode($name),
                'bytes' => null,
            ];
        }

        return new MacRelease(
            version: $version,
            publishedAt: $item['publishedAt'],
            assets: $assets,
            releaseUrl: $this->tagUrl($version),
            releasesUrl: $this->releasesUrl(),
            source: MacRelease::SOURCE_APPCAST,
        );
    }

    private function cached(string $key): ?MacRelease
    {
        $value = Cache::get($key);

        return is_array($value) ? MacRelease::fromArray($value) : null;
    }

    /**
     * `v0.77.0` → `0.77.0`. Anything else, such as `plugin-etcd-v1.0.25`, is null.
     */
    private function versionFromTag(string $tag): ?string
    {
        if (preg_match('/^v(\d+(?:\.\d+)*)$/', $tag, $matches) !== 1) {
            return null;
        }

        return $matches[1];
    }

    /**
     * The uploaded asset with exactly this name.
     *
     * @return array{name: string, url: string, bytes: int|null}|null
     */
    private function findAsset(mixed $assets, string $name): ?array
    {
        if (! is_array($assets)) {
            return null;
        }

        foreach ($assets as $asset) {
            if (! is_array($asset) || ($asset['name'] ?? null) !== $name) {
                continue;
            }

            $url = $asset['browser_download_url'] ?? null;
            $state = $asset['state'] ?? 'uploaded';

            if (! is_string($url) || ! str_starts_with($url, 'https://') || $state !== 'uploaded') {
                return null;
            }

            $bytes = $asset['size'] ?? null;

            return [
                'name' => $name,
                'url' => $url,
                'bytes' => is_int($bytes) && $bytes > 0 ? $bytes : null,
            ];
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

    private function tagUrl(string $version): string
    {
        return 'https://github.com/' . $this->repo() . "/releases/tag/v{$version}";
    }

    /**
     * Every release, from `platforms.json` when it names the page, else GitHub's.
     */
    private function releasesUrl(): string
    {
        $url = $this->platforms->destination('mac', 'releases')['url'] ?? null;

        return is_string($url) && str_starts_with($url, 'https://') ? $url : 'https://github.com/' . $this->repo() . '/releases';
    }
}
