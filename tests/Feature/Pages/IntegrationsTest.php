<?php

use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;

beforeEach(function (): void {
    $this->root = storage_path('framework/testing/integrations-' . uniqid());
    File::ensureDirectoryExists($this->root);

    seoWriteIntegrations($this->root, [
        ['slug' => 'command-line'],
        [
            'slug' => 'acme-cli',
            'name' => 'Acme CLI',
            'summary' => 'Open Acme databases in TablePro from a terminal.',
            'tier' => 'community',
            'publisher' => ['name' => 'Acme', 'github' => 'acme', 'githubId' => 1, 'url' => 'https://acme.example'],
            'source' => ['type' => 'closed'],
            'closedSource' => true,
            'license' => null,
            'install' => ['type' => 'homebrew', 'kind' => 'cask', 'token' => 'acme-cli', 'url' => 'https://formulae.brew.sh/cask/acme-cli'],
            'categories' => ['command-line', 'local-development'],
            'keywords' => ['docker'],
        ],
        ['slug' => 'old-tool', 'name' => 'Old tool', 'status' => ['state' => 'archived', 'since' => '2026-09-01', 'reason' => 'superseded', 'replacement' => 'command-line']],
        json_decode(File::get(base_path('tests/Fixtures/integrations/index.json')), true)['integrations'][1],
    ]);
});

afterEach(function (): void {
    File::deleteDirectory($this->root);
});

it('lists every active entry, Official first, and leaves archived ones out', function (): void {
    get('/integrations')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Integrations/Index')
            ->where('integrations', fn($integrations): bool => collect($integrations)->pluck('slug')->all() === ['command-line', 'shortcuts', 'acme-cli']));
});

it('lists an entry in another language only while its tagline translates the current summary', function (): void {
    get('/vi/integrations')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('integrations', fn($integrations): bool => collect($integrations)->pluck('slug')->all() === ['command-line', 'shortcuts']));

    seoWriteIntegrations($this->root, [['slug' => 'command-line', 'summary' => 'Open database URLs in TablePro from Terminal.']]);

    get('/vi/integrations')->assertInertia(fn(AssertableInertia $page) => $page->where('integrations', []));
    get('/integrations')->assertInertia(fn(AssertableInertia $page) => $page->where('integrations.0.tagline', 'Open database URLs in TablePro from Terminal.'));
});

it('keeps only filter values that some listed entry has', function (string $query, array $filters): void {
    get("/integrations?{$query}")->assertInertia(fn(AssertableInertia $page) => $page->where('filters', $filters));
})->with([
    'every filter' => ['q=+acme+&category=local-development&platform=mac&tier=community', ['q' => 'acme', 'category' => 'local-development', 'platform' => 'mac', 'tier' => 'community']],
    'values no entry has' => ['category=launchers&platform=windows&tier=partner', ['q' => null, 'category' => null, 'platform' => null, 'tier' => null]],
    'arrays and empty values' => ['q[]=x&category=&tier[]=official', ['q' => null, 'category' => null, 'platform' => null, 'tier' => null]],
    'a long query' => ['q=' . str_repeat('a', 150), ['q' => str_repeat('a', 100), 'category' => null, 'platform' => null, 'tier' => null]],
]);

it('renders a detail page with its install command', function (): void {
    get('/integrations/acme-cli')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Integrations/Show')
            ->where('seo.robots', 'index, follow')
            ->where('integration.install', ['type' => 'homebrew', 'url' => 'https://formulae.brew.sh/cask/acme-cli', 'command' => 'brew install --cask acme-cli']));
});

it('keeps an archived entry reachable but unindexed, naming its replacement', function (): void {
    get('/integrations/old-tool')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('seo.robots', 'noindex, follow')
            ->where('integration.archived.replacement', ['slug' => 'command-line', 'name' => 'Command line']));
});

it('answers a detail page in another language with a 404 that offers the English page', function (): void {
    get('/vi/integrations/command-line')
        ->assertNotFound()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Error')
            ->where('suggestion.href', '/integrations/command-line')
            ->where('suggestion.locale', 'en'));
});

it('answers an unknown integration with a plain 404', function (string $path): void {
    get($path)->assertNotFound()->assertInertia(fn(AssertableInertia $page) => $page->component('Error')->missing('suggestion'));
})->with(['/integrations/raycast', '/vi/integrations/raycast', '/integrations/Command-Line']);
