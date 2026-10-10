<?php

use PHPUnit\Framework\Assert;

$readSource = static fn(string $relative): string => file_get_contents(base_path($relative));

const CHECKOUT_SOURCE = 'resources/js/components/pricing/use-checkout.ts';

/**
 * @return array<string, string>
 */
function attributionPrivacySources(): array
{
    return [
        'resources/data/legal/en/privacy.md' => 'days',
        'resources/data/legal/vi/privacy.md' => 'ngày',
    ];
}

/**
 * @return list<string>
 */
function attributionFields(): array
{
    $source = file_get_contents(base_path('resources/js/lib/attribution.ts'));

    if (preg_match('/export interface Attribution \{(.*?)\n\}/s', $source, $block) !== 1) {
        Assert::fail('resources/js/lib/attribution.ts no longer exports an Attribution interface');
    }

    preg_match_all('/^ {4}(\w+)\??: string;$/m', $block[1], $matches);

    return $matches[1];
}

/**
 * @return list<string>
 */
function documentedAttributionFields(): array
{
    $doc = file_get_contents(base_path('docs/architecture.md'));

    $start = strpos($doc, '## Purchase attribution');
    Assert::assertNotFalse($start, 'docs/architecture.md must document the attribution contract');

    $end = strpos($doc, "\n## ", $start + 1);
    $section = substr($doc, $start, $end === false ? null : $end - $start);

    preg_match_all('/^\| `(\w+)` \| /m', $section, $matches);

    return $matches[1];
}

it('documents exactly the fields it sends, and sends exactly the ones it documents', function (): void {
    $sent = attributionFields();
    $documented = documentedAttributionFields();

    sort($sent);
    sort($documented);

    expect($sent)->not->toBeEmpty();
    expect($sent)->toBe(
        $documented,
        'Every key in the Attribution interface needs a row in the docs/architecture.md table, and vice versa',
    );
});

// Every other field is optional, so without these two a record could arrive carrying nothing.
it('always sends the landing page and the timestamp', function () use ($readSource): void {
    $source = $readSource('resources/js/lib/attribution.ts');

    expect($source)->toContain('landing_page: string;');
    expect($source)->toContain('first_seen_at: string;');
    expect($source)->not->toContain('landing_page?: string;');
    expect($source)->not->toContain('first_seen_at?: string;');
});

it('attaches the attribution to the checkout request', function () use ($readSource): void {
    $checkout = $readSource(CHECKOUT_SOURCE);

    expect($checkout)->toMatch("/import \\{[^}]*\\bcurrentAttribution\\b[^}]*\\} from '@\\/lib\\/attribution';/");
    expect($checkout)->toContain('body.attribution = attribution');

    // An assignment that drifted below the fetch would typecheck, ship, and send nothing.
    $assigned = strpos($checkout, 'body.attribution = attribution');
    $posted = strpos($checkout, "await fetch('/checkout'");

    expect($posted)->not->toBeFalse('Checkout must post to the root path, which nginx routes to the platform');
    expect($assigned)->toBeLessThan($posted, 'The attribution must be attached before the request is sent');
});

// The platform stores the page's language on the order, so the purchase emails arrive in it.
it('sends the page language with the checkout request, and no cookies', function () use ($readSource): void {
    $checkout = $readSource(CHECKOUT_SOURCE);

    expect($checkout)->toContain('const { locale, m } = useI18n();')
        ->toContain('const body: CheckoutBody = { tier, cycle, locale };')
        ->toContain('body: JSON.stringify(body)')
        ->toMatch("/fetch\\('\\/checkout', \\{\\s*method: 'POST',\\s*credentials: 'omit',/");
});

// Nothing else calls captureAttribution(); without it every checkout silently sends an empty source.
it('captures the landing URL at boot', function () use ($readSource): void {
    $app = $readSource('resources/js/app.tsx');

    expect($app)->toContain("import { captureAttribution } from '@/lib/attribution';");
    expect($app)->toContain('captureAttribution();');

    expect(strpos($app, 'captureAttribution();'))->toBeLessThan(
        strpos($app, 'createInertiaApp('),
        'Capture has to happen before Inertia rewrites the address bar, or a campaign tag is read after it is gone',
    );
});

it('counts the intent to buy, which is the only part of a sale this app can see', function () use ($readSource): void {
    $checkout = $readSource(CHECKOUT_SOURCE);

    expect($checkout)->toContain("trackEvent('checkout_started', { tier, cycle });");
    expect(strpos($checkout, "trackEvent('checkout_started'"))->toBeLessThan(
        strpos($checkout, "await fetch('/checkout'"),
        'The intent is counted on the click, before the platform answers',
    );
});

it('tells readers what it stores, under the name it stores it', function () use ($readSource): void {
    $module = $readSource('resources/js/lib/attribution.ts');

    preg_match("/ATTRIBUTION_STORAGE_KEY = '([^']+)'/", $module, $key);
    preg_match('/ATTRIBUTION_TTL_DAYS = (\\d+)/', $module, $ttl);

    expect($key[1] ?? '')->not->toBeEmpty();

    foreach (attributionPrivacySources() as $source => $days) {
        $privacy = $readSource($source);

        // Assert::, because Pest's toContain() would take the message as a second needle.
        Assert::assertStringContainsString(
            $key[1],
            $privacy,
            "{$source} names every key this site writes to browser storage",
        );

        Assert::assertStringContainsString(
            $ttl[1] . ' ' . $days,
            $privacy,
            "{$source} states how long the attribution record is kept",
        );
    }
});
