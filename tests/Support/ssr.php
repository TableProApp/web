<?php

use PHPUnit\Framework\Assert;

// SSR is off for every request (phpunit.xml) until a test calls requireSsr().
// Tests that need SSR, the build or node_modules sit in ->group('ssr'): CI runs
// that group in the job that has them, and everything else in the job without.

function requireSsrJob(): void
{
    Assert::assertContains('ssr', test()->groups(), "This test needs the ssr CI job: add ->group('ssr').");
}

function ssrUnavailable(string $reason): never
{
    // Set in the ssr CI job, where a skip would read as a pass.
    if (filter_var(env('REQUIRE_SSR', false), FILTER_VALIDATE_BOOL)) {
        Assert::fail($reason);
    }

    test()->markTestSkipped($reason);
}

function requireSsr(): void
{
    requireSsrJob();

    static $problem = null;
    $problem ??= ssrProblem();

    if ($problem['skip'] !== null) {
        ssrUnavailable($problem['skip']);
    }

    if ($problem['fail'] !== null) {
        Assert::fail($problem['fail']);
    }

    config(['inertia.ssr.enabled' => true]);
}

/**
 * Checked once per process: the probe shells out to lsof and ps.
 *
 * @return array{skip: string|null, fail: string|null}
 */
function ssrProblem(): array
{
    if (! file_exists(base_path('bootstrap/ssr/ssr.js'))) {
        return ['skip' => 'SSR bundle missing. Run: npm run build', 'fail' => null];
    }

    $url = (string) config('inertia.ssr.url', 'http://127.0.0.1:13715');
    $probe = @fsockopen((string) parse_url($url, PHP_URL_HOST), (int) parse_url($url, PHP_URL_PORT), $errno, $errstr, 2);

    if ($probe === false) {
        return ['skip' => 'SSR service not running. Run: php artisan inertia:start-ssr', 'fail' => null];
    }

    fclose($probe);

    return ['skip' => null, 'fail' => ssrBundleIsStale($url) ? 'The SSR service is serving a stale bundle. Run: php artisan inertia:stop-ssr && php artisan inertia:start-ssr' : null];
}

// A long-lived SSR process keeps the bundle it booted with, so a later build
// would be asserted against old markup. Unknown when lsof or ps is missing.
function ssrBundleIsStale(string $url): bool
{
    $port = (int) parse_url($url, PHP_URL_PORT);
    $pid = trim((string) @shell_exec("lsof -ti tcp:{$port} -sTCP:LISTEN 2>/dev/null | head -1"));

    if ($pid === '' || ! ctype_digit($pid)) {
        return false;
    }

    // Elapsed time, not lstart: ps prints lstart without a zone.
    $elapsed = parseProcessElapsedSeconds((string) @shell_exec("ps -p {$pid} -o etime= 2>/dev/null"));

    // Two seconds of slack for ps's whole seconds.
    return $elapsed !== null && filemtime(base_path('bootstrap/ssr/ssr.js')) > time() - $elapsed + 2;
}

/**
 * Parses the `[[DD-]HH:]MM:SS` form `ps -o etime=` prints.
 */
function parseProcessElapsedSeconds(string $etime): ?int
{
    if (! preg_match('/^(?:(?:(\d+)-)?(\d+):)?(\d+):(\d+)$/', trim($etime), $m)) {
        return null;
    }

    return ((int) ($m[1] ?: 0)) * 86400
        + ((int) ($m[2] ?: 0)) * 3600
        + ((int) $m[3]) * 60
        + (int) $m[4];
}

function ssrHtml(string $path): string
{
    requireSsr();

    $response = test()->get('http://' . config('app.web_domain') . $path);
    $response->assertOk();

    return $response->getContent();
}
