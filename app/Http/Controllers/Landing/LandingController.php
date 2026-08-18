<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Home', [
            'downloadUrls' => $this->fetchDownloadUrls(),
            'githubStars' => $this->fetchGitHubStars(),
            'latestRelease' => $this->fetchLatestRelease(),
            'downloads' => $this->fetchDownloadStats(),
            'paymentProvider' => config('payment.provider', 'lemonsqueezy'),
            'teamMinSeats' => max(1, (int) config('pricing.team_min_seats', 5)),
        ]);
    }

    public function faq(): Response
    {
        return Inertia::render('Faq', [
            'downloadUrls' => $this->fetchDownloadUrls(),
            'githubStars' => $this->fetchGitHubStars(),
        ]);
    }

    public function download(): Response
    {
        return Inertia::render('Download', [
            'downloadUrls' => $this->fetchDownloadUrls(),
            'githubStars' => $this->fetchGitHubStars(),
        ]);
    }

    public function privacy(): Response
    {
        return Inertia::render('Privacy');
    }

    public function terms(): Response
    {
        return Inertia::render('Terms');
    }

    public function refundPolicy(): Response
    {
        return Inertia::render('RefundPolicy', [
            'downloadUrls' => $this->fetchDownloadUrls(),
        ]);
    }

    public function databaseClient(string $slug): Response
    {
        return Inertia::render('DatabaseClient', [
            'slug' => $slug,
            'downloadUrls' => $this->fetchDownloadUrls(),
            'githubStars' => $this->fetchGitHubStars(),
        ]);
    }

    public function compare(string $slug): Response
    {
        return Inertia::render('Compare', [
            'slug' => $slug,
            'downloadUrls' => $this->fetchDownloadUrls(),
            'githubStars' => $this->fetchGitHubStars(),
        ]);
    }

    private function fetchGitHubStars(): ?int
    {
        return Cache::remember('github_stars', 3600, function (): ?int {
            try {
                $response = Http::timeout(5)
                    ->get('https://api.github.com/repos/' . config('services.github.repo'));
            } catch (\Throwable) {
                return null;
            }

            if (! $response->ok()) {
                return null;
            }

            return $response->json('stargazers_count');
        });
    }

    /**
     * The app releases from GitHub, newest first, trimmed to the fields the
     * landing pages use. Cached once and shared by every reader so adding a
     * consumer never adds an HTTP call.
     *
     * @return array<int, array{tag_name: string, published_at: ?string, assets: array<int, array{name: string, browser_download_url: string, download_count: int}>}>
     */
    private function fetchAppReleases(): array
    {
        return Cache::remember('github_app_releases', 60, function (): array {
            try {
                $response = Http::timeout(5)
                    ->get('https://api.github.com/repos/TableProApp/TablePro/releases', [
                        'per_page' => 100,
                    ]);
            } catch (\Throwable) {
                return [];
            }

            if (! $response->ok()) {
                return [];
            }

            return collect($response->json())
                ->filter($this->isAppRelease(...))
                ->map(fn(array $release): array => [
                    'tag_name' => (string) ($release['tag_name'] ?? ''),
                    'published_at' => $release['published_at'] ?? null,
                    'assets' => collect($release['assets'] ?? [])
                        ->map(fn(array $asset): array => [
                            'name' => (string) ($asset['name'] ?? ''),
                            'browser_download_url' => (string) ($asset['browser_download_url'] ?? ''),
                            // Already in this payload. Reading it costs nothing;
                            // it was simply being discarded.
                            'download_count' => (int) ($asset['download_count'] ?? 0),
                        ])
                        ->values()
                        ->all(),
                ])
                ->values()
                ->all();
        });
    }

    /**
     * @return array{arm64: string, x86_64: string}
     */
    private function fetchDownloadUrls(): array
    {
        $fallback = 'https://github.com/TableProApp/TablePro/releases';
        $urls = ['arm64' => $fallback, 'x86_64' => $fallback];

        $release = $this->fetchAppReleases()[0] ?? null;

        if (! $release) {
            return $urls;
        }

        foreach ($release['assets'] as $asset) {
            if (str_ends_with($asset['name'], '-arm64.dmg')) {
                $urls['arm64'] = $asset['browser_download_url'];
            }
            if (str_ends_with($asset['name'], '-x86_64.dmg')) {
                $urls['x86_64'] = $asset['browser_download_url'];
            }
        }

        return $urls;
    }

    /**
     * Version, date, and recent cadence for the homepage. Every field is
     * nullable; the page renders without them.
     *
     * @return array{version: ?string, publishedAt: ?string, countLast30Days: ?int}
     */
    private function fetchLatestRelease(): array
    {
        $releases = $this->fetchAppReleases();
        $latest = $releases[0] ?? null;

        if (! $latest) {
            return ['version' => null, 'publishedAt' => null, 'countLast30Days' => null];
        }

        $cutoff = now()->subDays(30);

        $recent = collect($releases)
            ->filter(fn(array $release): bool => $release['published_at'] !== null
                && Carbon::parse($release['published_at'])->greaterThanOrEqualTo($cutoff))
            ->count();

        return [
            'version' => ltrim($latest['tag_name'], 'v') ?: null,
            'publishedAt' => $latest['published_at'] !== null
                ? Carbon::parse($latest['published_at'])->toDateString()
                : null,
            'countLast30Days' => $recent > 0 ? $recent : null,
        ];
    }

    /**
     * How many times the Mac app has been downloaded, and over how many
     * releases that figure was counted.
     *
     * DMG assets only. Each app release also ships a .zip, which is the update
     * feed the installed app pulls from — counting those would fold automatic
     * updates into a number the page presents as people choosing to install.
     * The DMG is what the download button serves, so it is the honest one.
     *
     * `releases` travels with the count because this is a floor, not a lifetime
     * total: the API returns one page of releases and most of them are plugin
     * releases, so the window reaches back only so far. The page says how many
     * releases it counted rather than implying it counted them all.
     *
     * @return array{total: ?int, releases: int}
     */
    private function fetchDownloadStats(): array
    {
        $releases = $this->fetchAppReleases();

        $total = collect($releases)
            ->flatMap(fn(array $release): array => $release['assets'])
            ->filter(fn(array $asset): bool => str_ends_with($asset['name'], '.dmg'))
            ->sum('download_count');

        return [
            'total' => $total > 0 ? $total : null,
            'releases' => count($releases),
        ];
    }

    /**
     * Determine whether a GitHub release is a TablePro app release rather than
     * a plugin release. Both live in the same repo, but only app releases ship
     * macOS DMG assets named like "TablePro-0.44.0-arm64.dmg".
     *
     * @param  array{tag_name?: string, assets?: array<int, array{name?: string}>}  $release
     */
    private function isAppRelease(array $release): bool
    {
        return collect($release['assets'] ?? [])
            ->contains(fn(array $asset): bool => preg_match('/^TablePro-.*-(arm64|x86_64)\.dmg$/', $asset['name'] ?? '') === 1);
    }
}
