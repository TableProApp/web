---
slug: claude-code-cursor-database-mcp
title: "Cách để Claude Code hoặc Cursor query cơ sở dữ liệu qua MCP"
seoTitle: "Claude Code, Cursor query cơ sở dữ liệu qua MCP"
description: Kết nối Claude Code hoặc Cursor với MCP server của TablePro, chọn quyền agent có trên từng connection, và xem Safe Mode chặn câu lệnh ghi ở đâu.
date: 2026-10-08
author: TablePro Team
ogPunchline: Mặc định chỉ đọc. Safe Mode quyết định phần còn lại.
tags: [mcp, postgresql, mysql]
---

Một coding agent viết SQL tốt hơn khi nó đọc được schema thay vì đoán từ model trong code. Model Context Protocol (MCP) là cách Claude Code, Cursor và các client khác gọi tool nằm ngoài chúng. TablePro trên Mac có sẵn một MCP server, trao cho agent các connection bạn đã lưu mà không trao mật khẩu.

## Client cần gì {#client-config}

Một MCP client khởi động một tiến trình server rồi nói chuyện với nó qua stdin và stdout. TablePro đóng gói tiến trình đó bên trong ứng dụng, tên là `tablepro-mcp`. Nó khởi động TablePro nếu ứng dụng chưa chạy, tự tìm port và mang theo token, nên cấu hình của client chỉ chứa một đường dẫn.

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

## Bật MCP server trong TablePro {#turn-on}

1. Mở **Cài đặt > Tích hợp** (Settings > Integrations) và bật **Bật MCP Server** (Enable MCP Server). **Trạng thái** (Status) hiện **Đang chạy trên cổng 23508** (Running on port 23508), hoặc port mà server lấy thay khi port đó đang bận.
2. Bấm **Kết nối client…** (Connect a Client…) và chọn **Claude Code** hoặc **Cursor**. Bảng này có các bước thiết lập và đoạn cấu hình chứa đúng đường dẫn bản cài của bạn. TablePro không sửa file cấu hình của ứng dụng khác, nên bạn tự dán vào.
3. Nhờ client liệt kê các tool của TablePro, hoặc gọi `list_connections`. Danh sách có `list_connections`, `list_tables`, `describe_table` và `execute_query`.

Lần đầu một client chạm tới một connection của bạn, TablePro hỏi ngay trên máy Mac. Mục **Approval** trong phần **Quyền truy cập kết nối** (Connection Access) của cùng màn hình quyết định những lần sau hỏi thường xuyên tới đâu: **Ask Once for Each Connection** (mặc định), **Ask Every Time** hoặc **Never Ask**. Câu hỏi là một hộp thoại trên máy Mac, không bao giờ là một lời nhắc bên trong client, nên client không thể tự trả lời thay bạn.

## Chọn quyền cho từng connection {#external-clients}

Mỗi connection đã lưu có thiết lập riêng. Sửa connection, mở tab **Tùy chọn** (Options), và trong mục **Quyền truy cập** (Access) đặt **Client bên ngoài** (External Clients):

| Mức | Client làm được gì |
|---|---|
| **Blocked** | Không gì cả. Connection thậm chí không xuất hiện trong danh sách. |
| **Read Only** | Đọc schema và chạy câu lệnh đọc. Mọi câu lệnh ghi bị từ chối trước khi tới cơ sở dữ liệu. Đây là mức mặc định. |
| **Read & Write** | Đọc, và ghi những gì Safe Mode cho qua. |

Hãy để production ở **Read Only** hoặc **Blocked**. Chỉ cho **Read & Write** với cơ sở dữ liệu local hoặc staging, nơi bạn muốn agent thay đổi dữ liệu.

## Safe Mode làm gì với câu lệnh ghi của agent {#safe-mode}

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

Vì vậy, **Read & Write** trên một connection ở mức **Silent** cho phép agent chạy `INSERT`, `UPDATE` và `DELETE` mà không có lời nhắc nào. Nếu bạn muốn xem từng câu lệnh ghi trước khi nó chạy, hãy nâng connection đó lên **Alert**.

`DROP` và `TRUNCATE` được xử lý riêng. `execute_query` từ chối chúng. Chúng chỉ chạy qua tool `confirm_destructive_operation`, vốn cần token **Full Access** và sự đồng ý của bạn ở mọi lần. Token mà `tablepro-mcp` mang theo không phải Full Access, nên agent kết nối theo cách đó không thể drop hay truncate thứ gì.

Một số câu lệnh luôn bị từ chối bất kể thiết lập: mọi thứ đọc hoặc ghi file trên server hay chạy code phía server, và nhiều hơn một câu lệnh trong một lần gọi, trừ script SQL Server.

Nếu cần token hẹp hơn token của `tablepro-mcp`, ví dụ **Read Only** và chỉ cho vài connection, hãy tạo một token trong **Cài đặt > Tích hợp > Xác thực** (Settings > Integrations > Authentication) rồi cho client kết nối qua HTTP. Tài liệu [MCP Clients](https://docs.tablepro.app/external-api/mcp-clients#http-transport) có cấu hình cho cách này.

## Xem agent đã làm gì {#activity}

**Xem hoạt động…** (View Activity…) trong **Cài đặt > Tích hợp** liệt kê mọi lần gọi tool và mọi query, kèm connection và kết quả. Câu lệnh ở đó được lưu dưới dạng mã băm SHA-256, không phải văn bản. Query do client chạy cũng xuất hiện trong lịch sử query của connection đó, trừ khi bạn tắt **Ghi truy vấn MCP vào lịch sử** (Log MCP queries in history).

## Giới hạn {#limits}

- Server chỉ lắng nghe trên `127.0.0.1`. Không có chế độ truy cập từ xa; client trên máy khác cần một SSH port forward do bạn tự thiết lập và tự chịu trách nhiệm.
- Server chạy trong ứng dụng cho Mac. Ứng dụng cho iPhone và iPad không có MCP server.
- Client thấy các connection đã lưu nhưng không bao giờ thấy mật khẩu, và không tạo, sửa connection hay đổi Safe Mode được.
- Kết quả dừng ở **Giới hạn dòng mặc định** (Default row limit), 500 dòng nếu bạn không đổi, và client chỉ xin thêm được tới **Giới hạn dòng tối đa** (Maximum row limit), mặc định là 10.000. Cả hai nằm trong **Cài đặt > Tích hợp**.

## Nếu client không thấy tool nào {#troubleshooting}

- **TablePro is not running**: bridge không khởi động được ứng dụng hoặc không tìm thấy server, và đã ngừng chờ sau 10 giây. Hãy mở TablePro và kiểm tra **Trạng thái** báo đang chạy.
- **This connection is read only for external clients**: câu lệnh có ghi dữ liệu trong khi **Client bên ngoài** đang là **Read Only**. Đổi thiết lập đó, hoặc tự chạy câu lệnh trong TablePro.
- **Connection không có trong `list_connections`**: connection đang ở **Blocked**, hoặc chính sách AI của nó đặt là **Never**.

Danh sách tool đầy đủ nằm trong tài liệu [MCP Tools](https://docs.tablepro.app/external-api/mcp-tools), còn màn hình thiết lập nằm trong [MCP Server](https://docs.tablepro.app/features/mcp) (tài liệu bằng tiếng Anh). Trên trang này, hãy xem mục [MCP server](/vi/features/ai-mcp#mcp) và [Safe Mode](/vi/features/data-editing#safe-mode). Agent chỉ làm việc được với cơ sở dữ liệu mà TablePro kết nối được: hai bài [kết nối qua SSH tunnel](/vi/blog/postgresql-ssh-tunnel-mac) và [kết nối tới cơ sở dữ liệu trong Docker](/vi/blog/connect-postgresql-mysql-docker-mac) nói về hai trường hợp thường gặp nhất.
