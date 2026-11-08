<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

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

function downloadText(?Dom\Element $element): string
{
    return trim((string) preg_replace('/\s+/u', ' ', (string) $element?->textContent));
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

// The hero's variants for one machine: what that reader sees once app.css applies the head script's class.
function downloadHeroFor(Dom\HTMLDocument $document, string $device): array
{
    $shown = fn(string $selector): array => array_values(array_filter(
        iterator_to_array($document->querySelectorAll("#top {$selector} > [data-device]")),
        fn(Dom\Element $variant): bool => in_array($device, explode(' ', (string) $variant->getAttribute('data-device')), true),
    ));

    return ['title' => $shown('h1'), 'lead' => $shown('h1 + p'), 'action' => $shown('h1 + p + div')];
}

it('renders the stored release with its universal DMG, named by major and minor', function (): void {
    downloadFakeRelease();

    get('/download')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Download')
            ->where('release.source', 'github')
            ->where('release.version', '0.77.0')
            ->where('release.shortVersion', '0.77')
            ->where('release.publishedAtFormatted', 'October 2, 2026')
            ->where('release.asset.name', 'TablePro-0.77.0.dmg')
            ->where('release.asset.url', 'https://github.com/TableProApp/TablePro/releases/download/v0.77.0/TablePro-0.77.0.dmg')
            ->where('mac.universal', true)
            ->where('mac.homebrewCommand', 'brew install --cask tablepro')
            ->where('ios.shortVersion', '1.0')
            ->where('ios.publishedAtFormatted', 'September 22, 2026'));
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
            ->where('release.shortVersion', null)
            ->where('release.asset.url', 'https://github.com/TableProApp/TablePro/releases/latest'));
});

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

it('sends nothing about Linux while it is not released', function (): void {
    downloadFakeRelease();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('linux', null)
        ->where('unreleased', fn($platforms): bool => in_array('linux', $platforms->all(), true)));
});

it('sends the Linux install methods and release once Linux is released', function (): void {
    $linux = downloadReleaseLinux();
    downloadFakeRelease();

    $methods = collect($linux['destinations'])
        ->filter(fn(array $destination): bool => isset($destination['commands']))
        ->map(fn(array $destination): array => ['kind' => $destination['kind'], 'commands' => $destination['commands']])
        ->values()
        ->all();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('linux.methods', $methods)
        ->where('linux.release.version', $linux['release']['version'])
        ->where('linux.release.shortVersion', '0.1')
        ->where('linux.architectures', $linux['architectures'])
        ->where('unreleased', ['windows']));
});

it('takes the Linux release from the newest GitHub release', function (): void {
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
        ->where('linux.release.shortVersion', '0.1')
        ->where('linux.release.publishedOn', 'November 10, 2026')
        ->where('linux.release.releaseUrl', 'https://github.com/TableProApp/TablePro/releases/tag/linux-v0.1.0-beta.2'));
});

it('keeps the page to downloads: no feature table, engine counts, screenshot, file table or checksum', function (): void {
    downloadReleaseLinux();
    downloadFakeRelease();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page
        ->missing('parity')
        ->missing('engines')
        ->missing('latestPost')
        ->missing('linux.packages')
        ->missing('linux.checksums')
        ->missing('linux.verify')
        ->missing('mac.homebrewTrails'));
});

it('writes three install steps for after the click', function (): void {
    $started = json_decode(File::get(resource_path('data/content/en/download.json')), true)['started'];

    expect($started['steps'])->toHaveCount(3)
        ->and($started['steps'][0])->toContain('{file}')
        ->and($started['retry'])->toContain('<link>');
});

it('shows each machine its own release and one action, and any other machine a sentence instead of a download', function (): void {
    downloadReleaseLinux();
    downloadFakeRelease();
    $document = downloadDocument();

    $mac = downloadHeroFor($document, 'mac');
    $linux = downloadHeroFor($document, 'linux');
    $ios = downloadHeroFor($document, 'ios');
    $other = downloadHeroFor($document, 'other');

    expect($document->querySelectorAll('h1'))->toHaveCount(1)
        ->and(array_map(fn(array $hero): int => count($hero['title']) + count($hero['lead']) + count($hero['action']), [$mac, $linux, $ios, $other]))->toBe([3, 3, 3, 3])
        ->and(downloadText($mac['title'][0]))->toBe('TablePro 0.77')
        ->and(downloadText($mac['lead'][0]))->toStartWith('Released October 2, 2026.')
        ->and($mac['action'][0]->querySelector('a')?->getAttribute('href'))->toBe('https://github.com/TableProApp/TablePro/releases/download/v0.77.0/TablePro-0.77.0.dmg')
        ->and(downloadText($mac['action'][0]))->toContain('Universal app. Requires macOS 13 Ventura or later.')
        ->and(downloadText($linux['title'][0]))->toBe('TablePro 0.1 Beta')
        ->and(downloadText($linux['lead'][0]))->toStartWith('Released November 7, 2026.')
        ->and($linux['action'][0]->querySelector('a')?->getAttribute('href'))->toBe('#linux')
        ->and(downloadText($ios['title'][0]))->toBe('TablePro 1.0')
        ->and($ios['action'][0]->querySelector('a')?->getAttribute('href'))->toBe('https://apps.apple.com/app/tablepro/id6761621829')
        ->and(downloadText($ios['action'][0]))->toContain('Free. Requires iOS and iPadOS 18 or later.')
        ->and($other['title'][0])->toBe($mac['title'][0])
        ->and($other['action'][0]->querySelector('a'))->toBeNull()
        ->and(downloadText($other['action'][0]))->toBe('TablePro runs on Mac, Linux, iPhone and iPad.')
        ->and((string) $document->querySelector('main')?->textContent)->not->toContain('Your download has started');
})->group('ssr');

it('hides every hero variant but the reader’s machine before first paint, a Mac with no class', function (): void {
    $css = File::get(resource_path('css/app.css'));
    $head = File::get(resource_path('views/app.blade.php'));

    expect($css)->toContain("html:not(.ios, .linux, .other-device) [data-device]:not([data-device~='mac'])");

    foreach (['ios' => 'ios', 'linux' => 'linux', 'other-device' => 'other'] as $class => $device) {
        expect($css)->toContain("html.{$class} [data-device]:not([data-device~='{$device}'])")
            ->and($head)->toContain("classList.add('{$class}')");
    }
});

it('gives a Linux reader the sentence while Linux is not released, and renders no Linux band or structured data', function (): void {
    downloadFakeRelease();
    $document = downloadDocument();

    expect($document->getElementById('linux'))->toBeNull()
        ->and(downloadText(downloadHeroFor($document, 'linux')['action'][0] ?? null))->toBe('TablePro runs on Mac, iPhone and iPad.')
        ->and(downloadText(downloadHeroFor($document, 'linux')['title'][0] ?? null))->toBe('TablePro 0.77')
        ->and(collect(downloadJsonLdIds($document))->filter(fn(string $id): bool => str_ends_with($id, '#linux-app')))->toBeEmpty();
})->group('ssr');

it('falls back to “Download TablePro” and GitHub’s latest release when no release source answers', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response('', 500),
        RELEASES_FAKE_APPCAST => Http::response('', 500),
    ]);
    $document = downloadDocument();
    $mac = downloadHeroFor($document, 'mac');

    expect(downloadText($mac['title'][0]))->toBe('Download TablePro')
        ->and(downloadText($mac['lead'][0]))->toBe('')
        ->and($mac['action'][0]->querySelector('a')?->getAttribute('href'))->toBe('https://github.com/TableProApp/TablePro/releases/latest');
})->group('ssr');

it('shows a band per platform in platform order, then Windows, then the older releases', function (): void {
    downloadReleaseLinux();
    downloadFakeRelease();
    $document = downloadDocument();
    $sections = array_map(fn(Dom\Element $section): string => (string) $section->getAttribute('id'), iterator_to_array($document->querySelectorAll('main > section')));

    expect($sections)->toBe(['top', 'mac', 'linux', 'ios', 'other-platforms', 'older-versions'])
        ->and(downloadText($document->querySelector('#mac h2')))->toBe('Mac')
        ->and(downloadText($document->querySelector('#linux h2')))->toBe('Linux')
        ->and(downloadText($document->querySelector('#ios h2')))->toBe('iPhone & iPad')
        ->and(downloadText($document->getElementById('other-platforms')))->toBe('Windows is coming later.')
        ->and(array_map(fn(Dom\Element $link): string => trim(str_replace('↗', '', (string) $link->textContent)), iterator_to_array($document->querySelectorAll('#older-versions a'))))
        ->toBe(['Older versions on GitHub', 'Build from source (AGPLv3)', 'Changelog']);
})->group('ssr');

it('offers the DMG and Homebrew on the Mac band, and no checksum anywhere', function (): void {
    downloadFakeRelease(githubReleasePayloadWithDigest(str_repeat('a1', 32)));
    $document = downloadDocument();

    expect($document->querySelector('#mac a[href$="TablePro-0.77.0.dmg"]'))->not->toBeNull()
        ->and(downloadText($document->querySelector('#mac pre code')))->toBe('brew install --cask tablepro')
        ->and(downloadText($document->querySelector('#mac p')))->toBe('Requires macOS 13 Ventura or later, on Apple silicon or Intel. TablePro updates itself.')
        ->and((string) $document->querySelector('main')?->textContent)->not->toContain('SHA-256')
        ->and((string) $document->querySelector('main')?->textContent)->not->toContain(str_repeat('a1', 32))
        ->and((string) $document->querySelector('main')?->textContent)->not->toContain('shasum');
})->group('ssr');

it('renders the Linux band with platforms.json’s commands under their distributions, and the Linux app in the structured data', function (): void {
    $linux = downloadReleaseLinux();
    downloadFakeRelease();
    $document = downloadDocument();

    $expected = collect($linux['destinations'])->filter(fn(array $destination): bool => isset($destination['commands']))->map(fn(array $destination): array => $destination['commands'])->values()->all();
    $blocks = array_map(
        fn(Dom\Element $block): array => explode("\n", (string) $block->querySelector('pre code')?->textContent),
        iterator_to_array($document->querySelectorAll('#linux [role="region"]')),
    );
    $headings = array_map(fn(Dom\Element $heading): string => downloadText($heading), iterator_to_array($document->querySelectorAll('#linux h3')));

    // A command keeps its line and the block scrolls sideways (owner, 2026-11-08).
    foreach ($document->querySelectorAll('#linux pre') as $pre) {
        expect(in_array('whitespace-pre', explode(' ', (string) $pre->getAttribute('class')), true))->toBeTrue('a command block wraps its lines')
            ->and($pre->querySelectorAll('wbr'))->toHaveCount(0);
    }

    expect($blocks)->toBe($expected)
        ->and($headings)->toBe(['Ubuntu 26.04 and 26.10', 'Fedora 44 and 45', 'Other distributions, with Flatpak'])
        ->and(downloadText($document->querySelector('#linux h2 + span')))->toBe('Beta')
        ->and(downloadText($document->querySelector('#linux p')))->toBe('Builds for x86_64 and arm64. Your package manager picks the right one and keeps it up to date.')
        ->and($document->querySelector('#linux a[href="https://github.com/TableProApp/TablePro/releases/tag/linux-v' . $linux['release']['version'] . '"]'))->not->toBeNull()
        ->and(collect(downloadJsonLdIds($document))->filter(fn(string $id): bool => str_ends_with($id, '#linux-app')))->toHaveCount(1);
})->group('ssr');

it('puts the App Store badge, a QR code for desktop readers and the requirement on the iPhone and iPad band', function (): void {
    downloadFakeRelease();
    $document = downloadDocument();
    $qr = $document->querySelector('#ios [data-device] svg');

    expect($document->querySelector('#ios a[href="https://apps.apple.com/app/tablepro/id6761621829"] img'))->not->toBeNull()
        ->and($qr)->not->toBeNull()
        ->and($qr?->parentElement?->getAttribute('data-device'))->toBe('mac linux other')
        ->and($qr?->querySelector('path')?->getAttribute('d'))->toStartWith('M4 4h7v1h-7z')
        ->and(downloadText($document->getElementById('ios')))->toContain('Free. Requires iOS and iPadOS 18 or later.')
        ->and($document->querySelector('#ios a[href="/ios"]'))->not->toBeNull();
})->group('ssr');

it('lands every link into /download on an id of the page', function (): void {
    downloadReleaseLinux();
    downloadFakeRelease();
    $document = downloadDocument();
    $ids = array_map(fn(Dom\Element $element): string => (string) $element->getAttribute('id'), iterator_to_array($document->querySelectorAll('[id]')));
    $fragments = [];

    foreach ([resource_path('js'), resource_path('data'), resource_path('blog'), resource_path('views'), app_path()] as $directory) {
        foreach (File::allFiles($directory) as $file) {
            preg_match_all('#/download\#([A-Za-z][\w-]*)#', $file->getContents(), $matches);

            foreach ($matches[1] as $fragment) {
                $fragments[$fragment][] = str_replace(base_path() . '/', '', $file->getPathname());
            }
        }
    }

    foreach ($document->querySelectorAll('main a[href^="#"]') as $link) {
        $fragments[substr((string) $link->getAttribute('href'), 1)][] = '/download itself';
    }

    // Security's "Download and updates" in every locale, the FAQ's and /databases' Linux links, the hero's Linux button.
    foreach (['updates', 'linux'] as $known) {
        expect(isset($fragments[$known]))->toBeTrue("nothing links /download#{$known} any more; drop it from this list");
    }

    foreach (['mac', 'linux', 'ios', 'updates', 'release-notes', 'older-versions', 'other-platforms', ...array_keys($fragments)] as $fragment) {
        expect(in_array($fragment, $ids, true))->toBeTrue("/download#{$fragment} lands nowhere (" . implode(', ', array_unique($fragments[$fragment] ?? ['kept id'])) . ')');
    }
})->group('ssr');
