<?php

use PHPUnit\Framework\Assert;

/*
 * Layout defects that screenshots and probes found during the integration
 * checks, each held by the cheapest check that fails when it comes back. Most
 * are source assertions, because a component's class list is what decides them
 * and the suite renders no browser layout; the server-rendered ones read SSR
 * markup.
 */

function layoutSource(string $path): string
{
    return (string) file_get_contents(resource_path($path));
}

it('keeps a table\'s hidden words inside its own scroll region', function (): void {
    /*
     * `sr-only` is `position: absolute`. With a static region, the hidden
     * "Included" / "Not available" words of a column scrolled out of view
     * escaped the overflow clip and widened the document to 532px at 375.
     */
    $table = layoutSource('js/components/ui/data-table.tsx');

    expect($table)->toMatch("/role=\"region\"[^>]*className=\\{cn\\('relative overflow-x-auto/");
});

it('lets no table force a phone-width scroll: minimum widths start at 640px or wider', function (): void {
    /*
     * Tables fold their secondary columns into the first cell below 640px
     * (design-system §5.3.10) instead of keeping a minimum width that pushed
     * the competitor column, the plan columns or the notes off screen.
     */
    $files = array_merge(glob(resource_path('js/components/**/*.tsx')), glob(resource_path('js/pages/**/*.tsx')), glob(resource_path('js/pages/*.tsx')));
    $checked = 0;

    foreach ($files as $file) {
        $source = (string) file_get_contents($file);

        if (preg_match_all('/<DataTable\b[^>]*>/s', $source, $tags) === 0) {
            continue;
        }

        foreach ($tags[0] as $tag) {
            $checked++;
            Assert::assertDoesNotMatchRegularExpression('/(?<![a-z]:)min-w-\[/', $tag, basename($file) . ' gives a DataTable a minimum width below 640px: ' . $tag);
        }
    }

    expect($checked)->toBeGreaterThanOrEqual(7);
});

it('shows a visible table caption above the scroll region, so it never scrolls or clips', function (): void {
    $table = layoutSource('js/components/ui/data-table.tsx');

    expect($table)->toContain('<p aria-hidden="true" className="type-small mb-3 text-muted-foreground">')
        ->and($table)->toContain('<caption id={captionId} className="sr-only">');
});

it('paints a sticky first column with its section\'s ground, not --raised', function (): void {
    expect(layoutSource('js/components/ui/data-table.tsx'))->toContain('bg-[color:var(--table-ground,var(--background))]')
        ->not->toContain(':bg-raised');
    expect(layoutSource('js/components/ui/section.tsx'))->toContain("'bg-surface [--table-ground:var(--surface)]'");
});

it('puts every section on the page grid\'s left edge, whatever its measure', function (): void {
    /*
     * A `text` section used to be a centred 704px Container, so its heading
     * jumped 256px right of the H1 and the sections around it (§3.4, §4.2).
     */
    $section = layoutSource('js/components/ui/section.tsx');

    expect($section)->toContain('<Container>')
        ->not->toContain('<Container width={width}>')
        ->toContain("text: 'max-w-[44rem]'");
    expect(layoutSource('js/pages/Pricing.tsx'))->not->toContain('<Container width="text"');
});

it('spaces neighbouring sections one rhythm apart, not two', function (): void {
    expect(layoutSource('js/components/ui/section.tsx'))->toContain("data-rhythm={tone === 'base' && !ruled ? 'collapse' : undefined}");
    expect(layoutSource('css/app.css'))->toMatch('/section\[data-rhythm="collapse"\] \+ section\[data-rhythm="collapse"\] \{\s*padding-top: 0;/');
});

it('keeps a link\'s arrow on the line of its last word', function (): void {
    expect(layoutSource('js/components/ui/text-link.tsx'))->toMatch("/standalone:\\s*'inline text-sm/")
        ->not->toContain("standalone:\n        'inline-flex");
    expect(layoutSource('js/components/site/site-footer.tsx'))->toContain("'type-small inline-block py-[5px]")
        ->not->toContain("'inline-flex min-h-8 items-center gap-1");
});

it('draws shortcut glyphs in a face that has them, as an inline box', function (): void {
    preg_match("/<kbd\\s+className=\\{cn\\(\\s*'([^']+)'/", layoutSource('js/components/ui/kbd.tsx'), $classes);

    expect($classes[1] ?? '')->toContain('[font-family:system-ui,-apple-system,"Segoe_UI_Symbol",sans-serif]')
        ->not->toContain('font-mono')
        ->not->toContain('inline-flex');
});

it('marks the current section in the mobile menu', function (): void {
    $nav = layoutSource('js/components/site/mobile-nav.tsx');

    expect($nav)->toContain('const CURRENT_ROW =')
        ->toContain("aria-current={inFeatures ? 'true' : undefined}")
        ->toContain("{...link('/pricing')}");
});

it('draws the header nav focus ring around the label, not the 64px link', function (): void {
    expect(layoutSource('js/components/site/site-links.ts'))->toContain('group-focus-visible:outline-2');
    expect(layoutSource('js/components/site/site-header.tsx'))->toContain('focus-visible:outline-none')->toContain('<span className={NAV_LABEL}>');
    expect(layoutSource('js/components/site/features-menu.tsx'))->toContain('<span className={NAV_LABEL}>');
});

it('builds every download band from the one action row', function (string $file): void {
    expect(layoutSource($file))->toContain('<ActionPair');
})->with([
    'js/components/home/platform-actions.tsx',
    'js/components/features/download-band.tsx',
    'js/components/databases/download-band.tsx',
]);

it('server-renders the plan matrix with all four columns and no phone minimum width', function (): void {
    $html = ssrHtml('/pricing');

    preg_match('#<section id="features".*?</section>#s', $html, $section);

    expect($section[0] ?? '')->toContain('class="relative overflow-x-auto')
        ->not->toContain('min-w-[36rem]');
});

it('does not repeat the contact line under a document that has its own Contact section', function (string $path, bool $repeats): void {
    // The markup only: the catalog line also travels in the page props.
    $markup = (string) preg_replace('#<script data-page="app" type="application/json">.*?</script>#s', '', ssrHtml($path));

    expect(str_contains($markup, 'Questions about this page?') || str_contains($markup, 'Bạn có câu hỏi về trang này?'))->toBe($repeats);
})->with([
    ['/privacy', false],
    ['/vi/privacy', false],
    ['/terms', false],
    ['/refund-policy', true],
]);

it('keeps a busy button focusable, so the reader who pressed it keeps their place', function (): void {
    /*
     * `loading` set the native `disabled`, which drops focus to <body> mid
     * request (WCAG 2.4.3). A busy button is `aria-disabled` and swallows the
     * click, a submit included; the email field is read-only, not disabled.
     */
    $button = layoutSource('js/components/ui/button.tsx');

    expect($button)->toContain('disabled={disabled}')
        ->toContain('aria-disabled={(loading && !disabled) || undefined}')
        ->toContain('onClick={loading ? (event: MouseEvent<HTMLButtonElement>) => event.preventDefault() : onClick}');

    foreach (['js/components/site/site-footer.tsx', 'js/components/blog/newsletter-signup.tsx'] as $form) {
        expect(layoutSource($form))->toContain('readOnly={form.processing}')->not->toContain('disabled={form.processing}');
    }

    expect(layoutSource('js/hooks/use-email-form.ts'))->toContain("if (processing) {\n            return;\n        }");
});

it('drops a discount check whose code was edited while it ran', function (): void {
    $field = layoutSource('js/components/pricing/discount-field.tsx');

    expect($field)->toContain('const mine = ++ticket.current;')
        ->toContain('if (!current()) {')
        ->toContain('ticket.current++;');
});
