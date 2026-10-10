<?php

use App\Services\Og\OgImageRenderer;
use App\Services\Og\OgImageRenderException;
use App\Support\Seo\OgFonts;
use App\Support\Seo\OgImages;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Facades\File;

require_once __DIR__ . '/../Seo/helpers.php';

beforeEach(function (): void {
    $this->dirs = seoScratch();
    $this->public = seoScratchPublic();

    File::put($this->dirs['root'] . '/fonts.css', '@font-face { font-family: "Inter Variable"; src: url(data:font/woff2;base64,AAAA) format("woff2"); }');
    $this->app->instance(OgFonts::class, new OgFonts($this->dirs['root'] . '/fonts.css'));

    $content = $this->dirs['content'];

    seoWriteContent($content, 'en', 'home', ['seo' => ['title' => 't', 'description' => 'd'], 'og' => ['kicker' => '', 'title' => 'TablePro is a native, open-source database client for developers.']]);
    seoWriteContent($content, 'vi', 'home', ['seo' => ['title' => 't', 'description' => 'd'], 'og' => ['kicker' => '', 'title' => 'TablePro là database client native, mã nguồn mở, dành cho lập trình viên.']]);
    seoWriteContent($content, 'en', 'features/querying', ['seo' => ['title' => 't', 'description' => 'd'], 'og' => ['kicker' => 'Querying', 'title' => 'Write <SQL> & run it']]);
    seoWriteContent($content, 'vi', 'features/querying', ['seo' => ['title' => 't', 'description' => 'd'], 'og' => ['kicker' => 'Query', 'title' => 'Viết query và chạy ngay']]);
    seoWriteContent($content, 'en', 'compare/tableplus', ['seo' => ['title' => 't', 'description' => 'd'], 'og' => ['title' => 'TablePro or TablePlus']]);
    seoWriteContent($content, 'en', 'databases/index', ['seo' => ['title' => 't', 'description' => 'd'], 'og' => ['title' => 'Hubs use the site card']]);
    seoWriteContent($content, 'en', 'faq', ['seo' => ['title' => 't', 'description' => 'd']]);

    seoWriteMarkdown($this->dirs['blog'] . '/tablepro-0-77.md', ['title' => 'TablePro 0.77', 'ogPunchline' => 'Folders in the sidebar.', 'date' => '2026-10-02']);
    seoWriteMarkdown($this->dirs['blog'] . '/a-guide.md', ['title' => 'A guide', 'description' => 'What it covers.', 'date' => '2026-03-01']);
    seoWriteMarkdown($this->dirs['blog'] . '/vi/a-guide.md', ['title' => 'Một hướng dẫn', 'description' => 'Nội dung chính.', 'date' => '2026-03-01']);

    $this->app->forgetInstance(PageRegistry::class);

    $this->rendered = [];
    $rendered = &$this->rendered;

    $this->mock(OgImageRenderer::class, function ($mock) use (&$rendered): void {
        $mock->shouldReceive('render')->andReturnUsing(function (string $html, string $outputPath, int $width = 1200, int $height = 630) use (&$rendered): void {
            $rendered[str_replace($this->public, '', $outputPath)] = ['html' => $html, 'width' => $width, 'height' => $height];
            File::ensureDirectoryExists(dirname($outputPath));
            File::put($outputPath, seoPngBytes());
        });
    });
});

afterEach(function (): void {
    File::deleteDirectory($this->dirs['root']);
    File::deleteDirectory($this->public);
});

it('preserves supplied English artwork at the canonical default URL while generating other cards', function (): void {
    $artwork = seoPngBytes();
    File::put($this->public . '/og.png', $artwork);

    $this->artisan('og:generate')->assertSuccessful();

    expect($this->rendered)->not->toHaveKey('/og.png')
        ->toHaveKey('/og/vi/default.png')
        ->toHaveKey('/og/feature/querying.png');
    expect(File::get($this->public . '/og.png'))->toBe($artwork);
});

it('renders every card in both languages by default', function (): void {
    $this->artisan('og:generate')->assertSuccessful();

    expect(array_keys($this->rendered))->toEqualCanonicalizing([
        '/og.png',
        '/og/vi/default.png',
        '/og/feature/querying.png',
        '/og/vi/feature/querying.png',
        '/og/compare/tableplus.png',
        '/og/blog/tablepro-0-77.png',
        '/og/blog/a-guide.png',
        '/og/vi/blog/a-guide.png',
    ]);

    foreach ($this->rendered as $card) {
        expect([$card['width'], $card['height']])->toBe([1200, 630]);
    }

    // A card written into the real public/ would keep its absolute path and fail the list above.
    expect(public_path())->toBe($this->public);
});

it('renders one language with --locale', function (string $locale, array $paths): void {
    $this->artisan('og:generate', ['--locale' => $locale])->assertSuccessful();

    expect(array_keys($this->rendered))->toEqualCanonicalizing($paths);
})->with([
    'English' => ['en', ['/og.png', '/og/feature/querying.png', '/og/compare/tableplus.png', '/og/blog/tablepro-0-77.png', '/og/blog/a-guide.png']],
    'Vietnamese' => ['vi', ['/og/vi/default.png', '/og/vi/feature/querying.png', '/og/vi/blog/a-guide.png']],
]);

it('renders one set with --type, and one page with --slug', function (array $options, array $paths): void {
    $this->artisan('og:generate', $options)->assertSuccessful();

    expect(array_keys($this->rendered))->toEqualCanonicalizing($paths);
})->with([
    'the generic cards' => [['--type' => 'site'], ['/og.png', '/og/vi/default.png']],
    'the feature cards in English' => [['--type' => 'feature', '--locale' => 'en'], ['/og/feature/querying.png']],
    'the blog cards' => [['--type' => 'blog'], ['/og/blog/tablepro-0-77.png', '/og/blog/a-guide.png', '/og/vi/blog/a-guide.png']],
    'one page, every language' => [['--slug' => 'querying'], ['/og/feature/querying.png', '/og/vi/feature/querying.png']],
    'one post, one language' => [['--slug' => 'a-guide', '--locale' => 'vi'], ['/og/vi/blog/a-guide.png']],
]);

it('rejects an unknown type or language before rendering anything', function (array $options): void {
    $this->artisan('og:generate', $options)->assertExitCode(2);

    expect($this->rendered)->toBe([]);
})->with([
    'type' => [['--type' => 'banana']],
    'locale' => [['--locale' => 'xx']],
]);

it('renders nothing and says so when no page has the slug', function (): void {
    $this->artisan('og:generate', ['--slug' => 'does-not-exist'])
        ->expectsOutputToContain("No page with slug 'does-not-exist'")
        ->assertSuccessful();

    expect($this->rendered)->toBe([]);
});

it('skips a page with no card copy and keeps its existing card', function (): void {
    seoWriteContent($this->dirs['content'], 'en', 'databases/mysql-client', ['seo' => ['title' => 't', 'description' => 'd']]);
    $this->app->forgetInstance(PageRegistry::class);

    File::ensureDirectoryExists($this->public . '/og/database');
    File::put($this->public . '/og/database/mysql-client.png', 'old card');

    $this->artisan('og:generate', ['--type' => 'database'])
        ->expectsOutputToContain('skipped')
        ->assertSuccessful();

    expect($this->rendered)->toBe([]);
    expect(File::get($this->public . '/og/database/mysql-client.png'))->toBe('old card');
});

it('fills each card from its own language, escaped, with the page address', function (): void {
    $this->artisan('og:generate')->assertSuccessful();

    $site = $this->rendered['/og/vi/default.png']['html'];
    $feature = $this->rendered['/og/feature/querying.png']['html'];
    $featureVi = $this->rendered['/og/vi/feature/querying.png']['html'];
    $compare = $this->rendered['/og/compare/tableplus.png']['html'];

    expect($site)
        ->toContain('<html lang="vi">')
        ->toContain('TablePro là database client native, mã nguồn mở, dành cho lập trình viên.')
        ->toContain('localhost/vi<');

    expect($feature)
        ->toContain('<html lang="en">')
        ->toContain('Write &lt;SQL&gt; &amp; run it')
        ->not->toContain('<SQL>')
        ->toContain('localhost/features/querying');

    expect($featureVi)->toContain('<p class="kicker">Query</p>')->toContain('Viết query và chạy ngay')->toContain('localhost/vi/features/querying');

    // A page with no kicker of its own takes its family's label.
    expect($compare)->toContain(trans('og.family.compare', [], 'en'));
});

it('dates a post in the language of its card', function (): void {
    $this->artisan('og:generate', ['--type' => 'blog'])->assertSuccessful();

    expect($this->rendered['/og/blog/tablepro-0-77.png']['html'])
        ->toContain('Folders in the sidebar.')
        ->toContain('October 2, 2026')
        ->toContain(trans('og.author', [], 'en'));

    expect($this->rendered['/og/blog/a-guide.png']['html'])->toContain('What it covers.');

    expect($this->rendered['/og/vi/blog/a-guide.png']['html'])
        ->toContain('<html lang="vi">')
        ->toContain('Một hướng dẫn')
        ->toContain('tháng 3')
        ->toContain(trans('og.author', [], 'vi'));
});

it('embeds the fonts and the logo, so a card never depends on the machine', function (): void {
    $this->artisan('og:generate', ['--type' => 'site', '--locale' => 'en'])->assertSuccessful();

    expect($this->rendered['/og.png']['html'])
        ->toContain('data:font/woff2;base64,AAAA')
        ->toContain('data:image/png;base64,' . base64_encode(File::get($this->public . '/logo.png')))
        ->not->toContain('<img src="/')
        ->not->toContain('<link');
});

it('fails before rendering when a font is missing', function (): void {
    File::put($this->dirs['root'] . '/fonts.css', '@font-face { src: url("missing.woff2"); }');

    $this->artisan('og:generate')->assertFailed();

    expect($this->rendered)->toBe([]);
});

it('reports a card that fails to render and still renders the rest', function (): void {
    $rendered = [];

    $this->mock(OgImageRenderer::class, function ($mock) use (&$rendered): void {
        $mock->shouldReceive('render')->andReturnUsing(function (string $html, string $outputPath) use (&$rendered): void {
            if (str_ends_with($outputPath, '/og.png')) {
                throw new OgImageRenderException('Chromium went away');
            }

            $rendered[] = $outputPath;
        });
    });

    $this->artisan('og:generate', ['--type' => 'site'])
        ->expectsOutputToContain('Chromium went away')
        ->assertFailed();

    expect($rendered)->toHaveCount(1);
});

it('gives every page a card that exists once the cards are generated', function (): void {
    $this->artisan('og:generate')->assertSuccessful();

    $images = app(OgImages::class);
    $checked = 0;

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            $image = $images->for($entry, $locale);

            expect($image)->not->toBeNull("{$entry->key()} ({$locale}) has no card");
            expect(File::exists($this->public . seoPathOf($image['url'])))->toBeTrue();
            $checked++;
        }
    }

    expect($images->for(app(PageRegistry::class)->find('landing.features.show', ['slug' => 'querying']), 'vi')['url'])
        ->toBe('https://localhost/og/vi/feature/querying.png');
    expect($images->for(app(PageRegistry::class)->find('landing.faq', []), 'en')['url'])
        ->toBe('https://localhost/og.png');
    expect($checked)->toBeGreaterThan(5);
});
