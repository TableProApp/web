<?php

use PHPUnit\Framework\Assert;

/**
 * The contracts between this site and the platform app on the same origin,
 * and the analytics they share (architecture §1.14).
 *
 * nginx routes `/checkout`, `/discount/preview`, `/newsletter/*` and `/account`
 * to the platform by their unprefixed paths, so a request to `/vi/checkout`
 * would never reach it. Both apps read the same `localStorage` keys. And GA
 * reports are only comparable across a redesign if the event names and their
 * parameters stay put. None of this is visible to a typecheck.
 */

/** Every TypeScript source under resources/js, keyed by its path from there. @return array<string, string> */
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

it('posts only to the platform\'s unprefixed endpoints', function (): void {
    $targets = [];

    foreach (contractSources() as $file => $text) {
        preg_match_all('/\bfetch\(\s*([^,)]+)/', $text, $calls);

        foreach ($calls[1] as $target) {
            $targets[] = [$file, trim($target)];
        }
    }

    expect($targets)->not->toBeEmpty();

    foreach ($targets as [$file, $target]) {
        // A literal root path from the allowlist, or the email hook's `endpoint` parameter (checked below).
        Assert::assertContains($target, ["'/checkout'", "'/discount/preview'", 'endpoint'], "{$file} fetches {$target}");
    }

    foreach (contractSources() as $file => $text) {
        preg_match_all('/useEmailForm\(([^)]*)\)/', $text, $uses);

        foreach ($uses[1] as $argument) {
            if ($file === 'hooks/use-email-form.ts') {
                continue;
            }

            Assert::assertSame("'/newsletter/subscribe'", trim($argument), "{$file} sends the newsletter form somewhere else");
        }
    }
});

it('never calls the subscriber count, whose session cookie would land on public pages', function (): void {
    foreach (contractSources() as $file => $text) {
        Assert::assertStringNotContainsString('/api/newsletter/stats', preg_replace('#^\s*(\*|//).*$#m', '', $text), "{$file} calls /api/newsletter/stats");
    }
});

it('sends the newsletter form as JSON with the page locale', function (): void {
    $hook = (string) file_get_contents(resource_path('js/hooks/use-email-form.ts'));
    $outcome = (string) file_get_contents(resource_path('js/hooks/email-form-response.ts'));

    expect($hook)->toContain("method: 'POST'")
        ->toContain("headers: { 'Content-Type': 'application/json', Accept: 'application/json' }")
        ->toContain('body: JSON.stringify({ email, locale })')
        ->toContain('emailFormOutcome(res.status, data, m.forms)');

    /*
     * The platform's subscribe route is in its `web` group, so its answer sets
     * `tablepro-session` and `XSRF-TOKEN`. A same-origin fetch would keep both
     * on public pages (docs/architecture.md); `omit` neither sends nor stores
     * cookies.
     */
    expect($hook)->toMatch("/fetch\\(endpoint, \\{\\s*method: 'POST',\\s*credentials: 'omit',/");

    // The platform's 429 text is shared with the license API and stays English, so the page uses its own.
    expect($outcome)->toMatch('/status === 429\) \{\s*return \{ kind: \'flash\', flash: \{ type: \'error\', message: strings\.tooMany \}/');
});

/*
 * The public site sets no cookies (docs/architecture.md), and every
 * platform endpoint it calls answers from the platform's `web` group, which
 * sets `tablepro-session` and `XSRF-TOKEN`. Only `credentials: 'omit'` keeps
 * those off public pages.
 */
it('sends no cookies with any request to the platform', function (): void {
    foreach (contractSources() as $file => $text) {
        if (! preg_match_all('/fetch\(([^;]*?)\{(.*?)\}\s*\)/s', $text, $calls, PREG_SET_ORDER)) {
            continue;
        }

        foreach ($calls as [$call]) {
            if (preg_match("#['\"`](/checkout|/discount/preview|/newsletter/)#", $call) || str_contains($call, 'endpoint')) {
                Assert::assertStringContainsString("credentials: 'omit'", $call, "{$file} calls the platform with cookies: {$call}");
            }
        }
    }
});

it('keeps the analytics event names and their parameters', function (): void {
    $names = [];

    foreach (contractSources() as $file => $text) {
        preg_match_all("/trackEvent\('([a-z_]+)', \{([^}]*)\}/", $text, $events, PREG_SET_ORDER);

        foreach ($events as [, $name, $params]) {
            // `{ tier: tier.key, cycle }`: a key before a colon, or a shorthand property.
            $keys = array_values(array_filter(array_map(
                static fn(string $pair): string => preg_match('/^\s*(\w+)/', $pair, $key) ? $key[1] : '',
                explode(',', $params),
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
        'license_banner_view' => ['version'],
        'license_banner_click' => ['version'],
        'license_banner_dismiss' => ['version', 'reason'],
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

    // The site chrome reports where a download started.
    expect((string) file_get_contents(resource_path('js/components/site/site-header.tsx')))->toContain("trackDownload('header', 'mac')");
    expect((string) file_get_contents(resource_path('js/components/site/mobile-nav.tsx')))->toContain("trackDownload('mobile-nav', 'mac')");

    // The database pages count Mac downloads from the same place as their App Store badge.
    expect((string) file_get_contents(resource_path('js/components/databases/engine-header.tsx')))->toContain('trackDownload(`database-${engine.id}`, \'mac\')');
    // Every download band is the shared ActionPair row, which counts both actions from the band's location.
    expect((string) file_get_contents(resource_path('js/components/download/action-pair.tsx')))->toContain("trackDownload(location, 'mac')")->toContain('location={location}');
    expect((string) file_get_contents(resource_path('js/components/databases/download-band.tsx')))->toContain('<ActionPair')->toContain('location={location}');
});

it('keeps the four storage keys both apps read', function (): void {
    $key = static function (string $file, string $constant): ?string {
        preg_match("/{$constant} = '([^']+)'/", (string) file_get_contents(resource_path("js/{$file}")), $match);

        return $match[1] ?? null;
    };

    Assert::assertSame('tablepro:analytics-consent', $key('lib/consent.ts', 'CONSENT_STORAGE_KEY'));
    Assert::assertSame('theme', $key('lib/theme.ts', 'THEME_STORAGE_KEY'));
    Assert::assertSame('tablepro:attribution', $key('lib/attribution.ts', 'ATTRIBUTION_STORAGE_KEY'));
    Assert::assertSame('tablepro:banner-dismissed', $key('lib/banner.ts', 'BANNER_STORAGE_KEY'));

    $blade = (string) file_get_contents(resource_path('views/app.blade.php'));
    $partial = (string) file_get_contents(resource_path('views/partials/head-theme.blade.php'));

    expect($blade)->toContain("localStorage.getItem('tablepro:analytics-consent')")
        ->toContain("localStorage.getItem('tablepro:banner-dismissed')");
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
