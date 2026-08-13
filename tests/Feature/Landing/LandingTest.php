<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

beforeEach(function () {
    withoutVite();
});

it('renders the home page', function () {
    get(route('landing.home'))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Home')
            ->has('downloadUrls')
            ->has('downloadUrls.arm64')
            ->has('downloadUrls.x86_64'),
        );
});

it('renders the download page', function () {
    get(route('landing.download'))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Download')
            ->has('downloadUrls'),
        );
});

it('selects the app release DMG urls and skips plugin releases', function () {
    Cache::flush();

    Http::fake([
        'api.github.com/repos/TableProApp/TablePro/releases*' => Http::response([
            [
                'tag_name' => 'plugin-etcd-v1.0.25',
                'assets' => [
                    ['name' => 'EtcdDriverPlugin-arm64.zip', 'browser_download_url' => 'https://example.com/etcd-arm64.zip'],
                    ['name' => 'EtcdDriverPlugin-x86_64.zip', 'browser_download_url' => 'https://example.com/etcd-x86_64.zip'],
                ],
            ],
            [
                'tag_name' => 'v0.44.0',
                'assets' => [
                    ['name' => 'TablePro-0.44.0-arm64.dmg', 'browser_download_url' => 'https://example.com/TablePro-0.44.0-arm64.dmg'],
                    ['name' => 'TablePro-0.44.0-x86_64.dmg', 'browser_download_url' => 'https://example.com/TablePro-0.44.0-x86_64.dmg'],
                ],
            ],
        ]),
        '*' => Http::response([]),
    ]);

    get(route('landing.download'))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Download')
                ->where('downloadUrls.arm64', 'https://example.com/TablePro-0.44.0-arm64.dmg')
                ->where('downloadUrls.x86_64', 'https://example.com/TablePro-0.44.0-x86_64.dmg'),
        );
});

it('falls back to the releases list when no app release is present', function () {
    Cache::flush();

    Http::fake([
        'api.github.com/repos/TableProApp/TablePro/releases*' => Http::response([
            [
                'tag_name' => 'plugin-etcd-v1.0.25',
                'assets' => [
                    ['name' => 'EtcdDriverPlugin-arm64.zip', 'browser_download_url' => 'https://example.com/etcd-arm64.zip'],
                ],
            ],
        ]),
        '*' => Http::response([]),
    ]);

    get(route('landing.download'))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Download')
                ->where('downloadUrls.arm64', 'https://github.com/TableProApp/TablePro/releases')
                ->where('downloadUrls.x86_64', 'https://github.com/TableProApp/TablePro/releases'),
        );
});

it('renders the privacy page', function () {
    get(route('landing.privacy'))
        ->assertOk()
        ->assertInertia(fn($page) => $page->component('Privacy'));
});

it('renders the terms page', function () {
    get(route('landing.terms'))
        ->assertOk()
        ->assertInertia(fn($page) => $page->component('Terms'));
});
