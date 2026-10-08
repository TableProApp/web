<?php

use App\Support\Content\Slugs\CompareSlugs;
use Illuminate\Support\Facades\File;
use PHPUnit\Framework\Assert;
use Symfony\Component\Finder\SplFileInfo;

/**
 * resources/data/comparisons.json: dated, sourced facts about other database
 * tools, for the compare pages, the compare hub and the engine pages' "Other
 * tools" paragraphs.
 *
 * Every competitor price, date, platform, licence and capability is typed once
 * here, each with a source and a retrieval date (the vendors' own pages, and
 * Microsoft Learn for SSMS and Azure Data Studio).
 * TablePro's own column is derived from the other data files and never
 * stored here. A fact nobody verified has no cell, and the page leaves that
 * row out. There are no benchmarks: the old pages' RAM, startup and size
 * figures had no method and must not come back.
 */

/**
 * @return array{checkedAt: string, rows: list<string>, products: list<array<string, mixed>>}
 */
function comparisonsJson(): array
{
    return json_decode(File::get(resource_path('data/comparisons.json')), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * Every `source` value anywhere inside a product, with where it was found.
 *
 * @param  array<string, mixed>  $node
 * @return list<array{0: string, 1: string}>
 */
function comparisonSourceRefs(array $node, string $path = ''): array
{
    $refs = [];

    foreach ($node as $key => $value) {
        $here = $path === '' ? (string) $key : "{$path}.{$key}";

        if ($key === 'source' || $key === 'platformsSource') {
            // A cell may cite several sources: one ref for each.
            foreach ((array) $value as $id) {
                $refs[] = [$here, $id];
            }

            continue;
        }

        if (is_array($value) && $key !== 'sources') {
            $refs = array_merge($refs, comparisonSourceRefs($value, $here));
        }
    }

    return $refs;
}

/**
 * Every leaf of a JSON tree as "path" => value.
 *
 * @param  array<array-key, mixed>  $node
 * @return array<string, mixed>
 */
function comparisonLeaves(array $node, string $path = ''): array
{
    $leaves = [];

    foreach ($node as $key => $value) {
        $here = $path === '' ? (string) $key : "{$path}.{$key}";

        if (is_array($value)) {
            $leaves += comparisonLeaves($value, $here);
        } else {
            $leaves[$here] = $value;
        }
    }

    return $leaves;
}

it('has the documented top-level shape and row order', function (): void {
    $data = comparisonsJson();

    expect(array_keys($data))->toBe(['checkedAt', 'rows', 'products']);
    expect($data['rows'])->toBe(['platforms', 'price', 'licence', 'databases', 'ai', 'mcp', 'ios', 'sync', 'import']);
});

it('dates the hub with the newest product check, and nothing in the future', function (): void {
    $data = comparisonsJson();
    $today = now()->toDateString();

    expect($data['checkedAt'])->toBe(max(array_column($data['products'], 'checkedAt')));

    foreach (comparisonLeaves($data) as $path => $value) {
        if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1) {
            expect($value <= $today)->toBeTrue("{$path} ({$value}) is in the future");
            expect(checkdate((int) substr($value, 5, 2), (int) substr($value, 8, 2), (int) substr($value, 0, 4)))->toBeTrue("{$path} is not a date");
        }
    }
});

it('gives each product the documented fields', function (): void {
    $keys = ['id', 'name', 'slug', 'checkedAt', 'status', 'platforms', 'platformsSource', 'mac', 'technology', 'licence', 'prices', 'cells', 'sources'];
    $platforms = ['mac', 'windows', 'linux', 'ios', 'web'];

    $ids = array_column(comparisonsJson()['products'], 'id');

    expect($ids)->toBe(array_values(array_unique($ids)));

    foreach (comparisonsJson()['products'] as $product) {
        $id = $product['id'];

        expect(array_keys($product))->toBe($keys, "{$id} has the wrong fields");
        expect($id)->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/');
        expect($product['name'])->toBeString()->not->toBe('');
        expect($product['status']['state'])->toBeIn(['active', 'discontinued']);
        expect(array_keys($product['status']['lastRelease']))->toBe(['version', 'date', 'source']);
        expect($product['status']['lastRelease']['date'] <= $product['checkedAt'])->toBeTrue("{$id} released after it was checked");
        expect($product['platforms'])->toBe(array_values(array_unique($product['platforms'])));

        foreach ($product['platforms'] as $platform) {
            expect($platform)->toBeIn($platforms);
        }

        expect($product['platforms'] === [] ? $product['platformsSource'] === null : is_string($product['platformsSource']))
            ->toBeTrue("{$id}: verified platforms need a source, and no platforms means no source");

        if ($product['mac'] !== null) {
            expect($product['platforms'])->toContain('mac');
            expect(array_values(array_diff(array_keys($product['mac']), ['universal'])))->toBe(['minVersion', 'architectures', 'source']);

            if (array_key_exists('universal', $product['mac'])) {
                // Only a single app for both architectures is "universal"; it is never set to false.
                expect($product['mac']['universal'])->toBeTrue("{$id}.mac.universal");
                expect($product['mac']['architectures'])->toEqualCanonicalizing(['arm64', 'x86_64']);
            }

            foreach ($product['mac']['architectures'] as $architecture) {
                expect($architecture)->toBeIn(['arm64', 'x86_64']);
            }
        }

        expect(array_keys($product['licence']))->toBe(['name', 'openSource', 'edition', 'source']);
        expect($product['licence']['openSource'])->toBeBool();
    }
});

it('prices in US dollars with a known unit and period', function (): void {
    foreach (comparisonsJson()['products'] as $product) {
        foreach ($product['prices'] as $index => $price) {
            $where = "{$product['id']}.prices.{$index}";

            expect(is_int($price['amount']) || is_float($price['amount']))->toBeTrue($where);
            expect($price['amount'])->toBeGreaterThanOrEqual(0);
            expect($price['currency'])->toBe('USD', $where);
            expect($price['per'])->toBeIn([null, 'device', 'user', 'seat', 'license'], $where);
            expect($price['period'])->toBeIn([null, 'once', 'month', 'year'], $where);
            expect($price)->toHaveKey('edition');
            expect($price)->toHaveKey('source');
        }
    }
});

it('gives every cell one of three states and a source', function (): void {
    foreach (comparisonsJson()['products'] as $product) {
        foreach ($product['cells'] as $row => $cell) {
            $where = "{$product['id']}.cells.{$row}";

            expect($cell['state'])->toBeIn(['yes', 'no', 'qualified'], $where);
            expect($cell)->toHaveKey('source');
            expect(array_diff(array_keys($cell), ['state', 'edition', 'note', 'value', 'version', 'date', 'engines', 'source']))->toBe([], "{$where} has an unknown field");

            $sources = (array) $cell['source'];

            expect($sources)->not->toBeEmpty("{$where} cites nothing");
            expect($sources)->toBe(array_values(array_unique($sources)), "{$where} cites a source twice");
            expect($sources)->each->toBeString();

            if (isset($cell['note'])) {
                expect($cell['note'])->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/', "{$where}.note is an id, not a sentence");
            }

            if (isset($cell['value'])) {
                expect(is_int($cell['value']) || is_float($cell['value']))->toBeTrue("{$where}.value");
            }
        }
    }
});

it('resolves every source to an HTTPS page with a retrieval date', function (): void {
    foreach (comparisonsJson()['products'] as $product) {
        $sources = collect($product['sources'])->keyBy('id');

        expect($sources)->toHaveCount(count($product['sources']), "{$product['id']} repeats a source id");

        foreach ($product['sources'] as $source) {
            expect(array_keys($source))->toBe(['id', 'url', 'title', 'retrievedAt']);
            expect($source['url'])->toStartWith('https://');
            expect(filter_var($source['url'], FILTER_VALIDATE_URL))->not->toBeFalse($source['url']);
            expect($source['title'])->toBeString()->not->toBe('');
            expect($source['retrievedAt'] <= $product['checkedAt'])->toBeTrue("{$product['id']} {$source['id']} was retrieved after the check date");
        }

        $refs = comparisonSourceRefs($product);

        expect($refs)->not->toBeEmpty();

        foreach ($refs as [$path, $id]) {
            expect($sources->has($id))->toBeTrue("{$product['id']}.{$path} cites {$id}, which is not in its sources");
        }
    }
});

it('links every source to a page a reader can open, never a data feed', function (): void {
    foreach (comparisonsJson()['products'] as $product) {
        foreach ($product['sources'] as $source) {
            $where = "{$product['id']} {$source['id']} ({$source['url']})";

            $host = (string) parse_url($source['url'], PHP_URL_HOST);

            // GitHub renders a repository's LICENSE.md as a page.
            if ($host !== 'github.com') {
                expect(preg_match('/\.(json|md|xml|txt)$/i', (string) parse_url($source['url'], PHP_URL_PATH)))->toBe(0, "{$where} is a raw file");
            }

            expect(preg_match('/^(api|data|raw)\./i', $host))->toBe(0, "{$where} is an API host");
        }
    }
});

it('lets only a cell cite several sources', function (): void {
    foreach (comparisonsJson()['products'] as $product) {
        $single = [
            'status.lastRelease' => $product['status']['lastRelease']['source'],
            'licence' => $product['licence']['source'],
            'mac' => $product['mac']['source'] ?? '',
            'technology' => $product['technology']['source'] ?? '',
            'platformsSource' => $product['platformsSource'] ?? '',
        ];

        foreach ($product['prices'] as $index => $price) {
            $single["prices.{$index}"] = $price['source'];
        }

        foreach ($single as $path => $source) {
            expect($source)->toBeString("{$product['id']}.{$path}.source is a list, and only a cell renders one");
        }
    }
});

it('calls a named licence that is not open source only what the page can label', function (): void {
    foreach (comparisonsJson()['products'] as $product) {
        if (! $product['licence']['openSource'] && $product['licence']['name'] !== null) {
            // "Source available ({licence})" on the engine pages: the code is published under it.
            expect($product['licence']['name'])->toBeIn(['SSPL-1.0'], "{$product['id']}: is its source published under {$product['licence']['name']}?");
        }
    }
});

it('keeps true that TablePlus runs on older systems than TablePro', function (): void {
    $platforms = collect(json_decode(File::get(resource_path('data/platforms.json')), true, 512, JSON_THROW_ON_ERROR)['platforms'])->keyBy('id');
    $tableplus = collect(comparisonsJson()['products'])->firstWhere('id', 'tableplus');

    // content/*/compare/tableplus.json says so under "Where TablePlus is stronger".
    expect(version_compare($tableplus['mac']['minVersion'], $platforms['mac']['requirements']['minVersion'], '<'))->toBeTrue();
    expect(version_compare((string) $tableplus['cells']['ios']['value'], $platforms['ios']['requirements']['minVersion'], '<'))->toBeTrue();
});

it('names engines only on a compared product’s databases cell, each from engines.json', function (): void {
    $engines = array_column(json_decode(File::get(resource_path('data/engines.json')), true, 512, JSON_THROW_ON_ERROR), 'id');
    $named = 0;

    foreach (comparisonsJson()['products'] as $product) {
        foreach ($product['cells'] as $row => $cell) {
            if (! array_key_exists('engines', $cell)) {
                continue;
            }

            $where = "{$product['id']}.cells.{$row}.engines";
            $named++;

            expect($row)->toBe('databases', "{$where}: only the databases cell names engines");
            expect($product['slug'])->not->toBeNull("{$where}: the list links a comparison page, and this product has none");
            expect($cell['engines'])->not->toBeEmpty($where);
            expect(array_values(array_diff($cell['engines'], $engines)))->toBe([], "{$where} names an engine engines.json does not have");
        }
    }

    expect($named)->toBeGreaterThan(0);
});

it('has the ten compared products of the sitemap, each with a route', function (): void {
    $slugs = array_values(array_filter(array_column(comparisonsJson()['products'], 'slug')));

    expect($slugs)->toBe([
        'tableplus', 'dbeaver', 'datagrip', 'navicat', 'beekeeper-studio', 'sequel-ace', 'sequel-pro', 'postico', 'heidisql', 'phpmyadmin',
    ]);
    expect(array_diff($slugs, CompareSlugs::ALL))->toBe([]);
    expect($slugs)->not->toContain('azimutt');

    foreach (comparisonsJson()['products'] as $product) {
        if ($product['slug'] !== null) {
            expect($product['slug'])->toBe($product['id']);
        }
    }
});

it('covers the tools the engine pages cite', function (): void {
    $cited = collect(comparisonsJson()['products'])->whereNull('slug')->pluck('id')->all();

    expect($cited)->toEqualCanonicalizing(['mongodb-compass', 'redis-insight', 'pgadmin', 'adminer', 'ssms', 'azure-data-studio']);
});

/*
 * Sitemap §A.3 lists MySQL Workbench among /mysql-client's other tools, but
 * nothing here sources it, and on 2026-10-02 its own pages disagreed (the
 * download page offered 26.7.0, the release notes ended at 8.0.47 of
 * 2026-04-23). With no entry here, the page has no fact to state, so it must
 * not name the tool until a sourced `mysql-workbench` entry lands.
 */
it('keeps every engine page off a tool it has no data for', function (): void {
    /*
     * Adding a sourced entry is the way to lift this: drop the next line and
     * this test together.
     */
    expect(array_column(comparisonsJson()['products'], 'id'))->not->toContain('mysql-workbench');

    $content = resource_path('data/content');
    $files = is_dir($content) ? File::allFiles($content) : [];

    foreach ($files as $file) {
        Assert::assertStringNotContainsStringIgnoringCase(
            'MySQL Workbench',
            $file->getContents(),
            "{$file->getRelativePathname()} names MySQL Workbench, which resources/data/comparisons.json has no sourced entry for.",
        );
    }
});

it('pins the facts the pages lean on', function (): void {
    $products = collect(comparisonsJson()['products'])->keyBy('id');
    $prices = fn(string $id): array => collect($products[$id]['prices'])->map(fn(array $price): array => [$price['edition'], $price['amount'], $price['period']])->all();

    expect($products['sequel-pro']['status'])->toMatchArray(['state' => 'discontinued']);
    expect($products['sequel-pro']['status']['lastRelease'])->toMatchArray(['version' => '1.1.2', 'date' => '2016-04-03']);
    expect($products['sequel-pro']['mac']['architectures'])->toBe(['x86_64']);
    expect($products['heidisql']['mac']['architectures'])->toBe(['arm64']);
    expect($products['sequel-ace']['mac']['minVersion'])->toBe('13.5');
    expect($products['postico']['mac']['minVersion'])->toBe('14');

    expect($prices('tableplus'))->toContain([null, 0, null], ['Basic', 99, 'once'], [null, 59, 'once']);
    expect($prices('datagrip'))->toContain([null, 109, 'year'], [null, 10.9, 'month']);
    expect($prices('navicat'))->toContain(['Premium Lite', 0, null], ['Premium Standard', 1499, 'once'], ['Premium Enterprise', 1999, 'once']);

    expect($products['dbeaver']['licence'])->toMatchArray(['name' => 'Apache-2.0', 'openSource' => true, 'edition' => 'Community']);

    /*
     * Added later from the vendors' own pages (tableplus.com/pricing,
     * Navicat's store; dbeaver.com/edition re-read 2026-10-02): the free
     * tier's limit the TablePlus note carries as {value}, the audience that
     * keeps Navicat's non-commercial price out of the hub's "From" column,
     * and the two DBeaver paid-edition features the compare page names.
     */
    expect(collect($products['tableplus']['prices'])->firstWhere('amount', 0))->toMatchArray(['value' => 2, 'note' => 'tableplus-free-limits']);
    expect(collect($products['navicat']['prices'])->firstWhere('edition', 'Premium Non-Commercial'))->toMatchArray(['audience' => 'non-commercial']);
    expect($products['dbeaver']['cells']['queryBuilder'])->toMatchArray(['state' => 'qualified', 'source' => 's3']);
    expect($products['dbeaver']['cells']['scheduler'])->toMatchArray(['state' => 'qualified', 'source' => 's3']);
    expect($products['navicat']['cells']['ai'])->toMatchArray(['state' => 'yes', 'version' => '17.2.2']);
    expect($products['datagrip']['cells']['mcp'])->toMatchArray(['state' => 'yes', 'version' => '2025.2']);
    expect($products['tableplus']['cells']['mcp'])->toMatchArray(['state' => 'yes', 'version' => '7.1.8']);
    expect($products['ssms']['platforms'])->toBe(['windows']);

    /*
     * pgAdmin ships desktop builds for all three systems and runs as a web
     * server (pgadmin.org/download/), not only the macOS build its Mac page
     * describes. The PostgreSQL page's "Other tools" paragraph reads this.
     */
    expect($products['pgadmin']['platforms'])->toBe(['mac', 'windows', 'linux', 'web']);
    expect($products['pgadmin']['platformsSource'])->toBe('s2');
    expect($products['azure-data-studio']['status']['state'])->toBe('discontinued');
    expect($products['azure-data-studio']['cells']['successor']['date'])->toBe('2026-02-28');

    /*
     * Re-read on the vendors' pages on 2026-10-08. Navicat sells monthly and
     * yearly subscriptions beside the perpetual licenses, so the hub's "From"
     * is a monthly price like its neighbours'; the non-commercial ones keep
     * their audience, which keeps them out of that column. DBeaver's paid
     * editions get an MCP server in 26.3. TablePlus syncs through a cloud
     * folder. Compass and Redis Insight publish their code under the SSPL,
     * which is neither open source nor closed.
     */
    expect($prices('navicat'))->toContain(['Premium Standard', 74.99, 'month'], ['Premium Standard', 749.99, 'year'], ['Premium Enterprise', 99.99, 'month']);
    expect(collect($products['navicat']['prices'])->where('edition', 'Premium Non-Commercial')->pluck('audience')->unique()->all())->toBe(['non-commercial']);
    expect(collect($products['navicat']['prices'])->firstWhere('amount', 0))->toMatchArray(['value' => 5, 'note' => 'navicat-lite-commercial-use']);
    expect($products['navicat']['cells']['ai'])->toMatchArray(['note' => 'navicat-ai-editions', 'source' => ['s3', 's8']]);
    expect($products['dbeaver']['cells']['mcp'])->toMatchArray(['state' => 'qualified', 'version' => '26.3', 'note' => 'dbeaver-mcp-server']);
    expect($products['tableplus']['cells']['sync'])->toMatchArray(['state' => 'qualified', 'note' => 'tableplus-sync-folder']);
    // The vendor's site still says 10.13; the current build and its Homebrew cask need 12.
    expect($products['tableplus']['mac'])->toMatchArray(['minVersion' => '12', 'source' => 's10']);
    expect($products['tableplus']['cells']['ios'])->toMatchArray(['value' => 15, 'source' => 's5']);
    expect($products['mongodb-compass']['licence'])->toMatchArray(['name' => 'SSPL-1.0', 'openSource' => false]);
    expect($products['redis-insight']['licence'])->toMatchArray(['name' => 'SSPL-1.0', 'openSource' => false]);
    expect($products['mongodb-compass']['platforms'])->toBe(['mac', 'windows', 'linux']);
});

it('never names TablePro and never stores a benchmark', function (): void {
    $leaves = comparisonLeaves(comparisonsJson());

    foreach ($leaves as $path => $value) {
        expect(stripos($path, 'tablepro'))->toBeFalse("{$path} names TablePro; its column is derived, never stored");
        expect(preg_match('/\b(ram|memory|startup|coldStart|benchmark|size|bytes|downloadSize)\b/i', str_replace('.', ' ', $path)))
            ->toBe(0, "{$path} looks like a benchmark field");

        if (is_string($value)) {
            expect(stripos($value, 'tablepro'))->toBeFalse("{$path} names TablePro");
            expect(preg_match('/\d+(\.\d+)?\s?(MB|GB|ms)\b|\d+(\.\d+)?\s?[x×]\s|faster|lighter/i', $value))->toBe(0, "{$path} = {$value} looks like a benchmark");
        }
    }
});

/**
 * The compare page files present in one locale, without the hub.
 *
 * @return list<string>
 */
function comparePageFiles(string $locale): array
{
    $directory = resource_path("data/content/{$locale}/compare");

    if (! File::isDirectory($directory)) {
        return [];
    }

    return collect(File::files($directory))
        ->map(fn(SplFileInfo $file): string => $file->getBasename('.json'))
        ->reject(fn(string $name): bool => $name === 'index')
        ->sort()
        ->values()
        ->all();
}

it('routes exactly the compared products', function (): void {
    $compared = collect(comparisonsJson()['products'])->whereNotNull('slug')->pluck('slug')->all();

    expect(CompareSlugs::ALL)->toBe($compared);
});

it('has a page file only for a compared product, and explains every note it cites in that language', function (): void {
    $compared = collect(comparisonsJson()['products'])->whereNotNull('slug')->keyBy('slug');

    foreach (['en', 'vi'] as $locale) {
        foreach (comparePageFiles($locale) as $slug) {
            expect($compared->has($slug))->toBeTrue("content/{$locale}/compare/{$slug}.json has no product with that slug");

            $copy = json_decode(File::get(resource_path("data/content/{$locale}/compare/{$slug}.json")), true, 512, JSON_THROW_ON_ERROR);
            $notes = collect(comparisonLeaves($compared[$slug]))
                ->filter(fn(mixed $value, string $path): bool => str_ends_with($path, '.note') && is_string($value))
                ->unique()
                ->sort()
                ->values()
                ->all();
            $written = array_keys($copy['notes'] ?? []);
            sort($written);

            expect($written)->toBe($notes, "content/{$locale}/compare/{$slug}.json must explain exactly the notes its product cites");

            foreach ($notes as $note) {
                expect($copy['notes'][$note])->toBeString()->not->toBe('', "{$locale}/{$slug}: empty note {$note}");
            }
        }
    }
})->skip(
    fn(): bool => comparePageFiles('en') === [] && comparePageFiles('vi') === [],
    'No compare page has copy yet.',
);

/*
 * Every compared product has its page in both launch languages, written to
 * components/compare/README.md. A failure names the missing files.
 */
it('gives every compared product a page in both languages', function (): void {
    $compared = collect(comparisonsJson()['products'])->whereNotNull('slug')->pluck('slug')->sort()->values()->all();

    foreach (['en', 'vi'] as $locale) {
        $missing = array_values(array_diff($compared, comparePageFiles($locale)));

        expect($missing)->toBe([], "content/{$locale}/compare is missing: " . implode(', ', $missing));
    }
});
