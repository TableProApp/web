---
slug: connect-postgresql-mysql-docker-mac
title: "Cách kết nối PostgreSQL hoặc MySQL trong Docker từ máy Mac"
seoTitle: "Kết nối PostgreSQL, MySQL trong Docker trên Mac"
description: Publish port của container, kết nối tới localhost bằng psql, mysql hoặc một GUI, và để TablePro đọc thiết lập từ docker-compose.yml.
date: 2026-10-08
author: TablePro Team
ogPunchline: Publish port, kết nối tới localhost, hoặc đọc docker-compose.yml.
tags: [postgresql, mysql, project-folder]
---

Cơ sở dữ liệu trong container lắng nghe bên trong mạng của Docker. Máy Mac của bạn chỉ tới được nó qua một port bạn publish ra ngoài. Khi port đã được publish, cơ sở dữ liệu nằm ở `localhost` như mọi server local khác, và client nào cũng kết nối theo cách quen thuộc.

## Publish port {#publish-the-port}

```bash
docker run --name pg -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres:17
docker run --name mysql -e MYSQL_ROOT_PASSWORD=secret -p 3306:3306 -d mysql:8.4
```

`-p 5432:5432` ánh xạ port 5432 trên máy Mac tới port 5432 trong container. Số bên trái là port bạn kết nối tới. Nếu một PostgreSQL cài bằng Homebrew đang giữ port 5432, hãy publish ra port khác, `-p 5433:5432`, rồi kết nối tới 5433.

`-p 5432:5432` publish trên mọi network interface của máy Mac. Để cơ sở dữ liệu không lộ ra mạng nội bộ, hãy bind vào loopback: `-p 127.0.0.1:5432:5432`.

`docker ps` hiện ánh xạ này ở cột `PORTS`, còn `docker port pg` in ra cho riêng một container.

## Kết nối từ dòng lệnh {#command-line}

```bash
psql "postgresql://postgres:secret@localhost:5432/postgres"
mysql -h 127.0.0.1 -P 3306 -u root -p
```

Các image chính thức tạo sẵn những tài khoản sau:

| Image | User | Mật khẩu | Cơ sở dữ liệu |
|---|---|---|---|
| `postgres` | `postgres`, hoặc `POSTGRES_USER` | `POSTGRES_PASSWORD` | Trùng tên user, hoặc `POSTGRES_DB` |
| `mysql` | `root` | `MYSQL_ROOT_PASSWORD` | Không có, trừ khi bạn đặt `MYSQL_DATABASE` |

Với client `mysql`, hãy dùng `127.0.0.1` thay vì `localhost`. Trên Mac, client này hiểu `localhost` là "dùng Unix socket", mà socket của container thì không nằm trên máy Mac.

Nếu chưa cài client nào, hãy chạy client có sẵn trong container: `docker exec -it pg psql -U postgres`.

## Kết nối trong TablePro {#in-tablepro}

1. Bấm **Kết nối mới…** (New Connection…) trên cửa sổ chào mừng, hoặc bấm `Cmd+N`, rồi chọn **PostgreSQL** hoặc **MySQL**.
2. Ở tab **Tổng quát** (General), đặt **Máy chủ** (Host) là `localhost` và **Cổng** (Port) là port đã publish.
3. Điền **Tên người dùng** (Username) và **Mật khẩu** (Password) theo bảng ở trên. PostgreSQL còn cần **Cơ sở dữ liệu** (Database): với container mới tạo, `postgres` là dùng được. Với MySQL, bạn có thể để trống **Cơ sở dữ liệu** rồi chọn sau bằng `Cmd+K`.
4. Bấm **Kiểm tra kết nối** (Test Connection), rồi **Lưu & kết nối** (Save & Connect).

Driver MySQL của TablePro chỉ kết nối qua TCP, nên `localhost` dùng được ở đây dù không dùng được với client `mysql`. Tài khoản MySQL 8 dùng `caching_sha2_password` kết nối được mà không cần đổi auth plugin. Với MySQL, để trống **Tên người dùng** nghĩa là dùng tên đăng nhập macOS của bạn, nên hãy gõ `root`.

Nếu bạn đã có sẵn connection string thì không cần điền từng ô. Bấm **Nhập từ URL…** (Import from URL…) ở cuối bảng chọn loại cơ sở dữ liệu, dán URL, xem phần xem trước rồi bấm **Nhập** (Import). Form mở ra với các ô đã điền sẵn. Mật khẩu có `@`, `#` hoặc `%` cần được percent-encode trước: `p@ss` thành `p%40ss`.

## Đọc thiết lập từ file Compose {#compose}

Trong một dự án, những thông tin trên nằm trong `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app
    ports:
      - "5432:5432"
```

Tên service `db` chỉ phân giải được bên trong mạng của Compose. Từ máy Mac, địa chỉ vẫn là `localhost` và port đã publish.

TablePro đọc được file này để bạn không phải gõ lại:

1. Chọn **Tệp > Nhập > Mở thư mục dự án…** (File > Import > Open Project Folder…) và chọn thư mục dự án.
2. Bảng hiện ra liệt kê mỗi bộ thông tin đăng nhập tìm được trên một dòng, gồm loại cơ sở dữ liệu, host, port, user và cơ sở dữ liệu, kèm file và key chứa nó. Một service trong Compose hiện với host `127.0.0.1` và port đã publish.
3. Chọn một dòng rồi bấm **Tiếp tục** (Continue). Form connection mở ra với các ô đã điền sẵn. Chưa có gì được lưu và chưa có gì kết nối cho tới khi bạn bấm **Lưu** (Save).

Lượt quét đọc `docker-compose.yml` và `compose.yaml`, đọc cả `.env`, nên một `${POSTGRES_PASSWORD}` trong file Compose được điền từ `.env` của dự án. Mật khẩu không bao giờ được hiển thị. Dòng đó ghi **Đã tìm thấy mật khẩu** (Password found), và giá trị được đưa vào Keychain khi bạn lưu.

Hai ghi chú trên một dòng cho biết nó có thể không kết nối được:

- **Không có cổng được công bố, có thể không truy cập được** (No published port, may be unreachable): service không có ánh xạ `ports:`.
- **Tên dịch vụ container, có thể không truy cập được** (Container service name, may be unreachable): host lấy từ một giá trị trong `.env` như `DB_HOST=db`, vốn chỉ phân giải được bên trong Docker. Hãy đổi **Máy chủ** thành `localhost` trong form.

## Giới hạn {#limits}

- Mỗi lượt **Mở thư mục dự án…** chỉ import một dòng. Chạy lại cho service tiếp theo.
- TablePro không đối chiếu với các connection bạn đã có, nên import cùng một dòng hai lần sẽ cho ra hai connection.
- Các file mẫu như `.env.example` bị bỏ qua.
- TablePro không khởi động, dừng hay liệt kê container. Ứng dụng kết nối tới bất cứ thứ gì đang lắng nghe trên port đó.
- Connection MySQL không bao giờ dùng Unix socket. Hãy cho connection một host và một port.

## Nếu không kết nối được {#troubleshooting}

- **Connection refused**: không có gì lắng nghe trên port đó. Dùng `docker ps` để kiểm tra container có đang chạy và port đã được publish chưa.
- **Password authentication failed** trên PostgreSQL, hoặc **Access denied** trên MySQL, dù bạn dùng đúng mật khẩu trong lệnh `docker run`: `POSTGRES_PASSWORD` và `MYSQL_ROOT_PASSWORD` chỉ có tác dụng khi thư mục dữ liệu được tạo lần đầu. Container khởi động trên một volume có sẵn vẫn giữ mật khẩu từ lúc volume đó được tạo.
- **Kết nối được, nhưng vào nhầm server**: một PostgreSQL hoặc MySQL khác trên máy Mac đang giữ port. Hãy publish container ra một port khác.

Form connection được mô tả từng ô trong tài liệu cho [PostgreSQL](https://docs.tablepro.app/databases/postgresql) và [MySQL](https://docs.tablepro.app/databases/mysql), còn các file cấu hình mà lượt quét đọc được liệt kê trong [Open Project Folder](https://docs.tablepro.app/features/project-folder-import) (các trang tài liệu đều bằng tiếng Anh). Trên trang này, hãy xem trang [PostgreSQL](/vi/postgresql-client), trang [MySQL](/vi/mysql-client) và mục [import connection từ một dự án](/vi/features/connections#project-folder).

Khi đã kết nối được với container, bước tiếp theo thường là nạp dữ liệu: xem [cách import file CSV vào PostgreSQL hoặc MySQL](/vi/blog/import-csv-postgresql-mysql).
