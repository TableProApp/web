<?php

use App\Services\Content\SiteFacts;
use App\Services\Legal\LegalDocuments;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;
use Spatie\YamlFrontMatter\YamlFrontMatter;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();
});

function brandSection(string $id): string
{
    $body = YamlFrontMatter::parse(File::get(resource_path('data/legal/en/brand.md')))->body();

    preg_match('/^## [^\n]*\{#' . preg_quote($id, '/') . '\}\n(.*?)(?=^## |\z)/ms', $body, $match);

    return $match[1] ?? '';
}

it('renders the brand guidelines in English, with the logo files at their marker', function (): void {
    $publisher = app(SiteFacts::class)->publisher('en');

    get('/brand')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Brand')
            ->where('document.title', 'Brand guidelines')
            ->where('document.path', '/brand')
            ->where('document.toc', fn($toc): bool => count($toc) > 1)
            ->where('document.html', fn(string $html): bool => str_contains($html, LegalDocuments::BRAND_ASSETS_MARKER)
                && ! str_contains($html, '<p>' . LegalDocuments::BRAND_ASSETS_MARKER)
                && str_contains($html, "is a trademark of {$publisher['name']}")
                && ! preg_match('/\{[a-zA-Z]+\}/', $html)));
});

it('exists in English only, and offers it in every other language', function (): void {
    $entry = app(PageRegistry::class)->find('landing.brand', []);

    expect($entry->renderLocales)->toBe(['en'])
        ->and($entry->indexableLocales)->toBe(['en'])
        ->and($entry->hreflangCluster())->toBe([]);

    get('/vi/brand')
        ->assertNotFound()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Error')
            ->where('suggestion.href', '/brand')
            ->where('suggestion.hreflang', 'en'));
});

it('reserves TablePro and TablePro for <X>, and asks for <Name> for TablePro', function (): void {
    expect(brandSection('marks'))->toContain('`TablePro for <X>`')->toContain('{publisherName}');
    expect(brandSection('naming'))->toContain('- `<Name> for TablePro`')->toContain('- `TablePro for <Name>`');
    expect(brandSection('notice'))->toContain('TablePro is a trademark of {publisherName}.');
    expect(brandSection('permission'))->toContain('[{email}](mailto:{email})');
    expect(brandSection('misuse'))->toContain('[{email}](mailto:{email})');
});

it('marks TablePro with ™ and names ® only to rule it out', function (): void {
    $source = File::get(resource_path('data/legal/en/brand.md'));

    expect($source)->toContain('TablePro™ is a trademark of {publisherName}.');
    expect(substr_count($source, '®'))->toBe(substr_count(brandSection('symbol'), '®'));
    expect(brandSection('symbol'))->toContain('never with ®')->toContain('never use ®');
});

it('credits the Model Trademark Guidelines and OpenJS, and licenses its text under CC BY 4.0', function (): void {
    $credits = brandSection('credits');

    expect($credits)
        ->toContain('derived from the Model Trademark Guidelines, available at [www.modeltrademarkguidelines.org](http://www.modeltrademarkguidelines.org)')
        ->toContain('(https://creativecommons.org/licenses/by/3.0/)')
        ->toContain('(https://trademark-policy.openjsf.org)')
        ->toContain('The text of these guidelines is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).');
});

it('server-renders every file as a download, with the preview sizes and colors', function (): void {
    $html = ssrHtml('/brand');
    $brand = json_decode(File::get(resource_path('data/brand.json')), true, 512, JSON_THROW_ON_ERROR);
    $start = strpos($html, 'id="assets"');
    $end = strpos($html, 'id="marks"', (int) $start);
    $section = substr($html, (int) $start, (int) $end - (int) $start);

    expect($start)->not->toBeFalse();

    foreach ($brand['assets'] as $asset) {
        foreach ($asset['variants'] as $variant) {
            foreach ($variant['files'] as $file) {
                expect($section)->toContain('href="' . $file['src'] . '" download=""');
            }

            expect($section)->toMatch('#<img src="' . preg_quote($variant['preview'], '#') . '" width="\d+" height="\d+"#');
        }
    }

    foreach ($brand['colors'] as $color) {
        expect($section)->toContain($color['hex']);
    }

    // The marker stays in the page props (the JSON payload); the markup must not carry it.
    $markup = (string) preg_replace('#<script data-page="app" type="application/json">.*?</script>#s', '', $html);
    expect($markup)->not->toContain('<brand-assets>');
})->group('ssr');
