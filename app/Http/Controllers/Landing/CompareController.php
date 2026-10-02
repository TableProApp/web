<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use Inertia\Response;

/**
 * The comparison hub, `/compare`, and each comparison, such as `/compare/tableplus`.
 *
 * Phase A stub. The hub is new and answers 404 until it has content.
 * Comparisons render the pre-rebuild `Compare` page in English through
 * `LandingController`. The comparisons agent (W7d) owns this controller from
 * phase C.
 */
class CompareController extends Controller
{
    public function index(): Response
    {
        abort(404);
    }

    public function show(LandingController $legacy, string $slug): Response
    {
        return $legacy->compare($slug);
    }
}
