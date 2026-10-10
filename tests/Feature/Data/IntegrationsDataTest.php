<?php

use App\Support\Content\IntegrationCatalog;
use Illuminate\Support\Facades\File;
use Opis\JsonSchema\Errors\ErrorFormatter;
use Opis\JsonSchema\Validator;

// A byte copy of schema/index.schema.json in TableProApp/integrations at f6c6d0f, never fetched from a release.
const INTEGRATIONS_SCHEMA = 'tests/Support/integrations-index.v1.schema.json';

dataset('integration indexes', [
    'the site' => ['resources/data/integrations.json', 'public/images/integrations'],
    'a two-entry release' => ['tests/Fixtures/integrations/index.json', 'tests/Fixtures/integrations/images'],
]);

/**
 * @return array{integrations: list<array<string, mixed>>}
 */
function integrationsIndex(string $index): array
{
    return json_decode(File::get(base_path($index)), true, 512, JSON_THROW_ON_ERROR);
}

it('matches the index schema the registry publishes', function (string $index, string $images): void {
    $validator = new Validator();
    $validator->setMaxErrors(20);

    $result = $validator->validate(
        json_decode(File::get(base_path($index)), false, 512, JSON_THROW_ON_ERROR),
        File::get(base_path(INTEGRATIONS_SCHEMA)),
    );
    $errors = $result->hasError() ? (new ErrorFormatter())->format($result->error()) : [];

    expect($errors)->toBe([]);
})->with('integration indexes');

it('gives every integration its own slug, safe in a URL', function (string $index, string $images): void {
    $slugs = array_column(integrationsIndex($index)['integrations'], 'slug');

    foreach ($slugs as $slug) {
        expect($slug)->toMatch('/^[a-z0-9]+(?:-[a-z0-9]+)*$/');
    }

    expect($slugs)->toBe(array_values(array_unique($slugs)));
})->with('integration indexes');

it('ships every image the index names, as the PNG it describes, and no other file', function (string $index, string $images): void {
    $named = [];

    foreach (integrationsIndex($index)['integrations'] as $integration) {
        foreach ([...array_values($integration['icon']), ...$integration['screenshots']] as $image) {
            $path = base_path("{$images}/{$image['file']}");
            $named[] = $image['file'];

            expect(is_file($path))->toBeTrue("{$integration['slug']}: {$image['file']} is missing");
            expect(hash_file('sha256', $path))->toBe($image['sha256'], $image['file']);
            expect(array_slice(getimagesize($path) ?: [], 0, 3))->toBe([$image['width'], $image['height'], IMAGETYPE_PNG], $image['file']);
        }
    }

    $directory = base_path($images);
    $files = is_dir($directory) ? array_values(array_diff(scandir($directory) ?: [], ['.', '..'])) : [];
    $named = array_values(array_unique($named));
    sort($files);
    sort($named);

    expect($files)->toBe($named);
})->with('integration indexes');

it('links only to https addresses', function (string $index, string $images): void {
    $wrong = [];

    foreach (integrationsIndex($index)['integrations'] as $integration) {
        $urls = array_filter([
            $integration['install']['url'],
            $integration['source']['url'] ?? null,
            $integration['publisher']['url'] ?? null,
            $integration['host']['url'] ?? null,
            $integration['status']['link'] ?? null,
            ...array_values($integration['links']),
        ], fn(mixed $url): bool => $url !== null);

        foreach ($urls as $url) {
            $https = is_string($url)
                && filter_var($url, FILTER_VALIDATE_URL) !== false
                && parse_url($url, PHP_URL_SCHEME) === 'https'
                && parse_url($url, PHP_URL_USER) === null;

            if (! $https) {
                $wrong[] = "{$integration['slug']}: " . json_encode($url);
            }
        }
    }

    expect($wrong)->toBe([]);
})->with('integration indexes');

it('reads the site data through the container', function (): void {
    $slugs = array_column(integrationsIndex('resources/data/integrations.json')['integrations'], 'slug');

    expect(array_column(app(IntegrationCatalog::class)->all(), 'slug'))->toBe($slugs);
});

it('finds an integration by its slug', function (): void {
    $catalog = new IntegrationCatalog(base_path('tests/Fixtures/integrations/index.json'));

    expect(array_column($catalog->all(), 'slug'))->toBe(['command-line', 'shortcuts']);
    expect($catalog->find('shortcuts')['name'] ?? null)->toBe('Shortcuts');
    expect($catalog->find('raycast'))->toBeNull();
});

it('refuses an index it cannot read safely', function (array $index): void {
    $path = tempnam(sys_get_temp_dir(), 'integrations') ?: throw new RuntimeException('No temp file.');
    File::put($path, json_encode($index, JSON_THROW_ON_ERROR));

    try {
        expect(fn(): array => (new IntegrationCatalog($path))->all())->toThrow(UnexpectedValueException::class);
    } finally {
        File::delete($path);
    }
})->with([
    'a later schema version' => [['schemaVersion' => 2, 'integrations' => []]],
    'a repeated slug' => [['schemaVersion' => 1, 'integrations' => [['slug' => 'raycast'], ['slug' => 'raycast']]]],
]);
