<?php

use PHPUnit\Framework\Assert;

/**
 * The contract that spans three places nothing can check at once.
 *
 * Where a customer came from is resolved in this repository, sent in the
 * `POST /checkout` body, and stored against a license by the TablePro backend,
 * which is a separate application this suite cannot see. `docs/architecture.md`
 * is the whole of the shared specification, so a field renamed here and not
 * there does not fail anything — it just quietly stops being recorded, and
 * nobody finds out until a quarter of sales have no source.
 *
 * The behaviour of the resolver itself is covered by execution, in
 * `tests/js/attribution.test.ts`. What is left for this file is the wiring:
 * that the field list still matches the document, that the checkout request
 * still carries it, that something still writes it, and that the privacy page
 * still describes what is stored.
 */
$readSource = static fn(string $relative): string => file_get_contents(base_path($relative));

/**
 * The payload keys the module can emit, read off the exported interface.
 *
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
 * The payload keys documented for the backend.
 *
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

/*
 * The two fields the backend can rely on. Everything else is optional by
 * design — a reader who arrived untagged has no source — so if these ever
 * became optional too, a record could arrive carrying nothing at all.
 */
it('always sends the landing page and the timestamp', function () use ($readSource): void {
    $source = $readSource('resources/js/lib/attribution.ts');

    expect($source)->toContain('landing_page: string;');
    expect($source)->toContain('first_seen_at: string;');
    expect($source)->not->toContain('landing_page?: string;');
    expect($source)->not->toContain('first_seen_at?: string;');
});

it('attaches the attribution to the checkout request', function () use ($readSource): void {
    $pricing = $readSource('resources/js/components/landing/pricing.tsx');

    expect($pricing)->toContain("import { currentAttribution } from '@/lib/attribution';");
    expect($pricing)->toContain('body.attribution = attribution');

    /*
     * Position matters more than presence. The body is assembled and then
     * passed to fetch, so an assignment that drifted below the call would
     * typecheck, ship, and send nothing.
     */
    $assigned = strpos($pricing, 'body.attribution = attribution');
    $posted = strpos($pricing, "await fetch('/checkout'");

    expect($assigned)->toBeLessThan($posted, 'The attribution must be attached before the request is sent');
});

/*
 * Nothing else calls captureAttribution(), so without this line the record is
 * never written and every checkout sends an empty source forever. The failure
 * is silent at every other layer: the module still compiles, the request still
 * succeeds, the field is simply always absent.
 */
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
    $pricing = $readSource('resources/js/components/landing/pricing.tsx');

    expect($pricing)->toContain("trackEvent('checkout_started'");
});

it('tells readers what it stores, under the name it stores it', function () use ($readSource): void {
    $module = $readSource('resources/js/lib/attribution.ts');
    $privacy = $readSource('resources/js/pages/Privacy.tsx');

    preg_match("/ATTRIBUTION_STORAGE_KEY = '([^']+)'/", $module, $key);
    preg_match('/ATTRIBUTION_TTL_DAYS = (\d+)/', $module, $ttl);

    expect($key[1] ?? '')->not->toBeEmpty();

    /*
     * Assert:: rather than expect()->toContain(). Pest's toContain() takes
     * `(mixed ...$needles)`, so a message passed to it becomes a second needle
     * and the assertion starts demanding its own failure text appear in the
     * file. See the note in StaleClaimsTest, where that cost a green suite.
     */
    Assert::assertStringContainsString(
        $key[1],
        $privacy,
        'The privacy page names every key this site writes to browser storage',
    );

    Assert::assertStringContainsString(
        $ttl[1] . ' days',
        $privacy,
        'The privacy page states how long the attribution record is kept',
    );
});

/*
 * The claim that was true before this existed and is not any more. The section
 * said "two functional cookies. No tracking, no advertising, no third-party
 * SDKs" while the site now records where a reader came from and sends it with
 * their purchase — a defensible thing to do, and not a defensible thing to
 * leave undisclosed.
 */
it('does not claim the site stores nothing but cookies', function () use ($readSource): void {
    $privacy = $readSource('resources/js/pages/Privacy.tsx');

    expect($privacy)->not->toContain('The marketing site uses two functional cookies.');
});
