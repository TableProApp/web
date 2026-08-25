<?php

use PHPUnit\Framework\Assert;

/**
 * Guards the structure introduced by the landing redesign.
 *
 * Everything here asserts on the real server-rendered DOM, because none of it
 * is visible to a typecheck: Tailwind silently drops an unknown utility, a CSS
 * counter class is just a string, and a section that stops rendering leaves no
 * trace in `tsc`. The redesign shipped four defects that only arithmetic or an
 * adversarial read caught, and these are the ones a test can hold.
 *
 * Runs for real in the `ssr` CI job, where REQUIRE_SSR turns the skips below
 * into failures.
 */
function landingHtml(): string
{
    static $html = null;

    return $html ??= ssrHtml('/');
}

it('numbers every full-bleed rule, including the accent ones', function (): void {
    $html = landingHtml();

    // Every FullLine and every AccentLine carries the counter class. AccentLine
    // was skipped once, which made the ordinal the position of *some* rules
    // rather than of the rule — the first one in each section was missing.
    $numbered = substr_count($html, 'rule-numbered');
    $rules = substr_count($html, '-ml-[100vw] h-px w-[200vw] bg-rule');

    expect($numbered)->toBe($rules, 'Every full-bleed rule must carry the ordinal counter');

    /*
     * Was 80. The framing convention did not change — every block is still
     * closed by a rule — but three header stacks went with the three sections
     * that merged, and twelve mono caveat bands became four footnotes. Rules
     * are a consequence of how many blocks the page has, so this floor tracks
     * the block count rather than pinning it.
     */
    expect($numbered)->toBeGreaterThan(70);
});

it('subtracts the container padding from the rule ordinals', function (): void {
    $html = landingHtml();

    // Roughly half the rules sit inside a Container and half do not. Without
    // --rule-inset the two groups rendered 32px apart, and the Container half
    // landed inside the content column instead of the gutter.
    expect($html)->toContain('rule-inset-host');
});

it('keeps a download within reach of the reader', function (): void {
    $html = landingHtml();

    // Hero, two rails and the closing CTA. The page once offered two routes to
    // /download with roughly three thousand words between them.
    expect(substr_count($html, 'href="/download"'))->toBeGreaterThanOrEqual(4);
});

it('answers the free and AGPL objections where the prices are', function (): void {
    $html = landingHtml();

    /*
     * Both used to be asked at position four, as a pair of orphan h2s rendered
     * at body size before the reader had seen a single feature — and both were
     * then answered again by the open-source section and a third time by the
     * pricing lede. They are answered once now, on screen with the prices,
     * which is where the reader is deciding and where the AGPL question blocks
     * the highest-value visitor on the site.
     */
    $pricing = strpos($html, 'id="pricing"');
    $license = strpos($html, 'id="license"');
    $free = strpos($html, 'Free is not a trial and not a demo');
    $agpl = strpos($html, 'AGPL obligations attach to distributing a modified version');

    expect($pricing)->not->toBeFalse();
    expect($license)->not->toBeFalse();
    expect($free)->not->toBeFalse();
    expect($agpl)->not->toBeFalse();

    /*
     * License stopped being a section of its own. Its eyebrow, H2 and lede were
     * a second header stack asking "what does a license add" one scroll above
     * the one asking "what does it cost" — one question, split in half. The
     * plan matrix is an artifact inside Pricing now, so `#license` follows
     * `#pricing` in the document rather than preceding it.
     */
    expect($free)->toBeGreaterThan($pricing, 'The free promise is the lede of the pricing section');
    expect($agpl)->toBeGreaterThan($pricing);
    expect($free)->toBeLessThan($license, 'The promise opens the section the plan matrix then proves');
    expect($agpl)->toBeLessThan($license);

    // And the retired duplicate is gone rather than merely moved.
    expect($html)->not->toContain('Nothing is behind a paywall.');
});

it('keeps each merged pair inside one section', function (): void {
    $html = landingHtml();

    /*
     * Two merges carry this redesign, and both are invisible to a typecheck:
     * an id can keep resolving from a section that quietly grew a second header
     * stack back. What makes them merges is that no `</section>` separates the
     * pair — the second id rides a sub-heading inside the first section.
     *
     * `#mcp` + `#safety`: the section that raises "let an agent query your
     * database" is the section that answers it.
     * `#pricing` + `#license`: what a license adds, then what it costs.
     */
    $pairs = [
        ['id="mcp"', 'id="safety"'],
        ['id="pricing"', 'id="license"'],
    ];

    foreach ($pairs as [$opener, $inner]) {
        $from = strpos($html, $opener);
        $to = strpos($html, $inner);

        expect($from)->not->toBeFalse();
        expect($to)->not->toBeFalse();
        expect($from)->toBeLessThan($to, "{$inner} must sit inside {$opener}");

        /*
         * `Assert::assertStringNotContainsString`, not `->not->toContain(...)`.
         * Pest's `toContain()` is `(mixed ...$needles)` with no message
         * parameter, so a message passed there becomes a second needle and
         * `not` passes the moment *any* needle is absent — which a message
         * string always is. Two blocks in `StaleClaimsTest` were green for
         * their whole life that way.
         */
        Assert::assertStringNotContainsString(
            '</section>',
            substr($html, $from, $to - $from),
            "{$opener} and {$inner} must be one section, not two",
        );
    }
});

it('answers the AI question inside the section that raises it', function (): void {
    $html = landingHtml();

    /*
     * The needle used to be the FAQ callout's "Not without you clicking". That
     * callout restated the permission ledger forty-five words above it — same
     * quoted phrase, same "can never be pre-approved" — so it was deleted and
     * the ledger, which says it with the actual tool names, is the answer.
     *
     * The fact this test protects is unchanged: the section that raises the
     * fear also resolves it, before Safety arrives.
     */
    $agents = strpos($html, 'id="mcp"');
    $safety = strpos($html, 'id="safety"');
    $answer = strpos($html, 'confirm_destructive_operation');

    expect($answer)->not->toBeFalse();
    expect($answer)->toBeGreaterThan($agents);
    expect($answer)->toBeLessThan($safety, 'The answer belongs in Agents, not after it');
});

it('gives the page a second ground', function (): void {
    $html = landingHtml();

    // Sixteen sections shared one background until this shipped, so hairline
    // density was the only rhythm over ten thousand pixels of scroll.
    expect(substr_count($html, 'data-tone="raised"'))->toBeGreaterThanOrEqual(3);
});

it('keeps Agents adjacent to the answer to the fear it raises', function (): void {
    $html = landingHtml();

    // 274 words about iCloud sync used to sit between the question and the
    // reply. The iPhone content is a cell in the closing CTA now, so it still
    // lands after the prices — where "needs a license" reads as on message
    // rather than as a surprise in the middle of a feature tour.
    expect(strpos($html, 'id="mcp"'))->toBeLessThan(strpos($html, 'id="safety"'));
    expect(strpos($html, 'id="pricing"'))->toBeLessThan(strpos($html, 'id="mobile"'));
});

it('states each repeated claim once', function (): void {
    $html = landingHtml();

    /*
     * Sixty-nine percent of the rendered words on this page restated something
     * it had already said. These are the worst offenders, each reduced to the
     * fewest render sites the layout allows.
     *
     * Counted inside <main> only. The head legitimately repeats the description
     * across the meta, og: and twitter: tags, and that is not duplication — it
     * is three consumers of one string. Counting the whole document would make
     * this test fail for a reason it does not care about.
     *
     * Ceilings allow for the spec table, which renders its cells twice: a wide
     * row above lg and a transposed row below it. Two render sites, one claim.
     */
    $start = strpos($html, '<main');
    $end = strrpos($html, '</main>');
    expect($start)->not->toBeFalse();
    $main = substr($html, $start, $end - $start);

    $ceilings = [
        // Hero lede, hero fine print, and the spec table's two responsive cells.
        'AGPLv3' => 4,
        // Was rendered by spec-strip and again by open-source, from one prop.
        'releases in the last thirty days' => 0,
        /*
         * The paid surface is enumerated once, by the License table, which
         * reads its rows from `data/license.ts`. The pricing lede used to
         * enumerate it a second time in prose — and named four of the nine
         * features the app gates.
         */
        'Encrypted Export' => 1,
        // Was 3: the permission ledger, the FAQ callout, the workbench Modes row.
        'I understand this is irreversible' => 1,
        // Was 8 across hero, spec-strip and architecture's two cells.
        'no Chromium' => 1,
    ];

    foreach ($ceilings as $needle => $ceiling) {
        expect(substr_count($main, $needle))
            ->toBeLessThanOrEqual($ceiling, "\"{$needle}\" is rendered more times than it earns");
    }
});

it('carries the row treatment only on things that can take focus', function (): void {
    $html = landingHtml();

    // data-row shipped on a div and a tr, so its :focus-visible half could
    // never match. It belongs on the tiles, which are links.
    expect(substr_count($html, 'data-row'))->toBeGreaterThan(20);
    expect($html)->toContain('<a');
});

it('states the availability of every plan in words, not only in an icon', function (): void {
    $html = landingHtml();

    // The comparison table's checkmark is aria-hidden and carries no text, so
    // every included feature announced as an empty cell.
    expect($html)->toContain('>Included<');
    expect($html)->toContain('>Not included<');
});

it('never draws two rules at the same height', function (): void {
    $html = landingHtml();

    /*
     * Two rules with nothing between them but a section boundary render as one
     * hairline and consume two ordinals, so the gutter prints both numbers on
     * top of each other. That shipped, visibly, as an unreadable "08/09" —
     * a boundary is one rule, and it belongs to whatever closes.
     *
     * Only `<section>` and unstyled `<div>` count as transparent here. Anything
     * that can carry height genuinely separates the two.
     */
    preg_match_all('/<div class="[^"]*rule-numbered[^"]*"[^>]*>/', $html, $matches, PREG_OFFSET_CAPTURE);

    $ends = [];
    foreach ($matches[0] as [$tag, $offset]) {
        $open = $offset + strlen($tag);
        $close = strpos($html, '</div>', $open);
        if (str_contains(substr($html, $open, $close - $open), '<div')) {
            $close = strpos($html, '</div>', strpos($html, '</div>', $open) + 6);
        }
        $ends[] = [$offset, $close + 6];
    }

    $coincident = [];
    for ($i = 0; $i < count($ends) - 1; $i++) {
        $between = substr($html, $ends[$i][1], $ends[$i + 1][0] - $ends[$i][1]);

        if (trim(strip_tags($between)) !== '') {
            continue;
        }

        $boxes = false;
        preg_match_all('/<(\w+)([^>]*)>/', $between, $tags, PREG_SET_ORDER);
        foreach ($tags as $tag) {
            if (! in_array($tag[1], ['section', 'div'], true)) {
                $boxes = true;
                break;
            }
            if (preg_match('/(?<!scroll-)\b(h-\d|min-h|p-\d|py-\d|pt-\d|pb-\d|m[tby]?-\d|grid|flex)/', $tag[2])) {
                $boxes = true;
                break;
            }
        }

        if (! $boxes) {
            $coincident[] = ($i + 1) . '/' . ($i + 2);
        }
    }

    expect($coincident)->toBe([], 'Rules ' . implode(', ', $coincident) . ' render at the same height');
});

it('keeps the spec strip headless', function (): void {
    $html = landingHtml();

    /*
     * Six numbers under the hero plate used to carry an eyebrow, an H2 reading
     * "Written in Swift, not in Electron.", two mono caveat bands, a third
     * heading and a behaviour grid — 204 rendered words wrapped around figures
     * that argue for themselves.
     *
     * It is a labelled region now. `aria-label` rather than `aria-labelledby`,
     * because a region with neither is not announced at all, so dropping the
     * heading without adding the label would have silently cost a landmark.
     */
    expect($html)->toContain('id="specs"');
    Assert::assertStringNotContainsString(
        'specs-heading',
        $html,
        'The spec strip owns no heading; it is a labelled region',
    );
    expect($html)->toContain('aria-label="TablePro in numbers"');
});

it('spends mono on data rather than on prose', function (): void {
    $html = landingHtml();

    $start = strpos($html, '<main');
    $end = strrpos($html, '</main>');
    $main = substr($html, $start, $end - $start);

    /*
     * IBM Plex Mono is the page's deliberate friction: a section eyebrow, a
     * column header, a value, a keystroke, an identifier. It was rendering 206
     * times inside <main> — ledger labels, category filters, twenty four client
     * and provider chips, twenty six database ports, and twelve caveat bands —
     * which made the rarest voice on the page the most common one, at 11px
     * letterspaced small caps.
     *
     * The ceiling is what the data actually needs, with headroom. It is a
     * budget, not a target: spend it on a table, not on a sentence.
     */
    expect(substr_count($main, 'font-mono'))
        ->toBeLessThan(80, 'Mono belongs on values, identifiers and eyebrows, not on prose');

    /*
     * The retired footnote band, in its exact shipped form. Twelve copies of
     * this string lived in seven section files; `ui/footnote.tsx` owns the one
     * that replaced them, and it is sans.
     */
    Assert::assertStringNotContainsString(
        'py-3 font-mono text-xs text-muted-foreground',
        $main,
        'Footnotes are prose about data, not data: use <FootNote>',
    );
});

it('spans the gutters and rails past the footer', function (): void {
    $html = landingHtml();

    /*
     * `row-span-full` compiles to `grid-row: 1 / -1`, and `-1` counts back from
     * the last line of the *explicit* grid. With only `grid-cols` declared every
     * row was implicit, `-1` resolved to line 1, and all four vertical lines
     * stopped dead where <main> ended — the footer stood beside nothing.
     */
    expect($html)->toContain('grid-rows-[1fr_auto]');
    expect($html)->toContain('row-start-2');
});
