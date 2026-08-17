<?php

use Illuminate\Support\Facades\Http;
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

    if ($html !== null) {
        return $html;
    }

    $reason = null;

    if (! file_exists(base_path('bootstrap/ssr/ssr.js'))) {
        $reason = 'SSR bundle missing. Run: npm run build';
    } else {
        $ssrUrl = config('inertia.ssr.url', 'http://127.0.0.1:13715');

        try {
            Http::timeout(2)->get($ssrUrl . '/health');
        } catch (\Throwable) {
            // The health endpoint is optional; only a refused connection matters.
        }

        $probe = @fsockopen(
            parse_url($ssrUrl, PHP_URL_HOST),
            (int) parse_url($ssrUrl, PHP_URL_PORT),
            $errno,
            $errstr,
            2,
        );

        if ($probe === false) {
            $reason = 'SSR service not running. Run: php artisan inertia:start-ssr';
        } else {
            fclose($probe);
        }
    }

    if ($reason !== null) {
        if (filter_var(env('REQUIRE_SSR', false), FILTER_VALIDATE_BOOL)) {
            Assert::fail($reason);
        }

        test()->markTestSkipped($reason);
    }

    $response = test()->get('http://' . config('app.web_domain') . '/');
    $response->assertOk();

    return $html = $response->getContent();
}

it('numbers every full-bleed rule, including the accent ones', function (): void {
    $html = landingHtml();

    // Every FullLine and every AccentLine carries the counter class. AccentLine
    // was skipped once, which made the ordinal the position of *some* rules
    // rather than of the rule — the first one in each section was missing.
    $numbered = substr_count($html, 'rule-numbered');
    $rules = substr_count($html, '-ml-[100vw] h-px w-[200vw] bg-rule');

    expect($numbered)->toBe($rules, 'Every full-bleed rule must carry the ordinal counter');
    expect($numbered)->toBeGreaterThan(80);
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
    $free = strpos($html, 'Free means permanently free');
    $agpl = strpos($html, 'AGPL obligations attach to distributing a modified version');

    expect($free)->not->toBeFalse();
    expect($agpl)->not->toBeFalse();
    expect($free)->toBeGreaterThan($pricing);
    expect($agpl)->toBeGreaterThan($pricing);

    // And the retired duplicate is gone rather than merely moved.
    expect($html)->not->toContain('Nothing is behind a paywall.');
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
        // The four-item paid surface: pricing lede, Starter card, comparison table.
        'Encrypted connection export' => 3,
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
