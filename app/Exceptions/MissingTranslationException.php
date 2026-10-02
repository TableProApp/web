<?php

namespace App\Exceptions;

use App\Support\Localization\Locales;
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
 * route whose page does not render in the request's locale. The blog agent
 * owns this class from phase C: `forEntry()` is where a family can add the
 * page's title (a post's front matter, say) so the link reads as the title
 * rather than as a generic "Read it in English".
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
}
