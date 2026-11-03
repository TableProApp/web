<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Support\Content\ContentRepository;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

// Prices, seat bounds and the support address come from resources/data, which the page imports itself.
class TeamsController extends Controller
{
    public function __invoke(ContentRepository $content, SiteFacts $site): Response
    {
        return Inertia::render('Teams', [
            'content' => $content->page('teams', App::getLocale()),
            'organizationProfiles' => $site->organizationProfiles(),
        ]);
    }
}
