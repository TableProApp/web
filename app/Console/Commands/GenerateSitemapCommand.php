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
        $now = Carbon::now();

        $sitemap = Sitemap::create()
            ->add(
                Url::create($baseUrl . '/')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(1.0)
                    ->setLastModificationDate($now),
            )
            ->add(
                Url::create($baseUrl . '/blog')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.8)
                    ->setLastModificationDate($now),
            )
            ->add(
                Url::create($baseUrl . '/download')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.9)
                    ->setLastModificationDate($now),
            )
            ->add(
                Url::create($baseUrl . '/privacy')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.5)
                    ->setLastModificationDate($now),
            )
            ->add(
                Url::create($baseUrl . '/terms')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.5)
                    ->setLastModificationDate($now),
            )
            ->add(
                Url::create($baseUrl . '/refund-policy')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.5)
                    ->setLastModificationDate($now),
            )
            ->add(
                Url::create($baseUrl . '/faq')
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.7)
                    ->setLastModificationDate($now),
            );

        foreach ($this->loadSlugs('databases.json') as $slug) {
            $sitemap->add(
                Url::create($baseUrl . '/' . $slug)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.8)
                    ->setLastModificationDate($now),
            );
        }

        foreach ($this->loadSlugs('comparisons.json') as $slug) {
            $sitemap->add(
                Url::create($baseUrl . '/compare/' . $slug)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.8)
                    ->setLastModificationDate($now),
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
