<?php

use PHPUnit\Framework\Assert;

/**
 * The theme, before anything paints (design-system §2.8; architecture §1.10).
 *
 * The site is light for anyone who has not chosen, dark or "system" for those
 * who have, and the choice lives in `localStorage.theme`, which the account app
 * on the same origin reads too. The decision has to be made by an inline script
 * in the head, before the stylesheet paints, or every dark reader sees a white
 * flash on every load. Everything here is invisible to a typecheck.
 */

/** The shared head partial, without its header comment. */
function themePartialBody(): string
{
    $partial = (string) file_get_contents(resource_path('views/partials/head-theme.blade.php'));

    return (string) preg_replace('/^\{\{--.*?--\}\}\n/s', '', $partial);
}

/** Every file under resources/ whose text a rule below scans. @return array<string, string> */
function themeScannedSources(): array
{
    $files = [];

    foreach (['js', 'css', 'views'] as $directory) {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(resource_path($directory), FilesystemIterator::SKIP_DOTS));

        foreach ($iterator as $file) {
            if ($file->isFile() && preg_match('/\.(tsx?|css|php)$/', $file->getFilename())) {
                $files[str_replace(base_path() . '/', '', $file->getPathname())] = (string) file_get_contents($file->getPathname());
            }
        }
    }

    return $files;
}

it('is the design system\'s script, verbatim, behind the shared header', function (): void {
    $partial = (string) file_get_contents(resource_path('views/partials/head-theme.blade.php'));

    expect(strtok($partial, "\n"))->toBe('{{-- Shared with TableProApp/web and TableProApp/license at resources/views/partials/head-theme.blade.php. Change both in the same release. See docs/shared-files.md. --}}');

    $spec = base_path('docs/rebuild/design/design-system.md');

    if (! is_file($spec)) {
        $this->markTestSkipped('The design-system document is not in this checkout.');
    }

    preg_match('/### 2\.8 Theme mechanics.*?```html\n(.*?)```/s', (string) file_get_contents($spec), $block);

    Assert::assertSame($block[1] ?? null, themePartialBody(), 'The partial must be design-system §2.8, byte for byte');
});

it('is light unless the reader chose otherwise, and survives storage that throws', function (): void {
    $script = themePartialBody();

    $default = strpos($script, "var choice = 'light';");
    $try = strpos($script, 'try {');
    $read = strpos($script, "localStorage.getItem('theme')");
    $catch = strpos($script, '} catch (e) {}');

    Assert::assertNotFalse($default, 'Light must be the starting choice');
    Assert::assertNotFalse($try);
    Assert::assertNotFalse($read, 'The choice is read from the shared `theme` key');
    Assert::assertNotFalse($catch);
    Assert::assertTrue($default < $try && $try < $read && $read < $catch, 'Storage must be read inside try, after light is set');

    // Only the three known values are accepted; anything else stays light.
    expect($script)->toContain("if (t === 'dark' || t === 'system' || t === 'light') { choice = t; }");
});

it('sets the class, the choice, the colour scheme and the browser colour before paint', function (): void {
    $script = themePartialBody();

    expect($script)->toContain("root.classList.add('dark')")
        ->toContain('root.dataset.themeChoice = choice;')
        ->toContain("root.style.colorScheme = dark ? 'dark' : 'light';")
        ->toContain("m.setAttribute('content', dark ? '#121212' : '#ffffff');");

    $tokens = (string) file_get_contents(resource_path('css/tokens.css'));

    expect($tokens)->toMatch('/\n:root \{[^}]*color-scheme: light;/s')
        ->toMatch('/\n\.dark \{[^}]*color-scheme: dark;/s');
});

it('renders one theme-color meta, before any stylesheet, on pages in both languages', function (string $path): void {
    $html = $this->get($path)->assertOk()->getContent();
    $head = substr($html, 0, (int) strpos($html, '</head>'));

    expect(substr_count($head, '<meta name="theme-color"'))->toBe(1);
    expect($head)->toContain('<meta name="theme-color" content="#ffffff">');

    $script = strpos($head, "localStorage.getItem('theme')");

    Assert::assertNotFalse($script);
    Assert::assertLessThan(strpos($head, '<link rel="icon"'), $script, 'The theme must be settled before anything else loads');
})->with(['/download', '/vi/download']);

it('reads and writes the same key in the head script and the theme module', function (): void {
    preg_match("/THEME_STORAGE_KEY = '([^']+)'/", (string) file_get_contents(resource_path('js/lib/theme.ts')), $key);

    Assert::assertSame('theme', $key[1] ?? null);
    expect(themePartialBody())->toContain("localStorage.getItem('{$key[1]}')");
});

it('never chooses an image or a colour by the operating system\'s preference', function (): void {
    /*
     * The theme class decides, never `prefers-color-scheme`: a light page is
     * the default for a reader whose system is dark, so a media-switched image
     * would put a dark screenshot on it (design-system §7.3). The head script
     * and theme.ts may ask the media query, but only to resolve "system".
     */
    $offenders = [];

    foreach (themeScannedSources() as $file => $text) {
        if (preg_match('/media=["\{]\s*["\'`]?\(prefers-color-scheme/', $text) || preg_match('/@media\s*\(prefers-color-scheme/', $text)) {
            $offenders[] = $file;
        }
    }

    Assert::assertSame([], $offenders, 'These switch on the OS preference instead of the theme class');
});

it('has no data-theme attribute selector left over from an earlier draft', function (): void {
    $offenders = array_keys(array_filter(themeScannedSources(), static fn(string $text): bool => (bool) preg_match('/\[data-theme[=\]]|data-theme=/', $text)));

    Assert::assertSame([], $offenders, 'The theme is the `.dark` class and `data-theme-choice`, nothing else');
});
