<?php

use App\Support\Content\Testimonials;
use App\Support\Localization\Locales;
use Illuminate\Support\Facades\File;

/**
 * @return array{verifiedAt: string, verification: string, quotes: list<array<string, mixed>>}
 */
function testimonialsJson(): array
{
    static $data = null;

    return $data ??= json_decode(File::get(resource_path('data/testimonials.json')), true, 512, JSON_THROW_ON_ERROR);
}

const TESTIMONIAL_HOSTS = [
    'Reddit' => 'www.reddit.com',
    'X' => 'x.com',
    'GitHub' => 'github.com',
    'Bluesky' => 'bsky.app',
    'V2EX' => 'www.v2ex.com',
    'codeline.co' => 'www.codeline.co',
];

it('records when the quotes were read at their sources', function (): void {
    $data = testimonialsJson();

    expect(array_keys($data))->toBe(['verifiedAt', 'verification', 'quotes']);
    expect($data['verifiedAt'])->toMatch('/^\d{4}-\d{2}-\d{2}$/');
    expect($data['verifiedAt'] <= now()->toDateString())->toBeTrue('verifiedAt is in the future');
    expect($data['verification'])->toBeString()->not->toBe('');
});

it('gives every quote its author, a dated link to the post and the text as written', function (): void {
    $data = testimonialsJson();
    $ids = array_column($data['quotes'], 'id');

    expect($ids)->toBe(array_values(array_unique($ids)));

    foreach ($data['quotes'] as $quote) {
        expect(array_keys($quote))->toBe(['id', 'name', 'handle', 'platform', 'url', 'date', 'lang', 'text', 'translations'], $quote['id']);
        expect($quote['name'])->toBeString()->not->toBe('');
        expect($quote['handle'] === null || is_string($quote['handle']))->toBeTrue("{$quote['id']}: handle");
        expect(TESTIMONIAL_HOSTS)->toHaveKey($quote['platform']);
        expect(parse_url($quote['url'], PHP_URL_SCHEME))->toBe('https', $quote['id']);
        expect(parse_url($quote['url'], PHP_URL_HOST))->toBe(TESTIMONIAL_HOSTS[$quote['platform']], "{$quote['id']} links to its platform");
        expect($quote['date'])->toMatch('/^\d{4}-\d{2}-\d{2}$/');
        expect($quote['date'] <= $data['verifiedAt'])->toBeTrue("{$quote['id']} is dated after it was read");
        expect($quote['lang'])->toMatch('/^[a-z]{2}(-[A-Z][a-z]{3})?$/');
        expect($quote['text'])->toBe(trim($quote['text']))->not->toBe('');
        expect(Normalizer::isNormalized($quote['text'], Normalizer::FORM_C))->toBeTrue("{$quote['id']} is not NFC");
    }
});

it('translates a quote only into the languages it is not written in', function (): void {
    $locales = Locales::codes();

    foreach (testimonialsJson()['quotes'] as $quote) {
        foreach ($quote['translations'] as $locale => $translation) {
            expect($locales)->toContain($locale);
            expect(Testimonials::sameLanguage($quote['lang'], $locale))->toBeFalse("{$quote['id']} is translated into its own language ({$locale})");
            expect($translation)->toBe(trim($translation))->not->toBe('');
            expect(Normalizer::isNormalized($translation, Normalizer::FORM_C))->toBeTrue("{$quote['id']} {$locale} is not NFC");
        }
    }
});

it('shows six quotes on every homepage, its own language first, each translated where the reader needs it', function (string $locale): void {
    $shown = app(Testimonials::class)->forLocale($locale);
    $labels = json_decode(File::get(resource_path("data/content/{$locale}/home.json")), true, 512, JSON_THROW_ON_ERROR)['testimonials']['translatedFrom'];

    expect($shown)->toHaveCount(Testimonials::SHOWN);

    $own = array_map(fn(array $quote): bool => Testimonials::sameLanguage($quote['lang'], $locale), $shown);
    expect($own)->toBe(array_values(array_merge(array_filter($own), array_filter($own, fn(bool $same): bool => ! $same))), "{$locale}: quotes in its language come first");

    foreach ($shown as $quote) {
        if (Testimonials::sameLanguage($quote['lang'], $locale)) {
            expect($quote['translation'])->toBeNull();

            continue;
        }

        expect($quote['translation'])->toBeString("{$quote['id']} has no {$locale} translation");
        expect($labels)->toHaveKey((string) $quote['translatedFrom']);
    }
})->with(fn(): array => array_keys(json_decode((string) file_get_contents(__DIR__ . '/../../../resources/data/locales.json'), true)['supported']));

it('ships a small square photo for every author, served from the site', function (): void {
    foreach (testimonialsJson()['quotes'] as $quote) {
        $path = public_path("images/testimonials/{$quote['id']}.webp");

        expect(File::exists($path))->toBeTrue("{$quote['id']} has no photo");

        [$width, $height, $type] = getimagesize($path) ?: [0, 0, 0];

        expect([$width, $height, $type])->toBe([96, 96, IMAGETYPE_WEBP], "{$quote['id']}: a 96px WebP, twice the 40px it is drawn at");
        expect(filesize($path))->toBeLessThan(8 * 1024);
    }

    $files = array_map(fn(string $path): string => basename($path, '.webp'), glob(public_path('images/testimonials/*')) ?: []);
    sort($files);
    $ids = array_column(testimonialsJson()['quotes'], 'id');
    sort($ids);

    expect($files)->toBe($ids, 'a photo with no quote is left behind');
});

it('reads a Simplified Chinese quote as written on the Traditional Chinese page', function (): void {
    expect(Testimonials::sameLanguage('zh-Hans', 'zh-Hant'))->toBeTrue();
    expect(Testimonials::sameLanguage('en', 'pt-BR'))->toBeFalse();

    $first = app(Testimonials::class)->forLocale('zh-Hant')[0];
    expect($first['lang'])->toBe('zh-Hans');
    expect($first['translation'])->toBeNull();
});
