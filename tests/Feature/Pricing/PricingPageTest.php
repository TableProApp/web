<?php

use App\Support\Localization\Locales;
use App\Support\Pricing\Checkout;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/**
 * `/pricing` and `/vi/pricing` (sitemap §A.1, §E.5; design-system §8.6).
 *
 * What the page may and may not say is the commerce part of positioning §12:
 * prices, seats and timings only from resources/data/pricing.json, the paid
 * features only from paid-features.json, no "most popular", no typed saving,
 * no "unlock", no update promise for a one-time purchase, and nothing about
 * regional prices or other ways to pay. The props carry the copy and the
 * checkout provider; the server-rendered checks need the SSR bundle.
 */
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
 * The source files whose words this page owns, in both languages.
 *
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

/**
 * A source's text with comments removed, so a docblock that explains a rule
 * does not count as breaking it.
 */
function pricingVisibleText(string $path): string
{
    $text = (string) file_get_contents($path);

    if (str_ends_with($path, '.ts')) {
        $text = (string) preg_replace(['#/\*.*?\*/#s', '#(?<![:\'"])//[^\n]*#'], '', $text);
    }

    return (string) Normalizer::normalize($text, Normalizer::FORM_C);
}

/**
 * The plan cards' prices in document order. `hidden` marks a cycle that is not the chosen one.
 *
 * @return list<array{price: string, hidden: bool}>
 */
function pricingPricePoints(string $html): array
{
    preg_match_all('#<p(?<hidden> hidden="")? class="[^"]*"><span class="type-h1[^"]*">(?<price>[^<]+)</span>#u', $html, $found, PREG_SET_ORDER);

    return array_map(fn(array $match): array => ['price' => $match['price'], 'hidden' => $match['hidden'] !== ''], $found);
}

it('renders in both languages with the copy, each paid feature\'s lines and the checkout provider', function (string $path, string $locale): void {
    config(['payment.provider' => 'polar']);

    $content = pricingPageJson("content/{$locale}/pricing.json");
    $featureIds = array_column(pricingPageJson('paid-features.json'), 'id');

    get($path)
        ->assertOk()
        ->assertInertia(function (AssertableInertia $page) use ($locale, $content, $featureIds): void {
            $page->component('Pricing')
                ->where('locale', $locale)
                ->where('content.header.title', $content['header']['title'])
                ->where('content.seo.title', $content['seo']['title'])
                ->where('checkout', ['provider' => 'polar', 'couponField' => false])
                ->has('featuredEngines');

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

it('names the featured, published engines for the structured data, in data order', function (): void {
    $expected = collect(pricingPageJson('engines.json'))
        ->filter(fn(array $engine): bool => ($engine['featured'] ?? false) === true && ($engine['state'] ?? null) === 'published')
        ->pluck('name')
        ->values()
        ->all();

    expect($expected)->not->toBeEmpty();

    get('/pricing')->assertInertia(fn(AssertableInertia $page) => $page->where('featuredEngines', $expected));
});

it('links the comparison of every client that sells a paid plan, by its page title', function (): void {
    $expected = collect(pricingPageJson('comparisons.json')['products'])
        ->filter(fn(array $product): bool => $product['slug'] !== null && collect($product['prices'])->contains(fn(array $price): bool => $price['amount'] > 0))
        ->map(fn(array $product): array => [
            'path' => '/compare/' . $product['slug'],
            'title' => pricingPageJson("content/en/compare/{$product['slug']}.json")['header']['title'],
        ])
        ->values()
        ->all();

    expect(array_column($expected, 'path'))->toContain('/compare/tableplus', '/compare/datagrip')->not->toContain('/compare/sequel-ace');

    get('/pricing')->assertInertia(fn(AssertableInertia $page) => $page->where('comparisons', $expected));
});

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

    foreach (['en', 'vi'] as $locale) {
        $strings = array_filter(Illuminate\Support\Arr::dot(pricingPageJson("content/{$locale}/pricing.json")), 'is_string');

        foreach ($strings as $key => $text) {
            preg_match_all('/\{([A-Za-z][A-Za-z0-9_.]*)\}/', $text, $found);

            foreach ($found[1] as $slot) {
                Assert::assertContains($slot, $slots, "content/{$locale}/pricing.json {$key} uses {{$slot}}, which the page does not fill");
            }

            preg_match_all('/<([a-z][A-Za-z0-9]*)>/', $text, $opened);

            foreach ($opened[1] as $tag) {
                Assert::assertContains($tag, $tags, "content/{$locale}/pricing.json {$key} uses <{$tag}>, which the page does not render");
            }
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

it('server-renders the plans, the table and every section, with prices written for the language', function (string $path, string $locale, array $prices): void {
    config(['payment.provider' => 'polar']);

    $html = html_entity_decode(ssrHtml($path), ENT_QUOTES | ENT_HTML5);
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
        ->toContain($locale === 'vi' ? 'href="/vi/refund-policy"' : 'href="/refund-policy"')
        ->toContain('href="/account?locale=' . $locale . '"')
        // The license section links the terms, and the short FAQ the full licensing questions (sitemap §A.1).
        ->toContain($locale === 'vi' ? 'href="/vi/terms"' : 'href="/terms"')
        ->toContain($locale === 'vi' ? 'href="/vi/faq#licensing"' : 'href="/faq#licensing"')
        ->not->toMatch('/\{[A-Za-z][A-Za-z0-9_.]*\}/');

    foreach (['client.crisp.chat', '@polar-sh/checkout', 'lemon.js', 'lemonsqueezy.com'] as $host) {
        expect($html)->not->toContain($host);
    }
})->with([
    'English' => ['/pricing', 'en', ['$0', '$24', '$10', '5 seats: $50 per year']],
    'Vietnamese' => ['/vi/pricing', 'vi', ["0\u{a0}US$", "24\u{a0}US$", "10\u{a0}US$", "5 seat: 50\u{a0}US$ mỗi năm"]],
]);

it('carries every cycle\'s price in the server HTML and hides all but the yearly one', function (string $path, string $pattern, string $decimal): void {
    config(['payment.provider' => 'polar']);

    $pricing = pricingPageJson('pricing.json');
    $write = fn(int|float $amount): string => sprintf($pattern, str_replace('.', $decimal, is_int($amount) ? (string) $amount : number_format($amount, 2, '.', '')));
    $expected = [['price' => $write($pricing['tiers']['free']['price']), 'hidden' => false]];

    foreach (['starter', 'team'] as $tier) {
        foreach ($pricing['cycles'] as $cycle) {
            $expected[] = ['price' => $write($pricing['tiers'][$tier]['prices'][$cycle]), 'hidden' => $cycle !== 'yearly'];
        }
    }

    // The same prices, in the same order, as the offers in the structured data.
    expect(pricingPricePoints(html_entity_decode(ssrHtml($path), ENT_QUOTES | ENT_HTML5)))->toBe($expected);
})->with([
    'English' => ['/pricing', '$%s', '.'],
    'Vietnamese' => ['/vi/pricing', "%s\u{a0}US$", ','],
    'Traditional Chinese' => ['/zh-Hant/pricing', 'US$%s', '.'],
]);

it('states the refund window under the buy buttons, with the policy linked', function (string $path, string $sentence, string $href): void {
    $html = html_entity_decode(ssrHtml($path), ENT_QUOTES | ENT_HTML5);
    $start = (int) strpos($html, 'id="plans"');
    $plans = substr($html, $start, (int) strpos($html, 'id="features"') - $start);

    expect($plans)
        ->toContain(str_replace('{days}', (string) pricingPageJson('pricing.json')['refund']['days'], $sentence))
        ->toContain('href="' . $href . '"');
})->with([
    'English' => ['/pricing', 'Every paid plan can be refunded within {days} days of purchase, and each monthly or yearly renewal within {days} days of its charge.', '/refund-policy'],
    'Vietnamese' => ['/vi/pricing', 'Mọi gói trả phí đều được hoàn tiền trong vòng {days} ngày kể từ ngày mua, và mỗi lần gia hạn theo tháng hoặc theo năm trong vòng {days} ngày kể từ ngày tính phí.', '/vi/refund-policy'],
]);

it('states each licensing fact once in the body, and repeats none in the short FAQ', function (): void {
    $html = html_entity_decode(ssrHtml('/pricing'), ENT_QUOTES | ENT_HTML5);
    $main = strip_tags(substr($html, (int) strpos($html, '<main'), (int) strrpos($html, '</main>') - (int) strpos($html, '<main')));

    foreach (['no trial period or time limit', 'the Mac needs Starter or Team', 'US dollars', 'paid features keep working for'] as $fact) {
        expect(substr_count($main, $fact))->toBe(1, $fact);
    }

    // The Team card, then "How licenses work" for the seat and the plan table for support.
    foreach (['seat is one activated Mac', 'answered first, within one business day'] as $fact) {
        expect(substr_count($main, $fact))->toBe(2, $fact);
    }
});

it('says who a Starter license is for wherever it says how many Macs', function (string $locale, string $person): void {
    // The rule is the terms' own: "Using a license".
    expect(File::get(resource_path("data/legal/{$locale}/terms.md")))->toContain($person);

    preg_match('/starter"?:\s*\{.*?activation"?:\s*\{(.*?)\n\s*\}/s', pricingVisibleText(resource_path("js/i18n/messages/{$locale}/pricing.ts")), $card);
    preg_match_all('/:\s*(["\'])(.+?)\1,?\s*$/m', $card[1] ?? '', $forms);

    expect($forms[2])->not->toBeEmpty();

    foreach ($forms[2] as $form) {
        expect($form)->toContain($person);
    }

    $licensing = collect(pricingPageJson("content/{$locale}/faq.json")['groups'])->firstWhere('id', 'licensing')['items'];

    expect(pricingPageJson("content/{$locale}/pricing.json")['license']['items']['macs']['body'])->toContain($person);
    expect(collect($licensing)->firstWhere('id', 'how-many-macs')['answer'][0])->toContain($person);
})->with([
    ['en', 'one person'],
    ['vi', 'một người'],
    ['es', 'una persona'],
    ['de', 'eine Person'],
    ['fr', 'une personne'],
    ['ja', '1 人用'],
    ['pt-BR', 'uma pessoa'],
    ['zh-Hans', '供一人使用'],
    ['zh-Hant', '供一人使用'],
    ['ko', '한 사람'],
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
    ['vi', 'trang Máy Mac', 'Thanh toán và hóa đơn'],
    ['es', 'la página Macs', 'Facturación y facturas'],
    ['de', '„Macs“', 'Abrechnung und Rechnungen'],
    ['fr', 'la page Macs', 'Facturation et factures'],
    ['ja', 'Mac ページ', '請求と請求書'],
    ['pt-BR', 'página Macs', 'Cobrança e faturas'],
    ['zh-Hans', 'Macs 页面', '账单与发票'],
    ['zh-Hant', 'Macs 頁面', '帳單與發票'],
    ['ko', 'Mac 페이지', '결제 및 청구서'],
    ['it', 'pagina Mac del', 'Fatturazione e fatture'],
    ['id', 'halaman Mac', 'Penagihan dan faktur'],
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

/*
 * Moved from the retired Landing/LandingStructureTest (architecture §1.17):
 * the plan table's check mark is decorative, so every cell also says whether
 * the plan includes the feature, in the page's language (m.controls.availability).
 */
it('states the availability of every plan in words, not only in an icon', function (string $path, string $included, string $notIncluded): void {
    $html = ssrHtml($path);
    $start = (int) strpos($html, 'id="features"');
    $table = substr($html, $start, (int) strpos($html, '</table>', $start) - $start);

    expect($table)->toContain(">{$included}<")->toContain(">{$notIncluded}<");
})->with([
    'English' => ['/pricing', 'Included', 'Not included'],
    'Vietnamese' => ['/vi/pricing', 'Có', 'Không có'],
]);

it('states one offer per price in pricing.json, in its structured data', function (string $path): void {
    $html = ssrHtml($path);

    preg_match_all('#<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>#s', $html, $blocks);

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

    $pricing = pricingPageJson('pricing.json');
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
})->with(['/pricing', '/vi/pricing']);
