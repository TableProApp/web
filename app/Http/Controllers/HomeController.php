<?php

namespace App\Http\Controllers;

use App\Support\Content\EnginePaths;
use App\Support\Assets\AssetManifest;
use App\Support\Content\ContentRepository;
use App\Support\Content\Testimonials;
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
 * large file, `engines.json`, is read here instead: the databases band needs
 * each engine's name and page, so the page receives that slice rather than
 * shipping the whole file in its bundle.
 *
 * `lcpAsset` preloads the Mac layer of the hero's devices, the largest image
 * in the first screen, in the variant the reader's theme shows.
 *
 * @phpstan-type HomeEngine array{id: string, name: string, path: string, featured: bool}
 */
class HomeController extends Controller
{
    /**
     * The data files this request has read, by file name.
     *
     * @var array<string, array<array-key, mixed>>
     */
    private array $decoded = [];

    public function __invoke(ContentRepository $content, AssetManifest $assets, Testimonials $testimonials): Response
    {
        $locale = App::getLocale();

        return Inertia::render('Home', [
            'content' => $content->page('home', $locale),
            'engines' => $this->engines(),
            'testimonials' => $testimonials->forLocale($locale),
            'lcpAsset' => $assets->lcpDescriptor('home-hero-mac', $locale),
        ]);
    }

    /**
     * Every published engine in data order, with what the page shows: its
     * name and where the site describes it.
     *
     * @return list<HomeEngine>
     */
    private function engines(): array
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

            $engines[] = [
                'id' => $engine['id'],
                'name' => $engine['name'],
                'path' => $path,
                'featured' => ($engine['featured'] ?? false) === true,
            ];
        }

        return $engines;
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
