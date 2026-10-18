<?php

namespace App\Http\Controllers;

use App\Http\Middleware\CacheHtmlAtEdge;
use App\Services\Blog\BlogService;
use App\Services\Blog\Post;
use App\Services\Content\SiteFacts;
use App\Services\Legal\LegalDocuments;
use App\Support\Content\ContentRepository;
use App\Support\Localization\Locales;
use App\Support\Seo\BlogPosts;
use App\Support\Seo\ContentCollection;
use App\Support\Seo\LegalPages;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\StaticPages;
use Illuminate\Http\Response;

// `/llms.txt` (llmstxt.org), in English, from the page registry.
class LlmsTxtController extends Controller
{
    public const PATH = '/llms.txt';

    // Pages left out: the homepage is this file's summary, the blog index is
    // the posts listed below, and an integration page is the integrations hub's.
    public const SECTIONS = [
        'Product' => [
            'landing.features.index',
            'landing.features.show',
            'landing.pricing',
            'landing.download',
            'landing.ios',
            'landing.integrations.index',
            'landing.faq',
            'landing.security',
            'landing.about',
        ],
        'Databases' => ['landing.databases.index', 'landing.databaseClient'],
        'Comparisons' => ['landing.compare.index', 'landing.compare'],
    ];

    public function __construct(
        private readonly PageRegistry $registry,
        private readonly ContentRepository $content,
        private readonly BlogService $blog,
        private readonly LegalDocuments $legal,
        private readonly SiteFacts $facts,
    ) {}

    public function __invoke(): Response
    {
        $locale = Locales::default();
        $entries = array_values(array_filter($this->registry->all(), fn(PageEntry $entry): bool => $entry->isIndexable($locale)));

        $sections = ['Docs' => ['- [Documentation](' . rtrim((string) $this->facts->links()['docs'], '/') . '/llms.txt)']];

        foreach (self::SECTIONS as $section => $routes) {
            foreach ($routes as $route) {
                foreach ($entries as $entry) {
                    if ($entry->route === $route) {
                        $sections[$section][] = $this->contentLink($entry, $locale);
                    }
                }
            }
        }

        $sections['Guides'] = [];
        $sections['Optional'] = [];
        $posts = [];

        foreach ($entries as $entry) {
            if ($entry->route === BlogPosts::ROUTE) {
                $posts[$entry->params['slug']] = $entry;
            }
        }

        foreach ($this->blog->all($locale) as $post) {
            if (isset($posts[$post->slug])) {
                $section = $post->kind() === Post::KIND_GUIDE ? 'Guides' : 'Optional';
                $sections[$section][] = self::link($post->title, (string) $posts[$post->slug]->markdownUrl($locale), $post->description);
            }
        }

        foreach ($entries as $entry) {
            $document = LegalPages::DOCUMENTS[$entry->route] ?? null;

            if ($document !== null) {
                $source = $this->legal->source($document, $locale);
                $sections['Optional'][] = self::link($source['title'], (string) $entry->markdownUrl($locale), $source['description']);
            }
        }

        $lines = ['# ' . config('app.name'), '', '> ' . $this->content->page('home', $locale)['seo']['description']];

        foreach (array_filter($sections) as $section => $links) {
            array_push($lines, '', '## ' . $section, '', ...$links);
        }

        return response(implode("\n", $lines) . "\n", 200, [
            'Content-Type' => 'text/plain; charset=utf-8',
            'Cache-Control' => CacheHtmlAtEdge::CACHE_CONTROL,
        ]);
    }

    private function contentLink(PageEntry $entry, string $locale): string
    {
        $name = StaticPages::PAGES[$entry->route] ?? ContentCollection::contentName($entry);
        $copy = $this->content->page((string) $name, $locale);
        $title = (string) $copy['seo']['title'];

        // A title with a `{slot}` is filled in the browser; the card title is the same name without it.
        if (str_contains($title, '{')) {
            $title = (string) $copy['og']['title'];
        }

        return self::link($title, $entry->url($locale), (string) $copy['seo']['description']);
    }

    private static function link(string $title, string $url, string $description): string
    {
        return '- [' . $title . '](' . $url . ')' . ($description === '' ? '' : ': ' . $description);
    }
}
