<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Spatie\YamlFrontMatter\YamlFrontMatter;

use function Pest\Laravel\get;

beforeEach(function (): void {
    Cache::flush();
    Storage::fake('local');
    bindReleaseFixturePlatforms();
});

function downloadFakeRelease(?array $payload = null): void
{
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response($payload ?? githubReleasePayload()),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml()),
    ]);

    Artisan::call('release:refresh');
}

it('renders the stored release with its universal DMG', function (): void {
    downloadFakeRelease();

    get('/download')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Download')
            ->where('release.source', 'github')
            ->where('release.version', '0.77.0')
            ->where('release.asset.name', 'TablePro-0.77.0.dmg')
            ->where('release.asset.url', 'https://github.com/TableProApp/TablePro/releases/download/v0.77.0/TablePro-0.77.0.dmg')
            ->where('release.asset.sha256', null));
});

it('sends the DMG’s SHA-256 when the release carries one', function (): void {
    $sha256 = str_repeat('a1', 32);

    downloadFakeRelease(githubReleasePayloadWithDigest($sha256));

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('release.asset.sha256', $sha256));
});

it('answers without waiting on GitHub when nothing is stored, and the next page has the release', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload()),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml()),
    ]);

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('release.source', 'unavailable'));
    get('/vi/download')->assertInertia(fn(AssertableInertia $page) => $page->where('release.version', '0.77.0'));

    expect(Http::recorded(fn(Request $request): bool => str_contains($request->url(), 'api.github.com')))->toHaveCount(1);
});

it('falls back to the latest-release page, with no version, when no source answers', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response('', 500),
        RELEASES_FAKE_APPCAST => Http::response('', 500),
    ]);

    get('/download')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('release.source', 'unavailable')
            ->where('release.version', null)
            ->where('release.asset.url', 'https://github.com/TableProApp/TablePro/releases/latest')
            ->where('mac.homebrewTrails', false));
});

it('flags Homebrew while the cask serves an older version than the live release', function (string $floor, bool $trails): void {
    bindReleaseFixturePlatforms(['mac.floorVersion' => $floor]);
    downloadFakeRelease();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('mac.homebrewTrails', $trails));
})->with([
    'cask behind' => ['0.76.1', true],
    'cask caught up' => ['0.77.0', false],
]);

it('lists a platform as unreleased until it ships', function (): void {
    bindReleaseFixturePlatforms(['ios.status' => 'prototype']);
    downloadFakeRelease();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('ios', null)
        ->where('unreleased', fn($platforms): bool => in_array('ios', $platforms->all(), true)));
});

it('names the featured, published engines from engines.json', function (): void {
    downloadFakeRelease();

    $expected = collect(json_decode((string) file_get_contents(resource_path('data/engines.json')), true))
        ->filter(fn(array $engine): bool => ($engine['featured'] ?? false) === true && ($engine['state'] ?? null) === 'published')
        ->pluck('name')
        ->values()
        ->all();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('featuredEngines', $expected));
});

it('links the newest release post, in English on every page', function (string $path): void {
    downloadFakeRelease();

    $newest = collect(glob(resource_path('blog/*.md')) ?: [])
        ->map(fn(string $file): array => ['slug' => pathinfo($file, PATHINFO_FILENAME), ...YamlFrontMatter::parseFile($file)->matter()])
        ->filter(fn(array $post): bool => is_string($post['release'] ?? null))
        ->sortByDesc('date')
        ->first();

    get($path)->assertInertia(fn(AssertableInertia $page) => $page
        ->where('latestPost.slug', $newest['slug'])
        ->where('latestPost.locale', 'en')
        ->where('latestPost.url', "/blog/{$newest['slug']}"));
})->with(['/download', '/vi/download']);

function downloadLinuxRecord(): array
{
    $linux = collect(json_decode((string) file_get_contents(resource_path('data/platforms.json')), true)['platforms'])->firstWhere('id', 'linux');

    return [...$linux, 'status' => 'released'];
}

function downloadReleaseLinux(): array
{
    $linux = downloadLinuxRecord();
    bindReleaseFixturePlatforms(['linux' => $linux]);

    return $linux;
}

function downloadDocument(string $path = '/download'): Dom\HTMLDocument
{
    requireSsr();

    return Dom\HTMLDocument::createFromString((string) get($path)->assertOk()->getContent(), LIBXML_NOERROR);
}

function downloadJsonLdIds(Dom\HTMLDocument $document): array
{
    $ids = [];

    foreach ($document->querySelectorAll('script[type="application/ld+json"]') as $script) {
        $data = json_decode((string) $script->textContent, true, 512, JSON_THROW_ON_ERROR);

        foreach ($data['@graph'] ?? [$data] as $node) {
            $ids[] = (string) ($node['@id'] ?? '');
        }
    }

    return $ids;
}

function downloadEnglishAvailabilityRows(): int
{
    return collect(App\Support\Content\Slugs\FeatureSlugs::ALL)
        ->sum(fn(string $slug): int => count(json_decode((string) file_get_contents(resource_path("data/content/en/features/{$slug}.json")), true)['availability']));
}

it('sends nothing about Linux while it is not released', function (): void {
    downloadFakeRelease();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('linux', null)
        ->where('engines.linux', [])
        ->where('unreleased', fn($platforms): bool => in_array('linux', $platforms->all(), true)));
});

it('sends the Linux install methods, packages and release once Linux is released', function (): void {
    $linux = downloadReleaseLinux();
    downloadFakeRelease();

    $methods = collect($linux['destinations'])
        ->filter(fn(array $destination): bool => isset($destination['commands']))
        ->map(fn(array $destination): array => ['kind' => $destination['kind'], 'commands' => $destination['commands'], 'update' => $destination['update']])
        ->values()
        ->all();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('linux.methods', $methods)
        ->where('linux.release.version', $linux['release']['version'])
        ->where('linux.architectures', $linux['architectures'])
        ->where('linux.packages', fn($rows): bool => count($rows) === 5 && $rows[0]['files']['x86_64']['name'] === "tablepro-{$linux['release']['version']}-ubuntu-26.04-amd64.deb")
        ->where('engines.linux', fn($names): bool => in_array('PostgreSQL', $names->all(), true) && ! in_array('Oracle', $names->all(), true))
        ->where('unreleased', ['windows']));
});

it('takes the Linux packages’ sizes from the newest GitHub release', function (): void {
    downloadReleaseLinux();
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload()),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml()),
        'api.github.com/repos/TableProApp/TablePro/releases?per_page=*' => Http::response([[
            'tag_name' => 'linux-v0.1.0-beta.2',
            'draft' => false,
            'prerelease' => true,
            'published_at' => '2026-11-10T09:30:00Z',
            'html_url' => 'https://github.com/TableProApp/TablePro/releases/tag/linux-v0.1.0-beta.2',
            'assets' => [
                githubAsset('tablepro-0.1.0-beta.2-fedora-45-aarch64.rpm', 31_000_000, 'linux-v0.1.0-beta.2'),
                githubAsset('SHA256SUMS', 900, 'linux-v0.1.0-beta.2'),
            ],
        ]]),
    ]);
    Artisan::call('release:refresh');
    app(App\Services\Releases\LinuxReleaseService::class)->refresh();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('linux.release.version', '0.1.0-beta.2')
        ->where('linux.packages', [[
            'format' => 'rpm',
            'series' => '45',
            'distribution' => 'Fedora',
            'files' => [
                'x86_64' => null,
                'arm64' => [
                    'name' => 'tablepro-0.1.0-beta.2-fedora-45-aarch64.rpm',
                    'url' => 'https://github.com/TableProApp/TablePro/releases/download/linux-v0.1.0-beta.2/tablepro-0.1.0-beta.2-fedora-45-aarch64.rpm',
                    'bytes' => 31_000_000,
                ],
            ],
        ]])
        ->where('linux.checksums.url', 'https://github.com/TableProApp/TablePro/releases/download/linux-v0.1.0-beta.2/SHA256SUMS'));
});

it('sends every availability row of the feature pages for the platform table', function (string $path, string $locale): void {
    downloadFakeRelease();

    get($path)->assertInertia(fn(AssertableInertia $page) => $page
        ->where('parity.groups', fn($groups): bool => collect($groups)->pluck('slug')->all() === App\Support\Content\Slugs\FeatureSlugs::ALL
            && collect($groups)->sum(fn(array $group): int => count($group['rows'])) === downloadEnglishAvailabilityRows())
        ->where('parity.labels.tiers.starter', fn($name): bool => is_string($name) && $name !== '')
        ->has('parity.facts.linuxSafeModeLevels')
        ->where('engines.mac', collect(json_decode((string) file_get_contents(resource_path('data/engines.json')), true))->where('state', 'published')->count())
        ->where('engines.ios', collect(json_decode((string) file_get_contents(resource_path('data/engines.json')), true))->filter(fn(array $engine): bool => ($engine['ios']['inPicker'] ?? false) === true)->count()));
})->with([['/download', 'en'], ['/vi/download', 'vi']]);

it('renders no Linux section, card or structured data while Linux is not released', function (): void {
    downloadFakeRelease();
    $document = downloadDocument();

    expect($document->getElementById('linux'))->toBeNull()
        ->and($document->querySelector('#mac'))->not->toBeNull()
        ->and($document->querySelector('#ios'))->not->toBeNull()
        ->and($document->querySelectorAll('#platforms thead th'))->toHaveCount(3)
        ->and(collect(downloadJsonLdIds($document))->filter(fn(string $id): bool => str_ends_with($id, '#linux-app')))->toBeEmpty();
})->group('ssr');

it('renders the Linux section with platforms.json’s commands, and the Linux app in the structured data', function (): void {
    $linux = downloadReleaseLinux();
    downloadFakeRelease();
    $document = downloadDocument();

    $expected = collect($linux['destinations'])->filter(fn(array $destination): bool => isset($destination['commands']))->flatMap(fn(array $destination): array => $destination['commands'])->values()->all();
    $rendered = array_map(fn(Dom\Element $line): string => (string) $line->textContent, iterator_to_array($document->querySelectorAll('#linux [role="region"] pre code > span')));

    expect($document->getElementById('linux'))->not->toBeNull()
        ->and(array_slice($rendered, 0, count($expected)))->toBe($expected)
        ->and($document->querySelectorAll('#platforms thead th'))->toHaveCount(4)
        ->and($document->querySelector('a[href="#linux"]'))->not->toBeNull()
        ->and(collect(downloadJsonLdIds($document))->filter(fn(string $id): bool => str_ends_with($id, '#linux-app')))->toHaveCount(1);
})->group('ssr');

it('renders one table row per availability row of the English feature pages', function (): void {
    downloadFakeRelease();
    $document = downloadDocument();

    expect($document->querySelectorAll('#platforms tbody th[scope="row"]'))->toHaveCount(downloadEnglishAvailabilityRows())
        ->and($document->querySelectorAll('#platforms tbody th[scope="rowgroup"]'))->toHaveCount(count(App\Support\Content\Slugs\FeatureSlugs::ALL));
})->group('ssr');

it('names each released platform’s version in the release notes', function (bool $linuxReleased): void {
    if ($linuxReleased) {
        downloadReleaseLinux();
    }

    downloadFakeRelease();
    $notes = (string) downloadDocument()->getElementById('older-versions')?->textContent;

    expect($notes)->toContain('Version 0.77.0')
        ->and($notes)->toContain('Version 1.0,')
        ->and(str_contains($notes, 'Version 0.1.0-beta.1'))->toBe($linuxReleased);
})->with(['Mac and iPhone' => false, 'with Linux' => true])->group('ssr');
