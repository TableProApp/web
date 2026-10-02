<?php

use PHPUnit\Framework\Assert;

/**
 * The header, footer and frame every public page renders, in both languages
 * (sitemap §B; positioning §10; design-system §5.3.17).
 *
 * The chrome is rendered by `LandingLayout` itself, so every page gets it,
 * the branded error pages included. What matters is invisible to a typecheck:
 * that each link keeps the reader's language, that the account link reaches
 * the other application unprefixed, that a cross-language link forces a full
 * page load, and that the landmarks a screen reader navigates by exist once.
 */

/**
 * Every anchor in a fragment, with its attributes and visible text.
 *
 * Attribute names are lowercased, as an HTML parser does: React writes the
 * `hrefLang` prop as `hrefLang="en"`, which a browser reads as `hreflang`.
 *
 * @return list<array{attrs: array<string, string>, text: string}>
 */
function chromeAnchors(string $html): array
{
    preg_match_all('#<a\s([^>]*)>(.*?)</a>#s', $html, $matches, PREG_SET_ORDER);

    return array_map(static function (array $match): array {
        preg_match_all('/([a-zA-Z-]+)="([^"]*)"/', $match[1], $pairs, PREG_SET_ORDER);

        $attrs = [];

        foreach ($pairs as $pair) {
            $attrs[strtolower($pair[1])] = html_entity_decode($pair[2], ENT_QUOTES);
        }

        return ['attrs' => $attrs, 'text' => trim(html_entity_decode(strip_tags($match[2]), ENT_QUOTES))];
    }, $matches);
}

/** The first anchor whose href is `$href` and, when given, whose text contains `$text`. @return array{attrs: array<string, string>, text: string}|null */
function chromeLink(string $html, string $href, ?string $text = null): ?array
{
    foreach (chromeAnchors($html) as $anchor) {
        if (($anchor['attrs']['href'] ?? null) === $href && ($text === null || str_contains($anchor['text'], $text))) {
            return $anchor;
        }
    }

    return null;
}

/**
 * The first `<{$tag}>` element: the site header or footer, which come before
 * and after `<main>`. Neither nests another of its own kind, so the first
 * closing tag after it is its own; a page's `<header>` inside `<main>` is left
 * out.
 */
function chromeRegion(string $html, string $tag): string
{
    $start = strpos($html, "<{$tag}");
    $end = $start === false ? false : strpos($html, "</{$tag}>", $start);

    Assert::assertNotFalse($start, "No <{$tag}> rendered");
    Assert::assertNotFalse($end, "No </{$tag}> rendered");

    return substr($html, $start, $end - $start);
}

dataset('chrome locales', [
    'English' => ['/download', 'en', ''],
    'Vietnamese' => ['/vi/download', 'vi', '/vi'],
]);

it('frames the page with a skip link, one header, one main and one footer', function (string $path, string $locale): void {
    $html = ssrHtml($path);

    $skip = chromeLink($html, '#main-content');

    Assert::assertNotNull($skip, 'The skip link is missing');
    Assert::assertSame($locale === 'vi' ? 'Chuyển đến nội dung chính' : 'Skip to content', $skip['text']);
    Assert::assertLessThan(strpos($html, '<header'), strpos($html, 'href="#main-content"'), 'The skip link must come before the header');

    expect(substr_count($html, '<main'))->toBe(1);
    expect($html)->toMatch('/<main id="main-content" tabindex="-1"/');
    expect(substr_count($html, '<footer'))->toBe(1);

    // The header and footer are landmarks only outside <main>.
    Assert::assertLessThan(strpos($html, '<main'), strpos($html, '<header'));
    Assert::assertGreaterThan(strpos($html, '</main>'), strpos($html, '<footer'));

    // Nothing bleeds past the viewport: the ledger's 200vw rules are gone.
    expect($html)->not->toContain('w-[200vw]');
})->with('chrome locales');

it('links the header to the sections in the reader\'s language', function (string $path, string $locale, string $prefix): void {
    $header = chromeRegion(ssrHtml($path), 'header');
    $vi = $locale === 'vi';

    $expected = [
        "{$prefix}/databases" => $vi ? 'Cơ sở dữ liệu' : 'Databases',
        "{$prefix}/pricing" => $vi ? 'Bảng giá' : 'Pricing',
        "{$prefix}/blog" => 'Blog',
        "{$prefix}/download" => $vi ? 'Tải về' : 'Download',
        ($prefix === '' ? '/' : $prefix) => 'TablePro',
    ];

    foreach ($expected as $href => $text) {
        Assert::assertNotNull(chromeLink($header, $href, $text), "The header has no \"{$text}\" link to {$href}");
    }

    // Features is a disclosure button over ordinary links, including the platform page from data.
    expect($header)->toMatch('/<button type="button" aria-expanded="false" aria-controls="[^"]+"[^>]*>' . ($vi ? 'Tính năng' : 'Features') . '/u');

    foreach (['/features', '/features/querying', '/features/data-editing', '/features/schema', '/features/import-export', '/features/ai-mcp', '/features/connections', '/features/sync-and-teams'] as $feature) {
        Assert::assertNotNull(chromeLink($header, $prefix . $feature), "The Features menu has no link to {$prefix}{$feature}");
    }

    Assert::assertNotNull(chromeLink($header, "{$prefix}/ios", $vi ? 'iPhone và iPad' : 'iPhone & iPad'), 'The platform page is missing from the Features menu');
})->with('chrome locales');

it('sends Docs to the English documentation, and says so in Vietnamese', function (string $path, string $locale): void {
    $docs = chromeLink(chromeRegion(ssrHtml($path), 'header'), 'https://docs.tablepro.app');

    Assert::assertNotNull($docs);
    Assert::assertSame('en', $docs['attrs']['hreflang'] ?? null);
    Assert::assertSame($locale === 'vi' ? 'Tài liệu (tiếng Anh)' : 'Docs', $docs['attrs']['aria-label'] ?? null);
})->with('chrome locales');

it('reaches the account app unprefixed, as a full page load, in the reader\'s language', function (string $path, string $locale): void {
    $html = ssrHtml($path);
    $account = chromeLink(chromeRegion($html, 'header'), "/account?locale={$locale}");

    Assert::assertNotNull($account, 'The header has no account link');
    Assert::assertSame($locale === 'vi' ? 'Tài khoản' : 'Account', $account['text']);

    foreach (chromeAnchors($html) as $anchor) {
        Assert::assertStringStartsNotWith('/vi/account', $anchor['attrs']['href'] ?? '', 'The account is never under a locale prefix');
        Assert::assertStringStartsNotWith('/vi/checkout', $anchor['attrs']['href'] ?? '');
    }
})->with('chrome locales');

it('switches language with plain links to the same page, named in their own language', function (string $path, string $locale): void {
    $header = chromeRegion(ssrHtml($path), 'header');

    $english = chromeLink($header, '/download', 'English');
    $vietnamese = chromeLink($header, '/vi/download', 'Tiếng Việt');

    Assert::assertNotNull($english);
    Assert::assertNotNull($vietnamese);

    foreach (['en' => $english, 'vi' => $vietnamese] as $code => $link) {
        Assert::assertSame($code, $link['attrs']['hreflang'] ?? null);
        Assert::assertSame($code, $link['attrs']['lang'] ?? null);
        Assert::assertSame($code === $locale ? 'true' : null, $link['attrs']['aria-current'] ?? null);
    }

    // Named by what it does, in the page language, with the current language visible.
    expect($header)->toContain('aria-label="' . ($locale === 'vi' ? 'Ngôn ngữ: Tiếng Việt' : 'Language: English') . '"');
})->with('chrome locales');

it('groups the footer links under a hidden heading, in five groups', function (string $path, string $locale, string $prefix): void {
    $footer = chromeRegion(ssrHtml($path), 'footer');
    $vi = $locale === 'vi';

    expect($footer)->toContain('<h2 class="sr-only">' . ($vi ? 'Liên kết' : 'Site links') . '</h2>');

    $groups = $vi ? ['Sản phẩm', 'Tài nguyên', 'Hỗ trợ', 'Cộng đồng', 'Pháp lý'] : ['Product', 'Resources', 'Support', 'Community', 'Legal'];

    preg_match_all('#<h3 class="[^"]*">([^<]+)</h3>#', $footer, $titles);

    foreach ($groups as $group) {
        expect($titles[1])->toContain($group);
    }

    foreach (['/features', '/databases', '/ios', '/pricing', '/download', '/compare', '/blog', '/faq', '/privacy', '/terms', '/refund-policy'] as $page) {
        Assert::assertNotNull(chromeLink($footer, $prefix . $page), "The footer has no link to {$prefix}{$page}");
    }

    foreach (['https://docs.tablepro.app', 'https://docs.tablepro.app/changelog', 'https://github.com/TableProApp/TablePro', 'https://github.com/TableProApp/TablePro/issues', 'https://github.com/sponsors/datlechin', 'mailto:hello@tablepro.app', "/account?locale={$locale}"] as $href) {
        Assert::assertNotNull(chromeLink($footer, $href), "The footer has no link to {$href}");
    }

    // "Cookie settings" is a button that reopens the consent bar, not a link.
    expect($footer)->toContain('>' . ($vi ? 'Cài đặt cookie' : 'Cookie settings') . '</button>');

    // The copyright names the licence, with the year filled in.
    expect($footer)->toMatch($vi ? '/© \d{4} TablePro\. Mã nguồn theo giấy phép AGPLv3\./u' : '/© \d{4} TablePro\. Source code under the AGPLv3\./');
})->with('chrome locales');

it('offers the newsletter without a subscriber count', function (string $path, string $locale): void {
    $footer = chromeRegion(ssrHtml($path), 'footer');

    // One email field, required and named for the form; React decides the attribute order.
    preg_match('/<input[^>]*type="email"[^>]*>/', $footer, $email);

    Assert::assertNotEmpty($email, 'The footer has no email field');
    expect($email[0])->toContain('name="email"')->toContain('required=""');

    expect($footer)->toContain('>' . ($locale === 'vi' ? 'Đăng ký nhận tin' : 'Subscribe') . '</button>')
        ->not->toMatch('/\d[\d,.]*\s+(developers|subscribers|lập trình viên|người đăng ký)/u');
})->with('chrome locales');

it('gives the error pages the same chrome, in the language of their path', function (string $path, string $locale): void {
    requireSsr();

    $html = $this->get('http://' . config('app.web_domain') . $path)->assertNotFound()->getContent();

    expect($html)->toContain('<header')->toContain('<footer');
    Assert::assertNotNull(chromeLink($html, "/account?locale={$locale}"));
    Assert::assertSame($locale === 'vi' ? 'Chuyển đến nội dung chính' : 'Skip to content', chromeLink($html, '#main-content')['text'] ?? null);
})->with([
    'English' => ['/no-such-page', 'en'],
    'Vietnamese' => ['/vi/no-such-page', 'vi'],
]);

it('keeps the site chrome to its own link tables and catalogs', function (): void {
    $read = static fn(string $file): string => (string) file_get_contents(resource_path("js/components/site/{$file}"));

    // No device name, version or count is typed into the chrome: the platform link renders from platforms.json.
    foreach (['site-header.tsx', 'site-footer.tsx', 'mobile-nav.tsx', 'features-menu.tsx'] as $file) {
        expect($read($file))->not->toMatch("/>\s*(iPhone|iPad|macOS)[^<{]*</");
    }

    expect($read('site-links.ts'))->toContain("import facts from '@data/facts.json';")
        ->toContain("import platformData from '@data/platforms.json';");

    // The layout renders the new chrome and nothing of the old.
    $layout = (string) file_get_contents(resource_path('js/layouts/landing-layout.tsx'));

    expect($layout)->toContain('<SiteHeader />')->toContain('<SiteFooter />')->not->toContain('components/landing/');
});
