<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Services\Legal\LegalDocuments;
use App\Support\Content\ContentRepository;
use App\Support\Content\MarkdownExport;
use App\Support\Localization\Locales;
use App\Support\Seo\LegalPages;
use App\Support\Seo\SeoContext;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
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

    public function markdown(Request $request, SeoContext $seo, LegalDocuments $documents, ContentRepository $content, MarkdownExport $export): HttpResponse
    {
        $locale = App::getLocale();
        $entry = $seo->entryFor($request);
        $name = $entry === null ? null : (LegalPages::DOCUMENTS[$entry->route] ?? null);

        if ($entry === null || $name === null) {
            abort(404);
        }

        $source = $documents->source($name, $locale);
        $chrome = $content->page('legal', $locale);
        $notes = [str_replace('{date}', $source['updatedAt']->locale($locale)->isoFormat('LL'), $chrome['updated'])];

        if ($locale !== Locales::default()) {
            $english = (string) $entry->markdownUrl(Locales::default());
            $notes[] = $export->callout(
                $chrome['notice']['title'],
                (string) preg_replace('#<english>(.*?)</english>#', '[$1](' . $english . ')', $chrome['notice']['body']),
            );
        }

        return $this->markdownResponse(
            $export->document($source['title'], $source['description'], $notes, $export->body($source['body'], $locale, LegalDocuments::MARKERS)),
            $entry->url($locale),
        );
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
