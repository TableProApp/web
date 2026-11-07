<?php

use App\Services\Content\SiteFacts;
use App\Services\Releases\PlatformCatalog;
use App\Support\Features\FeatureFacts;
use App\Support\Localization\Locales;
use App\Support\Seo\PageRegistry;
use Dom\HTMLDocument;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

function pageFamilies(): array
{
    return [
        'landing.home' => ['Home', ['content.hero.title', 'engines.0.path', 'apiOrigin', 'iosEngines']],
        'landing.download' => ['Download', ['content', 'mac', 'release', 'unreleased']],
        'landing.ios' => ['Ios', ['content', 'ios', 'engines']],
        'landing.pricing' => ['Pricing', ['content', 'apiOrigin', 'paidFeatures']],
        'landing.teams' => ['Teams', ['content.header.title', 'content.seats.items', 'organizationProfiles']],
        'landing.faq' => ['Faq', ['content', 'facts', 'platforms']],
        'landing.about' => ['About', ['content', 'repositoryCreated', 'links']],
        'landing.security' => ['Security', ['content.sections.0.items', 'facts.macSafeModeLevels', 'links.email']],
        'landing.sponsors' => ['Sponsors', ['content.header.title', 'content.tiers.benefit.name', 'organizationProfiles']],
        'landing.black-friday' => ['BlackFriday', ['content.hero.title', 'paidFeatures', 'organizationProfiles', 'campaign.phase']],
        'landing.privacy' => ['Privacy', ['document.title', 'document.html', 'document.toc']],
        'landing.terms' => ['Terms', ['document.title', 'document.html', 'document.toc']],
        'landing.refundPolicy' => ['RefundPolicy', ['document.title', 'document.html', 'document.toc']],
        'landing.brand' => ['Brand', ['document.title', 'document.html', 'document.toc']],
        'landing.blog.index' => ['Blog/Index', ['content', 'posts.0']],
        'landing.blog.show' => ['Blog/Post', ['post', 'related']],
        'landing.features.index' => ['Features/Index', ['content', 'pages.0', 'facts']],
        'landing.features.show' => ['Features/Show', ['content', 'slug', 'facts', 'labels']],
        'landing.databases.index' => ['Databases/Index', ['content', 'engines.0', 'platforms']],
        'landing.databaseClient' => ['Databases/Show', ['content', 'engine', 'slug', 'platforms']],
        'landing.compare.index' => ['Compare/Index', ['content', 'products.0', 'tablepro']],
        'landing.compare' => ['Compare/Show', ['content', 'product', 'slug', 'tablepro']],
        'landing.integrations.index' => ['Integrations/Index', ['content', 'integrations', 'filters']],
        'landing.integrations.show' => ['Integrations/Show', ['content.show', 'integration', 'dates']],
    ];
}

function pagesClientManifest(): array
{
    requireSsrJob();

    $path = public_path('build/manifest.json');

    if (! is_file($path)) {
        ssrUnavailable('Client bundle missing. Run: npm run build');
    }

    return json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
}

function pagesWithdrawPlatform(string $id): string
{
    $directory = storage_path('framework/testing/data-' . uniqid());
    File::ensureDirectoryExists($directory);

    foreach (glob(resource_path('data/*.json')) ?: [] as $file) {
        File::copy($file, $directory . '/' . basename($file));
    }

    $data = json_decode(File::get("{$directory}/platforms.json"), true, 512, JSON_THROW_ON_ERROR);
    $data['platforms'] = array_map(fn(array $platform): array => $platform['id'] === $id ? [...$platform, 'status' => 'prototype'] : $platform, $data['platforms']);
    File::put("{$directory}/platforms.json", json_encode($data, JSON_THROW_ON_ERROR));

    app()->instance(PlatformCatalog::class, new PlatformCatalog("{$directory}/platforms.json"));
    app()->instance(SiteFacts::class, new SiteFacts($directory));
    app()->instance(FeatureFacts::class, new FeatureFacts($directory));

    // A route keeps the controller it built, with the catalog it was built with.
    foreach (app('router')->getRoutes() as $route) {
        $route->flushController();
    }

    return $directory;
}

function pagesOffers(mixed $props, array $devices, string $path = ''): array
{
    $found = [];

    foreach (is_array($props) ? $props : [] as $key => $value) {
        $where = ltrim("{$path}.{$key}", '.');

        if ($key === 'deviceNames' && is_array($value) && array_intersect($value, $devices) !== []) {
            $found[] = $where;
        }

        if ($key === 'appStoreUrl' && $value !== null) {
            $found[] = $where;
        }

        array_push($found, ...pagesOffers($value, $devices, $where));
    }

    return $found;
}

it('maps every page family in the registry to a page component', function (): void {
    $routes = array_unique(array_map(fn($entry): string => $entry->route, app(PageRegistry::class)->all()));

    expect(array_diff($routes, array_keys(pageFamilies())))->toBe([]);

    foreach (pageFamilies() as [$component]) {
        expect(resource_path("js/pages/{$component}.tsx"))->toBeFile();
    }
});

it('renders each page in the locales it renders in and answers 404 in the others', function (string $route, string $component, array $props): void {
    $crawl = seoCrawlProps();
    $entries = array_filter(app(PageRegistry::class)->all(), fn($entry): bool => $entry->route === $route);

    expect($entries)->not->toBeEmpty();

    foreach ($entries as $entry) {
        foreach (Locales::codes() as $locale) {
            $path = $entry->url($locale, false);
            $page = $crawl[$path];

            expect($page['lang'])->toBe($locale, "{$path} has the wrong document language")
                ->and($page['props']['locale'] ?? null)->toBe($locale, "{$path} is not in {$locale}");

            if (! $entry->renders($locale)) {
                expect($page['status'])->toBe(404, "{$path} must not render in {$locale}")
                    ->and($page['component'])->toBe('Error')
                    ->and($page['props']['seo']['robots'] ?? null)->toBe('noindex, follow');

                continue;
            }

            expect($page['status'])->toBe(200, "{$path} does not render")
                ->and($page['component'])->toBe($component, "{$path} renders the wrong component");

            foreach ($props as $prop) {
                expect(Arr::has($page['props'], $prop))->toBeTrue("{$path} has no {$prop} prop");
            }
        }
    }
})->with(fn(): array => array_map(
    fn(string $route, array $family): array => [$route, ...$family],
    array_keys(pageFamilies()),
    pageFamilies(),
));

it('drops a withdrawn platform from every page that offers it', function (string $path, array $keys): void {
    $devices = collect(json_decode(File::get(resource_path('data/platforms.json')), true)['platforms'])->firstWhere('id', 'ios')['deviceNames'];
    $directory = pagesWithdrawPlatform('ios');

    try {
        $props = $this->get($path)->assertOk()->viewData('page')['props'];
    } finally {
        File::deleteDirectory($directory);
    }

    expect(pagesOffers($props, $devices))->toBe([]);

    foreach ($keys as $key) {
        expect(Arr::has($props, $key))->toBeTrue("{$path} no longer sends {$key}")
            ->and(array_filter((array) data_get($props, $key)))->toBe([], "{$path} still offers the platform in {$key}");
    }
})->with([
    'home' => ['/', ['iosEngines']],
    'download' => ['/download', ['ios']],
    'iPhone and iPad' => ['/ios', ['ios']],
    'FAQ' => ['/faq', ['platforms.ios']],
    'database hub' => ['/databases', ['platforms.ios']],
    'database page' => ['/vi/mysql-client', ['platforms.ios', 'links.appStore']],
    'compare hub' => ['/compare', ['tablepro.ios']],
    'comparison' => ['/compare/tableplus', ['tablepro.ios']],
]);

it('answers 404 for a slug no page has', function (string $path): void {
    $this->get($path)->assertNotFound();
})->with([
    '/some-bogus-slug',
    '/compare/unknown-tool',
    '/vi/compare/unknown-tool',
    '/features/not-a-feature',
    '/blog/not-a-post',
    '/vi/blog/not-a-post',
    '/blog/Some.Invalid.Slug',
]);

it('fills every {token} on every server-rendered page built from data', function (): void {
    seoCrawlHtml();
    $unfilled = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        // Posts are prose and may quote a placeholder.
        if ($entry->route === 'landing.blog.show') {
            continue;
        }

        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);
            $main = HTMLDocument::createFromString(seoCrawledHtml($path), LIBXML_NOERROR)->querySelector('main');

            foreach ($main?->querySelectorAll('code, pre') ?? [] as $code) {
                $code->remove();
            }

            if (preg_match('/\{[A-Za-z][A-Za-z0-9_.]*\}/', (string) $main?->textContent, $match) === 1) {
                $unfilled[] = "{$path}: {$match[0]}";
            }
        }
    }

    expect($unfilled)->toBe([]);
})->group('ssr');

it('sends the page chunk and only its own language catalog with the document', function (string $path, string $component, string $locale): void {
    $manifest = pagesClientManifest();

    $this->withVite();

    $html = (string) $this->get($path)->assertOk()->getContent();
    $script = fn(string $entry): string => '<script type="module" src="' . asset('build/' . $manifest[$entry]['file']) . '"';

    expect($html)->toContain($script("resources/js/pages/{$component}.tsx"));

    foreach (array_diff(Locales::codes(), [Locales::default()]) as $code) {
        expect(str_contains($html, $script("resources/js/i18n/messages/{$code}/index.ts")))->toBe($code === $locale, "{$path} and the {$code} catalog");
    }
})->with([
    ['/pricing', 'Pricing', 'en'],
    ['/vi/download', 'Download', 'vi'],
    ['/zh-Hans', 'Home', 'zh-Hans'],
])->group('ssr');
