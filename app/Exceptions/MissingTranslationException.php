<?php

namespace App\Exceptions;

use App\Services\Blog\BlogService;
use App\Support\Localization\Locales;
use App\Support\Seo\BlogPosts;
use App\Support\Seo\PageEntry;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * A page that exists, but not in the locale that was asked for.
 *
 * Answered as a 404, never as the other language's body under this locale's
 * chrome. The error page offers the version that does exist, such as "Read it
 * in English" on `/vi/blog/{slug}` for an English-only release post.
 *
 * `EnsurePageRenders` throws it, through `forEntry()`, for every localized
 * route whose page does not render in the request's locale. For a blog post
 * the link carries the post's front-matter title, so `/vi/blog/tablepro-0-77`
 * offers "TablePro 0.77: SAP HANA and Folders in the Sidebar" (marked
 * `lang="en"` by the error page) rather than a generic "Read it in English".
 * Every other page keeps the generic link.
 */
class MissingTranslationException extends NotFoundHttpException
{
    public function __construct(
        public readonly string $locale,
        public readonly string $href,
        public readonly ?string $title = null,
    ) {
        parent::__construct("This page is not available in this language. It exists at {$href}.");
    }

    /**
     * The exception for a page that does not render in the requested locale.
     *
     * It points at the default locale's version when there is one, and
     * otherwise at the first locale the page renders in.
     */
    public static function forEntry(PageEntry $entry): self
    {
        $locale = in_array(Locales::default(), $entry->renderLocales, true)
            ? Locales::default()
            : $entry->renderLocales[0];

        return new self(
            locale: $locale,
            href: $entry->url($locale, false),
            title: self::titleOf($entry, $locale),
        );
    }

    /**
     * The `suggestion` prop of the error page.
     *
     * @return array{href: string, title: string|null, hreflang: string, locale: string}
     */
    public function suggestion(): array
    {
        return [
            'href' => $this->href,
            'title' => $this->title,
            'hreflang' => Locales::definition($this->locale)['hreflang'],
            'locale' => $this->locale,
        ];
    }

    /**
     * The page's own title in `$locale`, where it has one outside the
     * catalogs: a blog post's front-matter title. Null for every other page,
     * and for a post whose title is empty.
     */
    private static function titleOf(PageEntry $entry, string $locale): ?string
    {
        $slug = $entry->params['slug'] ?? null;

        if ($entry->route !== BlogPosts::ROUTE || ! is_string($slug)) {
            return null;
        }

        $title = app(BlogService::class)->find($slug, $locale)?->title;

        return is_string($title) && trim($title) !== '' ? trim($title) : null;
    }
}
