<?php

use PHPUnit\Framework\Assert;

/**
 * The regional discount on the plan cards: the one place the site names a
 * regional price (positioning §9, "Deliberately absent").
 *
 * The platform decides it (`GET /discount/region`, the same answer checkout
 * acts on), and the cards show it only after the page has rendered. So the
 * cached HTML, the structured data and every reader's first paint carry the
 * list prices, and nothing outside the plan block ever mentions a discount
 * by country. What the cards compute is tests/js/regional-pricing.test.ts.
 */

/** Every TypeScript source under resources/js, keyed by its path from there. @return array<string, string> */
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

it('fetches the platform\'s answer without credentials, and only after rendering', function (): void {
    $hook = (string) file_get_contents(resource_path('js/hooks/use-regional-pricing.ts'));

    expect($hook)->toContain("fetch('/discount/region', { credentials: 'omit'")
        ->toContain('useState<Regional | null>(null)')
        ->toContain('useEffect(');
});

it('serves the list prices to every reader, with nothing struck through', function (string $path): void {
    config(['payment.provider' => 'polar']);

    $html = ssrHtml($path);

    Assert::assertStringNotContainsString('<s ', $html, "{$path} strikes a price in the server render");
    Assert::assertStringNotContainsString('<s>', $html, "{$path} strikes a price in the server render");
})->with(['/pricing', '/', '/vi/pricing'])->group('ssr');
