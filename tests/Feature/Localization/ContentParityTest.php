<?php

use App\Support\Content\MarkdownRenderer;
use App\Support\Localization\Locales;
use Illuminate\Support\Arr;
use Spatie\YamlFrontMatter\YamlFrontMatter;

/**
 * Every translation has the same shape as its English original.
 *
 * - `resources/data/content/{locale}`: the same files, the same keys, the same
 *   `{token}` slots and the same asset ids. `seo.indexable` is the one key
 *   allowed to differ, because it is how `/vi/blog` renders without being
 *   indexed.
 * - `resources/data/legal/{locale}`: the same documents with the same heading
 *   ids, so `/privacy#cookies` and `/vi/privacy#cookies` land on the same
 *   section.
 * - `resources/blog/vi`: a translated post has an English original and keeps
 *   its publication date.
 * - The glossary's forbidden variants (tests/Support/vi-forbidden-variants.php)
 *   appear in no Vietnamese string, and the English-only rows in no English one.
 * - No Vietnamese value is its English original left untranslated, unless
 *   it has nothing to translate: an identifier, a token template, or terms
 *   the glossary keeps in English (the untranslated-value heuristic below).
 *
 * Until a family's content exists, its part of this file has nothing to check.
 */
const CONTENT_ROOT = 'data/content';

/**
 * @return list<string>
 */
function contentTree(string $locale): array
{
    $root = resource_path(CONTENT_ROOT . "/{$locale}");

    if (! is_dir($root)) {
        return [];
    }

    $files = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));

    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $files[] = substr($file->getPathname(), strlen($root) + 1);
        }
    }

    sort($files);

    return $files;
}

/**
 * @return array<string, mixed>
 */
function contentJson(string $locale, string $file): array
{
    return json_decode((string) file_get_contents(resource_path(CONTENT_ROOT . "/{$locale}/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @param  array<string, mixed>  $data
 * @return array<string, mixed>
 */
function comparableShape(array $data): array
{
    return Arr::except(Arr::dot($data), ['seo.indexable']);
}

/**
 * @return list<string>
 */
function slotNames(string $text): array
{
    preg_match_all('/\{([A-Za-z][A-Za-z0-9_.]*)\}/', $text, $matches);
    $names = array_values(array_unique($matches[1]));
    sort($names);

    return $names;
}

/**
 * Every asset id a content file references, in document order.
 *
 * @param  array<string, mixed>  $data
 * @return list<string>
 */
function assetIds(array $data): array
{
    $ids = [];

    array_walk_recursive($data, function (mixed $value, int|string $key) use (&$ids): void {
        if ($key === 'asset' && is_string($value)) {
            $ids[] = $value;
        }
    });

    return $ids;
}

/**
 * @return list<string>
 */
function headingIds(string $markdownPath): array
{
    $html = app(MarkdownRenderer::class)->render(YamlFrontMatter::parseFile($markdownPath)->body());
    preg_match_all('/<h[1-6] id="([^"]+)"/', $html, $matches);
    $ids = $matches[1];
    sort($ids);

    return $ids;
}

/**
 * Keys whose JSON values are identifiers the pages never print: section and
 * block ids, paid-feature ids, asset ids, anchors, engine and feature ids and
 * source citations. They stay the same in every locale, so the glossary does
 * not apply to them.
 */
const STRUCTURAL_JSON_KEY = '/(^|\.)(id|paid|asset|anchor|feature|engine|cite)(\.\d+)?$/';

/**
 * Whether a value is an identifier under one of the given structural keys.
 *
 * The key name alone is not enough: `workflows.paid` ("Requires a {tier}
 * plan: {features}.") and `labels.header.paid` are sentences under keys that
 * usually hold ids. Only an identifier-shaped value (`cells.importExport`,
 * `alertFull`, `mac-team-library`) is skipped, so the same rule as
 * `contentGuardIsVisible()` in Content/helpers.php applies here.
 */
function structuralIdentifier(string $key, string $value, string $keyPattern): bool
{
    return preg_match($keyPattern, $key) === 1 && preg_match('/^[a-z0-9][A-Za-z0-9._:\/#@+-]*$/', $value) === 1;
}

/**
 * Visible strings in a source file, for the wording checks.
 *
 * @return list<string>
 */
function visibleStrings(string $path): array
{
    $source = (string) file_get_contents($path);

    $strings = match (pathinfo($path, PATHINFO_EXTENSION)) {
        'json' => array_values(array_filter(
            Arr::dot(json_decode($source, true) ?? []),
            fn(mixed $value, string $key): bool => is_string($value) && ! structuralIdentifier($key, $value, STRUCTURAL_JSON_KEY),
            ARRAY_FILTER_USE_BOTH,
        )),
        'php' => array_values(array_filter(Arr::dot(require $path), 'is_string')),
        'md' => [preg_replace(['/^---\n.*?\n---\n/s', '/```.*?```/s', '/`[^`\n]*`/'], ['', '', ''], $source)],
        'ts' => (function () use ($source): array {
            $code = preg_replace(['#/\*.*?\*/#s', '#(?<![:\'"])//[^\n]*#', '/^import .*;$/m'], '', $source);
            preg_match_all('/\'((?:[^\'\\\\\n]|\\\\.)*)\'|"((?:[^"\\\\\n]|\\\\.)*)"|`((?:[^`\\\\]|\\\\.)*)`/s', (string) $code, $matches, PREG_SET_ORDER);

            return array_map(fn(array $match): string => stripcslashes($match[3] ?? $match[2] ?? $match[1]), $matches);
        })(),
        default => [],
    };

    return array_values(array_filter(
        array_map(fn(string $text): string => (string) preg_replace('/`[^`]*`/', '', $text), $strings),
        fn(string $text): bool => $text !== '' && ! preg_match('#^(/|https?:|mailto:)#', $text),
    ));
}

/**
 * The source files whose strings are in one locale.
 *
 * @return list<string>
 */
function localeSources(string $locale): array
{
    $sources = [];

    foreach ([
        resource_path(CONTENT_ROOT . "/{$locale}"),
        resource_path("data/legal/{$locale}"),
        resource_path("js/i18n/messages/{$locale}"),
        lang_path($locale),
    ] as $dir) {
        if (! is_dir($dir)) {
            continue;
        }

        foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS)) as $file) {
            $sources[] = $file->getPathname();
        }
    }

    if ($locale === 'vi') {
        array_push($sources, ...(glob(resource_path('blog/vi/*.md')) ?: []));
    }

    return $sources;
}

it('gives every locale the same content files', function (): void {
    /*
     * Every page's content exists now, so an empty tree means CONTENT_ROOT
     * moved and every parity check below would compare nothing.
     */
    expect(count(contentTree('en')))->toBeGreaterThan(40, 'content/en is (nearly) empty; is CONTENT_ROOT right?');

    foreach (array_diff(Locales::codes(), ['en']) as $locale) {
        expect(contentTree($locale))->toBe(contentTree('en'), "content/{$locale} and content/en hold different files");
    }
});

it('gives every translated content file the same keys, slots, markup and assets', function (): void {
    foreach (array_diff(Locales::codes(), ['en']) as $locale) {
        foreach (contentTree('en') as $file) {
            $source = contentJson('en', $file);
            $target = contentJson($locale, $file);
            $english = comparableShape($source);
            $translated = comparableShape($target);
            expect(array_keys($translated))->toBe(array_keys($english), "{$locale}/{$file}: different keys");
            foreach ($english as $key => $value) {
                expect(get_debug_type($translated[$key]))->toBe(get_debug_type($value), "{$locale}/{$file}.{$key}: different type");
                if (is_string($value)) {
                    expect(slotNames($translated[$key]))->toBe(slotNames($value), "{$locale}/{$file}.{$key}: different slots");
                    preg_match_all('/`[^`]*`/', $value, $sourceCode);
                    preg_match_all('/`[^`]*`/', $translated[$key], $targetCode);
                    sort($sourceCode[0]);
                    sort($targetCode[0]);
                    expect($targetCode[0])->toBe($sourceCode[0], "{$locale}/{$file}.{$key}: changed inline code");
                    $displayLabel = preg_match('/(^|\.)(labels|columns|headers)\./', $key) === 1;
                    $identifier = preg_match('/(^|\.)(id|asset|anchor|feature|cite|slug|icon|engine|product)(\.\d+)?$/', $key) === 1
                        && preg_match('/^[a-z][a-z0-9-]*$/', $value) === 1;
                    $link = preg_match('/(^|\.)(href|url|docs|src|path)(\.\d+)?$/', $key) === 1
                        && preg_match('~^(?:https?://|mailto:|/|#)~', $value) === 1;
                    if (! $displayLabel && ($identifier || $link)) {
                        $expected = $value === '/account?locale=en' ? '/account?locale=' . $locale : $value;
                        expect($translated[$key])->toBe($expected, "{$locale}/{$file}.{$key}: changed technical identifier or link");
                    }
                    preg_match_all('/<\/?[a-z]+>/', $value, $sourceTags);
                    preg_match_all('/<\/?[a-z]+>/', $translated[$key], $targetTags);
                    $sourceNames = array_values(array_unique($sourceTags[0]));
                    $targetNames = array_values(array_unique($targetTags[0]));
                    sort($sourceNames);
                    sort($targetNames);
                    expect($targetNames)->toBe($sourceNames, "{$locale}/{$file}.{$key}: different inline tags");
                    $stack = [];
                    foreach ($targetTags[0] as $tag) {
                        if (str_starts_with($tag, '</')) {
                            expect(array_pop($stack))->toBe(str_replace('</', '<', $tag), "{$locale}/{$file}.{$key}: mismatched {$tag}");
                        } else {
                            $stack[] = $tag;
                        }
                    }
                    expect($stack)->toBe([], "{$locale}/{$file}.{$key}: unclosed inline tags");
                    if (trim($value) !== '') {
                        expect(trim($translated[$key]))->not->toBe('', "{$locale}/{$file}.{$key}: empty translation");
                    }
                }
            }
            expect(assetIds($target))->toBe(assetIds($source), "{$locale}/{$file}: different assets");
        }
    }
});

it('gives every legal translation the same heading ids', function (): void {
    expect(glob(resource_path('data/legal/en/*.md')))->toHaveCount(3);
    foreach (array_diff(Locales::codes(), ['en']) as $locale) {
        foreach (glob(resource_path('data/legal/en/*.md')) as $english) {
            $translated = resource_path("data/legal/{$locale}/" . basename($english));
            expect(is_file($translated))->toBeTrue("{$locale}/" . basename($english) . ' is missing');
            expect(headingIds($translated))->toBe(headingIds($english), "{$locale}/" . basename($english) . ': heading ids differ');
        }
    }
});

it('keeps a translated post tied to its English original and its date', function (): void {
    $translations = glob(resource_path('blog/vi/*.md')) ?: [];

    /*
     * Dormant on purpose while there is no translated post: release posts stay
     * English-only (spec §0), and no guide has a Vietnamese version yet. It
     * runs rather than skips, so it starts checking the moment the first
     * translation lands instead of waiting for someone to remove a guard.
     */
    if ($translations === []) {
        expect(glob(resource_path('blog/*.md')))->not->toBe([]);

        return;
    }

    foreach ($translations as $translated) {
        $english = resource_path('blog/' . basename($translated));

        expect(is_file($english))->toBeTrue('blog/vi/' . basename($translated) . ' has no English original');
        expect((string) YamlFrontMatter::parseFile($translated)->matter('date'))
            ->toBe((string) YamlFrontMatter::parseFile($english)->matter('date'), basename($translated) . ' changed its date');
    }
});

it('keeps every Vietnamese source in NFC', function (): void {
    foreach (localeSources('vi') as $path) {
        expect(Normalizer::isNormalized((string) file_get_contents($path), Normalizer::FORM_C))->toBeTrue("{$path} is not NFC");
    }
});

it('uses none of the wording the glossary rules out', function (): void {
    $rules = require base_path('tests/Support/vi-forbidden-variants.php');
    $offences = [];

    foreach (['vi', 'en'] as $locale) {
        $applicable = array_filter($rules, fn(array $rule): bool => $rule['applies'] === $locale);

        foreach (localeSources($locale) as $path) {
            foreach (visibleStrings($path) as $text) {
                $text = (string) Normalizer::normalize($text, Normalizer::FORM_C);

                foreach ($applicable as $rule) {
                    if (preg_match($rule['pattern'], $text, $match) === 1) {
                        $offences[] = sprintf('%s: "%s" (use %s)', str_replace(base_path() . '/', '', $path), $match[0], $rule['use']);
                    }
                }
            }
        }
    }

    expect($offences)->toBe([], "Glossary violations:\n  " . implode("\n  ", $offences));
});

it('reads the words a JSON content file prints, not its identifiers', function (): void {
    $path = tempnam(sys_get_temp_dir(), 'visible') . '.json';
    file_put_contents($path, json_encode([
        'sections' => [['id' => 'team', 'title' => 'Làm việc nhóm', 'paid' => ['team-library'], 'asset' => 'mac-team-library']],
        'availability' => [['label' => 'Thư viện nhóm', 'paid' => 'team-catalog']],
        'workflows' => ['paid' => 'Cần gói {tier}: {features}.'],
    ]));

    try {
        expect(visibleStrings($path))->toBe(['Làm việc nhóm', 'Thư viện nhóm', 'Cần gói {tier}: {features}.']);
    } finally {
        unlink($path);
    }
});

it('catches the variants it lists', function (string $text, bool $flagged): void {
    $rules = array_filter(require base_path('tests/Support/vi-forbidden-variants.php'), fn(array $rule): bool => $rule['applies'] === 'vi');

    $hit = collect($rules)->contains(fn(array $rule): bool => preg_match($rule['pattern'], $text) === 1);

    expect($hit)->toBe($flagged);
})->with([
    ['Xoá connection', true],
    ['Xóa connection', false],
    ['Tuỳ chọn', true],
    ['Quý khách', false],
    ['Tải xuống cho Mac', true],
    ['Tải về cho Mac', false],
    ['Mời thành viên vào team', true],
    ['Gói Team', false],
    ['Mở Settings > License', true],
    ['Cài đặt > Giấy phép (Settings > License)', false],
    ['Mua giấy phép', true],
    ['giấy phép AGPLv3', false],
    ['Tiếng Anh', true],
    ['(tiếng Anh)', false],
]);

/*
|--------------------------------------------------------------------------
| Untranslated values
|--------------------------------------------------------------------------
|
| A Vietnamese value identical to its English original is usually a string
| nobody translated. It is legitimate only when there is nothing to
| translate: an identifier, a token template, or words the glossary keeps in
| English (positioning §11: developer terms, and product, feature, tier, mode,
| engine and command names). The heuristic removes those and fails on any
| letter left over.
|
*/

/**
 * Keys whose values are identifiers in every locale: ContentParityTest's
 * structural keys plus links, docs paths and the product and note ids of a
 * database page's other tools.
 */
const UNTRANSLATED_NEUTRAL_KEY = '/(^|\.)(id|paid|asset|anchor|feature|engine|cite|href|url|docs|slug|src|icon|product|notes)(\.\d+)?$/';

/**
 * Words positioning §11 keeps in English, beyond the names the data files
 * already hold (untranslatedNames()). Each group says why.
 *
 * @return list<string>
 */
function untranslatedGlossaryTerms(): array
{
    return [
        // §11.1 and §11.2: category and developer terms.
        'database client', 'native', 'engine', 'driver', 'plugin', 'connection', 'query', 'schema', 'table', 'view', 'index',
        'trigger', 'transaction', 'file', 'import', 'export', 'dump', 'SQL editor', 'data grid', 'autocomplete', 'execution plan',
        'EXPLAIN', 'SSH tunnel', 'jump host', 'SSH', 'TLS', 'SSL', 'passphrase', 'tag', 'production', 'staging', 'Preview SQL',
        'Keychain', 'iCloud Keychain', 'AI chat', 'API key', 'model', 'MCP server', 'MCP', 'client', 'AI', 'SQL', 'GUI', 'Driver',
        // §11.2: Safe Mode, its levels and the modes.
        'Safe Mode', 'Silent', 'Alert', 'Read-Only', 'Confirm Writes', 'Agent mode',
        // §11.2: feature and command names stay as the app names them.
        'iCloud Sync', 'Data Files', 'Copy To', 'Transfer To', 'Open Quickly', 'Open Project Folder', 'Tunnel Command',
        'Server-Side Export', 'Server Dashboard', 'Users & Roles', 'ER diagram', 'Map view', 'New Table', 'Structure',
        'Result Charts', 'Environment Variables',
        // §11.2: Apple's names that are not translated.
        'Face ID', 'Touch ID', 'Optic ID', 'Handoff', 'Siri', 'Dynamic Island', 'AppleScript', 'App Store', 'Mac App Store',
        'Apple silicon', 'Intel',
        // §11.3 and §11.4: commerce and navigation terms that read the same.
        'license', 'license key', 'seat', 'merchant of record', 'Starter', 'Team', 'Blog', 'Changelog', 'Website', 'Web',
        // Database categories kept in English on the homepage and hub.
        'Document', 'Key-value', 'Wide-column', 'Streaming', 'Cloud',
        // Product and service names.
        'TablePro', 'GitHub', 'Homebrew', 'Setapp', 'Microsoft Entra ID', 'AWS IAM', 'Cloud SQL Auth Proxy', 'Windows', 'Linux',
        // Competitors' feature names as their vendors write them (compare rows).
        'Visual query builder', 'Version control', 'Data modeling', 'Bundles',
    ];
}

/**
 * The names the data files hold: engines, compared products and their
 * brands, paid features, and each platform's devices and systems.
 *
 * @return list<string>
 */
function untranslatedNames(): array
{
    $read = fn(string $file): array => json_decode((string) file_get_contents(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
    $names = [
        ...array_column($read('engines.json'), 'name'),
        ...array_column($read('comparisons.json')['products'] ?? [], 'name'),
        ...array_column($read('paid-features.json'), 'name'),
    ];

    // A compared product is also called by its brand alone: "Navicat Premium" is "Navicat", "Postico 2" "Postico".
    foreach (array_column($read('comparisons.json')['products'] ?? [], 'name') as $product) {
        $names[] = explode(' ', (string) $product)[0];
    }

    foreach ($read('platforms.json')['platforms'] ?? [] as $platform) {
        array_push($names, ...($platform['deviceNames'] ?? []), ...($platform['requirements']['systems'] ?? []));
    }

    return array_values(array_unique(array_filter($names, fn(mixed $name): bool => is_string($name) && $name !== '')));
}

/**
 * Whether a value has nothing to translate.
 */
function untranslatedIsNeutral(string $key, string $value): bool
{
    if (structuralIdentifier($key, $value, UNTRANSLATED_NEUTRAL_KEY) || preg_match('#^(/|\#|https?:|mailto:)#', $value) === 1) {
        return true;
    }

    if (preg_match('/^[a-z0-9][a-z0-9._:\/#@+-]*$|^[a-z]+(?:[A-Z][a-z0-9]*)+$/', $value) === 1) {
        return true;
    }

    static $terms = null;

    if ($terms === null) {
        $terms = array_values(array_unique([...untranslatedGlossaryTerms(), ...untranslatedNames()]));
        usort($terms, fn(string $a, string $b): int => mb_strlen($b) <=> mb_strlen($a));
    }

    $text = (string) preg_replace(['/\{[^}]*\}/u', '/<[^>]+>/u', '/`[^`]*`/u'], ' ', $value);

    foreach ($terms as $term) {
        $text = (string) preg_replace('/(?<![\p{L}\p{N}])' . preg_quote($term, '/') . '(?![\p{L}\p{N}])/iu', ' ', $text);
    }

    $text = (string) preg_replace('/(?<![\p{L}])vs(?![\p{L}])/u', ' ', $text);

    return preg_match('/\p{L}/u', $text) !== 1;
}

it('translates every Vietnamese value that has words to translate', function (): void {
    $untranslated = [];
    $compared = 0;

    foreach (contentTree('en') as $file) {
        if (! is_file(resource_path(CONTENT_ROOT . "/vi/{$file}"))) {
            continue;
        }

        $english = Arr::dot(contentJson('en', $file));
        $vietnamese = Arr::dot(contentJson('vi', $file));

        foreach ($english as $key => $value) {
            if (! is_string($value) || ! is_string($vietnamese[$key] ?? null) || trim($value) === '') {
                continue;
            }

            $compared++;

            if ($vietnamese[$key] === $value && ! untranslatedIsNeutral((string) $key, $value)) {
                $untranslated[] = "content/vi/{$file} {$key}: \"{$value}\"";
            }
        }
    }

    expect($compared)->toBeGreaterThan(1000)
        ->and($untranslated)->toBe([], "Vietnamese values left in English (translate them, or add a kept term with its glossary reason):\n  " . implode("\n  ", $untranslated));
});

it('ships native prose and NFC source text in every added language', function (string $locale): void {
    foreach (localeSources($locale) as $path) {
        expect(Normalizer::isNormalized((string) file_get_contents($path), Normalizer::FORM_C))->toBeTrue("{$path} is not NFC");
    }

    foreach (contentTree('en') as $file) {
        $english = Arr::dot(contentJson('en', $file));
        $translated = Arr::dot(contentJson($locale, $file));
        foreach ($english as $key => $line) {
            if (! is_string($line) || untranslatedIsNeutral((string) $key, $line)) {
                continue;
            }
            preg_match_all('/\b[A-Za-z]{2,}\b/', $line, $words);
            if (count($words[0]) >= 5) {
                expect($translated[$key])->not->toBe($line, "{$locale}/{$file}.{$key}: visible English prose left untranslated");
            }
        }
    }
})->with(array_values(array_diff(array_keys((json_decode((string) file_get_contents(__DIR__ . '/../../../resources/data/locales.json'), true))['supported']), ['en', 'vi'])));

it('tells an untranslated string from one with nothing to translate', function (string $key, string $value, bool $neutral): void {
    expect(untranslatedIsNeutral($key, $value))->toBe($neutral);
})->with([
    'a sentence' => ['sections.0.body', 'Connect over SSH and run a query.', false],
    'a short label' => ['cta', 'See pricing', false],
    'a token template' => ['hero.macCaption', '{requirement} · {architectures}', true],
    'an engine name' => ['sections.2.title', 'PostgreSQL', true],
    'a comparison title' => ['header.title', 'TablePro vs DBeaver', true],
    'a feature name' => ['availability.3.label', 'Compare & Sync', true],
    'a kept category' => ['databases.categories.document', 'Document', true],
    'an identifier key' => ['sections.0.id', 'move-data', true],
    'a camelCase value' => ['facts.0.key', 'schemaReadOnly', true],
    'a kept term in a phrase' => ['docs.0.label', 'SQL editor', true],
    'a kept term in a sentence' => ['docs.0.label', 'Open the SQL editor', false],
    'a sentence under a structural key' => ['workflows.paid', 'Requires a {tier} plan: {features}.', false],
    'a label under a docs key' => ['labels.header.docs', 'Read the docs', false],
    'an identifier under a structural key' => ['sections.0.feature', 'cells.importExport', true],
]);
