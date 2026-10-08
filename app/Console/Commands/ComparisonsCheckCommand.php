<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

/**
 * Says which facts in `resources/data/comparisons.json` need a second look.
 *
 * Run by hand, like `release:check`. For each product it reports:
 *
 * - how long ago it was checked, STALE past `--max-age` days;
 * - for a product whose last release cites a GitHub releases page, the latest
 *   release there against `status.lastRelease`, DRIFT when they differ.
 *
 * Prices, editions and features have no feed to compare with: a STALE row is
 * the prompt to re-read that product's sources. It exits non-zero on any
 * STALE, DRIFT or UNREADABLE row.
 */
#[Signature('comparisons:check {--max-age=30 : Days after which a product\'s check is stale}')]
#[Description('List the compared products checked too long ago, and compare their last release with GitHub.')]
class ComparisonsCheckCommand extends Command
{
    private const TIMEOUT_SECONDS = 10;

    private const OK = 'ok';

    private const STALE = 'STALE';

    private const DRIFT = 'DRIFT';

    private const UNREADABLE = 'UNREADABLE';

    public function handle(): int
    {
        $path = resource_path('data/comparisons.json');
        $data = File::isFile($path) ? json_decode((string) File::get($path), true) : null;
        $products = is_array($data['products'] ?? null) ? $data['products'] : [];

        if ($products === []) {
            $this->components->error('resources/data/comparisons.json has no products.');

            return self::FAILURE;
        }

        $maxAge = max(0, (int) $this->option('max-age'));
        $today = Carbon::today();
        $rows = [];

        foreach ($products as $product) {
            if (! is_array($product) || ! is_string($product['id'] ?? null)) {
                continue;
            }

            $id = $product['id'];
            $checkedAt = is_string($product['checkedAt'] ?? null) ? $product['checkedAt'] : null;
            $age = $checkedAt !== null ? (int) Carbon::parse($checkedAt)->diffInDays($today) : null;

            $rows[] = [$id, 'checked', $checkedAt ?? '—', $age !== null ? "{$age} days ago" : '—', $age !== null && $age <= $maxAge ? self::OK : self::STALE];

            $repository = $this->releaseRepository($product);

            if ($repository === null) {
                continue;
            }

            $recorded = $product['status']['lastRelease'];
            $latest = $this->latestRelease($repository);

            $rows[] = [$id, 'release', (string) $recorded['version'], $latest['version'] ?? '—', $this->compare((string) $recorded['version'], $latest['version'] ?? null)];
            $rows[] = [$id, 'released', (string) $recorded['date'], $latest['date'] ?? '—', $this->compare((string) $recorded['date'], $latest['date'] ?? null)];
        }

        $this->table(['Product', 'Field', 'comparisons.json', 'Now', 'Result'], $rows);

        $failures = array_filter($rows, fn(array $row): bool => $row[4] !== self::OK);

        if ($failures !== []) {
            $this->components->error(count($failures) . ' fact(s) in resources/data/comparisons.json are stale, differ from GitHub or could not be read.');

            return self::FAILURE;
        }

        $this->components->info("Every product was checked within {$maxAge} days and matches its GitHub releases.");

        return self::SUCCESS;
    }

    /**
     * `owner/repo` when the product's last release cites a GitHub releases page.
     *
     * @param  array<string, mixed>  $product
     */
    private function releaseRepository(array $product): ?string
    {
        $sourceId = $product['status']['lastRelease']['source'] ?? null;
        $source = collect($product['sources'] ?? [])->firstWhere('id', $sourceId);

        if (! is_array($source) || preg_match('#^https://github\.com/([^/]+/[^/]+)/releases/?$#', (string) ($source['url'] ?? ''), $matches) !== 1) {
            return null;
        }

        return $matches[1];
    }

    /**
     * @return array{version: string, date: string}|null
     */
    private function latestRelease(string $repository): ?array
    {
        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->withHeaders(['Accept' => 'application/vnd.github+json', 'X-GitHub-Api-Version' => '2022-11-28'])
                ->get("https://api.github.com/repos/{$repository}/releases/latest");
        } catch (\Throwable) {
            return null;
        }

        $tag = $response->ok() ? $response->json('tag_name') : null;
        $published = $response->ok() ? $response->json('published_at') : null;

        // Tags vary: `v6.1.6`, `production/6.0.2-20115`, `release-1.1.2`. The version is the first dotted number.
        if (! is_string($tag) || ! is_string($published) || preg_match('/\d+(?:\.\d+)+/', $tag, $matches) !== 1) {
            return null;
        }

        return ['version' => $matches[0], 'date' => substr($published, 0, 10)];
    }

    private function compare(string $recorded, ?string $latest): string
    {
        if ($latest === null) {
            return self::UNREADABLE;
        }

        return $recorded === $latest ? self::OK : self::DRIFT;
    }
}
