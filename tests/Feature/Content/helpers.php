<?php

use Spatie\YamlFrontMatter\YamlFrontMatter;

// redirects.json and locales.json hold paths and codes only.
const CONTENT_GUARD_DATA_FILES = ['assets', 'brand', 'comparisons', 'engines', 'facts', 'integrations', 'paid-features', 'platforms', 'pricing', 'sponsors'];

// A key alone never hides a value: `workflows.paid` is a sentence, so the value must also be identifier-shaped.
const CONTENT_GUARD_STRUCTURAL_KEY = '/(^|\.)(id|paid|asset|anchor|feature|engine|cite|href|url|docs|slug|source|src|icon)(\.\d+)?$/';

const CONTENT_GUARD_IDENTIFIER = '/^[a-z0-9][A-Za-z0-9._:\/#@+-]*$/';

/**
 * @return list<array{path: string, kind: string, strings: array<string, string>}>
 */
function contentGuardSources(): array
{
    static $sources = null;

    if ($sources !== null) {
        return $sources;
    }

    $sources = [];
    $add = function (string $absolute, string $kind, array $strings) use (&$sources): void {
        $sources[] = ['path' => contentGuardRelative($absolute), 'kind' => $kind, 'strings' => $strings];
    };

    foreach (['en', 'vi'] as $locale) {
        foreach (contentGuardFiles(resource_path("data/content/{$locale}"), 'json') as $file) {
            $add($file, 'content', contentGuardJsonStrings(contentGuardDecode($file)));
        }

        foreach (contentGuardFiles(resource_path("js/i18n/messages/{$locale}"), 'ts') as $file) {
            if (basename($file) !== 'index.ts') {
                $add($file, 'catalog', contentGuardCatalogStrings($file));
            }
        }

        foreach (contentGuardFiles(lang_path($locale), 'php') as $file) {
            $add($file, 'catalog', contentGuardFlatten(require $file));
        }

        foreach (contentGuardFiles(resource_path("data/legal/{$locale}"), 'md') as $file) {
            $add($file, 'legal', contentGuardMarkdownStrings($file));
        }
    }

    foreach (CONTENT_GUARD_DATA_FILES as $name) {
        $add(resource_path("data/{$name}.json"), 'data', contentGuardJsonStrings(contentGuardDecode(resource_path("data/{$name}.json"))));
    }

    foreach ([...(glob(resource_path('blog/*.md')) ?: []), ...(glob(resource_path('blog/vi/*.md')) ?: [])] as $file) {
        if (! contentGuardIsReleasePost($file)) {
            $add($file, 'post', contentGuardMarkdownStrings($file));
        }
    }

    return $sources;
}

// Translated posts are never archives, whatever their front matter says.
function contentGuardIsReleasePost(string $file): bool
{
    if (basename(dirname($file)) !== 'blog') {
        return false;
    }

    $release = YamlFrontMatter::parseFile($file)->matter('release');

    return is_string($release) && trim($release) !== '';
}

/**
 * @return list<string>
 */
function contentGuardFiles(string $directory, string $extension): array
{
    if (! is_dir($directory)) {
        return [];
    }

    $files = [];

    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS)) as $file) {
        if ($file->isFile() && $file->getExtension() === $extension) {
            $files[] = $file->getPathname();
        }
    }

    sort($files);

    return $files;
}

function contentGuardRelative(string $absolute): string
{
    return ltrim(str_replace(base_path(), '', $absolute), '/');
}

/**
 * @return array<array-key, mixed>
 */
function contentGuardDecode(string $file): array
{
    $decoded = json_decode((string) file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);

    return is_array($decoded) ? $decoded : [];
}

/**
 * @param  array<array-key, mixed>  $data
 * @return array<string, string>
 */
function contentGuardJsonStrings(array $data, string $prefix = ''): array
{
    $strings = [];
    $isList = array_is_list($data);

    foreach ($data as $key => $value) {
        // Keyed by a list item's id, so an allowlist scope survives a reorder.
        $segment = $isList && is_array($value) && is_string($value['id'] ?? null) ? $value['id'] : (string) $key;
        $path = $prefix === '' ? $segment : "{$prefix}.{$segment}";

        if (is_array($value)) {
            foreach (contentGuardJsonStrings($value, $path) as $childKey => $text) {
                $strings[$childKey] = $text;
            }

            continue;
        }

        if (is_string($value) && contentGuardIsVisible($path, $value)) {
            $strings[$path] = $value;
        }
    }

    return $strings;
}

function contentGuardIsVisible(string $key, string $value): bool
{
    if (trim($value) === '') {
        return false;
    }

    if (preg_match(CONTENT_GUARD_STRUCTURAL_KEY, $key) === 1 && preg_match(CONTENT_GUARD_IDENTIFIER, $value) === 1) {
        return false;
    }

    if (preg_match('#^(/|\#|https?:|mailto:)#', $value) === 1) {
        return false;
    }

    return preg_match('/^[a-z0-9][a-z0-9._:\/#@+-]*$/', $value) !== 1;
}

/**
 * @param  array<array-key, mixed>  $data
 * @return array<string, string>
 */
function contentGuardFlatten(array $data, string $prefix = ''): array
{
    $strings = [];

    foreach ($data as $key => $value) {
        $path = $prefix === '' ? (string) $key : "{$prefix}.{$key}";

        if (is_array($value)) {
            foreach (contentGuardFlatten($value, $path) as $childKey => $text) {
                $strings[$childKey] = $text;
            }
        } elseif (is_string($value) && contentGuardIsVisible($path, $value)) {
            $strings[$path] = $value;
        }
    }

    return $strings;
}

/**
 * @return array<string, string>
 */
function contentGuardMarkdownStrings(string $file): array
{
    $document = YamlFrontMatter::parseFile($file);
    $strings = [];

    foreach ($document->matter() as $field => $value) {
        if (is_string($value) && contentGuardIsVisible("matter.{$field}", $value)) {
            $strings["matter.{$field}"] = $value;
        }
    }

    // A command or a keyword is not a claim.
    $body = (string) preg_replace(['/```.*?```/s', '/`[^`\n]*`/'], ' ', $document->body());

    foreach (preg_split('/\n\s*\n/', $body) ?: [] as $index => $paragraph) {
        if (trim($paragraph) !== '') {
            $strings['paragraph.' . ($index + 1)] = trim($paragraph);
        }
    }

    return $strings;
}

/**
 * @return array<string, string>
 */
function contentGuardCatalogStrings(string $file): array
{
    // Parsed, not run: the PHP job has no Node with type stripping. Anything unsupported throws.
    $source = (string) file_get_contents($file);

    if (preg_match('/export\s+default\s+\{/', $source, $match, PREG_OFFSET_CAPTURE) !== 1) {
        throw new RuntimeException("{$file} has no `export default {` object literal to read.");
    }

    $offset = $match[0][1] + strlen($match[0][0]) - 1;
    $value = contentGuardTsValue($source, $offset, $file);

    return is_array($value) ? contentGuardFlatten($value) : [];
}

function contentGuardTsValue(string $source, int &$offset, string $file): mixed
{
    contentGuardTsSkip($source, $offset);
    $char = $source[$offset] ?? '';

    if ($char === '{' || $char === '[') {
        return contentGuardTsCollection($source, $offset, $file);
    }

    if ($char === "'" || $char === '"' || $char === '`') {
        return contentGuardTsString($source, $offset, $file);
    }

    if (preg_match('/\G(-?\d+(?:\.\d+)?|true|false|null)\b/', $source, $match, 0, $offset) === 1) {
        $offset += strlen($match[0]);

        return json_decode($match[0]);
    }

    throw new RuntimeException(sprintf('%s: unsupported syntax at line %d.', $file, substr_count(substr($source, 0, $offset), "\n") + 1));
}

/**
 * @return array<array-key, mixed>
 */
function contentGuardTsCollection(string $source, int &$offset, string $file): array
{
    $object = $source[$offset] === '{';
    $close = $object ? '}' : ']';
    $values = [];
    $offset++;

    while (true) {
        contentGuardTsSkip($source, $offset);

        if (($source[$offset] ?? '') === $close) {
            $offset++;

            return $values;
        }

        if ($object) {
            if (in_array($source[$offset] ?? '', ["'", '"'], true)) {
                $key = contentGuardTsString($source, $offset, $file);
            } elseif (preg_match('/\G[A-Za-z_$][A-Za-z0-9_$]*/', $source, $match, 0, $offset) === 1) {
                $key = $match[0];
                $offset += strlen($key);
            } else {
                throw new RuntimeException(sprintf('%s: unsupported key at line %d.', $file, substr_count(substr($source, 0, $offset), "\n") + 1));
            }

            contentGuardTsSkip($source, $offset);

            if (($source[$offset] ?? '') !== ':') {
                throw new RuntimeException(sprintf('%s: expected ":" after "%s" at line %d.', $file, $key, substr_count(substr($source, 0, $offset), "\n") + 1));
            }

            $offset++;
            $values[$key] = contentGuardTsValue($source, $offset, $file);
        } else {
            $values[] = contentGuardTsValue($source, $offset, $file);
        }

        contentGuardTsSkip($source, $offset);

        if (($source[$offset] ?? '') === ',') {
            $offset++;
        }
    }
}

function contentGuardTsString(string $source, int &$offset, string $file): string
{
    $quote = $source[$offset];
    $offset++;
    $text = '';
    $escapes = ['n' => "\n", 't' => "\t", 'r' => "\r", '0' => "\0", 'b' => "\x08", 'f' => "\f", 'v' => "\v"];

    while ($offset < strlen($source)) {
        $char = $source[$offset];

        if ($char === $quote) {
            $offset++;

            return $text;
        }

        if ($quote === '`' && $char === '$' && ($source[$offset + 1] ?? '') === '{') {
            throw new RuntimeException(sprintf('%s: a template literal with a substitution at line %d.', $file, substr_count(substr($source, 0, $offset), "\n") + 1));
        }

        if ($char === '\\') {
            $next = $source[$offset + 1] ?? '';

            if ($next === 'u' && preg_match('/\G\\\\u(?:\{([0-9A-Fa-f]+)\}|([0-9A-Fa-f]{4}))/', $source, $match, 0, $offset) === 1) {
                $text .= mb_chr((int) hexdec($match[1] !== '' ? $match[1] : $match[2]), 'UTF-8');
                $offset += strlen($match[0]);

                continue;
            }

            if ($next === "\n") {
                $offset += 2;

                continue;
            }

            $text .= $escapes[$next] ?? $next;
            $offset += 2;

            continue;
        }

        $text .= $char;
        $offset++;
    }

    throw new RuntimeException("{$file}: an unterminated string.");
}

function contentGuardTsSkip(string $source, int &$offset): void
{
    while (preg_match('#\G(?:\s+|//[^\n]*|/\*.*?\*/)#s', $source, $match, 0, $offset) === 1 && $match[0] !== '') {
        $offset += strlen($match[0]);
    }
}

function contentGuardText(string $text): string
{
    $text = (string) Normalizer::normalize($text, Normalizer::FORM_C);
    $text = str_replace(["\u{2019}", "\u{2018}", "\u{02BC}"], "'", $text);
    $text = str_replace(["\u{2010}", "\u{2011}"], '-', $text);
    $text = str_replace(["\u{00A0}", "\u{202F}"], ' ', $text);

    return (string) preg_replace([
        '#<code>.*?</code>#su',
        '/`[^`]*`/u',
        '/\]\([^)\s]*\)/u',
        '/\b(?:href|src)="[^"]*"/u',
        '#\bhttps?://[^\s)"\'<>]+#u',
        '/\{\#[A-Za-z0-9_-]+\}/u',
    ], [' ', ' ', '] ', ' ', ' ', ' '], $text);
}

function contentGuardPhrasePattern(string $phrase): string
{
    static $patterns = [];

    return $patterns[$phrase] ??= contentGuardBuildPhrasePattern($phrase);
}

function contentGuardBuildPhrasePattern(string $phrase): string
{
    $phrase = contentGuardText($phrase);
    $body = preg_quote($phrase, '/');
    $body = (string) preg_replace('/\s+/', '\s+', $body);
    $body = str_replace('\-', '[-\s]?', $body);

    // Unicode boundaries, not PCRE's ASCII \b: "đột phá" must not match inside "xung đột pháp luật".
    $before = preg_match('/^[\p{L}\p{N}]/u', $phrase) === 1 ? '(?<![\p{L}\p{M}\p{N}_])' : '';
    $after = preg_match('/[\p{L}\p{N}]$/u', $phrase) === 1 ? '(?![\p{L}\p{M}\p{N}_])' : '';

    return "/{$before}{$body}{$after}/iu";
}

/**
 * @param  list<string>  $scopes
 */
function contentGuardInScope(array $scopes, string $path, string $key): bool
{
    // A scope is a glob, optionally followed by `#` and a key prefix; `*` covers every source.
    foreach ($scopes as $scope) {
        [$glob, $prefix] = array_pad(explode('#', $scope, 2), 2, '');

        if (($glob === '*' || fnmatch($glob, $path)) && ($prefix === '' || str_starts_with($key, $prefix))) {
            return true;
        }
    }

    return false;
}

// Positioning §12.2 allows a competitor's count (A6) and a download size (A7) only in a sourced note.
function contentGuardIsSourcedNote(string $path, string $key, bool $dated): bool
{
    if (! fnmatch('resources/data/content/*/compare/*.json', $path) || preg_match('/^notes\.(.+)$/', $key, $match) !== 1) {
        return false;
    }

    static $products = null;
    $products ??= contentGuardDecode(resource_path('data/comparisons.json'))['products'] ?? [];

    foreach ($products as $product) {
        if ($dated && ! is_string($product['checkedAt'] ?? null)) {
            continue;
        }

        foreach ([...array_values($product['cells'] ?? []), ...($product['prices'] ?? [])] as $cell) {
            if (is_array($cell) && ($cell['note'] ?? null) === $match[1] && array_filter((array) ($cell['source'] ?? [])) !== []) {
                return true;
            }
        }
    }

    return false;
}
