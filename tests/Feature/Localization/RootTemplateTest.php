<?php

use App\Http\Controllers\IosController;
use App\Support\Assets\AssetManifest;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * resources/views/app.blade.php, the one template every page is served in.
 *
 * Its head runs before any stylesheet or bundle, so mistakes here are
 * invisible to the React tests: a flash of the wrong theme, a preload for a
 * placeholder that never loads, a chat widget setting cookies before anyone
 * asked for it.
 */
function headOf(string $html): string
{
    return substr($html, 0, (int) strpos($html, '</head>'));
}

it('paints the theme before anything else, the system\'s unless chosen', function (): void {
    $head = headOf($this->get('/download')->getContent());

    $theme = strpos($head, "localStorage.getItem('theme')");

    expect($theme)->not->toBeFalse();
    expect($theme)->toBeLessThan(strpos($head, '<link rel="icon"'));
    expect($head)->toContain("var choice = 'system';");
    expect(substr_count($head, '<meta name="theme-color"'))->toBe(1);
    expect($head)->not->toContain('prefers-color-scheme: light');
    expect($head)->not->toContain('media="(prefers-color-scheme');
});

it('includes the shared theme partial verbatim from the design system', function (): void {
    $spec = (string) file_get_contents(base_path('docs/rebuild/design/design-system.md'));

    preg_match('/### 2\.8 Theme mechanics.*?```html\n(.*?)```/s', $spec, $match);

    if (! isset($match[1])) {
        $this->markTestSkipped('The design-system document is not in this checkout.');
    }

    $partial = (string) file_get_contents(resource_path('views/partials/head-theme.blade.php'));

    expect(substr($partial, strpos($partial, "\n") + 1))->toBe($match[1]);
    expect($partial)->toStartWith('{{-- Shared with TableProApp/web and TableProApp/license at resources/views/partials/head-theme.blade.php.');
});

it('loads no third-party script until it is asked for', function (): void {
    config(['services.crisp.website_id' => 'test-crisp-id', 'payment.provider' => 'polar']);

    $html = $this->get('/')->getContent();

    expect($html)
        ->not->toContain('client.crisp.chat')
        ->not->toContain('CRISP_WEBSITE_ID')
        ->not->toContain('@polar-sh/checkout')
        ->not->toContain('lemon.js');

    /*
     * The retired hero preload lived in the head. The legacy hero still shows
     * that screenshot in the server-rendered body until the homepage is rebuilt,
     * so only the head is checked.
     */
    expect(headOf($html))->not->toContain('/images/app-light-1920.webp');

    config(['payment.provider' => 'lemonsqueezy']);

    expect($this->get('/')->getContent())->not->toContain('lemon.js');
});

it('keeps overflow clipping off the document', function (): void {
    $html = $this->get('/')->getContent();

    preg_match('/<html[^>]*>/', $html, $root);
    preg_match('/<body[^>]*>/', $html, $body);

    expect($root[0])->not->toContain('overflow-x-hidden');
    expect($body[0])->not->toContain('overflow-x-hidden');
});

it('drops the Plex Mono 600 preload', function (): void {
    expect($this->get('/')->getContent())->not->toContain('ibm-plex-mono-latin-600');
});

/**
 * Runs the head's LCP script in node against a stand-in document, with or
 * without `.dark` on the root, and returns the `<link>` attributes it created.
 *
 * The script is executed, not grepped: an earlier version read
 * `variant.srcset` from what had become a list, which every source assertion
 * passed while a real browser requested `/undefined` on each load.
 *
 * @return list<array<string, string>>
 */
function runLcpScript(string $head, bool $dark): array
{
    preg_match_all('#<script>(.*?)</script>#s', $head, $scripts);
    $script = collect($scripts[1])->first(fn(string $body): bool => str_contains($body, 'imagesrcset'));

    expect($script)->not->toBeNull();

    $stub = 'const links = [];'
        . 'globalThis.document = {'
        . '  documentElement: { classList: { contains: (name) => name === "dark" && ' . ($dark ? 'true' : 'false') . ' } },'
        . '  createElement: () => { const attrs = {}; return new Proxy(attrs, { set(target, key, value) { target[key] = String(value); return true; }, get(target, key) { return key === "setAttribute" ? (name, value) => { target[name] = String(value); } : target[key]; } }); },'
        . '  head: { appendChild: (link) => links.push({ ...link }) },'
        . '};';

    $result = Process::input($stub . $script . ';process.stdout.write(JSON.stringify(links));')->run(['node', '-']);

    expect($result->successful())->toBeTrue($result->errorOutput());

    return json_decode($result->output(), true, flags: JSON_THROW_ON_ERROR);
}

it('preloads a supplied LCP image for the resolved theme, one link per image, and nothing for a placeholder', function (): void {
    $descriptor = (new AssetManifest(base_path('tests/Fixtures/assets/manifest.json')))->lcpDescriptor('fixture-hero', 'en');

    Route::middleware('web')->get('/_test/lcp', fn() => Inertia::render('Error', [
        'status' => 404,
        'lcpAsset' => $descriptor,
    ]));

    $head = headOf($this->get('/_test/lcp')->getContent());

    /*
     * After the theme script, so `.dark` is already decided when it picks a
     * theme's list.
     */
    expect(strpos($head, 'fixture-hero-light-32.avif'))->toBeGreaterThan(strpos($head, "localStorage.getItem('theme')"));

    foreach ([false => 'light', true => 'dark'] as $dark => $theme) {
        $links = runLcpScript($head, (bool) $dark);

        expect($links)->toHaveCount(2);
        expect(json_encode($links))->not->toContain('undefined');

        foreach ($links as $index => $link) {
            $expected = $descriptor[$theme][$index];

            expect($link)->toMatchArray([
                'rel' => 'preload',
                'as' => 'image',
                'type' => $expected['type'],
                'media' => $expected['media'],
                'imagesrcset' => $expected['srcset'],
                'imagesizes' => $expected['sizes'],
                'fetchpriority' => 'high',
            ]);
        }

        expect($links[0]['media'])->toBe('(min-width: 768px)');
        expect($links[1]['media'])->toBe('(max-width: 767.98px)');
        expect($links[0]['imagesrcset'])->toContain("fixture-hero-{$theme}-");
        expect($links[1]['imagesrcset'])->toContain("fixture-hero-mobile-{$theme}-");
    }

    expect(headOf($this->get('/download')->getContent()))->not->toContain('imagesrcset');
});

it('builds the /ios preload with the sizes its iPad slot renders with', function (): void {
    $manifest = new AssetManifest(base_path('tests/Fixtures/assets/manifest.json'));
    $sizes = IosController::IPAD_SIZES;

    $preload = $manifest->lcpDescriptor('fixture-hero', 'en', priority: true, sizes: $sizes);

    // The main image takes the placement's sizes; the phone crop keeps its kind's, as asset-model.ts does.
    expect($preload['light'][0]['sizes'])->toBe($sizes);
    expect($preload['light'][1]['sizes'])->toBe('calc(100vw - 32px)');

    $page = (string) file_get_contents(resource_path('js/pages/Ios.tsx'));

    expect($page)->toContain('<AssetSlot id="ipad-table-browse" priority sizes={ipadSizes} />');
    expect($page)->not->toContain('sizes="(min-width');
});
