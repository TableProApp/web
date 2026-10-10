<?php

use App\Support\Localization\Locales;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Arr;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/**
 * The FAQ, `/faq` and `/vi/faq` (sitemap §A.1, design-system §8.12).
 *
 * The FAQ answers the questions every other page answers at length, so it is
 * where a stale fact survives longest: "macOS 14", "Thirteen providers", "no
 * account", the AGPL sentence that was wrong twice. These cases hold the copy
 * to its contract: facts arrive through `{token}` slots the page fills from
 * the data files, links through tags the page resolves, and no answer types a
 * price, a count or a retired claim.
 */
beforeEach(function (): void {
    withoutVite();
});

/**
 * @return array<string, mixed>
 */
function faqContent(string $locale): array
{
    return json_decode((string) file_get_contents(resource_path("data/content/{$locale}/faq.json")), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * Every answer and question string, joined.
 */
function faqText(string $locale): string
{
    return implode("\n", array_filter(Arr::dot(faqContent($locale)), 'is_string'));
}

/**
 * The slots `pages/Faq.tsx` fills, read from its `values` object so this list
 * cannot drift from the page.
 *
 * @return list<string>
 */
function faqProvidedSlots(): array
{
    $source = (string) file_get_contents(resource_path('js/pages/Faq.tsx'));

    preg_match('/const values: Values = \{(.*?)\n    \};/s', $source, $block);
    preg_match_all('/^\s+(?:\.\.\.\(.*?\{ )?([a-zA-Z]+):/m', $block[1] ?? '', $keys);

    // The commerce values are spread in by name from the server's `commerce` prop.
    $commerce = ['merchant', 'currency', 'refundDays', 'revalidateDays', 'graceDays', 'starterActivations', 'teamMinSeats', 'teamMaxSeats', 'supportBusinessDays'];

    return array_values(array_unique([...$keys[1], ...$commerce]));
}

/**
 * The link tags `components/faq/content-links.tsx` resolves.
 *
 * @return list<string>
 */
function faqKnownTags(): array
{
    $source = (string) file_get_contents(resource_path('js/components/faq/content-links.tsx'));

    preg_match('/const INTERNAL: Record<string, string> = \{(.*?)\};/s', $source, $internal);
    preg_match('/const EXTERNAL: Record<string, \{[^}]*\}> = \{(.*?)\n\};/s', $source, $external);
    preg_match_all('/^\s+([a-zA-Z]+):/m', ($internal[1] ?? '') . "\n" . ($external[1] ?? ''), $keys);

    return [...$keys[1], 'ui', 'account', 'email'];
}

it('renders in both languages with the facts its answers state', function (string $path, string $locale, string $title): void {
    get($path)
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Faq')
            ->where('locale', $locale)
            ->where('content.header.title', $title)
            ->where('platforms.mac.requirements.minVersion', '13.0')
            ->where('platforms.ios.requirements.systems', ['iOS', 'iPadOS'])
            ->where('facts.iosEngines', fn($names): bool => count($names) > 0 && in_array('PostgreSQL', $names->all(), true))
            ->where('facts.paidFeatures.team', ['Team Catalog', 'Team Library'])
            ->where('facts.commerce.merchant', 'Polar')
            ->where('facts.commerce.refundDays', 7)
            ->where('facts.commerce.teamMinSeats', 5)
            ->where('links.email', 'hello@tablepro.app')
            ->where('links.portal', fn(string $url): bool => str_starts_with($url, 'https://'))
            ->has('facts.featuredEngines')
            // "Drivers for {bundledEngines} come with the Mac app": the engines.json distribution, not "the most common engines".
            ->where('facts.bundledEngines', fn($names): bool => $names->all() === collect(json_decode((string) file_get_contents(resource_path('data/engines.json')), true))
                ->where('state', 'published')
                ->where('distribution', 'bundled')
                ->pluck('name')
                ->values()
                ->all() && ! in_array('MongoDB', $names->all(), true))
            ->has('facts.importApps')
            ->has('organizationProfiles'));
})->with([
    'English' => ['/faq', 'en', 'Frequently asked questions'],
    'Vietnamese' => ['/vi/faq', 'vi', 'Câu hỏi thường gặp'],
]);

it('indexes every complete translation', function (): void {
    $entry = app(PageRegistry::class)->find('landing.faq', []);

    expect($entry->renderLocales)->toBe(Locales::codes());
    expect($entry->hreflangCluster())->toBe(Locales::codes());
});

it('groups the questions in the sitemap order, with stable ids in both languages', function (): void {
    foreach (['en', 'vi'] as $locale) {
        expect(array_column(faqContent($locale)['groups'], 'id'))
            ->toBe(['general', 'platforms', 'databases', 'licensing', 'privacy', 'account', 'switching']);
    }

    $ids = fn(string $locale): array => collect(faqContent($locale)['groups'])->flatMap(fn(array $group): array => array_column($group['items'], 'id'))->all();

    expect($ids('vi'))->toBe($ids('en'));
    expect($ids('en'))->toBe(array_values(array_unique($ids('en'))));
    // `/faq#lost-license-key` is linked from the pricing page's licensing questions.
    expect($ids('en'))->toContain('lost-license-key');
});

it('fills every slot its copy uses, and resolves every link tag', function (string $locale): void {
    $text = faqText($locale);

    preg_match_all('/\{([A-Za-z][A-Za-z0-9_.]*)\}/', $text, $slots);
    preg_match_all('/<([a-z][A-Za-z0-9]*)>/', $text, $tags);

    expect(array_values(array_diff(array_unique($slots[1]), faqProvidedSlots())))->toBe([], "content/{$locale}/faq.json uses a slot the page does not fill");
    expect(array_values(array_diff(array_unique($tags[1]), faqKnownTags())))->toBe([], "content/{$locale}/faq.json uses a link tag with no destination");
})->with(['en', 'vi']);

it('names every app language in platforms.json in every locale', function (): void {
    $platforms = json_decode((string) file_get_contents(resource_path('data/platforms.json')), true)['platforms'];
    $tags = collect($platforms)->flatMap(fn(array $platform): array => $platform['appLanguages'] ?? [])->unique()->all();

    foreach (Locales::codes() as $locale) {
        $compare = json_decode((string) file_get_contents(resource_path("data/content/{$locale}/compare/index.json")), true)['labels']['languages'];

        foreach ($tags as $tag) {
            expect(array_key_exists($tag, faqContent($locale)['languages']))->toBeTrue("content/{$locale}/faq.json names no {$tag}");
            expect(array_key_exists($tag, $compare))->toBeTrue("content/{$locale}/compare/index.json names no {$tag}");
        }
    }
});

it('types no price, count or retired claim into an answer', function (string $locale): void {
    $text = faqText($locale);

    // Prices come from pricing.json on the pricing page; the FAQ links there.
    Assert::assertDoesNotMatchRegularExpression('/\$\s?\d|\d\s?US\$|\bUSD\s?\d/u', $text);

    // Typed counts and the site-wide banned phrases are NoTypedCountsTest's and BannedClaimsTest's.
    foreach (['Thirteen', 'Sixteen', 'not to using it', 'nothing leaves', 'anonymous', 'by one person', 'full time', 'TestFlight'] as $needle) {
        Assert::assertStringNotContainsStringIgnoringCase($needle, $text, "content/{$locale}/faq.json says \"{$needle}\"");
    }
})->with(['en', 'vi']);

it('states the AGPL, the free core and priority support the way the rest of the site does', function (): void {
    $en = faqText('en');

    // AGPLv3 §2, §4-§6 and §13: running has no conditions; distributing and network use of a modified version do.
    expect($en)->toContain('The AGPL places no conditions on running TablePro. They apply to distributing it, and to offering a modified version to others over a network.');

    // Positioning §9: the free core is scoped, and names what needs no license.
    expect($en)->toContain('All supported engines, AI, MCP and Safe Mode are free.')
        ->toContain('The Mac app has no trial period or time limit.');

    // Spec §0: Team priority support, defined.
    expect($en)->toContain('emails from Team customers are answered first, within one business day');
    expect(json_decode((string) file_get_contents(resource_path('data/pricing.json')), true)['tiers']['team']['prioritySupport']['responseBusinessDays'])->toBe(1);

    // Privacy sentences positioning §12.1 allows, and nothing stronger.
    expect($en)->toContain('The Mac app sends a daily usage report by default; disable it in')
        ->toContain('iPhone and iPad reports are opt-in.')
        ->toContain('Team Library receives settings and saved SQL you publish.')
        ->toContain('including IP logging.');
});

it('answers the Windows and Linux question without a promise', function (): void {
    $answer = collect(faqContent('en')['groups'])->firstWhere('id', 'platforms')['items'];
    $answer = collect($answer)->firstWhere('id', 'windows-linux')['answer'][0];

    expect($answer)->toBe('No. There is no Windows version. A Linux prototype exists, but there is nothing to install and no release date.');
});

it('server-renders every group, with no FAQPage markup', function (string $path): void {
    $html = ssrHtml($path);

    foreach (['general', 'platforms', 'databases', 'licensing', 'privacy', 'account', 'switching'] as $id) {
        expect($html)->toContain("id=\"{$id}\"");
    }

    expect($html)->not->toContain('"FAQPage"');
    expect($html)->toContain('"BreadcrumbList"');

    // Every slot was filled: an unfilled one stays visible as written.
    Assert::assertDoesNotMatchRegularExpression('/\{[a-zA-Z]+\}/', strip_tags(preg_replace('#<script\b[^>]*>.*?</script>#s', '', $html)));
})->with(['/faq', '/vi/faq'])->group('ssr');
