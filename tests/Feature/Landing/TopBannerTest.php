<?php

use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;

/**
 * The license banner above the header.
 *
 * On by default, on every public page except Pricing, which is where it leads,
 * and off the iPhone and iPad page for a reader on one of those devices.
 * It is the one element almost every visitor meets, and almost everything
 * that can go wrong with it is invisible to a typecheck: a dismissal that
 * flashes the bar on every load, a page that reserves its height without
 * showing it, a sentence that wraps out of its 40px line in one language, a
 * bar that sticks over the content, or copy that pleads.
 *
 * Config holds the switch, the link and the dismissal version. The words live
 * in the `banner` UI catalog, once per language. How long a dismissal lasts is
 * `lib/banner.ts`, run against the head script by tests/js/banner.test.ts.
 */

/** The `banner` catalog strings of one locale, parsed from its TypeScript source. @return array<string, string> */
function bannerCatalog(string $locale): array
{
    $source = (string) file_get_contents(dirname(__DIR__, 3) . "/resources/js/i18n/messages/{$locale}/banner.ts");

    // English and Vietnamese are written `key: '…',`, the other catalogs `"key": "…"`.
    preg_match_all('/^\s+"?(\w+)"?: ([\'"])((?:(?!\2)[^\\\\]|\\\\.)*)\2,?$/m', $source, $matches, PREG_SET_ORDER);

    $strings = [];

    foreach ($matches as $match) {
        $strings[$match[1]] = stripslashes($match[3]);
    }

    return $strings;
}

/** Every locale and its URL prefix, read from disk: a dataset is built before the application boots. @return array<string, array{string, string}> */
function bannerLocales(): array
{
    $rows = [];

    foreach (json_decode((string) file_get_contents(dirname(__DIR__, 3) . '/resources/data/locales.json'), true)['supported'] as $code => $locale) {
        $rows[$code] = [$code, $locale['prefix'] === null ? '' : "/{$locale['prefix']}"];
    }

    return $rows;
}

it('is on unless it is switched off', function (): void {
    /*
     * Read from the file rather than from `config()`, which a test or a local
     * `.env` may have changed: the default is what a fresh deploy ships. A
     * default of off is how the banner once vanished from production with no
     * one switching it off.
     */
    $defaults = require base_path('config/banner.php');

    expect($defaults['enabled'])->toBeTrue();
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

it('stays off the pricing page it leads to, in every language', function (string $locale, string $prefix): void {
    config(['banner.enabled' => true]);

    $path = "{$prefix}/pricing";
    $html = get($path)->assertOk()->getContent();

    Assert::assertStringNotContainsString('has-banner', $html, "{$path} must reserve no banner height");
    Assert::assertStringNotContainsString('tablepro:banner-dismissed', $html, "{$path} must not ship a dismissal script");

    get($path)->assertInertia(fn(AssertableInertia $page) => $page->where('banner', null));
})->with(bannerLocales(...));

/*
 * The license is for the Mac app. The iPhone and iPad page says its app needs
 * none, so a reader on one of those devices gets no banner there. The device
 * is the `ios` class the root template sets before first paint
 * (tests/js/device.test.ts), so the bar never flashes.
 */
it('stays off the iPhone and iPad page for a reader on one of those devices, in every language', function (string $locale, string $prefix): void {
    config(['banner.enabled' => true]);

    $rule = "if (document.documentElement.classList.contains('ios')) {\n                    document.documentElement.classList.remove('has-banner');";
    $ios = get("{$prefix}/ios")->assertOk()->getContent();

    Assert::assertStringContainsString($rule, $ios, "{$prefix}/ios must drop the banner on an iPhone or iPad");
    Assert::assertLessThan(strpos($ios, $rule), strpos($ios, "document.documentElement.classList.add('ios')"), 'The device must be known before the banner rule reads it');
    Assert::assertLessThan(strpos($ios, '<body'), strpos($ios, $rule), 'The rule belongs in the head, before first paint');

    // Everyone else still gets it there, and an iPhone still gets it on every other page.
    expect(str_contains($ios, 'class="has-banner">'))->toBeTrue();
    Assert::assertStringNotContainsString($rule, get("{$prefix}/download")->assertOk()->getContent());
})->with(bannerLocales(...));

it('sends only its link and version to the page, so the words come from the catalog', function (): void {
    config(['banner.enabled' => true, 'banner.href' => '/pricing', 'banner.version' => '7']);

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('banner', ['href' => '/pricing', 'version' => '7']));
});

it('settles the dismissal before the first paint, per version, with an end date', function (): void {
    config(['banner.enabled' => true, 'banner.version' => '7']);

    $html = get('/download')->assertOk()->getContent();

    /*
     * The class is stamped server-side and removed by an inline script in the
     * head, ahead of any stylesheet or bundle. Deciding it in React state would
     * drop the header 40px on every load for every reader who had already
     * closed the bar.
     */
    $read = strpos($html, "JSON.parse(localStorage.getItem('tablepro:banner-dismissed')");

    expect(str_contains($html, '<html lang="en" class="has-banner">'))->toBeTrue();
    Assert::assertNotFalse($read, 'The dismissal must be settled by an inline script reading the stored record');
    Assert::assertLessThan(strpos($html, '<body'), $read, 'The dismissal script belongs in the head, before first paint');

    $script = substr($html, $read, (int) strpos($html, '</script>', $read) - $read);

    expect($script)->toContain('record.until > Date.now()')
        ->toContain("record.version === '*'")
        ->toContain('record.version === "7"');

    // Wrapped, because localStorage throws in a private window, and a banner is not worth a broken head.
    $guard = strrpos(substr($html, 0, $read), 'try {');
    Assert::assertNotFalse($guard, 'The dismissal read must be wrapped in try');
    Assert::assertLessThan(80, $read - $guard, 'The dismissal read must be the first thing inside its try');
});

it('dismisses under the key the head script reads', function (): void {
    $lib = (string) file_get_contents(resource_path('js/lib/banner.ts'));
    $component = (string) file_get_contents(resource_path('js/components/site/support-banner.tsx'));
    $blade = (string) file_get_contents(resource_path('views/app.blade.php'));

    preg_match("/BANNER_STORAGE_KEY = '([^']+)'/", $lib, $key);

    Assert::assertSame('tablepro:banner-dismissed', $key[1] ?? null);
    Assert::assertStringContainsString("localStorage.getItem('{$key[1]}')", $blade);
    expect($component)->toContain("import { dismissBanner } from '@/lib/banner';")
        ->toContain('dismiss(true)')
        ->toContain('dismiss(false)');
});

it('sits above the sticky header and scrolls away with the page', function (): void {
    $css = (string) file_get_contents(resource_path('css/app.css'));
    $layout = (string) file_get_contents(resource_path('js/layouts/landing-layout.tsx'));

    /*
     * `--banner-h` is zero unless `html.has-banner` is set, so a disabled or
     * dismissed banner changes no measurement. Only the header sticks, so
     * anchors clear the header alone.
     */
    expect($css)->toContain('--banner-h: 0px;')
        ->toContain('html.has-banner {')
        ->toContain('scroll-padding-top: 5rem;')
        ->not->toContain('calc(5rem + var(--banner-h))');

    expect($layout)->toMatch('/<SupportBanner \/>\s*<div className="sticky top-0 z-40">\s*<SiteHeader \/>\s*<\/div>/');
});

it('keeps its wording to one line, in every language', function (string $locale): void {
    $copy = bannerCatalog($locale);

    expect($copy)->toHaveKeys(['label', 'message', 'short', 'cta', 'licensed']);

    /*
     * One 40px line, never truncated (design-system §3.3). Lengths are display
     * columns, so a CJK character counts as two. From 1024px the line is the
     * sentence and its link, about 920px of room at 14px Inter. Below 1024px
     * it is the short question and the same link: 248px beside the dismiss
     * button on a 320px screen, where the widest today (French, Portuguese)
     * measures 246px. "Have a license?" joins from 1280px, where the line has
     * about 250px more.
     */
    Assert::assertLessThanOrEqual(110, mb_strwidth($copy['message']) + mb_strwidth($copy['cta']), "{$locale}: the sentence and its link will not fit one line at 1024px");
    Assert::assertLessThanOrEqual(20, mb_strwidth($copy['cta']), "{$locale}: the call to action is too long");
    Assert::assertLessThanOrEqual(34, mb_strwidth($copy['short']) + 1 + mb_strwidth($copy['cta']), "{$locale}: the short question and the link will not fit a 320px screen");
    Assert::assertLessThanOrEqual(26, mb_strwidth($copy['licensed']), "{$locale}: the license holder's link will not fit at 1280px");
})->with(fn(): array => array_keys(bannerLocales()));

/*
 * The line is addressed to a regular user, so the question that says so stays
 * at every width: a phone shows it before the link, in place of the sentence.
 * It is its own string, never a second call to action.
 */
it('asks the phone reader whether they are a regular user, before the link', function (string $locale): void {
    $copy = bannerCatalog($locale);
    $component = (string) file_get_contents(resource_path('js/components/site/support-banner.tsx'));

    Assert::assertNotSame($copy['cta'], $copy['short'], "{$locale}: the phone line repeats the link instead of asking the question");
    Assert::assertStringNotContainsString($copy['cta'], $copy['short'], "{$locale}: the question holds the call to action");

    // The question is text beside the link, and the link reads the same at every width.
    expect($component)->toContain('<span className="lg:hidden">{m.banner.short} </span>')
        ->toContain("{m.banner.cta}\n                        <span aria-hidden=\"true\">→</span>");
    expect(substr_count($component, 'm.banner.short'))->toBe(1);
})->with(fn(): array => array_keys(bannerLocales()));

/*
 * The banner names paid features and development funding, with a verb-led
 * link. Both use a short optional-plan label, not a daily-use question.
 */
it('names paid features and development funding, and leads the link with a verb', function (string $locale, string $license, string $adds, string $funds, string $verb, string $short): void {
    $copy = bannerCatalog($locale);

    expect($copy['message'])->toContain($license)->toContain($adds)->toContain($funds);
    expect($copy['cta'])->toStartWith($verb);
    expect($copy['short'])->toBe($short);
})->with([
    'en' => ['en', 'Paid plans', 'features', 'fund', 'See ', 'Optional paid plans'],
    'vi' => ['vi', 'Gói trả phí', 'tính năng', 'phát triển', 'Xem ', 'Gói trả phí tùy chọn'],
]);

it('states a fact rather than pleading, and never says the whole app is free', function (string $locale): void {
    $copy = mb_strtolower(implode(' ', bannerCatalog($locale)));

    foreach (['whole app is free', 'free forever', 'support us', 'help us', 'need your help', 'donate', 'keep it free', 'struggling', 'unlock', 'hoàn toàn miễn phí', 'miễn phí mãi mãi', 'giúp chúng tôi', 'quyên góp', 'mở khóa'] as $phrase) {
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
        Assert::assertStringContainsString(htmlspecialchars($copy['licensed'], ENT_QUOTES), $banner, "{$path}: the license holder's link is missing");

        // Below 1024px the question stands in for the sentence, outside the link.
        $link = substr($banner, (int) strpos($banner, '<a '), (int) strpos($banner, '</a>') - (int) strpos($banner, '<a '));

        Assert::assertStringContainsString('<span class="lg:hidden">' . htmlspecialchars($copy['short'], ENT_QUOTES), $banner, "{$path}: the phone question is missing");
        Assert::assertStringContainsString(htmlspecialchars($copy['cta'], ENT_QUOTES), $link, "{$path}: the link must read the call to action");
        Assert::assertStringNotContainsString(htmlspecialchars($copy['short'], ENT_QUOTES), $link, "{$path}: the question belongs beside the link, not in it");
    }
});

it('renders no banner element when it is switched off', function (): void {
    config(['banner.enabled' => false]);

    Assert::assertStringNotContainsString('support-banner', ssrHtml('/download'), 'A disabled banner must leave no element');
});
