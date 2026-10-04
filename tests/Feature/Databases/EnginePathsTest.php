<?php

use App\Support\Content\EnginePaths;
use App\Support\Content\Slugs\DatabaseSlugs;

/*
 * Where an engine's link goes: its own page, its section on its family's page,
 * or its row on /databases, decided once by `EnginePaths` for every page that
 * links an engine. The rule was written five times and the copies disagreed on
 * a section whose parent had no page (`/#anchor`, the hub, or nothing).
 */

/** @return list<array<string, mixed>> */
function enginePathsEngines(): array
{
    return json_decode((string) file_get_contents(resource_path('data/engines.json')), true, 512, JSON_THROW_ON_ERROR);
}

it('gives every engine in engines.json the path its page kind says', function (): void {
    $engines = enginePathsEngines();
    $byId = EnginePaths::byId($engines);

    foreach ($engines as $engine) {
        $path = EnginePaths::pathFor($engine, $byId);

        match ($engine['page']) {
            'own' => expect($path)->toBe('/' . $engine['slug'])
                ->and(DatabaseSlugs::ALL)->toContain($engine['slug']),
            'section' => expect($path)->toBe('/' . $byId[$engine['parent']]['slug'] . '#' . $engine['anchor']),
            'hub' => expect($path)->toBe('/databases#' . $engine['anchor']),
        };
    }
});

it('links nothing it cannot resolve, rather than guessing', function (): void {
    $byId = ['parent' => ['id' => 'parent', 'page' => 'hub', 'slug' => null, 'anchor' => 'parent']];

    expect(EnginePaths::pathFor(['page' => 'section', 'parent' => 'parent', 'anchor' => 'child'], $byId))->toBeNull()
        ->and(EnginePaths::pathFor(['page' => 'section', 'parent' => 'missing', 'anchor' => 'child'], $byId))->toBeNull()
        ->and(EnginePaths::pathFor(['page' => 'own', 'slug' => 'not-a-routed-page'], []))->toBeNull()
        ->and(EnginePaths::pathFor(['page' => 'hub', 'anchor' => 'Not An Anchor'], []))->toBeNull()
        ->and(EnginePaths::pathFor(['page' => 'unknown'], []))->toBeNull();
});

it('is the only copy of the rule', function (string $file): void {
    $source = (string) file_get_contents(base_path($file));

    expect($source)->toContain('EnginePaths::pathFor(')
        ->and($source)->not->toMatch('/private function (enginePath|engineTarget|sectionPage|ownPage)\(/');
})->with([
    'app/Http/Controllers/HomeController.php',
    'app/Http/Controllers/DatabaseController.php',
    'app/Services/Content/SiteFacts.php',
    'app/Support/Features/FeatureFacts.php',
    'app/Support/Seo/RedirectMap.php',
]);
