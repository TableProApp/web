<?php

namespace App\Support\Seo;

use App\Support\Localization\Locales;
use Carbon\CarbonImmutable;
use Symfony\Component\Process\Process;
use Throwable;

// The sitemap's lastmod: the last commit touching a page's sources. Mtimes are
// only a fallback, since every `git pull` on the server resets them.
final class LastModified
{
    private const GIT_TIMEOUT = 10.0;

    /**
     * @var array<string, array{0: int, 1: string}>|null path => [unix time, ISO 8601] of its last commit
     */
    private ?array $commits = null;

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
        if ($paths === []) {
            return null;
        }

        $this->commits ??= $this->readGitLog();
        $newest = null;

        foreach (array_unique($paths) as $path) {
            $commit = $this->commits[$path] ?? null;

            if ($commit !== null && ($newest === null || $commit[0] > $newest[0])) {
                $newest = $commit;
            }
        }

        return $newest !== null ? CarbonImmutable::parse($newest[1]) : $this->fromMtime($paths);
    }

    /**
     * The sources that drive a page in one locale: shared data, plus the files
     * under a directory named after that locale. A post directly under
     * `resources/blog/` belongs to the default locale.
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
     * @return array<string, array{0: int, 1: string}>
     */
    private function readGitLog(): array
    {
        try {
            $process = new Process(
                ['git', '-c', 'core.quotePath=false', 'log', '--format=%x00%ct %cI', '--name-only', '--relative'],
                $this->root,
                null,
                null,
                self::GIT_TIMEOUT,
            );
            $process->run();
        } catch (Throwable) {
            return [];
        }

        if (! $process->isSuccessful()) {
            return [];
        }

        $commits = [];
        $commit = null;

        foreach (explode("\n", $process->getOutput()) as $line) {
            if (str_starts_with($line, "\0")) {
                [$time, $iso] = explode(' ', substr($line, 1), 2);
                $commit = [(int) $time, $iso];
            } elseif ($line !== '' && $commit !== null && (! isset($commits[$line]) || $commit[0] > $commits[$line][0])) {
                $commits[$line] = $commit;
            }
        }

        return $commits;
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
