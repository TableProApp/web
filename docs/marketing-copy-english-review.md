# TablePro — English copy review

Date: 2026-10-09. Status: implemented locally for review. Not deployed. Translations await English approval.

English was subsequently approved. See [the multilingual final review](marketing-copy-multilingual-review.md)
for the completed translation scope, current verification and screenshot evidence.

The original research and rationale are in [the audit and rewrite plan](marketing-copy-audit-and-rewrite-plan.md). This document describes the implementation, not another proposal.

## What changed

The product identity is now **“A native database client.”** It does not depend on Mac, Windows, Linux, a release number or an engine count. Current availability remains explicit beside downloads and in platform/feature tables. No unreleased platform is presented as available.

The English copy now starts with the task or the answer. It uses shorter headings and fewer feature inventories, repeated introductions and closing sales lines. Important limitations remain on the detail pages rather than being repeated in every homepage paragraph.

| Area | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Homepage | 1,064 | 603 | 43% |
| Feature hub and seven detail pages | 9,104 | 6,536 | 28% |
| Database hub and 23 detail pages | 18,365 | 15,518 | 16% |
| Compare hub and 15 comparisons | 15,514 | 12,415 | 20% |
| FAQ | 1,974 | 1,412 | 28% |
| iPhone and iPad | 1,513 | 1,102 | 27% |
| Pricing | 773 | 606 | 22% |

Counts are whitespace-separated words in JSON string values, including metadata, labels and technical identifiers. They measure source-copy reduction, not exact rendered page length. Guides are approximately 10% shorter; their commands and technical examples are unchanged.

## Start your review here

1. `/` — overall voice, density and hierarchy.
2. `/pricing` — plan descriptions, seat units, billing and offline access.
3. `/features/querying`, `/features/data-editing`, `/features/ai-mcp` — whether the shorter text still explains the tools clearly.
4. `/postgresql-client`, `/mongodb-client`, `/redis-gui` — distinct database workflows, not one repeated template.
5. `/compare/tableplus`, `/compare/datagrip`, `/compare/dbeaver` — fair reasons to choose either product.
6. `/faq`, `/download`, `/about`, `/ios`, `/security`, `/blog` — supporting pages and shared copy.
7. The six current guides — practical intros and instructions, not promotional articles.

### Homepage copy

Hero:

> A native database client.
>
> Run queries, browse and edit data in {featuredEngines} and more.
>
> Built with native interfaces, not Electron or a Java runtime.
>
> Free to use and open source. Paid plans add features to the {paidPlatformApps}. See pricing.

Workflow headings and bodies:

| Heading | Copy |
| --- | --- |
| SQL editor | Autocomplete suggests tables and columns from your schema. Save queries you reuse and search your query history. |
| Preview your changes | Row edits wait until you save. Review the SQL first, or undo changes in the tab. |
| Compare databases | Compare schema or data on supported engines and generate a sync script. Review changes that could remove data before including them. |
| Import and export | Import {importFormats} files where supported. Export tables or query results as {exportFormats}. |
| Connect to your servers | Use SSH tunnels, TLS or supported cloud sign-in methods. Organize saved connections with groups and tags. |

The workflow section has a separate current-platform label. Its title is platform-neutral. Sponsors, existing section order and old anchors remain; these did not need to change to improve the copy.

### Shared copy

- Banner: “Paid plans add features and fund TablePro’s development.” / “See plans”. Its existing enable/dismiss behavior is unchanged.
- Newsletter: “Release notes by email” / “Occasional release notes. Unsubscribe in any email.”
- Blog intro: “Database guides and release notes from TablePro.”
- Starter activation: “One person, up to {count} Macs.”
- Team activation: “One activated Mac per seat.”
- Checkout failure: “Couldn't open checkout. Try again.”

UI labels, consent choices, accessibility labels and form errors that were already clear were reviewed and left alone. A rewrite does not require changing every label.

## Scope and deliberate boundaries

All English marketing page families were reviewed. Changes cover 58 English content JSON files, shared English copy, six guides and homepage presentation adjustments. The legal page chrome was already plain and did not need rewriting.

Database headings are platform-neutral; search titles still describe current availability. Specific Mac guides keep their intent and URLs. Apple-specific behaviors such as iCloud, Keychain, Touch ID and installation instructions remain scoped to their actual platforms.

Six guides now use the byline “TablePro”. Their slugs, dates, explicit heading anchors and fenced code examples are unchanged. Historical release post bodies, publication dates and correction notes were retained. The current blog listing, archive note, shared CTAs and social-card framing changed.

Legal terms and refund clauses were reviewed but not rewritten into marketing copy or changed contractually. Security disclosures remain detailed. Pricing amounts, billing integrations, factual catalogs, routes and shared account-app files are unchanged.

All non-English content and catalogs are unchanged. English social images were regenerated with the production domain; no localized images were regenerated.

## Facts retained in the rewrite

- The core app has no trial period. Paid features are optional and currently scoped to the Mac.
- Starter covers one person; a Team seat is one activated Mac, not one teammate.
- One-time licenses have no expiry; the copy makes no promise of updates forever.
- License checks and the offline window remain explicit. The grace period runs from the last successful check.
- Both purchases and subscription renewals have their own refund window.
- AI provider use may cost money. Ask runs no statements; chat Edit/Agent writes can run without approval at Silent. Full-window Agent uses Alert or stricter.
- MCP is off by default, local, authenticated and read-only by default, with per-connection permissions. Clients do not receive saved passwords.
- Safe Mode is not a database privilege system. Destructive-statement safeguards, engine exceptions and the default level remain explicit.
- Data Rewind is not a backup; eligibility and external-change limits remain.
- Mac usage reports are on by default; iPhone/iPad reporting is opt-in. No “no tracking” promise was added.
- Team Library receives the connection settings and saved SQL you publish, never passwords. iCloud password sync needs a separate opt-in.
- Driver downloads, import/export differences, mobile omissions and known iOS issues remain visible.

## Translation staging

English can now be edited independently of the previous translated paragraph structure. Two small test fixtures record the exact changed token/markup/identifier and UI-label/proper-name contracts. They pin the current English contracts while checking pending translations against their previous source contracts.

This is not a blanket exception: unchanged keys stay strict, current English markup is checked, and technical identifiers remain validated. When translating after approval, remove each migrated fixture entry once its corresponding locales are updated. Keep native app labels and the established terminology glossary.

When all staged entries have migrated, retire the two fixture files and their pin-check helpers/positive-count
assertions in `ContentParityTest`, `AppLabelsTest` and `WordingTest`. Restore direct current-English parity for
every locale; an empty fixture must not leave a permanent staging bypass behind.

## Verification

- TypeScript typecheck passed.
- JavaScript tests: 265 passed.
- Client and SSR production builds passed. Vite reports its existing Inertia sourcemap warning.
- All PHP suite groups passed with `REQUIRE_SSR=1`, run in directory/file shards: 2,467 passed and one pre-existing placeholder skipped. A single-process run exceeded its memory limit. The hreflang crawl now renders each unique URL once and reuses its asserted SEO props for reciprocal checks; it still checks every page and alternate. Test asset loading also ignores a running dev server's hot file when checking the production manifest.
- Pint and `git diff --check` passed.
- The asset handoff check passed; generated slot/catalog files are current.
- The account-app shared-file diff found existing missing/different files in `../license`. No shared file was changed in this rewrite; sibling synchronization was not attempted.
- 62 English Open Graph images regenerated using the existing renderer; homepage and a long guide card visually inspected.
- The approved Figma export supplies the single English default social card at `/og.png`. The generator preserves supplied artwork at that canonical URL. It reads “A native database client.” / “Run queries. Browse and edit data.” The duplicate English bespoke file was retired; other locale cards are unchanged.
- The second review completed a fresh-profile Chrome headless fallback after the Browser skill found no connected browser. It captured all 75 English URLs at desktop and mobile widths using the production build, with additional dark-mode and interaction checks. See [the final review](marketing-copy-final-review.md) for evidence, fixes and remaining factual follow-ups.

## Existing factual follow-ups before publication

These were found during review and were not silently folded into a wording change:

1. **Public-site cookies:** the English privacy policy currently says newsletter/checkout/discount calls set account-portal cookies. The three public request implementations use `credentials: 'omit'`, and their comments say this prevents platform session cookies being retained. Confirm production behavior, then correct the English disclosure and its translations together. See `use-email-form.ts`, `use-checkout.ts` and `discount-field.tsx`.
2. **Safe Mode documentation:** the current [Safe Mode docs](https://docs.tablepro.app/features/safe-mode) describe recognized MongoDB/Redis/etcd reads. The reviewed release source’s execution gate forces writes for drivers whose `supportsReadOnlyMode` flag is false; its registry defaults mark these engines false. Verify the installed plugin versions before replacing the existing engine exception. The rewrite does not broaden the safety promise based on an unversioned docs page.
3. **TablePlus release metadata:** the [official changelog](https://tableplus.com/blog/2017/02/changelogs.html) lists 27.0.2 on 2026-10-08, while the shared comparison catalog still records 27.0.0. Update that sourced shared fact in a separate factual refresh; no competitor price or edition data was changed here.

## Approval gate

Review the English voice and page density first. The second visual/code review is now complete; approve or request changes before translation and publication. The factual follow-ups below remain publication gates. No deployment, push or commit was performed.
