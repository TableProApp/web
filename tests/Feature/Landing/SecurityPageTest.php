<?php

use App\Support\Localization\Locales;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Arr;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

require_once __DIR__ . '/../Seo/helpers.php';

beforeEach(function (): void {
    withoutVite();
});

/**
 * @return list<string>
 */
function securityLocales(): array
{
    return array_keys(json_decode((string) file_get_contents(__DIR__ . '/../../../resources/data/locales.json'), true)['supported']);
}

function securityPath(string $locale): string
{
    $prefix = Locales::definition($locale)['prefix'];

    return $prefix === null ? '/security' : "/{$prefix}/security";
}

/**
 * @return array<string, mixed>
 */
function securityContent(string $locale): array
{
    return json_decode((string) file_get_contents(resource_path("data/content/{$locale}/security.json")), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @return array<string, string>
 */
function securityStrings(string $locale): array
{
    return array_filter(Arr::dot(securityContent($locale)), 'is_string');
}

it('renders in every language with the facts and links its copy names', function (string $locale): void {
    get(securityPath($locale))
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Security')
            ->where('locale', $locale)
            ->where('content.header.title', securityContent($locale)['header']['title'])
            ->where('facts.macSafeModeLevels', fn($levels): bool => in_array('Silent', $levels->all(), true) && in_array('Read-Only', $levels->all(), true))
            ->where('facts.iosSafeModeLevels', fn($levels): bool => in_array('Confirm Writes', $levels->all(), true))
            ->where('facts.macSafeModeDefault', 'Silent')
            ->where('facts.mcpHost', '127.0.0.1')
            ->where('links.email', 'hello@tablepro.app')
            ->where('links.securityPolicy', 'https://github.com/TableProApp/TablePro/security/policy')
            ->where('links.securityAdvisory', 'https://github.com/TableProApp/TablePro/security/advisories/new')
            ->where('links.securityTxt', '/.well-known/security.txt'));
})->with(securityLocales());

it('is indexed in every language, with each translation as an alternate in the sitemap', function (): void {
    $entry = app(PageRegistry::class)->find('landing.security', []);

    expect($entry->renderLocales)->toBe(Locales::codes())
        ->and($entry->hreflangCluster())->toBe(Locales::codes());

    $sitemap = seoGenerateSitemap();

    foreach (Locales::codes() as $locale) {
        $url = $entry->url($locale);

        Assert::assertArrayHasKey($url, $sitemap, "{$url} is not in the sitemap");
        expect(array_values($sitemap[$url]['alternates']))->toContain(...array_map(fn(string $code): string => $entry->url($code), Locales::codes()));
    }
});

it('fills every slot and resolves every tag and link its copy uses', function (string $locale): void {
    $props = get(securityPath($locale))->viewData('page')['props'];
    $text = implode("\n", securityStrings($locale));

    preg_match_all('/\{([A-Za-z][A-Za-z0-9_.]*)\}/', $text, $slots);
    preg_match_all('/<([a-z][A-Za-z0-9]*)>/', $text, $tags);

    expect(array_values(array_diff(array_unique($slots[1]), [...array_keys($props['facts']), 'email'])))->toBe([])
        ->and(array_values(array_diff(array_unique($tags[1]), ['ui', 'email', 'advisory'])))->toBe([]);

    foreach (securityContent($locale)['sections'] as $section) {
        foreach ($section['links'] as $link) {
            $targets = array_intersect_key($link, array_flip(['href', 'docs', 'to']));

            expect($targets)->toHaveCount(1, "{$locale} {$section['id']}: \"{$link['label']}\" needs one of href, docs or to");

            if (isset($link['to'])) {
                expect($props['links'][$link['to']] ?? null)->toBeString("{$locale} {$section['id']}: \"{$link['label']}\" points at an unknown link");
            } else {
                expect(reset($targets))->toStartWith('/');
            }
        }
    }
})->with(securityLocales());

it('states its limits and makes no absolute safety or privacy claim', function (): void {
    $english = implode("\n", securityStrings('en'));

    foreach ([
        'is not a sandbox or a permission system',
        'does not use the macOS App Sandbox',
        'which is a reminder, not a lock',
        'its writes run without asking',
        'says where the server listens, not who can reach it',
        'sends its first usage report without asking',
    ] as $limit) {
        expect($english)->toContain($limit);
    }

    foreach (['secure', 'military', 'unbreakable', 'bulletproof', 'cannot be', 'nothing leaves', 'anonymous', 'guarantee'] as $claim) {
        Assert::assertDoesNotMatchRegularExpression('/\b' . preg_quote($claim, '/') . '\b/i', $english, "content/en/security.json says \"{$claim}\"");
    }
});

it('server-renders every section with its slots filled and plain page markup', function (string $path): void {
    $html = ssrHtml($path);

    foreach (securityContent('en')['sections'] as $section) {
        expect($html)->toContain("id=\"{$section['id']}\"");
    }

    expect($html)->toContain('"BreadcrumbList"')
        ->toContain('href="https://github.com/TableProApp/TablePro/security/advisories/new"')
        ->toContain('href="mailto:hello@tablepro.app"');
    expect($html)->not->toContain('"FAQPage"');

    Assert::assertDoesNotMatchRegularExpression('/\{[a-zA-Z]+\}/', strip_tags((string) preg_replace('#<script\b[^>]*>.*?</script>#s', '', $html)));
})->with(['/security', '/vi/security', '/fr/security']);
