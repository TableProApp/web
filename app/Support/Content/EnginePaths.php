<?php

namespace App\Support\Content;

use App\Support\Content\Slugs\DatabaseSlugs;

/**
 * Where the site describes an engine, as one rule for every page that links
 * one (resources/data/engines.json → `page`, `slug`, `parent`, `anchor`):
 *
 * - `own`: its own page, `/{slug}`, when that slug is a routed database page;
 * - `section`: its section on its family's page, `/{parent slug}#{anchor}`,
 *   when the parent has such a page;
 * - `hub`: its row on the hub, `/databases#{anchor}`.
 *
 * Anything else is null, and the caller shows the name without a link. The
 * rule was written five times (the homepage, the database pages, the iOS
 * engine lists, the feature pages and the docs redirects), and the copies
 * disagreed: a section engine whose parent had no page linked to `/#anchor`
 * on one page, to the hub on another and nowhere on a third. Locale-neutral;
 * the page adds the reader's locale.
 */
final class EnginePaths
{
    private const TOKEN = '/^[a-z0-9-]+$/';

    /**
     * @param  array<string, mixed>  $engine
     * @param  array<string, array<string, mixed>>  $byId  the engines a parent may be looked up in, keyed by id
     */
    public static function pathFor(array $engine, array $byId): ?string
    {
        return match ($engine['page'] ?? null) {
            'own' => self::ownPage($engine),
            'section' => self::section($engine, $byId),
            'hub' => ($anchor = self::anchor($engine)) !== null ? '/databases#' . $anchor : null,
            default => null,
        };
    }

    /**
     * Every engine in a decoded engines.json, keyed by id.
     *
     * @param  array<int|string, mixed>  $engines
     * @return array<string, array<string, mixed>>
     */
    public static function byId(array $engines): array
    {
        $byId = [];

        foreach ($engines as $engine) {
            if (is_array($engine) && is_string($engine['id'] ?? null)) {
                $byId[$engine['id']] = $engine;
            }
        }

        return $byId;
    }

    /**
     * @param  array<string, mixed>  $engine
     */
    private static function ownPage(array $engine): ?string
    {
        $slug = $engine['slug'] ?? null;

        if (($engine['page'] ?? null) !== 'own' || ! is_string($slug) || ! in_array($slug, DatabaseSlugs::ALL, true)) {
            return null;
        }

        return '/' . $slug;
    }

    /**
     * @param  array<string, mixed>  $engine
     * @param  array<string, array<string, mixed>>  $byId
     */
    private static function section(array $engine, array $byId): ?string
    {
        $anchor = self::anchor($engine);
        $parentId = $engine['parent'] ?? null;
        $parent = is_string($parentId) && isset($byId[$parentId]) ? self::ownPage($byId[$parentId]) : null;

        return $anchor !== null && $parent !== null ? $parent . '#' . $anchor : null;
    }

    /**
     * @param  array<string, mixed>  $engine
     */
    private static function anchor(array $engine): ?string
    {
        $anchor = $engine['anchor'] ?? null;

        return is_string($anchor) && preg_match(self::TOKEN, $anchor) === 1 ? $anchor : null;
    }
}
