<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Support\Content\ContentRepository;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

// The sponsors and tiers come from resources/data/sponsors.json, which the page imports itself.
class SponsorsController extends Controller
{
    public function __invoke(ContentRepository $content, SiteFacts $site): Response
    {
        return Inertia::render('Sponsors', [
            'content' => $content->page('sponsors', App::getLocale()),
            'organizationProfiles' => $site->organizationProfiles(),
        ]);
    }
}
