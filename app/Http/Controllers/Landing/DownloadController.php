<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use Inertia\Response;

/**
 * The download page, `/download` and `/vi/download`.
 *
 * Phase A stub: it renders the pre-rebuild page through `LandingController`.
 * `EnsurePageRenders` has already checked the registry, so this runs only in a
 * locale the page renders in, which is English alone until the page's content
 * lands. Owned from then on by the download agent (W4).
 */
class DownloadController extends Controller
{
    public function __invoke(LandingController $legacy): Response
    {
        return $legacy->download();
    }
}
