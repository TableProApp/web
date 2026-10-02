<?php

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

beforeEach(function () {
    withoutVite();
});

it('renders the home page', function (string $route): void {
    get(route($route))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Home')
                ->has('content.hero.title')
                ->has('engines.0.path')
                ->has('checkout')
                ->missing('downloadUrls'),
        );
})->with(['landing.home', 'vi.landing.home']);

/*
 * The download page's cases moved to Releases/DownloadPageTest and
 * Releases/MacReleaseServiceTest (architecture §1.13): the page reads
 * releases/latest through MacReleaseService and no longer has the
 * `downloadUrls` prop or the crowded `releases?per_page=100` fetch these
 * cases pinned.
 */

it('renders the privacy page', function () {
    get(route('landing.privacy'))
        ->assertOk()
        ->assertInertia(fn($page) => $page->component('Privacy'));
});

it('renders the terms page', function () {
    get(route('landing.terms'))
        ->assertOk()
        ->assertInertia(fn($page) => $page->component('Terms'));
});
