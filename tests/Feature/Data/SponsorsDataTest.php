<?php

use Illuminate\Support\Facades\File;
use PHPUnit\Framework\Assert;

const SPONSOR_PLACEMENTS = ['name', 'homepage', 'lead'];

/**
 * @return array{
 *     verifiedAt: string,
 *     verification: array{method: string, program: string},
 *     homepageSlots: int,
 *     leadSlots: int,
 *     oneTime: array{multiplier: int, months: int},
 *     tiers: list<array{placement: string, monthly: int}>,
 *     sponsors: list<array{id: string, name: string, githubLogin: string, placement: string, url: string, logo: array{light: string, dark: string|null, width: int, height: int}|null}>
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

    expect(array_keys($data))->toBe(['verifiedAt', 'verification', 'homepageSlots', 'leadSlots', 'oneTime', 'tiers', 'sponsors']);
    expect($data['verifiedAt'])->toMatch('/^\d{4}-\d{2}-\d{2}$/');
    expect($data['verifiedAt'] <= now()->toDateString())->toBeTrue('verifiedAt is in the future');
    expect($data['verification']['method'])->toBeString()->not->toBe('');

    $facts = json_decode(File::get(resource_path('data/facts.json')), true, 512, JSON_THROW_ON_ERROR);

    expect($data['verification']['program'])->toBe($facts['links']['sponsorsProgram']);
});

it('prices one tier per placement, each above the one before', function (): void {
    $data = sponsorsJson();

    expect(array_column($data['tiers'], 'placement'))->toBe(SPONSOR_PLACEMENTS);
    expect($data['homepageSlots'])->toBeInt()->toBeGreaterThan(0);
    expect($data['leadSlots'])->toBeInt()->toBeGreaterThan(0)->toBeLessThanOrEqual($data['homepageSlots']);
    expect(array_keys($data['oneTime']))->toBe(['multiplier', 'months']);
    expect($data['oneTime']['multiplier'])->toBeInt()->toBeGreaterThan(0);
    expect($data['oneTime']['months'])->toBeInt()->toBeGreaterThan(0);

    $previous = 0;

    foreach ($data['tiers'] as $tier) {
        expect(array_keys($tier))->toBe(['placement', 'monthly']);
        expect($tier['monthly'])->toBeInt()->toBeGreaterThan($previous);
        $previous = $tier['monthly'];
    }
});

it('places every sponsor once, within the slots, with no amount', function (): void {
    $data = sponsorsJson();
    $sponsors = $data['sponsors'];

    $ids = array_column($sponsors, 'id');
    $logins = array_map('strtolower', array_column($sponsors, 'githubLogin'));

    expect($ids)->toBe(array_values(array_unique($ids)));
    expect($logins)->toBe(array_values(array_unique($logins)));

    foreach ($sponsors as $sponsor) {
        // An amount or a tier per sponsor would publish what each one pays.
        expect(array_keys($sponsor))->toBe(['id', 'name', 'githubLogin', 'placement', 'url', 'logo']);
        expect($sponsor['id'])->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/');
        expect($sponsor['placement'])->toBeIn(SPONSOR_PLACEMENTS);
        expect($sponsor['logo'] === null)->toBe($sponsor['placement'] === 'name', "{$sponsor['name']}: a logo goes with every placement but a name");
    }

    $count = fn(array $placements): int => count(array_filter($sponsors, fn(array $sponsor): bool => in_array($sponsor['placement'], $placements, true)));

    expect($count(['lead']))->toBeLessThanOrEqual($data['leadSlots']);
    Assert::assertLessThanOrEqual($data['homepageSlots'], $count(['lead', 'homepage']), 'More homepage sponsors than homepage slots');
});

it('links every sponsor over HTTPS', function (): void {
    foreach (sponsorsJson()['sponsors'] as $sponsor) {
        expect($sponsor['url'])->toStartWith('https://');
        expect(filter_var($sponsor['url'], FILTER_VALIDATE_URL))->not->toBeFalse("{$sponsor['name']} has a malformed URL");
    }
});

it('points at logo files named for the sponsor, with their real intrinsic size', function (): void {
    foreach (sponsorsJson()['sponsors'] as $sponsor) {
        $logo = $sponsor['logo'];

        if ($logo === null) {
            continue;
        }

        expect(array_keys($logo))->toBe(['light', 'dark', 'width', 'height']);
        expect($logo['light'])->toMatch("#^/images/sponsors/{$sponsor['id']}\\.(svg|png|webp)$#");
        expect(File::exists(public_path($logo['light'])))->toBeTrue("{$logo['light']} does not exist");
        expect(sponsorLogoSize(public_path($logo['light'])))->toBe([$logo['width'], $logo['height']], "{$sponsor['name']}'s width and height must match the file");

        if ($logo['dark'] !== null) {
            expect($logo['dark'])->toMatch("#^/images/sponsors/{$sponsor['id']}-dark\\.(svg|png|webp)$#");
            expect(File::exists(public_path($logo['dark'])))->toBeTrue("{$logo['dark']} does not exist");

            // Both files share the declared size, so the dark one must keep the light one's shape.
            [$width, $height] = sponsorLogoSize(public_path($logo['dark'])) ?? [0, 1];
            expect(round($width / $height, 2))->toBe(round($logo['width'] / $logo['height'], 2), "{$sponsor['name']}'s dark logo has another aspect ratio");
        }
    }
});

it('keeps a raster logo close to the size the grid draws it at', function (): void {
    $grid = File::get(resource_path('js/components/sponsors/sponsor-grid.tsx'));

    preg_match('/const LOGO_HEIGHT = (\d+);/', $grid, $regular);
    preg_match('/const LEAD_LOGO_HEIGHT = (\d+);/', $grid, $lead);

    expect($regular[1] ?? null)->not->toBeNull();
    expect($lead[1] ?? null)->not->toBeNull();

    foreach (sponsorsJson()['sponsors'] as $sponsor) {
        if ($sponsor['logo'] !== null && ! str_ends_with($sponsor['logo']['light'], '.svg')) {
            $shown = (int) ($sponsor['placement'] === 'lead' ? $lead[1] : $regular[1]);

            expect($sponsor['logo']['height'])->toBeLessThanOrEqual(4 * $shown, "{$sponsor['name']}'s logo is far larger than it is shown");
        }
    }
});

it('leaves no logo behind once its sponsor is gone', function (): void {
    $referenced = [];

    foreach (sponsorsJson()['sponsors'] as $sponsor) {
        foreach (array_filter([$sponsor['logo']['light'] ?? null, $sponsor['logo']['dark'] ?? null]) as $src) {
            $referenced[] = basename($src);
        }
    }

    $files = array_map('basename', File::files(public_path('images/sponsors')));

    sort($referenced);
    sort($files);

    expect($files)->toBe($referenced, 'A file in public/images/sponsors belongs to no sponsor in sponsors.json');
});

it('describes every tier in every language', function (string $locale): void {
    $copy = json_decode(File::get(resource_path("data/content/{$locale}/sponsors.json")), true, 512, JSON_THROW_ON_ERROR);

    expect(array_keys($copy['tiers']['benefit']))->toEqualCanonicalizing(array_column(sponsorsJson()['tiers'], 'placement'));
})->with(array_keys(json_decode((string) file_get_contents(__DIR__ . '/../../../resources/data/locales.json'), true)['supported']));

it('reads sponsors from GitHub only on a maintainer machine, never with a token in the app', function (): void {
    $paths = [app_path(), config_path(), base_path('routes'), resource_path('js'), base_path('.claude/skills/sponsors')];

    foreach ($paths as $path) {
        foreach (File::allFiles($path) as $file) {
            Assert::assertDoesNotMatchRegularExpression('/GITHUB_TOKEN|GH_TOKEN|ghp_|github_pat_|gh auth token/', $file->getContents(), "{$file->getPathname()} reads a GitHub token");
        }
    }
});
