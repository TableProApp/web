<?php

use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/**
 * The iPhone and iPad page, and the removal of the TestFlight beta it replaced.
 *
 * TablePro for iOS shipped on the App Store on 2026-09-22. Until that morning
 * this site offered an email form that posted to `/beta/signup` in exchange for
 * a TestFlight invite, described the app as a beta in three places, and told
 * readers it ran "Seven engines on device" — a figure that stopped being true
 * on 2026-08-08 when Oracle shipped and the connection form reached ten.
 *
 * Most of what follows is therefore a guard against copy coming back, not a
 * test of behaviour. That is the failure mode this repository actually has: it
 * has no database and almost no logic, so nearly every bug it can ship is a
 * sentence that is no longer true.
 */
beforeEach(function (): void {
    withoutVite();
});

it('serves the iOS page with the props the shared header needs', function (): void {
    get(route('landing.ios'))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Ios')
                // header.tsx declares downloadUrls as required and its docblock
                // says "Do not remove". A page that omits it renders a header
                // whose download button points nowhere.
                ->has('downloadUrls.arm64')
                ->has('downloadUrls.x86_64')
                ->has('githubStars'),
        );
});

it('does not collide with the database-client or compare slug lists', function (): void {
    /*
     * `/{slug}` is a catch-all constrained to 26 database slugs. Adding `ios`
     * to that alternation would render a blank DatabaseClient page rather than
     * this one, and `StaleClaimsTest` pins the compare list to comparisons.json
     * exactly. Neither list may learn about `ios`.
     */
    $routes = file_get_contents(base_path('routes/web.php'));

    preg_match("/->where\('slug', '([^']*mysql-client[^']*)'\)/", $routes, $databases);
    preg_match("/->where\('slug', '([^']*tableplus[^']*)'\)/", $routes, $comparisons);

    expect(explode('|', $databases[1] ?? ''))->not->toContain('ios');
    expect(explode('|', $comparisons[1] ?? ''))->not->toContain('ios');
});

it('points every iOS entry point at the App Store rather than at a signup', function (): void {
    $frontend = [
        'resources/js/pages/Ios.tsx',
        'resources/js/components/landing/app-store-badge.tsx',
        'resources/js/components/landing/footer-cta.tsx',
        'resources/js/components/landing/header.tsx',
        'resources/js/components/landing/mobile-nav.tsx',
    ];

    foreach ($frontend as $source) {
        /*
         * Comments stripped first. `footer-cta.tsx` carries a docblock
         * recording what the beta form was and why it went, which is exactly
         * the kind of note this repository wants kept — and a bare needle
         * matches the explanation as readily as the offence.
         *
         * `(?<!:)` on the line-comment pattern is load-bearing: plain `#//.*$#m`
         * also matches the `//` inside `https://`, which truncates every URL in
         * the file and quietly makes the scan vacuous. FundingModelTest
         * documents that exact bug making one of its assertions un-failable.
         */
        $contents = preg_replace(
            ['#/\*[\s\S]*?\*/#', '#(?<!:)//.*$#m'],
            '',
            file_get_contents(base_path($source)),
        );

        /*
         * `Assert::assertStringNotContainsString`, never
         * `expect()->not->toContain($needle, $message)`. Pest's toContain is
         * variadic with no message parameter, so a message passed there becomes
         * a second needle and `not` passes as soon as either is absent — which
         * is how two blocks in StaleClaimsTest stayed green for their whole
         * lives.
         */
        foreach (['TestFlight', '/beta/signup', 'Join Beta'] as $needle) {
            Assert::assertStringNotContainsString(
                $needle,
                $contents,
                "{$source} still carries \"{$needle}\"; the beta ended when the app shipped",
            );
        }
    }
});

it('keeps the App Store URL in the constants file', function (): void {
    expect(file_get_contents(base_path('resources/js/data/links.ts')))
        ->toContain('APP_STORE_URL')
        ->toContain('apps.apple.com/app/tablepro/id6761621829');

    /*
     * No country segment. `/us/app/...` pins every reader to the US storefront
     * and shows a "not available in your country" interstitial to anyone signed
     * in elsewhere; the listing ships in five languages.
     */
    expect(file_get_contents(base_path('resources/js/data/links.ts')))
        ->not->toContain('apps.apple.com/us/');
});

it('ships Apple\'s badge artwork unmodified, in both themes', function (): void {
    /*
     * `-light` means "shown while the OS is in light mode", which is Apple's
     * BLACK badge. Anyone checking by grepping the fills inside the two files
     * will read this backwards: the light-mode file is the one full of white
     * fills, because its artwork sits on a black field.
     */
    foreach (['light', 'dark'] as $theme) {
        $path = public_path("images/app-store-{$theme}.svg");

        expect($path)->toBeReadableFile();

        $svg = file_get_contents($path);

        // Apple's supplied artwork, at its native size. A changed viewBox means
        // someone has redrawn or cropped a trademarked badge.
        expect($svg)->toContain('viewBox="0 0 119.66407 40"');
        expect($svg)->toContain('Download_on_the_App_Store_Badge');
    }
});

it('emits one iOS application node, with no rating and no second FAQ entity', function (): void {
    $html = ssrHtml('/ios');

    // Its own @id. The homepage's `#app` is the Mac app, whose downloadUrl is a
    // DMG page — one node cannot stand for two apps on two release cadences.
    expect(substr_count($html, '"@id":"https://localhost/#ios-app"'))->toBe(1);
    expect(substr_count($html, '"SoftwareApplication"'))->toBe(1);

    // /faq owns the only FAQPage on the domain.
    expect($html)->not->toContain('"FAQPage"');

    // The listing had no ratings and no reviews on launch day.
    foreach (['aggregateRating', 'ratingValue'] as $needle) {
        Assert::assertStringNotContainsString($needle, $html, "/ios published a rating nobody gave");
    }
});

it('states the engines it offers by name rather than by count', function (): void {
    $html = ssrHtml('/ios');

    /*
     * Scoped to the engines grid, and compared with toBe.
     *
     * The obvious form of this test — `expect($html)->toContain('Oracle')` for
     * each of the ten — is almost entirely inert, and was, until a mutation
     * test caught it. The site footer renders a link for all 26
     * `/{db}-client` slugs on EVERY page, so eight of the ten names are in the
     * document whatever the page says; deleting Oracle from `ENGINES` left the
     * grid at nine cells under a headline reading "Ten to choose from on the
     * phone" and this file stayed green. Only TiDB and OceanBase, which have no
     * database page of their own, ever failed it.
     *
     * An exact list over the grid's own cells catches a deletion, a rename, a
     * reorder, and an eleventh entry — and it is the grid, not the prose, that
     * a reader counts.
     */
    $start = strpos($html, 'id="engines"');
    expect($start)->not->toBeFalse('The engines section is missing from /ios');

    $end = strpos($html, 'id="what-it-does"', $start);
    $section = substr($html, $start, $end - $start);

    preg_match_all('#<span class="text-sm font-medium text-foreground">([^<]+)</span>#', $section, $cells);

    expect($cells[1])->toBe(
        ['MySQL', 'MariaDB', 'TiDB', 'OceanBase', 'PostgreSQL', 'SQLite', 'DuckDB', 'Redis', 'SQL Server', 'Oracle'],
        'The grid must hold exactly the ten entries of mobileSupportedTypes, in picker order',
    );

    Assert::assertStringNotContainsString(
        'Seven engines',
        $html,
        'The iOS picker offers ten engines; seven was the driver-class count',
    );
});

it('does not reuse the Mac sentences that are wrong on the phone', function (): void {
    $source = file_get_contents(base_path('resources/js/pages/Ios.tsx'));

    /*
     * Claims that are true of the Mac and false here, all verified against the
     * app repository:
     *
     *   - Safe Mode has six levels on the Mac and three on the phone.
     *   - visionOS appears nowhere in the app project. TARGETED_DEVICE_FAMILY
     *     is "1,2" — iPhone and iPad. The App Store lists Vision Pro because a
     *     compatible iPad app runs there, which is not a claim this site makes.
     */
    foreach (['six-level', 'Six-level', 'visionOS', 'Vision Pro'] as $needle) {
        Assert::assertStringNotContainsString(
            $needle,
            $source,
            "Ios.tsx claims \"{$needle}\", which is not true of the iOS app",
        );
    }

    /*
     * Jump hosts are the opposite case and must be *mentioned*: the iOS tunnel
     * factory refuses one before it dials, so a reader who has a jump host on
     * the Mac needs to be told rather than left to discover it. Asserting the
     * absence of the phrase would have banned the honest sentence.
     */
    expect($source)->toContain('No jump hosts');
    expect($source)->toContain('Confirm Writes');
});

it('keeps the homepage anchor the header and mobile nav used to target', function (): void {
    /*
     * The source-file half runs FIRST, deliberately.
     *
     * `ssrHtml()` skips the whole test on a machine with no SSR bundle, and
     * anything placed after it skips too — including these two assertions,
     * which read nothing but `.tsx` files and have no reason to need a
     * rendered page. Put them below the render call and they only ever
     * execute in the one CI job that builds a bundle.
     */
    foreach (['header.tsx', 'mobile-nav.tsx'] as $file) {
        $source = file_get_contents(base_path("resources/js/components/landing/{$file}"));

        Assert::assertStringNotContainsString(
            '"/#mobile"',
            $source,
            "{$file} still routes the iPhone link to the homepage anchor instead of /ios",
        );
    }

    /*
     * `id="mobile"` still renders on the homepage, after `id="pricing"`. Three
     * assertions elsewhere depend on it (HomepageRenderTest:30, :65 and
     * LandingStructureTest:178) and the iPhone cell in the closing call to
     * action is what carries it. The nav links moved to /ios; the anchor did
     * not move with them.
     */
    $html = ssrHtml('/');

    expect($html)->toContain('id="mobile"');
    expect(strpos($html, 'id="pricing"'))->toBeLessThan(strpos($html, 'id="mobile"'));
});
