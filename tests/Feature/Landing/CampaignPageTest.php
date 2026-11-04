<?php

use App\Support\Localization\Locales;
use App\Support\Pricing\Campaign;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\travelTo;
use function Pest\Laravel\withoutVite;

/*
 * `/black-friday`, the dated sale's own page: one URL from year to year, in
 * every language, that follows the sale's phase. The phase itself, the banner
 * and the cache are CampaignTest's.
 */

beforeEach(function (): void {
    withoutVite();
});

/**
 * @return list<string>
 */
function campaignPageLocales(): array
{
    return array_keys(json_decode((string) file_get_contents(__DIR__ . '/../../../resources/data/locales.json'), true)['supported']);
}

/**
 * @return array<string, mixed>
 */
function campaignPageContent(string $locale): array
{
    return json_decode(File::get(resource_path("data/content/{$locale}/black-friday.json")), true, 512, JSON_THROW_ON_ERROR);
}

it('renders in every locale, before, during and after the sale', function (string $locale): void {
    $campaign = Campaign::current();
    $path = $locale === Locales::default() ? '/black-friday' : "/{$locale}/black-friday";

    foreach ([
        Campaign::UPCOMING => $campaign->startsAt->subDay(),
        Campaign::LIVE => $campaign->startsAt,
        Campaign::ENDED => $campaign->endsAt,
    ] as $phase => $at) {
        travelTo($at);

        get($path)
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->component('BlackFriday')
                ->where('locale', $locale)
                ->where('campaign.phase', $phase)
                ->where('content.hero.eyebrow', campaignPageContent($locale)['hero']['eyebrow'])
                ->has('paidFeatures')
                ->has('organizationProfiles')
                ->where('seo.robots', 'index, follow'));
    }
})->with(campaignPageLocales());

it('is indexed in every language all year, on one URL', function (): void {
    $entry = app(PageRegistry::class)->find('landing.black-friday', []);

    expect($entry->renderLocales)->toBe(Locales::codes());
    expect($entry->indexableLocales)->toBe(Locales::codes());
});

it('takes every price, date, percentage and the code from the data, never from the copy', function (string $locale): void {
    $text = implode("\n", array_filter(Arr::dot(campaignPageContent($locale)), 'is_string'));

    preg_match_all('/\{([A-Za-z]+)\}/', $text, $slots);

    expect(array_values(array_diff(array_unique($slots[1]), [
        'percent', 'startsOn', 'endsOn', 'endsAtTime', 'listPriceSince', 'code', 'lifetime', 'lifetimeList', 'yearly', 'yearlyList', 'activations', 'refundDays', 'price',
    ])))->toBe([]);
    expect($text)->not->toMatch('/\$\s?\d|\d\s?(US)?\$|\d\s?€|\d+\s?%|BLACKFRIDAY|2026-/u');
})->with(campaignPageLocales());

it('says what the yearly price renews at, and dates the struck prices, in every language', function (string $locale): void {
    $content = campaignPageContent($locale);

    expect($content['offers']['yearly']['detail'])->toContain('{yearly}')->toContain('{yearlyList}');
    expect($content['offers']['regularSince'])->toContain('{listPriceSince}');
    expect(collect($content['faq']['items'])->pluck('answer')->implode("\n"))->toContain('<prices>')->toContain('{listPriceSince}');
})->with(campaignPageLocales());

it('offers nothing once the sale has ended: its own title, heading and description', function (string $locale): void {
    $content = campaignPageContent($locale);

    foreach (['endedTitle', 'endedDescription'] as $key) {
        expect($content['seo'][$key])->toBeString()->not->toBe('');
    }

    expect($content['seo']['endedTitle'])->not->toContain('{percent}');
    expect($content['ended']['title'])->not->toContain('{percent}');
})->with(campaignPageLocales());

it('server-renders the sale on the Pro card, the band and the banner while it is live, and none of it after', function (string $path): void {
    $campaign = Campaign::current();
    $pricing = json_decode(File::get(resource_path('data/pricing.json')), true, 512, JSON_THROW_ON_ERROR);
    $prices = $pricing['tiers']['starter']['prices'];
    $sale = fn(int|float $list): string => '$' . number_format(round($list * (100 - $pricing['campaign']['percent']) / 100, 2), 2);

    travelTo($campaign->startsAt);
    $live = html_entity_decode(ssrHtml($path), ENT_QUOTES | ENT_HTML5);

    // Yearly is the cycle shown first; the one-time price is in the HTML too, hidden.
    expect($live)
        ->toContain('class="campaign-band')
        ->toContain('class="campaign-banner')
        ->toContain($sale($prices['yearly']))
        ->toContain($sale($prices['lifetime']))
        ->toMatch('/<s[^>]*>.*?\\$' . $prices['yearly'] . '<\/span><\/s>/s');

    travelTo($campaign->endsAt);
    $after = html_entity_decode(ssrHtml($path), ENT_QUOTES | ENT_HTML5);

    expect($after)
        ->not->toContain('class="campaign-band')
        ->not->toContain('class="campaign-banner')
        ->not->toContain($sale($prices['yearly']))
        ->not->toContain($sale($prices['lifetime']));
})->with(['/pricing', '/'])->group('ssr');
