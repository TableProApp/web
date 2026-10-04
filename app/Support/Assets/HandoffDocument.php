<?php

namespace App\Support\Assets;

use App\Support\Localization\Locales;
use FilesystemIterator;
use JsonException;
use Normalizer;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

/**
 * `docs/visual-assets.md`, the owner's image handoff, built from two sources so
 * that they can never drift apart (architecture §1.9):
 *
 * - the manifest, `resources/data/assets.json`, for every structured field:
 *   geometry, export sizes, file names, theme and locale needs, pages, status;
 * - the prose fragments, `docs/rebuild/assets/{family}.md`, with one section
 *   per id under the fixed headings of `_template.md`: purpose, scene,
 *   framing, light and dark, locale, open evidence and the Vietnamese summary.
 *
 * Text a fragment holds before its first `## id` is that family's
 * introduction (the social-card fragment uses it for the cards' current state).
 *
 * The output is deterministic, with no date and no machine-specific path, so
 * `assets:handoff --check` can tell when the committed document is stale.
 *
 * @phpstan-type Section array{family: string, file: string, headings: array<string, string>}
 * @phpstan-type Parsed array{sections: array<string, Section>, preambles: array<string, string>, problems: list<string>}
 */
final class HandoffDocument
{
    /**
     * The headings of a fragment section, in order. `_template.md` documents
     * them and `HandoffDocumentTest` requires each one, non-empty.
     */
    public const HEADINGS = [
        'Purpose',
        'Scene',
        'Framing',
        'Light and dark',
        'Locale',
        'Open evidence',
        'Manifest changes',
        'Tóm tắt cho chủ sở hữu',
    ];

    public const SUMMARY = 'Tóm tắt cho chủ sở hữu';

    /**
     * What the document shows under each asset, after the summary. "Manifest
     * changes" is the worklist of whoever applies manifest edits, applied to
     * the manifest before the document is generated, so the owner never needs it.
     */
    private const DETAIL_HEADINGS = ['Purpose', 'Scene', 'Framing', 'Light and dark', 'Locale', 'Open evidence'];

    /**
     * Page families in reading order, with their titles. A family not listed
     * here follows, alphabetically. Social cards have their own section.
     */
    private const FAMILIES = [
        'home' => 'Homepage',
        'features' => 'Feature pages',
        'databases' => 'Database pages',
        'ios' => 'iPhone and iPad page',
        'blog' => 'Release posts',
    ];

    private const SOCIAL_FAMILY = 'og';

    /**
     * Slots a page renders at another width than their kind, because it
     * passes its own `sizes` to `<AssetSlot>`. The /ios header sets the iPad
     * capture beside the 280 px phone: 1216 − 280 − 32 = 904 px wide
     * (`IosController::IPAD_SIZES`, passed to `resources/js/pages/Ios.tsx`;
     * HandoffDocumentTest holds the two together).
     *
     * @var array<string, array<string, array{0: int, 1: ?int}>>
     */
    public const RENDERED_OVERRIDES = [
        'ipad-table-browse' => ['desktop' => [904, 678]],
    ];

    /**
     * @var array<string, array{title: string, repository: string, manifest: string}>
     */
    private const REPOSITORIES = [
        'web' => ['title' => 'Public site', 'repository' => 'tablepro-web', 'manifest' => 'resources/data/assets.json'],
        'license' => ['title' => 'Account and checkout app', 'repository' => 'license', 'manifest' => 'resources/data/assets.json in the license repository'],
    ];

    private const VIETNAMESE_LETTER = '/[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/iu';

    /**
     * @var Parsed|null
     */
    private ?array $parsed = null;

    /**
     * @param  string|null  $fragmentsPath  the fragment directory; `docs/rebuild/assets` by default
     * @param  string|null  $basePath  the repository root that public files and references are read from
     */
    public function __construct(
        private readonly AssetManifest $manifest,
        private readonly AssetReferences $references,
        private readonly ?string $fragmentsPath = null,
        private readonly ?string $basePath = null,
    ) {}

    public function fragmentsPath(): string
    {
        return $this->fragmentsPath ?? base_path('docs/rebuild/assets');
    }

    /**
     * Every parsed fragment section, keyed by asset id.
     *
     * @return array<string, Section>
     */
    public function sections(): array
    {
        return $this->parsed()['sections'];
    }

    /**
     * What keeps the briefs from being complete: an id with no section, a
     * missing or empty heading, a section for an id the manifest does not
     * have, a section in another family's file, and a Vietnamese summary that
     * is not NFC or not Vietnamese. Empty when every brief is complete.
     *
     * @return list<string>
     */
    public function problems(): array
    {
        $parsed = $this->parsed();
        $problems = $parsed['problems'];
        $assets = $this->manifest->assets();

        foreach ($assets as $id => $entry) {
            $section = $parsed['sections'][$id] ?? null;
            $expected = $this->fragmentFile($entry['family']);

            if ($section === null) {
                $problems[] = "{$id}: no section in {$expected}.";

                continue;
            }

            if ($section['family'] !== $entry['family']) {
                $problems[] = "{$id}: its section is in {$section['file']}, but its family's file is {$expected}.";
            }

            foreach (self::HEADINGS as $heading) {
                if (! array_key_exists($heading, $section['headings'])) {
                    $problems[] = "{$id}: no \"### {$heading}\" in {$section['file']}.";
                } elseif ($section['headings'][$heading] === '') {
                    $problems[] = "{$id}: \"### {$heading}\" is empty in {$section['file']}.";
                }
            }

            $summary = $section['headings'][self::SUMMARY] ?? '';

            if ($summary !== '' && ! Normalizer::isNormalized($summary, Normalizer::FORM_C)) {
                $problems[] = "{$id}: the Vietnamese summary is not NFC.";
            }

            if ($summary !== '' && preg_match(self::VIETNAMESE_LETTER, $summary) !== 1) {
                $problems[] = "{$id}: the Vietnamese summary has no Vietnamese letters.";
            }
        }

        foreach ($parsed['sections'] as $id => $section) {
            if (! array_key_exists($id, $assets)) {
                $problems[] = "{$section['file']} has a section for {$id}, which the manifest does not have.";
            }
        }

        return $problems;
    }

    /**
     * The whole document.
     */
    public function render(): string
    {
        $assets = $this->manifest->assets();
        $lines = [];

        array_push($lines, ...$this->introduction($assets));
        array_push($lines, ...$this->replacementSteps());
        array_push($lines, ...$this->captureRules());
        array_push($lines, ...$this->kindsTable());
        array_push($lines, ...$this->priorityList($assets));

        foreach (self::REPOSITORIES as $repo => $meta) {
            array_push($lines, ...$this->repositorySection($repo, $meta, $assets));
        }

        array_push($lines, ...$this->socialSection($assets));
        array_push($lines, ...$this->legacySection($assets));

        return rtrim(implode("\n", $lines)) . "\n";
    }

    /**
     * @param  array<string, array<string, mixed>>  $assets
     * @return list<string>
     */
    private function introduction(array $assets): array
    {
        $slots = count(array_filter($assets, fn(array $entry): bool => $entry['slot']));
        $supplied = count(array_filter($assets, fn(array $entry): bool => $entry['status'] === 'supplied'));
        $byPriority = [];

        foreach ($assets as $entry) {
            $byPriority[$entry['handoffPriority']] = ($byPriority[$entry['handoffPriority']] ?? 0) + 1;
        }

        ksort($byPriority);
        $priorities = implode(', ', array_map(fn(string $p, int $n): string => "{$p}: {$n}", array_keys($byPriority), $byPriority));
        $placeholders = count($assets) - $supplied;
        $social = count($assets) - $slots;

        return [
            '# Visual assets: owner handoff',
            '',
            '<!-- Generated by `php artisan assets:handoff` from resources/data/assets.json and docs/rebuild/assets/*.md. Do not edit by hand. -->',
            '',
            'Every content image on the site (screenshots, crops, phone captures, diagrams, illustrations and release-post figures) is a described placeholder until you supply the final file. This document is the brief for each one: what it must show, how to frame and export it, where the files go and which manifest fields to change. Final artwork and screenshots are your work after the rebuild; nothing here is a finished image.',
            '',
            "**Status:** {$this->plural(count($assets), 'entry', 'entries')} ({$this->plural($slots, 'page slot', 'page slots')} and {$this->plural($social, 'bespoke social card', 'bespoke social cards')}); {$placeholders} placeholder, {$supplied} supplied. By priority: {$priorities}.",
            '',
            '- **P1**: the hero or the largest image of a page. **P2**: a section\'s main image. **P3**: a supporting crop or figure.',
            '- Each asset lists its pages as locale-neutral paths. Every page also exists under `/vi` with the same path, except the release posts, which are English only.',
            '- Identity assets are not part of this handoff: the logo, the favicon, database vendor marks, sponsor logos and the official App Store badges stay as they are. That includes Apple\'s Vietnamese App Store badge, which reads "Tải về trên App Store": `public/images/app-store-light-vi.svg` (Apple\'s black badge) and `public/images/app-store-dark-vi.svg` (its white one) are Apple\'s own files from its marketing resources, unmodified. Vietnamese pages show them, labelled with that text and with no `lang="en"` (`resources/js/components/download/app-store-badge-view.ts` names the files for each language), and so does the Vietnamese account page, which loads the same files from this site.',
            '- After editing the manifest or a fragment, run `php artisan assets:handoff`. It rewrites this document and `resources/js/lib/data/asset-slots.json`, the part of the manifest the pages load; until it runs, the pages keep showing the old state. `php artisan assets:handoff --check` reports either file when it is stale, and the test suite fails while the slot data is.',
            '',
        ];
    }

    /**
     * @return list<string>
     */
    private function replacementSteps(): array
    {
        return [
            '## Cách thay ảnh',
            '',
            '1. Chụp hoặc vẽ đúng brief bên dưới, chỉ dùng dữ liệu mẫu. Export bản PNG gốc đúng kích thước "Export" của asset và giữ file này bên ngoài `public/`.',
            '2. Từ bản gốc, export các file mà trang web sẽ dùng (thường là AVIF và WebP) ở từng width ghi trong dòng "Replace with", rồi đặt chúng vào đúng thư mục, với đúng tên file ghi ở đó. Ví dụ: `magick mac-hero-window-light.png -resize 1216x -quality 60 public/images/home/mac-hero-window-light-1216.avif`.',
            '3. Asset nào có ảnh cắt cho điện thoại (`mobile`), như cửa sổ Mac (`window`), một số ảnh cận cảnh (`detail`), ảnh iPad và ảnh minh họa Handoff: bạn cắt ảnh đó từ cùng bản chụp 2x (ảnh minh họa thì ghép lại từ cùng các ảnh chụp) và chuyển nó sang `supplied` trước hoặc cùng lúc với asset gốc.',
            '4. Trong `resources/data/assets.json`, sửa đúng entry của asset: đặt `"status": "supplied"` và điền `src`, ví dụ `{"light": {"widths": [720, 1216, 2432], "formats": ["avif", "webp"], "width": 2432, "height": 1368}, "dark": {…}}`. Asset `per-locale` dùng `{"en": {…}, "vi": {…}}`. Đọc lại `alt` và `caption` để chắc chúng đúng với ảnh thật.',
            '5. Chạy `php artisan assets:handoff` để cập nhật tài liệu này và `resources/js/lib/data/asset-slots.json`, phần dữ liệu ảnh mà trang web dùng (nếu bỏ qua bước này, trang vẫn hiện placeholder). Sau đó chạy `php artisan test --compact --filter=AssetManifestTest` (kiểm tra từng file có đủ, đúng kích thước pixel và không vượt dung lượng) và `npm run test:js`.',
            '',
            'Không cần sửa component nào: `<AssetSlot>` tự chuyển từ placeholder sang `<picture>` theo `status`, và ẩn mã asset cùng mô tả placeholder. Ảnh hero có `priority` sẽ tự được preload.',
            '',
        ];
    }

    /**
     * @return list<string>
     */
    private function captureRules(): array
    {
        $mac = $this->platform('mac');
        $ios = $this->platform('ios');
        $macRelease = is_string($mac['release']['version'] ?? null) ? 'TablePro ' . $mac['release']['version'] : 'the current Mac release';
        $floorTrails = is_string($mac['floorVersion'] ?? null)
            && is_string($mac['release']['version'] ?? null)
            && version_compare($mac['floorVersion'], $mac['release']['version'], '<');
        $floor = $floorTrails ? " Homebrew may still serve {$mac['floorVersion']}, so a scene that shows a newer feature says so in its brief." : '';
        $iosRelease = is_string($ios['release']['version'] ?? null)
            ? 'App Store ' . $ios['release']['version'] . (is_string($ios['release']['build'] ?? null) ? " (build {$ios['release']['build']})" : '')
            : 'the current App Store build';

        return [
            '## Capture rules for every asset',
            '',
            '- **Sample data only.** Never a real connection, host, customer or credential. The datasets the briefs name:',
            '  - **Chinook**: the bundled SQLite sample (Mac: Help > Open Sample Database, or Open Sample Database in the Welcome window; iPhone: Open Sample Database in the connection list).',
            '  - **shop**: the PostgreSQL/MariaDB demo schema (users, products, orders, order_items, reviews, tags, product_tags, activity_log). Its files are not in the public app repository: `demo/schema.postgres.sql`, `demo/schema.mysql.sql` (MariaDB and MySQL) and one `demo/data.sql` for both. Its `docker-compose.yml` names the database `tablepro_demo` on both servers; a brief that names a database `shop` means that schema in a database created with that name.',
            '  - **shop emails:** the sample users have addresses on real-looking third-party domains (such as `acmecorp.com` or `techviet.vn`). Before any capture that can show the `email` column, point them at a reserved domain: `UPDATE users SET email = split_part(email, \'@\', 1) || \'@example.com\';` on PostgreSQL, `UPDATE users SET email = CONCAT(SUBSTRING_INDEX(email, \'@\', 1), \'@example.com\');` on MariaDB and MySQL.',
            '  - **places**: PostGIS with Natural Earth populated places.',
            '  - Fictional hosts under `*.acme.internal`.',
            "- **Mac:** capture {$macRelease}.{$floor} Window captures follow `docs/screenshots.md`: a 1216 × 684 pt window on a 2× display, `screencapture -w -o`, traffic lights kept, no added shadow or border.",
            "- **iPhone and iPad:** capture {$iosRelease}, never a development build. Do not show what that build lacks or gets wrong: jump hosts, Redis key browsing, the table list beside the browser on iPad, or editing long values. Native captures with no device frame.",
            '- **Light and dark:** for an asset marked "Light and dark", take both from the same frame by switching the macOS appearance (not only the app theme). Phone and iPad captures are opaque and usually serve both themes.',
            '- **Language:** the app UI stays in English in every capture; one capture serves both the English and Vietnamese pages unless the asset says "per locale".',
            '- **No mock-ups:** no drawn app chrome, no fake data, no generated imagery, no annotations or arrows unless the brief asks for them. Do not alter a screenshot with filters.',
            '',
        ];
    }

    /**
     * @return list<string>
     */
    private function kindsTable(): array
    {
        $lines = [
            '## Kinds: geometry and export',
            '',
            'Every asset takes its geometry from its kind (design-system §6.3), unless the asset overrides the aspect.',
            '',
            '| Kind | Type | Aspect | Rendered (desktop · tablet · phone, CSS px) | Export | Format | Alpha | Max per file | Widths |',
            '|---|---|---|---|---|---|---|---|---|',
        ];

        foreach ($this->manifest->kinds() as $name => $kind) {
            $lines[] = '| ' . implode(' | ', [
                "`{$name}`",
                $kind['type'],
                $kind['aspect'] ?? 'from the source',
                $this->cell($this->renderedSizes($kind, $kind['aspect'], null)),
                $this->cell($this->exportSize($kind, $kind['aspect'])),
                $this->formatText($kind),
                $this->transparencyText($kind['transparency']),
                $this->bytes($kind['maxBytes']),
                $kind['widths'] === [] ? '—' : implode(', ', $kind['widths']),
            ]) . ' |';
        }

        $lines[] = '';

        foreach ($this->manifest->kinds() as $name => $kind) {
            if (is_string($kind['note'] ?? null) && $kind['note'] !== '') {
                $lines[] = "- `{$name}`: {$kind['note']}";
            }
        }

        $lines[] = '';

        return $lines;
    }

    /**
     * @param  array<string, array<string, mixed>>  $assets
     * @return list<string>
     */
    private function priorityList(array $assets): array
    {
        $lines = [
            '## Production order',
            '',
            'Make the P1 assets first: they carry the homepage and the iPhone page. A crop (`mobile-crop`) is cut from the capture of the entry that names it, so it needs no separate session.',
            '',
            '| Priority | Asset | Kind | Used on | Status |',
            '|---|---|---|---|---|',
        ];

        foreach (['P1', 'P2', 'P3'] as $priority) {
            foreach ($this->ordered($assets) as $id) {
                $entry = $assets[$id];

                if ($entry['handoffPriority'] !== $priority) {
                    continue;
                }

                $lines[] = '| ' . implode(' | ', [
                    $priority,
                    "[`{$id}`](#" . $this->anchor($id) . ')',
                    "`{$entry['kind']}`",
                    $this->cell(implode(', ', array_values(array_unique(array_map(fn(array $use): string => $use['path'], $entry['usedOn']))))),
                    $entry['status'],
                ]) . ' |';
            }
        }

        $lines[] = '';

        return $lines;
    }

    /**
     * @param  array{title: string, repository: string, manifest: string}  $meta
     * @param  array<string, array<string, mixed>>  $assets
     * @return list<string>
     */
    private function repositorySection(string $repo, array $meta, array $assets): array
    {
        $own = array_filter($assets, fn(array $entry): bool => $entry['ownerRepo'] === $repo && $entry['family'] !== self::SOCIAL_FAMILY);
        $lines = ["## {$meta['title']} ({$meta['repository']})", ''];

        if ($own === []) {
            $lines[] = "No editorial image slot. This app's screens are live data, forms and controls, which stay as they are (spec §9.1).";
            $lines[] = '';

            return $lines;
        }

        $lines[] = "Manifest: `{$meta['manifest']}`.";
        $lines[] = '';

        foreach ($this->families(array_keys($own), $assets) as $family => $ids) {
            $lines[] = '### ' . (self::FAMILIES[$family] ?? ucfirst($family));
            $lines[] = '';

            $preamble = $this->parsed()['preambles'][$family] ?? '';

            if ($preamble !== '') {
                $lines[] = $preamble;
                $lines[] = '';
            }

            foreach ($this->byPage($ids, $assets) as $path => $pageIds) {
                $lines[] = "#### `{$path}`";
                $lines[] = '';

                foreach ($pageIds as $id) {
                    array_push($lines, ...$this->assetBlock($id, $assets[$id], 5));
                }
            }
        }

        return $lines;
    }

    /**
     * @param  array<string, array<string, mixed>>  $assets
     * @return list<string>
     */
    private function socialSection(array $assets): array
    {
        $lines = ['## Social cards (Open Graph)', ''];
        $preamble = $this->parsed()['preambles'][self::SOCIAL_FAMILY] ?? '';

        if ($preamble !== '') {
            $lines[] = $preamble;
            $lines[] = '';
        }

        $ids = array_keys(array_filter($assets, fn(array $entry): bool => $entry['family'] === self::SOCIAL_FAMILY));

        if ($ids === []) {
            $lines[] = 'No bespoke social card is planned. Every page uses the card `og:generate` writes for it.';
            $lines[] = '';
        }

        foreach ($ids as $id) {
            array_push($lines, ...$this->assetBlock($id, $assets[$id], 3));
        }

        return $lines;
    }

    /**
     * One asset: the Vietnamese summary first, then the manifest's fields, the
     * proposed texts and the fragment's brief.
     *
     * @param  array<string, mixed>  $entry
     * @return list<string>
     */
    private function assetBlock(string $id, array $entry, int $level): array
    {
        $kind = $this->manifest->kinds()[$entry['kind']] ?? null;
        $section = $this->parsed()['sections'][$id] ?? null;
        $aspect = $entry['aspect'] ?? ($kind['aspect'] ?? null);
        $lines = [str_repeat('#', $level) . " `{$id}`", ''];

        $summary = $section['headings'][self::SUMMARY] ?? '';

        if ($summary !== '') {
            foreach (explode("\n", "**Tóm tắt:** {$summary}") as $line) {
                $lines[] = rtrim("> {$line}");
            }
        } else {
            $lines[] = "> **Chưa có brief.** Thêm mục `## {$id}` vào `" . $this->fragmentFile($entry['family']) . '` theo mẫu `docs/rebuild/assets/_template.md`.';
        }

        $lines[] = '';
        $lines[] = '| Field | Value |';
        $lines[] = '|---|---|';

        $rows = [
            'Type' => "{$entry['type']} (`{$entry['kind']}`) · **{$entry['handoffPriority']}** · {$entry['status']}",
            'Used on' => implode('; ', array_map(fn(array $use): string => "`{$use['path']}` · {$use['section']}", $entry['usedOn'])),
        ];

        if ($entry['slot']) {
            $rows['Rendered by'] = $this->renderedBy($id);
        }

        $cap = $kind !== null ? $this->sourceWidthCap($entry, $kind) : null;

        if ($kind !== null) {
            $rows['Aspect'] = (string) ($aspect ?? '—');

            if ($kind['rendered'] !== null) {
                $rows['Rendered size'] = $this->renderedSizes($kind, $aspect, $entry['mobile'], self::RENDERED_OVERRIDES[$id] ?? []);
            }

            $export = $cap === null
                ? $this->exportSize($kind, $aspect)
                : $this->dimensions([$cap, null], $aspect) . ' px (the source\'s own width: do not upscale it to ' . $kind['exportPx'][0] . ')';

            $rows['Export'] = $export . ' · ' . $this->formatText($kind) . ' · ' . $this->transparencyText($kind['transparency']) . ' · max ' . $this->bytes($kind['maxBytes']) . ' per file';
        }

        $rows['Light and dark'] = $entry['theme'] === 'both' ? 'Two images: light and dark, from the same frame' : 'One image for both page themes';
        $rows['Locale'] = $entry['locale'] === 'per-locale' ? 'One file per locale (' . implode(', ', Locales::codes()) . ')' : 'One file for both sites';

        if ($entry['mobile'] !== null) {
            $rows['Phone crop'] = "[`{$entry['mobile']}`](#" . $this->anchor($entry['mobile']) . ')';
        }

        $placed = $this->references->priorityPlacements()[$this->parentOf($id) ?? $id] ?? [];

        if ($entry['priority']) {
            $rows['Loading'] = $entry['kind'] === 'mobile-crop'
                ? 'Priority: requested with high fetch priority on phones once supplied'
                : 'Priority: high fetch priority and a head preload for the active theme once supplied';
        } elseif ($placed !== []) {
            $rows['Loading'] = 'Priority where ' . implode(', ', array_map(fn(string $path): string => "`{$path}`", $placed)) . ' places it (`<AssetSlot priority>`): eager, with high fetch priority, once supplied; lazy everywhere else';
        }

        if ($kind !== null) {
            $rows['Replace with'] = '`' . $this->filePattern($entry, $kind, $cap) . '`';
        }

        $legacy = $this->legacyList($entry['legacySource']);

        if ($legacy !== []) {
            $rows['Existing source'] = implode(', ', array_map(fn(string $path): string => "`{$path}`", $legacy));
        }

        foreach ($rows as $field => $value) {
            $lines[] = "| {$field} | {$this->cell($value)} |";
        }

        $lines[] = '';
        array_push($lines, ...$this->texts('Placeholder text', $entry['description']));
        array_push($lines, ...$this->texts('Proposed alt text', $entry['alt']));

        if (is_array($entry['caption'])) {
            array_push($lines, ...$this->texts('Proposed caption', $entry['caption']));
        }

        $lines[] = '';

        if ($section === null) {
            return $lines;
        }

        foreach (self::DETAIL_HEADINGS as $heading) {
            $body = $section['headings'][$heading] ?? '';

            if ($body === '') {
                continue;
            }

            $lines[] = "**{$heading}**";
            $lines[] = '';
            $lines[] = $body;
            $lines[] = '';
        }

        return $lines;
    }

    /**
     * @param  array<string, array<string, mixed>>  $assets
     * @return list<string>
     */
    private function legacySection(array $assets): array
    {
        $named = [];

        foreach ($assets as $id => $entry) {
            foreach ($this->legacyList($entry['legacySource']) as $path) {
                $named[$path][] = $id;
            }
        }

        ksort($named);
        $files = $this->publicImages();
        $derived = [];
        $lines = [
            '## Existing image files kept as source material',
            '',
            'The earlier screenshots stay in `public/images` as reference for your captures; the rebuilt pages show placeholders in their place. **Proposed cleanup:** once every asset that names a file below is `supplied`, remove that file and its WebP derivatives in one separate commit, after `grep -rn <file name> resources app` finds no reference. Nothing is deleted before then.',
            '',
            '| File | Size (px) | Source for | Derived files |',
            '|---|---|---|---|',
        ];

        foreach ($named as $path => $ids) {
            $stem = (string) preg_replace('/\.[a-z0-9]+$/i', '', $path);
            $children = array_values(array_filter(
                $files,
                fn(string $file): bool => $file !== $path && preg_match('/^' . preg_quote($stem, '/') . '(-\d+)?\.(webp|avif)$/', $file) === 1,
            ));
            array_push($derived, ...$children);
            $size = $this->pixelSize($path);

            $lines[] = '| ' . implode(' | ', [
                "`{$path}`" . (in_array($path, $files, true) ? '' : ' (missing)'),
                $size,
                implode(', ', array_map(fn(string $id): string => "[`{$id}`](#" . $this->anchor($id) . ')', array_values(array_unique($ids)))),
                $children === [] ? '—' : implode(', ', array_map(fn(string $file): string => '`' . basename($file) . '`', $children)),
            ]) . ' |';
        }

        $others = array_values(array_diff($files, array_keys($named), $derived, $this->suppliedFiles($assets)));
        $corpus = $this->referenceCorpus();
        $used = [];
        $unused = [];

        foreach ($others as $file) {
            if (str_contains($corpus, $file)) {
                $used[] = $file;
            } else {
                $unused[] = $file;
            }
        }

        $lines[] = '';
        $lines[] = 'Other files in `public/images` that no asset names:';
        $lines[] = '';
        $lines[] = '- **Still referenced by the site** (identity assets such as vendor marks, sponsor logos and store badges, or components not yet removed). Keep: ' . $this->fileList($used);
        $lines[] = '- **No literal reference found.** Review before removing, because a path built at runtime is not found by this scan: ' . $this->fileList($unused);
        $lines[] = '';

        return $lines;
    }

    /**
     * @param  list<string>  $files
     */
    private function fileList(array $files): string
    {
        return $files === [] ? 'none.' : implode(', ', array_map(fn(string $file): string => "`{$file}`", $files)) . '.';
    }

    /**
     * @param  array<string, ?string>  $text
     * @return list<string>
     */
    private function texts(string $label, array $text): array
    {
        $lines = [];

        foreach (Locales::codes() as $code) {
            $value = $text[$code] ?? null;
            $lines[] = "- {$label} ({$code}): " . ($value === null ? '— (the page is English only)' : $value);
        }

        return $lines;
    }

    /**
     * The components that render an id (spec §9.1). An id named in TSX is
     * rendered there. An id named in a content or markdown file is rendered by
     * the component that reads that file, printed as "component (via data
     * files)", because the component decides the column and so the width. A
     * phone crop is rendered by the slot of the entry that names it.
     */
    private function renderedBy(string $id): string
    {
        $owner = $id;
        $paths = $this->references->for($id);
        $via = '';

        $parentId = $paths === [] ? $this->parentOf($id) : null;

        if ($parentId !== null) {
            $owner = $parentId;
            $paths = $this->references->for($parentId);
            $via = " (through the `{$parentId}` slot, below 768 px)";
        }

        if ($paths === []) {
            return 'not placed on a page yet';
        }

        $renderers = [];

        foreach ($paths as $path) {
            $renderer = $this->renderer($path, $owner);

            if ($renderer === $path) {
                $renderers[$path] ??= [];
            } else {
                $renderers[$renderer][] = $path;
            }
        }

        $parts = [];

        foreach ($renderers as $renderer => $sources) {
            $parts[] = "`{$renderer}`" . ($sources === [] ? '' : ' (via ' . implode(', ', array_map(fn(string $source): string => "`{$source}`", $sources)) . ')');
        }

        return implode('; ', $parts) . $via;
    }

    /**
     * The id of the entry whose `mobile` crop this is, or null.
     */
    private function parentOf(string $id): ?string
    {
        foreach ($this->manifest->assets() as $parentId => $parent) {
            if ($parent['mobile'] === $id) {
                return $parentId;
            }
        }

        return null;
    }

    /**
     * The component that renders a slot named in `$path`: the file itself for
     * TSX, otherwise the component that reads that kind of data file.
     */
    private function renderer(string $path, string $id): string
    {
        $patterns = [
            '#^resources/data/content/[^/]+/home\.json$#' => 'resources/js/components/home/workflows-section.tsx',
            '#^resources/data/content/[^/]+/features/[^/]+\.json$#' => 'resources/js/components/features/feature-section.tsx',
            '#^resources/data/content/[^/]+/databases/index\.json$#' => 'resources/js/pages/Databases/Index.tsx',
            '#^resources/blog/.+\.md$#' => 'resources/js/components/blog/article.tsx',
        ];

        foreach ($patterns as $pattern => $component) {
            if (preg_match($pattern, $path) === 1) {
                return $component;
            }
        }

        if (preg_match('#^resources/data/content/[^/]+/databases/[^/]+\.json$#', $path) === 1) {
            return $this->contentAsset($path) === $id
                ? 'resources/js/pages/Databases/Show.tsx'
                : 'resources/js/components/databases/engine-section.tsx';
        }

        return $path;
    }

    /**
     * A content file's top-level `asset`, the lead image of a database page.
     */
    private function contentAsset(string $path): ?string
    {
        try {
            $data = json_decode((string) file_get_contents($this->root() . '/' . $path), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return null;
        }

        return is_array($data) && is_string($data['asset'] ?? null) ? $data['asset'] : null;
    }

    /**
     * @param  array<string, mixed>  $kind
     * @param  array<string, array{0: int, 1: ?int}>  $overrides  breakpoints where the page sets the slot's own `sizes`
     */
    private function renderedSizes(array $kind, ?string $aspect, ?string $mobile, array $overrides = []): string
    {
        $rendered = $kind['rendered'];

        if (! is_array($rendered)) {
            return '—';
        }

        $parts = [];

        foreach (['desktop', 'tablet', 'phone'] as $breakpoint) {
            $pair = $overrides[$breakpoint] ?? $rendered[$breakpoint] ?? null;

            if ($breakpoint === 'phone' && $mobile !== null) {
                $parts[] = "phone: its crop `{$mobile}`";

                continue;
            }

            $parts[] = $pair === null ? "{$breakpoint}: not shown" : "{$breakpoint} " . $this->dimensions($pair, $aspect);
        }

        return implode(' · ', $parts);
    }

    /**
     * @param  array<string, mixed>  $kind
     */
    private function exportSize(array $kind, ?string $aspect): string
    {
        if ($kind['vector']) {
            return 'vector (SVG)';
        }

        $pair = $kind['exportPx'];

        if (! is_array($pair)) {
            return '—';
        }

        $density = is_int($kind['density']) ? " ({$kind['density']}×)" : '';

        $size = $this->dimensions($pair, $aspect);

        return (str_ends_with($size, ' wide') ? str_replace(' wide', ' px wide', $size) : "{$size} px") . $density;
    }

    /**
     * `1216×684`, or a width with the height derived from the aspect.
     *
     * @param  array<int, ?int>  $pair
     */
    private function dimensions(array $pair, ?string $aspect): string
    {
        $width = (int) $pair[0];
        $height = $pair[1] ?? null;

        if ($height === null && $aspect !== null) {
            [$w, $h] = array_map('floatval', explode(':', $aspect));
            $height = (int) round($width * $h / $w);
        }

        return $height === null ? "{$width} wide" : "{$width}×{$height}";
    }

    /**
     * @param  array<string, mixed>  $kind
     */
    private function formatText(array $kind): string
    {
        $master = $this->formatName($kind['format']['master']);
        $delivered = implode(', ', array_map(fn(string $format): string => $this->formatName($format), $kind['format']['delivered']));

        return $master === $delivered ? $master : "{$master} master → {$delivered}";
    }

    private function formatName(string $format): string
    {
        return $format === 'webp' ? 'WebP' : strtoupper($format);
    }

    private function transparencyText(bool|string $transparency): string
    {
        return match ($transparency) {
            true => 'keeps alpha',
            false => 'opaque',
            'as-source' => 'alpha as the source',
            default => 'alpha as needed',
        };
    }

    private function bytes(int $bytes): string
    {
        return (int) round($bytes / 1000) . ' KB';
    }

    /**
     * The width a release-post figure is exported at when its existing source
     * is narrower than the kind's export width, so the brief never asks for an
     * upscale; null otherwise. The widths then end at the source's own width,
     * which `AssetManifest` requires of `src` (the largest width is the file's).
     *
     * @param  array<string, mixed>  $entry
     * @param  array<string, mixed>  $kind
     */
    private function sourceWidthCap(array $entry, array $kind): ?int
    {
        $legacy = $this->legacyList($entry['legacySource']);

        if ($entry['kind'] !== 'figure' || count($legacy) !== 1 || ! is_array($kind['exportPx'])) {
            return null;
        }

        $size = $this->pixelSize($legacy[0]);

        if (preg_match('/^(\d+)×\d+$/u', $size, $match) !== 1) {
            return null;
        }

        $width = (int) $match[1];

        return $width < (int) $kind['exportPx'][0] ? $width : null;
    }

    /**
     * The delivered files in brace form, named as AssetManifest::fileUrl()
     * names them. `$cap` ends the widths at a narrower source's own width.
     *
     * @param  array<string, mixed>  $entry
     * @param  array<string, mixed>  $kind
     */
    private function filePattern(array $entry, array $kind, ?int $cap = null): string
    {
        $dir = rtrim($entry['replacement']['dir'], '/');
        $base = $entry['replacement']['base'];
        $locales = Locales::codes();

        if ($entry['kind'] === 'og-card') {
            return "{$dir}/{$base}-" . $this->brace($locales) . '.png';
        }

        $name = $base . '-' . $this->brace($entry['theme'] === 'both' ? ['light', 'dark'] : ['light']);

        if ($entry['locale'] === 'per-locale') {
            $name .= '-' . $this->brace($locales);
        }

        $formats = $this->brace($kind['format']['delivered']);

        if ($kind['vector'] || $kind['widths'] === []) {
            return "{$dir}/{$name}.{$formats}";
        }

        $widths = $kind['widths'];

        if ($cap !== null) {
            $widths = [...array_values(array_filter($widths, fn(int $width): bool => $width < $cap)), $cap];
        }

        return "{$dir}/{$name}-" . $this->brace(array_map('strval', $widths)) . ".{$formats}";
    }

    /**
     * @param  list<string>  $values
     */
    private function brace(array $values): string
    {
        return count($values) === 1 ? $values[0] : '{' . implode(',', $values) . '}';
    }

    /**
     * Ids in reading order: manifest order, with each phone crop moved to
     * just after the window that names it.
     *
     * @param  array<string, array<string, mixed>>  $assets
     * @return list<string>
     */
    private function ordered(array $assets): array
    {
        $crops = array_filter(array_map(fn(array $entry): ?string => $entry['mobile'], $assets));
        $ordered = [];

        foreach ($assets as $id => $entry) {
            if (in_array($id, $crops, true)) {
                continue;
            }

            $ordered[] = $id;

            if ($entry['mobile'] !== null && array_key_exists($entry['mobile'], $assets)) {
                $ordered[] = $entry['mobile'];
            }
        }

        return $ordered;
    }

    /**
     * @param  list<string>  $ids
     * @param  array<string, array<string, mixed>>  $assets
     * @return array<string, list<string>>
     */
    private function families(array $ids, array $assets): array
    {
        $grouped = [];

        foreach ($this->ordered($assets) as $id) {
            if (in_array($id, $ids, true)) {
                $grouped[$assets[$id]['family']][] = $id;
            }
        }

        uksort($grouped, function (string $a, string $b): int {
            $order = array_keys(self::FAMILIES);
            $ia = array_search($a, $order, true);
            $ib = array_search($b, $order, true);

            if ($ia === false && $ib === false) {
                return strcmp($a, $b);
            }

            if ($ia === false || $ib === false) {
                return $ia === false ? 1 : -1;
            }

            return $ia <=> $ib;
        });

        return $grouped;
    }

    /**
     * Groups a family's ids by their own page: the first path they are used on
     * other than the homepage, which reuses images from every family. A phone
     * crop stays with its window.
     *
     * @param  list<string>  $ids
     * @param  array<string, array<string, mixed>>  $assets
     * @return array<string, list<string>>
     */
    private function byPage(array $ids, array $assets): array
    {
        $pages = [];
        $pageOf = [];

        foreach ($ids as $id) {
            $parent = array_search($id, array_map(fn(array $entry): ?string => $entry['mobile'], $assets), true);
            $paths = array_map(fn(array $use): string => $use['path'], $assets[$id]['usedOn']);
            $own = array_values(array_filter($paths, fn(string $path): bool => $path !== '/'));
            $path = is_string($parent) && isset($pageOf[$parent]) ? $pageOf[$parent] : ($own[0] ?? $paths[0] ?? '/');
            $pageOf[$id] = $path;
            $pages[$path][] = $id;
        }

        return $pages;
    }

    private function anchor(string $id): string
    {
        return $id;
    }

    private function cell(string $value): string
    {
        return str_replace(['|', "\n"], ['\\|', ' '], $value);
    }

    private function plural(int $count, string $one, string $other): string
    {
        return $count . ' ' . ($count === 1 ? $one : $other);
    }

    private function fragmentFile(string $family): string
    {
        return "docs/rebuild/assets/{$family}.md";
    }

    /**
     * @param  string|list<string>|null  $legacy
     * @return list<string>
     */
    private function legacyList(string|array|null $legacy): array
    {
        if ($legacy === null) {
            return [];
        }

        return is_array($legacy) ? array_values($legacy) : [$legacy];
    }

    /**
     * Every image under `public/images`, as a URL path, sorted.
     *
     * @return list<string>
     */
    private function publicImages(): array
    {
        $root = $this->root() . '/public/images';

        if (! is_dir($root)) {
            return [];
        }

        $files = [];
        $tree = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));

        foreach ($tree as $file) {
            if (in_array(strtolower($file->getExtension()), ['png', 'webp', 'avif', 'jpg', 'jpeg', 'svg', 'gif'], true)) {
                $files[] = '/images' . substr($file->getPathname(), strlen($root));
            }
        }

        sort($files);

        return $files;
    }

    /**
     * The files a supplied entry delivers, so they are never listed as orphans.
     *
     * @param  array<string, array<string, mixed>>  $assets
     * @return list<string>
     */
    private function suppliedFiles(array $assets): array
    {
        $files = [];

        foreach (array_keys($assets) as $id) {
            foreach ($this->manifest->expectedFiles($id) as $file) {
                $files[] = $file['url'];
            }
        }

        return $files;
    }

    /**
     * The text of every source that could name an image, as one string. The
     * manifest is left out: naming a file as a legacy source is not a use.
     */
    private function referenceCorpus(): string
    {
        $corpus = '';
        $extensions = ['ts', 'tsx', 'js', 'php', 'json', 'md', 'css', 'xml', 'webmanifest'];

        foreach (['resources', 'app', 'routes', 'config', 'public/site.webmanifest'] as $relative) {
            $path = $this->root() . '/' . $relative;

            if (is_file($path)) {
                $corpus .= (string) file_get_contents($path) . "\n";

                continue;
            }

            if (! is_dir($path)) {
                continue;
            }

            $tree = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS));

            foreach ($tree as $file) {
                if ($file->getPathname() === realpath($this->manifest->path()) || $file->getPathname() === $this->manifest->path()) {
                    continue;
                }

                if (in_array($file->getExtension(), $extensions, true) || str_ends_with($file->getFilename(), '.blade.php')) {
                    $corpus .= (string) file_get_contents($file->getPathname()) . "\n";
                }
            }
        }

        return $corpus;
    }

    private function pixelSize(string $path): string
    {
        $absolute = $this->root() . '/public' . $path;

        if (! is_file($absolute) || str_ends_with($path, '.svg')) {
            return '—';
        }

        $size = @getimagesize($absolute);

        return $size === false ? '—' : "{$size[0]}×{$size[1]}";
    }

    /**
     * A platform's row in `resources/data/platforms.json`, or an empty array.
     *
     * @return array<string, mixed>
     */
    private function platform(string $id): array
    {
        $path = $this->root() . '/resources/data/platforms.json';

        if (! is_file($path)) {
            return [];
        }

        try {
            $data = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return [];
        }

        foreach (is_array($data['platforms'] ?? null) ? $data['platforms'] : [] as $platform) {
            if (is_array($platform) && ($platform['id'] ?? null) === $id) {
                return $platform;
            }
        }

        return [];
    }

    private function root(): string
    {
        return rtrim($this->basePath ?? base_path(), '/');
    }

    /**
     * @return array<string, string> family => absolute path
     */
    private function fragmentFiles(): array
    {
        $dir = $this->fragmentsPath();

        if (! is_dir($dir)) {
            return [];
        }

        $files = [];

        foreach ((array) glob(rtrim($dir, '/') . '/*.md') as $file) {
            $name = basename((string) $file, '.md');

            if (! str_starts_with($name, '_')) {
                $files[$name] = (string) $file;
            }
        }

        ksort($files);

        return $files;
    }

    /**
     * Splits every fragment into its preamble and its `## id` sections, each
     * split into `### heading` bodies. Lines inside fenced code blocks are
     * never read as headings. Lines are split in UTF-8 mode: in byte mode
     * `\R` matches NEL (0x85), the last byte of letters such as "ễ".
     *
     * @return Parsed
     */
    private function parsed(): array
    {
        if ($this->parsed !== null) {
            return $this->parsed;
        }

        $sections = [];
        $preambles = [];
        $problems = [];

        foreach ($this->fragmentFiles() as $family => $file) {
            $relative = $this->fragmentFile($family);
            $preamble = [];
            $bodies = [];
            $id = null;
            $heading = null;
            $fenced = false;

            foreach (preg_split('/\R/u', (string) file_get_contents($file)) ?: [] as $line) {
                if (! $fenced && preg_match('/^## +(.+?)\s*$/u', $line, $match) === 1) {
                    $id = trim($match[1], " \t`");
                    $heading = null;

                    if (array_key_exists($id, $sections) || array_key_exists($id, $bodies)) {
                        $problems[] = "{$relative}: {$id} has a second section.";
                    }

                    $bodies[$id] = [];

                    continue;
                }

                if (! $fenced && $id !== null && preg_match('/^### +(.+?)\s*$/u', $line, $match) === 1) {
                    $heading = $match[1];

                    if (! in_array($heading, self::HEADINGS, true)) {
                        $problems[] = "{$relative}: {$id} has an unknown heading \"### {$heading}\".";
                    } elseif (array_key_exists($heading, $bodies[$id])) {
                        $problems[] = "{$relative}: {$id} repeats \"### {$heading}\".";
                    }

                    $bodies[$id][$heading] = [];

                    continue;
                }

                if (preg_match('/^\s*(```|~~~)/', $line) === 1) {
                    $fenced = ! $fenced;
                }

                if ($id === null) {
                    if ($fenced || preg_match('/^# /', $line) !== 1) {
                        $preamble[] = $line;
                    }

                    continue;
                }

                if ($heading === null) {
                    if (trim($line) !== '') {
                        $problems[] = "{$relative}: {$id} has text before its first heading.";
                    }

                    continue;
                }

                $bodies[$id][$heading][] = $line;
            }

            foreach ($bodies as $sectionId => $headings) {
                $sections[$sectionId] = [
                    'family' => $family,
                    'file' => $relative,
                    'headings' => array_map(fn(array $lines): string => trim(implode("\n", $lines)), $headings),
                ];
            }

            $text = trim(implode("\n", $preamble));

            if ($text !== '') {
                $preambles[$family] = $text;
            }
        }

        return $this->parsed = ['sections' => $sections, 'preambles' => $preambles, 'problems' => $problems];
    }
}
