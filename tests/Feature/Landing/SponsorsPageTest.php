<?php

use App\Support\Localization\Locales;
use App\Support\Seo\PageRegistry;
use Dom\HTMLDocument;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();
});

/**
 * @return list<string>
 */
function sponsorsPageLocales(): array
{
    return array_keys(json_decode((string) file_get_contents(__DIR__ . '/../../../resources/data/locales.json'), true)['supported']);
}

/**
 * @return array<string, mixed>
 */
function sponsorsPageData(): array
{
    return json_decode(File::get(resource_path('data/sponsors.json')), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @return array<string, mixed>
 */
function sponsorsPageContent(string $locale): array
{
    return json_decode(File::get(resource_path("data/content/{$locale}/sponsors.json")), true, 512, JSON_THROW_ON_ERROR);
}

function sponsorsPageSection(string $html, string $id): string
{
    preg_match('#<section[^>]*id="' . $id . '".*?</section>#s', $html, $section);

    return $section[0] ?? '';
}

it('renders in every locale', function (string $locale): void {
    $path = $locale === Locales::default() ? '/sponsors' : "/{$locale}/sponsors";

    get($path)
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Sponsors')
            ->where('locale', $locale)
            ->where('content.header.title', sponsorsPageContent($locale)['header']['title'])
            ->where('seo.robots', 'index, follow'));
})->with(sponsorsPageLocales());

it('is indexed in every language, with every translation as an alternate', function (): void {
    $entry = app(PageRegistry::class)->find('landing.sponsors', []);

    expect($entry->renderLocales)->toBe(Locales::codes());
    expect($entry->hreflangCluster())->toBe(Locales::codes());
});

it('takes every count and price from the data, never from the copy', function (string $locale): void {
    $text = implode("\n", array_filter(Arr::dot(sponsorsPageContent($locale)), 'is_string'));

    preg_match_all('/\{([A-Za-z]+)\}/', $text, $slots);

    expect(array_values(array_diff(array_unique($slots[1]), ['count', 'total', 'price'])))->toBe([]);
    expect($text)->not->toMatch('/\$\s?\d|\d\s?(US)?\$|\d\s?€|<[a-z]+>/u');
    expect($text)->not->toMatch('/(?<![\p{L}\p{N}{])' . sponsorsPageData()['homepageSlots'] . '(?![\p{N}}])/u');
})->with(sponsorsPageLocales());

it('server-renders the sponsors by placement, the open places, every tier and a WebPage', function (string $locale): void {
    $data = sponsorsPageData();
    $content = sponsorsPageContent($locale);
    $prefix = $locale === Locales::default() ? '' : "/{$locale}";
    $html = ssrHtml("{$prefix}/sponsors");

    preg_match_all('#<section[^>]*\bid="([a-z-]+)"#', (string) strstr($html, '<main'), $ids);

    expect($ids[1])->toBe(['companies', 'individuals', 'tiers']);

    $companies = sponsorsPageSection($html, 'companies');
    $individuals = sponsorsPageSection($html, 'individuals');
    $tiers = sponsorsPageSection($html, 'tiers');

    foreach ($data['sponsors'] as $sponsor) {
        $url = htmlspecialchars($sponsor['url'], ENT_QUOTES);
        $link = '#<a[^>]*href="' . preg_quote($url, '#') . '"[^>]*rel="sponsored noopener"[^>]*>(.*?)</a>#s';

        if ($sponsor['placement'] === 'name') {
            expect($individuals)->toMatch($link);
            expect($companies)->not->toContain($url);
        } else {
            expect(preg_match($link, $companies, $match))->toBe(1, "{$sponsor['name']} has no sponsored link in #companies");
            expect($match[1])->toContain('<img')->toContain($sponsor['name']);
        }
    }

    $placed = count(array_filter($data['sponsors'], fn(array $sponsor): bool => in_array($sponsor['placement'], ['lead', 'homepage'], true)));
    $open = max(0, $data['homepageSlots'] - $placed);
    $line = $open > 0 ? $content['companies']['open'][$open === 1 ? 'one' : 'other'] : $content['companies']['full'];

    expect($companies)->toContain(htmlspecialchars(str_replace(['{count}', '{total}'], [(string) $open, (string) $data['homepageSlots']], $line), ENT_QUOTES));
    expect(substr_count($tiers, '<tr class='))->toBe(count($data['tiers']));

    if ($locale === Locales::default()) {
        foreach ($data['tiers'] as $tier) {
            expect($tiers)->toContain('$' . number_format($tier['monthly']))
                ->toContain('$' . number_format($tier['monthly'] * $data['oneTime']['multiplier']));
        }
    }

    expect($tiers)->toContain('href="https://github.com/sponsors/datlechin"');

    $document = HTMLDocument::createFromString($html, LIBXML_NOERROR);
    $nodes = [];

    foreach ($document->querySelectorAll('script[type="application/ld+json"]') as $script) {
        array_push($nodes, ...(json_decode((string) $script->textContent, true)['@graph'] ?? []));
    }

    $page = collect($nodes)->firstWhere('@type', 'WebPage');

    expect($page)->not->toBeNull()
        ->and($page['inLanguage'])->toBe(Locales::definition($locale)['hreflang'])
        ->and($page['url'])->toEndWith("{$prefix}/sponsors");
})->with(['en', 'vi'])->group('ssr');
