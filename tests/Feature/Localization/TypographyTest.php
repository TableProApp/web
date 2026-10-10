<?php

function stylesheet(string $name): string
{
    return (string) file_get_contents(resource_path("css/{$name}"));
}

/** @return list<string> */
function subsetOrder(string $css, string $fileStem): array
{
    preg_match_all('#/' . preg_quote($fileStem, '#') . '-([a-z-]+?)-(?:opsz|400)-normal\.woff2#', $css, $matches);

    return $matches[1];
}

it('declares latin-ext, then vietnamese, then latin, for both families', function (): void {
    // The last declared face wins, so shared letters load from the 15 KB Vietnamese face, not the 133 KB one.
    $css = stylesheet('fonts.css');

    expect(subsetOrder($css, 'inter'))->toBe(['latin-ext', 'vietnamese', 'latin']);
    expect(subsetOrder($css, 'ibm-plex-mono'))->toBe(['latin-ext', 'vietnamese', 'latin']);
});

it('loads Plex Mono at 400 only, and no script the site does not use', function (): void {
    $css = stylesheet('fonts.css');

    expect($css)->not->toMatch('/font-weight:\s*600/')
        ->not->toContain('cyrillic')
        ->not->toContain('greek')
        ->not->toContain('@import');
});

it('points every face at a font file that is installed', function (): void {
    requireSsrJob();

    if (! is_dir(base_path('node_modules'))) {
        ssrUnavailable('node_modules is missing. Run: npm ci');
    }

    preg_match_all('#url\("\.\./\.\./(node_modules/[^"]+)"\)#', stylesheet('fonts.css'), $matches);

    expect($matches[1])->toHaveCount(6);

    foreach ($matches[1] as $path) {
        expect(is_file(base_path($path)))->toBeTrue("{$path} is not installed");
    }
})->group('ssr');

it('gives Vietnamese headings room for stacked marks, after the English values', function (): void {
    $css = stylesheet('tokens.css');

    $english = strpos($css, ":root,\n:lang(en) {");
    $vietnamese = strpos($css, ':lang(vi) {');

    expect($english)->not->toBeFalse();
    expect($vietnamese)->toBeGreaterThan($english);

    $block = substr($css, $vietnamese, strpos($css, '}', $vietnamese) - $vietnamese);

    foreach (['display', 'h1', 'h2'] as $role) {
        expect($block)->toMatch("/--lh-{$role}: 1\\.3;/");
    }
});

it('imports the shared foundation into the site stylesheet', function (): void {
    $css = stylesheet('app.css');

    expect(strpos($css, '@import "./fonts.css";'))->toBeGreaterThan(strpos($css, '@import "tailwindcss";'));
    expect($css)->toContain('@import "./tokens.css";')->not->toContain('@fontsource');
});

it('sets the root font from the per-language stacks international.css declares', function (): void {
    preg_match_all('/^:lang\(([A-Za-z-]+)\) \{\s*--font-sans:/m', stylesheet('international.css'), $languages);

    expect($languages[1])->toBe(['ja', 'ko', 'zh-Hans', 'zh-Hant']);
    // The preflight reads `--default-font-family`, which no language overrides.
    expect(stylesheet('app.css'))->toMatch('/\nhtml \{\s*font-family: var\(--font-sans, var\(--default-font-family\)\);\s*\}/');
});

it('gives text marked as another language that language\'s faces, below every utility', function (): void {
    // A Japanese quote on an English page: without it, a Mac draws some kanji in the Chinese face.
    expect(stylesheet('international.css'))->toMatch('/@layer base \{\s*:where\(:not\(html\)\[lang\]\) \{\s*font-family: var\(--font-sans, var\(--default-font-family\)\);/');
});

it('keeps the macOS face first in each CJK stack, and Meiryo ahead of Yu Gothic for Windows', function (): void {
    preg_match_all('/^:lang\(([A-Za-z-]+)\) \{\s*--font-sans: ([^;]+);/m', stylesheet('international.css'), $rules, PREG_SET_ORDER);

    $stacks = [];

    foreach ($rules as [, $language, $stack]) {
        $stacks[$language] = array_map(fn(string $face): string => trim($face, ' "'), explode(',', $stack));
    }

    // Windows draws Yu Gothic too light at 400.
    expect(array_slice($stacks['ja'], 0, 4))->toBe(['Inter Variable', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'Yu Gothic']);
    expect(array_slice($stacks['ko'], 0, 3))->toBe(['Inter Variable', 'Apple SD Gothic Neo', 'Malgun Gothic']);
    expect(array_slice($stacks['zh-Hans'], 0, 3))->toBe(['Inter Variable', 'PingFang SC', 'Microsoft YaHei']);
    expect(array_slice($stacks['zh-Hant'], 0, 3))->toBe(['Inter Variable', 'PingFang TC', 'Microsoft JhengHei']);
});

it('breaks Korean between words and keeps Japanese line starts clean', function (): void {
    $css = stylesheet('app.css');

    expect($css)->toMatch('/\n:lang\(ko\) \{\s*word-break: keep-all;\s*\}/')
        ->toMatch('/\n:lang\(ja\) \{\s*line-break: strict;\s*\}/');
});

it('breaks a word wider than its box instead of letting it cross the page edge', function (): void {
    expect(stylesheet('app.css'))->toMatch('/\n  body \{[^}]*overflow-wrap: break-word;[^}]*\}/');
});

it('hyphenates the fact terms of an engine page, a third of a narrow card', function (): void {
    // At 1024px "Abfragesprache" ran 32px into the value beside it.
    expect(ssrHtml('/de/postgresql-client'))->toMatch('/<dl class="[^"]*\[&amp;_dt\]:hyphens-auto[^"]*">/');
})->group('ssr');

it('hyphenates long German words in headings, keyed on the language of a German page', function (): void {
    // At 320px "Datenschutzerklärun|g" broke with no hyphen.
    expect(stylesheet('app.css'))->toMatch('/\n:is\(h1, h2, h3, h4, h5, h6\):lang\(de\) \{\s*hyphens: auto;\s*hyphenate-limit-chars: 12 4 4;\s*\}/');

    $this->withoutVite();

    expect($this->get('/de/privacy')->getContent())->toContain('<html lang="de"');
});
