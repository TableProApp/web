<?php

namespace App\Support\Content\Slugs;

/**
 * The slugs `/compare/{slug}` answers for, such as `tableplus`.
 *
 * A PHP constant for the same deploy-safety reason as `DatabaseSlugs`. Phase A
 * holds the pre-rebuild list, `azimutt` included, so every existing comparison
 * keeps rendering. The comparisons agent owns this file from phase C, removes
 * `azimutt` (it becomes a 410 in `resources/data/redirects.json`) and pins the
 * list against `resources/data/content/{en,vi}/compare/*.json`.
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
        'sequel-pro',
        'postico',
        'sequel-ace',
        'heidisql',
        'azimutt',
        'phpmyadmin',
    ];
}
