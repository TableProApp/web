<?php

use App\Support\Localization\LocalizedUrl;

use function Pest\Laravel\get;

function homeDocument(string $locale): Dom\HTMLDocument
{
    requireSsr();

    return Dom\HTMLDocument::createFromString((string) get(LocalizedUrl::path('/', $locale))->assertOk()->getContent(), LIBXML_NOERROR);
}

it('renders the sections in order, the sponsors third, under one h1', function (string $locale): void {
    $document = homeDocument($locale);
    $sections = array_map(fn(Dom\Element $section): string => $section->id, iterator_to_array($document->querySelectorAll('main > section')));

    expect($document->querySelectorAll('h1'))->toHaveCount(1)
        ->and($document->querySelectorAll('main'))->toHaveCount(1)
        ->and(array_values(array_diff($sections, ['campaign'])))->toBe(['top', 'databases', 'sponsors', 'features', 'testimonials', 'pricing', 'open-source']);
})->with(['en', 'vi'])->group('ssr');

it('keeps every id an old link to the homepage can name', function (): void {
    $document = homeDocument('en');

    foreach (['top', 'platforms', 'mobile', 'databases', 'sponsors', 'features', 'workflows', 'safety', 'compare', 'switch', 'ai', 'mcp', 'testimonials', 'pricing', 'license', 'open-source'] as $id) {
        expect($document->getElementById($id))->not->toBeNull("#{$id} is gone from the homepage");
    }
})->group('ssr');

it('shows every platform\'s app in the hero, as captures in their frames', function (): void {
    $hero = homeDocument('en')->getElementById('top');

    foreach (['home-hero-mac', 'home-hero-linux', 'home-hero-ipad', 'home-hero-iphone'] as $id) {
        expect($hero->querySelector("img[src*=\"/{$id}-\"]"))->not->toBeNull("{$id} is not in the hero");
    }
})->group('ssr');
