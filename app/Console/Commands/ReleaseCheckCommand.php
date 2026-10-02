<?php

namespace App\Console\Commands;

use App\Services\Releases\MacReleaseService;
use App\Services\Releases\PlatformCatalog;
use App\Services\Releases\SparkleAppcast;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * Compares the live release channels with `resources/data/platforms.json`.
 *
 * Run by hand, never scheduled: the release facts the site states are data,
 * and this is how someone checks them before a launch or after a release
 * (spec §0: "re-check before final verification"). It reads, bypassing every
 * cache:
 *
 * - GitHub `releases/latest` against `mac.release.version` and `publishedAt`,
 *   and the Sparkle appcast against `mac.release.version` and
 *   `mac.requirements.minVersion`;
 * - the Homebrew cask API, and the lowest version of the three channels against
 *   `mac.floorVersion` (the 0.77 labels disappear when that is bumped);
 * - the iTunes lookup in the `us` storefront against `ios.release.version`,
 *   `ios.requirements.minVersion` and `ios.price.amount`;
 * - the iTunes lookup in the `de` storefront against `ios.storefrontExclusions`:
 *   `de` is expected to be missing when that list holds `de` or an `EU` entry.
 *
 * It prints one row per comparison and exits non-zero when any differs or any
 * source cannot be read, because an unchecked fact is not a checked one.
 */
#[Signature('release:check')]
#[Description('Compare GitHub, the Sparkle appcast, Homebrew and the App Store with resources/data/platforms.json.')]
class ReleaseCheckCommand extends Command
{
    private const TIMEOUT_SECONDS = 10;

    private const OK = 'ok';

    private const DRIFT = 'DRIFT';

    private const UNREADABLE = 'UNREADABLE';

    /**
     * @var list<array{0: string, 1: string, 2: string, 3: string, 4: string}>
     */
    private array $rows = [];

    public function handle(PlatformCatalog $platforms, MacReleaseService $releases, SparkleAppcast $appcast): int
    {
        $mac = $platforms->find('mac');
        $ios = $platforms->find('ios');

        if ($mac === null || $ios === null) {
            $this->components->error('resources/data/platforms.json has no `mac` or no `ios` entry.');

            return self::FAILURE;
        }

        $expectedVersion = $this->string($mac['release']['version'] ?? null);
        $channelVersions = [];

        $github = $releases->fromGitHub();
        $this->compare('GitHub releases/latest', 'version', $expectedVersion, $github?->version);
        $this->compare('GitHub releases/latest', 'published', $this->string($mac['release']['publishedAt'] ?? null), $github?->publishedAt);
        $channelVersions[] = $github?->version;

        $item = $appcast->latest();
        $this->compare('Sparkle appcast', 'version', $expectedVersion, $item['version'] ?? null);
        $this->compare('Sparkle appcast', 'minimum macOS', $this->string($mac['requirements']['minVersion'] ?? null), $item['minimumSystemVersion'] ?? null);
        $channelVersions[] = $item['version'] ?? null;

        $cask = $this->homebrewVersion();
        $this->compare('Homebrew cask', 'version', $expectedVersion, $cask, drift: false);
        $channelVersions[] = $cask;

        $this->compare('All Mac channels', 'floorVersion (lowest served)', $platforms->macFloorVersion(), $this->lowest($channelVersions));

        $appId = $this->appStoreId($platforms);
        $us = $appId !== null ? $this->lookup($appId, 'us') : null;
        $usApp = is_array($us) ? ($us['results'][0] ?? null) : null;

        $missing = is_array($us) && ! is_array($usApp) ? 'not listed' : null;

        $this->compare('App Store (us)', 'version', $this->string($ios['release']['version'] ?? null), $missing ?? $this->string($usApp['version'] ?? null), readable: $us !== null);
        $this->compare('App Store (us)', 'minimum iOS', $this->string($ios['requirements']['minVersion'] ?? null), $missing ?? $this->string($usApp['minimumOsVersion'] ?? null), readable: $us !== null);
        $this->compare('App Store (us)', 'price', $this->amount($ios['price']['amount'] ?? null), $missing ?? $this->amount($usApp['price'] ?? null), readable: $us !== null);

        $de = $appId !== null ? $this->lookup($appId, 'de') : null;
        $this->compare(
            'App Store (de)',
            'listed',
            $this->excludes($ios['storefrontExclusions'] ?? [], 'de') ? 'no' : 'yes',
            is_array($de) ? ((int) ($de['resultCount'] ?? 0) > 0 ? 'yes' : 'no') : null,
        );

        $this->table(['Channel', 'Field', 'platforms.json', 'Live', 'Result'], $this->rows);

        $failures = array_filter($this->rows, fn(array $row): bool => in_array($row[4], [self::DRIFT, self::UNREADABLE], true));

        if ($failures !== []) {
            $this->components->error(count($failures) . ' release fact(s) differ from resources/data/platforms.json or could not be read.');

            return self::FAILURE;
        }

        $this->components->info('resources/data/platforms.json matches every release channel.');

        return self::SUCCESS;
    }

    /**
     * Records one comparison.
     *
     * `drift: false` reports a difference without failing: the Homebrew cask
     * trailing GitHub is expected, and what matters is that `floorVersion`
     * says so, which the floor row checks.
     */
    private function compare(string $channel, string $field, ?string $expected, ?string $live, bool $drift = true, bool $readable = true): void
    {
        if (! $readable || $live === null) {
            $this->rows[] = [$channel, $field, $expected ?? '—', '—', self::UNREADABLE];

            return;
        }

        $same = $expected !== null && $this->same($expected, $live);
        $result = $same ? self::OK : ($drift ? self::DRIFT : 'differs (expected)');

        $this->rows[] = [$channel, $field, $expected ?? '—', $live, $result];
    }

    /**
     * Version-aware equality, so `18.0` equals `18` and `0.77.0` equals `0.77`.
     */
    private function same(string $expected, string $live): bool
    {
        if (preg_match('/^\d+(\.\d+)*$/', $expected) === 1 && preg_match('/^\d+(\.\d+)*$/', $live) === 1) {
            return version_compare($this->padded($expected), $this->padded($live), '==');
        }

        return $expected === $live;
    }

    private function padded(string $version): string
    {
        $parts = explode('.', $version);

        while (count($parts) < 3) {
            $parts[] = '0';
        }

        return implode('.', $parts);
    }

    /**
     * @param  list<string|null>  $versions
     */
    private function lowest(array $versions): ?string
    {
        $known = array_values(array_filter($versions, fn(?string $version): bool => $version !== null));

        if ($known === [] || count($known) !== count($versions)) {
            return null;
        }

        usort($known, fn(string $a, string $b): int => version_compare($this->padded($a), $this->padded($b)));

        return $known[0];
    }

    private function homebrewVersion(): ?string
    {
        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->get('https://formulae.brew.sh/api/cask/' . config('services.homebrew.cask') . '.json');
        } catch (\Throwable) {
            return null;
        }

        $version = $response->ok() ? $response->json('version') : null;

        return is_string($version) && $version !== '' ? $version : null;
    }

    /**
     * The iTunes lookup for the app in one storefront, or null when it cannot be read.
     *
     * @return array<string, mixed>|null
     */
    private function lookup(string $appId, string $country): ?array
    {
        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->get('https://itunes.apple.com/lookup', ['id' => $appId, 'country' => $country]);
        } catch (\Throwable) {
            return null;
        }

        $json = $response->ok() ? json_decode($response->body(), true) : null;

        return is_array($json) && array_key_exists('resultCount', $json) ? $json : null;
    }

    /**
     * The numeric App Store id: the `app-store` destination's `appId`, else the
     * one in its URL.
     */
    private function appStoreId(PlatformCatalog $platforms): ?string
    {
        $destination = $platforms->destination('ios', 'app-store') ?? [];
        $appId = $destination['appId'] ?? null;

        if ((is_string($appId) || is_int($appId)) && preg_match('/^\d+$/', (string) $appId) === 1) {
            return (string) $appId;
        }

        $url = $destination['url'] ?? null;

        if (! is_string($url) || preg_match('/\/id(\d+)/', $url, $matches) !== 1) {
            return null;
        }

        return $matches[1];
    }

    /**
     * Whether `storefrontExclusions` leaves out a storefront: its own code
     * (`de`), or an entry naming the EU, which holds every EU storefront.
     */
    private function excludes(mixed $exclusions, string $country): bool
    {
        if (! is_array($exclusions)) {
            return false;
        }

        foreach ($exclusions as $entry) {
            if (! is_string($entry)) {
                continue;
            }

            if (strcasecmp(trim($entry), $country) === 0 || preg_match('/\bEU\b/i', $entry) === 1) {
                return true;
            }
        }

        return false;
    }

    private function string(mixed $value): ?string
    {
        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        return is_string($value) && $value !== '' ? $value : null;
    }

    private function amount(mixed $value): ?string
    {
        if (! is_int($value) && ! is_float($value) && ! (is_string($value) && is_numeric($value))) {
            return null;
        }

        return rtrim(rtrim(number_format((float) $value, 2, '.', ''), '0'), '.');
    }
}
