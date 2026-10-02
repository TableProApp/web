<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Services\Content\SiteFacts;
use App\Services\Releases\PlatformCatalog;
use App\Support\Content\ContentRepository;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The FAQ, `/faq` and `/vi/faq` (sitemap §A.1, design-system §8.12).
 *
 * The questions and answers are page copy in `content/{locale}/faq.json`.
 * Every fact an answer states (a requirement, a seat minimum, a refund
 * window, an engine or feature name, an outbound link) is a `{token}` or a
 * link reference in that copy, filled from the values sent here, so an answer
 * cannot disagree with the pricing, platform and privacy pages that read the
 * same files.
 *
 * There is no FAQPage markup (architecture §1.6): the page is a `WebPage`.
 */
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
                'iosLanguages' => $this->stringList($ios['appLanguages'] ?? []),
            ],
            'facts' => [
                'featuredEngines' => $facts->featuredEngineNames(),
                'bundledEngines' => $facts->bundledEngineNames(),
                'iosEngines' => array_column($facts->iosEngines($this->stringList($ios['iosEngines'] ?? []))['picker'], 'name'),
                'importApps' => $facts->connectionImportApps(),
                'localAiProviders' => $facts->localAiProviders(),
                'paidFeatures' => $facts->paidFeatureNames(),
                'commerce' => $facts->commerce(),
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
