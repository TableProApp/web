<?php

namespace App\Services\Blog;

use App\Services\Releases\PlatformCatalog;
use Illuminate\Support\Facades\File;

/**
 * What a post's `release` front matter says about the app: the platform and
 * version it announced, whether a newer one is out, and where that version's
 * complete notes are.
 */
final class PostRelease
{
    public function __construct(
        private readonly PlatformCatalog $platforms,
        private readonly ?string $factsPath = null,
    ) {}

    /**
     * "TablePro 0.77" is the first platform's; a release that names a device
     * ("TablePro for iPhone and iPad 1.0") is that platform's.
     *
     * @return array{platform: string, version: string}|null
     */
    public function of(Post $post): ?array
    {
        if ($post->release === null || preg_match('/\d+(?:\.\d+)+$/', $post->release, $version) !== 1) {
            return null;
        }

        $platform = null;

        foreach ($this->platforms->all() as $candidate) {
            $platform ??= $candidate['id'] ?? null;

            foreach ($candidate['deviceNames'] ?? [] as $device) {
                if (is_string($device) && str_contains($post->release, $device)) {
                    $platform = $candidate['id'] ?? null;

                    break 2;
                }
            }
        }

        return is_string($platform) ? ['platform' => $platform, 'version' => $version[0]] : null;
    }

    /**
     * Compared at the post's own precision, so 0.78.1 does not supersede a
     * post about 0.78.
     */
    public function superseded(Post $post): bool
    {
        $release = $this->of($post);
        $current = $release === null ? null : ($this->platforms->find($release['platform'])['release']['version'] ?? null);

        if ($release === null || ! is_string($current)) {
            return false;
        }

        $depth = substr_count($release['version'], '.') + 1;

        return version_compare(implode('.', array_slice(explode('.', $current), 0, $depth)), $release['version'], '>');
    }

    /**
     * The version's entry in the docs changelog and its GitHub release. Only
     * a platform with a `releases` destination publishes either.
     *
     * @return array{changelog: string|null, github: string}|null
     */
    public function notes(Post $post): ?array
    {
        $release = $this->of($post);
        $releases = $release === null ? null : ($this->platforms->destination($release['platform'], 'releases')['url'] ?? null);

        if ($release === null || ! is_string($releases) || ! str_starts_with($releases, 'https://')) {
            return null;
        }

        $version = substr_count($release['version'], '.') === 1 ? $release['version'] . '.0' : $release['version'];
        $changelog = $this->changelog();

        return [
            'changelog' => $changelog !== null ? $changelog . '#v' . str_replace('.', '-', $version) : null,
            'github' => rtrim($releases, '/') . '/tag/v' . $version,
        ];
    }

    private function changelog(): ?string
    {
        $path = $this->factsPath ?? resource_path('data/facts.json');
        $facts = File::isFile($path) ? json_decode((string) File::get($path), true) : null;
        $url = is_array($facts) ? ($facts['links']['changelog'] ?? null) : null;

        return is_string($url) && str_starts_with($url, 'https://') ? $url : null;
    }
}
