<?php

namespace App\Support\Seo;

use App\Support\Content\Slugs\CompareSlugs;
use App\Support\Content\Slugs\DatabaseSlugs;
use Illuminate\Support\Facades\File;

/**
 * The English pages that still render through their pre-rebuild components.
 *
 * Transitional. Until a family's content lands, its English URLs keep
 * answering through the legacy `LandingController` pages, and nothing renders
 * in any other locale, so a Vietnamese URL can never wrap English copy in
 * Vietnamese chrome.
 *
 * Registered last, so it only answers for pages no content family knows yet.
 * It retires itself page by page: when `content/en/home.json` lands,
 * `StaticPages` answers for `/` first and this entry is never reached. A slug
 * also drops out here once its family agent removes it from the route's slug
 * constant, so merged and retired pages stop being claimed. Cleanup deletes
 * this class along with `LandingController`.
 */
final class LegacyPages implements PageFamily
{
    /**
     * Base route name => [component source, OG family].
     */
    private const PAGES = [
        'landing.home' => ['resources/js/pages/Home.tsx', 'site'],
        'landing.download' => ['resources/js/pages/Download.tsx', 'site'],
        'landing.ios' => ['resources/js/pages/Ios.tsx', 'site'],
        'landing.faq' => ['resources/js/data/faqs.ts', 'site'],
        'landing.privacy' => ['resources/js/pages/Privacy.tsx', 'site'],
        'landing.terms' => ['resources/js/pages/Terms.tsx', 'site'],
        'landing.refundPolicy' => ['resources/js/pages/RefundPolicy.tsx', 'site'],
        'landing.blog.index' => ['resources/js/pages/Blog/Index.tsx', 'site'],
    ];

    /**
     * The database pages the legacy `DatabaseClient` component has data for.
     */
    private const DATABASES = [
        'mysql-client', 'postgresql-client', 'sqlite-client', 'mongodb-client', 'redis-gui',
        'sql-server-client', 'oracle-client', 'clickhouse-client', 'duckdb-client', 'cassandra-client',
        'mariadb-client', 'redshift-client', 'cloudflare-d1-client', 'turso-client', 'dynamodb-gui',
        'bigquery-client', 'etcd-gui', 'snowflake-client', 'cockroachdb-client', 'elasticsearch-client',
        'scylladb-client', 'pglite-client', 'surrealdb-client', 'teradata-client', 'trino-client',
        'beancount-client',
    ];

    /**
     * The comparisons the legacy `Compare` component has data for.
     */
    private const COMPARISONS = [
        'tableplus', 'dbeaver', 'datagrip', 'navicat', 'beekeeper-studio', 'sequel-pro',
        'postico', 'sequel-ace', 'heidisql', 'azimutt', 'phpmyadmin',
    ];

    /**
     * @return list<PageEntry>
     */
    public function entries(): array
    {
        $entries = [];

        foreach (array_keys(self::PAGES) as $route) {
            $entries[] = $this->find($route, []);
        }

        foreach (DatabaseSlugs::ALL as $slug) {
            $entries[] = $this->find('landing.databaseClient', ['slug' => $slug]);
        }

        foreach (CompareSlugs::ALL as $slug) {
            $entries[] = $this->find('landing.compare', ['slug' => $slug]);
        }

        foreach (File::glob(resource_path('blog/*.md')) ?: [] as $file) {
            $entries[] = $this->find('landing.blog.show', ['slug' => pathinfo($file, PATHINFO_FILENAME)]);
        }

        return array_values(array_filter($entries));
    }

    /**
     * @param  array<string, string>  $params
     */
    public function find(string $route, array $params): ?PageEntry
    {
        if (array_key_exists($route, self::PAGES)) {
            if ($params !== []) {
                return null;
            }

            [$source, $ogFamily] = self::PAGES[$route];

            return $this->english($route, [], [$source], $ogFamily, null);
        }

        $slug = $params['slug'] ?? null;

        if (! is_string($slug) || count($params) !== 1) {
            return null;
        }

        return match ($route) {
            'landing.databaseClient' => in_array($slug, self::DATABASES, true) && in_array($slug, DatabaseSlugs::ALL, true)
                ? $this->english($route, $params, ['resources/data/databases.json'], 'database', $slug)
                : null,
            'landing.compare' => in_array($slug, self::COMPARISONS, true) && in_array($slug, CompareSlugs::ALL, true)
                ? $this->english($route, $params, ['resources/data/comparisons.json'], 'compare', $slug)
                : null,
            'landing.blog.show' => preg_match('/^[a-z0-9-]+$/', $slug) === 1 && File::isFile(resource_path("blog/{$slug}.md"))
                ? $this->english($route, $params, ["resources/blog/{$slug}.md"], 'blog', $slug)
                : null,
            default => null,
        };
    }

    /**
     * @param  array<string, string>  $params
     * @param  list<string>  $sources
     */
    private function english(string $route, array $params, array $sources, string $ogFamily, ?string $ogSlug): PageEntry
    {
        return new PageEntry(
            route: $route,
            params: $params,
            renderLocales: ['en'],
            indexableLocales: ['en'],
            sources: $sources,
            ogFamily: $ogFamily,
            ogSlug: $ogSlug,
        );
    }
}
