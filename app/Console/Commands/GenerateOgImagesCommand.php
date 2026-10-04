<?php

namespace App\Console\Commands;

use App\Services\Og\OgImageRenderer;
use App\Services\Og\OgImageRenderException;
use App\Support\Content\ContentRepository;
use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use App\Support\Seo\BlogPosts;
use App\Support\Seo\ContentCollection;
use App\Support\Seo\OgFonts;
use App\Support\Seo\OgImages;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageRegistry;
use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\View;
use RuntimeException;
use Spatie\YamlFrontMatter\YamlFrontMatter;
use Throwable;

/**
 * Renders the Open Graph cards, per page and per language.
 *
 * The set comes from the page registry, so a card exists for exactly the
 * pages and locales that render, and the paths are the ones `OgImages` reads
 * (`OgImages::cardPath()`, `OgImages::fallbackPath()`):
 *
 * - `site`: the generic brand card per locale, from `content/{locale}/home.json`
 *   → `og`. English goes to `/og.png`, regenerated in place so old shares and
 *   the platform's default pick it up; Vietnamese to `/og/vi/default.png`.
 * - `feature`, `database`, `compare`: one card per page, from the `og` block
 *   of its content file. A page whose content has no `og` block keeps
 *   whatever card it has.
 * - `blog`: one card per post and language it is written in, from its front
 *   matter.
 *
 * Text comes from content, front matter and `lang/{locale}/og.php`; dates are
 * `isoFormat('LL')` in the card's locale. Nothing on a card is typed here.
 * Cards are committed under `public/og` (see .github/workflows/og.yml), never
 * generated in production. Rendering needs Chromium through Browsershot and
 * the fonts from `npm ci`.
 */
#[Signature('og:generate
    {--type=all : Card set to render (site|blog|database|compare|feature|all)}
    {--slug= : Render only the page with this slug}
    {--locale=all : Language of the cards (en|vi|all)}')]
#[Description('Render the Open Graph cards for the public pages, in each language they exist in.')]
class GenerateOgImagesCommand extends Command
{
    /**
     * @var list<string>
     */
    public const TYPES = ['site', 'blog', 'database', 'compare', 'feature'];

    public function handle(
        PageRegistry $registry,
        ContentRepository $content,
        BlogPosts $blog,
        OgImageRenderer $renderer,
        OgFonts $fonts,
        Filesystem $files,
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
                $card = $this->siteCard($content, $code);

                if ($card === null) {
                    $skipped[] = "site ({$code}): no `og` block in content/{$code}/home.json";

                    continue;
                }

                $cards[] = $card;
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

                $card = $entry->ogFamily === 'blog'
                    ? $this->blogCard($blog, $entry, $code)
                    : $this->pageCard($content, $entry, $code);

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

        $domain = (string) config('app.web_domain');

        if (! str_contains($domain, '.')) {
            $this->components->warn("WEB_DOMAIN is {$domain}, so the cards print that address. Set the production domain for cards you commit.");
        }

        try {
            $shared = ['fonts' => $fonts->css(), 'logo' => base64_encode((string) $files->get(public_path('logo.png')))];
        } catch (RuntimeException $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        return $this->render($cards, $shared, $renderer, $files);
    }

    /**
     * @param  list<array{view: string, data: array<string, string>, path: string, label: string}>  $cards
     * @param  array{fonts: string, logo: string}  $shared
     */
    private function render(array $cards, array $shared, OgImageRenderer $renderer, Filesystem $files): int
    {
        $progress = $this->output->createProgressBar(count($cards));
        $progress->start();
        $rendered = 0;
        $failures = [];

        foreach ($cards as $card) {
            $output = public_path(ltrim($card['path'], '/'));
            $files->ensureDirectoryExists(dirname($output));

            try {
                $html = View::make($card['view'], [...$shared, ...$card['data']])->render();
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
     * @return array{view: string, data: array<string, string>, path: string, label: string}|null
     */
    private function siteCard(ContentRepository $content, string $locale): ?array
    {
        $og = $content->has('home', $locale) ? ($content->page('home', $locale)['og'] ?? null) : null;
        $title = is_array($og) && is_string($og['title'] ?? null) ? trim($og['title']) : '';

        if ($title === '') {
            return null;
        }

        return [
            'view' => 'og.site',
            'data' => [
                'locale' => $locale,
                'kicker' => is_string($og['kicker'] ?? null) ? trim($og['kicker']) : '',
                'title' => $title,
                'titleSize' => self::titleSize($title, false),
                'address' => self::address(LocalizedUrl::route('landing.home', [], $locale)),
            ],
            'path' => OgImages::fallbackPath($locale),
            'label' => "site ({$locale})",
        ];
    }

    /**
     * @return array{view: string, data: array<string, string>, path: string, label: string}|null
     */
    private function pageCard(ContentRepository $content, PageEntry $entry, string $locale): ?array
    {
        $name = ContentCollection::contentName($entry);
        $og = $name !== null && $content->has($name, $locale) ? ($content->page($name, $locale)['og'] ?? null) : null;
        $title = is_array($og) && is_string($og['title'] ?? null) ? trim($og['title']) : '';

        if ($title === '' || $entry->ogSlug === null) {
            return null;
        }

        $kicker = is_string($og['kicker'] ?? null) ? trim($og['kicker']) : '';

        return [
            'view' => 'og.page',
            'data' => [
                'locale' => $locale,
                'kicker' => $kicker !== '' ? $kicker : $this->label("og.family.{$entry->ogFamily}", $locale),
                'title' => $title,
                'titleSize' => self::titleSize($title, false),
                'address' => self::address($entry->url($locale)),
            ],
            'path' => OgImages::cardPath($entry->ogFamily, $entry->ogSlug, $locale),
            'label' => "{$entry->ogFamily}/{$entry->ogSlug} ({$locale})",
        ];
    }

    /**
     * @return array{view: string, data: array<string, string>, path: string, label: string}|null
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

        $lead = trim((string) ($document->matter('ogPunchline') ?: $document->matter('description')));
        $date = self::date($document->matter('date'));

        return [
            'view' => 'og.blog',
            'data' => [
                'locale' => $locale,
                'kicker' => $this->label('og.family.blog', $locale),
                'title' => $title,
                'titleSize' => self::titleSize($title, $lead !== ''),
                'lead' => $lead,
                'byline' => $date === null
                    ? $this->label('og.author', $locale)
                    : $this->label('og.byline', $locale, [
                        'author' => $this->label('og.author', $locale),
                        'date' => $date->locale($locale)->isoFormat('LL'),
                    ]),
                'address' => self::address($entry->url($locale)),
            ],
            'path' => OgImages::cardPath('blog', $entry->ogSlug, $locale),
            'label' => "blog/{$entry->ogSlug} ({$locale})",
        ];
    }

    /**
     * @param  array<string, string>  $replace
     */
    private function label(string $key, string $locale, array $replace = []): string
    {
        return (string) trans($key, $replace, $locale);
    }

    /**
     * A size step for the title, so a long title, which Vietnamese often is,
     * stays inside the card instead of being clipped.
     */
    private static function titleSize(string $title, bool $withLead): string
    {
        $length = mb_strlen($title);
        [$large, $medium] = $withLead ? [36, 60] : [44, 80];

        return $length <= $large ? 'l' : ($length <= $medium ? 'm' : 's');
    }

    /**
     * The address printed on a card: the page's canonical URL without its scheme.
     */
    private static function address(string $url): string
    {
        return rtrim((string) preg_replace('#^https?://#', '', $url), '/');
    }

    private static function date(mixed $value): ?CarbonImmutable
    {
        try {
            return match (true) {
                $value instanceof DateTimeInterface => CarbonImmutable::instance($value),
                is_int($value) => CarbonImmutable::createFromTimestamp($value),
                is_string($value) && $value !== '' => CarbonImmutable::parse($value),
                default => null,
            };
        } catch (Throwable) {
            return null;
        }
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
