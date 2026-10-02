<?php

namespace App\Support\Content;

use Illuminate\Support\Facades\File;
use InvalidArgumentException;
use JsonException;

/**
 * Reads the per-locale page copy under `resources/data/content/{locale}/`.
 *
 * One locale per response: a controller asks for `home` in `vi` and gets the
 * Vietnamese file or an exception. There is deliberately **no fallback to
 * English**. A Vietnamese page that silently rendered English copy is exactly
 * the pseudo-translation the rebuild exists to prevent, so a missing file is a
 * bug that has to surface, not a gap to paper over.
 *
 * Whether a page renders in a locale at all is the registry's question
 * (`App\Support\Seo\PageRegistry`), which asks `has()`.
 */
final class ContentRepository
{
    /**
     * @var array<string, array<string, mixed>>
     */
    private array $decoded = [];

    public function __construct(
        private readonly string $directory,
    ) {}

    /**
     * A page's copy in one locale, e.g. `page('home', 'vi')` or `page('features/index', 'en')`.
     *
     * @return array<string, mixed>
     *
     * @throws ContentMissingException
     */
    public function page(string $name, string $locale): array
    {
        $path = $this->path($name, $locale);

        if (! File::isFile($path)) {
            throw ContentMissingException::for($name, $locale);
        }

        return $this->decode($path);
    }

    public function has(string $name, string $locale): bool
    {
        return File::isFile($this->path($name, $locale));
    }

    /**
     * One entry of a family, e.g. `entry('databases', 'mysql-client', 'vi')`.
     *
     * @return array<string, mixed>|null
     */
    public function entry(string $family, string $slug, string $locale): ?array
    {
        $name = $family . '/' . $slug;

        return $this->has($name, $locale) ? $this->decode($this->path($name, $locale)) : null;
    }

    /**
     * The slugs a family has in a locale, without its `index` file, sorted.
     *
     * @return list<string>
     */
    public function slugs(string $family, string $locale): array
    {
        $this->assertSegment($family);
        $this->assertSegment($locale);

        $slugs = array_map(
            static fn(string $file): string => pathinfo($file, PATHINFO_FILENAME),
            File::glob($this->directory . '/' . $locale . '/' . $family . '/*.json') ?: [],
        );

        $slugs = array_values(array_filter($slugs, static fn(string $slug): bool => $slug !== 'index'));
        sort($slugs);

        return $slugs;
    }

    /**
     * The absolute path of a content file. Names are one or two kebab-case segments.
     */
    public function path(string $name, string $locale): string
    {
        $this->assertSegment($locale);

        if (preg_match('#^[a-z0-9-]+(/[a-z0-9-]+)?$#', $name) !== 1) {
            throw new InvalidArgumentException("Invalid content name [{$name}].");
        }

        return $this->directory . '/' . $locale . '/' . $name . '.json';
    }

    /**
     * @return array<string, mixed>
     */
    private function decode(string $path): array
    {
        if (array_key_exists($path, $this->decoded)) {
            return $this->decoded[$path];
        }

        try {
            $data = json_decode((string) File::get($path), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $e) {
            throw new ContentMissingException("{$path} is not valid JSON: {$e->getMessage()}", previous: $e);
        }

        if (! is_array($data)) {
            throw new ContentMissingException("{$path} must hold a JSON object.");
        }

        return $this->decoded[$path] = $data;
    }

    private function assertSegment(string $segment): void
    {
        if (preg_match('/^[a-z0-9-]+$/', $segment) !== 1) {
            throw new InvalidArgumentException("Invalid content path segment [{$segment}].");
        }
    }
}
