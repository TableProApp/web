# Database pages: content schema

`/databases` (the hub, `pages/Databases/Index.tsx`) and the engine pages (`/mysql-client`, `/redis-gui`, …,
`pages/Databases/Show.tsx`) use the feature-page system (`components/features/README.md`): the same hero, bands,
"Also" list and closing. Facts come from data, copy from content, and this folder joins them. Never type a fact the
data holds.

| File | Holds |
|---|---|
| `resources/data/engines.json` | Every engine: page placement, category, driver delivery, query language, capabilities, version floor, limits, iPhone and iPad status |
| `resources/data/{platforms,facts,paid-features}.json` | Device names, docs and issue URLs, file formats, backup tools, paid feature tiers |
| `resources/data/content/{locale}/engines.json` | Each engine's `tagline` (the hub row) and one sentence per limit id |
| `resources/data/content/{locale}/databases/index.json` | The hub's copy, plus `labels`: the words every engine page shares |
| `resources/data/content/{locale}/databases/{slug}.json` | One engine page's copy |

`tests/Feature/Pages/DatabasesTest.php` checks the shape, tokens, tags, links, slots and every inbound anchor.

## What an engine page renders, in order

1. Hero: the "Databases / {breadcrumb}" trail, the engine's mark when `engines.json` has an `icon`, H1, lead,
   Download and the setup guide. Beside it, "At a glance" from data: query language, driver (and the engines that
   share it), how you connect, default port, minimum version ("enforced" where the app refuses older servers, "None"
   where the docs say there is none), the built-in engine version. No platform rows. Below, the engine's whole Mac
   window (`header.asset`), settling in once.
2. Two to four `bands`, `<section id>` each, in this order: `connect`, `work`, `schema`, `operate`. Only what is
   specific to this engine; no window.
3. One line from `labels.common`, linking `/features`: what every engine gets lives there.
4. One band per family member (`family`), id from `engines.json` `anchor`: the copy, then a card with its default
   port, minimum version and limits, from data, and its setup guide when it has its own.
5. `#more` ("Also"), in this order: `#move-data`; `#iphone`, only where the engine opens there (a status sentence
   from data, then `iphone`); `#limits` from `engines.json` `limits[]`; one item per `faq` entry, under its `id`;
   `#other-tools` when `otherTools` is set.
6. `#get-started`: the paid sentence, derived from the `{xxxTier}` tokens the copy uses ("Pro adds Compare & Sync.
   Everything else on this page is free."), Download and See pricing.

## Engine page file

Keys in this order, in every locale. `engine`, `header.asset`, band ids, `also`, family `engine`, FAQ ids and
`otherTools.also` are locale-neutral.

```jsonc
{
  "seo": { "title": "PostgreSQL client for {devices}", "description": "…" },   // {devices} or {macDevices}, from data
  "og": { "kicker": "Databases", "title": "PostgreSQL client" },             // the OG card; changing it means new cards
  "engine": "postgresql",
  "breadcrumb": "PostgreSQL",
  "header": { "title": "PostgreSQL client", "lead": "One sentence.", "asset": "databases-postgresql" },
  "links": { "explain": "/features/querying#explain", "pgadmin": "/compare/pgadmin" },
  "bands": [ { "id": "schema", "also": ["operate"], "title": "…", "text": ["…"], "notes": ["…"] } ],
  "family": [ { "engine": "cockroachdb", "title": "CockroachDB", "text": ["2 or 3 sentences"] } ],
  "moveData": ["…"],
  "iphone": ["…"],                                   // [] where the engine does not open on iPhone and iPad
  "faq": [ { "id": "hosted", "question": "…", "answer": "…" } ],
  "otherTools": { "text": "One sentence linking /compare pages.", "also": ["compass"] }   // or null
}
```

- `header.asset` is the `window-whole` slot `databases-{engine id}` in `resources/data/assets.json`, placed on
  `/{slug}` at `top`. A slot without its files renders nothing in production, so the hero shows no window.
- A band absorbs a thin neighbour through `also` (`schema` with `also: ["operate"]`), so its id still lands.
- `family`: one entry per engine whose `page` is `section` and whose `parent` is this engine, in `engines.json` order.
  Today: `/mysql-client` (mariadb, tidb, oceanbase, databend), `/postgresql-client` (cockroachdb, pglite),
  `/cassandra-client` (scylladb), `/turso-client` (libsql). Their anchors are 301 targets.
- `otherTools.also`: `/mongodb-client` keeps `compass`, the target of the 301 from `/blog/mongodb-native-vs-compass`.
- `iphone` is positive: what the app does with this engine. What it does not do is a limit in `engines.json`.

## The hub

The area nav (All databases and one `#id` per band), the hero, then one band per entry of
`DatabaseController::GROUPS`: its title from `groups`, its engines as a ruled list (name linked to its page, family
section or, for an engine with no page, its setup guide; query language; tagline). Categories of one or two engines
share a band (`nosql`); each old category id (`#document`, `#key-value`, `#wide-column`, `#streaming`,
`#coordination`) lands on its first engine. Hub-only engines keep their row ids (`#spanner`, `#sap-hana`, …). Then
"Also": `#drivers`, `#linux` (once Linux is released), `#iphone`, `#missing`; and `closing.body`.

## Inline markup and tokens

- `<ui>`, `<code>`, and `<name>…</name>` where `name` is a key of `links`: a site path, a same-page `#fragment` or a
  `docs:/path`. Never a full URL. Every key of `links` is used; tags do not nest.
- `{name}`, `{dumpTool}` (an engine with a backup tool), `{importFormats}` (one that imports), `{exportFormats}`,
  `{engineVersion}` (one that embeds its engine), and `{compareSyncTier}`, `{icloudSyncTier}`, … (a paid feature's
  plan, linked to /pricing, and named in the closing sentence). A family band's tokens are its own engine's.

## Writing rules

- Every sentence traces to the app at its current release or the engine's docs. Unverified means left out.
- A page says what is specific to its engine, in about 500 words, plus two or three sentences per family member.
  Generic features (autocomplete, staged edits, SSH tunnels in general) belong to the feature pages.
- Category rules (sitemap §E.2): Kafka is a log, Redis is keys and commands, Elasticsearch is a request console.
- No platform line, no "On Mac", and never that Linux lacks a paid feature. Name engines; never type a count, a port,
  a version or a format the data holds. No hype, no em dashes. Plan, feature and mode names stay English.
- Other languages follow `docs/rebuild/design/positioning.md` §11; Vietnamese is NFC.

## Checks

```bash
php artisan test --compact --filter='DatabasesTest|EnginesDataTest|TranslationsTest|AssetManifestTest'
npm run typecheck
npm run test:js
```
