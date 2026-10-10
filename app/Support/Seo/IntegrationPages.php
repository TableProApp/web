<?php

namespace App\Support\Seo;

use App\Support\Content\IntegrationCatalog;
use App\Support\Localization\Locales;

final class IntegrationPages implements PageFamily
{
    public const ROUTE = 'landing.integrations.show';

    public function __construct(
        private readonly IntegrationCatalog $catalog,
    ) {}

    /**
     * @return list<PageEntry>
     */
    public function entries(): array
    {
        $entries = [];

        foreach ($this->catalog->all() as $integration) {
            $entry = $this->find(self::ROUTE, ['slug' => $integration['slug']]);

            if ($entry !== null) {
                $entries[] = $entry;
            }
        }

        return $entries;
    }

    /**
     * @param  array<string, string>  $params
     */
    public function find(string $route, array $params): ?PageEntry
    {
        $slug = $params['slug'] ?? null;

        if ($route !== self::ROUTE || ! is_string($slug) || count($params) !== 1 || ! BlogPosts::isSlug($slug)) {
            return null;
        }

        $integration = $this->catalog->find($slug);

        if ($integration === null) {
            return null;
        }

        $locale = Locales::default();

        return new PageEntry(
            route: self::ROUTE,
            params: ['slug' => $slug],
            renderLocales: [$locale],
            indexableLocales: ($integration['status']['state'] ?? null) === 'active' ? [$locale] : [],
            sources: ['resources/data/integrations.json', "resources/data/content/{$locale}/integrations/index.json"],
            ogFamily: 'integration',
            ogSlug: null,
        );
    }
}
