import gridData from '../../data/database-grid.json';

/**
 * Every engine-count claim on the site, derived from one dataset.
 *
 * The figure was written out as "25" in eight places — the hero, the grid
 * headline and its lede, the spec strip, the licence block, an FAQ answer, the
 * JSON-LD publisher blurb and two fields on Home.tsx — plus roughly thirty more
 * across `comparisons.json`. Three of those were stale in a way nobody could
 * see from the source: the app had reached 28 registered types while the site
 * still said 25 and the docs said 27.
 *
 * The trap in the old copy was that "25" was not arbitrary. It counted distinct
 * `driverGroup` values in `database-grid.json`, which is a *driver* count, while
 * the headline above it promised *databases*. Two different quantities wearing
 * the same number, so raising one silently broke the other.
 *
 * These derive from the grid instead. The grid is what a reader can actually
 * count on the page, so a claim that disagrees with it is a claim the page
 * disproves two rows down. `EngineCountTest` pins the derived value, so adding
 * a tile is a deliberate change to the marketing copy rather than a side effect.
 */
interface DatabaseTile {
    distribution: 'builtin' | 'plugin';
}

const tiles = gridData as DatabaseTile[];

/**
 * Engines a connection can be opened against — the app's registered type ids,
 * one grid tile each.
 *
 * Turso was the open question and is now counted. It had its own `DatabaseType`
 * and its own `/turso-client` page but no snapshot, resolving through
 * `reverseTypeIndex["Turso"] = "libSQL"`, so it shared a `libSQL / Turso` tile
 * and the app returned 28. It now follows the ScyllaDB precedent — an alias that
 * also carries an entry of its own — so libSQL and Turso are two tiles over one
 * driver, exactly as Cassandra and ScyllaDB are.
 */
export const ENGINE_COUNT: number = tiles.length;

/** Drivers compiled into the app, ready on first launch. */
export const BUNDLED_ENGINE_COUNT: number = tiles.filter((tile) => tile.distribution === 'builtin').length;

/** The rest, fetched and signature-verified the first time one is picked. */
export const ON_DEMAND_ENGINE_COUNT: number = ENGINE_COUNT - BUNDLED_ENGINE_COUNT;

/**
 * Driver plugin targets in the app repository, which is fewer than the engines
 * they serve: PostgreSQL also drives Redshift, CockroachDB and PGlite, Cassandra
 * drives ScyllaDB, and libSQL drives Turso.
 *
 * Nothing in this repository can derive this — it is a count of build targets in
 * an application this site cannot see — so it is a literal, and the only one.
 */
export const DRIVER_PLUGIN_COUNT = 23;
