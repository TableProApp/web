<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use PHPUnit\Framework\Assert;

/*
 * Pages are lazy chunks (`@inertiajs/vite` resolves them with a non-eager
 * glob), so the browser used to discover a page's code only after app.tsx had
 * run: one more round trip before hydration on every first visit. The root
 * template names the page's own file as a `@vite` entry, which sends its
 * modulepreload, and those of everything it imports, with the document.
 *
 * Every component a registry page renders has a file (SeoSmokeTest), and so
 * does the error page. These tests hold the template to that, and, once the
 * client bundle is built, check the manifest has a key for every page file.
 */

/**
 * The client manifest, or a skip (a failure under REQUIRE_SSR) without a build.
 *
 * @return array<string, array<string, mixed>>
 */
function clientManifest(): array
{
    $path = public_path('build/manifest.json');

    if (! is_file($path)) {
        ssrUnavailable('Client bundle missing. Run: npm run build');
    }

    return json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
}

it('names the page component as a @vite entry, only when its file exists', function (): void {
    $blade = (string) file_get_contents(resource_path('views/app.blade.php'));

    expect($blade)->toContain("@php(\$pageEntry = 'resources/js/pages/' . (\$page['component'] ?? '') . '.tsx')")
        ->toContain("@vite(array_values(array_filter(['resources/css/app.css', 'resources/js/app.tsx', is_file(base_path(\$pageEntry)) ? \$pageEntry : null])))");
});

it('renders the error page from a file that exists', function (): void {
    $this->get('/no-such-page')->assertNotFound();

    Assert::assertFileExists(resource_path('js/pages/Error.tsx'));
});

it('has a manifest key for every page file', function (): void {
    $manifest = clientManifest();

    $pages = collect(new RecursiveIteratorIterator(new RecursiveDirectoryIterator(resource_path('js/pages'), FilesystemIterator::SKIP_DOTS)))
        ->filter(fn(SplFileInfo $file): bool => $file->getExtension() === 'tsx')
        ->map(fn(SplFileInfo $file): string => 'resources/js/pages/' . str_replace(DIRECTORY_SEPARATOR, '/', substr($file->getPathname(), strlen(resource_path('js/pages')) + 1)))
        ->values();

    expect($pages)->not->toBeEmpty();

    foreach ($pages as $page) {
        Assert::assertArrayHasKey($page, $manifest, "{$page} has no entry in public/build/manifest.json");
    }
});

it('sends the page chunk and its imports with the document', function (string $path, string $component): void {
    $manifest = clientManifest();

    $this->withVite();

    $html = (string) $this->get($path)->assertOk()->getContent();
    $chunk = $manifest["resources/js/pages/{$component}.tsx"];
    $preload = fn(string $file): string => '#<link rel="modulepreload"[^>]*\shref="[^"]*/build/' . preg_quote($file, '#') . '"#';
    $script = fn(string $file): string => '#<script type="module" src="[^"]*/build/' . preg_quote($file, '#') . '"#';

    expect($html)->toMatch($preload($chunk['file']))
        ->toMatch($script($chunk['file']));

    foreach ($chunk['imports'] ?? [] as $import) {
        expect($html)->toMatch($preload($manifest[$import]['file']));
    }

    // The app's entry still runs first, so the app boots as before.
    preg_match($script($manifest['resources/js/app.tsx']['file']), $html, $entry, PREG_OFFSET_CAPTURE);
    preg_match($script($chunk['file']), $html, $page, PREG_OFFSET_CAPTURE);

    expect($entry[0][1])->toBeLessThan($page[0][1]);
})->with([
    ['/', 'Home'],
    ['/pricing', 'Pricing'],
    ['/vi/download', 'Download'],
    ['/blog/tablepro-0-77', 'Blog/Post'],
]);

it('renders a component with no file without asking the manifest for it', function (): void {
    clientManifest();

    $this->withVite();

    Route::middleware('web')->get('/_test/no-such-component', fn() => Inertia::render('Nope/Missing'));

    $html = (string) $this->get('/_test/no-such-component')->assertOk()->getContent();

    expect($html)->not->toContain('Nope/Missing.tsx')
        ->toContain('"component":"Nope\/Missing"');
});
