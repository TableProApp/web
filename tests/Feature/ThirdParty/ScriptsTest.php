<?php

use PHPUnit\Framework\Assert;

/**
 * No third-party script is in a document this app serves (architecture §1.12).
 *
 * - Crisp's chat loader is added by the page itself, once it has loaded and
 *   the browser is idle (`lib/crisp.ts`), so it is never in the server render
 *   and never delays the first paint. Its launcher is then on every page.
 * - The Polar or Lemon Squeezy checkout SDK loaded on every page; it now loads
 *   at checkout intent, from a module, never from the document.
 * - The Product Hunt badge was a hotlink that set `__cf_bm` before consent.
 *   The homepage now names Product Hunt in a plain text link (spec §0): an
 *   anchor the reader follows, which makes no request until it is clicked.
 *
 * Google Analytics runs in Consent Mode, and its script is added by the head
 * after the load event, once the browser is idle, so the served document
 * loads no external script at all (AnalyticsConsentTest). In production
 * Cloudflare also injects its Web Analytics beacon
 * (`static.cloudflareinsights.com`) at the edge; it is a Cloudflare setting,
 * not in this repository, so no test here can see it, and the privacy policy
 * discloses it (docs/architecture.md, Third-party scripts). Executing the
 * chat's timing is `tests/js/crisp.test.ts`; this file holds the documents.
 */

const THIRD_PARTY_HOSTS = ['client.crisp.chat', '@polar-sh/checkout', 'lemon.js', 'lemonsqueezy.com', 'producthunt.com'];

/**
 * Outbound links a page may carry to one of those hosts. Only a plain `<a>`
 * with exactly this `href` is exempt; the same URL in `src`, `srcset`, a
 * `<link>` or a script still fails.
 *
 * @var list<string>
 */
const ALLOWED_OUTBOUND_LINKS = ['https://www.producthunt.com/products/tablepro'];

/**
 * The page with each allowed outbound anchor's opening tag blanked, so what
 * remains is checked for requests to third-party hosts.
 */
function withoutAllowedLinks(string $html): string
{
    foreach (ALLOWED_OUTBOUND_LINKS as $url) {
        $html = (string) preg_replace('#<a\b[^>]*\bhref="' . preg_quote($url, '#') . '"[^>]*>#', '<a>', $html);
    }

    return $html;
}

/**
 * Pages whose rendered HTML is checked: the homepage (rebuilt without the
 * Product Hunt hotlink, with a plain text link instead), the download page and
 * the pricing page, whose buy buttons load the checkout SDK only at checkout
 * intent.
 *
 * @return list<string>
 */
function thirdPartyPages(): array
{
    return ['/', '/vi', '/download', '/vi/download', '/pricing', '/vi/pricing'];
}

it('loads no third-party script from the document template', function (): void {
    $blade = (string) file_get_contents(resource_path('views/app.blade.php'));

    foreach (THIRD_PARTY_HOSTS as $host) {
        Assert::assertStringNotContainsString($host, $blade, "app.blade.php loads {$host}");
    }

    foreach (glob(resource_path('views/partials/*.blade.php')) ?: [] as $partial) {
        foreach (THIRD_PARTY_HOSTS as $host) {
            Assert::assertStringNotContainsString($host, (string) file_get_contents($partial), basename($partial) . " loads {$host}");
        }
    }
});

it('serves documents that load no external script, the analytics tag included', function (string $path): void {
    config(['analytics.google.measurement_id' => 'G-TEST123', 'services.crisp.website_id' => 'crisp-test-id']);

    $html = $this->get($path)->assertOk()->getContent();

    preg_match_all('/<script[^>]*\ssrc="([^"]+)"/', $html, $sources);

    foreach ($sources[1] as $source) {
        Assert::assertFalse(str_starts_with($source, 'http') || str_starts_with($source, '//'), "{$path} loads {$source} from the document");
    }

    // The tag's URL is in the head's loader, which adds it after the load event.
    Assert::assertStringContainsString('var src = "https://www.googletagmanager.com/gtag/js?id=G-TEST123"', $html);

    foreach (THIRD_PARTY_HOSTS as $host) {
        Assert::assertStringNotContainsString($host, $html, "{$path} mentions {$host} before anyone asked for it");
    }

    // The website id travels as a page prop for the page to load the chat with, and the document loads nothing.
    Assert::assertStringContainsString('crisp-test-id', $html);
})->with(['/download', '/vi/download']);

it('loads chat only from an effect, and opens it only from a click', function (): void {
    /*
     * Every module that imports the chat helper opens the chat from a click
     * handler and nowhere else, and loads it only inside an effect, so the
     * loader never runs during the server render or at import time.
     */
    $importers = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(resource_path('js'), FilesystemIterator::SKIP_DOTS));

    foreach ($iterator as $file) {
        $text = (string) file_get_contents($file->getPathname());

        if ($file->getFilename() !== 'crisp.ts' && str_contains($text, "from '@/lib/crisp'")) {
            $importers[$file->getFilename()] = $text;
        }
    }

    expect($importers)->not->toBeEmpty();

    foreach ($importers as $name => $text) {
        $calls = substr_count($text, 'openChat(');
        $clicks = preg_match_all('/onClick=\{\(\) => openChat\(/', $text);

        Assert::assertSame($calls, $clicks, "{$name} calls openChat() outside a click handler");

        $loads = substr_count($text, 'loadChatWhenIdle(');
        $effects = preg_match_all('/useEffect\(\(\) => loadChatWhenIdle\(/', $text);

        Assert::assertSame($loads, $effects, "{$name} calls loadChatWhenIdle() outside an effect");
        Assert::assertStringNotContainsString('loadChat(', str_replace('loadChatWhenIdle(', '', $text), "{$name} loads the chat without waiting for the page");
    }
});

it('renders no third-party request into any page it serves', function (): void {
    config(['services.crisp.website_id' => 'crisp-test-id']);

    foreach (thirdPartyPages() as $path) {
        $html = withoutAllowedLinks(ssrHtml($path));

        foreach (THIRD_PARTY_HOSTS as $host) {
            Assert::assertStringNotContainsString($host, $html, "{$path} renders {$host}");
        }
    }
});

it('exempts only a plain anchor to an allowed outbound link', function (): void {
    $anchor = '<a class="x" href="https://www.producthunt.com/products/tablepro">TablePro on Product Hunt</a>';

    expect(withoutAllowedLinks($anchor))->not->toContain('producthunt.com');

    foreach ([
        '<img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1">',
        '<link rel="preconnect" href="https://www.producthunt.com/products/tablepro">',
        '<a href="https://www.producthunt.com/products/tablepro?embed=true"><img src="x.svg"></a>',
        '<script src="https://www.producthunt.com/products/tablepro"></script>',
    ] as $request) {
        expect(withoutAllowedLinks($request))->toContain('producthunt.com');
    }
});
