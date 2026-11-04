<?php

use App\Support\Localization\Locales;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/*
 * `/teams`, Team for the person who buys it for a company (monetization
 * roadmap R4.2). It promises only what checkout and the account do today:
 * Polar's invoice, the seat rules, and a conversation for a purchase order.
 */

beforeEach(function (): void {
    withoutVite();
});

/**
 * @return list<string>
 */
function teamsPageLocales(): array
{
    return array_keys(json_decode((string) file_get_contents(__DIR__ . '/../../../resources/data/locales.json'), true)['supported']);
}

/**
 * @return array<string, mixed>
 */
function teamsPageContent(string $locale): array
{
    return json_decode(File::get(resource_path("data/content/{$locale}/teams.json")), true, 512, JSON_THROW_ON_ERROR);
}

it('renders in every locale', function (string $locale): void {
    $path = $locale === Locales::default() ? '/teams' : "/{$locale}/teams";

    get($path)
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Teams')
            ->where('locale', $locale)
            ->where('content.header.title', teamsPageContent($locale)['header']['title'])
            ->has('organizationProfiles')
            ->where('seo.robots', 'index, follow'));
})->with(teamsPageLocales());

it('is indexed in every language, with every translation as an alternate', function (): void {
    $entry = app(PageRegistry::class)->find('landing.teams', []);

    expect($entry->renderLocales)->toBe(Locales::codes());
    expect($entry->hreflangCluster())->toBe(Locales::codes());
});

it('takes every price, seat bound, day count and address from the data, never from the copy', function (string $locale): void {
    $text = implode("\n", array_filter(Arr::dot(teamsPageContent($locale)), 'is_string'));

    preg_match_all('/\{([A-Za-z]+)\}/', $text, $slots);

    expect(array_values(array_diff(array_unique($slots[1]), [
        'yearlyPerMonth', 'yearly', 'monthly', 'min', 'deviceLimit', 'exampleSeats', 'exampleYearly', 'merchant', 'refundDays', 'email', 'proExamples',
    ])))->toBe([]);
    expect($text)->not->toMatch('/\$\s?\d|\d\s?(US)?\$|\d\s?€|@tablepro\.app|Polar/u');
})->with(teamsPageLocales());

it('leaves a purchase order or a bank transfer to a conversation with support', function (string $locale): void {
    $buying = teamsPageContent($locale)['buying']['items'];

    expect(collect($buying)->filter(fn(string $item): bool => str_contains($item, '<email>{email}</email>')))->toHaveCount(1);
})->with(teamsPageLocales());
