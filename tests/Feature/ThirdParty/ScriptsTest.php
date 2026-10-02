<?php

use PHPUnit\Framework\Assert;

/**
 * Third parties load only when a reader asks for them (architecture §1.12).
 *
 * - Crisp's loader set `crisp-client/session` cookies on `.tablepro.app` on
 *   every page before anyone had chosen anything. It now loads on a click of a
 *   "Live chat" button and never with the page.
 * - The Polar or Lemon Squeezy checkout SDK loaded on every page; it now loads
 *   at checkout intent, from a module, never from the document.
 * - The Product Hunt badge was a hotlink that set `__cf_bm` before consent.
 *
 * Google Analytics is the one third-party script left in the document, and it
 * runs in Consent Mode (AnalyticsConsentTest). Executing the click-to-load
 * behaviour is `tests/js/crisp.test.ts`; this file holds the documents.
 */

const THIRD_PARTY_HOSTS = ['client.crisp.chat', '@polar-sh/checkout', 'lemon.js', 'lemonsqueezy.com', 'producthunt.com'];

/**
 * Pages whose rendered HTML is checked: the homepage (rebuilt without the
 * Product Hunt hotlink), the download page and the pricing page, whose buy
 * buttons load the checkout SDK only at checkout intent.
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

it('serves documents whose only external script is the analytics tag', function (string $path): void {
    config(['analytics.google.measurement_id' => 'G-TEST123', 'services.crisp.website_id' => 'crisp-test-id']);

    $html = $this->get($path)->assertOk()->getContent();

    preg_match_all('/<script[^>]*\ssrc="([^"]+)"/', $html, $sources);

    foreach ($sources[1] as $source) {
        if (str_starts_with($source, 'http') || str_starts_with($source, '//')) {
            Assert::assertStringStartsWith('https://www.googletagmanager.com/gtag/js?id=', $source, "{$path} loads {$source}");
        }
    }

    foreach (THIRD_PARTY_HOSTS as $host) {
        Assert::assertStringNotContainsString($host, $html, "{$path} mentions {$host} before anyone asked for it");
    }

    // The website id travels as a page prop for the click handler, and nothing loads with it.
    Assert::assertStringContainsString('crisp-test-id', $html);
})->with(['/download', '/vi/download']);

it('opens chat only from a click', function (): void {
    /*
     * Every module that imports the chat helper calls it from a click handler
     * and nowhere else: not in an effect, not at import time, not on hover.
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
    }
});

it('renders no third-party request into any page it serves', function (): void {
    config(['services.crisp.website_id' => 'crisp-test-id']);

    foreach (thirdPartyPages() as $path) {
        $html = ssrHtml($path);

        foreach (THIRD_PARTY_HOSTS as $host) {
            Assert::assertStringNotContainsString($host, $html, "{$path} renders {$host}");
        }
    }
});
