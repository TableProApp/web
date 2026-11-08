<?php

use Dom\HTMLDocument;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;

beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 500)]);
});

function faqData(string $file): array
{
    return json_decode(File::get(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

function faqItems(array $content): array
{
    return array_merge(...array_column($content['groups'], 'items'));
}

// Every id /faq answers to: its bands and questions, the ids they replaced, the questions that moved to /pricing, and the template's.
function faqIds(array $content): array
{
    $ids = ['top', 'contact'];

    foreach ($content['groups'] as $group) {
        array_push($ids, $group['id'], ...($group['also'] ?? []), ...($group['more']['also'] ?? []));

        foreach ($group['items'] as $item) {
            array_push($ids, $item['id'], ...($item['also'] ?? []));
        }
    }

    return $ids;
}

// Sentences end with a full stop, a question mark or an exclamation mark followed by a space or the end.
function faqSentences(string $text): int
{
    return preg_match_all('/[.!?](?=\s|$)/u', (string) preg_replace('/<[^>]+>/', '', $text));
}

// Every tag but the app labels is a link.
function faqLinks(string $text): int
{
    preg_match_all('/<([a-zA-Z]+)>/', $text, $tags);

    return count(array_diff($tags[1], ['ui', 'code', 'kbd']));
}

it('sends the answers their facts from the data files', function (): void {
    $pricing = faqData('pricing.json');
    $linux = collect(faqData('platforms.json')['platforms'])->firstWhere('id', 'linux');

    get('/faq')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
        ->component('Faq')
        ->where('content', faqData('content/en/faq.json'))
        ->where('facts.supportBusinessDays', $pricing['tiers']['team']['prioritySupport']['responseBusinessDays'])
        ->where('facts.localAiProviders', ['Ollama', 'llama.cpp', 'MLX'])
        ->has('facts.paidFeatures.starter')
        ->where('platforms.linuxDistributions', array_values(array_filter(array_column($linux['distributions'], 'name'))))
        ->has('platforms.mac.requirements')
        ->missing('facts.commerce'));
});

it('asks about 22 questions in six topics, each answered in two sentences and one link at most', function (): void {
    $content = faqData('content/en/faq.json');
    $items = faqItems($content);

    expect(array_column($content['groups'], 'id'))->toBe(['product', 'pricing', 'platforms', 'databases', 'privacy', 'support'])
        ->and(count($items))->toBeGreaterThanOrEqual(20)->toBeLessThanOrEqual(24);

    foreach ($items as $item) {
        expect($item['answer'])->toBeString()
            ->and(faqSentences($item['answer']))->toBeLessThanOrEqual(2, "#{$item['id']} runs past two sentences")
            ->and(faqLinks($item['answer']))->toBeLessThanOrEqual(1, "#{$item['id']} has more than one link");
    }
});

it('keeps Pricing to four questions and leaves billing, seats and license keys to /pricing', function (): void {
    $content = faqData('content/en/faq.json');
    $pricing = collect($content['groups'])->firstWhere('id', 'pricing');
    $moved = ['cost', 'how-many-macs', 'subscription-ends', 'offline', 'payment', 'payment-methods', 'company-invoice', 'refunds', 'lost-license-key', 'members', 'seats', 'cancel'];
    $links = File::get(resource_path('js/components/faq/content-links.tsx'));

    expect(array_column($pricing['items'], 'id'))->toBe(['is-it-free', 'what-a-license-adds', 'work-use', 'students-teachers'])
        ->and($pricing['more']['also'])->toBe($moved)
        ->and($pricing['more']['text'])->toContain('<pricingFaq>')
        ->and($links)->toContain("pricingFaq: '/pricing#faq'")
        ->and(array_intersect(array_column(faqItems($content), 'id'), $moved))->toBe([]);
});

it('answers each privacy question in one sentence that links /security', function (): void {
    $privacy = collect(faqData('content/en/faq.json')['groups'])->firstWhere('id', 'privacy');
    $links = File::get(resource_path('js/components/faq/content-links.tsx'));

    expect($privacy['items'])->toHaveCount(4);

    foreach ($privacy['items'] as $item) {
        preg_match('/<(security[A-Za-z]*)>/', $item['answer'], $tag);

        expect(faqSentences($item['answer']))->toBe(1, "#{$item['id']}")
            ->and($tag)->not->toBeEmpty("#{$item['id']} does not link /security");

        preg_match("/{$tag[1]}: '([^']+)'/", $links, $path);

        expect($path[1] ?? '')->toStartWith('/security', "#{$item['id']}");
    }
});

it('types no price, currency or version number', function (): void {
    $copy = json_encode(array_diff_key(faqData('content/en/faq.json'), array_flip(['seo', 'og', 'languages'])), JSON_UNESCAPED_UNICODE);

    expect(preg_match('/(?<!AGPLv)\d/', $copy))->toBe(0, 'a digit is typed into the FAQ')
        ->and($copy)->not->toContain('$')->not->toContain('USD')->not->toContain('dollar');
});

it('keeps every question and topic id the old FAQ had', function (): void {
    $ids = faqIds(faqData('content/en/faq.json'));
    $old = [
        'general', 'platforms', 'databases', 'licensing', 'privacy', 'account', 'switching',
        'what-is-tablepro', 'native', 'is-it-free', 'open-source', 'work-use',
        'mac-requirements', 'windows-linux', 'iphone-ipad', 'languages',
        'supported-databases', 'drivers', 'ssh-ssl', 'passwords', 'import-connections',
        'what-a-license-adds', 'cost', 'students-teachers', 'how-many-macs', 'subscription-ends', 'offline', 'payment',
        'payment-methods', 'company-invoice', 'refunds', 'lost-license-key', 'priority-support',
        'what-is-sent', 'sign-up', 'ai-data', 'icloud-data',
        'sign-in', 'members', 'seats', 'cancel',
        'switch-connections', 'compare',
    ];

    expect($ids)->toBe(array_values(array_unique($ids)), 'an id is used twice');

    foreach ($old as $id) {
        expect(in_array($id, $ids, true))->toBeTrue("#{$id} no longer lands on /faq");
    }
});

it('keeps every link into /faq landing on an id it still has', function (): void {
    $ids = faqIds(faqData('content/en/faq.json'));
    $sources = [
        ...File::allFiles(resource_path('data')),
        ...File::allFiles(resource_path('blog')),
        ...File::allFiles(resource_path('js')),
        app_path('Services/Blog/PostTopics.php'),
    ];
    $links = 0;

    foreach ($sources as $source) {
        preg_match_all('~/faq(?:#([a-z0-9-]+))?\b~', File::get((string) $source), $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $links++;

            if (isset($match[1])) {
                expect(in_array($match[1], $ids, true))->toBeTrue("{$source}: {$match[0]}");
            }
        }
    }

    expect($links)->toBeGreaterThanOrEqual(1);
});

it('renders the topic row, one band per topic with every answer open, and the contact line', function (): void {
    $content = faqData('content/en/faq.json');
    $document = HTMLDocument::createFromString(ssrHtml('/faq'), LIBXML_NOERROR);
    $sections = array_map(fn(Dom\Element $section): string => $section->getAttribute('id'), iterator_to_array($document->querySelectorAll('main > section')));
    $topics = array_map(fn(Dom\Element $link): string => $link->getAttribute('href'), iterator_to_array($document->querySelectorAll('main > nav a')));
    $groups = array_column($content['groups'], 'id');
    // The education question waits for GET /v2/pricing, which the server never asks.
    $shown = array_filter(faqItems($content), fn(array $item): bool => $item['id'] !== 'students-teachers');

    expect($sections)->toBe(['top', ...$groups, 'contact'])
        ->and($topics)->toBe(array_map(fn(string $id): string => "#{$id}", $groups))
        ->and($document->querySelectorAll('main h1'))->toHaveCount(1)
        ->and($document->querySelectorAll('main h3'))->toHaveCount(count($shown))
        ->and($document->querySelectorAll('main details'))->toHaveCount(0)
        ->and($document->querySelector('#contact a[href^="mailto:"]'))->not->toBeNull();

    foreach (faqIds($content) as $id) {
        expect($document->getElementById($id))->not->toBeNull("#{$id} is missing");
    }

    expect($document->getElementById('students-teachers')->tagName)->toBe('SPAN')
        ->and($document->getElementById('students-teachers')->closest('section')->getAttribute('id'))->toBe('pricing');
})->group('ssr');

it('offers live chat in the contact line where chat is configured', function (): void {
    config(['services.crisp.website_id' => 'test-website']);

    $contact = HTMLDocument::createFromString(ssrHtml('/faq'), LIBXML_NOERROR)->getElementById('contact');

    expect($contact->querySelector('button')?->textContent)->toBe(faqData('content/en/faq.json')['contact']['chat']);
})->group('ssr');
