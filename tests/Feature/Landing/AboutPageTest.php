<?php

use App\Support\Localization\Locales;
use App\Support\Seo\PageRegistry;
use Dom\HTMLDocument;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/**
 * `/about` in every locale, and the publisher wherever the site names it: the
 * about page, the homepage's open-source section, the footer and the
 * Organization node. The name, city and country are `facts.json` →
 * `publisher`; copy and catalogs hold `{maker}`, `{city}` and `{country}`.
 */
beforeEach(function (): void {
    withoutVite();
});

/**
 * Every supported locale, read without the application, for the datasets.
 *
 * @return list<string>
 */
function aboutLocales(): array
{
    return array_keys(json_decode((string) file_get_contents(__DIR__ . '/../../../resources/data/locales.json'), true)['supported']);
}

/**
 * @return array{name: string, countryCode: string, city: array<string, string>, country: array<string, string>, evidence: string}
 */
function aboutPublisher(): array
{
    return json_decode(File::get(resource_path('data/facts.json')), true, 512, JSON_THROW_ON_ERROR)['publisher'];
}

/**
 * @return array<string, mixed>
 */
function aboutContent(string $locale): array
{
    return json_decode(File::get(resource_path("data/content/{$locale}/about.json")), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * The link tags `components/faq/content-links.tsx` resolves.
 *
 * @return list<string>
 */
function aboutKnownTags(): array
{
    $source = File::get(resource_path('js/components/faq/content-links.tsx'));

    preg_match('/const INTERNAL: Record<string, string> = \{(.*?)\};/s', $source, $internal);
    preg_match('/const EXTERNAL: Record<string, \{[^}]*\}> = \{(.*?)\n\};/s', $source, $external);
    preg_match_all('/^\s+([a-zA-Z]+):/m', ($internal[1] ?? '') . "\n" . ($external[1] ?? ''), $keys);

    return [...$keys[1], 'ui', 'account', 'email'];
}

/**
 * The text a reader sees in a server render, with the no-break spaces folded.
 */
function aboutVisibleText(string $html): string
{
    $html = (string) preg_replace('#<(script|style)\b[^>]*>.*?</\1>#s', '', str_replace('<!-- -->', '', $html));

    return (string) preg_replace('/[\x{00A0}\x{202F}]/u', ' ', html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5));
}

it('renders in every locale with the publisher from facts.json', function (string $locale): void {
    $publisher = aboutPublisher();
    $path = $locale === Locales::default() ? '/about' : "/{$locale}/about";

    get($path)
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('About')
            ->where('locale', $locale)
            ->where('content.header.title', aboutContent($locale)['header']['title'])
            ->where('publisher', [
                'name' => $publisher['name'],
                'city' => $publisher['city'][$locale],
                'country' => $publisher['country'][$locale],
                'countryCode' => $publisher['countryCode'],
            ])
            ->where('repositoryCreated.date', '2025-12-17')
            ->where('links.email', 'hello@tablepro.app')
            ->where('links.issues', fn(string $url): bool => str_starts_with($url, 'https://github.com/'))
            ->where('links.discussions', fn(string $url): bool => str_starts_with($url, 'https://github.com/'))
            ->where('links.sponsorsProgram', 'https://github.com/sponsors/datlechin')
            ->where('logo', ['src' => '/logo.png', 'width' => 256, 'height' => 256])
            ->where('seo.robots', 'index, follow'));
})->with(aboutLocales());

it('is indexed in every language, with every translation as an alternate', function (): void {
    $entry = app(PageRegistry::class)->find('landing.about', []);

    expect($entry->renderLocales)->toBe(Locales::codes());
    expect($entry->hreflangCluster())->toBe(Locales::codes());
});

it('fills every slot its copy uses, and resolves every link tag', function (string $locale): void {
    $text = implode("\n", array_filter(Arr::dot(aboutContent($locale)), 'is_string'));

    preg_match_all('/\{([A-Za-z][A-Za-z0-9_.]*)\}/', $text, $slots);
    preg_match_all('/<([a-z][A-Za-z0-9]*)>/', $text, $tags);

    expect(array_values(array_diff(array_unique($slots[1]), ['maker', 'city', 'country', 'email', 'width', 'height'])))->toBe([], "content/{$locale}/about.json uses a slot the page does not fill");
    expect(array_values(array_diff(array_unique($tags[1]), aboutKnownTags())))->toBe([], "content/{$locale}/about.json uses a link tag with no destination");
})->with(aboutLocales());

it('links the security page from the policies, in every language', function (string $locale): void {
    expect(aboutContent($locale)['policies']['body'])->toMatch('#<security>[^<]+</security>#u');

    $prefix = $locale === Locales::default() ? '' : "/{$locale}";

    preg_match('#<section[^>]*id="policies".*?</section>#s', ssrHtml("{$prefix}/about"), $section);

    expect($section)->not->toBe([]);
    expect($section[0])->toContain("href=\"{$prefix}/security\"");
})->with(aboutLocales())->group('ssr');

it('says how the name and logo may be used, and where to ask about anything else, in every language', function (string $locale): void {
    expect(aboutContent($locale)['brand']['usage'] ?? null)->toBeString()->toContain('TablePro')->toContain('<email>{email}</email>');

    $prefix = $locale === Locales::default() ? '' : "/{$locale}";

    preg_match('#<section[^>]*id="brand".*?</section>#s', ssrHtml("{$prefix}/about"), $section);

    expect($section)->not->toBe([]);
    expect($section[0])->toContain('href="mailto:hello@tablepro.app"');
})->with(aboutLocales())->group('ssr');

it('types the publisher in facts.json only', function (): void {
    $publisher = aboutPublisher();
    $needles = [$publisher['name'], ...array_values($publisher['city'])];
    $offences = [];
    $files = [
        ...File::allFiles(resource_path('data/content')),
        ...File::allFiles(resource_path('js')),
        ...File::allFiles(lang_path()),
        ...File::allFiles(resource_path('views')),
    ];

    foreach ($files as $file) {
        if (str_starts_with($file->getRelativePathname(), 'lib/data/asset-')) {
            continue;
        }

        foreach (array_unique($needles) as $needle) {
            if (str_contains($file->getContents(), $needle)) {
                $offences[] = str_replace(base_path() . '/', '', $file->getPathname()) . ": {$needle}";
            }
        }
    }

    expect($offences)->toBe([], "The publisher is typed outside facts.json:\n  " . implode("\n  ", $offences));
});

it('server-renders the publisher, the page sections and an AboutPage about the organization', function (string $path, string $locale): void {
    $publisher = aboutPublisher();
    $html = ssrHtml($path);
    $text = aboutVisibleText($html);

    foreach ([$publisher['name'], $publisher['city'][$locale], $publisher['country'][$locale]] as $fact) {
        expect($text)->toContain($fact);
    }

    foreach (['maker', 'funding', 'source', 'contact', 'policies', 'brand'] as $id) {
        expect($html)->toContain("id=\"{$id}\"");
    }

    Assert::assertDoesNotMatchRegularExpression('/\{[a-zA-Z]+\}/', $text, "{$path} leaves a slot unfilled");
    expect($html)->toContain('href="/logo.png" download=""');

    $document = HTMLDocument::createFromString($html, LIBXML_NOERROR);
    $nodes = [];

    foreach ($document->querySelectorAll('script[type="application/ld+json"]') as $script) {
        array_push($nodes, ...(json_decode((string) $script->textContent, true)['@graph'] ?? []));
    }

    $page = collect($nodes)->firstWhere('@type', 'AboutPage');
    $organization = collect($nodes)->firstWhere('@type', 'Organization');

    expect($page)->not->toBeNull()
        ->and($page['about'])->toBe(['@id' => $organization['@id']])
        ->and($organization['@id'])->toEndWith('/#organization')
        ->and($page['inLanguage'])->toBe(Locales::definition($locale)['hreflang'])
        ->and($organization['founder']['name'])->toBe($publisher['name'])
        ->and($organization['founder']['@id'])->toEndWith('/#founder')
        ->and($organization['address'])->toBe(['@type' => 'PostalAddress', 'addressLocality' => $publisher['city']['en'], 'addressCountry' => $publisher['countryCode']]);
})->with([
    ['/about', 'en'],
    ['/vi/about', 'vi'],
    ['/ja/about', 'ja'],
    ['/de/about', 'de'],
])->group('ssr');

it('says who builds TablePro in the homepage open-source section, and links the about page', function (string $locale): void {
    $publisher = aboutPublisher();
    $path = $locale === Locales::default() ? '/' : "/{$locale}";
    $prefix = $locale === Locales::default() ? '' : "/{$locale}";

    preg_match('#<section[^>]*id="open-source".*?</section>#s', ssrHtml($path), $section);

    expect($section)->not->toBe([]);
    expect(aboutVisibleText($section[0]))->toContain($publisher['name'])->toContain($publisher['city'][$locale]);
    expect($section[0])->toContain("href=\"{$prefix}/about\"");
})->with(aboutLocales())->group('ssr');

it('names the publisher in the footer of every language', function (string $locale): void {
    $publisher = aboutPublisher();
    $path = $locale === Locales::default() ? '/faq' : "/{$locale}/faq";

    preg_match('#<footer\b.*?</footer>#s', ssrHtml($path), $footer);

    expect(aboutVisibleText($footer[0]))->toContain($publisher['name'])
        ->toContain($publisher['city'][$locale])
        ->toContain('AGPLv3');
})->with(aboutLocales())->group('ssr');

it('keeps the footer line short enough for one row beside the controls at 1280px', function (string $locale): void {
    $publisher = aboutPublisher();
    $catalog = File::get(resource_path("js/i18n/messages/{$locale}/footer.ts"));

    preg_match('/[\'"]?copyright[\'"]?:\s*([\'"])(.*?)\1/u', $catalog, $match);

    $line = strtr($match[2] ?? '', ['{year}' => '2026', '{maker}' => $publisher['name'], '{city}' => $publisher['city'][$locale]]);
    $wide = preg_match_all('/[\p{Han}\p{Hiragana}\p{Katakana}\p{Hangul}\x{3000}-\x{303F}\x{FF00}-\x{FFEF}]/u', $line);

    // Measured: about 7px per character, twice that for a wide one, and 912px of room at 1280px.
    expect($line)->toContain($publisher['name'])
        ->and(mb_strlen($line) + $wide)->toBeLessThanOrEqual(125, "{$locale}: {$line}");
})->with(aboutLocales());
