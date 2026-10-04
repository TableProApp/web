# Asset brief fragment: template

This is the shape of every `docs/rebuild/assets/{family}.md` file, where `{family}` is the manifest's `family` value
(`home`, `features`, `databases`, `ios`, `blog`, `og`). Files whose name starts with `_` are never read.
`php artisan assets:handoff` merges each fragment with `resources/data/assets.json` into `docs/visual-assets.md`
(architecture §1.9). Never edit that document by hand.

Rules:

- One `## {id}` section per manifest id of the family, in any order. The id is exactly the manifest key.
- Inside it, the eight `###` headings below, spelled exactly as here, each with a non-empty body. No other `###`
  heading. `HandoffDocumentTest` and `assets:handoff` report anything missing.
- Text before the first `## {id}` is the family's introduction, rendered once above its assets. Keep it short.
- Data headings are written in English. The last one is the owner's summary in Vietnamese: NFC, "bạn", technical terms
  in English (positioning §11).
- Do not repeat what the manifest already holds: kind, geometry, export sizes, file names, pages, theme and locale
  flags, alt text and captions. Change those in the manifest (through "Manifest changes"), not here.
- Facts come only from public sources: the TablePro app repository at the stated release, its docs
  (docs.tablepro.app) and the vendors' own pages. Mac scenes use the current release and say when a feature is
  0.77-only. iPhone and iPad scenes use App Store 1.0 (build 22) only: no jump hosts, no Redis key browsing, no table
  list beside the browser on iPad, no long-value editing (positioning §12.1).
- Sample data only. Name the dataset: Chinook (bundled SQLite), `shop` (PostgreSQL/MariaDB demo schema), `places`
  (PostGIS, Natural Earth populated places), or fictional hosts under `*.acme.internal`.

Copy the block below for each id.

```markdown
## mac-query-autocomplete

### Purpose
One sentence: the single capability or idea this image proves.

### Scene
- Platform and release: Mac, TablePro 0.77.0. A 0.77-only feature says so.
- Screen, panel and feature state: …
- Engine and dataset: e.g. PostgreSQL with the `shop` sample. Sample data only; never a real connection or customer
  data.
- Operation and visible values: what was typed, run or selected, and which values must be legible.
- Controls that must be visible: …
- For a diagram or illustration: subject, composition, style and the one idea it explains. It invents no product
  function and draws no app chrome.

### Framing
Full window or detail crop; the context that must stay; the focal area; what must stay clear of the edges and of any
crop (for an entry with a `mobile` crop, the focal area must fit inside it: every window has one, and so does every
P1 or P2 detail or iPad capture); text or arrows (none unless stated).

### Light and dark
Both variants from the same frame (switch the macOS appearance, not only the app theme), or why one image serves both.

### Locale
Default: one English app capture serves both sites, because the copy keeps the English UI terms (spec §0). Note any
exception, and what the capture must show for the proposed alt text and caption in the manifest to be true.

### Open evidence
What must be confirmed before capture (for example, a label to check in the app or a dataset to load first), or
"None".

### Manifest changes
Requests for whoever applies manifest edits (a new id, a changed description, a different kind), or "None". They are
applied to the manifest before the document is generated and are not shown to the owner.

### Tóm tắt cho chủ sở hữu
Hai đến bốn câu tiếng Việt, xưng "bạn": cần chụp gì, trên engine và dataset nào, ở trạng thái nào, và vì sao. Giữ
nguyên tên kỹ thuật bằng tiếng Anh (query, schema, connection, Safe Mode…).
```
