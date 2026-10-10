<?php

use Spatie\YamlFrontMatter\YamlFrontMatter;

require_once __DIR__ . '/helpers.php';

/**
 * @return list<string>
 */
function typedCountPatterns(): array
{
    return [
        '/(?<![\p{L}\p{N}.,-])\d+\+?\s+(?:[\p{L}&-]+\s+){0,3}?(?:databases?|engines?|drivers?|connectors?|plugins?|features?|tools?|providers?|levels?|record\s+types?|categor(?:y|ies)|languages?|themes?|integrations?)(?![\p{L}\p{N}])/iu',
        '/(?<![\p{L}\p{N}.,-])\d+\+?\s+(?:(?:loại|hệ)\s+)?(?:cơ sở dữ liệu|hệ quản trị|engine|driver|plugin|tính năng|công cụ|nhà cung cấp|mức|cấp độ|ngôn ngữ|loại bản ghi|danh mục|loại dữ liệu|kiểu dữ liệu|chủ đề|giao diện)(?![\p{L}\p{N}])/iu',
    ];
}

/**
 * @return list<string>
 */
function typedCounts(string $text): array
{
    $found = [];

    foreach (typedCountPatterns() as $pattern) {
        if (preg_match_all($pattern, $text, $matches) > 0) {
            array_push($found, ...$matches[0]);
        }
    }

    return $found;
}

it('types no count of engines, tools, providers, levels, record types, paid features or languages', function (): void {
    // Every such count went stale here at least once: 16 MCP tools against 47 in code, "29 engines" against 37.
    $offences = [];
    $read = 0;

    foreach (contentGuardSources() as $source) {
        foreach ($source['strings'] as $key => $text) {
            $read++;

            if (contentGuardIsSourcedNote($source['path'], $key, dated: false)) {
                continue;
            }

            foreach (typedCounts(contentGuardText($text)) as $count) {
                $offences[] = "{$source['path']} {$key}: \"{$count}\"";
            }
        }
    }

    expect($read)->toBeGreaterThan(5000)
        ->and($offences)->toBe([], "Typed counts (derive them from data, or name the things):\n  " . implode("\n  ", $offences));
});

it('recognises a typed count in either language, and leaves versions, tokens and workflows alone', function (string $text, bool $typed): void {
    expect(typedCounts(contentGuardText($text)) !== [])->toBe($typed);
})->with([
    ['16 MCP tools', true],
    ['Connect to 29 database engines', true],
    ['20+ databases', true],
    ['13 AI providers', true],
    ['Six levels, 6 Safe Mode levels', true],
    ['12 record types sync', true],
    ['the app in 6 languages', true],
    ['9 built-in themes', true],
    ['47 công cụ MCP', true],
    ['hỗ trợ 29 loại cơ sở dữ liệu', true],
    ['6 mức Safe Mode', true],
    ['12 sync categories', true],
    ['Đồng bộ 12 kiểu dữ liệu', true],
    ['Đồng bộ 12 danh mục', true],
    ['Hỗ trợ hơn 30 hệ cơ sở dữ liệu', true],
    ['47 SQL & NoSQL databases', true],
    ['9 database connectors', true],
    ['its SHA-256 checksum against the plugin', false],
    ['{engineCount} engines', false],
    ['Compare & Sync compares two databases', false],
    ['New in 0.77 features', false],
    ['macOS 13 or later', false],
    ['up to 3 Macs', false],
    ['within 7 days of purchase', false],
]);

it('allows a competitor count only in a comparison cell that cites a source (A6)', function (): void {
    $products = contentGuardDecode(resource_path('data/comparisons.json'))['products'] ?? [];
    $sourced = null;

    foreach ($products as $product) {
        foreach ([...array_values($product['cells'] ?? []), ...($product['prices'] ?? [])] as $cell) {
            if (is_string($cell['note'] ?? null) && is_string($cell['source'] ?? null)) {
                $sourced ??= $cell['note'];
            }
        }
    }

    expect($sourced)->not->toBeNull('No comparison cell cites a source, so A6 has nothing to allow');
    expect(contentGuardIsSourcedNote('resources/data/content/en/compare/tableplus.json', "notes.{$sourced}", dated: false))->toBeTrue()
        ->and(contentGuardIsSourcedNote('resources/data/content/en/compare/tableplus.json', 'notes.no-such-note', dated: false))->toBeFalse()
        ->and(contentGuardIsSourcedNote('resources/data/content/en/compare/tableplus.json', 'faq.0.answer', dated: false))->toBeFalse()
        ->and(contentGuardIsSourcedNote('resources/data/content/en/home.json', "notes.{$sourced}", dated: false))->toBeFalse();
});

it('counts no engines on any post’s OG card', function (): void {
    // The iPhone post's "Ten engines on the phone" card left out Redshift, which opens there once synced.
    $offences = [];

    foreach ([...(glob(resource_path('blog/*.md')) ?: []), ...(glob(resource_path('blog/vi/*.md')) ?: [])] as $post) {
        $punchline = (string) YamlFrontMatter::parseFile($post)->matter('ogPunchline');

        if (preg_match('/(?<![\p{L}\p{N}.,-])(?:\d+\+?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|twenty|thirty)\s+(?:[\p{L}-]+\s+){0,2}?engines?\b/iu', $punchline, $match) === 1) {
            $offences[] = contentGuardRelative($post) . ": \"{$match[0]}\"";
        }
    }

    expect($offences)->toBe([]);
});
