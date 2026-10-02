<?php

namespace App\Support\Content\Slugs;

/**
 * The slugs `/compare/{slug}` answers for, such as `tableplus`.
 *
 * A PHP constant for the same deploy-safety reason as `DatabaseSlugs`: the
 * route cache only rebuilds on a PHP change, so a slug that existed only as a
 * content file would ship without a route.
 *
 * The list is the sitemap's ten comparisons (§A.4) in the order of
 * `resources/data/comparisons.json`. `azimutt` is gone: `/compare/azimutt`
 * answers 410 from `resources/data/redirects.json` (sitemap §C.4).
 * `Data/ComparisonsDataTest` pins this list to the products with a slug and to
 * `resources/data/content/{en,vi}/compare/*.json`.
 */
final class CompareSlugs
{
    /**
     * @var list<string>
     */
    public const ALL = [
        'tableplus',
        'dbeaver',
        'datagrip',
        'navicat',
        'beekeeper-studio',
        'sequel-ace',
        'sequel-pro',
        'postico',
        'heidisql',
        'phpmyadmin',
    ];
}
