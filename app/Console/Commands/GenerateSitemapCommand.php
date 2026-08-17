<?php

namespace App\Console\Commands;

use App\Services\Blog\BlogService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class GenerateSitemapCommand extends Command
{
    protected $signature = 'sitemap:generate';

    protected $description = 'Generate the sitemap for the public landing pages';

    public function __construct(
        private readonly BlogService $blog,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $baseUrl = 'https://' . config('app.web_domain');

        /*
         * One `Carbon::now()` used to stamp all 43 non-blog URLs, so every
         * deploy advanced `lastmod` on every page whether or not anything
         * changed. A crawler that sees a whole sitemap move every time learns
         * to ignore the field — including for the pages that genuinely did
         * change. Each URL now carries the mtime of whatever actually drives
         * it, which is the same discipline the blog entries already had.
         */
        $databaseData = $this->dataModifiedAt('databases.json');
        $comparisonData = $this->dataModifiedAt('comparisons.json');
        $homepage = $this->sourceModifiedAt('resources/js/pages/Home.tsx');

        $sitemap = Sitemap::create()
            ->add(
                Url::create($baseUrl . '/')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(1.0)
                    ->setLastModificationDate($homepage),
            )
            ->add(
                Url::create($baseUrl . '/blog')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.8)
                    ->setLastModificationDate($this->latestPostDate()),
            )
            ->add(
                Url::create($baseUrl . '/download')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.9)
                    ->setLastModificationDate($this->sourceModifiedAt('resources/js/pages/Download.tsx')),
            )
            ->add(
                Url::create($baseUrl . '/privacy')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.5)
                    ->setLastModificationDate($this->sourceModifiedAt('resources/js/pages/Privacy.tsx')),
            )
            ->add(
                Url::create($baseUrl . '/terms')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.5)
                    ->setLastModificationDate($this->sourceModifiedAt('resources/js/pages/Terms.tsx')),
            )
            ->add(
                Url::create($baseUrl . '/refund-policy')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.5)
                    ->setLastModificationDate($this->sourceModifiedAt('resources/js/pages/RefundPolicy.tsx')),
            )
            ->add(
                Url::create($baseUrl . '/faq')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.7)
                    ->setLastModificationDate($this->sourceModifiedAt('resources/js/data/faqs.ts')),
            );

        foreach ($this->loadSlugs('databases.json') as $slug) {
            $sitemap->add(
                Url::create($baseUrl . '/' . $slug)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.8)
                    ->setLastModificationDate($databaseData),
            );
        }

        foreach ($this->loadSlugs('comparisons.json') as $slug) {
            $sitemap->add(
                Url::create($baseUrl . '/compare/' . $slug)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.8)
                    ->setLastModificationDate($comparisonData),
            );
        }

        foreach ($this->blog->all() as $post) {
            $sitemap->add(
                Url::create($baseUrl . '/blog/' . $post->slug)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.7)
                    ->setLastModificationDate($post->date),
            );
        }

        $sitemap->writeToFile(public_path('sitemap.xml'));

        $this->components->info('Sitemap generated successfully.');

        return self::SUCCESS;
    }

    /** The mtime of a data file, which is what drives the pages built from it. */
    private function dataModifiedAt(string $file): Carbon
    {
        return $this->modifiedAt(resource_path('data/' . $file));
    }

    /** The mtime of a source file, relative to the project root. */
    private function sourceModifiedAt(string $relative): Carbon
    {
        return $this->modifiedAt(base_path($relative));
    }

    /** Falls back to now for a file that is missing, which is the safe direction. */
    private function modifiedAt(string $path): Carbon
    {
        $mtime = file_exists($path) ? filemtime($path) : false;

        return $mtime === false ? Carbon::now() : Carbon::createFromTimestamp($mtime);
    }

    /** The index lists posts, so it is as fresh as the newest one. */
    private function latestPostDate(): Carbon
    {
        $dates = array_map(
            static fn($post): Carbon => Carbon::parse($post->date),
            $this->blog->all(),
        );

        return empty($dates) ? Carbon::now() : max($dates);
    }

    /**
     * @return list<string>
     */
    private function loadSlugs(string $file): array
    {
        $path = resource_path('data/' . $file);

        if (! file_exists($path)) {
            $this->components->warn("Data file not found: {$path}");

            return [];
        }

        $entries = json_decode((string) file_get_contents($path), true);

        if (! is_array($entries)) {
            $this->components->warn("Invalid JSON in {$path}");

            return [];
        }

        return array_values(array_filter(array_map(
            static fn(array $entry): ?string => is_string($entry['slug'] ?? null) ? $entry['slug'] : null,
            $entries,
        )));
    }
}
