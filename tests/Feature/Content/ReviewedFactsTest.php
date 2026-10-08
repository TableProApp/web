<?php

use Illuminate\Support\Facades\File;

/**
 * Facts the content review found wrong or overstated, pinned in both
 * languages so a later edit cannot bring the old sentence back.
 *
 * Each case names the file, the phrases the corrected copy must keep and the
 * phrases the wrong version used. The evidence for each correction is the
 * v0.77.0 / iOS build 22 source the review cited; the case's label says what
 * was wrong.
 */

/**
 * The text of a content or legal file, decoded JSON flattened to one string
 * so a phrase is found wherever the file keeps it.
 */
function reviewedText(string $file): string
{
    $raw = File::get(resource_path("data/{$file}"));

    if (! str_ends_with($file, '.json')) {
        return $raw;
    }

    $strings = [];
    $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

    array_walk_recursive(
        $decoded,
        function (mixed $value) use (&$strings): void {
            if (is_string($value)) {
                $strings[] = $value;
            }
        },
    );

    return implode("\n", $strings);
}

dataset('reviewed facts', [
    'column reorder runs only on SQLite and a local libSQL file' => [
        'content/en/features/schema.json',
        ['On PostgreSQL, Turso, remote libSQL and Cloudflare D1, TablePro writes the rebuild script', 'leaves it to you on Turso, remote libSQL and D1'],
        ['rebuilds the table on SQLite, libSQL, Turso and Cloudflare D1'],
    ],
    'column reorder (vi)' => [
        'content/vi/features/schema.json',
        ['Trên PostgreSQL, Turso, libSQL từ xa và Cloudflare D1'],
        ['dựng lại table trên SQLite, libSQL, Turso và Cloudflare D1'],
    ],
    'Handoff also passes the connection name' => [
        'content/en/features/sync-and-teams.json',
        ['With no table open, it passes the connection’s name instead', 'at their next license check, within {licenseCheckDays} days', '<ui>Publish Saved Queries to Team…</ui>'],
        ['Only the connection’s ID and the table’s name pass', 'signs their Macs out'],
    ],
    'Handoff, seats and publishing (vi)' => [
        'content/vi/features/sync-and-teams.json',
        ['khi chưa mở table nào, tên connection', 'trong vòng {licenseCheckDays} ngày', 'Dành cho lúc bạn'],
        ['chỉ có ID của connection và tên table', 'đăng xuất các máy Mac', 'Dành cho khi', 'đưa lên'],
    ],
    'Redis Add Row covers five types; restores are transactional only where the engine allows' => [
        'content/en/features/data-editing.json',
        ['add a string, hash, list, set or sorted-set key', 'in one transaction where the engine allows.'],
        ['add a key of any type', 'through Safe Mode in one transaction.'],
    ],
    'Redis, rewind and Safe Mode level names (vi)' => [
        'content/vi/features/data-editing.json',
        ['hai mức Safe Mode và Safe Mode (Full)', 'trong một transaction nếu engine cho phép.'],
        ['thêm key thuộc kiểu bất kỳ', 'các mức Safe Mode còn yêu cầu'],
    ],
    'Read-Only refuses AI writes rather than waiting for Run' => [
        'content/en/features/ai-mcp.json',
        ['from Alert to Safe Mode (Full) each one waits for Run, and Read-Only refuses them'],
        ['at Alert or a stricter level each one waits for Run'],
    ],
    'the MCP server runs on the reader’s Mac (vi)' => [
        'content/vi/features/ai-mcp.json',
        ['chạy trên máy Mac của bạn', 'Read-Only từ chối luôn', 'không phải cơ chế khóa'],
        ['chạy ngay trên máy của TablePro', 'ổ khóa'],
    ],
    'DDL commits on its own on MySQL, MariaDB and Oracle' => [
        'content/en/features/querying.json',
        ['DDL on MySQL, MariaDB and Oracle', 'such as VACUUM'],
        ['SQL Server scripts and MySQL DDL'],
    ],
    'password tools resolve from Homebrew folders; only some sign-ins are Mac-only' => [
        'content/en/features/connections.json',
        ['<code>/opt/homebrew/bin</code>', 'AWS IAM, Kerberos and Google sign-in'],
        ['Importing from other apps, cloud sign-in'],
    ],
    'SQL files run as statements, not into a table' => [
        'content/en/features/index.json',
        ['Import {importFormats} files'],
        ['Import {importFormats} into a table'],
    ],
    'SQL Server schemas are dropped, not created, from the sidebar' => [
        'content/en/databases/sql-server-client.json',
        ['Schemas can be dropped from the sidebar', 'Create one with CREATE SCHEMA', 'Only Backup Dump and Restore Dump need a tool of your own'],
        ['Schemas can be created and dropped'],
    ],
    'PostgreSQL meta scopes AWS IAM and ~/.pgpass to PostgreSQL; the toggle is Use ~/.pgpass' => [
        'content/en/databases/postgresql-client.json',
        ['Connect to PostgreSQL with SSH, SSL/TLS, AWS IAM or ~/.pgpass, and to CockroachDB and PGlite', 'Turn on Use ~/.pgpass'],
        ['Use Password File', 'PGlite with SSH'],
    ],
    'MySQL meta scopes AWS IAM to MySQL and MariaDB; restore runs mysql' => [
        'content/en/databases/mysql-client.json',
        ['Connect to MySQL and MariaDB with SSH, SSL/TLS or AWS IAM', 'Restore Dump runs the mysql client'],
        ['Databend with SSH, SSL/TLS and AWS IAM'],
    ],
    'the MongoDB page names its imports from data, without SQL' => [
        'content/en/databases/mongodb-client.json',
        ['<importData>Import</importData> {importFormats} files into a collection.'],
        ['CSV, TSV, JSON, JSONL or XLSX files into a collection'],
    ],
    'the MongoDB page imports (vi)' => [
        'content/vi/databases/mongodb-client.json',
        ['<importData>Import</importData> file {importFormats} vào một collection.'],
        ['CSV, TSV, JSON, JSONL hoặc XLSX vào một collection'],
    ],
    'Redshift passwords also travel in an encrypted export' => [
        'content/en/databases/redshift-client.json',
        ['encrypted with its passwords included, part of the {encryptedExportTier} plan'],
        ['Passwords come along only when Sync Passwords is on'],
    ],
    'the DuckDB remote mode carries its app label' => [
        'content/en/databases/duckdb-client.json',
        ['<ui>Remote (Quack, experimental)</ui>'],
        ['<ui>Remote (Quack)</ui>'],
    ],
    'macOS does not open kafka:// links' => [
        'content/en/databases/kafka-client.json',
        ['accepts <code>kafka://</code> URLs, which macOS does not open as links'],
        ['link opens the connection form'],
    ],
    'Teradata copies only to Teradata; a lowercase tdnego becomes TD2' => [
        'content/en/databases/teradata-client.json',
        ['to another Teradata connection; a copy to a different engine is refused', 'a lowercase <code>tdnego</code>'],
        ['a lowercase <code>td2</code> included'],
    ],
    'Redis key browsing is Mac-only' => [
        'content/en/databases/redis-gui.json',
        ['Redis GUI for {macDevices}', 'browsing keys is not available in the iPhone and iPad app'],
        ['Redis GUI for {devices}'],
    ],
    'Trino is not a warehouse' => [
        'content/en/databases/trino-client.json',
        ['Teradata, a data warehouse'],
        ['another warehouse'],
    ],
    'the iPhone status lines name no article and the right surface' => [
        'content/en/databases/index.json',
        ['is offered when you create a connection in the iPhone and iPad app', 'opens {name} connections only when they come from a Mac', '{name} connections synced from a Mac appear'],
        ['connection list, and the app connects', 'A {name} connection', 'a {name} connection'],
    ],
    'DataGrip’s AI also takes your own key or a local model' => [
        'content/en/compare/datagrip.json',
        ['your own provider key or a local model', 'each file’s commit history with a side-by-side diff'],
        ['More use needs a paid JetBrains AI plan', 'No commit, branch or diff view'],
    ],
    /*
     * Beekeeper Studio's two official pages disagree (2026-10-03): the AI
     * Shell guide says every paid version includes it, the pricing table
     * ticks it for Professional and Business only. The page states what both
     * agree on.
     */
    'Beekeeper Studio’s AI Shell needs a paid tier, which tier is disputed' => [
        'content/en/compare/beekeeper-studio.json',
        ['AI Shell needs a paid tier', 'AI Shell, in paid tiers only, not in Community', 'Import/Export & Backup/Restore, in every paid tier'],
        ['AI Shell is in every paid tier', 'AI Shell, in every paid tier', '{cells.ai.edition}', 'MongoDB and ClickHouse from Professional'],
    ],
    'Beekeeper Studio’s AI Shell (vi)' => [
        'content/vi/compare/beekeeper-studio.json',
        ['AI Shell của Beekeeper Studio cần một gói trả phí', 'AI Shell, chỉ có trong các gói trả phí'],
        ['AI Shell của Beekeeper Studio có trong mọi gói trả phí', 'AI Shell, có trong mọi gói trả phí'],
    ],
    // The plan page lists the subscription prices (navicat-premium-plan, 2026-10-03); they are not only shown at checkout.
    'Navicat Premium is also sold as a subscription' => [
        'content/en/compare/navicat.json',
        ['perpetual license or a monthly or yearly subscription', 'Each edition is also sold as a monthly or yearly subscription.'],
        ['add features such as {starterExamples}, and can be paid monthly, yearly or once', 'priced only at checkout'],
    ],
    'Navicat Premium subscriptions (vi)' => [
        'content/vi/compare/navicat.json',
        ['Mỗi bản cũng được bán theo gói thuê bao theo tháng hoặc theo năm.'],
        ['với giá chỉ hiện khi thanh toán'],
    ],
    'TablePro is not defined as a Mac client' => [
        'content/en/compare/tableplus.json',
        ['Two native database clients with Mac, iPhone and iPad apps'],
        ['Mac database clients'],
    ],
    'DBeaver: no "native Mac client", no self-listing Compare & Sync' => [
        'content/en/compare/dbeaver.json',
        ['It is part of Starter.'],
        ['native Mac client', 'along with features such as {starterExamples}'],
    ],
    'the compare method names every kind of official source' => [
        'content/en/compare/index.json',
        ['or the package manager or platform vendor that distributes it'],
        ['comes from its own website, documentation, release notes or store listing'],
    ],
    'the hub says "there is no", never "not yet" (vi)' => [
        'content/vi/compare/index.json',
        ['Không có công cụ import cho {others}', 'Tải TablePro'],
        ['Chưa có công cụ import', 'Dùng thử TablePro'],
    ],
    'the Mac app’s languages come from platforms.json' => [
        'content/en/compare/phpmyadmin.json',
        ['Mac app: {macLanguages}', 'comes in {macLanguages} only'],
        ['Simplified Chinese, Traditional Chinese, Korean and Turkish'],
    ],
    'the iPhone and iPad app can run an EXPLAIN statement' => [
        'content/en/compare/postico.json',
        ['Postico 2 is sold only as one-time licenses'],
        ['no EXPLAIN,'],
    ],
    'the homepage scopes Safe Mode, Agent mode, importers and dump tools' => [
        'content/en/home.json',
        ['On the Mac, tag and colour connections', 'While a connection is open in Agent mode', 'install any your Mac doesn’t already have', '<code>$VAR</code>'],
        ['While Agent mode is on, every connection', 'which you install yourself', 'Drivers for common databases'],
    ],
    'the homepage (vi)' => [
        'content/vi/home.json',
        ['Trên Mac, bạn gắn tag', 'Khi một connection đang mở ở Agent mode', '<code>$VAR</code>'],
        ['mọi connection chạy ở mức Alert', 'bạn tự cài các công cụ này'],
    ],
    'the refund window starts at purchase, or a yearly plan’s latest renewal' => [
        'content/en/pricing.json',
        ['within {refundDays} days of purchase, or, for a yearly plan, of its most recent renewal'],
        ['days of payment'],
    ],
    'the refund window (vi)' => [
        'content/vi/pricing.json',
        ['kể từ ngày mua, hoặc, với gói theo năm, kể từ ngày gia hạn gần nhất', 'chỉ thanh toán một lần'],
        ['kể từ khi thanh toán', 'được trả một lần', 'Các điều kiện chỉ áp dụng'],
    ],
    'the refund policy describes its own window' => [
        'legal/en/refund-policy.md',
        ['of purchase, or of the latest renewal for a yearly plan', '](/pricing#refunds)'],
        ['days of payment'],
    ],
    'the FAQ names the bundled drivers from data and the Mac sync toggle' => [
        'content/en/faq.json',
        ['Drivers for {bundledEngines} come with the Mac app', '<ui>Passwords</ui> under Sync Categories on the Mac', 'or, for a yearly plan, of its most recent renewal'],
        ['the most common engines', 'every driver is built into the app', 'days of buying'],
    ],
    'the FAQ (vi)' => [
        'content/vi/faq.json',
        ['Driver cho {bundledEngines}', 'Bắt đầu chat', 'SSH tunnel xác thực bằng', 'Trang Kết nối'],
        ['Trò chuyện trực tuyến', 'cập nhật riêng với ứng dụng', 'Các điều kiện chỉ áp dụng'],
    ],
    'the iPhone page states the 1.0 row-editor and Redis TLS limits' => [
        'content/en/ios.json',
        ['don’t save a row while a long text or binary value shows shortened', 'they check the certificate and not the host name', 'expanded Dynamic Island', 'the processor architecture', '<sync>', '<databases>'],
        ['Every driver is built into the app', 'SQL Server connections are encrypted without'],
    ],
    'the iPhone page (vi)' => [
        'content/vi/ios.json',
        ['đừng lưu một dòng khi giá trị văn bản dài', 'Dynamic Island khi mở rộng', 'kiến trúc bộ xử lý', 'tác vụ Phím tắt thêm dòng'],
        ['cấp độ', 'Các phím tắt thêm dòng'],
    ],
    'the privacy policy describes what the site and apps actually do' => [
        'legal/en/privacy.md',
        [
            'subscribing to the newsletter or starting a checkout or a discount code check from any page of this site',
            'cdn.jsdelivr.net',
            'when an MCP client you have set up launches TablePro\'s bridge or pairs with it',
            '**MCP servers you add.**',
            'credential profiles (their name and username, never the password)',
            'expanded Dynamic Island',
            'the processor architecture',
            'looks up a country for each usage report',
            'the Mac that publishes downloads it again right after',
            'With no table open, it passes the connection\'s name instead',
            '](/account?locale=en)',
            '](/refund-policy)',
            '](/terms)',
        ],
        ['The site sets no cookies of its own.', 'The MCP server is off until you turn it on', 'and after a publish.', 'Ask us to delete yours.'],
    ],
    'the privacy policy (vi)' => [
        'legal/vi/privacy.md',
        ['cdn.jsdelivr.net', '**MCP client.**', 'gợi ý nội tuyến', 'máy Mac vừa xuất bản tải lại ngay sau đó', 'xóa các cuộc chat và email của bạn', '](/account?locale=vi)', '](/vi/terms)'],
        ['trò chuyện', 'Client MCP', 'sau mỗi lần có người xuất bản', 'xóa của bạn.', 'cấp độ Safe Mode'],
    ],
    'the terms use the legal word for indemnify (vi)' => [
        'legal/vi/terms.md',
        ['## Bồi thường {#indemnification}', '](/vi/pricing)'],
        ['Bồi hoàn', 'bồi hoàn', 'chỉ áp dụng khi'],
    ],
    'the iPhone launch post carries a correction' => [
        'content/en/blog.json',
        ['Jump hosts are not supported on iPhone and iPad'],
        ['A short email when a new version ships.'],
    ],
    'the blog (vi) promises no translation' => [
        'content/vi/blog.json',
        ['Các bài này chỉ có bằng tiếng Anh.', 'Jump host không được hỗ trợ trên iPhone và iPad'],
        ['chưa có bản tiếng Việt', 'Một email ngắn mỗi khi'],
    ],
    'Vietnamese engine notes say "native", never "gốc"' => [
        'content/vi/engines.json',
        ['giao thức native', 'màn hình xem table', 'tab Truy vấn (Query)'],
        ['gốc', 'trình duyệt table', 'script structure'],
    ],
    // Plugins/KafkaDriverPlugin/KafkaQL.swift is the parser; Kafka itself has no such language (v0.78.0).
    'KafkaQL is introduced as TablePro’s own command language' => [
        'content/en/databases/kafka-client.json',
        ['all with KafkaQL, TablePro’s own command language.'],
        ['all with KafkaQL.'],
    ],
    'KafkaQL (vi)' => [
        'content/vi/databases/kafka-client.json',
        ['bằng KafkaQL, ngôn ngữ lệnh riêng của TablePro.'],
        ['tất cả bằng KafkaQL.'],
    ],
    'the hub says whose language KafkaQL is' => [
        'content/en/databases/index.json',
        ['with KafkaQL, TablePro’s own command language.'],
        ['messages with KafkaQL.'],
    ],
    'another tool’s AI feature is named as that tool’s' => [
        'content/en/databases/redis-gui.json',
        ['Redis Insight’s Redis Copilot answers Redis questions'],
        ['Its Redis Copilot'],
    ],
    'Redis Copilot (vi)' => [
        'content/vi/databases/redis-gui.json',
        ['Redis Copilot của Redis Insight'],
        ['Redis Copilot của nó'],
    ],
    'Compass, not TablePro, is the subject of its note' => [
        'content/en/databases/mongodb-client.json',
        ['Compass can also write a query from a question in plain language.'],
        ['It can also write a query'],
    ],
    // docs/databases/index.mdx:76 and docs/connections/ssl.mdx:6 at v0.78.0 name these three. A provider the app's docs do not name stays out.
    'hosted PostgreSQL names the services the app’s docs name' => [
        'content/en/databases/postgresql-client.json',
        ['such as Amazon RDS, Neon or Supabase?', 'Neon, Supabase and Heroku connect with the host they give you.'],
        ['PlanetScale', 'pooler'],
    ],
    'hosted PostgreSQL (vi)' => [
        'content/vi/databases/postgresql-client.json',
        ['như Amazon RDS, Neon hay Supabase không?', 'Neon, Supabase và Heroku kết nối bằng host'],
        ['PlanetScale'],
    ],
    // docs/databases/tidb.mdx:34 at v0.78.0.
    'TiDB has Users & Roles, without the connection limit field' => [
        'content/en/databases/mysql-client.json',
        ['<administer>Users & Roles</administer> works on TiDB, without the connection limit field.'],
        [],
    ],
    // SyncRecordMapper.swift:773-793 at v0.78.0 writes the name, the username and the password mode.
    'iCloud Sync carries credential profiles, never their password' => [
        'content/en/features/sync-and-teams.json',
        ['SSH profiles, credential profiles (their name and username, never the password), table and database favorites'],
        ['settings, SSH profiles, table and database favorites'],
    ],
    'credential profiles in iCloud Sync (vi)' => [
        'content/vi/features/sync-and-teams.json',
        ['credential profile (tên profile và tên người dùng, không bao giờ gồm mật khẩu)'],
        ['SSH profile, table và cơ sở dữ liệu yêu thích'],
    ],
    // RowDetailView.swift:302-337 offers NULL only; InsertRowView.swift:134-151 offers Use Default, NULL and Empty String (iOS 232e8dae6).
    'on iPhone, DEFAULT belongs to a new row, not to editing one' => [
        'content/en/features/data-editing.json',
        ['edit a row and set a value to NULL, insert rows', 'In a new row, each field starts at its DEFAULT'],
        ['set a value to NULL or DEFAULT'],
    ],
    'DEFAULT on iPhone (vi)' => [
        'content/vi/features/data-editing.json',
        ['Trong dòng mới, mỗi cột ban đầu nhận DEFAULT'],
        ['NULL hoặc DEFAULT'],
    ],
]);

it('keeps each reviewed correction', function (string $file, array $keeps, array $drops): void {
    $text = reviewedText($file);

    foreach ($keeps as $phrase) {
        expect(str_contains($text, $phrase))->toBeTrue("{$file} lost: {$phrase}");
    }

    foreach ($drops as $phrase) {
        expect(str_contains($text, $phrase))->toBeFalse("{$file} says again: {$phrase}");
    }
})->with('reviewed facts');

it('says TablePro has no import for these engines, not that the engine has none (vi)', function (string $slug, string $engine): void {
    expect(reviewedText("content/vi/databases/{$slug}.json"))
        ->toContain("TablePro không có import cho {$engine}")
        ->not->toContain("{$engine} không hỗ trợ import")
        ->not->toContain("{$engine} không có import");
})->with([
    ['dynamodb-gui', 'DynamoDB'],
    ['elasticsearch-client', 'Elasticsearch'],
    ['surrealdb-client', 'SurrealDB'],
    ['trino-client', 'Trino'],
    ['kafka-client', 'Kafka'],
    ['etcd-gui', 'etcd'],
    ['redis-gui', 'Redis'],
]);

it('writes the Vietnamese iPhone tab with its app label, and structure as cấu trúc in prose', function (): void {
    foreach (File::files(resource_path('data/content/vi/databases')) as $file) {
        $text = reviewedText('content/vi/databases/' . $file->getFilename());

        expect(preg_match('/tab Query(?! ?\))/u', $text))->toBe(0, "{$file->getFilename()} names the iPhone tab without its VI label");
        expect(preg_match('/(sửa|thay đổi|và) structure\b/u', $text))->toBe(0, "{$file->getFilename()} leaves structure in English prose");
    }
});

it('keeps no sentence word for word across the Move data sections of engine pages', function (): void {
    $seen = [];

    foreach (File::files(resource_path('data/content/en/databases')) as $file) {
        if ($file->getFilename() === 'index.json') {
            continue;
        }

        $copy = json_decode($file->getContents(), true, 512, JSON_THROW_ON_ERROR);

        foreach ($copy['sections'] as $section) {
            if ($section['id'] !== 'move-data') {
                continue;
            }

            foreach ($section['paragraphs'] as $paragraph) {
                foreach (preg_split('/(?<=[.!?])\s+/', $paragraph) as $sentence) {
                    if (mb_strlen($sentence) < 40) {
                        continue;
                    }

                    expect($seen[$sentence] ?? null)->toBeNull("{$file->getFilename()} repeats a sentence from " . ($seen[$sentence] ?? '') . ": {$sentence}");
                    $seen[$sentence] = $file->getFilename();
                }
            }
        }
    }
});
