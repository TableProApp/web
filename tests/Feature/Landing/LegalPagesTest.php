<?php

use App\Services\Legal\LegalDocuments;
use App\Support\Seo\PageRegistry;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;
use Spatie\YamlFrontMatter\YamlFrontMatter;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/**
 * The privacy policy, terms and refund policy (sitemap §A.6, §E.7).
 *
 * Each is markdown in `resources/data/legal/{en,vi}/`. English is
 * authoritative and each Vietnamese file is a full translation (spec §0). The
 * owner's direction for the privacy policy is to describe what the apps,
 * the website and the server actually do today, so most cases here pin a
 * fact the previous policy got wrong: the license check sends the Mac's name,
 * the server keeps IP addresses with no time limit and looks up their country
 * over plain HTTP, Team Library uploads SQL, and purchase attribution is
 * discarded rather than used.
 */
beforeEach(function (): void {
    withoutVite();
});

/**
 * The raw markdown of a document, front matter included.
 */
function legalSource(string $document, string $locale): string
{
    return (string) file_get_contents(resource_path("data/legal/{$locale}/{$document}.md"));
}

/**
 * The text of one `##` section of a document, by its heading id.
 */
function legalSection(string $document, string $locale, string $id): string
{
    $body = YamlFrontMatter::parse(legalSource($document, $locale))->body();

    preg_match('/^## [^\n]*\{#' . preg_quote($id, '/') . '\}\n(.*?)(?=^## |\z)/ms', $body, $match);

    return $match[1] ?? '';
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
    get('/privacy')->assertInertia(fn(AssertableInertia $page) => $page->where('document.updatedAtFormatted', 'October 3, 2026'));
    get('/vi/privacy')->assertInertia(fn(AssertableInertia $page) => $page->where('document.updatedAtFormatted', '3 tháng 10 năm 2026'));
});

it('pairs each document with its translation and indexes both', function (string $route): void {
    $entry = app(PageRegistry::class)->find($route, []);

    expect($entry->renderLocales)->toBe(['en', 'vi']);
    expect($entry->hreflangCluster())->toBe(['en', 'vi']);
})->with(['landing.privacy', 'landing.terms', 'landing.refundPolicy']);

it('gives every heading an explicit id, the same in both languages', function (string $document): void {
    foreach (['en', 'vi'] as $locale) {
        $body = YamlFrontMatter::parse(legalSource($document, $locale))->body();

        preg_match_all('/^#{2,6} .*$/m', $body, $headings);

        foreach ($headings[0] as $heading) {
            expect($heading)->toMatch('/\{#[a-z0-9-]+\}$/', "legal/{$locale}/{$document}.md: \"{$heading}\" has no explicit id");
        }
    }

    preg_match_all('/\{#([a-z0-9-]+)\}/', legalSource($document, 'en'), $en);
    preg_match_all('/\{#([a-z0-9-]+)\}/', legalSource($document, 'vi'), $vi);

    expect($vi[1])->toBe($en[1]);
})->with(['privacy', 'terms', 'refund-policy']);

it('takes every number and address from the data files, the same ones in both languages', function (string $document): void {
    $documents = app(LegalDocuments::class);

    expect($documents->tokenNames($document, 'vi'))->toBe($documents->tokenNames($document, 'en'));
    expect(array_diff($documents->tokenNames($document, 'en'), array_keys($documents->tokens())))->toBe([]);

    foreach (['en', 'vi'] as $locale) {
        $source = legalSource($document, $locale);

        // The support address, the refund window and the licence URL are slots, never typed.
        Assert::assertStringNotContainsString('hello@tablepro.app', $source);
        Assert::assertStringNotContainsString('github.com', $source);
        Assert::assertStringNotContainsString('polar.sh', $source);
    }
})->with(['privacy', 'terms', 'refund-policy']);

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
});

it('sets no retention period the server does not keep', function (string $locale): void {
    $retention = legalSection('privacy', $locale, 'retention');

    // The previous policy promised 90 days for server logs and "aggregated" analytics; neither was true.
    expect($retention)->not->toContain('90');
    Assert::assertStringNotContainsStringIgnoringCase('aggregated', legalSource('privacy', $locale));
    Assert::assertStringNotContainsStringIgnoringCase('anonymous analytics', legalSource('privacy', $locale));
})->with(['en', 'vi']);

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

    expect($source)->toContain('merchant of record');
})->with(function (): array {
    $cases = [];

    foreach (['privacy', 'terms', 'refund-policy'] as $document) {
        foreach (['en', 'vi'] as $locale) {
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

it('keeps the refund window from pricing.json and tells a subscriber how to stop renewals', function (string $locale): void {
    $source = legalSource('refund-policy', $locale);

    expect($source)->toContain('{refundDays}');
    Assert::assertDoesNotMatchRegularExpression('/\b7[\s-](days?|ngày)/u', $source);
    expect($source)->toContain('{portal}')->toContain("/account?locale={$locale}");

    // A refund suspends the key at the next check, not "immediately".
    expect($source)->toContain('{revalidateDays}');
    Assert::assertStringNotContainsStringIgnoringCase('machines deactivate', $source);
})->with(['en', 'vi']);

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
