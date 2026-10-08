<?php

use Illuminate\Support\Facades\Process;
use PHPUnit\Framework\Assert;

/**
 * Google Analytics, and the consent it waits for.
 *
 * GA4 sets `_ga` and `_ga_<stream>`, which need permission first, so the tag
 * loads in Consent Mode and the order of four calls in the document head is
 * what keeps it lawful. None of that is visible to a typecheck, and a mistake
 * in it is invisible in the browser too: a `config` that runs before `consent
 * default` sets cookies for every visitor, and every page still looks the
 * same.
 *
 * The consent module's behaviour is covered by execution in
 * `tests/js/consent.test.ts`. This file holds the wiring around it: the head,
 * the shared key, the bar in the layout, the "Cookie settings" control in the
 * footer of every page in both languages, and the privacy policy's account of
 * it all.
 */

/** A file's contents, relative to the repository root. */
function consentSource(string $relative): string
{
    return (string) file_get_contents(base_path($relative));
}

it('loads the tag with the configured measurement id', function (): void {
    config(['analytics.google.measurement_id' => 'G-TEST123']);

    $html = $this->get('/download')->assertOk()->getContent();

    expect($html)->toContain('https://www.googletagmanager.com/gtag/js?id=G-TEST123');
    expect($html)->toContain("gtag('config', \"G-TEST123\")");
});

/*
 * Google's script is about 180 KB, and it was the heaviest request on every
 * page. The document requests nothing from Google; the head script adds the
 * tag after the load event, once the browser is idle, as the chat loader
 * does, and `gtag()` queues every call until it arrives.
 */
it('puts no Google script in the document, only the loader that adds it later', function (string $path, int $status): void {
    config(['analytics.google.measurement_id' => 'G-TEST123']);

    $html = $this->get($path)->assertStatus($status)->getContent();

    expect($html)->not->toMatch('#<script[^>]*\ssrc="https://www\.googletagmanager\.com#')
        ->and(strpos($html, 'var src = "https://www.googletagmanager.com/gtag/js?id=G-TEST123"'))->toBeGreaterThan(strpos($html, "gtag('config'"));
})->with([
    'a page' => ['/download', 200],
    'a Vietnamese page' => ['/vi/pricing', 200],
    'the error page' => ['/no-such-page', 404],
]);

/**
 * Runs the head's analytics script in node against a stand-in window, then
 * fires the load event and the idle callback, and reports what happened at
 * each step. Executed rather than grepped, like the LCP preload script.
 *
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
    config(['analytics.google.measurement_id' => 'G-TEST123']);

    $run = runAnalyticsScript($this->get('/download')->getContent(), $idleCallback);
    $tag = 'https://www.googletagmanager.com/gtag/js?id=G-TEST123';

    expect($run['listenedForLoad'])->toBeTrue()
        ->and($run['beforeLoad'])->toBe([])
        ->and($run['afterLoad'])->toBe([])
        ->and($run['afterIdle'])->toBe([$tag]);

    // The idle callback waits at most four seconds; Safari, which has none, waits two after the load.
    expect($idleCallback ? $run['idleTimeout'] : $run['timeoutDelay'])->toBe($idleCallback ? 4000 : 2000);

    // The calls the tag replays when it arrives, in the order the contract needs.
    expect(array_column($run['queue'], 0))->toBe(['consent', 'consent', 'js', 'config'])
        ->and($run['queue'][0][1])->toBe('default')
        ->and($run['queue'][1])->toBe(['consent', 'update', ['analytics_storage' => 'granted']])
        ->and($run['queue'][3])->toBe(['config', 'G-TEST123']);
})->with(['with an idle callback' => true, 'without one (Safari)' => false]);

it('waits only for idle when the page has already loaded', function (): void {
    config(['analytics.google.measurement_id' => 'G-TEST123']);

    $run = runAnalyticsScript($this->get('/download')->getContent(), true, 'complete');

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

/*
 * Position, not presence. Each call in the head only means what it should if
 * it runs before the next: storage denied, then a returning reader's stored
 * answer applied, then the tag configured, at which point it sends the first
 * page view with whatever consent state it has been given.
 */
it('denies storage before the tag is configured, and applies a stored answer in between', function (string $path): void {
    config(['analytics.google.measurement_id' => 'G-TEST123']);

    $html = $this->get($path)->assertOk()->getContent();

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

/*
 * The head script and the module read the same key, written in two languages.
 * Renamed on one side only, a reader who allowed analytics is asked again on
 * every load and counted as a stranger in between. The account app reads it
 * too, through its byte-identical copy of consent.ts (docs/shared-files.md).
 */
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

    foreach (privacySources() as $file => $text) {
        Assert::assertFalse(stripos($text, 'plausible'), "{$file} still mentions Plausible");
    }
});

/*
 * The bar is in the layout, so it is on every page, the error pages included;
 * the shared component is rendered through this site's wrapper, which gives
 * it the page's words and the privacy link in the page's language.
 */
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
 * Runs the head's analytics script in node with `$stored` under the consent key
 * and reports the classes it put on `<html>`. `$stored` false makes storage throw.
 *
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
    config(['analytics.google.measurement_id' => 'G-TEST123']);

    $classes = htmlClassesAfterHead($this->get('/download')->getContent(), $stored);

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
});

// 44px on a touch screen; the desktop sizes stay.
it('gives the consent buttons a 44px target on a touch screen', function (): void {
    $bar = consentSource('resources/js/components/shared/consent-bar.tsx');

    expect(substr_count($bar, '<Button variant="secondary" size="sm" className="pointer-coarse:min-h-11"'))->toBe(2);
});

it('names the cookie settings control in the reader\'s language', function (string $path, string $label): void {
    $html = ssrHtml($path);

    preg_match_all('#<button type="button" class="[^"]*">([^<]+)</button>#', $html, $buttons);

    expect($buttons[1])->toContain($label);
})->with([
    'English' => ['/download', 'Cookie settings'],
    'Vietnamese' => ['/vi/download', 'Cài đặt cookie'],
]);

/*
 * Declining has to be as easy as allowing. The two buttons are the same
 * variant at the same size, in one equal-width row; a filled Allow beside an
 * outlined Decline is the nudge that makes consent not freely given.
 */
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

/*
 * Design-system §5.3.17: one line at 1440px (382px of text), so the bar stays
 * within 96px. The English question is measured to fit, with Inter's advance
 * widths at 14px; a Vietnamese one as long in characters is wider still,
 * because of its stacked marks. The old Vietnamese question took 466px and
 * wrapped. Characters stand in for pixels here, so the Vietnamese question
 * and its link may be no longer than the English ones.
 */
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

/*
 * The bar's buttons were the first secondary `Button`s to render as `<button>`
 * rather than `<a>`, and they showed an arrow cursor and no hover: Tailwind v4
 * leaves buttons on the default cursor, and the variant had no hover because a
 * link's pointer had always stood in for one.
 */
it('makes the Allow and Decline buttons look clickable', function (): void {
    $button = consentSource('resources/js/components/ui/button.tsx');

    preg_match("/secondary:\s*'([^']+)'/", $button, $secondary);

    expect($button)->toMatch("/'inline-flex cursor-pointer /");
    expect($secondary[1] ?? '')->toContain('hover:bg-');
});

it('tells readers which cookies analytics sets and how to take consent back', function (): void {
    $sources = privacySources();

    expect($sources)->not->toBeEmpty();

    foreach ($sources as $file => $text) {
        $vietnamese = str_contains($file, '/vi/');

        foreach (['_ga', 'tablepro:analytics-consent', 'Google Analytics'] as $needle) {
            Assert::assertStringContainsString($needle, $text, "{$file} must mention {$needle}");
        }

        // Analytics runs on consent, and the policy says so.
        Assert::assertMatchesRegularExpression($vietnamese ? '/cơ sở pháp lý/iu' : '/lawful basis/i', $text, "{$file} must state the lawful basis");

        // The reopen control, by the name the footer gives it.
        Assert::assertStringContainsString($vietnamese ? 'Cài đặt cookie' : 'Cookie settings', $text, "{$file} must say where to change the answer");

        // `/privacy#cookies` is linked from the consent bar and from the account app.
        Assert::assertMatchesRegularExpression('/\{#cookies\}|id="cookies"/', $text, "{$file} must keep the #cookies anchor");

        Assert::assertStringNotContainsString('cookie-less', $text);
    }
});

/**
 * The privacy policy's sources: the markdown in both languages once it exists
 * (resources/data/legal/{en,vi}/privacy.md), and until then the pre-rebuild
 * page. The legal pages' owner replaces one with the other; this test follows
 * without an edit, and fails if neither is there.
 *
 * @return array<string, string>
 */
function privacySources(): array
{
    $markdown = [];

    foreach (['en', 'vi'] as $locale) {
        $file = "resources/data/legal/{$locale}/privacy.md";

        if (is_file(base_path($file))) {
            $markdown[$file] = consentSource($file);
        }
    }

    if ($markdown !== []) {
        return $markdown;
    }

    $legacy = 'resources/js/pages/Privacy.tsx';

    return is_file(base_path($legacy)) ? [$legacy => consentSource($legacy)] : [];
}
