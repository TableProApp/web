<?php

use Illuminate\Support\Facades\File;
use Symfony\Component\Finder\SplFileInfo;

/**
 * @return array{
 *     currency: string,
 *     merchantOfRecord: array{name: string},
 *     cycles: list<string>,
 *     tiers: array{
 *         free: array{price: int|float},
 *         starter: array{unit: string, prices: array<string, int|float>, activations: int},
 *         team: array{unit: string, prices: array<string, int|float>, seats: array{min: int, max: int}, activationsPerSeat: int, prioritySupport: array{responseBusinessDays: int}}
 *     },
 *     refund: array{days: int, scope: string},
 *     license: array{revalidateDays: int, offlineGraceDays: int, perpetualFallback: bool},
 *     campaign: array{id: string, code: string, percent: int, duration: string, tier: string, cycles: list<string>, startsAt: string, endsAt: string, listPriceSince: string}|null,
 *     billingPortalUrl: string,
 *     checkoutSdk: array{polar: string, lemonsqueezy: string},
 *     syncedWith: string
 * }
 */
function pricingJson(): array
{
    static $data = null;

    return $data ??= json_decode(File::get(resource_path('data/pricing.json')), true, 512, JSON_THROW_ON_ERROR);
}

function pricingCents(int|float $amount): int
{
    return (int) round($amount * 100);
}

it('has exactly the documented shape', function (): void {
    $pricing = pricingJson();

    expect(array_keys($pricing))->toBe([
        'currency', 'merchantOfRecord', 'cycles', 'tiers', 'refund', 'license', 'campaign', 'billingPortalUrl', 'checkoutSdk', 'syncedWith',
    ]);
    expect(array_keys($pricing['tiers']))->toBe(['free', 'starter', 'team']);
    expect(array_keys($pricing['tiers']['starter']))->toBe(['unit', 'prices', 'activations']);
    expect(array_keys($pricing['tiers']['team']))->toBe(['unit', 'prices', 'seats', 'activationsPerSeat', 'prioritySupport']);

    // Pro is sold in every cycle; Team is a subscription, with no one-time price.
    expect(array_keys($pricing['tiers']['starter']['prices']))->toBe($pricing['cycles'], 'Pro must price every cycle, in cycle order');
    expect(array_keys($pricing['tiers']['team']['prices']))->toBe(['monthly', 'yearly'], 'Team prices the subscription cycles only, in cycle order');
});

it('bills in US dollars through Polar', function (): void {
    $pricing = pricingJson();

    expect($pricing['currency'])->toBe('USD');
    expect($pricing['merchantOfRecord'])->toBe(['name' => 'Polar']);
    expect($pricing['cycles'])->toBe(['monthly', 'yearly', 'lifetime']);
    expect($pricing['billingPortalUrl'])->toBe('https://polar.sh/tablepro/portal');
    expect($pricing['syncedWith'])->toBeString()->not->toBe('');
});

// Synced by hand with checkout: a failure here is the prompt to confirm the platform's pricing config first.
it('keeps every price unchanged', function (): void {
    $tiers = pricingJson()['tiers'];

    expect($tiers['free'])->toBe(['price' => 0]);

    // Pro (the `starter` code): one license on up to three Macs.
    expect($tiers['starter']['unit'])->toBe('license');
    expect(array_map(pricingCents(...), $tiers['starter']['prices']))->toBe(['monthly' => 499, 'yearly' => 3900, 'lifetime' => 7900]);
    expect($tiers['starter']['activations'])->toBe(3);

    // Team: priced per seat, a seat being one activated Mac, 2 to 200 seats, monthly or yearly only.
    expect($tiers['team']['unit'])->toBe('seat');
    expect(array_map(pricingCents(...), $tiers['team']['prices']))->toBe(['monthly' => 1200, 'yearly' => 12000]);
    expect($tiers['team']['seats'])->toBe(['min' => 2, 'max' => 200]);
    expect($tiers['team']['activationsPerSeat'])->toBe(1);
});

// Synced by hand with the provider's discount (Polar, BLACKFRIDAY2026): its percentage, duration, products and window.
it('pins the dated sale to the provider\'s discount', function (): void {
    expect(pricingJson()['campaign'])->toBe([
        'id' => 'black-friday-2026',
        'code' => 'BLACKFRIDAY2026',
        'percent' => 40,
        'duration' => 'once',
        'tier' => 'starter',
        'cycles' => ['yearly', 'lifetime'],
        'startsAt' => '2026-11-24T00:00:00Z',
        'endsAt' => '2026-12-01T08:00:00Z',
        'listPriceSince' => '2026-11-02',
    ]);
});

it('takes the sale off whole cents, so the site and checkout agree on every price', function (): void {
    $pricing = pricingJson();
    $campaign = $pricing['campaign'];

    foreach ($campaign['cycles'] as $cycle) {
        $cents = pricingCents($pricing['tiers'][$campaign['tier']]['prices'][$cycle]);

        expect(($cents * $campaign['percent']) % 100)->toBe(0, "{$cycle} would leave a fraction of a cent off");
    }
});

it('stores prices as dollar amounts that need no rounding', function (): void {
    foreach (['starter', 'team'] as $tier) {
        foreach (pricingJson()['tiers'][$tier]['prices'] as $cycle => $amount) {
            expect(is_int($amount) || is_float($amount))->toBeTrue("{$tier}.{$cycle} is not a number");
            expect(abs($amount * 100 - pricingCents($amount)))->toBeLessThan(1e-9, "{$tier}.{$cycle} has fractions of a cent");
        }
    }
});

it('makes a yearly plan cheaper than twelve monthly payments, so a computed saving is positive', function (): void {
    foreach (['starter', 'team'] as $tier) {
        $prices = pricingJson()['tiers'][$tier]['prices'];
        $saving = (int) floor((($prices['monthly'] * 12 - $prices['yearly']) / ($prices['monthly'] * 12)) * 100);

        expect($saving)->toBeGreaterThan(0)->toBeLessThan(100);
    }
});

it('pins the refund window, the license timings and Priority support', function (): void {
    $pricing = pricingJson();

    expect($pricing['refund'])->toBe(['days' => 7, 'scope' => 'all-paid-plans']);
    expect($pricing['license'])->toBe(['revalidateDays' => 7, 'offlineGraceDays' => 30, 'perpetualFallback' => false]);
    expect($pricing['tiers']['team']['prioritySupport'])->toBe(['responseBusinessDays' => 1]);
});

// Pinned: the embed is third-party code running on this origin, so a new version is a reviewed change.
it('pins the checkout overlay scripts, one per provider, over HTTPS', function (): void {
    $sdk = pricingJson()['checkoutSdk'];

    expect(array_keys($sdk))->toBe(['polar', 'lemonsqueezy']);
    expect($sdk['polar'])->toBe('https://cdn.jsdelivr.net/npm/@polar-sh/checkout@0.2.0/dist/embed.global.js');
    expect($sdk['lemonsqueezy'])->toBe('https://app.lemonsqueezy.com/js/lemon.js');
});

it('keeps paid features out of the pricing file', function (): void {
    $raw = File::get(resource_path('data/pricing.json'));

    expect($raw)->not->toContain('Compare & Sync')->not->toContain('features');
});

it('never types a price into copy or a UI catalog', function (): void {
    $roots = array_filter([
        resource_path('data/content'),
        resource_path('js/i18n/messages'),
    ], fn(string $path): bool => File::isDirectory($path));

    $offenders = collect($roots)
        ->flatMap(fn(string $root): array => File::allFiles($root))
        ->filter(fn(SplFileInfo $file): bool => preg_match('/(?:\$|US\$|USD)\s?\d|\d\s?(?:US\$|USD)/', $file->getContents()) === 1)
        ->map(fn(SplFileInfo $file): string => $file->getRelativePathname())
        ->values()
        ->all();

    expect($offenders)->toBe([], 'Prices come from pricing.json through formatUsd(); found typed prices in: ' . implode(', ', $offenders));
});
