<?php

use Symfony\Component\Process\Process;

const LINT_DRAFT_POST = <<<'MD'
---
slug: a-post
title: "TablePro 9.9: Tabs per Database"
description: Each database on a connection keeps its own tabs.
date: 2026-10-16
release: "TablePro 9.9"
author: TablePro Team
tags: [release, connections]
ogPunchline: Each database keeps its own tabs.
---

TablePro 9.9 is out: 12 changes, 8 of them fixes.

<asset-slot id="blog-tablepro-0-81-1"></asset-slot>

## Tabs per database

Each database in the connections strip keeps its own tabs, and the tab bar shows the tabs of the one you're on. Switching database brings back that database's last tab, and a query tab stays on the database it was opened in.

## Getting it

Choose **TablePro > Check for Updates**.
MD;

const LINT_DRAFT_NEWSLETTER = <<<'MD'
**Subject:** TablePro 9.9: tabs per database

**Preview text:** Plus eight fixes, and query tabs that remember their database.

---

# TablePro 9.9

Each database on a connection keeps its own tabs.
MD;

const LINT_DRAFT_X = <<<'MD'
## 1/2

TablePro 9.9 is out. We finally made tabs follow the database you're on.

## 2/2

Full post: https://tablepro.app/blog/a-post
MD;

/**
 * @return array{0: int|null, 1: string}
 */
function lintDraft(string $text, string ...$options): array
{
    $directory = sys_get_temp_dir() . '/lint-draft-' . bin2hex(random_bytes(4));
    mkdir($directory);
    $draft = "{$directory}/a-post.md";
    file_put_contents($draft, $text);

    $process = new Process(['python3', base_path('.claude/skills/announce/scripts/lint-draft.py'), ...$options, $draft]);
    $process->run();

    unlink($draft);
    rmdir($directory);

    return [$process->getExitCode(), $process->getOutput()];
}

it('passes a release post in the house shape, with a supplied figure', function (): void {
    [$exit, $output] = lintDraft(LINT_DRAFT_POST, '--blog');

    expect($exit)->toBe(0, $output);
});

it('fails a release post that would not ship', function (string $from, string $to, string $finding): void {
    [$exit, $output] = lintDraft(str_replace($from, $to, LINT_DRAFT_POST), '--blog');

    expect($exit)->toBe(1)
        ->and($output)->toContain($finding);
})->with([
    'no figure' => ['<asset-slot id="blog-tablepro-0-81-1"></asset-slot>', '', 'no <asset-slot>'],
    'a slot with no manifest entry' => ['blog-tablepro-0-81-1', 'blog-no-such-slot', 'has no entry in resources/data/assets.json'],
    'a raw image' => ['<asset-slot id="blog-tablepro-0-81-1"></asset-slot>', "<asset-slot id=\"blog-tablepro-0-81-1\"></asset-slot>\n\n![Tabs](/images/blog/tabs.png)", 'raw image'],
    'a description over the SEO budget' => ['keeps its own tabs.', 'keeps its own tabs. ' . str_repeat('Long. ', 30), 'SeoLengthsTest allows 155'],
    'no release' => ["release: \"TablePro 9.9\"\n", '', 'missing release'],
    'a slug that is not the filename' => ['slug: a-post', 'slug: another-post', 'does not match the filename'],
]);

it('holds the newsletter to no first person', function (string $sentence, bool $flagged): void {
    [$exit, $output] = lintDraft(str_replace('Each database on a connection keeps its own tabs.', $sentence, LINT_DRAFT_NEWSLETTER));

    expect($exit)->toBe($flagged ? 1 : 0, $output)
        ->and(str_contains($output, 'first person'))->toBe($flagged);
})->with([
    'we' => ['We fixed eight bugs.', true],
    'a contraction' => ["We'll ship more next week.", true],
    'I' => ['I fixed eight bugs.', true],
    'my' => ['My latest release keeps tabs per database.', true],
    'a US App Store link' => ['Get it from [the App Store](https://apps.apple.com/us/app/tablepro/id6761621829).', false],
    'US spelling' => ['Colors follow US spelling.', false],
]);

it('passes X posts that speak as the developer and fit the limit', function (string $posts): void {
    [$exit, $output] = lintDraft($posts, '--x');

    expect($exit)->toBe(0, $output);
})->with([
    'the thread' => [LINT_DRAFT_X],
    'a joined emoji, which X counts as two' => ["## 1/1\n\n" . str_repeat('a', 278) . "\u{1F469}\u{200D}\u{1F4BB}"],
]);

it('fails an X post that X would cut or print as markdown', function (string $from, string $to, string $finding): void {
    [$exit, $output] = lintDraft(str_replace($from, $to, LINT_DRAFT_X), '--x');

    expect($exit)->toBe(1)
        ->and($output)->toContain($finding);
})->with([
    'over 280 characters' => ['is out.', 'is out. ' . str_repeat('More words here. ', 20), 'X allows 280'],
    'CJK text, which X counts double' => ['is out.', 'is out. ' . str_repeat('表', 110), 'X allows 280'],
    'a link that ends a sentence' => ['Full post: https://tablepro.app/blog/a-post', str_repeat('a', 256) . ' https://tablepro.app/download.', 'X allows 280'],
    'bold text' => ['tabs follow', '**tabs** follow', 'markdown'],
]);
