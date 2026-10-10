<?php

namespace App\Support\Content;

use Illuminate\Support\Facades\File;
use UnexpectedValueException;

/**
 * @phpstan-type Image array{file: string, width: int, height: int, sha256: string}
 * @phpstan-type Screenshot array{file: string, width: int, height: int, sha256: string, alt: string}
 * @phpstan-type Integration array{
 *     slug: string,
 *     name: string,
 *     summary: string,
 *     summarySha256: string,
 *     description: string,
 *     tier: string,
 *     status: array{state: string, since?: string, reason?: string, replacement?: string, note?: string, link?: string},
 *     publisher: array{name: string, github: string, githubId: int, url?: string},
 *     source: array{type: string, url?: string},
 *     closedSource: bool,
 *     license: string|null,
 *     install: array{type: string, url: string},
 *     host?: array{name: string, url?: string, minVersion?: string, note?: string},
 *     minTableProVersion?: array<string, string>,
 *     platforms: list<string>,
 *     categories: list<string>,
 *     surfaces: list<string>,
 *     disclosures: array<string, mixed>,
 *     links: array<string, string>,
 *     icon: array{512: Image, 128: Image},
 *     screenshots: list<Screenshot>,
 *     keywords?: list<string>,
 *     addedAt: string,
 *     lastVerifiedAt: string,
 * }
 */
final class IntegrationCatalog
{
    public const int SCHEMA_VERSION = 1;

    /**
     * @var array<string, Integration>|null
     */
    private ?array $integrations = null;

    public function __construct(
        private readonly string $path,
    ) {}

    /**
     * @return list<Integration>
     */
    public function all(): array
    {
        return array_values($this->integrations());
    }

    /**
     * @return Integration|null
     */
    public function find(string $slug): ?array
    {
        return $this->integrations()[$slug] ?? null;
    }

    /**
     * @return array<string, Integration>
     */
    private function integrations(): array
    {
        if ($this->integrations !== null) {
            return $this->integrations;
        }

        $data = File::json($this->path, JSON_THROW_ON_ERROR);

        if (! is_array($data) || ($data['schemaVersion'] ?? null) !== self::SCHEMA_VERSION || ! is_array($data['integrations'] ?? null) || ! array_is_list($data['integrations'])) {
            throw new UnexpectedValueException("{$this->path} is not a v" . self::SCHEMA_VERSION . ' integrations index.');
        }

        $integrations = [];

        foreach ($data['integrations'] as $integration) {
            $slug = $integration['slug'] ?? null;

            if (! is_string($slug) || isset($integrations[$slug])) {
                throw new UnexpectedValueException("{$this->path} has a missing or repeated slug.");
            }

            $integrations[$slug] = $integration;
        }

        return $this->integrations = $integrations;
    }
}
