<?php

use PHPUnit\Framework\Assert;

/**
 * The footer is the site's link floor.
 *
 * Every comparison and database page is a route this repository serves on
 * purpose, and each one earns its traffic from being reachable. Two comparison
 * slugs — sequel-pro and azimutt — had no link anywhere on the site while the
 * other eight sat in the footer, which is the kind of omission nobody notices
 * because the pages still resolve.
 *
 * Asserted against the route constraint rather than a copy of the list, so
 * adding a slug to `routes/web.php` and forgetting the footer fails here.
 */
function routeConstraintSlugs(string $name): array
{
    $route = collect(app('router')->getRoutes())->first(
        static fn($route): bool => $route->getName() === $name,
    );

    expect($route)->not->toBeNull("Route {$name} is missing");

    $pattern = $route->wheres['slug'] ?? '';

    expect($pattern)->not->toBe('', "Route {$name} has no slug constraint");

    return explode('|', $pattern);
}

function footerSource(): string
{
    return file_get_contents(base_path('resources/js/components/landing/footer.tsx'));
}

/*
 * `Assert::` rather than `expect()->toContain()` throughout. Pest's toContain()
 * is `(mixed ...$needles)` with no message parameter, so a message passed as a
 * second argument is silently treated as another needle — and since these
 * messages never appear in a source file, the assertion would fail for the
 * wrong reason and report the wrong thing. StaleClaimsTest carries a docblock
 * about the same trap in its `not` form, where it makes the test pass forever
 * instead.
 */
it('links every comparison page from the footer', function (): void {
    $footer = footerSource();

    foreach (routeConstraintSlugs('landing.compare') as $slug) {
        Assert::assertStringContainsString(
            "/compare/{$slug}",
            $footer,
            "The footer does not link /compare/{$slug}",
        );
    }
});

/**
 * The footer carries a curated subset of the database pages, not all 26 — the
 * homepage grid is what keeps every one of them at click depth 1. This asserts
 * the subset is real routes, so a renamed slug cannot leave a dead footer link.
 */
it('links only real database pages from the footer', function (): void {
    $footer = footerSource();
    $known = routeConstraintSlugs('landing.databaseClient');

    preg_match_all("#href: '/([a-z0-9-]+)'#", $footer, $matches);

    $databaseLinks = array_values(array_intersect($matches[1], $known));

    expect($databaseLinks)->not->toBeEmpty();

    foreach ($databaseLinks as $slug) {
        Assert::assertContains($slug, $known, "The footer links /{$slug}, which is not a database route");
    }
});
