<?php

use PHPUnit\Framework\Assert;

/**
 * Guards the one thing this domain never said: who builds TablePro, and what
 * pays for it.
 *
 * Every comparable project states it where it asks for money — Obsidian sells
 * "independent development" and being "free from investor influence", Beekeeper
 * "a small indie team, not backed by big corporations or VC investment", Sindre
 * Sorhus "a full-time open-sourcerer funded by the community". This site said
 * only that its sponsors "pay for the time", in the credit line at the foot of
 * the page, which names the sponsors rather than the model.
 *
 * What each assertion here is really holding is a *shape*, not a sentence: the
 * claim is a fact rather than a plea, it arrives where the reader is deciding,
 * and a license always outranks sponsorship.
 */
$readSource = static fn(string $relative): string => file_get_contents(base_path($relative));

it('names who builds TablePro, on the screen with the prices', function (): void {
    $html = ssrHtml('/');

    $pricing = strpos($html, 'id="pricing"');
    $claim = strpos($html, 'funded by licenses rather than investors');

    expect($pricing)->not->toBeFalse();
    expect($claim)->not->toBeFalse('The site must say what pays for TablePro');

    /*
     * Position is the whole point. The hero is the wrong place — no comparable
     * project puts this above the fold, and there it competes with "the app is
     * free" before the reader has any reason to care who pays. It belongs one
     * scroll from the Team card.
     */
    expect($claim)->toBeGreaterThan($pricing, 'The funding model belongs at the decision point, not in the hero');
});

it('states the funding model as a fact rather than a plea', function (): void {
    $html = ssrHtml('/');

    $start = strpos($html, '<main');
    $end = strrpos($html, '</main>');
    $main = substr($html, $start, $end - $start);

    /*
     * `pricing.tsx`'s own docblock records the rule this enforces: "The ask
     * survives; the apology does not." Two hedges were cut from the live lede
     * for hedging the value proposition at the moment of decision, and a
     * revenue figure would do the same job — it tells a Team buyer the project
     * may not outlive their purchase order.
     *
     * These are the forms the plea takes. None of them has ever shipped here;
     * this test exists so none of them starts to.
     */
    $pleas = [
        'need your help',
        'help us keep',
        'if you can afford',
        'cannot afford',
        'struggling',
        'not enough to',
        "don't cover",
        'do not cover',
    ];

    foreach ($pleas as $plea) {
        Assert::assertStringNotContainsString(
            $plea,
            $main,
            "\"{$plea}\" asks for sympathy. State the model and make the ask.",
        );
    }
});

it('keeps a license ahead of sponsorship wherever both are offered', function (): void {
    $html = ssrHtml('/');

    /*
     * Beekeeper says it outright: "the best way to support us is by purchasing
     * a license." A license is worth more to the project than a sponsorship and
     * more to the buyer, who gets nine features for it, so sponsorship is never
     * the primary action in a place that offers both.
     *
     * In the ledger row that carries both, "Buying one" is the sentence's
     * subject and sponsorship is the subordinate clause after it.
     */
    $license = strpos($html, 'Buying one is how the');
    $sponsorship = strpos($html, '>sponsorship</a>');

    expect($license)->not->toBeFalse();
    expect($sponsorship)->not->toBeFalse();
    expect($license)->toBeLessThan($sponsorship, 'The license ask leads; sponsorship follows it');
});

it('answers the abandonment question with a business model, not only a release count', function () use ($readSource): void {
    /*
     * "Is this abandoned like Sequel Pro?" used to be answered entirely with
     * activity — a public changelog, a Discord, ten releases a month. Activity
     * is what Sequel Pro also had, right up until it stopped. What a reader is
     * really asking is whether anything pays for the next ten releases.
     *
     * Asserted against the source rather than the rendered page: /faq renders
     * from this file, and the answer is the fact under test.
     */
    $faqs = $readSource('resources/js/data/faqs.ts');

    $answer = null;
    foreach (explode('question:', $faqs) as $block) {
        if (str_contains($block, 'Is this abandoned')) {
            $answer = $block;
            break;
        }
    }

    expect($answer)->not->toBeNull('The abandonment question must still be asked');
    expect($answer)->toContain('funded by licenses rather than investors');
});

it('tells a fresh download what keeps the next release coming', function (): void {
    $html = ssrHtml('/download');

    /*
     * The riskiest of the four surfaces. This page is reached by someone who
     * has just decided to use TablePro, and the homepage promises them "Free is
     * not a trial and not a demo" — so anything money-shaped here reads as a
     * toll booth on a promise made one page earlier.
     *
     * Three things keep it honest, and all three are asserted: it opens by
     * repeating that the app is free, it names no price, and it sits after the
     * install steps rather than before them.
     */
    $free = strpos($html, 'TablePro is free, all of it');
    $claim = strpos($html, 'funded by licenses rather than investors');
    $install = strpos($html, 'Drag <strong');

    expect($free)->not->toBeFalse('The download page must restate that the app is free');
    expect($claim)->not->toBeFalse();
    expect($install)->not->toBeFalse();

    expect($free)->toBeLessThan($claim, 'Free comes first, then what pays for it');
    expect($claim)->toBeGreaterThan($install, 'The ask sits below the install steps, not above them');

    // A price literal here could not be corrected without a deploy, and
    // `data/pricing.ts` is the only place a figure may live.
    foreach (['$2.99', '$24', '$59', '$1.25', '$10', '$25'] as $price) {
        Assert::assertStringNotContainsString(
            $price,
            $html,
            "The download page quotes {$price}; prices live in data/pricing.ts and render in Pricing",
        );
    }
});

it('holds every repeated external URL in one file', function () use ($readSource): void {
    /*
     * The repository URL was written out four times and the sponsors URL twice,
     * with nothing holding them together — so a moved repository was a
     * four-file change with no signal about the fourth. `data/links.ts` is the
     * single source, the way `data/pricing.ts` is for a price.
     *
     * Scanned across the whole frontend so a new component cannot quietly
     * reintroduce a literal.
     */
    $urls = [
        'https://github.com/TableProApp/TablePro' => 'GITHUB_REPO_URL',
        'https://github.com/sponsors/datlechin' => 'GITHUB_SPONSORS_URL',
    ];

    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(base_path('resources/js'), FilesystemIterator::SKIP_DOTS),
    );

    foreach ($files as $file) {
        if (! in_array($file->getExtension(), ['ts', 'tsx'], true)) {
            continue;
        }

        $relative = str_replace(base_path() . '/', '', $file->getPathname());

        if ($relative === 'resources/js/data/links.ts') {
            continue;
        }

        /*
         * Comments stripped, because a docblock may legitimately quote a URL
         * while explaining why the literal moved out of the file.
         *
         * The `(?<!:)` is load-bearing and its absence made this whole test
         * vacuous. `#//.*$#m` matches the `//` inside `https://`, so every URL
         * in the file was truncated to `'https:` before the scan ran and no
         * literal could ever be found — the assertion passed on a codebase
         * where every URL was hardcoded. Caught by mutation-testing it, not by
         * reading it.
         *
         * `StaleClaimsTest` and `LicenseFeaturesTest` use the unguarded pair,
         * which is harmless there: both scan for prose, not for URLs.
         */
        $code = preg_replace(['#/\*[\s\S]*?\*/#', '#(?<!:)//.*$#m'], '', $readSource($relative));

        foreach ($urls as $url => $constant) {
            Assert::assertStringNotContainsString(
                "'{$url}",
                $code,
                "{$relative} hardcodes a URL that data/links.ts owns; import {$constant}",
            );
        }
    }
});
