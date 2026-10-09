# TablePro — final English code and visual review

Date: 2026-10-09. Status: English review candidate, not deployed. Other languages remain unchanged pending approval.

**Subsequent implementation:** English was approved and the multilingual rollout is now documented in
[the multilingual final review](marketing-copy-multilingual-review.md). That report supersedes the pending-translation
status and records the resolution of this review’s factual follow-ups; this document remains the English-pass record.

## Outcome

The second pass reviewed the English content, rendering components, factual boundaries, SEO/social metadata and actual production-build screenshots. It fixed wording and rendering issues found in the first pass. No page-level layout defect remains in the captured desktop/mobile states. Three pre-publication factual follow-ups remain explicitly open below; this is not a claim that every external integration or product behavior has been tested.

Product identity remains **“A native database client.”** Platform names belong in availability, downloads and genuinely platform-specific capabilities, not the global identity. Future Linux/Windows support can be added to those availability surfaces without rewriting the brand headline. The site does not imply that unreleased platforms exist today.

## Evidence to review

- [Screenshot gallery](../storage/app/reviews/english-final-production-20261009/index.html): every English route, with full-page and original-size top images.
- [Route inventory and diagnostics](../storage/app/reviews/english-final-production-20261009/inventory.json).
- [Interaction checks](../storage/app/reviews/english-final-production-20261009/interaction-checks.json).
- [Downloadable screenshot bundle](../storage/app/reviews/tablepro-english-final-review-20261009.zip). Extract and open `index.html` locally.
- [Original research and rewrite plan](marketing-copy-audit-and-rewrite-plan.md).
- [English implementation handoff](marketing-copy-english-review.md).

Screenshots are local, ignored review artifacts, not application assets or committed documentation dependencies. The Markdown report is the persistent record; retain the ZIP if the local artifacts are cleaned later.

## Coverage and method

The production capture enumerated all **75 registered English page URLs**: homepage, feature hub and detail pages, database hub and 23 engine pages, comparison hub and 15 comparisons, pricing, downloads, iOS, FAQ, about, security, legal pages, blog index, guides and historical release posts.

- Desktop: 1440 × 1000 viewport; mobile: 390 × 844 viewport; full document captured in both.
- 150 full-page images + 150 original-size top images.
- 24 additional images covering dark-mode page families, mobile navigation, cookie settings and desktop/mobile 404 pages.
- Fresh browser profile, real client hydration and production client/SSR assets. Fonts and visible images were awaited; pages were scrolled before full capture to load lazy images.
- All 150 registered-page captures returned HTTP 200, had exactly one H1, no page errors, no visible broken images and no whole-document horizontal overflow. Scrollable code/table regions are not counted as page overflow.
- Visual inspection used full-page overviews and original-size top images, alongside source review. Database, feature and comparison families were reviewed in parallel; historical release and legal layouts were included. Very tall images remain available at original resolution for line-by-line review.
- Dark mode covered homepage, pricing, AI/MCP, sync/teams, PostgreSQL, TablePlus comparison, iOS and an RDS guide on desktop, plus homepage/pricing on mobile.
- 18 interaction/state assertions passed: mobile feature disclosure, Escape/focus restoration, theme persistence, client navigation/menu closure, one-time billing selection, Team seat increment, consent reopening/declining, eight dark desktop layouts and two 404 widths.

The in-app Browser skill had no available browser connection. Chrome headless was used as the fallback, with a fresh temporary profile. The existing user browser, dev server and hot file were not modified. Non-local browser requests were blocked: no live checkout, newsletter signup or analytics transmission took place. Cookie checks used a no-op analytics function because analytics is not configured in the local preview. The two console resource errors in the interaction log are the deliberately requested HTTP 404 documents, not failures on registered pages.

## Fixes from this second pass

1. **Comparison lists:** restored the comma separator; an accidental period had turned lists into sentence fragments. Added regression coverage.
2. **Homepage workflows:** removed unrelated paid-feature inventories from free query/connection summaries. The schema workflow still names paid Compare & Sync. Other languages are unchanged.
3. **Paid-feature labels:** use “Optional paid features” on the English feature hub and relevant workflow, so a free capability is not mistaken for a paid requirement.
4. **Import/export:** distinguishes mapped data imports from executing SQL files as statements; retains the first-sheet-only Excel limit.
5. **DuckDB:** explains that connecting to a new path creates a file, without implying an unsupported sidebar create/drop action.
6. **Redis:** distinguishes Mac Standalone/Sentinel/Cluster from iOS Standalone command support.
7. **Snowflake:** scopes unenforced key constraints to standard tables, not hybrid tables. This distinction is supported by [Snowflake’s official constraint documentation](https://docs.snowflake.com/en/sql-reference/constraints).
8. **Oracle SEO:** describes SQL/PLSQL scripts without implying SQL*Plus client-command support.
9. **Comparison choices:** repaired the SSMS/Sequel Ace heading grammar. The Sequel Pro page now introduces TablePro versus Sequel Ace, not reasons to continue with the discontinued Sequel Pro. A narrowly scoped optional lead override supports this case; SSR regression coverage asserts it.
10. **Blog index:** separates release posts from the complete changelog and links readers to the latter.
11. **iOS:** removed the repeated free/no-in-app-purchases statement from the hero; the existing availability strip retains it.
12. **Maintenance:** updated platform-heading comments, documented the comparison override and marked the old English OG HTML workflow as historical. The supplied Figma `/og.png` remains the canonical English default; no duplicate default image was reintroduced.

No shared product capability/price catalog, historical release body, legal contract or other-language copy was rewritten in this pass. The legal pages were reviewed for rendering, not silently redrafted as marketing copy.

## Code and verification

Source review covered English content JSON, English UI catalogs, rewritten guides, homepage workflows, comparison choice rendering, database headings, locale-contract staging and related render/content tests. Optional English-only structural changes remain explicit in fixtures rather than bypassing locale parity globally.

- TypeScript typecheck: passed.
- JavaScript suite: 265 passed.
- Production client and SSR builds: passed; existing Inertia sourcemap warning remains.
- Second-pass PHP shards with SSR required: Content 181 passed; Compare 61 passed; Databases 49 passed; Features 131 passed; Localization 362 passed; selected homepage/blog/iOS tests 176 passed, one pre-existing placeholder skipped. Final comparison-page rerun: 50 passed after adding the custom-lead assertion.
- Pint and `git diff --check`: passed.
- The broader first-pass PHP suite was already verified in shards: 2,467 passed, one pre-existing placeholder skipped. It was not rerun as one process because the earlier monolithic run exceeded its memory limit. The counts above describe separate runs, not additive unique tests.
- No commit, push or deployment. No live form submissions, payment/account mutation or sibling-app synchronization.

## Remaining publication gates

These are recorded findings, not hidden failures or assumptions to translate uncritically:

1. **Privacy/cookies:** English policy says newsletter/checkout/discount calls set account-portal cookies, while the public implementations use `credentials: 'omit'`. Confirm actual production response/cookie behavior and correct the policy and translations together. Legal wording is intentionally untouched here.
2. **Safe Mode:** public documentation describes recognized MongoDB/Redis/etcd reads, but the reviewed release execution gate treats drivers without `supportsReadOnlyMode` as writes. Verify installed plugin versions before removing the existing exception. Copy retains the conservative release-specific limitation.
3. **Competitor version:** shared TablePlus metadata records 27.0.0 while its official changelog lists 27.0.2 on October 8. Refresh the sourced shared fact separately; changing narrative copy did not authorize silently revising competitor edition/price catalogs.

The earlier handoff links the source evidence for these findings. Confirm them before publishing the full multilingual release. Production checkout/newsletter integration testing remains a separate operational check.

## Next phase — after English approval

1. Approve the voice, page density and factual boundaries in this English candidate. Resolve the publication gates above.
2. Use English as the semantic source for all other configured locales; write natural local phrasing rather than mechanically copying English sentence structure. Preserve prices, seat rules, engine/platform limits, placeholders, links and AI/safety/privacy qualifications.
3. Update per-page content, UI catalogs, guide strategy and localized social cards consistently. Do not translate the same headline differently across homepage, metadata and OG artwork. Historical release bodies and legal text need their own explicit scope.
4. Retire each pending locale fixture as that file/key becomes current. Remove the temporary staging mechanism only when every locale is updated; restore unconditional shape/placeholder checks. The handoff includes the retirement checklist.
5. Build and run content, locale, SSR, SEO/hreflang and asset checks. Capture every localized route on desktop/mobile and inspect long labels, line wrapping, typography and locale-specific metadata. Check dark-mode representative families and core interactions again.
6. Deliver a multilingual review candidate before any separately authorized publication.

No translation work has started in this pass.
