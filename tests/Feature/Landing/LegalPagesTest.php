<?php

use App\Support\Localization\Locales;
use App\Services\Content\SiteFacts;
use App\Services\Legal\LegalDocuments;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;
use Spatie\YamlFrontMatter\YamlFrontMatter;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();
});

// The fragment each language uses for the date of the first query in a usage report.
const LEGAL_FIRST_QUERY = [
    'en' => 'first query',
    'vi' => 'query đầu tiên',
    'es' => 'primera consulta',
    'de' => 'ersten Abfrage',
    'fr' => 'première requête',
    'ja' => '初めてクエリを実行',
    'pt-BR' => 'primeira consulta',
    'zh-Hans' => '首次运行查询',
    'ko' => '첫 쿼리',
    'zh-Hant' => '首次執行查詢',
    'it' => 'prima query',
    'id' => 'kueri pertama',
];

// The phrase each language uses for a monthly or yearly renewal, refundable on its own.
const LEGAL_RENEWAL_REFUND = [
    'en' => 'each monthly or yearly renewal',
    'vi' => 'mỗi lần gia hạn theo tháng hoặc theo năm',
    'es' => 'cada renovación mensual o anual',
    'de' => 'jede monatliche oder jährliche Verlängerung',
    'fr' => 'chaque renouvellement mensuel ou annuel',
    'ja' => '月払い・年払いの各更新',
    'pt-BR' => 'cada renovação mensal ou anual',
    'zh-Hans' => '月付或年付方案的每次续订',
    'ko' => '월간 또는 연간 플랜의 각 갱신',
    'zh-Hant' => '月付或年付方案的每次續訂',
    'it' => 'ogni rinnovo mensile o annuale',
    'id' => 'setiap perpanjangan bulanan atau tahunan',
];

// The shorter marketing sentence still promises a new window for each charge.
// Legal pages and UI catalogs retain the explicit monthly/yearly contract above.
const MARKETING_RENEWAL_REFUND = [
    'en' => ['Purchases and subscription renewals', 'within {refundDays} days of each charge'],
    'vi' => ['Mỗi lần mua hoặc gia hạn subscription', 'trong {refundDays} ngày từ lần thu phí đó'],
    'es' => ['Las compras y renovaciones de suscripciones', '{refundDays} días siguientes a cada cobro'],
    'de' => ['Käufe und Aboverlängerungen', '{refundDays} Tagen nach jeder Abbuchung'],
    'fr' => ['Les achats et renouvellements d’abonnement', '{refundDays} jours suivant chaque paiement'],
    'ja' => ['購入やサブスクリプションの更新', '各請求から {refundDays} 日以内'],
    'pt-BR' => ['Compras e renovações de assinatura', '{refundDays} dias após cada cobrança'],
    'zh-Hans' => ['购买和订阅续费', '每次扣款后 {refundDays} 天内退款'],
    'ko' => ['구매와 구독 갱신', '각 결제 후 {refundDays}일 이내'],
    'zh-Hant' => ['購買和訂閱續費', '每次扣款後 {refundDays} 天內退款'],
    'it' => ['Gli acquisti e i rinnovi degli abbonamenti', '{refundDays} giorni da ogni addebito'],
    'id' => ['Pembelian dan perpanjangan langganan', '{refundDays} hari setelah setiap tagihan'],
];

/**
 * @return list<string>
 */
function legalLocales(): array
{
    // Read from disk: a dataset is built before the application boots.
    return array_keys(json_decode((string) file_get_contents(dirname(__DIR__, 3) . '/resources/data/locales.json'), true)['supported']);
}

function legalSource(string $document, string $locale): string
{
    return (string) file_get_contents(dirname(__DIR__, 3) . "/resources/data/legal/{$locale}/{$document}.md");
}

function legalSection(string $document, string $locale, string $id): string
{
    $body = YamlFrontMatter::parse(legalSource($document, $locale))->body();
    $anchor = '[^\n]*\{#' . preg_quote($id, '/') . '\}\n';

    if (preg_match('/^(#{2,6}) ' . $anchor . '/m', $body, $heading) !== 1) {
        return '';
    }

    // A section runs to the next heading of its own level or above.
    preg_match('/^' . $heading[1] . ' ' . $anchor . '(.*?)(?=^#{2,' . strlen($heading[1]) . '} |\z)/ms', $body, $match);

    return $match[1] ?? '';
}

/**
 * What each line of a document is: a heading with its id, a list item, a paragraph or a blank, with the slots it fills.
 *
 * @return list<string>
 */
function legalShape(string $document, string $locale): array
{
    return array_map(function (string $line): string {
        preg_match_all('/\{[a-zA-Z][a-zA-Z0-9]*\}/', $line, $found);
        $slots = array_unique($found[0]);
        sort($slots);

        $kind = match (true) {
            trim($line) === '' => '',
            preg_match('/^(#{2,6}) .*(\{#[a-z0-9-]+\})$/', $line, $heading) === 1 => "{$heading[1]} {$heading[2]}",
            str_starts_with($line, '- ') => '-',
            default => 'p',
        };

        return trim($kind . ' ' . implode(' ', $slots));
    }, explode("\n", YamlFrontMatter::parse(legalSource($document, $locale))->body()));
}

it('renders each document in both languages under its own component', function (string $path, string $component, string $title): void {
    get($path)
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component($component)
            ->where('document.title', $title)
            ->where('document.updatedAt', fn(string $date): bool => preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) === 1 && $date <= now()->toDateString())
            ->where('document.html', fn(string $html): bool => str_contains($html, '<h2 id="') && ! preg_match('/\{[a-zA-Z]+\}/', $html))
            ->where('document.toc', fn($toc): bool => count($toc) > 1)
            ->has('chrome.notice.body')
            ->where('links.email', 'hello@tablepro.app'));
})->with([
    ['/privacy', 'Privacy', 'Privacy policy'],
    ['/vi/privacy', 'Privacy', 'Chính sách quyền riêng tư'],
    ['/terms', 'Terms', 'Terms of service'],
    ['/vi/terms', 'Terms', 'Điều khoản sử dụng'],
    ['/refund-policy', 'RefundPolicy', 'Refund policy'],
    ['/vi/refund-policy', 'RefundPolicy', 'Chính sách hoàn tiền'],
]);

it('formats the update date in each language on the server', function (): void {
    get('/privacy')->assertInertia(fn(AssertableInertia $page) => $page->where('document.updatedAtFormatted', 'October 10, 2026'));
    get('/vi/privacy')->assertInertia(fn(AssertableInertia $page) => $page->where('document.updatedAtFormatted', '10 tháng 10 năm 2026'));
});

it('indexes each document in every supported language', function (string $route): void {
    $entry = app(PageRegistry::class)->find($route, []);

    expect($entry->renderLocales)->toBe(Locales::codes());
    expect($entry->hreflangCluster())->toBe(Locales::codes());
})->with(['landing.privacy', 'landing.terms', 'landing.refundPolicy']);

it('gives every heading an explicit id', function (string $locale): void {
    foreach (LegalDocuments::DOCUMENTS as $document) {
        preg_match_all('/^#{2,6} .*$/m', YamlFrontMatter::parse(legalSource($document, $locale))->body(), $headings);

        foreach ($headings[0] as $heading) {
            expect($heading)->toMatch('/\{#[a-z0-9-]+\}$/', "legal/{$locale}/{$document}.md: \"{$heading}\" has no explicit id");
        }
    }
})->with(legalLocales());

it('keeps every translation in step with the English page: headings, ids, list items, paragraphs, slots and the update date', function (string $locale): void {
    foreach (LegalDocuments::DOCUMENTS as $document) {
        expect(legalShape($document, $locale))->toBe(legalShape($document, 'en'));
        expect(YamlFrontMatter::parse(legalSource($document, $locale))->matter('updatedAt'))
            ->toBe(YamlFrontMatter::parse(legalSource($document, 'en'))->matter('updatedAt'));
    }
})->with(array_values(array_diff(legalLocales(), ['en'])));

it('takes every number and address from the data files, the same ones in every language', function (string $locale): void {
    $documents = app(LegalDocuments::class);

    foreach (LegalDocuments::DOCUMENTS as $document) {
        expect($documents->tokenNames($document, $locale))->toBe($documents->tokenNames($document, 'en'));
        expect(array_diff($documents->tokenNames($document, $locale), array_keys($documents->tokens($locale))))->toBe([]);

        $source = legalSource($document, $locale);

        // The support address, the refund window and the licence URL are slots, never typed.
        Assert::assertStringNotContainsString('hello@tablepro.app', $source);
        Assert::assertStringNotContainsString('github.com', $source);
        Assert::assertStringNotContainsString('polar.sh', $source);
    }
})->with(legalLocales());

it('closes every bold span on the rendered page', function (string $locale): void {
    // CommonMark leaves ** in the text when the mark sits between punctuation and a letter, as in 。**后.
    foreach (LegalDocuments::DOCUMENTS as $document) {
        expect(app(LegalDocuments::class)->render($document, $locale)['html'])->not->toContain('**');
    }
})->with(legalLocales());

it('keeps the cookie contract the consent bar and the account app rely on', function (string $locale, string $basis, string $settings): void {
    $privacy = legalSource('privacy', $locale);
    $cookies = legalSection('privacy', $locale, 'cookies');

    foreach (['_ga', 'tablepro:analytics-consent', 'tablepro:attribution', 'crisp-client/', 'tablepro-session', 'XSRF-TOKEN', 'theme', 'tablepro:banner-dismissed'] as $name) {
        expect($cookies)->toContain($name);
    }

    expect($privacy)->toContain('{#cookies}')->toContain('Google Analytics')->toContain($settings);
    expect(mb_strtolower($privacy))->toContain($basis);
    expect($cookies)->toContain(LegalDocuments::COOKIE_SETTINGS_MARKER);

    // nl_dismissed_at was listed for years and set by nothing.
    expect($privacy)->not->toContain('nl_dismissed_at');
})->with([
    'English' => ['en', 'lawful basis', 'Cookie settings'],
    'Vietnamese' => ['vi', 'cơ sở pháp lý', 'Cài đặt cookie'],
]);

it('describes purchase attribution as discarded, under the website and the cookies', function (string $locale, string $discarded): void {
    foreach (['website', 'cookies'] as $section) {
        expect(legalSection('privacy', $locale, $section))->toContain('tablepro:attribution');
    }

    expect(legalSection('privacy', $locale, 'website'))->toContain($discarded);

    foreach (['so we know which', 'pay for the work', 'store against the license'] as $phrase) {
        Assert::assertStringNotContainsStringIgnoringCase($phrase, legalSource('privacy', $locale));
    }
})->with([
    'English' => ['en', 'Our server discards it'],
    'Vietnamese' => ['vi', 'Máy chủ của chúng tôi bỏ nó đi'],
]);

it('states what the Mac app and the server actually do', function (): void {
    $mac = legalSection('privacy', 'en', 'mac-app');

    // The usage report: on by default, where to turn it off, and what the server adds.
    expect($mac)
        ->toContain('It is on by default, and the app does not ask before sending the first one.')
        ->toContain('**Settings > General > Privacy**')
        ->toContain('Share anonymous usage data')
        ->toContain('ip-api.com')->toContain('ipinfo.io')->toContain('geoplugin.net')
        ->toContain('unencrypted HTTP');

    // The license check sends the Mac's name, not "the license key and no other data".
    expect($mac)->toContain('your Mac\'s name')->not->toContain('No other data');

    // Team Library uploads SQL text and connection settings, never passwords. The
    // upload carries startup commands and the tunnel command too
    // (ConnectionExportService.buildEnvelope at v0.77.0).
    expect($mac)->toContain('SQL text')->toContain('never passwords')->toContain('startup commands')->toContain('Tunnel Command');

    // Updates come from GitHub and can be turned off; the plugin catalog cannot.
    expect($mac)->toContain('raw.githubusercontent.com')->toContain('Automatically check for updates')->toContain('There is no setting to turn this off.');

    // AI requests go to the provider, not to TablePro.
    expect($mac)->toContain('never through TablePro');

    $ios = legalSection('privacy', 'en', 'ios-app');

    expect($ios)->toContain('**Nothing goes to TablePro unless you turn on Share Usage Data**');

    // Both reports describe the connections that are open, and the iPhone report's license field is always off.
    expect($mac)->toContain('of your open connections')->toContain('how many connections are open');
    expect($ios)->toContain('of your open connections')->toContain('always reports that no license is activated');
});

it('lists the date of the first query for the iPhone report only', function (string $locale): void {
    // The Mac app never records it: MacAnalyticsProvider.markFirstQueryExecuted has no caller at v0.78.0. The iPhone app does.
    expect(LEGAL_FIRST_QUERY)->toHaveKey($locale);
    expect(legalSection('privacy', $locale, 'mac-usage-report'))->not->toBe('')->not->toContain(LEGAL_FIRST_QUERY[$locale]);
    expect(legalSection('privacy', $locale, 'ios-app'))->toContain(LEGAL_FIRST_QUERY[$locale]);
})->with(legalLocales());

it('sets no retention period the server does not keep', function (string $locale): void {
    $retention = legalSection('privacy', $locale, 'retention');

    // The previous policy promised 90 days for server logs and "aggregated" analytics; neither was true.
    expect($retention)->not->toContain('90');
    Assert::assertStringNotContainsStringIgnoringCase('aggregated', legalSource('privacy', $locale));
    Assert::assertStringNotContainsStringIgnoringCase('anonymous analytics', legalSource('privacy', $locale));
})->with(['en', 'vi']);

it('covers the documentation site and its own analytics question', function (string $locale): void {
    /*
     * docs.tablepro.app set Google Analytics cookies on .tablepro.app with no
     * consent, which made "Google Analytics cookies are not set until you
     * allow them" false for anyone who had opened the docs. The docs now ask
     * first. Their bar is English only, so every language names its two
     * controls as they are printed there.
     */
    $intro = strtok(YamlFrontMatter::parse(legalSource('privacy', $locale))->body(), "\n");
    $website = legalSection('privacy', $locale, 'website');

    expect($intro)->toContain('docs.tablepro.app');
    expect($website)->toContain('docs.tablepro.app')->toContain('Google Fonts')->toContain('**Allow**')->toContain('**Cookie settings**');
    expect($website)->toContain('`_ga_<ID>`')->toContain('`mintlify_anonymous_id`');
    expect(legalSection('privacy', $locale, 'cookies'))->toContain('`mintlify_anonymous_id`');
    expect(legalSection('privacy', $locale, 'sharing'))->toContain('**Mintlify**');
    expect(legalSection('privacy', $locale, 'transfers'))->toContain('Mintlify');
})->with(legalLocales());

it('discloses Cloudflare Web Analytics and states Google\'s default retention, never 14 months', function (string $locale, string $twoMonths, string $sixMonths): void {
    /*
     * The owner confirmed (spec §0) that Cloudflare Web Analytics runs on
     * tablepro.app, and that the GA4 property was never set to keep data for
     * 14 months. Google's default for a property is 2 months for user-level
     * and event-level data; the policy describes that default, which holds
     * for as long as the setting is not changed.
     */
    $website = legalSection('privacy', $locale, 'website');
    $retention = legalSection('privacy', $locale, 'retention');

    expect($website)->toContain('**Cloudflare Web Analytics.**')->toContain('`static.cloudflareinsights.com`');
    expect(legalSection('privacy', $locale, 'summary'))->toContain('Cloudflare Web Analytics');
    expect(legalSection('privacy', $locale, 'cookies'))->toContain('Cloudflare Web Analytics');
    expect(legalSection('privacy', $locale, 'lawful-basis'))->toContain('Cloudflare Web Analytics');
    expect(legalSection('privacy', $locale, 'sharing'))->toContain('Cloudflare Web Analytics');
    expect($retention)->toContain('**Cloudflare Web Analytics**')->toContain($sixMonths);
    expect($website)->toContain($twoMonths);
    expect($retention)->toContain($twoMonths);

    Assert::assertDoesNotMatchRegularExpression('/\b(14|fourteen|mười bốn)\s*(months?|tháng)\b/iu', legalSource('privacy', $locale));
})->with([
    'English' => ['en', '2 months', 'six months'],
    'Vietnamese' => ['vi', '2 tháng', 'sáu tháng'],
]);

it('names Polar as merchant of record and no other payment route', function (string $document, string $locale): void {
    $source = legalSource($document, $locale);

    foreach (['LemonSqueezy', 'Lemon Squeezy', 'SePay', 'bank transfer', 'chuyển khoản', 'PPP', 'VND', 'payment processor', 'depending on your region'] as $needle) {
        Assert::assertStringNotContainsStringIgnoringCase($needle, $source, "legal/{$locale}/{$document}.md mentions \"{$needle}\"");
    }

    expect(mb_stripos($source, 'merchant of record'))->not->toBeFalse();
})->with(function (): array {
    $cases = [];

    foreach (['privacy', 'terms', 'refund-policy'] as $document) {
        foreach (legalLocales() as $locale) {
            $cases["{$locale}/{$document}"] = [$document, $locale];
        }
    }

    return $cases;
});

it('makes the terms agree with priority support, the AGPL and the merchant of record', function (): void {
    $terms = legalSource('terms', 'en');
    $pricing = json_decode((string) file_get_contents(resource_path('data/pricing.json')), true);

    // Spec §0: Team emails are answered first, within one business day, and the old "no obligation to provide support" yields to it.
    expect($terms)->toContain('emails from Team customers are answered first, within one business day');
    expect($pricing['tiers']['team']['prioritySupport']['responseBusinessDays'])->toBe(1);
    expect(legalSection('terms', 'en', 'updates'))->toContain('Apart from the priority support above');

    // AGPLv3 §2, §4-§6 and §13: running carries no conditions; conveying and network use of a modified version do.
    expect($terms)->toContain('The AGPL places no conditions on running TablePro')->not->toContain('not to using it');

    // A seat is a Mac, and the update feed is not ours.
    expect($terms)->toContain('Each seat is one activated Mac')->not->toContain('update server');

    // The buyer pays Polar, not us.
    expect($terms)->not->toContain('paid us');
});

it('binds only the services, never the use of the apps, which the AGPLv3 alone licenses', function (): void {
    $terms = legalSource('terms', 'en');
    $intro = strtok(YamlFrontMatter::parse($terms)->body(), "\n");

    // AGPLv3 section 9: running a copy needs no acceptance, and section 10 forbids adding conditions to it.
    expect($intro)->toContain('you do not need to accept these terms to download, install or run them')
        ->not->toContain('By downloading');

    foreach (['acceptable-use', 'indemnification', 'termination', 'changes', 'governing-law'] as $id) {
        expect(legalSection('terms', 'en', $id))->not->toBe('')->not->toContain('Application');
    }

    expect(legalSection('terms', 'en', 'responsibilities'))->not->toContain('sole responsibility')->not->toContain('backing up');
    expect(legalSection('terms', 'en', 'definitions'))->not->toContain('usage reports');
    expect(legalSection('terms', 'en', 'open-source'))->not->toContain('over the source code');

    // The warranty and liability position for the apps is the AGPL's own.
    expect(legalSection('terms', 'en', 'warranty'))->toContain('section 15 of the AGPLv3');
    expect(legalSection('terms', 'en', 'liability'))->toContain('section 16 of the AGPLv3');
});

it('points every language at the AGPL for the apps', function (string $locale): void {
    $intro = strtok(YamlFrontMatter::parse(legalSource('terms', $locale))->body(), "\n");

    expect($intro)->toContain('AGPLv3');
    expect(legalSection('terms', $locale, 'acceptable-use'))->not->toContain('AGPL');
    expect(legalSection('terms', $locale, 'warranty'))->toContain('AGPLv3')->toMatch('/(?<!\d)15(?!\d)/');
    expect(legalSection('terms', $locale, 'liability'))->toContain('AGPLv3')->toMatch('/(?<!\d)16(?!\d)/');
})->with(legalLocales());

it('names the trademark owner and links the English brand guidelines in every language, dated with the change', function (string $locale): void {
    expect(YamlFrontMatter::parse(legalSource('terms', $locale))->matter('updatedAt'))->toBe('2026-10-10');
    expect(legalSection('terms', $locale, 'trademarks'))
        ->toContain('TablePro™')
        ->toContain('{publisherName}')
        ->toContain('](/brand)');
})->with(legalLocales());

it('keeps the refund window from pricing.json and tells a subscriber how to stop renewals', function (string $locale): void {
    $source = legalSource('refund-policy', $locale);

    expect($source)->toContain('{refundDays}');
    Assert::assertDoesNotMatchRegularExpression('/\b7[\s-](days?|ngày)/u', $source);
    expect($source)->toContain('{portal}')->toContain("/account?locale={$locale}");

    // A refund suspends the key at the next check, not "immediately".
    expect($source)->toContain('{revalidateDays}');
    Assert::assertStringNotContainsStringIgnoringCase('machines deactivate', $source);
})->with(['en', 'vi']);

it('refunds each monthly or yearly renewal within the window of its own charge, in the policy, on the pricing page and in the FAQ', function (string $locale): void {
    $phrase = LEGAL_RENEWAL_REFUND[$locale];
    $days = (string) json_decode(File::get(resource_path('data/pricing.json')), true)['refund']['days'];
    $policy = YamlFrontMatter::parse(legalSource('refund-policy', $locale));
    $faq = collect(json_decode(File::get(resource_path("data/content/{$locale}/faq.json")), true)['groups'])
        ->flatMap(fn(array $group): array => $group['items'])
        ->firstWhere('id', 'refunds');

    preg_match('/\brefund"?:\s*\{(.*?)\n\s*\}/s', File::get(resource_path("js/i18n/messages/{$locale}/pricing.ts")), $catalog);
    preg_match_all('/:\s*(["\'])(.+?)\1,?\s*$/m', $catalog[1] ?? '', $forms);

    $texts = [
        'refund-policy.md description' => [(string) $policy->matter('description'), '{refundDays}'],
        'refund-policy.md intro' => [(string) strtok($policy->body(), "\n"), '{refundDays}'],
        'pricing.json refunds' => [json_decode(File::get(resource_path("data/content/{$locale}/pricing.json")), true)['refunds']['body'], '{refundDays}'],
        'faq.json refunds' => [$faq['answer'][0] ?? '', '{refundDays}'],
    ];

    expect($forms[2])->not->toBeEmpty();

    foreach ($forms[2] as $index => $form) {
        $texts["pricing.ts refund form {$index}"] = [$form, '{count}'];
    }

    foreach ($texts as $where => [$text, $slot]) {
        if (in_array($where, ['pricing.json refunds', 'faq.json refunds'], true)) {
            [$renewals, $chargeWindow] = MARKETING_RENEWAL_REFUND[$locale];
            expect($text)->toContain($renewals)->toContain($chargeWindow);
            $at = mb_strpos($text, $renewals);
        } else {
            $at = mb_strpos($text, $phrase);
        }

        expect($at)->not->toBeFalse("{$locale} {$where} does not refund a monthly or yearly renewal");
        expect(mb_substr($text, (int) $at))->toContain($slot);
        expect($text)->not->toMatch('/(?<!\d)' . $days . '(?!\d)/u');
    }
})->with(legalLocales());

it('names the publisher from facts.json as the provider in the terms and the data controller in the privacy policy', function (string $locale): void {
    $publisher = app(SiteFacts::class)->publisher($locale);

    expect($publisher)->not->toBeNull();

    foreach (['terms' => 'definitions', 'privacy' => 'controller'] as $document => $section) {
        expect(legalSection($document, $locale, $section))
            ->toContain('{publisherName}')
            ->toContain('{publisherCity}')
            ->toContain('{publisherCountry}');

        Assert::assertStringNotContainsString($publisher['name'], legalSource($document, $locale));
        Assert::assertStringNotContainsString($publisher['city'], legalSource($document, $locale));

        expect(app(LegalDocuments::class)->render($document, $locale)['html'])
            ->toContain($publisher['name'])
            ->toContain($publisher['city'])
            ->toContain($publisher['country']);
    }

    expect(legalSection('privacy', $locale, 'controller'))->toContain('[{email}](mailto:{email})');
})->with(legalLocales());

it('describes the publisher as one person, never a company or a team', function (): void {
    $offences = [];

    foreach ([...File::allFiles(resource_path('data/legal')), ...File::allFiles(resource_path('data/content'))] as $file) {
        // A capital "Team" before TablePro is the reader's: "Kann mein Team TablePro …".
        if (preg_match_all('/当社|弊社|당사|저희|本公司|people who run TablePro|TablePro (?:[Tt]eam|チーム|팀|团队|團隊)|TablePro-Team|(?:team|[Tt]im|équipe|equipe|equipo de|[Đđ]ội ngũ) TablePro/u', $file->getContents(), $matches) > 0) {
            $offences[] = $file->getRelativePathname() . ': ' . implode(', ', array_unique($matches[0]));
        }
    }

    expect($offences)->toBe([]);
});

it('limits access to the systems to the publisher and the providers that receive data', function (string $locale): void {
    expect(legalSection('privacy', $locale, 'security'))->toContain('{publisherName}')->toContain('](#sharing)');
})->with(legalLocales());

it('points a vulnerability report in the privacy policy at the security page', function (string $locale): void {
    $prefix = Locales::prefixFor($locale);
    $href = ($prefix === null ? '' : "/{$prefix}") . '/security#report';
    $security = json_decode(File::get(resource_path("data/content/{$locale}/security.json")), true);

    expect(legalSection('privacy', $locale, 'security'))->toContain("]({$href})");
    expect(app(LegalDocuments::class)->render('privacy', $locale)['html'])->toContain('href="' . $href . '"');
    expect(array_column($security['sections'], 'id'))->toContain('report');
    expect(app(PageRegistry::class)->find('landing.security', [])->renderLocales)->toContain($locale);
})->with(legalLocales());

it('links each document to pages in its own language', function (string $locale): void {
    $prefix = Locales::prefixFor($locale);
    $offences = [];

    foreach (['privacy', 'terms', 'refund-policy'] as $document) {
        preg_match_all('/\]\((\/[^)\s]*)\)/', legalSource($document, $locale), $links);

        foreach ($links[1] as $href) {
            // The platform's paths carry the language in `?locale=`, never a prefix.
            if (preg_match('#^/account(\?|$)#', $href) === 1) {
                continue;
            }

            // The brand guidelines are published in English alone.
            if ($href === '/brand') {
                continue;
            }

            $segment = explode('/', ltrim($href, '/'))[0];
            $inLocale = $prefix === null ? ! in_array($segment, Locales::codes(), true) : $segment === $prefix;

            if (! $inLocale) {
                $offences[] = "{$document}.md links {$href}";
            }
        }
    }

    expect($offences)->toBe([]);
})->with(legalLocales());

it('notes on Vietnamese pages that the English version prevails', function (): void {
    $chrome = json_decode((string) file_get_contents(resource_path('data/content/vi/legal.json')), true);

    expect($chrome['notice']['body'])->toContain('bản tiếng Anh được ưu tiên áp dụng')->toContain('<english>');
});

it('server-renders the cookie settings button inside the cookies section', function (string $path): void {
    $html = ssrHtml($path);

    $start = strpos($html, 'id="cookies"');
    $end = strpos($html, 'id="lawful-basis"', (int) $start);

    expect($start)->not->toBeFalse();
    expect(substr($html, (int) $start, (int) $end - (int) $start))->toMatch('/<button type="button"[^>]*>(Cookie settings|Cài đặt cookie)<\/button>/');

    // The marker stays in the page props (the JSON payload); the markup must not carry it.
    $markup = (string) preg_replace('#<script data-page="app" type="application/json">.*?</script>#s', '', $html);
    expect($markup)->not->toContain('<cookie-settings>');
})->with(['/privacy', '/vi/privacy']);
