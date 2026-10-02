<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use Inertia\Response;

/**
 * The iPhone and iPad page, `/ios` and `/vi/ios`.
 *
 * Phase A stub: it renders the pre-rebuild page through `LandingController`.
 * `EnsurePageRenders` has already checked the registry, so this runs only in a
 * locale the page renders in, which is English alone until the page's content
 * lands. Owned from then on by the download agent (W4) in phase B and the iOS agent (W7f) in phase C.
 */
class IosController extends Controller
{
    public function __invoke(LandingController $legacy): Response
    {
        return $legacy->ios();
    }
}
