<?php

use App\Services\Og\OgImageRenderer;
use Illuminate\Support\Facades\File;

/**
 * These tests need an empty public/og to count what the command renders, but
 * that directory holds ~18 MB of committed production cards. Move it aside for
 * the duration instead of deleting it, or a test run silently stages the
 * removal of every OG image in the repo.
 */
function ogBackupPath(): string
{
    return storage_path('framework/testing/og-backup');
}

beforeEach(function (): void {
    File::deleteDirectory(ogBackupPath());

    if (File::isDirectory(public_path('og'))) {
        File::moveDirectory(public_path('og'), ogBackupPath());
    }
});

afterEach(function (): void {
    File::deleteDirectory(public_path('og'));

    if (File::isDirectory(ogBackupPath())) {
        File::moveDirectory(ogBackupPath(), public_path('og'));
    }
});

it('renders one OG image per slug when --slug is provided', function (): void {
    $captured = [];

    $this->mock(OgImageRenderer::class, function ($mock) use (&$captured): void {
        $mock->shouldReceive('render')
            ->andReturnUsing(function (string $html, string $outputPath, int $width = 1200, int $height = 630) use (&$captured): void {
                $captured[] = ['html' => $html, 'outputPath' => $outputPath, 'width' => $width, 'height' => $height];
                File::ensureDirectoryExists(dirname($outputPath));
                File::put($outputPath, "stub-png-bytes-{$width}x{$height}");
            });
    });

    $this->artisan('og:generate', ['--slug' => 'dbeaver'])
        ->assertSuccessful();

    expect($captured)->toHaveCount(1);
    expect($captured[0]['outputPath'])->toEndWith('public/og/compare/dbeaver.png');
    expect($captured[0]['html'])->toContain('DBeaver');
    expect($captured[0]['width'])->toBe(1200);
    expect($captured[0]['height'])->toBe(630);
    expect(File::exists(public_path('og/compare/dbeaver.png')))->toBeTrue();
});

it('renders compare, database, and blog sets when --type=all and no slug', function (): void {
    $rendered = [];

    $this->mock(OgImageRenderer::class, function ($mock) use (&$rendered): void {
        $mock->shouldReceive('render')
            ->andReturnUsing(function (string $html, string $outputPath) use (&$rendered): void {
                $rendered[] = $outputPath;
                File::ensureDirectoryExists(dirname($outputPath));
                File::put($outputPath, 'stub');
            });
    });

    $comparisonCount = count(json_decode(File::get(resource_path('data/comparisons.json')), true));
    $databaseCount = count(json_decode(File::get(resource_path('data/databases.json')), true));
    $blogCount = count(app(\App\Services\Blog\BlogService::class)->all());

    $this->artisan('og:generate')->assertSuccessful();

    expect(count($rendered))->toBe($comparisonCount + $databaseCount + $blogCount);

    foreach ($rendered as $path) {
        expect($path)->toMatch('#/og/(compare|database|blog)/[a-z0-9-]+\.png$#');
    }
});

it('only renders the compare set when --type=compare', function (): void {
    $rendered = [];

    $this->mock(OgImageRenderer::class, function ($mock) use (&$rendered): void {
        $mock->shouldReceive('render')
            ->andReturnUsing(function (string $html, string $outputPath) use (&$rendered): void {
                $rendered[] = $outputPath;
                File::ensureDirectoryExists(dirname($outputPath));
                File::put($outputPath, 'stub');
            });
    });

    $this->artisan('og:generate', ['--type' => 'compare'])->assertSuccessful();

    expect($rendered)->not->toBeEmpty();
    foreach ($rendered as $path) {
        expect($path)->toContain('/og/compare/');
    }
});

it('warns when --slug does not match any entry', function (): void {
    $this->mock(OgImageRenderer::class, function ($mock): void {
        $mock->shouldNotReceive('render');
    });

    $this->artisan('og:generate', ['--slug' => 'does-not-exist'])
        ->assertSuccessful();
});

it('rejects an invalid --type value', function (): void {
    $this->mock(OgImageRenderer::class, function ($mock): void {
        $mock->shouldNotReceive('render');
    });

    $this->artisan('og:generate', ['--type' => 'banana'])
        ->assertFailed();
});
