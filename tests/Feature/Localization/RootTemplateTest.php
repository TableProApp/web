<?php

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

it('paints the theme before anything else, light unless chosen', function (): void {
    $head = headOf($this->get('/download')->getContent());

    $theme = strpos($head, "localStorage.getItem('theme')");

    expect($theme)->not->toBeFalse();
    expect($theme)->toBeLessThan(strpos($head, '<link rel="icon"'));
    expect($head)->toContain("var choice = 'light';");
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

it('preloads a supplied LCP image for the resolved theme, and nothing for a placeholder', function (): void {
    Route::middleware('web')->get('/_test/lcp', fn() => Inertia::render('Error', [
        'status' => 404,
        'lcpAsset' => [
            'light' => ['srcset' => '/images/x-light-1216.avif 1216w', 'sizes' => '(min-width: 1280px) 1216px, 100vw', 'type' => 'image/avif'],
            'dark' => ['srcset' => '/images/x-dark-1216.avif 1216w', 'sizes' => '(min-width: 1280px) 1216px, 100vw', 'type' => 'image/avif'],
        ],
    ]));

    $head = headOf($this->get('/_test/lcp')->getContent());

    expect($head)
        ->toContain("link.setAttribute('imagesrcset', variant.srcset)")
        ->toContain('x-light-1216.avif')
        ->toContain('x-dark-1216.avif')
        ->toContain("link.setAttribute('fetchpriority', 'high')");

    /*
     * After the theme script, so `.dark` is already decided when it picks a
     * variant.
     */
    expect(strpos($head, 'x-light-1216.avif'))->toBeGreaterThan(strpos($head, "localStorage.getItem('theme')"));

    expect(headOf($this->get('/download')->getContent()))->not->toContain('imagesrcset');
});
