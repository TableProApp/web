<?php

use App\Support\Localization\Locales;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

/**
 * Every page the registry lists answers, in exactly the locales it lists.
 *
 * The registry is what the sitemap, hreflang and the language switcher
 * advertise, so a page it lists that does not render is a broken link in all
 * three at once. And a locale it does not list must not render either: that
 * is how a Vietnamese URL would end up wrapping English copy.
 */
beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

it('renders every registry page in each locale it renders in', function (): void {
    $checked = 0;

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);
            $response = $this->get($path);

            Assert::assertSame(200, $response->getStatusCode(), "{$path} does not render");

            $response->assertInertia(fn(AssertableInertia $page) => $page
                ->where('locale', $locale)
                ->where('seo.robots', $entry->robots($locale)));

            $component = $response->viewData('page')['component'] ?? null;

            Assert::assertIsString($component, "{$path} names no component");
            Assert::assertNotSame('Error', $component, "{$path} renders the error page");
            Assert::assertFileExists(resource_path("js/pages/{$component}.tsx"), "{$path} renders a component that does not exist");
            Assert::assertStringContainsString('<html lang="' . $locale . '"', (string) $response->getContent(), "{$path} has the wrong document language");

            $checked++;
        }
    }

    expect($checked)->toBeGreaterThan(0);
});

it('answers 404 in every locale a registry page does not render in', function (): void {
    $checked = 0;

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach (array_diff(Locales::codes(), $entry->renderLocales) as $locale) {
            $path = $entry->url($locale, false);
            $response = $this->get($path);

            Assert::assertSame(404, $response->getStatusCode(), "{$path} answers although the page does not render in {$locale}");

            $response->assertInertia(fn(AssertableInertia $page) => $page
                ->component('Error')
                ->where('locale', $locale)
                ->where('seo.robots', 'noindex, follow'));

            $checked++;
        }
    }

    expect($checked)->toBeGreaterThan(0);
});

it('answers 404 for a slug outside the route constraints', function (string $path): void {
    $this->get($path)->assertNotFound();
})->with([
    '/compare/unknown-tool',
    '/some-bogus-slug',
    '/features/not-a-feature',
    '/vi/compare/unknown-tool',
    '/blog/not-a-post',
]);
