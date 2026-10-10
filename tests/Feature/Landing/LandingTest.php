<?php

use App\Support\Seo\PageRegistry;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/**
 * Every page family renders, in each locale its registry entries render in
 * (architecture §1.17 "LandingTest").
 *
 * The families are the registry's routes, so a family nobody lists here
 * fails the first case instead of going unchecked. Each family names the
 * component it renders and the props that component cannot do without, and
 * every one of its pages is requested in English and in Vietnamese where it
 * renders, `/vi/blog` included. No request leaves the machine: the download
 * page's GitHub calls are faked.
 *
 * `Seo/SeoSmokeTest` holds the registry-wide status and robots rule; the
 * family tests (HomepageRenderTest, BlogTest, FeaturePagesTest and the rest)
 * hold what each page says.
 */
beforeEach(function (): void {
    withoutVite();
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

/**
 * Base route name => [component, the props it needs].
 *
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
});

it('renders every page of a family in each locale it renders in', function (string $route): void {
    [$component, $props] = landingFamilies()[$route];
    $rendered = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        if ($entry->route !== $route) {
            continue;
        }

        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);
            $response = get($path);

            Assert::assertSame(200, $response->getStatusCode(), "{$path} does not render");
            Assert::assertStringContainsString("<html lang=\"{$locale}\"", (string) $response->getContent(), "{$path} has the wrong document language");

            $response->assertInertia(function (AssertableInertia $page) use ($component, $props, $locale): void {
                $page->component($component)->where('locale', $locale);

                foreach ($props as $prop) {
                    $page->has($prop);
                }
            });

            $rendered[$locale] = true;
        }
    }

    // Every family renders in English, and every family but the release posts and the brand guidelines in Vietnamese too.
    expect($rendered)->toHaveKey('en');

    if (! in_array($route, ['landing.blog.show', 'landing.brand'], true)) {
        expect($rendered)->toHaveKey('vi');
    }
})->with(fn(): array => array_keys(landingFamilies()));

it('renders and indexes the Vietnamese blog listing', function (): void {
    get('/vi/blog')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Blog/Index')
            ->where('locale', 'vi')
            ->where('seo.robots', 'index, follow')
            ->has('posts', count(glob(resource_path('blog/*.md')) ?: [])));
});

it('no longer sends the retired homepage props', function (string $path): void {
    get($path)
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Home')
            ->missing('downloadUrls')
            ->missing('latestRelease')
            ->missing('paymentProvider'));
})->with(['/', '/vi']);
