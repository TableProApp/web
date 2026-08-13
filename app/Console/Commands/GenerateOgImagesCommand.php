<?php

namespace App\Console\Commands;

use App\Services\Blog\BlogService;
use App\Services\Og\OgImageRenderException;
use App\Services\Og\OgImageRenderer;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\View;

#[Signature('og:generate {--type=all : Image set to render (compare|database|blog|all)} {--slug= : Render only the entry with this slug}')]
#[Description('Render Open Graph PNG images for compare, database, and blog landing pages.')]
class GenerateOgImagesCommand extends Command
{
    private const COMPARE_OUTPUT_DIR = 'og/compare';

    private const DATABASE_OUTPUT_DIR = 'og/database';

    private const BLOG_OUTPUT_DIR = 'og/blog';

    public function __construct(
        private readonly Filesystem $files,
        private readonly OgImageRenderer $renderer,
        private readonly BlogService $blog,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $type = $this->option('type');
        $slug = $this->option('slug');

        if (! in_array($type, ['all', 'compare', 'database', 'blog'], true)) {
            $this->components->error("Invalid --type value: {$type}");

            return self::INVALID;
        }

        $rendered = 0;

        if ($type === 'all' || $type === 'compare') {
            $rendered += $this->renderSet(
                file: 'comparisons.json',
                view: 'og.compare',
                viewKey: 'comparison',
                outputDir: self::COMPARE_OUTPUT_DIR,
                slug: $slug,
            );
        }

        if ($type === 'all' || $type === 'database') {
            $rendered += $this->renderSet(
                file: 'databases.json',
                view: 'og.database',
                viewKey: 'database',
                outputDir: self::DATABASE_OUTPUT_DIR,
                slug: $slug,
            );
        }

        if ($type === 'all' || $type === 'blog') {
            $rendered += $this->renderBlog($slug);
        }

        $this->components->info("Generated {$rendered} OG image(s).");

        return self::SUCCESS;
    }

    private function renderBlog(?string $slug): int
    {
        $posts = $this->blog->all();

        if ($slug !== null) {
            $posts = array_values(array_filter(
                $posts,
                static fn($post): bool => $post->slug === $slug,
            ));

            if ($posts === []) {
                $this->components->warn("No blog post with slug '{$slug}'");

                return 0;
            }
        }

        $absoluteOutputDir = public_path(self::BLOG_OUTPUT_DIR);
        $this->files->ensureDirectoryExists($absoluteOutputDir);

        $progress = $this->output->createProgressBar(count($posts));
        $progress->start();
        $count = 0;
        $failures = 0;

        foreach ($posts as $post) {
            $entry = [
                'slug' => $post->slug,
                'title' => $post->title,
                'description' => $post->description,
                'author' => $post->author,
                'dateFormatted' => $post->date->format('F j, Y'),
                'ogPunchline' => $post->ogPunchline,
            ];

            $html = View::make('og.blog', ['blog' => $entry])->render();
            $output = $absoluteOutputDir . DIRECTORY_SEPARATOR . $post->slug . '.png';

            try {
                $this->renderer->render($html, $output);
                $count++;
            } catch (OgImageRenderException $exception) {
                $failures++;
                $this->components->warn("Skipped '{$post->slug}': {$exception->getMessage()}");
            }

            $progress->advance();
        }

        $progress->finish();
        $this->newLine();

        if ($failures > 0) {
            $this->components->warn("{$failures} blog OG image(s) failed to render.");
        }

        return $count;
    }

    private function renderSet(
        string $file,
        string $view,
        string $viewKey,
        string $outputDir,
        ?string $slug,
    ): int {
        $entries = $this->loadEntries($file);

        if ($slug !== null) {
            $entries = array_values(array_filter(
                $entries,
                static fn(array $entry): bool => ($entry['slug'] ?? null) === $slug,
            ));

            if ($entries === []) {
                $this->components->warn("No entry with slug '{$slug}' in {$file}");

                return 0;
            }
        }

        $absoluteOutputDir = public_path($outputDir);
        $this->files->ensureDirectoryExists($absoluteOutputDir);

        $progress = $this->output->createProgressBar(count($entries));
        $progress->start();
        $count = 0;
        $failures = 0;

        foreach ($entries as $entry) {
            $entrySlug = $entry['slug'] ?? null;
            if (! is_string($entrySlug) || $entrySlug === '') {
                continue;
            }

            $html = View::make($view, [$viewKey => $entry])->render();
            $output = $absoluteOutputDir . DIRECTORY_SEPARATOR . $entrySlug . '.png';

            try {
                $this->renderer->render($html, $output);
                $count++;
            } catch (OgImageRenderException $exception) {
                $failures++;
                $this->components->warn("Skipped '{$entrySlug}': {$exception->getMessage()}");
            }

            $progress->advance();
        }

        $progress->finish();
        $this->newLine();

        if ($failures > 0) {
            $this->components->warn("{$failures} OG image(s) failed to render.");
        }

        return $count;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function loadEntries(string $file): array
    {
        $path = resource_path('data/' . $file);

        if (! $this->files->exists($path)) {
            $this->components->warn("Data file not found: {$path}");

            return [];
        }

        $entries = json_decode($this->files->get($path), true);

        if (! is_array($entries)) {
            $this->components->warn("Invalid JSON in {$path}");

            return [];
        }

        return array_values(array_filter($entries, 'is_array'));
    }

}
