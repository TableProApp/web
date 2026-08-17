<?php

use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Assert;

/*
|--------------------------------------------------------------------------
| Server-side rendering helpers
|--------------------------------------------------------------------------
|
| Three test files need to assert on markup that only exists once Inertia has
| rendered the React tree: the homepage structure, the homepage DOM, and the
| head tags. Two of them held their own copy of the probe below and the third
| had none, which is how a batch of head assertions shipped in a suite that
| could never see a head tag.
|
| Anything asserting on rendered output belongs behind `requireSsr()`.
|
*/

/**
 * Skips when SSR is unavailable locally, fails when `REQUIRE_SSR` is set.
 *
 * Skipping is right on a developer machine, where not everyone has run
 * `npm run build`. It is wrong in CI: a skipped run is indistinguishable from a
 * passing one, so an SSR job that silently stopped rendering would report green
 * forever. The `ssr` workflow job sets `REQUIRE_SSR=1` for exactly this reason.
 */
function ssrUnavailable(string $reason): never
{
    if (filter_var(env('REQUIRE_SSR', false), FILTER_VALIDATE_BOOL)) {
        Assert::fail($reason);
    }

    test()->markTestSkipped($reason);
}

/**
 * Gates a test on a running, current SSR service.
 *
 * Without it, `$response->getContent()` returns the Blade shell: the Inertia
 * data-page attribute and nothing else. Every assertion about a `<meta>`, a
 * JSON-LD block or a rendered section then compares against markup that is not
 * there, and passes or fails for reasons unrelated to what it is testing.
 */
function requireSsr(): void
{
    if (! file_exists(base_path('bootstrap/ssr/ssr.js'))) {
        ssrUnavailable('SSR bundle missing. Run: npm run build');
    }

    $ssrUrl = config('inertia.ssr.url', 'http://127.0.0.1:13715');

    try {
        Http::timeout(2)->get($ssrUrl . '/health');
    } catch (\Throwable) {
        // The health endpoint is optional; only a refused connection matters.
    }

    $probe = @fsockopen(parse_url($ssrUrl, PHP_URL_HOST), (int) parse_url($ssrUrl, PHP_URL_PORT), $errno, $errstr, 2);

    if ($probe === false) {
        ssrUnavailable('SSR service not running. Run: php artisan inertia:start-ssr');
    }

    fclose($probe);

    assertSsrBundleIsFresh();
}

/**
 * Fails when the SSR service is older than the bundle it is meant to serve.
 *
 * `inertia:start-ssr` reads `bootstrap/ssr/ssr.js` into a long-lived Node
 * process at boot. Running `npm run build` afterwards rewrites the file but
 * does not reload it, so every assertion keeps passing against whatever markup
 * the last restart happened to load. That is worse than a skip: a copy change
 * can be asserted, merged and deployed while the test that was supposed to
 * guard it never saw the new string. That has already happened once here.
 *
 * Degrades to a no-op where the process cannot be identified, since a missing
 * `lsof` must not fail an otherwise valid run.
 */
function assertSsrBundleIsFresh(): void
{
    $bundle = base_path('bootstrap/ssr/ssr.js');
    $port = (int) parse_url(config('inertia.ssr.url', 'http://127.0.0.1:13715'), PHP_URL_PORT);

    $pid = trim((string) @shell_exec("lsof -ti tcp:{$port} -sTCP:LISTEN 2>/dev/null | head -1"));

    if ($pid === '' || ! ctype_digit($pid)) {
        return;
    }

    /*
     * Elapsed time, not `lstart`. `ps` prints a wall-clock start with no zone,
     * and `strtotime()` reads it in PHP's timezone — which is UTC here and
     * local on the machine printing it. That silently shifted the comparison by
     * the UTC offset and made this check pass for every possible input.
     */
    $elapsed = parseProcessElapsedSeconds((string) @shell_exec("ps -p {$pid} -o etime= 2>/dev/null"));

    if ($elapsed === null) {
        return;
    }

    // Two seconds of slack: `ps` reports whole seconds, and a build finishing
    // as the service starts is fine.
    expect(filemtime($bundle))->toBeLessThanOrEqual(
        time() - $elapsed + 2,
        'The SSR service is serving a stale bundle. Run: php artisan inertia:stop-ssr && php artisan inertia:start-ssr',
    );
}

/**
 * Parses the `[[DD-]HH:]MM:SS` form `ps -o etime=` prints.
 *
 * @return int|null Seconds since the process started, or null if unparseable.
 */
function parseProcessElapsedSeconds(string $etime): ?int
{
    $etime = trim($etime);

    if (! preg_match('/^(?:(?:(\d+)-)?(\d+):)?(\d+):(\d+)$/', $etime, $m)) {
        return null;
    }

    return ((int) ($m[1] ?: 0)) * 86400
        + ((int) ($m[2] ?: 0)) * 3600
        + ((int) $m[3]) * 60
        + (int) $m[4];
}

/** The server-rendered HTML for a path, on the web domain. */
function ssrHtml(string $path): string
{
    requireSsr();

    $response = test()->get('http://' . config('app.web_domain') . $path);
    $response->assertOk();

    return $response->getContent();
}
