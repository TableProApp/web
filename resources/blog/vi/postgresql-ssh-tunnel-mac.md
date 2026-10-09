---
slug: postgresql-ssh-tunnel-mac
title: "Kết nối PostgreSQL qua SSH tunnel trên Mac"
description: Kết nối PostgreSQL qua SSH bằng ssh -L hoặc TablePro. Thiết lập key, agent, jump host và hiểu giới hạn TLS của tunnel.
date: 2026-10-08
author: TablePro
ogPunchline: Chạy ssh -L trước, rồi dựng cùng tunnel đó trong form connection.
tags: [postgresql, ssh]
---

Dùng SSH tunnel khi PostgreSQL truy cập được từ bastion nhưng không từ máy Mac. Chuyển tiếp port local bằng `ssh`, hoặc để TablePro quản lý tunnel cùng connection cơ sở dữ liệu.

## Chuyển tiếp port bằng ssh {#ssh-command}

```bash
ssh -N -L 5433:localhost:5432 deploy@bastion.example.com
```

- `-L 5433:localhost:5432` lắng nghe trên port 5433 của máy Mac và chuyển tiếp tới `localhost:5432` theo cách server SSH nhìn thấy.
- `-N` không mở shell. Lệnh chạy ở foreground cho tới khi bạn bấm `Ctrl+C`.

Đích trong `-L` phân giải trên server SSH. Dùng `localhost` nếu PostgreSQL chạy ở đó, hoặc địa chỉ mạng nội bộ như `db.internal:5432` nếu chạy nơi khác.

Khi tunnel đang mở, kết nối vào đầu local của nó:

```bash
psql "postgresql://app@localhost:5433/appdb"
```

Hai biến thể thường gặp:

```bash
# chỉ định một private key
ssh -N -i ~/.ssh/id_ed25519 -L 5433:localhost:5432 deploy@bastion.example.com

# đi qua một jump host trước
ssh -N -J ops@jump.example.com -L 5433:db.internal:5432 deploy@bastion.example.com
```

Nếu key đã nằm trong agent (`ssh-add ~/.ssh/id_ed25519`) thì không cần `-i`. Server phải cho phép chuyển tiếp: `AllowTcpForwarding yes` trong `sshd_config`.

Tunnel là một tiến trình riêng. Đóng cửa sổ terminal đó thì mọi client đang đi qua tunnel đều mất kết nối.

## Thiết lập tunnel trong TablePro {#in-tablepro}

TablePro mở và đóng tunnel cùng connection cơ sở dữ liệu.

1. Bấm **Kết nối mới…** (New Connection…) trên cửa sổ chào mừng, hoặc bấm `Cmd+N`, rồi chọn **PostgreSQL**.
2. Ở tab **Tổng quát** (General), mô tả cơ sở dữ liệu theo cách server SSH nhìn thấy: **Máy chủ** (Host), là `localhost` khi PostgreSQL chạy ngay trên server SSH, cùng **Cổng** (Port), **Cơ sở dữ liệu** (Database), **Tên người dùng** (Username) và **Mật khẩu** (Password). PostgreSQL không kết nối được nếu thiếu tên cơ sở dữ liệu.
3. Mở tab **Mạng** (Network) và đặt **Connect via** thành **Đường hầm SSH** (SSH Tunnel).
4. Điền **Máy chủ SSH** (SSH Host), **Cổng SSH** (SSH Port, mặc định là 22) và **Người dùng SSH** (SSH User).
5. Trong mục **Xác thực** (Authentication), chọn một **Phương thức** (Method). Phần tiếp theo liệt kê các phương thức.
6. Bấm **Kiểm tra kết nối** (Test Connection). Lần đầu TablePro gặp một server, hộp thoại **Máy chủ SSH không xác định** (Unknown SSH Host) hiện loại key cùng fingerprint SHA-256 của nó và chờ bạn bấm **Tin cậy** (Trust).
7. Bấm **Lưu & kết nối** (Save & Connect).

Nếu `~/.ssh/config` có các mục host, một menu **Máy chủ cấu hình** (Config Host) xuất hiện phía trên ô host. Chọn một alias thì `HostName`, `User`, `Port`, `IdentityFile`, `IdentityAgent` và `ProxyJump` được đọc từ file đó lúc kết nối. Những gì bạn gõ vào form sẽ ghi đè lên file.

Để dùng một bastion cho nhiều connection, bấm **Lưu hiện tại thành hồ sơ…** (Save Current as Profile…) rồi chọn hồ sơ đó trong menu **Hồ sơ** (Profile) của các connection còn lại.

## Mật khẩu, key hay agent {#authentication}

Menu **Phương thức** hiện tên các phương thức bằng tiếng Anh.

| Phương thức | Bạn cần điền |
|---|---|
| **Password** | Mật khẩu SSH. |
| **Private Key** | **Tệp khóa** (Key File), và **Cụm mật khẩu** (Passphrase) nếu key được mã hóa. Khi để trống **Tệp khóa**, TablePro tìm trong `~/.ssh/config` và các vị trí key mặc định. |
| **SSH Agent** | **Agent Socket**: **SSH_AUTH_SOCK** cho agent do macOS chạy, **1Password** cho socket của 1Password, hoặc **Đường dẫn tùy chỉnh** (Custom Path) cho một agent khác. **Identity File** nhận một file `.pub` và đưa key đó ra trước. |
| **Keyboard Interactive** | Mật khẩu, gửi qua cơ chế challenge-response của SSH. Dùng khi server từ chối xác thực bằng mật khẩu thường. |
| **None** | Không điền gì. Dùng cho server tự xác thực kết nối, chẳng hạn một host Tailscale SSH. |

Với **SSH Agent**, việc ký diễn ra trong agent và TablePro không đọc private key.

Ứng dụng mở từ Finder nhận `SSH_AUTH_SOCK` từ launchd, không phải shell profile. Với key trong 1Password hoặc Secretive, chọn **1Password** hoặc **Đường dẫn tùy chỉnh** (Custom Path).

Nếu server hỏi mã xác minh, mục **Xác thực hai yếu tố** (Two-Factor Authentication) xử lý việc đó. **Nhắc khi kết nối** (Prompt at Connect) hỏi bạn ở mỗi lần kết nối. **Tự động tạo** (Auto Generate) tính mã từ TOTP secret bạn nhập.

## Jump host {#jump-hosts}

Với cơ sở dữ liệu nằm sau nhiều bastion, mở mục **Jump Host** (Jump Hosts) và bấm **Thêm Jump Host** (Add Jump Host) cho từng chặng, theo đúng thứ tự kết nối đi qua. Mỗi chặng cần host, port, tên người dùng và một cách xác thực, là **Private Key** hoặc **SSH Agent**. Một chặng không đăng nhập được bằng mật khẩu. Host key của từng chặng được kiểm tra giống như của server SSH.

Nếu bạn để trống danh sách và host SSH khớp với một mục trong `~/.ssh/config` có `ProxyJump`, TablePro đi theo dòng đó.

## Chuyển tiếp Unix socket {#unix-socket}

Một số server PostgreSQL chỉ nhận kết nối `local` và không mở port TCP nào. `ssh` chuyển tiếp được tới file socket:

```bash
ssh -N -L 5433:/var/run/postgresql/.s.PGSQL.5432 deploy@bastion.example.com
```

Trong TablePro, điền đường dẫn đó vào **Đường dẫn socket** (Socket Path) trong mục **Forward To** của tab **Mạng**. Hãy trỏ vào chính file socket, không phải thư mục chứa nó. Khi đó **Máy chủ** và **Cổng** không được dùng. Socket không thương lượng được TLS nên TablePro tắt TLS cho connection này, còn SSH tunnel vẫn mã hóa toàn bộ đường đi.

## Giới hạn {#limits}

- Việc kiểm tra chứng chỉ không còn khi đi qua tunnel. Driver kết nối tới `127.0.0.1`, nên **Xác minh CA** (Verify CA) và **Xác minh danh tính** (Verify Identity) hạ xuống **Bắt buộc (bỏ qua xác minh)** (Required (skip verify)) với connection đi qua tunnel. TLS vẫn chạy suốt tới cơ sở dữ liệu.
- Đầu local của tunnel lắng nghe trên một port trong khoảng 60000 đến 65000. Nếu tường lửa của macOS hỏi, hãy cho phép.
- Cứ 30 giây có một gói keep-alive. Khi tunnel rớt, TablePro dựng lại, tối đa mười lần thử. Query đang chạy lúc tunnel rớt không được chạy lại.
- Jump host chỉ dùng được trong ứng dụng cho Mac. Ứng dụng cho iPhone và iPad không mở được connection có jump host.
- **Đường hầm SSH** không có với các cơ sở dữ liệu dạng file như SQLite và DuckDB.

## Xử lý lỗi {#troubleshooting}

- **"The SSH server could not reach …"**: SSH đã thông nhưng việc chuyển tiếp thì không. Kiểm tra **Máy chủ** ở tab **Tổng quát**. Cơ sở dữ liệu bind vào `127.0.0.1`, là mặc định của PostgreSQL, cần **Máy chủ** đặt là `localhost`.
- **Tunnel kết nối được nhưng cơ sở dữ liệu từ chối đăng nhập**: thông tin đăng nhập SSH và thông tin đăng nhập cơ sở dữ liệu là hai bộ riêng. Kiểm tra xem bạn có điền nhầm bộ này vào ô của bộ kia không.
- **Chính SSH bị lỗi**: chạy `ssh -v deploy@bastion.example.com` trong Terminal với cùng host, user và key. Nếu lệnh đó cũng lỗi thì vấn đề nằm ở phía server.

Xem [SSH Tunneling](https://docs.tablepro.app/connections/ssh-tunneling) cho thông báo lỗi và [tổng quan PostgreSQL](/vi/postgresql-client) cho tính năng cơ sở dữ liệu. [Kết nối mạng](/vi/features/connections#network) còn hướng dẫn SOCKS proxy và `kubectl port-forward`.
