---
slug: connect-amazon-rds-mac
title: "Cách kết nối Amazon RDS cho PostgreSQL hoặc MySQL từ máy Mac"
seoTitle: "Kết nối Amazon RDS PostgreSQL, MySQL trên Mac"
description: Tới endpoint RDS hoặc Aurora trực tiếp hay qua bastion, xác minh chứng chỉ TLS, và đăng nhập bằng AWS IAM thay cho mật khẩu lưu sẵn.
date: 2026-10-08
author: TablePro Team
ogPunchline: Endpoint, security group, chứng chỉ, rồi IAM thay cho mật khẩu.
tags: [postgresql, mysql, aws-iam, ssh]
---

Một instance RDS là một server PostgreSQL hoặc MySQL bình thường nằm sau một hostname của AWS. Phần lớn các lần kết nối thất bại không liên quan gì tới client: mạng không cho bạn vào, hoặc tài khoản đăng nhập được thiết lập cho một kiểu xác thực khác với kiểu bạn đang dùng. Bài này đi qua cả hai phía.

## Tìm endpoint {#endpoint}

Trong RDS console, mở **Databases**, chọn instance và đọc endpoint cùng port trong mục **Connectivity & security**. Từ AWS CLI:

```bash
aws rds describe-db-instances \
  --query 'DBInstances[].[DBInstanceIdentifier,Endpoint.Address,Endpoint.Port]' \
  --output table
```

Một cluster Aurora có writer endpoint và reader endpoint. Câu lệnh ghi gửi tới reader endpoint sẽ bị server từ chối, dù bạn dùng client nào.

## Máy Mac có tới được không? {#network}

Hai thiết lập quyết định kết nối từ máy Mac có đi qua được hay không:

- **Public access**: instance không bật public access thì không có địa chỉ nào bên ngoài VPC. Hãy tới nó qua một bastion host trong cùng VPC, hoặc qua VPN.
- **Security group**: cần có inbound rule cho port của cơ sở dữ liệu (5432 hoặc 3306) từ địa chỉ của bạn, hoặc từ địa chỉ của bastion.

Nếu một trong hai sai, kết nối sẽ bị timeout thay vì báo một lỗi rõ ràng.

## Xác minh chứng chỉ {#tls}

RDS có TLS. Để chắc rằng bạn đang nói chuyện với RDS chứ không phải thứ gì đứng giữa, hãy tải bộ chứng chỉ của RDS và trỏ client tới đó:

```bash
curl -O https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

psql "host=mydb.abc123.us-east-1.rds.amazonaws.com port=5432 dbname=postgres user=app sslmode=verify-full sslrootcert=global-bundle.pem"

mysql -h mydb.abc123.us-east-1.rds.amazonaws.com -P 3306 -u app -p \
  --ssl-mode=VERIFY_IDENTITY --ssl-ca=global-bundle.pem
```

## Kết nối trong TablePro {#in-tablepro}

1. Bấm **Kết nối mới…** (New Connection…) trên cửa sổ chào mừng, hoặc bấm `Cmd+N`, rồi chọn **PostgreSQL** hoặc **MySQL**.
2. Ở tab **Tổng quát** (General), đặt **Máy chủ** (Host) là endpoint và **Cổng** (Port) là port của nó, rồi điền **Tên người dùng** (Username) và **Mật khẩu** (Password). PostgreSQL còn cần **Cơ sở dữ liệu** (Database); instance RDS PostgreSQL nào cũng có `postgres`.
3. Mở tab **Mạng** (Network). Connection mới để **Chế độ SSL** (SSL Mode) ở **Ưu tiên** (Preferred). Để xác minh server, chọn **Xác minh danh tính** (Verify Identity), và trong mục **Chứng chỉ CA** (CA Certificate), đặt **Chứng chỉ** (Certificate) là `global-bundle.pem`.
4. Bấm **Kiểm tra kết nối** (Test Connection), rồi **Lưu & kết nối** (Save & Connect).

### Qua bastion

Ở tab **Mạng**, đặt **Connect via** thành **Đường hầm SSH** (SSH Tunnel) và điền **Máy chủ SSH** (SSH Host), **Người dùng SSH** (SSH User) và key của bastion. Giữ nguyên **Máy chủ** ở tab **Tổng quát** là endpoint RDS: tunnel phân giải nó từ bastion, bên trong VPC.

Tunnel có một cái giá. Khi đó driver kết nối tới `127.0.0.1`, mà không chứng chỉ nào ghi tên địa chỉ này, nên **Xác minh CA** (Verify CA) và **Xác minh danh tính** hạ xuống **Bắt buộc (bỏ qua xác minh)** (Required (skip verify)) với connection đó. Dữ liệu vẫn được mã hóa tới tận cơ sở dữ liệu. Bài [kết nối qua SSH tunnel](/vi/blog/postgresql-ssh-tunnel-mac) nói về key, agent và jump host.

### Nhiều instance cùng lúc

**Tệp > Nhập > Import from AWS…** (File > Import > Import from AWS…) liệt kê các instance RDS và cluster Aurora mà một AWS profile nhìn thấy. Chọn profile, đánh dấu các region cần tìm rồi bấm **Tiếp tục** (Continue), sau đó chọn các dòng muốn thêm. Profile đó cần quyền `rds:DescribeDBInstances` và `rds:DescribeDBClusters`, đều có trong policy `AmazonRDSReadOnlyAccess`. **Tên người dùng** được để trống, vì user của cơ sở dữ liệu hiếm khi là master user.

## Đăng nhập bằng AWS IAM {#iam}

Xác thực cơ sở dữ liệu bằng IAM thay mật khẩu lưu sẵn bằng một token được ký bởi thông tin xác thực AWS của bạn. Phía AWS:

1. Bật IAM database authentication cho instance hoặc cluster.
2. Tạo user cơ sở dữ liệu dành cho nó:

```sql
-- PostgreSQL
CREATE USER app_user;
GRANT rds_iam TO app_user;

-- MySQL
CREATE USER 'app_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
```

3. Cho phép `rds-db:connect` trên user đó trong một IAM policy gắn với role hoặc user mà bạn dùng để đăng nhập.

Từ dòng lệnh, token chính là mật khẩu và có hiệu lực 15 phút:

```bash
export PGPASSWORD="$(aws rds generate-db-auth-token \
  --hostname mydb.abc123.us-east-1.rds.amazonaws.com --port 5432 \
  --region us-east-1 --username app_user)"
psql "host=mydb.abc123.us-east-1.rds.amazonaws.com port=5432 dbname=postgres user=app_user sslmode=verify-full sslrootcert=global-bundle.pem"
```

Client `mysql` còn cần `--enable-cleartext-plugin` để gửi token.

Trong TablePro, đặt **Xác thực** (Authentication) ở tab **Tổng quát** thành một trong các lựa chọn AWS. Ô **Mật khẩu** nhường chỗ cho các ô của AWS, còn **Tên người dùng** nhận user cơ sở dữ liệu.

| Lựa chọn | Thông tin xác thực lấy từ |
|---|---|
| **AWS IAM (Profile)** | Một profile trong `~/.aws/config` và `~/.aws/credentials`, chính là các file AWS CLI đọc. **Tên hồ sơ** (Profile Name) liệt kê các profile đó; để trống nghĩa là `default`. |
| **AWS IAM (SSO)** | Một profile dùng IAM Identity Center, với phiên đăng nhập CLI đã lưu. |
| **AWS IAM (Access Key)** | **Access Key ID** và **Secret Access Key** gõ vào form, kèm **Session Token** nếu cần. |

**AWS Region** được đọc từ hostname RDS chuẩn. Hãy điền ô này khi dùng CNAME hoặc endpoint tùy chỉnh.

Mỗi lần kết nối ký một token mới, các lần tự kết nối lại cũng ký token khác, nên không có gì phải dán hay làm mới. Token không bao giờ được ghi xuống đĩa. IAM bắt buộc dùng TLS, nên **Chế độ SSL** đang là **Đã tắt** (Disabled) hoặc **Ưu tiên** sẽ được nâng lên cho lần kết nối đó.

Tunnel do TablePro mở không cần thêm gì: token được ký cho **Máy chủ** và **Cổng** trong form. Nếu bạn tự chạy port forward và **Máy chủ** đang là `127.0.0.1`, hãy điền endpoint thật vào **RDS Endpoint**, nếu không token sẽ được ký cho sai host.

## Giới hạn {#limits}

- Một user cơ sở dữ liệu hoặc xác thực bằng mật khẩu, hoặc bằng IAM. Đăng nhập bằng mật khẩu với user đã có `rds_iam` sẽ thất bại, và dùng IAM với user chỉ có mật khẩu cũng vậy.
- Profile dùng `mfa_serial` hoặc `web_identity_token_file` không được hỗ trợ. Profile assume role, `credential_process` và IAM Identity Center thì được.
- Khi đi qua SSH tunnel, chứng chỉ không được kiểm tra, như đã nói ở trên.

## Nếu không kết nối được {#troubleshooting}

- **Kết nối bị timeout**: security group hoặc thiết lập public access đang chặn bạn. Kiểm tra inbound rule và địa chỉ bạn kết nối từ đó.
- **PAM authentication failed** trên PostgreSQL, hoặc **Access denied** trên MySQL, khi dùng IAM: token được ký cho một endpoint khác với endpoint mà RDS thấy. Kiểm tra **Máy chủ**, hoặc **RDS Endpoint** khi bạn tự forward port, kể cả port.
- **Could not determine an AWS region**: hostname không phải endpoint RDS chuẩn. Hãy điền **AWS Region**.
- **AWS SSO Sign-In Required**: phiên đã lưu hết hạn. Đồng ý với lời nhắc, hoặc chạy `aws sso login --profile <name>`.

Mọi lựa chọn và thông báo của IAM nằm trong tài liệu [AWS IAM Authentication](https://docs.tablepro.app/connections/aws-iam), còn các chế độ chứng chỉ nằm trong [SSL/TLS](https://docs.tablepro.app/connections/ssl) (tài liệu bằng tiếng Anh). Trên trang này, hãy xem trang [PostgreSQL](/vi/postgresql-client), trang [MySQL](/vi/mysql-client) và mục [đăng nhập bằng tài khoản cloud](/vi/features/connections#cloud-auth).
