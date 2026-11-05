<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Services\Releases\PlatformCatalog;
use App\Support\Content\ContentRepository;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

class LinuxController extends Controller
{
    public function __invoke(ContentRepository $content, PlatformCatalog $platforms, SiteFacts $facts): Response
    {
        $engines = $platforms->find('linux')['linuxEngines'] ?? [];

        return Inertia::render('Linux', [
            'content' => $content->page('linux', App::getLocale()),
            'engines' => $platforms->isAvailable('linux') && is_array($engines) ? $facts->engineLinks(array_values(array_filter($engines, 'is_string'))) : [],
            'links' => $facts->links(),
            'organizationProfiles' => $facts->organizationProfiles(),
        ]);
    }
}
