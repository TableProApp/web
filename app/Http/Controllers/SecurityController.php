<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Support\Content\ContentRepository;
use App\Support\Features\FeatureFacts;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

class SecurityController extends Controller
{
    public function __invoke(ContentRepository $content, FeatureFacts $facts, SiteFacts $site): Response
    {
        $page = $content->page('security', App::getLocale());
        $links = $site->links();

        return Inertia::render('Security', [
            'content' => $page,
            'facts' => $this->values($facts->for($page)),
            'links' => [
                ...$links,
                'securityPolicy' => $links['github'] === null ? null : $links['github'] . '/security/policy',
                'securityAdvisory' => $links['github'] === null ? null : $links['github'] . '/security/advisories/new',
                'securityTxt' => SecurityTxtController::PATH,
            ],
            'organizationProfiles' => $site->organizationProfiles(),
        ]);
    }

    /**
     * @param  array<string, array<string, mixed>>  $facts
     * @return array<string, string|list<string>>
     */
    private function values(array $facts): array
    {
        $values = [];

        foreach ($facts as $name => $fact) {
            if ($fact['kind'] === 'text') {
                $values[$name] = (string) $fact['value'];
            } elseif ($fact['kind'] === 'names') {
                $values[$name] = array_values(array_map('strval', $fact['items']));
            }
        }

        return $values;
    }
}
