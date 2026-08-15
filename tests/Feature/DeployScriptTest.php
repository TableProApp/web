<?php

declare(strict_types=1);

/**
 * scripts/deploy.sh decides what work a release needs by matching the changed
 * paths against four patterns. Getting one of those patterns wrong does not
 * fail the deploy — it produces a deploy that reports success while skipping a
 * step, which is how a rewritten root template once reached production and was
 * served to nobody.
 *
 * These tests read the patterns straight out of the script and check them
 * against representative paths, so the classification cannot drift from what
 * the script actually runs.
 */

/**
 * Pulls the extended regular expression the script tests before setting a flag.
 *
 * @param  string  $flag  the shell variable assigned on the following line, e.g. PHP_CHANGED
 */
function deployPattern(string $flag): string
{
    $script = file_get_contents(base_path('scripts/deploy.sh'));

    expect($script)->not->toBeFalse();

    $matched = preg_match(
        "/^if changed '(?P<pattern>.+)'; then\n\s+{$flag}=true$/m",
        (string) $script,
        $matches,
    );

    expect($matched)->toBe(1, "scripts/deploy.sh has no `changed` test setting {$flag}");

    return $matches['pattern'];
}

/**
 * The script pipes the file list through `grep -qE`, so the pattern is an ERE.
 * Every construct used in these four — anchors, alternation, groups, escaped
 * dots, `?` and `$` — means the same thing in PCRE, so matching here matches
 * there.
 */
function deployMatches(string $flag, string $path): bool
{
    return preg_match('#' . deployPattern($flag) . '#', $path) === 1;
}

it('rebuilds the bundles for a component, a stylesheet or a dependency', function (string $path) {
    expect(deployMatches('FRONTEND_CHANGED', $path))->toBeTrue();
})->with([
    'resources/js/pages/Home.tsx',
    'resources/js/components/ui/button.tsx',
    'resources/css/app.css',
    'vite.config.js',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
]);

it('does not rebuild the bundles for prose, data or PHP', function (string $path) {
    expect(deployMatches('FRONTEND_CHANGED', $path))->toBeFalse();
})->with([
    'resources/blog/mcp-database-claude.md',
    'resources/data/databases.json',
    'resources/views/app.blade.php',
    'app/Http/Controllers/LandingController.php',
    'docs/deployment.md',
]);

it('downloads dependencies only when the lock file moves', function () {
    expect(deployMatches('COMPOSER_CHANGED', 'composer.lock'))->toBeTrue();
    expect(deployMatches('COMPOSER_CHANGED', 'composer.json'))->toBeTrue();

    expect(deployMatches('COMPOSER_CHANGED', 'app/Http/Controllers/LandingController.php'))->toBeFalse();
    expect(deployMatches('COMPOSER_CHANGED', 'resources/views/app.blade.php'))->toBeFalse();
});

/*
 * The regression this file exists for. A Blade template compiles to a PHP file
 * named after its path, so editing one leaves the compiled name unchanged and
 * opcache — which this host runs with validate_timestamps=0 — goes on serving
 * the previous compilation until FPM is reloaded.
 */
it('treats a Blade template as PHP, so the caches drop and FPM reloads', function (string $path) {
    expect(deployMatches('PHP_CHANGED', $path))->toBeTrue();
})->with([
    'resources/views/app.blade.php',
    'resources/views/og/blog.blade.php',
    'app/Http/Controllers/LandingController.php',
    'config/inertia.php',
    'routes/web.php',
    'bootstrap/app.php',
    'composer.lock',
]);

it('leaves PHP alone for a page component or a blog post', function (string $path) {
    expect(deployMatches('PHP_CHANGED', $path))->toBeFalse();
})->with([
    'resources/js/pages/Home.tsx',
    'resources/css/app.css',
    'resources/blog/mcp-database-claude.md',
    'package.json',
]);

it('regenerates the sitemap when the pages it enumerates change', function (string $path) {
    expect(deployMatches('CONTENT_CHANGED', $path))->toBeTrue();
})->with([
    'resources/blog/mcp-database-claude.md',
    'resources/data/databases.json',
    'resources/data/comparisons.json',
    'routes/web.php',
]);

it('names an FPM service to reload, because this host does not revalidate', function () {
    $script = (string) file_get_contents(base_path('scripts/deploy.sh'));

    expect($script)->toMatch('/^FPM_SERVICE="\$\{FPM_SERVICE:-php[0-9.]+-fpm\}"$/m');
});

it('verifies the new bundles before it moves them into place', function (string $guard) {
    expect((string) file_get_contents(base_path('scripts/deploy.sh')))->toContain($guard);
})->with([
    'public/build-next/manifest.json',
    '"resources/js/app.tsx"',
    'bootstrap/ssr-next/ssr.js',
]);
