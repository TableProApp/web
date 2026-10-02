<?php

namespace App\Support\Seo;

use App\Support\Localization\Locales;
use Carbon\CarbonImmutable;
use Symfony\Component\Process\Process;
use Throwable;

/**
 * When the files behind a page last changed, for the sitemap's `lastmod`.
 *
 * Git first: `git log -1 --format=%cI -- <paths>` is the last commit that
 * touched any of them. File mtimes are no good on their own, because every
 * `git pull` on the server resets them to the pull time, and a sitemap whose
 * every `lastmod` moves on each deploy teaches crawlers to ignore the field.
 * The newest mtime is the fallback for a checkout without history or files not
 * committed yet, and a page with neither gets no `lastmod` at all rather than
 * a made-up "now".
 *
 * A page's sources can include other locales' copy. `forEntry()` keeps only
 * what drives the page in the locale asked for: the shared data files plus
 * that locale's own content, legal or blog file.
 */
final class LastModified
{
    /**
     * Seconds `git log` may take before the mtime fallback is used.
     */
    private const GIT_TIMEOUT = 2.0;

    /**
     * @var array<string, CarbonImmutable|null>
     */
    private array $memo = [];

    public function __construct(
        private readonly string $root,
    ) {}

    public function forEntry(PageEntry $entry, string $locale): ?CarbonImmutable
    {
        return $this->forPaths(self::sourcesFor($entry->sources, $locale));
    }

    /**
     * @param  list<string>  $paths  repository-relative
     */
    public function forPaths(array $paths): ?CarbonImmutable
    {
        $paths = array_values(array_unique($paths));
        sort($paths);

        if ($paths === []) {
            return null;
        }

        $key = implode("\0", $paths);

        if (array_key_exists($key, $this->memo)) {
            return $this->memo[$key];
        }

        return $this->memo[$key] = $this->fromGit($paths) ?? $this->fromMtime($paths);
    }

    /**
     * The sources that drive a page in one locale.
     *
     * A source belongs to a locale when one of its directories is named after
     * that locale (`content/vi/…`, `legal/en/…`, `blog/vi/…`). A post directly
     * under `resources/blog/` belongs to the default locale. Anything else is
     * shared data and drives every locale.
     *
     * @param  list<string>  $sources
     * @return list<string>
     */
    public static function sourcesFor(array $sources, string $locale): array
    {
        return array_values(array_filter(
            $sources,
            static fn(string $source): bool => in_array(self::localeOf($source), [null, $locale], true),
        ));
    }

    private static function localeOf(string $source): ?string
    {
        $directories = array_slice(explode('/', $source), 0, -1);

        foreach (Locales::codes() as $code) {
            if (in_array($code, $directories, true)) {
                return $code;
            }
        }

        return str_starts_with($source, 'resources/blog/') ? Locales::default() : null;
    }

    /**
     * @param  list<string>  $paths
     */
    private function fromGit(array $paths): ?CarbonImmutable
    {
        try {
            $process = new Process(['git', 'log', '-1', '--format=%cI', '--', ...$paths], $this->root, null, null, self::GIT_TIMEOUT);
            $process->run();

            $output = trim($process->getOutput());

            return $process->isSuccessful() && $output !== '' ? CarbonImmutable::parse($output) : null;
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * @param  list<string>  $paths
     */
    private function fromMtime(array $paths): ?CarbonImmutable
    {
        $newest = null;

        foreach ($paths as $path) {
            $absolute = str_starts_with($path, '/') ? $path : $this->root . '/' . $path;
            $mtime = is_file($absolute) ? filemtime($absolute) : false;

            if ($mtime !== false && ($newest === null || $mtime > $newest)) {
                $newest = $mtime;
            }
        }

        return $newest === null ? null : CarbonImmutable::createFromTimestamp($newest);
    }
}
