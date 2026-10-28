<?php

use PHPUnit\Framework\Assert;

/** @return array<string, string> */
function contractSources(): array
{
    $sources = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(resource_path('js'), FilesystemIterator::SKIP_DOTS));

    foreach ($iterator as $file) {
        if ($file->isFile() && preg_match('/\.tsx?$/', $file->getFilename())) {
            $sources[str_replace(resource_path('js') . '/', '', $file->getPathname())] = (string) file_get_contents($file->getPathname());
        }
    }

    ksort($sources);

    return $sources;
}

it('calls only tablepro-cloud\'s public /v2 endpoints and Cloudflare\'s trace', function (): void {
    $targets = [];

    foreach (contractSources() as $file => $text) {
        preg_match_all("/\\bfetch\\(\\s*(api\\('[^']*'\\)|[^,)]+)/", $text, $calls);

        foreach ($calls[1] as $target) {
            $targets[] = [$file, trim($target)];
        }
    }

    expect($targets)->not->toBeEmpty();

    $allowed = [
        "api('/v2/checkouts')",
        "api('/v2/discounts/preview')",
        "api('/v2/pricing')",
        "api('/v2/newsletter/subscriptions')",
        "api('/v2/newsletter/stats')",
        "'/cdn-cgi/trace'",
    ];

    foreach ($targets as [$file, $target]) {
        Assert::assertContains($target, $allowed, "{$file} fetches {$target}");
    }

    // Each endpoint has one caller, so its contract has one place to change.
    expect(array_count_values(array_column($targets, 1)))->each->toBe(1);

    $api = (string) file_get_contents(resource_path('js/hooks/use-api.ts'));

    expect($api)->toContain('usePage().props.apiOrigin')->toContain('`${origin}${path}`');
});

it('sends the newsletter form as JSON with the page locale and a Turnstile token', function (): void {
    $hook = (string) file_get_contents(resource_path('js/hooks/use-email-form.ts'));
    $turnstile = (string) file_get_contents(resource_path('js/lib/turnstile.ts'));

    expect($hook)->toContain("method: 'POST'")
        ->toContain("headers: { 'Content-Type': 'application/json', Accept: 'application/json' }")
        ->toContain('body: JSON.stringify({ email, locale, turnstile_token: token })')
        ->toContain('emailFormOutcome(res.status, data, m.forms)')
        ->toContain('usePage().props.turnstileSiteKey');

    expect($hook)->toMatch("/fetch\\(api\\('\\/v2\\/newsletter\\/subscriptions'\\), \\{\\s*method: 'POST',\\s*credentials: 'omit',/");

    // tablepro-cloud checks the action, so the widget must name it.
    expect($turnstile)->toContain("TURNSTILE_ACTION = 'newsletter'")->toContain('action: TURNSTILE_ACTION');

    // Both forms send the same hook; neither posts anywhere of its own.
    foreach (['components/site/site-footer.tsx', 'components/blog/newsletter-signup.tsx'] as $file) {
        expect((string) file_get_contents(resource_path("js/{$file}")))->toContain('useEmailForm()')->toContain('ref={form.widget}');
    }
});

// The public site sets no cookies and sends none: a call that carried them would need a privacy-policy review first.
it('sends no cookies with any request it makes', function (): void {
    foreach (contractSources() as $file => $text) {
        if (! preg_match_all('/fetch\(([^;]*?)\{(.*?)\}\s*\)/s', $text, $calls, PREG_SET_ORDER)) {
            continue;
        }

        foreach ($calls as [$call]) {
            if (preg_match("#api\\('/v2/|['\"`]/cdn-cgi/#", $call)) {
                Assert::assertStringContainsString("credentials: 'omit'", $call, "{$file} sends cookies: {$call}");
            }
        }
    }
});

// GA reports stay comparable across a redesign only while these names and parameters stay put.
it('keeps the analytics event names and their parameters', function (): void {
    $names = [];

    foreach (contractSources() as $file => $text) {
        // `trackEvent('name')` carries no parameters; `trackEvent('name', { … })` carries the keys inside the braces.
        preg_match_all("/trackEvent\('([a-z_]+)'(?:, \{([^}]*)\})?\)/", $text, $events, PREG_SET_ORDER | PREG_UNMATCHED_AS_NULL);

        foreach ($events as [, $name, $params]) {
            // `{ tier: tier.key, cycle }`: a key before a colon, or a shorthand property.
            $keys = array_values(array_filter(array_map(
                static fn(string $pair): string => preg_match('/^\s*(\w+)/', $pair, $key) ? $key[1] : '',
                explode(',', $params ?? ''),
            )));

            $names[$name][] = $keys;
        }

        preg_match_all("/trackDownload\('[a-z0-9-]+'(?:, '([a-z]+)')?\)/", $text, $downloads);

        foreach ($downloads[1] as $platform) {
            if ($platform !== '') {
                Assert::assertContains($platform, ['mac', 'ios'], "{$file} reports a download for platform {$platform}");
            }
        }
    }

    $expected = [
        'download_click' => ['location', 'platform'],
        'checkout_started' => ['tier', 'cycle'],
        'newsletter_signup_clicked' => ['source'],
        // The banner cannot be closed, so there is no dismiss event, and it has no version to report.
        'license_banner_view' => [],
        'license_banner_click' => [],
    ];

    foreach ($names as $name => $sets) {
        Assert::assertArrayHasKey($name, $expected, "{$name} is not one of the events GA reports on");

        foreach ($sets as $keys) {
            Assert::assertSame($expected[$name], $keys, "{$name} carries different parameters");
        }
    }

    expect((string) file_get_contents(resource_path('js/lib/analytics.ts')))
        ->toContain("trackEvent('download_click', { location, platform });")
        ->toContain("platform: 'mac' | 'ios' = 'mac'");

    expect((string) file_get_contents(resource_path('js/components/site/site-header.tsx')))->toContain("trackDownload('header', 'mac')");
    expect((string) file_get_contents(resource_path('js/components/site/mobile-nav.tsx')))->toContain("trackDownload('mobile-nav', 'mac')");

    // The database pages count Mac downloads from the same place as their App Store badge.
    expect((string) file_get_contents(resource_path('js/components/databases/engine-header.tsx')))->toContain('trackDownload(`database-${engine.id}`, \'mac\')');
    // Every download band is the shared ActionPair row, which counts both actions from the band's location.
    expect((string) file_get_contents(resource_path('js/components/download/action-pair.tsx')))->toContain("trackDownload(location, 'mac')")->toContain('location={location}');
    expect((string) file_get_contents(resource_path('js/components/databases/download-band.tsx')))->toContain('<ActionPair')->toContain('location={location}');
});

it('keeps the three storage keys both apps read', function (): void {
    $key = static function (string $file, string $constant): ?string {
        preg_match("/{$constant} = '([^']+)'/", (string) file_get_contents(resource_path("js/{$file}")), $match);

        return $match[1] ?? null;
    };

    Assert::assertSame('tablepro:analytics-consent', $key('lib/consent.ts', 'CONSENT_STORAGE_KEY'));
    Assert::assertSame('theme', $key('lib/theme.ts', 'THEME_STORAGE_KEY'));
    Assert::assertSame('tablepro:attribution', $key('lib/attribution.ts', 'ATTRIBUTION_STORAGE_KEY'));

    $blade = (string) file_get_contents(resource_path('views/app.blade.php'));
    $partial = (string) file_get_contents(resource_path('views/partials/head-theme.blade.php'));

    // The banner cannot be closed, so the template reads no record of one.
    expect($blade)->toContain("localStorage.getItem('tablepro:analytics-consent')")
        ->not->toContain('banner-dismissed');
    expect($partial)->toContain("localStorage.getItem('theme')");
});

it('keeps the consent calls in the head in their contract order', function (): void {
    $blade = (string) file_get_contents(resource_path('views/app.blade.php'));

    $default = strpos($blade, "gtag('consent', 'default'");
    $stored = strpos($blade, "localStorage.getItem('tablepro:analytics-consent') === 'granted'");
    $configured = strpos($blade, "gtag('config'");

    Assert::assertNotFalse($default);
    Assert::assertNotFalse($stored);
    Assert::assertNotFalse($configured);
    Assert::assertTrue($default < $stored && $stored < $configured, 'consent default, then the stored answer, then config');
});

it('links the account without a locale prefix, carrying the language in the query', function (): void {
    $links = (string) file_get_contents(resource_path('js/components/site/site-links.ts'));

    expect($links)->toContain('return `/account?locale=${locale}`;');

    // Cross-app links are plain anchors, never client-side visits.
    foreach (['site-header.tsx', 'site-footer.tsx', 'mobile-nav.tsx'] as $file) {
        $source = (string) file_get_contents(resource_path("js/components/site/{$file}"));

        expect($source)->not->toMatch('/<LocaleLink[^>]*accountHref/');
        expect($source)->toContain('accountHref(locale)');
    }
});
