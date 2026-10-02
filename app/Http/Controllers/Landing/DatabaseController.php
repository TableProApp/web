<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use Inertia\Response;

/**
 * The database hub, `/databases`, and each engine page, such as `/mysql-client`.
 *
 * Phase A stub. The hub is new and answers 404 until it has content. Engine
 * pages render the pre-rebuild `DatabaseClient` page in English through
 * `LandingController`. The databases agent (W7c) owns this controller from
 * phase C.
 */
class DatabaseController extends Controller
{
    public function index(): Response
    {
        abort(404);
    }

    public function show(LandingController $legacy, string $slug): Response
    {
        return $legacy->databaseClient($slug);
    }
}
