# Database pages

Every engine page leads with one image of that engine doing the job its page describes (sitemap §E.1 block 2). An
image is never shared between engines: a SQLite capture must never stand in for MySQL or Redis. Capture each one on
a server or file of that exact engine, with sample data only. The hub, `/databases`, has one image of its own: the
connection type chooser.

Several engines are cloud services with no local copy (Redshift, D1, Turso, BigQuery) or need a local server set up
(Cassandra, DynamoDB Local). Their briefs name the sandbox each needs and what must stay out of the frame: account IDs,
endpoints that embed an account, and tokens.

Mỗi trang engine mở đầu bằng một ảnh riêng của đúng engine đó, không bao giờ dùng chung ảnh giữa các engine. Hãy chụp
trên đúng loại server hoặc file của engine, chỉ dùng dữ liệu mẫu, và không để lộ account ID, endpoint chứa tài khoản hay
token.

## mac-engine-picker

### Purpose
Shows that every engine is picked from one chooser, and that a driver which does not come with the app is marked
until its first download.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Screen, panel and feature state: the database type chooser that opens from New Connection, scrolled so the
  Relational group and the Document group are both in view.
- Engine and dataset: no connection is open; the chooser lists engine types only. Use a clean test user on a Mac where
  the MongoDB driver has never been installed, so its tile reads "Not Installed".
- Operation and visible values: nothing selected, or PostgreSQL highlighted. Legible: the group headings, engine names,
  and the "Not Installed" caption under MongoDB.
- Controls that must be visible: the search field at the top of the chooser and the group headings.
- No connection details, hosts or user names anywhere in the frame.

### Framing
Detail crop of the chooser sheet only, with a few pixels of the window behind it at most. The focal area is the
MongoDB tile and its caption; keep it away from the crop edges. No text or arrows added. On phones this slot shows its
crop instead (`mac-engine-picker-mobile`), so the focal area must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English app capture serves both sites; the Vietnamese page keeps the English engine names and the "Not Installed"
caption reads in English in the capture. The proposed alt text names MongoDB as not installed, so the capture must
show it that way.

### Open evidence
The chooser groups engines under headings such as Relational, and marks MongoDB "Not Installed" until its driver is
downloaded. Confirm before capture that the Document group heading is the one MongoDB sits under at 0.77.0 (the
manifest description says so).

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp hộp chọn loại cơ sở dữ liệu khi tạo connection mới trên Mac (TablePro 0.77.0), thấy cả nhóm Relational và
nhóm Document. Dùng một user macOS sạch chưa từng cài driver MongoDB để ô MongoDB hiện chữ "Not Installed". Không
được có host hay tên đăng nhập nào trong khung hình.

## mac-engine-picker-mobile

### Purpose
Give phone readers a legible view of the Document group, with MongoDB marked Not Installed.

### Scene
- Platform and release: the same 2× Mac capture as `mac-engine-picker`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the Document group of the type chooser, from that capture. In 0.77.1 the chooser
  is a list, not tiles, with "Not Installed" right-aligned on each row.
- Operation and visible values: the Document heading, the engine names in that group, and the "Not Installed" caption
  on MongoDB's row.
- Controls that must be visible: the group heading.

### Framing
A cut from the 2× capture of `mac-engine-picker`, at native pixels when a 343 pt region holds the brief. In 0.77.1
MongoDB's name and its right-aligned "Not Installed" are 489 pt apart, so the region is scaled down uniformly, never
below 0.6× (the `mobile-crop` floor). A 4:5 cut that wide would be taller than the capture, so the crop uses the
1:1 aspect. Put MongoDB's row near the middle; the Document heading stays inside the top edge. No text overlays and no
arrows.

Supplied crop: **scale 0.635×** (Lanczos), 1:1, a 1080 × 1080 px region of the capture that holds the whole sheet,
from Choose a Database to Cancel and Continue. The faint row behind the pinned Relational heading and the half-hidden
Weaviate row at the list's foot come from the capture.

### Light and dark
Cut both variants from the light and dark captures of `mac-engine-picker` at the same coordinates.

### Locale
Shared by both sites, like `mac-engine-picker`. The proposed alt text names the Document group and MongoDB marked Not
Installed; the cut must show both.

### Open evidence
None beyond `mac-engine-picker`'s.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Đã có ảnh: cắt từ ảnh 2× của `mac-engine-picker` một khung vuông 1:1 gồm cả hộp chọn, với nhóm Document và dòng
MongoDB ghi "Not Installed", thu nhỏ đều còn 0.635× vì ở kích thước gốc tên MongoDB và chữ "Not Installed" cách nhau
489 pt. Crop được phép thu nhỏ đều nhưng không dưới 0.6×. Bản Sáng và Tối cắt cùng tọa độ.

## mac-db-postgresql-explain

### Purpose
Shows a PostgreSQL EXPLAIN ANALYZE plan drawn as a diagram, with the step that costs the most marked.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Screen, panel and feature state: a query tab with the plan result open in Diagram mode (the segmented control above
  the result set to Diagram), the EXPLAIN variant dropdown showing EXPLAIN ANALYZE.
- Engine and dataset: PostgreSQL 16 or 17 with the `shop` sample schema (users, orders, order_items, products), loaded
  with a few hundred thousand generated orders so the plan has real work in it. Sample data only.
- Operation and visible values: a query such as
  `SELECT u.email, sum(o.total) FROM orders o JOIN users u ON u.id = o.user_id WHERE o.created_at >= now() - interval '30 days' GROUP BY u.email ORDER BY 2 DESC LIMIT 20;`
  run with EXPLAIN ANALYZE. Legible: the node names (Limit, Sort, HashAggregate, Hash Join, Seq Scan or Index Scan on
  `orders`), the per-step cost badges, and Rows against Actual Rows on the selected node.
- Controls that must be visible: the Diagram, Tree and Raw control and the zoom controls in the corner.

### Framing
Detail crop of the result area: the plan diagram fills the frame, with the bottom lines of the SQL editor above it for
context. Focal area: the most expensive step and its orange or red badge, kept clear of the crop edges. No added
text or arrows. On phones this slot shows its crop instead (`mac-db-postgresql-explain-mobile`), so the focal area
must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame; switch the macOS appearance so the badge colours are captured in each.

### Locale
One English capture serves both sites. The alt text must stay true to what the capture shows: an EXPLAIN ANALYZE
diagram on the orders table with a cost marker on each step.

### Open evidence
Load the `shop` dataset (`demo/schema.postgres.sql`) and generate the order rows locally. The plan's exact node types depend on the indexes you create; any plan with a join and an
aggregate serves.

### Manifest changes
Applied. The request, kept for the record:
Change the description and the alt text: the diagram marks each step with a cost badge (a green circle, yellow
diamond, orange triangle or red warning triangle, `docs/features/explain-visualization.mdx` at v0.77.0), not cost
bars.
- description.en: "EXPLAIN ANALYZE diagram for a query on shop.orders, with a cost badge on each step."
- description.vi: "Sơ đồ EXPLAIN ANALYZE cho một query trên shop.orders, mỗi bước có một ký hiệu chi phí."
- alt.en: "An EXPLAIN ANALYZE plan for a query on the orders table drawn as a diagram, with a cost badge on each step."
- alt.vi: "Execution plan EXPLAIN ANALYZE của một query trên table orders, vẽ thành sơ đồ, mỗi bước có một ký hiệu chi phí."

### Tóm tắt cho chủ sở hữu
Bạn chụp sơ đồ EXPLAIN ANALYZE trên PostgreSQL, dùng schema mẫu `shop` với vài trăm nghìn order tự sinh, cho một query
join `orders` với `users` rồi gom nhóm. Hãy để chế độ Diagram, thấy rõ ký hiệu chi phí trên từng bước và cặp Rows,
Actual Rows của bước đang chọn. Chụp cả bản sáng và bản tối từ cùng một khung hình.

## mac-db-postgresql-explain-mobile

### Purpose
Give phone readers a legible view of the plan's most expensive step and its cost badge.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-postgresql-explain`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the part of the plan diagram around the most expensive step, from that capture.
- Operation and visible values: that step's node name, its orange or red cost badge, and Rows against Actual Rows on
  it.
- Controls that must be visible: none beyond the diagram.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-postgresql-explain`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Centre the most expensive node and keep
its badge and row figures clear of the edges. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-postgresql-explain` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-postgresql-explain`. The proposed alt text names the most expensive step on the
orders table and its cost badge; the cut must show both.

### Open evidence
None beyond `mac-db-postgresql-explain`'s. Confirm the cut region once `mac-db-postgresql-explain` is captured: zoom
the diagram before capturing `mac-db-postgresql-explain` if the node and its badge do not fit in 343 pt.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-postgresql-explain`, lấy bước
tốn kém nhất của sơ đồ cùng ký hiệu chi phí và số Rows, Actual Rows của bước đó. Cắt đúng kích thước gốc, không thu
nhỏ, để chữ vẫn đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-mysql-query

### Purpose
Shows a SQL query and its results on a real MySQL server, the everyday job of the MySQL page.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Screen, panel and feature state: the full connection window: sidebar with the `shop` tables, a query tab with the
  SQL editor above and the result grid below, the toolbar showing a MySQL connection.
- Engine and dataset: a real MySQL 8.4 server, never MariaDB (the page leads with MySQL and MariaDB has its own
  section). Create a database named `shop` and load `demo/schema.mysql.sql`, then `demo/data.sql`, into it: the
  MariaDB/MySQL version of the `shop` schema and its sample rows. Name the connection with a fictional host such as
  `mysql.acme.internal`.
- Operation and visible values: a query joining `orders` to `users`, for example
  `SELECT o.id, u.email, o.status, o.total, o.created_at FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC LIMIT 100;`
  just run, with the row count and the run time in the status bar. Legible: the SQL with highlighting, the column
  headers, and a dozen rows.
- Controls that must be visible: the run button and the result tab, the sidebar's table list.

### Framing
Full window. Context to keep: the sidebar and the editor. Focal area: the editor and the first result rows, which
must fit inside the phone crop below (`mac-db-mysql-query-mobile`). Nothing added.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; the copy keeps English UI terms. Data values are English sample data.

### Open evidence
The `shop` schema comes in both dialects: `demo/schema.postgres.sql` and `demo/schema.mysql.sql` (the MariaDB mirror
of the PostgreSQL file), with one `demo/data.sql` for both. The MySQL file loads into MySQL 8.4 as is. MySQL 8.4 accepts but ignores the inline column
`REFERENCES` clauses in that file (MySQL reads inline foreign keys from 9.0), so the tables have no foreign keys there;
this scene shows none, but add `FOREIGN KEY` clauses before any capture that shows relations. Do not capture the MySQL
page on a MariaDB server because the schema loads there too.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp toàn bộ cửa sổ TablePro kết nối tới một server MySQL 8.4 thật (không dùng MariaDB), đã nạp schema mẫu `shop`
từ `demo/schema.mysql.sql` và dữ liệu từ `demo/data.sql` vào một cơ sở dữ liệu tên `shop`. Trong tab query, chạy câu join `orders` với `users` và để thấy kết quả bên dưới. Phần editor
và vài dòng kết quả đầu phải nằm gọn trong vùng cắt cho điện thoại.

## mac-db-mysql-query-mobile

### Purpose
The phone version of the MySQL lead image: the query and its first rows, readable at phone width.

### Scene
- Platform and release: cut from the same 2× capture as `mac-db-mysql-query`, so the release, engine and data are
  identical.
- Screen, panel and feature state: the lower part of the SQL editor with the whole query, and the first rows of the
  result grid with their column headers.
- Engine and dataset: MySQL 8.4 with the `shop` sample, as in the window capture.
- Operation and visible values: the query text and at least six result rows, with `email`, `status` and `total`
  legible. The emails must already read `…@example.com` (capture rules, "shop emails").
- Controls that must be visible: none beyond the editor and the grid.

### Framing
A 4:5 crop from the window capture, no resampling beyond the cut. The query's first line and the first result row
stay clear of the crop edges.

### Light and dark
Cut both variants from the light and dark window captures at the same coordinates.

### Locale
Shared by both sites, like the window it comes from.

### Open evidence
None beyond the window capture's.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn cắt ảnh này từ chính ảnh chụp cửa sổ MySQL, giữ lại câu query và khoảng sáu dòng kết quả đầu tiên để đọc rõ trên
điện thoại. Cắt bản sáng và bản tối ở cùng một vị trí.

## mac-db-sqlite-chinook

### Purpose
Shows a SQLite file open in TablePro, using the sample database that comes with the app, so a reader can repeat it.

### Scene
- Platform and release: Mac, TablePro 0.77.0.
- Screen, panel and feature state: the full connection window for the Chinook sample, opened with Help > Open Sample
  Database. The Track table is open in the data grid with a filter applied.
- Engine and dataset: the bundled Chinook SQLite sample, no other file.
- Operation and visible values: a filter of `GenreId = 1` on Track, with the filter bar showing it and the status bar
  showing how many rows match. Legible: Name, AlbumId, GenreId, Composer and Milliseconds columns.
- Controls that must be visible: the sidebar listing the Chinook tables (Album, Artist, Track, …) and the filter bar.

### Framing
Full window. Focal area: the filter bar and the first rows, which must fit inside the phone crop
(`mac-db-sqlite-chinook-mobile`). No added text.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; the Chinook data is in English.

### Open evidence
None. Chinook is bundled with the Mac app since 0.38.0 (the app's `CHANGELOG.md`).

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn mở cơ sở dữ liệu mẫu Chinook bằng Trợ giúp > Mở cơ sở dữ liệu mẫu (Help > Open Sample Database), mở table Track và
lọc `GenreId = 1`. Chụp toàn bộ cửa sổ, thấy rõ sidebar, thanh lọc và các dòng đầu, cả bản sáng lẫn bản tối.

## mac-db-sqlite-chinook-mobile

### Purpose
The phone version of the SQLite lead image: the filter and the first matching rows.

### Scene
- Platform and release: cut from the same 2× capture as `mac-db-sqlite-chinook`.
- Screen, panel and feature state: the filter bar with `GenreId = 1` and the first rows of the Track table.
- Engine and dataset: the bundled Chinook sample.
- Operation and visible values: the filter condition and at least six rows with Name and Composer legible.
- Controls that must be visible: the filter bar.

### Framing
A 4:5 crop from the window capture. The filter bar and the first row stay clear of the crop edges.

### Light and dark
Cut both variants at the same coordinates from the light and dark window captures.

### Locale
Shared by both sites.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn cắt ảnh này từ ảnh chụp cửa sổ Chinook, giữ thanh lọc `GenreId = 1` và khoảng sáu dòng đầu của table Track. Cắt
bản sáng và bản tối ở cùng một vị trí.

## mac-db-mongodb-document

### Purpose
Shows a whole MongoDB document written as Extended JSON in the Insert Document sheet, the editing model the MongoDB
page describes instead of a typed tree editor.

### Scene
- Platform and release: Mac, TablePro 0.77.0. Insert Document has existed since 0.76.0, so it is not 0.77-only. The
  MongoDB driver downloads on first pick: install it before the capture.
- Screen, panel and feature state: the full connection window on a MongoDB connection, with the empty `events`
  collection open in the grid and the **Insert Document…** sheet over it (Edit > Insert Document…).
- Engine and dataset: MongoDB 7 or 8 Community in Docker (`mongo:7`), database `analytics`, an empty `events`
  collection, the same fictional scene as the docs image `mongodb-insert-document.png`. Name the connection with a
  fictional host such as `mongo.acme.internal`. Sample data only.
- Operation and visible values: the sheet holds one document typed as Extended JSON, for example
  `{"name": "signup", "channel": "web", "at": {"$date": "2026-09-30T08:15:00Z"}, "count": 1, "tags": ["trial", "eu"]}`,
  laid out one field per line. Legible: the quoted field names, the `$date` wrapper and the array.
- Controls that must be visible: the sheet's Insert and Cancel buttons, the sidebar listing the `analytics`
  collections, and the toolbar showing a MongoDB connection.

### Framing
Full window. Context to keep: the sidebar and the empty grid behind the sheet. Focal area: the document text in the
sheet, which must fit inside the phone crop (`mac-db-mongodb-document-mobile`). No added text or arrows.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; the copy keeps the English UI terms. The document values are English sample
data.

### Open evidence
Confirm the sheet's button labels at 0.77.0 before capture (`docs/databases/mongodb.mdx` "Inserting documents" names
the sheet but not its buttons).

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp toàn bộ cửa sổ TablePro trên một connection MongoDB (Docker `mongo:7`, cơ sở dữ liệu `analytics`), với
collection `events` còn trống và hộp thoại Insert Document đang mở. Trong hộp thoại, gõ một document Extended JSON mẫu
có `name`, `channel`, `$date`, `count` và mảng `tags`. Phần nội dung document phải nằm gọn trong vùng cắt cho điện
thoại.

## mac-db-mongodb-document-mobile

### Purpose
The phone version of the MongoDB lead image: the Extended JSON document, readable at phone width.

### Scene
- Platform and release: cut from the same 2× capture as `mac-db-mongodb-document`, so the release, engine and data are
  identical.
- Screen, panel and feature state: the text area of the Insert Document sheet.
- Engine and dataset: MongoDB with the empty `events` collection, as in the window capture.
- Operation and visible values: every line of the document, with the `$date` wrapper and the `tags` array legible.
- Controls that must be visible: the sheet's Insert button if it fits; the text comes first.

### Framing
A 4:5 crop from the window capture, no resampling beyond the cut. The first and last lines of the document stay clear
of the crop edges.

### Light and dark
Cut both variants from the light and dark window captures at the same coordinates.

### Locale
Shared by both sites, like the window it comes from.

### Open evidence
None beyond the window capture's.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn cắt ảnh này từ chính ảnh chụp cửa sổ MongoDB, giữ lại toàn bộ document Extended JSON trong hộp thoại Insert
Document để đọc rõ trên điện thoại. Cắt bản sáng và bản tối ở cùng một vị trí.

## mac-db-redis-keys

### Purpose
Shows Redis keys grouped into a tree on the colon separator, with each key's type, TTL, length and value in the grid.

### Scene
- Platform and release: Mac, TablePro 0.77.0. The Redis driver comes with the app.
- Screen, panel and feature state: the full connection window on a Standalone Redis connection, database `db0`
  selected, with the key tree open in the sidebar and the grid listing keys.
- Engine and dataset: Redis 7.4 (or Valkey 8) in Docker, loaded with generated sample keys only: hashes
  `user:1001`, `user:1002`, strings `session:9f2c…` with a TTL, a JSON string `cache:product:42`, a list
  `queue:emails`, a sorted set `leaderboard:weekly` and a stream `events:signup`. Name the connection with a fictional
  host such as `redis.acme.internal`.
- Operation and visible values: the `user`, `session` and `cache` folders expanded in the tree; the grid shows the
  Key, Type, TTL, Length and Value columns, with at least one key with a TTL in seconds and one with `-1` (no expiry).
- Controls that must be visible: the sidebar's database list (`db0` upward), the filter bar toggle, and the toolbar
  showing a Redis connection.

### Framing
Full window. Focal area: the expanded tree beside the first grid rows, which must fit inside the phone crop
(`mac-db-redis-keys-mobile`). No added text or arrows.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites. The key names are English sample data.

### Open evidence
None. Key tree, grid columns and TTL editing are documented at v0.77.0 (`docs/databases/redis.mdx`, "Browsing keys").
Do not capture any Redis screen on iPhone or iPad: App Store 1.0 cannot open keys.

### Manifest changes
Applied. The request, kept for the record:
Name every grid column in the description and the alt text, because the grid shows Length as well as type, TTL and
value (`docs/databases/redis.mdx` "Browsing keys").
- description.en: "Redis key tree split on \":\" with the Key, Type, TTL, Length and Value columns."
- description.vi: "Cây key Redis phân theo dấu \":\" với các cột Key, Type, TTL, Length và Value."
- alt.en: "Redis keys in TablePro grouped into a tree on the colon separator, with each key's type, TTL, length and value in the grid."
- alt.vi: "Các key Redis trong TablePro được nhóm thành cây theo dấu hai chấm, data grid hiển thị type, TTL, độ dài và giá trị của từng key."

### Tóm tắt cho chủ sở hữu
Bạn chụp toàn bộ cửa sổ TablePro trên một connection Redis Standalone (Docker Redis 7.4 hoặc Valkey 8), đã nạp các
key mẫu như `user:1001`, `session:…`, `cache:product:42`, `queue:emails`. Mở rộng các thư mục `user`, `session` và
`cache` trong cây key, để data grid hiện đủ các cột Key, Type, TTL, Length và Value. Không chụp Redis trên iPhone hay
iPad.

## mac-db-redis-keys-mobile

### Purpose
The phone version of the Redis lead image: the key tree beside the type and TTL of a few keys.

### Scene
- Platform and release: cut from the same 2× capture as `mac-db-redis-keys`.
- Screen, panel and feature state: the expanded key tree and the first grid rows.
- Engine and dataset: the generated sample keys, as in the window capture.
- Operation and visible values: at least five keys with their Type and TTL legible, one TTL in seconds and one `-1`.
- Controls that must be visible: none beyond the tree and the grid.

### Framing
A 4:5 crop from the window capture. The tree's folder names and the TTL column stay clear of the crop edges.

### Light and dark
Cut both variants at the same coordinates from the light and dark window captures.

### Locale
Shared by both sites.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn cắt ảnh này từ ảnh chụp cửa sổ Redis, giữ lại cây key đã mở rộng và khoảng năm key đầu tiên với cột Type và TTL
đọc rõ. Cắt bản sáng và bản tối ở cùng một vị trí.

## mac-db-sqlserver-script

### Purpose
Shows a T-SQL script split into batches with `GO`, and the `PRINT` messages it produced in the Output view.

### Scene
- Platform and release: Mac, TablePro 0.77.0. `GO` batches and server output arrived in 0.76.0, so they are not
  0.77-only. The SQL Server driver downloads on first pick: install it before the capture.
- Screen, panel and feature state: a query tab with the script in the editor and the result area switched to
  **Output** with the status bar's view switcher.
- Engine and dataset: SQL Server 2022 in Docker (`mcr.microsoft.com/mssql/server:2022-latest`) with Microsoft's
  AdventureWorksLT sample database. Sample data only; a fictional host such as `mssql.acme.internal`.
- Operation and visible values: a script of two batches, for example
  `DECLARE @since date = '2008-06-01'; PRINT 'Orders since ' + CONVERT(varchar(10), @since, 23); SELECT TOP (10) SalesOrderID, OrderDate, TotalDue FROM SalesLT.SalesOrderHeader WHERE OrderDate >= @since ORDER BY TotalDue DESC;`
  then a `GO` line, then `PRINT 'Customers by country'; SELECT CountryRegion, COUNT(*) AS customers FROM SalesLT.Address GROUP BY CountryRegion;`
  and a final `GO`, laid out on separate lines and run with Cmd+Shift+Enter. Legible: both `GO` lines and both
  printed lines in the Output view.
- Controls that must be visible: the result tabs above the result area (one per result set) and the Data and Output
  switcher.

### Framing
Detail crop: the editor with the whole script above the result area showing the Output lines. Keep the `GO` lines
and the printed lines clear of the crop edges. No added text or arrows. On phones this slot shows its crop instead
(`mac-db-sqlserver-script-mobile`), so the focal area must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; the printed messages are English sample text.

### Open evidence
Confirm at 0.77.0 which result tab carries the Output switcher when a script returns two result sets and printed in
both batches (`docs/databases/mssql.mdx` "Scripts and batches"; `docs/features/data-grid.mdx` names the Output mode).

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp cận cảnh tab query trên SQL Server 2022 (Docker) với cơ sở dữ liệu mẫu AdventureWorksLT: một script hai batch
tách bằng dòng `GO`, mỗi batch có một câu `PRINT` và một câu `SELECT`. Chạy cả script, rồi chuyển vùng kết quả sang chế
độ Output để thấy các dòng do `PRINT` in ra. Phải đọc rõ cả hai dòng `GO` và các dòng Output.

## mac-db-sqlserver-script-mobile

### Purpose
Give phone readers a legible view of the GO batch separators and the PRINT messages.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-sqlserver-script`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the lower part of the script and the Output view below it, from that capture.
- Operation and visible values: both `GO` lines and the two printed lines in the Output view. Long `SELECT` lines may
  run past the right edge.
- Controls that must be visible: the Data and Output switcher.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-sqlserver-script`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the editor's left edge; keep
the `GO` lines and the printed lines clear of the edges. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-sqlserver-script` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-sqlserver-script`. The proposed alt text names the GO separators and the two PRINT
messages; the cut must show both.

### Open evidence
None beyond `mac-db-sqlserver-script`'s. Confirm the cut region once `mac-db-sqlserver-script` is captured: the script
must sit close enough to the Output view that both fit in 429 pt of height.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-sqlserver-script`, từ mép
trái editor, lấy hai dòng `GO` và hai dòng PRINT trong khung Output. Cắt đúng kích thước gốc, không thu nhỏ, để chữ
vẫn đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-oracle-plsql

### Purpose
Shows a PL/SQL block run as one statement, with the lines it wrote through `DBMS_OUTPUT` shown with its result.

### Scene
- Platform and release: Mac, TablePro 0.77.0. Server output arrived in 0.76.0. The Oracle driver downloads on first
  pick: install it before the capture.
- Screen, panel and feature state: a query tab with the block in the editor and its result below.
- Engine and dataset: Oracle Database 23ai Free in Docker (`gvenzl/oracle-free:23-slim`), service `FREEPDB1`, user `hr`,
  with HR-shaped `departments` and `employees` tables. 21c XE has no arm64 image. Oracle's own HR rows name real
  people, so the people are generated; departments 10, 20 and 50 keep HR's head counts (1, 2 and 45). Sample data
  only; a fictional host such as `oracle.acme.internal`.
- Operation and visible values: an anonymous block such as
  `DECLARE v_total NUMBER; BEGIN FOR d IN (SELECT department_id, department_name FROM departments WHERE department_id IN (10, 20, 50)) LOOP SELECT COUNT(*) INTO v_total FROM employees WHERE department_id = d.department_id; DBMS_OUTPUT.PUT_LINE(d.department_name || ': ' || v_total); END LOOP; END;`
  laid out on separate lines and run with Cmd+Enter. Legible: `DBMS_OUTPUT.PUT_LINE` in the editor and the three
  printed lines under the result.
- Controls that must be visible: the gutter run button beside the block, and the schema shown in the toolbar.

### Framing
Detail crop: the whole block in the editor above the result area with the printed lines. Keep the printed lines
clear of the crop edges. No added text or arrows. On phones this slot shows its crop instead
(`mac-db-oracle-plsql-mobile`), so the focal area must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; the department names are English sample data.

### Open evidence
`docs/features/query-results.mdx` "Server output" says a block that returns no rows shows its lines under the success
message, and only a query that returned rows gains an Output mode. The description and alt text say the lines appear
under the block's result, which is what this scene shows.

Captured on 0.77.1 against 23ai Free: the editor bar and the toolbar's Schema item read the service, `FREEPDB1`, and
the `HR` schema shows as the sidebar's current schema. The gutter run control is drawn only while the pointer is over
the gutter.

### Manifest changes
Applied. The request, kept for the record:
Describe where the lines appear for a block, which returns no rows.
- description.en: "A PL/SQL block with its DBMS_OUTPUT lines under the result."
- description.vi: "Một khối PL/SQL với các dòng DBMS_OUTPUT hiện dưới kết quả."
- alt.en: "An Oracle PL/SQL block in the editor, with the lines it wrote through DBMS_OUTPUT shown under its result."
- alt.vi: "Một khối PL/SQL của Oracle trong editor, các dòng ghi qua DBMS_OUTPUT hiện bên dưới kết quả của khối."

### Tóm tắt cho chủ sở hữu
Bạn chụp cận cảnh tab query trên Oracle Database 23ai Free (Docker `gvenzl/oracle-free:23-slim`, service `FREEPDB1`) với
các bảng mẫu theo cấu trúc HR, tên nhân viên được tạo ngẫu nhiên.
Chạy một anonymous block lặp qua vài phòng ban và in số nhân viên bằng `DBMS_OUTPUT.PUT_LINE`, để thấy các dòng in ra
ngay dưới kết quả. Không cần `SET SERVEROUTPUT ON`.

## mac-db-oracle-plsql-mobile

### Purpose
Give phone readers a legible view of the DBMS_OUTPUT call and the lines it printed.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-oracle-plsql`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the lower lines of the block and the printed lines under the result, from that
  capture.
- Operation and visible values: the `DBMS_OUTPUT.PUT_LINE` line and the three printed department lines.
- Controls that must be visible: none beyond the editor and the output.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-oracle-plsql`, so it is a 343 × 429 pt region
and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the editor's left edge; keep the
printed lines clear of the bottom edge. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-oracle-plsql` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-oracle-plsql`. The proposed alt text names the DBMS_OUTPUT.PUT_LINE call and the
three printed lines; the cut must show both.

### Open evidence
None beyond `mac-db-oracle-plsql`'s. Confirm the cut region once `mac-db-oracle-plsql` is captured: the block's last
lines and the printed lines must fit in 429 pt of height.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-oracle-plsql`, lấy dòng
`DBMS_OUTPUT.PUT_LINE` và ba dòng phòng ban được in ra bên dưới kết quả. Cắt đúng kích thước gốc, không thu nhỏ, để
chữ vẫn đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-clickhouse-parts

### Purpose
Shows the Parts tab of a MergeTree table, with its partitions, parts and the partition actions, the ClickHouse-only
view the page leads with.

### Scene
- Platform and release: Mac, TablePro 0.77.0. The ClickHouse driver comes with the app.
- Screen, panel and feature state: a table tab on the **Parts** tab, with the Optimize, Drop Partition and Detach
  Partition actions in view.
- Engine and dataset: ClickHouse server in Docker (`clickhouse/clickhouse-server`), database `analytics`, a sample
  MergeTree table `events` partitioned by `toYYYYMM(event_time)`, filled with generated rows (`INSERT … SELECT … FROM
  numbers(…)`) in several inserts across three months, so each partition holds more than one part. Sample data only;
  a fictional host such as `clickhouse.acme.internal`.
- Operation and visible values: the part list with partition, rows, size on disk, modification time and the active
  flag. Run one `OPTIMIZE TABLE events PARTITION 202608` beforehand so one partition shows merged and inactive parts.
- Controls that must be visible: the Structure, Indexes, DDL and Parts tab switcher, and the partition actions.

### Framing
Detail crop of the table tab: the tab switcher and the part list. Keep the active flag column and the actions clear of
the crop edges. No added text or arrows. On phones this slot shows its crop instead
(`mac-db-clickhouse-parts-mobile`), so the focal area must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites.

### Open evidence
The Parts tab is documented at v0.77.0 (`docs/databases/clickhouse.mdx` "Browsing", with the docs image
`clickhouse-parts-tab.png`); confirm the columns and actions against the app before capture.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp cận cảnh tab Parts của table MergeTree `events` trên ClickHouse (Docker), table được chia partition theo tháng
và nạp dữ liệu mẫu bằng nhiều lần insert để mỗi partition có vài part. Phải thấy rõ cột partition, số dòng, dung lượng
trên đĩa, trạng thái active và các thao tác Optimize, Drop Partition, Detach Partition.

## mac-db-clickhouse-parts-mobile

### Purpose
Give phone readers a legible view of the part list: partition, rows and the active flag.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-clickhouse-parts`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the left part of the part list with its header row, from that capture.
- Operation and visible values: the partition, part name, rows and active columns for the merged partition and one
  other.
- Controls that must be visible: the Parts tab in the tab switcher.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-clickhouse-parts`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the list's left edge, with the
Parts tab above it. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-clickhouse-parts` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-clickhouse-parts`. The proposed alt text names each part's partition, row count and
active flag; the cut must show all three columns.

### Open evidence
None beyond `mac-db-clickhouse-parts`'s. Confirm the cut region once `mac-db-clickhouse-parts` is captured: before
capturing `mac-db-clickhouse-parts`, narrow or reorder the columns so partition, part, rows and active sit within the
first 343 pt.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-clickhouse-parts`, lấy tab
Parts và các cột partition, part, số dòng, active ở phần đầu danh sách. Cắt đúng kích thước gốc, không thu nhỏ, để chữ
vẫn đọc được trên điện thoại. Trước khi chụp ảnh gốc, kéo hẹp hoặc sắp lại cột để bốn cột này nằm trong 343 pt đầu
tiên. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-duckdb-parquet

### Purpose
Shows a Parquet file opened in DuckDB as a read-only view and queried with SQL where it sits, with no import.

### Scene
- Platform and release: Mac, TablePro 0.77.0. The DuckDB driver downloads on first pick: install it before the
  capture.
- Screen, panel and feature state: a DuckDB connection made by choosing the Parquet file with **Browse…** in the
  connection form; the sidebar shows the two views, `file` and the one named after the file, and a query tab holds a
  query over the file with its result below.
- Engine and dataset: one month of the public NYC Taxi and Limousine Commission yellow taxi trip records in Parquet,
  saved as `trips_2024_01.parquet` so the view name reads cleanly. Public sample data only.
- Operation and visible values: a query such as
  `SELECT payment_type, count(*) AS trips, round(avg(total_amount), 2) AS avg_total FROM file GROUP BY payment_type ORDER BY trips DESC;`
  run, with the row count in the status bar. Legible: the query, the two views in the sidebar, and the result rows.
- Controls that must be visible: the sidebar with the views, the run button, and the toolbar showing a DuckDB
  connection.

### Framing
Detail crop: the sidebar's views, the editor and the result. Keep the view names and the first result rows clear of
the
crop edges. No added text or arrows. On phones this slot shows its crop instead (`mac-db-duckdb-parquet-mobile`), so
the focal area must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; the column names come from the dataset.

### Open evidence
Confirm that the second view takes the file name without its extension (`docs/databases/duckdb.mdx` "What the file
field accepts" says "one named after the file").

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn tạo một connection DuckDB bằng cách chọn file Parquet mẫu (dữ liệu chuyến taxi vàng công khai của NYC TLC, lưu với
tên `trips_2024_01.parquet`) trong form connection. Chụp cận cảnh sidebar có hai view `file` và `trips_2024_01`, cùng
một query `GROUP BY payment_type` trên file và kết quả bên dưới, cả bản sáng lẫn bản tối.

## mac-db-duckdb-parquet-mobile

### Purpose
Give phone readers a legible view of the query over the Parquet file and its first rows.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-duckdb-parquet`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the editor with the query and the top of the result grid, from that capture.
- Operation and visible values: the `FROM file` query and at least five result rows with their column headers. The
  sidebar is left out.
- Controls that must be visible: the result grid's header row.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-duckdb-parquet`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the editor's left edge; keep
the query's first line and the first result row clear of the edges. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-duckdb-parquet` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-duckdb-parquet`. The proposed alt text names a query reading the Parquet file and
the first result rows; the cut must show both.

### Open evidence
None beyond `mac-db-duckdb-parquet`'s. Confirm the cut region once `mac-db-duckdb-parquet` is captured: the query is
short enough to fit in 343 pt once laid out on three lines.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-duckdb-parquet`, từ mép trái
editor, lấy câu query `FROM file` và ít nhất năm dòng kết quả đầu tiên cùng tiêu đề cột. Cắt đúng kích thước gốc,
không thu nhỏ, để chữ vẫn đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-cassandra-table

### Purpose
Shows a Cassandra table opened from the sidebar and edited in the data grid, where scalar columns take edits and
collections show as structured values.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the Cassandra driver plugin installed.
- Screen, panel and feature state: a Cassandra table opened from the sidebar (not a CQL editor result, which is
  read-only), with one cell in the `status` column in edit mode and the change not yet saved.
- Engine and dataset: Apache Cassandra 4.1 or 5.0 in Docker on the capture Mac, connection named with a fictional host such as
  `cassandra.acme.internal`. Keyspace `shop` with a table `orders_by_user` modelled on the `shop` sample: partition key
  `user_id uuid`, clustering column `created_at timestamp`, then `order_id uuid`, `status text`, `total decimal` and
  `tags set<text>`. A few dozen sample rows only.
- Operation and visible values: the table open in the grid, the `status` cell of one row being changed from `pending`
  to `shipped`. Legible: the column headers, the `tags` column showing a set such as `{gift, express}`, and the cell in
  edit mode.
- Controls that must be visible: the sidebar with the `shop` keyspace expanded, and the grid's save and discard
  controls.

### Framing
Detail crop: the sidebar's keyspace tree on the left edge and the grid, with the edited cell as the focal area, clear
of the crop edges. No added text or arrows. On phones this slot shows its crop instead
(`mac-db-cassandra-table-mobile`), so the focal area must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; the copy keeps CQL and the English UI terms. Data values are English sample data.

### Open evidence
The `shop` sample exists only as PostgreSQL and MariaDB/MySQL DDL, so the CQL table above is new and has to be written for the capture. Confirm on 0.77.0 how the grid renders a `set<text>` cell before the
alt text is final.

### Manifest changes
Applied. The Vietnamese description says "cột scalar": the glossary keeps "scalar" in English. The request, kept for the record:
The current description and alt text place the edit after a CQL query, but CQL editor results are read-only
(`docs/databases/cassandra.mdx` at v0.77.0, "Results in the CQL editor are read-only. Open the table from the sidebar
to edit its rows"). Change them to:
- description.en: "A Cassandra table opened from the sidebar, with a scalar cell being edited."
- description.vi: "Một table Cassandra mở từ sidebar, với một ô thuộc cột kiểu đơn đang được sửa."
- alt.en: "A Cassandra table opened from the sidebar in the data grid, with a cell in a text column being edited and a set column shown as a collection."
- alt.vi: "Một table Cassandra mở từ sidebar trong data grid, một ô thuộc cột text đang được sửa và một cột set hiển thị dưới dạng collection."

### Tóm tắt cho chủ sở hữu
Bạn chụp một table Cassandra mở từ sidebar (không phải kết quả trong CQL editor, vốn chỉ đọc), trên Cassandra chạy bằng
Docker với keyspace mẫu `shop` và table `orders_by_user`. Một ô của cột `status` đang được sửa, còn cột `tags` kiểu set
hiện dưới dạng collection. Chụp bản sáng và bản tối từ cùng một khung hình.

## mac-db-cassandra-table-mobile

### Purpose
Give phone readers a legible view of the cell being edited and the set column beside it.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-cassandra-table`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the grid rows around the edited cell, with the header row, from that capture.
- Operation and visible values: the `status` cell in edit mode and the `tags` column showing a set such as `{gift,
  express}`.
- Controls that must be visible: the grid's header row.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-cassandra-table`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Centre the edited cell; the `status` and
`tags` headers stay inside the top edge. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-cassandra-table` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-cassandra-table`. The proposed alt text names the status cell being changed to
shipped and the tags set; the cut must show both.

### Open evidence
None beyond `mac-db-cassandra-table`'s. Confirm the cut region once `mac-db-cassandra-table` is captured: the `status`
and `tags` columns must sit next to each other within 343 pt.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-cassandra-table`, lấy ô
`status` đang sửa và cột `tags` bên cạnh, cùng dòng tiêu đề cột. Cắt đúng kích thước gốc, không thu nhỏ, để chữ vẫn
đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-redshift-ddl

### Purpose
Shows that a Redshift table's DDL carries its distribution style, distribution key, sort key and column encodings,
while the structure itself stays read-only.

### Scene
- Platform and release: Mac, TablePro 0.77.0 (the PostgreSQL driver that serves Redshift comes with the app).
- Screen, panel and feature state: the Structure view of one table with the DDL tab selected; no edit controls active.
- Engine and dataset: a Redshift Serverless workgroup in a sandbox AWS account, with the `shop` sample loaded into
  schema `public`. Create `orders` as `DISTSTYLE KEY DISTKEY(user_id) SORTKEY(created_at)`, with at least one column
  carrying an explicit `ENCODE` such as `AZ64`. Sample rows only.
- Operation and visible values: the `CREATE TABLE` text for `orders`. Legible: `DISTSTYLE`, `DISTKEY`, `SORTKEY` and one
  `ENCODE` clause.
- Controls that must be visible: the Structure tab strip with DDL selected.
- The workgroup endpoint contains the AWS account ID: keep the toolbar, the connection name field and any host out of
  the frame.

### Framing
Detail crop of the DDL text and the tab strip above it. Focal area: the `DISTKEY` and `SORTKEY` lines, clear of the
crop
edges. No added text. On phones this slot shows its crop instead (`mac-db-redshift-ddl-mobile`), so the focal area
must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; DDL is the same in both languages.

### Open evidence
Redshift has no local emulator, so this needs a sandbox AWS account. Confirm on 0.77.0 that the DDL tab prints
`DISTSTYLE` and `ENCODE` as `docs/databases/redshift.mdx` says, and translate the `shop` PostgreSQL DDL to Redshift
types.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp tab DDL của table `orders` trên một Redshift Serverless workgroup trong tài khoản AWS dùng để thử, đã nạp schema
mẫu `shop`, với `DISTKEY(user_id)`, `SORTKEY(created_at)` và ít nhất một cột có `ENCODE`. Endpoint chứa account ID, nên
không được để toolbar hay host lọt vào khung hình. Chụp bản sáng và bản tối từ cùng một khung hình.

## mac-db-redshift-ddl-mobile

### Purpose
Give phone readers a legible view of the DISTKEY and SORTKEY lines.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-redshift-ddl`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the lines of the `CREATE TABLE` text from the columns down to the table options,
  from that capture.
- Operation and visible values: `DISTSTYLE`, `DISTKEY`, `SORTKEY` and one `ENCODE` clause.
- Controls that must be visible: none; the tab strip may be left out.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-redshift-ddl`, so it is a 343 × 429 pt region
and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the DDL's left edge; keep the
`DISTKEY` and `SORTKEY` lines clear of the edges. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-redshift-ddl` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-redshift-ddl`. The proposed alt text names the DISTSTYLE, DISTKEY and SORTKEY
lines; the cut must show all three.

### Open evidence
None beyond `mac-db-redshift-ddl`'s. Confirm the cut region once `mac-db-redshift-ddl` is captured: the table options
must follow the column list closely enough to fit in 429 pt with one `ENCODE` line.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-redshift-ddl`, lấy các dòng
`DISTSTYLE`, `DISTKEY`, `SORTKEY` và một mệnh đề `ENCODE`. Cắt đúng kích thước gốc, không thu nhỏ, để chữ vẫn đọc được
trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-d1-databases

### Purpose
Shows that one D1 connection reaches the D1 databases of a whole Cloudflare account through the database switcher.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the Cloudflare D1 driver plugin installed.
- Screen, panel and feature state: the database switcher open over a query tab, listing the account's D1 databases,
  with the current one marked.
- Engine and dataset: a sandbox Cloudflare account with three D1 databases: `chinook`, holding the Chinook sample loaded
  with `wrangler d1 execute chinook --file=chinook.sql`, plus two small ones with neutral names such as `acme-config` and
  `acme-staging`.
- Operation and visible values: behind the switcher, a query tab on `chinook` with
  `SELECT Name, Composer FROM Track WHERE GenreId = 1 LIMIT 50;` and its first result rows. Legible: the three database
  names in the switcher and the query text.
- Controls that must be visible: the switcher's list and its create control.
- No account ID and no API token anywhere in the frame.

### Framing
Detail crop around the switcher and the part of the editor it covers. Focal area: the list of databases, clear of the
crop edges. No added text. On phones this slot shows its crop instead (`mac-db-d1-databases-mobile`), so the focal
area must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; database names and the Chinook data are the same in both languages.

### Open evidence
Confirm on 0.77.0 where the switcher opens for D1 (the toolbar's database switcher, per `docs/databases/cloudflare-d1.mdx`,
or the `Cmd+K` sheet) and that the sidebar lists only the current database's tables, not the other databases. The
description and alt text assume both.

### Manifest changes
Applied. The request, kept for the record:
The current description and alt text say the databases are listed in the sidebar. The D1 driver groups its sidebar
flat by the current database (`PluginMetadataRegistry+RegistryDefaults.swift`, `databaseGroupingStrategy: .flat`), and
the docs place the account-wide list in the database switcher. Change them to:
- description.en: "The database switcher listing the account's D1 databases, over a query on one of them."
- description.vi: "Bộ chuyển cơ sở dữ liệu liệt kê các cơ sở dữ liệu D1 của tài khoản, mở phía trên một query trên một trong số đó."
- alt.en: "The database switcher listing the Cloudflare D1 databases of one account, open over a query tab on the chinook database."
- alt.vi: "Bộ chuyển cơ sở dữ liệu liệt kê các cơ sở dữ liệu Cloudflare D1 của một tài khoản, mở phía trên tab query của cơ sở dữ liệu chinook."

### Tóm tắt cho chủ sở hữu
Bạn tạo một tài khoản Cloudflare để thử với ba cơ sở dữ liệu D1, trong đó `chinook` được nạp dữ liệu mẫu Chinook bằng
`wrangler d1 execute`. Chụp bộ chuyển cơ sở dữ liệu đang mở, liệt kê cả ba, phía trên một tab query trên `chinook`.
Không được để lộ account ID hay API token. Chụp bản sáng và bản tối từ cùng một khung hình.

## mac-db-d1-databases-mobile

### Purpose
Give phone readers a legible view of the database switcher's list.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-d1-databases`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the database switcher, from that capture.
- Operation and visible values: the database names in the list, the current one marked, and the create control.
- Controls that must be visible: the switcher's list and its create control.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-d1-databases`, so it is a 343 × 429 pt region
and the Mac text keeps its real size on a phone. Do not scale the cut. Centre the switcher; its first and last rows
stay clear of the edges. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-d1-databases` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-d1-databases`. The proposed alt text names the account's D1 databases with chinook
marked as current; the cut must show the list and the mark.

### Open evidence
None beyond `mac-db-d1-databases`'s. Confirm the cut region once `mac-db-d1-databases` is captured: nothing else: the
switcher is narrower than 343 pt.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-d1-databases`, lấy trọn bộ
chuyển cơ sở dữ liệu với danh sách tên và nút tạo mới. Cắt đúng kích thước gốc, không thu nhỏ, để chữ vẫn đọc được
trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-turso-remote

### Purpose
Shows a remote Turso database open over HTTP: its tables in the sidebar and a query result from it.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the libSQL / Turso driver plugin installed.
- Screen, panel and feature state: a Turso connection in Remote (Turso) mode, the sidebar listing the tables, a query
  tab with a result.
- Engine and dataset: a Turso database named `chinook` in a sandbox Turso organisation with a neutral name such as
  `acme`, loaded with the Chinook SQLite sample (`turso db shell chinook < chinook.sql`).
- Operation and visible values: `SELECT a.Title, ar.Name FROM Album a JOIN Artist ar ON ar.ArtistId = a.ArtistId LIMIT 50;`
  just run, with the row count in the status bar. Legible: the table names in the sidebar, the query and a dozen rows.
- Controls that must be visible: the sidebar's table list and the result grid.
- The database URL carries the organisation name and the token must never show: keep the connection form and any URL
  out of the frame.

### Framing
Detail crop of the sidebar and the editor with its result. Focal area: the query and the first rows, clear of the crop
edges. No added text. On phones this slot shows its crop instead (`mac-db-turso-remote-mobile`), so the focal area
must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; the Chinook data is the same in both languages.

### Open evidence
None beyond a sandbox Turso account. Do not substitute a local libSQL file: the page's lead image is the remote case.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn tạo một cơ sở dữ liệu Turso tên `chinook` trong một organisation dùng để thử, nạp dữ liệu mẫu Chinook, rồi kết nối ở
chế độ Từ xa (Turso). Chụp sidebar với danh sách table và kết quả của một câu join `Album` với `Artist`. Không được để lộ
URL hay token. Chụp bản sáng và bản tối từ cùng một khung hình.

## mac-db-turso-remote-mobile

### Purpose
Give phone readers a legible view of the query on the remote database and its first rows.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-turso-remote`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the editor with the query and the top of the result grid, from that capture.
- Operation and visible values: the `SELECT a.Title, ar.Name …` query and at least five result rows with their column
  headers.
- Controls that must be visible: the result grid's header row.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-turso-remote`, so it is a 343 × 429 pt region
and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the editor's left edge; keep the query
and the first result row clear of the edges. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-turso-remote` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-turso-remote`. The proposed alt text names a query joining Album and Artist and the
first result rows; the cut must show both.

### Open evidence
None beyond `mac-db-turso-remote`'s. Confirm the cut region once `mac-db-turso-remote` is captured: lay the query out
on two or three lines so it fits in 343 pt.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-turso-remote`, từ mép trái
editor, lấy câu query và ít nhất năm dòng kết quả đầu tiên cùng tiêu đề cột. Cắt đúng kích thước gốc, không thu nhỏ,
để chữ vẫn đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-dynamodb-planner

### Purpose
Shows the DynamoDB planner turning the filter bar into a Query on an index, and the status bar reporting what the read
returned, read and consumed in read capacity.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the DynamoDB driver plugin installed.
- Screen, panel and feature state: a table opened from the sidebar with two filters applied, and the status bar after
  the read.
- Engine and dataset: DynamoDB Local in Docker (`docker run -p 8000:8000 amazon/dynamodb-local`), connection using
  DynamoDB Local (no credentials). Table `Orders` with partition key `customerId` (String) and sort key `orderId`
  (String), and a global secondary index `byStatus` with partition key `status` and sort key `createdAt`, projecting all
  attributes. A few hundred sample items across several statuses.
- Operation and visible values: filters `status = shipped` and `createdAt >= 2026-09-01`, so the planner chooses the
  index. Legible: both filters and the status bar line that starts with `Query on index byStatus` and continues with the
  items returned, the items read and the RCU figure.
- Controls that must be visible: the filter bar and the status bar.

### Framing
Detail crop: the filter bar at the top, a few grid rows, and the status bar at the bottom. Focal area: the status bar
line, clear of the crop edges. No added text or arrows. On phones this slot shows its crop instead
(`mac-db-dynamodb-planner-mobile`), so the focal area must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; the status bar text is captured in English.

### Open evidence
The RCU figure is the read capacity the response reports as consumed (`DynamoDBPluginDriver+Reading.swift` sends
`ReturnConsumedCapacity: TOTAL` at v0.77.0). Confirm that DynamoDB Local returns `ConsumedCapacity`; if it does not,
capture the same table in a sandbox AWS account instead, with no account ID in the frame.

### Manifest changes
Applied. The request, kept for the record:
The current description and alt text call the read capacity "estimated". It is the capacity the read consumed, shown
after the read. Change them to:
- description.en: "The DynamoDB planner running a filter as a Query on an index, with the read capacity units it consumed."
- description.vi: "Planner của DynamoDB chạy bộ lọc dưới dạng Query trên một index, kèm số read capacity unit đã dùng."
- alt.en: "The DynamoDB status bar after a filtered read: a Query on the byStatus index, the items returned and read, and the read capacity units consumed."
- alt.vi: "Thanh trạng thái DynamoDB sau một lần đọc có lọc: Query trên index byStatus, số item trả về và đã đọc, cùng số read capacity unit đã dùng."

### Tóm tắt cho chủ sở hữu
Bạn chạy DynamoDB Local bằng Docker, tạo table `Orders` có global secondary index `byStatus`, rồi lọc theo `status` và
`createdAt` để planner chọn Query trên index. Chụp thanh lọc và thanh trạng thái, nơi ghi `Query on index byStatus`
cùng số item trả về, số item đã đọc và RCU đã dùng. Nếu DynamoDB Local không trả RCU, hãy chụp trên một tài khoản AWS
dùng để thử.

## mac-db-dynamodb-planner-mobile

### Purpose
Give phone readers a legible view of the status bar line the planner writes.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-dynamodb-planner`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the last grid rows and the status bar below them, from that capture.
- Operation and visible values: the status bar line: `Query on index byStatus`, the items returned, the items read and
  the RCU figure.
- Controls that must be visible: the status bar.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-dynamodb-planner`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the status bar's left edge,
with the line near the bottom but clear of it. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-dynamodb-planner` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-dynamodb-planner`. The proposed alt text names the Query on the byStatus index, the
items returned and read, and the RCU; the cut must show the whole line.

### Open evidence
None beyond `mac-db-dynamodb-planner`'s. Confirm the cut region once `mac-db-dynamodb-planner` is captured: the line,
such as "Query on index byStatus · 24 returned · 120 read · 3.5 RCU", is about 330 pt wide at the status bar's size;
if the RCU figure falls outside 343 pt, say so before the alt text is final.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-dynamodb-planner`, lấy vài
dòng cuối của data grid và trọn dòng trạng thái `Query on index byStatus … RCU`. Cắt đúng kích thước gốc, không thu
nhỏ, để chữ vẫn đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-bigquery-dry-run

### Purpose
Shows the BigQuery Dry Run answering what a query would cost before anything runs.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the BigQuery driver plugin installed.
- Screen, panel and feature state: a query tab after Dry Run (Cost) was chosen from the Explain menu, its result showing
  the Metric and Value rows.
- Engine and dataset: a sandbox Google Cloud project with a neutral ID such as `acme-analytics-sample`, signed in with
  Application Default Credentials. The query reads Google's public sample table
  `bigquery-public-data.samples.shakespeare`, for example
  ``SELECT corpus, SUM(word_count) AS words FROM `bigquery-public-data.samples.shakespeare` GROUP BY corpus ORDER BY words DESC;``
- Operation and visible values: the dry-run result rows Total Bytes Processed, Total Bytes Billed, Cache Hit and
  Estimated Cost (USD), all legible, with the query above them.
- Controls that must be visible: the Explain control with its Dry Run (Cost) choice, and the result grid.

### Framing
Detail crop: the lower lines of the query, the Explain control and the four result rows. Focal area: the Estimated
Cost
row, clear of the crop edges. No added text. On phones this slot shows its crop instead
(`mac-db-bigquery-dry-run-mobile`), so the focal area must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; the metric names are captured in English.

### Open evidence
The four row names come from `BigQueryPluginDriver+Execution.swift` (`dryRunResult`) at v0.77.0. The project ID shows
in the sidebar; keep the sidebar out of the crop, or use a project whose ID names nothing real.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn dùng một project Google Cloud để thử, chọn Dry Run (Cost) trong menu Explain cho một query trên bảng mẫu công khai
`bigquery-public-data.samples.shakespeare`. Chụp bốn dòng kết quả: Total Bytes Processed, Total Bytes Billed, Cache Hit và
Estimated Cost (USD). Không để lộ project ID thật. Chụp bản sáng và bản tối từ cùng một khung hình.

## mac-db-bigquery-dry-run-mobile

### Purpose
Give phone readers a legible view of the dry-run figures.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-bigquery-dry-run`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the four dry-run result rows with their Metric and Value columns, from that
  capture.
- Operation and visible values: Total Bytes Processed, Total Bytes Billed, Cache Hit and Estimated Cost (USD), with
  their values.
- Controls that must be visible: the result grid's header row.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-bigquery-dry-run`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the grid's left edge; keep the
Estimated Cost row clear of the edges. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-bigquery-dry-run` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-bigquery-dry-run`. The proposed alt text names the bytes processed and the
estimated cost; the cut must show both rows.

### Open evidence
None beyond `mac-db-bigquery-dry-run`'s. Confirm the cut region once `mac-db-bigquery-dry-run` is captured: narrow the
Metric column before capturing `mac-db-bigquery-dry-run` so both columns fit in 343 pt.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-bigquery-dry-run`, lấy bốn
dòng kết quả Dry Run cùng hai cột Metric và Value. Cắt đúng kích thước gốc, không thu nhỏ, để chữ vẫn đọc được trên
điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-etcd-keys

### Purpose
Shows that an etcd keyspace is browsed by prefix as rows, with each key's value, revisions and lease visible.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the etcd driver installed from the registry.
- Screen, panel and feature state: a connection whose Key Prefix Root is `/acme`. The sidebar shows the key groups
  under it (`config`, `services`, `sessions`), and the `sessions` group is open in the data grid.
- Engine and dataset: a single etcd 3.5 node in Docker, no authentication, on `etcd.acme.internal:2379`. Sample keys
  only, for example `/acme/config/feature-flags` (a short JSON value), `/acme/services/api/endpoint`, and three
  `/acme/sessions/…` keys put with a lease from `lease grant 300`, so the Lease column holds a lease ID on some rows and
  is empty on others.
- Operation and visible values: nothing being edited. Legible: the Key, Value, Version, ModRevision, CreateRevision and
  Lease column headers, at least one lease ID, and the group names in the sidebar.
- Controls that must be visible: the sidebar groups and the grid's column headers.

### Framing
Detail crop of the sidebar and the grid, without the toolbar. Focal area: the rows with a lease ID, kept clear of the
crop edges. No added text or arrows. On phones this slot shows its crop instead (`mac-db-etcd-keys-mobile`), so the
focal area must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; the copy keeps the English column names. The alt text says keys are listed
under a prefix with their values and leases, so the Lease column must show values.

### Open evidence
Confirm at capture that the sidebar groups appear as `docs/databases/etcd.mdx` at v0.77.0 describes (first path
segment under the Key Prefix Root). 0.77.0 fixed value edits and renames detaching a key's lease, so capture on
0.77.0, not 0.76.1.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp data grid của một connection etcd (etcd 3.5 chạy trong Docker, Key Prefix Root là `/acme`) đang mở nhóm key
`sessions`. Hãy tạo vài key mẫu, trong đó ba key gắn lease từ `lease grant 300`, để cột Lease có giá trị ở một số
dòng. Chỉ chụp sidebar và data grid, cả bản sáng lẫn bản tối.

## mac-db-etcd-keys-mobile

### Purpose
Give phone readers a legible view of the keys and their leases.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-etcd-keys`; nothing is captured separately, so the release,
  engine and data are identical.
- Screen, panel and feature state: the grid rows with a lease ID and the header row, from that capture.
- Operation and visible values: the Key and Lease columns, with at least one lease ID and one empty lease.
- Controls that must be visible: the grid's header row.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-etcd-keys`, so it is a 343 × 429 pt region
and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the grid's left edge; keep the rows
with a lease ID clear of the edges. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-etcd-keys` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-etcd-keys`. The proposed alt text names the keys with their values and leases; the
cut must show the Key, Value and Lease columns.

### Open evidence
None beyond `mac-db-etcd-keys`'s. Confirm the cut region once `mac-db-etcd-keys` is captured: before capturing
`mac-db-etcd-keys`, narrow the Value, Version and revision columns, or move Lease next to Key, so Key, Value and Lease
fit in 343 pt.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-etcd-keys`, lấy các cột Key,
Value và Lease với những dòng có lease ID. Cắt đúng kích thước gốc, không thu nhỏ, để chữ vẫn đọc được trên điện
thoại. Trước khi chụp ảnh gốc, kéo hẹp các cột khác để ba cột này nằm trong 343 pt. Làm cho cả bản Sáng và Tối, cùng
tọa độ cắt.

## mac-db-snowflake-session

### Purpose
Shows that a Snowflake session moves between warehouses and roles from the Database menu, without reconnecting.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the Snowflake driver installed from the registry.
- Screen, panel and feature state: a query tab with a result in the grid, and the **Database > Session Context** submenu
  open on top of it, with its Warehouse list showing `COMPUTE_WH` checked and a second warehouse below it.
- Engine and dataset: a Snowflake trial account, never a production account. Query Snowflake's shared sample data,
  `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1`, for example
  `SELECT c_mktsegment, COUNT(*) AS customers FROM customer GROUP BY c_mktsegment ORDER BY customers DESC;`. Name the
  connection "Snowflake trial".
- Operation and visible values: the query has run and the result shows its five segments. Legible: the Session Context
  submenu with the Warehouse and Role entries, the checked warehouse, and the result's column headers.
- Controls that must be visible: the Database menu title in the menu bar, the open submenu and the result grid.
- The account identifier, user name and email must not appear anywhere in the frame.

### Framing
Detail crop around the open menu and the top of the result grid. Focal area: the checked warehouse in the submenu.
No added text or arrows. On phones this slot shows its crop instead (`mac-db-snowflake-session-mobile`), so the focal
area must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme, so the menu is captured in
each.

### Locale
One English capture serves both sites; "Session Context", "Warehouse" and "Role" stay in English in the copy.

### Open evidence
Session Context is a submenu of the Database menu filled per driver (`DatabaseMenuBuilder.swift` at v0.77.0), not a
sheet. Confirm the labels inside it (Warehouse, Role) on the trial account before capture, and that the trial account
has a second warehouse to list.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp menu **Database > Session Context** đang mở trên một connection Snowflake dùng tài khoản trial, với
`COMPUTE_WH` được đánh dấu, phía dưới là kết quả một query trên dữ liệu mẫu `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1`. Không để
lộ account identifier, tên đăng nhập hay email trong khung hình. Chụp cả bản sáng và bản tối.

## mac-db-snowflake-session-mobile

### Purpose
Give phone readers a legible view of the Session Context submenu.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-snowflake-session`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the open Session Context submenu, from that capture.
- Operation and visible values: the Warehouse and Role entries and the checked `COMPUTE_WH`.
- Controls that must be visible: the open submenu.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-snowflake-session`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Centre the submenu; the checked
warehouse stays clear of the edges. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-snowflake-session` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-snowflake-session`. The proposed alt text names the warehouse and role chosen in
Session Context; the cut must show the Warehouse and Role entries with the check.

### Open evidence
None beyond `mac-db-snowflake-session`'s. Confirm the cut region once `mac-db-snowflake-session` is captured: the
submenu and its Warehouse list must fit in 343 pt; leave the result grid out if they do not fit together.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-snowflake-session`, lấy menu
con Session Context với các mục Warehouse, Role và `COMPUTE_WH` đang được đánh dấu. Cắt đúng kích thước gốc, không thu
nhỏ, để chữ vẫn đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-elasticsearch-console

### Purpose
Shows the Query DSL console: a search request typed as method, path and JSON body, and its hits returned as rows.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the Elasticsearch driver installed from the registry.
- Screen, panel and feature state: a query tab on an Elasticsearch connection, the request in the editor and the
  result grid below it.
- Engine and dataset: a single-node Elasticsearch 8.x in Docker with security on, reached over HTTPS with an API key
  as `es.acme.internal:9200`. Load a fictional `products` index (a few hundred documents with `name`, `category`,
  `price` and `in_stock`) from a bulk NDJSON file. Sample data only.
- Operation and visible values: `GET /products/_search` with the body
  `{ "query": { "match": { "name": "desk lamp" } } }`, just run. Legible: the request line and body, and the
  `_id`, `_index`, `_score`, `name` and `price` columns of the hits.
- Controls that must be visible: the run button and the result grid's headers.

### Framing
Detail crop of the editor and the top of the result grid. Focal area: the request line and the first hits. No added
text or arrows. On phones this slot shows its crop instead (`mac-db-elasticsearch-console-mobile`), so the focal area
must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites. The alt text names a GET _search request and hits shown as rows, so the
capture must show exactly that.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp console Query DSL trên một node Elasticsearch 8.x chạy trong Docker (bật bảo mật, kết nối HTTPS bằng API
key), với index mẫu `products` tự tạo. Chạy `GET /products/_search` với một query `match` và để các hit hiện thành
dòng bên dưới, thấy rõ `_id`, `_score`, `name` và `price`. Chụp cả bản sáng và bản tối.

## mac-db-elasticsearch-console-mobile

### Purpose
Give phone readers a legible view of the request and its first hits.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-elasticsearch-console`; nothing is captured separately, so
  the release, engine and data are identical.
- Screen, panel and feature state: the request in the editor and the top of the result grid, from that capture.
- Operation and visible values: the `GET /products/_search` line and body, and the `_id`, `_score` and `name` of the
  first hits.
- Controls that must be visible: the result grid's header row.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-elasticsearch-console`, so it is a 343 × 429
pt region and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the editor's left edge; keep
the request line clear of the top edge. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-elasticsearch-console` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-elasticsearch-console`. The proposed alt text names the GET _search request and the
hits as rows; the cut must show both.

### Open evidence
None beyond `mac-db-elasticsearch-console`'s. Confirm the cut region once `mac-db-elasticsearch-console` is captured:
the `_index` column may fall outside 343 pt; keep `_id`, `_score` and `name` inside.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-elasticsearch-console`, từ
mép trái editor, lấy dòng `GET /products/_search`, phần body và các hit đầu tiên. Cắt đúng kích thước gốc, không thu
nhỏ, để chữ vẫn đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-surrealdb-query

### Purpose
Shows a SurrealQL query and the records it returns, with record links and typed values in the grid.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the SurrealDB driver installed from the registry.
- Screen, panel and feature state: a query tab with the SurrealQL editor above and the result grid below; the sidebar
  shows the namespace `acme`, the database `blog` and its tables.
- Engine and dataset: SurrealDB 2.x started locally (`surreal start memory` with a root user), signed in at the Root
  level. A small sample graph: `person` records (`person:alice`, `person:bob`), `article` records, and a `wrote`
  relation table filled with `RELATE`.
- Operation and visible values: `SELECT id, name, ->wrote->article.title AS articles FROM person;` just run. Legible:
  the query text, record ids in the `table:id` form, and the `articles` column as JSON.
- Controls that must be visible: the sidebar's namespace and database, and the result grid's headers.

### Framing
Detail crop of the sidebar, editor and result grid. Focal area: the record ids and the `articles` column. No added
text or arrows. On phones this slot shows its crop instead (`mac-db-surrealdb-query-mobile`), so the focal area must
also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites. The editor shows SurrealQL without syntax colouring, which is correct for this
release; do not edit the image to add colour.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp một query SurrealQL trên SurrealDB 2.x chạy cục bộ, đăng nhập ở cấp Root, với dữ liệu mẫu nhỏ gồm `person`,
`article` và relation `wrote`. Kết quả phải thấy id dạng `person:alice` và cột `articles` dạng JSON. Editor không tô
màu cú pháp SurrealQL, đó là đúng với bản hiện tại. Chụp cả bản sáng và bản tối.

## mac-db-surrealdb-query-mobile

### Purpose
Give phone readers a legible view of the record ids and the related articles.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-surrealdb-query`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the query and the top of the result grid, from that capture.
- Operation and visible values: the query, the record ids in the `table:id` form and the start of the `articles`
  column.
- Controls that must be visible: the result grid's header row.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-surrealdb-query`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the editor's left edge; keep
the record ids clear of the edges. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-surrealdb-query` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-surrealdb-query`. The proposed alt text names a SurrealQL query and the records it
returned; the cut must show both.

### Open evidence
None beyond `mac-db-surrealdb-query`'s. Confirm the cut region once `mac-db-surrealdb-query` is captured: lay the
query out on two lines so it fits in 343 pt.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-surrealdb-query`, từ mép trái
editor, lấy câu query, các id record dạng `table:id` và phần đầu cột `articles`. Cắt đúng kích thước gốc, không thu
nhỏ, để chữ vẫn đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-teradata-sidebar

### Purpose
Shows that a Teradata connection lists stored procedures in the sidebar, with macros under Functions.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the Teradata driver installed from the registry.
- Screen, panel and feature state: the sidebar with a database expanded, showing its Tables, Views, Procedures and
  Functions groups, Procedures and Functions open. One macro is selected, and its source is open in the read-only
  source tab beside the sidebar.
- Engine and dataset: a Teradata Vantage test system, such as ClearScape Analytics Experience or Vantage Express,
  never a customer system. A `retail_demo` database with sample tables (`customers`, `orders`), a stored procedure
  `refresh_daily_sales` and a macro `top_customers` created for the capture.
- Operation and visible values: Legible: the group names, `refresh_daily_sales` under Procedures, `top_customers`
  under Functions, and the first lines of the macro's source.
- Controls that must be visible: the sidebar tree and the source tab's title.
- Use a fictional host name such as `teradata.acme.internal` for the connection; no real host or user name in frame.

### Framing
Detail crop of the sidebar and the left part of the source tab. Focal area: the Procedures and Functions groups. No
added text or arrows. On phones this slot shows its crop instead (`mac-db-teradata-sidebar-mobile`), so the focal area
must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; the group names stay in English in the copy.

### Open evidence
`docs/databases/teradata.mdx:66` at v0.77.0 still says macros and procedures are not listed. The code says they are,
since 0.68.0 (`TeradataObjectQueries.swift:13-41`). Confirm the macro's group label and
its "Table Kind: M" attribute at capture.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp sidebar của một connection Teradata (hệ thống thử nghiệm như ClearScape Analytics Experience hoặc Vantage
Express) với cơ sở dữ liệu mẫu `retail_demo` đang mở. Phải thấy procedure `refresh_daily_sales` trong nhóm Procedures
và macro `top_customers` trong nhóm Functions, kèm mã nguồn của macro ở tab bên cạnh. Chụp cả bản sáng và bản tối.

## mac-db-teradata-sidebar-mobile

### Purpose
Give phone readers a legible view of the Procedures and Functions groups.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-teradata-sidebar`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the sidebar tree with the Procedures and Functions groups open, from that capture.
- Operation and visible values: the group names, `refresh_daily_sales` under Procedures and `top_customers` under
  Functions.
- Controls that must be visible: the sidebar tree.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-teradata-sidebar`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the sidebar's left edge; the
source tab may be cut. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-teradata-sidebar` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-teradata-sidebar`. The proposed alt text names the stored procedures and the macros
under Functions; the cut must show both groups.

### Open evidence
None beyond `mac-db-teradata-sidebar`'s. Confirm the cut region once `mac-db-teradata-sidebar` is captured: nothing
else: the sidebar is narrower than 343 pt.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-teradata-sidebar`, từ mép
trái sidebar, lấy mục Procedures với `refresh_daily_sales` và mục Functions với `top_customers`. Cắt đúng kích thước
gốc, không thu nhỏ, để chữ vẫn đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-trino-catalogs

### Purpose
Shows one Trino query joining tables from two catalogs, and its result.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the Trino driver installed from the registry.
- Screen, panel and feature state: a query tab with the editor above and the result grid below; the sidebar shows the
  `tpch` and `memory` catalogs expanded to their schemas.
- Engine and dataset: Trino in Docker on `trino.acme.internal:8080`, with the built-in `tpch` catalog and a `memory`
  catalog. Create `memory.default.region_targets (regionkey bigint, target decimal(12,2))` and fill it with five sample
  rows.
- Operation and visible values:
  `SELECT r.name AS region, t.target FROM tpch.tiny.region r JOIN memory.default.region_targets t ON t.regionkey = r.regionkey ORDER BY r.name;`
  just run. Legible: both fully qualified table names in the query, and the `region` and `target` columns with exact
  decimal values.
- Controls that must be visible: the sidebar's two catalogs and the result grid's headers.

### Framing
Detail crop of the sidebar, editor and result grid. Focal area: the two catalog names in the query. No added text or
arrows. On phones this slot shows its crop instead (`mac-db-trino-catalogs-mobile`), so the focal area must also fit
in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites.

### Open evidence
The `memory` connector must accept CREATE TABLE and INSERT in the Docker image used; it does in Trino's default image.
Check before capture.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp một query Trino join table `tpch.tiny.region` với một table nhỏ tự tạo trong catalog `memory`, chạy Trino
bằng Docker. Phải thấy rõ hai tên table đầy đủ (catalog.schema.table) trong query, hai catalog trong sidebar, và kết quả
bên dưới. Chụp cả bản sáng và bản tối.

## mac-db-trino-catalogs-mobile

### Purpose
Give phone readers a legible view of the two catalogs in one query.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-trino-catalogs`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the query and the top of the result grid, from that capture.
- Operation and visible values: both fully qualified table names in the query, and the `region` and `target` columns.
- Controls that must be visible: the result grid's header row.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-trino-catalogs`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the editor's left edge; keep
both catalog names clear of the edges. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-trino-catalogs` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-trino-catalogs`. The proposed alt text names a query joining tables from two
catalogs and its results; the cut must show both.

### Open evidence
None beyond `mac-db-trino-catalogs`'s. Confirm the cut region once `mac-db-trino-catalogs` is captured: lay the query
out so each table name starts its own line and fits in 343 pt.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-trino-catalogs`, từ mép trái
editor, lấy câu query với hai tên table đầy đủ và các cột `region`, `target`. Cắt đúng kích thước gốc, không thu nhỏ,
để chữ vẫn đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-beancount-bql

### Purpose
Shows a Beancount ledger read as SQL tables in the sidebar, and a BQL query answered by rledger.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the Beancount driver installed from the registry and `rledger`
  on `PATH` (BQL needs it).
- Screen, panel and feature state: the sidebar listing the projected tables (`transactions`, `postings`, `accounts`,
  `balances` and the rest), and a query tab with a BQL query and its result.
- Engine and dataset: the fictional example ledger that `bean-example` generates (it ships with Python Beancount),
  saved as `example.beancount`. No real financial data.
- Operation and visible values:
  `BQL: SELECT date, payee, account, position WHERE account ~ 'Expenses:Food' ORDER BY date DESC LIMIT 20` just run.
  Legible: the `BQL:` prefix, the table names in the sidebar, and the date, payee, account and position columns.
- Controls that must be visible: the sidebar's table list and the result grid's headers.

### Framing
Detail crop of the sidebar, editor and result grid. Focal area: the `BQL:` line and the first result rows. No added
text or arrows. On phones this slot shows its crop instead (`mac-db-beancount-bql-mobile`), so the focal area must
also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; the table names are the projection's own and stay in English.

### Open evidence
Run the BQL statement in `rledger` from Terminal first to confirm that version accepts it; simplify the query if it
does not.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp một sổ cái Beancount mẫu (tạo bằng `bean-example`, không dùng dữ liệu tài chính thật) mở trong TablePro, với
danh sách table trong sidebar và kết quả của một query bắt đầu bằng `BQL:`. Máy cần cài `rledger` vì BQL chỉ chạy qua
nó. Chụp cả bản sáng và bản tối.

## mac-db-beancount-bql-mobile

### Purpose
Give phone readers a legible view of the BQL query and its first rows.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-beancount-bql`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the query and the top of the result grid, from that capture.
- Operation and visible values: the `BQL:` prefix, and the date, payee and account columns of the first rows.
- Controls that must be visible: the result grid's header row.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-beancount-bql`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the editor's left edge; keep
the `BQL:` line clear of the top edge. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-beancount-bql` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-beancount-bql`. The proposed alt text names a BQL query and its result; the cut
must show both.

### Open evidence
None beyond `mac-db-beancount-bql`'s. Confirm the cut region once `mac-db-beancount-bql` is captured: the position
column may fall outside 343 pt; keep date, payee and account inside.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-beancount-bql`, từ mép trái
editor, lấy dòng `BQL:` và các cột date, payee, account của những dòng đầu. Cắt đúng kích thước gốc, không thu nhỏ, để
chữ vẫn đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.

## mac-db-kafka-consume

### Purpose
Shows a Kafka topic read with KafkaQL: messages as rows by partition and offset, never as an editable table.

### Scene
- Platform and release: Mac, TablePro 0.77.0, with the Kafka driver installed from the registry.
- Screen, panel and feature state: a query tab with a KafkaQL statement above and the messages below; the sidebar
  lists the cluster's topics with `orders` selected.
- Engine and dataset: a single-broker Kafka in KRaft mode in Docker (the `apache/kafka` image) on
  `kafka.acme.internal:9092`, PLAINTEXT. A topic `orders` with three partitions, filled with a few hundred fictional
  JSON order events keyed `order-1001`, `order-1002` and so on.
- Operation and visible values: `CONSUME "orders" FROM NEWEST LIMIT 100` just run. Legible: the statement, and the
  partition, offset, timestamp, key and value columns, with messages from more than one partition.
- Controls that must be visible: the sidebar's topic list and the result grid's headers.

### Framing
Detail crop of the sidebar, editor and result grid. Focal area: the partition and offset columns beside the keys. No
added text or arrows. On phones this slot shows its crop instead (`mac-db-kafka-consume-mobile`), so the focal area
must also fit in that 343 × 429 pt region.

### Light and dark
Both variants from the same frame: switch the macOS appearance, not only the app theme.

### Locale
One English capture serves both sites; KafkaQL and the column names stay in English.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp một câu lệnh KafkaQL `CONSUME "orders" FROM NEWEST LIMIT 100` trên Kafka chạy bằng Docker (một broker, chế
độ KRaft), với topic `orders` có ba partition chứa các message JSON giả lập. Kết quả phải thấy rõ các cột partition,
offset, key và value, có message từ nhiều partition. Chụp cả bản sáng và bản tối.

## mac-db-kafka-consume-mobile

### Purpose
Give phone readers a legible view of the messages by partition and offset.

### Scene
- Platform and release: the same 2× Mac capture as `mac-db-kafka-consume`; nothing is captured separately, so the
  release, engine and data are identical.
- Screen, panel and feature state: the statement and the top of the result grid, from that capture.
- Operation and visible values: the `CONSUME` statement, and the partition, offset and key columns with messages from
  more than one partition.
- Controls that must be visible: the result grid's header row.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the 2× capture of `mac-db-kafka-consume`, so it is a 343 × 429 pt
region and the Mac text keeps its real size on a phone. Do not scale the cut. Start at the editor's left edge; keep
the partition and offset columns clear of the edges. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark captures of `mac-db-kafka-consume` at the same coordinates.

### Locale
Shared by both sites, like `mac-db-kafka-consume`. The proposed alt text names the CONSUME statement and the messages
by partition, offset, key and value; the cut must show the statement and the partition, offset and key columns.

### Open evidence
None beyond `mac-db-kafka-consume`'s. Confirm the cut region once `mac-db-kafka-consume` is captured: the timestamp
and value columns may fall outside 343 pt; move key next to offset if it does not fit.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-db-kafka-consume`, từ mép trái
editor, lấy câu lệnh `CONSUME` và các cột partition, offset, key. Cắt đúng kích thước gốc, không thu nhỏ, để chữ vẫn
đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.
