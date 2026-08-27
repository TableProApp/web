<?php


use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();
});

/**
 * The grid is the source every engine-count claim on the site derives from, so
 * these assertions are what keep the headline honest as engines are added.
 *
 * It used to advertise "25 databases" above 26 tiles: the copy counted driver
 * groups and the grid rendered entries. Dameng and Kafka then shipped in the app
 * without ever getting a tile, so the site under-sold two engines while quoting a
 * number that matched neither, and libSQL and Turso shared a single tile while
 * the app registered them separately. One tile per engine now, counted here.
 */
function gridTiles(): array
{
    return json_decode(file_get_contents(base_path('resources/data/database-grid.json')), true);
}

function databaseEntries(): array
{
    return json_decode(file_get_contents(base_path('resources/data/databases.json')), true);
}

it('ships 29 tiles covering 27 distinct drivers', function (): void {
    $tiles = gridTiles();

    expect($tiles)->toHaveCount(29);

    /*
     * Two fewer groups than tiles, and both pairs are deliberate: Cassandra with
     * ScyllaDB, and libSQL with Turso. Each pair is two engines a user picks
     * separately over one driver, which is why the engine count and
     * `DRIVER_PLUGIN_COUNT` are different numbers rather than a discrepancy.
     */
    expect(array_unique(array_column($tiles, 'driverGroup')))->toHaveCount(27);
});

it('splits distribution as 9 bundled and 20 plugin tiles', function (): void {
    $distribution = array_count_values(array_column(gridTiles(), 'distribution'));

    expect($distribution)->toBe(['builtin' => 9, 'plugin' => 20]);
});

it('gives every tile a complete shape', function (): void {
    foreach (gridTiles() as $tile) {
        expect($tile)->toHaveKeys([
            'name', 'icon', 'monogram', 'port', 'distribution', 'driverGroup', 'category', 'href',
        ]);
        expect($tile['name'])->toBeString()->not->toBeEmpty();
        expect($tile['port'])->toBeString()->not->toBeEmpty();
        expect($tile['monogram'])->toBeString()->toHaveLength(2);
        expect($tile['distribution'])->toBeIn(['builtin', 'plugin']);
    }
});

it('points every tile icon at a file that exists', function (): void {
    foreach (gridTiles() as $tile) {
        if ($tile['icon'] === null) {
            continue;
        }

        expect($tile['icon'])->toStartWith('/images/databases/');
        expect(public_path($tile['icon']))
            ->toBeReadableFile("Missing icon for {$tile['name']}: {$tile['icon']}");
    }
});

/**
 * `DatabaseMark` renders a two-letter monogram when a tile has no icon, which is
 * what lets an engine reach the grid before its artwork does. That fallback is a
 * deliberate exception per engine, not a way to skip the icon: naming the tiles
 * here means a third one cannot appear without someone deciding it should.
 */
it('lets only the engines still awaiting artwork fall back to a monogram', function (): void {
    $iconless = array_column(
        array_filter(gridTiles(), static fn(array $tile): bool => $tile['icon'] === null),
        'name',
    );

    expect($iconless)->toBe(['Dameng', 'Kafka', 'libSQL']);
});

it('assigns every tile to a known category and accounts for all 29', function (): void {
    $counts = array_count_values(array_column(gridTiles(), 'category'));

    expect($counts)->toBe([
        'relational' => 9,
        'file-embedded' => 5,
        'document-kv' => 8,
        'analytics' => 3,
        'cloud-api' => 4,
    ]);
    expect(array_sum($counts))->toBe(29);
});

it('keeps every tile link resolvable and consistent with its marketing page', function (): void {
    $entries = collect(databaseEntries())->keyBy(fn(array $entry): string => '/' . $entry['slug']);

    foreach (gridTiles() as $tile) {
        if ($tile['href'] === null) {
            continue;
        }

        expect($tile['href'])->toBeString()->toStartWith('/');

        $entry = $entries->get($tile['href']);

        expect($entry)->not->toBeNull("No databases.json entry for grid href {$tile['href']}");

        /*
         * Containment, not equality: libSQL and Turso are two tiles over one
         * page, which is still titled "libSQL / Turso" because it documents both.
         * A tile whose name the page never mentions is still drift.
         */
        expect($entry['name'])->toContain($tile['name']);

        if ($tile['icon'] !== null) {
            expect($entry['icon'])->toBe($tile['icon'], "Icon drift on {$tile['href']}");
        }
    }
});

it('serves a page for every tile link', function (): void {
    foreach (gridTiles() as $tile) {
        if ($tile['href'] === null) {
            continue;
        }

        test()->get('http://' . config('app.web_domain') . $tile['href'])
            ->assertOk();
    }
});

/**
 * A tile with no href has no marketing page yet. That is allowed, but it is the
 * kind of gap that quietly becomes permanent, so the exceptions are named.
 */
it('lets only the engines still awaiting a page go unlinked', function (): void {
    $unlinked = array_column(
        array_filter(gridTiles(), static fn(array $tile): bool => $tile['href'] === null),
        'name',
    );

    expect($unlinked)->toBe(['Dameng', 'Kafka']);
});
