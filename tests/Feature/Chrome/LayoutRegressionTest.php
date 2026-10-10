<?php

use PHPUnit\Framework\Assert;

function layoutSource(string $path): string
{
    return (string) file_get_contents(resource_path($path));
}

it('lets no table force a phone-width scroll: minimum widths start at 640px or wider', function (): void {
    // A minimum width pushed the competitor, plan and notes columns off a phone screen.
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
    // A centred 704px `text` section put its heading 256px right of the H1.
    $section = layoutSource('js/components/ui/section.tsx');

    expect($section)->not->toContain('<Container width={width}>')
        ->toContain("text: 'max-w-[44rem]'");

    expect(layoutSource('js/pages/Pricing.tsx'))->not->toContain('<Container width="text"');
    expect(layoutSource('js/pages/Faq.tsx'))->not->toContain('width="text"');
});

it('spaces neighbouring sections one rhythm apart, with the join in the middle', function (): void {
    // The old collapse rule took the second section's top padding and put the join flush on its heading.
    expect(layoutSource('js/components/ui/section.tsx'))->toContain("'py-8 md:py-10 xl:py-12'")
        ->not->toContain('data-rhythm');
    expect(layoutSource('css/app.css'))->not->toContain('data-rhythm');
});

it('keeps a link\'s arrow on the line of its last word', function (): void {
    expect(layoutSource('js/components/ui/text-link.tsx'))->toMatch("/standalone:\\s*'inline text-sm/")
        ->not->toContain("standalone:\n        'inline-flex");
    expect(layoutSource('js/components/site/site-footer.tsx'))->not->toContain("'inline-flex min-h-8 items-center gap-1");
});

it('draws shortcut glyphs in a face that has them, as an inline box', function (): void {
    preg_match("/<kbd\\s+className=\\{cn\\(\\s*'([^']+)'/", layoutSource('js/components/ui/kbd.tsx'), $classes);

    expect($classes[1] ?? '')->toContain('[font-family:system-ui,-apple-system,"Segoe_UI_Symbol",sans-serif]')
        ->not->toContain('font-mono')
        ->not->toContain('inline-flex');
});

it('draws the phone breadcrumb link as a block of its own', function (): void {
    // Inline, the phone link was contrast-checked against the hidden trail's text: 2.28:1 in the dark theme.
    expect(layoutSource('js/components/ui/breadcrumbs.tsx'))->toContain('className="flex min-h-8 w-fit items-center gap-1.5')
        ->not->toContain('className="inline-flex min-h-8');
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

it('opens the Features panel on mouse hover, and only for a mouse', function (): void {
    // Touch and pen send pointer events too, and opening on them would fight the tap that follows.
    $menu = layoutSource('js/components/site/features-menu.tsx');

    expect($menu)->toContain('onPointerEnter={onPointerEnter}')
        ->toContain('onPointerLeave={onPointerLeave}')
        ->toContain("if (event.pointerType !== 'mouse') {")
        ->toContain('export const HOVER_OPEN_DELAY = 80;')
        ->toContain('export const HOVER_CLOSE_DELAY = 150;')
        ->toContain('if (open && openedByHover.current) {')
        ->toContain('aria-expanded={open}');
});

it('draws the App Store badge first on an iPhone or iPad, and keeps Mac first in the markup', function (): void {
    // CSS order under the head's `ios` class, so the two actions never swap under a finger after paint.
    $pair = layoutSource('js/components/download/action-pair.tsx');
    $menu = layoutSource('js/components/site/mobile-nav.tsx');
    $template = layoutSource('views/app.blade.php');

    expect($pair)->toContain('<div className="grid content-start justify-items-start gap-2 in-[.ios]:order-first">');
    Assert::assertLessThan(strpos($pair, '{iosAction}'), strpos($pair, '{mac}'), 'The Mac action comes first in the markup');

    expect($menu)->toContain('<div className="grid justify-items-start gap-2 in-[.ios]:order-first">');

    Assert::assertLessThan(strpos($template, '<body class='), strpos($template, "document.documentElement.classList.add('ios')"), 'The device class is set before first paint');
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

    // In a static region the sr-only cell words escaped the overflow clip and widened the page to 532px at 375.
    expect($section[0] ?? '')->toMatch('/<div role="region"[^>]*class="relative overflow-x-auto/')
        ->not->toContain('min-w-[36rem]');
})->group('ssr');

it('does not repeat the contact line under a document that has its own Contact section', function (string $path, bool $repeats): void {
    // The markup only: the catalog line also travels in the page props.
    $markup = (string) preg_replace('#<script data-page="app" type="application/json">.*?</script>#s', '', ssrHtml($path));

    expect(str_contains($markup, 'Questions about this page?') || str_contains($markup, 'Bạn có câu hỏi về trang này?'))->toBe($repeats);
})->with([
    ['/privacy', false],
    ['/vi/privacy', false],
    ['/terms', false],
    ['/refund-policy', true],
])->group('ssr');

it('keeps a busy button focusable, so the reader who pressed it keeps their place', function (): void {
    // A native `disabled` dropped focus to <body> mid request (WCAG 2.4.3).
    $button = layoutSource('js/components/ui/button.tsx');

    expect($button)->toContain('disabled={disabled}')
        ->toContain('aria-disabled={(loading && !disabled) || undefined}')
        ->toContain('onClick={loading ? (event: MouseEvent<HTMLButtonElement>) => event.preventDefault() : onClick}');

    foreach (['js/components/site/site-footer.tsx', 'js/components/blog/newsletter-signup.tsx'] as $form) {
        expect(layoutSource($form))->toContain('readOnly={form.processing}')->not->toContain('disabled={form.processing}');
    }

    expect(layoutSource('js/hooks/use-email-form.ts'))->toContain("if (processing) {\n            return;\n        }");
});

it('keeps the billing-cycle control with the prices it changes while the plan cards are stacked', function (): void {
    // At 390x844 the control sat 1,200px above the Team price, so a tap changed nothing on screen.
    $control = layoutSource('js/components/pricing/billing-cycle-control.tsx');

    expect($control)->toContain('max-lg:[@media(min-height:40rem)]:sticky')
        ->toContain('max-lg:top-16')
        ->not->toContain('caption={');

    // The caption keeps the height of the longest cycle's, so a tap on the pinned row moves no price.
    expect($control)->toContain('className="type-small invisible col-start-1 row-start-1"');

    // A focused control in a card must not scroll in under the pinned row; the row's own radios must not scroll at all.
    expect(layoutSource('js/components/pricing/pricing-plans.tsx'))->toContain('max-lg:[&_:is(a,button,input:not([type=radio]),summary)]:scroll-mt-14');

    expect(layoutSource('js/components/ui/segmented-control.tsx'))->toContain('pointer-coarse:min-h-11');
});

it('totals the seats as they are typed, and says when a typed count was changed', function (): void {
    // The card showed "5 seats" beside a field that read 50, and clamped 3 to 5 without a word.
    $card = layoutSource('js/components/pricing/pricing-card.tsx');

    expect($card)->toContain('onChange={follow}')
        ->toContain('onBlur={(event) => settle(event.target)}')
        ->toContain('fmt(bound ? m.pricing.seats.clamped[bound] : m.pricing.seats.bounds, { min, max })');
});

it('drops a discount check whose code was edited while it ran', function (): void {
    $field = layoutSource('js/components/pricing/discount-field.tsx');

    expect($field)->toContain('const mine = ++ticket.current;')
        ->toContain('if (!current()) {')
        ->toContain('ticket.current++;');
});
