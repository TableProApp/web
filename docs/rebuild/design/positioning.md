# TablePro positioning: final decision

Decided 2026-10-02. This document is the final positioning for the rebuild. It settles three earlier
proposals (category-first, workflow-first and durable identity), which are not part of this repository.
Implementation copies the strings here. If a string here conflicts with a proposal, this document wins.

**Inputs:**
- The rebuild brief ("the spec"; not part of this repository): §0, §1, §5, §6, §9 and §10.
- Product facts: the TablePro app repository at v0.77.0 and v0.76.1 (Mac), App Store 1.0 (iPhone and iPad), and
  docs.tablepro.app.
- Competitor facts: each vendor's own pages.

**Copy floor.** Every product claim below holds on both published Mac builds: 0.77.0 (GitHub and Sparkle) and 0.76.1
(Homebrew). Every iPhone and iPad claim holds on App Store 1.0 (build 22). No 0.77-only item appears in identity or
pillar copy. No counts appear in prose.

---

## 1. Decision in one screen

| Item | English | Tiếng Việt |
|---|---|---|
| H1 | A native database client for developers. | Database client native dành cho lập trình viên. |
| Subtitle | Run queries, browse and edit data in {featuredEngines} and more. TablePro has a separate native app for each platform it supports. | Chạy query, xem và chỉnh sửa dữ liệu trên {featuredEngines} và nhiều cơ sở dữ liệu khác. TablePro có ứng dụng native riêng cho từng nền tảng được hỗ trợ. |
| Primary action | Download for Mac | Tải về cho Mac |
| Caption under it | macOS 13 Ventura or later · Apple silicon or Intel | macOS 13 Ventura trở lên · Apple silicon hoặc Intel |
| Secondary action | Official App Store badge | Apple's official Vietnamese App Store badge |
| Caption under it | iPhone and iPad · iOS and iPadOS 18 or later | iPhone và iPad · iOS và iPadOS 18 trở lên |
| Line under both | TablePro is open source and free to use. Paid plans add optional features to the Mac app. [See pricing] | TablePro là phần mềm mã nguồn mở, dùng miễn phí. Các gói trả phí bổ sung một số tính năng cho ứng dụng Mac. [Xem bảng giá] |
| `<title>` | TablePro: native database client for Mac, iPhone and iPad | TablePro: database client native cho Mac, iPhone và iPad |
| Meta description | TablePro is a native, open-source database client for PostgreSQL, MySQL, SQL Server, MongoDB, Redis and more. Free to use, with optional paid features. | Database client native, mã nguồn mở để quản lý PostgreSQL, MySQL, SQL Server, MongoDB, Redis và nhiều cơ sở dữ liệu khác. Dùng miễn phí, có gói trả phí. |
| Product description (short) | TablePro is a native, open-source database client for developers. | TablePro là database client native, mã nguồn mở, dành cho lập trình viên. |

- `{featuredEngines}` renders from `engines.json` entries with `featured: true`, in data order: PostgreSQL, MySQL,
  SQL Server, SQLite, MongoDB, Redis.
- All six engines are in both published Mac builds.
- The names are joined on the server, from data, with the catalog's list joiners (§11.4), inside one translated
  template. Server-rendered text never uses `Intl.ListFormat`: the ICU data in the SSR process and in the browser can
  differ, which breaks hydration (architecture §1.5). Fragments are never concatenated.
- "and more" / "và nhiều cơ sở dữ liệu khác" links to `#databases`.

**Winner:** the category-first proposal. It has the clearest category read and the most conventional hero. Its title
and availability logic hold up when a platform is added.

**Grafted from the durable-identity proposal:**
- The identity/availability layer rule and its guard tests (§13).
- "Tải về" as the one Vietnamese download verb.
- The badge accessible name.
- "Other ways to install".
- "quản lý cơ sở dữ liệu" in the Vietnamese meta description.
- "Supported databases".
- The availability summary line.

**Grafted from the workflow-first proposal:**
- Pillars split by workflow, with a "never say" column.
- The precise AI approval wording ("at Alert or stricter").
- The sentence that names what is free.
- The commercial "license" vs open-source "giấy phép" split.
- The "what native means" FAQ line.

---

## 2. Scores

**Scale:** 0–5 per criterion. Each score judges the proposal's recommended package: H1, subtitle, availability line
and meta. The Vietnamese column is judged as a fluent Vietnamese developer would read it.

| Criterion | Category-first | Workflow-first | Durable identity |
|---|---|---|---|
| Category clarity | **5**. The H1 is the category noun, and the subtitle verbs prove it is a GUI | **4**. The H1 leads with an activity ("Query and edit your data…"). The category noun arrives last | **5**. Same H1 as category-first |
| Accuracy against the app at v0.77.0 | **4**. "Browse tables … in MongoDB, Redis" puts a table model on a document store and a key-value store. It mints a new JSON-LD `#app-mac` id, which breaks the stable `#app`. Everything else checks out | **4**. Copy is accurate. The secondary CTA goes to `/ios` but fires `download_click{platform:'ios'}`, so iOS downloads are over-counted. It also mints `#app-mac` | **3**. The meta pairs "Query and edit … Redis" with the device list, but opening a Redis key fails on iPhone 1.0. It keeps `isAccessibleForFree: true` on the Mac node despite the paid features. "Connect to your databases" leans towards a universal |
| Durability across future platforms | **5**. Identity copy has no platform names. The title's platform list comes from data, with a length guard and a fallback | **3**. The subtitle carries "On the Mac, also…", which needs rewriting for every new platform (the proposal concedes this) | **5**. It has the strictest identity/availability split and guard tests |
| Naturalness of the Vietnamese | **4**. H1 and subtitle read well. The meta's "nhiều hệ khác" is clipped. "Tải xuống" clashes with Apple's "Tải về" | **3**. "Viết query và chỉnh sửa dữ liệu trên một database client native" is a calque of "in a native database client": "trên một …" is translationese, and at 64 characters it is long for an H1 | **4**. The subtitle is natural but choppy. Using "giấy phép trả phí" for the paid key collides with "giấy phép AGPLv3". The meta trails off with "…" |
| Conventionality, no hype | **5**. Category H1, two-sentence subtitle and one action per platform: the established pattern (TablePlus, Postico, Zed) | **3**. The hero subtitle is a two-sentence feature list split by platform. The title is in Title Case while the VI title is in sentence case | **4**. "Open source and free to use. Some features need a paid license." puts two fragments of business model into the hero |
| **Total (25)** | **23** | **17** | **21** |

**What each proposal got wrong, and what this document does instead:**

| Problem | Where | Fix here |
|---|---|---|
| New JSON-LD ids (`#app-mac`, `#mac-app`) | all three | Keep `/#organization`, `/#app` (Mac) and `/#ios-app`. The docs site already asserts `#organization` |
| "Browse tables" applied to MongoDB and Redis | category | Use "browse and edit data", which fits rows, documents and keys |
| `isAccessibleForFree: true` on the Mac node | durable | Leave it off the Mac node. Keep it on the iPhone and iPad node, which gates nothing |
| Hero platform split in the subtitle | workflow | Platform scope lives in the captions, the platform cards and the pillar tags, never in the subtitle |
| "Tải xuống" and "Tải về" both used | category vs durable | "Tải về" everywhere, matching Apple's Vietnamese usage |
| "giấy phép" used for both the paid key and the AGPL | durable vs the other two | "license" (kept in English) for the commercial key and "gói" for a plan. "giấy phép" is used only for the AGPLv3 |
| Title drops the platform words | durable | Keep the data-driven platform list in the title. It is the page that answers "database client for Mac/iPhone" searches today (spec §10) |
| Secondary CTA → `/ios` | workflow | The hero badge goes straight to the App Store. The homepage iPhone section links to `/ios` with a text link (one badge per layout) |

---

## 3. Hero

### 3.1 Copy

| Slot | English | Tiếng Việt |
|---|---|---|
| H1 | A native database client for developers. | Database client native dành cho lập trình viên. |
| Subtitle, sentence 1 | Run queries, browse and edit data in {featuredEngines} and more. | Chạy query, xem và chỉnh sửa dữ liệu trên {featuredEngines} và nhiều cơ sở dữ liệu khác. |
| Subtitle, sentence 2 | TablePro has a separate native app for each platform it supports. | TablePro có ứng dụng native riêng cho từng nền tảng được hỗ trợ. |

**Why this wording:**

- **The H1 names three things.** It names the category (database client), the implementation (native) and the
  audience (developers).
  - "For developers" is backed by product features: Open Project Folder reads `.env` and docker-compose files,
    linked SQL folders show Git status, there is a Vim mode, and the MCP server works with Claude Code, Cursor and
    Zed.
  - The H1 contains no platform, count or universal, so it never changes.
- **Sentence 1 answers "is it a GUI, and does it support mine?"** It uses three verbs that only make sense in an app,
  then recognisable engine names instead of a count.
  - "Browse and edit data" fits rows, documents and keys.
  - Each engine page states its own limits, for example that Redis edits are string-only.
- **Sentence 2 says what "native" means without listing platforms.** It also warns that the apps differ: the iPhone
  app is a separate app with its own scope.
  - "Each platform it supports" promises nothing about Windows or Linux.
- **Vietnamese choices:**
  - "xem và chỉnh sửa" reads more naturally than "duyệt" in running copy.
  - "trên PostgreSQL" is how Vietnamese developers say "in PostgreSQL".
  - "lập trình viên" is ordinary Vietnamese, not a technical term, so it is translated.
- **Typography:** Vietnamese headings need line-height ≥ 1.2 for stacked diacritics (design-system §3.3). Check the
  47-character VI H1 at 375 px.

### 3.2 Actions and availability

Both actions are server-rendered and visible on every device, in the same order: Mac first. A client may visually
promote the badge on an iPhone or iPad. The labels do not change, nothing auto-downloads and nothing redirects.

| Element | English | Tiếng Việt | Target / data / event |
|---|---|---|---|
| Primary button | Download for Mac | Tải về cho Mac | `/download` · `/vi/download`; `download_click{location:'hero', platform:'mac'}` |
| Caption | {macRequirement} · {macArchitectures} | same keys | `platforms.json` → "macOS 13 Ventura or later · Apple silicon or Intel" / "macOS 13 Ventura trở lên · Apple silicon hoặc Intel" |
| Text link under the caption | Other ways to install | Cách cài đặt khác | `/download#mac`, the section that holds the Homebrew command (sitemap §A.1; there is no `#other` id). Never print a version beside the Homebrew command, because the cask lags |
| Secondary action | Official App Store badge, accessible name = its visible text "Download on the App Store" | Apple's Vietnamese badge. Accessible name = its visible text (expected "Tải về trên App Store"; check it against the artwork when the badge is installed) | App Store URL; `download_click{location:'hero', platform:'ios'}` |
| Caption | {iosDevices} · {iosRequirement} | same keys | "iPhone and iPad · iOS and iPadOS 18 or later" / "iPhone và iPad · iOS và iPadOS 18 trở lên" |
| Line under both | TablePro is open source and free to use. Paid plans add optional features to the {paidPlatformApps}. [See pricing] | TablePro là phần mềm mã nguồn mở, dùng miễn phí. Các gói trả phí bổ sung một số tính năng cho {paidPlatformApps}. [Xem bảng giá] | `{paidPlatformApps}` = "Mac app" / "ứng dụng Mac" from the platforms that have paid features. "See pricing" → `/#pricing` (shipped Mac builds open `/?ref=…#pricing`) |

**Layout rules:**
- Each caption sits 8–16 px under its own action and stays with it when the row stacks on a phone.
- The badge is at least 40 px tall, and there is one badge per layout.

**Deliberately absent from the hero:**
- A version number. Homebrew lags, and versions belong on `/download`.
- "Universal": the Mac app ships separate Apple silicon and Intel builds.
- A file size.
- A star count or "#1 trending".
- "No account".
- Any Linux or Windows line.
- "View source". Open source is in the line under both actions. GitHub is linked from the footer and the homepage
  open-source section (sitemap §B.3, §D).

### 3.3 Availability summary (closing CTA, blog CTA)

| Key | English | Tiếng Việt |
|---|---|---|
| `availability.summary` | Available for {deviceList}. | Hiện có trên {deviceList}. |

- `{deviceList}` joins each available platform's `deviceNames` with the catalog's list joiners (§11.4) during SSR
  (architecture §1.5). Today it renders as "Mac, iPhone and iPad" / "Mac, iPhone và iPad".
- Platforms whose `status` is not `released` (architecture §1.8) never render.

---

## 4. CTA labels

| Purpose | English | Tiếng Việt | Notes |
|---|---|---|---|
| Header button | Download | Tải về | `/download`, one card per available platform. The label stays neutral when a platform ships |
| Mac action (hero, closing CTA, blog CTA, mobile menu, `/download`) | Download for Mac | Tải về cho Mac | Only place "for Mac" appears on the homepage. An availability key, not a `nav.*` key (§13) |
| `/download` architecture buttons | Download for Apple silicon · Download for Intel | Tải bản cho Apple silicon · Tải bản cho Intel | Both server-rendered. A client hint may highlight one, never choose |
| Package managers / mirrors | Other ways to install | Cách cài đặt khác | |
| Copy a command | Copy · Copied | Sao chép · Đã sao chép | |
| iPhone and iPad | App Store badge (no custom text button) | App Store badge | "App Store" is never translated |
| Homepage iPhone section link | TablePro for iPhone and iPad | TablePro cho iPhone và iPad | `/ios`; plain link, so the section adds no second badge to its layout |
| Pricing | See pricing | Xem bảng giá | |
| Plan buttons | Get Starter · Get Team | Mua gói Starter · Mua gói Team | `checkout_started{tier,cycle}` unchanged |
| Free plan button | Download for Mac | Tải về cho Mac | |
| Compare plans | Compare plans | So sánh các gói | |
| Discount | Apply code | Áp dụng mã | |
| Checkout errors | Try again | Thử lại | |
| Docs | Read the docs | Đọc tài liệu (tiếng Anh) | External; `hreflang="en"` |
| Source | View on GitHub | Xem trên GitHub | |
| Newsletter | Subscribe | Đăng ký nhận tin | `newsletter_signup_clicked{source}` unchanged |
| Account sign-in | Sign in | Đăng nhập | Account app |
| Magic link | Send sign-in link | Gửi liên kết đăng nhập | Account app |
| Polar portal (in `/account`, Polar purchases) | Billing & invoices | Thanh toán và hóa đơn | `https://polar.sh/tablepro/portal` |
| Support | Email support · Start live chat | Gửi email hỗ trợ · Bắt đầu chat | Crisp loads only on that click |
| Bug report | Report a bug | Báo lỗi | GitHub issues |
| English-only article | Read in English | Đọc bản tiếng Anh | Release posts on the Vietnamese site |

"Learn more" and "Click here" are not used. Every link says where it goes.

---

## 5. Homepage title, meta and social

| | English | Chars | Tiếng Việt | Chars |
|---|---|---|---|---|
| `<title>` | TablePro: native database client for Mac, iPhone and iPad | 57 | TablePro: database client native cho Mac, iPhone và iPad | 56 |
| Title fallback | TablePro: native database client for developers | 47 | TablePro: database client native dành cho lập trình viên | 56 |
| Meta description | TablePro is a native, open-source database client for PostgreSQL, MySQL, SQL Server, MongoDB, Redis and more. Free to use, with optional paid features. | 151 | Database client native, mã nguồn mở để quản lý PostgreSQL, MySQL, SQL Server, MongoDB, Redis và nhiều cơ sở dữ liệu khác. Dùng miễn phí, có gói trả phí. | 152 |

Counts are NFC code points.

**Title rules:**
- `{deviceList}` in the title comes from available platforms, joined as in §3.3.
- If the rendered title passes 60 characters in either locale, it falls back to the "developers" form.
- A Pest test asserts:
  - both titles are ≤ 60 characters,
  - both meta descriptions are ≤ 160 characters,
  - "database client" appears in both locales,
  - no unscoped "free" (the description must also contain "paid" / "trả phí").

**Meta rules:**
- The meta engines are the `featured` engines that also carry `meta: true`. SQLite is dropped for length; the
  subtitle carries it.
- "quản lý cơ sở dữ liệu" is how Vietnamese users search ("phần mềm quản lý MySQL"). TablePro's App Store listing uses
  it too. It appears only in the VI meta. Everywhere else the category stays "database client".

**Open Graph:**
- `og:title` = `<title>` and `og:description` = meta description, in each locale.
- `og:locale` is `en_US` or `vi_VN`, with `og:locale:alternate` for the other.
- The OG image follows the asset handoff. The generic brand card serves until a bespoke card exists.

**Other pages:**
- A page title names a platform only when the page is about that platform. Examples:
  - `/download`: "Download TablePro for Mac" / "Tải TablePro cho Mac".
  - `/ios`: "TablePro for iPhone and iPad" / "TablePro cho iPhone và iPad".
  - Engine pages keep a Mac-specific title where the page answers a Mac need (spec §5, §10).
- The homepage title is the only identity title with a platform list.

---

## 6. Product description, naming and structured data

### 6.1 Global product description

| Use | English | Tiếng Việt |
|---|---|---|
| Short (identity; Organization `description`, OG fallback) | TablePro is a native, open-source database client for developers. | TablePro là database client native, mã nguồn mở, dành cho lập trình viên. |
| Long (WebSite `description`, About/FAQ intro) | TablePro is a native, open-source database client for developers. Run queries, browse and edit data in {featuredEngines} and more, with apps for {deviceList}. | TablePro là database client native, mã nguồn mở, dành cho lập trình viên. Chạy query, xem và chỉnh sửa dữ liệu trên {featuredEngines} và nhiều cơ sở dữ liệu khác, với ứng dụng cho {deviceList}. |

**"What native means"** (FAQ entry, so the word is backed up):
- **EN:** "Each TablePro app is written in Swift for its own platform. On the Mac it uses AppKit and SwiftUI, the
  Keychain and Touch ID. On iPhone and iPad it uses Face ID, widgets, Shortcuts and Live Activities. The database
  drivers are native too, with no JDBC."
- **VI:** "Mỗi ứng dụng TablePro được viết bằng Swift cho đúng nền tảng của nó. Trên Mac, ứng dụng dùng AppKit và
  SwiftUI, Keychain và Touch ID. Trên iPhone và iPad, ứng dụng dùng Face ID, tiện ích, Phím tắt và Hoạt động trực
  tiếp. Driver cơ sở dữ liệu cũng là native, không dùng JDBC."
- **Evidence:** the TablePro app repository at v0.77.0 (AppKit and SwiftUI, native drivers with no JDBC, Touch ID in
  Safe Mode, App Lock) and App Store 1.0 (the Quick Connect widget, Shortcuts and Siri, Live Activities).

### 6.2 Naming in copy

**Product and editions:**
- **Brand:** "TablePro" on every platform.
- **Editions, where two sit side by side:** "TablePro for Mac" and "TablePro for iPhone and iPad" (VI "TablePro cho
  Mac", "TablePro cho iPhone và iPad").
- **Running prose:** "the Mac app" and "the iPhone and iPad app" (VI "ứng dụng cho Mac", "ứng dụng cho iPhone và
  iPad"). Short labels may use "iPhone & iPad" in EN. VI always writes "iPhone và iPad".
- **Device words vs system words:** "Mac" in sentences, "macOS" only in requirements, and the same for iPhone and
  iPad vs iOS and iPadOS.
- **Chip names:** "Apple silicon", Apple's casing.

**Never use:** "TablePro Mobile", "TablePro iOS", "TablePro Mac" or "Universal".

**Tiers:** Free, Starter and Team. "Free" becomes "Miễn phí". Starter and Team are never translated, and "Pro" is not a
tier.

**Future editions:** "TablePro for {Platform}", added only when that platform's `status` is `released`.

### 6.3 Structured data

| Node | `@id` (keep stable) | `@type` | Key fields |
|---|---|---|---|
| Organization | `https://tablepro.app/#organization` | Organization | `name` TablePro. `description` = short description, localized. `logo`, `sameAs` from `links`. No `legalName`, address or founder |
| WebSite | `https://tablepro.app/#website` | WebSite | `name` TablePro. `inLanguage` `["en","vi"]`. `publisher` → Organization. Page-level `WebPage` nodes carry the page's own `inLanguage` |
| Mac app | `https://tablepro.app/#app` | SoftwareApplication | Fields below |
| iPhone and iPad app | `https://tablepro.app/#ios-app` | MobileApplication | Fields below |

**Mac app fields:**
- `name` TablePro; `alternateName` "TablePro for Mac".
- `applicationCategory` DeveloperApplication; `applicationSubCategory` "Database client".
- `operatingSystem` macOS; `softwareRequirements` = `{macRequirement}, {macArchitectures}`.
- `softwareVersion` from the release data; `downloadUrl` `/download`.
- `license` = the AGPL LICENSE URL.
- `offers` from `pricing.json`.
- `description` = the long description, localized.

**Mac app: remove** `isAccessibleForFree`, `fileSize`, the counted `disambiguatingDescription` and the stale macOS 14.

**iPhone and iPad app fields:**
- `name` TablePro; `alternateName` "TablePro for iPhone and iPad".
- `operatingSystem` and `softwareRequirements` from data.
- `softwareVersion` from the iTunes lookup.
- `installUrl` App Store; `offers` one Offer at price 0; `isAccessibleForFree` true.
- `license` AGPL.
- `featureList` from data, names only, with no "Ten database engines" and no Handoff.

**Rules for every node:**
- No `aggregateRating`.
- No counts in `featureList`.
- No per-database pseudo-apps. Engine pages reference `#app` through `about` or `mentions`.

---

## 7. Product pillars

Six pillars, ordered by the questions a reader asks after "what is it?". Each becomes one homepage section with one
image placeholder and links to its feature page and the docs.

**Rules for every pillar:**
- Headings are identity text. P6's platform list is the one templated exception.
- Bodies name engines, formats and features, and never type a count.
- Each body carries a platform tag and a tier tag from data.
- Paid items appear inside the pillar where they belong, labelled with their tier.
- Short labels are working names for this document and the content brief. The site's menu labels are in §10.1.

| # | Short label EN / VI | Heading EN / VI | Claim (EN) | Mac / iPhone and iPad scope | Paid inside | Evidence | Never say |
|---|---|---|---|---|---|---|---|
| P1 | Databases / Cơ sở dữ liệu | Relational, document, key-value and analytical databases / Cơ sở dữ liệu quan hệ, document, key-value và phân tích | Common drivers ship with the Mac app, and the rest download the first time you pick an engine and are updated separately from the app. Connect through SSH tunnels with jump hosts, TLS, AWS IAM, Microsoft Entra ID, Google sign-in or a tunnel command such as `kubectl port-forward`. Take passwords from the Keychain, 1Password, Vault or AWS Secrets Manager. Import connections, saved passwords included, from TablePlus, Sequel Ace, DBeaver, DataGrip, Beekeeper Studio and Navicat, or pre-fill them from a project's `.env` and config files | Mac: every engine in `engines.json`. iPhone and iPad: engines named from `platforms.json`; SSH with a password or key and a host-key prompt; TLS; Keychain | `$VAR` environment variables (Starter) | App v0.77.0: the engine picker (an in-use driver's update waits for "Restart to activate"); SSH tunnel and jump hosts; SSL/TLS; AWS IAM; Microsoft Entra ID; Google auth; Tunnel Command; password sources; Import connections from other apps (passwords included); Open Project Folder; Environment Variables | "every database"; drivers that "update on their own" or silently; jump hosts or an SSH agent on iPhone; AWS IAM for Redshift; "re-enter passwords"; local Unix sockets; Users & Roles beyond MySQL, MariaDB, PostgreSQL and PGlite |
| P2 | Query / Query | Write, run and understand queries / Viết, chạy và phân tích query | A SQL editor with schema-aware autocomplete, `:name` query parameters, searchable history, saved queries and linked SQL folders with Git status. EXPLAIN draws the plan as a diagram on supported engines, and Compare checks a plan against a baseline | Mac: all of it. iPhone and iPad: highlighted editor, Run/Stop, history, copy or share results; no autocomplete | Query Insights, Result Charts (Starter) | App v0.77.0: SQL editor, query parameters, query history, saved queries, linked SQL folders, EXPLAIN, EXPLAIN Compare, Query Insights, Result Charts. App Store 1.0: the query editor | EXPLAIN for SQL Server, Oracle or Cassandra; a headless query CLI (the `tablepro` command opens URLs and files); multiple cursors |
| P3 | Edit data / Chỉnh sửa dữ liệu | Edit data and schema, and see the SQL before you save / Sửa dữ liệu và schema, xem câu lệnh SQL trước khi lưu | Cell edits, new rows and deletions wait until you save, and Preview SQL shows the statements first. The Structure tab stages column, index, foreign-key and CHECK changes the same way. Filters, saved filters, highlight rules, a foreign-key picker, undo per tab, a read-only ER diagram and Users & Roles are included | Mac: all of it; structure is read-only on some engines (data). iPhone and iPad: row editor with NULL and DEFAULT, insert, swipe to delete (needs a primary key); read-only structure | — | App v0.77.0: staged edits, undo and redo, filters, highlight rules, FK navigation, the Structure tab, the ER diagram, Users & Roles. App Store 1.0: the row editor | "parameterized SQL" in the preview (values are inlined); "every type has its own editor"; "schema designer"; editing long or binary values on iPhone (#3177) |
| P4 | Safe Mode / Safe Mode | Guardrails for production databases / Lớp bảo vệ khi làm việc với production | Tag and colour connections by environment, and give each one a Safe Mode level, from Silent to Read-Only, with Touch ID or your password on the stricter levels. DROP, TRUNCATE and DELETE without WHERE stop and ask at every level. Data Rewind can put back the values a recent save replaced | Mac: the level set from data, Silent by default. iPhone and iPad: Off, Confirm Writes, Read-Only; no biometric confirm | Data Rewind (Starter) | App v0.77.0: connection tags and colours, Safe Mode per connection and its floors, Data Rewind. App Store 1.0: Safe Mode | "nothing runs that you have not read"; "every write needs approval" without "at stricter levels"; "UPDATE without WHERE warns"; Rewind as a backup; a Rewind retention number in headings |
| P5 | Import & export / Import và export | Import, export and copy data between databases / Import, export và sao chép dữ liệu giữa các cơ sở dữ liệu | Import CSV, JSON, XLSX and SQL into a table, and export to CSV, JSON, SQL, XLSX, Markdown and more. Copy tables or a whole database to another connection, even on a different engine, with every type change listed for review. Open CSV, JSON and XLSX files in the Data Files window, and back up and restore supported engines with their own dump tools | Mac: all of it; some engines have no import (data); the user installs the dump tools. iPhone and iPad: copy or share results as JSON, CSV or SQL INSERT; Shortcuts "Add Rows" | Compare & Sync (Starter) | App v0.77.0: Import, Export, Data Files, Backup Dump and Restore Dump, Copy To, Duplicate Database, Transfer To, Compare & Sync. App Store 1.0: Shortcuts and Siri | "CSV inspector"; import on engines that lack it; any timing such as "1 GB in 0.4 s"; backup "for PostgreSQL and Redshift" only; "edit XLSX" |
| P6 | iPhone & iPad / iPhone và iPad | Native apps for {deviceList} / Ứng dụng native cho {deviceList} | On the Mac, TablePro is a Swift app with separate Apple silicon and Intel builds. It keeps passwords in the Keychain, asks for Touch ID on stricter Safe Mode levels and updates itself. On iPhone and iPad it is a separate app with its own scope: connect over SSH or TLS, browse tables, run queries and edit rows, with an optional Face ID lock, Shortcuts, a Home Screen widget and Live Activities for running queries | Rendered from `platforms.json` as two platform cards (requirement, destination, scope link). The iPhone card links to `/ios` and its "Not on iPhone and iPad" list | iCloud Sync between iPhone and Mac needs Starter on the Mac | App v0.77.0: separate Apple silicon and Intel DMGs, in-app updates, credentials in the Keychain, iCloud Sync. App Store 1.0: the iPhone and iPad app, App Lock | feature parity; "same app everywhere"; jump hosts, Redis key browsing or side-by-side iPad layout on iPhone (only on the app's main branch, not in App Store 1.0); "nothing connects until you unlock"; visionOS; Handoff without "with iCloud Sync on" |

**P6 in Vietnamese** (the other pillar bodies are translated with the glossary in §11):

> Trên Mac, TablePro là ứng dụng Swift với bản build riêng cho Apple silicon và Intel. Ứng dụng lưu mật khẩu trong
> Keychain, hỏi Touch ID ở các mức Safe Mode nghiêm ngặt và tự cập nhật. Trên iPhone và iPad, TablePro là một ứng
> dụng riêng với phạm vi riêng: kết nối qua SSH hoặc TLS, xem table, chạy query và sửa dòng, kèm khóa Face ID tùy
> chọn, Phím tắt, tiện ích trên Màn hình chính và Hoạt động trực tiếp cho query đang chạy.

**Homepage order.** Sitemap §D owns the order. The pillars feed its sections like this:

| Sitemap §D section | Fed by |
|---|---|
| 1 Hero (`#top`) | §3 |
| 2 Databases (`#databases`) | P1, the engine and driver sentences |
| 3 **Sponsors** (fixed third; the 4 verified current sponsors only) | — |
| 4 Workflows (`#features`) | P2 (Query), P3 (Edit data; Schemas and sync), P5 (Files), P1's connection sentences (Connect) |
| 5 Production safety (`#safety`) | P4 |
| 6 AI and MCP (`#ai`) | §8 |
| 7 Mac, iPhone and iPad (`#platforms`, alias `#mobile`) | P6 |
| 8 Coming from another app (`#switch`) | P1's import sentence |
| 9 Pricing (`#pricing`) | §9 and the plan cards |
| 10 Open source and get started (`#open-source`) | §9's AGPL sentence and the closing actions (§3.2, §4) |

The existing `#pricing`, `#features`, `#databases` and `#mobile` fragments keep working, because shipped Mac builds,
the docs and old links use them.

---

## 8. AI and MCP framing

**Proportion:**
- AI and MCP are real, free and Mac-only, so they get accurate coverage that people can find.
- They do not lead the identity.

**Where they appear:**
- One homepage section, after the workflow pillars.
- An "AI & MCP" entry in the Features menu.
- One feature page.
- FAQ entries.
- Two names in the Mac `featureList`.

**Where they never appear:**
- The H1, subtitle, `<title>`, meta description or OG card.
- An "AI-powered" adjective anywhere.
- A tool count or a provider count in prose. If a count is ever shown, it comes from data.

| | English | Tiếng Việt |
|---|---|---|
| Section heading | AI assistant and MCP server | Trợ lý AI và MCP server |
| Body | On the Mac, an optional AI assistant explains, optimizes and fixes queries and answers questions about your schema. You choose the provider: an API key, an account you already have, or a model running on your Mac. TablePro runs no AI service of its own, and nothing is sent until you add a provider. Chat starts in Ask mode, which only reads. In Edit and Agent modes the assistant can run statements. At Alert or a stricter Safe Mode level they wait for you, and DROP or TRUNCATE always needs your click. The built-in MCP server lets clients such as Claude Code, Cursor and Zed use your saved connections without seeing a password. It listens only on 127.0.0.1, and each connection decides what outside apps may do: Blocked, Read Only (the default) or Read & Write. All of this is free. | Trên Mac, trợ lý AI (tùy chọn) giải thích, tối ưu và sửa lỗi query, đồng thời trả lời câu hỏi về schema của bạn. Bạn tự chọn nhà cung cấp AI: dùng API key, đăng nhập bằng tài khoản bạn đang có, hoặc chạy model ngay trên máy Mac. TablePro không vận hành dịch vụ AI nào, và không có gì được gửi đi cho tới khi bạn thêm nhà cung cấp. Chat mặc định ở chế độ Ask, chỉ đọc dữ liệu. Ở chế độ Edit và Agent, trợ lý có thể chạy câu lệnh. Từ mức Safe Mode Alert trở lên, các câu lệnh này chờ bạn duyệt, còn DROP hay TRUNCATE luôn cần bạn bấm xác nhận. MCP server tích hợp sẵn cho phép các client như Claude Code, Cursor và Zed dùng connection đã lưu mà không thấy mật khẩu. Server chỉ lắng nghe trên 127.0.0.1, và mỗi connection tự quyết định ứng dụng bên ngoài được làm gì: Blocked, Read Only (mặc định) hoặc Read & Write. Tất cả đều miễn phí. |
| Image slot | AI chat pane on a sample `shop` PostgreSQL connection answering "top 5 customers by revenue last month", with the code block's Copy and Insert buttons visible (Apply to Editor belongs to the walkthroughs; `AIChatCodeBlockView.swift` in the app at v0.77.0) | same asset; the caption is localized |

**Evidence per clause** (the TablePro app repository at v0.77.0):
- **Providers:** "an account you already have" covers Copilot, ChatGPT/Codex and Claude Agent. It avoids "bring your
  own key", which is wrong for 7 of the 14 provider types.
- **Approvals:** at Silent, the default, write tools are auto-approved, hence "at Alert or a stricter level". DROP
  and TRUNCATE cannot be pre-approved.
- **MCP network:** loopback only; remote access was removed in 0.67.0. The External Clients level defaults to Read
  Only.

**Feature page only:**
- What a message sends by default: the schema (up to 20 tables) and the current query. Result rows are off.
- Agent mode: "gives one AI session the whole window; while it is on, writes wait for Run". It is **not** a
  security boundary.
- Outside MCP servers: every call waits for you.
- The stdio bridge's automatic Read & Write token.
- The MCP server starts when a client you set up connects.
- Copilot telemetry is on by default when the provider is added.
- AppleScript and the official Raycast extension.

**Never say:**
- "remote MCP", "MCP over TLS", or any typed tool or provider number;
- "the AI never writes without approval", "Agent mode is a sandbox", "nothing leaves your Mac";
- anything about AI on iPhone or iPad.

---

## 9. Free core, paid features, open source

Used in the pricing summary at `#pricing`, on `/pricing` and in the FAQ. The examples come from license data
(`highlight: true`), and the pricing page renders the full list from the same file.

**EN**

> TablePro is open source under the AGPLv3, including the code for its paid features. The Mac app is free to download
> and use, with no trial period or time limit. A Starter or Team plan adds optional features to the Mac app, such as
> {starterExamples}. Team includes everything in Starter and adds {teamExamples} for sharing connections and queries
> with your team. Connecting to any supported engine needs no license, and neither do the AI assistant, the MCP server
> or Safe Mode. If a monthly or yearly plan ends, its features lock and the rest of the app keeps working. A one-time
> purchase has no expiry date. The iPhone and iPad app is free, with no in-app purchases, and needs no license. To
> sync it with a Mac through iCloud, the Mac needs Starter.

**VI**

> TablePro là phần mềm mã nguồn mở theo giấy phép AGPLv3, kể cả phần mã của các tính năng trả phí. Bạn tải về và dùng
> ứng dụng cho Mac miễn phí, không phải bản dùng thử và không giới hạn thời gian. Gói Starter hoặc Team bổ sung một số
> tính năng tùy chọn cho ứng dụng Mac, như {starterExamples}. Gói Team gồm mọi thứ trong Starter và có thêm
> {teamExamples} để chia sẻ connection và query trong nhóm. Kết nối tới bất kỳ engine nào được hỗ trợ, trợ lý AI, MCP
> server và Safe Mode đều không cần license. Khi gói theo tháng hoặc theo năm kết thúc, các tính năng trả phí bị khóa,
> phần còn lại của ứng dụng vẫn hoạt động bình thường. Gói mua một lần không có ngày hết hạn. Ứng dụng cho iPhone và
> iPad miễn phí, không có mua hàng trong ứng dụng và không cần license. Muốn đồng bộ với máy Mac qua iCloud thì máy Mac
> cần gói Starter.

**Values today.** Both are rendered from license data and joined on the server with the catalog's list joiners
(§11.4; architecture §1.5). Feature names stay in English.

| Key | EN | VI |
|---|---|---|
| `{starterExamples}` | Compare & Sync, Query Insights, Data Rewind and iCloud Sync | Compare & Sync, Query Insights, Data Rewind và iCloud Sync |
| `{teamExamples}` | Team Catalog and Team Library | Team Catalog và Team Library |

**Evidence for each claim** (the TablePro app repository at v0.77.0 unless stated):

| Claim | Evidence |
|---|---|
| The paid boundary, and Team includes Starter | `ProFeature.swift` |
| AI, MCP, Safe Mode and engines are free | None of them checks a license |
| On lapse the paid features lock; there is no perpetual fallback | The app's license lifecycle |
| A one-time purchase has no expiry date | The plan's own wording, "paid once, no expiry date", and nothing more |
| The iPhone app gates nothing | App Store 1.0 has no in-app purchases; iCloud Sync needs Starter on the Mac and nothing on iOS |
| The paid code is public | The paid features live in the same public repository |

**The FAQ's AGPL sentence** (from the AGPLv3 text):
- **EN:** "The AGPL places no conditions on running TablePro. They apply to distributing it, and to offering a
  modified version to others over a network."
- **VI:** "Giấy phép AGPL không đặt điều kiện nào cho việc chạy TablePro. Các điều kiện chỉ áp dụng khi bạn phân phối
  TablePro, hoặc khi bạn cung cấp một phiên bản đã sửa đổi cho người khác dùng qua mạng."

**Deliberately absent:**
- "the whole app", "no feature gating", "free forever";
- lifetime updates, savings badges or "most popular";
- regional prices, PPP, bank transfer, VND or named local payment gateways.

---

## 10. Navigation and footer labels

Sitemap §B owns the navigation: which items exist, their order, their grouping and their targets (§B.1 header, §B.2
mobile, §B.3 footer). This section supplies the English and Vietnamese strings for those slots, from the glossary in
§11. Where the two documents disagree on structure, the sitemap wins. Where they disagree on a string, this section
and §11 win.

### 10.1 Header and mobile menu

**Desktop** (sitemap §B.1): logo · **Features ▾** · Databases · Pricing · Docs ↗ · Blog · (spacer) · Language ·
Theme · Account · **Download** (button). The header has no GitHub icon. GitHub is linked from the footer's Resources
and Community groups and from the homepage open-source section.

| Slot | English | Tiếng Việt | Notes |
|---|---|---|---|
| Features (menu button) | Features | Tính năng | Opens the Features menu below |
| Databases | Databases | Cơ sở dữ liệu | `/databases` |
| Pricing | Pricing | Bảng giá | `/pricing` |
| Docs | Docs ↗ | Tài liệu ↗ | External, English only. VI accessible name "Tài liệu (tiếng Anh)", `hreflang="en"` |
| Blog | Blog | Blog | The VI listing labels English-only posts "(tiếng Anh)" |
| Language | {current language name} ▾, then English · Tiếng Việt | same | Accessible name "Language" / "Ngôn ngữ". Endonyms, no flags or codes. Each option links to the equivalent page, with `aria-current` on the active one |
| Theme | Icon button ▾, then Light · Dark · System | Sáng · Tối · Theo hệ thống | Accessible name "Theme" / "Giao diện". Stored in `localStorage` key `theme`; light when nothing is stored |
| Account | Account | Tài khoản | `/account?locale={locale}`, unprefixed |
| Download button | Download | Tải về | `/download` · `/vi/download`; `download_click{location:'header', platform:'mac'}`. The label stays neutral when a platform ships |
| Skip link | Skip to content | Chuyển đến nội dung chính | |

**Features menu** (sitemap §B.1 order):

| Item | English | Tiếng Việt | Target |
|---|---|---|---|
| Hub | All features | Tất cả tính năng | `/features` |
| Querying | Querying | Query | `/features/querying` |
| Data editing | Data editing | Chỉnh sửa dữ liệu | `/features/data-editing` |
| Schema | Schema | Schema | `/features/schema` |
| Import & export | Import & export | Import và export | `/features/import-export` |
| AI & MCP | AI & MCP | AI và MCP | `/features/ai-mcp` |
| Connections | Connections | Kết nối | `/features/connections` |
| Sync & teams | Sync & teams | Đồng bộ và làm việc nhóm | `/features/sync-and-teams` |
| Platform link | iPhone & iPad | iPhone và iPad | `/ios`. Rendered from data, see below |

**Platform link.** The "iPhone & iPad" entry is not a catalog string. It appears in the Features menu, the mobile
menu and the footer's Product group, and it renders from `platforms.json`:
- There is one link per `released` platform that has its own page. Today that is only iOS → `/ios`, because the Mac's
  page is `/download`.
- The label is that platform's `deviceNames`, joined with the catalog's short joiner (§11.4).
- No `nav.*` or `footer.groups.*` value names a device, so the identity-key guard in §13 needs no exemption. A future
  platform with its own page gets its link from data.

**Mobile** (sitemap §B.2):
- The collapsed bar shows the logo, a compact **Download** / **Tải về** and a menu button. The menu button's
  accessible name is "Menu" in both locales.
- The open menu lists, in order:
  - Features (the same items), Databases, Pricing, the platform link, Docs ↗, Blog, FAQ / Câu hỏi thường gặp and
    Account;
  - **Download for Mac** / **Tải về cho Mac** (→ `/download`) and the App Store badge, with
    `download_click{location:'mobile-nav', platform}`. Both come from the availability-layer CTA keys in §4, not from
    `nav.*`;
  - last, the language (one row that opens the list), then the theme control.

### 10.2 Footer

The footer has five groups, a newsletter block and a bottom row (sitemap §B.3). The engine lists and comparison slugs
move to their hubs, so no page becomes undiscoverable. There is no footer blurb.

| Group EN / VI | Links EN | Links VI | Targets |
|---|---|---|---|
| Product / Sản phẩm | Features · Databases · iPhone & iPad · Pricing · Download · Compare | Tính năng · Cơ sở dữ liệu · iPhone và iPad · Bảng giá · Tải về · So sánh | `/features`, `/databases`, the platform link (§10.1), `/pricing`, `/download`, `/compare` |
| Resources / Tài nguyên | Documentation ↗ · Changelog ↗ · Blog · FAQ · Source code ↗ · Report a bug ↗ | Tài liệu (tiếng Anh) ↗ · Changelog (tiếng Anh) ↗ · Blog · Câu hỏi thường gặp · Mã nguồn ↗ · Báo lỗi ↗ | Docs, docs `/changelog`, `/blog`, `/faq`, the GitHub repository, GitHub issues |
| Support / Hỗ trợ | Account · Email support · Live chat | Tài khoản · Gửi email hỗ trợ · Chat trực tuyến | `/account?locale=`; `mailto:` the support address in `facts.json`; a button that loads Crisp only when clicked |
| Community / Cộng đồng | GitHub · Discord · X · Facebook · Telegram · Sponsor TablePro ↗ | GitHub · Discord · X · Facebook · Telegram · Tài trợ TablePro ↗ | `facts.json` `links`. Brand names stay as they are. "Sponsor TablePro" goes to GitHub Sponsors |
| Legal / Pháp lý | Privacy · Terms · Refund policy · Cookie settings | Quyền riêng tư · Điều khoản sử dụng · Chính sách hoàn tiền · Cài đặt cookie | `/privacy`, `/terms`, `/refund-policy`. "Cookie settings" is a button that reopens the consent bar (`tablepro:analytics-consent`) |
| Newsletter block | Subscribe | Đăng ký nhận tin | `newsletter_signup_clicked{source:'footer'}`. No subscriber count (sitemap §B.3) |
| Bottom row | © {year} TablePro. Source code under the AGPLv3. · English · Tiếng Việt · theme control | © {year} TablePro. Mã nguồn theo giấy phép AGPLv3. · English · Tiếng Việt · giao diện | The language links repeat as plain links |

**Keys:**
- Group labels and their links live under `footer.groups.*`, which are identity keys (§13).
- The platform link renders from data (§10.1).
- The bottom row lives under `footer.bottom.*`. It is not an identity key, because it names the AGPLv3.

**Why these labels:**
- The header, the footer and the hub say "Databases". A link into the hub from running copy says "Supported
  databases" / "Cơ sở dữ liệu được hỗ trợ", never "All databases", which reads as a universal (§12).
- "Live chat" loads Crisp only when clicked.
- There is no product blurb, because the sitemap and design-system footers hold only a newsletter block and the link
  groups. The short description and `availability.summary` are used where §3.3 and §6.1 say.

---

## 11. Glossary (fixed EN ↔ VI, whole site and account app)

**Rule (from spec §0):**
- Address the reader as "bạn".
- Keep developer terms in English.
- Keep product, feature, tier, mode, engine and command names untranslated.
- Use Apple's own Vietnamese names for iOS system features, because readers see those names on their devices.
- Spelling follows the app catalog majority: hủy, xóa, khóa, tùy.

### 11.1 Product and category

| EN | VI | Note |
|---|---|---|
| database client | database client | Category; never "phần mềm quản lý cơ sở dữ liệu" as the category. "quản lý cơ sở dữ liệu" is allowed only in the VI meta description |
| native | native | Never "gốc" or "thuần" |
| open source (predicative) / open-source (before a noun) | mã nguồn mở | |
| the AGPLv3 (licence) | giấy phép AGPLv3 | The only use of "giấy phép" in prose |
| developer | lập trình viên | |
| the Mac app / the iPhone and iPad app | ứng dụng cho Mac / ứng dụng cho iPhone và iPad | "ứng dụng Mac" is fine in short running prose |
| macOS 13 Ventura or later | macOS 13 Ventura trở lên | Requirement strings come from data |
| iOS and iPadOS 18 or later | iOS và iPadOS 18 trở lên | |
| Apple silicon or Intel | Apple silicon hoặc Intel | |
| App Store | App Store | Never translated |

### 11.2 Database and feature terms

| EN | VI | Note |
|---|---|---|
| database (generic) | cơ sở dữ liệu | "database" only inside "database client" |
| engine, driver, plugin | engine, driver, plugin | |
| connection (the saved object) / to connect | connection / kết nối | "Kết nối qua SSH"; "connection đã lưu" |
| query (noun) / run a query / write a query | query / chạy query / viết query | |
| schema, table, view, index, trigger, transaction | schema, table, view, index, trigger, transaction | |
| row / column | dòng / cột | Never "hàng" |
| primary key / foreign key | khóa chính / khóa ngoại | |
| data | dữ liệu | |
| file | file | Apple's "ứng dụng Tệp" only for the iOS Files app |
| import / export | import / export | Verbs too: "import CSV vào table", "export ra CSV" |
| backup / restore / dump | sao lưu / khôi phục / dump | |
| SQL editor, data grid, autocomplete | SQL editor, data grid, autocomplete | |
| syntax highlighting | tô sáng cú pháp | |
| execution plan / EXPLAIN | execution plan / EXPLAIN | |
| SSH tunnel, jump host, TLS, SSL | SSH tunnel, jump host, TLS, SSL | |
| password / passphrase | mật khẩu / passphrase | |
| tag / environment / production, staging | tag / môi trường / production, staging | |
| read-only | chỉ đọc | |
| staged changes | thay đổi đang chờ lưu | |
| Preview SQL (the command) / preview the SQL | Preview SQL / xem trước câu lệnh SQL | |
| sync / iCloud Sync | đồng bộ / iCloud Sync | |
| Keychain / iCloud Keychain | Keychain / iCloud Keychain | |
| AI assistant / AI chat / Agent mode | trợ lý AI / AI chat / Agent mode | |
| provider (AI) | nhà cung cấp AI | Matches the app label "Nhà cung cấp" |
| API key, model, MCP server, client | API key, model, MCP server, client | |
| Safe Mode and its level names (Silent, Alert, Read-Only…; iOS Off, Confirm Writes, Read-Only) | unchanged | |
| Feature names (Data Rewind, Compare & Sync, Query Insights, Result Charts, Data Files, Copy To, Transfer To, Open Quickly, Linked Folders, Team Catalog, Team Library…) | unchanged | |
| Widget · Shortcuts · Live Activities · Lock Screen · Home Screen | tiện ích · Phím tắt · Hoạt động trực tiếp · Màn hình khóa · Màn hình chính | Apple's Vietnamese, as in TablePro's App Store listing |
| Face ID, Touch ID, Optic ID, Handoff, Siri, Dynamic Island | unchanged | |

**Click paths in Vietnamese copy.** Show the app's Vietnamese label first, then the English label in parentheses
once. Example: **Cài đặt > Tích hợp** (Settings > Integrations). This is the only place app labels such as "Chế độ an
toàn" appear. Prose keeps "Safe Mode".

### 11.3 Commerce and account

| EN | VI | Note |
|---|---|---|
| plan / paid plan | gói / gói trả phí | "gói Starter", "gói Team" |
| Free (tier) | Miễn phí | |
| license (commercial) / license key / activate | license / license key / kích hoạt | Never "giấy phép" for the paid key (prose); the app's pane label is quoted only in click paths |
| monthly / yearly / one-time | theo tháng / theo năm / mua một lần | The `lifetime` cycle displays as "One-time" / "Mua một lần" with "Paid once, no expiry date" / "Trả một lần, không có ngày hết hạn". The checkout value stays `lifetime` |
| per seat / seat / minimum {n} seats | mỗi seat / seat / tối thiểu {n} seat | Explain on first use: "mỗi seat là một máy Mac được kích hoạt" |
| activated Macs | máy Mac đã kích hoạt | |
| subscription | gói thuê bao | Avoid "đăng ký", which also means sign up |
| Prices in USD | Giá tính bằng USD | A VI page never implies VND or a regional price |
| merchant of record | merchant of record | "Polar là merchant of record: Polar nhận thanh toán, xử lý thuế và gửi hóa đơn" |
| refund / refund policy | hoàn tiền / chính sách hoàn tiền | |
| priority support | hỗ trợ ưu tiên | Always with its definition: emails answered first, within one business day / "email được trả lời trước, trong vòng một ngày làm việc" |
| discount code | mã giảm giá | |
| in-app purchases | mua hàng trong ứng dụng | Apple's term |
| billing & invoices | thanh toán và hóa đơn | |
| sign in / sign out / sign-in link | đăng nhập / đăng xuất / liên kết đăng nhập | |
| invite / team member | mời / thành viên nhóm | Tier name "Team" stays English |

### 11.4 Interface and navigation

| EN | VI |
|---|---|
| Features · Databases · Pricing · Docs · Documentation · Blog · Account · Download | Tính năng · Cơ sở dữ liệu · Bảng giá · Tài liệu · Tài liệu · Blog · Tài khoản · Tải về |
| FAQ · Comparisons · Support · Changelog | Câu hỏi thường gặp · So sánh · Hỗ trợ · Changelog |
| Language · Theme · Light · Dark · System | Ngôn ngữ · Giao diện · Sáng · Tối · Theo hệ thống |
| Privacy · Terms · Refund policy · Cookie settings | Quyền riêng tư · Điều khoản sử dụng · Chính sách hoàn tiền · Cài đặt cookie |
| (English) label for English-only content | (tiếng Anh) |
| Screenshot placeholder · {id} | Ảnh chụp màn hình (sẽ bổ sung) · {id} |
| Requires … | Yêu cầu … |
| Available for … | Hiện có trên … |
| List joiners, used during SSR (architecture §1.5): `, ` between items and ` and ` before the last, with no serial comma ("Mac, iPhone and iPad"). Short joiner for labels: ` & ` ("iPhone & iPad") | `, ` between items and ` và ` before the last ("Mac, iPhone và iPad"). Short joiner: ` và ` ("iPhone và iPad") |

### 11.5 CTA verbs

| EN | VI |
|---|---|
| Download | Tải về |
| Get (a plan) | Mua gói … |
| See / View | Xem |
| Compare | So sánh |
| Read | Đọc |
| Copy | Sao chép |
| Subscribe | Đăng ký nhận tin |
| Sign in | Đăng nhập |
| Send | Gửi |
| Apply | Áp dụng |
| Try again | Thử lại |
| Report | Báo |
| Sponsor | Tài trợ |

---

## 12. Words and claims banned site-wide

**One implementation.** Architecture §1.17 `Content/BannedClaimsTest` is the only test that applies this section:
- Its phrase data is the table in §12.1, in both locales. Its exemption data is §12.2.
- There is no second, rendered-page test.
- `Seo/StaleClaimsTest` is folded into it (architecture §1.17).
- Typed counts are tested by architecture's `Content/NoTypedCountsTest` and by the identity-key regex in §13.

**What the test reads.** It reads the sources architecture §1.17 names: the content files
(`resources/data/content/{en,vi}/**`), the UI and server catalogs, the legal markdown and translated posts.
Structured data and OG cards take their text from those sources, so they need no scan of their own.

**Scope.** The "About" column says whose claims a row bans.
- **TablePro** rows ban claims about TablePro. Some competitor facts use the same words, and the comparison pages
  need them: DBeaver's cross-platform reach, Postico's macOS 14 floor, Sequel Ace on the Mac App Store. These facts
  reach the site only through the compare content (`content/{en,vi}/compare/*`) and the comparison cells. They pass
  the test only through an allowlist entry in §12.2.
- **Any** rows apply to every sentence, whoever it is about.

### 12.1 The list

| Class | About | Banned (EN) | Banned (VI) | Allowed form |
|---|---|---|---|---|
| Universals | TablePro | every database, all databases, any database, all platforms, every platform, cross-platform, one app everywhere, works everywhere | mọi cơ sở dữ liệu, tất cả cơ sở dữ liệu, mọi nền tảng, đa nền tảng, trên mọi thiết bị | "{featuredEngines} and more"; "each platform it supports". A link to the hub says "Supported databases" / "Cơ sở dữ liệu được hỗ trợ" |
| Platform futures | TablePro | coming soon, waitlist, release dates for unreleased platforms; any Windows or Linux availability (a reviewer check, because comparison pages name competitors' Windows and Linux builds) | sắp ra mắt, danh sách chờ | TablePro's Windows and Linux status appears only in the FAQ ("a prototype exists, nothing to install, no date") and on `/download#other-platforms` ("not available, no date", sitemap §A.1) |
| Brand defined by Mac | TablePro | "Mac database client", or "for Mac" as the identity (tested on identity keys by §13; reviewers check the rest); "TablePro Mobile"; Universal, Universal Binary; Mac App Store; Setapp; visionOS app | TablePro Mobile | "Download for Mac" on Mac actions; platform-specific page titles; "separate builds for Apple silicon and Intel". On `/ios`, "one app for iPhone and iPad" rather than "universal app" |
| Unscoped free | Any | the whole app is free, all of it, no feature gating, no per-feature gate, no paywall, free forever, completely free, 100% free, free software as a price | hoàn toàn miễn phí, miễn phí hoàn toàn, miễn phí mãi mãi, miễn phí trọn đời | "free to use" next to "paid plans add optional features"; "free, with no in-app purchases" for iPhone |
| Unlock framing | Any | unlock, unlocks | mở khóa | "adds" / "bổ sung" for paid features. iPhone App Lock is written "lock the app with Face ID" / "khóa ứng dụng bằng Face ID", as in the App Store listing |
| Privacy | Any | nothing leaves (or leaving) your device/Mac/computer, fully offline, no account (unscoped), nothing to sign up for (unscoped), anonymous analytics, no tracking, only the license key is sent, no other data is sent | không có dữ liệu nào rời khỏi máy, hoàn toàn offline, không cần tài khoản (unscoped), ẩn danh | "No sign-up to use the app"; "With no license activated, the only request the Mac app makes to TablePro is a daily usage report, on by default and switchable in Settings"; iOS: "Nothing goes to TablePro unless you turn on Share Usage Data". The Privacy page may quote the Mac setting's exact label (§12.2, A8) |
| Safety overreach | Any | nothing runs that you have not read, all changes reviewed, every write needs approval (unscoped), the AI never writes without approval, Agent mode is a sandbox / security boundary, UPDATE without WHERE asks | mọi thay đổi đều được xem lại, AI không bao giờ ghi khi chưa được duyệt | "DROP, TRUNCATE and DELETE without WHERE stop and ask at every level. Raise a connection's Safe Mode and every write waits for you" |
| Performance | Any | any speed, memory, startup or benchmark figure; any size figure outside the allowed form; blazing, lightweight, instant, under a second, N× faster/lighter, ~20 MB, ~80 MB; "fast" as a claim about the app | siêu nhanh, nhanh hơn, nhẹ hơn, tức thì | **Download sizes only.** On `/download`, each DMG's size is rendered from the GitHub release API (sitemap §A.1), so no size is typed into a source file. In a comparison cell, a download size may appear with its date and source (§12.2, A7). No size appears in the hero, the rest of the homepage, a meta description, an OG card or JSON-LD (`fileSize` stays removed, §6.3). Nothing else until a published method exists. Feature names such as Open Quickly / "Mở nhanh" and Quick Connect are allowed |
| Hype | Any (legal pages exempt) | powerful, seamless, effortless, revolutionary, supercharge, game-changing, ultimate, best-in-class, next-generation, cutting-edge, magic, AI-powered | mạnh mẽ, liền mạch, đột phá, vượt trội, tuyệt vời, hàng đầu, tốt nhất, thế hệ mới | Plain verbs and names |
| Typed counts | TablePro | numerals for engines, MCP tools, AI providers, Safe Mode levels, sync record types, paid features, UI languages | same | Data-driven values, or names instead of counts. A competitor's count appears only in a comparison cell with a source (§12.2, A6) |
| Stale facts | TablePro | macOS 14, Sonoma, 16 MCP tools, 13 AI providers, remote MCP / MCP over TLS, CSV inspector, Quick Switcher, Redis pub/sub, Mongo pipeline builder, SQLCipher, "#1 on GitHub Trending" (unqualified), bring your own key | same terms | The current fact from the app at the copy floor. A competitor's OS floor is written as a version number ("macOS 14 or later", §12.2, A2), never as a release name |
| Commerce | Any | most popular, best value, save N% (typed), lifetime updates, all future updates, money-back guarantee, PPP, regional pricing, bank transfer, VND, named local payment gateways, LemonSqueezy | phổ biến nhất, tiết kiệm N%, cập nhật trọn đời, chuyển khoản ngân hàng | "Refunds within 7 days of purchase" (policy wording owned by the refund page); "Paid once, no expiry date" |
| iOS 1.0 specifics | TablePro | jump hosts on iPhone, Redis key browsing on iPhone, side-by-side iPad layout, editing long values on iPhone, nothing connects until you unlock, feature parity | same | Describe App Store 1.0 only; rows that exist only on the app's main branch are gated in data |

### 12.2 Exemptions and allowlist

**Exempt sources:**
- **Release posts are exempt from every row.** This covers the release-post files listed in sitemap §A.5, front
  matter included, with one exception: the `description` and `ogPunchline` are held to the Privacy row. They
  print outside the post (the `/blog` row in every locale, meta and OG description, JSON-LD, the OG card), where
  a correction on the post never reaches.
  - Architecture §1.17 already exempts them as archives, and sitemap §E.6 keeps their bodies unchanged.
  - The archive note, the correction note and the CTA block that the template puts around a post are catalog
    strings, so the test checks them.
  - The 0.74 correction uses the corrected wording ("Your rows stay on the Mac; Apple serves the map tiles.") and
    does not repeat the original phrase.
- **Legal pages** (Privacy, Terms and Refund policy, in both locales) are exempt from the Hype row only.

**Allowlist.** Each entry gives an exact phrase in each locale, the sources it may appear in, and its evidence.
- The test removes an allowlisted occurrence before matching, and only in the listed sources.
- A new entry needs public evidence (the vendor's own page, or the TablePro app repository) and a reviewer.
- No entry widens to "any phrase in the compare files".

| # | Phrase EN | Phrase VI | Allowed in | Evidence |
|---|---|---|---|---|
| A1 | cross-platform | đa nền tảng | Compare content and comparison cells | DBeaver, Beekeeper Studio, HeidiSQL and the other compared tools, from their own sites (sitemap §A.4) |
| A2 | macOS 14 | macOS 14 | Compare content and comparison cells | The stated requirements of Postico 2, pgAdmin and Navicat, from their own sites |
| A3 | Mac App Store | Mac App Store | Compare content and comparison cells | Sequel Ace and Postico are distributed there (their App Store listings) |
| A4 | Setapp | Setapp | Compare content and comparison cells for TablePlus | TablePlus is listed on Setapp (setapp.com) |
| A5 | TablePlus's Setapp edition | bản Setapp của TablePlus | Any source that names the connection importers | The connection importer in the app at v0.77.0 reads TablePlus's Setapp edition. TablePro itself is not on Setapp |
| A6 | A numeral before a counted noun (Typed counts row) | same | A comparison cell that carries a `sources` entry | Sitemap §E.3: "a competitor's count only with a source", for example Sequel Ace's MCP tool count (sitemap §A.4) |
| A7 | A download size (`\d+(\.\d+)? ?MB`) | same | A comparison cell with a `checkedAt` date and a source | Sitemap §A.4 (`/compare/dbeaver`: "download sizes from release assets (dated)") |
| A8 | Share anonymous usage data | Chia sẻ dữ liệu sử dụng ẩn danh | `legal/{en,vi}/privacy.md` | The Mac setting's exact label in the app at v0.77.0 |

**Matching:**
- The test matches whole words and whole phrases, case-insensitively, after NFC normalisation.
- Single ordinary words are not on the list. "anywhere" and "ở bất cứ đâu" were dropped because whole-word matching
  hits ordinary prose. A reviewer treats an "anywhere" claim about TablePro as a Universal.
- **Reviewers check these by hand, not the test:**
  - safety-overreach paraphrases, against the allowed form;
  - TablePro's Windows and Linux availability;
  - "fast" as a claim;
  - "for Mac" as the identity outside the identity keys;
  - counts that `Content/NoTypedCountsTest` cannot see.

---

## 13. Durability: what changes when a platform ships

**Two layers:**
- **Identity keys contain no platform names, versions or digits.** These are `hero.title`, `hero.subtitle`,
  `product.description.short`, `nav.*`, `footer.groups.*` and pillar headings P1–P5. A Pest test asserts that they
  do not match `\b(Mac|macOS|iPhone|iPad|iOS|iPadOS|Windows|Linux)\b|\d`.
  - The test has no exemptions. The "iPhone & iPad" link in the navigation and footer renders from data (§10.1), and
    the mobile menu's "Download for Mac" and App Store badge use the availability-layer CTA keys (§4).
  - `footer.bottom.*` is not an identity key, because it names the AGPLv3 (§10.2).
- **Availability keys render from `platforms.json`** (`status: released` only, architecture §1.8). These are:
  - the captions, `availability.summary` and the title's `{deviceList}`;
  - the P6 heading and the platform cards;
  - the `{paidPlatformApps}` clause;
  - the platform link in the navigation and footer;
  - the Mac and App Store actions;
  - the JSON-LD app nodes.

| When a platform ships, these change (data only) | These do not change |
|---|---|
| Its `platforms.json` entry flips to `released` with requirement, architectures, destinations and `deviceNames` | H1, subtitle, short description, nav and footer group labels, P1–P5 headings |
| The title's `{deviceList}` re-renders. Above 60 characters it falls back to the "developers" title | Free/paid/open-source paragraph, unless that platform has paid features; then `{paidPlatformApps}` and the iPhone clause re-render from data |
| A caption, a platform card, a `/download` card, a "TablePro for {Platform}" page and, if it has a page, its platform link in the navigation and footer | AI section wording; its platform scope comes from the feature's platform tag |
| A JSON-LD app node `/#{platform}-app` | Glossary and banned list |

**Guard tests** (Pest, `tests/Feature`):
1. The identity-key regex above.
2. The banned list and allowlist in §12, applied by architecture's `Content/BannedClaimsTest`.
3. Title and meta lengths, after interpolation, in both locales.
4. Availability never renders a platform whose `status` is not `released`.
5. Every `featured` engine exists in `engines.json` with `state: published` on the current Mac floor.
6. The navigation and the footer render exactly one platform link per `released` platform that has its own page.
   Each label equals that platform's `deviceNames`, joined with the locale's short joiner.

---

## 14. Objections and notes

**No objections.** None of spec §0's fixed decisions conflicts with spec §5 or with this positioning.

**Notes for implementation:**

1. **Vietnamese terminology extends spec §0's rule.** Its keep-English list ends with "…".
   - **Kept in English** (Vietnamese developers say these in English): file, index, view, transaction, data grid,
     SQL editor, autocomplete, SSH tunnel, jump host, license, API key, model, client.
   - **Translated** (the Vietnamese words are unambiguous, everyday, and used by TablePro's App Store listing): row
     (dòng), column (cột), primary and foreign key (khóa chính, khóa ngoại), sync (đồng bộ).
   - Apple's Vietnamese names are used for iOS system features.
   - This applies the rule. It does not reopen it.
2. **JSON-LD ids stay `#app` and `#ios-app`.** All three proposals proposed new ids. Changing an `@id` gains nothing,
   and the docs site already references `#organization`.
3. **The VI badge text has not been verified.** The accessible name must equal the visible badge text. Check it
   against Apple's official Vietnamese artwork when the badge is installed.
4. **Homebrew lag.** Nothing in this document prints a version, so the 0.76.1/0.77.0 split cannot make identity or
   hero copy wrong. 0.77-only items (SAP HANA, table folders, remembered import mappings, CJK encodings, per-connection
   timeouts) carry `sinceAppVersion` in data, and the "0.77" label disappears when `floorVersion` moves past it
   (architecture §1.8).
5. **Status names follow architecture §1.8** (`released`, `prototype`, `none`); `deviceNames` and the platform's own
   page come from the same schema.
