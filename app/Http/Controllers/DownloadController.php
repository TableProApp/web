<?php

namespace App\Http\Controllers;

use App\Services\Blog\BlogService;
use App\Services\Content\SiteFacts;
use App\Services\Releases\LinuxRelease;
use App\Services\Releases\LinuxReleaseService;
use App\Services\Releases\MacReleaseService;
use App\Services\Releases\PlatformCatalog;
use App\Support\Content\ContentRepository;
use App\Support\Content\Slugs\FeatureSlugs;
use App\Support\Features\FeatureFacts;
use App\Support\Localization\Locales;
use App\Support\Seo\BlogPosts;
use App\Support\Seo\PageRegistry;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

// Every URL and fact the page shows arrives as a prop from the data files and the release services. Linux is sent only
// once platforms.json says it is released, the same way an unreleased iPhone app sends null.
class DownloadController extends Controller
{
    // Which install method a package format belongs to, so a file row can name its distribution.
    private const PACKAGE_METHOD = ['deb' => 'ppa', 'rpm' => 'copr', 'flatpak' => 'flatpak'];

    public function __invoke(
        ContentRepository $content,
        MacReleaseService $releases,
        LinuxReleaseService $linuxReleases,
        PlatformCatalog $platforms,
        SiteFacts $facts,
        FeatureFacts $featureFacts,
        BlogService $blog,
        PageRegistry $registry,
    ): Response {
        $locale = App::getLocale();
        $release = $releases->latest();
        $floor = $platforms->macFloorVersion();
        $linux = $platforms->isReleased('linux') ? $this->linux($platforms, $linuxReleases->latest(), $locale) : null;

        return Inertia::render('Download', [
            'content' => $content->page('download', $locale),
            'release' => $release->toProps($locale),
            'mac' => [
                ...($platforms->summary('mac') ?? ['deviceNames' => [], 'requirements' => null]),
                'homebrewCommand' => $this->string($platforms->destination('mac', 'homebrew')['command'] ?? null),
                'homebrewTrails' => $floor !== null && $release->version !== null && version_compare($floor, $release->version, '<'),
            ],
            'ios' => $this->ios($platforms, $facts, $locale),
            'linux' => $linux,
            'unreleased' => $platforms->unreleased(),
            'links' => $this->links($facts),
            'engines' => $this->engines($linux !== null),
            'parity' => $this->parity($content, $featureFacts, $locale),
            'featuredEngines' => $facts->featuredEngineNames(),
            'latestPost' => $this->latestPost($blog, $registry, $locale),
        ]);
    }

    /**
     * @return array{slug: string, locale: string, kind: string, title: string, description: string, date: string, dateFormatted: string, url: string}|null
     */
    private function latestPost(BlogService $blog, PageRegistry $registry, string $locale): ?array
    {
        foreach ($blog->all(Locales::default()) as $post) {
            $post = $blog->find($post->slug, $locale) ?? $post;

            if ($post->release !== null && ($registry->find(BlogPosts::ROUTE, ['slug' => $post->slug])?->renders($post->locale) ?? false)) {
                return $post->summary($locale);
            }
        }

        return null;
    }

    /**
     * @return array{deviceNames: list<string>, requirements: array{systems: list<string>, minVersion: string, displayVersion: string, releaseName: string|null}, appStoreUrl: string|null, free: bool, inAppPurchases: bool, version: string|null, publishedAtFormatted: string|null}|null
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

        return [
            ...$summary,
            'appStoreUrl' => $this->url($platforms->destination('ios', 'app-store')['url'] ?? null) ?? $facts->links()['appStore'],
            'free' => is_numeric($price['amount'] ?? null) && (float) $price['amount'] === 0.0,
            'inAppPurchases' => ($price['inAppPurchases'] ?? false) === true,
            'version' => $this->string($release['version'] ?? null),
            'publishedAtFormatted' => $this->date($release['publishedAt'] ?? null, $locale),
        ];
    }

    /**
     * @return array{deviceNames: list<string>, channel: string, distributions: list<array{id: string, name: string|null, versions: list<string>, via: string}>, desktop: array{name: string, version: string}|null, architectures: list<string>, methods: list<array{kind: string, commands: list<string>, update: string|null}>, packages: list<array{format: string, series: string|null, distribution: string|null, files: array<string, array{name: string, url: string, bytes: int|null}|null>}>, checksums: array{name: string, url: string|null}|null, verify: string|null, release: array{version: string, publishedOn: string|null, releaseUrl: string, releasesUrl: string}|null}
     */
    private function linux(PlatformCatalog $platforms, ?LinuxRelease $release, string $locale): array
    {
        $platform = $platforms->find('linux') ?? [];
        $packages = $platforms->linuxPackages();
        $architectures = $this->strings($platform['architectures'] ?? []);
        $desktop = $platform['desktop'] ?? null;

        $distributions = [];

        foreach (is_array($platform['distributions'] ?? null) ? $platform['distributions'] : [] as $distribution) {
            if (is_array($distribution) && is_string($distribution['id'] ?? null) && is_string($distribution['via'] ?? null)) {
                $distributions[] = [
                    'id' => $distribution['id'],
                    'name' => $this->string($distribution['name'] ?? null),
                    'versions' => $this->strings($distribution['versions'] ?? []),
                    'via' => $distribution['via'],
                ];
            }
        }

        $methods = [];

        foreach (is_array($platform['destinations'] ?? null) ? $platform['destinations'] : [] as $destination) {
            $commands = $this->strings(is_array($destination) ? ($destination['commands'] ?? []) : []);

            if ($commands !== [] && in_array($destination['kind'] ?? null, self::PACKAGE_METHOD, true)) {
                $methods[] = ['kind' => $destination['kind'], 'commands' => $commands, 'update' => $this->string($destination['update'] ?? null)];
            }
        }

        $byName = [];

        foreach ($release?->assets ?? [] as $asset) {
            $byName[$asset['name']] = ['name' => $asset['name'], 'url' => $asset['url'], 'bytes' => $asset['bytes']];
        }

        $rows = [];

        foreach ($release !== null ? ($packages['assets'] ?? []) : [] as $asset) {
            $via = self::PACKAGE_METHOD[$asset['format']] ?? null;
            $named = collect($distributions)->first(fn(array $distribution): bool => $distribution['via'] === $via && $distribution['name'] !== null);

            foreach ($asset['series'] === [] ? [null] : $asset['series'] as $series) {
                $files = [];

                foreach ($architectures as $architecture) {
                    $name = strtr($asset['template'], ['{version}' => $release->version, '{series}' => (string) $series, '{arch}' => $asset['arch'][$architecture] ?? $architecture]);
                    $files[$architecture] = $byName[$name] ?? null;
                }

                if (array_filter($files) !== []) {
                    $rows[] = ['format' => $asset['format'], 'series' => $series, 'distribution' => $named['name'] ?? null, 'files' => $files];
                }
            }
        }

        return [
            'deviceNames' => $this->strings($platform['deviceNames'] ?? []),
            'channel' => $platforms->linuxChannel(),
            'distributions' => $distributions,
            'desktop' => is_array($desktop) && is_string($desktop['name'] ?? null) && is_string($desktop['version'] ?? null) ? ['name' => $desktop['name'], 'version' => $desktop['version']] : null,
            'architectures' => $architectures,
            'methods' => $methods,
            'packages' => $rows,
            'checksums' => $packages !== null && is_string($packages['checksums'] ?? null) ? ['name' => $packages['checksums'], 'url' => $release?->checksumsUrl] : null,
            'verify' => $this->string($packages['verify'] ?? null),
            'release' => $release === null ? null : [
                'version' => $release->version,
                'publishedOn' => $this->date($release->publishedAt, $locale),
                'releaseUrl' => $release->releaseUrl,
                'releasesUrl' => $release->releasesUrl,
            ],
        ];
    }

    /**
     * @return array{docs: string|null, changelog: string|null, source: string|null, license: string|null, issues: string|null}
     */
    private function links(SiteFacts $facts): array
    {
        $links = $facts->links();

        return [
            'docs' => $links['docs'],
            'changelog' => $links['changelog'] ?? ($links['docs'] !== null ? rtrim($links['docs'], '/') . '/changelog' : null),
            'source' => $links['github'] ?? 'https://github.com/' . config('services.github.repo'),
            'license' => $links['license'],
            'issues' => $links['issues'],
        ];
    }

    /**
     * @return array{mac: int, ios: int, linux: list<string>}
     */
    private function engines(bool $linux): array
    {
        $counts = ['mac' => 0, 'ios' => 0, 'linux' => []];

        foreach ($this->json('engines.json') as $engine) {
            if (! is_array($engine) || ($engine['state'] ?? null) !== 'published' || ! is_string($engine['name'] ?? null)) {
                continue;
            }

            $counts['mac']++;

            if (($engine['ios']['inPicker'] ?? false) === true) {
                $counts['ios']++;
            }

            if ($linux && ($engine['linux']['support'] ?? null) === 'tested') {
                $counts['linux'][] = $engine['name'];
            }
        }

        return $counts;
    }

    /**
     * @return array{groups: list<array{slug: string, rows: list<array<string, mixed>>}>, facts: array<string, mixed>, labels: array<string, mixed>}
     */
    private function parity(ContentRepository $content, FeatureFacts $facts, string $locale): array
    {
        $groups = [];

        foreach (FeatureSlugs::ALL as $slug) {
            if ($content->has("features/{$slug}", $locale)) {
                $rows = $content->page("features/{$slug}", $locale)['availability'] ?? [];
                $groups[] = ['slug' => $slug, 'rows' => is_array($rows) ? array_values($rows) : []];
            }
        }

        return [
            'groups' => $groups,
            'facts' => $facts->for(...array_column($groups, 'rows')),
            'labels' => $content->has('features/index', $locale) ? ($content->page('features/index', $locale)['labels'] ?? []) : [],
        ];
    }

    /**
     * @return array<array-key, mixed>
     */
    private function json(string $file): array
    {
        $path = resource_path('data/' . $file);
        $decoded = File::isFile($path) ? json_decode((string) File::get($path), true) : null;

        return is_array($decoded) ? $decoded : [];
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
