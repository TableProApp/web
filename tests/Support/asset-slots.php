<?php

use App\Support\Assets\AssetManifest;

// A placeholder renders its id in data-asset-id; a supplied slot renders only its
// file. Selects whichever form the manifest is in, so a test survives the owner
// supplying the file.
function renderedSlotSelector(string $id, string $locale = 'en'): string
{
    $manifest = new AssetManifest();

    if (! $manifest->isSupplied($id)) {
        return "[data-asset-id=\"{$id}\"]";
    }

    [$themed, $fileLocale] = $manifest->themedSources($id, $locale) ?? [[], null];
    $source = $themed['light'] ?? $themed['dark'];
    $variant = isset($themed['light']) ? 'light' : 'dark';
    $width = max([...$source['widths'], 0]);
    $url = $manifest->fileUrl($id, $variant, $fileLocale, $width > 0 ? $width : null, $source['formats'][array_key_last($source['formats'])]);
    $figure = 'figure[data-asset-status="supplied"]';

    return "{$figure} img[src=\"{$url}\"], {$figure} source[srcset*=\"{$url}\"]";
}
