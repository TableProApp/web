<?php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Database
    |--------------------------------------------------------------------------
    |
    | This application does not use a database. Every page it renders is built
    | from markdown in resources/blog, JSON in resources/data, and the public
    | GitHub API.
    |
    | The connection below exists only because Laravel resolves this file
    | during boot. It points at an in-memory SQLite database that is never
    | opened. If you find yourself adding a real connection here, the feature
    | you are building does not belong in this repository — see
    | docs/architecture.md.
    |
    */

    'default' => env('DB_CONNECTION', 'sqlite'),

    'connections' => [

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => env('DB_URL'),
            'database' => env('DB_DATABASE', ':memory:'),
            'prefix' => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
            'busy_timeout' => null,
            'journal_mode' => null,
            'synchronous' => null,
        ],

    ],

    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Redis
    |--------------------------------------------------------------------------
    |
    | Unused, for the same reason. The cache driver defaults to 'file'.
    |
    */

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_') . '_database_'),
        ],

        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],

    ],

];
