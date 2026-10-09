<?php

use App\Services\Blog\AtomFeed;
use App\Services\Blog\BlogService;
use App\Services\Blog\Post;
use App\Support\Content\ContentRepository;
use Carbon\CarbonImmutable;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia;

const ATOM = 'http://www.w3.org/2005/Atom';

beforeEach(function (): void {
    config(['app.web_domain' => 'tablepro.app']);
});

function blogFeedDocument(TestResponse $response): SimpleXMLElement
{
    $document = simplexml_load_string((string) $response->getContent());

    expect($document)->not->toBeFalse('The feed is not well-formed XML.');

    return $document;
}

/**
 * @return array<string, string>  each `rel` of an element's links, with its href
 */
function blogFeedLinks(SimpleXMLElement $element): array
{
    $links = [];

    foreach ($element->link as $link) {
        $links[(string) $link['rel']] = (string) $link['href'];
    }

    return $links;
}

it('serves the English posts as an Atom feed, newest first', function (): void {
    $response = $this->get('/blog/feed.xml')->assertOk();
    $feed = blogFeedDocument($response);
    $posts = app(BlogService::class)->all('en');

    expect($response->headers->get('Content-Type'))->toBe('application/atom+xml; charset=utf-8')
        ->and($feed->getName())->toBe('feed')
        ->and($feed->getDocNamespaces())->toBe(['' => ATOM])
        ->and((string) $feed->id)->toBe('https://tablepro.app/blog')
        ->and((string) $feed->title)->toBe('TablePro Blog')
        ->and((string) $feed->subtitle)->toBe(app(ContentRepository::class)->page('blog', 'en')['seo']['description'])
        ->and((string) $feed->subtitle)->toContain('Database guides')->toContain('release notes')
        ->and((string) $feed->author->name)->not->toBe('')
        ->and(blogFeedLinks($feed))->toBe(['self' => 'https://tablepro.app/blog/feed.xml', 'alternate' => 'https://tablepro.app/blog'])
        ->and((string) $feed->updated)->toBe($posts[0]->date->toAtomString())
        ->and($feed->entry)->toHaveCount(count($posts));

    expect($posts)->not->toBeEmpty();

    foreach ($posts as $index => $post) {
        $entry = $feed->entry[$index];
        $url = 'https://tablepro.app/blog/' . $post->slug;

        expect((string) $entry->id)->toBe($url)
            ->and(blogFeedLinks($entry))->toBe(['alternate' => $url])
            ->and((string) $entry->title)->toBe($post->title)
            ->and((string) $entry->summary)->toBe($post->description)
            ->and((string) $entry->published)->toBe($post->date->toAtomString())
            ->and((string) $entry->updated)->toBe($post->date->toAtomString());

        $this->get('/blog/' . $post->slug)->assertOk();
    }
});

it('builds every URL from the canonical origin, never from the request host', function (): void {
    $response = $this->get('http://evil.example/blog/feed.xml')->assertOk();

    expect((string) $response->getContent())->not->toContain('evil.example');

    preg_match_all('#(?:href="|<id>)([^"<]+)#', (string) $response->getContent(), $urls);

    expect($urls[1])->not->toBeEmpty();

    foreach ($urls[1] as $url) {
        expect($url)->toStartWith('https://tablepro.app/');
    }
});

it('lets the edge keep the feed as it keeps a page', function (): void {
    $headers = $this->get('/blog/feed.xml')->assertOk()->baseResponse->headers;

    expect($headers->hasCacheControlDirective('public'))->toBeTrue()
        ->and($headers->getCacheControlDirective('max-age'))->toBe('0')
        ->and($headers->getCacheControlDirective('s-maxage'))->toBe('600')
        ->and($headers->getCacheControlDirective('stale-while-revalidate'))->toBe('3600')
        ->and($headers->getCookies())->toBe([]);
});

it('escapes whatever a post\'s front matter holds', function (): void {
    $post = new Post('q-and-a', 'en', 'Q&A: <b>"quotes"</b>', 'Less < more & ]]> done', CarbonImmutable::parse('2026-10-02'), [], null);
    $feed = simplexml_load_string((new AtomFeed())->render('TablePro Blog', 'A & B', 'The team', [$post]));

    expect($feed)->not->toBeFalse()
        ->and((string) $feed->subtitle)->toBe('A & B')
        ->and((string) $feed->entry[0]->title)->toBe('Q&A: <b>"quotes"</b>')
        ->and((string) $feed->entry[0]->summary)->toBe('Less < more & ]]> done');
});

it('has one feed, at the root', function (string $path): void {
    $this->get($path)->assertNotFound();
})->with(['/vi/blog/feed.xml', '/ja/blog/feed.xml']);

it('hands the feed to every blog page, whatever its language', function (string $path): void {
    $this->get($path)->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
        ->where('feed.url', 'https://tablepro.app/blog/feed.xml')
        ->where('feed.title', 'TablePro Blog'));
})->with(['/blog', '/vi/blog', '/blog/tablepro-0-77']);

it('advertises the feed in the head of blog pages only', function (): void {
    $link = '<link rel="alternate" type="application/atom+xml" title="TablePro Blog" href="https://tablepro.app/blog/feed.xml"';

    expect(ssrHtml('/blog'))->toContain($link)
        ->and(ssrHtml('/blog/tablepro-0-77'))->toContain($link)
        ->and(ssrHtml('/pricing'))->not->toContain('application/atom+xml');
});
