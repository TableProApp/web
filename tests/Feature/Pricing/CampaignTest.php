<?php

use App\Http\Middleware\CacheHtmlAtEdge;
use App\Support\Pricing\Campaign;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\travelTo;

/*
 * The dated sale in pricing.json: its phase on the clock, the banner it puts
 * on every page while it is live, and the edge cache, which must never serve
 * a page rendered on one side of the start or the end on the other. The
 * browser's half (the phase it shows, the offer it sends) is
 * tests/js/campaign.test.ts.
 */

function campaign(): Campaign
{
    $campaign = Campaign::current();

    expect($campaign)->not->toBeNull('pricing.json names no campaign');

    return $campaign;
}

it('is upcoming before the start, live from it, and ended from the end', function (): void {
    $campaign = campaign();

    expect($campaign->phase($campaign->startsAt->subSecond()))->toBe(Campaign::UPCOMING);
    expect($campaign->phase($campaign->startsAt))->toBe(Campaign::LIVE);
    expect($campaign->phase($campaign->endsAt->subSecond()))->toBe(Campaign::LIVE);
    expect($campaign->phase($campaign->endsAt))->toBe(Campaign::ENDED);
});

it('counts the seconds to its next change, and none once it has ended', function (): void {
    $campaign = campaign();

    expect($campaign->secondsUntilChange($campaign->startsAt->subMinutes(5)))->toBe(300);
    expect($campaign->secondsUntilChange($campaign->startsAt))->toBe((int) $campaign->startsAt->diffInSeconds($campaign->endsAt));
    expect($campaign->secondsUntilChange($campaign->endsAt->subSecond()))->toBe(1);
    expect($campaign->secondsUntilChange($campaign->endsAt))->toBeNull();
});

it('writes its dates in the page language, in UTC', function (): void {
    $campaign = campaign();

    expect($campaign->props('en', $campaign->startsAt))->toBe([
        'phase' => Campaign::LIVE,
        'startsOn' => 'November 24, 2026',
        'startsAtTime' => '12:00 AM',
        'endsOn' => 'December 1, 2026',
        'endsAtTime' => '8:00 AM',
        'listPriceSince' => 'November 2, 2026',
    ]);
    expect($campaign->props('vi', $campaign->startsAt)['endsAtTime'])->toBe('08:00');
});

it('shares its phase with every page', function (string $at, string $phase): void {
    $campaign = campaign();
    travelTo($at === 'start' ? $campaign->startsAt : ($at === 'end' ? $campaign->endsAt : $campaign->startsAt->subDay()));

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('campaign.phase', $phase));
})->with([
    'the day before' => ['before', Campaign::UPCOMING],
    'at the start' => ['start', Campaign::LIVE],
    'at the end' => ['end', Campaign::ENDED],
]);

it('takes the banner slot while it is live, on every page but its own, Pricing included', function (string $prefix): void {
    travelTo(campaign()->startsAt);

    foreach (['/download', '/pricing', '/'] as $path) {
        $response = get(rtrim("{$prefix}{$path}", '/') ?: '/')->assertOk();

        expect($response->getContent())->toMatch('/<html[^>]*class="has-banner campaign-live"/');
        $response->assertInertia(fn(AssertableInertia $page) => $page->where('banner', ['kind' => 'campaign', 'href' => '/black-friday']));
    }

    $own = get("{$prefix}/black-friday")->assertOk();

    expect($own->getContent())->toMatch('/<html[^>]*class="campaign-live"/', 'The sale\'s page must not show a banner leading to itself');
    $own->assertInertia(fn(AssertableInertia $page) => $page->where('banner', null));
})->with(['English' => '', 'Vietnamese' => '/vi']);

it('hands the slot back to the license banner when it ends', function (): void {
    config(['banner.enabled' => true]);
    travelTo(campaign()->endsAt);

    $response = get('/download')->assertOk();

    expect($response->getContent())->not->toContain('campaign-live');
    $response->assertInertia(fn(AssertableInertia $page) => $page->where('banner.kind', 'license'));
});

it('drops itself before first paint for a reader whose clock is past the end', function (): void {
    $campaign = campaign();
    travelTo($campaign->startsAt);

    $html = get('/download')->assertOk()->getContent();
    $rule = "if (Date.now() >= {$campaign->endsAt->getTimestampMs()}) {\n                    document.documentElement.classList.remove('campaign-live', 'has-banner');";

    Assert::assertStringContainsString($rule, $html);
    Assert::assertLessThan(strpos($html, '<body'), strpos($html, $rule), 'The rule belongs in the head, before first paint');

    travelTo($campaign->endsAt);
    Assert::assertStringNotContainsString('Date.now() >=', get('/download')->assertOk()->getContent(), 'No dead script once it has ended');
});

it('keeps the usual cache lifetimes when nothing dated is near', function (): void {
    expect(CacheHtmlAtEdge::cacheControl(null))->toBe(CacheHtmlAtEdge::CACHE_CONTROL);
    expect(CacheHtmlAtEdge::cacheControl(4200))->toBe(CacheHtmlAtEdge::CACHE_CONTROL);
});

it('ends every cached copy at the next change, fresh first, then stale', function (int $seconds, string $header): void {
    expect(CacheHtmlAtEdge::cacheControl($seconds))->toBe($header);
})->with([
    'just inside the hour and ten minutes' => [4199, 'public, max-age=0, s-maxage=600, stale-while-revalidate=3599'],
    'within the stale window' => [900, 'public, max-age=0, s-maxage=600, stale-while-revalidate=300'],
    'within the fresh window' => [120, 'public, max-age=0, s-maxage=120, stale-while-revalidate=0'],
    'at the instant' => [0, 'public, max-age=0, s-maxage=0, stale-while-revalidate=0'],
]);

it('sends the shortened lifetimes on a page near the start or the end', function (string $at, string $fresh, string $stale): void {
    $campaign = campaign();
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
