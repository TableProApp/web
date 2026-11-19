<?php

namespace App\Console\Commands;

use App\Services\Og\OgImageRenderer;
use App\Services\Og\OgImageRenderException;
use App\Support\Assets\AssetManifest;
use App\Support\Content\ContentRepository;
use App\Support\Localization\Locales;
use App\Support\Pricing\Campaign;
use App\Support\Seo\BlogPosts;
use App\Support\Seo\ContentCollection;
use App\Support\Seo\OgFonts;
use App\Support\Seo\OgImages;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageRegistry;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\View;
use RuntimeException;
use Spatie\YamlFrontMatter\YamlFrontMatter;
use Throwable;

#[Signature('og:generate
    {--type=all : Card set to render (site|page|blog|database|compare|feature|campaign|pricing|all)}
    {--slug= : Render only the page with this slug}
    {--locale=all : Supported language code, or all}')]
#[Description('Render the Open Graph cards for the public pages, in each language they exist in.')]
class GenerateOgImagesCommand extends Command
{
    /**
     * @var list<string>
     */
    public const TYPES = ['site', 'page', 'blog', 'database', 'compare', 'feature', 'campaign', 'pricing'];

    public const VIEW = 'og.card';

    public function handle(
        PageRegistry $registry,
        ContentRepository $content,
        BlogPosts $blog,
        OgImageRenderer $renderer,
        OgFonts $fonts,
        Filesystem $files,
        AssetManifest $assets,
    ): int {
        $type = (string) $this->option('type');
        $locale = (string) $this->option('locale');
        $slug = $this->option('slug');
        $slug = is_string($slug) && $slug !== '' ? $slug : null;

        if ($type !== 'all' && ! in_array($type, self::TYPES, true)) {
            $this->components->error("Invalid --type value: {$type}. Use one of: " . implode(', ', [...self::TYPES, 'all']) . '.');

            return self::INVALID;
        }

        if ($locale !== 'all' && ! Locales::isSupported($locale)) {
            $this->components->error("Invalid --locale value: {$locale}. Use one of: " . implode(', ', [...Locales::codes(), 'all']) . '.');

            return self::INVALID;
        }

        $locales = $locale === 'all' ? Locales::codes() : [$locale];
        $skipped = [];
        $cards = [];

        if (($type === 'all' || $type === 'site') && $slug === null) {
            foreach ($locales as $code) {
                if ($assets->ogCard(OgImages::SITE_CARD, $code) === OgImages::fallbackPath($code)) {
                    $this->components->info("Preserved supplied site artwork ({$code}) at " . OgImages::fallbackPath($code));

                    continue;
                }

                $title = $this->ogTitle($content, 'home', $code);

                if ($title === null) {
                    $skipped[] = "site ({$code}): no `og` block in content/{$code}/home.json";

                    continue;
                }

                $cards[] = self::card($code, OgImages::fallbackPath($code), "site ({$code})", $title);
            }
        }

        foreach ($registry->all() as $entry) {
            if ($entry->ogSlug === null || ! in_array($entry->ogFamily, self::TYPES, true) || $entry->ogFamily === 'site') {
                continue;
            }

            if (($type !== 'all' && $type !== $entry->ogFamily) || ($slug !== null && $slug !== $entry->ogSlug)) {
                continue;
            }

            foreach ($locales as $code) {
                if (! $entry->renders($code)) {
                    continue;
                }

                $card = match ($entry->ogFamily) {
                    'blog' => $this->blogCard($blog, $entry, $code),
                    'campaign' => $this->campaignCard($content, $entry, $code),
                    default => $this->pageCard($content, $files, $entry, $code),
                };

                if ($card === null) {
                    $skipped[] = "{$entry->ogFamily}/{$entry->ogSlug} ({$code}): no `og` copy yet";

                    continue;
                }

                $cards[] = $card;
            }
        }

        $this->reportSkipped($skipped);

        if ($cards === []) {
            $this->components->warn($slug === null ? 'No card to render.' : "No page with slug '{$slug}' has a card to render.");

            return self::SUCCESS;
        }

        try {
            $css = $fonts->css();
            $logo = base64_encode((string) $files->get(public_path('images/brand/tablepro-icon-256.png')));
        } catch (RuntimeException $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        $progress = $this->output->createProgressBar(count($cards));
        $progress->start();
        $rendered = 0;
        $failures = [];

        foreach ($cards as $card) {
            $output = public_path(ltrim($card['path'], '/'));
            $files->ensureDirectoryExists(dirname($output));

            try {
                $html = View::make(self::VIEW, [
                    'fonts' => $css,
                    'cjk' => $fonts->cjk($card['data']['locale']),
                    'logo' => $logo,
                    ...$card['data'],
                ])->render();
                $renderer->render($html, $output);
                $rendered++;
            } catch (OgImageRenderException $e) {
                $failures[] = "{$card['label']}: {$e->getMessage()}";
            }

            $progress->advance();
        }

        $progress->finish();
        $this->newLine();

        foreach ($failures as $failure) {
            $this->components->warn("Skipped {$failure}");
        }

        $this->components->info("Generated {$rendered} OG image(s).");

        return $failures === [] ? self::SUCCESS : self::FAILURE;
    }

    /**
     * @return array{data: array{locale: string, title: string, section: string, sub: string, tile: string}, path: string, label: string}
     */
    private static function card(string $locale, string $path, string $label, string $title, string $section = '', string $sub = '', string $tile = ''): array
    {
        // A section that only repeats the title says nothing.
        if (mb_strtolower($section) === mb_strtolower($title)) {
            $section = '';
        }

        return [
            'data' => ['locale' => $locale, 'title' => $title, 'section' => $section, 'sub' => $sub, 'tile' => $tile],
            'path' => $path,
            'label' => $label,
        ];
    }

    /**
     * @return array{data: array<string, string>, path: string, label: string}|null
     */
    private function pageCard(ContentRepository $content, Filesystem $files, PageEntry $entry, string $locale): ?array
    {
        $name = ContentCollection::contentName($entry);
        $title = $name === null ? null : $this->ogTitle($content, $name, $locale);

        if ($title === null || $entry->ogSlug === null) {
            return null;
        }

        $section = match (true) {
            $entry->ogFamily === 'pricing' => trim((string) ($content->page((string) $name, $locale)['og']['kicker'] ?? '')),
            $entry->ogFamily === 'page', $entry->params === [] => '',
            default => (string) trans("og.family.{$entry->ogFamily}", [], $locale),
        };

        return self::card(
            $locale,
            OgImages::cardPath($entry->ogFamily, $entry->ogSlug, $locale),
            "{$entry->ogFamily}/{$entry->ogSlug} ({$locale})",
            $title,
            $section,
            tile: $entry->ogFamily === 'database' && $entry->params !== [] ? self::engineMark($files, $entry->ogSlug) : '',
        );
    }

    /**
     * @return array{data: array<string, string>, path: string, label: string}|null
     */
    private function campaignCard(ContentRepository $content, PageEntry $entry, string $locale): ?array
    {
        $campaign = Campaign::current();
        $name = ContentCollection::contentName($entry);

        if ($campaign === null || $name === null || $entry->ogSlug === null || ! $content->has($name, $locale)) {
            return null;
        }

        $og = $content->page($name, $locale)['og'] ?? null;

        if (! is_array($og) || ! is_string($og['title'] ?? null) || ! is_string($og['headline'] ?? null)) {
            return null;
        }

        return self::card(
            $locale,
            OgImages::cardPath($entry->ogFamily, $entry->ogSlug, $locale),
            "{$entry->ogFamily}/{$entry->ogSlug} ({$locale})",
            str_replace('{percent}', (string) $campaign->percent, trim($og['headline'])),
            trim((string) ($og['kicker'] ?? '')),
            trim((string) ($og['product'] ?? '')),
        );
    }

    /**
     * @return array{data: array<string, string>, path: string, label: string}|null
     */
    private function blogCard(BlogPosts $blog, PageEntry $entry, string $locale): ?array
    {
        if ($entry->ogSlug === null) {
            return null;
        }

        try {
            $document = YamlFrontMatter::parseFile($blog->path($entry->ogSlug, $locale));
        } catch (Throwable) {
            return null;
        }

        $title = trim((string) $document->matter('title'));

        if ($title === '') {
            return null;
        }

        $sub = '';

        // "TablePro 0.84: Find and Replace" reads as a version over its headline.
        if ($document->matter('release') && str_contains($title, ': ')) {
            [$title, $sub] = array_map(trim(...), explode(': ', $title, 2));
        }

        return self::card(
            $locale,
            OgImages::cardPath('blog', $entry->ogSlug, $locale),
            "blog/{$entry->ogSlug} ({$locale})",
            $title,
            (string) trans('og.family.blog', [], $locale),
            $sub,
        );
    }

    private function ogTitle(ContentRepository $content, string $name, string $locale): ?string
    {
        $title = $content->has($name, $locale) ? ($content->page($name, $locale)['og']['title'] ?? null) : null;

        return is_string($title) && trim($title) !== '' ? trim($title) : null;
    }

    private static function engineMark(Filesystem $files, string $slug): string
    {
        foreach (File::json(resource_path('data/engines.json'), JSON_THROW_ON_ERROR) as $engine) {
            $icon = public_path(ltrim((string) ($engine['icon'] ?? ''), '/'));

            if (($engine['slug'] ?? null) === $slug && str_ends_with($icon, '.svg') && $files->isFile($icon)) {
                return 'data:image/svg+xml;base64,' . base64_encode($files->get($icon));
            }
        }

        return '';
    }

    /**
     * @param  list<string>  $skipped
     */
    private function reportSkipped(array $skipped): void
    {
        if ($skipped === []) {
            return;
        }

        $this->components->warn(count($skipped) . ' card(s) skipped: their page has no card copy yet, so any existing card stays as it is. Run with -v to list them.');

        if ($this->output->isVerbose()) {
            foreach ($skipped as $line) {
                $this->line("  {$line}");
            }
        }
    }
}
