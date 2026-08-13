<?php


use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();
});

/**
 * The homepage grid advertises "25 databases" while rendering 26 tiles, because
 * Cassandra and ScyllaDB share a driver. These assertions are what keep that
 * claim honest as engines are added.
 */
function gridTiles(): array
{
    return json_decode(file_get_contents(base_path('resources/data/database-grid.json')), true);
}

function databaseEntries(): array
{
    return json_decode(file_get_contents(base_path('resources/data/databases.json')), true);
}

it('ships 26 tiles covering 25 distinct drivers', function (): void {
    $tiles = gridTiles();

    expect($tiles)->toHaveCount(26);
    expect(array_unique(array_column($tiles, 'driverGroup')))->toHaveCount(25);
});

it('splits distribution as 9 bundled and 17 plugin tiles', function (): void {
    $distribution = array_count_values(array_column(gridTiles(), 'distribution'));

    expect($distribution)->toBe(['builtin' => 9, 'plugin' => 17]);
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
        expect($tile['icon'])->toStartWith('/images/databases/');
        expect(public_path($tile['icon']))
            ->toBeReadableFile("Missing icon for {$tile['name']}: {$tile['icon']}");
    }
});

it('assigns every tile to a known category and accounts for all 26', function (): void {
    $counts = array_count_values(array_column(gridTiles(), 'category'));

    expect($counts)->toBe([
        'relational' => 8,
        'file-embedded' => 4,
        'document-kv' => 7,
        'analytics' => 3,
        'cloud-api' => 4,
    ]);
    expect(array_sum($counts))->toBe(26);
});

it('keeps every tile link resolvable and consistent with its marketing page', function (): void {
    $entries = collect(databaseEntries())->keyBy(fn(array $entry): string => '/' . $entry['slug']);

    foreach (gridTiles() as $tile) {
        expect($tile['href'])->toBeString()->toStartWith('/');

        $entry = $entries->get($tile['href']);

        expect($entry)->not->toBeNull("No databases.json entry for grid href {$tile['href']}");
        expect($entry['name'])->toBe($tile['name'], "Name drift on {$tile['href']}");
        expect($entry['icon'])->toBe($tile['icon'], "Icon drift on {$tile['href']}");
    }
});

it('serves a page for every tile link', function (): void {
    foreach (gridTiles() as $tile) {
        test()->get('http://' . config('app.web_domain') . $tile['href'])
            ->assertOk();
    }
});
