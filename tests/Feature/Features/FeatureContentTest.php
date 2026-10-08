<?php

use App\Support\Assets\AssetManifest;
use App\Support\Content\Slugs\FeatureSlugs;
use App\Support\Features\FeatureFacts;
use Illuminate\Support\Facades\File;

/**
 * Every feature content file against the schema in
 * resources/js/components/features/README.md.
 *
 * The feature pages are written from one template, so this is where a page
 * learns it broke the shape before a reader does: a section id
 * the sitemap fixes, a slot placed in the wrong section, a `{token}` nothing
 * computes, a paid feature described without its plan, or a link that leaves
 * the site without coming from data. Pages that do not exist yet are skipped;
 * `Localization/LocaleRoutingTest` holds the slug list to the files.
 */

/**
 * The section ids sitemap §A.2 fixes per page. Redirects and cross-links
 * target them (`/blog/mcp-database-claude` → `/features/ai-mcp#mcp`), so a
 * page may add sections but never drop or rename one of these.
 *
 * @return array<string, list<string>>
 */
function featureSchemaRequiredIds(): array
{
    return [
        'querying' => ['editor', 'history', 'performance', 'results', 'other-languages', 'iphone'],
        'data-editing' => ['browse', 'edit', 'safe-mode', 'data-rewind', 'documents-and-keys', 'iphone'],
        'schema' => ['structure', 'er-diagram', 'compare-sync', 'copy', 'administer', 'iphone'],
        'import-export' => ['import', 'export', 'data-files', 'backup', 'files', 'iphone'],
        'ai-mcp' => ['assistant', 'agent-mode', 'mcp', 'outside-servers', 'automation', 'privacy'],
        'connections' => ['organize', 'import', 'network', 'cloud-auth', 'credentials', 'policies', 'iphone'],
        'sync-and-teams' => ['icloud-sync', 'handoff', 'share', 'linked-folders', 'team', 'seats'],
    ];
}

/**
 * Ids the page template renders itself, which no section may take.
 *
 * @return list<string>
 */
function featureSchemaTemplateIds(): array
{
    return ['availability', 'limits', 'docs', 'related', 'get-started', 'main-content'];
}

/**
 * @return array<string, mixed>
 */
function featureSchemaContent(string $locale, string $name): array
{
    return json_decode(File::get(resource_path("data/content/{$locale}/features/{$name}.json")), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * A feature content file's path. Built from this file's location rather than
 * `resource_path()`, because datasets are listed before the application boots.
 */
function featureSchemaPath(string $locale, string $name): string
{
    return dirname(__DIR__, 3) . "/resources/data/content/{$locale}/features/{$name}.json";
}

/**
 * Every feature page file that exists, as [locale, slug].
 *
 * @return array<string, array{0: string, 1: string}>
 */
function featureSchemaFiles(): array
{
    $files = [];

    foreach (['en', 'vi'] as $locale) {
        foreach (FeatureSlugs::ALL as $slug) {
            if (is_file(featureSchemaPath($locale, $slug))) {
                $files["{$locale}/{$slug}"] = [$locale, $slug];
            }
        }
    }

    return $files;
}

/**
 * A section followed by its blocks, each with the id of the section it is in.
 *
 * @param  array<string, mixed>  $content
 * @return list<array{section: string, block: array<string, mixed>}>
 */
function featureSchemaBlocks(array $content): array
{
    $blocks = [];

    foreach ($content['sections'] as $section) {
        $blocks[] = ['section' => $section['id'], 'block' => $section];

        foreach ($section['blocks'] ?? [] as $block) {
            $blocks[] = ['section' => $section['id'], 'block' => $block];
        }
    }

    return $blocks;
}

/**
 * @param  array<string, mixed>  $link
 */
function featureSchemaAssertLink(array $link, string $where): void
{
    expect($link['label'] ?? null)->toBeString()->not->toBe('', "{$where}: a link needs a label");

    $targets = array_intersect(array_keys($link), ['href', 'docs']);
    expect(count($targets))->toBe(1, "{$where}: a link has exactly one of href or docs");
    expect(array_diff(array_keys($link), ['label', 'href', 'docs']))->toBe([], "{$where}: unknown link key");

    $target = $link['href'] ?? $link['docs'];
    expect($target)->toStartWith('/', "{$where}: {$target} must be a root-relative path; external URLs come from data");
    expect($target)->not->toStartWith('//');

    if (isset($link['href']) && preg_match('#^/features/([^/\#?]+)#', $link['href'], $match) === 1) {
        expect(in_array($match[1], FeatureSlugs::ALL, true))->toBeTrue("{$where}: {$link['href']} is not a feature page");
    }
}

it('has a hub with the shared labels in every locale', function (string $locale): void {
    $hub = featureSchemaContent($locale, 'index');

    expect(array_keys($hub))->toBe(['seo', 'og', 'header', 'areas', 'ios', 'paid', 'docs', 'labels']);
    expect($hub['seo']['title'])->toBeString()->not->toBe('');
    expect($hub['og']['title'])->toBeString()->not->toBe('');
    expect(array_column($hub['areas']['items'], 'slug'))->toBe(FeatureSlugs::ALL, 'The hub describes every feature page, in the menu order');
    expect($hub['docs']['path'])->toStartWith('/');

    expect(array_keys($hub['labels']))->toBe(['number', 'tiers', 'paidBadge', 'header', 'sections', 'availability', 'download']);
    expect(array_keys($hub['labels']['tiers']))->toBe(['free', 'starter', 'team']);
    expect($hub['labels']['tiers']['starter'])->toBe('Starter');
    expect($hub['labels']['tiers']['team'])->toBe('Team');
    expect($hub['labels']['paidBadge'])->toContain('{name}')->toContain('{tier}');
    expect($hub['labels']['availability']['plan'])->toContain('{tier}');
})->with(['en', 'vi']);

it('spells out MCP where the hub and the AI page first name it, in every language', function (): void {
    $locales = array_keys(json_decode(File::get(resource_path('data/locales.json')), true, 512, JSON_THROW_ON_ERROR)['supported']);

    foreach ($locales as $locale) {
        $summary = collect(featureSchemaContent($locale, 'index')['areas']['items'])->firstWhere('slug', 'ai-mcp')['summary'];

        expect($summary)->toContain('Model Context Protocol');
        expect(featureSchemaContent($locale, 'ai-mcp')['header']['lead'])->toContain('Model Context Protocol');
    }
});

it('follows the feature page schema', function (string $locale, string $slug): void {
    $content = featureSchemaContent($locale, $slug);
    $where = "content/{$locale}/features/{$slug}.json";
    $paidIds = array_column(json_decode(File::get(resource_path('data/paid-features.json')), true, 512, JSON_THROW_ON_ERROR), 'id');

    expect(array_keys($content))->toBe(['seo', 'og', 'header', 'sections', 'availability', 'limits', 'docs', 'related'], "{$where}: top-level keys");
    expect(array_keys($content['og']))->toBe(['kicker', 'title']);
    expect(array_keys($content['header']))->toBe(['title', 'lead', 'docs']);
    expect($content['header']['docs'])->toStartWith('/');

    foreach (['seo', 'og'] as $head) {
        foreach ($content[$head] as $key => $value) {
            if (is_string($value)) {
                expect($value)->not->toBe('')->not->toMatch('/\{[A-Za-z]/', "{$where}: {$head}.{$key} is rendered outside the page and takes no tokens");
            }
        }
    }

    expect($content['sections'])->toBeArray()->not->toBeEmpty();

    $ids = [];

    foreach (featureSchemaBlocks($content) as ['section' => $section, 'block' => $block]) {
        $label = "{$where} #{$section}" . (($block['id'] ?? null) === $section ? '' : ' › ' . ($block['title'] ?? '?'));

        expect(array_diff(array_keys($block), ['id', 'title', 'paragraphs', 'points', 'paid', 'since', 'asset', 'engines', 'links', 'blocks']))->toBe([], "{$label}: unknown key");
        expect($block['title'] ?? null)->toBeString()->not->toBe('', "{$label}: title");
        expect($block['paragraphs'] ?? null)->toBeArray("{$label}: paragraphs is a list, empty when the section only holds blocks");

        if (isset($block['id'])) {
            expect($block['id'])->toMatch('/^[a-z][a-z0-9-]*$/', "{$label}: ids are lowercase English");
            expect(in_array($block['id'], $ids, true))->toBeFalse("{$label}: id {$block['id']} is used twice");
            expect(in_array($block['id'], featureSchemaTemplateIds(), true))->toBeFalse("{$label}: the template renders #{$block['id']}");
            $ids[] = $block['id'];
        }

        foreach (array_merge($block['paragraphs'], $block['points'] ?? []) as $text) {
            expect($text)->toBeString()->not->toBe('');
        }

        foreach ($block['paid'] ?? [] as $id) {
            expect(in_array($id, $paidIds, true))->toBeTrue("{$label}: {$id} is not in paid-features.json");
        }

        if (array_key_exists('since', $block) && $block['since'] !== null) {
            expect($block['since'])->toMatch('/^\d+\.\d+\.\d+$/', "{$label}: since is an app version");
        }

        foreach ($block['engines'] ?? [] as $list) {
            expect(array_keys($list))->toBe(['label', 'list'], "{$label}: an engine list is a label and a list name");
        }

        foreach ($block['links'] ?? [] as $link) {
            featureSchemaAssertLink($link, $label);
        }
    }

    foreach ($content['sections'] as $section) {
        expect($section['id'] ?? null)->toBeString("{$where}: every section has an id");
        expect(empty($section['paragraphs']) && empty($section['points']) && empty($section['blocks']))->toBeFalse("{$where} #{$section['id']} is empty");
    }

    expect($content['availability'])->toBeArray()->not->toBeEmpty("{$where}: Where it works needs rows");

    foreach ($content['availability'] as $row) {
        expect(array_diff(array_keys($row), ['label', 'paid', 'mac', 'ios', 'iosNote']))->toBe([], "{$where}: unknown availability key");
        expect($row['label'])->toBeString()->not->toBe('');
        expect($row['ios'])->toBeIn(['yes', 'no', 'partial']);
        expect($row['mac'] ?? 'yes')->toBeIn(['yes', 'no']);
        expect(isset($row['iosNote']))->toBe($row['ios'] === 'partial', "{$where}: {$row['label']} has an iosNote exactly when it is partial");

        if (isset($row['paid'])) {
            expect($paidIds)->toContain($row['paid']);
        }
    }

    expect($content['limits'])->toBeArray();

    foreach ([...$content['docs'], ...$content['related']] as $link) {
        featureSchemaAssertLink($link, $where);
    }

    foreach ($content['docs'] as $link) {
        expect(isset($link['docs']))->toBeTrue("{$where}: docs lists docs.tablepro.app pages");
    }

    foreach ($content['related'] as $link) {
        expect(isset($link['href']))->toBeTrue("{$where}: related lists pages on this site");
    }
})->with(fn(): array => featureSchemaFiles());

it('keeps the section ids the sitemap fixes', function (string $locale, string $slug): void {
    $ids = array_column(featureSchemaContent($locale, $slug)['sections'], 'id');

    expect(array_values(array_diff(featureSchemaRequiredIds()[$slug], $ids)))->toBe([], "content/{$locale}/features/{$slug}.json is missing a fixed section id");
})->with(fn(): array => featureSchemaFiles());

it('gives the pages the same sections in every locale', function (string $locale, string $slug): void {
    $english = featureSchemaContent('en', $slug);
    $translated = featureSchemaContent($locale, $slug);
    $ids = fn(array $content): array => array_map(
        fn(array $entry): string => $entry['section'] . '/' . ($entry['block']['id'] ?? ''),
        featureSchemaBlocks($content),
    );

    expect($ids($translated))->toBe($ids($english));
})->with(fn(): array => array_filter(featureSchemaFiles(), fn(array $file): bool => $file[0] !== 'en' && is_file(featureSchemaPath('en', $file[1]))));

it('names only facts the server computes', function (string $locale, string $name): void {
    $facts = (new FeatureFacts())->all();
    $content = featureSchemaContent($locale, $name);

    expect(array_values(array_diff(FeatureFacts::referencedNames($content), array_keys($facts))))
        ->toBe([], "content/{$locale}/features/{$name}.json names facts FeatureFacts does not have; see components/features/README.md");

    foreach ($name === 'index' ? [] : featureSchemaBlocks($content) as ['block' => $block]) {
        foreach ($block['engines'] ?? [] as $list) {
            expect($facts[$list['list']]['kind'] ?? null)->toBe('engines', "{$list['list']} is not an engine list");
        }
    }
})->with(function (): array {
    $files = ['en/index' => ['en', 'index'], 'vi/index' => ['vi', 'index']];

    foreach (featureSchemaFiles() as $key => $file) {
        $files[$key] = $file;
    }

    return $files;
});

it('places each slot in the section the manifest gives it', function (string $locale, string $slug): void {
    $assets = (new AssetManifest())->assets();

    foreach (featureSchemaBlocks(featureSchemaContent($locale, $slug)) as ['section' => $section, 'block' => $block]) {
        if (! isset($block['asset'])) {
            continue;
        }

        $id = $block['asset'];

        expect($assets)->toHaveKey($id);
        expect($assets[$id]['slot'])->toBeTrue("{$id} is not a slot");
        expect($assets[$id]['kind'])->not->toBe('mobile-crop', "{$id}: a phone crop renders through its window's slot");
        expect(in_array(['path' => "/features/{$slug}", 'section' => $section], $assets[$id]['usedOn'], true))
            ->toBeTrue("{$id} is not briefed for /features/{$slug}#{$section}; ask for a manifest change instead");
    }
})->with(fn(): array => featureSchemaFiles());

it('names the plan of every paid feature in the section that describes it', function (string $slug): void {
    $content = featureSchemaContent('en', $slug);
    $features = json_decode(File::get(resource_path('data/paid-features.json')), true, 512, JSON_THROW_ON_ERROR);

    $marked = collect(featureSchemaBlocks($content))
        ->flatMap(fn(array $entry): array => (array) ($entry['block']['paid'] ?? []))
        ->merge(collect($content['availability'])->pluck('paid')->filter())
        ->unique()
        ->values()
        ->all();

    expect(array_values(array_diff($marked, array_column($features, 'id'))))
        ->toBe([], "/features/{$slug} marks a paid id that paid-features.json does not have");

    foreach ($features as $feature) {
        if ($feature['page']['path'] !== "/features/{$slug}") {
            continue;
        }

        $marked = collect(featureSchemaBlocks($content))
            ->filter(fn(array $entry): bool => $entry['section'] === $feature['page']['anchor'])
            ->contains(fn(array $entry): bool => in_array($feature['id'], $entry['block']['paid'] ?? [], true));

        expect($marked)->toBeTrue("{$feature['name']} must be in the `paid` of #{$feature['page']['anchor']} (or one of its blocks) on /features/{$slug}");
        expect(collect($content['availability'])->contains(fn(array $row): bool => ($row['paid'] ?? null) === $feature['id']))
            ->toBeTrue("{$feature['name']} needs a row in Where it works with its paid id");
    }
})->with(fn(): array => array_values(array_unique(array_column(featureSchemaFiles(), 1))));

it('never frames a paid feature as unlocked', function (string $locale, string $name): void {
    $text = File::get(resource_path("data/content/{$locale}/features/{$name}.json"));

    expect($text)->not->toMatch($locale === 'vi' ? '/mở khóa/iu' : '/\bunlock/i', 'Paid plans add features (positioning §12.1)');
})->with(function (): array {
    $files = ['en/index' => ['en', 'index'], 'vi/index' => ['vi', 'index']];

    foreach (featureSchemaFiles() as $key => $file) {
        $files[$key] = $file;
    }

    return $files;
});
