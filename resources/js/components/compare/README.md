# Compare pages: how to write one

`/compare/{slug}` and `/vi/compare/{slug}` render one template, `pages/Compare/Show.tsx`, from three inputs:

| Input | File | Who writes it |
|---|---|---|
| Facts about the other product, each with a source and a check date | `resources/data/comparisons.json`, the product's entry | Data (see "Adding a fact" below) |
| The page's copy, one file per language | `resources/data/content/{en,vi}/compare/{slug}.json` | You |
| TablePro's column | derived from `pricing.json`, `platforms.json`, `paid-features.json`, `facts.json`, `engines.json` (`tablepro-facts.ts`) | Nobody. Never type a TablePro fact into a table |

The template's labels ("At a glance", "Choose {name} if", price phrases, row names) are the `labels` block of the hub's file, `content/{locale}/compare/index.json`. Do not repeat them in a page file.

`tableplus.json` and `dbeaver.json` are the worked examples. Copy one, then rewrite every string.

## What the page renders, in order

1. Breadcrumbs, `header.title` (the H1), `header.lead`, "Facts checked {date} · Sources", Download and pricing links, then a jump list to the sections below.
2. `#short-answer`: the hub's `labels.shortAnswer.lead` ("Looking for an alternative to {name} on the Mac?"), then two lists, "Choose TablePro if" (`shortAnswer.tablepro`) and "Choose {name} if" (`shortAnswer.competitor`).
3. `#at-a-glance`: `glance.intro` (or `""`), then the table. Standard rows come from data in `comparisons.json` → `rows` order: platforms, built with (when the product has `technology`), price, open source, databases, AI assistant, MCP server, iPhone and iPad, sync, moving to TablePro. **A standard row the product has no cell for is left out.** iPhone and iPad is the one derived row: no `ios` cell and no `ios` in the sourced `platforms` list renders "not supported" citing that list. Then "More about {name}": one row per product-specific cell, labelled by your `rows`. Below 640px the table folds both product columns under each row's label ("TablePro", then the other product), and the "moving to TablePro" row puts its words in TablePro's column with "Does not apply" in the other.
4. `#stronger` "Where {name} is stronger", `#differs` "Where TablePro differs", `#limits` "What TablePro does not do".
5. `#switching`: `switching.intro`, the numbered `steps`, the `after` notes, a docs link.
6. `#faq`, then `#sources` (every source in the product's data, numbered, with its check date, and the trademark notice), then `#more` (the other comparisons, each by its H1) and a closing Download band.

No benchmark, no rating, no `Review` or `FAQPage` markup, no competitor screenshot. Structured data is a `WebPage` about TablePro's Mac app plus the breadcrumb trail; the template adds it.

## The page file

Keys and their order are fixed (`CompareContentTest`). Both languages have the **same keys in the same order, the same list lengths and the same `{tokens}`** (`ContentParityTest`).

```jsonc
{
  "seo": { "title": "TablePro vs {X}: {one honest difference}", "description": "≤ 160 characters" },
  "og": { "kicker": "Compare", "title": "TablePro vs {X}" },
  "header": { "title": "TablePro vs {X}", "lead": "2-3 sentences: what each product is, for whom" },
  "shortAnswer": {
    "tablepro": ["3-5 real reasons"],
    "competitor": ["3-5 real reasons"],
    "competitorTitle": "optional; replaces “Choose {name} if” (Sequel Pro: “Choose Sequel Ace if”)"
  },
  "glance": { "intro": "one paragraph above the table, or \"\"" },
  "rows": {
    "<cellKey>": { "label": "Row name", "tablepro": "TablePro's side of this row, in words" }
  },
  "stronger": { "intro": "", "items": [ { "text": "…", "cite": ["platforms"], "feature": null, "href": null } ] },
  "differs":  { "intro": "", "items": [ … ] },
  "limits":   { "intro": "", "items": [ … ] },
  "switching": { "intro": "…", "steps": ["…"], "after": ["…"], "docs": "/switching" },
  "faq": [ { "id": "kebab-id", "question": "…", "answer": "…", "href": null } ],
  "notes": { "<noteId>": "…" }
}
```

- **`seo.title`** already contains "TablePro", so the template does not append the brand. H1 is "TablePro vs {X}" except Sequel Pro ("Sequel Pro alternatives for Mac", sitemap §A.4).
- **`rows`**: exactly the product's cells that are not standard rows (`platforms`, `price`, `licence`, `databases`, `ai`, `mcp`, `ios`, `sync`, `import`), in data order. TablePlus has `diagram`, `excelExport`, `safeMode`, `setapp`; DBeaver has `diagram`, `queryBuilder`, `scheduler`.
- **List items** always have all four keys:
  - `cite`: the facts the sentence rests on. Each becomes a numbered source marker. Allowed: `platforms`, `licence`, `status`, `mac`, `technology`, `prices`, `cells.<key>` (the key must exist in the product's `cells`).
  - `feature`: a `paid-features.json` id (`compare-sync`, `icloud-sync`, …). Shows "Starter plan" / "Team plan" as a badge and links `<link>` to that feature's section. **Do not use `team-catalog` or `team-library` here**: the Vietnamese wording guard reads ids too and rejects the lowercase word "team". Use `"href": "/features/sync-and-teams#team"` instead.
  - `href`: a path on this site (`/pricing`, `/ios`, `/databases`, `/features/…`) for `<link>…</link>` in `text`.
  - `<link>` must appear in `text` exactly when `feature` or `href` is set. Same rule for a FAQ `answer` and its `href`.
- **`switching.steps`**: only when `facts.json` → `connectionImport` lists the product (TablePlus, Sequel Ace, DBeaver, DataGrip, Beekeeper Studio, Navicat). Otherwise `[]`, and `intro` says how to bring connections over instead (a connection URL, Open Project Folder, or for Sequel Pro: Sequel Pro → Sequel Ace with Sequel Ace's own migration guide → TablePro's Sequel Ace importer). The first step names the menu path in `<ui>`. `docs` is a docs.tablepro.app path (`/switching`) or `null`; the template labels it "(tiếng Anh)" on Vietnamese pages.
- **`faq`**: 2-4 questions specific to this pair. Visible text only.
- **`notes`**: exactly one string per `note` id that the product's data cites (in cells, prices and `technology`). `ComparisonsDataTest` fails on a missing or extra note.

### Tokens

Prose may use only these, filled from the product's data (anything else prints literally and fails `CompareContentTest`):

| Token | Value |
|---|---|
| `{name}` | the product's name |
| `{status.version}`, `{status.date}` | its last release (date formatted for the page's language) |
| `{mac.minVersion}`, `{technology}`, `{licence}` | when the data has them |
| `{cells.<key>.version}`, `.date`, `.value`, `.edition` | a cell's fields, when present |
| `{starterExamples}`, `{teamExamples}` | the highlighted paid features, joined for the language |

Inside `notes`, only `{value}`, `{version}`, `{date}`, `{edition}`, filled from the cell or price that cites the note. A number in a note is a `{value}` from data (TablePlus's free tier: `"value": 2`).

Tags: `<link>…</link>` and `<ui>…</ui>` (an app label or menu path). Nothing else.

### Never in a compare file

- A price, a URL, a download size, a speed, memory or startup figure (`CompareContentTest` and positioning §12). Prices render from data in the table.
- A count of TablePro's engines, MCP tools, AI providers, Safe Mode levels or paid features.
- "every/any/all database(s)", "every/all platforms", "cross-platform" about TablePro, "unlock", "faster than", "lighter", "free forever", "no feature gating", hype words. Vietnamese: "mọi cơ sở dữ liệu", "mọi nền tảng", "mở khóa", "nhanh hơn", "nhẹ hơn". "cross-platform", "macOS 14", "Mac App Store" and "Setapp" are allowed only about the other product.
- "Free" alone for TablePro, adversarial words ("too slow", "bloated"), guesses. A fact nobody verified is left out.
- Anything about TablePro that is not true of Mac 0.77.0 and iOS App Store 1.0 (build 22). Check the TablePro app repository at the `v0.77.0` tag and docs.tablepro.app.

### Vietnamese

Write it, do not gloss it. Address the reader as "bạn". Keep developer terms in English (query, schema, connection, table, export, import, driver, engine, SSH tunnel, MCP server, license). Follow positioning §11: "giấy phép" only in "giấy phép AGPLv3"; "gói Starter", "gói Team"; "nhóm" for a team of people; "tùy", "hủy", "khóa", "xóa" with the tone on the first vowel; "Tải về". In a click path, give the app's Vietnamese label first and the English one in parentheses once: `<ui>Tệp > Nhập > Nhập từ ứng dụng khác…</ui> (File > Import > Import from Other App…)`. The app's Vietnamese labels are in `TablePro/Resources/Localizable.xcstrings` at tag `v0.77.0` (read-only). Save files in NFC.

## Adding a fact

Every competitor fact on the page must be in the product's `comparisons.json` entry. If your page needs one that is missing:

1. Find it on an official page (the product's site, docs, release notes, pricing page or store listing). Every source already in `comparisons.json` names that page and the date it was read (`retrievedAt`).
2. Add a cell to **your product only**: `{ "state": "yes" | "no" | "qualified", "source": "sN" }`, plus `note`, `edition`, `version`, `date` or `value` as needed. Cite a source already in the product's `sources`, or add one (`https://`, `retrievedAt` today): a page a reader can open, never a JSON or Markdown feed. When no single page states the whole fact, `source` is a list (`["s3", "s8"]`) and the cell shows a marker for each. Never a field named for size, memory or speed.
   The `databases` cell also has `engines`: the `engines.json` ids its sources name. A database page with an "Other tools" block links the comparison when its engine is listed.
3. Add the cell's label to `rows` in both languages, and its note text to `notes`.
4. Run the checks below.

## Checks

```bash
php artisan test --compact --filter='ComparisonsDataTest|CompareContentTest|ComparePagesTest|ContentParityTest|LocaleRoutingTest'
npm run typecheck && npm run test:js
```

`ComparisonsDataTest` → "gives every compared product a page in both languages" and `LocaleRoutingTest` → "pins each slug constant…" fail until all ten comparisons exist in both languages. The server-rendered cases in `ComparePagesTest` run where SSR is available.

## Per page (sitemap §A.4)

| Slug | Importer | The real choice |
|---|---|---|
| `datagrip` | yes | An IDE against a client. Prices by year of subscription; free for non-commercial use, with mandatory usage statistics; JetBrains AI quota; MCP server since 2025.2; version control. TablePro's Compare & Sync is Starter |
| `navicat` | yes, from a `.ncx` export | Premium Lite (free, commercial use allowed) against TablePro's free app; Premium perpetual prices against Starter; AI Assistant; per-engine iOS apps; Navicat Cloud; data modeling in Premium Enterprise |
| `beekeeper-studio` | yes | Open-source cross-platform peer built on Electron; tiers with AI Shell and cloud workspaces from Professional; ER diagram in paid tiers; Vim mode. Never call TablePro "Universal": two builds |
| `sequel-ace` | yes | Both free, native and maintained. Sequel Ace: MySQL and MariaDB only, Mac App Store, MCP server (read-only by default), no AI chat. No jabs at its release cadence |
| `sequel-pro` | no | "Sequel Pro alternatives for Mac": discontinued, Intel-only, Homebrew cask removed, site down; Sequel Ace is the direct successor. Path: Sequel Pro → Sequel Ace → TablePro import |
| `postico` | no | A focused PostgreSQL client: one-time licenses by audience, Mac App Store copy, untimed evaluation with features disabled, iCloud or Dropbox sync, no admin tools. TablePro: multi-engine, Users & Roles, dashboard; iCloud Sync is Starter |
| `heidisql` | no | Free (GPL), Windows heritage; the macOS build is Apple silicon only since early 2026. TablePro: Intel and Apple silicon builds, more engines |
| `phpmyadmin` | no | A web admin tool against a desktop client: cPanel, many interface languages, its own hardening guidance, 6.0 in development. TablePro installs nothing on the server and connects over SSH. No fear-based rows |
