<?php

namespace App\Services\Blog;

use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use XMLWriter;

/**
 * The blog as an Atom feed (RFC 4287): the default language's posts, with
 * every URL built from the canonical origin.
 */
final class AtomFeed
{
    public const PATH = '/blog/feed.xml';

    public const TYPE = 'application/atom+xml';

    public static function url(): string
    {
        return LocalizedUrl::base() . self::PATH;
    }

    /**
     * @param  non-empty-list<Post>  $posts  newest first
     */
    public function render(string $title, ?string $subtitle, string $author, array $posts): string
    {
        $base = LocalizedUrl::base();
        $locale = Locales::default();
        $blog = $base . LocalizedUrl::path('/blog', $locale);

        $xml = new XMLWriter();
        $xml->openMemory();
        $xml->setIndent(true);
        $xml->startDocument('1.0', 'UTF-8');

        $xml->startElement('feed');
        $xml->writeAttribute('xmlns', 'http://www.w3.org/2005/Atom');
        $xml->writeAttribute('xml:lang', Locales::definition($locale)['hreflang']);
        $xml->writeElement('id', $blog);
        $xml->writeElement('title', $title);

        if ($subtitle !== null) {
            $xml->writeElement('subtitle', $subtitle);
        }

        $xml->writeElement('updated', $posts[0]->date->toAtomString());
        $this->link($xml, 'self', self::TYPE, self::url());
        $this->link($xml, 'alternate', 'text/html', $blog);
        $xml->startElement('author');
        $xml->writeElement('name', $author);
        $xml->endElement();

        foreach ($posts as $post) {
            $url = $base . $post->url();

            $xml->startElement('entry');
            $xml->writeElement('id', $url);
            $xml->writeElement('title', $post->title);
            $this->link($xml, 'alternate', 'text/html', $url);
            $xml->writeElement('published', $post->date->toAtomString());
            $xml->writeElement('updated', $post->date->toAtomString());
            $xml->writeElement('summary', $post->description);
            $xml->endElement();
        }

        $xml->endElement();
        $xml->endDocument();

        return $xml->outputMemory();
    }

    private function link(XMLWriter $xml, string $rel, string $type, string $href): void
    {
        $xml->startElement('link');
        $xml->writeAttribute('rel', $rel);
        $xml->writeAttribute('type', $type);
        $xml->writeAttribute('href', $href);
        $xml->endElement();
    }
}
