<?php

use Illuminate\Support\Facades\File;

/**
 * @return array{
 *     labels: array{light: string, dark: string, colors: string},
 *     assets: list<array{id: string, name: string, description: string, variants: list<array{ground: string, preview: string, files: list<array{src: string, width: int, height: int}>}>}>,
 *     colors: list<array{id: string, name: string, hex: string}>
 * }
 */
function brandJson(): array
{
    static $data = null;

    return $data ??= json_decode(File::get(resource_path('data/brand.json')), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @return list<array{src: string, width: int, height: int}>
 */
function brandFiles(): array
{
    $files = [];

    foreach (brandJson()['assets'] as $asset) {
        foreach ($asset['variants'] as $variant) {
            array_push($files, ...$variant['files']);
        }
    }

    return $files;
}

it('lists every file in public/images/brand once, and nothing else', function (): void {
    $listed = array_column(brandFiles(), 'src');
    $onDisk = array_map(fn(string $path): string => '/images/brand/' . basename($path), File::files(public_path('images/brand')));

    sort($listed);
    sort($onDisk);

    expect($listed)->toBe(array_values(array_unique($listed)))->toBe($onDisk);
});

it('describes each asset and labels each ground it uses', function (): void {
    $data = brandJson();
    $ids = array_column($data['assets'], 'id');

    expect($ids)->toBe(array_values(array_unique($ids)));

    foreach ($data['assets'] as $asset) {
        expect(trim($asset['name']))->not->toBe('');
        expect(trim($asset['description']))->not->toBe('');
        expect($asset['variants'])->not->toBeEmpty();

        foreach ($asset['variants'] as $variant) {
            expect($data['labels'])->toHaveKey($variant['ground']);
            expect(array_column($variant['files'], 'src'))->toContain($variant['preview']);
        }
    }
});

it('states the size of every file as it is on disk', function (): void {
    foreach (brandFiles() as $file) {
        $path = public_path(ltrim($file['src'], '/'));

        if (str_ends_with($path, '.svg')) {
            $root = simplexml_load_string(File::get($path));
            $size = [(int) round((float) $root['width']), (int) round((float) $root['height'])];
        } else {
            $info = getimagesize($path);
            $size = [$info[0], $info[1]];

            expect($info['mime'])->toBe('image/png');
            expect($info['bits'])->toBe(8, "{$file['src']} is not an 8-bit PNG");
        }

        expect($size)->toBe([$file['width'], $file['height']], "{$file['src']} has another size");
    }
});

it('ships only plain SVG: no script, embedded content or external reference', function (): void {
    foreach (File::glob(public_path('images/brand/*.svg')) as $path) {
        $source = File::get($path);
        $root = simplexml_load_string($source);

        expect($root)->not->toBeFalse(basename($path) . ' is not well-formed');
        expect($root->getName())->toBe('svg');
        expect((string) $root['viewBox'])->not->toBe('');
        expect($source)->not->toMatch('/<(script|foreignObject|image|use)\b|\bhref=|\son[a-z]+=/i', basename($path) . ' holds active or external content');
    }
});

it('gives the brand colors that the files use', function (): void {
    $colors = array_column(brandJson()['colors'], 'hex', 'id');

    expect($colors)->toBe(['orange' => '#FF9300', 'ink' => '#1F1B16', 'paper' => '#F5F1EA']);

    $file = fn(string $name): string => File::get(public_path("images/brand/tablepro-{$name}.svg"));

    foreach (['icon-flat', 'logo-black', 'logo-white'] as $name) {
        expect($file($name))->toContain('"' . $colors['orange'] . '"');
    }

    foreach (['logo-black', 'wordmark-black'] as $name) {
        expect($file($name))->toContain('fill="' . $colors['ink'] . '"');
    }

    foreach (['logo-white', 'wordmark-white'] as $name) {
        expect($file($name))->toContain('fill="' . $colors['paper'] . '"');
    }
});
