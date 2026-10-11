<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Support\Content\ContentRepository;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Who makes TablePro, `/about` in every locale.
 *
 * The maker's name, city and country are `facts.json` → `publisher`, and the
 * repository's creation date is `openSource.repositoryCreatedAt`. The copy
 * holds `{maker}`, `{city}` and `{country}` slots and link tags, never the
 * values themselves.
 */
class AboutController extends Controller
{
    public function __invoke(ContentRepository $content, SiteFacts $facts): Response
    {
        $locale = App::getLocale();
        $created = $facts->repositoryCreatedAt();

        return Inertia::render('About', [
            'content' => $content->page('about', $locale),
            'publisher' => $facts->publisher($locale),
            'repositoryCreated' => $created === null ? null : [
                'date' => $created->toDateString(),
                'formatted' => $created->locale($locale)->isoFormat('LL'),
            ],
            'links' => $facts->links(),
            'organizationProfiles' => $facts->organizationProfiles(),
        ]);
    }
}
