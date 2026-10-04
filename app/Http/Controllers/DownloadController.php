<?php

namespace App\Http\Controllers;

use App\Services\Releases\MacReleaseService;
use App\Services\Releases\PlatformCatalog;
use App\Support\Content\ContentRepository;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The download page, `/download` and `/vi/download` (sitemap §A.1, §E.5).
 *
 * Everything the page links to outside this site arrives here, as props: the
 * DMG URLs and sizes from the release service, the App Store and GitHub
 * Releases URLs from `platforms.json`, and the docs, source and licence links
 * from `facts.json`. No URL is typed into the page or its copy, so the
 * external-URL guard in `Data/FactsDataTest` holds by construction.
 *
 * Both DMG links are in the server-rendered HTML. The browser only ever
 * highlights one of them (resources/js/lib/device.ts); nothing starts a
 * download on its own.
 */
class DownloadController extends Controller
{
    public function __invoke(ContentRepository $content, MacReleaseService $releases, PlatformCatalog $platforms): Response
    {
        $locale = App::getLocale();
        $release = $releases->latest();
        $floor = $platforms->macFloorVersion();

        return Inertia::render('Download', [
            'content' => $content->page('download', $locale),
            'release' => $release->toProps($locale),
            'mac' => [
                ...($platforms->summary('mac') ?? ['deviceNames' => [], 'requirements' => null]),
                'homebrewCommand' => $this->string($platforms->destination('mac', 'homebrew')['command'] ?? null),
                'homebrewTrails' => $floor !== null && $release->version !== null && version_compare($floor, $release->version, '<'),
            ],
            'ios' => $this->ios($platforms),
            'unreleased' => $platforms->unreleased(),
            'links' => $this->links(),
            'featuredEngines' => $this->featuredEngines(),
        ]);
    }

    /**
     * The iPhone and iPad card's facts, or null while that app is not released.
     *
     * @return array{deviceNames: list<string>, requirements: array{systems: list<string>, minVersion: string, displayVersion: string, releaseName: string|null}, appStoreUrl: string|null, free: bool, inAppPurchases: bool}|null
     */
    private function ios(PlatformCatalog $platforms): ?array
    {
        $summary = $platforms->summary('ios');

        if ($summary === null) {
            return null;
        }

        $price = $platforms->find('ios')['price'] ?? [];

        return [
            ...$summary,
            'appStoreUrl' => $this->url($platforms->destination('ios', 'app-store')['url'] ?? null) ?? $this->url($this->facts()['appStore'] ?? null),
            'free' => is_array($price) && is_numeric($price['amount'] ?? null) && (float) $price['amount'] === 0.0,
            'inAppPurchases' => is_array($price) && ($price['inAppPurchases'] ?? false) === true,
        ];
    }

    /**
     * The outbound links the page shows or states in its structured data, each
     * null when the data does not name it.
     *
     * @return array{docs: string|null, changelog: string|null, source: string|null, license: string|null}
     */
    private function links(): array
    {
        $facts = $this->facts();
        $docs = $this->url($facts['docs'] ?? null);

        return [
            'docs' => $docs,
            'changelog' => $this->url($facts['changelog'] ?? null) ?? ($docs !== null ? rtrim($docs, '/') . '/changelog' : null),
            'source' => $this->url($facts['github'] ?? null) ?? 'https://github.com/' . config('services.github.repo'),
            'license' => $this->url($facts['license'] ?? null),
        ];
    }

    /**
     * `facts.json` → `links`, or nothing when the file is missing or malformed.
     *
     * @return array<string, mixed>
     */
    private function facts(): array
    {
        $facts = $this->json('facts.json');

        return is_array($facts['links'] ?? null) ? $facts['links'] : [];
    }

    /**
     * The names of the featured, published engines in data order, for the
     * `{featuredEngines}` slot of the Mac app's description in the page's
     * structured data (positioning §6.3). Read here rather than in the page,
     * so the page's bundle does not carry all of `engines.json` for six names.
     *
     * @return list<string>
     */
    private function featuredEngines(): array
    {
        $names = [];

        foreach ($this->json('engines.json') as $engine) {
            if (is_array($engine) && ($engine['featured'] ?? false) === true && ($engine['state'] ?? null) === 'published' && is_string($engine['name'] ?? null)) {
                $names[] = $engine['name'];
            }
        }

        return $names;
    }

    /**
     * A file in `resources/data`, decoded, or an empty array when it is missing
     * or malformed: the page degrades instead of failing. Each file's `Data`
     * test is what keeps it valid.
     *
     * @return array<array-key, mixed>
     */
    private function json(string $file): array
    {
        $path = resource_path('data/' . $file);

        if (! File::isFile($path)) {
            return [];
        }

        $decoded = json_decode((string) File::get($path), true);

        return is_array($decoded) ? $decoded : [];
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
