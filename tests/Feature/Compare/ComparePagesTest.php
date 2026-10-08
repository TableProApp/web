<?php

use App\Support\Content\Slugs\CompareSlugs;
use Dom\HTMLDocument;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/**
 * `/compare`, `/compare/{slug}` and their Vietnamese twins (sitemap §A.4,
 * §C.4, §E.3, §E.8).
 *
 * The props carry the product's dated, sourced entry from comparisons.json,
 * the page's copy and the hub's template labels, and every date already
 * formatted for the page's language. Expectations are read from the data
 * files rather than typed, so a re-check of a competitor's price never needs a
 * test edit. The server-rendered cases (behind `requireSsr()`) check what a
 * reader and a crawler actually get: the section ids other pages link to, the
 * prices formatted from data, the sources, and no review or rating markup.
 */
beforeEach(function (): void {
    withoutVite();
    // Only GitHub: a bare Http::fake() would also answer the SSR gateway's
    // request with an empty body, and every server-rendered case would read
    // the client-only shell.
    Http::fake(['api.github.com/*' => Http::response([], 503)]);
});

/**
 * @return array<string, mixed>
 */
function comparisonsData(): array
{
    return json_decode(File::get(resource_path('data/comparisons.json')), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @return array<string, mixed>
 */
function comparedProduct(string $slug): array
{
    return collect(comparisonsData()['products'])->firstWhere('slug', $slug);
}

function hasCompareCopy(string $slug, string $locale): bool
{
    return File::isFile(resource_path("data/content/{$locale}/compare/{$slug}.json"));
}

function formattedDate(string $iso, string $locale): string
{
    return Carbon::createFromFormat('!Y-m-d', $iso)->locale($locale)->isoFormat('LL');
}

it('renders the hub with every compared product, without per-page cells, and dates in the page language', function (string $path, string $locale): void {
    $data = comparisonsData();
    $compared = collect($data['products'])->whereNotNull('slug')->values();
    $mac = collect(json_decode(File::get(resource_path('data/platforms.json')), true)['platforms'])->firstWhere('id', 'mac');

    get($path)
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Compare/Index')
            ->where('locale', $locale)
            ->has('content.bySituation.items', $compared->count())
            ->has('content.labels.factsChecked')
            ->has('products', $compared->count())
            ->where('products', fn($products): bool => collect($products)->pluck('slug')->all() === $compared->pluck('slug')->all())
            ->where('products', fn($products): bool => collect($products)->every(fn(array $product): bool => ! array_key_exists('cells', $product) && $product['sources'] !== []))
            ->where('checkedAt', $data['checkedAt'])
            ->where("dates.{$data['checkedAt']}", formattedDate($data['checkedAt'], $locale))
            ->where('tablepro.mac.version', $mac['release']['version'])
            ->where("dates.{$mac['release']['publishedAt']}", formattedDate($mac['release']['publishedAt'], $locale))
            ->has('freeNotes', $compared->count()));
})->with([
    'English' => ['/compare', 'en'],
    'Vietnamese' => ['/vi/compare', 'vi'],
]);

it('labels each hub link with the H1 of the page it opens', function (string $prefix, string $locale): void {
    $titles = [];

    foreach (CompareSlugs::ALL as $slug) {
        $titles[$slug] = json_decode(File::get(resource_path("data/content/{$locale}/compare/{$slug}.json")), true)['header']['title'];
    }

    get("{$prefix}/compare")->assertInertia(fn(AssertableInertia $page) => $page->where('titles', $titles));
})->with([
    'English' => ['', 'en'],
    'German' => ['/de', 'de'],
]);

it('sends every other comparison to a comparison page, and never the page itself', function (): void {
    foreach (CompareSlugs::ALL as $slug) {
        $others = array_values(array_diff(CompareSlugs::ALL, [$slug]));

        get("/compare/{$slug}")->assertInertia(fn(AssertableInertia $page) => $page
            ->where('others', fn($sent): bool => collect($sent)->pluck('slug')->all() === $others && collect($sent)->every(fn(array $other): bool => $other['title'] !== '')));
    }
});

it('shows the free tier note on the hub once the page copy has it', function (): void {
    $note = collect(comparedProduct('tableplus')['prices'])->firstWhere('amount', 0)['note'];
    $copy = json_decode(File::get(resource_path('data/content/en/compare/tableplus.json')), true);

    get('/compare')->assertInertia(fn(AssertableInertia $page) => $page->where('freeNotes.tableplus', $copy['notes'][$note]));
});

it('renders each comparison from its product data, its copy and the hub labels', function (string $locale): void {
    foreach (CompareSlugs::ALL as $slug) {
        $path = ($locale === 'en' ? '' : "/{$locale}") . "/compare/{$slug}";

        if (! hasCompareCopy($slug, $locale)) {
            continue;
        }

        $product = comparedProduct($slug);

        get($path)
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->component('Compare/Show')
                ->where('locale', $locale)
                ->where('slug', $slug)
                ->where('product.id', $product['id'])
                ->where('product.name', $product['name'])
                ->where('product.sources', $product['sources'])
                ->where('rows', comparisonsData()['rows'])
                ->has('labels.factsChecked')
                ->has('content.notes')
                ->where("dates.{$product['checkedAt']}", formattedDate($product['checkedAt'], $locale))
                ->where("dates.{$product['status']['lastRelease']['date']}", formattedDate($product['status']['lastRelease']['date'], $locale))
                ->has('tablepro.featuredEngines'));
    }
})->with(['en', 'vi']);

it('answers 410 for the retired Azimutt comparison', function (): void {
    expect(CompareSlugs::ALL)->not->toContain('azimutt');

    get('/compare/azimutt')->assertStatus(410);
});

it('names the featured engines from engines.json for TablePro’s column', function (): void {
    $expected = collect(json_decode(File::get(resource_path('data/engines.json')), true))
        ->filter(fn(array $engine): bool => $engine['featured'] === true && $engine['state'] === 'published')
        ->pluck('name')
        ->values()
        ->all();

    get('/compare/tableplus')->assertInertia(fn(AssertableInertia $page) => $page->where('tablepro.featuredEngines', $expected));
});

it('server-renders the hub with the sections other pages link to, and no rating or review markup', function (): void {
    foreach (['/compare', '/vi/compare'] as $path) {
        $html = ssrHtml($path);

        expect($html)
            ->toContain('id="by-situation"')
            ->toContain('id="at-a-glance"')
            ->toContain('id="open-source"')
            ->toContain('id="switching"')
            ->toContain('id="method"')
            ->toContain('"@type":"CollectionPage"')
            ->not->toContain('"Review"')
            ->not->toContain('aggregateRating')
            ->not->toContain('FAQPage');

        foreach (collect(comparisonsData()['products'])->whereNotNull('slug') as $product) {
            expect($html)->toContain('/compare/' . $product['slug'] . '"');
        }
    }
});

it('server-renders TablePro’s own case on the hub, with a way to download it', function (): void {
    $copy = json_decode(File::get(resource_path('data/content/en/compare/index.json')), true);
    $importers = collect(json_decode(File::get(resource_path('data/facts.json')), true)['connectionImport'])->pluck('app');
    $main = HTMLDocument::createFromString(ssrHtml('/compare'), LIBXML_NOERROR)->querySelector('main');
    $text = (string) preg_replace('/\s+/u', ' ', $main->textContent);

    expect($text)
        ->toContain(explode('{apps}', $copy['bySituation']['tablepro'])[0])
        ->toContain($importers->last())
        ->toContain($copy['labels']['sources']['trademarks'])
        // The link reads as the page's H1, not as a head-to-head the page is not.
        ->toContain('Sequel Pro alternatives for Mac')
        ->not->toContain('TablePro vs Sequel Pro')
        ->not->toContain('{apps}');

    expect($main->querySelectorAll('a[href="/download"]')->length)->toBeGreaterThanOrEqual(2);
    expect($main->querySelector('#get-started a[href="/download"]'))->not->toBeNull();
    expect($main->querySelector('nav a[href="#at-a-glance"]'))->not->toBeNull();

    $vietnamese = HTMLDocument::createFromString(ssrHtml('/vi/compare'), LIBXML_NOERROR)->querySelector('main');

    expect($vietnamese->querySelector('#get-started a[href="/vi/download"]'))->not->toBeNull();
});

it('server-renders Navicat’s subscription as its entry price, and DBeaver’s MCP server with both sources', function (): void {
    $navicat = comparedProduct('navicat');
    $monthly = collect($navicat['prices'])->where('period', 'month')->whereNull('audience')->min('amount');

    expect(html_entity_decode(ssrHtml('/compare'), ENT_QUOTES | ENT_HTML5))->toContain('From $' . $monthly . ' a month per user');
    expect(html_entity_decode(ssrHtml('/compare/navicat'), ENT_QUOTES | ENT_HTML5))
        ->toContain('Premium Standard: $' . $monthly . ' a month per user')
        ->toContain('Premium Standard: $1,499 once per user');

    $dbeaver = comparedProduct('dbeaver');
    $row = HTMLDocument::createFromString(ssrHtml('/compare/dbeaver'), LIBXML_NOERROR)->querySelector('#row-mcp td:last-child');

    expect($row->textContent)->toContain('version ' . $dbeaver['cells']['mcp']['version'])->not->toContain('does not run an MCP server');
    expect($row->querySelectorAll('sup a')->length)->toBe(count($dbeaver['cells']['mcp']['source']));
});

it('server-renders each comparison with a jump list, the word a searcher types, the trademark notice and the other comparisons', function (): void {
    $labels = json_decode(File::get(resource_path('data/content/en/compare/index.json')), true)['labels'];

    foreach (CompareSlugs::ALL as $slug) {
        $main = HTMLDocument::createFromString(ssrHtml("/compare/{$slug}"), LIBXML_NOERROR)->querySelector('main');

        expect($main->querySelector('header nav a[href="#short-answer"]'))->not->toBeNull("{$slug}: no jump list");
        expect(stripos($main->textContent, 'alternative'))->not->toBeFalse("{$slug} never says alternative");
        expect($main->querySelector('#sources')->textContent)->toContain($labels['sources']['trademarks']);
        expect($main->querySelectorAll('#more a[href^="/compare/"]')->length)->toBe(count(CompareSlugs::ALL) - 1);
        expect($main->querySelector('#more a[href="/compare/' . $slug . '"]'))->toBeNull();
    }
});

it('server-renders TablePro’s device limit beside a competitor’s, and yes or no where a cell has no words', function (): void {
    $activations = json_decode(File::get(resource_path('data/pricing.json')), true)['tiers']['starter']['activations'];
    $document = HTMLDocument::createFromString(ssrHtml('/compare/tableplus'), LIBXML_NOERROR);

    expect($document->querySelector('#row-price td')->textContent)->toContain("once, for up to {$activations} devices");
    expect(trim($document->querySelector('#row-setapp td:last-child')->textContent))->toStartWith('Yes')->not->toContain('Supported');
    expect($document->querySelector('#row-sync td:last-child')->textContent)->toContain('Dropbox');
});

it('server-renders a comparison with prices from data, its sources and the switching steps', function (): void {
    $product = comparedProduct('tableplus');
    $basic = collect($product['prices'])->firstWhere('edition', 'Basic');
    $pricing = json_decode(File::get(resource_path('data/pricing.json')), true);
    $starterMonthly = $pricing['tiers']['starter']['prices']['monthly'];

    $html = ssrHtml('/compare/tableplus');

    expect($html)
        ->toContain('TablePro vs TablePlus')
        ->toContain('id="short-answer"')
        ->toContain('id="at-a-glance"')
        ->toContain('id="switching"')
        ->toContain('id="sources"')
        ->toContain('$' . $basic['amount'] . ' once per license')
        ->toContain('Starter: $' . $starterMonthly . ' a month')
        ->toContain('File &gt; Import &gt; Import from Other App…')
        ->toContain('"@type":"BreadcrumbList"')
        ->not->toContain('"Review"')
        ->not->toContain('aggregateRating')
        ->not->toContain('FAQPage');

    foreach ($product['sources'] as $source) {
        expect($html)->toContain('href="' . $source['url'] . '"');
    }

    // TablePro's platforms are one list from platforms.json, never "Mac and iPhone and iPad".
    expect($html)->toContain('Mac, iPhone and iPad')->not->toContain('Mac and iPhone and iPad');

    expect(ssrHtml('/vi/compare/tableplus'))
        ->not->toContain('Mac và iPhone và iPad')
        ->toContain($basic['amount'] . "\u{a0}US$ mua một lần")
        ->toContain('Tệp &gt; Nhập &gt; Nhập từ ứng dụng khác…')
        ->toContain('(tiếng Anh)');
});

it('fills every {token} of a comparison, the header lead included', function (string $path): void {
    $main = HTMLDocument::createFromString(ssrHtml($path), LIBXML_NOERROR)->querySelector('main');

    expect($main)->not->toBeNull();
    expect($main->textContent)->not->toMatch('/\{[A-Za-z][A-Za-z0-9_.]*\}/', "{$path}: a {token} reached the page unfilled");
})->with(function (): array {
    $paths = [];

    foreach (CompareSlugs::ALL as $slug) {
        $paths[] = "/compare/{$slug}";
        $paths[] = "/vi/compare/{$slug}";
    }

    return $paths;
});

it('names the Mac app’s interface languages from platforms.json', function (string $path, string $locale): void {
    $names = json_decode(File::get(resource_path("data/content/{$locale}/compare/index.json")), true)['labels']['languages'];
    $codes = collect(json_decode(File::get(resource_path('data/platforms.json')), true)['platforms'])->firstWhere('id', 'mac')['appLanguages'];
    $html = html_entity_decode(ssrHtml($path), ENT_QUOTES | ENT_HTML5);
    // The page props carry the template; the rendered page must not.
    $html = substr($html, (int) strpos($html, '<main'), (int) strrpos($html, '</main>') - (int) strpos($html, '<main'));

    expect($html)->not->toContain('{macLanguages}');

    foreach ($codes as $code) {
        expect($names)->toHaveKey($code);
        expect($html)->toContain($names[$code]);
    }
})->with([
    ['/compare/phpmyadmin', 'en'],
    ['/vi/compare/phpmyadmin', 'vi'],
]);
