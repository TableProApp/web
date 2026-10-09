<?php

namespace App\Console\Commands;

use App\Support\Assets\AssetManifest;
use App\Support\Localization\Locales;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('assets:generate
    {--check : Check bundled catalogs without writing files}
    {--slots= : Override the bundled slot data path}')]
#[Description('Generate frontend asset catalogs from resources/data/assets.json.')]
class GenerateAssetCatalogsCommand extends Command
{
    public function handle(AssetManifest $manifest): int
    {
        $slots = (string) ($this->option('slots') ?: 'resources/js/lib/data/asset-slots.json');
        $files = [$slots => $manifest->slotProjectionJson()];

        foreach (Locales::codes() as $locale) {
            $files[dirname($slots) . '/asset-locales/' . $locale . '.json'] = $manifest->slotTextProjectionJson($locale);
        }

        $stale = false;

        foreach ($files as $relative => $contents) {
            $path = str_starts_with($relative, '/') ? $relative : base_path($relative);

            if ($this->option('check')) {
                if (! is_file($path) || file_get_contents($path) !== $contents) {
                    $this->components->error("{$relative} is out of date. Run: php artisan assets:generate");
                    $stale = true;
                } else {
                    $this->components->info("{$relative} is up to date.");
                }

                continue;
            }

            if (! is_dir(dirname($path))) {
                mkdir(dirname($path), 0755, true);
            }

            file_put_contents($path, $contents);
            $this->components->info("Wrote {$relative}.");
        }

        return $stale ? self::FAILURE : self::SUCCESS;
    }
}
