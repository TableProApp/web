<?php

use App\Support\Localization\Locales;
use App\Support\Pricing\Checkout;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();
});

/**
 * @return array<string, mixed>
 */
function pricingPageJson(string $file): array
{
    return json_decode(File::get(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @return list<string>
 */
function pricingCopySources(): array
{
    return [
        resource_path('data/content/en/pricing.json'),
        resource_path('data/content/vi/pricing.json'),
        resource_path('data/content/en/paid-features.json'),
        resource_path('data/content/vi/paid-features.json'),
        resource_path('js/i18n/messages/en/pricing.ts'),
        resource_path('js/i18n/messages/vi/pricing.ts'),
    ];
}

function pricingVisibleText(string $path): string
{
    // Without comments, so a docblock that explains a rule does not count as breaking it.
    $text = (string) file_get_contents($path);

    if (str_ends_with($path, '.ts')) {
        $text = (string) preg_replace(['#/\*.*?\*/#s', '#(?<![:\'"])//[^\n]*#'], '', $text);
    }

    return (string) Normalizer::normalize($text, Normalizer::FORM_C);
}

/**
 * @return list<array{price: string, hidden: bool}>
 */
function pricingPricePoints(string $html): array
{
    preg_match_all('#<p(?<hidden> hidden="")? class="[^"]*"><span class="type-h1[^"]*">(?<price>[^<]+)</span>#u', $html, $found, PREG_SET_ORDER);

    return array_map(fn(array $match): array => ['price' => $match['price'], 'hidden' => $match['hidden'] !== ''], $found);
}

/**
 * @return list<array{price: string, hidden: bool}>
 */
function pricingExpectedPricePoints(string $pattern, string $decimal): array
{
    $pricing = pricingPageJson('pricing.json');
    $write = fn(int|float $amount): string => sprintf($pattern, str_replace('.', $decimal, is_int($amount) ? (string) $amount : number_format($amount, 2, '.', '')));
    $expected = [['price' => $write($pricing['tiers']['free']['price']), 'hidden' => false]];

    foreach (['starter', 'team'] as $tier) {
        foreach ($pricing['cycles'] as $cycle) {
            $expected[] = ['price' => $write($pricing['tiers'][$tier]['prices'][$cycle]), 'hidden' => $cycle !== 'yearly'];
        }
    }

    return $expected;
}

it('renders in both languages with the copy, each paid feature\'s lines, the checkout provider, the featured engines and the paid clients\' comparisons', function (string $path, string $locale): void {
    config(['payment.provider' => 'polar']);

    $content = pricingPageJson("content/{$locale}/pricing.json");
    $featureIds = array_column(pricingPageJson('paid-features.json'), 'id');
    $engines = collect(pricingPageJson('engines.json'))
        ->filter(fn(array $engine): bool => ($engine['featured'] ?? false) === true && ($engine['state'] ?? null) === 'published')
        ->pluck('name')
        ->values()
        ->all();
    $comparisons = collect(pricingPageJson('comparisons.json')['products'])
        ->filter(fn(array $product): bool => $product['slug'] !== null && collect($product['prices'])->contains(fn(array $price): bool => $price['amount'] > 0))
        ->map(fn(array $product): array => [
            'path' => '/compare/' . $product['slug'],
            'title' => pricingPageJson("content/{$locale}/compare/{$product['slug']}.json")['header']['title'],
        ])
        ->values()
        ->all();

    expect($engines)->not->toBeEmpty();
    expect(array_column($comparisons, 'path'))->toContain('/compare/tableplus', '/compare/datagrip')->not->toContain('/compare/sequel-ace');

    get($path)
        ->assertOk()
        ->assertInertia(function (AssertableInertia $page) use ($locale, $content, $featureIds, $engines, $comparisons): void {
            $page->component('Pricing')
                ->where('locale', $locale)
                ->where('content.header.title', $content['header']['title'])
                ->where('content.seo.title', $content['seo']['title'])
                ->where('checkout', ['provider' => 'polar', 'couponField' => false])
                ->where('featuredEngines', $engines)
                ->where('comparisons', $comparisons);

            $details = $page->toArray()['props']['paidFeatures'];

            foreach ($featureIds as $id) {
                Assert::assertIsString($details[$id]['detail'] ?? null, "{$locale}: {$id} has no detail");
                Assert::assertIsString($details[$id]['lapse'] ?? null, "{$locale}: {$id} does not say what happens when a plan ends");
            }
        });
})->with([
    'English' => ['/pricing', 'en'],
    'Vietnamese' => ['/vi/pricing', 'vi'],
]);

it('asks for a discount code only where the provider\'s checkout does not', function (string $provider, array $expected): void {
    config(['payment.provider' => $provider]);

    expect(app(Checkout::class)->props())->toBe($expected);
})->with([
    'Polar takes the code in its own checkout' => ['polar', ['provider' => 'polar', 'couponField' => false]],
    'Lemon Squeezy takes it from this site' => ['lemonsqueezy', ['provider' => 'lemonsqueezy', 'couponField' => true]],
    'an unknown value falls back to the configuration default' => ['stripe', ['provider' => 'lemonsqueezy', 'couponField' => true]],
]);

it('indexes every complete translation', function (): void {
    $entry = app(PageRegistry::class)->find('landing.pricing', []);

    expect($entry)->not->toBeNull();
    expect($entry->renderLocales)->toBe(Locales::codes());
    expect($entry->indexableLocales)->toBe(Locales::codes());
    expect($entry->hreflangCluster())->toBe(Locales::codes());
});

it('fills every slot in its copy from data, and marks up only what the page renders', function (): void {
    $slots = ['activations', 'revalidateDays', 'graceDays', 'merchant', 'refundDays', 'min', 'max', 'email'];
    $tags = ['ui', 'account', 'portal', 'link', 'email', 'terms'];

    foreach (array_filter(Illuminate\Support\Arr::dot(pricingPageJson('content/en/pricing.json')), 'is_string') as $key => $text) {
        preg_match_all('/\{([A-Za-z][A-Za-z0-9_.]*)\}/', $text, $found);

        foreach ($found[1] as $slot) {
            Assert::assertContains($slot, $slots, "content/en/pricing.json {$key} uses {{$slot}}, which the page does not fill");
        }

        preg_match_all('/<([a-z][A-Za-z0-9]*)>/', $text, $opened);

        foreach ($opened[1] as $tag) {
            Assert::assertContains($tag, $tags, "content/en/pricing.json {$key} uses <{$tag}>, which the page does not render");
        }
    }
});

it('keeps the commerce claims positioning rules out of its copy', function (): void {
    $banned = [
        'most popular', 'best value', 'unlock', 'lifetime updates', 'future updates', 'money-back', 'guarantee',
        'PPP', 'purchasing power', 'regional pric', 'bank transfer', 'SePay', 'VND', 'LemonSqueezy', 'Lemon Squeezy',
        'free forever', 'completely free', 'no feature gating', 'per person',
        'phổ biến nhất', 'mở khóa', 'tiết kiệm', 'cập nhật trọn đời', 'chuyển khoản', 'miễn phí mãi mãi', 'hoàn toàn miễn phí',
    ];

    foreach (pricingCopySources() as $path) {
        $text = pricingVisibleText($path);

        foreach ($banned as $phrase) {
            Assert::assertDoesNotMatchRegularExpression(
                '/(?<!\p{L})' . preg_quote($phrase, '/') . '(?!\p{L})/iu',
                $text,
                basename(dirname($path)) . '/' . basename($path) . " says \"{$phrase}\"",
            );
        }
    }
});

it('server-renders the plans, the table and every section, with prices written for the language', function (string $path, string $locale, array $prices, string $pattern, string $decimal, string $refund, array $availability, array $facts): void {
    config(['payment.provider' => 'polar']);

    $prefix = $locale === 'en' ? '' : "/{$locale}";
    $pricing = pricingPageJson('pricing.json');
    $raw = ssrHtml($path);
    $html = html_entity_decode($raw, ENT_QUOTES | ENT_HTML5);
    $main = substr($html, (int) strpos($html, '<main'), (int) strrpos($html, '</main>') - (int) strpos($html, '<main'));

    expect(substr_count($main, '<h1'))->toBe(1);

    foreach (['plans', 'features', 'license', 'billing', 'refunds', 'team', 'open-source', 'faq'] as $id) {
        expect($main)->toContain('id="' . $id . '"');
    }

    // Yearly is chosen first, and Team starts at its minimum seats.
    foreach ($prices as $price) {
        expect($main)->toContain($price);
    }

    expect($main)->toContain('type="radio"')
        ->toContain("href=\"{$prefix}/refund-policy\"")
        ->toContain('href="/account?locale=' . $locale . '"')
        // The license section links the terms, and the short FAQ the full licensing questions (sitemap §A.1).
        ->toContain("href=\"{$prefix}/terms\"")
        ->toContain("href=\"{$prefix}/faq#licensing\"")
        ->not->toMatch('/\{[A-Za-z][A-Za-z0-9_.]*\}/');

    foreach (['client.crisp.chat', '@polar-sh/checkout', 'lemon.js', 'lemonsqueezy.com'] as $host) {
        expect($html)->not->toContain($host);
    }

    expect(pricingPricePoints($html))->toBe(pricingExpectedPricePoints($pattern, $decimal));

    $start = (int) strpos($html, 'id="plans"');
    $plans = substr($html, $start, (int) strpos($html, 'id="features"') - $start);

    expect($plans)
        ->toContain(str_replace('{days}', (string) $pricing['refund']['days'], $refund))
        ->toContain("href=\"{$prefix}/refund-policy\"");

    $start = (int) strpos($html, 'id="features"');
    $table = substr($html, $start, (int) strpos($html, '</table>', $start) - $start);

    expect($table)->toContain(">{$availability[0]}<")->toContain(">{$availability[1]}<");

    foreach ($facts as $fact) {
        expect(strip_tags($main))->toContain(str_replace('{graceDays}', (string) $pricing['license']['offlineGraceDays'], $fact));
    }

    preg_match_all('#<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>#s', $raw, $blocks);

    expect($blocks[1])->not->toBeEmpty();

    $offers = [];

    foreach ($blocks[1] as $block) {
        $json = json_decode($block, true);

        foreach ($json['@graph'] ?? [$json] as $node) {
            if (($node['@type'] ?? null) === 'SoftwareApplication') {
                $offers = $node['offers'] ?? [];
            }
        }
    }

    $expected = [(string) $pricing['tiers']['free']['price']];

    foreach (['starter', 'team'] as $tier) {
        foreach ($pricing['tiers'][$tier]['prices'] as $amount) {
            $expected[] = is_int($amount) ? (string) $amount : number_format($amount, 2, '.', '');
        }
    }

    expect(array_column($offers, 'price'))->toBe($expected);

    foreach ($offers as $offer) {
        expect($offer['priceCurrency'])->toBe($pricing['currency']);
        expect($offer)->not->toHaveKey('aggregateRating');
    }
})->with([
    'English' => [
        '/pricing', 'en', ['$0', '$24', '$10', '5 seats: $50 per year'], '$%s', '.',
        'Every paid plan can be refunded within {days} days of purchase, and each monthly or yearly renewal within {days} days of its charge.',
        ['Included', 'Not included'],
        ['no trial period', 'US dollars', 'currently on the Mac', 'Team includes Starter', 'paid features work for {graceDays} days after the last successful check', 'One activated Mac per seat.', 'Each Team seat covers one activated Mac', 'answered first, within one business day'],
    ],
    'Vietnamese' => [
        '/vi/pricing', 'vi', ["0\u{a0}US$", "24\u{a0}US$", "10\u{a0}US$", "5 seat: 50\u{a0}US$ mỗi năm"], "%s\u{a0}US$", ',',
        'Mọi gói trả phí đều được hoàn tiền trong vòng {days} ngày kể từ ngày mua, và mỗi lần gia hạn theo tháng hoặc theo năm trong vòng {days} ngày kể từ ngày tính phí.',
        ['Có', 'Không có'],
        [],
    ],
])->group('ssr');

it('carries every cycle\'s price in the server HTML in the page\'s number format', function (): void {
    config(['payment.provider' => 'polar']);

    expect(pricingPricePoints(html_entity_decode(ssrHtml('/zh-Hant/pricing'), ENT_QUOTES | ENT_HTML5)))->toBe(pricingExpectedPricePoints('US$%s', '.'));
})->group('ssr');

it('keeps the short FAQ on account tasks, leaving the licensing facts to the page', function (): void {
    $content = pricingPageJson('content/en/pricing.json');

    expect(array_keys($content['faq']['items']))->toBe(['payment-methods', 'company-invoice', 'lost-key']);

    foreach ($content['faq']['items'] as $item) {
        foreach (['{graceDays}', '{activations}', 'no trial period', 'one activated Mac'] as $duplicate) {
            expect($item['answer'])->not->toContain($duplicate);
        }
    }
});

it('says who a Starter license is for wherever it says how many Macs', function (string $locale, string $person, ?string $cardPerson = null, ?string $detailPerson = null): void {
    // The rule is the terms' own: "Using a license".
    expect(File::get(resource_path("data/legal/{$locale}/terms.md")))->toContain($person);

    preg_match('/starter"?:\s*\{.*?activation"?:\s*\{(.*?)\n\s*\}/s', pricingVisibleText(resource_path("js/i18n/messages/{$locale}/pricing.ts")), $card);
    preg_match_all('/:\s*(["\'])(.+?)\1,?\s*$/m', $card[1] ?? '', $forms);

    expect($forms[2])->not->toBeEmpty();

    foreach ($forms[2] as $form) {
        expect(mb_strtolower($form))->toContain(mb_strtolower($cardPerson ?? $person));
        expect($form)->toContain('{count}');
    }

    $licensing = collect(pricingPageJson("content/{$locale}/faq.json")['groups'])->firstWhere('id', 'licensing')['items'];

    expect(pricingPageJson("content/{$locale}/pricing.json")['license']['items']['macs']['body'])->toContain($detailPerson ?? $person);
    expect(collect($licensing)->firstWhere('id', 'how-many-macs')['answer'][0])->toContain($detailPerson ?? $person);
})->with([
    ['en', 'one person'],
    ['vi', 'một người'],
    ['es', 'una persona'],
    ['de', 'eine Person'],
    ['fr', 'une personne'],
    ['ja', '1 人用', '1 人', '一人'],
    ['pt-BR', 'uma pessoa'],
    ['zh-Hans', '供一人使用', '1 人', '供一人'],
    ['zh-Hant', '供一人使用', '1 人', '供一人'],
    ['ko', '한 사람', '1명'],
    ['it', 'una persona'],
    ['id', 'satu orang'],
]);

it('names the plans and the account\'s pages as checkout and the account app do', function (string $locale, string $macsPage, string $billing): void {
    $content = pricingPageJson("content/{$locale}/pricing.json");

    // Plan names stay English everywhere, as on the buy buttons.
    expect($content['seo']['title'])->not->toBe($content['header']['title'])->toContain('Starter')->toContain('Team');
    expect($content['seo']['description'])->toContain('Starter')->toContain('Team');

    expect($content['license']['items']['activate']['body'])->toContain($macsPage);
    expect($content['billing']['portal'])->toContain("<account>{$billing}</account>");
})->with([
    ['en', 'the Macs page', 'Billing & invoices'],
    ['vi', 'trang Macs', 'Billing & invoices'],
    ['es', 'la página de Mac', 'Facturación y facturas'],
    ['de', 'Macs-Seite', 'Abrechnung und Rechnungen'],
    ['fr', 'la page Mac', 'Facturation et factures'],
    ['ja', 'Macs ページ', 'Billing & invoices'],
    ['pt-BR', 'página Macs', 'Faturamento e faturas'],
    ['zh-Hans', 'Macs 页面', 'Billing & invoices'],
    ['zh-Hant', 'Macs 頁面', 'Billing & invoices'],
    ['ko', 'Macs 페이지', 'Billing & invoices'],
    ['it', 'pagina Macs', 'Fatturazione e fatture'],
    ['id', 'halaman Macs', 'Penagihan & faktur'],
]);

it('asks in its short FAQ only what the full FAQ answers, in the same words', function (): void {
    foreach (Locales::codes() as $locale) {
        $full = collect(pricingPageJson("content/{$locale}/faq.json")['groups'])->firstWhere('id', 'licensing')['items'];
        $full = collect($full)->keyBy('id');

        foreach (pricingPageJson("content/{$locale}/pricing.json")['faq']['items'] as $id => $item) {
            // The lost key has its own wording here, and `/faq#lost-license-key` there.
            if ($id === 'lost-key') {
                continue;
            }

            Assert::assertTrue($full->has($id), "content/{$locale}/faq.json has no licensing answer \"{$id}\"");
            Assert::assertSame($full[$id]['question'], $item['question'], "{$locale}: {$id}");
            Assert::assertSame($full[$id]['answer'], [$item['answer']], "{$locale}: {$id}");
        }
    }
});
