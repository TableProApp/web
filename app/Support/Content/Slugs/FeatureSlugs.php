<?php

namespace App\Support\Content\Slugs;

/**
 * The slugs `/features/{slug}` answers for: the seven feature pages of the
 * sitemap (§A.2), in the Features menu's order (§B.1).
 *
 * A slug renders only in the locales where
 * `resources/data/content/{locale}/features/{slug}.json` exists; the registry
 * decides that, not the route. `Localization/LocaleRoutingTest` pins this
 * list to the content files, and `Features/FeatureContentTest` checks each
 * file against the schema in `resources/js/components/features/README.md`.
 */
final class FeatureSlugs
{
    /**
     * @var list<string>
     */
    public const ALL = [
        'querying',
        'data-editing',
        'schema',
        'import-export',
        'ai-mcp',
        'connections',
        'sync-and-teams',
    ];
}
