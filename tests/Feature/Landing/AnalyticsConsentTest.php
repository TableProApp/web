<?php

use PHPUnit\Framework\Assert;

/**
 * Google Analytics, and the consent it waits for.
 *
 * Plausible set no cookies, so it could load unconditionally and the privacy
 * page could call it cookie-less. GA4 sets `_ga` and `_ga_<stream>`, which need
 * permission first, so the tag loads in Consent Mode and the order of four
 * calls in the document head is what keeps it lawful. None of that is visible
 * to a typecheck, and a mistake in it is invisible in the browser too: a
 * `config` that runs before `consent default` sets cookies for every visitor
 * and every page still looks exactly the same.
 *
 * The consent module's behaviour is covered by execution in
 * `tests/js/consent.test.ts`. This file holds the wiring around it.
 */
$readSource = static fn(string $relative): string => file_get_contents(base_path($relative));

it('loads the tag with the configured measurement id', function (): void {
    config(['analytics.google.measurement_id' => 'G-TEST123']);

    $html = $this->get('/')->assertOk()->getContent();

    expect($html)->toContain('https://www.googletagmanager.com/gtag/js?id=G-TEST123');
    expect($html)->toContain("gtag('config', \"G-TEST123\")");
});

it('renders no tag when no measurement id is configured', function (): void {
    config(['analytics.google.measurement_id' => null]);

    $html = $this->get('/')->assertOk()->getContent();

    expect($html)->not->toContain('googletagmanager.com');
    expect($html)->not->toContain('gtag(');
});

/*
 * Position, not presence. Each call in the head only means what it should if
 * it runs before the next: storage denied, then a returning reader's stored
 * answer applied, then the tag configured — at which point it sends the first
 * page view with whatever consent state it has been given.
 */
it('denies storage before the tag is configured, and applies a stored answer in between', function (): void {
    config(['analytics.google.measurement_id' => 'G-TEST123']);

    $html = $this->get('/')->assertOk()->getContent();

    $default = strpos($html, "gtag('consent', 'default'");
    $stored = strpos($html, "gtag('consent', 'update', { analytics_storage: 'granted' })");
    $configured = strpos($html, "gtag('config'");

    Assert::assertNotFalse($default, 'The tag must declare a consent default');
    Assert::assertNotFalse($stored, 'A returning reader who allowed analytics must be granted before the first hit');
    Assert::assertLessThan($stored, $default, 'The default must come before the stored answer');
    Assert::assertLessThan($configured, $stored, 'The stored answer must be applied before the tag is configured');

    $defaults = substr($html, $default, $stored - $default);

    foreach (['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'] as $signal) {
        Assert::assertStringContainsString("{$signal}: 'denied'", $defaults, "{$signal} must default to denied");
    }
});

it('never grants an advertising signal', function () use ($readSource): void {
    $sources = $readSource('resources/views/app.blade.php') . $readSource('resources/js/lib/consent.ts');

    foreach (['ad_storage', 'ad_user_data', 'ad_personalization'] as $signal) {
        expect($sources)->not->toMatch("/{$signal}:\\s*'granted'/");
    }
});

/*
 * The head script and the module read the same key, written in two languages.
 * Renamed on one side only, a reader who allowed analytics is asked again on
 * every load and counted as a stranger in between. The account portal reads
 * it too — see docs/architecture.md.
 */
it('reads the answer under the key the consent module writes', function () use ($readSource): void {
    preg_match("/CONSENT_STORAGE_KEY = '([^']+)'/", $readSource('resources/js/lib/consent.ts'), $key);

    Assert::assertSame('tablepro:analytics-consent', $key[1] ?? null);
    Assert::assertStringContainsString(
        "localStorage.getItem('{$key[1]}')",
        $readSource('resources/views/app.blade.php'),
        'app.blade.php must read the key consent.ts writes',
    );
});

/*
 * `analytics.ts` is held to calls rather than words: its docblock names
 * Plausible on purpose, to say where the event names came from.
 */
it('leaves nothing of Plausible behind', function () use ($readSource): void {
    foreach ([
        'resources/views/app.blade.php',
        'config/analytics.php',
        '.env.example',
        'resources/js/pages/Privacy.tsx',
    ] as $file) {
        expect(stripos($readSource($file), 'plausible'))->toBeFalse();
    }

    expect($readSource('resources/js/lib/analytics.ts'))->not->toMatch('/plausible\s*\(|\.plausible\b/');
});

it('asks on every page and lets the reader change their answer from any of them', function () use ($readSource): void {
    $layout = $readSource('resources/js/layouts/landing-layout.tsx');
    $footer = $readSource('resources/js/components/landing/footer.tsx');

    expect($layout)->toContain('<ConsentBar />');
    expect($footer)->toContain("{ label: 'Cookie settings', action: openConsentSettings }");
});

/*
 * Declining has to be as easy as allowing. The two buttons are the same
 * variant at the same size; a filled Allow beside an outlined Decline is the
 * nudge that makes consent not freely given.
 */
it('weighs Allow and Decline the same', function () use ($readSource): void {
    $bar = $readSource('resources/js/components/landing/consent-bar.tsx');

    preg_match_all('/<Button\s+(.*?)>\s*(Allow|Decline)\s*<\/Button>/s', $bar, $buttons, PREG_SET_ORDER);

    expect($buttons)->toHaveCount(2);

    $props = array_map(fn(array $match): string => str_replace(["'granted'", "'denied'"], '', $match[1]), $buttons);

    Assert::assertSame($props[0], $props[1], 'Allow and Decline must be styled identically');
});

/*
 * The bar's buttons were the first secondary `Button`s to render as `<button>`
 * rather than `<a>`, and they showed an arrow cursor and no hover: Tailwind v4
 * leaves buttons on the default cursor, and the variant had no hover because
 * a link's pointer had always stood in for one.
 */
it('makes the Allow and Decline buttons look clickable', function () use ($readSource): void {
    $button = $readSource('resources/js/components/ui/button.tsx');

    preg_match("/secondary: '([^']+)'/", $button, $secondary);

    expect($button)->toMatch("/'inline-flex cursor-pointer /");
    expect($secondary[1] ?? '')->toContain('hover:');
});

it('tells readers which cookies analytics sets and how to take consent back', function () use ($readSource): void {
    $privacy = $readSource('resources/js/pages/Privacy.tsx');

    foreach (['_ga</strong>', '_ga_&lt;ID&gt;', 'tablepro:analytics-consent', 'Google Analytics', 'Lawful basis: consent', 'onClick={openConsentSettings}'] as $needle) {
        Assert::assertStringContainsString($needle, $privacy, "The privacy page must mention {$needle}");
    }

    expect($privacy)->not->toContain('cookie-less');
    expect($privacy)->toContain('id="cookies"');
});
