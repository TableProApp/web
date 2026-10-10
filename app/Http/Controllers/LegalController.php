<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Services\Legal\LegalDocuments;
use App\Support\Content\ContentRepository;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The privacy policy, terms and refund policy in each locale, and the brand
 * guidelines in English (sitemap §A.6, §E.7; design-system §8.11).
 *
 * The documents are markdown in `resources/data/legal/{locale}/`. English is
 * authoritative; each Vietnamese file is a full translation, and the page
 * says the English version prevails. `EnsurePageRenders` has already asked
 * the registry, so a document is only rendered in a locale it exists in.
 *
 * Each document keeps its own component name (`Privacy`, `Terms`,
 * `RefundPolicy`, `Brand`) over one shared template, so a document can grow
 * its own controls, such as the privacy page's "Cookie settings" button and
 * the brand guidelines' logo files.
 */
class LegalController extends Controller
{
    public function privacy(LegalDocuments $documents, ContentRepository $content, SiteFacts $facts): Response
    {
        return $this->document('Privacy', 'privacy', '/privacy', $documents, $content, $facts);
    }

    public function terms(LegalDocuments $documents, ContentRepository $content, SiteFacts $facts): Response
    {
        return $this->document('Terms', 'terms', '/terms', $documents, $content, $facts);
    }

    public function refundPolicy(LegalDocuments $documents, ContentRepository $content, SiteFacts $facts): Response
    {
        return $this->document('RefundPolicy', 'refund-policy', '/refund-policy', $documents, $content, $facts);
    }

    public function brand(LegalDocuments $documents, ContentRepository $content, SiteFacts $facts): Response
    {
        return $this->document('Brand', 'brand', '/brand', $documents, $content, $facts);
    }

    private function document(string $component, string $name, string $path, LegalDocuments $documents, ContentRepository $content, SiteFacts $facts): Response
    {
        $locale = App::getLocale();
        $chrome = $content->page('legal', $locale);
        $permalink = $chrome['permalink'] ?? null;

        return Inertia::render($component, [
            'document' => [
                'name' => $name,
                'path' => $path,
                ...$documents->render($name, $locale, is_string($permalink) ? $permalink : null),
            ],
            'chrome' => $chrome,
            'links' => $facts->links(),
            'organizationProfiles' => $facts->organizationProfiles(),
        ]);
    }
}
