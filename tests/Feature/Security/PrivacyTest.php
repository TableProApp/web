<?php

use Dom\HTMLDocument;
use Illuminate\Support\Facades\Process;

use function Pest\Laravel\get;

const PRIVACY_GTAG_URL = 'https://www.googletagmanager.com/gtag/js?id=G-TEST123';

function privacyFrontendSources(): array
{
    $sources = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(resource_path('js'), FilesystemIterator::SKIP_DOTS));

    foreach ($iterator as $file) {
        if ($file->isFile() && preg_match('/\.tsx?$/', $file->getFilename())) {
            $sources[str_replace(resource_path('js') . '/', '', $file->getPathname())] = (string) file_get_contents($file->getPathname());
        }
    }

    return $sources;
}

function privacyExternalRequests(string $html): array
{
    $document = Dom\HTMLDocument::createFromString($html, LIBXML_NOERROR);
    $urls = [];

    foreach ($document->querySelectorAll('script[src], iframe[src], img[src], source[src], video[src], audio[src]') as $element) {
        $urls[] = (string) $element->getAttribute('src');
    }

    foreach ($document->querySelectorAll('img[srcset], source[srcset]') as $element) {
        foreach (explode(',', (string) $element->getAttribute('srcset')) as $candidate) {
            $urls[] = strtok(trim($candidate), ' ');
        }
    }

    foreach ($document->querySelectorAll('link[href]') as $link) {
        if (array_intersect(explode(' ', (string) $link->getAttribute('rel')), ['stylesheet', 'preload', 'modulepreload', 'preconnect', 'dns-prefetch', 'icon', 'apple-touch-icon', 'manifest']) !== []) {
            $urls[] = (string) $link->getAttribute('href');
        }
    }

    $origin = (string) config('app.web_domain');

    return array_values(array_filter($urls, function (string $url) use ($origin): bool {
        $host = parse_url(str_starts_with($url, '//') ? "https:{$url}" : $url, PHP_URL_HOST);

        return is_string($host) && $host !== $origin;
    }));
}

function privacyHeadScript(string $html): string
{
    preg_match_all('#<script>(.*?)</script>#s', $html, $scripts);
    $script = collect($scripts[1])->first(fn(string $body): bool => str_contains($body, 'googletagmanager.com'));

    expect($script)->not->toBeNull();

    return $script;
}

function runGoogleLoader(string $html, bool $idleCallback, string $readyState): array
{
    $stub = 'globalThis.window = globalThis;'
        . 'const added = []; let onLoad = null; let idle = null; let timeout = null;'
        . 'globalThis.localStorage = { getItem: (key) => key === "tablepro:analytics-consent" ? "granted" : null };'
        . 'globalThis.document = { readyState: ' . json_encode($readyState) . ', documentElement: { classList: { add: () => {} } }, createElement: () => ({}), head: { appendChild: (node) => added.push(node.src) } };'
        . 'globalThis.addEventListener = (type, listener) => { if (type === "load") { onLoad = listener; } };'
        . ($idleCallback ? 'globalThis.requestIdleCallback = (callback) => { idle = callback; };' : '')
        . 'globalThis.setTimeout = (callback) => { timeout = callback; };';

    $run = 'const beforeLoad = [...added];'
        . 'onLoad?.();'
        . 'const afterLoad = [...added];'
        . '(idle ?? timeout)?.();'
        . 'process.stdout.write(JSON.stringify({ beforeLoad, afterLoad, afterIdle: added, queue: window.dataLayer.map((args) => Array.from(args)) }));';

    $result = Process::input($stub . privacyHeadScript($html) . ';' . $run)->run(['node', '-']);

    expect($result->successful())->toBeTrue($result->errorOutput());

    return json_decode($result->output(), true, flags: JSON_THROW_ON_ERROR);
}

function consentBarOpens(string $html, string|false|null $stored): bool
{
    $storage = $stored === false
        ? '{ getItem: () => { throw new Error("denied"); } }'
        : '{ getItem: () => ' . json_encode($stored) . ' }';

    $stub = 'globalThis.window = globalThis; const classes = [];'
        . 'globalThis.localStorage = ' . $storage . ';'
        . 'globalThis.document = { readyState: "complete", documentElement: { classList: { add: (name) => classes.push(name) } }, createElement: () => ({}), head: { appendChild: () => {} } };'
        . 'globalThis.addEventListener = () => {}; globalThis.requestIdleCallback = () => {};';

    $result = Process::input($stub . privacyHeadScript($html) . ';process.stdout.write(JSON.stringify(classes));')->run(['node', '-']);

    expect($result->successful())->toBeTrue($result->errorOutput());

    return in_array('consent-open', json_decode($result->output(), true, flags: JSON_THROW_ON_ERROR), true);
}

beforeEach(function (): void {
    config(['analytics.google.measurement_id' => 'G-TEST123', 'services.crisp.website_id' => 'crisp-test-id']);
});

it('sets no cookie on any response', function (string $path): void {
    $response = get($path);

    expect($response->headers->getCookies())->toBe([])
        ->and($response->headers->has('Set-Cookie'))->toBeFalse();
})->with(['/', '/vi', '/pricing', '/blog', '/compare/tableplus', '/no-such-page', '/compare/azimutt', '/index.php/pricing', '/robots.txt', '/up']);

it('requests nothing from another origin in the document', function (string $path, int $status): void {
    expect(privacyExternalRequests((string) get($path)->assertStatus($status)->getContent()))->toBe([]);
})->with([
    'the homepage' => ['/', 200],
    'a translated page' => ['/vi/pricing', 200],
    'the download page' => ['/download', 200],
    'the error page' => ['/no-such-page', 404],
]);

it('requests nothing from another origin in a server-rendered page', function (string $path): void {
    expect(privacyExternalRequests(ssrHtml($path)))->toBe([]);
})->with(['/', '/vi', '/download', '/vi/download', '/pricing', '/vi/pricing'])->group('ssr');

it('adds Google\'s tag only after the load event and an idle moment, with consent denied by default', function (bool $idleCallback, string $readyState): void {
    $run = runGoogleLoader((string) get('/download')->getContent(), $idleCallback, $readyState);

    expect($run['beforeLoad'])->toBe([])
        ->and($run['afterLoad'])->toBe([])
        ->and($run['afterIdle'])->toBe([PRIVACY_GTAG_URL]);

    [$default, $stored] = $run['queue'];

    expect(array_slice($default, 0, 2))->toBe(['consent', 'default'])
        ->and($default[2])->toMatchArray([
            'ad_storage' => 'denied',
            'ad_user_data' => 'denied',
            'ad_personalization' => 'denied',
            'analytics_storage' => 'denied',
        ])
        ->and($stored)->toBe(['consent', 'update', ['analytics_storage' => 'granted']])
        ->and(end($run['queue']))->toBe(['config', 'G-TEST123']);
})->with([
    'with an idle callback' => [true, 'loading'],
    'without one (Safari)' => [false, 'loading'],
    'after the page loaded' => [true, 'complete'],
]);

it('renders no Google tag without a measurement id', function (): void {
    config(['analytics.google.measurement_id' => null]);

    expect((string) get('/download')->assertOk()->getContent())
        ->not->toContain('googletagmanager.com')
        ->not->toContain('gtag(');
});

it('never grants an advertising signal', function (string $file): void {
    $source = (string) file_get_contents(base_path($file));

    foreach (['ad_storage', 'ad_user_data', 'ad_personalization'] as $signal) {
        expect($source)->not->toMatch("/{$signal}:\\s*'granted'/");
    }
})->with(['resources/views/app.blade.php', 'resources/js/lib/consent.ts']);

it('opens the consent bar before first paint only for a reader who has not answered', function (string|false|null $stored, bool $open): void {
    expect(consentBarOpens((string) get('/download')->getContent(), $stored))->toBe($open);
})->with([
    'no answer' => [null, true],
    'an unknown value' => ['maybe', true],
    'storage that throws' => [false, true],
    'granted' => ['granted', false],
    'denied' => ['denied', false],
]);

it('server-renders the consent bar with its two answers', function (string $path): void {
    $bar = HTMLDocument::createFromString(ssrHtml($path), LIBXML_NOERROR)->querySelector('[data-consent-bar]');

    expect($bar)->not->toBeNull()
        ->and($bar->querySelectorAll('button'))->toHaveCount(2);
})->with(['/download', '/vi/pricing'])->group('ssr');

it('calls only tablepro-cloud\'s public /v2 endpoints and Cloudflare\'s trace', function (): void {
    $allowed = [
        "api('/v2/checkouts')",
        "api('/v2/discounts/preview')",
        "api('/v2/pricing')",
        "api('/v2/newsletter/subscriptions')",
        "api('/v2/newsletter/stats')",
        "'/cdn-cgi/trace'",
    ];
    $calls = 0;

    foreach (privacyFrontendSources() as $file => $text) {
        preg_match_all("/\\bfetch\\(\\s*(api\\('[^']*'\\)|[^,)]+)/", $text, $targets);

        foreach ($targets[1] as $target) {
            $calls++;
            expect(trim($target))->toBeIn($allowed, "{$file} fetches {$target}");
        }
    }

    expect($calls)->toBeGreaterThan(0);
});

it('omits credentials on every request to tablepro-cloud and Cloudflare', function (): void {
    $calls = 0;

    foreach (privacyFrontendSources() as $file => $text) {
        preg_match_all('/fetch\(([^;]*?)\{(.*?)\}\s*\)/s', $text, $matches);

        foreach ($matches[0] as $call) {
            if (preg_match("#api\\('/v2/|['\"`]/cdn-cgi/#", $call)) {
                $calls++;
                expect(str_contains($call, "credentials: 'omit'"))->toBeTrue("{$file} sends cookies: {$call}");
            }
        }
    }

    expect($calls)->toBeGreaterThan(0);
});

it('posts the newsletter form as JSON with the fields tablepro-cloud reads', function (): void {
    $hook = (string) file_get_contents(resource_path('js/hooks/use-email-form.ts'));

    expect($hook)->toContain("method: 'POST'")->toContain("'Content-Type': 'application/json'");

    foreach (['email', 'locale', 'turnstile_token', 'source', 'consent_version'] as $field) {
        expect($hook)->toMatch("/JSON\\.stringify\\(\\{[^}]*\\b{$field}\\b/s");
    }
});
