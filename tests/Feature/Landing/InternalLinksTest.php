<?php

use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\RedirectMap;
use Dom\HTMLDocument;
use Illuminate\Support\Facades\Http;

require_once __DIR__ . '/../Seo/helpers.php';

/**
 * No page links to a page that is not there (architecture §1.17
 * "InternalLinksTest"; spec §10 "remove obsolete internal links").
 *
 * Every registry URL is crawled in each locale it renders in, and every
 * internal link it carries must:
 *
 * - answer 200, so a link never lands on a 404, a 410 or a redirect, including
 *   the normalising ones (`/blog/` → `/blog`);
 * - not be a source in the redirect map, so the site never sends its own
 *   readers through a 301 it keeps only for old inbound links;
 * - for a fragment, land on an element with that id on the target page;
 * - reach the account app (sitemap §B.5, §C.8) at `/account`, never under a
 *   locale prefix, and carry `?locale=` with the page's own locale. The other
 *   paths the license app owns on this domain are not requested: this app
 *   does not serve them;
 * - on a page in a language other than the default, stay in that language:
 *   a link to a page that renders in it uses its URL there, so a component
 *   that drops `<LocaleLink>` cannot send every Vietnamese reader to English
 *   pages. A link that declares its language (`hreflang`, which the language
 *   switcher sets) and a link to a page that exists only in English, such as
 *   a release post, are exempt.
 *
 * Two layers. The first reads the links the server hands each page (every
 * `href` prop and every link inside rendered markdown) and runs on every
 * machine. The second crawls the server-rendered HTML, header, footer and
 * all, and needs a current SSR bundle: it skips without one and fails under
 * `REQUIRE_SSR`, like every SSR-gated test. The language rule runs only in the
 * second layer: content stores unprefixed paths, and `<LocaleLink>` adds the
 * prefix when it renders.
 */
beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

/** The first path segments the license app answers on this domain (sitemap §C.8). */
const INTERNAL_LINKS_PLATFORM = ['account', 'checkout', 'thank-you', 'newsletter', 'api', 'beta', 'discount', 'webhooks', 'platform-build'];

/** Paths this app serves that are not pages: crawler files. */
const INTERNAL_LINKS_SYSTEM = ['/robots.txt', '/sitemap.xml', '/.well-known/security.txt'];

/**
 * An internal href as path, query and fragment, or null for an external or
 * non-HTTP link. A fragment-only href resolves against the page it is on.
 *
 * @return array{path: string, query: string, fragment: string}|null
 */
function internalLinkTarget(string $href, string $page): ?array
{
    $href = trim($href);

    if ($href === '' || preg_match('/^(mailto|tel|sms):/i', $href) === 1) {
        return null;
    }

    if (str_starts_with($href, '#')) {
        return ['path' => $page, 'query' => '', 'fragment' => substr($href, 1)];
    }

    $parts = parse_url($href);

    if ($parts === false) {
        return ['path' => $href, 'query' => '', 'fragment' => ''];
    }

    if (isset($parts['host']) || isset($parts['scheme'])) {
        $own = [parse_url(LocalizedUrl::base(), PHP_URL_HOST), 'tablepro.app', 'www.tablepro.app', config('app.web_domain'), 'localhost'];

        if (! in_array(strtolower((string) ($parts['host'] ?? '')), array_map('strtolower', array_filter($own)), true)) {
            return null;
        }
    }

    return [
        'path' => ($parts['path'] ?? '') === '' ? '/' : $parts['path'],
        'query' => $parts['query'] ?? '',
        'fragment' => $parts['fragment'] ?? '',
    ];
}

/**
 * What is wrong with one link from a page, or null. `$status` answers a path
 * (with its query) with its HTTP status; `$ids` answers a path with the ids
 * its document holds, or null when the layer cannot see them.
 *
 * @param  array{path: string, query: string, fragment: string}  $target
 * @param  callable(string): int  $status
 * @param  callable(string): (list<string>|null)  $ids
 */
function internalLinkProblem(array $target, string $locale, callable $status, callable $ids): ?string
{
    $path = $target['path'];
    $segments = explode('/', ltrim($path, '/'));

    if (! str_starts_with($path, '/')) {
        return 'is relative; internal links start at the root';
    }

    if (count($segments) > 1 && in_array($segments[0], ['vi', 'en'], true) && in_array($segments[1], INTERNAL_LINKS_PLATFORM, true)) {
        return "puts the account app under a locale prefix; link /{$segments[1]} with ?locale={$locale}";
    }

    if (in_array($segments[0], INTERNAL_LINKS_PLATFORM, true)) {
        if ($segments[0] !== 'account') {
            return null;
        }

        parse_str($target['query'], $query);

        return ($query['locale'] ?? null) === $locale ? null : "reaches the account app without ?locale={$locale}";
    }

    if (in_array($path, INTERNAL_LINKS_SYSTEM, true)) {
        return null;
    }

    if (preg_match('/\.[a-z0-9]{2,5}$/i', $path) === 1) {
        return is_file(public_path(ltrim($path, '/'))) ? null : 'names a file that public/ does not have';
    }

    $retired = app(RedirectMap::class)->find($path);

    if ($retired !== null) {
        return $retired['status'] === 301 ? "goes through a 301 to {$retired['to']}; link the target" : "links a page that answers {$retired['status']}";
    }

    $url = $target['query'] === '' ? $path : "{$path}?{$target['query']}";
    $code = $status($url);

    if ($code !== 200) {
        return "answers {$code}";
    }

    if ($target['fragment'] !== '') {
        $known = $ids($path);

        if ($known !== null && ! in_array(rawurldecode($target['fragment']), $known, true)) {
            return "has no element with id=\"{$target['fragment']}\"";
        }
    }

    return null;
}

/**
 * Every registry page by its URL in the default locale.
 *
 * @return array<string, PageEntry>
 */
function internalLinkDefaultUrls(): array
{
    $entries = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        if ($entry->renders(Locales::default())) {
            $entries[$entry->url(Locales::default(), false)] = $entry;
        }
    }

    return $entries;
}

/**
 * Why a link on a page in `$locale` leaves the reader's language, or null.
 *
 * Only a link to a page that also renders in `$locale` can be wrong: a
 * release post exists in English alone, so linking it in English is right.
 * A link that declares its own language (`hreflang`) is a deliberate switch.
 *
 * @param  array{path: string, query: string, fragment: string}  $target
 * @param  array<string, PageEntry>  $defaultUrls
 */
function internalLinkLocaleProblem(array $target, string $locale, bool $declaresLanguage, array $defaultUrls): ?string
{
    if ($locale === Locales::default() || $declaresLanguage) {
        return null;
    }

    $entry = $defaultUrls[$target['path']] ?? null;

    if ($entry === null || ! $entry->renders($locale)) {
        return null;
    }

    $own = $entry->url($locale, false);

    return $own === $target['path'] ? null : "leaves the reader's language; link {$own}";
}

/**
 * Every registry URL with the locale it renders in.
 *
 * @return array<string, string>
 */
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

/**
 * The hrefs the server hands a page: every `href` prop that is a path or a
 * fragment, and every link inside an HTML or markdown string.
 *
 * @param  array<string, mixed>  $props
 * @return list<string>
 */
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

        foreach ([...$matches[1], ...$matches[2]] as $href) {
            if ($href !== '') {
                $hrefs[] = html_entity_decode($href, ENT_QUOTES | ENT_HTML5);
            }
        }
    });

    return array_values(array_unique($hrefs));
}

/**
 * A status lookup that remembers each answer, seeded with the pages already
 * fetched.
 *
 * @param  array<string, int>  $known
 * @return callable(string): int
 */
function internalLinkStatuses(array &$known): callable
{
    return function (string $url) use (&$known): int {
        return $known[$url] ??= test()->get($url)->getStatusCode();
    };
}

it('links only live pages from what the server hands every page', function (): void {
    $crawl = seoCrawlProps();
    $statuses = array_map(fn(array $page): int => $page['status'], $crawl);
    $problems = [];
    $checked = 0;

    foreach (internalLinkPages() as $path => $locale) {
        foreach (internalLinkPropHrefs($crawl[$path]['props']) as $href) {
            $target = internalLinkTarget($href, $path);

            if ($target === null) {
                continue;
            }

            $checked++;
            $problem = internalLinkProblem($target, $locale, internalLinkStatuses($statuses), fn(): ?array => null);

            if ($problem !== null) {
                $problems["{$path} → {$href}"] = "{$path} → {$href} {$problem}";
            }
        }
    }

    expect($checked)->toBeGreaterThan(200)
        ->and(array_values($problems))->toBe([], "Broken internal links in page props:\n  " . implode("\n  ", $problems));
});

it('links only live pages and real anchors from every server-rendered page', function (): void {
    $pages = internalLinkPages();
    $html = seoCrawlHtml();
    $statuses = [];
    $ids = [];
    $links = [];

    $idsIn = fn(HTMLDocument $document): array => array_map(
        fn(Dom\Element $element): string => (string) $element->getAttribute('id'),
        iterator_to_array($document->querySelectorAll('[id]')),
    );

    foreach ($pages as $path => $locale) {
        $document = HTMLDocument::createFromString($html[$path], LIBXML_NOERROR);
        $statuses[$path] = 200;
        $ids[$path] = $idsIn($document);
        $links[$path] = [];

        foreach ($document->querySelectorAll('a[href], area[href]') as $link) {
            $links[$path][] = [(string) $link->getAttribute('href'), $link->hasAttribute('hreflang')];
        }
    }

    $idsOf = function (string $path) use (&$ids, $idsIn): ?array {
        if (! array_key_exists($path, $ids)) {
            $response = test()->get($path);

            $ids[$path] = $response->getStatusCode() === 200
                ? $idsIn(HTMLDocument::createFromString((string) $response->getContent(), LIBXML_NOERROR))
                : null;
        }

        return $ids[$path];
    };

    $problems = [];
    $checked = 0;
    $defaultUrls = internalLinkDefaultUrls();

    foreach ($pages as $path => $locale) {
        foreach ($links[$path] as [$href, $declaresLanguage]) {
            $target = internalLinkTarget($href, $path);

            if ($target === null) {
                continue;
            }

            $checked++;
            $problem = internalLinkProblem($target, $locale, internalLinkStatuses($statuses), $idsOf)
                ?? internalLinkLocaleProblem($target, $locale, $declaresLanguage, $defaultUrls);

            if ($problem !== null) {
                $problems["{$path} → {$href}"] = "{$path} → {$href} {$problem}";
            }
        }
    }

    expect($checked)->toBeGreaterThan(1000)
        ->and(array_values($problems))->toBe([], "Broken internal links in the rendered pages:\n  " . implode("\n  ", $problems));
})->group('ssr');

it('judges each kind of link the way the crawl needs', function (string $href, string $locale, ?string $problem): void {
    $statuses = ['/pricing' => 200, '/vi/pricing' => 200, '/nowhere' => 404];
    $status = fn(string $url): int => $statuses[strtok($url, '?')] ?? 200;
    $ids = fn(string $path): ?array => $path === '/pricing' ? ['plans', 'faq'] : null;
    $target = internalLinkTarget($href, '/pricing');

    $found = $target === null ? null : internalLinkProblem($target, $locale, $status, $ids);

    expect($found === null ? null : explode(';', $found)[0])->toBe($problem);
})->with([
    'a missing page' => ['/nowhere', 'en', 'answers 404'],
    'a retired page' => ['/mariadb-client', 'en', 'goes through a 301 to /mysql-client#mariadb'],
    'a removed page' => ['/compare/azimutt', 'en', 'links a page that answers 410'],
    'a missing anchor' => ['#nope', 'en', 'has no element with id="nope"'],
    'the account in the wrong language' => ['/account?locale=en', 'vi', 'reaches the account app without ?locale=vi'],
    'the account under a prefix' => ['/vi/account?locale=vi', 'vi', 'puts the account app under a locale prefix'],
    'an absolute link to this site' => ['https://tablepro.app/nowhere', 'en', 'answers 404'],
    'a relative link' => ['pricing', 'en', 'is relative'],
    'a missing file' => ['/images/nowhere.png', 'en', 'names a file that public/ does not have'],
]);

it('keeps a reader in their language when a page links a page that exists in it', function (string $href, string $page, string $locale, bool $hreflang, ?string $problem): void {
    $target = internalLinkTarget($href, $page);
    $found = internalLinkLocaleProblem($target, $locale, $hreflang, internalLinkDefaultUrls());

    expect($found === null ? null : explode(';', $found)[0])->toBe($problem);
})->with([
    'the English twin from a Vietnamese page' => ['/pricing', '/vi', 'vi', false, "leaves the reader's language"],
    'the language switcher' => ['/pricing', '/vi/pricing', 'vi', true, null],
    'an English-only release post' => ['/blog/tablepro-0-77', '/vi/blog', 'vi', false, null],
]);
