<?php

use Illuminate\Support\Facades\File;
use App\Support\Localization\Locales;

/**
 * Search titles and descriptions fit the lengths the design documents set: a
 * rendered `<title>` of 60 characters or fewer (positioning §5), and a
 * description of 155 or fewer in English (about the desktop snippet length)
 * and 160 or fewer in Vietnamese (positioning §5), so results pages do not
 * cut them off.
 *
 * The title is checked as the page renders it: with the site template where
 * the page applies it, and with `{devices}`, `{macDevices}` and `{deviceList}`
 * filled from platforms.json and engines.json the way the pages fill them.
 * Every content file with a `seo` block is covered, so a new page is too.
 */

/**
 * @return array<string, mixed>
 */
function seoLengthsJson(string $path): array
{
    return json_decode(File::get(resource_path("data/{$path}")), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @param  list<string>  $names
 */
function seoLengthsJoin(array $names, string $locale): string
{
    $catalog = File::get(resource_path("js/i18n/messages/{$locale}/common.ts"));
    preg_match('/[\"\']?list[\"\']?:\s*\{\s*[\"\']?separator[\"\']?:\s*([\"\'])(.*?)\1,\s*[\"\']?last[\"\']?:\s*([\"\'])(.*?)\3/s', $catalog, $match);
    expect($match)->toHaveCount(5, "{$locale} has no literal list separators");

    return count($names) < 2 ? implode('', $names) : implode($match[2], array_slice($names, 0, -1)) . $match[4] . end($names);
}

/**
 * Every content file with a `seo` block, as [locale, relative path, decoded copy].
 *
 * @return list<array{string, string, array<string, mixed>}>
 */
function seoLengthsPages(): array
{
    $pages = [];

    foreach (Locales::codes() as $locale) {
        $root = resource_path("data/content/{$locale}");

        foreach (File::allFiles($root) as $file) {
            if ($file->getExtension() !== 'json') {
                continue;
            }

            $copy = json_decode($file->getContents(), true, 512, JSON_THROW_ON_ERROR);

            if (is_array($copy['seo'] ?? null) && isset($copy['seo']['title'], $copy['seo']['description'])) {
                $pages[] = [$locale, str_replace('\\', '/', $file->getRelativePathname()), $copy];
            }
        }
    }

    return $pages;
}

/**
 * The `<title>` a page renders: compare pages, the homepage and the iPhone page
 * lead with the brand and skip the template; every other page gets
 * "{title} – TablePro".
 *
 * @param  array<string, mixed>  $copy
 */
function seoLengthsRenderedTitle(string $locale, string $path, array $copy): string
{
    $platforms = collect(seoLengthsJson('platforms.json')['platforms'])->where('status', 'released')->keyBy('id');
    $mac = $platforms['mac']['deviceNames'] ?? [];
    $ios = $platforms->has('ios') ? $platforms['ios']['deviceNames'] : [];
    $title = (string) $copy['seo']['title'];

    if (str_starts_with($path, 'databases/') && isset($copy['engine'])) {
        $engine = collect(seoLengthsJson('engines.json'))->firstWhere('id', $copy['engine']);
        $devices = [...$mac, ...(($engine['ios']['inPicker'] ?? false) === true ? $ios : [])];

        $title = strtr($title, [
            '{devices}' => seoLengthsJoin($devices, $locale),
            '{macDevices}' => seoLengthsJoin($mac, $locale),
        ]);
    }

    if ($path === 'home.json') {
        $title = str_replace('{deviceList}', seoLengthsJoin($platforms->flatMap(fn(array $platform): array => $platform['deviceNames'])->all(), $locale), $title);

        return mb_strlen($title) <= 60 ? $title : (string) $copy['seo']['titleFallback'];
    }

    $branded = str_starts_with($path, 'compare/') || $path === 'ios.json';

    return $branded ? $title : "{$title} – TablePro";
}

it('renders every title in 60 characters or fewer', function (): void {
    foreach (seoLengthsPages() as [$locale, $path, $copy]) {
        $title = seoLengthsRenderedTitle($locale, $path, $copy);

        expect($title)->not->toMatch('/[{}]/', "content/{$locale}/{$path}: a token is left in the title");
        expect(mb_strlen($title))->toBeLessThanOrEqual(60, "content/{$locale}/{$path} renders a {$title} of " . mb_strlen($title) . ' characters');
    }
});

it('keeps every description within the search snippet budget', function (): void {
    foreach (seoLengthsPages() as [$locale, $path, $copy]) {
        $limit = $locale === 'vi' ? 160 : 155;
        $length = mb_strlen((string) $copy['seo']['description']);

        expect($length)->toBeLessThanOrEqual($limit, "content/{$locale}/{$path} has a {$length}-character description");
    }
});

it('gives no two pages of a locale the same title', function (): void {
    $seen = [];

    foreach (seoLengthsPages() as [$locale, $path, $copy]) {
        $title = seoLengthsRenderedTitle($locale, $path, $copy);
        $key = "{$locale}:{$title}";

        expect($seen[$key] ?? null)->toBeNull("content/{$locale}/{$path} repeats the title of " . ($seen[$key] ?? ''));
        $seen[$key] = $path;
    }
});
