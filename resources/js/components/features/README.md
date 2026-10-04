# Feature pages: content schema

`/features/{slug}` and `/vi/features/{slug}` are one template (`pages/Features/Show.tsx`) filled from
`resources/data/content/{en,vi}/features/{slug}.json`. This file is the contract for whoever writes those files.
`tests/Feature/Features/FeatureContentTest.php` enforces it; run it after every edit.

Sources of truth, in order: `docs/rebuild/design/sitemap.md` §A.2 (sections, ids, slots) and §E.4 (blueprint),
`positioning.md` §11 (glossary) and §12 (banned claims), and the TablePro app repository at the `v0.77.0` tag for
every fact. Describe Mac **0.77.0** and iPhone and iPad **App Store 1.0 (build 22)** only: nothing that exists only
at iOS HEAD or on an unmerged branch.

The hub's one-paragraph summary of each page is in `index.json` → `areas.items`. Update it when a page changes what
it covers.

## What the template renders, in order

1. Breadcrumbs (Features / the menu label), the H1 and lead, a secondary Download for Mac button, "Read the docs ↗",
   a badge per platform the page covers (derived from `availability`), and one line naming the page's paid features
   with their plans (derived from every `paid` id on the page). You type none of this.
2. One `<section id>` per entry of `sections`, in order, each with its H2.
3. `#availability`: "Where it works", built from `availability`, then the `limits` as a note (`#limits`).
4. `#docs` and `#related`: your `docs` and `related` links.
5. `#get-started`: the download band (shared).

Do not use the template's ids (`availability`, `limits`, `docs`, `related`, `get-started`) for a section.

## File shape

Top-level keys, **in this order**: `seo`, `og`, `header`, `sections`, `availability`, `limits`, `docs`, `related`.

```jsonc
{
  "seo": { "title": "…", "description": "…" },    // <title> gets " – TablePro" appended; no {tokens} here
  "og": { "kicker": "Querying", "title": "…" },    // OG card: kicker = the Features menu label, title = the H1
  "header": {
    "title": "…",                                  // H1 from sitemap §A.2
    "lead": "…",                                   // two sentences: who it is for, when they use it
    "docs": "/features/sql-editor"                 // docs.tablepro.app path for "Read the docs"
  },
  "sections": [ /* Section, see below */ ],
  "availability": [ /* Row, see below */ ],
  "limits": ["…"],                                 // limits that change a decision; may be []
  "docs": [{ "label": "SQL editor", "docs": "/features/sql-editor" }],
  "related": [{ "label": "Data editing", "href": "/features/data-editing" }]
}
```

### Section and block

```jsonc
{
  "id": "performance",              // required on a section; fixed by the sitemap (see below); lowercase English
  "title": "…",                     // H2 (H3 for a block)
  "paragraphs": ["…"],              // 2–4 sentences in all; [] when the section only holds blocks
  "points": ["…"],                  // optional short list
  "paid": ["query-insights"],       // optional: paid-features.json ids this block describes; shows "{name}: {tier} plan"
  "since": "0.77.0",                // optional: shows a "0.77" label while Homebrew still serves an older build
  "asset": "mac-query-insights",    // optional: one assets.json slot id (see Slots)
  "engines": [{ "label": "Plan as text", "list": "explainText" }],   // optional linked engine lists
  "links": [{ "label": "Querying on iPhone and iPad", "href": "/ios#query" }],
  "blocks": [ /* blocks: same keys minus "blocks"; "id" optional */ ]
}
```

A section holding two things worth a picture each uses `blocks` (H3s), each with its own slot: `#performance` on
querying holds EXPLAIN Compare and Query Insights. Every section needs text or blocks.

### Where it works (`availability`)

```jsonc
{ "label": "Query Insights", "paid": "query-insights", "ios": "no" }
{ "label": "Query history", "ios": "partial", "iosNote": "The last {historyEntriesIos} queries on the device" }
{ "label": "Copy or share results", "ios": "yes" }
{ "label": "Live Activities", "mac": "no", "ios": "yes" }      // "mac" defaults to "yes"
```

The Mac column shows the plan from `paid` (or "Free"); the iPhone and iPad column shows "Free" for `yes`, a dash for
`no`, and `iosNote` for `partial` (`iosNote` is required exactly when `ios` is `partial`). The iPhone and iPad app
gates nothing, so it has no plan column. Device names come from `platforms.json`.

### Links

Exactly one of `href` (a page on this site: root-relative, English form, it is localized for you) or `docs` (a
docs.tablepro.app path; on Vietnamese pages the label gets "(tiếng Anh)" and `hreflang="en"` automatically). Never an
`https://` URL: external URLs live only in data files (`FactsDataTest`). `docs` entries take `docs`, `related`
entries take `href`. Pick docs destinations from docs.tablepro.app's own page list (`docs/` in the TablePro app
repository), and only pages that describe released behaviour.

## Section ids the sitemap fixes

A page may add sections (querying adds `open-quickly`), never drop or rename these. Other pages, redirects and the
pricing table link to them.

| Page | Fixed section ids |
|---|---|
| querying | editor, history, performance, results, other-languages, iphone |
| data-editing | browse, edit, safe-mode, data-rewind, documents-and-keys, iphone |
| schema | structure, er-diagram, compare-sync, copy, administer, iphone |
| import-export | import, export, data-files, backup, files, iphone |
| ai-mcp | assistant, agent-mode, **mcp** (target of the 301 from `/blog/mcp-database-claude`), outside-servers, automation, privacy |
| connections | organize, import, network, cloud-auth, credentials, policies, iphone |
| sync-and-teams | icloud-sync, handoff, share, linked-folders, team, seats |

For a page with no iPhone or iPad scope (ai-mcp), add a short `iphone` section that says so plainly.

## Paid features

Every paid feature whose `paid-features.json` → `page.path` is your page must be in the `paid` list of the section
named by its `page.anchor` (or of a block inside that section), and in an `availability` row's `paid`. That is how
its plan is printed where it is described; never type "Starter" or "Team" into a sentence to mark a feature's plan.
Write "free" only next to what is free ("The Map view is free."). Never "unlock" / "mở khóa": a plan *adds* features.

| Anchor | Paid ids |
|---|---|
| querying `#performance`, `#results` | `query-insights`, `result-charts` |
| data-editing `#data-rewind` | `data-rewind` |
| schema `#compare-sync` | `compare-sync` |
| sync-and-teams `#icloud-sync`, `#linked-folders`, `#share`, `#team` | `icloud-sync`, `linked-folders`, `encrypted-export`, `team-catalog` and `team-library` |
| connections `#credentials` | `environment-variables` |

## Facts: `{tokens}` and engine lists

No number, count, level list or engine list is typed into copy. A string names a fact with `{token}`; the server
computes it (`App\Support\Features\FeatureFacts`) and the page writes it in the reader's locale (numbers with the
locale's separators, lists joined with "and" / "và"). A token nothing computes fails the test. Need a new one? Add
it to `FeatureFacts` and, if the fact is not in a data file yet, to `facts.json` with its evidence.

**Numbers** (`facts.json` → `limits`, or a list length): `rowCap`, `rowCapMax`, `countEstimate`, `chartPoints`,
`chartSeries`, `chartInspectedRows`, `historyEntries`, `historyDays` (Mac), `historyEntriesIos`, `resultBufferIos`,
`rewindDays`, `rewindMaxValue` (MB), `explainNoise` (%), `filterOperatorCount`, `filterOperatorCountIos`, and
`licenseCheckDays` (`pricing.json` → `license.revalidateDays`).

**Single values**: `macSafeModeDefault`, `iosSafeModeDefault`, `mcpHost`, `mcpPort`.

**Name lists**: `macSafeModeLevels`, `iosSafeModeLevels`, `aiProviders`, `mcpSetupClients` (the in-app setup sheet),
`mcpBridgeClients` (the stdio bridge), `connectionImportApps`, `importFormats`, `exportFormats` (built in, every
engine), `exportPluginFormats`, `backupTools`.

**Engine lists** (published engines from `engines.json`, each linked to its page, family section or `/databases`
row): `explainDiagram`, `explainText`, `explainCost`, `explainNoneSql`, `otherLanguages` (detail: query language),
`everyStatementWrites` (Safe Mode counts every statement as a write), `alwaysReadOnly`, `schemaReadOnly`,
`schemaPartial`, `dashboard`, `usersRoles`, `noImport`, `noSsh` (network engines without SSH), `awsIam`,
`cloudSqlProxy`, `backupEngines` (detail: dump tool), `serverSideExport`, `iosPicker` (the iPhone and iPad picker, in
its order), `iosSyncedOnly` (opens on iPhone only when synced from a Mac).

In a sentence an engine list reads as plain names (`On {everyStatementWrites}, …`). To show it as linked rows, put it
in a block's `engines`: `{ "label": "Plan as text", "list": "explainText" }`. Rows that come back empty are hidden.

## Inline markup

`<code>…</code>` for literals (`:customer_id`, `.sql`, a command), `<kbd>…</kbd>` for shortcuts with the app's glyphs
(`⌘⇧P`), `<ui>…</ui>` for an app label or menu command. Tags do not nest. Nothing else is markup: links go in
`links`, never inside a sentence.

## Slots

- Only ids that exist in `resources/data/assets.json`, and only in the section the manifest's `usedOn` gives that
  id for your page (`{ "path": "/features/{slug}", "section": "…" }`). The test checks both.
- At most one per section or block. A `detail` crop renders beside the text from 1024px; a `window`, `diagram` or
  `illustration` runs full width below it. Never place a `-mobile` crop: its window's slot renders it.
- Place every slot the sitemap gives your page (`AssetManifestTest` fails for the whole `features` family until every
  one of its slots is placed somewhere).
- A new id or a changed description is a manifest edit plus its brief in `docs/rebuild/assets/features.md` (same
  headings as `_template.md`, one `## id` per slot your page places; `assets:handoff` reads one file per family);
  then run `php artisan assets:handoff`.

## Vietnamese

- A real translation, not a gloss: "bạn", positioning §11's glossary, developer terms in English (query, schema,
  connection, table, export…), "dòng/cột", "khóa chính/khóa ngoại", "nhóm" for a team, "license" for the commercial
  key, never "giấy phép" except the AGPLv3. Spelling: khóa, xóa, hóa, tùy, hủy. NFC.
- Same keys, same array lengths, same section and block ids, same `asset` ids and the same `{tokens}` as English
  (`ContentParityTest`). Feature, tier, mode and engine names stay English.
- Click paths show the Vietnamese app label first: **Cài đặt > Tích hợp** (Settings > Integrations).

## Writing rules (sitemap §E.4, positioning §12)

- Tailor the page to its real workflow; no paragraph that could sit on another page; no filler.
- Every claim traces to the app or its docs at the `v0.77.0` tag. State limits honestly, in `limits` when they change
  a decision.
- No hype (powerful, seamless, instant, blazing…), no universals (every database, cross-platform…), no performance or
  size numbers, no "nothing leaves your Mac", no typed counts.

## Checks

```bash
./vendor/bin/pest --compact tests/Feature/Features
./vendor/bin/pest --compact --filter='ContentParityTest|PaidFeaturesDataTest|LocaleRoutingTest|AssetManifestTest'
npm run typecheck
npm run test:js
```
