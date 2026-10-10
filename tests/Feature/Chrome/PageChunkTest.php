<?php

use App\Support\Localization\Locales;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use PHPUnit\Framework\Assert;

/** @return array<string, array<string, mixed>> */
function clientManifest(): array
{
    requireSsrJob();

    $path = public_path('build/manifest.json');

    if (! is_file($path)) {
        ssrUnavailable('Client bundle missing. Run: npm run build');
    }

    return json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
}

it('imports only the default language\'s UI catalog statically, and awaits the page\'s own', function (): void {
    // The entry chunk once carried twelve copies of the UI strings.
    $index = (string) file_get_contents(resource_path('js/i18n/index.ts'));

    preg_match_all("#^import \\w+ from './messages/([^/]+)/index\\.ts';#m", $index, $static);

    expect($static[1])->toBe([Locales::default()])
        ->and($index)->toContain("import.meta.glob<Messages>(['./messages/*/index.ts', '!./messages/" . Locales::default() . "/index.ts']")
        ->and((string) file_get_contents(resource_path('js/resolve-page.ts')))->toContain('loadMessages(locale)');
});

it('keeps every other language\'s catalog out of the entry chunk', function (): void {
    $manifest = clientManifest();
    $entry = $manifest['resources/js/app.tsx'];

    foreach (array_diff(Locales::codes(), [Locales::default()]) as $locale) {
        $catalog = "resources/js/i18n/messages/{$locale}/index.ts";

        Assert::assertArrayHasKey($catalog, $manifest, "{$catalog} has no entry in public/build/manifest.json");
        Assert::assertTrue($manifest[$catalog]['isDynamicEntry'] ?? false, "{$catalog} is not a chunk of its own");
        Assert::assertContains($catalog, $entry['dynamicImports'] ?? [], "app.tsx does not load {$catalog} on demand");
        Assert::assertNotContains($catalog, $entry['imports'] ?? [], "app.tsx imports {$catalog} statically");
    }
})->group('ssr');

it('sends a translated page its own language\'s catalog with the document, and no other', function (string $path, string $locale): void {
    $manifest = clientManifest();

    $this->withVite();

    $html = (string) $this->get($path)->assertOk()->getContent();

    foreach (array_diff(Locales::codes(), [Locales::default()]) as $code) {
        $script = '<script type="module" src="' . asset('build/' . $manifest["resources/js/i18n/messages/{$code}/index.ts"]['file']) . '"';

        expect(str_contains($html, $script))->toBe($code === $locale, "{$path} and the {$code} catalog");
    }
})->with([
    ['/pricing', 'en'],
    ['/vi/download', 'vi'],
    ['/pt-BR/pricing', 'pt-BR'],
    ['/zh-Hans', 'zh-Hans'],
])->group('ssr');

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
})->group('ssr');

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

    preg_match($script($manifest['resources/js/app.tsx']['file']), $html, $entry, PREG_OFFSET_CAPTURE);
    preg_match($script($chunk['file']), $html, $page, PREG_OFFSET_CAPTURE);

    expect($entry[0][1])->toBeLessThan($page[0][1]);
})->with([
    ['/', 'Home'],
    ['/pricing', 'Pricing'],
    ['/vi/download', 'Download'],
    ['/blog/tablepro-0-77', 'Blog/Post'],
])->group('ssr');

it('renders a component with no file without asking the manifest for it', function (): void {
    clientManifest();

    $this->withVite();

    Route::middleware('web')->get('/_test/no-such-component', fn() => Inertia::render('Nope/Missing'));

    $html = (string) $this->get('/_test/no-such-component')->assertOk()->getContent();

    expect($html)->not->toContain('Nope/Missing.tsx')
        ->toContain('"component":"Nope\/Missing"');
})->group('ssr');
