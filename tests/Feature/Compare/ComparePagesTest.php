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

function formattedDate(string $iso, string $locale): string
{
    return Carbon::createFromFormat('!Y-m-d', $iso)->locale($locale)->isoFormat('LL');
}

it('renders the hub with every compared product, its links titled by the H1 they open, and dates in the page language', function (string $path, string $locale): void {
    $data = comparisonsData();
    $compared = collect($data['products'])->whereNotNull('slug')->values();
    $mac = collect(json_decode(File::get(resource_path('data/platforms.json')), true)['platforms'])->firstWhere('id', 'mac');
    $titles = [];

    foreach (CompareSlugs::ALL as $slug) {
        $titles[$slug] = json_decode(File::get(resource_path("data/content/{$locale}/compare/{$slug}.json")), true)['header']['title'];
    }

    $note = collect(comparedProduct('tableplus')['prices'])->firstWhere('amount', 0)['note'];
    $tableplus = json_decode(File::get(resource_path("data/content/{$locale}/compare/tableplus.json")), true);

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
            ->has('freeNotes', $compared->count())
            ->where('freeNotes.tableplus', $tableplus['notes'][$note])
            ->where('titles', $titles));
})->with([
    'English' => ['/compare', 'en'],
    'Vietnamese' => ['/vi/compare', 'vi'],
]);

it('server-renders each comparison from its data and copy, with a jump list, the trademark notice, the other comparisons and every {token} filled', function (string $slug): void {
    requireSsr();

    $product = comparedProduct($slug);
    $others = array_values(array_diff(CompareSlugs::ALL, [$slug]));
    $featured = collect(json_decode(File::get(resource_path('data/engines.json')), true))
        ->filter(fn(array $engine): bool => $engine['featured'] === true && $engine['state'] === 'published')
        ->pluck('name')
        ->values()
        ->all();

    $render = function (string $path, string $locale) use ($slug, $product, $others, $featured): Dom\Element {
        $response = get($path)
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
                ->where('tablepro.featuredEngines', $featured)
                ->where('others', fn($sent): bool => collect($sent)->pluck('slug')->all() === $others && collect($sent)->every(fn(array $other): bool => $other['title'] !== '')));

        $main = HTMLDocument::createFromString((string) $response->getContent(), LIBXML_NOERROR)->querySelector('main');

        expect($main)->not->toBeNull();
        expect($main->textContent)->not->toMatch('/\{[A-Za-z][A-Za-z0-9_.]*\}/', "{$path}: a {token} reached the page unfilled");

        return $main;
    };

    $main = $render("/compare/{$slug}", 'en');
    $labels = json_decode(File::get(resource_path('data/content/en/compare/index.json')), true)['labels'];

    expect($main->querySelector('header nav a[href="#short-answer"]'))->not->toBeNull("{$slug}: no jump list");
    expect(stripos($main->textContent, 'alternative'))->not->toBeFalse("{$slug} never says alternative");
    expect($main->querySelector('#sources')->textContent)->toContain($labels['sources']['trademarks']);
    expect($main->querySelectorAll('#more a[href^="/compare/"]')->length)->toBe(count(CompareSlugs::ALL) - 1);
    expect($main->querySelector('#more a[href="/compare/' . $slug . '"]'))->toBeNull();

    $render("/vi/compare/{$slug}", 'vi');
})->with(CompareSlugs::ALL)->group('ssr');

it('server-renders the hub with the sections other pages link to, TablePro’s own case, entry prices from data and no rating or review markup', function (): void {
    $rendered = [];

    foreach (['/compare' => '/download', '/vi/compare' => '/vi/download'] as $path => $download) {
        $html = $rendered[$path] = ssrHtml($path);

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

        expect(HTMLDocument::createFromString($html, LIBXML_NOERROR)->querySelector("main #get-started a[href=\"{$download}\"]"))->not->toBeNull();
    }

    $html = $rendered['/compare'];
    $copy = json_decode(File::get(resource_path('data/content/en/compare/index.json')), true);
    $importers = collect(json_decode(File::get(resource_path('data/facts.json')), true)['connectionImport'])->pluck('app');
    $main = HTMLDocument::createFromString($html, LIBXML_NOERROR)->querySelector('main');
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
    expect($main->querySelector('nav a[href="#at-a-glance"]'))->not->toBeNull();

    $navicat = collect(comparedProduct('navicat')['prices'])->where('period', 'month')->whereNull('audience')->min('amount');
    $dbgate = collect(comparedProduct('dbgate')['prices'])->where('period', 'month')->whereNull('minUnits')->min('amount');

    expect(html_entity_decode($html, ENT_QUOTES | ENT_HTML5))
        ->toContain('From $' . $navicat . ' a month per user')
        ->toContain('From $' . $dbgate . ' a month per user');
})->group('ssr');

it('server-renders Navicat’s subscription price, and DBeaver’s MCP server with both sources', function (): void {
    $navicat = comparedProduct('navicat');
    $monthly = collect($navicat['prices'])->where('period', 'month')->whereNull('audience')->min('amount');

    expect(html_entity_decode(ssrHtml('/compare/navicat'), ENT_QUOTES | ENT_HTML5))
        ->toContain('Premium Standard: $' . $monthly . ' a month per user')
        ->toContain('Premium Standard: $1,499 once per user');

    $dbeaver = comparedProduct('dbeaver');
    $row = HTMLDocument::createFromString(ssrHtml('/compare/dbeaver'), LIBXML_NOERROR)->querySelector('#row-mcp td:last-child');

    expect($row->textContent)->toContain('version ' . $dbeaver['cells']['mcp']['version'])->not->toContain('does not run an MCP server');
    expect($row->querySelectorAll('sup a')->length)->toBe(count($dbeaver['cells']['mcp']['source']));
})->group('ssr');

it('server-renders the added comparisons with the facts they turn on', function (): void {
    $workbench = comparedProduct('mysql-workbench');
    $document = HTMLDocument::createFromString(ssrHtml('/compare/mysql-workbench'), LIBXML_NOERROR);

    // The new Workbench ships an Apple silicon build only, and 8.0 ends at its last release.
    expect($document->querySelector('#row-platforms td:last-child')->textContent)->toContain('Apple silicon only');
    expect($document->querySelector('#row-workbench8 td:last-child')->textContent)->toContain($workbench['cells']['workbench8']['version']);

    // SSMS has no Mac version, so its page is framed as the alternatives, never as a head-to-head.
    $ssms = HTMLDocument::createFromString(ssrHtml('/compare/ssms'), LIBXML_NOERROR)->querySelector('main');

    expect(trim($ssms->querySelector('h1')->textContent))->toBe('SQL Server Management Studio alternatives for Mac');
    expect($ssms->textContent)->toContain('Keep SQL Server Management Studio for')->not->toContain('TablePro vs SQL Server Management Studio');
    expect($ssms->querySelector('#row-ios'))->not->toBeNull();

    $sequelPro = HTMLDocument::createFromString(ssrHtml('/compare/sequel-pro'), LIBXML_NOERROR)->querySelector('main');
    expect($sequelPro->querySelector('#short-answer')->textContent)
        ->toContain('Consider Sequel Ace for')
        ->toContain('Reasons to use TablePro or Sequel Ace.');
})->group('ssr');

it('server-renders a comparison with prices from data, its sources, the switching steps, TablePro’s device limit and yes or no where a cell has no words', function (): void {
    $product = comparedProduct('tableplus');
    $basic = collect($product['prices'])->firstWhere('edition', 'Basic');
    $pricing = json_decode(File::get(resource_path('data/pricing.json')), true);
    $starterMonthly = $pricing['tiers']['starter']['prices']['monthly'];
    $activations = $pricing['tiers']['starter']['activations'];

    $html = ssrHtml('/compare/tableplus');
    $document = HTMLDocument::createFromString($html, LIBXML_NOERROR);

    expect($document->querySelector('#row-price td')->textContent)->toContain("once, for up to {$activations} devices");
    expect(trim($document->querySelector('#row-setapp td:last-child')->textContent))->toStartWith('Yes')->not->toContain('Supported');
    expect($document->querySelector('#row-sync td:last-child')->textContent)->toContain('Dropbox');

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
})->group('ssr');

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
])->group('ssr');
