<?php

use Dom\HTMLDocument;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;

function securityData(string $file): array
{
    return json_decode(File::get(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

// Every id /security answers to: its bands, the sections and items they replaced, and the hero.
function securityIds(array $content): array
{
    return ['top', ...array_merge(...array_map(fn(array $band): array => [$band['id'], ...($band['also'] ?? [])], $content['bands']))];
}

function securityCopy(array $content): string
{
    return json_encode(array_diff_key($content, array_flip(['seo', 'og'])), JSON_UNESCAPED_UNICODE);
}

it('sends the facts, the reply time and both reporting channels from the data files', function (): void {
    $facts = securityData('facts.json');
    $levels = fn(string $platform): array => array_column($facts['safeMode'][$platform]['levels'], 'name');

    get('/security')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
        ->component('Security')
        ->where('content', securityData('content/en/security.json'))
        ->where('facts.macSafeModeLevels', $levels('mac'))
        ->where('facts.linuxSafeModeLevels', $levels('linux'))
        ->where('facts.iosSafeModeLevels', $levels('ios'))
        ->where('facts.mcpHost', $facts['mcp']['host'])
        ->where('replyDays', securityData('pricing.json')['tiers']['team']['prioritySupport']['responseBusinessDays'])
        ->where('links.securityEmail', $facts['support']['securityEmail'])
        ->where('links.securityAdvisory', $facts['links']['github'] . '/security/advisories/new'));
});

it('fills every {token} its copy names', function (): void {
    $content = securityData('content/en/security.json');
    $props = get('/security')->assertOk()->viewData('page')['props'];
    $filled = [...array_keys($props['facts']), 'securityEmail', 'businessDays'];

    preg_match_all('/\{([A-Za-z]+)\}/', securityCopy($content), $tokens);

    expect(array_values(array_diff(array_unique($tokens[1]), [...$filled, 'count', 'label'])))->toBe([]);
});

it('covers seven topics in order, with headings that state facts and two limits at most', function (): void {
    $content = securityData('content/en/security.json');

    expect(array_column($content['bands'], 'id'))->toBe(['credentials', 'network', 'ai-mcp', 'updates', 'safe-mode', 'open-source', 'report']);

    foreach ($content['bands'] as $band) {
        expect(count($band['notes'] ?? []))->toBeLessThanOrEqual(2, "#{$band['id']} has more than two limits")
            ->and($band['title'])->not->toBe($band['nav'], "#{$band['id']}: the heading names a topic instead of stating a fact");
    }
});

it('puts what leaves the device in one table, and the AI request paths in another', function (): void {
    $bands = collect(securityData('content/en/security.json')['bands'])->keyBy('id');
    $network = $bands['network']['table'];
    $ai = $bands['ai-mcp']['table'];

    expect($bands->filter(fn(array $band): bool => isset($band['table']))->keys()->all())->toBe(['network', 'ai-mcp'])
        ->and($network['columns'])->toBe(['Destination', 'What is sent', 'When', 'How to turn it off'])
        ->and($ai['columns'])->toBe(['Path', 'Who handles it', 'What to know']);

    foreach ([$network, $ai] as $table) {
        foreach ($table['rows'] as $row) {
            expect($row)->toHaveCount(count($table['columns']));
        }
    }

    expect(implode(' ', array_column($network['rows'], 0)))->toContain('PostHog')->toContain('iCloud')->toContain('Team Library')->toContain('AI provider');
});

it('describes the Linux app in credentials, updates and Safe Mode', function (): void {
    $bands = collect(securityData('content/en/security.json')['bands'])->keyBy('id');

    expect(implode(' ', $bands['credentials']['text']))->toContain('Linux')->toContain('Secret Service')
        ->and(implode(' ', $bands['updates']['text']))->toContain('Linux')->toContain('Flatpak')->toContain('attestation')
        ->and(implode(' ', $bands['safe-mode']['text']))->toContain('{linuxSafeModeLevels}');
});

it('reports to the security address or a private advisory, with no bounty and no certification claims', function (): void {
    $content = securityData('content/en/security.json');
    $report = implode(' ', collect($content['bands'])->firstWhere('id', 'report')['text']);
    $copy = securityCopy($content);

    expect($report)->toContain('<securityEmail>{securityEmail}</securityEmail>')
        ->toContain('<advisory>')
        ->toContain('{businessDays}')
        ->toContain('no bug bounty')
        ->and(preg_match('/\b\d+\.\d+/', $copy))->toBe(0, 'a version number is typed into the copy')
        ->and(preg_match('/SOC ?2|ISO 27001|certif/i', $copy))->toBe(0);
});

it('keeps every section and item id the old page had', function (): void {
    $ids = securityIds(securityData('content/en/security.json'));
    $old = [
        'credentials', 'network', 'distribution', 'safe-mode', 'mcp', 'open-source', 'report',
        'mac-keychain', 'ios-keychain', 'icloud', 'not-sent', 'your-servers', 'to-tablepro',
        'signing', 'updates', 'plugins', 'app-store', 'levels', 'destructive', 'local', 'approval', 'permissions',
        'source', 'contact', 'include', 'fixes',
    ];

    expect($ids)->toBe(array_values(array_unique($ids)), 'an id is used twice');

    foreach ($old as $id) {
        expect(in_array($id, $ids, true))->toBeTrue("#{$id} no longer lands on /security");
    }
});

it('keeps every link into /security landing on an id it still has, the privacy policy\'s #report included', function (): void {
    $ids = securityIds(securityData('content/en/security.json'));
    $sources = [
        ...File::allFiles(resource_path('data')),
        ...File::allFiles(resource_path('blog')),
        ...File::allFiles(resource_path('js')),
        app_path('Services/Blog/PostTopics.php'),
    ];
    $anchors = 0;
    $report = 0;

    foreach ($sources as $source) {
        preg_match_all('~/security#([a-z0-9-]+)~', File::get((string) $source), $matches, PREG_SET_ORDER);

        foreach ($matches as [$link, $anchor]) {
            $anchors++;
            $report += str_contains((string) $source, 'privacy.md') && $anchor === 'report' ? 1 : 0;
            expect(in_array($anchor, $ids, true))->toBeTrue("{$source}: {$link}");
        }
    }

    expect($report)->toBe(12)
        ->and($anchors)->toBeGreaterThanOrEqual(16);
});

it('renders the topic row, seven bands, both tables and the reporting links', function (): void {
    $content = securityData('content/en/security.json');
    $facts = securityData('facts.json');
    $document = HTMLDocument::createFromString(ssrHtml('/security'), LIBXML_NOERROR);
    $sections = array_map(fn(Dom\Element $section): string => $section->getAttribute('id'), iterator_to_array($document->querySelectorAll('main > section')));
    $bands = array_column($content['bands'], 'id');

    expect($sections)->toBe(['top', ...$bands])
        ->and($document->querySelectorAll('main > nav a'))->toHaveCount(count($bands))
        ->and($document->querySelectorAll('main h1'))->toHaveCount(1)
        ->and($document->querySelectorAll('main h2'))->toHaveCount(count($bands))
        ->and($document->querySelectorAll('#network table'))->toHaveCount(1)
        ->and($document->querySelectorAll('#network tbody th[scope="row"]'))->toHaveCount(count($content['bands'][1]['table']['rows']))
        ->and($document->querySelectorAll('#ai-mcp table'))->toHaveCount(1)
        ->and($document->querySelector('#report a[href="mailto:' . $facts['support']['securityEmail'] . '"]'))->not->toBeNull()
        ->and($document->querySelector('#report a[href="' . $facts['links']['github'] . '/security/advisories/new"]'))->not->toBeNull()
        ->and($document->getElementById('main-content')->textContent)->not->toMatch('/\{[A-Za-z]+\}/');

    foreach (securityIds($content) as $id) {
        expect($document->getElementById($id))->not->toBeNull("#{$id} is missing");
    }
})->group('ssr');
