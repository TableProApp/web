<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

/**
 * The feature hub, `/features`, and the feature pages, `/features/{slug}`.
 *
 * Phase A stub. These pages are new and have no content yet, so the registry
 * knows none of them and `EnsurePageRenders` answers 404 before this runs. The
 * features agent (W7b) owns this controller from phase C.
 */
class FeatureController extends Controller
{
    public function index(): Response
    {
        abort(404);
    }

    public function show(string $slug): Response
    {
        abort(404);
    }
}
