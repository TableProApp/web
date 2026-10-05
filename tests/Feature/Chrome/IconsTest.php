<?php

use PHPUnit\Framework\Assert;

/*
 * The tab icon, the home-screen icon and the web manifest's icon are fetched on
 * a reader's first visit, ahead of anything they came to read. The logo was a
 * 156 KB, 16-bit PNG serving all three; each is now an 8-bit PNG well under
 * 25 KB, at the size the page declares for it.
 */

const ICON_BUDGET_BYTES = 25 * 1024;

/**
 * Asserts a public PNG exists at the declared size and within the budget.
 */
function expectSmallIcon(string $href, int $size): void
{
    $file = public_path(ltrim($href, '/'));

    Assert::assertFileExists($file, "{$href} is linked but missing from public/");

    $info = getimagesize($file);

    Assert::assertIsArray($info, "{$href} is not an image");
    Assert::assertSame(IMAGETYPE_PNG, $info[2], "{$href} is not a PNG");
    Assert::assertSame([$size, $size], [$info[0], $info[1]], "{$href} is not {$size}x{$size}");
    Assert::assertLessThanOrEqual(ICON_BUDGET_BYTES, filesize($file), "{$href} weighs " . filesize($file) . ' bytes');
}

it('links a small tab icon and a 180px home-screen icon on every page', function (string $path): void {
    $html = (string) $this->get($path)->getContent();

    expect($html)->toContain('<link rel="icon" type="image/png" sizes="256x256" href="/logo.png" />')
        ->toContain('<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />')
        ->toContain('<link rel="manifest" href="/site.webmanifest" />');

    expectSmallIcon('/logo.png', 256);
    expectSmallIcon('/apple-touch-icon.png', 180);
})->with(['/', '/vi/pricing', '/no-such-page']);

it('keeps every web manifest icon small and the size it claims', function (): void {
    $manifest = json_decode((string) file_get_contents(public_path('site.webmanifest')), true, 512, JSON_THROW_ON_ERROR);

    expect($manifest['icons'])->not->toBeEmpty();

    foreach ($manifest['icons'] as $icon) {
        [$width] = explode('x', $icon['sizes']);

        expect($icon['type'])->toBe('image/png');
        expectSmallIcon($icon['src'], (int) $width);
    }
});

it('keeps the logo the structured data and the error pages name', function (): void {
    expect((string) file_get_contents(resource_path('js/lib/structured-data.ts')))->toContain("absoluteUrl(baseUrl, '/logo.png')")
        ->and((string) file_get_contents(resource_path('views/errors/layout.blade.php')))->toContain('src="/logo.png"');

    // Google's minimum for an organization logo is 112px square.
    expectSmallIcon('/logo.png', 256);
});
