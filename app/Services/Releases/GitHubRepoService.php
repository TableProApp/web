<?php

namespace App\Services\Releases;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

/**
 * The app repository's star count, if the design shows one (architecture §1.13).
 *
 * The same pattern as `MacReleaseService`: a fresh copy for six hours, a
 * ten-minute failure marker so a failing API is not called again on every
 * request, and a last good copy in
 * `storage/app/private/releases/github-stars-last-good.json`, outside the
 * cache store that every PHP deploy's `optimize:clear` empties. Null only
 * when GitHub has never answered.
 */
class GitHubRepoService
{
    public const CACHE_KEY = 'github:stars';

    public const LAST_GOOD_DISK = 'local';

    public const LAST_GOOD_FILE = 'releases/github-stars-last-good.json';

    public const FAILURE_KEY = 'github:stars:failed';

    public const FRESH_SECONDS = 21600;

    public const FAILURE_SECONDS = 600;

    private const TIMEOUT_SECONDS = 5;

    public function stars(): ?int
    {
        $fresh = Cache::get(self::CACHE_KEY);

        if (is_int($fresh)) {
            return $fresh;
        }

        if (! Cache::has(self::FAILURE_KEY)) {
            $stars = $this->fetch();

            if ($stars !== null) {
                Cache::put(self::CACHE_KEY, $stars, self::FRESH_SECONDS);
                $this->keepLastGood($stars);

                return $stars;
            }

            Cache::put(self::FAILURE_KEY, true, self::FAILURE_SECONDS);
        }

        return $this->lastGood();
    }

    private function lastGood(): ?int
    {
        try {
            $raw = Storage::disk(self::LAST_GOOD_DISK)->get(self::LAST_GOOD_FILE);
        } catch (\Throwable) {
            return null;
        }

        $value = is_string($raw) ? json_decode($raw, true) : null;

        return is_int($value) && $value >= 0 ? $value : null;
    }

    private function keepLastGood(int $stars): void
    {
        try {
            $disk = Storage::disk(self::LAST_GOOD_DISK);

            if ($disk->get(self::LAST_GOOD_FILE) !== (string) $stars) {
                $disk->put(self::LAST_GOOD_FILE, (string) $stars);
            }
        } catch (\Throwable) {
            return;
        }
    }

    private function fetch(): ?int
    {
        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->withHeaders(['Accept' => 'application/vnd.github+json', 'X-GitHub-Api-Version' => '2022-11-28'])
                ->get('https://api.github.com/repos/' . config('services.github.repo'));
        } catch (\Throwable) {
            return null;
        }

        $stars = $response->ok() ? $response->json('stargazers_count') : null;

        return is_int($stars) && $stars >= 0 ? $stars : null;
    }
}
