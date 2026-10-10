<?php

use PHPUnit\Framework\Assert;

/** @return array<string, string> */
function regionalSources(): array
{
    $sources = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(resource_path('js'), FilesystemIterator::SKIP_DOTS));

    foreach ($iterator as $file) {
        if ($file->isFile() && preg_match('/\.tsx?$/', $file->getFilename())) {
            $sources[str_replace(resource_path('js') . '/', '', $file->getPathname())] = (string) file_get_contents($file->getPathname());
        }
    }

    ksort($sources);

    return $sources;
}

// The plan block is the one place the site names a regional price (positioning §9).
it('asks for the regional discount from the plan block only', function (): void {
    $asks = [];
    $names = [];

    foreach (regionalSources() as $file => $text) {
        if ($file !== 'hooks/use-regional-pricing.ts' && str_contains($text, 'useRegionalPricing()')) {
            $asks[] = $file;
        }

        if (str_contains($text, 'm.pricing.regional')) {
            $names[] = $file;
        }
    }

    expect($asks)->toBe(['components/pricing/pricing-plans.tsx'])
        ->and($names)->toBe(['components/pricing/pricing-card.tsx', 'components/pricing/regional-note.tsx']);
});

// The cards ask for the discount after rendering, so cached HTML and first paint carry the list prices.
it('serves the list prices to every reader, with nothing struck through', function (string $path): void {
    config(['payment.provider' => 'polar']);

    $html = ssrHtml($path);

    Assert::assertStringNotContainsString('<s ', $html, "{$path} strikes a price in the server render");
    Assert::assertStringNotContainsString('<s>', $html, "{$path} strikes a price in the server render");
})->with(['/pricing', '/', '/vi/pricing'])->group('ssr');
