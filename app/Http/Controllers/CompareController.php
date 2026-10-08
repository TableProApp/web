<?php

namespace App\Http\Controllers;

use App\Services\Releases\PlatformCatalog;
use App\Support\Content\ContentRepository;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

/**
 * The comparison hub, `/compare`, and each comparison, such as
 * `/compare/tableplus` (sitemap §A.4, §E.3, §E.8).
 *
 * Every fact about another product is its entry in
 * `resources/data/comparisons.json`, sent with its sources, so the pages can
 * cite each fact. The copy is `content/{locale}/compare/{slug}.json`, and the
 * template's labels are the hub file's `labels` block. TablePro's own column
 * is derived on the page from TablePro's data files; the only TablePro facts
 * read here are the ones the page should not bundle (the featured engine
 * names from `engines.json`) and the release versions it states.
 *
 * Every date a page shows is formatted here, in the page's locale, so the
 * server render and the browser agree (architecture §1.5).
 */
class CompareController extends Controller
{
    public function index(ContentRepository $content, PlatformCatalog $platforms): Response
    {
        $locale = App::getLocale();
        $data = $this->comparisons();
        $products = $this->comparedProducts($data);
        $checkedAt = is_string($data['checkedAt'] ?? null) ? $data['checkedAt'] : null;
        $tablepro = $this->tablepro($platforms);

        return Inertia::render('Compare/Index', [
            'content' => $content->page('compare/index', $locale),
            'products' => array_map(fn(array $product): array => Arr::except($product, ['cells']), $products),
            'freeNotes' => $this->freeNotes($content, $products, $locale),
            'titles' => $this->titles($content, $products, $locale),
            'checkedAt' => $checkedAt,
            'dates' => $this->dates([$products, $checkedAt, $tablepro], $locale),
            'tablepro' => $tablepro,
        ]);
    }

    public function show(ContentRepository $content, PlatformCatalog $platforms, string $slug): Response
    {
        $locale = App::getLocale();
        $data = $this->comparisons();
        $products = $this->comparedProducts($data);
        $product = collect($products)->firstWhere('slug', $slug);

        abort_if($product === null, 404);

        $tablepro = $this->tablepro($platforms);

        return Inertia::render('Compare/Show', [
            'slug' => $slug,
            'content' => $content->page("compare/{$slug}", $locale),
            'labels' => $content->page('compare/index', $locale)['labels'] ?? [],
            'product' => $product,
            'rows' => array_values(array_filter($data['rows'] ?? [], 'is_string')),
            'others' => $this->others($content, $products, $slug, $locale),
            'dates' => $this->dates([$product, $tablepro], $locale),
            'tablepro' => $tablepro,
        ]);
    }

    /**
     * `resources/data/comparisons.json`, decoded, or an empty shape when it is
     * missing or malformed. `Data/ComparisonsDataTest` keeps it valid.
     *
     * @return array{checkedAt?: string, rows?: list<string>, products?: list<array<string, mixed>>}
     */
    private function comparisons(): array
    {
        $decoded = $this->json('comparisons.json');

        return is_array($decoded['products'] ?? null) ? $decoded : [];
    }

    /**
     * The products with a comparison page, in data order.
     *
     * @param  array{products?: list<array<string, mixed>>}  $data
     * @return list<array<string, mixed>>
     */
    private function comparedProducts(array $data): array
    {
        return array_values(array_filter(
            $data['products'] ?? [],
            fn(mixed $product): bool => is_array($product) && is_string($product['slug'] ?? null),
        ));
    }

    /**
     * For each compared product, the text of its free tier's note in this
     * locale, or null when the product has no such note or its page's copy
     * does not exist yet. The hub shows it beside "Free to use".
     *
     * @param  list<array<string, mixed>>  $products
     * @return array<string, string|null>
     */
    private function freeNotes(ContentRepository $content, array $products, string $locale): array
    {
        $notes = [];

        foreach ($products as $product) {
            $slug = (string) $product['slug'];
            $free = collect($product['prices'] ?? [])->first(fn(mixed $price): bool => is_array($price) && ($price['amount'] ?? null) === 0);
            $note = is_array($free) && is_string($free['note'] ?? null) ? $free['note'] : null;
            $copy = $note !== null ? $content->entry('compare', $slug, $locale) : null;
            $text = $copy['notes'][$note] ?? null;

            $notes[$slug] = is_string($text) ? $text : null;
        }

        return $notes;
    }

    /**
     * Each comparison's H1 in this locale, keyed by slug, so a link to a page
     * reads as the page does ("Sequel Pro alternatives for Mac"). A product
     * whose page has no copy in this locale is left out.
     *
     * @param  list<array<string, mixed>>  $products
     * @return array<string, string>
     */
    private function titles(ContentRepository $content, array $products, string $locale): array
    {
        $titles = [];

        foreach ($products as $product) {
            $slug = (string) $product['slug'];
            $title = $content->entry('compare', $slug, $locale)['header']['title'] ?? null;

            if (is_string($title) && $title !== '') {
                $titles[$slug] = $title;
            }
        }

        return $titles;
    }

    /**
     * The other comparisons, in data order, for the links that close a page.
     *
     * @param  list<array<string, mixed>>  $products
     * @return list<array{slug: string, title: string}>
     */
    private function others(ContentRepository $content, array $products, string $current, string $locale): array
    {
        $others = [];

        foreach ($this->titles($content, $products, $locale) as $slug => $title) {
            if ($slug !== $current) {
                $others[] = ['slug' => $slug, 'title' => $title];
            }
        }

        return $others;
    }

    /**
     * The TablePro facts the page states but should not bundle: the featured
     * engine names, and the Mac and iPhone and iPad releases the column
     * describes (`platforms.json` → `release`).
     *
     * @return array{featuredEngines: list<string>, mac: array{version: string, date: string}|null, ios: array{version: string, date: string}|null}
     */
    private function tablepro(PlatformCatalog $platforms): array
    {
        return [
            'featuredEngines' => $this->featuredEngines(),
            'mac' => $this->release($platforms, 'mac'),
            'ios' => $this->release($platforms, 'ios'),
        ];
    }

    /**
     * @return array{version: string, date: string}|null
     */
    private function release(PlatformCatalog $platforms, string $id): ?array
    {
        if (! $platforms->isReleased($id)) {
            return null;
        }

        $release = $platforms->find($id)['release'] ?? null;

        if (! is_array($release) || ! is_string($release['version'] ?? null) || ! is_string($release['publishedAt'] ?? null)) {
            return null;
        }

        return ['version' => $release['version'], 'date' => $release['publishedAt']];
    }

    /**
     * The names of the featured, published engines in data order: TablePro's
     * "{engines} and more" cell (positioning §1).
     *
     * @return list<string>
     */
    private function featuredEngines(): array
    {
        $names = [];

        foreach ($this->json('engines.json') as $engine) {
            if (is_array($engine) && ($engine['featured'] ?? false) === true && ($engine['state'] ?? null) === 'published' && is_string($engine['name'] ?? null)) {
                $names[] = $engine['name'];
            }
        }

        return $names;
    }

    /**
     * Every `YYYY-MM-DD` string anywhere in `$values`, formatted for the
     * locale with `isoFormat('LL')`: "October 2, 2026", "2 tháng 10 năm 2026".
     *
     * @param  array<array-key, mixed>  $values
     * @return array<string, string>
     */
    private function dates(array $values, string $locale): array
    {
        $dates = [];

        array_walk_recursive($values, function (mixed $value) use (&$dates, $locale): void {
            if (! is_string($value) || isset($dates[$value]) || preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) !== 1) {
                return;
            }

            try {
                $date = Carbon::createFromFormat('!Y-m-d', $value);
            } catch (InvalidArgumentException) {
                return;
            }

            if ($date !== null && $date->format('Y-m-d') === $value) {
                $dates[$value] = $date->locale($locale)->isoFormat('LL');
            }
        });

        ksort($dates);

        return $dates;
    }

    /**
     * A file in `resources/data`, decoded, or an empty array when it is
     * missing or malformed.
     *
     * @return array<array-key, mixed>
     */
    private function json(string $file): array
    {
        $path = resource_path('data/' . $file);

        if (! File::isFile($path)) {
            return [];
        }

        $decoded = json_decode((string) File::get($path), true);

        return is_array($decoded) ? $decoded : [];
    }
}
