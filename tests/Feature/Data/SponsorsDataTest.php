<?php

use Illuminate\Support\Facades\File;

/**
 * @return array{
 *     verifiedAt: string,
 *     verification: array{method: string, program: string},
 *     sponsors: list<array{id: string, name: string, githubLogin: string, url: string, logo: array{light: string, dark: string|null, width: int, height: int}}>
 * }
 */
function sponsorsJson(): array
{
    static $data = null;

    return $data ??= json_decode(File::get(resource_path('data/sponsors.json')), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @return array{0: int, 1: int}|null
 */
function sponsorLogoSize(string $path): ?array
{
    if (str_ends_with($path, '.svg')) {
        $root = simplexml_load_string(File::get($path));

        if ($root === false) {
            return null;
        }

        return [(int) $root['width'], (int) $root['height']];
    }

    $size = getimagesize($path);

    return $size === false ? null : [$size[0], $size[1]];
}

it('records when and how the sponsors were verified', function (): void {
    $data = sponsorsJson();

    expect(array_keys($data))->toBe(['verifiedAt', 'verification', 'sponsors']);
    expect($data['verifiedAt'])->toMatch('/^\d{4}-\d{2}-\d{2}$/');
    expect($data['verifiedAt'] <= now()->toDateString())->toBeTrue('verifiedAt is in the future');
    expect($data['verification']['method'])->toBeString()->not->toBe('');

    $facts = json_decode(File::get(resource_path('data/facts.json')), true, 512, JSON_THROW_ON_ERROR);

    expect($data['verification']['program'])->toBe($facts['links']['sponsorsProgram']);
});

it('lists exactly the four verified sponsors, in display order', function (): void {
    $sponsors = sponsorsJson()['sponsors'];

    expect(array_column($sponsors, 'name'))->toBe(['CodeRabbit', 'SimpleLocalize', 'Nimbus', 'Dwarves Foundation']);
    expect(array_column($sponsors, 'githubLogin'))->toBe(['coderabbitai', 'simplelocalize', 'getnimbus', 'dwarvesf']);

    $ids = array_column($sponsors, 'id');

    expect($ids)->toBe(array_values(array_unique($ids)));

    foreach ($sponsors as $sponsor) {
        expect(array_keys($sponsor))->toBe(['id', 'name', 'githubLogin', 'url', 'logo']);
        expect($sponsor['id'])->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/');
    }
});

it('links every sponsor over HTTPS', function (): void {
    foreach (sponsorsJson()['sponsors'] as $sponsor) {
        expect($sponsor['url'])->toStartWith('https://');
        expect(filter_var($sponsor['url'], FILTER_VALIDATE_URL))->not->toBeFalse("{$sponsor['name']} has a malformed URL");
    }
});

it('points at logo files that exist, with their real intrinsic size', function (): void {
    foreach (sponsorsJson()['sponsors'] as $sponsor) {
        $logo = $sponsor['logo'];

        expect(array_keys($logo))->toBe(['light', 'dark', 'width', 'height']);

        foreach (array_filter([$logo['light'], $logo['dark']]) as $src) {
            expect($src)->toStartWith('/images/sponsors/');
            expect(File::exists(public_path($src)))->toBeTrue("{$src} does not exist");
        }

        expect(sponsorLogoSize(public_path($logo['light'])))->toBe([$logo['width'], $logo['height']], "{$sponsor['name']}'s width and height must match the file");
    }
});

it('keeps a raster logo close to the size the wall shows it at', function (): void {
    preg_match('/const LOGO_HEIGHT = (\d+);/', File::get(resource_path('js/components/home/sponsors-section.tsx')), $shown);

    foreach (sponsorsJson()['sponsors'] as $sponsor) {
        if (! str_ends_with($sponsor['logo']['light'], '.svg')) {
            expect($sponsor['logo']['height'])->toBeLessThanOrEqual(4 * (int) $shown[1], "{$sponsor['name']}'s logo is far larger than it is shown");
        }
    }
});
