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
 * Phase A holds the pre-rebuild list, so every existing database page keeps
 * rendering through `LegacyPages`, plus `kafka-client`, which is new in the
 * final sitemap and answers 404 until its content exists. The databases agent
 * owns this file from phase C and replaces the list with the final one (the
 * four merged pages leave it for redirects), pinned against
 * `resources/data/content/{en,vi}/databases/*.json` by a test.
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
        'mysql-client',
        'postgresql-client',
        'sqlite-client',
        'mongodb-client',
        'redis-gui',
        'sql-server-client',
        'oracle-client',
        'clickhouse-client',
        'duckdb-client',
        'cassandra-client',
        'mariadb-client',
        'redshift-client',
        'cloudflare-d1-client',
        'turso-client',
        'dynamodb-gui',
        'bigquery-client',
        'etcd-gui',
        'snowflake-client',
        'cockroachdb-client',
        'elasticsearch-client',
        'scylladb-client',
        'pglite-client',
        'surrealdb-client',
        'teradata-client',
        'trino-client',
        'beancount-client',
        'kafka-client',
    ];
}
