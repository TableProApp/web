<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Services\Releases\PlatformCatalog;
use App\Support\Content\ContentRepository;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

// Every fact an answer states is a {token} or a link tag filled from these props, so the FAQ cannot disagree with the pages that read the same files.
class FaqController extends Controller
{
    public function __invoke(ContentRepository $content, PlatformCatalog $platforms, SiteFacts $facts): Response
    {
        $ios = $platforms->find('ios');

        return Inertia::render('Faq', [
            'content' => $content->page('faq', App::getLocale()),
            'platforms' => [
                'mac' => $platforms->summary('mac'),
                'ios' => $platforms->summary('ios'),
                'macLanguages' => $this->stringList($platforms->find('mac')['appLanguages'] ?? []),
                'linuxLanguages' => $this->stringList($platforms->find('linux')['appLanguages'] ?? []),
                'linuxDistributions' => $this->stringList(array_column($platforms->find('linux')['distributions'] ?? [], 'name')),
                'iosLanguages' => $this->stringList($ios['appLanguages'] ?? []),
            ],
            'facts' => [
                'featuredEngines' => $facts->featuredEngineNames(),
                'bundledEngines' => $facts->bundledEngineNames(),
                'iosEngines' => array_column($facts->iosEngines($this->stringList($ios['iosEngines'] ?? []))['picker'], 'name'),
                'importApps' => $facts->connectionImportApps(),
                'localAiProviders' => $facts->localAiProviders(),
                'paidFeatures' => $facts->paidFeatureNames(),
                'supportBusinessDays' => $facts->commerce()['supportBusinessDays'],
            ],
            'links' => $facts->links(),
            'organizationProfiles' => $facts->organizationProfiles(),
        ]);
    }

    /**
     * @return list<string>
     */
    private function stringList(mixed $value): array
    {
        return is_array($value) ? array_values(array_filter($value, 'is_string')) : [];
    }
}
