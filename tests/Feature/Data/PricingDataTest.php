<?php

use Illuminate\Support\Facades\File;

function pricingJson(): array
{
    static $data = null;

    return $data ??= json_decode(File::get(resource_path('data/pricing.json')), true, 512, JSON_THROW_ON_ERROR);
}

function paidFeaturesJson(): array
{
    static $features = null;

    return $features ??= json_decode(File::get(resource_path('data/paid-features.json')), true, 512, JSON_THROW_ON_ERROR);
}

function pricingMacRelease(): string
{
    $platforms = json_decode(File::get(resource_path('data/platforms.json')), true, 512, JSON_THROW_ON_ERROR)['platforms'];

    return collect($platforms)->firstWhere('id', 'mac')['release']['version'];
}

function pricingCents(int|float $amount): int
{
    return (int) round($amount * 100);
}

describe('pricing.json', function (): void {
    it('has the sections the pages and checkout read', function (): void {
        $pricing = pricingJson();

        expect($pricing)->toHaveKeys(['currency', 'merchantOfRecord', 'cycles', 'tiers', 'refund', 'license', 'campaign', 'billingPortalUrl', 'checkoutSdk'])
            ->and($pricing['currency'])->toBe('USD')
            ->and($pricing['tiers'])->toHaveKeys(['free', 'starter', 'team'])
            ->and($pricing['tiers']['team']['seats']['min'])->toBeInt()->toBeGreaterThan(0)
            ->and($pricing['refund']['days'])->toBeInt()->toBeGreaterThan(0)
            ->and($pricing['billingPortalUrl'])->toStartWith('https://');
    });

    it('prices Pro in every cycle and Team in subscription cycles only', function (): void {
        $pricing = pricingJson();

        expect(array_keys($pricing['tiers']['starter']['prices']))->toBe($pricing['cycles'])
            ->and(array_keys($pricing['tiers']['team']['prices']))->toBe(['monthly', 'yearly']);
    });

    it('stores every price in whole cents, with a yearly plan cheaper than twelve months', function (string $tier): void {
        $prices = pricingJson()['tiers'][$tier]['prices'];

        foreach ($prices as $cycle => $amount) {
            expect(abs($amount * 100 - pricingCents($amount)))->toBeLessThan(1e-9, "{$tier}.{$cycle} has a fraction of a cent");
        }

        expect($prices['yearly'])->toBeLessThan($prices['monthly'] * 12);
    })->with(['starter', 'team']);

    it('runs a dated sale that checkout can charge to the cent', function (): void {
        $pricing = pricingJson();
        $campaign = $pricing['campaign'];

        if ($campaign === null) {
            expect($campaign)->toBeNull();

            return;
        }

        expect($campaign)->toHaveKeys(['id', 'code', 'percent', 'tier', 'cycles', 'startsAt', 'endsAt'])
            ->and($campaign['startsAt'] < $campaign['endsAt'])->toBeTrue();

        foreach ($campaign['cycles'] as $cycle) {
            $cents = pricingCents($pricing['tiers'][$campaign['tier']]['prices'][$cycle]);

            expect(($cents * $campaign['percent']) % 100)->toBe(0, "{$cycle} would leave a fraction of a cent off");
        }
    });

    it('pins the checkout script to an exact version over HTTPS', function (): void {
        expect(pricingJson()['checkoutSdk'])->toMatch('#^https://.+@\d+\.\d+\.\d+/[^@]+$#');
    });
});

describe('paid-features.json', function (): void {
    it('gives every feature the fields the pages read', function (): void {
        $ids = array_column(paidFeaturesJson(), 'id');

        expect($ids)->toBe(array_values(array_unique($ids)));

        foreach (paidFeaturesJson() as $feature) {
            expect($feature)->toHaveKeys(['id', 'proFeature', 'name', 'tier', 'platforms', 'sinceAppVersion', 'lapse', 'highlight', 'page'])
                ->and($feature['tier'])->toBeIn(array_keys(pricingJson()['tiers']))
                ->and($feature['highlight'])->toBeBool()
                ->and(version_compare($feature['sinceAppVersion'], pricingMacRelease(), '<='))->toBeTrue("{$feature['id']} is newer than the current release");

            foreach ($feature['lapse'] as $kind) {
                expect($kind)->toBeIn(['overlay', 'alert', 'hidden', 'disabled', 'silent']);
            }
        }
    });

    it('links every feature to a section of a feature page, and describes it', function (): void {
        $details = json_decode(File::get(resource_path('data/content/en/paid-features.json')), true, 512, JSON_THROW_ON_ERROR);

        foreach (paidFeaturesJson() as $feature) {
            $file = resource_path('data/content/en/features/' . basename($feature['page']['path']) . '.json');

            expect($file)->toBeFile()
                ->and(File::get($file))->toContain('"' . $feature['page']['anchor'] . '"')
                ->and(data_get($details, "{$feature['id']}.detail"))->toBeString()->not->toBeEmpty();
        }
    });
});
