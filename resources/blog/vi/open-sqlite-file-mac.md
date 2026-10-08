---
slug: open-sqlite-file-mac
title: "Cách mở và query file SQLite trên Mac"
description: Mở file .db hoặc .sqlite bằng shell sqlite3 có sẵn trên macOS, hoặc trong TablePro, và cách xử lý khi macOS hay một lock không cho mở file.
date: 2026-10-08
author: TablePro Team
ogPunchline: sqlite3 trong Terminal, hoặc kéo file vào TablePro.
tags: [sqlite, database-files, sql-editor]
---

Một cơ sở dữ liệu SQLite là một file. Không có server nào để khởi động và không có user nào để đăng nhập, nên "kết nối" ở đây nghĩa là mở file. macOS có sẵn một shell dòng lệnh làm được việc đó, còn GUI thì thêm phần duyệt table và editor.

## Kiểm tra xem file có phải SQLite không {#check-the-file}

Phần mở rộng không nói lên điều gì. Nhiều định dạng khác cũng dùng `.db`, và không ít file SQLite chẳng có phần mở rộng nào. Hãy hỏi chính file đó:

```bash
file ~/Downloads/app.db
```

Một cơ sở dữ liệu SQLite bắt đầu bằng các byte `SQLite format 3`, và `file` báo đúng như vậy.

Nếu trong thư mục còn có `app.db-wal` và `app.db-shm` thì chúng thuộc về cơ sở dữ liệu đó. Những lần ghi gần đây có thể vẫn nằm trong file `-wal`, nên hãy sao chép hoặc di chuyển cả ba file cùng nhau.

## Mở bằng sqlite3 {#sqlite3}

```bash
sqlite3 ~/Downloads/app.db
```

Trong shell, các lệnh bắt đầu bằng dấu chấm dùng để xem xét file, còn lại là SQL:

```text
.tables
.schema users
.headers on
.mode column
SELECT id, email FROM users LIMIT 10;
.quit
```

Để chỉ xem mà chắc chắn không ghi gì, hãy mở ở chế độ chỉ đọc: `sqlite3 -readonly ~/Downloads/app.db`.

Một vài cơ sở dữ liệu đáng biết trên máy Mac:

| Nguồn | Đường dẫn |
|---|---|
| Rails | `db/development.sqlite3` trong dự án |
| Django | `db.sqlite3` trong dự án |
| iOS Simulator | Dưới `~/Library/Developer/CoreSimulator/Devices/`, trong data container của ứng dụng |
| Lịch sử Safari | `~/Library/Safari/History.db` |
| Tin nhắn | `~/Library/Messages/chat.db` |

Hai mục cuối nằm trong thư mục được macOS bảo vệ. Xem phần [Nếu không mở được](#troubleshooting).

## Mở trong TablePro {#in-tablepro}

Cách nào sau đây cũng mở được file:

- Kéo file vào một cửa sổ TablePro hoặc vào biểu tượng trên Dock.
- Chọn **Tệp > Mở tệp…** (File > Open File…, `Cmd+O`) rồi chọn file.
- Trong Finder, bấm chuột phải vào file và chọn **Mở bằng > TablePro** (Open With > TablePro). Các file có đuôi `.db`, `.db3`, `.s3db`, `.sl3`, `.sqlite`, `.sqlite3` và `.sqlitedb` có TablePro trong danh sách đó.

Cơ sở dữ liệu lưu dưới tên khác cũng mở được, bằng cách kéo thả hoặc qua **Mở tệp…**. TablePro đọc những byte đầu tiên của file để quyết định, giống như lệnh `file`.

Để giữ file trong danh sách connection:

1. Bấm **Kết nối mới…** (New Connection…) trên cửa sổ chào mừng, hoặc bấm `Cmd+N`, rồi chọn **SQLite**.
2. Bấm **Duyệt…** (Browse…) và chọn file. Không có host, port hay mật khẩu nào cần điền.
3. Bấm **Lưu & kết nối** (Save & Connect).

Nút **New…** bên cạnh **Duyệt…** dùng để đặt tên cho một file chưa tồn tại. File được tạo khi bạn kết nối, và bạn có ngay một cơ sở dữ liệu trống để thử nghiệm.

Chưa có file nào trong tay? **Trợ giúp > Mở cơ sở dữ liệu mẫu** (Help > Open Sample Database) mở một cơ sở dữ liệu SQLite đi kèm ứng dụng để bạn thử.

TablePro dùng bản SQLite đi kèm ứng dụng, nên phiên bản thư viện có sẵn trong macOS của bạn không quan trọng.

## Duyệt và query {#browse-and-query}

Sidebar liệt kê các table và view của file, bỏ qua các table nội bộ `sqlite_*`. Bấm vào một table để xem các dòng của nó, và chuyển sang **Cấu trúc** (Structure) để xem cột, index, khóa ngoại và DDL.

Bấm `Cmd+T` để mở một tab query và `Cmd+Enter` để chạy câu lệnh tại vị trí con trỏ:

```sql
SELECT name, sql FROM sqlite_master WHERE type = 'table';

PRAGMA table_info(users);

SELECT strftime('%Y-%m', created_at) AS month, count(*)
FROM users
GROUP BY month
ORDER BY month;
```

Để query thêm một file thứ hai bên cạnh file đầu, hãy attach nó:

```sql
ATTACH '/Users/me/Downloads/other.db' AS other;
SELECT * FROM other.orders LIMIT 10;
```

Các chỉnh sửa trong data grid là thay đổi đang chờ lưu. Chưa có gì được ghi cho tới khi bạn lưu, và **Xem trước SQL** (Preview SQL, `Cmd+Shift+P`) cho bạn xem các câu lệnh trước.

Nếu một chương trình khác thay đổi file, danh sách table tự nạp lại. Những dòng đã nạp trong một tab giữ nguyên cho tới khi bạn làm mới tab đó.

## File nằm trên server {#remote-file}

File SQLite trên một máy bạn tới được qua SSH mở được mà không cần tự sao chép về. Trong form connection, mở tab **Mạng** (Network) và đặt **Connect via** thành **Tệp cơ sở dữ liệu từ xa** (Remote Database File), rồi điền **Đường dẫn** (Path) trên server cùng thông tin SSH. Menu **Mở** (Open) có hai lựa chọn:

- **On the Server** chạy câu lệnh của bạn ngay trên server, trên file đang dùng. Server cần có `python3`.
- **As a Read-Only Copy** sao chép file về máy Mac và mở bản sao ở chế độ chỉ đọc. File gốc không bao giờ bị ghi.

## Giới hạn {#limits}

- File cơ sở dữ liệu được mã hóa không mở được. Hãy giải mã file trước bằng chính công cụ đã mã hóa nó.
- Mỗi connection là một file. Cơ sở dữ liệu được attach query được dưới dạng `alias.table`, nhưng không hiện trong sidebar.
- `ALTER TABLE` của SQLite đổi tên được table hoặc cột, thêm và bỏ được cột. Các thay đổi cấu trúc khác, như đổi kiểu cột hay thêm khóa ngoại, được thực hiện bằng cách dựng lại table. TablePro hiện toàn bộ script đó và chỉ chạy khi bạn xác nhận.
- Không thêm, bỏ hay di chuyển được khóa chính.
- Cơ sở dữ liệu tạo bằng extension như sqlite-vec hay SpatiaLite không đọc được cho tới khi extension đó được thêm vào connection, trong tab **Tùy chọn** (Options).

## Nếu không mở được {#troubleshooting}

- **unable to open database file**: đường dẫn sai, hoặc thư mục đó ứng dụng không được phép đọc. Các file dưới `~/Library`, như cơ sở dữ liệu của Safari và Tin nhắn, cần quyền Full Disk Access (Truy cập toàn bộ ổ đĩa): bật quyền này cho TablePro, hoặc cho Terminal nếu bạn dùng `sqlite3`, trong phần Quyền riêng tư & Bảo mật của Cài đặt hệ thống, rồi mở lại ứng dụng.
- **database is locked**: một tiến trình khác đang giữ write lock. Hãy thoát ứng dụng sở hữu file đó.
- **file is not a database**: file bị mã hóa hoặc không phải SQLite. Chạy lại lệnh `file` với nó.

Tài liệu mô tả extension, file từ xa và mọi thông báo lỗi ở [trang SQLite](https://docs.tablepro.app/databases/sqlite) (tiếng Anh). Trên trang này, [trang client SQLite](/vi/sqlite-client) liệt kê những gì TablePro làm được với một cơ sở dữ liệu SQLite, còn mục [File cũng là cơ sở dữ liệu](/vi/features/import-export#files) nói về các loại file khác: DuckDB đọc file Parquet và CSV như các view chỉ đọc, còn file CSV, JSON và Excel mở trong một cửa sổ riêng.
