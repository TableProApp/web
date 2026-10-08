<?php

use App\Support\Localization\Locales;
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

/** One catalog's strings by key, parsed from its TypeScript source: `key: '…'` in English and Vietnamese, `"key": "…"` elsewhere. @return array<string, string> */
function chromeCatalog(string $locale, string $namespace): array
{
    $source = (string) file_get_contents(dirname(__DIR__, 3) . "/resources/js/i18n/messages/{$locale}/{$namespace}.ts");

    preg_match_all('/^\s+"?(\w+)"?: ([\'"])((?:(?!\2)[^\\\\]|\\\\.)*)\2,?$/m', $source, $matches, PREG_SET_ORDER);

    $strings = [];

    foreach ($matches as $match) {
        $strings[$match[1]] = stripslashes($match[3]);
    }

    return $strings;
}

/** Every locale with its URL prefix and endonym, read from disk: a dataset is built before the application boots. @return array<string, array{string, string, string}> */
function chromeLocales(): array
{
    $rows = [];

    foreach (json_decode((string) file_get_contents(dirname(__DIR__, 3) . '/resources/data/locales.json'), true)['supported'] as $code => $locale) {
        $rows[$code] = [$code, $locale['prefix'] === null ? '' : "/{$locale['prefix']}", $locale['native']];
    }

    return $rows;
}

/**
 * The header's desktop row with every label on one line, measured in Chromium
 * at 14px Inter: its width in px, and the display columns of its eight labels
 * at the time (a CJK character is two). The row has 960px at 1024 and 1088px
 * at 1152.
 */
const HEADER_ROW_MEASURED = [
    'en' => [893, 54],
    'vi' => [944, 67],
    'es' => [1008, 69],
    'de' => [980, 64],
    'fr' => [1065, 79],
    'ja' => [943, 66],
    'pt-BR' => [1040, 74],
    'zh-Hans' => [754, 38],
    'ko' => [773, 48],
    'zh-Hant' => [797, 44],
    'it' => [965, 66],
    'id' => [930, 58],
];

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

it('shows the desktop row only where it fits, in every language', function (string $code, string $prefix, string $native): void {
    /*
     * At 1024px the row wrapped to three lines in Spanish and French, pushed
     * the French Download button 8px off the page, and wrapped the language
     * button in Portuguese. A language whose row is wider than 960px keeps
     * the menu button to 1152px instead.
     */
    [$width, $columns] = HEADER_ROW_MEASURED[$code];
    $wide = $width > 960;

    expect($width)->toBeLessThanOrEqual($wide ? 1088 : 960);

    /*
     * No browser runs here, so the widths above are only as good as the
     * labels they were measured for. A longer label means measuring again.
     */
    $nav = chromeCatalog($code, 'nav');
    $labels = [$nav['features'], $nav['databases'], $nav['pricing'], $nav['docs'], $nav['blog'], $native, $nav['account'], $nav['download']];

    Assert::assertLessThanOrEqual($columns, array_sum(array_map(mb_strwidth(...), $labels)), "{$code}: a header label grew. Measure the row again and update HEADER_ROW_MEASURED.");

    $from = $wide ? 'min-[72rem]' : 'lg';
    $header = chromeRegion(ssrHtml("{$prefix}/download"), 'header');

    expect($header)->toMatch('/<nav aria-label="[^"]+" class="hidden ' . preg_quote($from, '/') . ':block">/')
        ->toContain("class=\"hidden items-center gap-2 {$from}:flex\"")
        ->toMatch('/<button type="button" aria-expanded="false" aria-controls="site-menu" class="[^"]* ' . preg_quote($from, '/') . ':hidden">/');
})->with(chromeLocales(...));

it('closes the open menu at the width its language shows the desktop row', function (): void {
    $read = static fn(string $file): string => (string) file_get_contents(resource_path("js/components/site/{$file}"));
    $wide = array_keys(array_filter(HEADER_ROW_MEASURED, fn(array $row): bool => $row[0] > 960));

    sort($wide);

    expect($read('site-links.ts'))->toContain("export const WIDE_HEADER_LOCALES: readonly string[] = ['" . implode("', '", $wide) . "'];")
        ->toContain("desktop: '(min-width: 64rem)'")
        ->toContain("desktop: '(min-width: 72rem)'");
    expect($read('site-header.tsx'))->toContain('desktop={layout.desktop}');
    expect($read('mobile-nav.tsx'))->toContain('window.matchMedia(desktop)')->not->toContain('64rem');
});

it('gives the small controls of the header and the banner a finger-sized target', function (): void {
    $read = static fn(string $file): string => (string) file_get_contents(resource_path("js/components/site/{$file}"));

    /*
     * Measured by hit-testing at 390px: the header Download was 92 by 32 and
     * the banner's dismiss 32 by 32. Each keeps its drawing and gains an
     * invisible box around it: 44px for Download, and for the banner's two
     * controls 44px wide and as tall as its 40px band lets them be.
     */
    expect($read('site-header.tsx'))->toContain("buttonClasses('primary', 'sm', 'relative whitespace-nowrap after:absolute after:inset-x-0 after:-inset-y-[7px]')");
    expect($read('support-banner.tsx'))->toContain('after:absolute after:-inset-x-1 after:-inset-y-3')
        ->toContain('after:absolute after:-inset-1.5');
});

it('keeps the phone header on one row at 320px, with Download on one line, in every language', function (string $code, string $prefix): void {
    /*
     * Measured in Chromium at 320px: Japanese ダウンロード broke into two lines
     * in a 46px-tall button. The row has 288px: the logo 112, the gap 16 below
     * 640px, the menu button 36 (44 less its -8px margin) and the gap before
     * it 8, which leaves 116 for Download. ダウンロード, 12 display columns,
     * is 108 with its padding, the widest of the labels.
     */
    $label = chromeCatalog($code, 'nav')['download'];

    Assert::assertLessThanOrEqual(12, mb_strwidth($label), "{$code}: the header Download label grew. Measure the phone header again.");

    $header = chromeRegion(ssrHtml("{$prefix}/pricing"), 'header');

    expect($header)->toContain(' flex h-16 items-center gap-4 sm:gap-8"')
        ->toMatch('/<a[^>]*class="[^"]*whitespace-nowrap[^"]*"[^>]*href="' . preg_quote($prefix, '/') . '\/download"/');
})->with(chromeLocales(...));

it('puts the download actions above a closed language list in the menu', function (string $path, string $locale, string $prefix): void {
    /*
     * Twelve language rows used to sit between the links and the two download
     * actions, which put "Download for Mac" 1,273px down a 844px screen. The
     * languages are one row that opens, and the actions come before it.
     */
    $header = chromeRegion(ssrHtml($path), 'header');
    $menu = substr($header, (int) strpos($header, '<dialog'));

    $account = strpos($menu, "href=\"/account?locale={$locale}\"");
    $download = strpos($menu, '>' . chromeCatalog($locale, 'download')['macCta'] . '</a>');
    $badge = strpos($menu, 'href="https://apps.apple.com/');
    $languages = strpos($menu, '<details');

    foreach (['Account' => $account, 'Download for Mac' => $download, 'the App Store badge' => $badge, 'the language list' => $languages] as $name => $position) {
        Assert::assertNotFalse($position, "The menu has no {$name}");
    }

    Assert::assertLessThan($download, $account, 'The download actions follow the links');
    Assert::assertLessThan($badge, $download, 'Mac comes first in the markup on every device');
    Assert::assertLessThan($languages, $badge, 'The language list comes after the download actions');

    // A native disclosure, closed on load, named with the current language.
    expect($menu)->toMatch('/<details class="group"><summary aria-label="' . ($locale === 'vi' ? 'Ngôn ngữ: Tiếng Việt' : 'Language: English') . '"/u')
        ->not->toMatch('/<details[^>]*\sopen[\s=>]/');

    $list = substr($menu, $languages, (int) strpos($menu, '</details>', $languages) - $languages);

    foreach (Locales::all() as $code => $definition) {
        $link = chromeLink($list, ($definition['prefix'] === null ? '' : "/{$definition['prefix']}") . '/download', $definition['native']);

        Assert::assertNotNull($link, "The menu's language list has no {$definition['native']} link");
        Assert::assertSame($code === $locale ? 'true' : null, $link['attrs']['aria-current'] ?? null);
    }
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

    // The repository is linked once, as "Source code"; Community no longer repeats it.
    expect(substr_count($footer, 'href="https://github.com/TableProApp/TablePro"'))->toBe(1);

    // "Cookie settings" is a button that reopens the consent bar, not a link.
    expect($footer)->toContain('>' . ($vi ? 'Cài đặt cookie' : 'Cookie settings') . '</button>');

    // The copyright names the licence, with the year filled in.
    expect($footer)->toMatch($vi ? '/© \d{4} TablePro\. Mã nguồn theo giấy phép AGPLv3\./u' : '/© \d{4} TablePro\. Source code under the AGPLv3\./');
})->with('chrome locales');

it('lists the community channels a reader of that language can use', function (string $path, string $locale): void {
    $footer = chromeRegion(ssrHtml($path), 'footer');
    $links = json_decode((string) file_get_contents(resource_path('data/facts.json')), true)['links'];

    Assert::assertNotNull(chromeLink($footer, $links['discussions'], 'GitHub Discussions'), 'The footer has no GitHub Discussions link');
    Assert::assertNotNull(chromeLink($footer, $links['discord'], 'Discord'));
    Assert::assertNotNull(chromeLink($footer, $links['x'], 'X'));

    // The Telegram group is in Vietnamese, and the Facebook page is not kept up.
    Assert::assertSame($locale === 'vi', chromeLink($footer, $links['telegram']) !== null, 'Telegram belongs on Vietnamese pages only');
    Assert::assertStringNotContainsString('facebook.com', $footer);
    expect($links)->not->toHaveKey('facebook');

    // Support starts with the docs page that answers most questions, before email and chat.
    $troubleshooting = chromeLink($footer, $links['troubleshooting'], chromeCatalog($locale, 'footer')['troubleshooting']);

    Assert::assertNotNull($troubleshooting, 'The footer has no Troubleshooting link');
    Assert::assertSame('en', $troubleshooting['attrs']['hreflang'] ?? null);
    Assert::assertLessThan(strpos($footer, 'href="mailto:'), strpos($footer, $links['troubleshooting']));
})->with([
    'English' => ['/download', 'en'],
    'Vietnamese' => ['/vi/download', 'vi'],
    'German' => ['/de/download', 'de'],
]);

it('offers the newsletter without a subscriber count', function (string $path, string $locale): void {
    $footer = chromeRegion(ssrHtml($path), 'footer');

    // One email field, required and named for the form; React decides the attribute order.
    preg_match('/<input[^>]*type="email"[^>]*>/', $footer, $email);

    Assert::assertNotEmpty($email, 'The footer has no email field');
    expect($email[0])->toContain('name="email"')->toContain('required=""');

    expect($footer)->toContain('>' . ($locale === 'vi' ? 'Đăng ký nhận tin' : 'Subscribe') . '</button>')
        ->not->toMatch('/\d[\d,.]*\s+(developers|subscribers|lập trình viên|người đăng ký)/u');
})->with('chrome locales');

it('ends the footer on a language menu that opens without JavaScript, one link per language', function (string $path, string $locale): void {
    $footer = chromeRegion(ssrHtml($path), 'footer');

    // A native disclosure, closed on load and named with the current language.
    expect($footer)->toMatch('/<details[^>]*><summary[^>]*aria-label="' . ($locale === 'vi' ? 'Ngôn ngữ: Tiếng Việt' : 'Language: English') . '"/u')
        ->not->toMatch('/<details[^>]*\sopen[\s=>]/');

    $panel = substr($footer, (int) strpos($footer, 'data-menu-panel'));

    foreach (Locales::all() as $code => $definition) {
        $link = chromeLink($panel, ($definition['prefix'] === null ? '' : "/{$definition['prefix']}") . '/download', $definition['native']);

        Assert::assertNotNull($link, "The footer menu has no {$definition['native']} link");
        Assert::assertSame($definition['hreflang'], $link['attrs']['hreflang'] ?? null);
        Assert::assertSame($code, $link['attrs']['lang'] ?? null);
        Assert::assertSame($code === $locale ? 'true' : null, $link['attrs']['aria-current'] ?? null);
    }

    // The old inline list ("Language: English · Tiếng Việt · …") is gone.
    expect($footer)->not->toContain($locale === 'vi' ? 'Ngôn ngữ:</span>' : 'Language:</span>');
})->with('chrome locales');

it('draws the footer as cells that close on the bar shared with the account app', function (): void {
    $footer = (string) file_get_contents(resource_path('js/components/site/site-footer.tsx'));

    // The newsletter is a full row; the groups are two, three, then five to a row.
    expect($footer)->toContain('<CellGrid')
        ->toContain("'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'")
        ->toContain('<div className="@container col-span-full">')
        ->toContain('<FooterBar')
        ->toContain('language={<LanguageSwitcher variant="footer" />}');

    // A phone sees the rows' lines only (design-system §4.7).
    expect($footer)->toContain("'max-sm:gap-x-0 max-sm:*:shadow-[0_-1px_0_var(--rule),0_1px_0_var(--rule)]'");

    // The link rows touch, so on a touch screen each link is at least 44px each way instead of 32px tall.
    expect($footer)->toContain("'type-small inline-block py-[5px] ")->toContain(' pointer-coarse:min-w-11 pointer-coarse:py-[11px]');

    // The bar keeps its controls clear of the chat launcher, which floats over the same corner.
    expect($footer)->toContain('chat={chat}');
    expect((string) file_get_contents(resource_path('js/components/shared/footer-bar.tsx')))
        ->toContain('style={chat ? { paddingRight: `max(0px, calc(${LAUNCHER_REACH}px - max(var(--cell-bleed), (100vw - 76rem) / 2)))` } : undefined}');

    // The switcher's footer form is the shared menu, on a <details>.
    expect((string) file_get_contents(resource_path('js/components/site/language-switcher.tsx')))->toContain('<FooterMenu')->not->toContain("'list'");
    expect((string) file_get_contents(resource_path('js/components/shared/footer-bar.tsx')))->toContain('<details')->toContain('<summary');
});

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

it('offers Pricing and Docs on the 404 page, beside the pages it already listed', function (string $path, string $locale, string $prefix): void {
    requireSsr();

    $html = $this->get('http://' . config('app.web_domain') . $path)->assertNotFound()->getContent();
    $main = substr($html, (int) strpos($html, '<main'), (int) strpos($html, '</main>') - (int) strpos($html, '<main'));
    $nav = chromeCatalog($locale, 'nav');

    foreach (['/', '/features', '/databases', '/download', '/blog'] as $page) {
        Assert::assertNotNull(chromeLink($main, rtrim($prefix . $page, '/') ?: '/'), "The 404 page has no link to {$prefix}{$page}");
    }

    Assert::assertNotNull(chromeLink($main, "{$prefix}/pricing", $nav['pricing']), 'The 404 page has no Pricing link');

    $docs = chromeLink($main, 'https://docs.tablepro.app', $nav['docs']);

    Assert::assertNotNull($docs, 'The 404 page has no Docs link');
    Assert::assertSame('en', $docs['attrs']['hreflang'] ?? null);
    Assert::assertSame($nav['docsLabel'], $docs['attrs']['aria-label'] ?? null);
})->with([
    'English' => ['/no-such-page', 'en', ''],
    'Vietnamese' => ['/vi/no-such-page', 'vi', '/vi'],
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

    expect($layout)->toContain('<SiteHeader />')->toContain('<SiteFooter newsletter={footerNewsletter} />')->not->toContain('components/landing/');
});
