# Feature pages: content schema

`/features/{slug}` is one template (`pages/Features/Show.tsx`) filled from
`resources/data/content/{locale}/features/{slug}.json`; `/features` is `pages/Features/Index.tsx` with `index.json`.
`tests/Feature/Pages/FeaturesTest.php` checks ids, links, facts, slots and every inbound anchor.

Every fact must trace to the app or its docs at a released tag. Do not describe unmerged or HEAD-only behaviour.

## What a page renders, in order

1. The area nav: All features and the seven areas, current one underlined. It replaces the breadcrumb.
2. The hero: H1, lead, Download, the docs link (`header.docs`), and the area's Mac window (`header.asset`), which
   settles in once on load.
3. Three to five `bands`, one `<section id>` each: the name in the left quarter with a Pro or Team pill when it
   describes a paid feature, the text, the notes, engine lines, the docs link and other links, then the whole window
   (`asset`). A band the hero window already shows has no `asset`.
4. `#more` ("Also"): the smaller features as plain text in two columns, each item keeping its id.
5. `#get-started`: one sentence on what is paid, derived ("Pro adds Query Insights and Result Charts. Everything else
   on this page is free."), Download and See pricing.

Bands and the list rise into place as they scroll in, like Home; reduced motion turns it off.

## File shape

Top-level keys, in this order: `seo`, `og`, `header`, `bands`, `more`.

```jsonc
{
  "seo": { "title": "…", "description": "…" },     // <title> gets " – TablePro"; no {tokens}
  "og": { "kicker": "Querying", "title": "SQL editor" },   // og.title = header.title; changing it means new OG cards
  "header": {
    "title": "SQL editor",
    "lead": "…",                                    // one sentence, about 20 words
    "docs": "/features/sql-editor",                 // docs.tablepro.app path
    "asset": "mac-home-querying"                    // the hero window
  },
  "bands": [
    {
      "id": "explain",                              // fixed by the sitemap, see below
      "also": ["performance"],                      // ids of old sections and blocks that now land here
      "title": "EXPLAIN and EXPLAIN Compare",
      "text": ["…"],                                // 40 to 70 words in all
      "paid": ["query-insights"],                   // paid-features.json ids; shows the plan pill
      "notes": ["…"],                               // a platform difference or a limit that changes a decision
      "engines": [{ "label": "Plans as a diagram:", "list": "explainDiagram" }],
      "docs": "/features/explain-visualization",
      "links": [{ "label": "…", "href": "/…" }],
      "asset": "features-querying-explain"          // a window-whole slot
    }
  ],
  "more": [ /* the same keys, no asset */ ]
}
```

- No line lists the platforms a part runs on: a bare "On Mac." under a paid feature reads as "not on Linux" (owner,
  2026-11-08). Where a platform differs in a way a reader needs, say so in `notes`, as what that platform has.
  Never write that Linux lacks a paid feature.
- An engine label carries its own colon ("Plans as a diagram:", French "… :" with a no-break space).
- Write "free" only next to what is free ("Map view is free."). Never type a plan into a sentence to mark a feature's
  plan; the pill and the closing sentence do that. Never "unlock" / "mở khóa": a plan adds features.

## Ids

A page may add ids, never drop or rename these. Other pages, redirects, blog topics (`PostTopics`) and
`paid-features.json` link to them. An id that moved into another part goes in that part's `also`.

| Page | Fixed ids |
|---|---|
| querying | editor, history, performance, results, other-languages, iphone, explain, map |
| data-editing | browse, edit, safe-mode, data-rewind, documents-and-keys, iphone, filters, foreign-keys |
| schema | structure, er-diagram, compare-sync, copy, administer, iphone, objects, table-folders, server-dashboard |
| import-export | import, export, data-files, backup, files, iphone |
| ai-mcp | assistant, agent-mode, **mcp** (target of the 301 from `/blog/mcp-database-claude`), outside-servers, automation, privacy |
| connections | organize, import, network, cloud-auth, credentials, policies, iphone, project-folder, ssh |
| sync-and-teams | icloud-sync, handoff, share, linked-folders, team, seats |

`paid-features.json` `page.anchor` names the band or item that describes each paid feature, and that part carries
the id in `paid`.

## Facts: `{tokens}` and engine lists

No number, count, level list or engine list is typed into copy. A string names a fact with `{token}`; the server
computes it (`App\Support\Features\FeatureFacts`) and the page writes it in the reader's locale. A token nothing
computes fails the test. A new one goes into `FeatureFacts`, and into `facts.json` with its evidence if no data file
holds it yet.

- **Numbers**: `rowCap`, `rowCapMax`, `countEstimate`, `chartPoints`, `chartSeries`, `chartInspectedRows`,
  `historyEntries`, `historyDays`, `historyEntriesIos`, `resultBufferIos`, `rewindDays`, `rewindMaxValue` (MB),
  `explainNoise` (%), `filterOperatorCount`, `filterOperatorCountIos`, `deviceLimit`, `mcpToolCountLinux`.
- **Single values**: `macSafeModeDefault`, `iosSafeModeDefault`, `mcpHost`, `mcpPort`.
- **Name lists**: `macSafeModeLevels`, `iosSafeModeLevels`, `linuxSafeModeLevels`, `aiProviders`,
  `aiProvidersLinux`, `mcpSetupClients`, `mcpBridgeClients`, `connectionImportApps`, `importFormats`,
  `exportFormats`, `exportPluginFormats`, `backupTools`.
- **Engine lists** (published engines, each linked to its page): `explainDiagram`, `explainText`, `explainCost`,
  `explainNoneSql`, `otherLanguages`, `everyStatementWrites`, `alwaysReadOnly`, `schemaReadOnly`, `schemaPartial`,
  `dashboard`, `usersRoles`, `noImport`, `noSsh`, `awsIam`, `cloudSqlProxy`, `backupEngines`, `serverSideExport`,
  `iosPicker`, `iosSyncedOnly`.

In a sentence an engine list reads as plain names. In `engines` it becomes a quiet line of linked names; an empty
list is hidden.

## Inline markup and links

- `<code>` for literals, `<kbd>` for shortcuts with the app's glyphs, `<ui>` for an app label or menu command. Tags
  do not nest, and links never go inside a sentence.
- A link has exactly one of `href` (a page on this site, root-relative, localized for you), `docs` (a
  docs.tablepro.app path, marked "(English)" outside English) or `account: true`. Never an `https://` URL.

## Slots

- `header.asset` and every band `asset` are `window-whole` slots in `resources/data/assets.json` (sync-and-teams'
  hero is the iCloud Sync diagram), shown whole at every width, never as a phone crop. Their `usedOn` names the page and the band (`top` for the hero). The test checks it.
- Mac windows only, light and dark, on the `shop` sample database, at the homepage captures' window size.
- A new id or a changed description is a manifest edit; then run `php artisan assets:generate`. A slot without its
  files renders nothing in production, so its band shows text only.

## Languages

- Same keys, same ids, `also`, `paid`, `asset` and `{tokens}` as English in every locale (`FeaturesTest`,
  `TranslationsTest`). Feature, plan, mode and engine names stay English.
- Vietnamese: "bạn", developer terms in English, positioning §11's glossary, NFC.

## Checks

```bash
php artisan test --compact --filter='FeaturesTest|TranslationsTest|PricingDataTest|AssetManifestTest|BlogTest'
npm run typecheck
npm run test:js
```
