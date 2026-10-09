---
slug: import-csv-postgresql-mysql
title: "Import file CSV vào PostgreSQL hoặc MySQL"
description: Nạp CSV bằng \copy của PostgreSQL, LOAD DATA của MySQL hoặc TablePro. Ghép cột, tạo table từ file và chọn cách xử lý lỗi.
date: 2026-10-08
author: TablePro
ogPunchline: \copy, LOAD DATA, hoặc import có ghép cột.
tags: [postgresql, mysql, import, data-files]
---

Dùng `\copy` của PostgreSQL, `LOAD DATA` của MySQL hoặc TablePro để import dòng CSV. Công cụ dòng lệnh cần table khớp trước; TablePro còn tạo được table từ file.

## PostgreSQL: \copy {#postgresql}

Tạo table, rồi nạp file từ `psql`:

```sql
CREATE TABLE orders (
  id integer PRIMARY KEY,
  customer text,
  total numeric(10, 2),
  ordered_at date
);
```

```text
\copy orders (id, customer, total, ordered_at) FROM 'orders.csv' WITH (FORMAT csv, HEADER true)
```

`\copy` là lệnh của `psql`, không phải SQL. Lệnh này đọc file trên máy Mac và stream lên server, nên dùng được với cơ sở dữ liệu ở xa hoặc dịch vụ hosted. Câu lệnh SQL `COPY orders FROM '/path/orders.csv'` thì đọc một đường dẫn trên chính server cơ sở dữ liệu, và cần quyền superuser hoặc role `pg_read_server_files`.

Vài tùy chọn hữu ích trong danh sách `WITH`: `DELIMITER ';'` cho file dùng dấu chấm phẩy, `NULL ''` để đọc trường rỗng thành NULL, và `ENCODING 'LATIN1'` cho file không phải UTF-8.

## MySQL: LOAD DATA LOCAL INFILE {#mysql}

```sql
LOAD DATA LOCAL INFILE 'orders.csv'
INTO TABLE orders
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(id, customer, total, ordered_at);
```

`LOCAL` đọc file từ máy Mac. MySQL 8 mặc định tắt tính năng này ở phía server, nên server cần `local_infile=ON` và client phải được chạy bằng `mysql --local-infile=1`. Không có `LOCAL` thì server đọc ổ đĩa của chính nó, và `secure_file_priv` giới hạn được đọc ở đâu. File lưu trên Windows kết thúc dòng bằng `\r\n`; hãy ghi rõ điều đó trong `LINES TERMINATED BY`.

## Import trong TablePro {#in-tablepro}

TablePro đọc file local và thêm dòng qua connection cơ sở dữ liệu. Không cần `local_infile` hay bản sao trên server.

1. Mở connection.
2. Chọn **Tệp > Nhập > Nhập dữ liệu…** (File > Import > Import Data…, `Cmd+Shift+I`) rồi chọn file `.csv` hoặc `.tsv`. Phần mở rộng quyết định định dạng. Với file CSV lưu dưới đuôi `.txt` hoặc không có đuôi, hãy dùng **Import Data From** trong cùng menu và chọn định dạng.
3. Kiểm tra các tùy chọn đọc file. **Delimiter** và **Encoding** bắt đầu ở **Auto-detect**. **First row is a header** đang bật, **Treat empty values as NULL** cũng bật. **NULL text** thêm một giá trị nữa được đọc thành NULL, ví dụ `\N`.
4. Chọn **Đích** (Destination): **Bảng hiện có** (Existing table) rồi chọn table ở **Nhập vào** (Import into), hoặc **Bảng mới** (New table).
5. Ghép các trường với cột, rồi bấm **Nhập** (Import).

Đổi một tùy chọn đọc file thì file được đọc lại, và trường nào vẫn còn sẽ giữ cột đã ghép.

### Ghép trường với cột {#mapping}

Field ghép với cột theo tên, không phân biệt hoa thường. Field không khớp bắt đầu ở **Bỏ qua** (Skip). Dùng checkbox và menu cột của từng field, hoặc **Match Columns**:

- **Match by Name**: mỗi trường vào cột cùng tên.
- **Match by Position**: trường đầu vào cột đầu, cứ thế tiếp tục.
- **Use Saved Mapping**: cách ghép bạn đã dùng cho table này lần trước.

Bấm **Nhập** (Import) lưu mapping tùy chỉnh cho table trên Mac này. Lần import sau khôi phục mapping, hiển thị **Restored the mapping saved for** cùng tên table.

### Tạo table từ file {#new-table}

**Bảng mới** (New table) dùng tên file viết thường, đổi khoảng trắng và dấu câu thành gạch dưới. Tên đã có được thêm hậu tố: file `orders.csv` thứ hai gợi ý `orders_2`. Sửa tên, kiểu, khóa chính, cho phép NULL và mặc định của từng cột trước khi tạo.

Kiểu suy ra từ mọi dòng, không phải mẫu. Một giá trị không phải số có thể biến cột vốn là số thành text; kiểm tra file nếu kiểu suy ra không đúng.

### Chọn cách xử lý lỗi {#errors}

| Tùy chọn | Mặc định |
|---|---|
| **Khi có lỗi** (On error): **Stop and Rollback**, **Stop and Commit** hoặc **Skip and Continue** | **Stop and Rollback** |
| **Bọc trong giao dịch (BEGIN/COMMIT)** (Wrap in transaction (BEGIN/COMMIT)) | Bật |
| **Delete existing rows before import** | Tắt |

Với các giá trị mặc định, một dòng lỗi sẽ dừng việc import và không có gì ở lại trong table. **Delete existing rows before import** làm trống table ngay trong cùng transaction, nên rollback cũng trả lại các dòng cũ. **Skip and Continue** chạy không có transaction và ghi lại từng lỗi; **Save Report…** ghi chúng ra file CSV gồm số dòng, câu lệnh và lỗi của cơ sở dữ liệu.

Trường nằm trong dấu ngoặc kép giữ nguyên dấu phẩy và xuống dòng bên trong, còn `""` trong dấu ngoặc kép được đọc thành một dấu ngoặc kép. Dòng nào không đọc được bằng encoding đã chọn sẽ dừng việc import trước khi có dòng nào bị xóa hay được insert, và thông báo lỗi ghi rõ dòng đó.

## Làm sạch file trước {#clean-first}

Để cắt khoảng trắng, xóa dòng trùng hoặc tách cột, dùng **Tệp > Mở tệp…** (File > Open File…) trước. Cửa sổ riêng có data grid, bộ lọc và tìm/thay thế. Chọn **Sửa > Dữ liệu > Import into Table…** (Edit > Data > Import into Table…) cùng connection để import các dòng đó, kể cả thay đổi chưa lưu.

Đó cũng là cách để import file nén `.csv.gz`, loại file mà **Nhập dữ liệu…** không đọc.

## Giới hạn {#limits}

- Workbook Excel `.xlsx` chỉ import sheet đầu tiên.
- Với connection ở mức Safe Mode **Read-Only**, tính năng import bị tắt. Ở các mức **Alert** và **Safe Mode**, TablePro hỏi trước khi ghi.
- Câu lệnh `LOAD DATA LOCAL INFILE` của MySQL gõ trong editor bị driver của TablePro từ chối. Hãy dùng **Nhập dữ liệu…**.
- Khi import vào table có sẵn, mỗi trường đi vào một cột mà table đã có, hoặc bị bỏ qua.

## Xử lý lỗi {#troubleshooting}

- **Mọi giá trị dồn vào một cột**: dấu phân cách bị đoán sai. Hãy tự đặt **Delimiter**.
- **Chữ có dấu hoặc chữ Nhật bị lỗi font**: file không dùng encoding đã chọn. Đặt **Encoding** đúng với encoding file được lưu, ví dụ Windows-1252 hoặc Shift JIS.
- **Cột ngày hoặc cột số từ chối một số dòng**: cơ sở dữ liệu không đọc được giá trị theo kiểu đó. Hãy import vào một cột text, hoặc vào table mới, rồi chuyển đổi bằng SQL sau.

Xem [Import & Export](https://docs.tablepro.app/features/import-export) cho tùy chọn JSON/Excel, và [Data Files](https://docs.tablepro.app/features/data-files) cho sửa file. Tổng quan: [import](/vi/features/import-export#import), [PostgreSQL](/vi/postgresql-client) và [MySQL](/vi/mysql-client).
