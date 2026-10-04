# Feature pages

Captures for every `/features/*` page (several also appear on the homepage, the MySQL and PostgreSQL pages and
`/ios#mac`). Every Mac scene is the app at **TablePro 0.77.0** on sample data: the `shop` PostgreSQL demo schema (users,
products, orders, order_items, reviews, tags, product_tags, activity_log), the `places` PostGIS table, the bundled
Chinook sample, a fictional `orders.csv`, or fictional hosts under `*.acme.internal`. The iPhone half of
`mac-handoff-ios` uses **TablePro for iPhone and iPad 1.0 (build 22)** from the App Store. Never a real connection, host
name, API key or customer row. Window captures follow `docs/screenshots.md`.

Ảnh cho các trang tính năng (một số ảnh cũng xuất hiện trên trang chủ). Ảnh Mac chụp bản 0.77.0, phần iPhone chụp bản
1.0 trên App Store, tất cả với dữ liệu mẫu, không dùng connection, API key hay dữ liệu thật.

## mac-query-autocomplete

### Purpose
Shows that autocomplete understands the query being written: it offers the columns of a CTE defined earlier in the
same statement.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Screen: a query tab on a PostgreSQL connection named `shop (local)`, sidebar showing the `shop` tables.
- Engine and dataset: PostgreSQL with the `shop` sample.
- Operation: the editor holds
  `WITH recent_orders AS (SELECT * FROM orders WHERE created_at > now() - interval '30 days') SELECT u.email, ro.`
  with the cursor after `ro.`; the autocomplete list is open and shows the CTE's columns (`id`, `user_id`, `status`,
  `total`, `created_at`). The previous statement in the tab has run, so its result grid sits below.
- Controls that must be visible: the gutter's per-statement run buttons and the current-statement band. Vim mode off
  (a NORMAL badge would distract from the list).

### Framing
Full window, 1216 × 684 pt. Focal area: the editor line and the autocomplete list, upper left of centre. The
`-mobile` crop takes the editor and the list only, so keep both inside one 4:5 region with no toolbar clipped through
the list. No arrows or added text.

### Light and dark
Both variants from the same frame: switch the macOS appearance between captures, not only the app theme.

### Locale
One English capture serves both sites; the copy keeps the English UI terms.

### Open evidence
Load the `shop` schema (`demo/schema.postgres.sql`) into a local PostgreSQL before capturing.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp toàn cửa sổ TablePro trên Mac với connection PostgreSQL chứa dữ liệu mẫu `shop`. Trong editor, viết một query
có CTE `recent_orders` rồi gõ `ro.` để danh sách autocomplete hiện các cột của CTE đó. Ảnh này chứng minh autocomplete
hiểu cả CTE trong cùng câu lệnh, nên danh sách gợi ý phải đọc rõ.

## mac-query-autocomplete-mobile

### Purpose
The phone-width version of `mac-query-autocomplete`: the query and its autocomplete list, legible at 343 px wide.

### Scene
- Cut from the 2× capture of `mac-query-autocomplete`, not captured separately.
- Content: the `WITH recent_orders …` query and the open autocomplete list with the CTE's columns.

### Framing
4:5 crop around the cursor line and the list. Leave out the sidebar, the toolbar and the result grid. The list must
not touch the crop edge.

### Light and dark
Cut from each of the two window captures, so the pair matches.

### Locale
Shared, as the window capture.

### Open evidence
None beyond `mac-query-autocomplete`.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Cắt từ ảnh `mac-query-autocomplete` (bản 2×) một khung 4:5 chỉ gồm dòng query có CTE và danh sách autocomplete. Làm
cho cả bản sáng và bản tối. Ảnh này hiển thị thay cho ảnh toàn cửa sổ trên điện thoại.

## mac-query-parameters-history

### Purpose
Shows `:name` parameters with their typed value panel, and the searchable query history, in one view.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: PostgreSQL with the `shop` sample.
- Operation: the editor holds `SELECT * FROM orders WHERE user_id = :customer_id AND created_at >= :since` and has
  just been run. The parameter panel shows `customer_id` as Integer `42` and `since` as Date `2026-09-01`.
- The history drawer (⌘Y) is open below, filtered to Source = Editor, with today's entries and one failed entry
  marked as failed.

### Framing
Detail crop, 4:3: the editor lines, the parameter panel and the top of the history drawer. The parameter names and
values and the drawer's filter control must be readable at 696 px wide.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
Load the `shop` schema into a local PostgreSQL first. The history needs a few earlier runs on the capture Mac,
including one that failed; run them by hand before capturing.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh trên Mac với dữ liệu mẫu `shop` (PostgreSQL): một query dùng tham số `:customer_id` và `:since`, khung
nhập giá trị tham số, và ngăn lịch sử query (⌘Y) đang mở, lọc theo Source = Editor, có một query lỗi. Hãy chạy vài
query trước khi chụp để lịch sử có dữ liệu.

## mac-explain-compare

### Purpose
Shows EXPLAIN Compare judging a plan against a baseline: the query got slower because the plan changed.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: PostgreSQL with the `shop` sample, with enough rows in `orders` for the planner to prefer the
  index.
- Operation: run `EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42` once with `orders_user_id_idx` in place,
  pin it as the baseline, drop the index, run it again, and open Compare against the baseline.
- Visible values: the verdict that the query is slower and the plan changed, and the node change from Index Scan to
  Seq Scan.

### Framing
Detail crop, 4:3: the Compare verdict and the two plans' changed node. Cost bars may show; the verdict line must be
readable at 696 px wide.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
The docs have no image of Compare mode, so check the verdict wording in the app before writing any caption. Load
the `shop` schema into a local PostgreSQL first.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh EXPLAIN Compare trên Mac với dữ liệu mẫu `shop` (PostgreSQL): chạy `EXPLAIN ANALYZE` cho một query trên
`orders` khi còn index `orders_user_id_idx` và ghim làm mốc, xóa index, chạy lại rồi mở Compare. Ảnh cần đọc rõ kết
luận query chậm hơn và plan đổi từ Index Scan sang Seq Scan.

## mac-query-insights

### Purpose
Shows Query Insights (Starter) ranking this Mac's history, with one query shape flagged as Got Slower.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with a Starter or Team license active (otherwise the tab is covered).
- Screen: Database > Query Insights for a PostgreSQL connection on `shop`, period Last 7 Days.
- Visible values: the activity chart of succeeded and failed queries per day, and the Got Slower list with
  `SELECT … FROM orders WHERE user_id = ?` marked slower than the previous period.

### Framing
Full window, 1216 × 684 pt. Focal area: the Got Slower row and its timing change. The `-mobile` crop takes that row and
its numbers, so keep them together, away from the window edge.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
Got Slower needs real history: at least five runs of the shape in both periods, and the recent runs at least 50% and
25 ms slower. Decide whether a seeded history on the capture Mac is acceptable, or run the workload over two weeks.
Load the `shop` schema into a local PostgreSQL first.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp toàn cửa sổ Query Insights (cần license Starter hoặc Team) trên connection PostgreSQL với dữ liệu `shop`, chọn
7 ngày qua, có một dạng query trên `orders` được đánh dấu Got Slower. Lịch sử phải có thật (ít nhất năm lần chạy ở mỗi
giai đoạn), nên bạn cần quyết định có dùng lịch sử được dựng sẵn trên máy chụp hay không.

## mac-query-insights-mobile

### Purpose
The phone-width version of `mac-query-insights`: the Got Slower row and its timing change.

### Scene
- Cut from the 2× capture of `mac-query-insights`.
- Content: the Got Slower list with the `orders` query shape and how much slower it got.

### Framing
4:5 crop around the Got Slower list; the query text and the change must be readable at 343 px wide.

### Light and dark
Cut from each of the two window captures.

### Locale
Shared, as the window capture.

### Open evidence
None beyond `mac-query-insights`.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Cắt từ ảnh `mac-query-insights` một khung 4:5 chỉ gồm danh sách Got Slower và mức chậm đi của query trên `orders`, cho
cả bản sáng và bản tối.

## mac-result-chart

### Purpose
Shows Result Charts (Starter) turning a grouped query into a time-series chart with one series per value.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with a Starter or Team license active.
- Engine and dataset: PostgreSQL with the `shop` sample, with orders spread over at least six months.
- Operation: `SELECT date_trunc('month', created_at) AS month, status, sum(total) FROM orders GROUP BY 1, 2 ORDER BY 1`,
  result switched to Chart, type Line, X = `month` (time axis), Y = `sum`, series split by `status`.

### Framing
Detail crop, 4:3: the chart, its legend and the chart toolbar. The legend's status names must be readable at 696 px.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
The docs have no Result Charts image. The legacy `/images/blog/results-chart-mode.png` shows a different query and is
reference only. Load the `shop` schema into a local PostgreSQL first.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh Result Charts (cần license Starter hoặc Team) với dữ liệu `shop` (PostgreSQL): query doanh thu theo tháng
nhóm theo `status`, hiển thị dạng biểu đồ đường có trục thời gian và mỗi trạng thái một đường. Chú thích (legend) phải
đọc rõ.

## mac-result-map

### Purpose
Shows the free Map view drawing geometry from a result, with the selection shared between the map and the grid.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: PostgreSQL with PostGIS and the `places` table (`geom geometry(Point, 4326)`), loaded from Natural
  Earth populated places.
- Operation: `SELECT name, pop_max, geom FROM places WHERE pop_max > 1000000`, result switched to Map, one point
  selected so its row is highlighted in the grid beside or below the map.

### Framing
Detail crop, 4:3: the map with its points and the highlighted grid row. Keep Apple's map attribution visible; do not
crop it out.

### Light and dark
Both variants from the same frame. The map follows the macOS appearance, so switch the system setting, not only the
app theme.

### Locale
One English capture serves both sites. Map labels follow the capture Mac's language; capture with English.

### Open evidence
The `places` table is not shipped anywhere: load Natural Earth populated places into PostGIS yourself. The legacy
`/images/blog/results-map-geometry.png` is reference only.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh Map view trên Mac với PostGIS và table `places` (dữ liệu Natural Earth populated places): chạy query lấy
các thành phố trên một triệu dân, chuyển kết quả sang Map và chọn một điểm để dòng tương ứng được tô sáng trong data
grid. Giữ nguyên dòng ghi nguồn bản đồ của Apple.

## mac-edit-preview-sql

### Purpose
Shows that edits wait until you save, and that Preview SQL lists the exact statements first.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: PostgreSQL with the `shop` sample.
- Operation: the `products` table open in the grid with four `price` cells edited (shown as pending), then Preview SQL
  (⌘⇧P) open, listing four `UPDATE products SET price = … WHERE id = …` statements with their values filled in.
- Controls that must be visible: the pending-change marks in the grid and the sheet's Copy All button.

### Framing
Full window, 1216 × 684 pt. Focal area: the Preview SQL sheet over the edited grid. The `-mobile` crop takes the sheet
only, so the four statements must fit inside it.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
Load the `shop` schema into a local PostgreSQL first. The legacy `/images/features/data-grid-*.png` files show a
different table and are reference only.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp toàn cửa sổ trên Mac với dữ liệu `shop` (PostgreSQL): table `products` có bốn ô giá đã sửa nhưng chưa lưu, và
hộp thoại Preview SQL (⌘⇧P) đang mở với bốn câu UPDATE tương ứng. Ảnh này chứng minh thay đổi chỉ được gửi khi lưu và
bạn xem được câu lệnh trước.

## mac-edit-preview-sql-mobile

### Purpose
The phone-width version of `mac-edit-preview-sql`: the Preview SQL sheet and its four statements.

### Scene
- Cut from the 2× capture of `mac-edit-preview-sql`.
- Content: the sheet with the four UPDATE statements.

### Framing
Crop around the sheet; the statements must be readable at 343 px wide. The sheet is a fixed 560 × 460 pt and each
statement is about 420 pt wide, so no native 343 pt cut holds a whole statement: the region is scaled down uniformly,
never below 0.6× (the `mobile-crop` floor). The crop uses the 1:1 aspect: a 4:5 region that wide would take
almost the whole window height.

Supplied crop: **scale 0.635×** (Lanczos), 1:1, a 1080 × 1080 px region of the window capture from the sheet's top
border, holding the title, Copy All, the four statements whole and Done. The code renders at about 7.6 px on a 343 px
phone.

### Light and dark
Cut from each of the two window captures.

### Locale
Shared, as the window capture.

### Open evidence
None beyond `mac-edit-preview-sql`.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Đã có ảnh: cắt từ ảnh `mac-edit-preview-sql` một khung vuông 1:1 gồm hộp thoại Preview SQL với bốn câu UPDATE trọn vẹn,
thu nhỏ đều còn 0.635× vì ở kích thước gốc không câu nào lọt vừa 343 pt. Crop được phép thu nhỏ đều nhưng không dưới
0.6×. Bản sáng và bản tối cắt cùng tọa độ.

## mac-grid-highlight-rules

### Purpose
Shows highlight rules colouring rows by value, like conditional formatting.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: PostgreSQL with the `shop` sample.
- Operation: the `orders` table in the grid with two rules, `status = paid` (green) and `status = refunded` (orange),
  and the highlight rules popover open showing both.

### Framing
Detail crop, 4:3: several tinted rows and the open popover. The `status` column must be visible so the colours can be
read against their values.

### Light and dark
Both variants from the same frame (switch the macOS appearance); check that both tints stay distinct in dark.

### Locale
One English capture serves both sites.

### Open evidence
Load the `shop` schema into a local PostgreSQL first. The legacy `/images/blog/highlight-rules-grid.png` is
reference only.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh table `orders` (dữ liệu `shop`, PostgreSQL) với hai highlight rule: dòng `paid` màu xanh lá, dòng
`refunded` màu cam, và popover quy tắc đang mở. Cột `status` phải nằm trong ảnh để người xem thấy màu đi theo giá trị.

## mac-fk-picker

### Purpose
Shows the foreign key value picker listing referenced rows by readable label columns.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: PostgreSQL with the `shop` sample.
- Operation: editing `orders.user_id` in the grid opens the picker, set to label rows with `last_name` and
  `first_name`, with a search typed that narrows the list to a few fictional customers.

### Framing
Detail crop, 4:3: the edited cell and the open picker with its label columns.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
Load the `shop` schema into a local PostgreSQL first; customer names must be fictional.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh bộ chọn giá trị khóa ngoại khi sửa cột `orders.user_id` (dữ liệu `shop`, PostgreSQL), hiển thị khách
hàng theo họ và tên (`last_name`, `first_name`). Tên khách hàng phải là tên giả.

## mac-safe-mode-touchid

### Purpose
Shows Safe Mode on a production connection asking for Touch ID before a write runs.

### Scene
- Platform and release: Mac, TablePro 0.77.0, on a Mac with Touch ID.
- Engine and dataset: PostgreSQL with the `shop` sample, on a connection tagged `production` with Safe Mode set to
  Safe Mode, host under `*.acme.internal`.
- Operation: `DELETE FROM orders WHERE status = 'cancelled' AND created_at < '2026-01-01'` run from the editor; the
  confirmation and the Touch ID prompt are showing.
- Controls that must be visible: the production tag or colour on the connection and the Touch ID prompt.

### Framing
Detail crop, 4:3: the prompt over the editor, with the statement still readable behind or beside it. On phones this
slot shows its crop instead (`mac-safe-mode-touchid-mobile`), so the focal area must also fit in that 343 × 429 pt
region.

### Light and dark
Both variants from the same frame (switch the macOS appearance). The system Touch ID sheet follows the appearance.

### Locale
One English capture serves both sites. The Touch ID sheet's text follows the system language; capture with English.

### Open evidence
On a Mac without Touch ID the prompt asks for the account password instead, which would not match the alt text.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh trên Mac có Touch ID: connection PostgreSQL (dữ liệu `shop`, host giả dạng `*.acme.internal`) gắn tag
`production` và đặt mức Safe Mode, chạy một câu DELETE có WHERE, hộp thoại Touch ID đang hiện. Tag production và câu
lệnh phải nhìn thấy được.

## mac-safe-mode-touchid-mobile

### Purpose
Give phone readers a legible view of the Touch ID prompt that Safe Mode puts in front of a DELETE.

### Scene
- Platform and release: the same 2× Mac capture as `mac-safe-mode-touchid`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the Touch ID prompt and the part of the editor it covers, from that capture.
- Operation and visible values: the prompt's title and its Touch ID icon, and the start of the `DELETE FROM orders …`
  line beside or behind it.
- Controls that must be visible: the prompt's Cancel button.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-safe-mode-touchid`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Centre the prompt; keep the `DELETE`
keyword and the prompt's title clear of the edges. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-safe-mode-touchid` at the same coordinates.

### Locale
Shared by both sites, like `mac-safe-mode-touchid`. The proposed alt text names the Touch ID prompt and the DELETE
statement; the cut must show both.

### Open evidence
None beyond `mac-safe-mode-touchid`'s. Confirm the cut region once `mac-safe-mode-touchid` is captured: the system
sheet is about 260 pt wide, so the start of the statement fits beside it only if the prompt is not centred over it.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-safe-mode-touchid`, lấy trọn hộp
thoại Touch ID và phần đầu câu `DELETE` phía sau nó. Cắt đúng kích thước gốc, không thu nhỏ, để chữ vẫn đọc được trên
điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-data-rewind-review

### Purpose
Shows Data Rewind (Starter) reviewing a restore before it runs, row by row.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with a Starter or Team license active and Data Rewind on.
- Engine and dataset: PostgreSQL with the `shop` sample.
- Operation: save four price edits in `products`, change one of those rows from another session (for example `psql`),
  then choose Restore Previous Values. The review sheet lists three rows as Will restore and one as Changed since the
  save.

### Framing
Detail crop, 4:3: the review sheet with its row outcomes and the Restore button.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
The docs have no image of the review sheet; the legacy `/images/blog/rewind-review-sheet.png` is reference only.
Restore Previous Values has no default shortcut; use the Edit menu.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh bảng xem lại Restore Previous Values (cần license Starter hoặc Team): lưu bốn thay đổi giá trong
`products` (dữ liệu `shop`, PostgreSQL), sửa một trong các dòng đó từ phiên khác, rồi mở Restore Previous Values từ
menu Edit. Bảng phải cho thấy ba dòng Will restore và một dòng Changed since the save.

## mac-structure-ddl-preview

### Purpose
Shows that structure changes wait until you save, and that Preview SQL shows the DDL before anything runs.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: PostgreSQL with the `shop` sample.
- Screen: the `reviews` table open on its Structure tab, Constraints sub-tab, with two staged changes: a new CHECK
  constraint `reviews_rating_check` (`rating BETWEEN 1 AND 5`) and a new index `reviews_product_id_created_at_idx` on
  `(product_id, created_at)`, both marked as pending.
- Operation: Preview SQL (⌘⇧P) is open over the tab, listing `ALTER TABLE … ADD CONSTRAINT … CHECK (rating BETWEEN 1
  AND 5)` and `CREATE INDEX … ON reviews (product_id, created_at)`.
- Controls that must be visible: the pending marks on the two rows and the sheet's statements in full.

### Framing
Full window, 1216 × 684 pt. Focal area: the Preview SQL sheet over the Structure tab. The `-mobile` crop takes the
sheet's statements only, so keep both statements inside one 4:5 region. No arrows or added text.

### Light and dark
Both variants from the same frame: switch the macOS appearance between captures, not only the app theme.

### Locale
One English capture serves both sites; the copy keeps the English UI terms.

### Open evidence
Load the `shop` schema (`demo/schema.postgres.sql`) into a local PostgreSQL first. The legacy
`/images/blog/structure-constraints-tab.png` is reference only.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp toàn cửa sổ TablePro trên Mac với connection PostgreSQL chứa dữ liệu mẫu `shop`. Mở tab Structure của table
`reviews`, thêm một CHECK constraint `rating BETWEEN 1 AND 5` và một index trên `(product_id, created_at)` nhưng chưa
lưu, rồi mở Preview SQL (⌘⇧P). Ảnh này chứng minh bạn đọc được câu lệnh DDL trước khi bất cứ thứ gì chạy.

## mac-structure-ddl-preview-mobile

### Purpose
The phone-width version of `mac-structure-ddl-preview`: the two staged statements, legible at 343 px wide.

### Scene
- Cut from the 2× capture of `mac-structure-ddl-preview`, not captured separately.
- Content: the Preview SQL sheet's `ALTER TABLE … ADD CONSTRAINT` and `CREATE INDEX` statements.

### Framing
Crop around the sheet's statements. Leave out the sidebar and the Structure grid. No statement may be cut at the crop
edge. The statements wrap at about 459 pt in the fixed 560 × 460 pt sheet, wider than 343 pt, so the region is scaled
down uniformly, never below 0.6× (the `mobile-crop` floor). The crop uses the 1:1 aspect: a 4:5 region that wide
would take almost the whole window height.

Supplied crop: **scale 0.635×** (Lanczos), 1:1, a 1080 × 1080 px region of the window capture at the same place as
`mac-edit-preview-sql-mobile`, holding the title, Copy All, both statements whole and Done. Below the sheet only
empty, dimmed grid rows show; a 1:1 cut at 0.6× or more cannot avoid them.

### Light and dark
Cut from each of the two window captures, so the pair matches.

### Locale
Shared, as the window capture.

### Open evidence
None beyond `mac-structure-ddl-preview`.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Đã có ảnh: cắt từ ảnh `mac-structure-ddl-preview` (bản 2×) một khung vuông 1:1 gồm hai câu lệnh trọn vẹn trong
Preview SQL, thu nhỏ đều còn 0.635× vì câu lệnh rộng hơn 343 pt. Crop được phép thu nhỏ đều nhưng không dưới 0.6×. Bản sáng và bản tối cắt cùng tọa độ.

## mac-er-diagram

### Purpose
Shows the ER diagram reading relationships from the schema, including a junction table drawn as many-to-many.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: PostgreSQL with the `shop` sample.
- Operation: Database > View ER Diagram on the `public` schema of `shop`. Every table is drawn with crow's-foot ends;
  `product_tags` is folded into one many-to-many line between `products` and `tags`.
- Controls that must be visible: the toolbar's Export menu open, showing the PNG and SQL exports.
- Arrange the tables so no line crosses a table name; `orders` and `order_items` sit near the centre.

### Framing
Full window, 1216 × 684 pt. Focal area: `products`, `tags` and the many-to-many line between them, with the Export
menu. The `-mobile` crop takes `products`, `tags` and that line, so keep them together in one 4:5 region away from the
menu.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
Load the `shop` schema into a local PostgreSQL first. Check that `product_tags` has exactly the two foreign keys and the composite primary key the junction folding needs; if it does not fold, report it rather than editing
the schema to force it.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp toàn cửa sổ với ER diagram của schema `shop` (PostgreSQL): table trung gian `product_tags` hiển thị thành một
đường quan hệ nhiều-nhiều giữa `products` và `tags`, menu Export đang mở với PNG và SQL. Ảnh này cho thấy sơ đồ đọc
quan hệ từ khóa ngoại thật.

## mac-er-diagram-mobile

### Purpose
The phone-width version of `mac-er-diagram`: `products` and `tags` joined by the many-to-many line.

### Scene
- Cut from the 2× capture of `mac-er-diagram`.
- Content: the `products` and `tags` boxes and the line between them, with its crow's-foot ends.

### Framing
4:5 crop around the two tables and the line. Leave out the toolbar and the Export menu. Both table headers must stay
readable.

### Light and dark
Cut from each of the two window captures.

### Locale
Shared, as the window capture.

### Open evidence
None beyond `mac-er-diagram`.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Cắt từ ảnh `mac-er-diagram` một khung 4:5 gồm hai table `products`, `tags` và đường quan hệ nhiều-nhiều giữa chúng.

## mac-compare-sync-structure

### Purpose
Shows Compare & Sync finding a structure difference and holding back a destructive statement until you allow it.

### Scene
- Platform and release: Mac, TablePro 0.77.0. Compare & Sync is a Starter feature: the capture Mac needs an
  activated Starter or Team license, or the window opens on an alert.
- Engine and dataset: one local PostgreSQL server with two databases, `shop` (source) and `shop_staging` (target).
  Prepare `shop_staging` from `shop`, then change it: `products.name` becomes `varchar(80)` (the source has
  `varchar(200)`), and `orders` gains a column `legacy_ref text` the source does not have.
- Operation: structure mode, Group By difference, Compare pressed. `products` and `orders` are listed as different
  and included; the detail pane shows the `products` definitions side by side.
- The Script pane lists the statement that widens `products.name` to 200 characters and `ALTER TABLE orders DROP
  COLUMN legacy_ref`, the second held back with its hazard badge.
- Controls that must be visible: the strip reading "Comparing only. Nothing has been written."

### Framing
Full window, 1216 × 684 pt. Focal area: the difference list and the held-back DROP COLUMN. The `-mobile` crop takes
the two differences and the held-back statement, so keep them inside one 4:5 region.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites. The homepage reuses this capture.

### Open evidence
Load the `shop` schema into a local PostgreSQL first; `shop_staging` is prepared by hand as above. Confirm the
exact hazard badge wording in 0.77.0 before writing a caption. The legacy `/images/blog/compare-sync-structure.png` is
reference only.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp toàn cửa sổ Compare & Sync trên Mac (cần license Starter hoặc Team đã kích hoạt), so sánh `shop` với
`shop_staging` trên cùng một server PostgreSQL. Chuẩn bị `shop_staging` có `products.name` là `varchar(80)` và thêm cột
`orders.legacy_ref`, để kết quả có một khác biệt độ dài cột và một lệnh DROP COLUMN bị giữ lại. Ảnh này chứng minh
câu lệnh làm mất dữ liệu không chạy cho tới khi bạn cho phép.

## mac-compare-sync-structure-mobile

### Purpose
The phone-width version of `mac-compare-sync-structure`: the two differences and the held-back DROP COLUMN.

### Scene
- Cut from the 2× capture of `mac-compare-sync-structure`.
- Content: the `products.name` length change and the `DROP COLUMN legacy_ref` statement with its hazard badge.

### Framing
4:5 crop around the script statements and the badge. Leave out the source and target pickers. The badge must not
touch the crop edge.

### Light and dark
Cut from each of the two window captures.

### Locale
Shared, as the window capture.

### Open evidence
None beyond `mac-compare-sync-structure`.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Cắt từ ảnh `mac-compare-sync-structure` một khung 4:5 gồm khác biệt độ dài cột và lệnh DROP COLUMN đang bị giữ lại kèm
nhãn cảnh báo.

## mac-copy-to-review

### Purpose
Shows Copy To crossing engines and listing every type it approximates before anything is written.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engines and dataset: the two servers of the demo `docker-compose.yml`, MariaDB (source) and PostgreSQL (target).
  The compose file names the database `tablepro_demo` on both and loads the sample rows into both, so prepare them
  first: on MariaDB, create a database `shop` and load `demo/schema.mysql.sql` and `demo/data.sql` into it (or rename
  the source in the connection); on PostgreSQL, run `CREATE DATABASE shop_pg;` and leave it empty as the target.
- Operation: right-click the `shop` database > Copy To…, pick `shop_pg`, structure and data, every table ticked,
  then Continue. The review step is on screen: the DDL, the rows each table expects, and the approximated types, with
  `TINYINT(1)` → `BOOLEAN` legible.
- Controls that must be visible: the review's list of approximations and the Copy button, not yet pressed.

### Framing
Detail crop, 4:3: the review step only. The type list must be readable at 696 px wide.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
The `shop` demo schema has no `TINYINT(1)` column (`demo/schema.mysql.sql` uses
INT, DECIMAL, VARCHAR, CHAR and TIMESTAMP), so the approximation does not appear on its own. Add a flag column before
capturing, for example `ALTER TABLE products ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1;`. The compose
databases are named `tablepro_demo` and already hold data, so the `shop` source and the empty `shop_pg` target have to
be created as the Scene says. The legacy `/images/blog/copy-to-cross-engine-review.png` is reference only.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Trước khi chụp, tạo cơ sở dữ liệu `shop` trên MariaDB (nạp `demo/schema.mysql.sql` và `demo/data.sql`, rồi thêm cột
`products.is_active TINYINT(1)` vì schema mẫu chưa có), và tạo cơ sở dữ liệu PostgreSQL trống `shop_pg`. Chụp cận cảnh
bước xem lại của Copy To, sao chép `shop` từ MariaDB sang `shop_pg`, với
danh sách kiểu dữ liệu được chuyển gần đúng (ví dụ `TINYINT(1)` thành `BOOLEAN`) và nút Copy chưa bấm. Ảnh này chứng
minh bạn thấy mọi thay đổi kiểu dữ liệu trước khi ghi.

## mac-users-roles-mysql

### Purpose
Shows privileges managed down to a single column, with the GRANT shown before it runs.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: a real MySQL 8 server (not MariaDB, so the image is accurate on `/mysql-client`) with the
  `shop` sample loaded, and a user `app_reader`.
- Operation: Database > Users & Roles, `app_reader` selected, its privilege tree opened down to `shop` > `orders` >
  `total`, with SELECT ticked on that column only. The SQL preview is open, showing the column-level GRANT (in MySQL's
  form, `GRANT SELECT (total) ON shop.orders TO 'app_reader'@…`).
- Controls that must be visible: the column-level tick and the preview's statement.

### Framing
Detail crop, 4:3: the privilege tree and the preview. The column name and the GRANT statement must be readable at
696 px wide.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
The `shop` schema is written for PostgreSQL and MariaDB; load its MariaDB/MySQL file (`demo/schema.mysql.sql`)
into a MySQL 8 server, never capture this on MariaDB. Create `app_reader` with no privileges before the capture.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh Users & Roles trên một server MySQL 8 thật (không dùng MariaDB) chứa dữ liệu mẫu `shop`: user
`app_reader` được tick quyền SELECT chỉ trên cột `orders.total`, và bản xem trước SQL hiển thị câu GRANT tương ứng. Ảnh
này chứng minh bạn phân quyền tới từng cột mà không phải tự viết GRANT.

## mac-server-dashboard-postgresql

### Purpose
Shows live sessions on a PostgreSQL server, with a long-running query you can terminate from its row.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: PostgreSQL with the `shop` sample, under light load from a few scripted clients.
- Operation: Database > Server Dashboard. The Sessions list shows several sessions; one long-running
  `SELECT pg_sleep(600), count(*) FROM orders` started from another client is selected.
- Controls that must be visible: the Terminate button for the selected session, and the metrics above the list.

### Framing
Full window, 1216 × 684 pt. Focal area: the selected session row and the Terminate button. The `-mobile` crop takes
that row and the button, so keep them inside one 4:5 region.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites. `/postgresql-client` reuses this capture.

### Open evidence
Connect with an account that can see other sessions' query text (`pg_read_all_stats` or a superuser on the local
sample server), or the long query shows as hidden.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp toàn cửa sổ Server Dashboard trên PostgreSQL với dữ liệu mẫu `shop`: danh sách session đang chạy, một câu SELECT
chạy lâu (`pg_sleep`) đang được chọn và nút Terminate hiện rõ. Hãy kết nối bằng tài khoản xem được nội dung query của
session khác.

## mac-server-dashboard-postgresql-mobile

### Purpose
The phone-width version of `mac-server-dashboard-postgresql`: the long-running session and Terminate.

### Scene
- Cut from the 2× capture of `mac-server-dashboard-postgresql`.
- Content: the selected `SELECT pg_sleep(600) …` row and the Terminate button.

### Framing
4:5 crop around the selected row and the button. Leave out the metrics. The query text must stay readable.

### Light and dark
Cut from each of the two window captures.

### Locale
Shared, as the window capture.

### Open evidence
None beyond `mac-server-dashboard-postgresql`.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Cắt từ ảnh `mac-server-dashboard-postgresql` một khung 4:5 gồm session chạy lâu đang được chọn và nút Terminate.

## mac-data-files-window

### Purpose
Shows a CSV file opened and searched as a table, with no database involved.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Dataset: a fictional `orders.csv` with 20,000 rows (order id, customer name, city, status, total, created date),
  of which exactly 2,498 have the city Hanoi. No connection is open.
- Operation: the file opened from Finder in the Data Files window, "Hanoi" typed in the toolbar's Search All Columns
  field.
- Controls that must be visible: the search field and the status bar reading "2,498 of 20,000 rows".

### Framing
Full window, 1216 × 684 pt. Focal area: the matching rows and the status bar. The `-mobile` crop takes a few matching
rows and the count, so keep the status bar close enough to fit both in one 4:5 region; reduce the window's row height
rather than adding text.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites. The homepage reuses this capture.

### Open evidence
The docs image `data-files.png` shows this scene; find or regenerate the same `orders.csv` so the counts match the
manifest alt text exactly. The legacy `/images/blog/data-files-window.png` is reference only.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp toàn cửa sổ Data Files với file mẫu `orders.csv` (20.000 dòng), gõ "Hanoi" vào ô Search All Columns để thanh
trạng thái hiện 2.498 trên 20.000 dòng. Không mở connection nào: ảnh này chứng minh bạn làm việc với file mà không cần
cơ sở dữ liệu.

## mac-data-files-window-mobile

### Purpose
The phone-width version of `mac-data-files-window`: rows matching Hanoi and the match count.

### Scene
- Cut from the 2× capture of `mac-data-files-window`.
- Content: a few rows showing Hanoi and the status bar's "2,498 of 20,000 rows".

### Framing
4:5 crop around the matching rows and the status bar. Leave out the toolbar except the search field if it fits.

### Light and dark
Cut from each of the two window captures.

### Locale
Shared, as the window capture.

### Open evidence
None beyond `mac-data-files-window`.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Cắt từ ảnh `mac-data-files-window` một khung 4:5 gồm vài dòng có Hanoi và số đếm trên thanh trạng thái.

## mac-data-files-statistics

### Purpose
Shows column statistics on a file: counts and the most common values, each one a click away from a filter.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Dataset: the same fictional `orders.csv`.
- Operation: right-click the `status` column header > Column Statistics…. The popover lists count, empty and distinct
  values, then the top values (for example paid, shipped, refunded, cancelled) with their counts and shares.

### Framing
Detail crop, 4:3: the popover and the column header it points to. The values and counts must be readable at 696 px
wide.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
The docs image `data-files-statistics.png` shows this popover; reuse its file so the numbers agree with
`mac-data-files-window`.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh popover Column Statistics cho cột `status` của `orders.csv`: số dòng, ô trống, số giá trị khác nhau và
các giá trị xuất hiện nhiều nhất. Dùng cùng file với ảnh `mac-data-files-window`.

## mac-import-mapping

### Purpose
Shows a CSV import mapping file columns onto a table, with the choice of what happens when a row fails.

### Scene
- Platform and release: Mac, TablePro 0.77.0 (the Match by Name and Match by Position menu is 0.77).
- Engine and dataset: PostgreSQL with the `shop` sample; a fictional `orders-import.csv` whose headers mostly match
  `orders` and one that does not (for example `order_total` against `total`).
- Operation: Import Data (⌘⇧I) into `shop.orders`. The mapping lists each file column against a table column, with
  `order_total` mapped to `total` by hand; the on-error option shows Skip and Continue.
- Controls that must be visible: the mapping rows, the Match by Name / Match by Position control and the on-error
  option.

### Framing
Detail crop, 4:3: the import sheet's mapping and options. Column names must be readable at 696 px wide.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
The legacy `/images/blog/import-match-columns.png` is reference only. Confirm in 0.77.0 where the on-error option sits
on the sheet so the crop can hold it with the mapping.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh hộp thoại import một file CSV mẫu vào table `shop.orders` (PostgreSQL): các cột trong file được ghép với
cột của table, một cột được ghép tay, và tùy chọn khi gặp lỗi đang là Skip and Continue.

## mac-export-dialog

### Purpose
Shows several tables exported in one go to a format people open without a database tool.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: PostgreSQL with the `shop` sample.
- Operation: File > Export (⌘⇧E) with `orders`, `order_items` and `products` ticked in the object tree and XLSX
  chosen as the format, its options visible.
- Controls that must be visible: the three ticked tables, the format picker on XLSX, the Export button.

### Framing
Detail crop, 4:3: the object tree and the format options. Table names and the format must be readable at 696 px wide.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
The legacy `/images/blog/export-object-tree.png` is reference only.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh hộp thoại Export (⌘⇧E) với ba table `orders`, `order_items`, `products` của `shop` được chọn và định
dạng XLSX.

## mac-backup-dump

### Purpose
Shows a dump taken with the engine's own tool through the connection's SSH tunnel.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: PostgreSQL with the `shop` sample, reached through an SSH tunnel to a fictional
  `bastion.acme.internal` (a local container with that name in `/etc/hosts`). The connection is named
  `shop via bastion` so the crop says how it is reached.
- Operation: File > Backup Dump… with `shop` ticked whole, the save folder chosen, pg_dump found on the Mac.
- Controls that must be visible: the scope tree, the destination and the button that starts the dump, plus the
  connection name.

### Framing
Detail crop, 4:3: the Backup Dump sheet with the connection name above it. Readable at 696 px wide.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
Install the PostgreSQL client tools on the capture Mac (`brew install libpq`). Check whether the sheet itself names
the tunnel in 0.77.0; if it does not, the connection name carries it, as the manifest alt text claims the tunnel.
The legacy `/images/blog/backup-dump-sheet.png` is reference only.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh hộp thoại Backup Dump cho cơ sở dữ liệu `shop` (PostgreSQL) qua SSH tunnel tới máy giả lập
`bastion.acme.internal`; đặt tên connection là `shop via bastion` để ảnh cho thấy đường kết nối. Cần cài sẵn pg_dump
trên máy Mac dùng để chụp.

## mac-ai-chat

### Purpose
Shows the AI assistant answering a question about the connected schema with a query you can put in the editor.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: PostgreSQL with the `shop` sample.
- Provider: any cloud provider added with a key from a throwaway account; no key, account name or e-mail may be
  visible. Chat mode Ask.
- Operation: the assistant pane (⌥⌘A) beside the `orders` grid, with the question "top 5 customers by revenue last
  month" and the answer: a short explanation and a SQL code block joining `users` and `orders`.
- Controls that must be visible: the code block's Copy and Insert buttons. A plain chat answer has no Apply to Editor
  button; that button belongs to the Review, Explain, Optimize and Fix walkthroughs.

### Framing
Full window, 1216 × 684 pt. Focal area: the chat pane. The `-mobile` crop takes the end of the answer, its code block
and the Insert button, so keep them inside one 4:5 region.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites; the question stays in English. The homepage reuses this capture.

### Open evidence
The legacy `/images/features/ai-assistant-*.png` files are reference only.

### Manifest changes
Applied. The request, kept for the record:
The description and alt text name an Apply to Editor button, which a chat answer does not show in 0.77.0
(`AIChatCodeBlockView.swift` offers Copy and Insert; Apply to Editor exists only in `AIChatWalkthroughBlockView.swift`,
which the query actions produce). Change them to:
- `description.en`: AI chat on shop answering "top 5 customers by revenue last month" with a SQL query and its Insert
  button.
- `description.vi`: AI chat trên dữ liệu mẫu shop trả lời "5 khách hàng có doanh thu cao nhất tháng trước" kèm một
  query SQL và nút Insert.
- `alt.en`: The AI chat pane answering a question about last month's top customers by revenue, with a SQL query and
  its Copy and Insert buttons.
- `alt.vi`: Khung AI chat trả lời câu hỏi về những khách hàng có doanh thu cao nhất tháng trước, kèm một query SQL và
  các nút Copy và Insert.

### Tóm tắt cho chủ sở hữu
Chụp toàn cửa sổ với khung AI chat (⌥⌘A) trên connection PostgreSQL `shop`, hỏi "top 5 customers by revenue last month"
và nhận câu trả lời có một khối SQL với nút Copy và Insert. Không để lộ API key, tên tài khoản hay email của nhà cung
cấp AI.

## mac-ai-chat-mobile

### Purpose
The phone-width version of `mac-ai-chat`: the answer's query and its Insert button.

### Scene
- Cut from the 2× capture of `mac-ai-chat`.
- Content: the last lines of the answer, the SQL code block and its Insert button.

### Framing
4:5 crop around the code block and the button. Leave out the grid. The SQL must stay readable.

### Light and dark
Cut from each of the two window captures.

### Locale
Shared, as the window capture.

### Open evidence
None beyond `mac-ai-chat`.

### Manifest changes
Applied. The Vietnamese description keeps "query đi kèm", because "của nó" is an English possessive (AssetManifestTest). The request, kept for the record:
The description and alt text name Apply to Editor; as for `mac-ai-chat`, change them to:
- `description.en`: Close-up of the chat: the answer, its query and the Insert button.
- `description.vi`: Cận cảnh khung chat: câu trả lời, query của nó và nút Insert.
- `alt.en`: Close-up of an AI chat answer with a SQL query and the Insert button.
- `alt.vi`: Cận cảnh câu trả lời của AI chat với một query SQL và nút Insert.

### Tóm tắt cho chủ sở hữu
Cắt từ ảnh `mac-ai-chat` một khung 4:5 gồm khối SQL trong câu trả lời và nút Insert.

## mac-agent-mode

### Purpose
Shows Agent mode giving one AI session the whole window, with a write waiting for Run.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Engine and dataset: PostgreSQL with the `shop` sample, the connection at its default Safe Mode level (Silent), so
  the Alert floor Agent mode adds is what holds the write.
- Operation: Agent mode (⌥⇧⌘A), chat mode Edit, a session named "Find orders with no items". The session has run two
  SELECT statements (finding `orders` with no `order_items`) and proposes an `UPDATE orders SET status = 'cancelled'
  WHERE id IN (…)`, waiting on its card.
- Controls that must be visible: the Sessions column, the card with Run and Reject, and the line above the transcript
  naming what holds Safe Mode at Alert.

### Framing
Full window, 1216 × 684 pt. Focal area: the waiting card. The `-mobile` crop takes the card with its statement, Run and
Reject, so keep it inside one 4:5 region.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
Any provider that can call tools works (not Cursor); hide the key as for `mac-ai-chat`. Seed `shop` with a few orders
that have no items so the SELECTs return rows. The legacy `/images/blog/agent-mode-window.png` is reference only.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp toàn cửa sổ Agent mode trên connection PostgreSQL `shop` (chat mode Edit), phiên "Find orders with no items" đã
chạy hai câu SELECT và đang chờ bạn bấm Run hoặc Reject cho một câu UPDATE. Ảnh này cho thấy câu lệnh ghi chờ bạn khi
Agent mode bật.

## mac-agent-mode-mobile

### Purpose
The phone-width version of `mac-agent-mode`: the waiting write and its buttons.

### Scene
- Cut from the 2× capture of `mac-agent-mode`.
- Content: the UPDATE card with Run and Reject.

### Framing
4:5 crop around the card. Leave out the Sessions column and the result pane.

### Light and dark
Cut from each of the two window captures.

### Locale
Shared, as the window capture.

### Open evidence
None beyond `mac-agent-mode`.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Cắt từ ảnh `mac-agent-mode` một khung 4:5 chỉ gồm thẻ câu lệnh UPDATE với nút Run và Reject.

## mac-mcp-settings

### Purpose
Shows the local MCP server running and the copyable setup for a client.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Screen: Settings > Integrations with Enable MCP Server on and the Status row reading "Running on port 23508", and
  Connect a Client… open on the Claude Code tab with its numbered steps and snippet.
- No token, path with a real user name or e-mail may be visible; use a capture account with a neutral user name.

### Framing
Detail crop, 4:3: the setup sheet with the Status row above it if both fit; the snippet must be readable at 696 px
wide.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites (the Vietnamese copy names the pane Cài đặt > Tích hợp).

### Open evidence
The legacy `/images/blog/mcp-settings-panel.png` is reference only.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh Cài đặt > Tích hợp (Settings > Integrations) với MCP server đang chạy và hộp Connect a Client… mở ở tab
Claude Code, có đoạn cấu hình để sao chép. Không để lộ token hay tên người dùng thật trong đường dẫn.

## mac-connection-library

### Purpose
Shows a saved-connection library organised the way a team works: groups, coloured tags, a favorite and the bundled
sample.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Screen: the Welcome window, with no sheet open.
- Library content, all fictional:
  - group **Production** (red) holding `orders-db (primary)` (PostgreSQL, `orders-db.acme.internal`, tag
    `production`, starred as a favorite) and `analytics` (ClickHouse, `ch.acme.internal`, tag `production`);
  - group **Staging** holding `orders-db (staging)` (PostgreSQL, `orders-db.staging.acme.internal`, tag `development`)
    and `cache` (Redis, `cache.staging.acme.internal`);
  - the **Chinook** sample connection (from **Open Sample Database**), outside the groups.
- Tags show their colours: `production` red and `development` blue are built in; no custom tag is needed.
- Nothing is connected; no error banner, update badge or license prompt is visible.

### Framing
The Welcome window has a fixed size of 900 × 600 pt (`WelcomeWindowController.swift:31,76-77` at v0.77.0), so it
cannot be resized to the 1216 × 684 pt window geometry, and the asset is a `detail` crop instead. Capture the whole
window with `screencapture -w -o` on a 2× display, then cut a 4:3 region of 800 × 600 pt (1600 × 1200 px) around the
library pane and export it at 1392 × 1044. Keep both groups, the red `production` tag, the starred favorite and the
Chinook row inside the crop, clear of its edges, since the alt text names them; the window's left-hand actions panel
may be cut. No arrows or added text. This P3 image has no phone crop: below 768 px it shrinks to 343 px wide, about
half size, where the pane's text is too small to read, so the page text carries the point on a phone and the alt text
describes the image rather than promising legible names.

### Light and dark
Both variants from the same frame: switch the macOS appearance between captures, not only the app theme.

### Locale
One English capture serves both sites; the copy keeps the English UI terms.

### Open evidence
None. The fixed window size is settled by the `detail` kind above.

### Manifest changes
Applied: the kind is `detail` (option 1 of the request: a 4:3 crop of the library pane), and
`mac-connection-library-mobile` is removed. The description and alt text were already true for the crop.

### Tóm tắt cho chủ sở hữu
Chụp cửa sổ Welcome của TablePro 0.77.0 trên Mac với thư viện connection giả: nhóm Production (màu đỏ) và Staging,
tag `production` và `development`, một connection được đánh dấu yêu thích, cùng cơ sở dữ liệu mẫu Chinook. Cửa sổ này
có kích thước cố định 900 × 600 pt nên ảnh này là ảnh cận cảnh 4:3: chụp nguyên cửa sổ ở màn hình 2×, rồi cắt vùng
800 × 600 pt quanh danh sách connection, làm cả bản sáng và bản tối. Không cần ảnh cắt riêng cho điện thoại.

## mac-import-other-app

### Purpose
Shows that switching from another client keeps the passwords: the importer lists the connections it found, each with
its password.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Screen: **Import from Other App** (from the Welcome window's Import menu), on its preview step with DataGrip chosen
  as the source.
- Source data: three connections saved in DataGrip on the capture Mac, all fictional: `orders-db` (PostgreSQL,
  `orders-db.acme.internal`), `billing` (MySQL, `billing-db.acme.internal`) and `reporting` (PostgreSQL,
  `reports.acme.internal`), each with a password saved in DataGrip.
- Visible: the three rows with their type, host and the indication that a password was found, and the import button.

### Framing
Detail crop, 4:3, around the sheet (520 × 440 pt) with a margin of the Welcome window behind it. The connection
names, hosts and password indications must be readable at 696 px wide.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
Needs DataGrip installed on the capture Mac with the three fictional connections and their passwords saved. Confirm on
the preview step how a recovered password is shown before capturing; the alt text says each connection is listed
"with its password".

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Tạo sẵn ba connection giả trong DataGrip (host dưới `*.acme.internal`, có lưu mật khẩu), rồi mở **Import from Other
App** trong TablePro 0.77.0 và chọn DataGrip. Chụp cận cảnh bước xem trước, nơi ba connection hiện kèm dấu hiệu đã tìm
thấy mật khẩu. Ảnh này cho thấy chuyển từ client khác sang không phải nhập lại mật khẩu.

## mac-open-project-folder

### Purpose
Shows Open Project Folder turning a project's config files into connections, and starting a production one at Alert.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Screen: the Open Project Folder sheet (**File > Import > Open Project Folder…**) after scanning a fictional Laravel
  project, `~/Code/acme-shop`.
- Files in the project: `.env` with `DB_CONNECTION=pgsql`, `DB_HOST=127.0.0.1`, `DB_DATABASE=shop`, a user and a
  password; `.env.production` with `DB_HOST=orders-db.acme.internal`, `DB_DATABASE=shop` and a password.
- Visible: two rows, each with its type, host, database and the file it came from, the **Password found** note on
  both, and the Alert badge on the `.env.production` row.

### Framing
Detail crop, 4:3, around the sheet (520 × 440 pt) with a margin of the window behind it. Both rows, their file names
and the Alert badge must be readable at 696 px wide.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
Checked at v0.77.0: `.env.production` is scanned (`ProjectConfigFileMatcher.swift`, any `.env*` name that is not a
template), and `production` as a whole word in the path sets Alert (`ScannedProductionHeuristic.swift`). Nothing else
to confirm.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Tạo một project Laravel giả có hai file `.env` và `.env.production` (host giả dưới `*.acme.internal`), rồi dùng **Open
Project Folder** trong TablePro 0.77.0. Chụp cận cảnh bảng kết quả với hai dòng, dòng `.env.production` có nhãn
Alert. Ảnh này cho thấy TablePro tự đọc cấu hình của project và cẩn thận hơn với connection production.

## mac-connection-ssh-form

### Purpose
Shows a connection that reaches its database through an SSH bastion and a jump host, set up in the connection form.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Screen: the connection form for `orders-db (primary)` (PostgreSQL, host `orders-db.acme.internal`, database `shop`),
  on its **Network** tab with **SSH** selected.
- SSH settings: host `bastion.acme.internal`, user `deploy`, authentication **SSH Agent** with the 1Password agent
  socket, and one jump host row, `jump.acme.internal` (user `deploy`, SSH Agent).
- No password or key content is visible.

### Framing
Detail crop, 4:3, of the Network tab: the SSH host, user, authentication and the jump host row. The crop must read at
696 px wide; leave out the form's footer buttons if space is short. On phones this slot shows its crop instead
(`mac-connection-ssh-form-mobile`), so the focal area must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
None. Do not capture this scene on iPhone or iPad: the App Store 1.0 app does not support jump hosts.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh form connection trong TablePro 0.77.0, tab Network, kết nối PostgreSQL `orders-db.acme.internal` qua SSH
bastion `bastion.acme.internal` dùng SSH Agent của 1Password, có một jump host `jump.acme.internal`. Không để lộ mật
khẩu hay nội dung key. Ảnh này cũng xuất hiện trên trang chủ.

## mac-connection-ssh-form-mobile

### Purpose
Give phone readers a legible view of the SSH settings: the bastion host, the user, SSH Agent and the jump host.

### Scene
- Platform and release: Mac, TablePro 0.77.1, the same connection and data as `mac-connection-ssh-form`, but its own
  2× capture: the form at its 720 pt minimum width with SSH Agent, because the wider capture behind
  `mac-connection-ssh-form` uses Private Key and no cut of it at 0.6× or more holds a label and its value.
- Screen, panel and feature state: the SSH part of the Network tab, from that capture.
- Operation and visible values: the field labels and the start of each value: `bastion.acme.internal`, `deploy`, SSH
  Agent, and the jump host row with `jump.acme.internal`.
- Controls that must be visible: the SSH Agent choice and the jump host row.

### Framing
A 686 × 858 px cut (4:5). Cut at native pixels when a 343 × 429 pt region holds the brief; in 0.77.1 none does, so
the region is scaled down uniformly, never below 0.6× (the `mobile-crop` floor). Start at the labels' left edge so
each label and its value fit; the jump host row stays clear of the bottom edge. No text overlays and no arrows.

Supplied crop: **scale 0.667×** (Lanczos), a 1029 × 1287 px region of the 720 pt capture, from the Server heading to
the Add Jump Host button. The labels render at about 8.7 px on a 343 px phone.

### Light and dark
Cut both variants from the light and dark captures of the 720 pt form at the same coordinates.

### Locale
Shared by both sites, like `mac-connection-ssh-form`. The proposed alt text names the host, the user, SSH Agent and
one jump host; the cut must show all four.

### Open evidence
The phone crop shows SSH Agent and `mac-connection-ssh-form` shows Private Key; each alt text matches its own image.
To make them match, capture the form once at 720 × 1150 pt with one authentication method and cut both images from
that capture.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Đã có ảnh: một vùng 686 × 858 px (tỉ lệ 4:5), thu nhỏ đều còn 0.667×, cắt từ một ảnh 2× riêng của form ở bề rộng tối
thiểu 720 pt với SSH Agent, gồm host, user, SSH Agent và dòng jump host. Không vùng cắt gốc nào giữ đủ các giá trị này,
nên crop được phép thu nhỏ đều nhưng không dưới 0.6×. Ảnh desktop dùng Private Key, khác ảnh điện thoại;
muốn hai ảnh khớp nhau thì chụp lại form một lần và cắt cả hai từ ảnh đó.

## mac-tunnel-command

### Purpose
Shows Tunnel Command reaching a database inside a Kubernetes cluster with the `kubectl port-forward` preset.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Screen: the connection form for `orders-db (cluster)` (PostgreSQL, database `shop`), **Network** tab, connected via
  **Tunnel Command** with the kubectl preset.
- Command: `kubectl port-forward -n shop svc/orders-db 5432:5432` (fictional namespace and service), with the preview
  showing the local port TablePro connects to.

### Framing
Detail crop, 4:3, of the Tunnel Command section: the preset picker, the command and the preview. Readable at 696 px.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
Capture on 0.77.0: in 0.76.1 the preview showed port 0 (fixed in 0.77.0, CHANGELOG L149). The cluster does not have
to exist; the form only needs the command filled in.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh tab Network trong form connection của TablePro 0.77.0, chọn Tunnel Command với mẫu kubectl, lệnh
`kubectl port-forward -n shop svc/orders-db 5432:5432` (tên giả). Phải chụp trên 0.77.0 vì bản cũ hiển thị port 0 ở
phần xem trước.

## diagram-icloud-sync

### Purpose
Explains what iCloud Sync carries to an iPhone or iPad, and that passwords travel separately and only on request.

### Scene
- A diagram, not a screenshot. Three nodes left to right: **Mac**, **your iCloud account** (a private database only
  you can read), **iPhone and iPad**.
- Mac ↔ iCloud ↔ iPhone and iPad: one solid two-way path labelled "Connections, groups and tags".
- A second, dashed path through **iCloud Keychain**, labelled "Passwords, only with password sync on" (the toggle is
  "Passwords" on the Mac and "Sync Passwords" on iPhone and iPad).
- No note about what else the Mac syncs: the text beside the diagram says it on both pages
  (`/features/sync-and-teams#icloud-sync`, `/ios#mac`), and a sentence of that length cannot stay legible at phone
  width.
- No plan names, prices, counts or app windows. Product names as written: iCloud, iCloud Keychain.

### Framing
16:9, generous margins. An SVG scales as a whole and cannot reflow, so size the text for the phone: at 343 px wide
(about 0.28 of the 1216 px desktop width) every label is at least 12 px, which is about 43 units of text height in a
1216-unit-wide viewBox. A node label may wrap to two lines under its node; the two path labels stay on one line each.
The three nodes stay on one row at every width. No arrows other than the two paths.

### Light and dark
Two SVG variants using the site's colour tokens: paths and labels in foreground colours, the dashed path in the
muted colour. No baked background.

### Locale
Per-locale. Vietnamese labels: "Connection, nhóm và tag"; "Mật khẩu, chỉ khi bật Đồng bộ mật khẩu"; "Tài khoản iCloud
của bạn"; "iPhone và iPad". The Vietnamese labels are longer, so check the 12 px floor on that file too.

### Open evidence
None. Source: `resources/data/facts.json` → `sync` (iPhone and iPad sync connections, groups and tags only).

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Một sơ đồ đơn giản, không phải ảnh chụp: Mac, tài khoản iCloud của bạn và iPhone/iPad, nối với nhau bằng đường đồng bộ
"Connection, nhóm và tag", cùng một đường nét đứt qua iCloud Keychain cho mật khẩu, chỉ khi bật Đồng bộ mật khẩu. Cần
hai bản ngôn ngữ (Anh, Việt) và hai bản sáng, tối, không ghi tên gói hay con số nào. Không thêm ghi chú về những gì
Mac đồng bộ thêm (phần chữ của trang đã nói), và chọn cỡ chữ sao cho khi sơ đồ thu còn 343 px chiều ngang, mọi nhãn vẫn
cao ít nhất 12 px.

## mac-handoff-ios

### Purpose
Shows Handoff: a table open in TablePro on iPhone is offered on the Mac, ready to continue there.

### Scene
- An illustration composed of two real captures placed side by side, with no drawn app chrome:
  - **iPhone**, TablePro for iPhone and iPad 1.0 (build 22) from the App Store: the `Track` table of the Chinook
    dataset open in the table browser, on a MySQL connection named `Chinook (MySQL)` at `media-db.acme.internal`.
  - **Mac**, TablePro 0.77.0: the right end of the Dock showing the TablePro Handoff icon for that table.
- The connection reaches the iPhone through iCloud Sync from the Mac, so both devices hold the same connection.
- iPhone status bar pinned to 09:41 with a full battery and no carrier name (as in `ios.md`).

### Framing
Illustration geometry from the manifest. The iPhone screen and the Dock icon are the two focal points; keep a neutral
space between them and no connecting arrow. On phones this slot shows `mac-handoff-ios-mobile` instead, a tall
recomposition of the same two captures.

### Light and dark
`single`: one composite serves both page themes. Capture both devices in light appearance.

### Locale
One English composite serves both sites.

### Open evidence
Do **not** use the bundled Chinook sample: the iPhone app never offers the sample connection for Handoff
(`AppState.offersHandoff`, `!connection.isSample`, at build 22), and the Mac never syncs it. Load the Chinook MySQL
script into a MySQL server reachable as `media-db.acme.internal`, create the connection on the Mac, and let iCloud Sync
(which needs a Starter or Team license on the Mac) bring it to the iPhone. Both devices must be signed in to the same
Apple Account with Handoff on.

### Manifest changes
None. The description and alt text stay true with the dataset above.

### Tóm tắt cho chủ sở hữu
Ghép hai ảnh chụp thật: iPhone (TablePro 1.0 từ App Store) đang mở table `Track` của dữ liệu Chinook, và Dock của máy
Mac (TablePro 0.77.0) hiện biểu tượng Handoff cho đúng table đó. Không dùng cơ sở dữ liệu mẫu Chinook đi kèm ứng dụng,
vì Handoff bỏ qua connection mẫu; hãy nạp Chinook vào một MySQL server với host giả `media-db.acme.internal` và đồng bộ
connection sang iPhone bằng iCloud Sync.

## mac-handoff-ios-mobile

### Purpose
Give phone readers a legible view of Handoff: the iPhone screen and the Mac Dock icon, both large enough to read.

### Scene
- Platform and release: the same two captures as `mac-handoff-ios` (iPhone 1.0, build 22, and Mac 0.77.0); nothing is
  captured separately.
- Screen, panel and feature state: the same two captures as `mac-handoff-ios`, recomposed for a tall frame: the upper
  part of the iPhone screen with the `Track` title and first rows above, and the right end of the Dock with the
  TablePro Handoff icon below.
- Operation and visible values: the `Track` title on the iPhone and the Handoff badge on the TablePro icon in the
  Dock.
- Controls that must be visible: none.

### Framing
A 686 × 858 px (4:5) composition. Place each part at the pixel size it has in the 2× composite, never smaller; keep
neutral space between them and no arrow. The phone version exists because the 16:9 composite shrinks to 343 × 193 px
on a phone, where the Dock icon is about 2% of the width.

### Light and dark
`single`, like `mac-handoff-ios`: one composition in light appearance serves both page themes.

### Locale
Shared by both sites, like `mac-handoff-ios`. The proposed alt text names the iPhone showing the Track table and the
Handoff icon in the Dock; the composition must show both.

### Open evidence
None beyond `mac-handoff-ios`'s. This is a second composition of the same two captures rather than a cut of the
composite, and it needs no new capture.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn ghép lại hai ảnh chụp đã dùng cho `mac-handoff-ios` thành một khung dọc 686 × 858 px (tỉ lệ 4:5): phần trên màn
hình iPhone với tiêu đề `Track` ở trên, đầu bên phải Dock với biểu tượng Handoff của TablePro ở dưới. Giữ mỗi phần ở
đúng kích thước pixel như trong ảnh ghép 2×, không thu nhỏ, và không thêm mũi tên. Bản này cần vì ảnh 16:9 chỉ còn 343
× 193 px trên điện thoại, khi đó biểu tượng trong Dock gần như không thấy.

## mac-team-library

### Purpose
Shows Team Library in use: saved queries a team shares, each labelled with the teammate who published it.

### Scene
- Platform and release: Mac, TablePro 0.77.0, activated with a Team license.
- Screen: a connection window on `orders-db (primary)` (PostgreSQL, `shop` sample, `orders-db.acme.internal`), sidebar
  on **Favorites**, with the **Team Library** section expanded.
- Team Library content: three saved queries published by two fictional teammates and you, for example "Daily active
  users", "Orders by status this week" and "Refund rate by month", each showing its publisher label.
- The editor beside the sidebar shows one of those queries opened from the library.

### Framing
Detail crop, 4:3: the Favorites sidebar with the Team Library section and the publisher labels, plus the left edge of
the editor. The labels must be readable at 696 px wide.

### Light and dark
Both variants from the same frame (switch the macOS appearance).

### Locale
One English capture serves both sites.

### Open evidence
- Needs a Team license with at least two other seats activated on test Macs whose members published the queries. Use
  fictional member identities; whatever the server returns as the publisher (`publishedBy`) is what the label shows,
  so confirm its format before capturing.
- Load the `shop` schema into a local PostgreSQL.
- Relaunch TablePro after publishing from the other Macs so the library is pulled before capture.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp cận cảnh sidebar Favorites của TablePro 0.77.0 (license Team) với mục Team Library mở ra, có ba query đã lưu do
các thành viên nhóm giả đưa lên, mỗi query ghi tên người đưa lên. Bạn cần một license Team thử nghiệm với vài máy đã
kích hoạt, dữ liệu mẫu `shop` trên PostgreSQL, và mở lại ứng dụng trước khi chụp để thư viện được tải về.
