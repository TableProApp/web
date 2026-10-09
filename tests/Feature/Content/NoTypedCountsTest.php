<?php

use Spatie\YamlFrontMatter\YamlFrontMatter;

require_once __DIR__ . '/helpers.php';

/**
 * No source types a count of what TablePro has: engines, drivers, plugins,
 * MCP tools, AI providers, Safe Mode levels, sync record types, paid
 * features, UI languages or themes (positioning §12.1 "Typed counts";
 * architecture §1.17).
 *
 * Every such number has gone stale on this site at least once: 16 MCP tools
 * against 47 in code, 13 AI providers against 14, "29 engines" against 37,
 * "ten" record types against 12, "9 built-in themes" against 4. Each was right
 * on the day it was typed. A count is derived from data (`{engineCount}` and
 * its kin), or the things are named instead.
 *
 * Generalises `Landing/EngineCountTest` to every content, catalog, legal and
 * data source in both languages (helpers.php), with release posts exempt as
 * archives. A competitor's count may stand only in a comparison cell that
 * cites a source (allowlist A6, positioning §12.2). Spelled-out counts
 * ("nine drivers") are the reviewer's: "two databases" is a workflow, not a
 * count, and no pattern tells them apart.
 */

/**
 * A numeral, or "N+", before a counted noun, with up to three words between
 * ("16 MCP tools", "29 database engines", "47 SQL & NoSQL databases", "47
 * công cụ MCP", "6 mức Safe Mode", "30 hệ cơ sở dữ liệu"). Sync record types
 * are counted under the app's own label too ("Sync Categories", "danh mục").
 * A numeral that is part of a version, a decimal or a name such as
 * "SHA-256" is not a count.
 *
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
    /*
     * A release post is exempt as an archive, but its punchline is its OG
     * card, shared long after the count goes stale: the iPhone post's "Ten
     * engines on the phone" left out Redshift, which opens there once synced.
     * Engines only: "Diff two databases" is a workflow.
     */
    $offences = [];

    foreach ([...(glob(resource_path('blog/*.md')) ?: []), ...(glob(resource_path('blog/vi/*.md')) ?: [])] as $post) {
        $punchline = (string) YamlFrontMatter::parseFile($post)->matter('ogPunchline');

        if (preg_match('/(?<![\p{L}\p{N}.,-])(?:\d+\+?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|twenty|thirty)\s+(?:[\p{L}-]+\s+){0,2}?engines?\b/iu', $punchline, $match) === 1) {
            $offences[] = contentGuardRelative($post) . ": \"{$match[0]}\"";
        }
    }

    expect($offences)->toBe([]);
});
