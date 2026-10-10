<?php

use App\Services\GitHub\StarCount;
use Illuminate\Console\Scheduling\Event;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\withoutVite;

const STARS_FAKE_REPO = 'api.github.com/repos/TableProApp/TablePro';

beforeEach(function (): void {
    Storage::fake(StarCount::DISK);
    withoutVite();
});

it('stores the stargazer count from the repository and reads it back', function (): void {
    Http::fake([STARS_FAKE_REPO => Http::response(['stargazers_count' => 6224, 'subscribers_count' => 17])]);

    expect(app(StarCount::class)->refresh())->toBe(6224)
        ->and(app(StarCount::class)->current())->toBe(6224);

    Http::assertSent(fn($request): bool => $request->url() === 'https://' . STARS_FAKE_REPO
        && $request->hasHeader('Accept', 'application/vnd.github+json'));
});

it('keeps the last stored count when GitHub fails or answers nonsense', function (Closure $fake): void {
    Storage::disk(StarCount::DISK)->put(StarCount::FILE, '6100');
    $fake();

    expect(app(StarCount::class)->refresh())->toBeNull()
        ->and(app(StarCount::class)->current())->toBe(6100);
})->with([
    'rate limited' => [fn() => Http::fake([STARS_FAKE_REPO => Http::response(['message' => 'API rate limit exceeded'], 403)])],
    'server error' => [fn() => Http::fake([STARS_FAKE_REPO => Http::response('', 502)])],
    'no count' => [fn() => Http::fake([STARS_FAKE_REPO => Http::response(['id' => 1])])],
    'not a number' => [fn() => Http::fake([STARS_FAKE_REPO => Http::response(['stargazers_count' => '6224'])])],
    'negative' => [fn() => Http::fake([STARS_FAKE_REPO => Http::response(['stargazers_count' => -1])])],
    'no connection' => [fn() => Http::fake(fn() => throw new ConnectionException('timed out'))],
]);

it('has no count before the first refresh, or when the stored copy is unreadable', function (?string $stored): void {
    if ($stored !== null) {
        Storage::disk(StarCount::DISK)->put(StarCount::FILE, $stored);
    }

    expect(app(StarCount::class)->current())->toBeNull();
})->with([
    'nothing stored' => [null],
    'truncated' => ['{"'],
    'a string' => ['"6224"'],
]);

it('shares the stored count with every page once, and never calls GitHub during a request', function (): void {
    Http::fake([STARS_FAKE_REPO => Http::response(['stargazers_count' => 9999])]);
    Storage::disk(StarCount::DISK)->put(StarCount::FILE, '6224');

    $home = $this->get('/')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page->where('github.stars', 6224));
    $this->get('/vi/pricing')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page->where('github.stars', 6224));

    $version = json_decode(html_entity_decode((string) preg_replace('/.*<script data-page="app" type="application\/json">(.*?)<\/script>.*/s', '$1', (string) $home->getContent())), true)['version'] ?? '';

    $visit = $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (string) $version,
        'X-Requested-With' => 'XMLHttpRequest',
        'X-Inertia-Except-Once-Props' => 'github',
    ])->get('/blog')->assertOk()->json();

    expect($visit['props'])->not->toHaveKey('github');

    Http::assertNotSent(fn($request): bool => str_contains($request->url(), 'api.github.com'));
});

it('shares a null count until the first refresh', function (): void {
    Http::fake([STARS_FAKE_REPO => Http::response(['stargazers_count' => 9999])]);

    $this->get('/')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page->where('github.stars', null));

    Http::assertNotSent(fn($request): bool => str_contains($request->url(), 'api.github.com'));
});

it('refreshes the count every hour', function (): void {
    $events = collect(app(Schedule::class)->events())
        ->filter(fn(Event $event): bool => str_contains((string) $event->command, 'stars:refresh'));

    expect($events)->toHaveCount(1)
        ->and($events->first()->expression)->toBe('0 * * * *');
});

it('reports what the refresh found, and fails when GitHub did not answer', function (): void {
    Http::fake([STARS_FAKE_REPO => Http::sequence()->push(['stargazers_count' => 6224])->push('', 502)]);

    $this->artisan('stars:refresh')->expectsOutputToContain('6224 stars.')->assertSuccessful();
    $this->artisan('stars:refresh')->expectsOutputToContain('GitHub did not answer')->assertFailed();

    expect(app(StarCount::class)->current())->toBe(6224);
});
