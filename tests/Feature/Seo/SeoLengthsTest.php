<?php

use Illuminate\Support\Facades\File;
use App\Support\Content\IntegrationCatalog;
use App\Support\Localization\Locales;
use Spatie\YamlFrontMatter\YamlFrontMatter;

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
 * So is every post, by its front matter: `seoTitle` where the title is too
 * long or is another page's, and the description its index row also prints.
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
 * The `<title>` a page renders: compare pages, the homepage, the iPhone page and
 * the about page lead with the brand and skip the template; every other page gets
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

    $branded = str_starts_with($path, 'compare/') || in_array($path, ['ios.json', 'about.json'], true);

    return $branded ? $title : "{$title} – TablePro";
}

/**
 * Every post as [locale, relative path, rendered `<title>`, description].
 * Blog/Post.tsx renders `seoTitle` in place of the title, and adds the site
 * template only to a title that does not name the brand.
 *
 * @return list<array{string, string, string, string}>
 */
function seoLengthsPosts(): array
{
    $posts = [];

    foreach (Locales::codes() as $locale) {
        $directory = resource_path('blog' . ($locale === Locales::default() ? '' : "/{$locale}"));

        foreach (File::glob("{$directory}/*.md") ?: [] as $file) {
            $matter = YamlFrontMatter::parseFile($file)->matter();
            $title = (string) ($matter['seoTitle'] ?? $matter['title']);

            $posts[] = [
                $locale,
                'blog/' . basename($file),
                str_contains($title, 'TablePro') ? $title : "{$title} – TablePro",
                (string) $matter['description'],
            ];
        }
    }

    return $posts;
}

it('renders every title in 60 characters or fewer', function (): void {
    foreach (seoLengthsPages() as [$locale, $path, $copy]) {
        $title = seoLengthsRenderedTitle($locale, $path, $copy);

        expect($title)->not->toMatch('/[{}]/', "content/{$locale}/{$path}: a token is left in the title");
        expect(mb_strlen($title))->toBeLessThanOrEqual(60, "content/{$locale}/{$path} renders a {$title} of " . mb_strlen($title) . ' characters');
    }

    foreach (seoLengthsPosts() as [$locale, $path, $title]) {
        expect(mb_strlen($title))->toBeLessThanOrEqual(60, "{$path} ({$locale}) renders a {$title} of " . mb_strlen($title) . ' characters; give it a seoTitle');
        expect(substr_count($title, 'TablePro'))->toBeLessThanOrEqual(1, "{$path} ({$locale}) names the brand twice in {$title}");
    }
});

it('keeps every description within the search snippet budget', function (): void {
    foreach (seoLengthsPages() as [$locale, $path, $copy]) {
        $limit = $locale === 'vi' ? 160 : 155;
        $length = mb_strlen((string) $copy['seo']['description']);

        expect($length)->toBeLessThanOrEqual($limit, "content/{$locale}/{$path} has a {$length}-character description");
    }

    foreach (seoLengthsPosts() as [$locale, $path, , $description]) {
        $length = mb_strlen($description);

        expect($length)->toBeLessThanOrEqual($locale === 'vi' ? 160 : 155, "{$path} ({$locale}) has a {$length}-character description");
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

    foreach (seoLengthsPosts() as [$locale, $path, $title]) {
        $key = "{$locale}:{$title}";

        expect($seen[$key] ?? null)->toBeNull("{$path} ({$locale}) repeats the title of " . ($seen[$key] ?? ''));
        $seen[$key] = $path;
    }
});

it('fits integration page titles and descriptions, which come from the registry', function (): void {
    $template = seoLengthsJson('content/en/integrations/index.json')['show']['seoTitle'];
    $title = fn(string $name): string => str_replace('{name}', $name, $template) . ' – TablePro';
    $titles = [];

    // The registry caps a name at 32 characters.
    expect(mb_strlen($title(str_repeat('M', 32))))->toBeLessThanOrEqual(60);

    foreach (app(IntegrationCatalog::class)->all() as $integration) {
        $titles[] = $title($integration['name']);

        expect(mb_strlen(end($titles)))->toBeLessThanOrEqual(60, "integrations/{$integration['slug']} renders a title of " . mb_strlen(end($titles)) . ' characters');
        expect(mb_strlen($integration['summary']))->toBeLessThanOrEqual(155, "integrations/{$integration['slug']} has a longer description than 155 characters");
    }

    expect($titles)->toBe(array_values(array_unique($titles)));
});
