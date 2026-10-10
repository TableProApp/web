<?php

namespace App\Http\Controllers;

use App\Support\Content\ContentRepository;
use App\Support\Content\IntegrationCatalog;
use App\Support\Localization\Locales;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

/**
 * @phpstan-type Icon array{src: string, width: int, height: int}
 * @phpstan-type Summary array{slug: string, name: string, publisher: string, tier: string, categories: list<string>, platforms: list<string>, closedSource: bool, tagline: string, keywords: list<string>, icon: Icon|null}
 * @phpstan-type Filters array{q: string|null, category: string|null, platform: string|null, tier: string|null}
 */
class IntegrationController extends Controller
{
    private const array TIERS = ['official', 'partner', 'community'];

    // The registry names the OS a TablePro app runs on; the site names the app.
    private const array PLATFORMS = ['macos' => 'mac', 'ios' => 'ios', 'ipados' => 'ios'];

    private const array NETWORK = ['none', 'local', 'internet'];

    private const array PAYMENT = ['free', 'optional', 'paid'];

    private const int QUERY_LENGTH = 100;

    private const string IMAGES = '/images/integrations/';

    public function index(Request $request, ContentRepository $content, IntegrationCatalog $catalog): Response
    {
        $locale = App::getLocale();
        $page = $content->page('integrations/index', $locale);
        $listed = $this->listed($catalog, $page, $content, $locale);

        return Inertia::render('Integrations/Index', [
            'content' => Arr::except($page, ['taglines', 'show']),
            'integrations' => $listed,
            'filters' => $this->filters($request, $listed),
        ]);
    }

    public function show(ContentRepository $content, IntegrationCatalog $catalog, string $slug): Response
    {
        $integration = $catalog->find($slug);

        abort_if($integration === null, 404);

        $locale = App::getLocale();
        $page = $content->page('integrations/index', $locale);

        return Inertia::render('Integrations/Show', [
            'content' => Arr::only($page, ['labels', 'show']),
            'integration' => $this->detail($integration, $page, $catalog),
            'dates' => [
                'added' => $this->date($integration['addedAt'], $locale),
                'verified' => $this->date($integration['lastVerifiedAt'], $locale),
                'archived' => $this->date($integration['status']['since'] ?? null, $locale),
            ],
        ]);
    }

    /**
     * @param  array<string, mixed>  $page
     * @return list<Summary>
     */
    private function listed(IntegrationCatalog $catalog, array $page, ContentRepository $content, string $locale): array
    {
        $default = $locale === Locales::default();
        $taglines = $this->taglines($page);
        $sources = $default ? [] : $this->taglines($content->page('integrations/index', Locales::default()));
        $categories = $this->labelled($page, 'labels.categories');
        $listed = [];

        foreach ($catalog->all() as $integration) {
            $slug = $integration['slug'];

            if (($integration['status']['state'] ?? null) !== 'active') {
                continue;
            }

            // Another language lists an entry only while its tagline there was translated from the current summary.
            if ($default) {
                $tagline = $integration['summary'];
            } elseif (($sources[$slug] ?? null) === $integration['summary'] && isset($taglines[$slug])) {
                $tagline = $taglines[$slug];
            } else {
                continue;
            }

            $listed[] = [
                'slug' => $slug,
                'name' => $integration['name'],
                'publisher' => $integration['publisher']['name'],
                'tier' => $this->tier($integration),
                'categories' => $this->known($integration['categories'], $categories),
                'platforms' => $this->platforms($integration['platforms']),
                'closedSource' => $integration['closedSource'] === true,
                'tagline' => $tagline,
                'keywords' => array_values(array_filter($integration['keywords'] ?? [], 'is_string')),
                'icon' => $this->image($integration['icon']['128'] ?? null),
            ];
        }

        $rank = array_flip(self::TIERS);

        usort($listed, fn(array $a, array $b): int => [$rank[$a['tier']], strtolower($a['name'])] <=> [$rank[$b['tier']], strtolower($b['name'])]);

        return $listed;
    }

    /**
     * @param  array<string, mixed>  $page
     * @return array<string, string>
     */
    private function taglines(array $page): array
    {
        $taglines = is_array($page['taglines'] ?? null) ? $page['taglines'] : [];

        return array_filter($taglines, fn(mixed $tagline): bool => is_string($tagline) && trim($tagline) !== '');
    }

    /**
     * @param  list<Summary>  $listed
     * @return Filters
     */
    private function filters(Request $request, array $listed): array
    {
        $value = function (string $key, string $field) use ($request, $listed): ?string {
            $value = $request->query($key);
            $present = array_merge(...array_map(fn(array $entry): array => (array) $entry[$field], $listed));

            return is_string($value) && in_array($value, $present, true) ? $value : null;
        };

        $q = $request->query('q');
        $q = is_string($q) ? trim(mb_substr(trim($q), 0, self::QUERY_LENGTH)) : '';

        return [
            'q' => $q !== '' ? $q : null,
            'category' => $value('category', 'categories'),
            'platform' => $value('platform', 'platforms'),
            'tier' => $value('tier', 'tier'),
        ];
    }

    /**
     * @param  array<string, mixed>  $integration
     * @param  array<string, mixed>  $page
     * @return array<string, mixed>
     */
    private function detail(array $integration, array $page, IntegrationCatalog $catalog): array
    {
        $status = $integration['status'];
        $disclosures = $integration['disclosures'];
        $install = $integration['install'];
        $host = $integration['host'] ?? null;
        $versions = $integration['minTableProVersion'] ?? [];
        $replacement = is_string($status['replacement'] ?? null) ? $catalog->find($status['replacement']) : null;
        $type = in_array($install['type'], $this->labelled($page, 'show.install'), true) ? $install['type'] : 'page';
        $data = $this->labelled($page, 'show.uses.data');

        return [
            'slug' => $integration['slug'],
            'name' => $integration['name'],
            'summary' => $integration['summary'],
            'description' => array_values(array_filter(array_map('trim', preg_split('/\n\s*\n/', $integration['description']) ?: []))),
            'tier' => $this->tier($integration),
            'archived' => $status['state'] !== 'active' ? [
                'reason' => in_array($status['reason'] ?? null, $this->labelled($page, 'show.archived.reasons'), true) ? $status['reason'] : null,
                'note' => $this->text($status['note'] ?? null),
                'replacement' => $replacement !== null ? ['slug' => $replacement['slug'], 'name' => $replacement['name']] : null,
            ] : null,
            'publisher' => ['name' => $integration['publisher']['name'], 'url' => $this->https($integration['publisher']['url'] ?? null)],
            'categories' => $this->known($integration['categories'], $this->labelled($page, 'labels.categories')),
            'platforms' => $this->platforms($integration['platforms']),
            'versions' => [
                'mac' => $this->text($versions['macos'] ?? null),
                'ios' => $this->text($versions['ios'] ?? $versions['ipados'] ?? null),
            ],
            'host' => is_array($host) ? [
                'name' => $host['name'],
                'url' => $this->https($host['url'] ?? null),
                'minVersion' => $this->text($host['minVersion'] ?? null),
                'note' => $this->text($host['note'] ?? null),
            ] : null,
            'closedSource' => $integration['closedSource'] === true,
            'license' => $this->text($integration['license'] ?? null),
            'source' => $this->https($integration['source']['url'] ?? null),
            'install' => [
                'type' => $type,
                'url' => $this->https($install['url']),
                'command' => $type === 'homebrew' ? $this->brew($install) : null,
            ],
            'surfaces' => $this->known($integration['surfaces'], $this->labelled($page, 'show.uses.surface')),
            'reads' => $this->known($disclosures['reads'] ?? [], $data),
            'writes' => $this->known($disclosures['writes'] ?? [], $data),
            'accessNote' => $this->text($disclosures['accessNote'] ?? null),
            'lowersSafeMode' => ($disclosures['lowersSafeMode'] ?? false) === true,
            'safeModeNote' => $this->text($disclosures['safeModeNote'] ?? null),
            'network' => in_array($disclosures['network'] ?? null, self::NETWORK, true) ? $disclosures['network'] : null,
            'networkNote' => $this->text($disclosures['networkNote'] ?? null),
            'account' => ($disclosures['account'] ?? false) === true,
            'payment' => in_array($disclosures['payment'] ?? null, self::PAYMENT, true) ? $disclosures['payment'] : null,
            'paymentNote' => $this->text($disclosures['paymentNote'] ?? null),
            'links' => [
                'docs' => $this->https($integration['links']['docs'] ?? null),
                'issues' => $this->https($integration['links']['issues'] ?? $integration['links']['support'] ?? null),
                'privacy' => $this->https($integration['links']['privacy'] ?? null),
            ],
            'icon' => $this->image($integration['icon']['128'] ?? null),
            'screenshots' => $this->screenshots($integration['screenshots']),
        ];
    }

    /**
     * @param  list<mixed>  $screenshots
     * @return list<array{src: string, width: int, height: int, alt: string}>
     */
    private function screenshots(array $screenshots): array
    {
        $shots = [];

        foreach ($screenshots as $shot) {
            $image = $this->image($shot);

            if ($image !== null && is_string($shot['alt'] ?? null)) {
                $shots[] = [...$image, 'alt' => $shot['alt']];
            }
        }

        return $shots;
    }

    /**
     * @param  array<string, mixed>  $integration
     */
    private function tier(array $integration): string
    {
        // An unknown tier gets the most cautious treatment: the disclaimer and rel="ugc nofollow".
        return in_array($integration['tier'], self::TIERS, true) ? $integration['tier'] : 'community';
    }

    /**
     * @param  list<mixed>  $platforms
     * @return list<string>
     */
    private function platforms(array $platforms): array
    {
        $apps = array_map(fn(mixed $platform): ?string => is_string($platform) ? (self::PLATFORMS[$platform] ?? null) : null, $platforms);

        return array_values(array_intersect(array_unique(self::PLATFORMS), $apps));
    }

    /**
     * @param  array<string, mixed>  $page
     * @return list<string>
     */
    private function labelled(array $page, string $key): array
    {
        // A value the registry adds later stays off the page until the content file labels it.
        $labels = Arr::get($page, $key);

        return is_array($labels) ? array_map('strval', array_keys($labels)) : [];
    }

    /**
     * @param  list<mixed>  $values
     * @param  list<string>  $known
     * @return list<string>
     */
    private function known(array $values, array $known): array
    {
        return array_values(array_intersect($known, $values));
    }

    /**
     * @return Icon|null
     */
    private function image(mixed $image): ?array
    {
        if (! is_array($image) || ! is_string($image['file'] ?? null) || preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{12}\.png$/', $image['file']) !== 1) {
            return null;
        }

        return ['src' => self::IMAGES . $image['file'], 'width' => (int) $image['width'], 'height' => (int) $image['height']];
    }

    /**
     * @param  array<string, mixed>  $install
     */
    private function brew(array $install): ?string
    {
        $token = $install['token'] ?? null;

        if (! is_string($token) || preg_match('/^[a-z0-9][a-z0-9@+._-]{0,99}$/', $token) !== 1) {
            return null;
        }

        return ($install['kind'] ?? null) === 'cask' ? "brew install --cask {$token}" : "brew install {$token}";
    }

    private function https(mixed $url): ?string
    {
        if (! is_string($url) || ! str_starts_with($url, 'https://') || filter_var($url, FILTER_VALIDATE_URL) === false) {
            return null;
        }

        return parse_url($url, PHP_URL_USER) === null ? $url : null;
    }

    private function text(mixed $value): ?string
    {
        return is_string($value) && trim($value) !== '' ? $value : null;
    }

    private function date(mixed $value, string $locale): ?string
    {
        if (! is_string($value) || preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) !== 1) {
            return null;
        }

        try {
            $date = Carbon::createFromFormat('!Y-m-d', $value);
        } catch (InvalidArgumentException) {
            return null;
        }

        return $date !== null && $date->format('Y-m-d') === $value ? $date->locale($locale)->isoFormat('LL') : null;
    }
}
