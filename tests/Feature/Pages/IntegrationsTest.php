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

it('groups each entry under its first labelled category, in the registry order', function (): void {
    seoWriteIntegrations($this->root, [
        ['slug' => 'command-line'],
        ['slug' => 'acme-cli', 'name' => 'Acme CLI', 'categories' => ['local-development', 'command-line']],
        ['slug' => 'mystery', 'name' => 'Mystery', 'categories' => ['quantum']],
    ]);

    get('/integrations')->assertInertia(fn(AssertableInertia $page) => $page
        ->missing('filters')
        ->where('integrations', fn($integrations): bool => collect($integrations)->pluck('group', 'slug')->all() === ['acme-cli' => 'local-development', 'command-line' => 'command-line']));
});

it('names the Linux app and its version when the registry lists Linux', function (): void {
    seoWriteIntegrations($this->root, [['slug' => 'command-line', 'platforms' => ['macos', 'linux'], 'minTableProVersion' => ['macos' => '0.37.0', 'linux' => '0.1.0']]]);

    get('/integrations/command-line')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('integration.platforms', ['mac', 'linux'])
        ->where('integration.versions', ['mac' => '0.37.0', 'linux' => '0.1.0', 'ios' => null]));
});

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

it('lists the hub as one band per category, with no search or filters', function (): void {
    $document = Dom\HTMLDocument::createFromString(ssrHtml('/integrations'), LIBXML_NOERROR);
    $sections = array_map(fn(Dom\Element $section): string => $section->id, iterator_to_array($document->querySelectorAll('main > section')));

    expect($sections)->toBe(['top', 'command-line', 'automation', 'publish'])
        ->and($document->querySelector('main form, main input, main select'))->toBeNull()
        ->and($document->querySelector('#command-line a[href="/integrations/acme-cli"]'))->not->toBeNull();
})->group('ssr');

it('sets a detail page as a hero, two sets of rows and the way to report a problem', function (): void {
    $document = Dom\HTMLDocument::createFromString(ssrHtml('/integrations/acme-cli'), LIBXML_NOERROR);
    $sections = array_map(fn(Dom\Element $section): string => $section->id, iterator_to_array($document->querySelectorAll('main > section')));

    expect($sections)->toBe(['top', 'details', 'uses', 'support'])
        ->and($document->getElementById('about'))->not->toBeNull()
        ->and($document->getElementById('top')->textContent)->toContain('brew install --cask acme-cli')
        ->and($document->querySelector('#support a[href*="issues/new?template=report-integration.yml&slug=acme-cli"]'))->not->toBeNull()
        ->and($document->getElementById('support')->textContent)->toContain('not by TablePro');
})->group('ssr');
