<?php

use App\Support\Seo\PageRegistry;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

require_once __DIR__ . '/../Seo/helpers.php';

beforeEach(function (): void {
    withoutVite();
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

/**
 * @return array<string, array{0: string, 1: list<string>}>
 */
function landingFamilies(): array
{
    return [
        'landing.home' => ['Home', ['content.hero.title', 'engines.0.path', 'checkout', 'iosEngines']],
        'landing.download' => ['Download', ['content', 'mac', 'release', 'unreleased']],
        'landing.ios' => ['Ios', ['content', 'ios', 'engines']],
        'landing.pricing' => ['Pricing', ['content', 'checkout', 'paidFeatures']],
        'landing.faq' => ['Faq', ['content', 'facts', 'platforms']],
        'landing.about' => ['About', ['content', 'publisher.name', 'repositoryCreated', 'links']],
        'landing.security' => ['Security', ['content.sections.0.items', 'facts.macSafeModeLevels', 'links.email']],
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

it('knows every page family the registry lists', function (): void {
    $routes = array_values(array_unique(array_map(
        fn($entry): string => $entry->route,
        app(PageRegistry::class)->all(),
    )));

    sort($routes);
    $known = array_keys(landingFamilies());
    sort($known);

    expect($routes)->toBe($known, 'A page family was added or retired; update landingFamilies()');

    foreach (landingFamilies() as [$component]) {
        Assert::assertFileExists(resource_path("js/pages/{$component}.tsx"), "{$component} is not a page component");
    }
});

it('renders every page of a family with its component and the props it needs', function (): void {
    $crawl = seoCrawlProps();
    $families = landingFamilies();
    $rendered = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        [$component, $props] = $families[$entry->route] ?? [null, []];

        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);
            $page = $crawl[$path];

            Assert::assertSame($component, $page['component'], "{$path} renders the wrong component");

            foreach ($props as $prop) {
                Assert::assertTrue(Arr::has($page['props'], $prop), "{$path} has no {$prop} prop");
            }

            $rendered[$entry->route][$locale] = true;
        }
    }

    // Every family renders in English, and every family but the release posts, the brand guidelines and integration pages in Vietnamese too.
    foreach (array_keys($families) as $route) {
        expect($rendered[$route] ?? [])->toHaveKey('en', "{$route} renders nowhere in English");

        if (! in_array($route, ['landing.blog.show', 'landing.brand', 'landing.integrations.show'], true)) {
            expect($rendered[$route] ?? [])->toHaveKey('vi', "{$route} renders nowhere in Vietnamese");
        }
    }
});

it('renders and indexes the Vietnamese blog listing', function (): void {
    get('/vi/blog')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Blog/Index')
            ->where('locale', 'vi')
            ->where('seo.robots', 'index, follow')
            ->has('posts', count(glob(resource_path('blog/*.md')) ?: [])));
});
