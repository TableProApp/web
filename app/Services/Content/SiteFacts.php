<?php

namespace App\Services\Content;

use App\Support\Content\EnginePaths;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\File;

/**
 * The product facts the FAQ, the iPhone and iPad page and the legal pages
 * state, read from `resources/data` on the server.
 *
 * Each of those pages sends the values it states as props, so the page bundle
 * never imports `engines.json` for a handful of names, and no number, name or
 * outbound URL is typed into a content file: the content holds `{token}`
 * slots and symbolic link references, and these values fill them.
 *
 * Every reader degrades rather than throws. A missing or malformed file gives
 * an empty list or null, and the file's own `Data` test is what keeps it
 * valid.
 */
class SiteFacts
{
    /**
     * Decoded files, per instance.
     *
     * @var array<string, array<array-key, mixed>>
     */
    private array $files = [];

    public function __construct(
        private readonly ?string $directory = null,
    ) {}

    /**
     * Outbound links from `facts.json` → `links` and `support`, plus the
     * billing portal from `pricing.json`. Each value is an HTTPS URL or null;
     * `email` is a bare address or null.
     *
     * @return array{docs: string|null, changelog: string|null, github: string|null, issues: string|null, discussions: string|null, sponsorsProgram: string|null, license: string|null, appStore: string|null, portal: string|null, email: string|null}
     */
    public function links(): array
    {
        $facts = $this->json('facts.json');
        $links = is_array($facts['links'] ?? null) ? $facts['links'] : [];
        $email = $facts['support']['email'] ?? null;

        return [
            'docs' => $this->url($links['docs'] ?? null),
            'changelog' => $this->url($links['changelog'] ?? null),
            'github' => $this->url($links['github'] ?? null),
            'issues' => $this->url($links['issues'] ?? null),
            'discussions' => $this->url($links['discussions'] ?? null),
            'sponsorsProgram' => $this->url($links['sponsorsProgram'] ?? null),
            'license' => $this->url($links['license'] ?? null),
            'appStore' => $this->url($links['appStore'] ?? null),
            'portal' => $this->url($this->json('pricing.json')['billingPortalUrl'] ?? null),
            'email' => is_string($email) && filter_var($email, FILTER_VALIDATE_EMAIL) !== false ? $email : null,
        ];
    }

    /**
     * Who makes and publishes TablePro, from `facts.json` → `publisher`, with
     * the city and country as the locale writes them. Null without a name.
     *
     * @return array{name: string, city: string|null, country: string|null, countryCode: string|null}|null
     */
    public function publisher(string $locale): ?array
    {
        $publisher = $this->json('facts.json')['publisher'] ?? null;

        if (! is_array($publisher) || ! is_string($publisher['name'] ?? null) || trim($publisher['name']) === '') {
            return null;
        }

        $city = $publisher['city'][$locale] ?? null;
        $country = $publisher['country'][$locale] ?? null;
        $code = $publisher['countryCode'] ?? null;

        return [
            'name' => $publisher['name'],
            'city' => is_string($city) ? $city : null,
            'country' => is_string($country) ? $country : null,
            'countryCode' => is_string($code) && preg_match('/^[A-Z]{2}$/', $code) === 1 ? $code : null,
        ];
    }

    /**
     * The day the source repository was created, from `facts.json` →
     * `openSource.repositoryCreatedAt`, or null.
     */
    public function repositoryCreatedAt(): ?CarbonImmutable
    {
        $date = $this->json('facts.json')['openSource']['repositoryCreatedAt'] ?? null;

        if (! is_string($date) || preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) !== 1) {
            return null;
        }

        return CarbonImmutable::createFromFormat('!Y-m-d', $date) ?: null;
    }

    /**
     * The organization's own profiles for `sameAs`, in the order
     * `organizationProfiles()` in lib/structured-data.ts uses.
     *
     * @return list<string>
     */
    public function organizationProfiles(): array
    {
        $links = $this->json('facts.json')['links'] ?? [];
        $profiles = [];

        foreach (['github', 'x', 'discord', 'telegram'] as $key) {
            $url = is_array($links) ? $this->url($links[$key] ?? null) : null;

            if ($url !== null) {
                $profiles[] = $url;
            }
        }

        return $profiles;
    }

    /**
     * The featured, published engines' names, in data order.
     *
     * @return list<string>
     */
    public function featuredEngineNames(): array
    {
        $names = [];

        foreach ($this->engines() as $engine) {
            if (($engine['featured'] ?? false) === true && ($engine['state'] ?? null) === 'published' && is_string($engine['name'] ?? null)) {
                $names[] = $engine['name'];
            }
        }

        return $names;
    }

    /**
     * The published engines whose driver comes inside the Mac app
     * (`engines.json` → `distribution: bundled`), in data order. Every other
     * driver downloads the first time its engine is picked.
     *
     * @return list<string>
     */
    public function bundledEngineNames(): array
    {
        $names = [];

        foreach ($this->engines() as $engine) {
            if (($engine['distribution'] ?? null) === 'bundled' && ($engine['state'] ?? null) === 'published' && is_string($engine['name'] ?? null)) {
                $names[] = $engine['name'];
            }
        }

        return $names;
    }

    /**
     * The engines the iPhone and iPad app works with: those its connection
     * picker offers, in the picker's order (`platforms.json` → `iosEngines`),
     * and those it opens only when the connection arrives from a Mac.
     *
     * Each carries the path of the page that describes it, when that page is a
     * route this site serves, so a link never points at a page that is not
     * there.
     *
     * @param  list<string>  $pickerOrder
     * @return array{picker: list<array{id: string, name: string, href: string|null}>, syncedOnly: list<array{id: string, name: string, href: string|null}>}
     */
    public function iosEngines(array $pickerOrder): array
    {
        $byId = [];

        foreach ($this->engines() as $engine) {
            if (is_string($engine['id'] ?? null)) {
                $byId[$engine['id']] = $engine;
            }
        }

        $picker = [];

        foreach ($pickerOrder as $id) {
            if (isset($byId[$id]) && ($byId[$id]['ios']['inPicker'] ?? false) === true) {
                $picker[] = $this->engineLink($byId[$id], $byId);
            }
        }

        $syncedOnly = [];

        foreach ($byId as $engine) {
            $ios = $engine['ios'] ?? [];

            if (($engine['state'] ?? null) === 'published' && ($ios['openable'] ?? false) === true && ($ios['inPicker'] ?? true) === false) {
                $syncedOnly[] = $this->engineLink($engine, $byId);
            }
        }

        return ['picker' => $picker, 'syncedOnly' => $syncedOnly];
    }

    /**
     * The apps TablePro imports connections from, by name, in data order.
     *
     * @return list<string>
     */
    public function connectionImportApps(): array
    {
        $apps = [];

        foreach ($this->json('facts.json')['connectionImport'] ?? [] as $entry) {
            if (is_array($entry) && is_string($entry['app'] ?? null)) {
                $apps[] = $entry['app'];
            }
        }

        return $apps;
    }

    /**
     * The AI providers that run on the Mac itself, by name.
     *
     * @return list<string>
     */
    public function localAiProviders(): array
    {
        $providers = $this->json('facts.json')['ai']['providers'] ?? [];

        return array_values(array_filter(
            is_array($providers) ? $providers : [],
            static fn(mixed $name): bool => in_array($name, ['Ollama', 'llama.cpp', 'MLX'], true),
        ));
    }

    /**
     * The paid features' names per tier, in data order.
     *
     * @return array{starter: list<string>, team: list<string>}
     */
    public function paidFeatureNames(): array
    {
        $names = ['starter' => [], 'team' => []];

        foreach ($this->json('paid-features.json') as $feature) {
            $tier = is_array($feature) ? ($feature['tier'] ?? null) : null;

            if (($tier === 'starter' || $tier === 'team') && is_string($feature['name'] ?? null)) {
                $names[$tier][] = $feature['name'];
            }
        }

        return $names;
    }

    /**
     * The commercial numbers the FAQ and the legal pages state, from
     * `pricing.json`. A value the file does not hold is null.
     *
     * @return array{merchant: string|null, currency: string|null, refundDays: int|null, revalidateDays: int|null, graceDays: int|null, starterActivations: int|null, teamMinSeats: int|null, teamMaxSeats: int|null, supportBusinessDays: int|null}
     */
    public function commerce(): array
    {
        $pricing = $this->json('pricing.json');

        return [
            'merchant' => is_string($pricing['merchantOfRecord']['name'] ?? null) ? $pricing['merchantOfRecord']['name'] : null,
            'currency' => is_string($pricing['currency'] ?? null) ? $pricing['currency'] : null,
            'refundDays' => $this->int($pricing['refund']['days'] ?? null),
            'revalidateDays' => $this->int($pricing['license']['revalidateDays'] ?? null),
            'graceDays' => $this->int($pricing['license']['offlineGraceDays'] ?? null),
            'starterActivations' => $this->int($pricing['tiers']['starter']['activations'] ?? null),
            'teamMinSeats' => $this->int($pricing['tiers']['team']['seats']['min'] ?? null),
            'teamMaxSeats' => $this->int($pricing['tiers']['team']['seats']['max'] ?? null),
            'supportBusinessDays' => $this->int($pricing['tiers']['team']['prioritySupport']['responseBusinessDays'] ?? null),
        ];
    }

    /**
     * A numeric limit from `facts.json` → `limits`, or null.
     */
    public function limit(string $id): ?int
    {
        return $this->int($this->json('facts.json')['limits'][$id]['value'] ?? null);
    }

    /**
     * The names of the iPhone and iPad app's Safe Mode levels, in order.
     *
     * @return list<string>
     */
    public function iosSafeModeLevels(): array
    {
        $levels = $this->json('facts.json')['safeMode']['ios']['levels'] ?? [];
        $names = [];

        foreach (is_array($levels) ? $levels : [] as $level) {
            if (is_array($level) && is_string($level['name'] ?? null)) {
                $names[] = $level['name'];
            }
        }

        return $names;
    }

    /**
     * @param  array<string, mixed>  $engine
     * @param  array<string, array<string, mixed>>  $byId
     * @return array{id: string, name: string, href: string|null}
     */
    private function engineLink(array $engine, array $byId): array
    {
        return [
            'id' => (string) $engine['id'],
            'name' => (string) ($engine['name'] ?? $engine['id']),
            'href' => EnginePaths::pathFor($engine, $byId),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function engines(): array
    {
        return array_values(array_filter($this->json('engines.json'), 'is_array'));
    }

    /**
     * A file in `resources/data`, decoded, or an empty array.
     *
     * @return array<array-key, mixed>
     */
    private function json(string $file): array
    {
        if (array_key_exists($file, $this->files)) {
            return $this->files[$file];
        }

        $path = ($this->directory ?? resource_path('data')) . '/' . $file;
        $decoded = File::isFile($path) ? json_decode((string) File::get($path), true) : null;

        return $this->files[$file] = is_array($decoded) ? $decoded : [];
    }

    private function url(mixed $value): ?string
    {
        return is_string($value) && str_starts_with($value, 'https://') ? $value : null;
    }

    private function int(mixed $value): ?int
    {
        return is_int($value) ? $value : null;
    }
}
