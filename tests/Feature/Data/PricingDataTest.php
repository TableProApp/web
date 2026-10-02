<?php

use Illuminate\Support\Facades\File;
use Symfony\Component\Finder\SplFileInfo;

/**
 * resources/data/pricing.json: every price, seat rule, refund window and
 * license timing the public site states.
 *
 * The values are synced by hand with what checkout charges (the platform's
 * `config/pricing.php`, in cents there, and the Polar products), so this test
 * pins each one. A change here without the matching change in checkout would
 * advertise a price nobody is charged; the failing assertion is the prompt to
 * confirm the other side first.
 *
 * Owner answers (spec §0): prices unchanged, USD, Polar as merchant of record,
 * a 7-day refund on every paid plan, and Team "Priority support" defined as
 * Team emails answered first, within one business day.
 */

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
 *     billingPortalUrl: string,
 *     syncedWith: string
 * }
 */
function pricingJson(): array
{
    return json_decode(File::get(resource_path('data/pricing.json')), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * A dollar amount as whole cents, the unit checkout's config uses.
 */
function pricingCents(int|float $amount): int
{
    return (int) round($amount * 100);
}

it('has exactly the documented shape', function (): void {
    $pricing = pricingJson();

    expect(array_keys($pricing))->toBe([
        'currency', 'merchantOfRecord', 'cycles', 'tiers', 'refund', 'license', 'billingPortalUrl', 'syncedWith',
    ]);
    expect(array_keys($pricing['tiers']))->toBe(['free', 'starter', 'team']);
    expect(array_keys($pricing['tiers']['starter']))->toBe(['unit', 'prices', 'activations']);
    expect(array_keys($pricing['tiers']['team']))->toBe(['unit', 'prices', 'seats', 'activationsPerSeat', 'prioritySupport']);

    foreach (['starter', 'team'] as $tier) {
        expect(array_keys($pricing['tiers'][$tier]['prices']))->toBe($pricing['cycles'], "{$tier} must price every cycle, in cycle order");
    }
});

it('bills in US dollars through Polar', function (): void {
    $pricing = pricingJson();

    expect($pricing['currency'])->toBe('USD');
    expect($pricing['merchantOfRecord'])->toBe(['name' => 'Polar']);
    expect($pricing['cycles'])->toBe(['monthly', 'yearly', 'lifetime']);
    expect($pricing['billingPortalUrl'])->toBe('https://polar.sh/tablepro/portal');
    expect($pricing['syncedWith'])->toBeString()->not->toBe('');
});

it('keeps every price unchanged', function (): void {
    $tiers = pricingJson()['tiers'];

    expect($tiers['free'])->toBe(['price' => 0]);

    // Starter: one license on up to two Macs.
    expect($tiers['starter']['unit'])->toBe('license');
    expect(array_map(pricingCents(...), $tiers['starter']['prices']))->toBe(['monthly' => 299, 'yearly' => 2400, 'lifetime' => 5900]);
    expect($tiers['starter']['activations'])->toBe(2);

    // Team: priced per seat, a seat being one activated Mac, 5 to 200 seats.
    expect($tiers['team']['unit'])->toBe('seat');
    expect(array_map(pricingCents(...), $tiers['team']['prices']))->toBe(['monthly' => 125, 'yearly' => 1000, 'lifetime' => 2500]);
    expect($tiers['team']['seats'])->toBe(['min' => 5, 'max' => 200]);
    expect($tiers['team']['activationsPerSeat'])->toBe(1);
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
