<?php

use App\Support\Assets\AssetManifest;
use Illuminate\Support\Facades\File;

it('serves every image the frontend or the asset manifest names', function (): void {
    $referenced = [];

    foreach (File::allFiles(resource_path('js')) as $file) {
        if (in_array($file->getExtension(), ['ts', 'tsx'], true)) {
            preg_match_all('#/images/[A-Za-z0-9@._/-]+\.(?:png|webp|jpe?g|svg|avif)#', $file->getContents(), $matches);

            foreach ($matches[0] as $path) {
                $referenced[$path] ??= $file->getRelativePathname();
            }
        }
    }

    foreach ((new AssetManifest())->assets() as $id => $entry) {
        foreach ((array) ($entry['legacySource'] ?? []) as $path) {
            $referenced[$path] ??= "assets.json ({$id})";
        }
    }

    expect($referenced)->not->toBeEmpty();

    foreach ($referenced as $path => $source) {
        expect(public_path(ltrim($path, '/')))->toBeFile("{$path} referenced by {$source}");
    }
});
