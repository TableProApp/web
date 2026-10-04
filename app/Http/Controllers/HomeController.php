<?php

namespace App\Http\Controllers;

use App\Support\Content\EnginePaths;
use App\Services\Releases\PlatformCatalog;
use App\Support\Assets\AssetManifest;
use App\Support\Content\ContentRepository;
use App\Support\Pricing\Checkout;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The homepage, `/` and `/vi` (sitemap §A.1, §D; positioning §1-§9).
 *
 * The page copy comes from `content/{locale}/home.json`. Facts the page
 * shares with the site chrome (platforms, prices, paid features, links) are
 * read in the browser from the data files the bundle already carries. The one
 * large file, `engines.json`, is read here instead: the databases section
 * needs a few fields of each engine, so the page receives that slice rather
 * than shipping the whole file in its bundle.
 *
 * `checkout` is the pricing section's contract with the platform app, the
 * same prop `/pricing` receives (`App\Support\Pricing\Checkout`).
 *
 * `lcpAsset` is the hero window's preload descriptor. It is null while the
 * hero is a placeholder, because a placeholder requests nothing, and becomes
 * a preload for the shown variant once the owner supplies the image.
 *
 * @phpstan-type HomeEngine array{id: string, name: string, category: string, icon: string|null, monogram: string, path: string, featured: bool, usersRoles: bool, release: string|null}
 */
class HomeController extends Controller
{
    /**
     * The data files this request has read, by file name.
     *
     * @var array<string, array<array-key, mixed>>
     */
    private array $decoded = [];

    public function __invoke(ContentRepository $content, PlatformCatalog $platforms, AssetManifest $assets, Checkout $checkout): Response
    {
        $locale = App::getLocale();
        $engines = $this->engines($platforms->macFloorVersion());

        return Inertia::render('Home', [
            'content' => $content->page('home', $locale),
            'engines' => $engines,
            'iosEngines' => $this->iosEngines($platforms),
            'checkout' => $checkout->props(),
            'lcpAsset' => $assets->lcpDescriptor('mac-hero-window', $locale),
        ]);
    }

    /**
     * Every published engine in data order, with what the databases section
     * shows: its name and mark, its category, where the site describes it, and
     * a release label while some channel still serves an app without it.
     *
     * @return list<HomeEngine>
     */
    private function engines(?string $floor): array
    {
        $all = array_values(array_filter($this->json('engines.json'), 'is_array'));
        $byId = EnginePaths::byId($all);

        $engines = [];

        foreach ($all as $engine) {
            if (($engine['state'] ?? null) !== 'published' || ! is_string($engine['id'] ?? null) || ! is_string($engine['name'] ?? null)) {
                continue;
            }

            $path = EnginePaths::pathFor($engine, $byId);

            if ($path === null) {
                continue;
            }

            $since = is_string($engine['sinceAppVersion'] ?? null) ? $engine['sinceAppVersion'] : null;

            $engines[] = [
                'id' => $engine['id'],
                'name' => $engine['name'],
                'category' => (string) ($engine['category'] ?? ''),
                'icon' => is_string($engine['icon'] ?? null) ? $engine['icon'] : null,
                'monogram' => (string) ($engine['monogram'] ?? ''),
                'path' => $path,
                'featured' => ($engine['featured'] ?? false) === true,
                'usersRoles' => ($engine['capabilities']['usersRoles'] ?? false) === true,
                'release' => $since !== null && $floor !== null && version_compare($since, $floor, '>') ? $this->releaseLabel($since) : null,
            ];
        }

        return $engines;
    }

    /**
     * The engine names the iPhone and iPad app offers when you add a
     * connection, in its picker's order, and the ones it opens only when a
     * connection arrives from a Mac.
     *
     * @return array{picker: list<string>, syncedOnly: list<string>}
     */
    private function iosEngines(PlatformCatalog $platforms): array
    {
        if (! $platforms->isReleased('ios')) {
            return ['picker' => [], 'syncedOnly' => []];
        }

        $names = [];
        $syncedOnly = [];

        foreach ($this->json('engines.json') as $engine) {
            if (! is_array($engine) || ($engine['state'] ?? null) !== 'published' || ! is_string($engine['id'] ?? null) || ! is_string($engine['name'] ?? null)) {
                continue;
            }

            $names[$engine['id']] = $engine['name'];

            if (($engine['ios']['openable'] ?? false) === true && ($engine['ios']['inPicker'] ?? false) !== true) {
                $syncedOnly[] = $engine['name'];
            }
        }

        $picker = [];

        foreach ($platforms->find('ios')['iosEngines'] ?? [] as $id) {
            if (is_string($id) && isset($names[$id])) {
                $picker[] = $names[$id];
            }
        }

        return ['picker' => $picker, 'syncedOnly' => $syncedOnly];
    }

    /**
     * `0.77.0` → `0.77`, the label the rest of the site shows for a release.
     */
    private function releaseLabel(string $version): string
    {
        $parts = explode('.', $version);

        return ($parts[0] ?? '0') . '.' . ($parts[1] ?? '0');
    }

    /**
     * A file in `resources/data`, decoded once per request, or an empty array
     * when it is missing or malformed: the section degrades instead of the
     * page failing. Each file's `Data` test is what keeps it valid.
     *
     * @return array<array-key, mixed>
     */
    private function json(string $file): array
    {
        if (array_key_exists($file, $this->decoded)) {
            return $this->decoded[$file];
        }

        $path = resource_path('data/' . $file);
        $data = File::isFile($path) ? json_decode((string) File::get($path), true) : null;

        return $this->decoded[$file] = is_array($data) ? $data : [];
    }
}
