<?php

namespace App\Console\Commands;

use App\Support\Assets\AssetManifest;
use App\Support\Assets\HandoffDocument;
use App\Support\Localization\Locales;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * Writes `docs/visual-assets.md`, the owner's image handoff, from the asset
 * manifest and the brief fragments in `docs/rebuild/assets/` (architecture
 * §1.9). The document is generated, never edited by hand.
 *
 * It also writes `resources/js/lib/data/asset-slots.json`, the slice of the
 * geometry the browser bundle carries (`AssetManifest::slotProjection()`), and
 * `asset-locales/{locale}.json` for each language's rendering text, so
 * the one command the handoff already asks for after a manifest edit is the
 * only one needed.
 *
 * `--check` writes nothing and exits non-zero when any committed file
 * differs from what the sources would produce, so a manifest or fragment
 * edit cannot ship with a stale handoff or a stale bundle. Incomplete briefs
 * are reported but do not fail the run: they are rendered as "no brief yet"
 * so the document is useful while the family briefs are being written.
 */
#[Signature('assets:handoff
    {--check : Exit non-zero if a generated file is out of date instead of writing it}
    {--output= : Write the document here instead of docs/visual-assets.md (relative to the project root)}
    {--slots= : Write the bundled slot data here instead of resources/js/lib/data/asset-slots.json (relative to the project root)}')]
#[Description('Generate docs/visual-assets.md and the bundled slot data from resources/data/assets.json and docs/rebuild/assets/*.md.')]
class GenerateAssetHandoffCommand extends Command
{
    public const DEFAULT_OUTPUT = 'docs/visual-assets.md';

    public const DEFAULT_SLOTS = 'resources/js/lib/data/asset-slots.json';

    public function handle(HandoffDocument $document, AssetManifest $manifest): int
    {
        $files = [
            (string) ($this->option('output') ?: self::DEFAULT_OUTPUT) => $document->render(),
            (string) ($this->option('slots') ?: self::DEFAULT_SLOTS) => $manifest->slotProjectionJson(),
        ];

        foreach (Locales::codes() as $locale) {
            $path = dirname((string) ($this->option('slots') ?: self::DEFAULT_SLOTS)) . '/asset-locales/' . $locale . '.json';
            $files[$path] = $manifest->slotTextProjectionJson($locale);
        }
        $problems = $document->problems();

        if ($this->option('check')) {
            $stale = false;

            foreach ($files as $relative => $contents) {
                $path = $this->absolute($relative);

                if (! is_file($path) || file_get_contents($path) !== $contents) {
                    $this->components->error("{$relative} is out of date. Run: php artisan assets:handoff");
                    $stale = true;

                    continue;
                }

                $this->components->info("{$relative} is up to date.");
            }

            $this->reportProblems($problems);

            return $stale ? self::FAILURE : self::SUCCESS;
        }

        foreach ($files as $relative => $contents) {
            $path = $this->absolute($relative);

            if (! is_dir(dirname($path))) {
                mkdir(dirname($path), 0755, true);
            }

            file_put_contents($path, $contents);
            $this->components->info("Wrote {$relative}.");
        }

        $this->reportProblems($problems);

        return self::SUCCESS;
    }

    private function absolute(string $relative): string
    {
        return str_starts_with($relative, '/') ? $relative : base_path($relative);
    }

    /**
     * @param  list<string>  $problems
     */
    private function reportProblems(array $problems): void
    {
        if ($problems === []) {
            return;
        }

        $this->components->warn(count($problems) . ' brief problem(s). An asset with no section shows "Chưa có brief"; a partial one shows what it has:');

        foreach (array_slice($problems, 0, 20) as $problem) {
            $this->line("  - {$problem}");
        }

        if (count($problems) > 20) {
            $this->line('  … and ' . (count($problems) - 20) . ' more.');
        }
    }
}
