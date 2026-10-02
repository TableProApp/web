<?php

use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;

/**
 * The optional banner above the header.
 *
 * Off by default (sitemap §B.5). When it is switched on it is the one element
 * every visitor meets on every page, and almost everything that can go wrong
 * with it is invisible to a typecheck: a dismissal that flashes the bar on
 * every load, a disabled banner that still reserves its height, a sentence
 * that wraps out of its 40px line in one language, or copy that only exists in
 * English.
 *
 * Config holds the switch, the link and the dismissal version. The words live
 * in the `banner` UI catalog, once per language.
 */

/** The `banner` catalog strings of one locale, parsed from its TypeScript source. @return array<string, string> */
function bannerCatalog(string $locale): array
{
    $source = (string) file_get_contents(resource_path("js/i18n/messages/{$locale}/banner.ts"));

    preg_match_all("/^\s+(\w+): '((?:[^'\\\\]|\\\\.)*)',$/m", $source, $matches, PREG_SET_ORDER);

    $strings = [];

    foreach ($matches as $match) {
        $strings[$match[1]] = stripslashes($match[2]);
    }

    return $strings;
}

it('is off unless it is switched on', function (): void {
    /*
     * Read from the file rather than from `config()`, which a test or a local
     * `.env` may have changed: the default is what a fresh deploy ships.
     */
    $defaults = require base_path('config/banner.php');

    expect($defaults['enabled'])->toBeFalse();
    expect(array_keys($defaults))->toEqualCanonicalizing(['enabled', 'href', 'version']);
});

it('leaves nothing behind when it is switched off', function (): void {
    config(['banner.enabled' => false]);

    $html = get('/download')->assertOk()->getContent();

    /*
     * A disabled banner must not be a hidden banner: no class reserving its
     * height, and no pre-paint script whose only job is to remove that class.
     */
    Assert::assertStringNotContainsString('has-banner', $html, 'A disabled banner must reserve no height');
    Assert::assertStringNotContainsString('tablepro:banner-dismissed', $html, 'A disabled banner must not ship a dismissal script');

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('banner', null));
});

it('sends only its link and version to the page, so the words come from the catalog', function (): void {
    config(['banner.enabled' => true, 'banner.href' => '/pricing', 'banner.version' => '7']);

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('banner', ['href' => '/pricing', 'version' => '7']));
});

it('settles the dismissal before the first paint, per version', function (): void {
    config(['banner.enabled' => true, 'banner.version' => '7']);

    $html = get('/download')->assertOk()->getContent();

    /*
     * The class is stamped server-side and removed by an inline script in the
     * head, ahead of any stylesheet or bundle. Deciding it in React state would
     * drop the header 40px on every load for every reader who had already
     * closed the bar.
     */
    $script = strpos($html, "localStorage.getItem('tablepro:banner-dismissed') === \"7\"");

    expect(str_contains($html, '<html lang="en" class="has-banner">'))->toBeTrue();
    Assert::assertNotFalse($script, 'The dismissal must be settled by an inline script, matched against the configured version');
    Assert::assertLessThan(strpos($html, '<body'), $script, 'The dismissal script belongs in the head, before first paint');

    // Wrapped, because localStorage throws in a private window, and a banner is not worth a broken head.
    $guard = strrpos(substr($html, 0, $script), 'try {');
    Assert::assertNotFalse($guard, 'The dismissal read must be wrapped in try');
    Assert::assertLessThan(60, $script - $guard, 'The dismissal read must be the first thing inside its try');
});

it('dismisses under the key the head script reads', function (): void {
    $component = (string) file_get_contents(resource_path('js/components/site/support-banner.tsx'));
    $blade = (string) file_get_contents(resource_path('views/app.blade.php'));

    preg_match("/BANNER_STORAGE_KEY = '([^']+)'/", $component, $key);

    Assert::assertSame('tablepro:banner-dismissed', $key[1] ?? null);
    Assert::assertStringContainsString("localStorage.getItem('{$key[1]}')", $blade);
});

it('sizes the sticky header offset from one token', function (): void {
    $css = (string) file_get_contents(resource_path('css/app.css'));
    $layout = (string) file_get_contents(resource_path('js/layouts/landing-layout.tsx'));

    /*
     * `--banner-h` is zero unless `html.has-banner` is set, so a disabled or
     * dismissed banner changes no measurement. The banner and the header stick
     * together, and anchors clear both.
     */
    expect($css)->toContain('--banner-h: 0px;')
        ->toContain('html.has-banner {')
        ->toContain('scroll-padding-top: calc(5rem + var(--banner-h));');

    expect($layout)->toMatch('/<div className="sticky top-0 z-40">\s*<SupportBanner \/>\s*<SiteHeader \/>\s*<\/div>/');
});

it('keeps its wording to one line, in both languages', function (string $locale): void {
    $copy = bannerCatalog($locale);

    expect($copy)->toHaveKeys(['label', 'message', 'short', 'cta']);

    /*
     * One 40px line, never truncated (design-system §3.3). From 1024px the
     * line is the sentence and its link, about 920px of room at 14px Inter;
     * below 1024px the link alone carries the message on a 375px phone, beside
     * the dismiss button.
     */
    Assert::assertLessThanOrEqual(110, mb_strlen($copy['message']) + mb_strlen($copy['cta']), "{$locale}: the sentence and its link will not fit one line at 1024px");
    Assert::assertLessThanOrEqual(20, mb_strlen($copy['cta']), "{$locale}: the call to action is too long");
    Assert::assertLessThanOrEqual(32, mb_strlen($copy['short']), "{$locale}: the short link will not fit a phone");
})->with(['en', 'vi']);

/*
 * Positioning §12.1 allows "free to use" only next to "paid plans add
 * optional features". The Vietnamese line once read "Bạn dùng TablePro miễn
 * phí" ("you use TablePro for free"), a statement about the reader, and its
 * phone link was a fragment with no verb where the English says "See".
 */
it('pairs free to use with optional features, and leads the phone link with a verb', function (string $locale, string $free, string $optional, string $verb): void {
    $copy = bannerCatalog($locale);

    expect($copy['message'])->toContain($free)->toContain($optional);
    expect($copy['short'])->toStartWith($verb);
})->with([
    'en' => ['en', 'free to use', 'optional', 'See '],
    'vi' => ['vi', 'Bạn có thể dùng TablePro miễn phí', 'tùy chọn', 'Xem '],
]);

it('states a fact rather than pleading, and never says the whole app is free', function (string $locale): void {
    $copy = mb_strtolower(implode(' ', bannerCatalog($locale)));

    foreach (['whole app is free', 'free forever', 'support us', 'help us', 'donate', 'keep it free', 'unlock', 'hoàn toàn miễn phí', 'miễn phí mãi mãi', 'ủng hộ', 'mở khóa'] as $phrase) {
        Assert::assertStringNotContainsString($phrase, $copy, "{$locale}: the banner says \"{$phrase}\"");
    }
})->with(['en', 'vi']);

it('links to pricing or a release post', function (): void {
    $href = (string) (require base_path('config/banner.php'))['href'];

    expect($href)->toMatch('#^/(pricing|blog/[a-z0-9-]+)$#');
});

it('renders above the header, in the page language, on every kind of page', function (): void {
    config(['banner.enabled' => true, 'banner.href' => '/pricing']);

    foreach (['/' => 'en', '/download' => 'en', '/vi/download' => 'vi'] as $path => $locale) {
        $html = ssrHtml($path);
        $copy = bannerCatalog($locale);
        $start = strpos($html, 'class="support-banner');
        $header = strpos($html, '<header');

        Assert::assertNotFalse($start, "{$path} is missing the banner");
        Assert::assertNotFalse($header, "{$path} is missing the header");
        Assert::assertLessThan($header, $start, "{$path}: the banner must sit above the header");

        $banner = substr($html, $start, $header - $start);

        Assert::assertStringContainsString(htmlspecialchars($copy['message'], ENT_QUOTES), $banner, "{$path} shows the banner in the wrong language");
        Assert::assertStringContainsString($locale === 'vi' ? 'href="/vi/pricing"' : 'href="/pricing"', $banner, "{$path}: the banner link must stay in the page language");
    }
});

it('renders no banner element when it is switched off', function (): void {
    config(['banner.enabled' => false]);

    Assert::assertStringNotContainsString('support-banner', ssrHtml('/download'), 'A disabled banner must leave no element');
});
