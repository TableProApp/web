<?php

use Illuminate\Support\Facades\File;

/**
 * resources/data/engines.json: every engine in the Mac app's picker, where
 * the site describes it, and what it can do.
 *
 * Values come from the TablePro app at v0.77.0 (its picker, plugin code and
 * docs, with code winning where they disagree) and the plugin registry at
 * 05:03Z on 2026-10-02. Engine lists on feature pages are derived from the
 * capability fields, and every count the site shows is a length of a filtered
 * list, so the facts that went wrong on the old site are pinned here by id
 * rather than by number: the engine set, the bundled drivers, the iOS picker,
 * the dashboard, Users & Roles and AWS IAM engines, and the engines without
 * EXPLAIN.
 *
 * Positioning guard 5 lives here too: the featured engines are PostgreSQL,
 * MySQL, SQL Server, SQLite, MongoDB and Redis, in that order, and each one is
 * in every Mac build a channel still serves.
 */

/**
 * @return list<array<string, mixed>>
 */
function enginesJson(): array
{
    static $engines = null;

    return $engines ??= json_decode(File::get(resource_path('data/engines.json')), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @return array<string, array<string, mixed>>
 */
function enginesById(): array
{
    return collect(enginesJson())->keyBy('id')->all();
}

/**
 * The Mac entry of platforms.json.
 *
 * @return array<string, mixed>
 */
function enginesMacPlatform(): array
{
    return collect(json_decode(File::get(resource_path('data/platforms.json')), true, 512, JSON_THROW_ON_ERROR)['platforms'])
        ->firstWhere('id', 'mac');
}

/**
 * Ids of the engines for which `$test` holds, in data order.
 *
 * @param  Closure(array<string, mixed>): bool  $test
 * @return list<string>
 */
function enginesWhere(Closure $test): array
{
    return array_values(array_column(array_filter(enginesJson(), $test), 'id'));
}

it('gives every engine the documented fields', function (): void {
    $keys = [
        'id', 'appTypeId', 'name', 'page', 'slug', 'parent', 'anchor', 'category', 'featured', 'meta',
        'distribution', 'driverPlugin', 'sinceAppVersion', 'minAppVersion', 'state', 'queryLanguage', 'defaultPort',
        'connectionMode', 'icon', 'monogram', 'docsSlug', 'capabilities', 'versionFloor', 'bundledVersion', 'limits',
        'ios', 'verified',
    ];
    $capabilities = [
        'ssh', 'ssl', 'import', 'export', 'schemaEditing', 'explain', 'explainView', 'dashboard', 'usersRoles',
        'awsIam', 'awsSignIn', 'cloudSqlProxy', 'nativeDump', 'readOnlyMode', 'alwaysReadOnly',
    ];
    $categories = ['relational', 'analytical', 'cloud', 'document', 'key-value', 'wide-column', 'search', 'streaming', 'coordination', 'files'];

    foreach (enginesJson() as $engine) {
        $id = $engine['id'];

        expect(array_keys($engine))->toBe($keys, "{$id} has the wrong fields");
        expect(array_keys($engine['capabilities']))->toBe($capabilities, "{$id} has the wrong capability fields");
        expect(array_keys($engine['ios']))->toBe(['inPicker', 'openable', 'appearsAfterSync']);
        expect($id)->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/');
        expect($engine['name'])->toBeString()->not->toBe('');
        expect($engine['appTypeId'])->toBeString()->not->toBe('');
        expect($engine['page'])->toBeIn(['own', 'section', 'hub']);
        expect($engine['category'])->toBeIn($categories);
        expect($engine['distribution'])->toBeIn(['bundled', 'registry']);
        expect($engine['state'])->toBeIn(['published', 'head_only']);
        expect($engine['connectionMode'])->toBeIn(['network', 'file', 'api']);
        expect($engine['queryLanguage'])->toBeString()->not->toBe('');
        expect($engine['defaultPort'] === null || (is_int($engine['defaultPort']) && $engine['defaultPort'] > 0))->toBeTrue("{$id}.defaultPort");
        expect($engine['monogram'])->toMatch('/^[A-Z0-9]{2}$/');
        expect($engine['featured'])->toBeBool();
        expect($engine['meta'])->toBeBool();

        foreach (['ssh', 'ssl', 'import', 'export', 'dashboard', 'usersRoles', 'awsIam', 'awsSignIn', 'cloudSqlProxy', 'readOnlyMode', 'alwaysReadOnly'] as $flag) {
            expect($engine['capabilities'][$flag])->toBeBool("{$id}.capabilities.{$flag}");
        }

        foreach ($engine['ios'] as $flag => $value) {
            expect($value)->toBeBool("{$id}.ios.{$flag}");
        }
    }
});

it('lists the 37 engine types of the v0.77.0 picker by id', function (): void {
    expect(array_column(enginesJson(), 'id'))->toEqualCanonicalizing([
        'postgresql', 'mysql', 'sqlserver', 'sqlite', 'mongodb', 'redis', 'mariadb', 'tidb', 'oceanbase', 'databend',
        'redshift', 'cockroachdb', 'pglite', 'oracle', 'clickhouse', 'duckdb', 'cassandra', 'scylladb', 'dynamodb',
        'bigquery', 'snowflake', 'cloudflare-d1', 'turso', 'libsql', 'elasticsearch', 'etcd', 'kafka', 'surrealdb',
        'teradata', 'trino', 'beancount', 'spanner', 'typesense', 'weaviate', 'cloudflare-r2-sql', 'dameng', 'sap-hana',
    ]);

    foreach (['id', 'appTypeId', 'name'] as $field) {
        $values = array_column(enginesJson(), $field);

        expect($values)->toBe(array_values(array_unique($values)), "{$field} values must be unique");
    }
});

it('marks the twelve engines whose driver ships inside the app as bundled', function (): void {
    expect(enginesWhere(fn(array $engine): bool => $engine['distribution'] === 'bundled'))->toEqualCanonicalizing([
        'postgresql', 'mysql', 'sqlite', 'redis', 'mariadb', 'tidb', 'oceanbase', 'databend', 'redshift', 'cockroachdb', 'pglite', 'clickhouse',
    ]);

    foreach (enginesJson() as $engine) {
        if ($engine['distribution'] === 'bundled') {
            expect($engine['minAppVersion'])->toBeNull("{$engine['id']} ships with the app, so it has no registry minimum");
        } else {
            expect($engine['minAppVersion'])->toMatch('/^\d+\.\d+\.\d+$/', "{$engine['id']} is a registry plugin and needs its minimum app version");
        }
    }
});

it('never dates an engine after the current Mac release', function (): void {
    $release = enginesMacPlatform()['release']['version'];

    foreach (enginesJson() as $engine) {
        expect($engine['sinceAppVersion'])->toMatch('/^\d+\.\d+\.\d+$/');
        expect(version_compare($engine['sinceAppVersion'], $release, '<='))->toBeTrue("{$engine['id']} is newer than {$release}");

        if ($engine['minAppVersion'] !== null) {
            expect(version_compare($engine['minAppVersion'], $release, '<='))->toBeTrue("{$engine['id']} needs a newer app than {$release}");
        }

        expect($engine['verified']['macTag'])->toBe('v' . $release);
        expect($engine['verified']['date'] <= now()->toDateString())->toBeTrue();
    }

    expect(enginesById()['sap-hana']['sinceAppVersion'])->toBe('0.77.0');
    expect(enginesById()['sap-hana']['minAppVersion'])->toBe('0.77.0');
});

it('places every engine on its own page, a family section or the hub', function (): void {
    $engines = enginesById();

    foreach ($engines as $id => $engine) {
        match ($engine['page']) {
            'own' => expect($engine['slug'])->toMatch('/^[a-z0-9-]+-(client|gui)$/', "{$id} needs a slug")
                ->and($engine['parent'])->toBeNull()
                ->and($engine['anchor'])->toBeNull(),
            'section' => expect($engine['slug'])->toBeNull()
                ->and($engines[$engine['parent']]['page'] ?? null)->toBe('own', "{$id}'s parent must have its own page")
                ->and($engine['anchor'])->toBe($id),
            'hub' => expect($engine['slug'])->toBeNull()
                ->and($engine['parent'])->toBeNull()
                ->and($engine['anchor'])->toBe($id),
        };
    }

    expect(enginesWhere(fn(array $engine): bool => $engine['page'] === 'section'))->toEqualCanonicalizing([
        'mariadb', 'tidb', 'oceanbase', 'databend', 'cockroachdb', 'pglite', 'scylladb', 'libsql',
    ]);
    expect(enginesWhere(fn(array $engine): bool => $engine['page'] === 'hub'))->toEqualCanonicalizing([
        'spanner', 'typesense', 'weaviate', 'cloudflare-r2-sql', 'dameng', 'sap-hana',
    ]);

    $sections = collect($engines)->where('page', 'section');

    expect($sections->groupBy('parent')->map->count()->sortKeys()->all())->toBe([
        'cassandra' => 1, 'mysql' => 4, 'postgresql' => 2, 'turso' => 1,
    ]);
});

it('keeps hub anchors clear of the category anchors on /databases', function (): void {
    $categories = ['relational', 'analytical', 'cloud', 'document', 'key-value', 'wide-column', 'search', 'streaming', 'coordination', 'files', 'drivers'];

    foreach (enginesJson() as $engine) {
        if ($engine['page'] === 'hub') {
            expect($categories)->not->toContain($engine['anchor']);
        }
    }

});

/*
 * Two hub-only engines whose group was in doubt, pinned so the call is not
 * made twice. Both are relational, which is where the app files them
 * (`PluginMetadataRegistry+HanaDefaults.swift` and
 * `PluginMetadataRegistry+CloudDefaults.swift`, `category: .relational`). The
 * "cloud and serverless SQL" group stresses stateless HTTP with no session
 * state or transactions (sitemap §E.2), which describes neither: SAP HANA
 * also runs on premises and holds SQL sessions, and Spanner is a transactional
 * relational service. That group keeps D1, Turso, libSQL and R2 SQL.
 */
it('groups SAP HANA and Spanner with the relational engines', function (): void {
    expect(enginesById()['sap-hana']['category'])->toBe('relational');
    expect(enginesById()['spanner']['category'])->toBe('relational');
    expect(collect(enginesJson())->where('category', 'cloud')->pluck('id')->all())
        ->toEqualCanonicalizing(['cloudflare-d1', 'turso', 'libsql', 'cloudflare-r2-sql']);
});

it('has one database page per own-page engine, matching the sitemap', function (): void {
    $slugs = array_values(array_filter(array_column(enginesJson(), 'slug')));

    expect($slugs)->toBe(array_values(array_unique($slugs)));
    expect($slugs)->toEqualCanonicalizing([
        'postgresql-client', 'mysql-client', 'sqlite-client', 'mongodb-client', 'redis-gui', 'sql-server-client',
        'oracle-client', 'clickhouse-client', 'duckdb-client', 'cassandra-client', 'redshift-client',
        'cloudflare-d1-client', 'turso-client', 'dynamodb-gui', 'bigquery-client', 'snowflake-client', 'etcd-gui',
        'elasticsearch-client', 'surrealdb-client', 'teradata-client', 'trino-client', 'beancount-client', 'kafka-client',
    ]);
});

it('pins the featured engines in order, each in every Mac build still served', function (): void {
    $floor = enginesMacPlatform()['floorVersion'];
    $engines = enginesById();

    $featured = enginesWhere(fn(array $engine): bool => $engine['featured']);
    $meta = enginesWhere(fn(array $engine): bool => $engine['meta']);

    expect($featured)->toBe(['postgresql', 'mysql', 'sqlserver', 'sqlite', 'mongodb', 'redis']);
    expect($meta)->toBe(['postgresql', 'mysql', 'sqlserver', 'mongodb', 'redis']);
    expect(array_diff($meta, $featured))->toBe([]);

    foreach ($featured as $id) {
        expect($engines[$id]['state'])->toBe('published');
        expect(version_compare($engines[$id]['sinceAppVersion'], $floor, '<='))->toBeTrue("{$id} is not in Mac {$floor}");
    }
});

it('names the engines iOS opens, in the order platforms.json gives', function (): void {
    $ios = collect(json_decode(File::get(resource_path('data/platforms.json')), true, 512, JSON_THROW_ON_ERROR)['platforms'])
        ->firstWhere('id', 'ios');

    expect(enginesWhere(fn(array $engine): bool => $engine['ios']['inPicker']))->toEqualCanonicalizing($ios['iosEngines']);
    expect(enginesWhere(fn(array $engine): bool => $engine['ios']['openable'] && ! $engine['ios']['inPicker']))->toBe(['redshift']);

    foreach (enginesJson() as $engine) {
        if ($engine['ios']['inPicker']) {
            expect($engine['ios']['openable'])->toBeTrue("{$engine['id']} is offered on iOS, so it must open");
        }

        if ($engine['ios']['openable']) {
            expect($engine['ios']['appearsAfterSync'])->toBeTrue();
        }
    }
});

it('pins the capability lists the feature pages derive', function (): void {
    expect(enginesWhere(fn(array $engine): bool => $engine['capabilities']['dashboard']))->toEqualCanonicalizing([
        'postgresql', 'redshift', 'cockroachdb', 'mysql', 'mariadb', 'sqlserver', 'clickhouse', 'duckdb', 'sqlite', 'typesense',
    ]);
    // TiDB: MySQLPluginDriver.swift:116-129 gives every flavor but Databend `.userManagement`, and docs/databases/tidb.mdx:34 says it works (v0.78.0).
    expect(enginesWhere(fn(array $engine): bool => $engine['capabilities']['usersRoles']))->toEqualCanonicalizing([
        'mysql', 'mariadb', 'tidb', 'postgresql', 'pglite',
    ]);
    expect(enginesWhere(fn(array $engine): bool => $engine['capabilities']['awsIam']))->toEqualCanonicalizing([
        'mysql', 'mariadb', 'postgresql',
    ]);
    // Every AWS IAM sign-in: RDS IAM, MONGODB-AWS, ElastiCache IAM and Amazon Keyspaces SigV4 (aws-iam.mdx and the engine docs at v0.77.0).
    expect(enginesWhere(fn(array $engine): bool => $engine['capabilities']['awsSignIn']))->toEqualCanonicalizing([
        'mysql', 'mariadb', 'postgresql', 'mongodb', 'redis', 'cassandra', 'scylladb',
    ]);

    foreach (enginesJson() as $engine) {
        if ($engine['capabilities']['awsIam']) {
            expect($engine['capabilities']['awsSignIn'])->toBeTrue("{$engine['id']}: RDS IAM is an AWS sign-in");
        }
    }
    expect(enginesWhere(fn(array $engine): bool => $engine['capabilities']['cloudSqlProxy']))->toEqualCanonicalizing([
        'mysql', 'postgresql', 'sqlserver',
    ]);
    expect(enginesWhere(fn(array $engine): bool => ! $engine['capabilities']['readOnlyMode']))->toEqualCanonicalizing([
        'redis', 'mongodb', 'etcd', 'sap-hana',
    ]);
    expect(enginesWhere(fn(array $engine): bool => $engine['capabilities']['alwaysReadOnly']))->toEqualCanonicalizing([
        'beancount', 'cloudflare-r2-sql',
    ]);

    $engines = enginesById();

    foreach (['sqlserver', 'oracle', 'cassandra', 'mongodb'] as $id) {
        expect($engines[$id]['capabilities']['explain'])->toBe([], "{$id} has no EXPLAIN");
    }

    expect($engines['redshift']['capabilities']['awsIam'])->toBeFalse('Redshift has no AWS IAM sign-in');
    expect($engines['redshift']['capabilities']['awsSignIn'])->toBeFalse('Redshift has no AWS IAM sign-in');
    expect($engines['bigquery']['capabilities']['explainView'])->toBe('cost');
});

it('keeps EXPLAIN, schema editing and import values consistent', function (): void {
    foreach (enginesJson() as $engine) {
        $capabilities = $engine['capabilities'];

        expect($capabilities['schemaEditing'])->toBeIn(['full', 'partial', 'read-only']);
        expect($capabilities['explain'])->toBe(array_values(array_unique($capabilities['explain'])));

        if ($capabilities['explain'] === []) {
            expect($capabilities['explainView'])->toBeNull("{$engine['id']} has no EXPLAIN, so no view");
        } else {
            expect($capabilities['explainView'])->toBeIn(['diagram', 'text', 'cost']);
        }

        if ($capabilities['alwaysReadOnly']) {
            expect($capabilities['schemaEditing'])->toBe('read-only');
            expect($capabilities['import'])->toBeFalse();
        }
    }

    expect(enginesWhere(fn(array $engine): bool => $engine['capabilities']['schemaEditing'] === 'read-only'))->toContain(
        'redshift',
        'cockroachdb',
        'bigquery',
        'spanner',
        'elasticsearch',
        'typesense',
        'surrealdb',
        'beancount',
        'sap-hana',
    );
});

it('links each engine to a docs page of its own or of its driver sibling', function (): void {
    $docsSlugs = array_values(array_filter(array_column(enginesJson(), 'docsSlug')));

    expect($docsSlugs)->toBe(array_values(array_unique($docsSlugs)));

    foreach (enginesJson() as $engine) {
        if ($engine['docsSlug'] !== null) {
            expect($engine['docsSlug'])->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/');

            continue;
        }

        $sibling = collect(enginesJson())->first(
            fn(array $other): bool => $other['driverPlugin'] === $engine['driverPlugin'] && $other['docsSlug'] !== null,
        );

        expect($sibling)->not->toBeNull("{$engine['id']} has no docs page and no sibling with one");
    }

    expect(enginesWhere(fn(array $engine): bool => $engine['docsSlug'] === null))->toEqualCanonicalizing(['scylladb', 'turso']);
});

it('points at icon files that exist', function (): void {
    foreach (enginesJson() as $engine) {
        if ($engine['icon'] === null) {
            continue;
        }

        expect($engine['icon'])->toStartWith('/images/databases/');
        expect(File::exists(public_path($engine['icon'])))->toBeTrue("{$engine['icon']} does not exist");
    }
});

it('records version floors, embedded versions and limits with evidence', function (): void {
    foreach (enginesJson() as $engine) {
        $id = $engine['id'];

        if ($engine['versionFloor'] !== null) {
            expect(array_keys($engine['versionFloor']))->toBe(['text', 'enforced', 'evidence']);
            expect($engine['versionFloor']['enforced'])->toBeBool();
            expect($engine['versionFloor']['evidence'])->toBeString()->not->toBe('');

            if ($engine['versionFloor']['text'] === null) {
                expect($engine['versionFloor']['enforced'])->toBeFalse("{$id}: no minimum version cannot be enforced");
            } else {
                expect($engine['versionFloor']['text'])->toBeString()->not->toBe('');
            }
        }

        $limitIds = array_column($engine['limits'], 'id');

        expect($limitIds)->toBe(array_values(array_unique($limitIds)), "{$id} repeats a limit");

        foreach ($engine['limits'] as $limit) {
            expect(array_keys($limit))->toBe(['id', 'value', 'evidence']);
            expect($limit['id'])->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/');
            expect($limit['value'] === null || is_int($limit['value']))->toBeTrue("{$id}.{$limit['id']}.value");
            expect($limit['evidence'])->toBeString()->not->toBe('');
        }
    }

    $engines = enginesById();

    expect($engines['sqlite']['bundledVersion'])->toBe('3.53.4');
    expect($engines['duckdb']['bundledVersion'])->toBe('1.5.2');
    expect($engines['oracle']['versionFloor'])->toMatchArray(['text' => '11.1', 'enforced' => true]);
    // The driver reads the server's /version and refuses anything older (SurrealDBError.swift:31 @v0.77.0).
    expect($engines['surrealdb']['versionFloor'])->toMatchArray(['text' => '2.0', 'enforced' => true]);
    expect(array_column($engines['sqlite']['limits'], 'id'))->toContain('no-encryption');
    expect(array_column($engines['redis']['limits'], 'id'))->toContain('no-pubsub');
    expect(array_column($engines['mongodb']['limits'], 'id'))->toContain('no-pipeline-builder');
});

/*
 * A floor whose `text` is null is the docs saying there is no minimum version
 * (docs/databases/{redis,clickhouse,redshift,teradata,cockroachdb,databend,tidb,oceanbase}.mdx
 * at v0.78.0), which the page shows as "None". An engine whose docs say
 * nothing, such as Trino, has no floor at all and shows no row.
 */
it('says there is no minimum version only where the docs say so', function (): void {
    expect(enginesWhere(fn(array $engine): bool => $engine['versionFloor'] !== null && $engine['versionFloor']['text'] === null))->toEqualCanonicalizing([
        'redis', 'clickhouse', 'redshift', 'teradata', 'cockroachdb', 'databend', 'tidb', 'oceanbase',
    ]);

    foreach (enginesJson() as $engine) {
        if ($engine['versionFloor'] !== null && $engine['versionFloor']['text'] === null) {
            expect($engine['versionFloor']['evidence'])->toMatch('#^docs/databases/[a-z0-9-]+\.mdx:\d+$#', "{$engine['id']}: no minimum needs the docs line that says so");
        }
    }

    expect(enginesById()['trino']['versionFloor'])->toBeNull();
});

it('gives every engine with its own page a mark for the page header', function (): void {
    expect(enginesWhere(fn(array $engine): bool => $engine['page'] === 'own' && $engine['icon'] === null))->toBe([]);
});

/*
 * `content/{locale}/engines.json` is keyed by engine id: each engine's tagline
 * (the hub's Notes column) and one sentence per limit in engines.json. The
 * same limit id can need different words on two engines (Redshift's
 * read-only structure is not BigQuery's), so the sentences are per engine,
 * and no sentence exists without a limit behind it.
 */
it('has a tagline and a sentence for every limit in both locales, and nothing else', function (): void {
    foreach (['en', 'vi'] as $locale) {
        $copy = json_decode(File::get(resource_path("data/content/{$locale}/engines.json")), true, 512, JSON_THROW_ON_ERROR);

        expect(array_keys($copy))->toEqualCanonicalizing(array_column(enginesJson(), 'id'), "content/{$locale}/engines.json must hold exactly the engines");

        foreach (enginesJson() as $engine) {
            $entry = $copy[$engine['id']];

            expect(array_keys($entry))->toBe(['tagline', 'limits'], "{$locale}: {$engine['id']} has the wrong keys");
            expect($entry['tagline'])->toBeString()->not->toBe('', "{$locale}: {$engine['id']} has no tagline");
            expect(array_keys($entry['limits']))->toEqualCanonicalizing(array_column($engine['limits'], 'id'), "{$locale}: {$engine['id']} limit sentences differ from its limits");

            foreach ($engine['limits'] as $limit) {
                $sentence = $entry['limits'][$limit['id']];

                expect($sentence)->toBeString()->not->toBe('');
                expect(str_contains($sentence, '{value}'))->toBe($limit['value'] !== null, "{$locale}: {$engine['id']}.{$limit['id']} must use {value} exactly when the limit has a number");
                expect(preg_match('/(?<![\w.\/-])\d{2,}(?![\w.])/u', str_replace('{value}', '', $sentence)))->toBe(0, "{$locale}: {$engine['id']}.{$limit['id']} types a number; put it in engines.json as the limit's value");
            }
        }
    }
});

/*
 * The EXPLAIN variants of the MySQL-protocol engines that do not use the MySQL
 * plugin's own, read from `PluginMetadataRegistry+MySQLVariantDefaults.swift`
 * at v0.77.0: TiDB and Databend take EXPLAIN and EXPLAIN ANALYZE, OceanBase
 * EXPLAIN alone, all shown as text. The docs pages for all three agree.
 */
it('gives the MySQL-protocol variants their text EXPLAIN', function (): void {
    $engines = enginesById();

    expect($engines['tidb']['capabilities']['explain'])->toBe(['EXPLAIN', 'EXPLAIN ANALYZE']);
    expect($engines['databend']['capabilities']['explain'])->toBe(['EXPLAIN', 'EXPLAIN ANALYZE']);
    expect($engines['oceanbase']['capabilities']['explain'])->toBe(['EXPLAIN']);

    foreach (['tidb', 'databend', 'oceanbase'] as $id) {
        expect($engines[$id]['capabilities']['explainView'])->toBe('text');
    }
});

/*
 * `capabilities.ssl` means "a connection can use TLS", which the facts card
 * lists under "Connect with". etcd's plugin sets `supportsSSL = false`, so the
 * generic SSL pane is hidden, but its own TLS Mode field (Disabled, Required,
 * Verify CA, Verify Identity, with client certificates) does the same job
 * (EtcdHttpClient.swift at v0.77.0; docs/databases/etcd.mdx).
 */
it('marks an engine with its own TLS setting as able to use TLS', function (): void {
    expect(enginesById()['etcd']['capabilities']['ssl'])->toBeTrue();
});
