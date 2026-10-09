<?php

use App\Support\Assets\AssetManifest;
use App\Support\Localization\Locales;
use Illuminate\Support\Facades\File;

it('generates and checks frontend catalogs without requiring documentation', function (): void {
    $directory = sys_get_temp_dir() . '/asset-catalogs-' . bin2hex(random_bytes(6));
    $slots = $directory . '/asset-slots.json';
    $options = ['--slots' => $slots];

    try {
        $this->artisan('assets:generate', ['--check' => true, ...$options])->assertFailed();
        expect(is_dir($directory))->toBeFalse();

        $this->artisan('assets:generate', $options)->assertSuccessful();
        expect(file_get_contents($slots))->toBe(app(AssetManifest::class)->slotProjectionJson());

        foreach (Locales::codes() as $locale) {
            expect(file_get_contents($directory . '/asset-locales/' . $locale . '.json'))
                ->toBe(app(AssetManifest::class)->slotTextProjectionJson($locale));
        }

        $this->artisan('assets:generate', ['--check' => true, ...$options])->assertSuccessful();
        file_put_contents($directory . '/asset-locales/vi.json', '{}');
        $this->artisan('assets:generate', ['--check' => true, ...$options])->assertFailed();
        expect(file_get_contents($directory . '/asset-locales/vi.json'))->toBe('{}');

        $this->artisan('assets:generate', $options)->assertSuccessful();
        file_put_contents($slots, '{}');
        $this->artisan('assets:generate', ['--check' => true, ...$options])->assertFailed();
        expect(file_get_contents($slots))->toBe('{}');
    } finally {
        File::deleteDirectory($directory);
    }
});
