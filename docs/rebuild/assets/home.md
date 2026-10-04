# Homepage

The homepage (`/` and `/vi`) owns two slots: the hero window and its phone crop. Every other image on the homepage is
a feature or iPhone slot reused from its own page (`mac-query-autocomplete`, `mac-edit-preview-sql`,
`mac-compare-sync-structure`, `mac-data-files-window`, `mac-connection-ssh-form`, `mac-safe-mode-touchid`,
`mac-ai-chat`, `ios-connection-list`), and its brief lives in that family's fragment.

The hero is the page's only priority image. Once it is supplied, the home controller's `lcpAsset` preloads the
variant the reader's theme shows; while it is a placeholder, nothing is requested.

Trang chủ có hai ảnh riêng: cửa sổ TablePro ở phần đầu trang và bản cắt của nó cho điện thoại. Các ảnh khác trên trang
chủ dùng lại ảnh của trang tính năng và trang iPhone, nên mô tả nằm ở các file tương ứng.

## mac-hero-window

### Purpose
Show at first glance that TablePro is a native Mac database client: a real window with a connection, a query and its
results, on free features only.

### Scene
- Platform and release: Mac, TablePro 0.77.0. Nothing in the frame is 0.77-only, so the image stays true for every
  published build.
- Screen, panel and feature state: the main connection window, sidebar open on the connection's tables with `orders`
  selected, one SQL editor tab above the result grid. No sheet, popover, AI pane or Safe Mode prompt is open, and no
  paid feature (Query Insights, Result Charts, Compare & Sync) is visible.
- Engine and dataset: PostgreSQL with the `shop` sample schema (users, products, orders, order_items, reviews, tags,
  product_tags, activity_log), loaded into a local PostgreSQL server. Sample data only; never a real connection or
  customer data. Name the connection `shop` and give it the `local` tag, so no production colour appears.
- Operation and visible values: a short query on `orders`, already run, for example:

  ```sql
  SELECT o.id, u.email, o.status,
         o.total, o.created_at
  FROM orders o
  JOIN users u ON u.id = o.user_id
  ORDER BY o.created_at DESC
  LIMIT 50;
  ```

  The result grid is filled, with the row count visible. Keep each editor line
  under about 40 characters so the start of every line fits in the phone crop.
- Controls that must be visible: the native traffic lights in colour, the toolbar with the connection name, the
  sidebar, the editor's gutter run markers and the result grid's column headers.

### Framing
Full window, 1216 × 684 pt on a 2× display, captured with `screencapture -w -o` (docs/screenshots.md), so the
rounded corners arrive as alpha and no shadow is baked in. The focal area is the editor and the first result rows.
Both must fit inside the region the phone crop cuts (343 × 429 pt from the editor's top-left, see
`mac-hero-window-mobile`), so start the query on the first editor line and keep the result grid's first columns
next to the sidebar edge. No text overlays and no arrows.

### Light and dark
Two captures of the same frame: switch the macOS appearance (System Settings > Appearance), not only the app theme,
so the window chrome matches. Same window size, same scroll position, same rows.

### Locale
One English app capture serves both sites: the copy keeps the English UI terms (spec §0), and the Mac app's
Vietnamese translation is partial, so a Vietnamese capture would mix both languages. The proposed alt text names the
`orders` table in the sidebar, a query in the SQL editor and its result rows below; the capture must show all three.

### Open evidence
- Load the `shop` schema (`demo/schema.postgres.sql`) into a local PostgreSQL server and seed enough orders for a
  full grid before capturing; use it only as a dataset.
- The query shows `u.email`, and the sample addresses use real-looking third-party domains. Rewrite them to
  `@example.com` first (capture rules, "shop emails").
- The previous hero (`/images/app-light.png`, `/images/app-dark.png`) shows the Chinook SQLite sample. It is kept as
  source material, but the new scene is a different engine and dataset, so it is not reused as is.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn chụp cửa sổ chính của TablePro 0.77.0 trên Mac, kết nối tới cơ sở dữ liệu PostgreSQL mẫu `shop` (connection tên
`shop`, tag `local`), sidebar đang chọn table `orders`, trong SQL editor có một query ngắn trên `orders` đã chạy xong và
data grid hiển thị kết quả. Chụp ở kích thước 1216 × 684 pt trên màn hình 2×, hai bản Sáng và Tối với cùng khung hình.
Đặt câu query và vài dòng kết quả đầu tiên ở góc trên bên trái để bản cắt cho điện thoại vẫn đọc được. Đây là ảnh quan
trọng nhất của trang chủ, nên chỉ dùng các tính năng không cần gói trả phí và dữ liệu mẫu.

## mac-hero-window-mobile

### Purpose
Give phone readers a legible view of the same hero: the query and its first result rows at the Mac's real text size.

### Scene
- Platform and release: the same Mac 0.77.0 capture as `mac-hero-window`; nothing is captured separately.
- Screen, panel and feature state: the SQL editor and the top of the result grid from that capture.
- Engine and dataset: PostgreSQL `shop`, as in the window.
- Operation and visible values: the whole `SELECT … FROM orders` query and at least the first five result rows, with
  their column headers.
- Controls that must be visible: the editor's gutter run marker on the first line and the grid's header row.

### Framing
A detail cut, 686 × 858 px (4:5) at native pixels from the 2× window capture, so it is a 343 × 429 pt region and the
text keeps its real size. Start at the editor's top-left edge; include the editor and the first result rows below it.
Do not scale the cut. No text overlays and no arrows.

### Light and dark
Cut both variants from the light and dark window captures at the same coordinates.

### Locale
Shared by both sites, like the window. The proposed alt text names the SQL editor with a query on the `orders` table
and the first rows of its result; the cut must show both.

### Open evidence
The same as `mac-hero-window`: the `shop` schema must be loaded first. Confirm the cut region once the window is captured, since the editor's position depends on the sidebar width.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Bạn không cần chụp thêm: hãy cắt một vùng 686 × 858 px (tỉ lệ 4:5) từ ảnh 2× của `mac-hero-window`, bắt đầu từ góc trên
bên trái của SQL editor, sao cho thấy trọn câu query và ít nhất năm dòng kết quả đầu tiên cùng tiêu đề cột. Cắt ở đúng
kích thước gốc, không thu nhỏ, để chữ vẫn đọc được trên điện thoại. Làm cho cả bản Sáng và Tối, cùng tọa độ cắt.
