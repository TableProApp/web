# Blog: release-post figures

Every slot in this family is a figure in an English-only release post (sitemap §A.5, §E.6). The posts are an archive:
each one describes TablePro as it was released, so a figure is the post's **original capture**, re-exported to the
delivered formats, not a new screenshot of today's app. The original files stay in `public/images/blog/` and are listed
as each entry's legacy source.

Two kinds of exception:

- The three 0.70 figures (`blog-tablepro-0-70-1` to `-3`) were never captured. Their files are text placeholder cards,
  so those three need new captures on the current release.
- Some originals need care before you re-export them: one shows a license pane whose account values stay covered
  (`blog-tablepro-0-68-5`), several show a home-folder path or a Username field that must not carry a real user name,
  and two are narrower than the export width. Several alt texts and
  descriptions proposed from the posts did not match the pictures; the manifest now carries the corrected text.

Ảnh trong các bài phát hành là ảnh gốc của chính bài viết: bạn chỉ cần export lại ảnh gốc sang AVIF và WebP, không chụp
lại trên bản mới. Ba ảnh của bài 0.70 là ngoại lệ, cần chụp mới. Mỗi mục bên dưới ghi rõ ảnh nào cần kiểm tra trước.

## blog-tablepro-0-67-1

### Purpose
Shows the results pane drawing a query result as a chart, which TablePro 0.67 introduced.

### Scene
- Platform and release: Mac, TablePro 0.67, as the post published it. Reuse the original capture
  `/images/blog/results-chart-mode.png` (3028 × 1722, dark appearance). Do not reshoot it on a later release.
- Screen: the connection window on the Chinook `Album` table, with the results pane on Chart: Bar selected, X Axis Row
  Number, Y Axis ArtistId, and a hover tooltip on row 140.
- Engine and dataset: SQLite, the bundled Chinook sample.
- Visible values: the Data, Structure, JSON and Chart switcher and the status bar's "1-347 of 347 rows" stay legible.

### Framing
The original full window, uncropped and unretouched. Focal area: the chart and the switcher along the bottom. No added
text or arrows.

### Light and dark
One image serves both themes (`theme: single`). The original is a dark-appearance capture; keep it as published.

### Locale
English only. The post has no Vietnamese page, so the manifest's Vietnamese description, alt and caption stay empty by
design. The English alt and caption describe this capture.

### Open evidence
The toolbar shows the sample file's path under the home folder. Keep the user name out of that path in any export.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `results-chart-mode.png` của bài 0.67 (chế độ Chart trên table `Album` của Chinook, giao diện tối) và
chỉ export lại sang AVIF và WebP. Không chụp lại trên bản mới, vì bài viết mô tả TablePro 0.67 lúc phát hành. Thanh công
cụ có đường dẫn tới thư mục người dùng; khi export, đừng để lộ tên người dùng trong đường dẫn đó.

## blog-tablepro-0-67-2

### Purpose
Shows code folding in the SQL editor: folded regions become chips, and a hover shows the hidden text.

### Scene
- Platform and release: Mac, TablePro 0.67. Reuse the original capture `/images/blog/sql-editor-code-folding.png`
  (1990 × 1372, dark appearance, an editor crop).
- Screen: a reporting script over the Chinook `Invoice`, `InvoiceLine` and `Genre` tables, with three folded regions
  shown as chips naming their opening line and hidden line count, and a peek popover over the folded `CREATE TABLE`.
- Engine and dataset: SQLite, the bundled Chinook sample.

### Framing
The original editor crop, as published. Focal area: the chip on line 7 and its popover.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only, as for every release-post figure: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `sql-editor-code-folding.png` của bài 0.67: SQL editor với ba vùng đã gập thành chip và popover xem
nhanh câu `CREATE TABLE`, query trên dữ liệu Chinook. Chỉ cần export lại sang AVIF và WebP, không chụp lại.

## blog-tablepro-0-67-3

### Purpose
Shows the gutter control that runs a single statement of a longer script.

### Scene
- Platform and release: Mac, TablePro 0.67. Reuse the original capture `/images/blog/sql-editor-statement-run.png`
  (1780 × 1074, dark appearance, an editor crop).
- Screen: the editor gutter with the run control beside the `WITH` statement on line 17, next to the fold chevrons of
  that statement and the one below it.
- Engine and dataset: SQLite, the same Chinook reporting script as `blog-tablepro-0-67-2`.

### Framing
The original crop. Focal area: the run control on line 17.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `sql-editor-statement-run.png` của bài 0.67: nút chạy riêng một câu lệnh ở lề trái SQL editor, cạnh
câu `WITH` ở dòng 17. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-67-4

### Purpose
Shows Cmd+F searching the loaded rows of the data grid, which 0.67 introduced in place of toggling the filter panel.

### Scene
- Platform and release: Mac, TablePro 0.67. Reuse the original capture `/images/blog/data-grid-find-bar.png`
  (3028 × 1722, dark appearance).
- Screen: the Chinook `Customer` table with the find bar searching "rua", the counter at "2 of 3", and the cell
  "Rua da Assunção 53" highlighted in the Address column.
- Engine and dataset: SQLite, the bundled Chinook sample.

### Framing
The original full window. Focal area: the find bar and the highlighted cell.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
The toolbar shows the sample file's path under the home folder. Keep the user name out of that path in any export.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `data-grid-find-bar.png` của bài 0.67: thanh tìm kiếm của data grid trên table `Customer` của Chinook,
tìm "rua" và tô sáng ô "Rua da Assunção 53". Thanh công cụ có đường dẫn tới thư mục người dùng; khi export, đừng để lộ
tên người dùng trong đường dẫn đó.

## blog-tablepro-0-67-5

### Purpose
Shows the filter panel offering nested MongoDB field paths with their detected types.

### Scene
- Platform and release: Mac, TablePro 0.67. Reuse the original capture `/images/blog/mongodb-nested-filter.png`
  (3024 × 1722, dark appearance).
- Screen: a MongoDB connection, database `shop`, collection `orders` with five fictional orders; a Raw Filter row with
  the field path browser open, listing `customer.age`, `customer.city`, `customer.country`, `customer.name`,
  `items.name`, `items.price`, `items.qty` and `items.sku` with their types.
- Engine and dataset: a local MongoDB holding a fictional `orders` collection (customer and items sub-documents). It is
  not the PostgreSQL `shop` schema.

### Framing
The original full window. Focal area: the field path browser.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `mongodb-nested-filter.png` của bài 0.67: bảng filter trên collection `orders` của MongoDB, đang mở danh
sách field lồng nhau kèm kiểu dữ liệu. Dữ liệu là đơn hàng mẫu. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-67-6

### Purpose
Shows two filter conditions on fields inside one MongoDB array, and the documents that match.

### Scene
- Platform and release: Mac, TablePro 0.67. Reuse the original capture `/images/blog/mongodb-array-element-scope.png`
  (3024 × 1722, dark appearance).
- Screen: the same `orders` collection with two filter rows, `items.price` greater than 500 and `items.name` equals
  Laptop, combined with Match all, and the two matching orders (ORD-001, ORD-002) in the grid.
- Engine and dataset: the same local MongoDB `orders` sample as `blog-tablepro-0-67-5`.

### Framing
The original full window. Focal area: the two filter rows.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `mongodb-array-element-scope.png` của bài 0.67: hai điều kiện filter trên field trong cùng một mảng
`items`, và hai đơn hàng khớp điều kiện. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-68-1

### Purpose
Shows Compare & Sync comparing the structure of two databases and listing the changes it would make.

### Scene
- Platform and release: Mac, TablePro 0.68. Reuse the original capture `/images/blog/compare-sync-structure.png`
  (3024 × 1722, light appearance).
- Screen: Compare & Sync from Shop Demo `shop_source.public` to Shop Demo (Copy) `shop_target.public`. On the left,
  tables grouped under Only in Source (`refunds`), Only in Target and Differs (`customers`, `orders`). On the right, the
  Definitions tab with `orders` compared side by side: a changed `total_cents` type and an added index, and the list of
  changes below.
- Engine and dataset: PostgreSQL, two copies of a fictional shop schema.

### Framing
The original full window. Focal area: the side-by-side definitions and the change list.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
Applied. The request, kept for the record:
- `description.en`: "Compare & Sync on two PostgreSQL databases: tables grouped by difference, and one table's
  definitions compared side by side."
- `alt.en`: "TablePro Compare & Sync window comparing Shop Demo with Shop Demo (Copy), with tables grouped under Only in
  Source, Only in Target and Differs on the left, and the orders table's definitions side by side on the right, a
  changed total_cents type and an added index highlighted above the list of changes"

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `compare-sync-structure.png` của bài 0.68: cửa sổ Compare & Sync so sánh hai database PostgreSQL, các
table được nhóm theo kiểu khác biệt và định nghĩa của `orders` đặt cạnh nhau. Mô tả và alt cũ không khớp ảnh nên đã
được sửa trong manifest.

## blog-tablepro-0-68-2

### Purpose
Shows Compare & Sync in row mode: the rows that differ, matched on a key column, with each value's old and new state.

### Scene
- Platform and release: Mac, TablePro 0.68. Reuse the original capture `/images/blog/compare-sync-data-diff.png`
  (3024 × 1722, light appearance).
- Screen: the Rows tab with `id` as the key column and All compared columns; a list of rows to update (a timestamp
  precision difference on rows 1 to 6, plus an email, a name and a country on row 6) and two rows to insert.
- Engine and dataset: PostgreSQL, the same fictional shop copies as `blog-tablepro-0-68-1`.

### Framing
The original full window. Focal area: the update list.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
Applied. The request, kept for the record:
- `description.en`: "Compare & Sync in row mode: id as the key column, each row to update with its old and new values,
  and the rows to insert."
- `alt.en`: "TablePro Compare & Sync window in Rows mode with id as the key column, a list of rows to update showing each
  changed value as old and new, such as an email and a country on row 6, and two rows to insert below"

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `compare-sync-data-diff.png` của bài 0.68: Compare & Sync ở chế độ so sánh dòng, khóa là cột `id`, mỗi
dòng cần cập nhật hiện giá trị cũ và mới. Mô tả và alt đã được sửa cho khớp ảnh.

## blog-tablepro-0-68-3

### Purpose
Shows the sidebar listing procedures, functions and triggers, and a function's source opened read-only.

### Scene
- Platform and release: Mac, TablePro 0.68. Reuse the original capture
  `/images/blog/sidebar-routines-source-viewer.png` (3024 × 1722, light appearance).
- Screen: the Demo Routines connection (`demo_routines`, schema `public`). The sidebar lists Procedures, Functions with
  three `balance_of` overloads told apart by their arguments, and Triggers. The source viewer shows
  `balance_of(p_account_id integer, p_as_of timestamp with time zone)` marked Read Only.
- Engine and dataset: PostgreSQL, a fictional ledger schema made for the demo.

### Framing
The original full window. Focal area: the overloads in the sidebar and the source viewer.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
Applied. The request, kept for the record:
- `alt.en`: "TablePro sidebar on a PostgreSQL database with Procedures, Functions and Triggers sections, three
  balance_of functions told apart by their arguments, and the read-only source viewer showing one of them with its
  volatility, security and owner above the syntax-highlighted body"

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `sidebar-routines-source-viewer.png` của bài 0.68: sidebar liệt kê procedure, function và trigger trên
PostgreSQL, ba overload của `balance_of`, và trình xem mã nguồn chỉ đọc. Alt đã được sửa từ "hai" thành "ba" overload.

## blog-tablepro-0-68-4

### Purpose
Shows the data grid painting every cell of a table with several hundred columns, scrolled far to the right.

### Scene
- Platform and release: Mac, TablePro 0.68. Reuse the original capture `/images/blog/data-grid-wide-result.png`
  (3024 × 1722, light appearance).
- Screen: the `wide_readings` table scrolled to columns 292 to 300, every cell filled, and the status bar reading
  "1-500 of 500 rows".
- Engine and dataset: PostgreSQL, a generated wide table in the Demo Routines database.

### Framing
The original full window. Focal area: the column headers in the middle of the run.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `data-grid-wide-result.png` của bài 0.68: data grid cuộn sang cột thứ gần 300 của một table rất rộng,
ô nào cũng có dữ liệu. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-68-5

### Purpose
Shows the rebuilt License pane: the license, the Macs it is activated on, and the team.

### Scene
- Platform and release: Mac, TablePro 0.68. The original capture `/images/blog/settings-license-devices.png`
  (1440 × 1176, light appearance).
- Screen: Settings on the License pane for a Team lifetime license: the license holder, a shortened key with Copy Key,
  Devices ("2 of 5 devices") and Team ("2 of 5 members").
- Engine and dataset: none. Sample account values only.

### Framing
The original pane, uncropped. Focal area: Devices and Team.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
The account values stay covered in any export: the license holder's email address, the shortened license key and the
Mac names, as the alt text and caption say. For a new capture, use a test license with sample values (for example
`owner@acme.internal` and a key reading `XXXXX…`).

### Manifest changes
Applied. The request, kept for the record:
- `description.en`: "Settings, License pane: the license holder, a shortened key, the activated Macs and the team
  member list."
- `alt.en`: "TablePro Settings window on the License pane for a Team lifetime license, with the license holder, a
  shortened license key and a Copy Key button, two activated Macs with their macOS versions under Devices, and the
  team's members, 2 of 5"

### Tóm tắt cho chủ sở hữu
Ảnh gốc `settings-license-devices.png` của bài 0.68 là khung Cài đặt > Giấy phép (Settings > License). Khi export, email
của người giữ license, license key và tên máy Mac phải luôn được che. Nếu chụp lại, hãy dùng một license thử nghiệm với
giá trị mẫu. Mô tả và alt đã được sửa cho khớp nội dung ảnh.

## blog-tablepro-0-69-1

### Purpose
Shows Restore Previous Values putting back rows that a committed save deleted.

### Scene
- Platform and release: Mac, TablePro 0.69. Reuse the original capture `/images/blog/rewind-review-sheet.png`
  (2864 × 1830, dark appearance).
- Screen: the Chinook `Customer` table behind the Restore Previous Values sheet for a save that deleted four rows,
  CustomerId 12 to 15, each "Put the row back" and "Will restore", with Show SQL ticked and the generated `INSERT`
  statements below, "4 rows will be restored", Cancel and Restore.
- Engine and dataset: SQLite, the bundled Chinook sample.

### Framing
The original full window with the sheet. Focal area: the sheet.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
The sheet's subtitle and the toolbar show a path under the home folder; keep the user name out of both in any export.

### Manifest changes
Applied. The request, kept for the record:
- `description.en`: "The Restore Previous Values sheet for four deleted Customer rows, each marked Will restore, with
  the INSERT statements shown."
- `alt.en`: "TablePro Restore Previous Values sheet over the Chinook Customer table, listing four deleted rows,
  CustomerId 12 to 15, each with the action Put the row back and the outcome Will restore, Show SQL ticked with the
  generated INSERT statements below, and Cancel and Restore buttons"

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `rewind-review-sheet.png` của bài 0.69: sheet Restore Previous Values cho bốn dòng `Customer` đã xóa,
dòng nào cũng sẽ được khôi phục. Khi export, đừng để lộ tên người dùng trong đường dẫn của ảnh. Mô tả và alt đã được sửa
cho khớp ảnh.

## blog-tablepro-0-69-2

### Purpose
Shows check constraints read and listed on the structure editor's Constraints tab.

### Scene
- Platform and release: Mac, TablePro 0.69. Reuse the original capture `/images/blog/structure-constraints-tab.png`
  (2864 × 1830, dark appearance).
- Screen: a `TrackPricing` table added to the Chinook sample, Structure on Constraints (5), five check constraints with
  their expressions, such as `ListPrice > 0` and `Currency IN ('USD', 'EUR', 'GBP', 'CAD')`.
- Engine and dataset: SQLite, the Chinook sample plus one demo table.

### Framing
The original full window. Focal area: the constraint list.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
The toolbar shows a path under the home folder; keep the user name out of it in any export.

### Manifest changes
Applied. The request, kept for the record:
- `description.en`: "The structure editor's Constraints tab on a SQLite table, listing five check constraints with
  their expressions."
- `alt.en`: "TablePro structure editor on a TrackPricing table added to the Chinook sample, with the Constraints tab
  selected and five check constraints listed by name beside their expressions, such as ListPrice > 0 and Currency IN
  ('USD', 'EUR', 'GBP', 'CAD')"

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `structure-constraints-tab.png` của bài 0.69: tab Constraints của structure editor liệt kê năm check
constraint trên table `TrackPricing`. Mô tả và alt đã được sửa vì ảnh không có tab Columns.

## blog-tablepro-0-69-3

### Purpose
Shows a SQLite connection that opens a database file on an SSH server as a read-only local copy.

### Scene
- Platform and release: Mac, TablePro 0.69. Reuse the original capture `/images/blog/sqlite-remote-file.png`
  (1640 × 1368, dark appearance, the connection sheet).
- Screen: Edit Connection for SQLite on the Remote File pane: "Open a database file on an SSH server" switched on, the
  note that the file is copied to this Mac and opened read-only, an empty Path field, and the SSH tunnel with host
  `ssh.example.com` and port 22.
- Engine and dataset: SQLite; a fictional SSH host.

### Framing
The original sheet. Focal area: the Remote File settings.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
Applied. The request, kept for the record:
- `description.en`: "A SQLite connection's Remote File pane: open a file on an SSH server as a read-only copy, host set
  and path still empty."
- `alt.en`: "TablePro Edit Connection sheet for SQLite on the Remote File pane, with Open a database file on an SSH
  server switched on above a note that the file is copied to this Mac and opened read-only, an empty Path field, and
  the SSH tunnel settings with host ssh.example.com and port 22"

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `sqlite-remote-file.png` của bài 0.69: khung Remote File của một connection SQLite, mở file trên máy
chủ SSH thành bản sao chỉ đọc. Ô Path trong ảnh còn trống nên mô tả và alt đã được sửa cho đúng.

## blog-tablepro-0-69-4

### Purpose
Shows a table renamed in place in the sidebar, with no dialog.

### Scene
- Platform and release: Mac, TablePro 0.69. Reuse the original capture `/images/blog/sidebar-rename-inline.png`
  (2864 × 1830, dark appearance).
- Screen: the Chinook sample's sidebar list with `InvoiceLine` in an inline text field, and no tab open in the window.
- Engine and dataset: SQLite, the bundled Chinook sample.

### Framing
The original full window. Focal area: the edit field in the sidebar.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
Applied. The request, kept for the record:
- `description.en`: "A table being renamed inline in the sidebar, its name in an edit field."
- `alt.en`: "TablePro sidebar listing the Chinook sample's tables, with InvoiceLine in an inline text field ready to be
  renamed, and no tab open in the window"

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `sidebar-rename-inline.png` của bài 0.69: đổi tên table `InvoiceLine` ngay trong sidebar. Ảnh không có
menu chuột phải nên alt đã được sửa.

## blog-tablepro-0-70-1

### Purpose
Shows the row inspector's JSON tab expanding a foreign key into the row it references, which 0.70 introduced.

### Scene
- Platform and release: Mac, TablePro 0.77.0. This figure was never captured: `/images/blog/json-row-inspector-fk.png`
  is a text placeholder card, so this is a new capture. Showing a row as JSON with its foreign keys expanded (up to five
  levels) has shipped since 0.70.0 (the 0.70 release post).
- Screen: a Chinook `Invoice` row selected in the data grid, the inspector open on its JSON tab, `CustomerId` expanded
  in place into the `Customer` row, and that row's `SupportRepId` expanded one level further into the `Employee` row,
  with the filter field above the tree.
- Engine and dataset: SQLite, the bundled Chinook sample.
- Visible values: the customer's and the employee's names are legible.

### Framing
The full connection window, captured as `docs/screenshots.md` describes. Focal area: the inspector and its expanded
tree. No added text or arrows.

### Light and dark
One image serves both themes. Capture it in the light appearance, as the later posts' figures are.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
Confirm on 0.77.0 that the JSON tab expands `SupportRepId` from an expanded `Customer` row before you capture.

### Manifest changes
Applied. The request, kept for the record:
- `alt.en`: "TablePro row inspector on the JSON tab for a selected Chinook Invoice row, its CustomerId field expanded in
  place into the Customer row it references and that row's SupportRepId expanded one level further into an Employee
  row, with a filter field above the tree"

### Tóm tắt cho chủ sở hữu
Bài 0.70 chưa từng có ảnh thật: file hiện tại chỉ là thẻ giữ chỗ dạng chữ, nên bạn cần chụp mới trên TablePro 0.77.
Chọn một dòng `Invoice` của Chinook, mở inspector ở tab JSON, mở rộng `CustomerId` thành dòng `Customer` rồi
`SupportRepId` thành dòng `Employee`. Chụp ở giao diện sáng.

## blog-tablepro-0-70-2

### Purpose
Shows the MongoDB query tab running a multi-statement JavaScript script, with autocomplete after `find()`.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the MongoDB driver installed from Settings > Plugins. This figure
  was never captured: `/images/blog/mongodb-javascript-shell.png` is a text placeholder card, so this is a new capture.
  The built-in JavaScript shell accepts mongosh syntax (the 0.70 release post); it is not mongosh itself.
- Screen: a query tab with a two-statement script, a `var` declaration on the first line and a
  `db.orders.find(…).sort(…).limit(…)` chain below it, the autocomplete popup open after `find()` listing cursor
  methods, and the resulting documents in the grid underneath.
- Engine and dataset: a local MongoDB with the same fictional `orders` collection as `blog-tablepro-0-67-5`.

### Framing
The full connection window. Focal area: the script and the autocomplete popup; the documents stay visible below.

### Light and dark
One image serves both themes. Capture it in the light appearance.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
Confirm on 0.77.0 that autocomplete lists cursor methods right after `find()`.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Ảnh này của bài 0.70 cũng chỉ là thẻ giữ chỗ, cần chụp mới trên TablePro 0.77 với driver MongoDB. Viết script hai câu
lệnh (một câu `var` và một chuỗi `db.orders.find().sort().limit()`), mở autocomplete sau `find()`, và để kết quả hiện
bên dưới. Dùng collection `orders` mẫu như ảnh của bài 0.67.

## blog-tablepro-0-70-3

### Purpose
Shows a column moved to a new position on SQLite, with the table rebuild shown in full before it runs.

### Scene
- Platform and release: Mac, TablePro 0.77.0. This figure was never captured:
  `/images/blog/column-reorder-rebuild-preview.png` is a text placeholder card, so this is a new capture. Column
  reorder has shipped since 0.70.0 and runs as a table rebuild on SQLite (the 0.70 release post).
- Screen: the structure editor on a Chinook table with one column dragged to a new position, and the SQL preview in
  front of it listing the rebuild script: the new table in the new column order, the `INSERT … SELECT` that copies the
  rows, then the old table dropped and the new one renamed.
- Engine and dataset: SQLite, the Chinook sample (use Reset from the welcome window afterwards).

### Framing
The full connection window with the preview sheet. Focal area: the script in the sheet.

### Light and dark
One image serves both themes. Capture it in the light appearance.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
The 0.73 SQLite rebuild figure (`blog-tablepro-0-73-4`) shows the preview titled SQL Preview with Cancel and Apply and
Rebuild buttons, and a `*_tablepro_rebuild` table. Check the sheet, the button labels and the statements on 0.77.0, and
keep the alt below true to the capture.

### Manifest changes
Applied. The request, kept for the record:
- `alt.en`: "TablePro structure editor on a Chinook table with a column dragged to a new position, and the SQL preview
  in front of it listing the SQLite rebuild script: a new table in the new column order, the INSERT SELECT that copies
  the rows, then the old table dropped and the new one renamed"

### Tóm tắt cho chủ sở hữu
Ảnh thứ ba của bài 0.70 cũng chỉ là thẻ giữ chỗ, cần chụp mới trên TablePro 0.77. Kéo một cột của một table Chinook sang
vị trí mới và chụp sheet SQL Preview hiện toàn bộ script rebuild trước khi chạy. Sau khi chụp, bạn có thể Reset bản mẫu
Chinook ở cửa sổ welcome.

## blog-tablepro-0-72-1

### Purpose
Shows Backup Dump starting from a list of the connection's databases.

### Scene
- Platform and release: Mac, TablePro 0.72. Reuse the original capture `/images/blog/backup-dump-sheet.png`
  (964 × 1054, dark appearance, the sheet only).
- Screen: the Backup Database sheet listing `postgres`, `tablepro_demo` (ticked) and `tablepro_staging`, a search field
  above them, and Cancel and Choose Destination….
- Engine and dataset: PostgreSQL, demo database names only.

### Framing
The original sheet. Focal area: the ticked database and Choose Destination.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
The file is 964 px wide, narrower than the figure's 1408 px export width. Export it at its own width and do not upscale.

### Manifest changes
Applied. The request, kept for the record:
- `description.en`: "The Backup Database sheet listing the databases on a connection, with one ticked and Choose
  Destination."

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `backup-dump-sheet.png` của bài 0.72: sheet Backup Database chọn database `tablepro_demo`. Ảnh chỉ
rộng 964 px, nên hãy export ở đúng kích thước đó, đừng phóng to.

## blog-tablepro-0-72-2

### Purpose
Shows the export tree setting a WHERE clause, a row limit and a column list for one table.

### Scene
- Platform and release: Mac, TablePro 0.72. Reuse the original capture `/images/blog/export-object-tree.png`
  (1540 × 1316, dark appearance, a crop on a dark backdrop).
- Screen: the export sheet in CSV with `customers`, `order_items` and `orders` ticked, and a popover on `orders` with
  Where `status = 'active'`, Row limit "All rows" and its six columns ticked.
- Engine and dataset: PostgreSQL, a fictional shop schema.

### Framing
The original crop, as published. Focal area: the popover.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `export-object-tree.png` của bài 0.72: sheet export với popover đặt WHERE, giới hạn số dòng và danh sách
cột cho table `orders`. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-72-3

### Purpose
Shows Transfer To copying tables into another open connection, with a column mapping per table.

### Scene
- Platform and release: Mac, TablePro 0.72. Reuse the original capture `/images/blog/transfer-to-sheet.png`
  (1550 × 1310, dark appearance, a crop).
- Screen: the Transfer Tables sheet with a PostgreSQL destination on localhost, database `tablepro_staging`,
  `customers`, `order_items` and `orders` ticked (`orders` shows "6 mapped"), and the mapping popover for `orders` with
  Match by Name and Done.
- Engine and dataset: PostgreSQL, a fictional shop schema.

### Framing
The original crop. Focal area: the mapping popover and the table list.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `transfer-to-sheet.png` của bài 0.72: sheet Transfer Tables chuyển dữ liệu sang một connection khác,
kèm popover ghép cột cho table `orders`. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-72-4

### Purpose
Shows that TablePro ships an AppleScript dictionary, as Script Editor displays it.

### Scene
- Platform and release: Mac, TablePro 0.72, seen through macOS Script Editor. Reuse the original capture
  `/images/blog/applescript-dictionary.png` (2002 × 1398, light appearance).
- Screen: Script Editor's dictionary window for TablePro with the TablePro Suite selected beside the Standard Suite,
  its commands (connect, disconnect, show, focus, run query, open table) and classes, and below them the suite's
  enumerations: safe mode level, external access level and tab kind.
- Engine and dataset: none.

### Framing
The original full window. Focal area: the TablePro Suite.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
Applied. The request, kept for the record:
- `alt.en`: "Script Editor's dictionary window for TablePro with the TablePro Suite selected beside the Standard Suite,
  its commands such as connect, run query and open table listed, and below them the suite's safe mode level, external
  access level and tab kind enumerations"

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `applescript-dictionary.png` của bài 0.72: từ điển AppleScript của TablePro trong Script Editor, đang
chọn TablePro Suite. Alt đã được sửa cho khớp ảnh.

## blog-tablepro-0-73-1

### Purpose
Shows the Copy To review step: the DDL that will run in the other engine, before anything is written.

### Scene
- Platform and release: Mac, TablePro 0.73. Reuse the original capture `/images/blog/copy-to-cross-engine-review.png`
  (1704 × 1278, dark appearance, the sheet on a dark backdrop).
- Screen: Copy To from `shop (MySQL) / shop` writing to `shop_copy (Postgres) / shop_copy / public`: the table
  `public.customers` with "about 10 rows", a warning that identity and auto-increment values are written as they are,
  and the generated `CREATE TABLE`, `CREATE INDEX` and row copy; Cancel, Back and Copy.
- Engine and dataset: MySQL to PostgreSQL, a fictional shop schema on each.

### Framing
The original sheet. Focal area: the generated DDL and the warning.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
Applied. The request, kept for the record:
- `description.en`: "The Copy To review step: the PostgreSQL DDL generated for a MySQL table, the expected row count and
  an identity-value warning."
- `alt.en`: "TablePro Copy To review step copying the customers table from a MySQL shop database to a PostgreSQL copy,
  with a warning that identity and auto-increment values are written as they are, the expected row count, and the
  generated CREATE TABLE and CREATE INDEX statements beside them, above Cancel, Back and Copy buttons"

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `copy-to-cross-engine-review.png` của bài 0.73: bước xem lại của Copy To, sao chép table `customers` từ
MySQL sang PostgreSQL kèm DDL được tạo sẵn. Mô tả và alt đã được sửa vì ảnh không có danh sách kiểu dữ liệu quy đổi.

## blog-tablepro-0-73-2

### Purpose
Shows the rebuilt connection editor with its four sections.

### Scene
- Platform and release: Mac, TablePro 0.73. Reuse the original capture `/images/blog/connection-editor-sections.png`
  (1850 × 1440, dark appearance, the sheet).
- Screen: Edit PostgreSQL Connection on General: name `shop_copy (Postgres)`, host `localhost`, port 5432, database
  `shop_copy`, password authentication; the sidebar with General, Network, Options and Appearance; Delete, Test
  Connection, Cancel and Save along the bottom.
- Engine and dataset: PostgreSQL, a local demo database.

### Framing
The original sheet. Focal area: the four-item sidebar and the fields.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
Keep the Username field empty, or set to a sample name such as `demo`, in any export.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `connection-editor-sections.png` của bài 0.73: trình sửa connection PostgreSQL với bốn mục General,
Network, Options và Appearance. Khi export, ô Username để trống hoặc dùng tên mẫu.

## blog-tablepro-0-73-3

### Purpose
Shows Tunnel Command reaching a database through `kubectl port-forward`, with the exact command it will run.

### Scene
- Platform and release: Mac, TablePro 0.73. Reuse the original capture `/images/blog/tunnel-command-kubectl.png`
  (1850 × 1440, dark appearance, the sheet).
- Screen: the Network section with Connect via Tunnel Command and the kubectl port-forward method; the Resource,
  Namespace and Context fields showing their placeholder text; the executable path `/opt/homebrew/bin/kubectl`; and
  Will Run with `kubectl port-forward --address=127.0.0.1 {port}:5432`.
- Engine and dataset: PostgreSQL; no cluster is named.

### Framing
The original sheet. Focal area: the method and the Will Run panel.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
Applied. The request, kept for the record:
- `alt.en`: "TablePro Network section with Connect via set to Tunnel Command and the kubectl port-forward method
  selected, empty resource, namespace and context fields showing their placeholder text, an executable path, and a Will
  Run panel with the exact argument list and a {port} placeholder"

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `tunnel-command-kubectl.png` của bài 0.73: Tunnel Command với `kubectl port-forward` và ô Will Run hiện
đúng câu lệnh sẽ chạy. Alt đã được sửa vì các ô Kubernetes trong ảnh còn trống.

## blog-tablepro-0-73-4

### Purpose
Shows the SQLite table rebuild for a new foreign key, previewed in full before it runs.

### Scene
- Platform and release: Mac, TablePro 0.73. Reuse the original capture `/images/blog/sqlite-foreign-key-rebuild.png`
  (1368 × 1140, dark appearance, a crop).
- Screen: a foreign key row in the structure editor and the SQL Preview of 14 statements: `PRAGMA foreign_keys = off`,
  the `CREATE TABLE "orders_tablepro_rebuild"` with the `customer_fk` constraint, and the `INSERT … SELECT` from
  `orders`; Open in Query Editor, Cancel and Apply and Rebuild.
- Engine and dataset: SQLite, a fictional orders and customers schema.

### Framing
The original crop. Focal area: the script.

### Light and dark
One image serves both themes. The original is dark; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
Applied. The request, kept for the record:
- `description.en`: "The SQLite rebuild preview for a new foreign key: the rebuilt table's DDL and the row copy, before
  anything runs."
- `alt.en`: "TablePro SQL Preview of 14 statements for adding a foreign key to a SQLite orders table, starting with
  PRAGMA foreign_keys = off, then the rebuilt table's CREATE TABLE with the customer_fk constraint and the INSERT SELECT
  that copies the rows, above Open in Query Editor, Cancel and Apply and Rebuild buttons"

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `sqlite-foreign-key-rebuild.png` của bài 0.73: SQL Preview của bước rebuild table SQLite khi thêm khóa
ngoại. Mô tả và alt đã được sửa vì câu `PRAGMA foreign_key_check` nằm ngoài phần hiển thị.

## blog-tablepro-0-74-1

### Purpose
Shows the Map segment drawing PostGIS geometry from a query result, which 0.74 introduced.

### Scene
- Platform and release: Mac, TablePro 0.74. Reuse the original capture `/images/blog/results-map-geometry.png`
  (3024 × 1722, light appearance).
- Screen: the `service_area` table on a PostgreSQL connection to `127.0.0.1/gis`, the Map segment drawing delivery
  zones, transit lines and depot pins over Apple Maps in San Francisco, the line "Drawing 25 shapes in SRID 4326. 3 rows
  in other coordinate systems are not drawn." and Fit to Result.
- Engine and dataset: PostgreSQL with PostGIS, a fictional `service_area` table (not the `places` dataset).

### Framing
The original full window. Focal area: the map and the line above it. The Apple Maps attribution and Legal link at the
bottom left must stay in the export.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None. The post carries a dated correction about map tiles; the figure itself is unaffected.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `results-map-geometry.png` của bài 0.74: chế độ Map vẽ dữ liệu PostGIS trên bản đồ Apple Maps. Giữ
nguyên dòng ghi công Apple Maps ở góc dưới bên trái khi export.

## blog-tablepro-0-74-2

### Purpose
Shows highlight rules colouring rows and single cells of the grid.

### Scene
- Platform and release: Mac, TablePro 0.74. Reuse the original capture `/images/blog/highlight-rules-grid.png`
  (3024 × 1722, light appearance).
- Screen: the Chinook `Invoice` table with the Highlight Rules popover holding three rules: BillingCountry equals USA
  (green row), BillingCountry equals Canada (blue row), and CustomerId less than 10 (orange cell); the grid tinted
  accordingly.
- Engine and dataset: SQLite, the bundled Chinook sample.

### Framing
The original full window. Focal area: the popover and the tinted rows.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `highlight-rules-grid.png` của bài 0.74: popover Highlight Rules tô màu dòng theo quốc gia và tô màu từng
ô theo `CustomerId`, trên table `Invoice` của Chinook. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-74-3

### Purpose
Shows the SQL editor marking invisible and look-alike characters in a pasted query.

### Scene
- Platform and release: Mac, TablePro 0.74. Reuse the original capture
  `/images/blog/sql-editor-invisible-characters.png` (2464 × 620, light appearance, a wide strip).
- Screen: a query tab on the PostgreSQL `gis` database with a query commented "Pasted from a chat thread": a BS mark
  before `SELECT`, an outlined no-break space, a ZWSP mark, and underlines under curly quotes and a full-width
  greater-than sign.
- Engine and dataset: PostgreSQL, the same fictional `service_area` table as `blog-tablepro-0-74-1`.

### Framing
The original strip. Focal area: lines 2 to 6.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `sql-editor-invisible-characters.png` của bài 0.74: SQL editor đánh dấu ký tự ẩn và ký tự trông giống
nhau trong một query dán từ chat. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-76-1

### Purpose
Shows Agent mode: one AI session working in the connection window, with a write waiting for approval.

### Scene
- Platform and release: Mac, TablePro 0.76. Reuse the original capture `/images/blog/agent-mode-window.png`
  (3024 × 1722, light appearance).
- Screen: the Chinook connection window in Agent mode with one session "Waiting on you"; the conversation, where a
  price check by genre already ran and an `UPDATE Track SET UnitPrice = 1.29` for Rock tracks waits on a card with Run,
  Always Allow and Reject; and the Result column with the `SELECT` marked Ran and the `UPDATE` marked Waiting.
- Engine and dataset: SQLite, the bundled Chinook sample; the model shows as `local-model`.

### Framing
The original full window. Focal area: the waiting card and the Result column.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `agent-mode-window.png` của bài 0.76: Agent mode trên Chinook, câu `UPDATE` đang chờ bạn bấm Run,
Always Allow hoặc Reject. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-76-2

### Purpose
Shows outside MCP servers added in Settings, each allowed per connection.

### Scene
- Platform and release: Mac, TablePro 0.76. Reuse the original capture
  `/images/blog/mcp-outside-servers-settings.png` (1600 × 960, light appearance).
- Screen: Settings > Integrations with Enable MCP Server off, and Outside MCP Servers listing Runbooks
  (`https://runbooks.internal.example/mcp`, 2 connections) and Incident Tracker
  (`https://incidents.internal.example/mcp`, no connections), with Add Server….
- Engine and dataset: none; fictional `*.internal.example` hosts.

### Framing
The original pane. Focal area: the Outside MCP Servers list.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `mcp-outside-servers-settings.png` của bài 0.76: khung Cài đặt > Tích hợp (Settings > Integrations) với
danh sách MCP server bên ngoài, dùng tên máy chủ mẫu. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-76-3

### Purpose
Shows the Data Files window opening a CSV file as a table and searching it, with no database involved.

### Scene
- Platform and release: Mac, TablePro 0.76. Reuse the original capture `/images/blog/data-files-window.png`
  (3024 × 1826, light appearance).
- Screen: a Data Files window on `orders.csv` (order_id, customer, city, status, total, ordered_at) searched for
  "Hanoi", with the status bar reading "2,498 of 20,000 rows", "6 columns" and "Comma, UTF-8, LF".
- Engine and dataset: none; a generated CSV of fictional orders.

### Framing
The original full window. Focal area: the search field and the status bar.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `data-files-window.png` của bài 0.76: cửa sổ Data Files mở `orders.csv`, tìm "Hanoi", thanh trạng thái
ghi rõ số dòng, dấu phân cách và encoding. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-76-4

### Purpose
Shows inserting a MongoDB document written in Extended JSON.

### Scene
- Platform and release: Mac, TablePro 0.76. Reuse the original capture `/images/blog/mongodb-insert-document.png`
  (3024 × 1722, light appearance).
- Screen: an empty `events` collection in the `shop` database on a local MongoDB, with the Insert Document sheet
  holding a document with `name`, `channel`, `sentAt` as `{"$date": …}`, `recipients` and `tags`, the hint about
  quoting field names, and Cancel and Insert.
- Engine and dataset: a local MongoDB with fictional marketing events.

### Framing
The original full window with the sheet. Focal area: the sheet.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `mongodb-insert-document.png` của bài 0.76: sheet Insert Document trên collection `events` trống, tài
liệu viết bằng Extended JSON. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-77-1

### Purpose
Shows tables filed into folders in the sidebar, which 0.77 introduced.

### Scene
- Platform and release: Mac, TablePro 0.77. Reuse the original capture `/images/blog/sidebar-table-folders.png`
  (3024 × 1722, light appearance).
- Screen: the Chinook sample with a Folders section holding Music (Album, Artist) and Sales (Invoice, InvoiceLine), the
  Tables section listing the seven tables not yet filed, and the `Track` table open.
- Engine and dataset: SQLite, the bundled Chinook sample.

### Framing
The original full window. Focal area: the Folders section.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `sidebar-table-folders.png` của bài 0.77: sidebar có thư mục Music và Sales chứa các table của
Chinook. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-77-2

### Purpose
Shows an import restoring the column mapping saved for its table.

### Scene
- Platform and release: Mac, TablePro 0.77. Reuse the original capture `/images/blog/import-match-columns.png`
  (3024 × 1722, light appearance).
- Screen: the import sheet for `customers.csv` into the existing Chinook `Customer` table, the note "Restored the
  mapping saved for Customer", the Match Columns menu (Match by Name, Match by Position, a dimmed Use Saved Mapping),
  and fields such as E-mail mapped to Email, with sample values.
- Engine and dataset: SQLite, the Chinook sample and a fictional CSV.

### Framing
The original full window with the sheet. Focal area: the note and the Match Columns menu.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `import-match-columns.png` của bài 0.77: sheet import `customers.csv` vào table `Customer`, khôi phục
cách ghép cột đã lưu lần trước. Chỉ export lại sang AVIF và WebP.

## blog-tablepro-0-77-3

### Purpose
Shows the per-connection connect and query timeouts, with the inherited values shown in empty fields.

### Scene
- Platform and release: Mac, TablePro 0.77. The original capture `/images/blog/connection-timeouts.png` (900 × 720,
  light appearance, the sheet).
- Screen: New PostgreSQL Connection on Options, with Timeouts showing Connect timeout "Default (30) seconds" and Query
  timeout "Global (60) seconds", above Startup Commands and Pre-Connect Script.
- Engine and dataset: PostgreSQL; no server is named.

### Framing
The sheet, uncropped. Focal area: the Timeouts section.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
The file is 900 px wide, which looks soft at the 704 px slot on a 2× display. 0.77 is the current release, so you can
capture the same sheet again at 2× on 0.77.0 instead; otherwise export it at its own width and do not upscale.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Ảnh gốc `connection-timeouts.png` của bài 0.77 chỉ rộng 900 px nên sẽ hơi mờ trên màn hình Retina. Vì 0.77 là bản hiện
tại, bạn có thể chụp lại đúng sheet này ở độ phân giải 2×; nếu không thì export nguyên kích thước, đừng phóng to.

## blog-tablepro-for-iphone-1

### Purpose
Shows TablePro for iPhone browsing a table, as the launch post announced it.

### Scene
- Platform and release: iPhone, TablePro for iPhone and iPad 1.0 (App Store build 22), as the post published it. Reuse
  the original capture `/images/blog/tablepro-for-iphone-table.png` (1206 × 2622, light appearance).
- Screen: the Chinook `Track` table as cards showing TrackId, Name, AlbumId and MediaTypeId with "+5 more columns", the
  pager reading "1-100 of 3503", and the Tables, Query, History and Info tabs; the status bar at 09:41.
- Engine and dataset: SQLite, the Chinook sample bundled with the iOS app.

### Framing
The original full-screen capture, uncropped. Focal area: the cards and the pager.

### Light and dark
One image serves both themes. The original is light; keep it as published.

### Locale
English only: the post has no Vietnamese page.

### Open evidence
The file is 1206 × 2622, a newer iPhone than the 1179 × 2556 reference; keep its native size. The four-field cards are
the App Store 1.0 layout.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Dùng lại ảnh gốc `tablepro-for-iphone-table.png` của bài ra mắt bản iPhone: table `Track` của Chinook dạng thẻ, thanh
phân trang "1-100 of 3503". Giữ nguyên kích thước gốc 1206 × 2622 khi export sang AVIF và WebP.
