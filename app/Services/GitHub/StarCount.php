<?php

namespace App\Services\GitHub;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

// Only the scheduled stars:refresh calls GitHub; a page reads the stored count.
// It is a file and not a cache entry because the deploy's optimize:clear empties the cache store.
class StarCount
{
    public const DISK = 'local';

    public const FILE = 'github/stars.json';

    private const TIMEOUT_SECONDS = 5;

    public function current(): ?int
    {
        try {
            $raw = Storage::disk(self::DISK)->get(self::FILE);
        } catch (\Throwable) {
            return null;
        }

        return $this->count(is_string($raw) ? json_decode($raw, true) : null);
    }

    public function refresh(): ?int
    {
        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->withHeaders(['Accept' => 'application/vnd.github+json', 'X-GitHub-Api-Version' => '2022-11-28'])
                ->get('https://api.github.com/repos/' . config('services.github.repo'));
        } catch (\Throwable) {
            return null;
        }

        $stars = $this->count($response->ok() ? $response->json('stargazers_count') : null);

        if ($stars === null) {
            return null;
        }

        try {
            Storage::disk(self::DISK)->put(self::FILE, (string) $stars);
        } catch (\Throwable) {
            return null;
        }

        return $stars;
    }

    private function count(mixed $value): ?int
    {
        return is_int($value) && $value >= 0 ? $value : null;
    }
}
