---
slug: tablepro-0-88-performance
title: "TablePro 0.88 nhanh hơn ở đâu"
description: "Ít lượt đi về hơn với MySQL và PostgreSQL, cửa sổ SSH rộng hơn, import theo lô và export gọn hơn, đo so với 0.87 trên cùng một máy Mac."
date: 2026-11-21
kind: news
author: Ngô Quốc Đạt
tags: [mysql, postgresql, ssh, export, import]
ogPunchline: "Import dump PostgreSQL nhanh gấp 16 lần. SSH tunnel chở được gấp 13 lần mỗi giây."
---

Phần lớn thời gian mình làm TablePro 0.88 là dành cho tốc độ. Bản này đang ở beta. Với một database ở xa 200 ms, query MySQL có giới hạn dòng trả về sau 214 ms thay vì 830 ms. Kết quả 66 MB qua SSH tunnel mất 0.68 giây thay vì 8.9 giây. Một bản dump PostgreSQL 642 câu lệnh import xong trong 8.6 giây thay vì 2 phút 18 giây.

Mọi con số trong bài đều so 0.87.0 với 0.88.0-beta.2 trên cùng một máy Mac, cùng dữ liệu. Cách đo nằm ở cuối bài.

<asset-slot id="blog-tablepro-0-88-performance-1"></asset-slot>

| Thao tác | 0.87.0 | 0.88 beta | Nhanh hơn |
|---|---|---|---|
| Import dump PostgreSQL, 642 câu lệnh * | 137.5 s | 8.6 s | 16x |
| Đọc kết quả 66 MB qua SSH tunnel * | 8.9 s | 0.68 s | 13x |
| Export 200.000 dòng ra CSV | 0.98 s | 0.12 s | 8x |
| `SELECT * FROM orders` trên MySQL, có giới hạn dòng * | 830 ms | 214 ms | 3.9x |
| Query MySQL có sẵn `LIMIT` * | 411 ms | 204 ms | 2x |
| Sang trang tiếp của bảng MySQL * | 413 ms | 206 ms | 2x |
| Mở một bảng PostgreSQL * | 2.11 s | 1.29 s | 1.6x |

\* Ở xa 200 ms, qua một proxy làm trễ mọi gói tin.

## Lượt đi về, không phải query {#round-trips}

Khi database ở xa, phần lớn thời gian chờ không phải do database đang làm việc. Đó là thời gian gói tin chạy qua mạng. Từ Việt Nam sang một server ở Mỹ, mỗi lượt đi rồi về mất khoảng 200 ms, và TablePro đang đi những lượt không cần thiết.

Đây là những gì 0.87 gửi cho MySQL để chạy `SELECT * FROM orders` với giới hạn dòng mặc định, đọc từ log của proxy:

```sql
SET SQL_SELECT_LIMIT = 18446744073709551615;  -- bỏ giới hạn cho dòng tiếp theo
USE `shop`;                                   -- chắc chắn đang ở đúng database
SET SQL_SELECT_LIMIT = 10001;                 -- giới hạn query của bạn ở 10.000 dòng
SELECT * FROM orders;
```

Bốn câu lệnh, câu nào cũng chờ server trả lời rồi câu sau mới được gửi. Tức là bốn lượt đi về, 830 ms, cho một query mà server trả lời chưa tới một mili giây.

0.88 nhớ session đang ở database nào và bỏ `USE` khi không có gì có thể đổi nó. Không có `USE` thì cũng không cần bỏ giới hạn. Giới hạn và query của bạn đi chung một lượt:

<asset-slot id="blog-tablepro-0-88-performance-2"></asset-slot>

Cùng cách đó làm việc sang trang nhanh gấp đôi. Trước đây sang trang là một `USE` cộng câu query trang, 413 ms. Giờ chỉ còn câu query trang, 206 ms. Một thay đổi kèm theo mà mình thích: `ROW_COUNT()` và `SHOW WARNINGS` giờ trả lời cho câu lệnh cuối của bạn, chứ không phải cho một câu `USE` bạn chưa từng gõ.

<asset-slot id="blog-tablepro-0-88-performance-3"></asset-slot>

PostgreSQL cũng bị y vậy ở chỗ khác. Ở cả hai bản, mở một bảng thì sau một lượt đi về, khoảng 205 ms, là thấy những dòng đầu tiên. Chậm là phần sau đó: đọc danh sách cột của bảng tốn năm query, chạy lần lượt, mất 1040 ms. 0.88 gửi năm query đó cùng lúc, còn 216 ms, và cả lần mở bảng, gồm khoá và đếm dòng, giảm từ 2.11 xuống 1.29 giây.

## Cửa sổ SSH rộng hơn {#ssh-window}

SSH tunnel chở dữ liệu qua các channel, và mỗi channel có một cửa sổ. Server được gửi tối đa bấy nhiêu byte, rồi phải chờ TablePro báo còn chỗ mới gửi tiếp. libssh2 mở channel cho tunnel với cửa sổ 2 MB. Qua đường truyền 200 ms, đó là cái trần không vượt qua được: 2 MB mỗi 0.2 giây là 10 MB/s, dù mạng của bạn nhanh cỡ nào. 0.87 đạt 7.4 MB/s.

0.88 tự mở channel cho tunnel, với cửa sổ 32 MB:

```swift
libssh2_channel_open_ex(
    session, "direct-tcpip", 12,
    33_554_432,  // cửa sổ nhận 32 MiB thay vì 2 MiB của libssh2
    32_768, message, messageLength)
```

Một câu `SELECT` trả về 66 MB dữ liệu tốn 43 lượt đi về ở 0.87 và 4 lượt ở 0.88. Giờ chỉ mất 0.68 giây thay vì 8.9 giây, khoảng 96 MB/s.

Cái giá là bộ nhớ: một tunnel mà phía đọc bị chậm giờ có thể giữ tới 32 MB mỗi channel rồi server mới ngừng gửi.

## Import dump theo lô {#batched-imports}

Import SQL trước đây gửi một câu lệnh, chờ trả lời, rồi mới gửi câu tiếp. Một file `pg_dump --inserts` 642 câu lệnh là 661 lượt đi về. Mỗi lượt 200 ms thì phải chờ hơn hai phút cho một file chỉ 59 KB.

0.88 dùng pipeline mode của libpq cho PostgreSQL. Khi bật **Wrap in transaction**, app gửi tối đa 200 câu lệnh hoặc 4 MB một lần, rồi mới đọc câu trả lời. Rút gọn:

```swift
PQenterPipelineMode(conn)
for statement in batch { PQsendQueryParams(conn, statement, ...) }
PQsendPipelineSync(conn)
// rồi đọc một kết quả cho mỗi câu lệnh
```

Câu lệnh lỗi đầu tiên vẫn dừng import đúng dòng và rollback transaction. Cùng file đó giờ chỉ tốn 37 lượt đi về và 8.6 giây thay vì 137.5 giây. Hộp thoại import của TablePro báo 133 và 4.5 giây. Thời gian trong bài tính cả lượt làm mới sidebar chạy sau khi import. Import MySQL thì vẫn gửi từng câu một.

<asset-slot id="blog-tablepro-0-88-performance-4"></asset-slot>

## Export bớt việc thừa {#exports}

Phần này không liên quan tới mạng. Bộ export CSV trước đây ghi mỗi giá trị bằng một lần ghi nhỏ, và chạy quy tắc đặt dấu nháy cho mọi giá trị, kể cả số. 0.88 gom 1 MB rồi mới ghi, và quét byte của từng giá trị trước: nếu không có gì cần đặt nháy thì giá trị được ghi nguyên như vậy. JSON cũng được làm tương tự.

Export 200.000 dòng của một bảng SQLite trên máy giảm từ 0.98 xuống 0.12 giây, và hai bản ghi ra cùng một file 15.8 MB, giống nhau từng byte. Cả hai vẫn mất khoảng hai giây từ lúc bấm **Save** tới khi byte đầu tiên được ghi, chỗ này mình chưa xem tới.

<asset-slot id="blog-tablepro-0-88-performance-5"></asset-slot>

## Cái giá, và những gì chưa đổi {#trade-offs}

- SSH tunnel có thể giữ nhiều bộ nhớ hơn khi phía đọc bị chậm, và export Parquet một bảng rất lớn tốn CPU hơn một chút để giữ bộ nhớ dưới mức trần. Cả hai là đánh đổi mình chọn có chủ ý.
- Với database ngay trên máy hoặc trong mạng LAN, mỗi lượt đi về chưa tới một mili giây, nên phần nhanh hơn nhờ mạng gần như không còn. Phần export thì không phụ thuộc vào mạng.
- Import MySQL vẫn gửi từng câu lệnh một.
- Mở một bảng MySQL chỉ nhanh hơn một chút, từ 1.10 xuống 0.88 giây. Trang đầu giờ hiện sau 205 ms thay vì 411 ms, nhưng phần đọc metadata sau đó vẫn tốn thêm ba lượt đi về.

## Mình đo như thế nào {#how-i-measured}

- Mac mini M4 Pro, 24 GB bộ nhớ, macOS 27.0.1.
- MySQL 8.4.13, PostgreSQL 17.12 và OpenSSH 10.3 chạy trong Docker trên cùng máy.
- Mọi kết nối đi qua một proxy nhỏ giữ mỗi gói tin 100 ms theo mỗi chiều, nên mỗi lượt đi về tốn 200 ms. Với bài đo SSH, độ trễ nằm trên đường SSH và MySQL đứng sau nó.
- 0.87.0 lấy từ bản release trên GitHub và 0.88.0-beta.2, mỗi bản một profile sạch riêng, chạy trên cùng dữ liệu.
- Một lần chạy khởi động, rồi năm lần đo. Bảng ghi trung vị. Lần nhanh nhất và chậm nhất của mỗi bài đo chênh nhau dưới 8%, trừ export CSV trên 0.87, chênh 20%. Thời gian qua mạng tính từ byte đầu tiên TablePro gửi tới byte cuối cùng nó nhận, đọc từ log của proxy, và số lượt đi về cũng đếm từ log đó.

Các thay đổi, mỗi cái kèm ghi chú và benchmark riêng, nằm trong các pull request [#4328](https://github.com/TableProApp/TablePro/pull/4328), [#4331](https://github.com/TableProApp/TablePro/pull/4331), [#4333](https://github.com/TableProApp/TablePro/pull/4333), [#4341](https://github.com/TableProApp/TablePro/pull/4341) và [#4356](https://github.com/TableProApp/TablePro/pull/4356).

## Thử bản beta {#trying-it}

0.88 đang ở beta. Vào **Settings > General > Update channel**, chọn **Beta** rồi kiểm tra cập nhật. Chỗ nào bạn thấy vẫn chậm, cứ mở một issue, ghi database gì, ở xa cỡ nào và bạn đã làm gì.
