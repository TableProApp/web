<?php

use App\Support\Content\Slugs\DatabaseSlugs;
use App\Support\Content\Testimonials;
use App\Support\Localization\Locales;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\File;

function siteDataJson(string $file): array
{
    return json_decode(File::get(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

function siteDataImageSize(string $path): ?array
{
    if (str_ends_with($path, '.svg')) {
        $root = simplexml_load_string(File::get($path));

        return $root === false ? null : [(int) round((float) $root['width']), (int) round((float) $root['height'])];
    }

    $size = getimagesize($path);

    return $size === false ? null : [$size[0], $size[1]];
}

function siteDataFilesIn(string $directory): array
{
    $files = array_map(fn(SplFileInfo $file): string => $file->getFilename(), File::files(public_path($directory)));
    sort($files);

    return $files;
}

describe('locales.json', function (): void {
    it('describes each locale completely', function (): void {
        $data = siteDataJson('locales.json');

        foreach ($data['supported'] as $code => $locale) {
            expect($locale)->toHaveKeys(['native', 'prefix', 'hreflang', 'og', 'intl'])
                ->and($locale['native'])->toBeString()->not->toBeEmpty()
                ->and($locale['hreflang'])->toBe($code)
                ->and($locale['og'])->toMatch('/^[a-z]{2}_[A-Z]{2}$/');

            if ($code !== $data['default']) {
                expect($locale['prefix'])->toBe($code);
            }
        }
    });

    it('collides with no root path the site or the platform serves', function (): void {
        $prefixed = array_map(fn(string $code): string => "locale:{$code}", array_diff(Locales::codes(), [Locales::default()]));

        $roots = collect(app('router')->getRoutes()->getRoutes())
            ->reject(fn(Route $route): bool => array_intersect($prefixed, $route->gatherMiddleware()) !== [])
            ->map(fn(Route $route): string => explode('/', $route->uri())[0])
            ->filter(fn(string $segment): bool => $segment !== '' && ! str_starts_with($segment, '{'))
            ->merge([...DatabaseSlugs::ALL, 'account', 'checkout', 'thank-you', 'newsletter', 'webhooks', 'build', 'og', 'images']);

        foreach (array_filter(array_column(siteDataJson('locales.json')['supported'], 'prefix')) as $prefix) {
            expect($roots->contains($prefix))->toBeFalse("/{$prefix} is already a path")
                ->and(file_exists(public_path($prefix)))->toBeFalse("public/{$prefix} would shadow the /{$prefix} pages");
        }
    });
});

describe('brand.json', function (): void {
    it('lists every file in public/images/brand once, at its size on disk', function (): void {
        $data = siteDataJson('brand.json');
        $files = collect($data['assets'])->flatMap(fn(array $asset): array => collect($asset['variants'])->flatMap(fn(array $variant): array => $variant['files'])->all());
        $listed = $files->map(fn(array $file): string => basename($file['src']))->sort()->values()->all();

        expect($listed)->toBe(siteDataFilesIn('images/brand'));

        foreach ($files as $file) {
            expect(siteDataImageSize(public_path(ltrim($file['src'], '/'))))->toBe([$file['width'], $file['height']], "{$file['src']} has another size");
        }

        foreach ($data['assets'] as $asset) {
            foreach ($asset['variants'] as $variant) {
                expect($data['labels'])->toHaveKey($variant['ground'])
                    ->and(array_column($variant['files'], 'src'))->toContain($variant['preview']);
            }
        }
    });

    it('ships only plain SVG: no script, embedded content or external reference', function (): void {
        foreach (File::glob(public_path('images/brand/*.svg')) as $path) {
            expect(File::get($path))->not->toMatch('/<(script|foreignObject|image|use)\b|\bhref=|\son[a-z]+=/i', basename($path));
        }
    });
});

describe('sponsors.json', function (): void {
    it('prices one tier per placement, each above the one before', function (): void {
        $data = siteDataJson('sponsors.json');
        $monthly = array_column($data['tiers'], 'monthly');
        $sorted = $monthly;
        sort($sorted);

        expect($data['verifiedAt'] <= now()->toDateString())->toBeTrue('verifiedAt is in the future')
            ->and($monthly)->toBe(array_values(array_unique($sorted)))
            ->and($data['leadSlots'])->toBeLessThanOrEqual($data['homepageSlots']);
    });

    it('places every sponsor once, within the slots, with no amount', function (): void {
        $data = siteDataJson('sponsors.json');
        $sponsors = collect($data['sponsors']);
        $placements = array_column($data['tiers'], 'placement');

        expect($sponsors->pluck('id')->duplicates())->toBeEmpty()
            ->and($sponsors->whereIn('placement', ['lead'])->count())->toBeLessThanOrEqual($data['leadSlots'])
            ->and($sponsors->whereIn('placement', ['lead', 'homepage'])->count())->toBeLessThanOrEqual($data['homepageSlots']);

        foreach ($sponsors as $sponsor) {
            expect(array_keys($sponsor))->toBe(['id', 'name', 'githubLogin', 'placement', 'url', 'logo'], "{$sponsor['id']} would publish what it pays")
                ->and($sponsor['placement'])->toBeIn($placements)
                ->and($sponsor['url'])->toStartWith('https://');
        }
    });

    it('points at logo files with their real size, and keeps no other', function (): void {
        $referenced = [];

        foreach (siteDataJson('sponsors.json')['sponsors'] as $sponsor) {
            if ($sponsor['logo'] === null) {
                continue;
            }

            expect(siteDataImageSize(public_path(ltrim($sponsor['logo']['light'], '/'))))->toBe([$sponsor['logo']['width'], $sponsor['logo']['height']], $sponsor['name']);

            foreach (array_filter([$sponsor['logo']['light'], $sponsor['logo']['dark']]) as $src) {
                expect(public_path(ltrim($src, '/')))->toBeFile();
                $referenced[] = basename($src);
            }
        }

        sort($referenced);

        expect(siteDataFilesIn('images/sponsors'))->toBe($referenced);
    });

    it('describes every tier in the page copy', function (): void {
        $copy = json_decode(File::get(resource_path('data/content/en/sponsors.json')), true, 512, JSON_THROW_ON_ERROR);

        expect(array_keys($copy['tiers']['benefit']))->toEqualCanonicalizing(array_column(siteDataJson('sponsors.json')['tiers'], 'placement'));
    });

    it('reads sponsors from GitHub only on a maintainer machine, never with a token in the app', function (): void {
        foreach ([app_path(), config_path(), base_path('routes'), resource_path('js'), base_path('.claude/skills/sponsors')] as $path) {
            foreach (File::allFiles($path) as $file) {
                expect($file->getContents())->not->toMatch('/GITHUB_TOKEN|GH_TOKEN|ghp_|github_pat_|gh auth token/', "{$file->getPathname()} reads a GitHub token");
            }
        }
    });
});

describe('testimonials.json', function (): void {
    it('gives every quote its author, a dated https link and its language', function (): void {
        $data = siteDataJson('testimonials.json');

        expect(array_column($data['quotes'], 'id'))->toBe(array_values(array_unique(array_column($data['quotes'], 'id'))));

        foreach ($data['quotes'] as $quote) {
            expect($quote)->toHaveKeys(['id', 'name', 'platform', 'url', 'date', 'lang', 'text', 'translations'])
                ->and($quote['url'])->toStartWith('https://')
                ->and($quote['date'] <= $data['verifiedAt'])->toBeTrue("{$quote['id']} is dated after it was read")
                ->and($quote['text'])->not->toBeEmpty();

            foreach (array_keys($quote['translations']) as $locale) {
                expect($locale)->toBeIn(Locales::codes())
                    ->and(Testimonials::sameLanguage($quote['lang'], $locale))->toBeFalse("{$quote['id']} is translated into its own language");
            }
        }
    });

    it('ships a photo for every author, and no other', function (): void {
        $ids = array_map(fn(string $id): string => "{$id}.webp", array_column(siteDataJson('testimonials.json')['quotes'], 'id'));
        sort($ids);

        expect(siteDataFilesIn('images/testimonials'))->toBe($ids);
    });

    it('leads with the three featured quotes, then the reader\'s language, translating the rest', function (string $locale): void {
        $all = siteDataJson('testimonials.json')['quotes'];
        $shown = app(Testimonials::class)->forLocale($locale);
        $featured = array_values(array_filter($all, fn(array $quote): bool => ($quote['featured'] ?? false) === true));
        $rest = array_slice($shown, count($featured));
        $own = array_map(fn(array $quote): bool => Testimonials::sameLanguage($quote['lang'], $locale), $shown);
        $restOwn = array_map(fn(array $quote): bool => Testimonials::sameLanguage($quote['lang'], $locale), $rest);

        expect($featured)->toHaveCount(3)
            ->and($shown)->toHaveCount(count($all))
            ->and(array_column(array_slice($shown, 0, 3), 'id'))->toBe(array_column($featured, 'id'))
            ->and(array_column($shown, 'featured'))->toBe([true, true, true, ...array_fill(0, count($rest), false)])
            ->and($restOwn)->toBe(array_values([...array_filter($restOwn), ...array_filter($restOwn, fn(bool $same): bool => ! $same)]));

        foreach ($shown as $index => $quote) {
            expect($quote['translation'] === null)->toBe($own[$index], "{$quote['id']} in {$locale}");
        }
    })->with('locales');

    it('reads Simplified Chinese as the language of a Traditional Chinese page', function (): void {
        expect(Testimonials::sameLanguage('zh-Hans', 'zh-Hant'))->toBeTrue()
            ->and(Testimonials::sameLanguage('en', 'pt-BR'))->toBeFalse();
    });
});
