<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Services\Releases\GitHubRepoService;
use App\Services\Releases\MacReleaseService;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The iPhone and iPad page, `/ios` and `/vi/ios`.
 *
 * Still the pre-rebuild page until the iOS agent (W7f) writes its body in
 * phase C. `EnsurePageRenders` has already checked the registry, so this runs
 * only in a locale the page renders in, which is English alone until the
 * page's content lands.
 *
 * The legacy header needs `downloadUrls` and `githubStars`. They come from the
 * release services (architecture §1.13), cached with a last-good copy and a
 * failure marker, rather than from `LandingController`, which reads the full
 * releases list that plugin releases crowd and retries a failing API on every
 * request.
 */
class IosController extends Controller
{
    public function __invoke(MacReleaseService $releases, GitHubRepoService $repo): Response
    {
        $release = $releases->latest();

        return Inertia::render('Ios', [
            'downloadUrls' => [
                'arm64' => $release->assets['arm64']['url'],
                'x86_64' => $release->assets['x86_64']['url'],
            ],
            'githubStars' => $repo->stars(),
        ]);
    }
}
