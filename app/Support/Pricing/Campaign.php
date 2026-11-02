<?php

namespace App\Support\Pricing;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\File;

/**
 * The dated sale in pricing.json's `campaign`, such as Black Friday: a real
 * percentage off some of Pro's cycles, through a provider discount code that
 * works only between `startsAt` and `endsAt`.
 *
 * Its phase is a function of the clock alone. `upcoming` before the start,
 * `live` from the start until the end, `ended` from the end on, the same
 * half-open window the provider applies to the code. Only the campaign's own
 * page shows anything before or after it; while it is live the banner, the
 * homepage and Pricing carry it, and checkout from the site attaches the code.
 *
 * Pages sit in Cloudflare's cache, so a copy rendered before a boundary must
 * not be served after it: `secondsUntilChange()` lets `CacheHtmlAtEdge` keep
 * every copy's lifetime short of the next one. The reader's browser checks
 * the end again (the head script and `useCampaign`), for a tab left open
 * across it.
 *
 * The values are synced by hand with the provider's discount, like every price
 * in pricing.json (`tests/Feature/Data/PricingDataTest.php`).
 */
final class Campaign
{
    public const UPCOMING = 'upcoming';

    public const LIVE = 'live';

    public const ENDED = 'ended';

    private function __construct(
        public readonly string $id,
        public readonly CarbonImmutable $startsAt,
        public readonly CarbonImmutable $endsAt,
        public readonly CarbonImmutable $listPriceSince,
    ) {}

    /**
     * The campaign in resources/data/pricing.json, or null when it names none.
     * Read once per request: the root template, the shared props and the
     * cache header all ask.
     */
    public static function current(): ?self
    {
        return once(static function (): ?self {
            $pricing = File::json(resource_path('data/pricing.json'), JSON_THROW_ON_ERROR);
            $campaign = $pricing['campaign'] ?? null;

            if (! is_array($campaign)) {
                return null;
            }

            return new self(
                id: (string) $campaign['id'],
                startsAt: CarbonImmutable::parse((string) $campaign['startsAt'])->utc(),
                endsAt: CarbonImmutable::parse((string) $campaign['endsAt'])->utc(),
                listPriceSince: CarbonImmutable::parse((string) $campaign['listPriceSince'], 'UTC'),
            );
        });
    }

    /**
     * @return self::UPCOMING|self::LIVE|self::ENDED
     */
    public function phase(?CarbonInterface $now = null): string
    {
        $now ??= CarbonImmutable::now();

        return match (true) {
            $now->lt($this->startsAt) => self::UPCOMING,
            $now->lt($this->endsAt) => self::LIVE,
            default => self::ENDED,
        };
    }

    public function isLive(?CarbonInterface $now = null): bool
    {
        return $this->phase($now) === self::LIVE;
    }

    /**
     * Whole seconds until the phase next changes, rounded down, or null once
     * it has ended and will not change again.
     */
    public function secondsUntilChange(?CarbonInterface $now = null): ?int
    {
        $now ??= CarbonImmutable::now();

        $next = match ($this->phase($now)) {
            self::UPCOMING => $this->startsAt,
            self::LIVE => $this->endsAt,
            default => null,
        };

        return $next === null ? null : max(0, (int) floor($now->diffInSeconds($next, false)));
    }

    /**
     * The shared `campaign` prop: the phase this page was rendered in, and the
     * window's dates as the page's language writes them. The code, percentage
     * and cycles are pricing.json's, which the bundle imports itself.
     *
     * Dates are formatted here, in UTC, so the server render and the browser
     * agree; the window is stated in UTC on every page because it ends at the
     * same instant for everyone. `listPriceSince` is when the struck prices
     * took effect, which the sale's page states beside them: a reference price
     * is only honest with its date.
     *
     * @return array{phase: string, startsOn: string, startsAtTime: string, endsOn: string, endsAtTime: string, listPriceSince: string}
     */
    public function props(string $locale, ?CarbonInterface $now = null): array
    {
        return [
            'phase' => $this->phase($now),
            'startsOn' => $this->startsAt->locale($locale)->isoFormat('LL'),
            'startsAtTime' => $this->startsAt->locale($locale)->isoFormat('LT'),
            'endsOn' => $this->endsAt->locale($locale)->isoFormat('LL'),
            'endsAtTime' => $this->endsAt->locale($locale)->isoFormat('LT'),
            'listPriceSince' => $this->listPriceSince->locale($locale)->isoFormat('LL'),
        ];
    }
}
