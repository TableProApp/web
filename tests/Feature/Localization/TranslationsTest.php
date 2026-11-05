<?php

use App\Services\Legal\LegalDocuments;
use App\Support\Content\MarkdownRenderer;
use Illuminate\Support\Arr;
use Spatie\YamlFrontMatter\YamlFrontMatter;

function translationsContentFiles(string $locale): array
{
    $root = resource_path("data/content/{$locale}");
    $files = [];

    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)) as $file) {
        $files[] = substr($file->getPathname(), strlen($root) + 1);
    }

    sort($files);

    return $files;
}

function translationsContent(string $locale, string $file): array
{
    // seo.indexable is how a translated page renders without being indexed.
    $data = json_decode((string) file_get_contents(resource_path("data/content/{$locale}/{$file}")), true, 512, JSON_THROW_ON_ERROR);

    return Arr::except(Arr::dot($data), ['seo.indexable']);
}

// What a translation must carry over unchanged: the type, {slots}, `code`, inline tags, and identifiers and links.
function translationsContract(mixed $value, string $key): array
{
    if (! is_string($value)) {
        return [get_debug_type($value)];
    }

    preg_match_all('/\{([A-Za-z][A-Za-z0-9_.]*)\}/', $value, $slots);
    preg_match_all('/`[^`]*`/', $value, $code);
    preg_match_all('/<\/?[a-z]+>/', $value, $tags);

    $contract = ['string', array_unique($slots[1]), $code[0], array_unique($tags[0])];

    foreach (array_slice($contract, 1) as $index => $list) {
        sort($list);
        $contract[$index + 1] = array_values($list);
    }

    $identifier = preg_match('/(^|\.)(id|asset|anchor|feature|cite|slug|icon|engine|product)(\.\d+)?$/', $key) === 1
        && preg_match('/^[a-z][A-Za-z0-9._:\/#@+-]*$/', $value) === 1;
    $link = preg_match('/(^|\.)(href|url|docs|src|path)(\.\d+)?$/', $key) === 1
        && preg_match('~^(?:https?://|mailto:|/|#)~', $value) === 1;

    if (preg_match('/(^|\.)(labels|columns|headers)\./', $key) !== 1 && ($identifier || $link)) {
        $contract[] = preg_replace('/locale=[a-zA-Z-]+/', 'locale={locale}', $value);
    }

    return $contract;
}

function translationsUnbalancedTags(string $value): ?string
{
    preg_match_all('/<\/?[a-z]+>/', $value, $tags);
    $open = [];

    foreach ($tags[0] as $tag) {
        if (! str_starts_with($tag, '</')) {
            $open[] = $tag;
        } elseif (array_pop($open) !== str_replace('</', '<', $tag)) {
            return $tag;
        }
    }

    return $open === [] ? null : end($open);
}

function translationsIsProse(string $value): bool
{
    if (preg_match('~^(?:https?://|mailto:|/|#)~', $value) === 1) {
        return false;
    }

    $text = trim((string) preg_replace(['/\{[^}]*\}/', '/<[^>]+>/', '/`[^`]*`/'], ' ', $value));

    return preg_match_all('/\b[A-Za-z]{2,}\b/', $text) >= 5 && count(preg_split('/\s+/', $text) ?: []) >= 5;
}

function translationsHeadingIds(string $path): array
{
    preg_match_all('/<h[1-6] id="([^"]+)"/', app(MarkdownRenderer::class)->render(YamlFrontMatter::parseFile($path)->body()), $ids);
    sort($ids[1]);

    return $ids[1];
}

function translationsSources(string $locale): array
{
    $sources = $locale === 'vi' ? glob(resource_path('blog/vi/*.md')) ?: [] : [];

    foreach ([resource_path("data/content/{$locale}"), resource_path("data/legal/{$locale}"), resource_path("js/i18n/messages/{$locale}"), lang_path($locale)] as $dir) {
        if (is_dir($dir)) {
            foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS)) as $file) {
                $sources[] = $file->getPathname();
            }
        }
    }

    return $sources;
}

function translationsLangFiles(string $locale): array
{
    $files = array_map('basename', glob(lang_path("{$locale}/*.php")) ?: []);
    sort($files);

    return $files;
}

describe('page copy', function (): void {
    it('has the same content files as English', function (string $locale): void {
        expect(translationsContentFiles($locale))->toBe(translationsContentFiles('en'));
    })->with('translated locales');

    it('keeps the keys, slots, markup, identifiers and assets of the English copy', function (string $locale): void {
        foreach (translationsContentFiles('en') as $file) {
            $english = translationsContent('en', $file);
            $translated = translationsContent($locale, $file);

            expect(array_keys($translated))->toEqualCanonicalizing(array_keys($english), "{$locale}/{$file}: different keys");

            foreach ($english as $key => $value) {
                expect(translationsContract($translated[$key], $key))
                    ->toBe(translationsContract($value, $key), "{$locale}/{$file} {$key}: different type, slots, code, tags or identifier");

                if (is_string($value) && trim($value) !== '') {
                    expect(trim($translated[$key]))->not->toBe('', "{$locale}/{$file} {$key}: empty translation");
                }
            }
        }
    })->with('translated locales');

    it('closes every inline tag it opens', function (string $locale): void {
        foreach (translationsContentFiles($locale) as $file) {
            foreach (translationsContent($locale, $file) as $key => $value) {
                if (is_string($value)) {
                    expect(translationsUnbalancedTags($value))->toBeNull("{$locale}/{$file} {$key}: unbalanced markup");
                }
            }
        }
    })->with('locales');

    it('leaves no English sentence untranslated', function (string $locale): void {
        foreach (translationsContentFiles('en') as $file) {
            $translated = translationsContent($locale, $file);

            foreach (translationsContent('en', $file) as $key => $value) {
                if (is_string($value) && translationsIsProse($value)) {
                    expect($translated[$key] ?? null)->not->toBe($value, "{$locale}/{$file} {$key}: English left untranslated");
                }
            }
        }
    })->with('translated locales');
});

describe('server strings', function (): void {
    it('has the same files, keys and placeholders as English', function (string $locale): void {
        expect(translationsLangFiles($locale))->toBe(translationsLangFiles('en'));

        foreach (translationsLangFiles('en') as $file) {
            $english = array_filter(Arr::dot(require lang_path("en/{$file}")), 'is_string');
            $translated = array_filter(Arr::dot(require lang_path("{$locale}/{$file}")), 'is_string');

            expect(array_keys($translated))->toBe(array_keys($english), "lang/{$locale}/{$file}: different keys");

            foreach ($english as $key => $text) {
                preg_match_all('/:([a-z_]+)/i', $text, $expected);
                preg_match_all('/:([a-z_]+)/i', $translated[$key], $actual);

                expect($actual[1])->toEqualCanonicalizing($expected[1], "lang/{$locale}/{$file} {$key}: different placeholders")
                    ->and(trim($translated[$key]))->not->toBe('', "lang/{$locale}/{$file} {$key}: empty");
            }
        }
    })->with('translated locales');
});

describe('long prose', function (): void {
    it('translates every legal document but the English-only ones, with the same heading ids', function (string $locale): void {
        foreach (glob(resource_path('data/legal/en/*.md')) ?: [] as $english) {
            $document = basename($english, '.md');
            $translated = resource_path("data/legal/{$locale}/{$document}.md");

            if (in_array($document, LegalDocuments::ENGLISH_ONLY, true)) {
                expect(is_file($translated))->toBeFalse("{$locale}/{$document}.md exists, but the document is English only");

                continue;
            }

            expect(is_file($translated))->toBeTrue("{$locale}/{$document}.md is missing")
                ->and(translationsHeadingIds($translated))->toBe(translationsHeadingIds($english), "{$locale}/{$document}.md: heading ids differ");
        }
    })->with('translated locales');

    it('ties a translated post to its English original and its date', function (): void {
        $translations = glob(resource_path('blog/*/*.md')) ?: [];

        expect($translations)->not->toBeEmpty();

        foreach ($translations as $translated) {
            $english = resource_path('blog/' . basename($translated));

            expect(is_file($english))->toBeTrue("{$translated} has no English original")
                ->and((string) YamlFrontMatter::parseFile($translated)->matter('date'))
                ->toBe((string) YamlFrontMatter::parseFile($english)->matter('date'), "{$translated} changed its date");
        }
    });
});

it('stores every translated source in NFC', function (string $locale): void {
    foreach (translationsSources($locale) as $path) {
        expect(Normalizer::isNormalized((string) file_get_contents($path), Normalizer::FORM_C))->toBeTrue("{$path} is not NFC");
    }
})->with('translated locales');
