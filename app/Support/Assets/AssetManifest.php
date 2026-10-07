<?php

namespace App\Support\Assets;

use App\Support\Localization\Locales;
use Illuminate\Container\Attributes\Scoped;
use JsonException;
use RuntimeException;

/**
 * The public site's visual asset manifest, `resources/data/assets.json`.
 *
 * One file holds every editorial image slot and every bespoke social card
 * (architecture §1.9). `kinds` pins geometry and export rules once per kind
 * (design-system §6.3); `assets` holds one entry per id. Each entry's
 * `status` is the only switch between the placeholder and the supplied image,
 * so the owner activates final art with one manifest edit and the files.
 *
 * Files are named `{replacement.dir}/{base}-{light|dark}[-{locale}]-{width}.{format}`.
 * A vector drops the width; a social card is `{base}-{locale}.png`. The same
 * rule lives in `resources/js/lib/data/asset-model.ts`, and both are held to
 * `tests/Fixtures/assets/manifest.json`.
 *
 * @phpstan-type Source array{widths: list<int>, formats: list<string>, width: int, height: int}
 * @phpstan-type ThemedSources array{light: Source, dark?: Source|null}
 * @phpstan-type Kind array{type: string, aspect: ?string, rendered: ?array<string, ?array{0: int, 1: ?int}>, exportPx: ?array{0: int, 1: ?int}, vector: bool, density: ?int, format: array{master: string, delivered: list<string>}, transparency: bool|string, maxBytes: int, widths: list<int>, sizes: ?string, note?: string}
 * @phpstan-type Entry array{kind: string, type: string, family: string, ownerRepo: string, slot: bool, handoffPriority: string, usedOn: list<array{path: string, section: string}>, aspect: ?string, priority: bool, theme: string, locale: string, mobile: ?string, description: array<string, ?string>, alt: array<string, ?string>, caption: ?array<string, ?string>, replacement: array{dir: string, base: string}, status: string, src: ?array<string, mixed>, legacySource: string|list<string>|null}
 * @phpstan-type Preload array{srcset: string, sizes: string, type: string, media?: string}
 *
 * Scoped, so the file is decoded once per request however many callers ask.
 */
#[Scoped]
final class AssetManifest
{
    public const STATUSES = ['placeholder', 'supplied'];

    /**
     * Where a window shows itself rather than its phone crop. Equal to
     * `MOBILE_MEDIA` in `resources/js/lib/data/asset-model.ts`.
     */
    public const WIDE_MEDIA = '(min-width: 768px)';

    /**
     * The complement of `WIDE_MEDIA`: where the phone crop is the image shown.
     */
    public const NARROW_MEDIA = '(max-width: 767.98px)';

    /**
     * @var array{kinds: array<string, Kind>, assets: array<string, Entry>}|null
     */
    private ?array $data = null;

    /**
     * @param  string|null  $path  the manifest file; the real one by default
     * @param  string|null  $basePath  the directory `replacement.dir` is relative to; the app root by default
     */
    public function __construct(
        private readonly ?string $path = null,
        private readonly ?string $basePath = null,
    ) {}

    public function path(): string
    {
        return $this->path ?? resource_path('data/assets.json');
    }

    /**
     * @return array<string, Kind>
     */
    public function kinds(): array
    {
        return $this->data()['kinds'];
    }

    /**
     * Every entry, keyed by id, in file order.
     *
     * @return array<string, Entry>
     */
    public function assets(): array
    {
        return $this->data()['assets'];
    }

    public function has(string $id): bool
    {
        return array_key_exists($id, $this->assets());
    }

    /**
     * @return Entry
     */
    public function entry(string $id): array
    {
        $assets = $this->assets();

        if (! array_key_exists($id, $assets)) {
            throw new RuntimeException("Unknown asset id [{$id}] in {$this->path()}.");
        }

        return $assets[$id];
    }

    /**
     * @return Kind
     */
    public function kindOf(string $id): array
    {
        $kind = $this->entry($id)['kind'];
        $kinds = $this->kinds();

        if (! array_key_exists($kind, $kinds)) {
            throw new RuntimeException("Asset [{$id}] names the unknown kind [{$kind}].");
        }

        return $kinds[$kind];
    }

    /**
     * The part of the manifest a browser needs to render `<AssetSlot>`, which
     * `assets:handoff` writes to `resources/js/lib/data/asset-slots.json` for
     * the bundle.
     *
     * The full manifest includes all languages and owner-only metadata: `usedOn`, `handoffPriority`, `legacySource`, the kinds'
     * export rules and notes. A page needs only the slot entries' render
     * fields. The active language's text is a separate projection, loaded
     * before the page renders. Bespoke social cards are not slots and are left out.
     *
     * @return array{kinds: array<string, array{type: string, aspect: ?string, sizes: ?string}>, assets: array<string, array<string, mixed>>}
     */
    public function slotProjection(): array
    {
        $kinds = [];

        foreach ($this->kinds() as $name => $kind) {
            $kinds[$name] = ['type' => $kind['type'], 'aspect' => $kind['aspect'], 'sizes' => $kind['sizes'] ?? null];
        }

        $assets = [];

        foreach ($this->assets() as $id => $entry) {
            if (! $entry['slot']) {
                continue;
            }

            $slot = [
                'kind' => $entry['kind'],
                'type' => $entry['type'],
                'slot' => true,
                'aspect' => $entry['aspect'],
                'priority' => $entry['priority'],
                'theme' => $entry['theme'],
                'locale' => $entry['locale'],
                'mobile' => $entry['mobile'],
                'status' => $entry['status'],
                'src' => $entry['src'],
                'replacement' => $entry['replacement'],
            ];

            $assets[$id] = $slot;
        }

        return ['kinds' => $kinds, 'assets' => $assets];
    }

    /**
     * Only the active language's rendering text, loaded separately from geometry.
     * English editorial assets keep their English text in every locale bundle.
     *
     * @return array<string, array<string, array<string, string>|null>>
     */
    public function slotTextProjection(string $locale): array
    {
        if (! Locales::isSupported($locale)) {
            throw new RuntimeException("Unsupported asset locale [{$locale}].");
        }

        $assets = [];

        foreach ($this->assets() as $id => $entry) {
            if (! $entry['slot']) {
                continue;
            }

            $englishOnly = collect($entry['usedOn'])->every(fn(array $use): bool => str_starts_with($use['path'], '/blog/'));
            $fields = $entry['status'] === 'supplied' ? ['alt', 'caption'] : ['description'];
            $text = [];

            foreach ($fields as $field) {
                if ($entry[$field] === null) {
                    $text[$field] = null;

                    continue;
                }

                $language = $englishOnly ? Locales::default() : $locale;
                $line = $entry[$field][$language] ?? null;

                if (! is_string($line) || trim($line) === '') {
                    throw new RuntimeException("Asset [{$id}] is missing {$field}.{$language}.");
                }

                $text[$field] = [$language => $line];
            }

            $assets[$id] = $text;
        }

        return $assets;
    }

    public function slotTextProjectionJson(string $locale): string
    {
        return json_encode($this->slotTextProjection($locale), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR) . "\n";
    }

    /**
     * `slotProjection()` as the bytes of `asset-slots.json`.
     */
    public function slotProjectionJson(): string
    {
        return json_encode($this->slotProjection(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR) . "\n";
    }

    public function isSupplied(string $id): bool
    {
        return $this->entry($id)['status'] === 'supplied' && $this->entry($id)['src'] !== null;
    }

    /**
     * The `lcpAsset` page prop that `app.blade.php` turns into
     * `<link rel=preload as=image>` tags for the theme its head script resolved.
     *
     * Exactly `{light: list<{srcset, sizes, type, media?}>, dark: list<…> | null}`:
     * one list per theme, one preload per image the viewport can show. A
     * window with a phone crop renders as one art-directed `<picture>`
     * (`resources/js/lib/data/asset-model.ts`): the window behind
     * `<source media="(min-width: 768px)">` and the crop as the `<img>` below
     * it. So its list holds the window with that media query and the crop with
     * the complementary one, each with its own kind's `sizes`, and a phone
     * preloads the crop it shows instead of the window it never paints. An
     * image with no crop is one item with no `media`.
     *
     * Null for a placeholder (it requests nothing, so there is nothing to
     * preload) and for an image that is not marked `priority`, which loads
     * lazily, unless the page passes `$priority`: a placement that renders an
     * entry with priority although the entry is not the homepage hero (the
     * /ios header, `<AssetSlot priority>`).
     *
     * Each srcset is the first delivered format's, with its MIME type, because
     * that is the `<source>` the browser picks in `<picture>`. A browser that
     * cannot decode it skips the preload and loses nothing.
     *
     * `$sizes` is the placement's own `sizes` when it overrides the kind's
     * (`<AssetSlot sizes>`), and applies to the main image only, as it does in
     * `asset-model.ts`; the phone crop keeps its kind's. A preload whose
     * `sizes` differs from the `<img>` it stands for can choose another srcset
     * candidate, and the reader downloads both.
     *
     * @return array{light: list<Preload>, dark: list<Preload>|null}|null
     */
    public function lcpDescriptor(string $id, ?string $locale = null, bool $priority = false, ?string $sizes = null): ?array
    {
        $entry = $this->entry($id);

        if ((! $entry['priority'] && ! $priority) || ! $this->isSupplied($id)) {
            return null;
        }

        $locale ??= app()->getLocale();
        $resolved = $this->themedSources($id, $locale);

        if ($resolved === null) {
            return null;
        }

        $crop = $entry['mobile'] !== null && $this->has($entry['mobile']) ? $entry['mobile'] : null;
        $cropResolved = $crop !== null ? $this->themedSources($crop, $locale) : null;
        $themed = $entry['theme'] === 'both' && is_array($resolved[0]['dark'] ?? null);

        $describe = function (string $variant) use ($id, $resolved, $crop, $cropResolved, $sizes): array {
            $preloads = [$this->preload($id, $resolved, $variant, $crop !== null ? self::WIDE_MEDIA : null, $sizes)];

            if ($crop !== null && $cropResolved !== null) {
                $preloads[] = $this->preload($crop, $cropResolved, $variant, self::NARROW_MEDIA);
            }

            return $preloads;
        };

        return [
            'light' => $describe('light'),
            'dark' => $themed ? $describe('dark') : null,
        ];
    }

    /**
     * One preload for one image in one theme. A theme the image lacks falls
     * back to its light file, as `<AssetSlot>` does.
     *
     * @param  array{0: ThemedSources, 1: ?string}  $resolved
     * @return Preload
     */
    private function preload(string $id, array $resolved, string $variant, ?string $media, ?string $sizes = null): array
    {
        [$sources, $fileLocale] = $resolved;
        $chosen = $variant === 'dark' && is_array($sources['dark'] ?? null) ? 'dark' : 'light';
        $source = $sources[$chosen];
        $format = $source['formats'][0];

        $preload = [
            'srcset' => $this->srcset($id, $source, $chosen, $fileLocale, $format),
            'sizes' => $sizes ?? (string) ($this->kindOf($id)['sizes'] ?? ''),
            'type' => self::mimeType($format),
        ];

        if ($media !== null) {
            $preload['media'] = $media;
        }

        return $preload;
    }

    /**
     * The URL of a supplied bespoke social card for a locale, or null while the
     * generated template card is still the right one to use.
     */
    public function ogCard(string $id, string $locale): ?string
    {
        if (! $this->has($id) || $this->entry($id)['kind'] !== 'og-card' || ! $this->isSupplied($id)) {
            return null;
        }

        $resolved = $this->themedSources($id, $locale);

        if ($resolved === null || $resolved[1] !== $locale) {
            return null;
        }

        $url = $this->fileUrl($id, 'light', $locale, 1200, 'png');

        return is_file($this->absolute($url)) ? $url : null;
    }

    /**
     * The sources for a locale and the locale the files carry (null when the
     * entry is shared between locales).
     *
     * @return array{0: ThemedSources, 1: ?string}|null
     */
    public function themedSources(string $id, string $locale): ?array
    {
        $entry = $this->entry($id);
        $src = $entry['src'];

        if ($entry['status'] !== 'supplied' || ! is_array($src)) {
            return null;
        }

        if ($entry['locale'] === 'per-locale') {
            $chosen = is_array($src[$locale] ?? null) ? $locale : Locales::default();

            return is_array($src[$chosen] ?? null) ? [$src[$chosen], $chosen] : null;
        }

        return [$src, null];
    }

    /**
     * A file's URL, rooted at the public directory.
     */
    public function fileUrl(string $id, string $variant, ?string $locale, ?int $width, string $format): string
    {
        $entry = $this->entry($id);
        $dir = '/' . trim((string) preg_replace('#^public/?#', '', $entry['replacement']['dir']), '/');
        $base = $entry['replacement']['base'];

        if ($entry['kind'] === 'og-card') {
            return "{$dir}/{$base}-" . ($locale ?? Locales::default()) . ".{$format}";
        }

        $parts = [$base, $variant];

        if ($locale !== null) {
            $parts[] = $locale;
        }

        if ($format !== 'svg' && $width !== null) {
            $parts[] = (string) $width;
        }

        return $dir . '/' . implode('-', $parts) . '.' . $format;
    }

    /**
     * `…-720.avif 720w, …-1216.avif 1216w`, ascending, or the bare URL for a vector.
     *
     * @param  Source  $source
     */
    public function srcset(string $id, array $source, string $variant, ?string $locale, string $format): string
    {
        if ($format === 'svg') {
            return $this->fileUrl($id, $variant, $locale, null, $format);
        }

        $widths = $source['widths'];
        sort($widths);

        return implode(', ', array_map(
            fn(int $width): string => $this->fileUrl($id, $variant, $locale, $width, $format) . " {$width}w",
            $widths,
        ));
    }

    /**
     * Every file a supplied entry promises, with what each must measure.
     *
     * @return list<array{url: string, variant: string, locale: ?string, format: string, width: ?int, height: ?int}>
     */
    public function expectedFiles(string $id): array
    {
        $entry = $this->entry($id);
        $src = $entry['src'];

        if ($entry['status'] !== 'supplied' || ! is_array($src)) {
            return [];
        }

        $sets = $entry['locale'] === 'per-locale'
            ? array_map(null, array_values($src), array_keys($src))
            : [[$src, null]];

        $files = [];

        foreach ($sets as [$themed, $locale]) {
            if (! is_array($themed)) {
                continue;
            }

            foreach (['light', 'dark'] as $variant) {
                $source = $themed[$variant] ?? null;

                if (! is_array($source)) {
                    continue;
                }

                foreach ($source['formats'] ?? [] as $format) {
                    if ($format === 'svg') {
                        $files[] = [
                            'url' => $this->fileUrl($id, $variant, $locale, null, $format),
                            'variant' => $variant,
                            'locale' => $locale,
                            'format' => $format,
                            'width' => null,
                            'height' => null,
                        ];

                        continue;
                    }

                    foreach ($source['widths'] ?? [] as $width) {
                        $files[] = [
                            'url' => $this->fileUrl($id, $variant, $locale, (int) $width, $format),
                            'variant' => $variant,
                            'locale' => is_string($locale) ? $locale : null,
                            'format' => $format,
                            'width' => (int) $width,
                            'height' => (int) round($width * $source['height'] / max(1, $source['width'])),
                        ];
                    }
                }
            }
        }

        return $files;
    }

    /**
     * What is wrong with the supplied entries, against the files on disk.
     *
     * A placeholder is never checked against disk: it has no files. A supplied
     * entry must name sources for every locale and theme it declares, in
     * formats its kind delivers, in the kind's shape, and every promised file
     * must exist at its true pixel size and within the kind's byte budget. A
     * light and dark pair share their dimensions, and a window is never
     * supplied before its phone crop.
     *
     * @return list<string>
     */
    public function problems(): array
    {
        $problems = [];

        foreach ($this->assets() as $id => $entry) {
            if ($entry['status'] !== 'supplied') {
                continue;
            }

            $problems = [...$problems, ...$this->suppliedProblems($id, $entry)];
        }

        return $problems;
    }

    /**
     * @param  Entry  $entry
     * @return list<string>
     */
    private function suppliedProblems(string $id, array $entry): array
    {
        $problems = [];
        $kind = $this->kindOf($id);
        $src = $entry['src'];

        if (! is_array($src)) {
            return ["{$id} is supplied but has no src."];
        }

        if ($entry['mobile'] !== null && (! $this->has($entry['mobile']) || $this->entry($entry['mobile'])['status'] !== 'supplied')) {
            $problems[] = "{$id} is supplied before its phone crop {$entry['mobile']}.";
        }

        $sets = $entry['locale'] === 'per-locale' ? $src : ['shared' => $src];

        if ($entry['locale'] === 'per-locale') {
            foreach (Locales::codes() as $code) {
                if (! is_array($src[$code] ?? null)) {
                    $problems[] = "{$id} is per-locale but has no {$code} sources.";
                }
            }
        }

        $aspect = $entry['aspect'] ?? $kind['aspect'];

        foreach ($sets as $label => $themed) {
            if (! is_array($themed) || ! is_array($themed['light'] ?? null)) {
                $problems[] = "{$id} ({$label}) has no light sources.";

                continue;
            }

            $dark = $themed['dark'] ?? null;

            if ($entry['theme'] === 'both' && ! is_array($dark)) {
                $problems[] = "{$id} ({$label}) is themed but has no dark sources.";
            }

            if ($entry['theme'] === 'single' && is_array($dark)) {
                $problems[] = "{$id} ({$label}) is single-theme but lists dark sources.";
            }

            if (is_array($dark) && [$dark['width'], $dark['height'], $dark['widths']] !== [$themed['light']['width'], $themed['light']['height'], $themed['light']['widths']]) {
                $problems[] = "{$id} ({$label}) has light and dark sources of different sizes.";
            }

            foreach (array_filter(['light' => $themed['light'], 'dark' => $dark], 'is_array') as $variant => $source) {
                $problems = [...$problems, ...$this->sourceProblems("{$id} ({$label}, {$variant})", $source, $kind, $aspect)];
            }
        }

        foreach ($this->expectedFiles($id) as $file) {
            $absolute = $this->absolute($file['url']);

            if (! is_file($absolute)) {
                $problems[] = "{$id}: {$file['url']} is missing.";

                continue;
            }

            $bytes = (int) filesize($absolute);

            if ($bytes > $kind['maxBytes']) {
                $problems[] = "{$id}: {$file['url']} is {$bytes} bytes, over the {$kind['maxBytes']} budget.";
            }

            if ($file['width'] === null) {
                continue;
            }

            $size = @getimagesize($absolute);

            if ($size === false) {
                $problems[] = "{$id}: {$file['url']} is not a readable image.";

                continue;
            }

            if ($size[0] !== $file['width'] || abs($size[1] - (int) $file['height']) > 1) {
                $problems[] = "{$id}: {$file['url']} is {$size[0]}x{$size[1]}, not {$file['width']}x{$file['height']}.";
            }
        }

        return $problems;
    }

    /**
     * @param  array<string, mixed>  $source
     * @param  Kind  $kind
     * @return list<string>
     */
    private function sourceProblems(string $label, array $source, array $kind, ?string $aspect): array
    {
        $problems = [];
        $formats = $source['formats'] ?? [];
        $widths = $source['widths'] ?? [];

        if (! is_array($formats) || $formats === [] || array_diff($formats, $kind['format']['delivered']) !== []) {
            $problems[] = "{$label} lists formats its kind does not deliver.";
        }

        if (! is_int($source['width'] ?? null) || ! is_int($source['height'] ?? null) || $source['width'] <= 0 || $source['height'] <= 0) {
            return [...$problems, "{$label} needs an integer width and height."];
        }

        if ($kind['vector']) {
            if ($widths !== []) {
                $problems[] = "{$label} is a vector and takes no widths.";
            }
        } elseif (! is_array($widths) || $widths === [] || max($widths) !== $source['width']) {
            $problems[] = "{$label} must list widths whose largest is its width ({$source['width']}).";
        }

        if ($aspect !== null) {
            [$w, $h] = array_map('floatval', explode(':', $aspect));
            $expected = $w / $h;
            $actual = $source['width'] / $source['height'];

            if (abs($actual - $expected) / $expected > 0.01) {
                $problems[] = sprintf('%s is %.3f wide per unit of height; its aspect %s is %.3f.', $label, $actual, $aspect, $expected);
            }
        }

        return $problems;
    }

    public static function mimeType(string $format): string
    {
        return $format === 'svg' ? 'image/svg+xml' : "image/{$format}";
    }

    /**
     * The file behind a public URL: under the application's public directory,
     * or under `{basePath}/public` for a manifest given its own base.
     */
    public function absolute(string $url): string
    {
        if ($this->basePath === null) {
            return public_path(ltrim($url, '/'));
        }

        return rtrim($this->basePath, '/') . '/public/' . ltrim($url, '/');
    }

    /**
     * @return array{kinds: array<string, Kind>, assets: array<string, Entry>}
     */
    private function data(): array
    {
        if ($this->data !== null) {
            return $this->data;
        }

        $path = $this->path();

        try {
            $decoded = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $e) {
            throw new RuntimeException("{$path} is not valid JSON: {$e->getMessage()}", previous: $e);
        }

        if (! is_array($decoded) || ! is_array($decoded['kinds'] ?? null) || ! is_array($decoded['assets'] ?? null)) {
            throw new RuntimeException("{$path} must hold `kinds` and `assets`.");
        }

        /** @var array{kinds: array<string, Kind>, assets: array<string, Entry>} $decoded */
        return $this->data = $decoded;
    }
}
