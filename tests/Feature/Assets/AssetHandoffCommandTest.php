<?php

use App\Support\Assets\AssetManifest;
use App\Support\Assets\AssetReferences;
use App\Support\Assets\HandoffDocument;
use Illuminate\Support\Facades\File;
use PHPUnit\Framework\Assert;

/**
 * `php artisan assets:handoff` and the document it writes, docs/visual-assets.md
 * (architecture §1.9; spec §9.1).
 *
 * The document is generated from the manifest and the per-family brief
 * fragments, so it can never disagree with what the pages render. These tests
 * cover the generator: that every entry and every handoff field reaches the
 * document, that fragments merge into the right asset (and that a malformed
 * one is reported, not silently dropped), that the output is byte-stable, and
 * that `--check` catches a stale file. Whether every brief is complete is
 * HandoffDocumentTest's check, because the family fragments are written page
 * by page.
 */
function handoffScratchDirectory(): string
{
    $dir = sys_get_temp_dir() . '/asset-handoff-' . bin2hex(random_bytes(6));
    mkdir($dir, 0755, true);
    handoffScratchDirectories($dir);

    return $dir;
}

/**
 * @return list<string>
 */
function handoffScratchDirectories(?string $add = null): array
{
    static $dirs = [];

    if ($add !== null) {
        $dirs[] = $add;

        return $dirs;
    }

    [$all, $dirs] = [$dirs, []];

    return $all;
}

function handoffFixtureManifest(): AssetManifest
{
    return new AssetManifest(dirname(__DIR__, 2) . '/Fixtures/assets/manifest.json');
}

/**
 * A fragment section with every heading, the given bodies overriding the defaults.
 *
 * @param  array<string, ?string>  $bodies  heading => body; null leaves the heading out
 */
function handoffSection(string $id, array $bodies = []): string
{
    $defaults = [
        'Purpose' => "Shows {$id}.",
        'Scene' => "- Mac, Chinook sample, the {$id} scene.",
        'Framing' => 'Detail crop of the sheet.',
        'Light and dark' => 'Both, from the same frame.',
        'Locale' => 'One English capture for both sites.',
        'Open evidence' => 'None.',
        'Manifest changes' => 'None.',
        'Tóm tắt cho chủ sở hữu' => 'Bạn chụp cảnh này trên Chinook.',
    ];
    $text = "## {$id}\n\n";

    foreach (array_merge($defaults, $bodies) as $heading => $body) {
        if ($body !== null) {
            $text .= "### {$heading}\n{$body}\n\n";
        }
    }

    return $text;
}

/**
 * Expands `a-{x,y}-{1,2}.png` into every name it stands for.
 *
 * @return list<string>
 */
function handoffExpandBraces(string $pattern): array
{
    if (preg_match('/^(.*?)\{([^}]*)\}(.*)$/', $pattern, $match) !== 1) {
        return [$pattern];
    }

    $names = [];

    foreach (explode(',', $match[2]) as $option) {
        array_push($names, ...handoffExpandBraces($match[1] . $option . $match[3]));
    }

    return $names;
}

afterEach(function (): void {
    foreach (handoffScratchDirectories() as $dir) {
        File::deleteDirectory($dir);
    }
});

it('writes the document and the bundled slot data, and --check holds both to their sources', function (): void {
    $dir = handoffScratchDirectory();
    $out = "{$dir}/visual-assets.md";
    $slots = "{$dir}/asset-slots.json";
    $options = ['--output' => $out, '--slots' => $slots];

    $this->artisan('assets:handoff', $options)->assertSuccessful();

    expect($out)->toBeFile();
    expect((string) file_get_contents($out))->toStartWith('# Visual assets: owner handoff');
    expect((string) file_get_contents($slots))->toBe((new AssetManifest())->slotProjectionJson());

    $this->artisan('assets:handoff', ['--check' => true, ...$options])
        ->expectsOutputToContain('is up to date')
        ->assertSuccessful();

    file_put_contents($out, "\nA hand edit.\n", FILE_APPEND);

    $this->artisan('assets:handoff', ['--check' => true, ...$options])
        ->expectsOutputToContain('is out of date')
        ->assertFailed();

    unlink($out);

    $this->artisan('assets:handoff', ['--check' => true, ...$options])->assertFailed();

    $this->artisan('assets:handoff', $options)->assertSuccessful();
    file_put_contents($slots, '{}');

    $this->artisan('assets:handoff', ['--check' => true, ...$options])
        ->expectsOutputToContain('asset-slots.json is out of date')
        ->assertFailed();

    $this->artisan('assets:handoff', $options)->assertSuccessful();
    $localeFile = "{$dir}/asset-locales/ja.json";
    expect($localeFile)->toBeFile();
    file_put_contents($localeFile, '{}');
    $this->artisan('assets:handoff', ['--check' => true, ...$options])
        ->expectsOutputToContain('asset-locales/ja.json is out of date')
        ->assertFailed();
});

it('renders the same bytes every time, with no machine-specific path', function (): void {
    $first = app(HandoffDocument::class)->render();
    $second = app(HandoffDocument::class)->render();

    expect($first)->toBe($second);
    Assert::assertStringNotContainsString(base_path(), $first, 'The document names an absolute path of this machine.');
    Assert::assertStringNotContainsString(sys_get_temp_dir(), $first);
});

it('documents every entry with its handoff fields', function (): void {
    $document = app(HandoffDocument::class)->render();

    foreach ((new AssetManifest())->assets() as $id => $entry) {
        Assert::assertMatchesRegularExpression('/^#{3,5} `' . preg_quote($id, '/') . '`$/m', $document, "{$id} has no section");
        Assert::assertStringContainsString($entry['replacement']['dir'] . '/' . $entry['replacement']['base'] . '-', $document, "{$id} has no replacement path");
        Assert::assertStringContainsString("**{$entry['handoffPriority']}** · {$entry['status']}", $document);

        foreach (['description', 'alt'] as $field) {
            foreach ($entry[$field] as $text) {
                if ($text !== null) {
                    Assert::assertStringContainsString($text, $document, "{$id}: its {$field} is not in the document");
                }
            }
        }
    }

    expect($document)
        ->toContain('## Cách thay ảnh')
        ->toContain('## Capture rules for every asset')
        ->toContain('## Kinds: geometry and export')
        ->toContain('## Production order')
        ->toContain('## Public site (tablepro-web)')
        ->toContain('## Account and checkout app (license)')
        ->toContain('## Social cards (Open Graph)')
        ->toContain('## Existing image files kept as source material');
});

it('lists every legacy source the manifest keeps for the owner', function (): void {
    $document = app(HandoffDocument::class)->render();
    $legacy = explode('## Existing image files kept as source material', $document)[1] ?? '';

    foreach ((new AssetManifest())->assets() as $id => $entry) {
        foreach ((array) ($entry['legacySource'] ?? []) as $path) {
            Assert::assertStringContainsString("| `{$path}` |", $legacy, "{$id}: {$path} is not in the legacy list");
        }
    }
});

it('merges each fragment section into its asset and reports malformed ones', function (): void {
    $root = handoffScratchDirectory();
    $fragments = "{$root}/docs/rebuild/assets";
    mkdir($fragments, 0755, true);

    $nfd = Normalizer::normalize('Bạn chụp lại màn hình này.', Normalizer::FORM_D);

    file_put_contents("{$fragments}/fixture.md", implode('', [
        "# Fixture briefs\n\nAn introduction for the fixture family.\n\n",
        handoffSection('fixture-detail', ['Manifest changes' => 'MARKER-ONLY-IN-MANIFEST-CHANGES']),
        handoffSection('fixture-hero', ['Framing' => null, 'Locale' => '']),
        handoffSection('fixture-placeholder', ['Tóm tắt cho chủ sở hữu' => $nfd]),
        handoffSection('fixture-placeholder-mobile', ['Tóm tắt cho chủ sở hữu' => 'Capture this in English only.']),
        handoffSection('no-such-asset'),
        "```markdown\n## fixture-phone\n\n### Purpose\nInside a code fence, so not a section.\n```\n\n",
    ]));
    file_put_contents("{$fragments}/other.md", handoffSection('fixture-diagram'));
    file_put_contents("{$fragments}/_template.md", handoffSection('fixture-figure'));

    $document = new HandoffDocument(handoffFixtureManifest(), new AssetReferences($root), $fragments, $root);
    $problems = $document->problems();

    expect($problems)->toContain(
        'fixture-hero: no "### Framing" in docs/rebuild/assets/fixture.md.',
        'fixture-hero: "### Locale" is empty in docs/rebuild/assets/fixture.md.',
        'fixture-placeholder: the Vietnamese summary is not NFC.',
        'fixture-placeholder-mobile: the Vietnamese summary has no Vietnamese letters.',
        'docs/rebuild/assets/fixture.md has a section for no-such-asset, which the manifest does not have.',
        'fixture-diagram: its section is in docs/rebuild/assets/other.md, but its family\'s file is docs/rebuild/assets/fixture.md.',
        'fixture-phone: no section in docs/rebuild/assets/fixture.md.',
        'fixture-figure: no section in docs/rebuild/assets/fixture.md.',
    );
    expect(implode("\n", $problems))->not->toContain('fixture-detail');
    expect(array_keys($document->sections()))->not->toContain('fixture-phone')->not->toContain('fixture-figure');

    $rendered = $document->render();

    expect($rendered)
        ->toContain('An introduction for the fixture family.')
        ->toContain('> **Tóm tắt:** Bạn chụp cảnh này trên Chinook.')
        ->toContain("**Scene**\n\n- Mac, Chinook sample, the fixture-detail scene.")
        ->toContain('> **Chưa có brief.** Thêm mục `## fixture-phone` vào `docs/rebuild/assets/fixture.md`');
    Assert::assertStringNotContainsString('MARKER-ONLY-IN-MANIFEST-CHANGES', $rendered, '"Manifest changes" reached the generated document.');
    Assert::assertStringNotContainsString('Fixture briefs', $rendered, 'A fragment title reached the document.');
});

it('keeps a Vietnamese summary whole when a letter ends in the NEL byte', function (): void {
    $root = handoffScratchDirectory();
    $fragments = "{$root}/docs/rebuild/assets";
    mkdir($fragments, 0755, true);

    // "ễ" is E1 BB 85; read byte by byte, \R would end the line at 0x85.
    $summary = 'Bạn chụp ảnh này miễn phí, trên Chinook.';
    file_put_contents("{$fragments}/fixture.md", handoffSection('fixture-detail', ['Tóm tắt cho chủ sở hữu' => $summary]));

    $document = new HandoffDocument(handoffFixtureManifest(), new AssetReferences($root), $fragments, $root);

    expect(implode("\n", $document->problems()))->not->toContain('fixture-detail: the Vietnamese summary')
        ->and($document->render())->toContain("> **Tóm tắt:** {$summary}");
});

it('names the same files the manifest validates', function (): void {
    $root = handoffScratchDirectory();
    $manifest = handoffFixtureManifest();
    $rendered = (new HandoffDocument($manifest, new AssetReferences($root), "{$root}/none", $root))->render();
    $checked = 0;

    foreach ($manifest->assets() as $id => $entry) {
        if ($entry['status'] !== 'supplied') {
            continue;
        }

        preg_match('/^#+ `' . preg_quote($id, '/') . '`$.*?^\| Replace with \| `([^`]+)` \|$/ms', $rendered, $match);
        Assert::assertArrayHasKey(1, $match, "{$id} has no replacement row");

        $documented = handoffExpandBraces($match[1]);
        $validated = array_map(fn(array $file): string => 'public' . $file['url'], $manifest->expectedFiles($id));

        Assert::assertEqualsCanonicalizing($validated, $documented, "{$id}: the handoff and the manifest name different files");
        $checked++;
    }

    expect($checked)->toBe(6);
});

it('reads the committed fragments without a structural problem', function (): void {
    $document = app(HandoffDocument::class);
    $structural = array_values(array_filter(
        $document->problems(),
        fn(string $problem): bool => ! preg_match('/^[a-z0-9-]+: no section in docs\/rebuild\/assets\/[a-z0-9-]+\.md\.$/', $problem),
    ));

    expect($structural)->toBe([]);
    expect($document->sections())->toHaveKey('og-site');
});

/*
 * The parts of the document the owner acts on directly. A wrong menu path or
 * a mistranslated verb sends the owner looking for something the app does
 * not have.
 */
it('gives the owner paths and verbs that exist', function (): void {
    $root = handoffScratchDirectory();
    $rendered = (new HandoffDocument(handoffFixtureManifest(), new AssetReferences($root), "{$root}/none", $root))->render();

    /*
     * TablePro v0.77.0: HelpMenuBuilder.swift and WelcomeLibraryPane.swift.
     * There is no "Try Sample Database" menu item.
     */
    expect($rendered)->toContain('Help > Open Sample Database');
    Assert::assertStringNotContainsString('Try Sample Database', $rendered, 'The handoff names a menu item the app does not have.');

    /*
     * Positioning §11.2 keeps "export" in English; "xuất bản" reads as "publish".
     */
    expect($rendered)->toContain('Export bản PNG gốc')->toContain('export các file mà trang web sẽ dùng');
    Assert::assertStringNotContainsString('Xuất bản PNG', $rendered, 'The replacement steps say "publish" where they mean "export".');
    Assert::assertStringNotContainsString('được phục vụ', $rendered, 'The replacement steps translate "served" word for word.');

    /*
     * Apple's Vietnamese badge (positioning §1, §3) is in place and shown, so
     * the handoff names its files and no longer asks the owner for them.
     */
    foreach (['public/images/app-store-light-vi.svg', 'public/images/app-store-dark-vi.svg'] as $badge) {
        expect($rendered)->toContain($badge)
            ->and(base_path($badge))->toBeFile();
    }

    Assert::assertStringNotContainsString('Until then the Vietnamese pages', $rendered, 'The handoff still says the Vietnamese pages show the English badge.');
    Assert::assertStringNotContainsString('still needs', $rendered, 'The handoff still asks for the Vietnamese badge.');
});
