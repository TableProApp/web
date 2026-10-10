<?php

use App\Support\Localization\LanguageDetection;
use App\Support\Localization\Locales;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;

/**
 * The bar that offers a page in the reader's language (LanguageBar), and the
 * head script that decides it before first paint.
 *
 * The page's language stays its URL's: nothing here redirects, sets a cookie
 * or reads a header. The server only says which languages a page exists in
 * (`localization.suggestable`), the same for every reader, so the HTML can sit
 * in the edge cache; the reader's half is decided in their browser. Which
 * language that is, and the head script's parity with it, is
 * tests/js/language-suggestion.test.ts.
 */
const SUGGESTION_MARKER = '/* language-suggestion:start */';

/** The `language.suggest` strings of one locale's controls catalog. @return array<string, string> */
function suggestionCopy(string $locale): array
{
    $source = (string) file_get_contents(dirname(__DIR__, 3) . "/resources/js/i18n/messages/{$locale}/controls.ts");
    $block = substr($source, (int) strpos($source, 'suggest'));
    $block = substr($block, 0, (int) strpos($block, '}'));

    // English and Vietnamese are written `key: '…',`, the other catalogs `"key": "…"`.
    preg_match_all('/^\s+"?(\w+)"?: ([\'"])((?:(?!\2)[^\\\\]|\\\\.)*)\2,?$/m', $block, $matches, PREG_SET_ORDER);

    $strings = [];

    foreach ($matches as $match) {
        $strings[$match[1]] = stripslashes($match[3]);
    }

    return $strings;
}

it('offers the equivalent pages only, never the current one or a fallback', function (): void {
    get('/')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('localization.suggestable', array_values(array_diff(Locales::codes(), ['en']))));

    get('/vi')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('localization.suggestable', fn($locales): bool => in_array('en', collect($locales)->all(), true) && ! in_array('vi', collect($locales)->all(), true)));

    // A release post is English only: every other option is the blog list, a fallback.
    get('/blog/tablepro-0-67')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page->where('localization.suggestable', []));
});

it('decides before first paint wherever the page exists in another language, the pricing page included', function (string $path): void {
    $html = get($path)->assertOk()->getContent();

    expect($html)->toContain(SUGGESTION_MARKER)
        ->toContain("localStorage.getItem('tablepro:language')");

    // Only the license banner's own pages carry its class; the language bar has its own.
    if ($path === '/pricing') {
        Assert::assertStringNotContainsString('has-banner', $html, '/pricing must still reserve no license banner height');
    }
})->with(['/', '/vi/download', '/pricing']);

it('ships no script where the page has no other language, nor on an error page', function (string $path, int $status): void {
    $html = get($path)->assertStatus($status)->getContent();

    Assert::assertStringNotContainsString(SUGGESTION_MARKER, $html);
    Assert::assertStringNotContainsString('tablepro:language', $html);
})->with([
    'an english-only release post' => ['/blog/tablepro-0-67', 200],
    'a missing page' => ['/no-such-page', 404],
]);

it('gives the head script the page\'s half only: codes and aliases, never a country or a time zone', function (): void {
    $config = LanguageDetection::headConfig('en', ['vi']);

    expect(array_keys($config))->toBe(['page', 'suggestable', 'supported', 'tags'])
        ->and($config['supported'])->toBe(array_combine(array_map(strtolower(...), Locales::codes()), Locales::codes()))
        ->and($config['tags'])->toBe(json_decode((string) file_get_contents(resource_path('data/language-detection.json')), true)['tags']);
});

it('serves every reader the same page, whatever their browser or country says', function (string $path): void {
    $plain = get($path)->assertOk();
    $guess = $this->withHeaders(['Accept-Language' => 'vi-VN,vi;q=0.9', 'CF-IPCountry' => 'VN'])->get($path)->assertOk();

    expect($guess->getContent())->toBe($plain->getContent())
        ->and($guess->headers->getCookies())->toBe([])
        ->and((string) $guess->headers->get('Vary'))->not->toContain('Accept-Language');
})->with(['/', '/pricing']);

it('renders an empty slot for the bar after the license banner and above the header', function (): void {
    config(['banner.enabled' => true]);

    $html = ssrHtml('/');
    $license = strpos($html, 'class="support-banner');
    $bar = strpos($html, 'class="language-bar');
    $header = strpos($html, '<header');

    Assert::assertNotFalse($bar, 'The bar needs its element in the server HTML, or showing it would move the page');
    Assert::assertLessThan($bar, (int) $license, 'The license banner comes first in the slot');
    Assert::assertLessThan($header, $bar, 'The bar sits above the header');

    preg_match('/<div[^>]*class="language-bar[^"]*"[^>]*>(.*?)<\/div>/s', $html, $element);

    expect(trim($element[1] ?? 'missing'))->toBe('', 'The server cannot know the reader\'s language, so the bar is empty until the browser decides');
})->group('ssr');

it('shares the license banner\'s slot and hides it while it shows', function (): void {
    $css = (string) file_get_contents(resource_path('css/app.css'));

    expect($css)->toContain("html.has-language-bar {\n  --banner-h: 2.5rem;\n}")
        ->toContain("html.has-language-bar .language-bar {\n  display: block;")
        ->toContain("html.has-language-bar .support-banner {\n  display: none;\n}");
});

it('speaks the language it offers, on one line of a phone', function (string $locale): void {
    $copy = suggestionCopy($locale);

    expect($copy)->toHaveKeys(['label', 'action', 'dismiss']);

    // A 320px screen holds 34 columns beside the close button (TopBannerTest); a CJK character is two, and the arrow two more.
    Assert::assertLessThanOrEqual(32, mb_strwidth($copy['action']), "{$locale}: the link will not fit one line on a 320px screen");

    if ($locale !== 'en') {
        Assert::assertNotSame(suggestionCopy('en')['action'], $copy['action'], "{$locale}: the link is still in English");
    }
})->with(fn(): array => array_keys(json_decode((string) file_get_contents(dirname(__DIR__, 3) . '/resources/data/locales.json'), true)['supported']));
