---
slug: tablepro-0-88-performance
title: "TablePro 0.88 nhanh hơn ở đâu"
description: "Bớt round trip với MySQL và PostgreSQL, SSH window rộng hơn, import theo batch, export nhẹ hơn. Đo so với 0.87 trên cùng một máy Mac."
date: 2026-11-21
kind: news
author: Ngô Quốc Đạt
tags: [mysql, postgresql, ssh, export, import]
ogPunchline: "Import dump PostgreSQL nhanh gấp 16 lần. SSH tunnel nhanh gấp 13 lần."
---

Phần lớn thời gian làm TablePro 0.88, mình dồn vào tốc độ. Bản này đang ở beta. Với database có latency 200 ms, một query MySQL có row limit giờ trả kết quả sau 214 ms thay vì 830 ms. Đọc 66 MB dữ liệu qua SSH tunnel mất 0,68 giây thay vì 8,9 giây. Import một file dump PostgreSQL 642 câu lệnh xong trong 8,6 giây, trước đây mất 2 phút 18 giây.

Mọi con số trong bài đều là 0.87.0 so với 0.88.0-beta.2, chạy trên cùng một máy Mac với cùng dữ liệu. Cách đo mình để ở cuối bài.

<asset-slot id="blog-tablepro-0-88-performance-1"></asset-slot>

| Thao tác | 0.87.0 | 0.88 beta | Nhanh hơn |
|---|---|---|---|
| Import dump PostgreSQL, 642 câu lệnh * | 137,5 s | 8,6 s | 16x |
| Đọc 66 MB qua SSH tunnel * | 8,9 s | 0,68 s | 13x |
| Export 200.000 dòng ra CSV | 0,98 s | 0,12 s | 8x |
| `SELECT * FROM orders` trên MySQL, có row limit * | 830 ms | 214 ms | 3,9x |
| Query MySQL tự có `LIMIT` * | 411 ms | 204 ms | 2x |
| Chuyển trang bảng MySQL * | 413 ms | 206 ms | 2x |
| Mở một bảng PostgreSQL * | 2,11 s | 1,29 s | 1,6x |

\* Latency 200 ms, giả lập bằng một proxy làm trễ mọi packet.

## Chậm vì round trip, không phải vì query {#round-trips}

Khi database ở xa, phần lớn thời gian bạn chờ không phải do database xử lý, mà do dữ liệu phải đi qua mạng. Từ Việt Nam sang một server ở Mỹ, mỗi round trip mất khoảng 200 ms. Và TablePro đang tốn những round trip không cần thiết.

Đây là những gì 0.87 gửi sang MySQL khi chạy `SELECT * FROM orders` với row limit mặc định, lấy từ log của proxy:

```sql
SET SQL_SELECT_LIMIT = 18446744073709551615;  -- tạm bỏ row limit cho câu USE
USE `shop`;                                   -- đảm bảo session đang ở đúng database
SET SQL_SELECT_LIMIT = 10001;                 -- giới hạn kết quả ở 10.000 dòng
SELECT * FROM orders;
```

Bốn câu lệnh, và câu sau phải chờ server trả lời câu trước rồi mới được gửi đi. Tức là bốn round trip, mất 830 ms, cho một query mà server xử lý chưa tới 1 ms.

Bản 0.88 theo dõi session đang ở database nào, và chỉ gửi `USE` khi session có thể đã bị đổi sang database khác. Không còn `USE` thì cũng không cần tạm bỏ row limit nữa. Lệnh đặt row limit và query của bạn được gửi chung trong một round trip:

<asset-slot id="blog-tablepro-0-88-performance-2"></asset-slot>

Nhờ vậy, chuyển trang cũng nhanh gấp đôi. Trước đây mỗi lần chuyển trang là một `USE` cộng với query lấy trang, mất 413 ms. Giờ chỉ còn query lấy trang, 206 ms. Có một cái lợi phụ mình rất thích: `ROW_COUNT()` và `SHOW WARNINGS` giờ trả về kết quả của câu lệnh cuối cùng bạn chạy, chứ không phải của một câu `USE` mà bạn chưa hề gõ.

<asset-slot id="blog-tablepro-0-88-performance-3"></asset-slot>

PostgreSQL cũng có vấn đề tương tự, ở một chỗ khác. Khi mở một bảng, cả hai bản đều hiện những dòng đầu tiên sau một round trip, khoảng 205 ms. Phần chậm nằm ở sau đó: để đọc danh sách cột của bảng, 0.87 chạy năm query nối tiếp nhau, mất 1.040 ms. Bản 0.88 gửi cả năm query cùng lúc, còn 216 ms. Tính cả đọc key và đếm số dòng, thời gian mở bảng giảm từ 2,11 xuống 1,29 giây.

## SSH window rộng hơn {#ssh-window}

SSH tunnel truyền dữ liệu qua các channel, và mỗi channel có một window. Server chỉ được gửi tối đa từng ấy byte, rồi phải chờ TablePro báo còn chỗ trống mới gửi tiếp. libssh2 mở channel cho tunnel với window 2 MB. Với latency 200 ms, đó là một giới hạn cứng: 2 MB mỗi 0,2 giây là 10 MB/s, mạng của bạn nhanh đến đâu cũng vậy. Bản 0.87 chỉ đạt 7,4 MB/s.

Bản 0.88 tự mở channel cho tunnel, với window 32 MB:

```swift
libssh2_channel_open_ex(
    session, "direct-tcpip", 12,
    33_554_432,  // receive window 32 MiB, thay vì 2 MiB mặc định của libssh2
    32_768, message, messageLength)
```

Một câu `SELECT` trả về 66 MB dữ liệu cần 43 round trip trên 0.87, còn 0.88 chỉ cần 4. Thời gian giảm từ 8,9 xuống 0,68 giây, tức khoảng 96 MB/s.

Đổi lại là tốn RAM hơn: nếu phía nhận đọc chậm, mỗi channel giờ có thể giữ tới 32 MB trước khi server dừng gửi.

## Import dump theo batch {#batched-imports}

Trước đây, import SQL gửi từng câu lệnh một: gửi, chờ trả lời, rồi mới gửi câu tiếp theo. Một file `pg_dump --inserts` có 642 câu lệnh nghĩa là 661 round trip. Mỗi round trip 200 ms, cộng lại là hơn hai phút chờ cho một file chỉ 59 KB.

Bản 0.88 dùng pipeline mode của libpq cho PostgreSQL. Khi bật **Wrap in transaction**, TablePro gửi mỗi batch tối đa 200 câu lệnh hoặc 4 MB, rồi mới đọc kết quả. Code rút gọn:

```swift
PQenterPipelineMode(conn)
for statement in batch { PQsendQueryParams(conn, statement, ...) }
PQsendPipelineSync(conn)
// sau đó đọc kết quả của từng câu lệnh
```

Nếu có câu lệnh lỗi, import vẫn dừng đúng ở dòng đó và rollback transaction. Cùng file đó giờ chỉ cần 37 round trip, mất 8,6 giây thay vì 137,5 giây. Dialog import của TablePro báo 133 giây và 4,5 giây. Con số trong bài cao hơn vì tính cả lần refresh sidebar chạy sau khi import. Riêng import MySQL thì vẫn gửi từng câu một.

<asset-slot id="blog-tablepro-0-88-performance-4"></asset-slot>

## Export bớt việc thừa {#exports}

Phần này không liên quan đến mạng. Trước đây, phần export CSV ghi từng giá trị bằng một lần ghi nhỏ, và chạy logic escape cho mọi giá trị, kể cả số. Bản 0.88 dùng buffer 1 MB, và quét byte của từng giá trị trước: không có gì cần escape thì ghi thẳng ra. Export JSON cũng được tối ưu tương tự.

Export 200.000 dòng từ một bảng SQLite trên máy giảm từ 0,98 xuống 0,12 giây, và file 15,8 MB của hai bản giống nhau đến từng byte. Cả hai bản vẫn mất khoảng 2 giây từ lúc bấm **Save** đến khi bắt đầu ghi file, chỗ này mình chưa tối ưu.

<asset-slot id="blog-tablepro-0-88-performance-5"></asset-slot>

## Đánh đổi và những chỗ chưa đổi {#trade-offs}

- SSH tunnel có thể tốn nhiều RAM hơn khi phía nhận đọc chậm. Export Parquet cho bảng rất lớn tốn thêm chút CPU để giữ RAM dưới mức giới hạn. Cả hai là đánh đổi mình chủ động chọn.
- Với database chạy ngay trên máy hoặc trong LAN, mỗi round trip chưa tới 1 ms, nên phần cải thiện về mạng gần như không thấy. Phần export thì không phụ thuộc vào mạng.
- Import MySQL vẫn gửi từng câu lệnh một.
- Mở bảng MySQL chỉ nhanh hơn chút ít, từ 1,10 xuống 0,88 giây. Trang đầu tiên giờ hiện sau 205 ms thay vì 411 ms, nhưng phần đọc metadata phía sau vẫn tốn thêm ba round trip.

## Mình đo thế nào {#how-i-measured}

- Mac mini M4 Pro, RAM 24 GB, macOS 27.0.1.
- MySQL 8.4.13, PostgreSQL 17.12 và OpenSSH 10.3 chạy trong Docker trên cùng máy.
- Mọi kết nối đều đi qua một proxy nhỏ, giữ mỗi packet 100 ms ở mỗi chiều, nên mỗi round trip mất 200 ms. Với bài đo SSH, latency nằm trên kết nối SSH, còn MySQL nằm phía sau.
- Bản 0.87.0 lấy từ release trên GitHub, cùng với bản 0.88.0-beta.2, mỗi bản chạy với một profile sạch riêng và cùng dữ liệu.
- Mỗi bài đo chạy warm-up một lần, rồi đo năm lần. Bảng ghi median. Lần nhanh nhất và chậm nhất của mỗi bài đo lệch nhau dưới 8%, trừ export CSV trên 0.87 lệch 20%. Thời gian qua mạng tính từ byte đầu tiên TablePro gửi đi đến byte cuối cùng nhận về, lấy từ log của proxy. Số round trip cũng đếm từ log này.

Mỗi thay đổi đều có ghi chú và benchmark riêng trong các pull request [#4328](https://github.com/TableProApp/TablePro/pull/4328), [#4331](https://github.com/TableProApp/TablePro/pull/4331), [#4333](https://github.com/TableProApp/TablePro/pull/4333), [#4341](https://github.com/TableProApp/TablePro/pull/4341) và [#4356](https://github.com/TableProApp/TablePro/pull/4356).

## Dùng thử bản beta {#trying-it}

0.88 đang ở beta. Vào **Settings > General > Update channel**, chọn **Beta**, rồi chọn **Check for Updates…**. Chỗ nào bạn thấy vẫn chậm, cứ mở issue và ghi rõ database gì, ở xa cỡ nào, bạn đã thao tác gì.
