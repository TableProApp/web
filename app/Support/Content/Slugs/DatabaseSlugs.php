<?php

namespace App\Support\Content\Slugs;

/**
 * The slugs `/{slug}` answers for database pages, such as `mysql-client`.
 *
 * A PHP constant rather than a directory read at route registration, because a
 * route-cache rebuild happens only when PHP changes (`scripts/deploy.sh`), and
 * an edit to `app/` is a PHP change. A slug that exists only as a content file
 * would otherwise ship without a route.
 *
 * The final list of sitemap §A.3: one page per engine whose `page` is `own` in
 * `resources/data/engines.json`, in that file's order. The four pages merged
 * into family pages (`mariadb-client`, `cockroachdb-client`, `pglite-client`,
 * `scylladb-client`) are not here: `resources/data/redirects.json` answers them
 * with a 301 to their section before routing. `Data/EnginesDataTest` and
 * `Databases/DatabasePagesTest` pin this list against `engines.json` and
 * `resources/data/content/{en,vi}/databases/*.json`.
 *
 * Never add `ios`, a locale prefix such as `vi`, or another root path such as
 * `features`, `databases`, `compare` or `pricing`.
 * `tests/Feature/Localization/LocaleRoutingTest.php` guards it.
 */
final class DatabaseSlugs
{
    /**
     * @var list<string>
     */
    public const ALL = [
        'postgresql-client',
        'mysql-client',
        'sql-server-client',
        'sqlite-client',
        'mongodb-client',
        'redis-gui',
        'redshift-client',
        'oracle-client',
        'clickhouse-client',
        'duckdb-client',
        'cassandra-client',
        'dynamodb-gui',
        'bigquery-client',
        'snowflake-client',
        'cloudflare-d1-client',
        'turso-client',
        'elasticsearch-client',
        'etcd-gui',
        'kafka-client',
        'surrealdb-client',
        'teradata-client',
        'trino-client',
        'beancount-client',
    ];

    /**
     * The pages merged into a family page (sitemap §C.3). They answer a 301
     * from `resources/data/redirects.json` and must never come back here.
     *
     * @var list<string>
     */
    public const MERGED = [
        'mariadb-client',
        'cockroachdb-client',
        'pglite-client',
        'scylladb-client',
    ];
}
