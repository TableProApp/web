<?php

use PHPUnit\Framework\Assert;

const THIRD_PARTY_HOSTS = ['client.crisp.chat', '@polar-sh/checkout', 'lemon.js', 'lemonsqueezy.com', 'producthunt.com'];

/** @var list<string> */
const ALLOWED_OUTBOUND_LINKS = ['https://www.producthunt.com/products/tablepro'];

function withoutAllowedLinks(string $html): string
{
    foreach (ALLOWED_OUTBOUND_LINKS as $url) {
        $html = (string) preg_replace('#<a\b[^>]*\bhref="' . preg_quote($url, '#') . '"[^>]*>#', '<a>', $html);
    }

    return $html;
}

/** @return list<string> */
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

it('loads chat only from an effect, and opens it only from a click', function (): void {
    // The loader must never run during the server render or at import time.
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
    config(['analytics.google.measurement_id' => 'G-TEST123', 'services.crisp.website_id' => 'crisp-test-id', 'payment.provider' => 'polar']);

    foreach (thirdPartyPages() as $path) {
        $html = ssrHtml($path);

        preg_match_all('/<script[^>]*\ssrc="([^"]+)"/', $html, $sources);

        foreach ($sources[1] as $source) {
            Assert::assertFalse(str_starts_with($source, 'http') || str_starts_with($source, '//'), "{$path} loads {$source} from the document");
        }

        // The tag's URL is in the head's loader, which adds it after the load event.
        Assert::assertStringContainsString('var src = "https://www.googletagmanager.com/gtag/js?id=G-TEST123"', $html);

        // The website id travels as a page prop for the page to load the chat with, and the document loads nothing.
        Assert::assertStringContainsString('crisp-test-id', $html);
        Assert::assertStringNotContainsString('CRISP_WEBSITE_ID', $html);

        $html = withoutAllowedLinks($html);

        foreach (THIRD_PARTY_HOSTS as $host) {
            Assert::assertStringNotContainsString($host, $html, "{$path} renders {$host}");
        }
    }

    config(['payment.provider' => 'lemonsqueezy']);

    $html = withoutAllowedLinks(ssrHtml('/pricing'));

    foreach (THIRD_PARTY_HOSTS as $host) {
        Assert::assertStringNotContainsString($host, $html, "/pricing renders {$host}");
    }
})->group('ssr');

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
