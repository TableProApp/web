<?php

use Dom\HTMLDocument;

function sourceLinks(string $path): array
{
    $document = HTMLDocument::createFromString(ssrHtml($path), LIBXML_NOERROR);
    $urls = [];

    foreach (json_decode((string) file_get_contents(resource_path('data/comparisons.json')), true)['products'] as $product) {
        foreach ($product['sources'] as $source) {
            $urls[$source['url']] = true;
        }
    }

    $links = [];

    foreach ($document->querySelectorAll('main a[href^="http"]') as $anchor) {
        if (isset($urls[$anchor->getAttribute('href')])) {
            $links[] = ['hreflang' => $anchor->getAttribute('hreflang'), 'lang' => $anchor->getAttribute('lang')];
        }
    }

    return $links;
}

beforeEach(function (): void {
    requireSsr();
});

it('marks every cited source title as English on a page in another language', function (string $path): void {
    $links = sourceLinks($path);

    expect($links)->not->toBeEmpty();

    foreach ($links as $link) {
        expect($link)->toBe(['hreflang' => 'en', 'lang' => 'en']);
    }
})->with(['/de/compare/datagrip', '/ja/compare', '/vi/postgresql-client'])->group('ssr');

it('leaves the source titles unmarked on an English page, where they are in the page language', function (): void {
    foreach (sourceLinks('/compare/datagrip') as $link) {
        expect($link)->toBe(['hreflang' => 'en', 'lang' => null]);
    }
})->group('ssr');
