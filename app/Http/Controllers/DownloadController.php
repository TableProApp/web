<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Services\Releases\LinuxRelease;
use App\Services\Releases\LinuxReleaseService;
use App\Services\Releases\MacReleaseService;
use App\Services\Releases\PlatformCatalog;
use App\Support\Content\ContentRepository;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

// Every URL and fact the page shows arrives as a prop from the data files and the release services. Linux is sent only
// once platforms.json says it is released, the same way an unreleased iPhone app sends null.
class DownloadController extends Controller
{
    private const LINUX_METHODS = ['ppa', 'copr', 'flatpak'];

    public function __invoke(
        ContentRepository $content,
        MacReleaseService $releases,
        LinuxReleaseService $linuxReleases,
        PlatformCatalog $platforms,
        SiteFacts $facts,
    ): Response {
        $locale = App::getLocale();
        $release = $releases->latest();

        return Inertia::render('Download', [
            'content' => $content->page('download', $locale),
            'release' => [...$release->toProps($locale), 'shortVersion' => $this->shortVersion($release->version)],
            'mac' => [
                ...($platforms->summary('mac') ?? ['deviceNames' => [], 'requirements' => null]),
                'universal' => ($platforms->find('mac')['universalBinary'] ?? false) === true,
                'homebrewCommand' => $this->string($platforms->destination('mac', 'homebrew')['command'] ?? null),
            ],
            'ios' => $this->ios($platforms, $facts, $locale),
            'linux' => $platforms->isReleased('linux') ? $this->linux($platforms, $linuxReleases->latest(), $locale) : null,
            'unreleased' => $platforms->unreleased(),
            'links' => $this->links($facts),
            'featuredEngines' => $facts->featuredEngineNames(),
        ]);
    }

    /**
     * @return array{deviceNames: list<string>, requirements: array{systems: list<string>, minVersion: string, displayVersion: string, releaseName: string|null}, appStoreUrl: string|null, free: bool, inAppPurchases: bool, version: string|null, shortVersion: string|null, publishedAtFormatted: string|null}|null
     */
    private function ios(PlatformCatalog $platforms, SiteFacts $facts, string $locale): ?array
    {
        $summary = $platforms->summary('ios');

        if ($summary === null) {
            return null;
        }

        $platform = $platforms->find('ios') ?? [];
        $price = is_array($platform['price'] ?? null) ? $platform['price'] : [];
        $release = is_array($platform['release'] ?? null) ? $platform['release'] : [];
        $version = $this->string($release['version'] ?? null);

        return [
            ...$summary,
            'appStoreUrl' => $this->url($platforms->destination('ios', 'app-store')['url'] ?? null) ?? $facts->links()['appStore'],
            'free' => is_numeric($price['amount'] ?? null) && (float) $price['amount'] === 0.0,
            'inAppPurchases' => ($price['inAppPurchases'] ?? false) === true,
            'version' => $version,
            'shortVersion' => $this->shortVersion($version),
            'publishedAtFormatted' => $this->date($release['publishedAt'] ?? null, $locale),
        ];
    }

    /**
     * @return array{deviceNames: list<string>, channel: string, distributions: list<array{id: string, name: string|null, versions: list<string>, via: string}>, architectures: list<string>, methods: list<array{kind: string, commands: list<string>}>, release: array{version: string, shortVersion: string, publishedOn: string|null, releaseUrl: string, releasesUrl: string}|null}
     */
    private function linux(PlatformCatalog $platforms, ?LinuxRelease $release, string $locale): array
    {
        $platform = $platforms->find('linux') ?? [];
        $summary = $platforms->linuxSummary() ?? ['deviceNames' => [], 'channel' => $platforms->linuxChannel(), 'distributions' => []];
        $methods = [];

        foreach (is_array($platform['destinations'] ?? null) ? $platform['destinations'] : [] as $destination) {
            $commands = $this->strings(is_array($destination) ? ($destination['commands'] ?? []) : []);

            if ($commands !== [] && in_array($destination['kind'] ?? null, self::LINUX_METHODS, true)) {
                $methods[] = ['kind' => $destination['kind'], 'commands' => $commands];
            }
        }

        return [
            'deviceNames' => $summary['deviceNames'],
            'channel' => $summary['channel'],
            'distributions' => $summary['distributions'],
            'architectures' => $this->strings($platform['architectures'] ?? []),
            'methods' => $methods,
            'release' => $release === null ? null : [
                'version' => $release->version,
                'shortVersion' => $this->shortVersion($release->version) ?? $release->version,
                'publishedOn' => $this->date($release->publishedAt, $locale),
                'releaseUrl' => $release->releaseUrl,
                'releasesUrl' => $release->releasesUrl,
            ],
        ];
    }

    /**
     * @return array{changelog: string|null, source: string|null, license: string|null}
     */
    private function links(SiteFacts $facts): array
    {
        $links = $facts->links();

        return [
            'changelog' => $links['changelog'] ?? ($links['docs'] !== null ? rtrim($links['docs'], '/') . '/changelog' : null),
            'source' => $links['github'] ?? 'https://github.com/' . config('services.github.repo'),
            'license' => $links['license'],
        ];
    }

    // The page's H1 names a release by major and minor, as Zed does: 0.85.0 is "0.85", 0.1.0-beta.3 is "0.1".
    private function shortVersion(?string $version): ?string
    {
        if ($version === null || preg_match('/^(\d+)\.(\d+)/', $version, $parts) !== 1) {
            return $version;
        }

        return "{$parts[1]}.{$parts[2]}";
    }

    private function date(mixed $date, string $locale): ?string
    {
        if (! is_string($date) || preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) !== 1) {
            return null;
        }

        return CarbonImmutable::createFromFormat('!Y-m-d', $date)?->locale($locale)->isoFormat('LL') ?: null;
    }

    /**
     * @return list<string>
     */
    private function strings(mixed $values): array
    {
        return is_array($values) ? array_values(array_filter($values, fn(mixed $value): bool => is_string($value) && $value !== '')) : [];
    }

    private function url(mixed $value): ?string
    {
        return is_string($value) && str_starts_with($value, 'https://') ? $value : null;
    }

    private function string(mixed $value): ?string
    {
        return is_string($value) && $value !== '' ? $value : null;
    }
}
