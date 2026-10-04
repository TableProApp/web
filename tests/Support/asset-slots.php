<?php

use App\Support\Assets\AssetManifest;

/*
|--------------------------------------------------------------------------
| Rendered asset slots
|--------------------------------------------------------------------------
|
| A placeholder slot carries its id in `data-asset-id`; a supplied one never
| renders the id (spec §9.1, `asset-slot-view.ts`). A test that checks a page
| renders a slot has to look for whichever form the manifest is in, or it
| fails the moment the owner supplies the file.
|
*/

/**
 * A CSS selector for the slot `$id` as the page renders it in `$locale`: the
 * placeholder's `data-asset-id`, or once supplied, the `<img>` or `<source>`
 * that names the light variant's largest file in its last format. That is the
 * file `largestUrl()` in `asset-model.ts` puts in `src`, and a window's
 * `<source>` lists it when a phone crop takes the `<img>`.
 */
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
