<?php

use App\Support\Assets\AssetManifest;
use App\Support\Assets\AssetReferences;
use App\Support\Localization\Locales;
use Dom\HTMLDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Assert;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * resources/data/assets.json, the public site's one image manifest
 * (architecture §1.9, design-system §6).
 *
 * Every editorial image is a placeholder until the owner supplies it, and the
 * only switch is an entry's `status`. So the manifest has to be right on its
 * own: every handoff field the spec asks for (§9.1), the geometry the visual
 * contract pins, short NFC descriptions, real pages, and, once an entry is
 * supplied, every promised file on disk at its true size and within budget.
 *
 * The supplied path has no real art yet, so it runs against an isolated
 * fixture, tests/Fixtures/assets/manifest.json, with tiny images drawn into a
 * temporary directory. The same fixture holds the JavaScript renderer to the
 * same file names (tests/js/asset-slot.test.ts).
 */
function assetManifestPath(): string
{
    return dirname(__DIR__, 3) . '/resources/data/assets.json';
}

function assetFixturePath(): string
{
    return dirname(__DIR__, 2) . '/Fixtures/assets/manifest.json';
}

/**
 * @return array{kinds: array<string, array<string, mixed>>, assets: array<string, array<string, mixed>>}
 */
function assetManifestData(string $path): array
{
    return json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * A scratch directory for one test, removed again at teardown.
 */
function assetScratchDirectory(): string
{
    $dir = sys_get_temp_dir() . '/asset-manifest-' . bin2hex(random_bytes(6));
    mkdir($dir, 0755, true);
    assetScratchDirectories($dir);

    return $dir;
}

/**
 * Remembers a scratch directory, or with no argument hands back every one
 * remembered so far and forgets them.
 *
 * @return list<string>
 */
function assetScratchDirectories(?string $add = null): array
{
    static $dirs = [];

    if ($add !== null) {
        $dirs[] = $add;

        return $dirs;
    }

    [$all, $dirs] = [$dirs, []];

    return $all;
}

function assetRemoveDirectory(string $dir): void
{
    if (! is_dir($dir)) {
        return;
    }

    $tree = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST,
    );

    foreach ($tree as $file) {
        $file->isDir() ? rmdir($file->getPathname()) : unlink($file->getPathname());
    }

    rmdir($dir);
}

/**
 * Draws one real image file of the given size and format.
 */
function assetDrawImage(string $path, int $width, int $height, string $format): void
{
    if (! is_dir(dirname($path))) {
        mkdir(dirname($path), 0755, true);
    }

    if ($format === 'svg') {
        file_put_contents($path, "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{$width}\" height=\"{$height}\" viewBox=\"0 0 {$width} {$height}\"></svg>");

        return;
    }

    $image = imagecreatetruecolor($width, $height);
    imagefill($image, 0, 0, (int) imagecolorallocate($image, 200, 120, 40));

    match ($format) {
        'avif' => imageavif($image, $path),
        'webp' => imagewebp($image, $path),
        'png' => imagepng($image, $path),
    };
}

/**
 * Installs every file the supplied fixture entries promise into `$root/public`,
 * then returns a manifest that reads them.
 */
function assetSuppliedFixture(string $root, ?callable $mutate = null): AssetManifest
{
    $data = assetManifestData(assetFixturePath());

    if ($mutate !== null) {
        $data = $mutate($data);
    }

    $path = $root . '/manifest.json';
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

    return new AssetManifest($path, $root);
}

function assetInstallFiles(AssetManifest $manifest): void
{
    foreach (array_keys($manifest->assets()) as $id) {
        foreach ($manifest->expectedFiles($id) as $file) {
            $source = $manifest->themedSources($id, $file['locale'] ?? 'en');
            $shape = $source[0][$file['variant']] ?? null;
            $width = $file['width'] ?? ($shape['width'] ?? 1);
            $height = $file['height'] ?? ($shape['height'] ?? 1);

            assetDrawImage($manifest->absolute($file['url']), $width, $height, $file['format']);
        }
    }
}

/**
 * @return list<string>
 */
function assetSlotFamilies(): array
{
    $families = [];

    foreach (assetManifestData(assetManifestPath())['assets'] as $entry) {
        if ($entry['slot']) {
            $families[$entry['family']] = true;
        }
    }

    return array_keys($families);
}

afterEach(function (): void {
    foreach (assetScratchDirectories() as $dir) {
        assetRemoveDirectory($dir);
    }
});

describe('the visual contract', function (): void {
    it('declares exactly the kinds of design-system §6.3, each with its export rules', function (): void {
        $kinds = (new AssetManifest())->kinds();

        expect(array_keys($kinds))->toBe(['window', 'mobile-crop', 'detail', 'phone', 'ipad', 'diagram', 'illustration', 'figure', 'og-card']);

        foreach ($kinds as $name => $kind) {
            foreach (['type', 'aspect', 'rendered', 'exportPx', 'vector', 'density', 'format', 'transparency', 'maxBytes', 'widths', 'sizes'] as $field) {
                Assert::assertArrayHasKey($field, $kind, "kind {$name} has no {$field}");
            }

            Assert::assertTrue($kind['vector'] || is_array($kind['exportPx']), "kind {$name} needs exportPx or vector: true");
            Assert::assertSame($kind['vector'], $kind['format']['delivered'] === ['svg'], "kind {$name}: vector and SVG delivery disagree");
            Assert::assertSame([], array_diff($kind['format']['delivered'], ['avif', 'webp', 'png', 'svg']), "kind {$name} delivers an unknown format");
            Assert::assertIsInt($kind['maxBytes'], "kind {$name} has no byte budget");
            Assert::assertGreaterThan(0, $kind['maxBytes']);

            $widths = $kind['widths'];
            $sorted = $widths;
            sort($sorted);
            Assert::assertSame($sorted, $widths, "kind {$name} lists its widths out of order");

            if (! $kind['vector']) {
                Assert::assertNotSame([], $widths, "kind {$name} lists no widths");
                Assert::assertLessThanOrEqual($kind['exportPx'][0], max($widths), "kind {$name} offers a width beyond its export");
            }

            Assert::assertSame($name === 'og-card', $kind['sizes'] === null, "kind {$name}: only the social card has no sizes");
        }
    });

    /*
     * Pinned on purpose. These numbers are the visual contract: changing one
     * means editing design-system §6.3 and this test in the same change.
     */
    it('pins the geometry of the screenshot kinds', function (): void {
        $kinds = (new AssetManifest())->kinds();
        $pick = fn(string $kind): array => [
            $kinds[$kind]['type'],
            $kinds[$kind]['aspect'],
            $kinds[$kind]['rendered'],
            $kinds[$kind]['exportPx'],
            $kinds[$kind]['density'],
        ];

        expect($pick('window'))->toBe(['screenshot', '16:9', ['desktop' => [1216, 684], 'tablet' => [720, 405], 'phone' => [343, 193]], [2432, 1368], 2]);
        expect($pick('mobile-crop'))->toBe(['detail', '4:5', ['desktop' => null, 'tablet' => null, 'phone' => [343, 429]], [686, 858], 2]);
        expect($pick('detail'))->toBe(['detail', '4:3', ['desktop' => [696, 522], 'tablet' => [720, 540], 'phone' => [343, 257]], [1392, 1044], 2]);
        expect($pick('phone'))->toBe(['screenshot-phone', '9:19.5', ['desktop' => [280, 607], 'tablet' => [280, 607], 'phone' => [240, 520]], [1179, 2556], 3]);
        expect($pick('ipad'))->toBe(['screenshot-ipad', '4:3', ['desktop' => [1008, 756], 'tablet' => [720, 540], 'phone' => [343, 257]], [2732, 2048], 2]);
        expect($pick('figure'))->toBe(['per-figure', null, ['desktop' => [704, null], 'tablet' => [704, null], 'phone' => [343, null]], [1408, null], 2]);
        expect($pick('og-card'))->toBe(['og-card', '1200:630', null, [1200, 630], 1]);
        expect($kinds['diagram']['aspect'])->toBe('16:9');
        expect($kinds['illustration']['aspect'])->toBe('16:9');

        expect(array_map(fn(array $kind): int => $kind['maxBytes'], $kinds))->toBe([
            'window' => 250000, 'mobile-crop' => 120000, 'detail' => 150000, 'phone' => 150000, 'ipad' => 250000,
            'diagram' => 60000, 'illustration' => 250000, 'figure' => 200000, 'og-card' => 320000,
        ]);
    });
});

describe('every entry', function (): void {
    it('carries every handoff field of spec §9.1', function (): void {
        $manifest = new AssetManifest();
        $kinds = $manifest->kinds();
        $fields = ['kind', 'type', 'family', 'ownerRepo', 'slot', 'handoffPriority', 'usedOn', 'aspect', 'priority', 'theme', 'locale', 'mobile', 'description', 'alt', 'caption', 'replacement', 'status', 'src', 'legacySource'];

        expect($manifest->assets())->not->toBeEmpty();

        foreach ($manifest->assets() as $id => $entry) {
            Assert::assertMatchesRegularExpression('/^[a-z0-9][a-z0-9-]*$/', $id, "{$id} is not a kebab-case id");
            Assert::assertEqualsCanonicalizing($fields, array_keys($entry), "{$id} has the wrong fields");
            Assert::assertArrayHasKey($entry['kind'], $kinds, "{$id} names an unknown kind");

            if ($entry['kind'] === 'figure') {
                Assert::assertContains($entry['type'], ['screenshot', 'detail'], "{$id}: a figure is a screenshot or a detail");
                Assert::assertMatchesRegularExpression('/^\d+:\d+$/', (string) $entry['aspect'], "{$id}: a figure takes its source's aspect");
            } else {
                Assert::assertSame($kinds[$entry['kind']]['type'], $entry['type'], "{$id}: its type must be its kind's");
                Assert::assertTrue(
                    $entry['aspect'] === null || ($entry['kind'] === 'mobile-crop' && $entry['aspect'] === '1:1'),
                    "{$id}: only a 1:1 phone crop or a figure may override the aspect",
                );
            }

            Assert::assertMatchesRegularExpression('/^[a-z][a-z0-9-]*$/', $entry['family'], "{$id} has no family");
            Assert::assertContains($entry['ownerRepo'], ['web', 'license'], "{$id} has no owning repository");
            Assert::assertIsBool($entry['slot']);
            Assert::assertSame($entry['kind'] !== 'og-card', $entry['slot'], "{$id}: a social card is never a slot, and everything else is");
            Assert::assertContains($entry['handoffPriority'], ['P1', 'P2', 'P3'], "{$id} has no priority");
            Assert::assertIsBool($entry['priority']);
            Assert::assertContains($entry['theme'], ['both', 'single'], "{$id} has no theme rule");
            Assert::assertContains($entry['locale'], ['shared', 'per-locale'], "{$id} has no locale rule");
            Assert::assertContains($entry['status'], AssetManifest::STATUSES, "{$id} has an unknown status");
            Assert::assertSame($entry['status'] === 'placeholder', $entry['src'] === null, "{$id}: a placeholder has no src, a supplied entry has one");

            $root = $entry['kind'] === 'og-card' ? 'public/og/' : 'public/images/';
            Assert::assertStringStartsWith($root, $entry['replacement']['dir'], "{$id} is replaced outside {$root}");
            Assert::assertSame($id, $entry['replacement']['base'], "{$id}: the file base must be the id");

            foreach (['description', 'alt'] as $field) {
                Assert::assertIsString($entry[$field]['en'] ?? null, "{$id} has no English {$field}");
                Assert::assertNotSame('', trim($entry[$field]['en']), "{$id} has an empty English {$field}");
            }

            Assert::assertTrue($entry['caption'] === null || is_string($entry['caption']['en'] ?? null), "{$id}: a caption needs English text");
        }
    });

    it('writes native text for every entry a localized page shows', function (string $locale): void {
        foreach ((new AssetManifest())->assets() as $id => $entry) {
            $englishOnly = collect($entry['usedOn'])->every(fn(array $use): bool => str_starts_with($use['path'], '/blog/'));

            foreach (['description', 'alt', 'caption'] as $field) {
                if ($entry[$field] === null) {
                    continue;
                }

                $text = $entry[$field][$locale] ?? null;

                if ($englishOnly) {
                    Assert::assertTrue($text === null || is_string($text), "{$id}: {$field}.{$locale} must be text or null");

                    continue;
                }

                Assert::assertIsString($text, "{$id} is shown on a localized page but has no {$field}.{$locale}");
                Assert::assertNotSame('', trim($text), "{$id} has an empty {$field}.{$locale}");
            }
        }
    })->with(array_keys((json_decode((string) file_get_contents(__DIR__ . '/../../../resources/data/locales.json'), true))['supported']));

    it('keeps the visible brief short, NFC and free of asset ids', function (): void {
        $assets = (new AssetManifest())->assets();
        $limits = array_fill_keys(Locales::codes(), 200);
        $limits['en'] = 160;

        foreach ($assets as $id => $entry) {
            foreach ($limits as $locale => $limit) {
                $text = $entry['description'][$locale] ?? null;

                if ($text === null) {
                    continue;
                }

                Assert::assertLessThanOrEqual($limit, mb_strlen($text), "{$id}: description.{$locale} is " . mb_strlen($text) . " characters, over {$limit}");

                foreach (array_keys($assets) as $other) {
                    Assert::assertStringNotContainsString($other, $text, "{$id}: description.{$locale} names the id {$other}");
                }
            }

            foreach (['description', 'alt', 'caption'] as $field) {
                foreach ($entry[$field] ?? [] as $locale => $text) {
                    if ($text !== null) {
                        Assert::assertTrue(Normalizer::isNormalized($text, Normalizer::FORM_C), "{$id}: {$field}.{$locale} is not NFC");
                    }
                }
            }
        }
    });

    /*
     * The Vietnamese briefs and alt text are read by Vietnamese developers,
     * who read "bảng" as a database table: the glossary keeps "table" in
     * English for that reason (positioning §11.2), so a sheet is a "hộp
     * thoại" and a panel a "khung". "Được giữ lại" means "kept", the opposite
     * of a statement held back from a script, and "của nó" / "cho chúng" are
     * English possessives carried over word for word.
     */
    it('keeps the Vietnamese text clear of the misreadings found in review', function (): void {
        $misreadings = [
            '/\bbảng\b/iu' => '"bảng" for a sheet or panel',
            '/được giữ lại/u' => '"held back" as "kept"',
            '/của nó|cho chúng/u' => 'an English possessive',
            '/liên kết nhiều-nhiều/u' => 'a many-to-many relation, which the manifest calls "quan hệ nhiều-nhiều"',
            '/kiểu đơn/u' => '"scalar", which stays in English',
        ];

        foreach ((new AssetManifest())->assets() as $id => $entry) {
            foreach (['description', 'alt', 'caption'] as $field) {
                $text = $entry[$field]['vi'] ?? null;

                if (! is_string($text)) {
                    continue;
                }

                foreach ($misreadings as $pattern => $why) {
                    Assert::assertSame(0, preg_match($pattern, $text), "{$id}: {$field}.vi uses {$why}: {$text}");
                }
            }
        }
    });

    it('places every entry on a page the site serves', function (): void {
        $routes = Route::getRoutes();

        foreach ((new AssetManifest())->assets() as $id => $entry) {
            Assert::assertNotEmpty($entry['usedOn'], "{$id} is used nowhere");

            foreach ($entry['usedOn'] as $use) {
                Assert::assertSame(['path', 'section'], array_keys($use), "{$id}: a use is {path, section}");
                Assert::assertMatchesRegularExpression('#^/([a-z0-9-]+(/[a-z0-9-]+)*)?$#', $use['path'], "{$id}: {$use['path']} is not a locale-neutral path");
                Assert::assertFalse(str_starts_with($use['path'] . '/', '/vi/'), "{$id}: {$use['path']} carries a locale prefix");
                Assert::assertMatchesRegularExpression('/^[a-z0-9][a-z0-9:-]*$/', $use['section'], "{$id}: {$use['section']} is not a section id");

                try {
                    $route = $routes->match(Request::create($use['path']));
                } catch (HttpException) {
                    Assert::fail("{$id}: no route answers {$use['path']}");
                }

                Assert::assertStringStartsWith('landing.', (string) $route->getName(), "{$id}: {$use['path']} is not a public page");

                if ($route->getName() === 'landing.blog.show') {
                    $slug = substr($use['path'], strlen('/blog/'));
                    Assert::assertFileExists(resource_path("blog/{$slug}.md"), "{$id}: there is no post {$slug}");
                }
            }
        }
    });

    /*
     * A window always has a phone crop (design-system §6.3). A detail, an iPad
     * capture or an illustration may have one too: at 343 px wide a detail is
     * about half size and an iPad capture about a quarter, so one whose focal
     * text must read on a phone names a crop (found in review). Other kinds
     * already render at a legible size on a phone, or are the crop itself.
     */
    it('gives every window a phone crop, and any other crop to a kind that shrinks on a phone', function (): void {
        $assets = (new AssetManifest())->assets();
        $crops = [];

        foreach ($assets as $id => $entry) {
            if (! in_array($entry['kind'], ['window', 'detail', 'ipad', 'illustration'], true)) {
                Assert::assertTrue($entry['mobile'] === null, "{$id}: a {$entry['kind']} never names a phone crop");

                continue;
            }

            $crop = $entry['mobile'];

            /* A page's lead or section image (P1, P2) is the one a reader must be able to read. */
            if (in_array($entry['kind'], ['detail', 'ipad'], true) && in_array($entry['handoffPriority'], ['P1', 'P2'], true)) {
                Assert::assertIsString($crop, "{$id}: a {$entry['handoffPriority']} {$entry['kind']} shrinks to 343 px on a phone and needs a phone crop");
            }

            if ($entry['kind'] !== 'window' && $crop === null) {
                continue;
            }

            Assert::assertIsString($crop, "{$id}: a window needs a phone crop (design-system §6.3)");
            Assert::assertArrayHasKey($crop, $assets, "{$id} names the unknown crop {$crop}");
            Assert::assertSame('mobile-crop', $assets[$crop]['kind'], "{$id}: {$crop} is not a mobile-crop");
            Assert::assertArrayNotHasKey($crop, $crops, "{$crop} is the crop of two entries");

            foreach (['theme', 'locale', 'priority', 'family', 'ownerRepo', 'handoffPriority', 'usedOn'] as $field) {
                Assert::assertSame($entry[$field], $assets[$crop][$field], "{$crop} differs from {$id}, the entry it crops, in {$field}");
            }

            $crops[$crop] = $id;
        }

        foreach ($assets as $id => $entry) {
            if ($entry['kind'] === 'mobile-crop') {
                Assert::assertArrayHasKey($id, $crops, "{$id} is the crop of no entry");
            }
        }
    });

    it('gives priority only to one window and its crop', function (): void {
        $priority = array_filter((new AssetManifest())->assets(), fn(array $entry): bool => $entry['priority']);
        $windows = array_filter($priority, fn(array $entry): bool => $entry['kind'] === 'window');

        expect(count($windows))->toBeLessThanOrEqual(1);

        foreach ($priority as $id => $entry) {
            Assert::assertContains($entry['kind'], ['window', 'mobile-crop'], "{$id}: only the hero window and its crop load with priority");
        }
    });

    it('names only existing files as legacy sources', function (): void {
        foreach ((new AssetManifest())->assets() as $id => $entry) {
            $legacy = $entry['legacySource'];

            if ($legacy === null) {
                continue;
            }

            foreach ((array) $legacy as $path) {
                Assert::assertStringStartsWith('/images/', $path, "{$id}: {$path} is not under /images");
                Assert::assertFileExists(public_path(ltrim($path, '/')), "{$id}: its legacy source {$path} is missing");
            }
        }
    });

    it('has no supplied entry whose files are missing, mis-sized or over budget', function (): void {
        $manifest = new AssetManifest();

        expect($manifest->problems())->toBe([]);

        foreach ($manifest->assets() as $id => $entry) {
            if ($entry['status'] === 'placeholder') {
                Assert::assertNull($manifest->lcpDescriptor($id), "{$id}: a placeholder must never be preloaded");
            }
        }
    });
});

describe('references', function (): void {
    it('renders only ids the manifest has, as slots', function (): void {
        $assets = (new AssetManifest())->assets();
        $unknown = [];

        foreach ((new AssetReferences())->all() as $id => $paths) {
            if (! array_key_exists($id, $assets) || ! $assets[$id]['slot']) {
                $unknown[] = "{$id} (" . implode(', ', $paths) . ')';
            }
        }

        expect($unknown)->toBe([]);
    });

    it('finds the three ways a page names an asset', function (): void {
        $root = assetScratchDirectory();
        mkdir("{$root}/resources/js/pages", 0755, true);
        mkdir("{$root}/resources/data/content/en/features", 0755, true);
        mkdir("{$root}/resources/blog", 0755, true);
        mkdir("{$root}/resources/data/legal/vi", 0755, true);

        file_put_contents("{$root}/resources/js/pages/Home.tsx", <<<'TSX'
            /** Prose such as <AssetSlot id="…"> in a comment is not a use. */
            export default () => (<>
                <AssetSlot id="from-tsx" />
                <AssetSlot className="x" id={'from-expression'} sizes="100vw" />
            </>);
            TSX);
        file_put_contents("{$root}/resources/data/content/en/features/querying.json", json_encode(['sections' => [['asset' => 'from-content'], ['title' => 'asset']]]));
        file_put_contents("{$root}/resources/blog/a-post.md", "Text.\n\n<asset-slot id=\"from-post\"></asset-slot>\n");
        file_put_contents("{$root}/resources/data/legal/vi/privacy.md", "<asset-slot id=\"from-legal\"></asset-slot>\n");

        expect((new AssetReferences($root))->all())->toBe([
            'from-content' => ['resources/data/content/en/features/querying.json'],
            'from-expression' => ['resources/js/pages/Home.tsx'],
            'from-legal' => ['resources/data/legal/vi/privacy.md'],
            'from-post' => ['resources/blog/a-post.md'],
            'from-tsx' => ['resources/js/pages/Home.tsx'],
        ]);
    });

    /*
     * Every family places its slots now, so a family that places none is a
     * failure, not a skip: a renamed key or a moved page would otherwise turn
     * this check into a silent green.
     */
    it('places every slot of a family once the family renders any', function (string $family): void {
        $assets = (new AssetManifest())->assets();
        $references = (new AssetReferences())->all();
        $placed = array_keys($references);

        /* A window's slot renders its phone crop too. */
        foreach ($assets as $id => $entry) {
            if ($entry['mobile'] !== null && in_array($id, $placed, true)) {
                $placed[] = $entry['mobile'];
            }
        }

        $ids = array_keys(array_filter($assets, fn(array $entry): bool => $entry['slot'] && $entry['family'] === $family));
        $direct = array_intersect($ids, array_keys($references));

        Assert::assertNotSame([], $direct, "No page renders a {$family} slot");

        expect(array_values(array_diff($ids, $placed)))->toBe([]);
    })->with(assetSlotFamilies());
});

describe('the supplied path, on an isolated fixture', function (): void {
    it('accepts a complete set of files', function (): void {
        $root = assetScratchDirectory();
        $manifest = assetSuppliedFixture($root);
        assetInstallFiles($manifest);

        expect($manifest->expectedFiles('fixture-hero'))->toHaveCount(8);
        expect($manifest->problems())->toBe([]);
    });

    it('names files the way the page renders them', function (): void {
        $manifest = new AssetManifest(assetFixturePath());

        expect($manifest->fileUrl('fixture-hero', 'dark', null, 64, 'avif'))->toBe('/images/fixture/fixture-hero-dark-64.avif');
        expect($manifest->fileUrl('fixture-diagram', 'light', 'vi', null, 'svg'))->toBe('/images/fixture/fixture-diagram-light-vi.svg');
        expect($manifest->fileUrl('fixture-og', 'light', 'vi', 1200, 'png'))->toBe('/og/fixture/fixture-og-vi.png');
        expect($manifest->srcset('fixture-hero', ['widths' => [64, 32], 'formats' => ['avif'], 'width' => 64, 'height' => 36], 'light', null, 'avif'))
            ->toBe('/images/fixture/fixture-hero-light-32.avif 32w, /images/fixture/fixture-hero-light-64.avif 64w');
    });

    it('reports each way a supplied entry can be wrong', function (callable $break, string $expected): void {
        $root = assetScratchDirectory();
        assetInstallFiles(assetSuppliedFixture($root));
        $manifest = $break($root);

        $problems = implode("\n", $manifest->problems());

        expect($problems)->toContain($expected);
    })->with([
        'a missing file' => [
            function (string $root): AssetManifest {
                unlink("{$root}/public/images/fixture/fixture-detail-light-24.webp");

                return assetSuppliedFixture($root);
            },
            'fixture-detail: /images/fixture/fixture-detail-light-24.webp is missing.',
        ],
        'a file at the wrong width' => [
            function (string $root): AssetManifest {
                assetDrawImage("{$root}/public/images/fixture/fixture-detail-light-48.avif", 40, 30, 'avif');

                return assetSuppliedFixture($root);
            },
            'fixture-detail: /images/fixture/fixture-detail-light-48.avif is 40x30, not 48x36.',
        ],
        'a file over its byte budget' => [
            fn(string $root): AssetManifest => assetSuppliedFixture($root, function (array $data): array {
                $data['kinds']['detail']['maxBytes'] = 10;

                return $data;
            }),
            'over the 10 budget',
        ],
        'light and dark of different sizes' => [
            fn(string $root): AssetManifest => assetSuppliedFixture($root, function (array $data): array {
                $data['assets']['fixture-hero']['src']['dark']['height'] = 30;

                return $data;
            }),
            'fixture-hero (shared) has light and dark sources of different sizes.',
        ],
        'a themed entry with no dark image' => [
            fn(string $root): AssetManifest => assetSuppliedFixture($root, function (array $data): array {
                unset($data['assets']['fixture-hero']['src']['dark']);

                return $data;
            }),
            'fixture-hero (shared) is themed but has no dark sources.',
        ],
        'a window supplied before its crop' => [
            fn(string $root): AssetManifest => assetSuppliedFixture($root, function (array $data): array {
                $data['assets']['fixture-hero-mobile']['status'] = 'placeholder';
                $data['assets']['fixture-hero-mobile']['src'] = null;

                return $data;
            }),
            'fixture-hero is supplied before its phone crop fixture-hero-mobile.',
        ],
        'a per-locale entry missing a locale' => [
            fn(string $root): AssetManifest => assetSuppliedFixture($root, function (array $data): array {
                unset($data['assets']['fixture-diagram']['src']['vi']);

                return $data;
            }),
            'fixture-diagram is per-locale but has no vi sources.',
        ],
        'widths that stop short of the width' => [
            fn(string $root): AssetManifest => assetSuppliedFixture($root, function (array $data): array {
                $data['assets']['fixture-detail']['src']['light']['widths'] = [24];

                return $data;
            }),
            'fixture-detail (shared, light) must list widths whose largest is its width (48).',
        ],
        'a shape off its aspect' => [
            fn(string $root): AssetManifest => assetSuppliedFixture($root, function (array $data): array {
                $data['assets']['fixture-detail']['src']['light']['height'] = 40;

                return $data;
            }),
            'fixture-detail (shared, light) is 1.200 wide per unit of height; its aspect 4:3 is 1.333.',
        ],
        'a format its kind does not deliver' => [
            fn(string $root): AssetManifest => assetSuppliedFixture($root, function (array $data): array {
                $data['assets']['fixture-detail']['src']['light']['formats'] = ['avif', 'png'];

                return $data;
            }),
            'fixture-detail (shared, light) lists formats its kind does not deliver.',
        ],
    ]);

    /*
     * A window and its phone crop render as one art-directed <picture>: the
     * window behind `<source media="(min-width: 768px)">`, the crop as the
     * <img> below it. The preload has to follow the same split, or a phone
     * downloads the window it never paints and loads the crop it shows late.
     */
    it('preloads the window above 768px and its phone crop below, per theme', function (): void {
        $manifest = new AssetManifest(assetFixturePath());

        expect($manifest->lcpDescriptor('fixture-hero', 'en'))->toBe([
            'light' => [
                [
                    'srcset' => '/images/fixture/fixture-hero-light-32.avif 32w, /images/fixture/fixture-hero-light-64.avif 64w',
                    'sizes' => '(min-width: 1280px) 1216px, 100vw',
                    'type' => 'image/avif',
                    'media' => '(min-width: 768px)',
                ],
                [
                    'srcset' => '/images/fixture/fixture-hero-mobile-light-16.avif 16w, /images/fixture/fixture-hero-mobile-light-32.avif 32w',
                    'sizes' => 'calc(100vw - 32px)',
                    'type' => 'image/avif',
                    'media' => '(max-width: 767.98px)',
                ],
            ],
            'dark' => [
                [
                    'srcset' => '/images/fixture/fixture-hero-dark-32.avif 32w, /images/fixture/fixture-hero-dark-64.avif 64w',
                    'sizes' => '(min-width: 1280px) 1216px, 100vw',
                    'type' => 'image/avif',
                    'media' => '(min-width: 768px)',
                ],
                [
                    'srcset' => '/images/fixture/fixture-hero-mobile-dark-16.avif 16w, /images/fixture/fixture-hero-mobile-dark-32.avif 32w',
                    'sizes' => 'calc(100vw - 32px)',
                    'type' => 'image/avif',
                    'media' => '(max-width: 767.98px)',
                ],
            ],
        ]);

        expect($manifest->lcpDescriptor('fixture-phone', 'vi'))->toBe([
            'light' => [
                [
                    'srcset' => '/images/fixture/fixture-phone-light-18.avif 18w',
                    'sizes' => '(min-width: 768px) 280px, 240px',
                    'type' => 'image/avif',
                ],
            ],
            'dark' => null,
        ]);
    });

    /*
     * The bundle imports geometry and selected text, excluding the owner's
     * handoff fields (architecture §1.4 asks a shared-chunk addition to stay
     * near 10 KB gzipped). A manifest edit without `php artisan assets:generate`
     * would leave the site rendering the old state, so a stale slice fails
     * here.
     */
    it('bundles a current slice of the manifest, with only what rendering needs', function (): void {
        $manifest = new AssetManifest();
        $committed = resource_path('js/lib/data/asset-slots.json');

        expect($committed)->toBeFile();
        Assert::assertSame($manifest->slotProjectionJson(), (string) file_get_contents($committed), 'resources/js/lib/data/asset-slots.json is stale. Run: php artisan assets:generate');

        $projection = $manifest->slotProjection();
        $slots = array_keys(array_filter($manifest->assets(), fn(array $entry): bool => $entry['slot']));

        expect(array_keys($projection['assets']))->toBe($slots);

        foreach ($projection['assets'] as $id => $entry) {
            expect(array_keys($entry))->toBe(['kind', 'type', 'slot', 'aspect', 'priority', 'theme', 'locale', 'mobile', 'status', 'src', 'replacement'], $id);
        }

        /*
         * Each page downloads shared geometry and only its active language's
         * rendering text. Keep the existing ceiling as languages are added,
         * including supplied alt text and captions; owner fields stay out.
         */
        $minified = json_encode($projection, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

        $metadataBytes = strlen((string) gzencode($minified, 9));

        foreach (Locales::codes() as $locale) {
            $path = resource_path('js/lib/data/asset-locales/' . $locale . '.json');
            expect($path)->toBeFile();
            Assert::assertSame($manifest->slotTextProjectionJson($locale), (string) file_get_contents($path), "Asset text for {$locale} is stale. Run: php artisan assets:generate");
            $copy = $manifest->slotTextProjection($locale);
            expect(array_keys($copy))->toBe($slots);
            $copyBytes = strlen((string) gzencode(json_encode($copy, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), 9));
            expect($metadataBytes + $copyBytes)->toBeLessThan(18_432, "{$locale} downloads too much asset data");
        }
    });

    it('uses the same breakpoint as the art-directed picture', function (): void {
        $model = (string) file_get_contents(resource_path('js/lib/data/asset-model.ts'));

        expect($model)->toContain("export const MOBILE_MEDIA = '" . AssetManifest::WIDE_MEDIA . "';");
        expect(AssetManifest::NARROW_MEDIA)->toBe('(max-width: 767.98px)');
    });

    it('keeps the window preload behind its breakpoint while the crop is still a placeholder', function (): void {
        $root = assetScratchDirectory();
        $manifest = assetSuppliedFixture($root, function (array $data): array {
            $data['assets']['fixture-hero-mobile']['status'] = 'placeholder';
            $data['assets']['fixture-hero-mobile']['src'] = null;

            return $data;
        });

        $light = $manifest->lcpDescriptor('fixture-hero', 'en')['light'] ?? [];

        expect($light)->toHaveCount(1);
        expect($light[0]['media'] ?? null)->toBe('(min-width: 768px)');
    });

    it('preloads nothing that is a placeholder or not a priority', function (): void {
        $root = assetScratchDirectory();
        $flipped = assetSuppliedFixture($root, function (array $data): array {
            $data['assets']['fixture-hero']['status'] = 'placeholder';
            $data['assets']['fixture-hero']['src'] = null;

            return $data;
        });
        $fixture = new AssetManifest(assetFixturePath());

        expect($flipped->lcpDescriptor('fixture-hero'))->toBeNull();
        expect($fixture->lcpDescriptor('fixture-detail'))->toBeNull();
        expect($fixture->lcpDescriptor('fixture-placeholder'))->toBeNull();
    });

    it('preloads a supplied image that a page places with priority, never a placeholder', function (): void {
        /*
         * The /ios header renders `ipad-table-browse` with `<AssetSlot priority>`
         * although its entry loads lazily elsewhere; its controller asks for the
         * preload the same way.
         */
        $fixture = new AssetManifest(assetFixturePath());
        $detail = $fixture->lcpDescriptor('fixture-detail', 'en', priority: true);

        expect($detail)->not->toBeNull()
            ->and($detail['light'])->toHaveCount(1)
            ->and($detail['light'][0])->not->toHaveKey('media')
            ->and($detail['dark'])->toBeNull();
        expect($fixture->lcpDescriptor('fixture-placeholder', 'en', priority: true))->toBeNull();
    });

    it('offers a bespoke social card only once its file exists', function (): void {
        $root = assetScratchDirectory();
        $manifest = assetSuppliedFixture($root);

        expect($manifest->ogCard('fixture-og', 'vi'))->toBeNull();

        assetInstallFiles($manifest);

        expect($manifest->ogCard('fixture-og', 'vi'))->toBe('/og/fixture/fixture-og-vi.png');
        expect($manifest->ogCard('fixture-og', 'en'))->toBe('/og/fixture/fixture-og-en.png');
        expect($manifest->ogCard('fixture-hero', 'en'))->toBeNull();

        /*
         * The real card: offered exactly when the committed entry is
         * supplied, since its files are committed with it
         * (Seo/BespokeOgCardTest).
         */
        $real = new AssetManifest();

        foreach (['en', 'vi'] as $locale) {
            $path = $locale === Locales::default() ? '/og.png' : "/og/bespoke/og-site-{$locale}.png";
            expect($real->ogCard('og-site', $locale))->toBe($real->isSupplied('og-site') ? $path : null);
        }
    });
});

/*
 * End to end: what a visitor's browser receives. The component tests prove
 * the renderer never emits an image request for a placeholder; this proves
 * no page wraps one around it.
 */
it('serves no image request inside a placeholder on any page', function (): void {
    requireSsr();
    Http::fake([
        'api.github.com/*' => Http::response(null, 404),
        'github.com/*' => Http::response(null, 404),
        'raw.githubusercontent.com/*' => Http::response(null, 404),
    ]);

    $paths = [];

    foreach ((new AssetManifest())->assets() as $entry) {
        foreach ($entry['slot'] ? $entry['usedOn'] : [] as $use) {
            $paths[$use['path']] = true;

            if (! str_starts_with($use['path'], '/blog/')) {
                $paths[rtrim('/vi' . $use['path'], '/')] = true;
            }
        }
    }

    $found = 0;

    foreach (array_keys($paths) as $path) {
        $response = $this->get($path);

        if ($response->getStatusCode() !== 200) {
            continue;
        }

        $document = HTMLDocument::createFromString((string) $response->getContent(), LIBXML_NOERROR);

        foreach ($document->querySelectorAll('[data-asset-status="placeholder"]') as $placeholder) {
            $found++;
            $id = $placeholder->getAttribute('data-asset-id');

            Assert::assertCount(0, $placeholder->querySelectorAll('img, picture, source'), "{$path}: placeholder {$id} holds an image element");
            Assert::assertStringNotContainsString('background-image', (string) $placeholder->getAttribute('style'), "{$path}: placeholder {$id} sets a background image");
            Assert::assertStringNotContainsString('url(', $placeholder->innerHTML, "{$path}: placeholder {$id} can request a file");
        }
    }

    /* Under REQUIRE_SSR a skip here would be green; finding nothing means the selector or the markup changed. */
    Assert::assertGreaterThan(0, $found, 'No page renders an AssetSlot placeholder');
})->group('ssr');
