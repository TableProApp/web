<?php

use App\Services\Og\OgImageRenderer;
use App\Services\Og\OgImageRenderException;
use App\Support\Seo\OgFonts;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Facades\File;

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
    seoWriteContent($content, 'en', 'databases/index', ['seo' => ['title' => 't', 'description' => 'd'], 'og' => ['kicker' => 'Databases', 'title' => 'Supported databases']]);
    seoWriteContent($content, 'en', 'databases/mysql-client', ['seo' => ['title' => 't', 'description' => 'd'], 'og' => ['title' => 'MySQL client']]);
    seoWriteContent($content, 'en', 'faq', ['seo' => ['title' => 't', 'description' => 'd'], 'og' => ['kicker' => 'FAQ', 'title' => 'Frequently asked questions']]);
    seoWriteContent($content, 'en', 'about', ['seo' => ['title' => 't', 'description' => 'd']]);
    seoWriteContent($content, 'en', 'pricing', ['seo' => ['title' => 't', 'description' => 'd'], 'og' => ['kicker' => 'Pricing', 'title' => 'Free to use.']]);

    seoWriteMarkdown($this->dirs['blog'] . '/tablepro-0-77.md', ['title' => 'TablePro 0.77: Folders in the sidebar', 'release' => 'TablePro 0.77', 'date' => '2026-10-02']);
    seoWriteMarkdown($this->dirs['blog'] . '/a-guide.md', ['title' => 'A guide: with a colon', 'description' => 'What it covers.', 'date' => '2026-03-01']);
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
        '/og/database/index.png',
        '/og/database/mysql-client.png',
        '/og/page/faq.png',
        '/og/pricing/pricing.png',
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

it('renders one language with --locale', function (): void {
    $this->artisan('og:generate', ['--locale' => 'vi'])->assertSuccessful();

    expect(array_keys($this->rendered))->toEqualCanonicalizing(['/og/vi/default.png', '/og/vi/feature/querying.png', '/og/vi/blog/a-guide.png']);
});

it('renders one set with --type, and one page with --slug', function (array $options, array $paths): void {
    $this->artisan('og:generate', $options)->assertSuccessful();

    expect(array_keys($this->rendered))->toEqualCanonicalizing($paths);
})->with([
    'the generic cards' => [['--type' => 'site'], ['/og.png', '/og/vi/default.png']],
    'the feature cards in English' => [['--type' => 'feature', '--locale' => 'en'], ['/og/feature/querying.png']],
    'the blog cards' => [['--type' => 'blog'], ['/og/blog/tablepro-0-77.png', '/og/blog/a-guide.png', '/og/vi/blog/a-guide.png']],
    'the one-off pages' => [['--type' => 'page'], ['/og/page/faq.png']],
    'a hub' => [['--type' => 'database', '--slug' => 'index'], ['/og/database/index.png']],
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
    File::ensureDirectoryExists($this->public . '/og/page');
    File::put($this->public . '/og/page/about.png', 'old card');

    $this->artisan('og:generate', ['--slug' => 'about'])
        ->expectsOutputToContain('skipped')
        ->assertSuccessful();

    expect($this->rendered)->toBe([]);
    expect(File::get($this->public . '/og/page/about.png'))->toBe('old card');
});

it('fills each card from its own language, escaped', function (): void {
    $this->artisan('og:generate')->assertSuccessful();

    expect($this->rendered['/og/vi/default.png']['html'])
        ->toContain('<html lang="vi">')
        ->toContain('TablePro là database client native, mã nguồn mở, dành cho lập trình viên.');

    expect($this->rendered['/og/feature/querying.png']['html'])
        ->toContain('<html lang="en">')
        ->toContain('<h1 class="title t1">Write &lt;SQL&gt; &amp; run it</h1>')
        ->not->toContain('<SQL>');

    expect($this->rendered['/og/vi/feature/querying.png']['html'])->toContain('Viết query và chạy ngay');
});

it('prints the title and at most a section and a sub line', function (): void {
    $this->artisan('og:generate')->assertSuccessful();

    $section = fn(string $label): string => '<span class="section">' . $label . '</span>';

    // A page names its family, never its own kicker.
    expect($this->rendered['/og/feature/querying.png']['html'])
        ->toContain($section(trans('og.family.feature', [], 'en')))
        ->not->toContain('Querying');
    expect($this->rendered['/og/vi/feature/querying.png']['html'])->toContain($section(trans('og.family.feature', [], 'vi')));
    expect($this->rendered['/og/compare/tableplus.png']['html'])->toContain($section(trans('og.family.compare', [], 'en')));
    expect($this->rendered['/og/pricing/pricing.png']['html'])->toContain($section('Pricing'));

    foreach (['/og/database/index.png', '/og/page/faq.png', '/og/vi/default.png'] as $path) {
        expect($this->rendered[$path]['html'])->not->toContain('class="section"');
    }

    foreach ($this->rendered as $path => $card) {
        expect($card['html'])->not->toContain('localhost', "{$path} prints an address");
    }
});

it('shows the engine on a database card and nowhere else', function (): void {
    File::ensureDirectoryExists($this->public . '/images/databases');
    File::copy(base_path('public/images/databases/mysql.svg'), $this->public . '/images/databases/mysql.svg');

    $this->artisan('og:generate')->assertSuccessful();

    expect($this->rendered['/og/database/mysql-client.png']['html'])
        ->toContain('<div class="tile"><img src="data:image/svg+xml;base64,' . base64_encode(File::get(base_path('public/images/databases/mysql.svg'))));

    foreach (['/og/database/index.png', '/og/feature/querying.png', '/og/blog/a-guide.png'] as $path) {
        expect($this->rendered[$path]['html'])->not->toContain('<div class="tile">');
    }
});

it('splits a release title into the version and its headline, and leaves a guide whole', function (): void {
    $this->artisan('og:generate', ['--type' => 'blog'])->assertSuccessful();

    expect($this->rendered['/og/blog/tablepro-0-77.png']['html'])
        ->toContain('<h1 class="title t1">TablePro 0.77</h1>')
        ->toContain('<p class="sub">Folders in the sidebar</p>')
        ->not->toContain('2026');

    expect($this->rendered['/og/blog/a-guide.png']['html'])
        ->toContain('<h1 class="title t1">A guide: with a colon</h1>')
        ->not->toContain('class="sub"')
        ->not->toContain('What it covers.');

    expect($this->rendered['/og/vi/blog/a-guide.png']['html'])->toContain('<html lang="vi">')->toContain('Một hướng dẫn');
});

it('embeds the fonts and the logo, so a card never depends on the machine', function (): void {
    $this->artisan('og:generate', ['--type' => 'site', '--locale' => 'en'])->assertSuccessful();

    expect($this->rendered['/og.png']['html'])
        ->toContain('data:font/woff2;base64,AAAA')
        ->toContain('data:image/png;base64,' . base64_encode(File::get($this->public . '/images/brand/tablepro-icon-256.png')))
        ->not->toContain('<img src="/')
        ->not->toContain('<link');
});

it('loads the CJK faces of the card\'s language from the configured directory', function (): void {
    $fonts = $this->dirs['root'] . '/cjk';
    File::ensureDirectoryExists($fonts);

    foreach ([500, 600] as $weight) {
        File::put("{$fonts}/noto-ja-{$weight}.otf", 'font');
    }

    $cards = new OgFonts($this->dirs['root'] . '/fonts.css', $fonts);

    expect($cards->cjk('ja'))->toContain("url('file://{$fonts}/noto-ja-500.otf')")->toContain("url('file://{$fonts}/noto-ja-600.otf')")
        ->and($cards->cjk('vi'))->toBe('')
        ->and((new OgFonts($this->dirs['root'] . '/fonts.css'))->cjk('ja'))->toBe('')
        ->and(fn() => $cards->cjk('ko'))->toThrow(RuntimeException::class);
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
