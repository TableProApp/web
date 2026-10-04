<?php

/**
 * Mistakes in the suite itself that make a guard pass whatever it checks.
 *
 * Pest's `toContain(...$needles)` reads every argument as a needle; it has no
 * message parameter. Under `->not`, a second argument turns the check into
 * "not every needle is present", and since the message is never in the
 * subject, that always holds. Three guards here (a token-leak check, a
 * contested-claim check and a handoff check) could not fail for that reason
 * until a review caught them. Write `->not->toContain($a)->not->toContain($b)`, or
 * `->not->toMatch($pattern, $message)`, whose second parameter is a message.
 */

/**
 * Every `->not->toContain(` call with more than one top-level argument, as
 * "file:line".
 *
 * @return list<string>
 */
function suiteNegatedMultiNeedleCalls(string $code, string $file): array
{
    $tokens = PhpToken::tokenize($code);
    $count = count($tokens);
    $found = [];

    for ($i = 0; $i < $count; $i++) {
        if (! $tokens[$i]->is(T_STRING) || ! in_array($tokens[$i]->text, ['toContain', 'toContainEqual'], true)) {
            continue;
        }

        $previous = suiteHygieneSkip($tokens, $i - 1, -1);
        $negation = $previous === null ? null : suiteHygieneSkip($tokens, $previous - 1, -1);

        if ($previous === null || ! $tokens[$previous]->is(T_OBJECT_OPERATOR) || $negation === null || $tokens[$negation]->text !== 'not') {
            continue;
        }

        $open = suiteHygieneSkip($tokens, $i + 1, 1);

        if ($open === null || $tokens[$open]->text !== '(') {
            continue;
        }

        $depth = 0;
        $arguments = 1;
        $lastSignificant = null;

        for ($j = $open; $j < $count; $j++) {
            $text = $tokens[$j]->text;

            if (in_array($text, ['(', '[', '{', '${'], true) || $tokens[$j]->is(T_CURLY_OPEN)) {
                $depth++;
            } elseif (in_array($text, [')', ']', '}'], true)) {
                $depth--;

                if ($depth === 0) {
                    break;
                }
            } elseif ($depth === 1 && $text === ',') {
                $arguments++;
            }

            if (! $tokens[$j]->isIgnorable()) {
                $lastSignificant = $j;
            }
        }

        if ($lastSignificant !== null && $tokens[$lastSignificant]->text === ',') {
            $arguments--;
        }

        if ($arguments > 1) {
            $found[] = "{$file}:{$tokens[$i]->line}";
        }
    }

    return $found;
}

/**
 * The index of the next non-whitespace, non-comment token from `$from` in
 * `$step` direction, or null.
 *
 * @param  list<PhpToken>  $tokens
 */
function suiteHygieneSkip(array $tokens, int $from, int $step): ?int
{
    for ($i = $from; $i >= 0 && $i < count($tokens); $i += $step) {
        if (! $tokens[$i]->isIgnorable()) {
            return $i;
        }
    }

    return null;
}

it('never passes a second argument to a negated toContain', function (): void {
    $found = [];
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(base_path('tests'), FilesystemIterator::SKIP_DOTS));

    foreach ($files as $file) {
        if ($file->getExtension() === 'php') {
            $relative = str_replace(base_path() . '/', '', $file->getPathname());
            array_push($found, ...suiteNegatedMultiNeedleCalls((string) file_get_contents($file->getPathname()), $relative));
        }
    }

    expect($found)->toBe([], "A second argument to ->not->toContain() is a needle, not a message, so the check always passes:\n  " . implode("\n  ", $found));
});

it('finds the mistake it guards against, and nothing else', function (string $code, int $hits): void {
    expect(suiteNegatedMultiNeedleCalls("<?php\n{$code}", 'fixture.php'))->toHaveCount($hits);
})->with([
    'a message as a second needle' => ["expect(\$title)->not->toContain('{', \"a token is left in {\$path}\");", 1],
    'two needles under not' => ["expect(\$ids)->not->toContain('a', 'b');", 1],
    'a chained pair' => ["expect(\$ids)->not->toContain('a')->not->toContain('b');", 0],
    'a positive list of needles' => ["expect(\$ids)->toContain('a', 'b');", 0],
    'one needle with a call inside' => ["expect(\$ids)->not->toContain(sprintf('%s-%s', \$a, \$b));", 0],
    'a trailing comma' => ["expect(\$ids)->not->toContain(\n    'a',\n);", 0],
]);
