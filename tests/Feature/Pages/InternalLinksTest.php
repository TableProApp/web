<?php

use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\RedirectMap;
use Dom\HTMLDocument;
use Illuminate\Support\Facades\Http;

beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

const INTERNAL_LINKS_PLATFORM = ['account', 'checkout', 'thank-you', 'newsletter', 'webhooks'];

const INTERNAL_LINKS_SYSTEM = ['/robots.txt', '/sitemap.xml', '/.well-known/security.txt', '/blog/feed.xml'];

function internalLinkTarget(string $href, string $page): ?array
{
    $href = trim($href);

    if ($href === '' || preg_match('/^(mailto|tel|sms):/i', $href) === 1) {
        return null;
    }

    if (str_starts_with($href, '#')) {
        return ['path' => $page, 'query' => '', 'fragment' => substr($href, 1)];
    }

    $parts = parse_url($href) ?: ['path' => $href];

    if (isset($parts['host']) || isset($parts['scheme'])) {
        $own = array_filter([parse_url(LocalizedUrl::base(), PHP_URL_HOST), 'tablepro.app', 'www.tablepro.app', config('app.web_domain'), 'localhost']);

        if (! in_array(strtolower((string) ($parts['host'] ?? '')), array_map('strtolower', $own), true)) {
            return null;
        }
    }

    return [
        'path' => ($parts['path'] ?? '') === '' ? '/' : $parts['path'],
        'query' => $parts['query'] ?? '',
        'fragment' => $parts['fragment'] ?? '',
    ];
}

function internalLinkProblem(array $target, string $locale, callable $status, callable $ids): ?string
{
    $path = $target['path'];
    $segments = explode('/', ltrim($path, '/'));

    if (! str_starts_with($path, '/')) {
        return 'is relative';
    }

    if (count($segments) > 1 && in_array($segments[0], Locales::codes(), true) && in_array($segments[1], INTERNAL_LINKS_PLATFORM, true)) {
        return 'puts the account app under a locale prefix';
    }

    if (in_array($segments[0], INTERNAL_LINKS_PLATFORM, true)) {
        parse_str($target['query'], $query);

        return $segments[0] !== 'account' || ($query['locale'] ?? null) === $locale ? null : "reaches the account app without ?locale={$locale}";
    }

    if (in_array($path, INTERNAL_LINKS_SYSTEM, true)) {
        return null;
    }

    if (preg_match('/\.[a-z0-9]{2,5}$/i', $path) === 1) {
        return is_file(public_path(ltrim($path, '/'))) ? null : 'names a file public/ does not have';
    }

    $retired = app(RedirectMap::class)->find($path);

    if ($retired !== null) {
        return "answers {$retired['status']}; link the target";
    }

    $code = $status($target['query'] === '' ? $path : "{$path}?{$target['query']}");

    if ($code !== 200) {
        return "answers {$code}";
    }

    $known = $target['fragment'] === '' ? null : $ids($path);

    return $known === null || in_array(rawurldecode($target['fragment']), $known, true) ? null : "has no #{$target['fragment']}";
}

function internalLinkPages(): array
{
    $pages = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            $pages[$entry->url($locale, false)] = $locale;
        }
    }

    return $pages;
}

function internalLinkPropHrefs(array $props): array
{
    $hrefs = [];

    array_walk_recursive($props, function (mixed $value, int|string $key) use (&$hrefs): void {
        if (! is_string($value)) {
            return;
        }

        if ($key === 'href' && preg_match('#^(/|\#)#', $value) === 1) {
            $hrefs[] = $value;
        }

        preg_match_all('/\bhref="([^"]+)"|\]\(((?:\/|\#)[^)\s]*)\)/', $value, $matches);

        foreach (array_filter([...$matches[1], ...$matches[2]]) as $href) {
            $hrefs[] = html_entity_decode($href, ENT_QUOTES | ENT_HTML5);
        }
    });

    return array_values(array_unique($hrefs));
}

function internalLinkStatus(array &$known): callable
{
    return function (string $url) use (&$known): int {
        return $known[$url] ??= test()->get($url)->getStatusCode();
    };
}

it('links only live pages from the props of every page', function (): void {
    $crawl = seoCrawlProps();
    $statuses = array_map(fn(array $page): int => $page['status'], $crawl);
    $problems = [];
    $checked = 0;

    foreach (internalLinkPages() as $path => $locale) {
        foreach (internalLinkPropHrefs($crawl[$path]['props']) as $href) {
            $target = internalLinkTarget($href, $path);
            $checked += $target === null ? 0 : 1;
            $problem = $target === null ? null : internalLinkProblem($target, $locale, internalLinkStatus($statuses), fn(): ?array => null);

            if ($problem !== null) {
                $problems[] = "{$path} → {$href} {$problem}";
            }
        }
    }

    expect($checked)->toBeGreaterThan(0)
        ->and(array_values(array_unique($problems)))->toBe([]);
});

it('links only live pages and real anchors, in the reader’s language, from every server-rendered page', function (): void {
    $pages = internalLinkPages();
    seoCrawlHtml();
    $statuses = [];
    $ids = [];
    $links = [];
    $idsIn = fn(HTMLDocument $document): array => array_map(
        fn(Dom\Element $element): string => (string) $element->getAttribute('id'),
        iterator_to_array($document->querySelectorAll('[id]')),
    );

    foreach ($pages as $path => $locale) {
        $document = HTMLDocument::createFromString(seoCrawledHtml($path), LIBXML_NOERROR);
        $statuses[$path] = 200;
        $ids[$path] = $idsIn($document);
        $links[$path] = array_map(
            fn(Dom\Element $link): array => [(string) $link->getAttribute('href'), $link->hasAttribute('hreflang')],
            iterator_to_array($document->querySelectorAll('a[href], area[href]')),
        );
    }

    $idsOf = function (string $path) use (&$ids, $idsIn): ?array {
        if (! array_key_exists($path, $ids)) {
            $response = test()->get($path);
            $ids[$path] = $response->getStatusCode() === 200 ? $idsIn(HTMLDocument::createFromString((string) $response->getContent(), LIBXML_NOERROR)) : null;
        }

        return $ids[$path];
    };

    $defaults = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        if ($entry->renders(Locales::default())) {
            $defaults[$entry->url(Locales::default(), false)] = $entry;
        }
    }

    $problems = [];
    $checked = 0;

    foreach ($pages as $path => $locale) {
        foreach ($links[$path] as [$href, $declaresLanguage]) {
            $target = internalLinkTarget($href, $path);

            if ($target === null) {
                continue;
            }

            $checked++;
            $problem = internalLinkProblem($target, $locale, internalLinkStatus($statuses), $idsOf);
            $entry = $defaults[$target['path']] ?? null;

            // Content stores unprefixed paths; <LocaleLink> adds the prefix, so only the rendered HTML shows a link that left the reader's language.
            if ($problem === null && $locale !== Locales::default() && ! $declaresLanguage && $entry?->renders($locale) && $entry->url($locale, false) !== $target['path']) {
                $problem = "leaves the reader's language; link " . $entry->url($locale, false);
            }

            if ($problem !== null) {
                $problems[] = "{$path} → {$href} {$problem}";
            }
        }
    }

    expect($checked)->toBeGreaterThan(0)
        ->and(array_values(array_unique($problems)))->toBe([]);
})->group('ssr');
