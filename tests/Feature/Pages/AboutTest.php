<?php

use App\Support\Localization\LocalizedUrl;
use Dom\HTMLDocument;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;

function aboutContent(string $locale): array
{
    return json_decode(File::get(resource_path("data/content/{$locale}/about.json")), true, 512, JSON_THROW_ON_ERROR);
}

it('sends the about page no publisher, so it names only the TablePro team', function (string $locale): void {
    get(LocalizedUrl::path('/about', $locale))->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
        ->missing('publisher')
        ->where('content.principles.items', aboutContent($locale)['principles']['items']));
})->with(['en', 'vi']);

it('states four principles, one sentence each, and names only the email token', function (string $locale): void {
    $content = aboutContent($locale);

    expect(array_column($content['principles']['items'], 'id'))->toBe(['native', 'open', 'private', 'independent']);

    preg_match_all('/\{([A-Za-z]+)\}/', json_encode($content, JSON_UNESCAPED_UNICODE), $tokens);

    expect(array_values(array_unique($tokens[1])))->toBe(['email']);
})->with('locales');

it('keeps every id it had, on the band that now says it', function (string $prefix): void {
    $document = HTMLDocument::createFromString(ssrHtml("{$prefix}/about"), LIBXML_NOERROR);

    foreach (['principles', 'native', 'facts', 'maker', 'funding', 'source', 'contact', 'policies', 'brand'] as $id) {
        expect($document->getElementById($id))->not->toBeNull("#{$id} is gone from {$prefix}/about");
    }

    expect($document->getElementById('top')->querySelector('a'))->toBeNull()
        ->and($document->getElementById('facts')->querySelector('time')?->getAttribute('dateTime'))->toBe(json_decode(File::get(resource_path('data/facts.json')), true)['openSource']['repositoryCreatedAt'])
        ->and($document->querySelector('main')->textContent)->not->toMatch('/\{[A-Za-z]+\}/');
})->with(['', '/vi'])->group('ssr');
