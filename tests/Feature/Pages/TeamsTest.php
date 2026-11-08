<?php

use Dom\HTMLDocument;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

function teamsData(string $file): array
{
    return json_decode(File::get(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

// What the page prints, without the head.
function teamsCopy(array $content): string
{
    return json_encode(array_diff_key($content, array_flip(['seo', 'og', 'breadcrumb'])), JSON_UNESCAPED_UNICODE);
}

it('names only the tokens Teams.tsx fills, in every locale', function (string $locale): void {
    preg_match_all('/\{([A-Za-z]+)\}/', teamsCopy(teamsData("content/{$locale}/teams.json")), $tokens);

    expect(array_values(array_diff(array_unique($tokens[1]), ['proExamples', 'deviceLimit', 'inviteDays', 'merchant', 'refundDays', 'email'])))->toBe([]);
})->with('locales');

it('stays short and never ties a seat to one platform', function (): void {
    $copy = teamsCopy(teamsData('content/en/teams.json'));
    $words = str_word_count(strip_tags(implode(' ', Arr::flatten(json_decode($copy, true)))));

    // "Each Mac gets every Pro feature" read as "not on Linux" (owner, 2026-11-08).
    expect($copy)->not->toMatch('/\bMacs?\b(?! or Linux)/')
        ->and($words)->toBeLessThanOrEqual(360);
});

it('opens on the price and the docs, and keeps every id it had', function (string $prefix): void {
    $document = HTMLDocument::createFromString(ssrHtml("{$prefix}/teams"), LIBXML_NOERROR);
    $top = $document->getElementById('top');

    expect($top->querySelector('a[href="#price"]'))->not->toBeNull()
        ->and($top->querySelector('a[href="' . teamsData('facts.json')['links']['docs'] . '/features/team"]'))->not->toBeNull()
        ->and($document->querySelector('main')->textContent)->not->toMatch('/\{[A-Za-z]+\}/')
        ->and((string) $document->querySelector('#enterprise a[href^="mailto:"]')?->getAttribute('href'))->toContain('?subject=');

    foreach (['includes', 'share', 'price', 'seats', 'buying', 'data', 'enterprise'] as $id) {
        expect($document->getElementById($id))->not->toBeNull("#{$id} is gone from {$prefix}/teams");
    }
})->with(['', '/vi'])->group('ssr');

it('reads the invitation days from facts.json', function (): void {
    $days = teamsData('facts.json')['account']['teamInviteDays'];
    $document = HTMLDocument::createFromString(ssrHtml('/teams'), LIBXML_NOERROR);

    expect($document->getElementById('seats')->textContent)->toContain("The link works for {$days} days.");
})->group('ssr');

it('sells Team on /teams with its seats, monthly or yearly', function (): void {
    $price = HTMLDocument::createFromString(ssrHtml('/teams'), LIBXML_NOERROR)->getElementById('price');

    expect($price->querySelectorAll('input[type=radio]')->length)->toBe(2)
        ->and($price->querySelector('input[inputmode=numeric], input[type=number]'))->not->toBeNull()
        ->and($price->textContent)->toContain('Get Team');
})->group('ssr');
