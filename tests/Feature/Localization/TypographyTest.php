<?php

/**
 * The two shared stylesheets that make Vietnamese render well and cheaply.
 *
 * fonts.css: when two faces of a family cover a character, the browser uses the
 * one declared last. Declaring `vietnamese` after `latin-ext` sends the letters
 * they share to the 15 KB Vietnamese face instead of the 133 KB one. Reordering
 * the blocks would still render, just at twice the font weight per page, which
 * no visual check would catch.
 *
 * tokens.css: Vietnamese stacks a tone mark over a vowel mark, so headings need
 * more line height than English, and the override has to come after the
 * English values to win.
 */
function stylesheet(string $name): string
{
    return (string) file_get_contents(resource_path("css/{$name}"));
}

/**
 * The subsets of a family's faces, in declaration order.
 *
 * @return list<string>
 */
function subsetOrder(string $css, string $fileStem): array
{
    preg_match_all('#/' . preg_quote($fileStem, '#') . '-([a-z-]+?)-(?:opsz|400)-normal\.woff2#', $css, $matches);

    return $matches[1];
}

it('declares latin-ext, then vietnamese, then latin, for both families', function (): void {
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
    if (! is_dir(base_path('node_modules'))) {
        if (getenv('REQUIRE_SSR')) {
            $this->fail('node_modules is missing; run npm ci before the SSR suite.');
        }

        $this->markTestSkipped('Needs npm ci. The CI ssr job installs node_modules and runs this case.');
    }

    preg_match_all('#url\("\.\./\.\./(node_modules/[^"]+)"\)#', stylesheet('fonts.css'), $matches);

    expect($matches[1])->toHaveCount(6);

    foreach ($matches[1] as $path) {
        expect(is_file(base_path($path)))->toBeTrue("{$path} is not installed");
    }
});

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
    preg_match_all('/html:lang\(([A-Za-z-]+)\) \{\s*--font-sans:/', stylesheet('international.css'), $languages);

    expect($languages[1])->toBe(['ja', 'ko', 'zh-Hans', 'zh-Hant']);
    // The preflight reads `--default-font-family`, which no language overrides.
    expect(stylesheet('app.css'))->toMatch('/\nhtml \{\s*font-family: var\(--font-sans, var\(--default-font-family\)\);\s*\}/');
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
    requireSsr();

    /*
     * Measured at 1024px: "Abfragesprache" and "Mindestversion" ran 32px and
     * 27px into the value beside them, "Puerto predeterminado" 31px.
     */
    expect(ssrHtml('/de/postgresql-client'))->toMatch('/<dl class="[^"]*\[&amp;_dt\]:hyphens-auto[^"]*">/');
});
