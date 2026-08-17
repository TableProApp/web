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

it('ignores every directory it leaves in the working tree', function (): void {
    /*
     * The script refuses to deploy when `git status --porcelain` reports
     * anything, which is right: a dirty tree means someone edited files on the
     * server, and merging over that silently is how those edits vanish.
     *
     * But the script also builds into `*-next` and keeps the bundles it
     * replaced at `*-old`, so a successful deploy ends with two untracked
     * directories in the tree it just checked. Unignored, the first deploy
     * created them and every deploy after it refused to run — which is exactly
     * what happened after the CD workflow landed.
     */
    $script = file_get_contents(base_path('scripts/deploy.sh'));
    $ignored = file_get_contents(base_path('.gitignore'));

    preg_match_all('#\b((?:public|bootstrap)/[a-z]+-(?:old|next))\b#', $script, $matches);

    $created = array_unique($matches[1]);

    expect($created)->not->toBeEmpty('Expected the script to name its scratch directories');

    // `Assert::` because Pest's toContain() is `(mixed ...$needles)` and would
    // read the message as a second needle, failing for the wrong reason.
    foreach ($created as $path) {
        PHPUnit\Framework\Assert::assertStringContainsString(
            "/{$path}",
            $ignored,
            "deploy.sh leaves {$path} in the working tree, but .gitignore does not cover it",
        );
    }
});

it('lets its own scratch directories past the cleanliness check, and nothing else', function (string $line, bool $blocks): void {
    /*
     * The filter runs before the pull, so a server already holding the
     * artifacts can reach the commit that ignores them. Exercised against the
     * real expression rather than a copy, so the two cannot drift.
     */
    $script = file_get_contents(base_path('scripts/deploy.sh'));

    preg_match("#git status --porcelain \| grep -vE '([^']+)'#", $script, $m);
    expect($m[1] ?? null)->not->toBeNull('The cleanliness filter is missing from deploy.sh');

    $survives = preg_match('#' . str_replace('#', '\#', $m[1]) . '#', $line) !== 1;

    expect($survives)->toBe($blocks, $blocks
        ? "\"{$line}\" should block a deploy"
        : "\"{$line}\" is this script's own artifact and should not block a deploy");
})->with([
    'keeps the previous SSR bundle' => ['?? bootstrap/ssr-old/', false],
    'keeps the previous asset build' => ['?? public/build-old/', false],
    'keeps a half-finished SSR build' => ['?? bootstrap/ssr-next/', false],
    'keeps a half-finished asset build' => ['?? public/build-next/', false],
    'blocks an edited controller' => [' M app/Http/Controllers/Landing/LandingController.php', true],
    'blocks an edited component' => [' M resources/js/pages/Home.tsx', true],
    'blocks a stray untracked file' => ['?? .env.backup', true],
    'blocks an untracked build directory that is not one of ours' => ['?? public/uploads-old/', true],
]);

it('explains a diverged branch instead of dumping git hints', function (): void {
    /*
     * `git pull --ff-only` is the right call — a deploy must never merge or
     * rebase on its own — but on a force-pushed branch it fails with a wall of
     * git advice ending in "aborting", which reads as a broken script rather
     * than as a checkout one command from fine. That cost a round trip the
     * first time it happened.
     */
    $script = file_get_contents(base_path('scripts/deploy.sh'));

    expect($script)->toContain('git merge-base --is-ancestor HEAD');

    // And it has to name the recovery, not just the diagnosis.
    expect($script)->toContain('git reset --hard origin/');

    /*
     * The check has to come before the pull, or the raw git failure wins the
     * race. Compared on the executable lines only — the comment above the check
     * names `git pull --ff-only` too, and matching that instead put the guard
     * "after" the pull it precedes by twelve lines.
     */
    $code = preg_replace('/^\s*#.*$/m', '', $script);

    expect(strpos($code, 'git merge-base --is-ancestor HEAD'))
        ->toBeLessThan(strpos($code, 'git pull --ff-only'));
});

it('does not trust the commit alone to mean the bundles are current', function (): void {
    /*
     * `public/build` and `bootstrap/ssr` are gitignored, so a `git reset --hard`
     * — which the runbook prescribes after a force-push — moves the sources and
     * leaves the built output untouched. The next deploy then sees an unchanged
     * commit, skips the build, reports success, and leaves the site serving the
     * previous release.
     *
     * That is not hypothetical: a deploy went green while the live homepage was
     * still the pre-rewrite page, and the smoke test passed because a stale
     * bundle renders a perfectly valid old site.
     */
    $script = file_get_contents(base_path('scripts/deploy.sh'));

    expect($script)->toContain('bundles_are_stale');

    // The skip branch must consult it, not just define it.
    expect($script)->toMatch('/PREV_COMMIT.+CURR_COMMIT.+FORCE.+bundles_are_stale/s');

    // And it has to look at both halves of the build, not only the assets.
    expect($script)
        ->toContain('public/build/manifest.json')
        ->toContain('bootstrap/ssr/ssr.js');
});

it('proves the smoke test hit this release and not merely a live one', function (): void {
    /*
     * An `<h1>` proves SSR is alive. It does not prove the bundle behind it is
     * the one just built — which is the exact failure above, where every check
     * passed against the previous release.
     *
     * Vite hashes the entry filename per build, so the manifest's entry appears
     * in the served HTML only when the served app is this build.
     */
    $script = file_get_contents(base_path('scripts/deploy.sh'));

    expect($script)->toContain('BUILT_ENTRY');
    expect($script)->toContain('serving a different build than the one just deployed');

    // The assertion has to run after the <h1> check, inside the same block.
    expect(strpos($script, 'no server-rendered <h1>'))
        ->toBeLessThan(strpos($script, 'serving a different build'));
});
