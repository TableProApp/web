<?php

use Dom\HTMLDocument;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

function sponsorsData(string $file): array
{
    return json_decode(File::get(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

/** @return list<array{placement: string, monthly: int}> */
function sponsorTiersDearestFirst(): array
{
    $tiers = sponsorsData('sponsors.json')['tiers'];
    usort($tiers, fn(array $a, array $b): int => $b['monthly'] <=> $a['monthly']);

    return $tiers;
}

it('describes every tier and names only the tokens Sponsors.tsx fills, in every locale', function (string $locale): void {
    $content = sponsorsData("content/{$locale}/sponsors.json");

    preg_match_all('/\{([A-Za-z]+)\}/', json_encode($content, JSON_UNESCAPED_UNICODE), $tokens);

    expect(array_keys($content['tiers']['items']))->toEqualCanonicalizing(array_column(sponsorsData('sponsors.json')['tiers'], 'placement'))
        ->and(array_values(array_diff(array_unique($tokens[1]), ['count', 'total', 'price', 'benefit', 'multiplier', 'months', 'email'])))->toBe([]);
})->with('locales');

it('stays short', function (): void {
    $copy = Arr::except(sponsorsData('content/en/sponsors.json'), ['seo', 'og', 'breadcrumb']);

    expect(str_word_count(strip_tags(implode(' ', Arr::flatten($copy)))))->toBeLessThanOrEqual(260);
});

it('draws one band per tier, dearest first, and keeps the ids it had', function (string $prefix): void {
    $document = HTMLDocument::createFromString(ssrHtml("{$prefix}/sponsors"), LIBXML_NOERROR);
    $program = sponsorsData('facts.json')['links']['sponsorsProgram'];
    $sections = array_map(fn(Dom\Element $section): string => $section->id, iterator_to_array($document->querySelectorAll('main > section')));

    expect($sections)->toBe(['top', ...array_column(sponsorTiersDearestFirst(), 'placement'), 'fine-print', 'sponsor'])
        ->and($document->querySelector("#top a[href=\"{$program}\"]"))->not->toBeNull()
        ->and($document->querySelector("#sponsor a[href=\"{$program}\"]"))->not->toBeNull()
        ->and($document->querySelector('main table'))->toBeNull()
        ->and($document->querySelector('main')->textContent)->not->toMatch('/\{[A-Za-z]+\}/');

    foreach (['tiers', 'companies', 'individuals'] as $id) {
        expect($document->getElementById($id))->not->toBeNull("#{$id} is gone from {$prefix}/sponsors");
    }

    foreach (sponsorsData('sponsors.json')['sponsors'] as $sponsor) {
        expect($document->querySelector("#{$sponsor['placement']} a[href=\"{$sponsor['url']}\"][rel~=sponsored]"))->not->toBeNull("{$sponsor['id']} is not in #{$sponsor['placement']}");
    }
})->with(['', '/vi'])->group('ssr');

it('prices each tier monthly and once, and says when a place is open', function (): void {
    $data = sponsorsData('sponsors.json');
    $document = HTMLDocument::createFromString(ssrHtml('/sponsors'), LIBXML_NOERROR);
    $placed = array_count_values(array_column($data['sponsors'], 'placement'));
    $open = max(0, $data['homepageSlots'] - ($placed['lead'] ?? 0) - ($placed['homepage'] ?? 0));

    foreach ($data['tiers'] as $tier) {
        $once = $tier['monthly'] * $data['oneTime']['multiplier'];

        expect($document->getElementById($tier['placement'])->textContent)
            ->toContain('$' . number_format($tier['monthly']) . ' a month')
            ->toContain('or $' . number_format($once) . ' once');
    }

    expect(str_contains($document->getElementById('lead')->textContent, 'Open.'))->toBe(! isset($placed['lead']))
        ->and($document->getElementById('top')->textContent)->toContain($open === 0 ? "All {$data['homepageSlots']} homepage places are taken" : "{$open} of {$data['homepageSlots']} homepage places");
})->group('ssr');
