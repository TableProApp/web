<?php

use App\Http\Middleware\CacheHtmlAtEdge;
use App\Support\Pricing\Campaign;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\travelTo;

function saleCampaign(): Campaign
{
    $campaign = Campaign::current();

    expect($campaign)->not->toBeNull('pricing.json names no campaign');

    return $campaign;
}

// A live sale takes the banner slot, so the license banner is checked once it has ended.
function afterSale(): void
{
    travelTo(Campaign::current()?->endsAt ?? now());
}

it('is upcoming before the start, live from it, and ended from the end', function (): void {
    $campaign = saleCampaign();

    expect($campaign->phase($campaign->startsAt->subSecond()))->toBe(Campaign::UPCOMING)
        ->and($campaign->phase($campaign->startsAt))->toBe(Campaign::LIVE)
        ->and($campaign->phase($campaign->endsAt->subSecond()))->toBe(Campaign::LIVE)
        ->and($campaign->phase($campaign->endsAt))->toBe(Campaign::ENDED);
});

it('counts the seconds to its next change, and none once it has ended', function (): void {
    $campaign = saleCampaign();

    expect($campaign->secondsUntilChange($campaign->startsAt->subMinutes(5)))->toBe(300)
        ->and($campaign->secondsUntilChange($campaign->endsAt->subSecond()))->toBe(1)
        ->and($campaign->secondsUntilChange($campaign->endsAt))->toBeNull();
});

it('formats its dates in the page language, in UTC', function (): void {
    $campaign = saleCampaign();

    expect($campaign->startsAt->utcOffset())->toBe(0)
        ->and($campaign->props('en'))->toHaveKeys(['phase', 'startsOn', 'startsAtTime', 'endsOn', 'endsAtTime', 'listPriceSince'])
        ->and($campaign->props('en')['endsAtTime'])->toMatch('/^\d{1,2}:\d{2} [AP]M$/')
        ->and($campaign->props('vi')['endsAtTime'])->toMatch('/^\d{2}:\d{2}$/');
});

it('shares its phase with every page', function (string $path, string $at, string $phase): void {
    $campaign = saleCampaign();

    travelTo(match ($at) {
        'start' => $campaign->startsAt,
        'end' => $campaign->endsAt,
        default => $campaign->startsAt->subDay(),
    });

    get($path)->assertOk()->assertInertia(fn(AssertableInertia $page) => $page->where('campaign.phase', $phase));
})->with(['/download', '/black-friday'])->with([
    'the day before' => ['before', Campaign::UPCOMING],
    'at the start' => ['start', Campaign::LIVE],
    'at the end' => ['end', Campaign::ENDED],
]);

it('takes the banner slot while it is live, on every page but its own', function (string $prefix): void {
    travelTo(saleCampaign()->startsAt);

    foreach (['/download', '/pricing', ''] as $path) {
        $response = get("{$prefix}{$path}" ?: '/')->assertOk();

        expect($response->getContent())->toMatch('/<html[^>]*class="has-banner campaign-live"/');
        $response->assertInertia(fn(AssertableInertia $page) => $page->where('banner', ['kind' => 'campaign', 'href' => '/black-friday']));
    }

    $own = get("{$prefix}/black-friday")->assertOk();

    expect($own->getContent())->toMatch('/<html[^>]*class="campaign-live"/');
    $own->assertInertia(fn(AssertableInertia $page) => $page->where('banner', null));
})->with(['English' => '', 'Vietnamese' => '/vi']);

it('hands the slot back to the license banner when it ends', function (): void {
    config(['banner.enabled' => true]);
    afterSale();

    $response = get('/download')->assertOk();

    expect($response->getContent())->not->toContain('campaign-live');
    $response->assertInertia(fn(AssertableInertia $page) => $page->where('banner.kind', 'license'));
});

it('drops itself before first paint for a reader whose clock is past the end', function (): void {
    $campaign = saleCampaign();
    $check = "Date.now() >= {$campaign->endsAt->getTimestampMs()}";

    travelTo($campaign->startsAt);
    $html = get('/download')->assertOk()->getContent();

    expect(strpos($html, $check))->toBeInt()->toBeLessThan(strpos($html, '<body'));

    travelTo($campaign->endsAt);

    expect(get('/download')->assertOk()->getContent())->not->toContain('Date.now() >=');
});

it('keeps every cached copy short of the next change', function (?int $seconds, string $header): void {
    expect(CacheHtmlAtEdge::cacheControl($seconds))->toBe($header);
})->with([
    'nothing dated' => [null, CacheHtmlAtEdge::CACHE_CONTROL],
    'far off' => [4200, CacheHtmlAtEdge::CACHE_CONTROL],
    'just inside the hour and ten minutes' => [4199, 'public, max-age=0, s-maxage=600, stale-while-revalidate=3599'],
    'within the stale window' => [900, 'public, max-age=0, s-maxage=600, stale-while-revalidate=300'],
    'within the fresh window' => [120, 'public, max-age=0, s-maxage=120, stale-while-revalidate=0'],
    'at the instant' => [0, 'public, max-age=0, s-maxage=0, stale-while-revalidate=0'],
]);

it('sends the shortened lifetimes on a page near the start or the end', function (string $at, string $fresh, string $stale): void {
    $campaign = saleCampaign();

    travelTo(match ($at) {
        'start' => $campaign->startsAt->subMinutes(2),
        'end' => $campaign->endsAt->subMinutes(20),
        default => $campaign->endsAt,
    });

    $headers = get('/download')->assertOk()->headers;

    expect($headers->getCacheControlDirective('s-maxage'))->toBe($fresh)
        ->and($headers->getCacheControlDirective('stale-while-revalidate'))->toBe($stale);
})->with([
    'two minutes before the start' => ['start', '120', '0'],
    'twenty minutes before the end' => ['end', '600', '600'],
    'once it has ended' => ['after', '600', '3600'],
]);

// The file, not config(): a default of off once took the banner off production.
it('turns the license banner on by default, linking a page of this site', function (): void {
    $defaults = require base_path('config/banner.php');

    expect($defaults['enabled'])->toBeTrue()
        ->and($defaults['href'])->toMatch('#^/(pricing|blog/[a-z0-9-]+)$#');
});

it('sends only the banner link, so the words come from the catalog', function (): void {
    config(['banner.enabled' => true, 'banner.href' => '/pricing']);
    afterSale();

    $response = get('/download')->assertOk();

    expect($response->getContent())->toContain('<html lang="en" class="has-banner">');
    $response->assertInertia(fn(AssertableInertia $page) => $page->where('banner', ['kind' => 'license', 'href' => '/pricing']));
});

it('leaves nothing behind when the banner is off, or on the pricing page it leads to', function (string $path, bool $enabled): void {
    config(['banner.enabled' => $enabled]);
    afterSale();

    $response = get($path)->assertOk();

    expect($response->getContent())->not->toContain('has-banner');
    $response->assertInertia(fn(AssertableInertia $page) => $page->where('banner', null));
})->with([
    'switched off' => ['/download', false],
    'pricing' => ['/pricing', true],
    'Vietnamese pricing' => ['/vi/pricing', true],
]);

it('drops the banner before first paint on /ios for an iPhone or iPad only', function (string $prefix): void {
    config(['banner.enabled' => true]);
    afterSale();

    $rule = "classList.remove('has-banner')";
    $ios = get("{$prefix}/ios")->assertOk()->getContent();

    expect(strpos($ios, $rule))->toBeInt()
        ->toBeGreaterThan(strpos($ios, "classList.add('ios')"))
        ->toBeLessThan(strpos($ios, '<body'))
        ->and(get("{$prefix}/download")->assertOk()->getContent())->not->toContain($rule);
})->with(['English' => '', 'Vietnamese' => '/vi']);
