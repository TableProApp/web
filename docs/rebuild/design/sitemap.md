# Sitemap, information architecture, dispositions and migration

Design decision for the TablePro website rebuild, 2026-10-02. It covers spec §6 (IA and the disposition table), §8 (locale URLs and switching), §10 (SEO and migration) and the IA parts of §9.1 (placeholder slots).

**Inputs.**

- The rebuild brief ("the spec"; not part of this repository), §0 first. Its decisions override everything else here.
- Product facts from the TablePro app repository at v0.77.0 and v0.76.1, App Store 1.0 and docs.tablepro.app.
- Competitor facts from each vendor's own pages, each with its check date.
- The URL history of tablepro.app (public archives, inbound links from the app, the docs and other public repositories).
- The current routes and content in this repository (`routes/web.php`, `resources/blog`, `resources/data`, `public/og`).

**Release floor for copy.** Copy describes Mac **v0.77.0** (GitHub and Sparkle). Homebrew still serves 0.76.1, so items that shipped only in 0.77 carry a "0.77" label that comes from data. iOS copy describes **App Store 1.0 (build 22)** only.

Short names: **EN** = English at the root, **VI** = Vietnamese under `/vi`. "Pair" means an EN page and a VI page that are true translations of each other.

---

## Decisions at a glance

1. **Header.** Features (menu) · Databases · Pricing · Docs ↗ · Blog, then Language · Theme · Account · **Download**. The footer collapses the old 11 comparison links and 26 database links into two hub links. Every page stays reachable from a hub.
2. **New hubs:**
   - `/features` with **7 feature pages**: querying, data-editing, schema, import-export, ai-mcp, connections, sync-and-teams.
   - `/databases`, generated from `engines.json`.
   - `/compare`.
   - A dedicated **`/pricing`**.

   The homepage keeps a working compact plan section at `id="pricing"`, because shipped Mac builds open `/?ref=…#pricing`.
3. **Database pages:**
   - **23 engine pages**. 22 keep their existing `/{slug}` URL and get a full rewrite. **Kafka** is new at `/kafka-client`.
   - **4 pages merge into family pages, with 301s:**
     - `/mariadb-client` → `/mysql-client#mariadb`
     - `/cockroachdb-client` → `/postgresql-client#cockroachdb`
     - `/pglite-client` → `/postgresql-client#pglite`
     - `/scylladb-client` → `/cassandra-client#scylladb`
   - TiDB, OceanBase and Databend become sections of `/mysql-client`.
   - Spanner, Typesense, Weaviate, Cloudflare R2 SQL, Dameng and SAP HANA (labelled 0.77) are rows on the hub, with links to the docs.
4. **Comparisons:**
   - 9 pages are rewritten at the same URLs.
   - `/compare/sequel-pro` becomes "Sequel Pro alternatives" at the same URL.
   - `/compare/azimutt` returns **410 Gone**, because nothing on the site genuinely replaces it.
5. **Blog:**
   - The 10 release posts stay as an **English-only, dated archive**. That includes the 0.77 post and the iPhone launch post.
   - All 4 SEO and guide posts are **merged and redirected** into pages that answer the same question better:
     - MCP guide → `/features/ai-mcp#mcp`
     - D1 post → `/cloudflare-d1-client`
     - Compass post → `/mongodb-client#compass`
     - Open-source roundup → `/compare#open-source`
   - No guide stays, so no guide needs a Vietnamese twin. `/vi/blog` is a Vietnamese listing of the English posts, labelled honestly, and set to `noindex`.
6. **Locales.** Each launch page is published as a pair: **51 indexable EN/VI pairs** plus **11 English-only indexable URLs** (the blog index and 10 posts). The sitemap therefore lists **113 URLs**. `hreflang` is emitted only for real pairs, with `x-default` pointing to the English URL.
7. **Migration rules:**
   - Every retired URL is an **explicit route**, registered before the localized route groups. It answers with **a single 301 hop that keeps the query string**, or with a 410. The map is `config/redirects.php`. `/databases/{docsSlug}` is one route, constrained by a PHP constant list (§C.1).
   - There is no normalising middleware. Laravel's router already matches `/x/` and `/index.php/x` to `/x`. A slash variant of a redirect source therefore reaches the redirect route, and a slash variant of a live page returns 200 with a slashless canonical, as it does today.
   - Laravel's `Route::redirect` drops the query string, so it is never used.
   - Nothing redirects to the homepage.
   - 404 and 410 pages are branded and localised.

---

## A. Final sitemap

Column notes:

- **Data** names the files that hold the facts. Copy lives in the locale catalogues (en/vi), not in these files.
  - `platforms.json`: Mac and iOS releases, requirements, destinations, future platforms, app UI languages.
  - `engines.json`: the per-engine facts (driver delivery, query language, connection modes, version floor, capabilities and limits), plus `page`, `slug`, `anchor`, `category`, `docsSlug` and `since`.
  - `pricing.json`: tiers, cycles, prices, seats, activations, refund window, license timings, the 10 paid features with tier, page anchor and lapse behaviour, merchant, currency, and the definition of Priority support.
  - `facts.json`: AI provider list, MCP clients, Safe Mode levels per platform, import sources, export formats, backup tools, sync categories, grid and editor limits.
  - `comparisons.json`: facts plus `checkedAt`, `sources[]` and three-state cells.
  - `sponsors.json`: the 4 verified sponsors (CodeRabbit, SimpleLocalize, Nimbus, Dwarves Foundation).
  - `assets.json`: the placeholder manifest.
- **Slots** are asset IDs from the slot catalogue in §A.8. One ID means one scene. A scene is reused only where it shows the same workflow on the same engine.
- **Indexable "yes (pair)"** means `index,follow`, in the sitemap, self-canonical, with reciprocal `hreflang` between EN and VI and `x-default` set to EN. **"yes (EN only)"** means indexable, with no alternates.

### A.1 Core, platform and commerce pages

| Path EN | Path VI | Family | Intent / search need | H1 (EN) | Sections, ordered by reader question | Data | Slots | Key internal links | Indexable |
|---|---|---|---|---|---|---|---|---|---|
| `/` | `/vi` | Home | Brand and navigational searches; a first evaluation ("what is it, does it fit me, where do I get it") | "A native database client for developers." (final wording comes from the positioning decision) | See §D: 10 sections, Sponsors third | platforms, engines, pricing, sponsors, facts; GitHub latest release (cached, dated fallback) | mac-hero-window, mac-hero-window-mobile, mac-query-autocomplete, mac-edit-preview-sql, mac-compare-sync-structure, mac-data-files-window, mac-connection-ssh-form, mac-safe-mode-touchid, mac-ai-chat, ios-connection-list | /features and every feature page, /databases, /download, /ios, /pricing, /compare, /account | yes (pair) |
| `/download` | `/vi/download` | Platform | "download TablePro", "TablePro mac", `brew install tablepro`. Linked from the docs navbar, the purchase email and the org README | "Download TablePro" | 1) Current release: version, date, release notes ↗ 2) **Mac** (`#mac`): Apple Silicon and Intel buttons, both rendered on the server; DMG sizes from the release API; "Requires macOS 13 Ventura or later"; "Which Mac do I have?"; copyable `brew install --cask tablepro` with a note that Homebrew can trail a release; GitHub Releases 3) **iPhone & iPad** (`#ios`): App Store badge, iOS/iPadOS 18 or later, free with no in-app purchases, link to /ios 4) **Install and first run** (`#install`): drag to Applications; notarized; drivers download the first time you pick an engine (needs a network); sample database. The post-click panel appears only after the click 5) **Updates** (`#updates`): daily check, Settings toggle 6) **Other platforms** (`#other-platforms`): Windows and Linux are not available, with no date 7) **Older versions and release notes** (`#older-versions`) | platforms; GitHub releases API (`releases/latest`, cached, literal fallback) | none (none of the reference download pages shows a screenshot) | /ios, /features, /pricing, docs `/installation` ↗, docs `/changelog` ↗ | yes (pair) |
| `/ios` | `/vi/ios` | Platform | "TablePro iPhone/iPad", "database client iPhone", "PostgreSQL/MySQL app iOS". Linked from the App Store listing (seller URL `/`) | "TablePro for iPhone and iPad" | 1) Hero: free, no in-app purchases, iOS/iPadOS 18 or later, App Store badge, "1.0" from data 2) Databases (`#databases`): the 10 names; Redshift opens when synced; other engines sync in but do not open 3) Browse and edit (`#browse`): cards, filters, FK preview, row editor (needs a primary key), truncate and drop 4) Query (`#query`): highlighted editor, Run/Stop, 200-entry history per device, copy or share JSON/CSV/INSERT, Live Activity with Hide Query 5) Connect securely (`#security`): SSH password or key, host keys, SSL per engine (SQL Server without verification), Keychain, Entra on synced SQL Server 6) Safe Mode and App Lock (`#safe-mode`): 3 levels; Face ID, Touch ID or passcode 7) iPad (`#ipad`): universal app, multiple windows, keyboard shortcuts 8) With your Mac (`#mac`): iCloud sync of connections, groups and tags (off by default; the Mac side needs Starter); `.tablepro` export with optional encrypted passwords (free here); Handoff 9) Shortcuts, widgets, Spotlight (`#automation`) 10) Not on iPhone or iPad (`#limits`) 11) Privacy (`#privacy`): Share Usage Data is off by default 12) Get it, plus a short FAQ | platforms (`ios.*`), engines (`ios` fields), facts (Safe Mode levels, export formats) | ios-connection-list, ipad-table-browse, ios-table-browse, ios-row-edit, ios-query, ios-live-activity, ios-connection-form, ios-safe-mode-confirm, ipad-two-windows, diagram-icloud-sync, mac-handoff-ios, ios-widgets, ios-shortcuts-add-rows, ios-settings-privacy | /download, /features/sync-and-teams, /databases, /privacy#ios-app, docs `/ios` ↗ (only sections that are true for 1.0) | yes (pair) |
| `/pricing` | `/vi/pricing` | Commerce | "TablePro price", "license", "team"; also visitors who arrive from in-app upgrade links through `/#pricing` | "Pricing" | 1) One line from data: the Mac app is free, a license unlocks the paid features, and the iPhone and iPad app is free 2) **Plans** (`#plans`): Free, Starter and Team cards; monthly/yearly/lifetime toggle; unit, minimum and total in words; seat stepper 5-200; Buy starts `POST /checkout` 3) **What a license unlocks** (`#features`): the paid features from `pricing.json`, each with its tier, one line and a link to its feature page, plus an iPhone column that reads "free, nothing gated" 4) **How licenses work** (`#license`): Starter covers 2 Macs; a Team seat is one activated Mac; revalidated every 7 days; 30-day offline grace; when a subscription ends the paid features lock and everything else keeps working; Lifetime is paid once with no expiry date 5) **Billing** (`#billing`): Polar is the merchant of record; prices in USD; Polar handles sales tax or VAT and receipts; "Billing & invoices" in Account for Polar purchases 6) **Refunds** (`#refunds`): 7 days on every plan, link to /refund-policy 7) **Team** (`#team`): seats, invites, Priority support (Team emails answered first, within one business day) 8) **Open source** (`#open-source`): AGPLv3; source builds gate the same features 9) **FAQ** (`#faq`): the licensing subset of the FAQ data | pricing; FAQ data (licensing subset) | none | each paid feature's page anchor, /refund-policy, /account?locale=, /download, /faq#licensing, /terms | yes (pair) |
| `/faq` | `/vi/faq` | Support | Pre-purchase and support questions: "is TablePro free", "offline", "Windows", "lost license key" | "Frequently asked questions" | Categories in this order: General (`#general`) · Platforms (`#platforms`) · Databases (`#databases`) · Pricing and licenses (`#licensing`) · Privacy and network (`#privacy`) · Account and team (`#account`) · Switching (`#switching`). Answers take values from data placeholders. "Lost your key?" and "Manage seats" point to /account | faq copy (en/vi) plus pricing, platforms, engines | none | /pricing, /download, /ios, /privacy, /account?locale=, /databases, /compare | yes (pair) |

### A.2 Features

Every feature page follows blueprint §E.4. Section ids are fixed, because redirects and cross-links target them.

| Path EN | Path VI | Family | Intent / search need | H1 (EN) | Sections, ordered by reader question | Data | Slots | Key internal links | Indexable |
|---|---|---|---|---|---|---|---|---|---|
| `/features` | `/vi/features` | Feature hub | "TablePro features"; orientation | "What you can do in TablePro" | 1) One paragraph: the Mac app is the full workbench, and the iPhone and iPad app is a separate native app 2) Seven feature areas, each with a title, two lines and free/paid markers derived from `pricing.json` 3) iPhone & iPad (link /ios) 4) Free and paid in one table: the 10 paid features named, link to /pricing 5) Docs ↗ | pricing, platforms | none (no card mosaic) | all 7 feature pages, /ios, /pricing, /databases | yes (pair) |
| `/features/querying` | `/vi/features/querying` | Feature | "SQL editor with autocomplete", "EXPLAIN visualizer", "query history"; questions about the editor | "Write, run and understand queries" | 1) Editor (`#editor`): schema-aware autocomplete (aliases, CTEs, subqueries); run statement, run all, run uncapped, cancel; statement markers; format; find/replace; Vim mode 2) Parameters, history and saved queries (`#history`): `:name` parameters; history drawer (local, full-text search, 10,000 entries for 90 days); saved queries with keyword expansion and version history; linked SQL folders with Git status (free) 3) Open Quickly and tabs 4) Performance (`#performance`): EXPLAIN as diagram, tree or raw, with the engine list from data; **EXPLAIN Compare** (free); **Query Insights** (Starter) 5) Results as charts and maps (`#results`): **Result Charts** (Starter; limits shown in the toolbar); **Map view** (free; tiles come from Apple) 6) Other query languages (`#other-languages`): the Mongo JS shell, Redis commands, CQL, Query DSL, KafkaQL and others, each linked to its engine page 7) On iPhone and iPad (`#iphone`): highlighting, Run/Stop, history; no autocomplete 8) Where it works (platform × tier table) 9) Docs ↗ | facts (limits), engines (`explain_variants`), pricing (tiers) | mac-query-autocomplete, mac-query-parameters-history, mac-explain-compare, mac-query-insights, mac-result-chart, mac-result-map | /features/data-editing, engine pages, /pricing#features, /ios#query; docs `/features/sql-editor`, `/features/query-insights`, `/features/explain-visualization` ↗ | yes (pair) |
| `/features/data-editing` | `/vi/features/data-editing` | Feature | "edit table data GUI", "safe mode production database", "undo committed change" | "Browse and edit data safely" | 1) Browse (`#browse`): server-side sort and paging; estimated counts; filters (18 operators); saved filters; highlight rules; FK navigation and value picker; JSON viewer 2) Edit (`#edit`): staged cell edits, inserts and deletes; type-specific editors; **Preview SQL**; saves run as bound parameters checked against expected row counts; undo per tab until you save; editable results only for single-table queries; copy as CSV/JSON/Markdown/INSERT/UPDATE/IN 3) **Safe Mode** (`#safe-mode`): the 6 Mac levels named, with Silent as the default; DROP, TRUNCATE and DELETE without WHERE always ask; Touch ID on the Safe Mode levels; Read-Only; floors set by Agent mode and MDM 4) **Data Rewind** (`#data-rewind`, Starter): restore previous values; kept 7 days on this Mac, encrypted, never synced; states what it refuses; not a backup 5) Documents and keys (`#documents-and-keys`): MongoDB documents and Redis keys, linked to their engine pages 6) On iPhone and iPad (`#iphone`): row editor needs a primary key; 3 Safe Mode levels 7) Where it works 8) Docs ↗ | facts (Safe Mode levels, filter operators), pricing | mac-edit-preview-sql, mac-grid-highlight-rules, mac-fk-picker, mac-safe-mode-touchid, mac-data-rewind-review | /features/connections#policies, /features/ai-mcp#agent-mode, /mongodb-client, /redis-gui, /ios#safe-mode, /pricing#features; docs `/features/safe-mode`, `/features/change-tracking` ↗ | yes (pair) |
| `/features/schema` | `/vi/features/schema` | Feature | "schema compare tool", "migrate MySQL to PostgreSQL", "ER diagram", "database users and privileges GUI" | "Schema, compare and sync" | 1) Structure (`#structure`): staged DDL with a preview (columns, indexes including expression keys, FKs, CHECK, generated columns); Create Table; engines where structure is read-only (from data); caveats on column reorder 2) ER diagram (`#er-diagram`): read-only snapshot; export PNG or SQL; explicitly "not a schema designer" 3) Sidebar objects: routines, triggers, partitions; table and view folders (0.77) 4) **Compare & Sync** (`#compare-sync`, Starter): structure and data modes; hazards held back; saved comparisons; same-engine-family rule 5) **Copy To / Duplicate Database / Transfer To** (`#copy`, free): across engines, with every type approximation listed 6) Administer (`#administer`): Users & Roles (MySQL, MariaDB, PostgreSQL, PGlite); Server Dashboard (engines from data); maintenance; create, drop and rename databases and schemas 7) On iPhone and iPad (`#iphone`): read-only structure; Truncate and Drop only 8) Where it works 9) Docs ↗ | engines (`schema_editing`, dashboard, users_roles), pricing | mac-structure-ddl-preview, mac-er-diagram, mac-compare-sync-structure, mac-copy-to-review, mac-users-roles-mysql, mac-server-dashboard-postgresql | /features/import-export, /postgresql-client, /mysql-client, /pricing#features; docs `/features/compare-sync`, `/features/copy-objects`, `/features/er-diagram` ↗ | yes (pair) |
| `/features/import-export` | `/vi/features/import-export` | Feature | "import CSV/Excel into database", "export to XLSX/Parquet", "pg_dump GUI", "open CSV file as table" | "Import, export and data files" | 1) Import (`#import`): CSV/TSV, JSON/JSONL, XLSX and SQL (including `.sql.gz` and `GO`); on-error modes; remembered mappings and CJK/UTF-16 encodings (0.77); engines without import (from data) 2) Export (`#export`): formats from data, streamed; Parquet through a plugin 3) **Data Files window** (`#data-files`): open, search, clean up and export CSV/JSON; XLSX and `.gz` open read-only; column statistics; Import into Table 4) Backups (`#backup`): Backup Dump and Restore Dump with the engine's own tools (named in data; you install the CLIs) through the SSH tunnel; Server-Side Export for Oracle, Snowflake and BigQuery 5) Files as databases (`#files`): SQLite, DuckDB with Parquet/CSV/JSON, remote SQLite over SSH, `.sql` files as tabs, Finder integration 6) Between databases: link to /features/schema#copy 7) On iPhone and iPad (`#iphone`): copy or share JSON/CSV/INSERT; Shortcuts "Add Rows" 8) Docs ↗ | facts (formats, backup tools), engines (`import`) | mac-data-files-window, mac-data-files-statistics, mac-import-mapping, mac-export-dialog, mac-backup-dump | /features/schema#copy, /sqlite-client, /duckdb-client, /ios#automation; docs `/features/import-export`, `/features/data-files`, `/features/backup-restore` ↗ | yes (pair) |
| `/features/ai-mcp` | `/vi/features/ai-mcp` | Feature | "AI SQL assistant", "MCP server database", "connect Claude/Cursor to a database". Absorbs `/blog/mcp-database-claude` | "AI assistant and MCP server" | 1) Bring your own provider (`#assistant`): providers named from data; nothing is sent until you add one; what each message carries (schema on, current query on, rows off) 2) In the editor: Explain, Optimize, Fix, Review; inline suggestions (off by default); per-connection AI rules 3) Chat modes and **Agent mode** (`#agent-mode`): Ask, Edit and Agent, with the exact approval rules (writes are auto-approved at Silent; DROP and TRUNCATE always need a click); Agent mode raises the Safe Mode floor to Alert 4) **MCP server** (`#mcp`): `127.0.0.1` only and off by default; tool groups named; token scopes; External Clients level per connection; activity log. "Connect a client" lists clients from data, the stdio bridge and pairing, and links the docs setup. A short worked example (merged from the guide) 5) Permission layers: an HTML list, not an image 6) Outside MCP servers (`#outside-servers`): every call waits for a click 7) Automation (`#automation`): AppleScript, `tablepro://` URLs, the `tablepro` shell command (it opens items; it is not a headless CLI), the official Raycast extension 8) Privacy (`#privacy`): traffic goes to your provider; Copilot telemetry is on by default when added 9) Not on iPhone or iPad 10) Docs ↗ | facts (providers, MCP clients, tool groups), pricing (free) | mac-ai-chat, mac-agent-mode, mac-mcp-settings | /features/data-editing#safe-mode, /privacy#mac-app, /compare (MCP rows); docs `/features/ai-assistant`, `/features/mcp`, `/external-api/mcp-clients`, `/external-api/raycast` ↗ | yes (pair) |
| `/features/connections` | `/vi/features/connections` | Feature | "SSH tunnel database client", "AWS IAM database auth", "import connections from TablePlus/DBeaver" | "Connections, tunnels and credentials" | 1) Organize (`#organize`): the connection form; URL import and the clipboard banner; groups, tags, colours, favorites 2) Bring your connections (`#import`): import from the apps named in data, including passwords where the importer recovers them; Open Project Folder (`.env`, Prisma, Rails and others); Import from AWS 3) Networks (`#network`): SSH with every auth method, jump hosts, TOTP and profiles; SSL modes; SOCKS5; Cloudflare Access; Cloud SQL Auth Proxy; Tunnel Command (kubectl, AWS SSM) 4) Cloud sign-in (`#cloud-auth`): AWS IAM (MySQL, MariaDB, PostgreSQL; not Redshift), Microsoft Entra ID, Kerberos, Google 5) Credentials (`#credentials`): Keychain; Sync Passwords; password sources (1Password, Vault, AWS Secrets Manager, command, file, env; free); credential profiles; `~/.pgpass`; **Environment Variables** `$VAR` (Starter) 6) Policies (`#policies`): Safe Mode per connection (link); per-connection timeouts (0.77); MDM minimum Safe Mode level 7) On iPhone and iPad (`#iphone`): no jump hosts 8) Docs ↗ | facts (import sources), engines (`aws_iam`, `ssh`), pricing | mac-connection-ssh-form, mac-connection-library, mac-import-other-app, mac-open-project-folder, mac-tunnel-command | /compare (switching), /features/data-editing#safe-mode, /ios#security; docs `/connections/ssh-tunneling`, `/connections/aws-iam`, `/switching` ↗ | yes (pair) |
| `/features/sync-and-teams` | `/vi/features/sync-and-teams` | Feature | "sync database connections iCloud", "share connections with team" | "Sync across devices and share with your team" | 1) **iCloud Sync** (`#icloud-sync`; Starter on the Mac, free on iPhone): what syncs (categories, not counts), what never syncs, off by default, "Local only" per connection 2) Handoff (`#handoff`): needs iCloud Sync 3) Share a connection (`#share`): `.tablepro` export (plain is free; **Encrypted Export** is Starter on the Mac and free on iPhone); `tablepro://import` links with no passwords 4) **Linked Folders** (`#linked-folders`, Starter) 5) **Team Catalog and Team Library** (`#team`, Team): what is uploaded (definitions and SQL text, never passwords) 6) Seats and account (`#seats`): links to /pricing#team and /account 7) Docs ↗ | pricing, facts (sync categories) | diagram-icloud-sync, mac-team-library, mac-handoff-ios | /ios#mac, /pricing#team, /account?locale=, /privacy#mac-app; docs `/features/icloud-sync`, `/features/team` ↗ | yes (pair) |

### A.3 Databases

The hub is generated from `engines.json`. Every engine page follows blueprint §E.1 plus its category rules in §E.2. Copy is per engine in `databases` (en/vi) and is never templated. The H1 pattern is "{Name} client for {platforms the engine opens on}", with the platform list taken from data. Beancount and the family pages override it.

| Path EN | Path VI | Family | Intent / search need | H1 (EN) | Sections: §E.1 order, plus these specifics | Data | Slots | Key internal links | Indexable |
|---|---|---|---|---|---|---|---|---|---|
| `/databases` | `/vi/databases` | DB hub | "TablePro supported databases" | "Databases TablePro connects to" | 1) Intro: native drivers in one app; a few engines named 2) Engines by category (`#relational`, `#analytical`, `#cloud`, `#document`, `#key-value`, `#wide-column`, `#search`, `#streaming`, `#coordination`, `#files`). Each row: name, query language, bundled or downloaded on first use, iPhone/iPad, page link or docs ↗, "0.77" label. Hub-only engines have ids such as `#spanner` and `#sap-hana` 3) How drivers are delivered (`#drivers`): bundled vs downloaded on first pick, signature check, plugins update separately, network needed for a first install 4) iPhone and iPad engines (names only) 5) No engine needs a license 6) Missing your database? (GitHub request form) 7) Docs ↗ | engines | mac-engine-picker | all 23 engine pages, /ios#databases, /pricing | yes (pair) |
| `/postgresql-client` | `/vi/postgresql-client` | DB (SQL) | PostgreSQL client for Mac/iPhone; hosted Postgres (RDS, Supabase, Neon) | "PostgreSQL client for Mac, iPhone and iPad" | Connect: database required; 5 SSL modes; SSH and jump hosts; AWS IAM (RDS, Aurora); Cloud SQL Auth Proxy; `~/.pgpass`; hosted PG as plain hosts. Work: arrays, jsonb, PostGIS on the Map view; EXPLAIN diagram and Compare. Operate: dashboard with terminate; Users & Roles; VACUUM; nested partitions; routines; pg_dump/pg_restore. Column reorder writes a script and does not run it. Floor 9.1. **#cockroachdb** (port 26257, read-only structure, no dump or Users & Roles, `--cluster`) and **#pglite** (`pglite-socket`, trust auth, one client); both Mac only. Other tools: pgAdmin, Postico | engines[postgresql, cockroachdb, pglite] | mac-db-postgresql-explain, mac-server-dashboard-postgresql, mac-result-map | /features/schema#administer, /features/querying#performance, /compare/postico, /redshift-client, docs `postgresql`, `cockroachdb`, `pglite` ↗ | yes (pair) |
| `/mysql-client` | `/vi/mysql-client` | DB (SQL) | MySQL and MariaDB clients for Mac/iPhone; TiDB, OceanBase | "MySQL and MariaDB client for Mac, iPhone and iPad" | Connect: TCP only (no socket); SSL Preferred; SSH and jump hosts; AWS IAM; Cloud SQL Proxy (MySQL only). Work: SQL; EXPLAIN diagram; `LOAD DATA LOCAL` refused. Operate: Users & Roles; dashboard; OPTIMIZE; mysqldump (restore replaces objects). Floor 5.7. **#mariadb** (10.x+, sequences, virtual columns) · **#tidb** (port 4000, `KILL TIDB QUERY`, no triggers, dashboard or dump) · **#oceanbase** (MySQL mode only, `user@tenant`) · **#databend** (port 3307, no keys, indexes or dashboard; Mac only). Other tools: Sequel Ace, MySQL Workbench, phpMyAdmin | engines[mysql, mariadb, tidb, oceanbase, databend] | mac-db-mysql-query, mac-users-roles-mysql | /compare/sequel-ace, /compare/phpmyadmin, /compare/heidisql, /features/schema#administer, docs ↗ | yes (pair) |
| `/sqlite-client` | `/vi/sqlite-client` | DB (file SQL) | SQLite browser/editor for Mac/iPhone | "SQLite client for Mac, iPhone and iPad" | Open by drag or by double-click; bundled SQLite (version from data); extensions (sqlite-vec, SpatiaLite); **remote SQLite over SSH** (live, or a read-only copy); Chinook sample; EXPLAIN QUERY PLAN diagram; structure changes through a table rebuild; `sqlite3` backup; encrypted files (SQLCipher/SEE) do not open. On iOS the file is copied into the app. Related: D1, libSQL | engines[sqlite] | mac-db-sqlite-chinook | /features/import-export#files, /cloudflare-d1-client, /turso-client, docs ↗ | yes (pair) |
| `/mongodb-client` | `/vi/mongodb-client` | DB (document) | MongoDB GUI for Mac; "Compass alternative". Absorbs `/blog/mongodb-native-vs-compass` | "MongoDB client for Mac" | Shell: mongosh-style JavaScript. Documents: grid plus Insert/Edit Document in Extended JSON; rename or remove a field across a collection; indexes; validator. Connect: SRV/Atlas, replica sets, SCRAM/X.509/AWS, read preference, write concern. Backup: mongodump. Floor 4.0. Not supported: transactions, GridFS, change streams, pipeline builder. Safe Mode counts every statement as a write. The driver downloads on first pick; Mac only. **#compass**: "TablePro or MongoDB Compass", dated and fair (Compass is free, official, and has a pipeline builder and schema analysis) | engines[mongodb]; comparisons (Compass facts, dated) | mac-db-mongodb-document | /features/data-editing#documents-and-keys, /features/querying#other-languages, docs ↗ | yes (pair) |
| `/redis-gui` | `/vi/redis-gui` | DB (key-value) | Redis GUI for Mac; Valkey, ElastiCache | "Redis GUI for Mac" | Commands with redis-cli quoting; key tree split on `:` (50,000-key cap; filters stop at 10,000); rename keys; TTL with EXPIRE/PERSIST; edit **string** values; Add Row by type. Standalone, Sentinel or Cluster (db0 only); ACL; ElastiCache IAM; TLS; Valkey. Safe Mode counts every command as a write; FLUSHDB and FLUSHALL ask first. No pub/sub view; no import; bundled. iPhone: commands in the Query tab only (no key browsing in 1.0). Other tools: Redis Insight (free, official) | engines[redis] | mac-db-redis-keys | /features/data-editing#documents-and-keys, /ios#databases, docs ↗ | yes (pair) |
| `/sql-server-client` | `/vi/sql-server-client` | DB (SQL) | SQL Server client for Mac ("SSMS for Mac") | "SQL Server client for Mac, iPhone and iPad" | T-SQL with `GO` batches and PRINT output. Sign-in: SQL login, Kerberos (Mac), Entra ID device code. Cloud SQL Proxy. Floor 2012 (TDS 7.4). No named instances, NTLM or EXPLAIN. Dashboard with terminate; `.bacpac` backup through sqlpackage; scripts are not wrapped in a transaction. The driver downloads on first pick. iPhone: opens, but TLS is not verified. Other tools: **SSMS 22 is free and Windows-only**; Azure Data Studio was retired on 2026-02-28 and its successor is VS Code with MSSQL (dated) | engines[sqlserver]; comparisons (dated facts) | mac-db-sqlserver-script | /features/connections#cloud-auth, /ios#security, docs `mssql` ↗ | yes (pair) |
| `/oracle-client` | `/vi/oracle-client` | DB (SQL) | Oracle client for Mac with no Instant Client | "Oracle Database client for Mac, iPhone and iPad" | Pure-Swift driver; no Instant Client. Service name or SID; SYSDBA/SYSOPER; native network encryption; TCPS; Autonomous Database over one-way TLS. SQL plus PL/SQL with `/`; DBMS_OUTPUT; Data Pump server-side export. Floor 11.1 (10g refused). Not supported: wallets, OS auth, Kerberos, LDAP, EXPLAIN, Users & Roles, packages in the sidebar. The driver downloads on first pick | engines[oracle] | mac-db-oracle-plsql | /features/import-export#backup, docs ↗ | yes (pair) |
| `/clickhouse-client` | `/vi/clickhouse-client` | DB (analytical) | ClickHouse GUI for Mac | "ClickHouse client for Mac" | HTTP(S) only (no native TCP); TLS off by default; 5 EXPLAIN variants; edits run as async mutations; Parts tab and partition tools; dashboard; KILL QUERY; no FKs or transactions; `SET` does not persist; tuples on the Map view; bundled | engines[clickhouse] | mac-db-clickhouse-parts | /features/querying#performance, docs ↗ | yes (pair) |
| `/duckdb-client` | `/vi/duckdb-client` | DB (file analytical) | DuckDB GUI; "open Parquet on Mac" | "DuckDB client for Mac, iPhone and iPad" | `.duckdb` files in place; Parquet/CSV/JSON as read-only views; `:memory:`; Remote Quack (experimental). Embedded DuckDB version from data. Linked extensions; others download from DuckDB on first use. One writer per file; native backup; Parquet export plugin; no SSH or SSL. iPhone: files in place or in memory | engines[duckdb] | mac-db-duckdb-parquet | /features/import-export#files, docs ↗ | yes (pair) |
| `/cassandra-client` | `/vi/cassandra-client` | DB (wide-column) | Cassandra/ScyllaDB GUI; Amazon Keyspaces | "Cassandra and ScyllaDB client for Mac" | CQL; contact points; Keyspaces SigV4; TLS/mTLS; edits to scalar columns only; add and drop columns; floor 3.0. Not supported: a consistency-level field, MVs or UDTs in the sidebar, Astra secure bundle, import. **#scylladb** (same driver, `scylladb://`); docs at `/databases/cassandra` | engines[cassandra, scylladb] | mac-db-cassandra-table | /databases#wide-column, docs `cassandra` ↗ | yes (pair) |
| `/redshift-client` | `/vi/redshift-client` | DB (warehouse) | Amazon Redshift client for Mac | "Amazon Redshift client for Mac" | Bundled PostgreSQL driver; Serverless workgroups; DISTKEY and SORTKEY in DDL; external tables read-only; structure read-only; EXPLAIN as raw text; **no AWS IAM**; pg_dump backup; dashboard. iPhone: opens only when synced from the Mac | engines[redshift] | mac-db-redshift-ddl | /postgresql-client, /features/import-export#backup, docs ↗ | yes (pair) |
| `/cloudflare-d1-client` | `/vi/cloudflare-d1-client` | DB (cloud SQL) | Cloudflare D1 GUI for Mac. Absorbs `/blog/cloudflare-d1-mac` | "Cloudflare D1 client for Mac" | Account ID, API token and database; every D1 database in the account in one list; SQLite dialect; **no session state or transactions** (each statement stands alone); EXPLAIN QUERY PLAN; tables, indexes and triggers; no import; no SSH. A "D1 specifics" section keeps only the parts of the old post that are verified | engines[cloudflare-d1] | mac-db-d1-databases | /sqlite-client, /turso-client, docs ↗ | yes (pair) |
| `/turso-client` | `/vi/turso-client` | DB (cloud SQL) | Turso/libSQL GUI | "Turso and libSQL client for Mac" | Remote over Hrana HTTP with a token, or a local file; `libsql://`; tables, columns, indexes, triggers. Not supported: database switching, branches, embedded-replica sync, transactions on remote. **#libsql** section | engines[turso, libsql] | mac-db-turso-remote | /sqlite-client, docs `libsql` ↗ | yes (pair) |
| `/dynamodb-gui` | `/vi/dynamodb-gui` | DB (key-value) | DynamoDB GUI for Mac; DynamoDB Local | "Amazon DynamoDB GUI for Mac" | PartiQL plus DynamoDB API JSON; access key, profile, SSO or STS; DynamoDB Local through a custom endpoint; one account and region per connection; the planner shows Query vs Scan with read capacity; typed conditional edits; create and change tables; maintenance (PITR, deletion protection). Not supported: DAX, import, truncate. No SSH | engines[dynamodb] | mac-db-dynamodb-planner | /features/connections#cloud-auth, docs ↗ | yes (pair) |
| `/bigquery-client` | `/vi/bigquery-client` | DB (warehouse) | BigQuery client for Mac; "dry run cost" | "Google BigQuery client for Mac" | GoogleSQL; service-account key, ADC or OAuth (with your own client); Location; **Max Bytes Billed**; **Dry Run (cost)** in the Explain menu; structure read-only (DDL in the editor); export to `gs://` server-side; no transactions or SSH | engines[bigquery] | mac-db-bigquery-dry-run | /features/import-export#backup, docs ↗ | yes (pair) |
| `/snowflake-client` | `/vi/snowflake-client` | DB (warehouse) | Snowflake GUI for Mac | "Snowflake client for Mac" | Password plus TOTP passcode (Duo passcode only), key pair, browser SSO, OAuth; `connections.toml`; warehouse and role through Session Context; stage export; EXPLAIN as raw text; limited structure edits; no SSH | engines[snowflake] | mac-db-snowflake-session | /features/connections#cloud-auth, docs ↗ | yes (pair) |
| `/etcd-gui` | `/vi/etcd-gui` | DB (coordination) | etcd GUI/browser | "etcd GUI for Mac" | A subset of etcdctl over the v3 JSON gateway; keys under a prefix root; put and delete; leases; member list; watch collects until a timeout; TLS/mTLS; floor 3.2. Not supported: `txn`, import, gRPC. Every command counts as a write | engines[etcd] | mac-db-etcd-keys | /features/data-editing#safe-mode, docs ↗ | yes (pair) |
| `/elasticsearch-client` | `/vi/elasticsearch-client` | DB (search) | Elasticsearch GUI for Mac | "Elasticsearch client for Mac" | Query DSL console (method, path, JSON); indices as tables; edit documents by `_id`; Basic or API key; HTTPS modes; 7.x and 8.x. Not supported: SSH, OpenSearch, aliases and data streams in the sidebar. Points to the hub rows for Typesense and Weaviate | engines[elasticsearch] | mac-db-elasticsearch-console | /databases#search, docs ↗ | yes (pair) |
| `/surrealdb-client` | `/vi/surrealdb-client` | DB (document/multi-model) | SurrealDB GUI | "SurrealDB client for Mac" | SurrealQL (no syntax highlighting); root, NS, DB, record and token auth; HTTP RPC with CBOR; SSH; field-level UPDATE edits; structure read-only; floor 2.0. Not supported: live queries, multi-request transactions | engines[surrealdb] | mac-db-surrealdb-query | docs ↗ | yes (pair) |
| `/teradata-client` | `/vi/teradata-client` | DB (warehouse) | Teradata client for Mac | "Teradata client for Mac" | TD2/TDNEGO; TLS moves to a WebSocket on 443; TOP/QUALIFY paging; **procedures and macros are listed** (macros under Functions); create and alter tables; EXPLAIN as raw text. Not supported: FKs in the sidebar; LDAP, Kerberos and JWT are refused | engines[teradata] | mac-db-teradata-sidebar | docs ↗ | yes (pair) |
| `/trino-client` | `/vi/trino-client` | DB (query engine) | Trino GUI | "Trino client for Mac" | Cross-catalog SQL over the v1 REST API; user/password or JWT over TLS; client certificate; 5 EXPLAIN variants; exact bigint and decimal; edits depend on the connector. Not supported: Presto, Kerberos, OAuth, import | engines[trino] | mac-db-trino-catalogs | docs ↗ | yes (pair) |
| `/beancount-client` | `/vi/beancount-client` | DB (ledger file) | "Query a Beancount ledger with SQL" | "Query a Beancount ledger with SQL" | SQL over the projected tables (the count comes from data: 23) plus a `BQL:` prefix; needs rledger or Python beancount; include globs; always read-only; no import, SSH or SSL | engines[beancount] | mac-db-beancount-bql | /duckdb-client, docs ↗ | yes (pair) |
| `/kafka-client` **(new)** | `/vi/kafka-client` | DB (streaming) | Kafka GUI for Mac; "browse Kafka topics" | "Apache Kafka client for Mac" | **No table or editing narrative.** KafkaQL `CONSUME`/`PRODUCE`/`SHOW`/`DESCRIBE`; topics, partitions, consumer-group lag; produce through KafkaQL; dropping a topic is the only destructive action; PLAINTEXT/SSL/SASL (PLAIN, SCRAM); SSH pins to the bootstrap broker; floor 0.11. Not supported: Schema Registry, topic create, offset reset, import; counts are approximate | engines[kafka] | mac-db-kafka-consume | /databases#streaming, /features/querying#other-languages, docs ↗ | yes (pair) |

### A.4 Comparisons

Each comparison follows blueprint §E.3. The facts come from each vendor's own pages, and each fact carries its own check date.

| Path EN | Path VI | Family | Intent / search need | H1 (EN) | Sections: §E.3, plus what the page must say | Data | Slots | Key internal links | Indexable |
|---|---|---|---|---|---|---|---|---|---|
| `/compare` **(new)** | `/vi/compare` | Compare hub | "TablePro vs …", "database client for Mac comparison", "open-source database GUI Mac". Absorbs `/blog/open-source-db-clients-2026` | "Compare TablePro with other database clients" | 1) Intro and "Facts checked {date}" 2) Choose by situation (`#by-situation`): one "Choose X if" line per product 3) At a glance (`#at-a-glance`): product, platforms, licence, free tier, paid model (dated), link 4) **Open-source clients on Mac** (`#open-source`): DBeaver CE, Beekeeper Community, Sequel Ace, HeidiSQL, phpMyAdmin, Sequel Pro (discontinued) and TablePro (AGPLv3), each with licence, status and last release (dated) 5) Switching to TablePro (`#switching`): importers named, link to /features/connections#import 6) How these pages are written (`#method`): official sources, dates, no benchmarks | comparisons, pricing, engines | none | all 10 comparison pages, /features/connections#import, /pricing | yes (pair) |
| `/compare/tableplus` | `/vi/compare/tableplus` | Compare | TablePlus vs TablePro | "TablePro vs TablePlus" | A native client against a native client. TablePlus's free tier limits (2 tabs, windows, filters) against TablePro's paid features; $99 per device plus $59 renewal against Starter; iOS in-app purchases; TablePlus on Windows and Linux; TablePlus has AI, MCP, a diagram and Excel export; TablePro imports TablePlus connections including passwords | comparisons[tableplus] | none | /pricing, /features/connections#import, /ios | yes (pair) |
| `/compare/dbeaver` | `/vi/compare/dbeaver` | Compare | DBeaver vs TablePro on Mac | "TablePro vs DBeaver" | DBeaver wins on cross-platform reach and JDBC breadth. CE is free under Apache 2.0, has no NoSQL and bundles a JDK; PRO prices; AI and MCP in CE vs paid; download sizes from release assets (dated). TablePro imports DBeaver connections including passwords. No RAM or startup figures | comparisons[dbeaver] | none | /features/ai-mcp, /databases, /features/connections#import | yes (pair) |
| `/compare/datagrip` | `/vi/compare/datagrip` | Compare | DataGrip vs TablePro | "TablePro vs DataGrip" | An IDE against a client. Prices ($109/$87/$65, $10.90/mo); free for non-commercial use (with telemetry); AI and MCP since 2025.2; Git; refactoring. TablePro imports DataGrip connections; Compare & Sync is Starter | comparisons[datagrip] | none | /features/schema#compare-sync, /pricing | yes (pair) |
| `/compare/navicat` | `/vi/compare/navicat` | Compare | Navicat vs TablePro | "TablePro vs Navicat" | Navicat Premium Lite (free, commercial use allowed) against the TablePro free core; Premium perpetual $1,499/$1,999 against Starter; AI Assistant; sync with scheduling and modeling; per-engine iOS apps; TablePro imports `.ncx` | comparisons[navicat] | none | /pricing, /features/schema | yes (pair) |
| `/compare/beekeeper-studio` | `/vi/compare/beekeeper-studio` | Compare | Beekeeper vs TablePro | "TablePro vs Beekeeper Studio" | An open-source cross-platform peer (Electron). Tiers, with AI in Pro; Beekeeper has ER and Vim; TablePro imports Beekeeper connections. Apple Silicon and Intel builds (not "Universal") | comparisons[beekeeper-studio] | none | /features/ai-mcp, /download | yes (pair) |
| `/compare/sequel-ace` | `/vi/compare/sequel-ace` | Compare | Sequel Ace vs TablePro (MySQL on Mac) | "TablePro vs Sequel Ace" | Both are free, active and native. Sequel Ace: MIT, App Store, MySQL and MariaDB only, MCP server (19 tools, read-only by default), macOS 13.5+. TablePro: more engines, AI chat, the iPhone app, and paid features. No cadence jabs | comparisons[sequel-ace] | none | /compare/sequel-pro, /mysql-client | yes (pair) |
| `/compare/sequel-pro` | `/vi/compare/sequel-pro` | Compare (alternatives) | "Sequel Pro alternative", "Sequel Pro Apple Silicon" | "Sequel Pro alternatives for Mac" | Not a head-to-head. Status with dates: last release 1.1.2 (2016), Intel-only, the Homebrew cask removed, the site down. **Sequel Ace is the direct successor.** When TablePro fits better; HeidiSQL now runs on Mac. Migration path: Sequel Pro → Sequel Ace → TablePro import. FAQ | comparisons[sequel-pro] | none | /compare/sequel-ace, /compare/heidisql, /mysql-client | yes (pair) |
| `/compare/postico` | `/vi/compare/postico` | Compare | Postico vs TablePro (Postgres on Mac) | "TablePro vs Postico" | Postico is a focused Postgres client: perpetual price table, App Store, untimed evaluation, iCloud/Dropbox sync, no admin tasks, macOS 14+. TablePro: multi-engine, Users & Roles, dashboard; iCloud Sync is Starter | comparisons[postico] | none | /postgresql-client, /features/schema#administer | yes (pair) |
| `/compare/heidisql` | `/vi/compare/heidisql` | Compare | "HeidiSQL for Mac" | "TablePro vs HeidiSQL" | HeidiSQL is free (GPL) and cross-platform, with a Windows heritage; its macOS arm64 build dates from January 2026 and there is no Intel build. TablePro: Intel and Apple Silicon, Mac conventions, more engines. Rewritten from scratch | comparisons[heidisql] | none | /mysql-client, /download | yes (pair) |
| `/compare/phpmyadmin` | `/vi/compare/phpmyadmin` | Compare | "phpMyAdmin alternative Mac" | "TablePro vs phpMyAdmin" | A web admin tool against a desktop client. phpMyAdmin's strengths (cPanel, Designer, languages) and its own hardening guidance; status (5.2.3, 6.0 in development); a paragraph on **Adminer**. TablePro: nothing to install on the server, SSH. No fear-based rows | comparisons[phpmyadmin] | none | /mysql-client, /features/connections#network | yes (pair) |

### A.5 Blog (release archive, English only)

| Path EN | Path VI | Family | Intent | H1 (EN) | Sections | Data | Slots | Key internal links | Indexable |
|---|---|---|---|---|---|---|---|---|---|
| `/blog` | — (see next row) | Blog index | Release news; "TablePro 0.7x" | "Blog" | 1) One line: release announcements, with every version's notes in the docs changelog ↗ 2) Posts, newest first: title, date, description 3) Newsletter signup (`newsletter_signup_clicked{source:'blog'}`) | `resources/blog/*.md` front matter | none | posts, changelog ↗ | yes (EN only) |
| — | `/vi/blog` | Blog listing (VI chrome) | Navigation from the VI site to the English archive | "Blog" (VI: "Blog") | A Vietnamese intro stating the posts are in English. The list has `lang="en"` on each entry, a "(tiếng Anh)" label and links to `/blog/{slug}` with `hreflang="en"` | same | none | `/blog/*` | **noindex, follow**; not in the sitemap; no hreflang pair, because the main content is untranslated |
| `/blog/tablepro-0-77` · `/blog/tablepro-0-76` · `/blog/tablepro-0-74` · `/blog/tablepro-0-73` · `/blog/tablepro-0-72` · `/blog/tablepro-0-70` · `/blog/tablepro-0-69` · `/blog/tablepro-0-68` · `/blog/tablepro-0-67` · `/blog/tablepro-for-iphone` | none (`/vi/blog/{slug}` returns 404) | Release post | Release-specific searches; links from release mail | The post title, unchanged | Body unchanged, keeping its original `datePublished`. Added (§E.6): a dated archive note ("Describes TablePro 0.74 as released on 13 Sep 2026; see Features for today's app"); figures become placeholder slots; a current CTA block built from data; an **editor's correction** only for claims that were never true (one today: the 0.74 description "nothing leaving your Mac", because map tiles are requested from Apple) | the post's markdown; platforms (CTA) | `blog-{slug}-{n}`, one per existing figure, with the existing image files kept as source | /features (matching area), /download, changelog ↗ | yes (EN only) |

### A.6 Legal

Each Vietnamese legal page is a faithful translation and states near the top that **the English version prevails** if the two differ (spec §0).

| Path EN | Path VI | Family | Intent | H1 (EN) | Sections | Data | Slots | Key internal links | Indexable |
|---|---|---|---|---|---|---|---|---|---|
| `/privacy` | `/vi/privacy` | Legal | Privacy policy. Linked from the iOS 1.0 binary and the App Store listing | "Privacy policy" | Rewritten to describe current behaviour exactly. Anchors: `#website` (consent, GA, Cloudflare; Crisp loads only when you click chat; **purchase attribution**: the browser keeps a first-touch `tablepro:attribution` record (source or `ref`, the `utm_*` tags, referrer, landing page, first-seen time) in localStorage for 90 days and sends it with `POST /checkout`, and the server ignores it. Polar and Lemon Squeezy receive none of it. The policy says only that. The old "so we know which writing and which links pay for the work" (`Privacy.tsx:288`) is not carried over (§E.7). If the platform ever starts storing attribution, this section changes first), `#mac-app` (daily usage report on by default; the license check payload every 7 days including the Mac's name; update feed on GitHub; plugin catalogue; AI providers; Apple map tiles; iCloud), `#ios-app` (Share Usage Data off by default), `#purchases` (Polar is merchant of record), `#account`, `#newsletter`, **`#cookies`** (kept: the consent bar links here; the list rebuilt from a rendered cookie jar; its `tablepro:attribution` entry repeats the `#website` wording), `#retention`, `#rights`, `#contact` | pricing (merchant), facts | none | /account?locale=, /terms, /refund-policy | yes (pair) |
| `/terms` | `/vi/terms` | Legal | Terms of service | "Terms of service" | Consistent with Priority support (`#support`: Team emails answered first, within one business day), the license terms and the AGPL wording | pricing | none | /privacy, /refund-policy, /pricing | yes (pair) |
| `/refund-policy` | `/vi/refund-policy` | Legal | Refund terms | "Refund policy" | 7 days on every plan; how to ask; what happens to the license and how to cancel a subscription; Polar's role | pricing (`refund.days`) | none | /pricing#refunds, /account?locale= | yes (pair) |

### A.7 System responses and crawler files

| Path | Response | Notes |
|---|---|---|
| any unknown path | **404**, branded, `noindex` | EN under `/`, VI under `/vi/*`. Links: home, Features, Databases, Download, Blog. On `/vi/blog/{slug}` where an English post exists, the 404 body says "Bài viết này chỉ có bằng tiếng Anh" and links the post with "Đọc bản tiếng Anh" (positioning §4). On `/vi/account*` and `/vi/checkout*`, the VI 404 links `/account?locale=vi` (no `/vi/account` route, per spec §0) |
| `/compare/azimutt` | **410**, branded, `noindex` | "This comparison was removed", with a link to /compare |
| `/robots.txt` | 200 | Unchanged: `Allow: /`, plus both sitemaps (this site and `docs.tablepro.app`). Never used for access control |
| `/sitemap.xml` | 200 | §F |
| `/up` | 200 | Health route; not in the sitemap |

### A.8 Placeholder slot catalogue

These are the proposed asset IDs. `docs/visual-assets.md` owns the full brief for each one: the scene, light and dark variants, export sizes and the final filename. The visible label is the short description below, in the page's locale.

- **Datasets:**
  - **Chinook**: the bundled SQLite sample.
  - **shop**: a PostgreSQL/MariaDB demo schema. Its files are not in the public TablePro repository.
  - **places**: PostGIS with Natural Earth populated places.
  - Fictional hosts under `*.acme.internal`.
- **Aspect ratios:** full Mac window 16:10; detail crop 3:2 or 4:3; iPhone 9:19.5; iPad 4:3; diagram or composite 16:9.

| ID | Type | Aspect | Used on | Short description (EN) | Short description (VI) |
|---|---|---|---|---|---|
| mac-hero-window | screenshot | 16:10 | / hero (≥768px) | TablePro on Mac with the shop sample database (PostgreSQL): the orders table, a query in the editor and its results. | TablePro trên Mac với cơ sở dữ liệu mẫu shop (PostgreSQL): table orders, một query trong editor và kết quả của nó. |
| mac-hero-window-mobile | crop | 4:5 | / hero (<768px) | Close-up of the same window: the query and the first result rows. | Cận cảnh cùng cửa sổ: câu query và các dòng kết quả đầu tiên. |
| mac-query-autocomplete | screenshot | 16:10 | /#features, /features/querying | SQL editor on shop: a CTE joined to orders, with autocomplete listing the CTE's columns. | SQL editor trên shop: một CTE join với orders, autocomplete gợi ý các cột của CTE. |
| mac-query-parameters-history | crop | 3:2 | /features/querying | A query with :customer_id and :since parameters, their value panel and the history drawer. | Query có tham số :customer_id và :since, bảng nhập giá trị và ngăn lịch sử query. |
| mac-explain-compare | crop | 3:2 | /features/querying | EXPLAIN Compare on shop.orders: the plan changed from Index Scan to Seq Scan after an index was dropped. | EXPLAIN Compare trên shop.orders: plan đổi từ Index Scan sang Seq Scan sau khi xóa một index. |
| mac-query-insights | screenshot | 16:10 | /features/querying | Query Insights for the last 7 days, with one query shape flagged as Got Slower. | Query Insights trong 7 ngày qua, một dạng query được đánh dấu Got Slower. |
| mac-result-chart | crop | 3:2 | /features/querying | Monthly revenue from shop.orders as a line chart, one series per order status. | Doanh thu theo tháng từ shop.orders dưới dạng biểu đồ đường, mỗi trạng thái đơn hàng một series. |
| mac-result-map | crop | 3:2 | /features/querying, /postgresql-client | Populated places from a PostGIS table on the Map view, with the selection synced to the grid. | Các địa điểm dân cư từ một table PostGIS trên Map view, vùng chọn đồng bộ với data grid. |
| mac-edit-preview-sql | screenshot | 16:10 | /#features, /features/data-editing | Four staged price edits in shop.products and the Preview SQL sheet with their UPDATE statements. | Bốn thay đổi giá đang chờ lưu trong shop.products và bảng Preview SQL với các câu UPDATE tương ứng. |
| mac-grid-highlight-rules | crop | 3:2 | /features/data-editing | shop.orders with highlight rules: paid rows green, refunded rows orange, the rules popover open. | shop.orders với highlight rules: dòng paid màu xanh, dòng refunded màu cam, popover quy tắc đang mở. |
| mac-fk-picker | crop | 4:3 | /features/data-editing | The foreign key picker on orders.user_id, showing customers by last and first name. | Bộ chọn giá trị khóa ngoại trên orders.user_id, hiển thị khách hàng theo họ và tên. |
| mac-safe-mode-touchid | crop | 4:3 | /#safety, /features/data-editing | A production-tagged connection in Safe Mode asking for Touch ID before a DELETE runs. | Một connection gắn tag production ở mức Safe Mode, yêu cầu Touch ID trước khi chạy câu DELETE. |
| mac-data-rewind-review | crop | 3:2 | /features/data-editing | Restore Previous Values review: three rows will restore, one changed since the save. | Màn hình xem lại Restore Previous Values: ba dòng sẽ được khôi phục, một dòng đã thay đổi sau lần lưu. |
| mac-structure-ddl-preview | screenshot | 16:10 | /features/schema | Structure tab of shop.reviews with a staged CHECK constraint and a new index, the DDL preview open. | Tab Structure của shop.reviews với CHECK constraint và index mới đang chờ lưu, bản xem trước DDL đang mở. |
| mac-er-diagram | screenshot | 16:10 | /features/schema | ER diagram of the shop schema, product_tags drawn as a many-to-many link, the Export menu open. | ER diagram của schema shop, product_tags hiển thị như liên kết nhiều-nhiều, menu Export đang mở. |
| mac-compare-sync-structure | screenshot | 16:10 | /#features, /features/schema | Compare & Sync from shop to shop_staging: a column length difference and a DROP COLUMN held back. | Compare & Sync từ shop sang shop_staging: một khác biệt độ dài cột và một lệnh DROP COLUMN được giữ lại. |
| mac-copy-to-review | crop | 3:2 | /features/schema | Copy To from MariaDB shop to PostgreSQL shop_pg, listing type approximations before copying. | Copy To từ MariaDB shop sang PostgreSQL shop_pg, liệt kê các kiểu dữ liệu được chuyển gần đúng trước khi sao chép. |
| mac-users-roles-mysql | crop | 3:2 | /features/schema, /mysql-client | Users & Roles on MySQL: app_reader granted SELECT on one column, the SQL preview open. | Users & Roles trên MySQL: app_reader được cấp SELECT trên một cột, bản xem trước SQL đang mở. |
| mac-server-dashboard-postgresql | screenshot | 16:10 | /features/schema, /postgresql-client | Server Dashboard on PostgreSQL: active sessions, one long SELECT selected with Terminate. | Server Dashboard trên PostgreSQL: các session đang chạy, một câu SELECT chạy lâu được chọn cùng nút Terminate. |
| mac-data-files-window | screenshot | 16:10 | /#features, /features/import-export | Data Files window with orders.csv (20,000 rows) searched for "Hanoi": 2,498 matches. | Cửa sổ Data Files với orders.csv (20.000 dòng), tìm "Hanoi": 2.498 kết quả. |
| mac-data-files-statistics | crop | 3:2 | /features/import-export | Column statistics for the status column of orders.csv. | Thống kê cột status của orders.csv. |
| mac-import-mapping | crop | 3:2 | /features/import-export | Importing a CSV into shop.orders: the column mapping and the on-error choice. | Import file CSV vào shop.orders: ghép cột và lựa chọn khi gặp lỗi. |
| mac-export-dialog | crop | 3:2 | /features/import-export | The Export dialog with XLSX chosen for three tables of shop. | Hộp thoại Export chọn định dạng XLSX cho ba table của shop. |
| mac-backup-dump | crop | 3:2 | /features/import-export | Backup Dump of shop through pg_dump over the connection's SSH tunnel. | Backup Dump cơ sở dữ liệu shop bằng pg_dump qua SSH tunnel của connection. |
| mac-ai-chat | screenshot | 16:10 | /#ai, /features/ai-mcp | AI chat on shop answering "top 5 customers by revenue last month" with a query ready to apply. | AI chat trên shop trả lời "5 khách hàng có doanh thu cao nhất tháng trước" kèm query sẵn sàng đưa vào editor. |
| mac-agent-mode | screenshot | 16:10 | /features/ai-mcp | Agent mode session "Find orders with no items": three statements, one write waiting for Run. | Phiên Agent mode "Find orders with no items": ba câu lệnh, một lệnh ghi đang chờ bấm Run. |
| mac-mcp-settings | crop | 3:2 | /features/ai-mcp | Settings > Integrations: the MCP server running and the Claude Code setup snippet. | Cài đặt > Tích hợp (Settings > Integrations): MCP server đang chạy, kèm đoạn cấu hình cho Claude Code. |
| mac-connection-ssh-form | crop | 4:3 | /#features, /features/connections | Connection form, Network tab: SSH through bastion.acme.internal with one jump host. | Form connection, tab Network: SSH qua bastion.acme.internal với một jump host. |
| mac-connection-library | screenshot | 16:10 | /features/connections | Welcome window: Production and Staging groups, coloured tags and the Chinook sample. | Cửa sổ Welcome: nhóm Production và Staging, tag màu và cơ sở dữ liệu mẫu Chinook. |
| mac-import-other-app | crop | 4:3 | /features/connections | Import from Other App listing three DataGrip connections with their passwords found. | Import from Other App liệt kê ba connection từ DataGrip kèm mật khẩu đã tìm thấy. |
| mac-open-project-folder | crop | 4:3 | /features/connections | Open Project Folder on a Laravel project: .env and .env.production, the second marked Alert. | Open Project Folder trên một project Laravel: .env và .env.production, file thứ hai được đánh dấu Alert. |
| mac-tunnel-command | crop | 4:3 | /features/connections | The Network tab with the kubectl port-forward preset filled in for svc/orders-db. | Tab Network với mẫu kubectl port-forward đã điền cho svc/orders-db. |
| diagram-icloud-sync | diagram | 16:9 | /features/sync-and-teams, /ios | Diagram: connections, groups and tags syncing between Mac, iCloud and iPhone; passwords only with Sync Passwords on. | Sơ đồ: connection, nhóm và tag đồng bộ giữa Mac, iCloud và iPhone; mật khẩu chỉ đồng bộ khi bật Sync Passwords. |
| mac-team-library | crop | 3:2 | /features/sync-and-teams | Favorites sidebar with a Team Library section: three saved queries labelled by who published them. | Sidebar Favorites có mục Team Library: ba query đã lưu, ghi tên người chia sẻ. |
| mac-handoff-ios | composite | 16:9 | /features/sync-and-teams, /ios | Handoff: the Chinook Track table open on iPhone, offered in the Mac Dock. | Handoff: table Track của Chinook đang mở trên iPhone, xuất hiện trong Dock của Mac. |
| mac-engine-picker | crop | 4:3 | /databases | The new-connection type chooser: relational engines, with MongoDB marked Not Installed. | Hộp chọn loại connection: nhóm relational, MongoDB được ghi Not Installed. |
| mac-db-postgresql-explain | crop | 3:2 | /postgresql-client | EXPLAIN ANALYZE diagram for a query on shop.orders, with cost bars. | Sơ đồ EXPLAIN ANALYZE cho một query trên shop.orders, kèm thanh chi phí. |
| mac-db-mysql-query | screenshot | 16:10 | /mysql-client | MySQL: orders joined to users in the shop database, results below. | MySQL: query join orders với users trong cơ sở dữ liệu shop, kết quả bên dưới. |
| mac-db-sqlite-chinook | screenshot | 16:10 | /sqlite-client | The bundled Chinook SQLite sample with the Track table filtered by genre. | Cơ sở dữ liệu mẫu Chinook (SQLite) đi kèm ứng dụng, table Track được lọc theo thể loại. |
| mac-db-mongodb-document | screenshot | 16:10 | /mongodb-client | The Insert Document sheet in Extended JSON over the events collection. | Bảng Insert Document dạng Extended JSON trên collection events. |
| mac-db-redis-keys | screenshot | 16:10 | /redis-gui | Redis key tree split on ":" with type, TTL and value columns. | Cây key Redis phân theo dấu ":" với các cột type, TTL và value. |
| mac-db-sqlserver-script | crop | 3:2 | /sql-server-client | A T-SQL script with GO batches and PRINT output in the Output pane. | Script T-SQL với các batch GO và kết quả PRINT trong khung Output. |
| mac-db-oracle-plsql | crop | 3:2 | /oracle-client | A PL/SQL block with DBMS_OUTPUT lines in the Output pane. | Một khối PL/SQL với các dòng DBMS_OUTPUT trong khung Output. |
| mac-db-clickhouse-parts | crop | 3:2 | /clickhouse-client | The Parts tab of a MergeTree table: partitions, parts and row counts. | Tab Parts của một table MergeTree: partition, part và số dòng. |
| mac-db-duckdb-parquet | crop | 3:2 | /duckdb-client | A Parquet file opened in DuckDB as a view and queried with SQL. | File Parquet mở trong DuckDB dưới dạng view và được query bằng SQL. |
| mac-db-cassandra-table | crop | 3:2 | /cassandra-client | A Cassandra table browsed with CQL; scalar columns are editable. | Duyệt một table Cassandra bằng CQL; các cột kiểu đơn có thể sửa. |
| mac-db-redshift-ddl | crop | 3:2 | /redshift-client | A Redshift table's DDL with DISTKEY and SORTKEY; the structure is read-only. | DDL của một table Redshift với DISTKEY và SORTKEY; structure ở chế độ chỉ đọc. |
| mac-db-d1-databases | crop | 3:2 | /cloudflare-d1-client | Every D1 database in the account in the sidebar, one open in the editor. | Tất cả cơ sở dữ liệu D1 trong tài khoản hiển thị ở sidebar, một cơ sở dữ liệu đang mở trong editor. |
| mac-db-turso-remote | crop | 3:2 | /turso-client | A remote Turso database: tables in the sidebar and a query result. | Một cơ sở dữ liệu Turso từ xa: các table trong sidebar và kết quả query. |
| mac-db-dynamodb-planner | crop | 3:2 | /dynamodb-gui | The DynamoDB planner choosing Query over Scan, with estimated read capacity. | Planner của DynamoDB chọn Query thay vì Scan, kèm read capacity ước tính. |
| mac-db-bigquery-dry-run | crop | 3:2 | /bigquery-client | BigQuery Dry Run from the Explain menu: bytes processed and estimated cost. | Dry Run của BigQuery từ menu Explain: số byte xử lý và chi phí ước tính. |
| mac-db-snowflake-session | crop | 3:2 | /snowflake-client | A Snowflake connection with warehouse and role set in Session Context, a result below. | Connection Snowflake với warehouse và role đặt trong Session Context, kết quả bên dưới. |
| mac-db-etcd-keys | crop | 3:2 | /etcd-gui | etcd keys under a prefix root with their values and leases. | Các key etcd dưới một prefix gốc, kèm value và lease. |
| mac-db-elasticsearch-console | crop | 3:2 | /elasticsearch-client | Query DSL console: a GET _search request and its hits as rows. | Console Query DSL: một request GET _search và các hit hiển thị thành dòng. |
| mac-db-surrealdb-query | crop | 3:2 | /surrealdb-client | A SurrealQL query and its records in the grid. | Một query SurrealQL và các record trong data grid. |
| mac-db-teradata-sidebar | crop | 3:2 | /teradata-client | The Teradata sidebar listing procedures, with macros under Functions. | Sidebar Teradata liệt kê procedure, và macro trong mục Functions. |
| mac-db-trino-catalogs | crop | 3:2 | /trino-client | A Trino query joining tables from two catalogs. | Một query Trino join các table từ hai catalog. |
| mac-db-beancount-bql | crop | 3:2 | /beancount-client | A Beancount ledger's projected tables with a BQL query result. | Các table được dựng từ sổ Beancount và kết quả một query BQL. |
| mac-db-kafka-consume | crop | 3:2 | /kafka-client | KafkaQL CONSUME on an orders topic: partition, offset, key and value. | KafkaQL CONSUME trên topic orders: partition, offset, key và value. |
| ios-connection-list | iPhone | 9:19.5 | /#platforms, /ios hero | TablePro on iPhone: Favorites with the Chinook sample, a Production group and tagged connections. | TablePro trên iPhone: mục Favorites có cơ sở dữ liệu mẫu Chinook, nhóm Production và các connection có tag. |
| ipad-table-browse | iPad | 4:3 | /ios hero | TablePro on iPad showing the Chinook Track table. | TablePro trên iPad hiển thị table Track của Chinook. |
| ios-table-browse | iPhone | 9:19.5 | /ios#browse | The Chinook Track table filtered by genre, with row cards and the page range. | Table Track của Chinook lọc theo thể loại, hiển thị dạng thẻ và khoảng trang. |
| ios-row-edit | iPhone | 9:19.5 | /ios#browse | Editing a track with Composer set to NULL and a link to the related album. | Sửa một track, đặt Composer thành NULL, kèm liên kết tới album liên quan. |
| ios-query | iPhone | 9:19.5 | /ios#query | A grouped SQL query and its results in the Query tab. | Một query SQL có GROUP BY và kết quả trong tab Query. |
| ios-live-activity | iPhone | 9:19.5 | /ios#query | A running query as a Live Activity on the Lock Screen, with elapsed time and rows received. | Một query đang chạy hiển thị dạng Hoạt động trực tiếp trên Màn hình khóa, kèm thời gian đã chạy và số dòng đã nhận. |
| ios-connection-form | iPhone | 9:19.5 | /ios#security | A new PostgreSQL connection with Read-Only Safe Mode, SSL and an SSH tunnel. | Connection PostgreSQL mới với Safe Mode Read-Only, SSL và SSH tunnel. |
| ios-safe-mode-confirm | iPhone | 9:19.5 | /ios#safe-mode | Confirm Writes asking before an UPDATE runs. | Confirm Writes hỏi lại trước khi chạy câu UPDATE. |
| ipad-two-windows | iPad | 4:3 | /ios#ipad | Two TablePro windows side by side on iPad. | Hai cửa sổ TablePro đặt cạnh nhau trên iPad. |
| ios-widgets | iPhone | 9:19.5 | /ios#automation | Quick Connect widgets on the Home Screen. | Tiện ích Quick Connect trên Màn hình chính. |
| ios-shortcuts-add-rows | iPhone | 9:19.5 | /ios#automation | A Shortcuts action that adds CSV rows to a table. | Một tác vụ trong ứng dụng Phím tắt thêm các dòng CSV vào table. |
| ios-settings-privacy | iPhone | 9:19.5 | /ios#privacy | Settings on iPhone: Face ID lock and iCloud Sync on, usage data sharing off. | Cài đặt (Settings) trên iPhone: bật khóa Face ID và iCloud Sync, tắt chia sẻ dữ liệu sử dụng. |
| blog-{slug}-{n} | per figure | from the source image | each release post | Derived from the figure's existing caption and alt text | Not localized (the post is English only) |
| og-{family}-{slug}, og-vi-{family}-{slug}, og-site-en, og-site-vi | OG card (generated) | 1200×630 | {family}-{slug}: each feature, database and compare page (both locales) and each kept post (EN). og-site-{locale}: every other indexable page (§C.7) | Generated by `og:generate` templates for EN and VI; bespoke art goes through the asset handoff | — |

Not slots, because they are identity assets: the logo, favicon, database vendor marks, sponsor logos and the official App Store badges (the Vietnamese badge must be Apple's official Vietnamese artwork).

---

## B. Navigation, switching and cross-app links

### B.1 Header (desktop, ≥1024px)

`[Logo → / or /vi]` · **Features ▾** · Databases · Pricing · Docs ↗ · Blog · (spacer) · **Language** · **Theme** · Account · **[Download]**

| Item | EN | VI | Target | Notes |
|---|---|---|---|---|
| Features | Features | Tính năng | disclosure panel | A `<button aria-expanded>` that opens a list of links: All features (/features), Querying, Data editing, Schema, Import & export, AI & MCP, Connections, Sync & teams, **iPhone & iPad** (/ios). Esc closes it and focus returns to the button |
| Databases | Databases | Cơ sở dữ liệu | /databases | |
| Pricing | Pricing | Bảng giá | /pricing | |
| Docs | Docs ↗ | Tài liệu ↗ | https://docs.tablepro.app | External. On VI the link has `hreflang="en"` and the accessible name "Tài liệu (tiếng Anh)" |
| Blog | Blog | Blog | /blog or /vi/blog | |
| Language | current name ▾ | current name ▾ | §B.4 | A disclosure of two `<a>` links, "English" and "Tiếng Việt", with `lang`, `hreflang` and `aria-current`. No flags and no codes |
| Theme | icon button ▾ | same | Light / Dark / System | Visible labels in the menu: Light, Dark, System (VI: Sáng, Tối, Theo hệ thống). Writes localStorage `theme`; light is the default when nothing is stored |
| Account | Account | Tài khoản | `/account?locale={pageLocale}` | A plain `<a>` (cross-app) |
| Download | Download | Tải về | /download or /vi/download | Primary button; fires `download_click{location:'header', platform:'mac'}`. "Tải về" everywhere, matching Apple's Vietnamese (positioning §2, §4); the `/download` architecture buttons read "Tải bản cho Apple silicon" and "Tải bản cho Intel" |

### B.2 Mobile (<1024px)

Collapsed bar: logo · [Download] (compact) · menu button (36×36 minimum target, `aria-expanded`, `aria-controls`).

The open panel lists, in order: Features (expands to the same 9 links), Databases, Pricing, iPhone & iPad, Docs ↗, Blog, FAQ, Account. Then "Download for Mac" (→ /download) and the App Store badge, firing `download_click{location:'mobile-nav'}` with platform `mac` and `ios`; on an iPhone or iPad the badge is drawn first. Last come **Language**, one row that opens the list of languages (a `<details>`; twelve rows pushed the download actions 1,273px down an 844px screen), and **Theme** as a 3-option segmented control.

In French, Portuguese, Spanish, German and Italian the desktop row is wider than a 1024px window, so those languages keep this bar and menu to 1152px (design-system §5.3.17).

### B.3 Footer (every public page)

The footer replaces the 11 comparison links and 26 database links with hubs, and every hub lists all of its children. Footer headings are not part of the content outline: they are `<h2 class="sr-only">Footer</h2>` followed by group labels as `<p>` or a `<nav aria-label>`, so they never nest under the last content H2.

| Group (EN / VI) | Links |
|---|---|
| Product / Sản phẩm | Features · Databases · iPhone & iPad · Pricing · Download · Compare |
| Resources / Tài nguyên | Documentation ↗ (VI: "Tài liệu (tiếng Anh)") · Changelog ↗ (docs `/changelog`) · Blog · FAQ · Source code ↗ (GitHub) · Report a bug ↗ (GitHub issues) |
| Support / Hỗ trợ | Account (`/account?locale=`) · Email (`hello@tablepro.app`) · Live chat (a button that loads Crisp only on click) |
| Community / Cộng đồng | Discord · X · Facebook · Telegram · Sponsor TablePro (GitHub Sponsors). The repository is linked once, as "Source code" under Resources |
| Legal / Pháp lý | Privacy · Terms · Refund policy · Cookie settings (a button that reopens the consent bar; key `tablepro:analytics-consent`) |

- **Newsletter block.** The form posts to `/newsletter/subscribe` with a `locale` field, following the `useEmailForm` pattern, and fires `newsletter_signup_clicked{source:'footer'}`. It shows **no subscriber count**. Fetching `/api/newsletter/stats` from public pages also sets platform cookies, so the footer does not call it. The endpoint itself stays available and unchanged.
- **Bottom row.** The FooterBar shared with the account app: "© {year} TablePro. Source code under AGPLv3." · the language menu, a `<details>` of plain links that opens without JavaScript · the theme control as icons (design-system §5.3.17).

### B.4 Language switcher behaviour

**Rules.**

- Every option is an `<a>` to a real URL.
- The URL alone carries the locale. There are no cookies and no redirects based on Accept-Language or IP.
- Section ids are locale-neutral (always English), so the current `#hash` is appended on click as a client-side enhancement. The server-rendered `href` carries no hash.
- Query strings are not carried across. `ref` and `utm_*` are captured on first touch already.

| Current page | "English" link | "Tiếng Việt" link | Visible fallback |
|---|---|---|---|
| Any paired page | the EN twin | the VI twin | — |
| `/blog` | self | `/vi/blog` | — |
| `/blog/{post}` (English only) | self | `/vi/blog` | The VI option carries a sublabel: "Bài viết này chỉ có bằng tiếng Anh · Xem danh sách Blog" |
| `/vi/blog` | `/blog` | self | — |
| 404 under `/` | self | `/vi` | — |
| 404 under `/vi` | `/` | self | — |
| 410 `/compare/azimutt` | self | `/vi/compare` | Sublabel: "Trang so sánh này đã bị gỡ" |

Two lists drive this. **`alternates`** (for hreflang) holds real translations only. **`switchTargets`** (for the switcher) always resolves to a URL. Both come from one PHP registry (`PageRegistry`, architecture §1.6) that is shared with the sitemap.

### B.5 Cross-application links (public ↔ account)

| From | Link | Contract |
|---|---|---|
| Public header, footer, /pricing, /faq, /privacy, /refund-policy | `/account?locale=en` or `/account?locale=vi` | The platform takes the language from `?locale` (architecture §2). Never Accept-Language or IP. |
| Public `fetch` calls | `POST /checkout`, `POST /discount/preview`, `POST /newsletter/subscribe` | Always the root paths, with `locale` in the JSON body. Never `/vi/checkout` |
| Mac app | `/?ref=app-…#pricing`, `/account`, `/download` | Unchanged. They land on the English root. The account falls back to session or stored preference |
| iOS 1.0 app, App Store listing | `/privacy` | Unchanged (EN). The VI twin is one click away through the switcher |
| Docs site | `/`, `/download`, `/#pricing`, `/account` | Unchanged |
| Account app header | logo → `/` or `/vi` (follows the account's active locale) | The account uses a **task-focused layout**: Overview, Machines, Team, Library, then the language control, the theme control (same `theme` key) and Sign out. It does **not** reuse the marketing header |
| Account app footer | Pricing, Docs ↗, Privacy, Terms, Refund policy, Contact | Prefixed with the account's locale |
| Platform `/thank-you`, `/newsletter/confirmed` | Download, Account, Blog, Home | Locale-aware public links; `noindex` |
| "Billing & invoices" (account) | https://polar.sh/tablepro/portal | Shown only for licenses bought through Polar (spec §0) |

**Theme across both apps.** Both use the same localStorage `theme` key on the same origin. Both head scripts default to light when nothing is stored, guard storage access with try/catch, and set the class before first paint. Screenshot variants follow the site's theme class, not `prefers-color-scheme`.

**License banner.** `config/banner.php` is on by default (owner decision, 2026-10-05), on every public page except /pricing in every language, and links to /pricing or to a release post. On /ios a reader on an iPhone or iPad does not get it: the license is for the Mac app. It asks a regular user to buy a license and says what a license adds and pays for; it never pleads. Its dismiss key `tablepro:banner-dismissed` holds the closed version and an end date: 30 days after closing, a year for a license holder or a buyer. The copy "The whole app is free" stays deleted.

---

## C. Disposition of every existing, historical and inbound URL

### C.1 Redirect and 410 rules

These apply to the public app only. Platform paths are routed by nginx before the public app ever sees them. Architecture §1.7 owns the mechanism and the map's file. This section owns the map's entries and the rules.

| Rule | Behaviour |
|---|---|
| Explicit routes, not middleware | Every retired URL is a route in `routes/web.php`. These routes are registered **before** the localized route groups and are never localized, because no `/vi/…` source ever existed. Each entry in `config/redirects.php` (`from`, `to` for a 301, `status` 301 or 410, `reason`) becomes one `Route::get(from)`. A 301 entry goes to `PermanentRedirectController` with its target, and a 410 entry goes to `GoneController`. That controller calls `abort(410)`, and the Inertia exception handler renders the branded Error page. Middleware cannot do this job. Web-group middleware runs only after a route has matched, so once `mariadb-client` leaves the database slug constraint, a middleware would never see `/mariadb-client`; the request would 404 first |
| Why `config/` | `routes/web.php` reads the map when routes are registered, so the redirect routes live inside `route:cache`. `scripts/deploy.sh:220` rebuilds the caches only when `PHP_CHANGED` matches `^(app/\|config/\|routes/\|bootstrap/\|resources/views/\|composer…)`. A map under `config/` always matches, so a deploy that changes only redirects still rebuilds `route:cache` and ships them. A JSON map under `resources/data/` would not match, so a redirect-only deploy would keep the old route cache and the new 301 or 410 would silently never ship. `DeployScriptTest` adds `config/redirects.php` to its `PHP_CHANGED` dataset as a pin |
| `/databases/{docsSlug}` | One route: `Route::get('/databases/{docsSlug}', DocsSlugRedirectController::class)->whereIn('docsSlug', DocsSlugs::ALL)`. `App\Support\Content\Slugs\DocsSlugs::ALL` is a PHP constant list, placed beside architecture §1.1's other slug classes for the same deploy-safety reason. The controller resolves the target from `engines.json` at request time: the engine page, its family anchor (`mariadb` → `/mysql-client#mariadb`) or its hub anchor (`spanner` → `/databases#spanner`). It shares the `Location` builder with `PermanentRedirectController`. A Pest test checks `DocsSlugs::ALL` against every `docsSlug` in `engines.json`, in both directions. An unknown `/databases/x` fails the constraint and returns 404. The four evidenced paths (`oracle`, `clickhouse`, `sqlite`, `duckdb`) go through this route and are not repeated in `config/redirects.php` |
| One hop, query kept | The `Location` is absolute and built from the canonical base: the target path, then the merged query (the target's own query first, then the request's raw query string), then the target's fragment. The query goes before the fragment. Tests cover `?ref=app-about&utm_source=x&utm_campaign=y`. `Route::redirect` and `permanentRedirect` are banned for these redirects, because they drop the query (`RedirectController.php:19-43`) |
| Trailing slash and `/index.php` | Nothing rewrites them. The router matches `/x/` to `/x`: `UriValidator::matches` trims the slash, and under `route:cache` `CompiledRouteCollection::requestWithoutTrailingSlash` does the same. Symfony also removes the `/index.php` script name from the path. So `/mariadb-client/` and `/index.php/mariadb-client` reach the redirect route and get one 301 to `/mysql-client#mariadb`. `/download/`, `/compare/`, `/vi/` and `/index.php/blog` return 200 with their slashless self-canonical, which is today's live behaviour. If a 301 for these variants is ever wanted, it must be global middleware (`$middleware->prepend`), never the `web` group. That is out of scope |
| No chains | Every redirect target must return 200 directly. A test follows each `Location` once and asserts 200. No `from` is another entry's target, and no `from` is a live route (the merged database slugs leave `DatabaseSlugs::ALL`, and `azimutt` leaves `CompareSlugs`) |
| No homepage fallback | Unknown paths return 404. Nothing redirects to `/` |
| Case | Uppercase paths stay **404** (no case folding; no evidence of inbound links) |
| Double slash | `//blog` stays 404 |
| Host and protocol | Host and protocol redirects happen outside the repo |
| Nothing only at the edge | Every redirect and 410 is versioned in the repo. Nothing lives only in Cloudflare |

### C.2 Core public pages

| URL | Evidence and inbound links | Disposition | Final destination | Status | Reason |
|---|---|---|---|---|---|
| `/` | Mac Help, MCP metadata, Homebrew, App Store seller URL, GitHub, Raycast, READMEs, registry `author.url`, docs, mail | rewrite | `/` (+ new `/vi`) | 200 | Repositioned per spec §5 |
| `/?ref=app-{support,about,settings,activation,gate-*}#pricing` | every Mac build from v0.68 to v0.77 | keep | `/` with `#pricing` | 200 | `id="pricing"` stays on the compact plan section. `ref` goes into the browser's first-touch `tablepro:attribution`, which checkout sends and the platform discards (§A.6) |
| `/#pricing` (bare) | Mac v0.22-v0.67, docs `licensing.mdx`, banner, nav | keep | `/#pricing` | 200 | Fragments cannot be redirected; the id stays |
| `/#features`, `/#databases`, `/#sponsors`, `/#top` | nav, platform copies, March 2026 nav | keep | the matching new home sections | 200 | The same ids are reused (§D) |
| `/#mobile`, `/#license`, `/#mcp`, `/#compare` | `/ios` links, `Download.tsx`, in-page links, old nav | keep as aliases | `#platforms`, `#pricing`, `#ai`, `#switch` | 200 | An empty alias anchor `<span id>` sits inside each target section, with no JavaScript hop |
| `/#safety`, `/#switch` | in-page | keep | the same ids | 200 | Equivalent sections exist |
| `/#specs`, `/#faq`, `/#footer-cta`, `/#livetype` | in-page or old nav only | drop the id | lands at the top of `/` | 200 | No equivalent section; harmless |
| `/download` | docs navbar ×2, purchase mail, org README, blog posts | rewrite | `/download` (+ `/vi/download`) | 200 | No auto-start; both architectures; Homebrew; iOS card |
| `/ios` | header, App Store era, launch post | rewrite (light) | `/ios` (+ VI) | 200 | Describe 1.0 only |
| `/privacy` (+ `#cookies`) | **iOS 1.0 binary**, App Store listing, consent bar | rewrite | `/privacy` (+ VI) | 200 | Must describe current behaviour; the `#cookies` id stays |
| `/terms` | footer | rewrite (light) | `/terms` (+ VI) | 200 | Consistent with Priority support and the AGPL |
| `/refund-policy` | footer, pricing | rewrite (wording) | `/refund-policy` (+ VI) | 200 | Keeps the 7-day promise; clearer |
| `/faq` | footer | rewrite | `/faq` (+ VI) | 200 | Stale counts and network claims fixed |
| `/blog` | header, footer | rewrite (index) | `/blog` (+ `/vi/blog` noindex) | 200 | Now a release archive |
| `/pricing` | a 302 to `/#pricing` on 2026-03-20, then 404; no inbound link found | new page | `/pricing` (+ VI) | 200 | A conventional pricing destination |
| `/features` | never routed | new | `/features` (+ VI) | 200 | Feature hub |
| `/databases` | never routed | new | `/databases` (+ VI) | 200 | Engine hub |
| `/compare`, `/compare/` | never routed (404) | new | `/compare` (+ VI); the slash form returns 200 with the slashless canonical, like every page (§C.1) | 200 | Comparison hub; absorbs the open-source roundup |
| `/robots.txt` | crawlers | keep | same | 200 | — |
| `/sitemap.xml` | robots | rewrite | same | 200 | Adds `/vi` URLs and alternates |
| `/sitemap-index.xml` | Astro era; in robots from 2026-03-11 to 03-23 | redirect | `/sitemap.xml` | 301 | A genuine replacement; crawlers may still hold it |
| `/sitemap-0.xml` | inferred only; no evidence | none | — | 404 | No evidence that it ever existed |
| `/up` | health | keep | same | 200 | Not in the sitemap |

### C.3 Database pages (all 26 existing; none was ever renamed)

| URL | Disposition | Final destination | Status | Reason |
|---|---|---|---|---|
| `/postgresql-client`, `/mysql-client`, `/sqlite-client`, `/mongodb-client`, `/redis-gui`, `/sql-server-client`, `/oracle-client`, `/clickhouse-client`, `/duckdb-client`, `/cassandra-client`, `/redshift-client`, `/cloudflare-d1-client`, `/turso-client`, `/dynamodb-gui`, `/bigquery-client`, `/snowflake-client`, `/etcd-gui`, `/elasticsearch-client` | **rewrite** (from the docs `.mdx` and `engines.json`) | same URL (+ `/vi/…`) | 200 | Each has a distinct workflow. The current copy holds about 70 invented or wrong claims. The SQL template block and the shared screenshot are removed |
| `/surrealdb-client`, `/teradata-client`, `/trino-client`, `/beancount-client` | **keep, light rewrite** (Teradata procedures and macros; Beancount table count from data; SurrealQL has no highlighting) | same (+ VI) | 200 | The docs-derived pages are already accurate |
| `/mariadb-client` | **merge** | `/mysql-client#mariadb` | 301 | Same driver and workflow; the page mostly duplicated MySQL. The MySQL page H1 names MariaDB |
| `/cockroachdb-client` | **merge** | `/postgresql-client#cockroachdb` | 301 | PG driver; the differences fit in a section |
| `/pglite-client` | **merge** | `/postgresql-client#pglite` | 301 | PG driver; the difference is setup (`pglite-socket`), not workflow |
| `/scylladb-client` | **merge** | `/cassandra-client#scylladb` | 301 | 44% duplicate of Cassandra; its docs link returns 404; one driver |
| `/kafka-client` | **new** | same (+ VI) | 200 | The most distinct workflow in the product; it had a grid tile with no page |
| `/libsql-client`, `/sap-hana-client`, `/hana-client`, `/mssql-client`, `/postgres-client` | none (never existed) | — | 404 | Probed: never routed, and no inbound links |

### C.4 Comparison pages (11 existing)

| URL | Disposition | Final destination | Status | Reason |
|---|---|---|---|---|
| `/compare/tableplus` | rewrite | same (+ VI) | 200 | The highest-intent comparison. It was 410 from 2026-05-04 to 08-17 and is 200 again; it stays 200 |
| `/compare/dbeaver`, `/compare/datagrip`, `/compare/navicat`, `/compare/beekeeper-studio`, `/compare/sequel-ace`, `/compare/postico`, `/compare/heidisql`, `/compare/phpmyadmin` | rewrite | same (+ VI) | 200 | Real choices. Benchmarks, adversarial copy and the `Review` schema go; facts get dates |
| `/compare/sequel-pro` | **rewrite with a new role** | same URL, "Sequel Pro alternatives" (+ VI) | 200 | The visitor's question is "Sequel Pro is gone, so what now?" The old page compared against the wrong product |
| `/compare/azimutt` | **remove** | — | **410** | A different category (a web schema explorer). TablePro's ER diagram is a read-only snapshot, not a replacement, so a 301 would send people to an irrelevant page (a soft-404 risk). A 301 was considered and rejected (410 unless a genuine replacement exists) |

### C.5 Blog (14 posts existing, plus slugs that never existed)

| URL | Disposition | Final destination | Status | Reason |
|---|---|---|---|---|
| `/blog/tablepro-0-77`, `-0-76`, `-0-74`, `-0-73`, `-0-72`, `-0-70`, `-0-69`, `-0-68`, `-0-67` | **keep (archive)** | same, English only | 200 | Release announcements keep their meaning and dates (spec §6). Figures become placeholders. 0-74 gets a dated correction note on its "nothing leaving your Mac" description |
| `/blog/tablepro-for-iphone` | **keep (archive)** | same, English only | 200 | The launch announcement. "The Mac app is on 0.75" was true at the time, so it is left as is and the archive note dates the post |
| `/blog/mcp-database-claude` | **merge** | `/features/ai-mcp#mcp` | 301 | Its useful parts (client setup, security model, a worked example) move to the feature page, which links the docs setup. Its stale facts (remote access, "must be running") are dropped. No guide translation is needed |
| `/blog/cloudflare-d1-mac` | **merge** | `/cloudflare-d1-client` | 301 | Same intent as the engine page. Unverified timings and the "sessions" claim are dropped |
| `/blog/mongodb-native-vs-compass` | **merge** | `/mongodb-client#compass` | 301 | The invented memory table and "Electron tax" are dropped; a fair "TablePro or Compass" section replaces them |
| `/blog/open-source-db-clients-2026` | **merge** | `/compare#open-source` | 301 | Every product it covered has a comparison page or a hub row; the hub's open-source section carries dated status. Its wrong TablePro facts are dropped |
| `/blog/tablepro-0-66`, `-0-71`, `-0-75` | none (never existed) | — | 404 | — |
| `/vi/blog/{any}` | none | — | 404 | No pseudo-translations. The 404 links the English post when one exists |
| `/feed`, `/blog/feed`, `/rss`, `/rss.xml`, `/atom.xml`, `/feed.xml`, `/blog/rss.xml` | none (no feed ever existed) | — | 404 | No new feed in scope |

### C.6 Retired, mis-linked and never-shipped URLs

| URL | Evidence and inbound links | Disposition | Final destination | Status | Reason |
|---|---|---|---|---|---|
| `/docs/raycast` | **the live Raycast extension "Pair" command** | redirect (external) | `https://docs.tablepro.app/external-api/raycast` | 301 | A genuine replacement for a broken live link |
| `/docs` | old README revisions (Feb 2026) | redirect (external) | `https://docs.tablepro.app/` | 301 | A genuine replacement |
| `/docs/logo/logo.png`, `/docs/images/hero-dark.png` | README, one day in Feb 2026 | none | — | 404 | No current reference |
| `/databases/oracle`, `/databases/clickhouse` | plugin registry `homepage`, 2026-03-10 to 03-14 | redirect (through the `/databases/{docsSlug}` route) | `/oracle-client`, `/clickhouse-client` | 301 | Genuine equivalents |
| `/databases/sqlite`, `/databases/duckdb` | CI only (2026-03-11) | redirect (through the `/databases/{docsSlug}` route) | `/sqlite-client`, `/duckdb-client` | 301 | Same rule |
| `/databases/{docsSlug}` (every other `docsSlug` in `engines.json`) | none (docs-style guesses) | redirect: one route constrained by `DocsSlugs::ALL`, with the target read from `engines.json` (§C.1) | the engine page, family anchor (for example `mariadb` → `/mysql-client#mariadb`) or hub anchor (`spanner` → `/databases#spanner`) | 301 | One rule that mirrors the docs URL shape. An unknown `/databases/x` returns 404 |
| `/?subscribe=true&source=mac` | never shipped | no action | `/` (query ignored) | 200 | Canonical `/` |
| `/?preview=<token>` | old pricing preview | no action | `/` (query ignored) | 200 | Canonical `/` |
| `/images/{connections,data-grid,databases,sql-editor}-{dark,light}.png`, `/sponsors/{dwarves-foundation,nimbus,unikorn}.svg` | Astro and early Laravel; no inbound links | none | — | 404 | Unchanged |
| `/en`, `/en/*` | none | none | — | 404 | English lives at the root; no evidence of these paths |
| `/vi/account*`, `/vi/checkout*` and other platform prefixes under `/vi` | none | none | VI 404 linking `/account?locale=vi` | 404 | Spec §0: no `/vi/account`. nginx would never route these to the platform |

### C.7 Static assets and OG cards

| URL | Disposition | Status | Reason |
|---|---|---|---|
| `/og.png` | **rewrite in place**: `og:generate --type=site` writes the EN generic brand card here (architecture §1.15) | 200 | The default `og:image` in English for every page without its own card: home, the hubs, `/pricing`, `/download`, `/ios`, `/faq` and the legal pages. The URL is kept and overwritten for two more reasons. External share caches hold it. The account app's head still defaults to it. The old card said "Database work. Native speed.", a speed slogan with no evidence behind it, so leaving the file untouched would have kept showing that slogan in both places |
| `/og/vi/default.png` | **new**: the VI generic brand card, written by `og:generate --type=site --locale=vi` | 200 | The default `og:image` in Vietnamese for every page without its own card |
| `/og@2x.png` | remove | 404 | Unreferenced, but publicly served with the same "Native speed." slogan and a dark app-chrome screenshot. Git history keeps it |
| `/og/blog/{10 kept}.png` | keep | 200 | Historical cards for archive posts |
| `/og/blog/{mcp-database-claude, cloudflare-d1-mac, mongodb-native-vs-compass, open-source-db-clients-2026}.png` | remove | 404 | Their pages redirect now |
| `/og/compare/{9 kept + sequel-pro}.png` | regenerate | 200 | "10× LESS RAM", "100% CHEAPER" and similar claims are baked into the images |
| `/og/compare/azimutt.png` | remove | 404 | The page is gone |
| `/og/database/{22 kept}.png` | regenerate | 200 | "29 databases", "$899 SSMS" and similar are baked in |
| `/og/database/{mariadb,cockroachdb,pglite,scylladb}-client.png` | remove | 404 | The pages were merged |
| `/og/feature/{slug}.png`, `/og/vi/{feature,database,compare}/{slug}.png` | new | 200 | One card per feature, database and compare page in each locale, using architecture §1.15's family names. Kept posts keep their EN cards, and no post has a VI card. Every other page uses its locale's site card |
| `/logo.png`, `/favicon.ico`, `/site.webmanifest` | keep. Fix the manifest's `Content-Type`. Consider a smaller icon file (159 KB today) | 200 | Identity assets |
| `/images/app-*.{png,webp}`, `/images/ios-*`, `/images/{blog,databases,features,ios}/*` | keep the files as source assets, no longer displayed | 200 | Spec §9.1: keep useful source images |
| `/build/*` | keep | 200 | Asset namespace (the platform uses `/platform-build/*`) |

### C.8 Platform-owned paths (license app)

The public rebuild must not serve these. They are listed so the disposition table is complete.

| URL | Disposition | Status | Notes |
|---|---|---|---|
| `/account`, `/account/login`, `/account/verify`, `/account/{machines,team,library}` | keep (redesigned in the license repo) | 302 / 200 | `noindex`, not in any sitemap, `?locale` handling per §B.5 |
| `/thank-you`, `/newsletter/confirmed`, `/newsletter/verify/{token}`, `/newsletter/unsubscribe/{subscriber}` | keep | 200 / 403 / 404 | `noindex`. Signed URLs keep their signature: `locale` is never appended after signing |
| `POST /checkout`, `POST /discount/preview`, `POST /newsletter/subscribe`, `GET /api/newsletter/stats` | keep (contracts) | — | The JSON body gains `locale`; existing fields are unchanged |
| `/webhooks/*` | unchanged | — | — |
| `/beta`, `POST /beta/signup` | unchanged; no public caller since 2026-09-23 | — | — |
| `/platform-build/*` | unchanged | 200 | — |

---

## D. Homepage section order

The same structure serves `/` and `/vi`. The ids are locale-neutral.

| # | id (aliases) | Section | Reader question | Content | Slots | Data and events |
|---|---|---|---|---|---|---|
| 1 | `top` | **Hero** | What is TablePro, and can I use it on my devices? | H1 and subtitle (positioning decision). "Download for Mac" → /download, with the availability line below it ("macOS 13 Ventura or later · Apple Silicon and Intel"). The App Store badge, with its own line ("iPhone and iPad · iOS/iPadOS 18 or later · free"). A small link to Pricing | mac-hero-window (≥768px), mac-hero-window-mobile (<768px); the only `fetchpriority="high"` image on the site | platforms; `download_click{location:'hero', platform}` |
| 2 | `databases` | **Databases** | Does it work with the database I use? | Engines named by category with vendor marks; one sentence on bundled drivers and drivers downloaded on first pick; the engines that open on iPhone; "All databases →" /databases | none (vendor marks are identity assets) | engines (names and categories; any count is derived) |
| 3 | `sponsors` | **Sponsors** (fixed third) | Who supports the project? | The 4 verified sponsors' logos with `rel="sponsored noopener"` and accessible names; "Sponsor TablePro" (GitHub Sponsors) | none (sponsor logos are identity) | sponsors.json |
| 4 | `features` | **Workflows** | What do I do with it day to day? | Five rows, each a heading, 2-3 sentences, one slot and a link: **Query** → /features/querying · **Edit data** → /features/data-editing · **Schemas and sync** (Compare & Sync marked Starter) → /features/schema · **Files** → /features/import-export · **Connect** → /features/connections | mac-query-autocomplete, mac-edit-preview-sql, mac-compare-sync-structure, mac-data-files-window, mac-connection-ssh-form | pricing (tier markers) |
| 5 | `safety` | **Production safety** | Can I point it at production without fear? | Safe Mode per connection (levels named); DROP, TRUNCATE and WHERE-less DELETE always ask; Read-Only; Touch ID; Agent mode raises the floor → /features/data-editing#safe-mode | mac-safe-mode-touchid | facts (Safe Mode levels) |
| 6 | `ai` (`mcp`) | **AI and MCP** | Does it work with AI tools, and what can the AI touch? | Bring your own provider (named); Agent mode; a local MCP server that is off by default; the permission layers in one line; free → /features/ai-mcp | mac-ai-chat | facts (providers) |
| 7 | `platforms` (`mobile`) | **Mac, iPhone and iPad** | Is there a phone app, and how does it relate to the Mac app? | Two cards, described positively and with no parity claim. **Mac**: the full workbench, requirement, Download. **iPhone and iPad**: browse, edit, query and SSH on the go; free; App Store. One line on iCloud Sync and Handoff (Starter on the Mac) → /ios, /features/sync-and-teams | ios-connection-list | platforms; `download_click{location:'home-platforms', platform}` |
| 8 | `switch` (`compare`) | **Coming from another app** | I already use another client. Can I bring my connections? | Importers named, with passwords where true; Open Project Folder; "Compare TablePro with …" → /compare | none | facts (import sources) |
| 9 | `pricing` (`license`) | **Pricing** | What is free, and what costs money? | A working compact block: the Free, Starter and Team cards with the cycle toggle and Buy buttons (same component and data as /pricing); one sentence on the free core and open source; "Compare plans →" /pricing. This is the target of `/?ref=…#pricing` from the Mac app | none | pricing; `checkout_started{tier,cycle}`; `download_click{location:'pricing-free'}` |
| 10 | `open-source` | **Open source and get started** | Who builds it, can I read the code, and how do I start? | AGPLv3 and a GitHub link; one sentence on how the project is funded (no superlatives); the final "Download for Mac" plus App Store badge with their availability lines | none | platforms; `download_click{location:'footer-cta', platform}` |

**Not on the homepage:**

- Performance numbers.
- Download totals and star counts.
- Comparison matrices (they live on /compare).
- Windows and Linux (they are on /download#other-platforms and in the FAQ).
- Integration configuration (it is on /features/ai-mcp).
- The "#1 on GitHub Trending" badge (misleading without its scope).

---

## E. Content blueprints per page family

### E.1 Database page (every engine)

The order is fixed. Each block is filled from `engines.json` facts and engine-specific copy. **The same paragraph never appears on two engine pages.**

1. **Header.** H1 (pattern in §A.3) and 1-2 sentences on the job this engine does. An availability line from data: platforms, driver delivery ("built in" or "downloads on first use"), and "0.77" where it applies. Download CTA. The App Store badge only if the engine opens on iPhone. A docs link ↗.
2. **Hero slot**, with an engine-specific scene. A shared screenshot is never allowed: "a SQLite screenshot must never be described as a Redis screenshot".
3. **Connect.** Connection modes, auth methods, TLS, SSH, proxy and tunnel support, or an explicit "no SSH". Cloud sign-in. URL schemes. The version floor, marked either "enforced" (the app refuses older versions) or "documented".
4. **Work with the data.** The query language by name, the editing model and the UI that is specific to this engine.
5. **Schema.** Editable, partly editable or read-only.
6. **Operate.** Dashboard, Users & Roles, maintenance and backup tool, where they exist.
7. **Move data.** Import and export availability (import absent on the engines listed in data).
8. **iPhone and iPad.** Opens, opens only when synced, or does not open.
9. **Limits.** From `engines.json.limits[]`. Each limit has its own evidence, and none is softened.
10. **Family sections** with anchors (`#mariadb`, `#cockroachdb`…), only on merged pages.
11. **Other tools (optional).** One fair paragraph with dates (pgAdmin, Compass, Redis Insight, SSMS…), linking the comparison page where one exists.
12. **FAQ (optional).** 2-4 questions specific to the engine, as visible content only.
13. **Related.** The feature pages this engine exercises, comparisons, docs ↗.

**Forbidden on engine pages:**

- Performance or size numbers.
- The generic "Tree-sitter SQL editor" block on non-SQL engines.
- "Get connected in seconds".
- HowTo or FAQPage markup (no page carries either; §F.2, architecture §1.6).
- "No feature gating" or "free" without a scope.
- "Built in" for a driver that downloads on first use.
- Counts typed into the copy.

### E.2 Category rules (what to emphasise, what never to imply)

| Category | Engines (page or section) | Emphasise | Never imply |
|---|---|---|---|
| Relational SQL | PostgreSQL (+CockroachDB, PGlite), MySQL (+MariaDB, TiDB, OceanBase, Databend), SQL Server, Oracle | Auth and tunnels, the dialect's specifics (`GO`, PL/SQL `/`, DBMS_OUTPUT, PRINT), EXPLAIN availability per engine, staged editing, Users & Roles, dashboard, native dump tools | EXPLAIN on SQL Server or Oracle; IAM on Redshift; local sockets; named instances or NTLM |
| File SQL | SQLite, DuckDB, Beancount | The file as the database; remote file over SSH (SQLite only); extensions; read-only ledgers; files in place vs copied into the iPhone app | Encrypted SQLite; DuckDB extensions "pre-loaded" beyond the linked set |
| Analytical and warehouse | ClickHouse, Redshift, BigQuery, Snowflake, Teradata, Trino | Cost and scan controls (Max Bytes Billed, Dry Run), read-only structure where true, EXPLAIN variants, row caps, server-side export, auth methods | "Billion-row" or memory claims; editing where structure is read-only |
| Cloud and serverless SQL | Cloudflare D1, Turso/libSQL (hub: Spanner, R2 SQL, SAP HANA) | Token auth, account-wide lists, stateless HTTP (no session state or transactions), local vs remote | Branches, embedded replicas, sessions |
| Document | MongoDB, SurrealDB | The JS shell or SurrealQL; documents as Extended JSON; field operations across a collection; Safe Mode counts every statement as a write | Pipeline builder, transactions, mongosh itself, syntax highlighting for SurrealQL |
| Key-value | Redis, DynamoDB | The key tree and TTL; which value types are editable; the command console; the DynamoDB Query/Scan planner and read capacity | Pub/sub, Lua debugging, type-aware editors for every type, switching region inside one connection |
| Wide-column | Cassandra (+ScyllaDB) | CQL, scalar edits, Keyspaces SigV4 | A consistency-level control, Astra, ring topology |
| Search and vector | Elasticsearch (hub: Typesense, Weaviate) | Request consoles (Query DSL, REST, GraphQL), editing by id, collections as tables | SSH, OpenSearch, aliases in the sidebar |
| Streaming | Kafka | A log, not a table: consume and produce, offsets, consumer-group lag, approximate counts, drop topic | Row editing, import, Schema Registry |
| Coordination | etcd | etcdctl verbs, prefixes, leases, members; every command counts as a write | `txn`, gRPC, live watch panels |

### E.3 Comparison page

1. **H1** "TablePro vs {X}" (Sequel Pro: "Sequel Pro alternatives for Mac"). The `<title>` is "TablePro vs {X}: {one honest difference}". Never "{X} Alternative for Mac - Free & Native". Directly under the H1: "Facts checked {date}" and a link to the sources.
2. **Short answer.** "Choose TablePro if…" and "Choose {X} if…", 3-5 bullets each. Each side gets real reasons.
3. **At a glance.**
   - Rows: platforms; editions and price, dated (TablePro's prices come from `pricing.json` and are never retyped); licence and open source; databases (named categories; a competitor's count only with a source); AI; MCP; iPhone/iPad; sync; import into TablePro.
   - Cells take **three states**: ✓ supported · — not supported · a qualified value ("Paid: Starter", "Partial: {note}", "Pro tier") with a footnote to its source.
   - A row whose fact could not be verified is **left out**, not guessed.
4. **Where {X} is stronger.** Honest, sourced.
5. **Where TablePro differs**, with tier and platform scope.
6. **Switching from {X}.** Verified importer steps, or "TablePro has no importer for {X}".
7. **FAQ** (2-4).
8. **Sources**: URL and retrieval date for each.
9. **CTA**: Download, plus /pricing.

**Never on a comparison page:**

- Benchmarks of RAM, startup or "×" ratios.
- Loaded keywords ("too slow", "too expensive").
- Competitor screenshots.
- A schema.org `Review` of the competitor.
- `operatingSystem: macOS` attached to competitors.
- The bare "Free" price cell for TablePro.

### E.4 Feature page

1. **H1** naming the workflow, plus 2 sentences on who it is for and when they use it.
2. **One section per sub-workflow.** Each is a heading, 2-4 sentences, at most one slot (the hero slot appears once), the tier marker from `pricing.json`, the 0.77 label from data, and the engine coverage computed from `engines.json` capability fields (for example, the EXPLAIN engines).
3. **"On iPhone and iPad"**: what exists there, or a plain "not on iPhone or iPad".
4. **"Where it works"**: a small table of platform × tier for the page's capabilities.
5. **Limits** that change a decision (Data Rewind is not a backup; the ER diagram is read-only; Cloud SQL Proxy works for 3 engines only).
6. **Docs ↗** to the exact docs pages on docs.tablepro.app. On VI the links are labelled English.
7. **Related** features and engines, plus a CTA.

**Rules for every feature page:**

- No filler grids.
- Every claim traces to the TablePro app at the copy floor release, or to docs.tablepro.app.
- Every paid feature names its tier where it is described.
- Never "free" without saying what is free.

### E.5 Platform and commerce pages

- **/download.**
  - Leads with the live release, from `releases/latest` or the appcast. It never uses the first item of the release list (plugin releases crowd that list).
  - Both architecture links are rendered on the server. A client hint can only highlight one of them.
  - An iPhone or iPad user agent puts the App Store card first.
  - The page never starts a download on its own. The after-click panel appears only when the browser has been handed the file.
  - If the release API fails, a server-rendered GitHub Releases link is the fallback.
- **/ios.** Describes App Store 1.0 only. Version 1.0 facts come only from data. Engines are named, not counted. Nothing that exists only at HEAD, such as the iPad side-by-side layout or the jump-host message, is described.
- **/pricing.**
  - Unit, cycle, minimum, total and currency are stated in words.
  - It says what happens when payment stops, per cycle.
  - The VI page states "Giá tính bằng USD".
  - It never implies VND pricing, PPP or bank transfer.
  - There is no "most popular" badge. Any savings figure is computed from data and meets contrast requirements.

### E.6 Release posts (English-only archive)

- The body is unchanged. The front-matter date stays `datePublished`, and there is no refreshed date.
- A dated archive note above the body comes from the template, not from an edit to the post.
- A correction note is added only where a claim was **never** true. It is dated and visible; the post is never edited silently.
- Figures become `blog-{slug}-{n}` placeholder slots. The existing image files are kept as source material.
- The CTA block at the end is rendered from current `platforms.json` data, so it never repeats a stale requirement.
- Translation: none. They are not linked as VI pages; `/vi/blog` lists them with `lang="en"`.

### E.7 Legal pages

- The EN page is authoritative.
- The VI page is a faithful full translation with a prevailing-language notice. Its substance never differs.
- The `#cookies` anchor and the other anchors are identical in both languages.
- A "Last updated" date is shown on both and changes only when the substance changes.
- **Purchase attribution is never described as used.** The privacy policy says what §A.6 says: the record is kept in the browser, sent with checkout and discarded by the server (spec §11). `BannedClaimsTest` bans the old wording in the content, catalogs and legal files: "so we know which", "pay for the work" and "store against the license" (the phrasing of `Privacy.tsx:288` and of the `attribution.ts` header). It bans exact phrases only, because a co-occurrence rule would also catch the correct "attribution is not stored". A legal-content test asserts that `tablepro:attribution` appears under `#website` and `#cookies` in `legal/en/privacy.md` and in `legal/vi/privacy.md`.

### E.8 Hubs

- **/features**: an overview list, not a card mosaic.
- **/databases**: a table generated from data. The counts are derived and the engines are named.
- **/compare**: a dated table plus "choose by situation".

Every hub links every child page, so the footer can stay short.

### E.9 English-only content (complete list)

- The 10 release posts (`/blog/{slug}`).
- The `/blog` index. Its VI counterpart `/vi/blog` is a `noindex` listing.
- External docs (docs.tablepro.app), which are always labelled "(tiếng Anh)" from VI pages.
- The English OG cards for those posts.

**Everything else is published as a pair.** Vietnamese is the only locale besides English at launch.

### E.10 Vietnamese wording

The glossary in positioning §11 is the master for every Vietnamese string, on the public site and in the account app. The Vietnamese strings in this document follow it.

**Forbidden variants.** The list is one PHP file shared by both repos, `tests/Support/vi-forbidden-variants.php`, kept under architecture §3's "copy in both, change both" contract. Two tests read it:

- W `Localization/ContentParityTest` over `content/vi`, the Vietnamese UI catalogs, `legal/vi`, `blog/vi` and the Vietnamese asset descriptions.
- L `Localization/LangParityTest` over `lang/vi`.

Matching runs on NFC text and on visible strings only. Values that are URLs or paths (starting with `/` or `http`) and code spans are skipped. Every row applies to Vietnamese strings except the last, which applies to English strings in both repos.

| Forbidden | Use instead | Positioning ref |
|---|---|---|
| A tone mark on the second vowel of a word-final `oa`, `oe` or `uy`, except after `q`: khoá, xoá, hoá, hoạ, tuỳ, huỷ… (regex `(?<![qQ])(o[àáảãạ]\|o[èéẻẽẹ]\|u[ỳýỷỹỵ])(?!\p{L})`) | khóa, xóa, hóa, họa, tùy, hủy | Glossary spelling rule |
| lưới dữ liệu | data grid | §11.2 |
| foreign key, primary key (lowercase, in prose; SQL keywords in capitals are unaffected) | khóa ngoại, khóa chính | §11.2 |
| Tải xuống | Tải về (the `/download` buttons: Tải bản cho Apple silicon · Tải bản cho Intel) | §4, §11.5 |
| Bỏ qua đến nội dung | Chuyển đến nội dung chính | §10.1 |
| Bài viết tiếng Anh, or a label whose whole value is "Tiếng Anh" | (tiếng Anh) | §11.4 |
| team as a lowercase word | nhóm, thành viên nhóm | §11.3. The tier "Team" and feature names such as Team Library keep their capital |
| An English click path that is not in parentheses: `(?<!\()\bSettings\s*[›>→]` | Cài đặt > Tích hợp (Settings > Integrations); Cài đặt > Giấy phép (Settings > License) | §11.2 click-path rule; the app's own labels come from its Vietnamese string catalog |
| giấy phép, except before "AGPL" (the capitalised app label "Giấy phép" in a click path is allowed) | license | §11.1, §11.3 |
| Billing and invoices (English strings) | Billing & invoices (VI: Thanh toán và hóa đơn) | §4; spec §0 |

A new variant found in review is added to the shared file, never fixed only in place.

---

## F. Sitemap.xml, hreflang, canonicals, indexing

### F.1 Single source of truth

`PageRegistry` (PHP, architecture §1.6) knows every route, whether it has a VI twin (from page registration and content parity), and its source file's modification time. The `<head>` alternates, the language switcher's targets and `sitemap:generate` all read it. A test asserts that the alternates in the sitemap equal the alternates in the head for every URL.

### F.2 Head tags per page

| Tag | Rule |
|---|---|
| `<html lang>` | `en` or `vi`, set server-side. It also stays in sync on client navigation |
| `rel=canonical` | Absolute, self, same locale, no query string, no trailing slash. Home: `https://tablepro.app/` and `https://tablepro.app/vi`. **Never** a VI canonical pointing at EN |
| `hreflang` | Only for pairs: `en` → the EN URL, `vi` → the VI URL, `x-default` → the EN URL. The set is identical on both members, fully qualified, and includes the page itself. **None** on English-only posts, `/blog`, `/vi/blog`, 404 or 410 |
| `og:locale` / `og:locale:alternate` | `en_US` or `vi_VN`; the alternate only for pairs |
| `og:image` | `/og/{family}/{slug}.png` or `/og/vi/{family}/{slug}.png` when that card exists. Otherwise the locale's generic card: `/og.png` or `/og/vi/default.png` (architecture §1.15, `OgImages::fallbackPath`). Never a file that does not exist |
| robots meta | `index,follow` on indexable pages; `noindex,follow` on `/vi/blog`, 404 and 410. Indexable EN and VI pages use the same rule |
| Structured data | Localized strings and `inLanguage`; one `Organization` with `@id https://tablepro.app/#organization` across locales (the docs site asserts this id); a Mac `SoftwareApplication` and an iOS `MobileApplication` with `offers` taken from `pricing.json` and matching the visible prices; **no** `aggregateRating`, `Review`, `FAQPage` or `HowTo` anywhere; `BreadcrumbList` with localized names and same-locale URLs (Features › Querying, Databases › PostgreSQL, Compare › TablePlus, Blog › post) |

### F.3 `/sitemap.xml`

- **One file** (113 URLs, far below the limit). It is generated at deploy time from `PageRegistry`, and the daily cron job can stay as a fallback.
- **Included:** every URL in §A marked "yes". That is 51 EN/VI pairs (102 URLs) plus 11 English-only URLs (`/blog` and 10 posts).
- **Per paired URL:** `<xhtml:link rel="alternate">` for `en`, `vi` and `x-default`, including the URL itself, under `xmlns:xhtml="http://www.w3.org/1999/xhtml"` (`Url::addAlternate`).
- **`<lastmod>`** is the modification time of what drives the page in that locale: the data file, the copy file or the markdown file. `changefreq` and `priority` are omitted, because Google ignores them.
- **Excluded:**
  - `/vi/blog`.
  - Every redirect source (§C).
  - Every 404 and 410 path.
  - `/up` and `/robots.txt`.
  - Query and fragment variants.
  - Static assets and OG images.
  - **All platform paths**: `/account*`, `/checkout*`, `/thank-you`, `/newsletter/*`, `/discount/*`, `/webhooks/*`, `/beta*`, `/api/*`, `/platform-build/*`.
- `robots.txt` keeps listing `https://docs.tablepro.app/sitemap.xml`.

### F.4 Indexing and caching rules that the IA depends on

- **Public site:** the locale comes from the URL only. No `Set-Cookie`, no `Vary: Accept-Language`, no language redirects. `Accept-Language: vi` on `/` returns English with a 200.
- **Platform pages:** `noindex` through a single robots meta tag, plus private cache headers. Signed links are never changed after signing, and no tokens appear in URLs that are shared with analytics.

---

## G. Completion checklist

Mark each item when it is built, renders under SSR, returns the stated status, carries the head tags in §F.2, and resolves every slot to an ID in §A.8.

**Ticked during integration verification (2026-10-03), with this evidence:**

- `REQUIRE_SSR=1 php artisan test` is green. That covers `PageRegistryTest`, `SeoSmokeTest`, `HreflangReciprocityTest`, `SitemapAlternatesTest`, `RedirectsTest`, `ErrorPageTest`, `BlogTest`, `OgCardsTest`, `AssetManifestTest`, `ContentParityTest` and `BannedClaimsTest`.
- `WEB_DOMAIN=localhost php artisan sitemap:generate` gives 113 URLs, 102 of them with alternates, and no platform path.
- Every journey in a browser harness passes: the sitemap crawl (status, `lang`, canonical, reciprocal `hreflang`, internal links), the 54-row redirect table, SSR deep links, language switching and history, and the cross-app links.
- 780 captures in both languages, both themes and 4 widths show no unexpected status, no `lang` mismatch, one H1 per page, no indexable error page and no `<img>` inside a placeholder.

Five lines of G.3 described a plan that architecture §1.7 and §1.14 changed. They are rewritten below to what was built, and marked `(rewritten)`.

### G.1 Paired pages (51 EN + 51 VI)

| # | Page | EN | VI |
|---|---|---|---|
| 1 | Home | [x] `/` | [x] `/vi` |
| 2 | Features hub | [x] `/features` | [x] `/vi/features` |
| 3 | Querying | [x] `/features/querying` | [x] `/vi/features/querying` |
| 4 | Data editing | [x] `/features/data-editing` | [x] `/vi/features/data-editing` |
| 5 | Schema | [x] `/features/schema` | [x] `/vi/features/schema` |
| 6 | Import & export | [x] `/features/import-export` | [x] `/vi/features/import-export` |
| 7 | AI & MCP | [x] `/features/ai-mcp` | [x] `/vi/features/ai-mcp` |
| 8 | Connections | [x] `/features/connections` | [x] `/vi/features/connections` |
| 9 | Sync & teams | [x] `/features/sync-and-teams` | [x] `/vi/features/sync-and-teams` |
| 10 | Databases hub | [x] `/databases` | [x] `/vi/databases` |
| 11 | PostgreSQL (+CockroachDB, PGlite) | [x] `/postgresql-client` | [x] `/vi/postgresql-client` |
| 12 | MySQL & MariaDB (+TiDB, OceanBase, Databend) | [x] `/mysql-client` | [x] `/vi/mysql-client` |
| 13 | SQLite | [x] `/sqlite-client` | [x] `/vi/sqlite-client` |
| 14 | MongoDB | [x] `/mongodb-client` | [x] `/vi/mongodb-client` |
| 15 | Redis | [x] `/redis-gui` | [x] `/vi/redis-gui` |
| 16 | SQL Server | [x] `/sql-server-client` | [x] `/vi/sql-server-client` |
| 17 | Oracle | [x] `/oracle-client` | [x] `/vi/oracle-client` |
| 18 | ClickHouse | [x] `/clickhouse-client` | [x] `/vi/clickhouse-client` |
| 19 | DuckDB | [x] `/duckdb-client` | [x] `/vi/duckdb-client` |
| 20 | Cassandra & ScyllaDB | [x] `/cassandra-client` | [x] `/vi/cassandra-client` |
| 21 | Redshift | [x] `/redshift-client` | [x] `/vi/redshift-client` |
| 22 | Cloudflare D1 | [x] `/cloudflare-d1-client` | [x] `/vi/cloudflare-d1-client` |
| 23 | Turso & libSQL | [x] `/turso-client` | [x] `/vi/turso-client` |
| 24 | DynamoDB | [x] `/dynamodb-gui` | [x] `/vi/dynamodb-gui` |
| 25 | BigQuery | [x] `/bigquery-client` | [x] `/vi/bigquery-client` |
| 26 | Snowflake | [x] `/snowflake-client` | [x] `/vi/snowflake-client` |
| 27 | etcd | [x] `/etcd-gui` | [x] `/vi/etcd-gui` |
| 28 | Elasticsearch | [x] `/elasticsearch-client` | [x] `/vi/elasticsearch-client` |
| 29 | SurrealDB | [x] `/surrealdb-client` | [x] `/vi/surrealdb-client` |
| 30 | Teradata | [x] `/teradata-client` | [x] `/vi/teradata-client` |
| 31 | Trino | [x] `/trino-client` | [x] `/vi/trino-client` |
| 32 | Beancount | [x] `/beancount-client` | [x] `/vi/beancount-client` |
| 33 | Kafka (new) | [x] `/kafka-client` | [x] `/vi/kafka-client` |
| 34 | Compare hub | [x] `/compare` | [x] `/vi/compare` |
| 35 | vs TablePlus | [x] `/compare/tableplus` | [x] `/vi/compare/tableplus` |
| 36 | vs DBeaver | [x] `/compare/dbeaver` | [x] `/vi/compare/dbeaver` |
| 37 | vs DataGrip | [x] `/compare/datagrip` | [x] `/vi/compare/datagrip` |
| 38 | vs Navicat | [x] `/compare/navicat` | [x] `/vi/compare/navicat` |
| 39 | vs Beekeeper Studio | [x] `/compare/beekeeper-studio` | [x] `/vi/compare/beekeeper-studio` |
| 40 | vs Sequel Ace | [x] `/compare/sequel-ace` | [x] `/vi/compare/sequel-ace` |
| 41 | Sequel Pro alternatives | [x] `/compare/sequel-pro` | [x] `/vi/compare/sequel-pro` |
| 42 | vs Postico | [x] `/compare/postico` | [x] `/vi/compare/postico` |
| 43 | vs HeidiSQL | [x] `/compare/heidisql` | [x] `/vi/compare/heidisql` |
| 44 | vs phpMyAdmin | [x] `/compare/phpmyadmin` | [x] `/vi/compare/phpmyadmin` |
| 45 | Pricing | [x] `/pricing` | [x] `/vi/pricing` |
| 46 | Download | [x] `/download` | [x] `/vi/download` |
| 47 | iPhone & iPad | [x] `/ios` | [x] `/vi/ios` |
| 48 | FAQ | [x] `/faq` | [x] `/vi/faq` |
| 49 | Privacy | [x] `/privacy` | [x] `/vi/privacy` |
| 50 | Terms | [x] `/terms` | [x] `/vi/terms` |
| 51 | Refund policy | [x] `/refund-policy` | [x] `/vi/refund-policy` |

### G.2 English-only and VI listing

- [x] `/blog` (EN index)
- [x] `/vi/blog` (`noindex`; English entries with `lang="en"` and the "(tiếng Anh)" label)
- [x] `/blog/tablepro-0-77`
- [x] `/blog/tablepro-0-76`
- [x] `/blog/tablepro-0-74`, including its dated correction note
- [x] `/blog/tablepro-0-73`
- [x] `/blog/tablepro-0-72`
- [x] `/blog/tablepro-0-70`
- [x] `/blog/tablepro-0-69`
- [x] `/blog/tablepro-0-68`
- [x] `/blog/tablepro-0-67`
- [x] `/blog/tablepro-for-iphone`
- [x] Archive note, placeholder figures and data-driven CTA on all 10 posts

### G.3 Statuses, redirects and system files

- [x] Branded 404 for EN and VI, including the `/vi/blog/{en-slug}` and `/vi/account*` / `/vi/checkout*` helper links (the latter added during integration verification: `account` prop, `ErrorPageTest`)
- [x] Branded 410 for `/compare/azimutt`
- [x] Slash and `/index.php` variants (rewritten): `CanonicalizeRequest` gives each one 301, so `/mariadb-client/?ref=x` and `/index.php/mariadb-client` go straight to `/mysql-client?ref=x#mariadb`, and `/download/`, `/compare/` and `/vi/` go to their slashless path (journey: `/vi/` → 301 `/vi`, `/pricing/` → 301 `/pricing`)
- [x] 301s:
  - [x] `/mariadb-client` → `/mysql-client#mariadb`
  - [x] `/cockroachdb-client` → `/postgresql-client#cockroachdb`
  - [x] `/pglite-client` → `/postgresql-client#pglite`
  - [x] `/scylladb-client` → `/cassandra-client#scylladb`
  - [x] `/blog/mcp-database-claude` → `/features/ai-mcp#mcp`
  - [x] `/blog/cloudflare-d1-mac` → `/cloudflare-d1-client`
  - [x] `/blog/mongodb-native-vs-compass` → `/mongodb-client#compass`
  - [x] `/blog/open-source-db-clients-2026` → `/compare#open-source`
  - [x] `/docs` → docs root
  - [x] `/docs/raycast` → docs `/external-api/raycast`
  - [x] `/sitemap-index.xml` → `/sitemap.xml`
  - [x] `/databases/{docsSlug}` (rewritten): `RedirectMap` answers it from each engine's `docsSlug` in `engines.json`, through the one `EnginePaths` rule (including oracle, clickhouse, sqlite and duckdb), before routing, so there is no slug list to keep in step (`RedirectsTest`, `EnginePathsTest`)
- [x] Test: every redirect lands on a 200 in one hop, and `?ref`/`utm_*` survive
- [x] Redirect map (rewritten): `resources/data/redirects.json` holds every 301 and 410 entry, read by `RedirectMap` (architecture §1.7, `RedirectsDataTest`). `CanonicalizeRequest` answers them before routing. It is data read at runtime, so the deploy needs no config step for it
- [x] Routes:
  - [x] Route constraints updated: the DB slug list (22 kept plus kafka, the 4 merged ones removed) and the compare list (azimutt removed)
  - [x] `ios`, `vi`, `features`, `databases`, `compare` and `pricing` never enter the DB-slug alternation
- [x] Ids:
  - [x] Home ids and aliases: `top`, `databases`, `sponsors`, `features`, `safety`, `ai`/`mcp`, `platforms`/`mobile`, `switch`/`compare`, `pricing`/`license`, `open-source`
  - [x] `/privacy#cookies` kept
- [x] `/sitemap.xml`:
  - [x] Exactly 113 URLs, with alternates on the 102 paired URLs
  - [x] Sitemap alternates equal head alternates
  - [x] No platform paths
- [x] `robots.txt` unchanged
- [x] OG:
  - [x] Cards generated for every feature, database and compare page in both locales
  - [x] `/og.png` (EN) and `/og/vi/default.png` (VI) generated as each locale's generic card and used as its fallback; `/og@2x.png` removed
  - [x] Obsolete cards removed: 4 blog, azimutt and 4 database cards
  - [x] Remaining compare and database cards regenerated
- [x] Navigation:
  - [x] Header, mobile nav and footer as in §B
  - [x] The switcher fallbacks in §B.4
  - [x] `/account?locale=` on every Account link
  - [x] Checkout and newsletter bodies carry `locale` (rewritten). The discount preview sends `{code}` only, unchanged (architecture §1.14)
- [x] `assets.json` manifest covers every slot ID in §A.8 with EN and VI descriptions; `docs/visual-assets.md` cross-references the same IDs
- [x] Privacy: `/privacy#website` and `#cookies`, in EN and VI, describe `tablepro:attribution` as kept in the browser, sent with checkout and discarded by the server; `BannedClaimsTest` bans the old wording (§E.7)
- [x] Vietnamese wording: the shared forbidden-variant list (§E.10) passes in W `ContentParityTest` and L `LangParityTest`
- [x] Structured data: no `FAQPage` or `HowTo` on any page

---

## Objections and notes

**No decision here breaks the spec.** The interpretations and departures below are deliberate.

1. **`/compare/azimutt` returns 410, not 301.** A 301 to an ER-diagram page was considered. TablePro's ER diagram is a read-only snapshot, and Azimutt is a schema explorer and designer. A redirect would land "Azimutt vs TablePro" visitors on an unrelated page. The rule is 410 unless a genuine replacement exists.
2. **`/vi/blog` is `noindex` and has no hreflang pair.** Spec §0 wants release posts "shown in the Vietnamese site as English articles, honestly labelled". A listing whose main content is English titles is a duplicate under Google's rule, so it serves navigation and is not indexed. If each post gets a Vietnamese summary, it can become an indexable pair.
3. **The account link carries `?locale=` from both EN and VI pages.** This follows spec §0 ("the locale of the public page they came from").
4. **The parameter name is `locale`.** The brief wrote "?lang/locale"; `locale` was chosen to match the JSON field name, so a single name is used everywhere.
5. **All four guides are merged, so no guide is retained.** Each one duplicated a page that answers the same intent better, or carried claims that were invented or stale. This also removes the need for four Vietnamese guide translations without breaking spec §0's rule that every retained guide gets a real VI version.
6. **SAP HANA and the other narrow engines (Spanner, Typesense, Weaviate, R2 SQL, Dameng) stay as hub rows.** They can get their own pages later, when they gain verified, distinct content and real screenshots. HANA should be reconsidered once Homebrew carries 0.77.
