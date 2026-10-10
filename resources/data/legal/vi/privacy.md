---
title: Chính sách quyền riêng tư
description: Ứng dụng, website và trang tài khoản của TablePro thu thập những gì, gửi đi đâu, lưu trong bao lâu, và cách bạn thay đổi hoặc xóa dữ liệu đó.
updatedAt: "2026-10-10"
---

Chính sách này áp dụng cho TablePro cho Mac, TablePro cho iPhone và iPad, website tablepro.app, trang tài liệu docs.tablepro.app và trang tài khoản tablepro.app/account. Chính sách mô tả đúng những gì từng thành phần đang gửi đi và lưu lại ở thời điểm hiện tại. Cả hai ứng dụng đều là mã nguồn mở theo giấy phép AGPLv3, nên bạn có thể đọc phần mã gửi đi mọi dữ liệu nêu dưới đây trong [kho mã nguồn TablePro]({github}).

## Tóm tắt {#summary}

- Ứng dụng cho Mac gửi cho TablePro một báo cáo sử dụng mỗi ngày một lần. Tính năng này bật sẵn và bạn có thể tắt. Ứng dụng cho iPhone và iPad chỉ gửi khi bạn bật nó lên.
- Nếu bạn kích hoạt license, ứng dụng cho Mac kiểm tra license với máy chủ của chúng tôi mỗi {revalidateDays} ngày. Lần kiểm tra đó có kèm tên máy Mac của bạn.
- Các query bạn chạy, kết quả trả về và mật khẩu của bạn không được gửi cho TablePro. Ngoại lệ duy nhất là những gì bạn chủ động xuất bản lên Team Library: cấu hình connection (không bao giờ gồm mật khẩu) và query đã lưu.
- Yêu cầu gửi tới AI đi thẳng từ ứng dụng cho Mac tới nhà cung cấp AI mà bạn thiết lập, không qua chúng tôi.
- Máy chủ của chúng tôi lưu địa chỉ IP của mọi báo cáo sử dụng và mọi lần kiểm tra license, và tra quốc gia cho mỗi báo cáo sử dụng. Chúng tôi chưa đặt thời hạn lưu cho các bản ghi này.
- Website đếm lượt xem trang bằng Cloudflare Web Analytics, công cụ này không đặt cookie. Website cũng tải Google Analytics, công cụ này chỉ đặt cookie khi bạn cho phép. Mọi trang cũng tải chat trực tuyến của chúng tôi, Crisp, và Crisp đặt cookie riêng của mình.
- Việc mua license do {merchant}, merchant of record của chúng tôi, thực hiện.

## Bên chịu trách nhiệm {#controller}

{publisherName}, một lập trình viên độc lập tại {publisherCity}, {publisherCountry}, là người phát hành các ứng dụng TablePro và website này, và chịu trách nhiệm về dữ liệu cá nhân được mô tả ở đây (bên kiểm soát dữ liệu). Mọi câu hỏi về chính sách này hoặc về dữ liệu của bạn, hãy gửi email tới [{email}](mailto:{email}).

## TablePro cho Mac {#mac-app}

### Báo cáo sử dụng {#mac-usage-report}

Ứng dụng cho Mac gửi một báo cáo sử dụng tới `api.tablepro.app` khoảng mười giây sau khi khởi động, rồi mỗi ngày một lần khi ứng dụng đang chạy. **Tính năng này bật sẵn, và ứng dụng không hỏi bạn trước khi gửi báo cáo đầu tiên.** Để tắt, mở **Cài đặt > Tổng quát > Quyền riêng tư** (Settings > General > Privacy) và bỏ chọn **Chia sẻ dữ liệu sử dụng ẩn danh** (Share anonymous usage data).

Một báo cáo gồm:

- mã máy (machine ID): giá trị băm SHA-256 của UUID phần cứng máy Mac (bản thân UUID không bao giờ được gửi đi);
- nền tảng, phiên bản ứng dụng, phiên bản macOS, kiến trúc bộ xử lý và ngôn ngữ của ứng dụng;
- tên các loại cơ sở dữ liệu của những connection bạn đang mở (ví dụ "PostgreSQL") và số connection đang mở;
- license đã được kích hoạt hay chưa;
- ngày giờ bạn thử kết nối lần đầu và ngày giờ kết nối thành công lần đầu;
- cài đặt cập nhật của bạn (cách cài bản cập nhật và tần suất kiểm tra). Máy chủ của chúng tôi bỏ các thông tin này ngay khi nhận báo cáo.

Báo cáo không bao giờ chứa hostname, username, mật khẩu, query hay dữ liệu trong các dòng.

Máy chủ của chúng tôi lưu mỗi báo cáo cùng địa chỉ IP gửi báo cáo đó. Sau đó máy chủ tra quốc gia của địa chỉ IP này bằng cách gửi nó tới ip-api.com, nếu không được thì tới ipinfo.io rồi geoplugin.net. Các lần tra cứu này dùng HTTP không mã hóa. Quốc gia tra được được lưu cùng báo cáo. Vì lần kiểm tra license nêu dưới đây gửi cùng một mã máy, báo cáo từ một máy Mac đã kích hoạt license có thể được liên kết với license đó.

### Kiểm tra license {#mac-license}

Ứng dụng cho Mac chỉ liên hệ máy chủ license của chúng tôi sau khi bạn nhập license key. Ứng dụng làm việc này khi bạn kích hoạt license, khi khởi động nếu đã qua {revalidateDays} ngày trở lên kể từ lần kiểm tra trước, và sau đó cứ mỗi {revalidateDays} ngày. Mỗi lần kiểm tra gửi:

- license key của bạn;
- mã máy nêu ở trên;
- tên máy Mac của bạn, theo cài đặt trong macOS (thường có chứa tên của bạn);
- phiên bản ứng dụng và phiên bản macOS.

Khi hủy kích hoạt một máy Mac, ứng dụng chỉ gửi license key và mã máy.

Máy chủ của chúng tôi ghi nhật ký mọi yêu cầu liên quan đến license, kèm địa chỉ IP và nội dung yêu cầu, đồng thời lưu mã máy và tên của từng máy Mac đã kích hoạt cùng license của bạn. Trang tài khoản liệt kê các máy Mac đó theo tên. Nếu không liên lạc được với máy chủ của chúng tôi, các tính năng trả phí vẫn hoạt động trong {graceDays} ngày kể từ lần kiểm tra thành công gần nhất.

### Team Library {#library}

Team Library là một phần của license Team. Khi bạn chọn **Chia sẻ > Xuất bản lên thư viện nhóm…** (Share > Publish to Team Library…) trên một connection, hoặc **Xuất bản truy vấn đã lưu cho nhóm…** (Publish Saved Queries to Team…) trong sidebar Favorites, ứng dụng cho Mac tải lên máy chủ của chúng tôi những gì bạn xuất bản:

- cấu hình connection: host, port, tên cơ sở dữ liệu, username, cài đặt SSH và SSL, tùy chọn driver, startup command, cài đặt Tunnel Command, mức Safe Mode và cài đặt AI, nhưng không bao giờ gồm mật khẩu;
- query đã lưu: tên, nội dung SQL, từ khóa và thư mục.

Các máy Mac dùng chung license Team tải thư viện về khi khởi động, tối đa mỗi tuần một lần, và máy Mac vừa xuất bản tải lại ngay sau đó. Xuất bản lại sẽ thay thế những gì bạn đã xuất bản trước đó. Khi một thành viên bị xóa khỏi nhóm, mọi thứ thành viên đó đã xuất bản cũng bị xóa. Nếu license hết hạn hoặc bị tạm ngưng, thư viện vẫn nằm trên máy chủ của chúng tôi cho tới khi bạn yêu cầu xóa.

Team Catalog, tính năng Team còn lại, ghi các file connection không kèm mật khẩu vào một thư mục dùng chung do bạn chọn. Tính năng này không đi qua máy chủ của chúng tôi.

### Cập nhật và plugin {#mac-updates}

- **Kiểm tra cập nhật.** Mỗi ngày một lần, ứng dụng cho Mac tải nguồn cập nhật từ GitHub (`raw.githubusercontent.com`). Yêu cầu này không gửi thông tin nào về máy Mac của bạn ngoài những gì mọi yêu cầu web đều mang theo: địa chỉ IP và một user agent có phiên bản ứng dụng. Để tắt, mở **Cài đặt > Tổng quát > Cập nhật phần mềm** (Settings > General > Software Update) và bỏ chọn **Tự động kiểm tra cập nhật** (Automatically check for updates). Bản cập nhật cũng được tải về từ GitHub.
- **Danh mục plugin.** Khi khởi động, và khi bạn mở phần cài đặt plugin, ứng dụng tải danh sách driver và theme có sẵn từ GitHub. Không có cài đặt nào để tắt việc này. Driver và theme bạn cài được tải từ GitHub, và trình duyệt plugin đọc số lượt tải từ API của GitHub.

GitHub nhận địa chỉ IP của bạn qua các yêu cầu này. Tuyên bố về quyền riêng tư của GitHub áp dụng cho các yêu cầu đó.

### Dịch vụ bạn chọn sử dụng {#mac-third-parties}

Ứng dụng cho Mac chỉ gửi dữ liệu tới các dịch vụ sau khi bạn thiết lập chúng, và gửi trực tiếp, không bao giờ qua TablePro:

- **Cơ sở dữ liệu, máy chủ SSH và proxy của bạn**, nhận mọi thứ mà connection của bạn gửi tới.
- **Nhà cung cấp AI.** Khi bạn thêm một nhà cung cấp và dùng trợ lý AI hoặc gợi ý nội tuyến (inline suggestions), yêu cầu được gửi tới nhà cung cấp đó, hoặc tới một model chạy trên máy Mac của bạn. Theo mặc định, một yêu cầu gồm loại và tên cơ sở dữ liệu, định nghĩa table và cột lấy từ schema, cùng query hiện tại. Các dòng kết quả chỉ được gửi nếu bạn bật tùy chọn đó. Điều khoản của nhà cung cấp được áp dụng. Khi thêm GitHub Copilot, ứng dụng tải language server của Copilot từ npm, và cài đặt "Gửi telemetry tới GitHub" (Send telemetry to GitHub) của nó được bật sẵn.
- **Dịch vụ đăng nhập**: Microsoft Entra ID, Google, Amazon Web Services và Cloudflare Access, khi một connection dùng tới.
- **Apple Maps**, cung cấp ô bản đồ khi bạn xem kết quả trên bản đồ.
- **DuckDB**, cung cấp extension của DuckDB vào lần đầu một query cần tới.
- **MCP client.** MCP server tắt theo mặc định. Server khởi động khi bạn bật nó, hoặc khi một MCP client bạn đã thiết lập khởi chạy bridge của TablePro hay ghép nối với TablePro, và chỉ lắng nghe trên máy Mac của bạn (127.0.0.1). Một AI client mà bạn kết nối tới server, chẳng hạn Claude hay Cursor, nhận các kết quả mà client đó yêu cầu và gửi chúng tới dịch vụ của chính nó theo điều khoản của nó.
- **MCP server bạn thêm vào.** Một phiên AI gửi các lệnh gọi tool mà bạn duyệt, kèm tham số của chúng, tới server đó.

### Dữ liệu nằm lại trên máy Mac {#mac-local}

Mật khẩu được lưu trong Keychain của macOS. Danh sách connection, lịch sử query, Query Insights, các bản chụp của Data Rewind, cài đặt và các tab đang mở được lưu trên máy Mac của bạn. Ứng dụng chỉ tham chiếu tới SSH key ở đúng vị trí của chúng trên ổ đĩa và không sao chép chúng. Ứng dụng không chứa công cụ báo lỗi (crash reporter) nào và không có thư viện phân tích của bên thứ ba.

## TablePro cho iPhone và iPad {#ios-app}

**Không có gì được gửi tới TablePro trừ khi bạn bật Chia sẻ dữ liệu sử dụng** (Share Usage Data), khi ứng dụng khởi động lần đầu hoặc sau đó trong **Cài đặt > Quyền riêng tư** (Settings > Privacy). Nếu bạn bật, ứng dụng gửi một báo cáo mỗi ngày tới cùng máy chủ với ứng dụng cho Mac, và máy chủ của chúng tôi lưu và tra cứu địa chỉ IP của báo cáo theo cùng cách. Báo cáo gồm giá trị băm SHA-256 của mã định danh mà Apple cấp cho ứng dụng trên thiết bị của bạn, nền tảng, phiên bản ứng dụng và iOS, kiến trúc bộ xử lý, ngôn ngữ của ứng dụng, tên các loại cơ sở dữ liệu của những connection bạn đang mở, số connection đang mở, và ngày giờ bạn thử kết nối lần đầu, kết nối thành công lần đầu và chạy query đầu tiên. Báo cáo không có cài đặt cập nhật và luôn ghi là chưa kích hoạt license nào, vì ứng dụng không có cả hai.

Ứng dụng không kiểm tra license, không kiểm tra cập nhật và không gửi yêu cầu nào về plugin. Ngoài báo cáo tùy chọn nói trên, ứng dụng chỉ kết nối tới cơ sở dữ liệu và máy chủ SSH của bạn, tới iCloud của Apple nếu bạn bật iCloud Sync, và tới Microsoft khi một connection SQL Server đăng nhập bằng Microsoft Entra ID.

Trên thiết bị, mật khẩu và SSH key bạn dán vào được lưu trong Keychain, còn chứng chỉ không bao giờ được đồng bộ. Lịch sử query nằm lại trên thiết bị. Các connection của bạn được thêm vào chỉ mục Spotlight trên thiết bị để bạn tìm kiếm. Khi một query đang chạy, Hoạt động trực tiếp của nó hiển thị câu SQL trên Màn hình khóa và trong Dynamic Island khi mở rộng, trừ khi bạn bật **Cài đặt > Hoạt động trực tiếp > Ẩn truy vấn** (Settings > Live Activities > Hide Query).

Nếu bạn chia sẻ dữ liệu phân tích với nhà phát triển ứng dụng trong phần cài đặt của iPhone hoặc iPad, Apple có thể chuyển báo cáo lỗi và số liệu sử dụng cho chúng tôi qua App Store Connect. Bản thân ứng dụng không có công cụ báo lỗi và không có thư viện phân tích của bên thứ ba.

## iCloud Sync và Handoff {#icloud}

iCloud Sync tắt cho tới khi bạn bật, trên Mac cũng như trên iPhone và iPad. Khi bật, các bản ghi được lưu vào một cơ sở dữ liệu riêng trong tài khoản iCloud của chính bạn (container `iCloud.com.TablePro`). TablePro không đọc được chúng.

- Trên Mac, bạn chọn những gì được đồng bộ: connection, nhóm và tag, cài đặt, SSH profile, credential profile (tên và username, không bao giờ gồm mật khẩu), table và cơ sở dữ liệu yêu thích, query đã lưu (kể cả nội dung SQL) và thư mục table. Một bản ghi connection gồm host, port, username, tên cơ sở dữ liệu, cài đặt SSH và SSL, lệnh khởi động, script chạy trước khi kết nối và quy tắc AI. Lịch sử query, các bản chụp của Data Rewind và nguồn mật khẩu không bao giờ được đồng bộ.
- iPhone và iPad đồng bộ connection, nhóm và tag.
- Mật khẩu chỉ được đồng bộ nếu bạn bật thêm mục **Mật khẩu** (Passwords) trong Danh mục đồng bộ (Sync Categories) trên Mac, hoặc **Đồng bộ mật khẩu** (Sync Passwords) trên iPhone và iPad, tính năng dùng iCloud Keychain. Trên Mac, tùy chọn này cũng đồng bộ các thông tin bí mật khác mà TablePro giữ trong Keychain, chẳng hạn API key của nhà cung cấp AI và license key.

Trên Mac, iCloud Sync thuộc license Starter hoặc Team. Trên iPhone và iPad, tính năng này miễn phí.

Handoff chuyển mã của connection đang mở và tên của table đang mở giữa các thiết bị của chính bạn, thông qua Apple. Khi chưa mở table nào, Handoff chuyển tên của connection thay cho tên table, hoặc host nếu connection không có tên. Handoff không gửi cài đặt hay thông tin đăng nhập nào.

## Website {#website}

**Lưu trữ.** Website và trang tài khoản chạy trên máy chủ của chúng tôi, phía sau Cloudflare. Như mọi máy chủ web, chúng nhận địa chỉ IP, user agent của trình duyệt và địa chỉ của từng trang bạn yêu cầu.

**Cloudflare Web Analytics.** Cloudflare chèn script Web Analytics của mình vào các trang của website và trang tài khoản. Trình duyệt của bạn tải script này từ `static.cloudflareinsights.com`, và script báo cho Cloudflare từng lượt xem trang: trang được xem, trang web đã dẫn bạn tới, thời gian tải trang, cùng trình duyệt, hệ điều hành và loại thiết bị của bạn. Cloudflare bổ sung quốc gia nơi kết nối của bạn xuất phát. Script này không đặt cookie và không lưu gì trong trình duyệt của bạn, và Cloudflare cho biết dịch vụ này không dùng địa chỉ IP hay thông tin trình duyệt để nhận dạng bạn (fingerprinting). Cloudflare chỉ cho chúng tôi xem số liệu tổng, chẳng hạn số lượt xem theo từng trang hoặc từng quốc gia, chứ không có bản ghi về từng người truy cập. Cơ sở pháp lý: lợi ích hợp pháp.

**Google Analytics.** Website tải Google Analytics trên mọi trang ở chế độ Consent Mode. Cho tới khi bạn chọn **Cho phép** trong câu hỏi về cookie, công cụ này không đặt cookie nào và chỉ gửi cho Google một tín hiệu không dùng cookie cho mỗi trang, không lưu mã định danh nào trên thiết bị của bạn. Nếu bạn cho phép, Google Analytics đặt cookie `_ga` và `_ga_<ID>` và đo các lượt truy cập của bạn, chẳng hạn những trang bạn xem, các lượt bấm tải về và việc bắt đầu thanh toán. Lưu trữ cho quảng cáo, cá nhân hóa quảng cáo và dữ liệu người dùng cho quảng cáo luôn bị từ chối. Google cho biết Google Analytics 4 không ghi lại và không lưu địa chỉ IP. Property Google Analytics của chúng tôi dùng thời hạn lưu mặc định của Google: Google xóa dữ liệu ở cấp người dùng và cấp sự kiện sau 2 tháng. Các báo cáo tiêu chuẩn của Google, vốn chứa số liệu tổng chứ không chứa mã định danh, không bị ảnh hưởng. Cơ sở pháp lý: sự đồng ý của bạn đối với cookie.

**Chat trực tuyến.** Mọi trang của website và trang tài khoản đều có nút chat của nhà cung cấp dịch vụ chat của chúng tôi, Crisp. Sau khi trang tải xong, trình duyệt tải script của Crisp từ `client.crisp.chat`, và Crisp đặt các cookie được nêu trong mục [Cookie và bộ nhớ trình duyệt](#cookies). Crisp nhận địa chỉ IP, thông tin trình duyệt, địa chỉ các trang bạn xem và các tin nhắn bạn viết, và giữ lại địa chỉ IP của bạn nếu bạn bắt đầu một cuộc chat. Chúng tôi chỉ cho Crisp biết ngôn ngữ của trang, ngoài ra không cung cấp thông tin nào khác về bạn. Crisp có trụ sở tại Pháp.

**Script thanh toán.** Khi bạn trỏ chuột hoặc dùng phím Tab tới một nút Mua, trình duyệt tải script thanh toán của {merchant} từ jsDelivr (`cdn.jsdelivr.net`), và jsDelivr nhận địa chỉ IP cùng thông tin trình duyệt của bạn. Bản thân trang thanh toán của {merchant} chỉ mở khi bạn bấm.

**Nguồn truy cập khi mua hàng.** Khi bạn vào website, trình duyệt giữ một bản ghi về lần truy cập đầu tiên, tên là `tablepro:attribution`, trong local storage trong 90 ngày: nguồn của lượt truy cập (các tag `ref` hoặc `utm_*` trên liên kết bạn đã theo, hoặc trang web đã dẫn bạn tới), trang bạn vào đầu tiên và thời điểm đó. Nếu bạn bắt đầu mua hàng, bản ghi này được gửi kèm yêu cầu thanh toán. Máy chủ của chúng tôi bỏ nó đi: bản ghi không được kiểm tra, đọc hay lưu lại, và không được chuyển cho {merchant}.

**Tài liệu.** Trang tài liệu docs.tablepro.app do Mintlify lưu trữ. Mintlify nhận địa chỉ IP và thông tin trình duyệt của bạn với mỗi trang, và các trang tải font từ Google Fonts. Trang tài liệu có câu hỏi về cookie của riêng nó, vì nó không đọc được câu trả lời bạn đã chọn trên website này. Cho tới khi bạn chọn **Allow** ở đó, trang không đặt cookie và không giữ ID người xem nào. Nếu bạn cho phép, Google Analytics đặt cookie `_ga` và `_ga_<ID>` và đo các lượt xem tài liệu của bạn, còn Mintlify giữ một ID người xem ngẫu nhiên, `mintlify_anonymous_id`, trong local storage để đếm các lượt đó. **Cookie settings** ở cuối trang tài liệu cho bạn đổi câu trả lời, và khi bạn từ chối thì cả hai bị xóa. Cơ sở pháp lý: sự đồng ý của bạn.

**Ngôn ngữ và giảm giá theo khu vực.** Để gợi ý trang bằng ngôn ngữ của bạn khi trình duyệt không nêu ngôn ngữ nào website có, và để hiển thị mức giảm giá theo khu vực mà bước thanh toán sẽ áp dụng, website hỏi Cloudflare (`/cdn-cgi/trace`) và máy chủ của chúng tôi về quốc gia mà kết nối của bạn đến từ đó, và có thể đọc múi giờ của thiết bị. Cả hai request đều không mang cookie, và trang không giữ lại gì từ các câu trả lời. Cơ sở pháp lý: lợi ích hợp pháp.

Đọc website không đặt cookie riêng. Request đăng ký bản tin, thanh toán và kiểm tra mã giảm giá từ website công khai dùng chế độ omit credentials: không gửi cookie trang tài khoản và không nhận cookie từ response. Mở trang tài khoản là việc riêng, có đặt cookie liệt kê bên dưới. Mọi thứ website giữ trong trình duyệt được liệt kê trong mục [Cookie và bộ nhớ trình duyệt](#cookies).

## Mua hàng {#purchases}

License được bán bởi {merchant} (Polar Software, Inc.), merchant of record kiêm đơn vị bán lại của chúng tôi. Bạn mua hàng từ {merchant} theo điều khoản dành cho người mua và chính sách quyền riêng tư của chính {merchant}. {merchant} nhận thanh toán, tính và nộp thuế bán hàng hoặc VAT nếu có, gửi biên nhận và hóa đơn, và xử lý các vấn đề cũng như tranh chấp về thanh toán. {merchant} thu thập tên, địa chỉ email, địa chỉ thanh toán và thông tin thanh toán của bạn. Chúng tôi không bao giờ thấy đầy đủ thông tin thẻ của bạn.

Từ {merchant}, chúng tôi nhận địa chỉ email, tên và địa chỉ thanh toán như bạn đã nhập, sản phẩm bạn mua, số tiền, mã đơn hàng và mã gói thuê bao, cùng các thay đổi sau đó như gia hạn, hủy và hoàn tiền. Chúng tôi cho {merchant} biết ngôn ngữ của trang bạn mua hàng, để email của chúng tôi tới bạn bằng ngôn ngữ đó. Hóa đơn, biên nhận, phương thức thanh toán và gói thuê bao của bạn nằm trong [cổng khách hàng của {merchant}]({portal}), nơi bạn đăng nhập bằng địa chỉ email đã dùng để mua. Việc hoàn tiền được mô tả trong [chính sách hoàn tiền](/vi/refund-policy), còn những gì một license cho phép được nêu trong [điều khoản sử dụng](/vi/terms).

## Trang tài khoản {#account}

[Trang tài khoản](/account?locale=vi) tại tablepro.app/account dành cho người đã mua license. Bạn đăng nhập bằng một liên kết mà chúng tôi gửi tới địa chỉ email đó; liên kết chỉ dùng được một lần và hết hạn sau 15 phút. Trang tài khoản hiển thị các license của bạn, các máy Mac đã kích hoạt trên từng license (theo tên), và với license Team là thành viên, lời mời, số seat và Team Library.

Chúng tôi lưu địa chỉ email của bạn cùng các license và đơn hàng, và ngôn ngữ bạn dùng với chúng tôi, để email của chúng tôi tới bạn bằng ngôn ngữ đó. Khi bạn mời một người vào nhóm, chúng tôi lưu địa chỉ email và vai trò của người đó và gửi cho họ một mã mời qua email.

## Bản tin {#newsletter}

Nếu bạn đăng ký nhận ghi chú phát hành, chúng tôi lưu địa chỉ email của bạn và ngôn ngữ của trang bạn dùng để đăng ký. Trước tiên chúng tôi gửi cho bạn một liên kết xác nhận, và mọi bản tin đều có liên kết hủy đăng ký. Sau khi bạn hủy đăng ký, chúng tôi không gửi bản tin nào nữa; nếu muốn xóa luôn địa chỉ email, hãy gửi email cho chúng tôi.

## Cookie và bộ nhớ trình duyệt {#cookies}

Website công khai và request đăng ký bản tin, thanh toán, kiểm tra mã giảm giá không đặt cookie riêng. Mở trang tài khoản đặt hai cookie thực sự cần thiết liệt kê bên dưới. Cloudflare Web Analytics không đặt cookie và không lưu gì trong trình duyệt. Cookie Google Analytics chỉ đặt khi bạn cho phép. Crisp đặt cookie trên mọi trang sau khi chat tải xong. Không thứ nào ở đây được dùng cho quảng cáo hay được bán.

- **`_ga` và `_ga_<ID>`** (cookie của Google Analytics, tối đa 2 năm, chỉ khi bạn cho phép phân tích): một mã ngẫu nhiên cho trình duyệt của bạn và trạng thái của lượt truy cập hiện tại. Khi bạn từ chối, hoặc đổi câu trả lời sau đó, các cookie này bị xóa. Cơ sở pháp lý: sự đồng ý.
- **`tablepro:analytics-consent`** (local storage, cho tới khi bạn xóa): câu trả lời của bạn cho câu hỏi về phân tích, để bạn không bị hỏi lại ở mỗi trang. Website và trang tài khoản dùng chung giá trị này. Cơ sở pháp lý: thực sự cần thiết để tôn trọng lựa chọn của bạn.
- **`tablepro:attribution`** (local storage, 90 ngày): bản ghi lần truy cập đầu tiên được mô tả trong mục [Website](#website). Bản ghi không chứa mã định danh nào của bạn và chỉ được gửi kèm yêu cầu thanh toán, nơi máy chủ của chúng tôi bỏ nó đi. Cơ sở pháp lý: lợi ích hợp pháp.
- **`theme`** và **`tablepro:banner-dismissed`** (local storage, cho tới khi bạn xóa): giao diện bạn chọn (sáng, tối hoặc theo hệ thống), và banner nào bạn đã đóng cùng thời hạn ẩn: 30 ngày, hoặc một năm nếu bạn cho biết đã có license hoặc vừa mua license. Cơ sở pháp lý: lợi ích hợp pháp.
- **`tablepro:language`** (local storage, cho tới khi bạn xóa): ngôn ngữ bạn chọn trong menu ngôn ngữ hoặc thanh gợi ý ngôn ngữ, và từng ngôn ngữ có gợi ý bạn đã đóng, để website không gợi ý lại. Cơ sở pháp lý: lợi ích hợp pháp.
- **`mintlify_anonymous_id`** (local storage trên docs.tablepro.app, do Mintlify đặt, chỉ khi bạn cho phép Google Analytics ở đó): ID người xem được mô tả trong mục [Website](#website). Từ chối sẽ xóa nó. Trang tài liệu giữ câu trả lời `tablepro:analytics-consent` của riêng nó. Cơ sở pháp lý: sự đồng ý.
- **Cookie có tên bắt đầu bằng `crisp-client/`** (của Crisp, ví dụ `crisp-client/session/…`; 6 tháng, được gia hạn khi bạn quay lại; được đặt trên mọi trang sau khi khung chat được tải): giữ khung chat và cuộc chat của bạn qua các trang và các lần truy cập. Cơ sở pháp lý: lợi ích hợp pháp, để hỗ trợ bạn trên mọi trang.
- **`tablepro-session` và `XSRF-TOKEN`** (cookie trang tài khoản, 2 giờ): giữ đăng nhập và bảo vệ form trước CSRF. Mở các trang khác của trang tài khoản, như xác nhận mua hàng và bản tin, cũng đặt cookie. Request đăng ký bản tin, thanh toán và kiểm tra mã giảm giá từ website công khai dùng omit credentials, không giữ cookie này. Cơ sở pháp lý: thực sự cần thiết.

Bạn có thể thay đổi hoặc rút lại câu trả lời về phân tích bất cứ lúc nào bằng **Cài đặt cookie** ở chân mọi trang, hoặc tại đây:

<cookie-settings></cookie-settings>

## Cơ sở pháp lý {#lawful-basis}

Với người đọc ở Khu vực Kinh tế Châu Âu (EEA) và Vương quốc Anh, cơ sở pháp lý theo GDPR và GDPR của Vương quốc Anh là:

- **Hợp đồng** (Điều 6(1)(b)): bán và cung cấp license, kiểm tra license, trang tài khoản và Team Library.
- **Lợi ích hợp pháp** (Điều 6(1)(f)): báo cáo sử dụng của ứng dụng cho Mac và việc tra quốc gia đi kèm, nhật ký các yêu cầu liên quan đến license, bảo mật và chống lạm dụng, nhật ký máy chủ web, Cloudflare Web Analytics, bản ghi nguồn truy cập khi mua hàng, việc tra quốc gia để gợi ý ngôn ngữ và giảm giá theo khu vực, và khung chat trực tuyến trên mọi trang.
- **Sự đồng ý** (Điều 6(1)(a)): cookie của Google Analytics, báo cáo sử dụng của ứng dụng cho iPhone và iPad, bản tin và các cuộc chat bạn bắt đầu trong chat trực tuyến.
- **Nghĩa vụ pháp lý** (Điều 6(1)(c)): hồ sơ thuế và kế toán, và việc trả lời các yêu cầu hợp pháp.

## Bên nhận dữ liệu {#sharing}

Chúng tôi chỉ chia sẻ dữ liệu cá nhân với các dịch vụ cần thiết để vận hành TablePro:

- **{merchant}**, merchant of record cho các giao dịch mua.
- **Một nhà cung cấp dịch vụ gửi email**, để gửi liên kết đăng nhập, biên nhận từ chúng tôi, lời mời vào nhóm và bản tin.
- **Nhà cung cấp hosting của chúng tôi và Cloudflare**, cho website, trang tài khoản và máy chủ mà các ứng dụng liên lạc. Cloudflare cũng đếm lượt xem trang bằng Cloudflare Web Analytics.
- **Google**, cho Google Analytics trên website, trang tài liệu và trang tài khoản.
- **Crisp**, cho chat trực tuyến trên mọi trang của website và trang tài khoản.
- **jsDelivr**, nơi trình duyệt của bạn tải script thanh toán của {merchant} khi bạn trỏ tới một nút Mua.
- **Mintlify**, nơi lưu trữ trang tài liệu docs.tablepro.app.
- **ip-api.com, ipinfo.io và geoplugin.net**, nhận địa chỉ IP từ các báo cáo sử dụng để tra quốc gia.
- **GitHub**, nơi lưu nguồn cập nhật, danh mục plugin và các bản tải về.

Chúng tôi không bán dữ liệu cá nhân và không chia sẻ dữ liệu đó với bên quảng cáo.

## Chuyển dữ liệu ra nước ngoài {#transfers}

Các dịch vụ nêu trên hoạt động ở nhiều quốc gia, nên dữ liệu của bạn có thể được xử lý bên ngoài quốc gia của bạn. {merchant}, Google, GitHub, Cloudflare và Mintlify xử lý dữ liệu tại Hoa Kỳ; Google làm việc này theo Khung bảo vệ quyền riêng tư dữ liệu EU-Hoa Kỳ (EU-US Data Privacy Framework) và các Điều khoản hợp đồng mẫu (Standard Contractual Clauses). Khi pháp luật yêu cầu, việc chuyển dữ liệu từ EEA và Vương quốc Anh dựa trên các Điều khoản hợp đồng mẫu hoặc một cơ chế được phê duyệt khác.

## Thời gian lưu dữ liệu {#retention}

- **Báo cáo sử dụng**, cùng địa chỉ IP và quốc gia đi kèm: chưa có thời hạn nào được đặt ra, và không có gì tự động xóa chúng.
- **Bản ghi license**: mã và tên của các máy Mac đã kích hoạt, cùng nhật ký các yêu cầu liên quan đến license kèm địa chỉ IP, được giữ trong thời gian license còn tồn tại. Không có gì tự động xóa chúng.
- **Đơn hàng**: được giữ cho mục đích thuế và kế toán.
- **Team Library**: cho tới khi được xuất bản lại, khi thành viên đã xuất bản bị xóa khỏi nhóm, hoặc khi bạn yêu cầu xóa. Thư viện vẫn còn sau khi license kết thúc.
- **Liên kết đăng nhập trang tài khoản**: hết hạn sau 15 phút và sau đó bị xóa. Mỗi phiên đăng nhập kéo dài 2 giờ.
- **Bản tin**: cho tới khi bạn hủy đăng ký, hoặc cho tới khi chúng tôi xóa địa chỉ theo yêu cầu của bạn.
- **Google Analytics**: dữ liệu ở cấp người dùng và cấp sự kiện được giữ 2 tháng, thời hạn lưu mặc định của Google mà property của chúng tôi đang dùng. Cookie của công cụ này tồn tại tối đa 2 năm, hoặc bị xóa khi bạn từ chối.
- **Cloudflare Web Analytics**: Cloudflare cho chúng tôi xem số liệu tổng về lượt xem trang trong sáu tháng gần nhất. Không có gì được lưu trong trình duyệt của bạn.
- **Chat trực tuyến và email hỗ trợ**: được Crisp và hộp thư của chúng tôi giữ cho tới khi bị xóa. Bạn có thể yêu cầu chúng tôi xóa các cuộc chat và email của bạn.
- **Nhật ký máy chủ web**: được giữ cho mục đích bảo mật và khắc phục sự cố. Chúng tôi chưa đặt thời hạn cố định cho các nhật ký này.

## Quyền của bạn {#rights}

Tùy theo nơi bạn sống, bạn có thể yêu cầu chúng tôi:

- cung cấp một bản sao dữ liệu cá nhân chúng tôi đang giữ về bạn (quyền truy cập);
- sửa dữ liệu đó (quyền chỉnh sửa);
- xóa dữ liệu đó (quyền xóa), trừ những gì pháp luật buộc chúng tôi phải giữ;
- giới hạn cách chúng tôi sử dụng dữ liệu (quyền hạn chế xử lý);
- gửi dữ liệu cho bạn ở định dạng có cấu trúc, máy đọc được (quyền di chuyển dữ liệu);
- ngừng sử dụng dữ liệu dựa trên lợi ích hợp pháp (quyền phản đối).

Bạn có thể rút lại sự đồng ý bất cứ lúc nào, và có thể khiếu nại tới cơ quan bảo vệ dữ liệu nơi bạn sống. Để thực hiện bất kỳ quyền nào trong số này, hãy gửi email tới [{email}](mailto:{email}). Chúng tôi trả lời trong vòng 30 ngày. Việc xóa dữ liệu được làm thủ công, vì vậy hãy cho chúng tôi biết yêu cầu liên quan tới địa chỉ email, license key hay thiết bị nào. Dữ liệu do {merchant}, Google, Crisp hoặc GitHub nắm giữ còn chịu sự điều chỉnh của chính sách riêng của họ.

**Cư dân California.** Đạo luật Quyền riêng tư người tiêu dùng California (CCPA) cho bạn quyền được biết chúng tôi thu thập thông tin cá nhân nào, yêu cầu chúng tôi xóa thông tin đó, từ chối việc bán thông tin đó, và không bị đối xử khác biệt khi thực hiện các quyền này. Chúng tôi không bán thông tin cá nhân.

## Trẻ em {#children}

TablePro không hướng tới trẻ em dưới 16 tuổi, và chúng tôi không cố ý thu thập dữ liệu cá nhân của trẻ em. Nếu bạn cho rằng một trẻ em đã cung cấp dữ liệu cá nhân cho chúng tôi, hãy liên hệ và chúng tôi sẽ xóa dữ liệu đó.

## Bảo mật {#security}

Lưu lượng giữa các ứng dụng, website, trang tài khoản và máy chủ của chúng tôi dùng HTTPS. Ngoại lệ là các lần tra quốc gia được mô tả trong mục [Báo cáo sử dụng](#mac-usage-report): chúng dùng HTTP không mã hóa. Liên kết đăng nhập trang tài khoản chỉ được lưu dưới dạng giá trị băm, và quyền truy cập vào hệ thống của chúng tôi chỉ dành cho {publisherName} và các nhà cung cấp dịch vụ được liệt kê trong mục [Bên nhận dữ liệu](#sharing). Không hệ thống nào an toàn tuyệt đối. Để báo một lỗ hổng bảo mật, hãy xem [trang Bảo mật](/vi/security#report) hoặc gửi email tới [{email}](mailto:{email}).

## Thay đổi chính sách {#changes}

Khi chính sách này thay đổi, chúng tôi cập nhật nó tại đây với ngày "Cập nhật lần cuối" mới, và thông báo trực tiếp cho bạn khi pháp luật yêu cầu.

## Liên hệ {#contact}

Với các câu hỏi về quyền riêng tư hoặc về chính sách này, hãy gửi email tới [{email}](mailto:{email}).
