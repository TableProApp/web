<?php

use PHPUnit\Framework\Assert;

/** @return array<string, array{string}> */
function frameTemplates(): array
{
    $paths = ['/', '/vi', '/pricing', '/download', '/ios', '/faq', '/about', '/security', '/privacy', '/blog', '/blog/tablepro-0-77', '/features', '/features/querying', '/databases', '/postgresql-client', '/compare', '/compare/tableplus'];

    return array_combine($paths, array_map(fn(string $path): array => [$path], $paths));
}

function frameXPath(string $html): DOMXPath
{
    $document = new DOMDocument();
    $previous = libxml_use_internal_errors(true);
    $document->loadHTML('<?xml encoding="UTF-8">' . $html);
    libxml_clear_errors();
    libxml_use_internal_errors($previous);

    return new DOMXPath($document);
}

/** @return list<string> */
function frameClasses(DOMElement $element): array
{
    return array_values(array_filter(explode(' ', $element->getAttribute('class'))));
}

function frameCss(): string
{
    return (string) file_get_contents(resource_path('css/frame.css'));
}

function frameAssertRails(DOMXPath $xpath): void
{
    $rails = $xpath->query('//*[@data-frame-rails]');

    expect($rails->length)->toBe(2);
    expect($xpath->query('//header//*[@data-frame-rails]')->length)->toBe(1, 'The opaque sticky header draws its own stretch of the rails');

    foreach ($rails as $rail) {
        expect($rail->getAttribute('aria-hidden'))->toBe('true');
        expect(frameClasses($rail))->toContain('hidden', 'xl:block', 'print:hidden', 'forced-colors:hidden', 'pointer-events-none');
    }

    // 80rem is the 76rem Container plus its 2rem gutters; the previous frame drifted off the content above 1616px.
    expect((string) file_get_contents(resource_path('js/components/shared/frame-rails.tsx')))->toContain('max-w-[80rem]');
    expect((string) file_get_contents(resource_path('js/components/ui/container.tsx')))->toContain("wide: 'max-w-[76rem]'")->toContain('lg:px-8');
}

function frameAssertHomeCells(DOMXPath $xpath, string $path): void
{
    $cells = fn(string $id): int => $xpath->query("//section[@id=\"{$id}\"]//*[contains(concat(' ', normalize-space(@class), ' '), ' cell-grid ')]")->length;

    foreach (['top', 'databases', 'sponsors', 'features', 'safety', 'platforms', 'pricing', 'open-source'] as $id) {
        expect($cells($id))->toBe(1, "{$path}: #{$id} is a set of like items, drawn as cells");
    }

    foreach (['ai', 'switch'] as $id) {
        expect($cells($id))->toBe(0, "{$path}: #{$id} is prose and stays unlined");
    }

    // A section that ends in cells closes them on the next join, not 48px above it.
    foreach (['sponsors', 'features', 'safety', 'platforms', 'open-source'] as $id) {
        expect(frameClasses($xpath->query("//section[@id=\"{$id}\"]")->item(0)))->toContain('pb-0', 'md:pb-0', 'xl:pb-0');
    }
}

function frameAssertFaqTopics(DOMXPath $xpath): void
{
    $topics = $xpath->query('//main//section[@aria-labelledby]/*[contains(concat(" ", normalize-space(@class), " "), " cell-grid ")]');

    expect($topics->length)->toBeGreaterThan(1);

    foreach ($topics as $grid) {
        expect($xpath->query('./*', $grid)->length)->toBe(2, 'A topic is its heading cell and its questions cell');
        expect($xpath->query('.//*[@data-rule-list]', $grid)->item(0)?->getAttribute('class'))->toContain('cell-rows');
    }
}

function frameAssertBlogLists(DOMXPath $xpath): void
{
    foreach (['guides', 'releases'] as $id) {
        $list = $xpath->query("//main/section[@id=\"{$id}\"]//ol[@data-rule-list]")->item(0);

        expect($list)->not->toBeNull("#{$id} has no ruled list");
        expect(frameClasses($list))->toContain('frame-rows');
    }
}

it('frames every template: one join per block, each marked, and every grid and rule reaching the rails', function (string $path): void {
    $xpath = frameXPath(ssrHtml($path));
    $blocks = iterator_to_array($xpath->query('//main/*'));

    expect(count($blocks))->toBeGreaterThan(1, "{$path} has nothing to join");

    foreach ($blocks as $index => $block) {
        $name = $block->nodeName . ($block->getAttribute('id') !== '' ? '#' . $block->getAttribute('id') : '') . " (block {$index})";

        foreach (frameClasses($block) as $class) {
            Assert::assertStringStartsNotWith('max-w-', $class, "{$path}: {$name} is narrower than the page, so its join stops short");
            Assert::assertNotSame('mx-auto', $class, "{$path}: {$name} is a centred box, so its join stops short");
            Assert::assertDoesNotMatchRegularExpression('/^(?:[a-z]+:)*border-[tby](?:-|$)/', $class, "{$path}: {$name} draws its own rule beside the frame's join");
        }
    }

    // A per-section switch once marked one join out of nine.
    expect($xpath->query('//footer[@data-join-mark]')->length)->toBe(1, "{$path}: the footer's rule is the last join and is marked like the others");
    expect($xpath->query('//main//*[@data-join-mark]')->length)->toBe(0, "{$path}: joins in <main> are marked by position, not by a switch");

    foreach ($xpath->query('//*[contains(concat(" ", normalize-space(@class), " "), " cell-grid ")]') as $grid) {
        for ($node = $grid->parentNode; $node instanceof DOMElement && $node->nodeName !== 'main'; $node = $node->parentNode) {
            foreach (frameClasses($node) as $class) {
                if (str_starts_with($class, 'max-w-[') && $class !== 'max-w-[76rem]') {
                    Assert::fail("{$path}: a cell grid sits inside a {$class} column, so its right edge draws a line through the page");
                }
            }
        }
    }

    // Rules that stopped 32px short of the rails read as loose lines in open space.
    $reaches = ['frame-rows', 'frame-rows-text', 'cell-rows', 'frame-table'];
    $ruled = $xpath->query('//main//dl | //main//*[@data-rule-list] | //main//*[@role="region"][table]');

    foreach ($ruled as $element) {
        if (array_intersect($reaches, frameClasses($element)) !== []) {
            continue;
        }

        for ($node = $element->parentNode; $node instanceof DOMElement; $node = $node->parentNode) {
            $classes = frameClasses($node);

            if (in_array('rounded-panel', $classes, true) || in_array('blog-article', $classes, true)) {
                continue 2;
            }
        }

        Assert::fail("{$path}: a <{$element->nodeName}> with rules stops short of the frame; give it frame-rows, frame-rows-text, cell-rows or frame-table");
    }

    $ownBlocks = [
        '/pricing' => ['license', 'billing', 'refunds', 'team', 'open-source', 'faq'],
        '/download' => ['install', 'updates', 'older-versions'],
        '/blog/tablepro-0-77' => ['related'],
    ];

    foreach ($ownBlocks[$path] ?? [] as $id) {
        expect($xpath->query("//main/section[@id=\"{$id}\"]")->length)->toBe(1, "{$path}: #{$id} is a block of its own, so the frame's join separates it");
    }

    if ($path === '/') {
        frameAssertRails($xpath);
    }

    if ($path === '/' || $path === '/vi') {
        frameAssertHomeCells($xpath, $path);
    }

    if ($path === '/faq') {
        frameAssertFaqTopics($xpath);
    }

    if ($path === '/blog') {
        frameAssertBlogLists($xpath);
    }
})->with(frameTemplates())->group('ssr');

it('draws the join in CSS, by position, and lands anchors behind the header\'s rule', function (): void {
    expect(frameCss())->toMatch('/main > \* \+ \* \{\s*border-top: 1px solid var\(--rule\);/')
        ->toContain('scroll-margin-top: -1rem;')
        ->and((string) file_get_contents(resource_path('css/app.css')))->toContain('scroll-padding-top: 5rem;');
});

it('shows marks only where a 1280px frame leaves them room, and never in forced colours or print', function (): void {
    $css = frameCss();
    $start = (int) strpos($css, '@media (min-width: 82rem)');
    $marks = substr($css, $start, (int) strpos($css, '@media (forced-colors: active), print {') - $start);

    expect($marks)->toContain('main > * + *::before')
        ->toContain('main > * + *::after')
        ->toContain('[data-join-mark]::after')
        ->not->toContain('.cell-grid')
        ->toContain('background-color: var(--rule-strong);')
        ->toContain('left: calc(50% - 40rem - 5px);')
        ->toContain('left: calc(50% + 40rem - 6px);');
    expect($marks)->not->toContain('var(--accent');
    expect($css)->toContain('@media (forced-colors: active), print {');
});

it('draws cells with one shared line, reaching the rails from 1280px and the screen edge below', function (): void {
    $css = frameCss();

    expect($css)->toMatch('/\.cell-grid \{[^}]*gap: 1px;[^}]*margin-inline: calc\(var\(--cell-bleed\) \* -1\);/s')
        ->toMatch('/\.cell-grid > \* \{[^}]*box-shadow: 0 0 0 1px var\(--rule\);/s')
        ->toMatch('/@media \(min-width: 64rem\) \{\s*:root \{\s*--cell-bleed: 2rem;/')
        ->toMatch('/@media \(min-width: 80rem\) \{\s*:root \{\s*--cell-bleed: calc\(2rem - 1px\);/');
});

it('lets the join close a list that ends a block, but never one inside a card', function (): void {
    expect(frameCss())->toContain('main > * > :is(dl, [data-rule-list]):not(.rounded-panel *):last-child')
        ->toContain('main > * > :last-child > :last-child > :last-child > :last-child > :last-child > :is(dl, [data-rule-list]):not(.rounded-panel *):last-child');

    foreach (['js/components/ui/faq-list.tsx', 'js/components/blog/post-list.tsx'] as $file) {
        expect((string) file_get_contents(resource_path($file)))->toContain('data-rule-list');
    }
});

it('keeps the frame from clipping or widening the page', function (string $file): void {
    // The previous frame's 200vw rules and hidden overflow masked scroll regressions and broke the sticky header.
    $code = (string) preg_replace('#/\*.*?\*/#s', '', (string) file_get_contents(resource_path($file)));

    expect($code)->not->toMatch('/\d+vw\b|w-screen|overflow-x:\s*(?:hidden|clip)|overflow-x-(?:hidden|clip)/');
})->with(['css/app.css', 'css/frame.css', 'js/components/shared/frame-rails.tsx', 'js/components/ui/cell-grid.tsx', 'js/layouts/landing-layout.tsx']);

it('reaches the rails from any measure with container units, and keeps the text where it was', function (): void {
    $css = frameCss();

    expect($css)->toMatch('/\.frame-rows,\s*\.frame-rows-text \{[^}]*margin-left: calc\(var\(--cell-bleed\) \* -1\);[^}]*margin-right: calc\(\(100cqw - 100%\) \* -1 - var\(--cell-bleed\)\);/s')
        ->toMatch('/\.frame-rows-text \{\s*--row-room: calc\(100cqw - min\(44rem, 100cqw\)\);/')
        ->toMatch('/:is\(\.frame-rows, \.frame-rows-text\) > \* \{\s*padding-left: var\(--cell-bleed\);\s*padding-right: calc\(var\(--row-room\) \+ var\(--cell-bleed\)\);/')
        ->toMatch('/\.frame-table :is\(th, td\):first-child \{\s*padding-left: var\(--cell-bleed\);/')
        ->toMatch('/\.frame-table thead \+ tbody > tr:first-child \{\s*border-top-style: none;/')
        ->toMatch('/\.cell-rows > \* \{\s*padding-inline: var\(--cell-bleed\);/');

    // Container units need a size container whose content box is the page's content column.
    expect((string) file_get_contents(resource_path('js/components/ui/section.tsx')))->toContain('<Container className="@container">');
});
