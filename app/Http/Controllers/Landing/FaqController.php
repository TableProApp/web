<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use Inertia\Response;

/**
 * The FAQ, `/faq` and `/vi/faq`.
 *
 * Phase A stub: it renders the pre-rebuild page through `LandingController`.
 * `EnsurePageRenders` has already checked the registry, so this runs only in a
 * locale the page renders in, which is English alone until the page's content
 * lands. Owned from then on by the FAQ agent (W7f).
 */
class FaqController extends Controller
{
    public function __invoke(LandingController $legacy): Response
    {
        return $legacy->faq();
    }
}
