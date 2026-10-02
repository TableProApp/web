# iPhone and iPad screens

These screens illustrate `/ios` (and `ios-connection-list` also the homepage's platform section). Every one of them must
show **TablePro for iPhone and iPad 1.0 (build 22), the App Store release**, not a build from `main`: the commits to
`TableProMobile/` that landed after build 22 are not on the App Store. Install the app from the App Store on the
capture device, or archive commit `232e8dae6`.

Things the 1.0 build does not do, so no screen may show them: the table list beside the open table on iPad, eight
fields per row card, the jump-host refusal message, browsing Redis keys, and an iPhone Duo or visionOS frame.

Common to every screen:

- Pin the status bar with `xcrun simctl status_bar booted override --time 09:41 --batteryState charged --batteryLevel 100`
  (or set the same on a device). No carrier name, no notifications.
- Sample data only. Chinook is the sample database that comes with the app (**More > Open Sample Database**, or the
  button on an empty list). Server connections use fictional hosts under `acme.internal`. Never a real host, username
  or customer row.
- The app in English. The 1.0 app is about 96% translated into Vietnamese (its string catalog at build 22), so a
  per-locale capture is possible, unlike on the Mac (about 63%). The site still uses English
  captures, because spec §0 keeps the English UI terms in the Vietnamese copy and one capture then serves both sites.
  If a Vietnamese capture is ever wanted, `ios-connection-list` is the candidate: its labels are short and it is the
  first image on `/vi/ios`; it would become a `per-locale` entry.
- Light appearance. The manifest marks these screens `single`: one image serves both themes.

## ios-connection-list

### Purpose
Shows what someone with several databases sees on opening the app: their connections organized the way they work.

### Scene
- Platform and release: iPhone, TablePro 1.0 (build 22) from the App Store.
- Screen: the connection list, scrolled to the top, search field visible.
- Favorites: "Chinook Sample" plus two fictional connections, `Events` (PostgreSQL, `events-db.acme.internal`) and
  `Orders` (MySQL, `orders-db.acme.internal`).
- A group "Production", expanded, with three connections, each carrying one tag (`production`, `staging`, `local`)
  so the tag colors show.
- Engine icons visible on each row: at least PostgreSQL, MySQL, SQLite and Redis.
- No connection named after a real company, no real hostname.

### Framing
The whole iPhone screen at the manifest's phone size. Keep the navigation title, the search field and the first group
clear of the Dynamic Island area.

### Light and dark
One light capture. It also serves the dark theme.

### Locale
English app. The Vietnamese alt text in the manifest describes the same screen.

### Open evidence
None. The layout (Favorites, groups, tags, search) matches the App Store listing's first screenshot.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp danh sách connection trên iPhone ở bản 1.0 từ App Store: mục Favorites có Chinook Sample và hai connection giả
lập trên `acme.internal`, nhóm Production đang mở với các connection gắn tag. Đây là ảnh đầu tiên trên trang `/ios` và
trên trang chủ, nên cần gọn và rõ ràng.

## ipad-table-browse

### Purpose
Shows that the app runs on iPad as a full-screen table browser, not a scaled-up phone screen.

### Scene
- Platform and release: iPad Pro 13-inch, landscape, TablePro 1.0 (build 22).
- Screen: the Chinook `Track` table open from the Tables tab, row cards filling the screen, the tab bar visible.
- Each card shows the 1.0 layout: the title column and up to three more fields. **Do not** capture the table list
  beside the browser or eight-field cards; both are only in builds after 1.0.
- A hardware keyboard may be attached, but show no shortcut overlay.

### Framing
The whole iPad screen, landscape, at the manifest's iPad size. Keep the first two rows of cards fully visible. On
phones this slot shows its crop instead (`ipad-table-browse-mobile`), so the focal area must also fit in that 343 ×
429 pt region.

### Light and dark
One light capture.

### Locale
English app.

### Open evidence
Confirm on the 1.0 build that the Tables tab opens a single table full width on iPad (the App Store listing's iPad
screenshots show this layout).

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp iPad nằm ngang đang mở table `Track` của Chinook, các dòng hiển thị dạng thẻ theo bố cục của bản 1.0. Không
chụp danh sách table nằm cạnh table đang mở, vì tính năng đó chưa có trên App Store.

## ipad-table-browse-mobile

### Purpose
Give phone readers a legible view of the iPad table browser: the first row cards at their real size.

### Scene
- Platform and release: the same iPad capture as `ipad-table-browse` (TablePro 1.0, build 22); nothing is captured
  separately.
- Screen, panel and feature state: the top-left of the iPad screen from that capture: the `Track` title and the first
  row cards.
- Operation and visible values: the navigation title and at least two whole row cards, each with its title column and
  fields.
- Controls that must be visible: none beyond the title and the cards.

### Framing
A 686 × 858 px cut (4:5) at native pixels from the iPad capture of `ipad-table-browse` (a 2× display), so it is a 343
× 429 pt region and the iPad text keeps its real size on a phone. Do not scale the cut. Start below the status bar at
the screen's left edge; keep the first two cards whole. No text overlays and no arrows.

### Light and dark
One light cut, like `ipad-table-browse`.

### Locale
Shared by both sites, like `ipad-table-browse`. The proposed alt text names rows of the Chinook Track table as cards;
the cut must show at least two whole cards.

### Open evidence
None beyond `ipad-table-browse`'s. Confirm the cut region once `ipad-table-browse` is captured: the cards must be
narrow enough that two fit whole in 343 pt of width; if one card is wider, keep one whole card and the start of the
next.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh iPad của `ipad-table-browse`, bắt đầu ngay
dưới thanh trạng thái ở mép trái màn hình, lấy tiêu đề `Track` và ít nhất hai thẻ dòng trọn vẹn. Cắt đúng kích thước
gốc, không thu nhỏ, để chữ vẫn đọc được trên điện thoại. Chỉ cần một bản (giao diện sáng), như ảnh gốc.

## ios-table-browse

### Purpose
Proves the browsing workflow on a phone: filter, read rows as cards, move through pages.

### Scene
- Platform and release: iPhone, TablePro 1.0 (build 22).
- Screen: the Chinook `Track` table with one filter active, `GenreId = 1`, the filter icon filled.
- Row cards with the track name as the title and Composer, Milliseconds and UnitPrice under it.
- The page bar at the bottom showing the page range, for example "1–100 of …".

### Framing
The whole screen. The filter state and the page bar must both be legible.

### Light and dark
One light capture.

### Locale
English app.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp table `Track` của Chinook trên iPhone với một bộ lọc theo thể loại (`GenreId = 1`), các dòng dạng thẻ và thanh
phân trang ở dưới. Ảnh minh họa việc xem và lọc dữ liệu trên điện thoại.

## ios-row-edit

### Purpose
Shows that a row can be corrected from the phone, with NULL handled explicitly.

### Scene
- Platform and release: iPhone, TablePro 1.0 (build 22).
- Screen: a Chinook `Track` row open in Edit, before saving. Composer set to NULL (the NULL state visible on the
  field), the other fields short values.
- The foreign-key rows `AlbumId` and `MediaTypeId` visible, showing that they link to the related rows.
- Do not show a long or binary value being edited: the 1.0 row editor can save a truncated value over the real one
  (fixed after 1.0, #3177), so the site makes no promise about long values.

### Framing
The whole screen, with the Save control and the Composer field both visible.

### Light and dark
One light capture.

### Locale
English app.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp một dòng của table `Track` đang ở chế độ sửa: cột Composer đặt NULL, thấy được liên kết tới album. Chỉ dùng giá
trị ngắn; không chụp cảnh sửa giá trị dài hoặc nhị phân.

## ios-query

### Purpose
Shows that real SQL runs on the phone, with highlighted input and readable results.

### Scene
- Platform and release: iPhone, TablePro 1.0 (build 22), Chinook Sample connection, Query tab.
- Query: `SELECT g.Name, COUNT(*) AS Tracks FROM Track t JOIN Genre g ON g.GenreId = t.GenreId GROUP BY g.Name ORDER BY Tracks DESC;`
- Syntax highlighting visible in the editor; the results below as cards with the row count.
- The keyboard dismissed.

### Framing
The whole screen. Keep the full query and at least the first three result cards visible.

### Light and dark
One light capture.

### Locale
English app.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp tab Query trên iPhone với một query `GROUP BY` đếm số track theo thể loại trên Chinook, kết quả hiển thị bên
dưới. Ẩn bàn phím để thấy rõ cả query và kết quả.

## ios-live-activity

### Purpose
Shows a feature only a phone app has: a long query's progress on the Lock Screen.

### Scene
- Platform and release: iPhone, TablePro 1.0 (build 22).
- Screen: the Lock Screen with the TablePro Live Activity for a running query: the connection name, the one-line
  query preview, the elapsed time and the status line, which reads **Running**.
- Dataset: a fictional PostgreSQL connection (`analytics-db.acme.internal`, or a local server) running a slow query
  such as `SELECT count(*) FROM generate_series(1, 200000000);`, so the activity stays in the running state. A
  Chinook query finishes too fast.
- The status line shows a row count only once rows arrive, and this query returns its one row at the end, so the
  capture shows **Running**, not a count. Do not stage a row count: the description and alt text name the Running
  status.
- The SQL preview shows (Settings > Live Activities > Hide Query stays off); it is the query above, with no real table
  names.

### Framing
The Lock Screen with the clock and the Live Activity. No notifications.

### Light and dark
One capture. The Lock Screen wallpaper should be a plain system wallpaper.

### Locale
English app.

### Open evidence
At build 22 (`232e8dae6`), `TableProWidget/QueryLiveActivityWidget.swift` shows a row count only when
`rowsStreamed > 0` and "Running" otherwise; `rowsStreamed` follows the rows already received
(`Views/QueryEditorView.swift`). A `count(*)` query therefore reads Running until it ends.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp Màn hình khóa khi một query chạy lâu (ví dụ `generate_series` trên PostgreSQL giả lập) đang hiển thị dạng Hoạt
động trực tiếp, với tên connection, phần đầu câu query, thời gian đã chạy và trạng thái Running. Query này chỉ trả về
một dòng khi xong, nên Hoạt động trực tiếp hiện Running chứ không hiện số dòng. Dùng hình nền mặc định, không có thông
báo.

## ios-connection-form

### Purpose
Shows that a phone connection can be as safe as a desktop one: read-only, TLS and an SSH tunnel.

### Scene
- Platform and release: iPhone, TablePro 1.0 (build 22).
- Screen: the New Connection form for PostgreSQL, scrolled so these are visible: Organization with Safe Mode set to
  Read-Only; Server with host `orders-db.acme.internal` and a fictional username; SSL set to Verify Identity; SSH
  Tunnel on with a host `bastion.acme.internal` and Private Key authentication.
- No password typed in, no real key material visible.
- No jump host field or message: 1.0 has none.

### Framing
The whole screen. If everything does not fit, prefer Safe Mode, SSL and SSH over the host and port.

### Light and dark
One light capture.

### Locale
English app.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp form tạo connection PostgreSQL trên iPhone: Safe Mode ở mức Read-Only, SSL ở Verify Identity, SSH tunnel bằng
private key tới `bastion.acme.internal`. Không nhập mật khẩu thật, không có jump host.

## ios-safe-mode-confirm

### Purpose
Shows Safe Mode stopping a write before it runs.

### Scene
- Platform and release: iPhone, TablePro 1.0 (build 22).
- Connection: a copy of Chinook (or a fictional server) set to Confirm Writes.
- Screen: the Query tab with `UPDATE Track SET UnitPrice = 1.29 WHERE GenreId = 1;` and the "Execute Write Query?"
  confirmation open over it.

### Framing
The whole screen. The confirmation and the statement behind it must both be legible.

### Light and dark
One light capture.

### Locale
English app.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp hộp thoại "Execute Write Query?" của chế độ Confirm Writes hiện ra trước khi chạy một câu `UPDATE` trên bản sao
Chinook. Ảnh cho thấy Safe Mode chặn lệnh ghi trước khi nó chạy.

## ipad-two-windows

### Purpose
Shows that iPad can keep two TablePro windows open at once.

### Scene
- Platform and release: iPad Pro 13-inch, landscape, TablePro 1.0 (build 22), Stage Manager on.
- Two TablePro windows: one with the Chinook `Track` table, the other with the Query tab and a short query on
  `Invoice`.
- Both windows from the same app, each on a different table, as the manifest describes.

### Framing
The whole iPad screen. Both windows fully on screen, neither overlapping the other's content more than its title.

### Light and dark
One light capture.

### Locale
English app.

### Open evidence
Confirm on the 1.0 build that a second window opens through Stage Manager (the app supports multiple scenes and has
no in-app "New Window" command).

### Manifest changes
None. The description already uses the Stage Manager wording the sitemap asked for.

### Tóm tắt cho chủ sở hữu
Chụp iPad bật Stage Manager với hai cửa sổ TablePro cùng mở: một cửa sổ là table `Track`, cửa sổ kia là tab Query
với một query ngắn trên `Invoice`. Mở cửa sổ thứ hai bằng Stage Manager của iPadOS.

## ios-widgets

### Purpose
Shows the Quick Connect widgets that open a connection from the Home Screen.

### Scene
- Platform and release: iPhone Home Screen, TablePro 1.0 (build 22).
- One small and one medium Quick Connect widget, showing the fictional connections from `ios-connection-list`.
- A plain system wallpaper, no other third-party app icons in view if possible.

### Framing
The Home Screen with both widgets near the top. No notifications or badges.

### Light and dark
One light capture.

### Locale
English app and an English system language.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp Màn hình chính của iPhone với tiện ích Quick Connect cỡ nhỏ và cỡ vừa, hiển thị các connection giả lập. Dùng
hình nền mặc định và tránh biểu tượng ứng dụng khác.

## ios-shortcuts-add-rows

### Purpose
Shows that Shortcuts can add rows to a table without opening the app.

### Scene
- Platform and release: iPhone, the Shortcuts app, TablePro 1.0 (build 22) installed.
- A shortcut with TablePro's **Add Rows to Table** action: Connection `Events` (fictional), Table `signups`, Rows set
  to short CSV text with a header line and two rows (fictional names and dates).
- The CSV must be UTF-8 with LF line endings; 1.0 does not read CRLF.

### Framing
The Shortcuts editor with the whole action visible.

### Light and dark
One light capture.

### Locale
English system language, so the action names read as on the site.

### Open evidence
None.

### Manifest changes
Applied. The Vietnamese alt names the action as the capture shows it, "Add Rows to Table": captures keep the English UI, and "bảng" reads as a database table. The request, kept for the record:
- `ios-shortcuts-add-rows` → `alt.en`: "The Shortcuts editor with TablePro's Add Rows to Table action set to add CSV
  rows to a table." `alt.vi`: "Trình chỉnh sửa Phím tắt với tác vụ Thêm nhiều dòng vào bảng (Add Rows to Table) của
  TablePro, được thiết lập để thêm các dòng CSV vào một table." The action is named "Add Rows to Table" in the app, not "Add
  Rows".

### Tóm tắt cho chủ sở hữu
Chụp ứng dụng Phím tắt với tác vụ Add Rows to Table của TablePro, thêm vài dòng CSV giả lập vào table `signups` của
connection `Events`. CSV dùng UTF-8 và xuống dòng kiểu LF.

## ios-settings-privacy

### Purpose
Shows the privacy defaults the page states: usage data off, and the app lock and iCloud Sync as the reader's choices.

### Scene
- Platform and release: iPhone, TablePro 1.0 (build 22), the app's Settings.
- Security: the Face ID lock on, Auto-Lock visible.
- iCloud: iCloud Sync on, Sync Passwords off.
- Privacy: Share Usage Data **off**.
- Live Activities: Hide Query visible if it fits.

### Framing
The whole Settings screen, scrolled so Security, iCloud and Privacy are all visible.

### Light and dark
One light capture.

### Locale
English app.

### Open evidence
None.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Chụp màn hình Cài đặt của ứng dụng trên iPhone: khóa Face ID bật, iCloud Sync bật, Sync Passwords tắt, và Share Usage
Data tắt. Ảnh minh họa mục Quyền riêng tư của trang `/ios`.
