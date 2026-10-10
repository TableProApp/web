---
slug: claude-code-cursor-database-mcp
title: "Kết nối Claude Code hoặc Cursor tới cơ sở dữ liệu qua MCP"
seoTitle: "Claude Code, Cursor query cơ sở dữ liệu qua MCP"
description: Thiết lập MCP server TablePro cho Claude Code hoặc Cursor. Cấu hình quyền từng connection, Safe Mode và activity log trước khi cho phép ghi.
date: 2026-10-08
author: TablePro
ogPunchline: Mặc định chỉ đọc. Safe Mode quyết định phần còn lại.
tags: [mcp, postgresql, mysql]
---

MCP (Model Context Protocol) server của TablePro cho Claude Code và Cursor query connection cơ sở dữ liệu đã lưu mà không nhận mật khẩu. Bật server, cấu hình client, rồi chọn connection nào được đọc hoặc ghi.

## Cấu hình MCP client {#client-config}

Bridge `tablepro-mcp` có sẵn mở TablePro khi cần, tìm port và cung cấp token. Client nói chuyện với bridge qua stdin và stdout; cấu hình chỉ cần path của file thực thi.

Claude Code nhận cấu hình từ dòng lệnh:

```bash
claude mcp add tablepro -- /Applications/TablePro.app/Contents/MacOS/tablepro-mcp
claude mcp list
```

Dấu `--` tách các flag của chính Claude Code khỏi lệnh mà nó chạy.

Cursor đọc `~/.cursor/mcp.json` cho mọi dự án, hoặc `.cursor/mcp.json` trong một dự án:

```json
{
  "mcpServers": {
    "tablepro": {
      "command": "/Applications/TablePro.app/Contents/MacOS/tablepro-mcp"
    }
  }
}
```

Khởi động lại Cursor sau khi sửa file. Nếu TablePro được cài ở chỗ khác `/Applications`, hãy dùng đường dẫn đó.

## Bật server trong TablePro {#turn-on}

1. Mở **Cài đặt > Tích hợp** (Settings > Integrations) và bật **Bật MCP Server** (Enable MCP Server). **Trạng thái** (Status) hiện **Đang chạy trên cổng 23508** (Running on port 23508), hoặc port mà server lấy thay khi port đó đang bận.
2. Bấm **Kết nối client…** (Connect a Client…) và chọn **Claude Code** hoặc **Cursor**. Bảng này có các bước thiết lập và đoạn cấu hình chứa đúng đường dẫn bản cài của bạn. TablePro không sửa file cấu hình của ứng dụng khác, nên bạn tự dán vào.
3. Nhờ client liệt kê các tool của TablePro, hoặc gọi `list_connections`. Danh sách có `list_connections`, `list_tables`, `describe_table` và `execute_query`.

TablePro hỏi duyệt trên Mac khi client truy cập connection lần đầu. Trong **Quyền truy cập kết nối > Approval** (Connection Access > Approval), chọn **Ask Once for Each Connection** (mặc định), **Ask Every Time** hoặc **Never Ask**. Đây là hộp thoại TablePro, không phải prompt client có thể tự trả lời.

## Đặt quyền connection {#external-clients}

Mỗi connection đã lưu có thiết lập riêng. Sửa connection, mở tab **Tùy chọn** (Options), và trong mục **Quyền truy cập** (Access) đặt **Client bên ngoài** (External Clients):

| Mức | Client làm được gì |
|---|---|
| **Blocked** | Không gì cả. Connection thậm chí không xuất hiện trong danh sách. |
| **Read Only** | Đọc schema và chạy câu lệnh đọc. Mọi câu lệnh ghi bị từ chối trước khi tới cơ sở dữ liệu. Đây là mức mặc định. |
| **Read & Write** | Đọc, và ghi những gì Safe Mode cho qua. |

Hãy để production ở **Read Only** hoặc **Blocked**. Chỉ cho **Read & Write** với cơ sở dữ liệu local hoặc staging, nơi bạn muốn agent thay đổi dữ liệu.

## Yêu cầu duyệt trước khi ghi {#safe-mode}

Một câu lệnh ghi từ client đi qua ba lớp kiểm tra, và lớp nghiêm nhất quyết định:

1. **Client bên ngoài** trên connection, như ở trên.
2. **Phạm vi của token.** Token mà `tablepro-mcp` mang theo có quyền **Read & Write**.
3. **Safe Mode**, cho từng câu lệnh, giống hệt như với query bạn tự chạy.

Ở từng mức Safe Mode, một câu lệnh ghi đã qua hai lớp đầu sẽ như sau:

| Mức | Câu lệnh ghi của agent |
|---|---|
| **Silent** (mặc định) | Chạy luôn, không hỏi. |
| **Alert** | Chờ bạn xác nhận trong một hộp thoại trên máy Mac, hiện toàn bộ câu lệnh. |
| **Safe Mode** | Chờ xác nhận, kèm Touch ID hoặc mật khẩu máy Mac. |
| **Read-Only** | Bị từ chối. |

**Alert (Full)** và **Safe Mode (Full)** còn hỏi cả trước câu lệnh đọc. Bạn đặt mức này trong cùng mục **Quyền truy cập**, hoặc bằng biểu tượng ổ khóa trên thanh công cụ khi connection đang mở.

Với **Read & Write** và **Silent**, thao tác ghi thông thường chạy được mà không hỏi. `DELETE` không có `WHERE` vẫn hiện cảnh báo query nguy hiểm. Đặt **Alert** để xem từng thao tác ghi trước chạy.

`DROP` và `TRUNCATE` được xử lý riêng. `execute_query` từ chối chúng. Chúng chỉ chạy qua tool `confirm_destructive_operation`, vốn cần token **Full Access** và sự đồng ý của bạn ở mọi lần. Token mà `tablepro-mcp` mang theo không phải Full Access, nên agent kết nối theo cách đó không thể drop hay truncate thứ gì.

Một số câu lệnh luôn bị từ chối bất kể thiết lập: mọi thứ đọc hoặc ghi file trên server hay chạy code phía server, và nhiều hơn một câu lệnh trong một lần gọi, trừ script SQL Server.

Nếu cần token hẹp hơn token của `tablepro-mcp`, ví dụ **Read Only** và chỉ cho vài connection, hãy tạo một token trong **Cài đặt > Tích hợp > Xác thực** (Settings > Integrations > Authentication) rồi cho client kết nối qua HTTP. Tài liệu [MCP Clients](https://docs.tablepro.app/integrations/mcp-clients#http-transport) có cấu hình cho cách này.

## Xem hoạt động {#activity}

**Xem hoạt động…** (View Activity…) trong **Cài đặt > Tích hợp** liệt kê mọi lần gọi tool và mọi query, kèm connection và kết quả. Câu lệnh ở đó được lưu dưới dạng mã băm SHA-256, không phải văn bản. Query do client chạy cũng xuất hiện trong lịch sử query của connection đó, trừ khi bạn tắt **Ghi truy vấn MCP vào lịch sử** (Log MCP queries in history).

## Giới hạn {#limits}

- Server chỉ lắng nghe trên `127.0.0.1`. Không có chế độ truy cập từ xa; client trên máy khác cần một SSH port forward do bạn tự thiết lập và tự chịu trách nhiệm.
- Server chạy trong ứng dụng cho Mac. Ứng dụng cho iPhone và iPad không có MCP server.
- Client thấy các connection đã lưu nhưng không bao giờ thấy mật khẩu, và không tạo, sửa connection hay đổi Safe Mode được.
- Kết quả dừng ở **Giới hạn dòng mặc định** (Default row limit), 500 dòng nếu bạn không đổi, và client chỉ xin thêm được tới **Giới hạn dòng tối đa** (Maximum row limit), mặc định là 10.000. Cả hai nằm trong **Cài đặt > Tích hợp**.

## Xử lý lỗi {#troubleshooting}

- **TablePro is not running**: bridge không khởi động được ứng dụng hoặc không tìm thấy server, và đã ngừng chờ sau 10 giây. Hãy mở TablePro và kiểm tra **Trạng thái** báo đang chạy.
- **This connection is read only for external clients**: câu lệnh có ghi dữ liệu trong khi **Client bên ngoài** đang là **Read Only**. Đổi thiết lập đó, hoặc tự chạy câu lệnh trong TablePro.
- **Connection không có trong `list_connections`**: connection đang ở **Blocked**, hoặc chính sách AI của nó đặt là **Never**.

Xem [MCP Tools](https://docs.tablepro.app/developers/mcp-tools) cho danh sách tool và [MCP Server](https://docs.tablepro.app/features/mcp) cho cài đặt. Tổng quan: [MCP](/vi/features/ai-mcp#mcp) và [Safe Mode](/vi/features/data-editing#safe-mode). Nếu TablePro không kết nối được cơ sở dữ liệu, kiểm tra [SSH tunnel](/vi/blog/postgresql-ssh-tunnel-mac) hoặc [publish port Docker](/vi/blog/connect-postgresql-mysql-docker-mac).
