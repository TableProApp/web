<?php

use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;

require_once __DIR__ . '/../Seo/helpers.php';

/**
 * @return array<string, mixed>
 */
function communityIntegration(array $overrides = []): array
{
    return array_replace([
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
        'disclosures' => [
            'reads' => ['connections'],
            'writes' => [],
            'lowersSafeMode' => true,
            'safeModeNote' => 'Opens local development databases with Safe Mode off.',
            'network' => 'internet',
            'networkNote' => 'Checks acme.example for updates.',
            'account' => false,
            'payment' => 'free',
        ],
        'links' => ['homepage' => 'https://acme.example', 'issues' => 'https://acme.example/support'],
    ], $overrides);
}

beforeEach(function (): void {
    $this->root = storage_path('framework/testing/integrations-' . uniqid());
    File::ensureDirectoryExists($this->root);

    seoWriteIntegrations($this->root, [
        ['slug' => 'command-line'],
        communityIntegration(),
        ['slug' => 'old-tool', 'name' => 'Old tool', 'status' => ['state' => 'archived', 'since' => '2026-09-01', 'reason' => 'superseded', 'replacement' => 'command-line']],
        json_decode(File::get(base_path('tests/Fixtures/integrations/index.json')), true)['integrations'][1],
    ]);
});

afterEach(function (): void {
    File::deleteDirectory($this->root);
});

it('lists every active entry in English, Official first, and leaves archived ones out', function (): void {
    get('/integrations')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Integrations/Index')
            ->missing('content.taglines')
            ->missing('content.show')
            ->where('integrations', fn($integrations): bool => collect($integrations)->pluck('slug')->all() === ['command-line', 'shortcuts', 'acme-cli'])
            ->where('integrations.2.tagline', 'Open Acme databases in TablePro from a terminal.')
            ->where('integrations.2.platforms', ['mac'])
            ->where('integrations.1.platforms', ['ios'])
            ->where('integrations.0.icon.src', fn(string $src): bool => str_starts_with($src, '/images/integrations/command-line-icon-128-'))
            ->where('filters', ['q' => null, 'category' => null, 'platform' => null, 'tier' => null]));
});

it('lists an entry in another language only with a tagline translated from the current summary', function (string $locale): void {
    $prefix = Locales::definition($locale)['prefix'];
    $taglines = json_decode(File::get(resource_path("data/content/{$locale}/integrations/index.json")), true)['taglines'];

    get("/{$prefix}/integrations")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('integrations', fn($integrations): bool => collect($integrations)->pluck('slug')->all() === ['command-line', 'shortcuts'])
            ->where('integrations.0.tagline', $taglines['command-line']));
})->with(array_values(array_diff(array_keys(json_decode((string) file_get_contents(__DIR__ . '/../../../resources/data/locales.json'), true)['supported']), ['en'])));

it('hides an entry from other languages once its English summary changes', function (): void {
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

it('renders a detail page in English with dates, install action and only https links', function (): void {
    get('/integrations/acme-cli')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Integrations/Show')
            ->where('seo.robots', 'index, follow')
            ->where('integration.tier', 'community')
            ->where('integration.install', ['type' => 'homebrew', 'url' => 'https://formulae.brew.sh/cask/acme-cli', 'command' => 'brew install --cask acme-cli'])
            ->where('integration.lowersSafeMode', true)
            ->where('integration.network', 'internet')
            ->where('integration.reads', ['connections'])
            ->where('integration.source', null)
            ->where('integration.publisher.url', 'https://acme.example')
            ->where('integration.links.issues', 'https://acme.example/support')
            ->where('dates.added', 'October 10, 2026')
            ->has('content.show.install')
            ->missing('content.taglines'));
});

it('keeps an archived entry reachable but out of the index, naming its replacement', function (): void {
    get('/integrations/old-tool')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('seo.robots', 'noindex, follow')
            ->where('integration.archived.reason', 'superseded')
            ->where('integration.archived.replacement', ['slug' => 'command-line', 'name' => 'Command line'])
            ->where('dates.archived', 'September 1, 2026'));
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

it('lists detail pages in the sitemap in English only, without archived ones', function (): void {
    $urls = array_keys(seoGenerateSitemap());
    $url = fn(string $route, array $params, string $locale): string => LocalizedUrl::route($route, $params, $locale);

    expect($urls)->toContain($url('landing.integrations.index', [], 'en'), $url('landing.integrations.index', [], 'vi'));
    expect(array_values(array_filter($urls, fn(string $candidate): bool => str_contains($candidate, '/integrations/'))))->toEqualCanonicalizing([
        $url('landing.integrations.show', ['slug' => 'command-line'], 'en'),
        $url('landing.integrations.show', ['slug' => 'acme-cli'], 'en'),
        $url('landing.integrations.show', ['slug' => 'shortcuts'], 'en'),
    ]);
});

describe('the rendered pages', function (): void {
    it('filters on the server from the query, with a GET form that works without JavaScript', function (): void {
        $html = ssrHtml('/integrations?q=acme');

        preg_match('#<form role="search"[^>]*>#', $html, $form);

        expect($form[0] ?? '')->toContain('action="/integrations"')->toContain('method="get"');
        expect($html)->toContain('name="q"')->toContain('value="acme"');
        expect($html)->toContain('href="/integrations/acme-cli"');
        expect($html)->not->toContain('href="/integrations/command-line"');
    });

    it('links Community entries with rel="ugc nofollow" and states who supports them', function (): void {
        $community = ssrHtml('/integrations/acme-cli');
        $official = ssrHtml('/integrations/command-line');

        expect($community)->toContain('href="https://acme.example/support" rel="ugc nofollow"');
        expect($community)->toContain('Acme CLI is built by Acme, not by TablePro.');
        expect($community)->toContain('brew install --cask acme-cli');
        expect($official)->not->toContain('ugc nofollow');
        expect($official)->not->toContain('is built by TablePro, not by TablePro');
        expect($official)->toContain('href="https://github.com/TableProApp/integrations/issues/new?template=report-integration.yml&amp;slug=command-line"');
    });
});
