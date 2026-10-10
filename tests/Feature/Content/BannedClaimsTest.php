<?php

use PHPUnit\Framework\Assert;
use Spatie\YamlFrontMatter\YamlFrontMatter;

require_once __DIR__ . '/helpers.php';

/**
 * @return list<array{class: string, about: string, phrases: list<string>, patterns?: list<string>, legalExempt?: bool, sizes?: bool}>
 */
function bannedClaimRows(): array
{
    // Phrases are narrowed from the §12.1 table so ordinary prose does not trip them.
    return [
        [
            'class' => 'Universals',
            'about' => 'TablePro',
            'phrases' => ['every database', 'all databases', 'any database', 'all platforms', 'every platform', 'cross-platform', 'one app everywhere', 'works everywhere', 'mọi cơ sở dữ liệu', 'tất cả cơ sở dữ liệu', 'mọi nền tảng', 'đa nền tảng', 'trên mọi thiết bị'],
        ],
        [
            'class' => 'Platform futures',
            'about' => 'TablePro',
            'phrases' => ['coming soon', 'waitlist', 'wait list', 'sắp ra mắt', 'danh sách chờ'],
        ],
        [
            'class' => 'Brand defined by Mac',
            'about' => 'TablePro',
            'phrases' => ['Mac database client', 'Mac database clients', 'TablePro Mobile', 'Universal', 'Universal Binary', 'Mac App Store', 'Setapp', 'visionOS'],
        ],
        [
            'class' => 'Unscoped free',
            'about' => 'Any',
            'phrases' => ['whole app is free', 'free, all of it', 'all of it is free', 'no feature gating', 'no per-feature gate', 'no paywall', 'free forever', 'completely free', '100% free', 'hoàn toàn miễn phí', 'miễn phí hoàn toàn', 'miễn phí mãi mãi', 'miễn phí trọn đời'],
        ],
        [
            'class' => 'Unlock framing',
            'about' => 'Any',
            'phrases' => ['unlock', 'unlocks', 'unlocked', 'unlocking', 'mở khóa'],
        ],
        [
            'class' => 'Privacy',
            'about' => 'Any',
            'phrases' => ['nothing leaves your device', 'nothing leaves your Mac', 'nothing leaves your computer', 'nothing leaving your device', 'nothing leaving your Mac', 'nothing leaving your computer', 'fully offline', 'no account', 'nothing to sign up for', 'anonymous analytics', 'anonymous usage data', 'no tracking', 'only the license key is sent', 'no other data is sent', 'không có dữ liệu nào rời khỏi máy', 'hoàn toàn offline', 'không cần tài khoản', 'ẩn danh'],
        ],
        [
            // GA4 keeps Google's default 2 months, as the privacy policy states.
            'class' => 'Analytics retention',
            'about' => 'Any',
            'phrases' => ['14 months', '14 tháng', 'fourteen months', 'mười bốn tháng'],
        ],
        [
            'class' => 'Safety overreach',
            'about' => 'Any',
            'phrases' => ['nothing runs that you have not read', "nothing runs that you haven't read", 'all changes reviewed', 'all changes are reviewed', 'every write needs approval', 'never writes without approval', 'is a sandbox', 'is a security boundary', 'UPDATE without WHERE asks', 'mọi thay đổi đều được xem lại', 'AI không bao giờ ghi khi chưa được duyệt'],
        ],
        [
            'class' => 'Performance',
            'about' => 'Any',
            'phrases' => ['blazing', 'blazing-fast', 'lightweight', 'instant', 'instantly', 'under a second', 'faster than', 'lighter than', 'siêu nhanh', 'nhanh hơn', 'nhẹ hơn', 'tức thì'],
            'patterns' => [
                '(?<![\p{L}\p{N}.,])\d+(?:[.,]\d+)?\s?(?:[×x]|times)\s?(?:faster|lighter|smaller|quicker|less|fewer)(?![\p{L}\p{N}])',
                '(?<![\p{L}\p{N}.,])\d+(?:[.,]\d+)?\s?(?:ms|milliseconds?|mili\s?giây)(?![\p{L}\p{N}])',
                '(?<![\p{L}\p{N}])(?:nhanh|nhẹ|nhỏ)\s+gấp\s+\d+(?:[.,]\d+)?\s+lần(?![\p{L}\p{N}])',
                '(?<![\p{L}\p{N}])(?:in|under|within|trong|dưới|chỉ)\s+(?:\d+(?:[.,]\d+)?\s+(?:seconds?|giây)(?![\p{L}\p{N}])|(?:a|one|half a|một|nửa)\s+(?:second|giây)(?=\s*(?:[.,;:!?)]|$)))',
            ],
        ],
        [
            'class' => 'Performance (sizes)',
            'about' => 'Any',
            'phrases' => [],
            'patterns' => ['(?<![\p{L}\p{N}.,])~?\s?\d+(?:[.,]\d+)?\s?(?:KB|MB|GB)(?![\p{L}\p{N}])'],
            'sizes' => true,
        ],
        [
            'class' => 'Hype',
            'about' => 'Any',
            'phrases' => ['powerful', 'seamless', 'seamlessly', 'effortless', 'effortlessly', 'revolutionary', 'supercharge', 'supercharged', 'game-changing', 'game changer', 'ultimate', 'best-in-class', 'next-generation', 'cutting-edge', 'magic', 'magical', 'AI-powered', 'mạnh mẽ', 'liền mạch', 'đột phá', 'vượt trội', 'tuyệt vời', 'hàng đầu', 'tốt nhất', 'thế hệ mới'],
            'legalExempt' => true,
        ],
        [
            'class' => 'Stale facts',
            'about' => 'TablePro',
            'phrases' => ['macOS 14', 'Sonoma', 'iOS 17', '16 MCP tools', '13 AI providers', 'remote MCP', 'MCP từ xa', 'MCP over TLS', 'CSV inspector', 'Quick Switcher', 'pub/sub', 'pipeline builder', 'SQLCipher', 'bring your own key'],
            'patterns' => ['#\s?1\s+(?:on|trên)\s+GitHub\s+Trending(?![\p{L}\p{N}])'],
        ],
        [
            'class' => 'Commerce',
            'about' => 'Any',
            'phrases' => ['most popular', 'best value', 'lifetime updates', 'all future updates', 'money-back guarantee', 'PPP', 'purchasing power', 'regional pricing', 'regional prices', 'bank transfer', 'SePay', 'VND', 'VietQR', 'LemonSqueezy', 'Lemon Squeezy', 'phổ biến nhất', 'cập nhật trọn đời', 'chuyển khoản'],
            'patterns' => ['(?<![\p{L}\p{N}])save\s+\d+\s?%', '(?<![\p{L}\p{N}])tiết kiệm\s+\d+\s?%', '₫'],
        ],
        [
            'class' => 'iOS 1.0 specifics',
            'about' => 'TablePro',
            'phrases' => ['jump hosts on iPhone', 'jump host on iPhone', 'Redis key browsing on iPhone', 'side-by-side iPad layout', 'editing long values on iPhone', 'nothing connects until you unlock', 'feature parity'],
        ],
        [
            'class' => 'Funding pleas',
            'about' => 'Any',
            'phrases' => ['need your help', 'help us keep', 'if you can afford', 'cannot afford', "can't afford", 'struggling'],
            'patterns' => ['(?<![\p{L}\p{N}])not enough to (?:cover|pay|keep)(?![\p{L}\p{N}])', "(?<![\\p{L}\\p{N}])(?:don't|do not) cover (?:the|our) costs(?![\\p{L}\\p{N}])"],
        ],
        [
            'class' => 'Purchase attribution',
            'about' => 'Any',
            'phrases' => ['so we know which', 'pay for the work', 'store against the license'],
        ],
    ];
}

/**
 * @return list<array{id: string, phrases: list<string>, sources: list<string>, evidence: string, spec: bool}>
 */
function bannedClaimAllowlist(): array
{
    $compare = ['resources/data/content/*/compare/*.json', 'resources/data/comparisons.json'];

    return [
        ['id' => 'A1', 'phrases' => ['cross-platform', 'đa nền tảng'], 'sources' => $compare, 'evidence' => 'DBeaver, Beekeeper Studio, HeidiSQL (each product\'s sourced `platforms` in comparisons.json)', 'spec' => true],
        ['id' => 'A2', 'phrases' => ['macOS 14'], 'sources' => $compare, 'evidence' => 'Postico 2, pgAdmin and Navicat requirements (each product\'s sourced `mac.minVersion` in comparisons.json)', 'spec' => true],
        ['id' => 'A3', 'phrases' => ['Mac App Store'], 'sources' => $compare, 'evidence' => 'Sequel Ace and Postico distribution (their sources in comparisons.json)', 'spec' => true],
        ['id' => 'A4', 'phrases' => ['Setapp'], 'sources' => ['resources/data/content/*/compare/tableplus.json', 'resources/data/comparisons.json#products.tableplus.'], 'evidence' => 'TablePlus is on Setapp (setapp.com/apps/tableplus)', 'spec' => true],
        ['id' => 'A5', 'phrases' => ["TablePlus's Setapp edition", 'bản Setapp của TablePlus'], 'sources' => ['*'], 'evidence' => 'The connection importer reads it (the TablePlus importer in TablePro v0.77.0)', 'spec' => true],
        ['id' => 'A8', 'phrases' => ['Share anonymous usage data', 'Chia sẻ dữ liệu sử dụng ẩn danh'], 'sources' => ['resources/data/legal/*/privacy.md'], 'evidence' => 'The Mac setting\'s exact label (TablePro v0.77.0, Settings)', 'spec' => true],
        [
            'id' => 'A9',
            'phrases' => ['Instant Client'],
            'sources' => ['resources/data/content/*/databases/oracle-client.json', 'resources/data/content/*/engines.json#oracle.'],
            'evidence' => 'Oracle\'s product name, which the driver does without (sitemap §A.3; TablePro docs/databases/oracle.mdx at v0.77.0)',
            'spec' => false,
        ],
        [
            // The edition list only: "the ultimate DBeaver alternative" in the same file is still hype.
            'id' => 'A10',
            'phrases' => ['Enterprise, Ultimate and Team', 'Enterprise, Ultimate và Team', 'Lite, Enterprise and Ultimate', 'Lite, Enterprise và Ultimate'],
            'sources' => ['resources/data/content/*/compare/dbeaver.json'],
            'evidence' => 'DBeaver\'s paid editions (dbeaver.com/edition), and the three with an MCP server (its MCP server documentation)',
            'spec' => false,
        ],
        [
            'id' => 'A10b',
            'phrases' => ['Ultimate'],
            'sources' => ['resources/data/comparisons.json#products.dbeaver.prices.'],
            'evidence' => 'The name of DBeaver\'s Ultimate edition in its price list (dbeaver.com/edition)',
            'spec' => false,
        ],
        [
            'id' => 'A11',
            'phrases' => [
                'There is no pub/sub view', 'Không có màn hình pub/sub',
                'There is no visual aggregation pipeline builder',
                'such as SQLCipher and SEE files, do not open', 'chẳng hạn file SQLCipher hay SEE',
                'SQLCipher and SEE files do not open', 'the sqlcipher tool', 'File SQLCipher và SEE không mở được', 'công cụ sqlcipher',
            ],
            'sources' => [
                'resources/data/content/*/engines.json#redis.limits.',
                'resources/data/content/*/engines.json#mongodb.limits.',
                'resources/data/content/*/engines.json#sqlite.limits.',
                'resources/data/content/*/databases/sqlite-client.json',
            ],
            'evidence' => 'Limit sentences that deny the stale features: no pub/sub, no pipeline builder, no SQLCipher/SEE (TablePro docs/databases/redis.mdx, mongodb.mdx and sqlite.mdx at v0.77.0)',
            'spec' => false,
        ],
        [
            'id' => 'A12',
            'phrases' => ['a Pub/Sub workspace', 'workspace Pub/Sub'],
            'sources' => ['resources/data/content/*/databases/redis-gui.json'],
            'evidence' => 'Redis Insight\'s own feature, on the page that concedes it (redis.io/insight)',
            'spec' => false,
        ],
    ];
}

function bannedClaimStripAllowed(string $text, string $path, string $key): string
{
    static $allowlist = null;
    $allowlist ??= bannedClaimAllowlist();

    foreach ($allowlist as $entry) {
        if (! contentGuardInScope($entry['sources'], $path, $key)) {
            continue;
        }

        foreach ($entry['phrases'] as $phrase) {
            $text = (string) preg_replace(contentGuardPhrasePattern($phrase), ' ', $text);
        }
    }

    return $text;
}

/**
 * @return list<string>
 */
function bannedClaimMatches(string $text, bool $legal = false, bool $sizesAllowed = false): array
{
    static $rows = null;
    $rows ??= array_map(fn(array $row): array => [...$row, 'regexes' => [
        ...array_map('contentGuardPhrasePattern', $row['phrases']),
        ...array_map(fn(string $pattern): string => "/{$pattern}/iu", $row['patterns'] ?? []),
    ]], bannedClaimRows());
    $found = [];

    foreach ($rows as $row) {
        if (($legal && ($row['legalExempt'] ?? false)) || ($sizesAllowed && ($row['sizes'] ?? false))) {
            continue;
        }

        foreach ($row['regexes'] as $pattern) {
            if (preg_match_all($pattern, $text, $matches) > 0) {
                foreach ($matches[0] as $match) {
                    $found[] = "{$row['class']}: \"{$match}\"";
                }
            }
        }
    }

    return $found;
}

it('reads every source positioning §12 names, and leaves the release posts out', function (): void {
    $sources = collect(contentGuardSources());
    $paths = $sources->pluck('path')->all();

    foreach (['en', 'vi'] as $locale) {
        $content = array_filter($paths, fn(string $path): bool => str_starts_with($path, "resources/data/content/{$locale}/"));

        expect(count($content))->toBe(count(contentGuardFiles(resource_path("data/content/{$locale}"), 'json')), "content/{$locale} is not read in full");
        expect($paths)->toContain("resources/data/legal/{$locale}/privacy.md", "lang/{$locale}/errors.php", "resources/js/i18n/messages/{$locale}/nav.ts");
    }

    // A parser that silently read nothing would pass every catalog through.
    foreach ($sources->where('kind', 'catalog') as $source) {
        Assert::assertNotEmpty($source['strings'], "{$source['path']} yielded no strings");
    }

    foreach ([...(glob(resource_path('blog/*.md')) ?: []), ...(glob(resource_path('blog/vi/*.md')) ?: [])] as $post) {
        $read = in_array(contentGuardRelative($post), $paths, true);

        expect($read)->toBe(! contentGuardIsReleasePost($post), contentGuardRelative($post) . ($read ? ' is a release post and must not be read' : ' is not a release post and must be read'));
    }

    expect($sources->sum(fn(array $source): int => count($source['strings'])))->toBeGreaterThan(5000);
});

it('holds a release post’s description and punchline to the privacy row', function (): void {
    // The description and punchline also feed /blog, the meta tags, JSON-LD and the OG card, which a correction on the post never reaches.
    $privacy = collect(bannedClaimRows())->firstWhere('class', 'Privacy');
    $offences = [];

    foreach (glob(resource_path('blog/*.md')) ?: [] as $post) {
        if (! contentGuardIsReleasePost($post)) {
            continue;
        }

        $document = YamlFrontMatter::parseFile($post);

        foreach (['description', 'ogPunchline'] as $field) {
            $text = contentGuardText((string) $document->matter($field));

            foreach ($privacy['phrases'] as $phrase) {
                if (preg_match(contentGuardPhrasePattern($phrase), $text, $match) === 1) {
                    $offences[] = basename($post) . " {$field}: \"{$match[0]}\"";
                }
            }
        }
    }

    expect($offences)->toBe([], "Privacy claims in a release post summary:\n  " . implode("\n  ", $offences));
});

it('reads a sentence under a key that usually holds an identifier', function (string $path, string $key): void {
    // The key name alone once hid 58 printed strings, workflows.paid among them, from every guard.
    $source = collect(contentGuardSources())->firstWhere('path', $path);

    expect($source)->not->toBeNull("{$path} is not read");
    expect($source['strings'])->toHaveKey($key);
})->with([
    'a paid-plan sentence on the homepage' => ['resources/data/content/en/home.json', 'workflows.paid'],
    'the same sentence in Vietnamese' => ['resources/data/content/vi/home.json', 'workflows.paid'],
    'a features page header line' => ['resources/data/content/en/features/index.json', 'labels.header.paid'],
    'a docs link label' => ['resources/data/content/en/features/index.json', 'labels.header.docs'],
    'a catalog docs label' => ['resources/js/i18n/messages/en/nav.ts', 'docs'],
]);

it('skips an identifier under a structural key, and reads words under the same key', function (string $key, string $value, bool $read): void {
    expect(contentGuardIsVisible($key, $value))->toBe($read);
})->with([
    'a feature key path' => ['sections.0.feature', 'cells.importExport', false],
    'a camelCase id' => ['rows.0.id', 'alertFull', false],
    'an asset id' => ['rows.0.asset', 'mac-team-library', false],
    'a paid sentence' => ['workflows.paid', 'Unlock {features} with a {tier} plan.', true],
    'a token pair' => ['labels.paid', '{tier}: {features}', true],
    'a capitalised label' => ['labels.docs', 'Paid plans', true],
]);

it('bans a claim written under a key that usually holds an identifier', function (): void {
    $strings = contentGuardJsonStrings(['workflows' => ['paid' => 'Unlock {features} with a {tier} plan. 47 MCP tools included.']]);

    expect($strings)->toHaveKey('workflows.paid')
        ->and(bannedClaimMatches(contentGuardText($strings['workflows.paid'])))->not->toBe([]);
});

it('bans every phrase in positioning §12.1, in English and Vietnamese, outside the allowlist', function (): void {
    $offences = [];

    foreach (contentGuardSources() as $source) {
        $legal = $source['kind'] === 'legal';

        foreach ($source['strings'] as $key => $text) {
            $prepared = bannedClaimStripAllowed(contentGuardText($text), $source['path'], $key);
            $sizesAllowed = contentGuardIsSourcedNote($source['path'], $key, dated: true);

            foreach (bannedClaimMatches($prepared, $legal, $sizesAllowed) as $match) {
                $offences[] = "{$source['path']} {$key}: {$match}";
            }
        }
    }

    expect($offences)->toBe([], "Banned by positioning §12:\n  " . implode("\n  ", $offences));
});

it('matches whole words and phrases, whatever the case, apostrophe or language', function (string $text, bool $banned): void {
    expect(bannedClaimMatches(contentGuardText($text)) !== [])->toBe($banned);
})->with([
    'a hype word' => ['Một bước đột phá cho lập trình viên', true],
    'the same letters inside other words' => ['Các xung đột pháp luật được giải quyết tại tòa án', false],
    'unlock, any case' => ['A license Unlocks the paid features', true],
    'unlock inside another word' => ['Its blocks unlockable by nothing', false],
    'a curly apostrophe' => ['Nothing runs that you haven’t read', true],
    'a hyphen written as a space' => ['A cross platform client', true],
    'a Vietnamese universal' => ['Kết nối mọi cơ sở dữ liệu', true],
    'a scoped Vietnamese sentence' => ['Kết nối các cơ sở dữ liệu được hỗ trợ', false],
    'a benchmark' => ['Starts 3x faster and idles at 80 MB', true],
    'a dimension, not a benchmark' => ['A 1216 x 684 pt window', false],
    'a typed saving' => ['Save 30% with yearly billing', true],
    'a computed saving' => ['{percent}% less than twelve monthly payments', false],
    'the dong sign' => ['Giá 250.000₫ mỗi năm', true],
    'Instant Client outside its sources' => ['Install Instant Client first', true],
    'an English plea' => ['We need your help to keep going', true],
    'a Vietnamese speed multiple' => ['Kết nối nhanh gấp 3 lần', true],
    'a Vietnamese startup time' => ['Khởi động trong 0,3 giây', true],
    'Vietnamese milliseconds' => ['Phản hồi dưới 50 mili giây', true],
    'an English startup time' => ['Launches in 0.4 seconds', true],
    'a timeout, not a speed claim' => ['The query stops after 30 seconds', false],
    'a spelled-out startup time' => ['It opens in a second.', true],
    'a second window, not a time' => ['The table opens in a second window', false],
    'a second tab in Vietnamese' => ['Mở trong một giây lát', false],
    'remote MCP in Vietnamese' => ['Hỗ trợ máy chủ MCP từ xa', true],
    'the trending claim in Vietnamese' => ['Hạng #1 trên GitHub Trending', true],
    'the trending claim in English' => ['#1 on GitHub Trending', true],
    'a spelled-out retention' => ['kept for fourteen months', true],
    'a spelled-out Vietnamese retention' => ['Giữ dữ liệu mười bốn tháng', true],
]);

it('allows an allowlisted phrase only in the sources its entry names', function (): void {
    $setapp = "TablePro reads TablePlus's Setapp edition too.";
    $oracle = 'A pure-Swift driver with no Instant Client.';

    expect(bannedClaimMatches(bannedClaimStripAllowed(contentGuardText($setapp), 'resources/data/content/en/features/connections.json', 'sections.import.body')))->toBe([])
        ->and(bannedClaimMatches(bannedClaimStripAllowed(contentGuardText('Get it on Setapp.'), 'resources/data/content/en/features/connections.json', 'sections.import.body')))->not->toBe([])
        ->and(bannedClaimMatches(bannedClaimStripAllowed(contentGuardText('Get it on Setapp.'), 'resources/data/content/en/compare/tableplus.json', 'stronger.items.2.text')))->toBe([])
        ->and(bannedClaimMatches(bannedClaimStripAllowed(contentGuardText($oracle), 'resources/data/content/en/engines.json', 'oracle.tagline')))->toBe([])
        ->and(bannedClaimMatches(bannedClaimStripAllowed(contentGuardText($oracle), 'resources/data/content/en/engines.json', 'mysql.tagline')))->not->toBe([])
        ->and(bannedClaimMatches(bannedClaimStripAllowed(contentGuardText('Editing is in the Enterprise, Ultimate and Team editions.'), 'resources/data/content/en/compare/dbeaver.json', 'notes.dbeaver-erd-edit-paid')))->toBe([])
        ->and(bannedClaimMatches(bannedClaimStripAllowed(contentGuardText('The ultimate DBeaver alternative for the Mac'), 'resources/data/content/en/compare/dbeaver.json', 'header.title')))->not->toBe([])
        ->and(bannedClaimMatches(bannedClaimStripAllowed(contentGuardText('Ultimate'), 'resources/data/comparisons.json', 'products.dbeaver.prices.2.edition')))->toBe([])
        ->and(bannedClaimMatches(bannedClaimStripAllowed(contentGuardText('The ultimate client'), 'resources/data/comparisons.json', 'products.dbeaver.cells.databases.note')))->not->toBe([])
        ->and(bannedClaimMatches(contentGuardText('Ultimate power'), legal: true))->toBe([])
        ->and(bannedClaimMatches(contentGuardText('Ultimate power')))->not->toBe([]);
});

it('keeps every allowlist entry it added in use, with evidence', function (): void {
    foreach (bannedClaimAllowlist() as $entry) {
        expect($entry['evidence'])->not->toBe('', "{$entry['id']} names no evidence");

        if ($entry['spec']) {
            continue;
        }

        foreach ($entry['phrases'] as $phrase) {
            $used = false;

            foreach (contentGuardSources() as $source) {
                foreach ($source['strings'] as $key => $text) {
                    if (contentGuardInScope($entry['sources'], $source['path'], $key) && preg_match(contentGuardPhrasePattern($phrase), contentGuardText($text)) === 1) {
                        $used = true;

                        break 2;
                    }
                }
            }

            expect($used)->toBeTrue("{$entry['id']} allows \"{$phrase}\", which none of its sources says any more. Remove it.");
        }
    }
});

it('never publishes a rating nobody gave', function (): void {
    // Comments are stripped: a docblock may explain why there is no rating.
    $offences = [];
    $files = [
        ...contentGuardFiles(resource_path('js'), 'ts'),
        ...contentGuardFiles(resource_path('js'), 'tsx'),
        ...contentGuardFiles(resource_path('data'), 'json'),
        ...contentGuardFiles(resource_path('views'), 'php'),
    ];

    foreach ($files as $file) {
        $code = (string) preg_replace(['#/\*.*?\*/#s', '#(?<![:\'"])//[^\n]*#', '/\{\{--.*?--\}\}/s'], '', (string) file_get_contents($file));

        if (preg_match_all('/aggregateRating|ratingValue|ratingCount|reviewCount|bestRating/i', $code, $matches) > 0) {
            $offences[] = contentGuardRelative($file) . ': ' . implode(', ', array_unique($matches[0]));
        }
    }

    expect(count($files))->toBeGreaterThan(50)
        ->and($offences)->toBe([], "A rating nobody gave:\n  " . implode("\n  ", $offences));
});

it('keeps the removed Terminal feature out of the image set', function (): void {
    // Removed in TablePro 0.43.2; its screenshots went with it (Seo/StaleClaimsTest).
    expect(glob(public_path('images/features/terminal-*')) ?: [])->toBe([]);
});
