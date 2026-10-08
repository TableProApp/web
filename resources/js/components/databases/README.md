# Database pages: content schema and how to add an engine page

`/databases` (the hub) and the engine pages (`/mysql-client`, `/redis-gui`, …) are built from three kinds of files.
Facts come from data, copy from content, and the template in this folder joins them. Never type a fact the data
already holds.

| File | Holds |
|---|---|
| `resources/data/engines.json` | Every engine: page placement, category, driver delivery, query language, capabilities, version floor, limits, iPhone and iPad status |
| `resources/data/{platforms,facts,comparisons,paid-features}.json` | Device names and requirements; docs and issue URLs, file formats, backup tools; other tools' dated facts; paid feature tiers (read only here) |
| `resources/data/content/{en,vi}/engines.json` | Each engine's `tagline` and one sentence per limit id, keyed by engine id |
| `resources/data/content/{en,vi}/databases/index.json` | The hub's copy, plus `labels`: the shared words every engine page uses |
| `resources/data/content/{en,vi}/databases/{slug}.json` | One engine page's copy |

`tests/Feature/Databases/DatabasePagesTest.php` validates every page file against the schema below, and
`Localization/ContentParityTest` holds `vi` to the same keys, `{tokens}` and asset ids as `en`.

## What a page contributor writes

Exactly these files, and nothing else:

1. `resources/data/content/en/databases/{slug}.json` and `resources/data/content/vi/databases/{slug}.json` for each
   slug you write. The slug must already be in `App\Support\Content\Slugs\DatabaseSlugs::ALL` and be the `slug` of a
   `page: "own"` engine in `engines.json`.
2. `docs/rebuild/assets/databases.md`: one section per `databases`-family slot your pages use (the lead slot, and a
   window slot's `-mobile` crop too, such as `mac-db-redis-keys-mobile`), in the format of
   `docs/rebuild/assets/_template.md`, added after the existing sections. `assets:handoff` reads one file per family,
   so a section in any other file is reported. A new or changed slot is a manifest edit plus its brief; then run
   `php artisan assets:handoff`.

A page does not edit the template (`pages/Databases/*`, `components/databases/*`), the controller,
`DatabaseSlugs.php`, the hub file or any test. If a fact you need is missing from data, or a limit sentence is wrong,
change the data file (`engines.json`, `content/*/engines.json`) in its own commit, with evidence. The tagline and the
limit sentences of every engine already exist in `content/{en,vi}/engines.json` and render automatically.

## Page file schema

Every key below is required, in this order, in both languages (use `[]` or `null` where a part is absent). Keys
marked "id" are locale-neutral and identical in `en` and `vi`.

```jsonc
{
  "seo": { "title": "Redis GUI", "description": "≤ 170 characters, no {tokens}" },
  "og": { "kicker": "Databases", "title": "Redis GUI" },          // the generated OG card's text; no {tokens}
  "engine": "redis",                                             // id: the engines.json id whose slug is this file
  "breadcrumb": "Redis",                                         // the last breadcrumb and the page's name in JSON-LD
  "header": {
    "title": "Redis GUI for {devices}",                          // must hold {devices}: the device list comes from data
    "lead": "One or two sentences on the job this engine does."
  },
  "asset": "mac-db-redis-keys",                                  // id: the lead slot, from assets.json (sitemap §A.3)
  "links": { "editing": "/features/data-editing#documents-and-keys", "docsCli": "docs:/databases/redis" },
  "sections": [
    { "id": "connect", "title": "Connect", "paragraphs": ["…"], "points": ["…"], "asset": "…" }
  ],
  "family": [ { "engine": "scylladb", "title": "ScyllaDB", "paragraphs": ["…"], "points": ["…"] } ],
  "otherTools": { "items": [ { "product": "redis-insight", "text": "…", "notes": ["redis-insight-copilot"] } ],
                  "notes": { "redis-insight-copilot": "…" } },  // or null
  "faq": [ { "id": "pubsub", "question": "…", "answer": "…" } ], // 0 to 4
  "related": [ { "label": "Browse and edit data safely", "href": "/features/data-editing" } ]
}
```

**`sections`** (sitemap §E.1 blocks 3-8). Ids come from this list and render in this order; leave out what does not
apply and name each one for the engine's real workflow:

| id | Block | Notes |
|---|---|---|
| `connect` | Connect | Required. Connection modes, auth, TLS, SSH or an explicit "no SSH", cloud sign-in, URL schemes |
| `work` | Work with the data | Required. The query surface by name (SQL, Redis commands, Query DSL, KafkaQL…), the editing model, the engine's own UI |
| `schema` | Schema | Editable, partly editable or read-only |
| `operate` | Operate | Dashboard, Users & Roles, maintenance, backup, where they exist |
| `move-data` | Move data | Import and export |
| `iphone` | iPhone and iPad | Only for an engine the iPhone and iPad app opens (`ios.inPicker` or `ios.openable`). The template prints the status sentence from data first; your paragraphs add what is true there in App Store 1.0 |

`points` (a list) and `asset` (one slot per section, at most) are optional. A section slot must list this page in
its `usedOn` in `assets.json`.

**Blocks the template renders from data, with no copy of yours:** the facts card (query language, driver and the
engines that share it, how to connect, default port, minimum version, marked where the app enforces it and "None"
where the docs say there is none, the embedded engine version, iPhone and iPad status), the availability line, the line under it that says TablePro is free to use and open source, the
actions (Download for Mac, the App Store badge only when the engine is in the iPhone and iPad picker, the setup
guide), the iPhone and iPad status sentence, the Limits list (`engines.json` `limits[]` with the sentences in
`content/*/engines.json`), each family section's facts line, limits and setup guide, the dated facts of every other
tool, the docs links under Related, and the download band with its link to pricing. Do not repeat any of these in
prose.

**`family`** (block 10). Only on a page with merged engines: one entry per engine whose `page` is `section` and whose
`parent` is this page's engine, all of them, in `engines.json` order. Its anchor (`#scylladb`, `#libsql`) comes from
the data, because the 301 from the old page lands on it. Today: `/mysql-client` (mariadb, tidb, oceanbase,
databend), `/postgresql-client` (cockroachdb, pglite), `/cassandra-client` (scylladb), `/turso-client` (libsql).

**`otherTools`** (block 11). Each `product` is an id in `comparisons.json`. Write one fair paragraph of strengths:
what the tool is and when to choose it. Never type its version, date, price, licence or platforms; the template
prints them from data with the check date and sources. A tool with a comparison page gets the link automatically,
and the block ends with the other comparisons whose product connects to this engine (`cells.databases.engines` in
`comparisons.json`).
For a tool with no comparison page, every note id in its `cells` needs a sentence in `notes`, listed in that item's
`notes`. An optional `anchor` gives the tool's block an id that a link or redirect aims at: `/mongodb-client` sets
`"anchor": "compass"` on its MongoDB Compass item, because `/blog/mongodb-native-vs-compass` redirects to
`/mongodb-client#compass`. A tool with no entry in `comparisons.json` (for example MySQL Workbench) cannot be named.

**`faq`** (block 12, optional): two to four questions specific to this engine, visible on the page only (no FAQPage
markup). Ids are kebab-case, so `/{slug}#{id}` links work in both languages.

**`related`** (block 13): site pages only (`/features/…`, `/compare/…`, another engine page). Docs links are added
from data.

### Inline markup and tokens

Every string in `header.lead`, `sections`, `family`, `otherTools`, `faq` and `notes` may use:

- `<ui>Label</ui>` for an app control's name, `<code>text</code>` for a literal (a command, a URL scheme, a
  statement).
- `<name>text</name>` where `name` is a key of the page's `links` (camelCase letters and digits). A value is a site
  path (`/features/connections#network`), a same-page fragment (`#mariadb`) or a docs path (`docs:/databases/redis`).
  Never a full URL: external URLs live only in data files (`Data/FactsDataTest`).
- These `{tokens}`, filled from data: `{name}` (the engine's name), `{dumpTool}` (only if the engine has a backup
  tool), `{importFormats}` (only if it imports), `{exportFormats}`, `{engineVersion}` (only if it embeds its engine,
  such as SQLite or DuckDB), and `{compareSyncTier}`, `{queryInsightsTier}`, … (the plan name of a paid feature:
  the feature id in camelCase plus `Tier`). The template links each plan name to `/pricing`, so `plan` is not
  available as a link name. `{devices}` is for `header.title` only. A family section's tokens are its own engine's.

Tags do not nest. A number that belongs to the product (a cap, a count) belongs in data, not in copy.

## Writing rules

- **Facts:** every sentence must be supported by the TablePro app at the current release (Mac 0.77.0; iPhone and iPad
  App Store 1.0 build 22, never iOS HEAD-only behaviour): its code or the engine's docs page at the `v0.77.0` tag
  (`git show v0.77.0:docs/databases/{docsSlug}.mdx` in the TablePro app repository). When docs and code disagree,
  the code at the tag wins. Unverified means left out.
- **Category** (sitemap §E.2): a SQL editor narrative only for SQL engines. Kafka is a log, not a table; Redis is keys
  and commands; Elasticsearch is a request console. State what is not supported plainly.
- **No two pages share a paragraph.** Name engines and features; never type a count of engines, drivers, features,
  tools, providers or plugins. No hype words, no "every database", no "unlock", no unscoped "free", no performance
  or size numbers, no "Mac App Store" or "Setapp" (positioning §12).
- **Vietnamese** is written, not glossed: "bạn", developer terms in English (query, schema, connection, table,
  index, export…), "khóa chính" and "khóa ngoại", "dòng" and "cột", "chỉ đọc", tone marks on the first vowel
  (khóa, xóa, tùy, hủy). An app label appears in Vietnamese first with the English in parentheses, as the app shows
  it, for example "Tệp từ xa (Remote File)". Feature names stay English (Preview SQL, Users & Roles, Copy To,
  Compare & Sync). Text is NFC. The forbidden variants are in `tests/Support/vi-forbidden-variants.php`.

## Checks

```bash
php artisan test --compact --filter='DatabasePagesTest|EnginesDataTest|ContentParityTest|AssetManifestTest'
npm run typecheck
```
