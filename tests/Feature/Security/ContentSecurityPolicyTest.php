<?php

use App\Support\Security\ContentSecurityPolicy;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Testing\TestResponse;

/** @return array<string, list<string>> */
function cspDirectives(TestResponse $response): array
{
    $directives = [];

    foreach (explode('; ', (string) $response->headers->get('Content-Security-Policy')) as $directive) {
        $sources = explode(' ', $directive);
        $directives[array_shift($sources)] = $sources;
    }

    return $directives;
}

/** @return list<string> */
function cspInlineScripts(string $html): array
{
    // Read with the HTML parser, independently of the pattern the policy is built with.
    $scripts = [];

    foreach (Dom\HTMLDocument::createFromString($html, LIBXML_NOERROR)->querySelectorAll('script:not([src])') as $script) {
        if (in_array($script->getAttribute('type') ?? '', ['', 'module', 'text/javascript'], true)) {
            $scripts[] = $script->textContent;
        }
    }

    return $scripts;
}

/** @param  list<string>  $sources */
function cspAdmits(array $sources, string $url): bool
{
    $target = parse_url($url);

    foreach ($sources as $source) {
        $allowed = parse_url($source);

        if (! isset($allowed['host']) || $allowed['scheme'] !== $target['scheme']) {
            continue;
        }

        $host = str_starts_with($allowed['host'], '*.')
            ? str_ends_with($target['host'], substr($allowed['host'], 1))
            : $allowed['host'] === $target['host'];
        $path = $allowed['path'] ?? '';

        if ($host && ($path === '' || $path === $target['path'] || (str_ends_with($path, '/') && str_starts_with($target['path'], $path)))) {
            return true;
        }
    }

    return false;
}

beforeEach(function (): void {
    config(['analytics.google.measurement_id' => 'G-TEST123', 'services.crisp.website_id' => 'crisp-test-id']);
});

it('admits every inline script a document runs by its hash, and no other inline script', function (string $path, int $status): void {
    requireSsr();

    $response = $this->get($path)->assertStatus($status);
    $scriptSrc = cspDirectives($response)['script-src'];
    $scripts = cspInlineScripts((string) $response->getContent());

    expect($scripts)->not->toBeEmpty();

    foreach ($scripts as $script) {
        expect($scriptSrc)->toContain("'sha256-" . base64_encode(hash('sha256', $script, true)) . "'");
    }

    expect($scriptSrc)->not->toContain("'unsafe-inline'")
        ->not->toContain("'unsafe-eval'")
        ->and(array_filter($scriptSrc, fn(string $source): bool => str_starts_with($source, "'sha256-")))->toHaveCount(count(array_unique($scripts)));
})->with([
    'the homepage' => ['/', 200],
    'a page with the banner' => ['/pricing', 200],
    'a translated page' => ['/vi/download', 200],
    'a post' => ['/blog/tablepro-0-77', 200],
    'no route' => ['/no-such-page', 404],
    'retired' => ['/compare/azimutt', 410],
])->group('ssr');

it('covers the static error page a failed render falls back to', function (): void {
    config(['app.debug' => false]);
    Route::get('/_test/static', fn() => response()->view('errors.500', [], 500));

    $response = $this->get('/_test/static')->assertStatus(500);
    $scripts = cspInlineScripts((string) $response->getContent());

    expect($scripts)->toHaveCount(1)
        ->and(cspDirectives($response)['script-src'])->toContain("'sha256-" . base64_encode(hash('sha256', $scripts[0], true)) . "'");
});

it('still hashes a script that follows a data block larger than the pattern engine can cross', function (): void {
    $html = '<script type="application/json">' . str_repeat('a', 1_200_000) . '</script><script>run()</script>';

    expect(app(ContentSecurityPolicy::class)->for($html))->toContain("'sha256-" . base64_encode(hash('sha256', 'run()', true)) . "'");
});

it('admits the script each third party loads from, and only the pinned file from a public CDN', function (string $provider, string $other): void {
    config(['payment.provider' => $provider]);

    $scriptSrc = cspDirectives($this->get('/pricing'))['script-src'];
    $sdk = json_decode(File::get(resource_path('data/pricing.json')), true)['checkoutSdk'];

    preg_match("/CRISP_SCRIPT_URL = '([^']+)'/", File::get(resource_path('js/lib/crisp.ts')), $crisp);

    expect(cspAdmits($scriptSrc, $sdk[$provider]))->toBeTrue()
        ->and(cspAdmits($scriptSrc, $sdk[$other]))->toBeFalse()
        ->and(cspAdmits($scriptSrc, $crisp[1]))->toBeTrue()
        ->and(cspAdmits($scriptSrc, 'https://www.googletagmanager.com/gtag/js?id=G-TEST123'))->toBeTrue()
        ->and(cspAdmits($scriptSrc, 'https://static.cloudflareinsights.com/beacon.min.js/v1'))->toBeTrue()
        ->and(cspAdmits($scriptSrc, 'https://cdn.jsdelivr.net/npm/left-pad@1.3.0/index.js'))->toBeFalse()
        ->and(cspAdmits($scriptSrc, 'https://storage.crisp.chat/upload.js'))->toBeFalse();

    foreach ($scriptSrc as $source) {
        expect($source)->not->toContain('*');
    }
})->with([
    ['polar', 'lemonsqueezy'],
    ['lemonsqueezy', 'polar'],
]);

it('frames the checkout overlay of the configured provider only', function (): void {
    config(['payment.provider' => 'polar']);

    $frameSrc = cspDirectives($this->get('/pricing'))['frame-src'];

    expect(cspAdmits($frameSrc, 'https://polar.sh/checkout/polar_c_x'))->toBeTrue()
        ->and(cspAdmits($frameSrc, 'https://buy.polar.sh/polar_cl_x'))->toBeTrue()
        ->and(cspAdmits($frameSrc, 'https://tablepro.lemonsqueezy.com/checkout/buy/x'))->toBeFalse();

    config(['payment.provider' => 'lemonsqueezy']);

    $directives = cspDirectives($this->get('/pricing'));

    expect(cspAdmits($directives['frame-src'], 'https://tablepro.lemonsqueezy.com/checkout/buy/x'))->toBeTrue()
        // lemon.js answers with a redirect to this host, and a redirect is checked again.
        ->and(cspAdmits($directives['script-src'], 'https://assets.lemonsqueezy.com/lemon.js'))->toBeTrue();
});

it('names analytics and chat only where they are configured', function (): void {
    config(['analytics.google.measurement_id' => null, 'services.crisp.website_id' => null]);

    expect($this->get('/pricing')->headers->get('Content-Security-Policy'))
        ->not->toContain('google')
        ->not->toContain('crisp');
});

it('gives every page the same sources, because an Inertia visit keeps the first document\'s policy', function (): void {
    $withoutHashes = fn(string $path): string => (string) preg_replace("/ 'sha256-[^']+'/", '', (string) $this->get($path)->headers->get('Content-Security-Policy'));

    expect($withoutHashes('/blog'))->toBe($withoutHashes('/pricing'))
        ->and($withoutHashes('/no-such-page'))->toBe($withoutHashes('/pricing'));
});

it('refuses framing, plugins and a foreign base or form target', function (): void {
    $directives = cspDirectives($this->get('/pricing'));

    expect($directives['frame-ancestors'])->toBe(["'none'"])
        ->and($directives['object-src'])->toBe(["'none'"])
        ->and($directives['base-uri'])->toBe(["'self'"])
        ->and($directives['form-action'])->toBe(["'self'"])
        ->and($directives['default-src'])->toBe(["'self'"]);
});

it('sends no policy with a response that is not a document', function (): void {
    $this->get('/robots.txt')->assertOk()->assertHeaderMissing('Content-Security-Policy');
    $this->getJson('/no-such-page')->assertNotFound()->assertHeaderMissing('Content-Security-Policy');
});

it("sends no policy with Laravel's debug page, which evaluates strings", function (): void {
    config(['app.debug' => true]);
    Route::middleware('web')->get('/_test/crash', fn() => throw new RuntimeException('Boom.'));

    $this->get('/_test/crash')->assertStatus(500)->assertHeaderMissing('Content-Security-Policy');
});
