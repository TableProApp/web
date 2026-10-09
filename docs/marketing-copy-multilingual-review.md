# TablePro — multilingual implementation and final review

Date: 2026-10-09. Status: implemented and verified after English approval; not deployed.

## Outcome

The approved English rewrite now covers all eleven other site languages: Vietnamese, German, French, Spanish, Italian, Brazilian Portuguese, Indonesian, Japanese, Korean, Simplified Chinese and Traditional Chinese. English remains the source contract, not a fallback for untranslated marketing paragraphs.

This report supersedes the pending-translation status and publication follow-ups in the [English final review](marketing-copy-final-review.md). The [original research and rewrite plan](marketing-copy-audit-and-rewrite-plan.md) remains the record of positioning and competitor research.

## Scope

- **638 translated content files:** 58 JSON files per non-English locale. Homepage, pricing, download, iOS, FAQ, security, about, blog index, engine summaries, paid-feature summaries, feature pages, 23 database pages and comparison pages.
- **77 UI catalogs:** seven changed catalog files per non-English locale, covering banner, blog chrome, downloads, errors, footer/newsletter, pricing and SEO. Other UI strings retain their existing translations.
- **11 server-side OG label files:** author shortened to TablePro, matching English.
- **Six existing Vietnamese guides:** revised to follow the approved English guide edits. No new blog translations or localized copies of historical release bodies were invented.
- **Privacy correction in all 12 languages:** three cookie-related paragraphs, plus the update date. Terms and refund-policy bodies were not rewritten as marketing copy.
- **Shared rendering:** every locale uses the same neutral workflow headings, separate Mac availability label, optional paid-feature labels and simplified Safe Mode section.

Historical release posts retain their release-time content and correction notices. Links to English-only documentation/changelogs and newsletter language remain explicitly marked outside English. Existing blog `noindex`, routing, canonicals and hreflang policy are preserved.

## Copy rules applied

The product identity remains “A native database client.” It does not depend on a platform, release, engine count or performance claim. Actual availability and genuinely platform-specific features still name their platforms. Linux/Windows are not presented as released products.

Translations follow the meaning and level of detail of the approved English copy, not its word order. The review checked inserted app names in complete sentences: articles, grammatical gender, particles and capitalization matter after interpolation. Existing glossary terms, app-label glosses, paid-feature names, code, token names, IDs, links and source references are retained.

The landing pages describe concrete tasks: connect, run queries, browse/edit data, inspect schema, import/export and share. They avoid invented superlatives, “unlock” language, daily-use persuasion and repeated inventories of unrelated paid features.

Homepage identities:

| Locale | Headline |
| --- | --- |
| en | A native database client. |
| vi | Database client native. |
| es | Un cliente nativo de bases de datos. |
| de | Ein nativer Datenbankclient. |
| fr | Un client natif de bases de données. |
| it | Un client database nativo. |
| pt-BR | Um cliente de banco de dados nativo. |
| id | Klien database native. |
| ja | ネイティブのデータベースクライアント。 |
| ko | 네이티브 데이터베이스 클라이언트. |
| zh-Hans | 原生数据库客户端。 |
| zh-Hant | 原生資料庫用戶端。 |

## Factual follow-ups from the English review

### Public-site requests and portal cookies

The actual newsletter, checkout and discount-code requests all use `credentials: 'omit'`. They neither send portal cookies nor accept response cookies. Opening portal pages is separate and may set the portal session/CSRF cookies. The privacy copy now makes that distinction in every language, with a 2026-10-09 update date. The implementation and browser behavior agree with the [MDN Request.credentials documentation](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials).

Four JavaScript regression tests cover the three request implementations and the policy boundary. No portal authentication or payment logic was changed.

### TablePlus version

The shared comparison catalog now records **27.0.2, October 8, 2026**, matching the [official TablePlus changelog](https://tableplus.com/blog/2017/02/changelogs.html). This was a narrow version correction; no competitor edition or price was guessed or changed.

### Read-Only on MongoDB, Redis and etcd

The conservative limitation remains correct for the publicly released [TablePro v0.79.0](https://github.com/TableProApp/TablePro/releases/tag/v0.79.0), published October 9. The released [execution gate](https://github.com/TableProApp/TablePro/blob/2a7e3fd2b5090ca365efb48fc68feccbf98e6945/TablePro/Core/Services/Execution/ExecutionGateProvider.swift) treats commands as writes when the installed driver does not support read-only mode; all three drivers declare that capability false at this release.

The newer [Safe Mode documentation](https://docs.tablepro.app/features/safe-mode) and working-tree code describe recognized reads, including a plugin-update condition. Those are not evidence that the released gate already has the newer behavior. The marketing copy therefore does not silently broaden the guarantee. This is source/release verification, not a claim that production database operations were exercised.

## OG images and asset handoff

- The supplied Figma **`/og.png`** remains the single English default, unchanged at 1200 × 630. The old English bespoke duplicate remains retired with a 301 to `/og.png`.
- The eleven localized default cards were regenerated with their short translated headline. They retain their existing light composition; they are not presented as translated Figma exports. A different default per language is intentional, not a duplicate English default.
- **573 generated page/fallback cards** were refreshed across all twelve locales, plus **11 localized bespoke defaults**. Page-specific cards remain page-specific; generated fallback files remain available if a supplied localized default is missing.
- Localized default text was checked for font coverage, line count and safe-area bounds. Regional CJK fonts are embedded during rendering; Vietnamese diacritics use Inter. All localized defaults are opaque 1200 × 630 sRGB PNGs within the asset budget.
- Manifest alt text, generated asset-locale data and the visual-asset handoff were synchronized. The OG renderer no longer pins Puppeteer to one developer’s absolute machine path.

## Verification

The temporary English-review exceptions were removed. Content parity, app-label and proper-name tests now compare every locale directly with the current English contract. Locale-specific SEO indexability remains an explicit permitted difference, not a translation exception.

The review also repaired stale wording snapshots while preserving their factual assertions: purchase/renewal refund windows, one-person Starter licensing, Mac seat counting, platform scoping, English-only notices and app-label order. New homepage coverage checks all twelve locales for unrelated paid-feature inventories in free workflows and Safe Mode.

Verification used production client and SSR assets, with SSR required rather than silently bypassed:

- **PHP: 2,483 passed, one existing placeholder skipped; 727,408 assertions.** Four non-overlapping shards cover content/localization (541), page families (1,051), assets/SEO (287), and infrastructure/security/SSR/shared-file contracts (604).
- **JavaScript: 269 passed, zero failures**, including the four new public-request privacy regressions.
- Type checking, client/SSR production build, PHP formatting and whitespace checks passed. The existing Inertia source-map build warning remains; it does not fail the build.
- The isolated browser interaction suite passed **120/120 checks** across all twelve languages: menu disclosure, Escape/focus restoration, theme selection, client navigation, billing selection, seat counting, consent controls and localized 404 pages.

The public repository’s shared-file contract tests passed. However, the separate read-only `check:shared -- ../license` integration check failed: the existing local account checkout has missing or different shared files. All 29 listed shared files are unchanged from this web repository’s HEAD, so this rewrite did not introduce that divergence. The sibling checkout was not edited. Reconcile the separate integration state before a coordinated public/account release; this report does not claim it has passed.

## Screenshot evidence

- [Full screenshot gallery](../storage/app/reviews/multilingual-final-20261009/index.html)
- [Route/layout inventory](../storage/app/reviews/multilingual-final-20261009/inventory.json)
- [Interaction checks](../storage/app/reviews/multilingual-final-20261009/interaction-checks.json)
- [Coverage summary](../storage/app/reviews/multilingual-final-20261009/coverage-summary.json)
- [Image-paint audit](../storage/app/reviews/multilingual-final-20261009/paint-audit.json)
- [Downloadable screenshot bundle](../storage/app/reviews/tablepro-multilingual-final-review-20261009.zip)

Capture covers every registered localized page, not just translated landing pages: **730 URLs**, each at desktop 1440 × 1000 and mobile 390 × 844. English has 75 URLs, Vietnamese 65, and each of the ten other locales 59. Differences reflect existing blog language availability. The gallery contains **1,460 full-page captures**, **96 top-of-page captures** and **84 dark-mode/menu/consent/error captures**: **1,640 PNGs** total.

The final route inventory has no missing captures, non-200 registered pages, page-level horizontal overflow, JavaScript errors or unloaded visible images. Every registered page has one H1 and its document metadata; all referenced OG files exist. Gallery language/profile/search filters, links and mobile width were also checked.

Representative homepage, pricing, iOS, download, FAQ, feature, database and comparison pages were visually reviewed in every locale at both widths, along with dark mode and menus. All **84 desktop feature-detail captures** were additionally reviewed for painted media, clipping and table wrapping. This is not a claim that every sentence in every PNG received independent human proofreading.

An additional pixel audit checked **1,592 full/top/dark PNGs and 2,167 visible large image panels** against live DOM geometry. Its final run reports **zero uniform blank-panel suspects and zero geometry errors**. The heuristic samples inset image regions for pixel variation; it is evidence against the observed blank-image capture defect, not a semantic image-comparison test. Menu/consent overlays and 404 screenshots are excluded from this media audit and covered by the separate interaction/visual checks.

The in-app Browser connection was unavailable, so QA used isolated headless Chrome profiles with production client/SSR assets. Non-local requests were blocked; no newsletter, account, checkout or payment action was submitted. Initial captures exposed lazy-image, offscreen-compositing and browser-process failures. Failed captures were rerun using eager images, an expanded capture viewport and bounded fresh-browser batches. The linked gallery is the corrected artifact set, not the failed initial run.

The Markdown report is the persistent record. Screenshots and their ZIP are ignored local review artifacts, not application assets; retain the bundle if storage is cleaned later.

## Boundaries

Implementation and QA did not perform a deployment, live payment/account mutation, sibling-app synchronization or dependency installation. A review commit, branch push and pull request were subsequently requested by the owner. Product engine/platform/pricing/capability catalogs remain unchanged; the only shared product-fact correction is the sourced TablePlus version above.

Automated parity, linguistic review and visual checks do not constitute professional certification of every translation or legal policy. Screenshots establish the captured rendering states, not every device, browser or external integration. Future app releases still require ordinary fact and availability maintenance; the core identity does not need to be rewritten when another platform ships.
