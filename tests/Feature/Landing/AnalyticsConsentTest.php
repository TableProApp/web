<?php

use Illuminate\Support\Facades\Process;
use PHPUnit\Framework\Assert;

function consentSource(string $relative): string
{
    return (string) file_get_contents(base_path($relative));
}

function consentHtml(string $path, int $status = 200): string
{
    static $html = [];

    config(['analytics.google.measurement_id' => 'G-TEST123']);

    return $html[$path] ??= (string) test()->get($path)->assertStatus($status)->getContent();
}

// Google's script is about 180 KB, so the head script adds it after the load event, once the browser is idle.
it('puts no Google script in the document, only the loader that adds it later', function (string $path, int $status): void {
    $html = consentHtml($path, $status);

    expect($html)->not->toMatch('#<script[^>]*\ssrc="https://www\.googletagmanager\.com#')
        ->and(strpos($html, 'var src = "https://www.googletagmanager.com/gtag/js?id=G-TEST123"'))->toBeGreaterThan(strpos($html, "gtag('config'"));
})->with([
    'a page' => ['/download', 200],
    'a Vietnamese page' => ['/vi/pricing', 200],
    'the error page' => ['/no-such-page', 404],
]);

/**
 * @return array{beforeLoad: list<string>, afterLoad: list<string>, afterIdle: list<string>, idleTimeout: int|null, timeoutDelay: int|null, listenedForLoad: bool, queue: list<list<mixed>>}
 */
function runAnalyticsScript(string $html, bool $idleCallback, string $readyState = 'loading'): array
{
    preg_match_all('#<script>(.*?)</script>#s', $html, $scripts);
    $script = collect($scripts[1])->first(fn(string $body): bool => str_contains($body, 'googletagmanager.com'));

    expect($script)->not->toBeNull();

    $stub = 'globalThis.window = globalThis;'
        . 'const added = []; let onLoad = null; let idle = null; let timeout = null;'
        . 'globalThis.localStorage = { getItem: (key) => key === "tablepro:analytics-consent" ? "granted" : null };'
        . 'globalThis.document = { readyState: ' . json_encode($readyState) . ', createElement: () => ({}), head: { appendChild: (node) => added.push(node.src) } };'
        . 'globalThis.addEventListener = (type, listener) => { if (type === "load") { onLoad = listener; } };'
        . ($idleCallback ? 'globalThis.requestIdleCallback = (callback, options) => { idle = [callback, options.timeout]; };' : '')
        . 'globalThis.setTimeout = (callback, delay) => { timeout = [callback, delay]; };';

    $run = 'const listenedForLoad = onLoad !== null;'
        . 'const beforeLoad = [...added];'
        . 'onLoad?.();'
        . 'const afterLoad = [...added];'
        . '(idle ?? timeout)?.[0]();'
        . 'process.stdout.write(JSON.stringify({ beforeLoad, afterLoad, afterIdle: added, idleTimeout: idle?.[1] ?? null, timeoutDelay: timeout?.[1] ?? null, listenedForLoad, queue: window.dataLayer.map((args) => Array.from(args)) }));';

    $result = Process::input($stub . $script . ';' . $run)->run(['node', '-']);

    expect($result->successful())->toBeTrue($result->errorOutput());

    return json_decode($result->output(), true, flags: JSON_THROW_ON_ERROR);
}

it('requests Google\'s script only after the load event and an idle moment, with every call queued', function (bool $idleCallback): void {
    $run = runAnalyticsScript(consentHtml('/download'), $idleCallback);
    $tag = 'https://www.googletagmanager.com/gtag/js?id=G-TEST123';

    expect($run['listenedForLoad'])->toBeTrue()
        ->and($run['beforeLoad'])->toBe([])
        ->and($run['afterLoad'])->toBe([])
        ->and($run['afterIdle'])->toBe([$tag]);

    // The idle callback waits at most four seconds; Safari, which has none, waits two after the load.
    expect($idleCallback ? $run['idleTimeout'] : $run['timeoutDelay'])->toBe($idleCallback ? 4000 : 2000);

    expect(array_column($run['queue'], 0))->toBe(['consent', 'consent', 'js', 'config'])
        ->and($run['queue'][0][1])->toBe('default')
        ->and($run['queue'][1])->toBe(['consent', 'update', ['analytics_storage' => 'granted']])
        ->and($run['queue'][3])->toBe(['config', 'G-TEST123']);
})->with(['with an idle callback' => true, 'without one (Safari)' => false]);

it('waits only for idle when the page has already loaded', function (): void {
    $run = runAnalyticsScript(consentHtml('/download'), true, 'complete');

    expect($run['listenedForLoad'])->toBeFalse()
        ->and($run['beforeLoad'])->toBe([])
        ->and($run['afterIdle'])->toBe(['https://www.googletagmanager.com/gtag/js?id=G-TEST123']);
});

it('renders no tag when no measurement id is configured', function (): void {
    config(['analytics.google.measurement_id' => null]);

    $html = $this->get('/download')->assertOk()->getContent();

    expect($html)->not->toContain('googletagmanager.com');
    expect($html)->not->toContain('gtag(');
});

it('denies storage before the tag is configured, and applies a stored answer in between', function (string $path): void {
    $html = consentHtml($path);

    $default = strpos($html, "gtag('consent', 'default'");
    $stored = strpos($html, "gtag('consent', 'update', { analytics_storage: 'granted' })");
    $configured = strpos($html, "gtag('config'");

    Assert::assertNotFalse($default, 'The tag must declare a consent default');
    Assert::assertNotFalse($stored, 'A returning reader who allowed analytics must be granted before the first hit');
    Assert::assertNotFalse($configured, 'The tag must be configured');
    Assert::assertLessThan($stored, $default, 'The default must come before the stored answer');
    Assert::assertLessThan($configured, $stored, 'The stored answer must be applied before the tag is configured');

    $defaults = substr($html, $default, $stored - $default);

    foreach (['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'] as $signal) {
        Assert::assertStringContainsString("{$signal}: 'denied'", $defaults, "{$signal} must default to denied");
    }
})->with(['/download', '/vi/download']);

it('never grants an advertising signal', function (): void {
    $sources = consentSource('resources/views/app.blade.php') . consentSource('resources/js/lib/consent.ts');

    foreach (['ad_storage', 'ad_user_data', 'ad_personalization'] as $signal) {
        expect($sources)->not->toMatch("/{$signal}:\\s*'granted'/");
    }
});

// The account app reads the same key through its byte-identical copy of consent.ts.
it('reads the answer under the key the consent module writes', function (): void {
    preg_match("/CONSENT_STORAGE_KEY = '([^']+)'/", consentSource('resources/js/lib/consent.ts'), $key);

    Assert::assertSame('tablepro:analytics-consent', $key[1] ?? null);
    Assert::assertStringContainsString(
        "localStorage.getItem('{$key[1]}')",
        consentSource('resources/views/app.blade.php'),
        'app.blade.php must read the key consent.ts writes',
    );
});

it('leaves nothing of Plausible behind', function (): void {
    foreach (['resources/views/app.blade.php', 'config/analytics.php', '.env.example'] as $file) {
        Assert::assertFalse(stripos(consentSource($file), 'plausible'), "{$file} still mentions Plausible");
    }

    expect(consentSource('resources/js/lib/analytics.ts'))->not->toMatch('/plausible\s*\(|\.plausible\b/');

    foreach (['en', 'vi'] as $locale) {
        $file = "resources/data/legal/{$locale}/privacy.md";

        Assert::assertFalse(stripos(consentSource($file), 'plausible'), "{$file} still mentions Plausible");
    }
});

it('asks on every page and lets the reader change their answer from any of them', function (): void {
    $layout = consentSource('resources/js/layouts/landing-layout.tsx');
    $wrapper = consentSource('resources/js/components/site/consent-bar.tsx');
    $footer = consentSource('resources/js/components/site/site-footer.tsx');

    expect($layout)->toContain('<ConsentBar />')
        ->toContain("import ConsentBar from '@/components/site/consent-bar';")
        // A flex column, so the bar's first ask on a phone can sit above the header.
        ->toContain('<div className="relative flex min-h-dvh flex-col');

    // Last in the frame, so it is the last tab stop on the page.
    expect(strrpos($layout, '<ConsentBar />'))->toBeGreaterThan(strrpos($layout, '<SiteFooter />'));

    expect($wrapper)->toContain("import SharedConsentBar from '@/components/shared/consent-bar';")
        ->toContain('labels={m.consent}')
        ->toContain("path('/privacy#cookies')");

    expect($footer)->toMatch('/<button type="button" onClick=\{openConsentSettings\}[^>]*>\s*\{groups\.legal\.cookies\}\s*<\/button>/');
});

/**
 * @return list<string>
 */
function htmlClassesAfterHead(string $html, string|false|null $stored): array
{
    preg_match_all('#<script>(.*?)</script>#s', $html, $scripts);
    $script = collect($scripts[1])->first(fn(string $body): bool => str_contains($body, 'googletagmanager.com'));

    $storage = $stored === false
        ? '{ getItem: () => { throw new Error("denied"); } }'
        : '{ getItem: () => ' . json_encode($stored) . ' }';

    $stub = 'globalThis.window = globalThis; const classes = [];'
        . 'globalThis.localStorage = ' . $storage . ';'
        . 'globalThis.document = { readyState: "complete", documentElement: { classList: { add: (name) => classes.push(name) } }, createElement: () => ({}), head: { appendChild: () => {} } };'
        . 'globalThis.addEventListener = () => {}; globalThis.requestIdleCallback = () => {};';

    $result = Process::input($stub . $script . ';process.stdout.write(JSON.stringify(classes));')->run(['node', '-']);

    expect($result->successful())->toBeTrue($result->errorOutput());

    return json_decode($result->output(), true, flags: JSON_THROW_ON_ERROR);
}

// The class shows the server-rendered bar before first paint, so it never pops in or pushes the page after hydration.
it('opens the bar before first paint for a reader who has not answered', function (string|false|null $stored, bool $open): void {
    $classes = htmlClassesAfterHead(consentHtml('/download'), $stored);

    expect(in_array('consent-open', $classes, true))->toBe($open);
})->with([
    'no answer' => [null, true],
    'an unknown value' => ['maybe', true],
    'storage that throws' => [false, true],
    'granted' => ['granted', false],
    'denied' => ['denied', false],
]);

it('renders the bar on the server, hidden until the head script opens it', function (): void {
    $html = ssrHtml('/download');

    expect(preg_match('#<section data-consent-bar="true" aria-label="Analytics cookies" aria-live="polite" tabindex="-1" class="([^"]*)">#', $html, $bar))->toBe(1);

    $classes = explode(' ', $bar[1]);

    expect($classes)->toContain('hidden')
        ->toContain('in-[.consent-open]:block')
        // Below 640px the first ask sits above the header instead of over the page.
        ->toContain('max-sm:order-first')
        ->toContain('max-sm:static')
        ->toContain('sticky');
})->group('ssr');

it('gives the consent buttons a 44px target on a touch screen', function (): void {
    $bar = consentSource('resources/js/components/shared/consent-bar.tsx');

    expect(substr_count($bar, '<Button variant="secondary" size="sm" className="pointer-coarse:min-h-11"'))->toBe(2);
});

// A filled Allow beside an outlined Decline is the nudge that makes consent not freely given.
it('weighs Allow and Decline the same', function (): void {
    $bar = consentSource('resources/js/components/shared/consent-bar.tsx');

    // Lazy up to the `>` that closes the tag: the props hold an arrow function, whose `=>` a `[^>]` would stop at.
    preg_match_all('/<Button\s+((?:(?!<Button).)*?)>\s*\{labels\.(allow|decline)\}\s*<\/Button>/s', $bar, $buttons, PREG_SET_ORDER);

    expect($buttons)->toHaveCount(2);

    $props = array_map(static fn(array $match): string => str_replace(["'granted'", "'denied'"], '', $match[1]), $buttons);

    Assert::assertSame($props[0], $props[1], 'Allow and Decline must be styled identically');
    expect($bar)->toContain('grid grid-cols-2 gap-2');

    foreach (['en', 'vi'] as $locale) {
        $catalog = consentSource("resources/js/i18n/messages/{$locale}/consent.ts");

        expect($catalog)->toMatch("/allow: '[^']+'/")->toMatch("/decline: '[^']+'/");
    }
});

// The English line is measured to fit 1440px; Vietnamese stacked marks run wider, so characters stand in for pixels.
it('keeps the Vietnamese question within the English one\'s line', function (): void {
    $line = function (string $locale): string {
        $catalog = consentSource("resources/js/i18n/messages/{$locale}/consent.ts");

        preg_match("/body: '([^']+)'/", $catalog, $body);
        preg_match("/privacy: '([^']+)'/", $catalog, $privacy);

        return $body[1] . ' ' . $privacy[1];
    };

    expect(mb_strlen($line('vi')))->toBeLessThanOrEqual(mb_strlen($line('en')));
    expect($line('vi'))->toContain('Google Analytics');
});

// Tailwind v4 leaves a <button> on the default cursor, and the secondary variant had no hover of its own.
it('makes the Allow and Decline buttons look clickable', function (): void {
    $button = consentSource('resources/js/components/ui/button.tsx');

    preg_match("/secondary:\s*'([^']+)'/", $button, $secondary);

    expect($button)->toMatch("/'inline-flex cursor-pointer /");
    expect($secondary[1] ?? '')->toContain('hover:bg-');
});
