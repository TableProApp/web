---
title: Chính sách quyền riêng tư
description: Ứng dụng, website và trang tài khoản của TablePro thu thập những gì, gửi đi đâu, lưu trong bao lâu, và cách bạn thay đổi hoặc xóa dữ liệu đó.
updatedAt: "2026-10-30"
---

Chính sách này áp dụng cho TablePro cho Mac, TablePro cho iPhone và iPad, website tablepro.app, trang tài liệu docs.tablepro.app và trang tài khoản account.tablepro.app. Chính sách mô tả đúng những gì từng thành phần đang gửi đi và lưu lại ở thời điểm hiện tại. Cả hai ứng dụng đều là mã nguồn mở theo giấy phép AGPLv3, nên bạn có thể đọc phần mã gửi đi mọi dữ liệu nêu dưới đây trong [kho mã nguồn TablePro]({github}).

## Tóm tắt {#summary}

- Ứng dụng cho Mac gửi dữ liệu sử dụng. Tính năng này bật sẵn và bạn có thể tắt. Ứng dụng cho iPhone và iPad chỉ gửi báo cáo sử dụng khi bạn bật nó lên.
- Nếu bạn đăng nhập tài khoản TablePro hoặc kích hoạt license key, ứng dụng cho Mac đăng ký máy Mac của bạn với máy chủ của chúng tôi, kèm tên máy, và định kỳ kiểm tra gói của bạn với máy chủ.
- Các query bạn chạy, kết quả trả về và mật khẩu của bạn không được gửi cho TablePro. Ngoại lệ duy nhất là những gì bạn chủ động xuất bản lên Team Library: cấu hình connection (không bao giờ gồm mật khẩu) và query đã lưu.
- Yêu cầu gửi tới AI đi thẳng từ ứng dụng cho Mac tới nhà cung cấp AI mà bạn thiết lập, không qua chúng tôi.
- Từ phiên bản có tài khoản TablePro, ứng dụng cho Mac gửi dữ liệu sử dụng thẳng tới PostHog, dịch vụ phân tích sản phẩm của chúng tôi đặt tại EU, nên PostHog nhận được địa chỉ IP của máy Mac của bạn và suy ra vị trí gần đúng từ địa chỉ đó. Các phiên bản trước đó và ứng dụng cho iPhone và iPad gửi báo cáo sử dụng tới máy chủ của chúng tôi, và máy chủ chuyển báo cáo sang PostHog, không kèm địa chỉ IP. Tài khoản của bạn giữ nhật ký các thay đổi trên tài khoản, như các lần đăng nhập và thiết bị mới, kèm địa chỉ IP và trình duyệt của request tạo ra từng thay đổi.
- Website đếm lượt xem trang bằng Cloudflare Web Analytics, công cụ này không đặt cookie. Website cũng tải Google Analytics, công cụ này chỉ đặt cookie khi bạn cho phép. Mọi trang cũng tải chat trực tuyến của chúng tôi, Crisp, và Crisp đặt cookie riêng của mình.
- Trang tài khoản tại account.tablepro.app không tải script phân tích nào. Trang này đặt một cookie để giữ đăng nhập, và trong phần Cài đặt bạn có thể tải về dữ liệu tài khoản hoặc xóa tài khoản.
- Việc mua license do {merchant}, merchant of record của chúng tôi, thực hiện.

## Bên chịu trách nhiệm {#controller}

{publisherName}, một lập trình viên độc lập tại {publisherCity}, {publisherCountry}, là người phát hành các ứng dụng TablePro và website này, và chịu trách nhiệm về dữ liệu cá nhân được mô tả ở đây (bên kiểm soát dữ liệu). Mọi câu hỏi về chính sách này hoặc về dữ liệu của bạn, hãy gửi email tới [{email}](mailto:{email}).

## TablePro cho Mac {#mac-app}

### Dữ liệu sử dụng {#mac-usage-report}

Từ phiên bản có tài khoản TablePro, ứng dụng cho Mac gửi dữ liệu sử dụng thẳng tới PostHog, dịch vụ phân tích sản phẩm của chúng tôi, tại `eu.i.posthog.com` ở EU. **Tính năng này bật sẵn, và ứng dụng không hỏi bạn trước khi gửi sự kiện đầu tiên.** Để tắt, mở **Cài đặt > Tổng quát > Quyền riêng tư** (Settings > General > Privacy) và bỏ chọn **Chia sẻ dữ liệu sử dụng** (Share usage data). Khi tùy chọn này tắt, ứng dụng không gửi gì cho PostHog, và nếu ứng dụng khởi động lúc tùy chọn đang tắt, thư viện của PostHog hoàn toàn không được khởi chạy.

Ứng dụng gửi một sự kiện:

- mỗi ngày một lần khi đang chạy, kèm tên các loại cơ sở dữ liệu của những connection bạn đang mở (ví dụ "PostgreSQL") và số connection đang mở;
- khi bạn thử kết nối lần đầu, khi kết nối thành công lần đầu và khi bạn chạy query đầu tiên, mỗi sự kiện kèm loại cơ sở dữ liệu;
- khi ứng dụng báo một tính năng trả phí không dùng được, mỗi tính năng một lần trong mỗi lần chạy ứng dụng, kèm tên tính năng và lý do, chẳng hạn bạn chưa đăng nhập;
- khi bạn bấm nâng cấp, kèm nơi trong ứng dụng mà bạn bấm;
- khi bạn đăng nhập, kèm cách đăng nhập (trong ứng dụng, bằng license key, hoặc bằng việc đổi key đã có trên máy Mac), và khi bạn đăng xuất.

Thư viện của PostHog thêm vào mọi sự kiện model máy Mac, kích thước màn hình, múi giờ và ngôn ngữ của máy, máy có đang dùng Wi-Fi hay không, phiên bản, số build và bundle ID của ứng dụng, phiên bản macOS, phiên bản của thư viện và một mã phiên ngẫu nhiên. PostHog nhận địa chỉ IP của máy Mac của bạn trong mỗi request và suy ra vị trí gần đúng từ địa chỉ đó, chẳng hạn quốc gia và thành phố. Khi tùy chọn này bật, thư viện còn lấy cấu hình và feature flag từ PostHog (`/config` từ `eu-assets.i.posthog.com` và `/flags` từ `eu.i.posthog.com`).

Trước khi bạn đăng nhập, các sự kiện mang một mã ngẫu nhiên do thư viện tạo trên máy Mac của bạn, và PostHog không tạo hồ sơ cá nhân nào cho mã đó. Khi bạn đăng nhập, các sự kiện mang mã tài khoản của bạn, và hồ sơ của tài khoản đó trên PostHog lưu phiên bản ứng dụng và macOS, kiến trúc bộ xử lý, ngôn ngữ của ứng dụng và vị trí gần đúng mà PostHog suy ra từ địa chỉ IP. Nhờ đó các lần cài đặt được nối với các lần đăng nhập và mua hàng của bạn. Đăng xuất sẽ tạo một mã ngẫu nhiên mới. Dữ liệu sử dụng của ứng dụng không còn kèm mã máy, trạng thái kích hoạt license hay cài đặt cập nhật của bạn.

Các phiên bản trước khi có tài khoản TablePro thì gửi báo cáo sử dụng tới `api.tablepro.app`, theo cùng tùy chọn, khoảng mười giây sau khi khởi động, rồi mỗi ngày một lần khi đang chạy. Một báo cáo gồm:

- mã máy (machine ID): giá trị băm SHA-256 của UUID phần cứng máy Mac (bản thân UUID không bao giờ được gửi đi);
- nền tảng, phiên bản ứng dụng, phiên bản macOS, kiến trúc bộ xử lý và ngôn ngữ của ứng dụng;
- tên các loại cơ sở dữ liệu của những connection bạn đang mở (ví dụ "PostgreSQL") và số connection đang mở;
- license đã được kích hoạt hay chưa;
- ngày giờ bạn thử kết nối lần đầu và ngày giờ kết nối thành công lần đầu;
- cài đặt cập nhật của bạn (cách cài bản cập nhật và tần suất kiểm tra). Máy chủ của chúng tôi bỏ các thông tin này ngay khi nhận báo cáo.

Cả sự kiện lẫn báo cáo đều không bao giờ chứa hostname, username, mật khẩu, query hay dữ liệu trong các dòng.

Máy chủ của chúng tôi không lưu báo cáo, cũng không lưu địa chỉ IP gửi báo cáo. Máy chủ chuyển báo cáo sang PostHog dưới dạng một sự kiện về mã máy, kèm quốc gia mà Cloudflare cho biết cho kết nối của bạn, không kèm license key hay địa chỉ IP của bạn, và PostHog không tạo hồ sơ cá nhân nào từ đó. Vì tài khoản của bạn ghi các thiết bị theo cùng mã máy, báo cáo từ một máy Mac mà bạn đã đăng nhập hoặc kích hoạt license có thể được liên kết với tài khoản của bạn.

### Kiểm tra license {#mac-license}

Các phiên bản trước khi có tài khoản TablePro chỉ liên hệ máy chủ license của chúng tôi sau khi bạn nhập license key. Các phiên bản này làm việc đó khi bạn kích hoạt license, khi khởi động nếu đã qua {revalidateDays} ngày trở lên kể từ lần kiểm tra trước, và sau đó cứ mỗi {revalidateDays} ngày. Mỗi lần kiểm tra gửi:

- license key của bạn;
- mã máy nêu ở mục [Dữ liệu sử dụng](#mac-usage-report);
- tên máy Mac của bạn, theo cài đặt trong macOS (thường có chứa tên của bạn);
- phiên bản ứng dụng và phiên bản macOS.

Khi hủy kích hoạt một máy Mac, ứng dụng chỉ gửi license key và mã máy.

Máy chủ của chúng tôi giữ mỗi máy Mac đã kích hoạt như một thiết bị của tài khoản sở hữu license: mã máy và tên máy, phiên bản ứng dụng và macOS, và thời điểm máy liên lạc gần nhất. Việc kích hoạt và hủy kích hoạt một máy Mac được ghi vào nhật ký kiểm tra (audit log) của tài khoản đó, kèm địa chỉ IP và user agent của request; các lần kiểm tra định kỳ thì không. Trang tài khoản liệt kê các thiết bị của bạn theo tên. Nếu không liên lạc được với máy chủ của chúng tôi, các tính năng trả phí vẫn hoạt động trong {graceDays} ngày kể từ lần kiểm tra thành công gần nhất.

### Tài khoản TablePro {#mac-account}

Từ phiên bản có tài khoản TablePro, bạn đăng nhập ứng dụng cho Mac bằng [tài khoản TablePro](#account) thay cho license key. Ứng dụng mở trang đăng nhập trong một cửa sổ trình duyệt, nơi bạn có thể gõ mã trong email đăng nhập. Sau khi bạn đăng nhập, ứng dụng đăng ký máy Mac làm thiết bị của tài khoản: mã máy nêu ở trên, tên máy Mac của bạn, nền tảng, và phiên bản ứng dụng và macOS. Sau đó, mỗi ngày một lần khi đang chạy, ứng dụng lấy gói của bạn từ máy chủ dưới dạng một tệp có chữ ký, và tệp này giữ các tính năng trả phí hoạt động tới {offlineDays} ngày mà không cần máy chủ. Token giữ ứng dụng ở trạng thái đăng nhập chỉ được lưu trong Keychain của chính máy Mac đó và không bao giờ đồng bộ qua iCloud Keychain, kể cả khi bạn bật đồng bộ mật khẩu.

License key đã có trên máy Mac được đổi một lần lấy phiên đăng nhập vào tài khoản sở hữu key đó, rồi bị xóa khỏi máy. Thiết bị không liên lạc trong 180 ngày sẽ bị gỡ. Bạn có thể gỡ thiết bị trong ứng dụng hoặc trên trang tài khoản, và lần đầu một máy Mac dùng license của bạn, chúng tôi sẽ báo cho bạn qua email.

### Team Library {#library}

Team Library là một phần của license Team. Khi bạn chọn **Chia sẻ > Xuất bản lên thư viện nhóm…** (Share > Publish to Team Library…) trên một connection, hoặc **Xuất bản truy vấn đã lưu cho nhóm…** (Publish Saved Queries to Team…) trong sidebar Favorites, ứng dụng cho Mac tải lên máy chủ của chúng tôi những gì bạn xuất bản:

- cấu hình connection: host, port, tên cơ sở dữ liệu, username, cài đặt SSH và SSL, tùy chọn driver, startup command, cài đặt Tunnel Command, mức Safe Mode và cài đặt AI, nhưng không bao giờ gồm mật khẩu;
- query đã lưu: tên, nội dung SQL, từ khóa và thư mục.

Từ phiên bản có tài khoản TablePro, ứng dụng cho Mac của mỗi thành viên có seat tải các thay đổi của thư viện về khi khởi động, cứ 15 phút một lần và sau mỗi lần xuất bản. Khi xuất bản, ứng dụng chỉ gửi những gì đã thay đổi và chỉ gỡ những mục mà máy Mac đó đã xuất bản nhưng không còn giữ. Nếu người khác đã sửa một mục trước, ứng dụng hỏi bạn giữ bản nào, và hiển thị người sửa gần nhất của từng query của nhóm. Các phiên bản trước khi có tài khoản TablePro tải thư viện về khi khởi động, tối đa mỗi tuần một lần, và máy Mac vừa xuất bản tải lại ngay sau đó. Xuất bản lại từ các phiên bản này sẽ thay thế những gì bạn đã xuất bản trước đó. Mục Library trên trang tài khoản hiển thị từng mục, kèm tên người sửa gần nhất, cho các thành viên được đọc thư viện, và cho phép chủ sở hữu và quản trị viên xóa mục. Mục đã xóa còn trên máy chủ của chúng tôi 90 ngày để mọi máy Mac đồng bộ được việc xóa. Nếu license kết thúc, thư viện vẫn nằm trên máy chủ của chúng tôi cho tới khi chủ sở hữu nhóm xóa nhóm, và thư viện bị xóa theo.

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

Mật khẩu được lưu trong Keychain của macOS. Danh sách connection, lịch sử query, Query Insights, các bản chụp của Data Rewind, cài đặt và các tab đang mở được lưu trên máy Mac của bạn. Ứng dụng chỉ tham chiếu tới SSH key ở đúng vị trí của chúng trên ổ đĩa và không sao chép chúng. Các phiên bản trước khi có tài khoản TablePro không chứa công cụ báo lỗi (crash reporter) nào và không có thư viện phân tích của bên thứ ba. Từ phiên bản có tài khoản TablePro, ứng dụng có thư viện của PostHog, dùng để gửi dữ liệu sử dụng nêu ở trên. Thư viện này có công cụ báo lỗi (crash reporter) của PostHog, nhưng ứng dụng luôn để nó tắt, nên không gửi báo cáo lỗi nào. Thư viện lưu mã ngẫu nhiên, cấu hình và các sự kiện chưa gửi của nó trong các tệp dưới `~/Library/Application Support/com.TablePro`.

## TablePro cho iPhone và iPad {#ios-app}

**Không có gì được gửi tới TablePro trừ khi bạn bật Chia sẻ dữ liệu sử dụng** (Share Usage Data), khi ứng dụng khởi động lần đầu hoặc sau đó trong **Cài đặt > Quyền riêng tư** (Settings > Privacy). Nếu bạn bật, ứng dụng gửi một báo cáo mỗi ngày tới cùng máy chủ với các phiên bản ứng dụng cho Mac trước khi có tài khoản TablePro, và máy chủ của chúng tôi chuyển báo cáo sang PostHog theo cùng cách, không kèm địa chỉ IP. Báo cáo gồm giá trị băm SHA-256 của mã định danh mà Apple cấp cho ứng dụng trên thiết bị của bạn, nền tảng, phiên bản ứng dụng và iOS, kiến trúc bộ xử lý, ngôn ngữ của ứng dụng, tên các loại cơ sở dữ liệu của những connection bạn đang mở, số connection đang mở, và ngày giờ bạn thử kết nối lần đầu, kết nối thành công lần đầu và chạy query đầu tiên. Báo cáo không có cài đặt cập nhật và luôn ghi là chưa kích hoạt license nào, vì ứng dụng không có cả hai.

Ứng dụng không kiểm tra license, không kiểm tra cập nhật và không gửi yêu cầu nào về plugin. Ngoài báo cáo tùy chọn nói trên, ứng dụng chỉ kết nối tới cơ sở dữ liệu và máy chủ SSH của bạn, tới iCloud của Apple nếu bạn bật iCloud Sync, và tới Microsoft khi một connection SQL Server đăng nhập bằng Microsoft Entra ID.

Trên thiết bị, mật khẩu và SSH key bạn dán vào được lưu trong Keychain, còn chứng chỉ không bao giờ được đồng bộ. Lịch sử query nằm lại trên thiết bị. Các connection của bạn được thêm vào chỉ mục Spotlight trên thiết bị để bạn tìm kiếm. Khi một query đang chạy, Hoạt động trực tiếp của nó hiển thị câu SQL trên Màn hình khóa và trong Dynamic Island khi mở rộng, trừ khi bạn bật **Cài đặt > Hoạt động trực tiếp > Ẩn truy vấn** (Settings > Live Activities > Hide Query).

Nếu bạn chia sẻ dữ liệu phân tích với nhà phát triển ứng dụng trong phần cài đặt của iPhone hoặc iPad, Apple có thể chuyển báo cáo lỗi và số liệu sử dụng cho chúng tôi qua App Store Connect. Bản thân ứng dụng không có công cụ báo lỗi và không có thư viện phân tích của bên thứ ba.

## iCloud Sync và Handoff {#icloud}

iCloud Sync tắt cho tới khi bạn bật, trên Mac cũng như trên iPhone và iPad. Khi bật, các bản ghi được lưu vào một cơ sở dữ liệu riêng trong tài khoản iCloud của chính bạn (container `iCloud.com.TablePro`). TablePro không đọc được chúng.

- Trên Mac, bạn chọn những gì được đồng bộ: connection, nhóm và tag, cài đặt, SSH profile, credential profile (tên và username, không bao giờ gồm mật khẩu), table và cơ sở dữ liệu yêu thích, query đã lưu (kể cả nội dung SQL) và thư mục table. Một bản ghi connection gồm host, port, username, tên cơ sở dữ liệu, cài đặt SSH và SSL, lệnh khởi động, script chạy trước khi kết nối và quy tắc AI. Lịch sử query, các bản chụp của Data Rewind và nguồn mật khẩu không bao giờ được đồng bộ.
- iPhone và iPad đồng bộ connection, nhóm và tag.
- Mật khẩu chỉ được đồng bộ nếu bạn bật thêm mục **Mật khẩu** (Passwords) trong Danh mục đồng bộ (Sync Categories) trên Mac, hoặc **Đồng bộ mật khẩu** (Sync Passwords) trên iPhone và iPad, tính năng dùng iCloud Keychain. Trên Mac, tùy chọn này cũng đồng bộ các thông tin bí mật khác mà TablePro giữ trong Keychain, chẳng hạn API key của nhà cung cấp AI và license key. Từ phiên bản có tài khoản TablePro, license key bị xóa ngay khi được đổi lấy phiên đăng nhập, và token giữ ứng dụng ở trạng thái đăng nhập không bao giờ được đồng bộ.

Trên Mac, iCloud Sync thuộc license Starter hoặc Team. Trên iPhone và iPad, tính năng này miễn phí.

Handoff chuyển mã của connection đang mở và tên của table đang mở giữa các thiết bị của chính bạn, thông qua Apple. Khi chưa mở table nào, Handoff chuyển tên của connection thay cho tên table, hoặc host nếu connection không có tên. Handoff không gửi cài đặt hay thông tin đăng nhập nào.

## Website {#website}

**Lưu trữ.** Website và trang tài khoản chạy trên máy chủ của chúng tôi, phía sau Cloudflare. Như mọi máy chủ web, chúng nhận địa chỉ IP, user agent của trình duyệt và địa chỉ của từng trang bạn yêu cầu.

**Cloudflare Web Analytics.** Cloudflare chèn script Web Analytics của mình vào các trang của website; trang tài khoản không chạy script này. Trình duyệt của bạn tải script này từ `static.cloudflareinsights.com`, và script báo cho Cloudflare từng lượt xem trang: trang được xem, trang web đã dẫn bạn tới, thời gian tải trang, cùng trình duyệt, hệ điều hành và loại thiết bị của bạn. Cloudflare bổ sung quốc gia nơi kết nối của bạn xuất phát. Script này không đặt cookie và không lưu gì trong trình duyệt của bạn, và Cloudflare cho biết dịch vụ này không dùng địa chỉ IP hay thông tin trình duyệt để nhận dạng bạn (fingerprinting). Cloudflare chỉ cho chúng tôi xem số liệu tổng, chẳng hạn số lượt xem theo từng trang hoặc từng quốc gia, chứ không có bản ghi về từng người truy cập. Cơ sở pháp lý: lợi ích hợp pháp.

**Google Analytics.** Website tải Google Analytics trên mọi trang ở chế độ Consent Mode. Cho tới khi bạn chọn **Cho phép** trong câu hỏi về cookie, công cụ này không đặt cookie nào và chỉ gửi cho Google một tín hiệu không dùng cookie cho mỗi trang, không lưu mã định danh nào trên thiết bị của bạn. Nếu bạn cho phép, Google Analytics đặt cookie `_ga` và `_ga_<ID>` và đo các lượt truy cập của bạn, chẳng hạn những trang bạn xem, các lượt bấm tải về và việc bắt đầu thanh toán. Lưu trữ cho quảng cáo, cá nhân hóa quảng cáo và dữ liệu người dùng cho quảng cáo luôn bị từ chối. Google cho biết Google Analytics 4 không ghi lại và không lưu địa chỉ IP. Property Google Analytics của chúng tôi dùng thời hạn lưu mặc định của Google: Google xóa dữ liệu ở cấp người dùng và cấp sự kiện sau 2 tháng. Các báo cáo tiêu chuẩn của Google, vốn chứa số liệu tổng chứ không chứa mã định danh, không bị ảnh hưởng. Cơ sở pháp lý: sự đồng ý của bạn đối với cookie.

**Chat trực tuyến.** Mọi trang của website và trang tài khoản đều có nút chat của nhà cung cấp dịch vụ chat của chúng tôi, Crisp. Sau khi trang tải xong, trình duyệt tải script của Crisp từ `client.crisp.chat`, và Crisp đặt các cookie được nêu trong mục [Cookie và bộ nhớ trình duyệt](#cookies). Crisp nhận địa chỉ IP, thông tin trình duyệt, địa chỉ các trang bạn xem và các tin nhắn bạn viết, và giữ lại địa chỉ IP của bạn nếu bạn bắt đầu một cuộc chat. Chúng tôi cho Crisp biết ngôn ngữ của trang. Khi bạn đã đăng nhập trang tài khoản, chúng tôi cũng cung cấp cho Crisp địa chỉ email và ID tài khoản của bạn, để gắn cuộc chat với tài khoản đó. Ngoài ra chúng tôi không cung cấp thông tin nào khác về bạn. Crisp có trụ sở tại Pháp.

**Script thanh toán.** Khi bạn trỏ chuột hoặc dùng phím Tab tới một nút Mua, trình duyệt tải script thanh toán của {merchant} từ jsDelivr (`cdn.jsdelivr.net`), và jsDelivr nhận địa chỉ IP cùng thông tin trình duyệt của bạn. Bản thân trang thanh toán của {merchant} chỉ mở khi bạn bấm.

**Kiểm tra khi đăng ký bản tin.** Khi bạn bắt đầu điền form đăng ký bản tin, trình duyệt tải Cloudflare Turnstile từ `challenges.cloudflare.com` để kiểm tra rằng người đăng ký là người thật; Cloudflare nhận địa chỉ IP và thông tin trình duyệt của bạn.

**Nguồn truy cập khi mua hàng.** Khi bạn vào website, trình duyệt giữ một bản ghi về lần truy cập đầu tiên, tên là `tablepro:attribution`, trong local storage trong 90 ngày: nguồn của lượt truy cập (các tag `ref` hoặc `utm_*` trên liên kết bạn đã theo, hoặc trang web đã dẫn bạn tới), trang bạn vào đầu tiên và thời điểm đó. Nếu bạn bắt đầu mua hàng, bản ghi này được gửi kèm yêu cầu thanh toán. Máy chủ của chúng tôi chuyển nguồn của lượt truy cập cho {merchant} dưới dạng metadata của lần thanh toán, giữ nó cùng đơn hàng sau khi bạn trả tiền, và gửi nó tới PostHog cùng sự kiện bắt đầu thanh toán và thanh toán xong. Trang bạn vào đầu tiên và thời điểm không được giữ.

**Tài liệu.** Trang tài liệu docs.tablepro.app do Mintlify lưu trữ. Mintlify nhận địa chỉ IP và thông tin trình duyệt của bạn với mỗi trang, và các trang tải font từ Google Fonts. Thanh điều hướng hiển thị số star của repository, do trình duyệt của bạn lấy từ API của GitHub, nên GitHub cũng nhận địa chỉ IP và thông tin trình duyệt của bạn. Yêu cầu đó không đặt cookie. Trang tài liệu có câu hỏi về cookie của riêng nó, vì nó không đọc được câu trả lời bạn đã chọn trên website này. Cho tới khi bạn chọn **Allow** ở đó, trang không đặt cookie và không giữ ID người xem nào. Nếu bạn cho phép, Google Analytics đặt cookie `_ga` và `_ga_<ID>` và đo các lượt xem tài liệu của bạn, còn Mintlify giữ một ID người xem ngẫu nhiên, `mintlify_anonymous_id`, trong local storage để đếm các lượt đó. **Cookie settings** ở cuối trang tài liệu cho bạn đổi câu trả lời, và khi bạn từ chối thì cả hai bị xóa. Cơ sở pháp lý: sự đồng ý của bạn.

**Ngôn ngữ và giảm giá theo khu vực.** Để gợi ý trang bằng ngôn ngữ của bạn khi trình duyệt không nêu ngôn ngữ nào website có, và để hiển thị mức giảm giá theo khu vực mà bước thanh toán sẽ áp dụng, website hỏi Cloudflare (`/cdn-cgi/trace`) và máy chủ của chúng tôi về quốc gia mà kết nối của bạn đến từ đó, và có thể đọc múi giờ của thiết bị. Cả hai request đều không mang cookie, và trang không giữ lại gì từ các câu trả lời. Cơ sở pháp lý: lợi ích hợp pháp.

Đọc website không đặt cookie riêng. Request đăng ký bản tin, thanh toán và kiểm tra mã giảm giá từ website công khai dùng chế độ omit credentials: không gửi cookie trang tài khoản và không nhận cookie từ response. Mở trang tài khoản là việc riêng: đăng nhập ở đó sẽ đặt cookie liệt kê bên dưới. Mọi thứ website giữ trong trình duyệt được liệt kê trong mục [Cookie và bộ nhớ trình duyệt](#cookies).

## Mua hàng {#purchases}

License được bán bởi {merchant} (Polar Software, Inc.), merchant of record kiêm đơn vị bán lại của chúng tôi. Bạn mua hàng từ {merchant} theo điều khoản dành cho người mua và chính sách quyền riêng tư của chính {merchant}. {merchant} nhận thanh toán, tính và nộp thuế bán hàng hoặc VAT nếu có, gửi biên nhận và hóa đơn, và xử lý các vấn đề cũng như tranh chấp về thanh toán. {merchant} thu thập tên, địa chỉ email, địa chỉ thanh toán và thông tin thanh toán của bạn. Chúng tôi không bao giờ thấy đầy đủ thông tin thẻ của bạn.

Khi bạn bắt đầu thanh toán, máy chủ của chúng tôi cho {merchant} biết bạn mua gì, ngôn ngữ của trang bạn mua hàng, nguồn của lượt truy cập (xem mục [Website](#website)) và địa chỉ IP của bạn, mà {merchant} dùng để tính thuế và đơn vị tiền tệ. Từ {merchant}, chúng tôi nhận địa chỉ email, tên và địa chỉ thanh toán như bạn đã nhập, sản phẩm bạn mua, số tiền, mã đơn hàng và mã gói thuê bao, cùng các thay đổi sau đó như gia hạn, hủy và hoàn tiền. Với mỗi đơn hàng, chúng tôi giữ địa chỉ email, quốc gia thanh toán và số tiền.

Một lần mua không đăng nhập sẽ thuộc về tài khoản TablePro của địa chỉ email bạn dùng để mua; nếu chưa có, tài khoản được tạo mới và ở trạng thái chưa xác minh cho tới khi bạn đăng nhập lần đầu. Trên [trang tài khoản]({account}), bạn có thể đổi chu kỳ thanh toán hoặc số seat của gói thuê bao, hủy hoặc tiếp tục gói, và yêu cầu hoàn tiền. Khi bạn hủy, lý do bạn chọn và nhận xét bạn viết (nếu có) được gửi tới {merchant} và được giữ cùng gói thuê bao. Thẻ, hóa đơn, thông tin thuế và địa chỉ thanh toán nằm trong [cổng khách hàng của {merchant}]({portal}), mà trang tài khoản mở giúp bạn. Việc hoàn tiền được mô tả trong [chính sách hoàn tiền](/vi/refund-policy), còn những gì một license cho phép được nêu trong [điều khoản sử dụng](/vi/terms).

## Trang tài khoản {#account}

[Trang tài khoản]({account}) tại account.tablepro.app là nơi bạn quản lý tài khoản TablePro: license, thiết bị, thanh toán và nhóm. Trang chạy trên máy chủ của chúng tôi, phía sau Cloudflare, giống website.

**Tài khoản của bạn.** Mỗi tài khoản thuộc về một người và được xác định bằng một địa chỉ email. Tài khoản giữ địa chỉ đó, tên và ngôn ngữ bạn đặt, các cách đăng nhập của bạn, các thiết bị đã đăng nhập, license và đơn hàng của bạn, các nhóm bạn tham gia cùng vai trò và seat của bạn, và nhật ký kiểm tra (audit log) các thay đổi trên tài khoản, như các lần đăng nhập, thiết bị mới và thay đổi trong nhóm, kèm địa chỉ IP và trình duyệt của request tạo ra từng thay đổi. Email của chúng tôi tới bạn bằng ngôn ngữ của tài khoản.

**Đăng nhập.** Chúng tôi gửi cho bạn qua email một liên kết và một mã 6 chữ số: liên kết dùng được một lần, mã cho phép thử 5 lần, và cả hai hết hạn sau 15 phút. Bạn cũng có thể thêm passkey; với mỗi passkey, chúng tôi giữ public key, tên bạn đặt, việc passkey có đồng bộ giữa các thiết bị của bạn hay không, và thời điểm thêm và dùng gần nhất. Hoặc bạn có thể đăng nhập bằng Apple, GitHub hoặc Google: nhà cung cấp cho chúng tôi biết một mã định danh của bạn và địa chỉ email đã xác minh, còn Apple cho biết thêm tên bạn ở lần đầu. Chúng tôi giữ mã định danh và địa chỉ đó cùng tài khoản của bạn, và với Apple là một token mà chúng tôi lưu ở dạng mã hóa và thu hồi với Apple khi bạn gỡ liên kết Apple hoặc xóa tài khoản. Nếu địa chỉ từ nhà cung cấp thuộc về một tài khoản đã có, chúng tôi gửi tới tài khoản đó một liên kết và một mã để xác nhận trước khi liên kết, trừ khi Google quản lý địa chỉ đó (Gmail hoặc Google Workspace).

**Nhóm của bạn.** Khi bạn mời một người vào nhóm, chúng tôi lưu địa chỉ email, vai trò của người đó và việc lời mời có kèm seat hay không, rồi gửi cho họ một liên kết có hiệu lực 7 ngày. Chủ sở hữu và quản trị viên thấy các thành viên nhóm cùng tên và địa chỉ email, các lời mời, và nhật ký kiểm tra của nhóm, cho biết ai đã đổi gì trong nhóm, kể cả các địa chỉ được mời, nhưng không bao giờ có địa chỉ IP hay trình duyệt. Thành viên thấy nhóm, gói của nhóm, số seat và vai trò của chính mình.

**Dữ liệu của bạn.** Trong phần Cài đặt, bạn có thể đổi tên, địa chỉ email và ngôn ngữ, thêm và gỡ cách đăng nhập, tải về dữ liệu tài khoản dưới dạng tệp JSON, và xóa tài khoản. Bạn không thể xóa tài khoản khi đang là chủ sở hữu một nhóm còn thành viên khác. Xóa tài khoản sẽ gỡ các cách đăng nhập, thiết bị, license, tư cách thành viên nhóm và các nhóm chỉ có mình bạn, và kết thúc các gói thuê bao của bạn mà không hoàn tiền. Những gì chúng tôi giữ sau đó được nêu trong mục [Thời gian lưu dữ liệu](#retention).

**Những gì trang tài khoản tải.** Trang tài khoản không tải Google Analytics, Cloudflare Web Analytics hay script phân tích nào khác, và không hỏi về cookie. Trang hiển thị khung chat trực tuyến của Crisp được mô tả trong mục [Website](#website), và một lần mua trên trang sẽ mở trang thanh toán của {merchant} phía trên trang. Trang báo lỗi và thời gian tải trang tới Grafana Cloud bằng Grafana Faro: lỗi, màn hình nơi lỗi xảy ra (không bao giờ là địa chỉ đầy đủ, vốn có thể chứa token của một liên kết), trình duyệt và hệ điều hành của bạn, và một mã ngẫu nhiên cho lượt truy cập của bạn.

## Bản tin {#newsletter}

Nếu bạn đăng ký nhận ghi chú phát hành, trước tiên chúng tôi gửi cho bạn một liên kết xác nhận bằng ngôn ngữ của trang bạn dùng để đăng ký. Liên kết có hiệu lực 7 ngày, và mỗi địa chỉ nhận tối đa 3 liên kết mỗi ngày. Khi bạn xác nhận, địa chỉ của bạn vào danh sách bản tin của chúng tôi tại Resend, dịch vụ gửi email của chúng tôi. Mọi bản tin đều có liên kết hủy đăng ký, do Resend xử lý. Sau khi bạn hủy đăng ký, chúng tôi không gửi bản tin nào nữa; nếu muốn xóa luôn địa chỉ email, hãy gửi email cho chúng tôi. Cloudflare Turnstile kiểm tra form đăng ký, như mô tả trong mục [Website](#website).

Khi chuyển từ máy chủ trước đây, mọi địa chỉ chưa hủy đăng ký trong danh sách email của máy chủ đó đều được đưa vào danh sách này ở trạng thái đã đăng ký, dù đã xác nhận hay chưa: máy chủ đó cũng đã thêm địa chỉ của người mua, người giữ license và người đăng ký dùng thử bản beta, và gửi email cho họ. Các địa chỉ đã hủy đăng ký được chuyển sang ở trạng thái đã hủy, còn các địa chỉ có email bị trả về hoặc bị đánh dấu là spam được đưa vào danh sách chặn của Resend thay vào đó, nên không bản tin nào tới được các địa chỉ này.

## Cookie và bộ nhớ trình duyệt {#cookies}

Website công khai và request đăng ký bản tin, thanh toán, kiểm tra mã giảm giá không đặt cookie riêng. Đăng nhập trang tài khoản, hoặc bắt đầu đăng nhập, đặt cookie thực sự cần thiết duy nhất liệt kê bên dưới. Cloudflare Web Analytics không đặt cookie và không lưu gì trong trình duyệt. Cookie Google Analytics chỉ đặt khi bạn cho phép. Crisp đặt cookie trên mọi trang sau khi chat tải xong. Không thứ nào ở đây được dùng cho quảng cáo hay được bán.

- **`_ga` và `_ga_<ID>`** (cookie của Google Analytics, tối đa 2 năm, chỉ khi bạn cho phép phân tích): một mã ngẫu nhiên cho trình duyệt của bạn và trạng thái của lượt truy cập hiện tại. Khi bạn từ chối, hoặc đổi câu trả lời sau đó, các cookie này bị xóa. Cơ sở pháp lý: sự đồng ý.
- **`tablepro:analytics-consent`** (local storage, cho tới khi bạn xóa): câu trả lời của bạn cho câu hỏi về phân tích, để bạn không bị hỏi lại ở mỗi trang. Trang tài khoản không chạy công cụ phân tích nào, nên không hỏi câu này và không đọc câu trả lời. Cơ sở pháp lý: thực sự cần thiết để tôn trọng lựa chọn của bạn.
- **`tablepro:attribution`** (local storage, 90 ngày): bản ghi lần truy cập đầu tiên được mô tả trong mục [Website](#website). Bản ghi không chứa mã định danh nào của bạn và chỉ được gửi kèm yêu cầu thanh toán, và máy chủ của chúng tôi chuyển nguồn của lượt truy cập cho {merchant}. Cơ sở pháp lý: lợi ích hợp pháp.
- **`theme`** (local storage, cho tới khi bạn xóa): giao diện bạn chọn (sáng, tối hoặc theo hệ thống). Trang tài khoản giữ lựa chọn riêng. Cơ sở pháp lý: lợi ích hợp pháp.
- **`tablepro:language`** (local storage, cho tới khi bạn xóa): ngôn ngữ bạn chọn trong menu ngôn ngữ hoặc thanh gợi ý ngôn ngữ, và từng ngôn ngữ có gợi ý bạn đã đóng, để website không gợi ý lại. Cơ sở pháp lý: lợi ích hợp pháp.
- **`mintlify_anonymous_id`** (local storage trên docs.tablepro.app, do Mintlify đặt, chỉ khi bạn cho phép Google Analytics ở đó): ID người xem được mô tả trong mục [Website](#website). Từ chối sẽ xóa nó. Trang tài liệu giữ câu trả lời `tablepro:analytics-consent` của riêng nó. Cơ sở pháp lý: sự đồng ý.
- **Cookie có tên bắt đầu bằng `crisp-client/`** (của Crisp, ví dụ `crisp-client/session/…`; 6 tháng, được gia hạn khi bạn quay lại; được đặt trên mọi trang sau khi khung chat được tải): giữ khung chat và cuộc chat của bạn qua các trang và các lần truy cập. Cơ sở pháp lý: lợi ích hợp pháp, để hỗ trợ bạn trên mọi trang.
- **`__Host-tp_session`** (cookie trang tài khoản, 30 ngày kể từ khi bạn đăng nhập): giữ đăng nhập. Trước khi bạn đăng nhập, cookie chỉ được đặt khi đang đăng nhập bằng passkey, Apple, GitHub, Google hoặc từ một ứng dụng, tối đa 10 phút. Đăng xuất sẽ xóa cookie. Request đăng ký bản tin, thanh toán và kiểm tra mã giảm giá từ website công khai dùng omit credentials, không bao giờ nhận cookie này. Cơ sở pháp lý: thực sự cần thiết.
- **`locale`, `context` và `sign-in-return-to`** (local storage của trang tài khoản): ngôn ngữ bạn chọn ở đó trước khi đăng nhập và việc bạn mở Cá nhân hay một nhóm gần nhất, cả hai cho tới khi bạn xóa, và trong 15 phút là trang cần quay lại sau khi bạn mở liên kết đăng nhập trong email. Cơ sở pháp lý: lợi ích hợp pháp.
- **`com.grafana.faro.session`** (session storage của trang tài khoản, cho tới khi bạn đóng tab): mã ngẫu nhiên của lượt truy cập trong báo cáo lỗi của trang tài khoản. Cơ sở pháp lý: lợi ích hợp pháp.

Bạn có thể thay đổi hoặc rút lại câu trả lời về phân tích bất cứ lúc nào bằng **Cài đặt cookie** ở chân mọi trang, hoặc tại đây:

<cookie-settings></cookie-settings>

## Cơ sở pháp lý {#lawful-basis}

Với người đọc ở Khu vực Kinh tế Châu Âu (EEA) và Vương quốc Anh, cơ sở pháp lý theo GDPR và GDPR của Vương quốc Anh là:

- **Hợp đồng** (Điều 6(1)(b)): bán và cung cấp license, tài khoản của bạn cùng các cách đăng nhập và thiết bị, kiểm tra license, trang tài khoản và Team Library.
- **Lợi ích hợp pháp** (Điều 6(1)(f)): dữ liệu sử dụng của ứng dụng cho Mac và việc phân tích dữ liệu đó trong PostHog, các sự kiện về đăng nhập, mua hàng, thiết bị và nhóm mà máy chủ của chúng tôi gửi tới PostHog, nhật ký kiểm tra của tài khoản, bảo mật và chống lạm dụng, gồm cả Cloudflare Turnstile trên form đăng ký bản tin, nhật ký máy chủ web và báo cáo lỗi của trang tài khoản, Cloudflare Web Analytics, bản ghi nguồn truy cập khi mua hàng, việc tra quốc gia để gợi ý ngôn ngữ và giảm giá theo khu vực, và khung chat trực tuyến trên mọi trang.
- **Sự đồng ý** (Điều 6(1)(a)): cookie của Google Analytics, báo cáo sử dụng của ứng dụng cho iPhone và iPad, bản tin và các cuộc chat bạn bắt đầu trong chat trực tuyến.
- **Nghĩa vụ pháp lý** (Điều 6(1)(c)): hồ sơ thuế và kế toán, và việc trả lời các yêu cầu hợp pháp.

## Bên nhận dữ liệu {#sharing}

Chúng tôi chỉ chia sẻ dữ liệu cá nhân với các dịch vụ cần thiết để vận hành TablePro:

- **{merchant}**, merchant of record cho các giao dịch mua.
- **Resend**, dịch vụ gửi email của chúng tôi: liên kết và mã đăng nhập, lời mời vào nhóm, thông báo về tài khoản và bảo mật, và bản tin. Resend giữ danh sách bản tin và báo cho chúng tôi khi email tới một địa chỉ bị trả về hoặc bị đánh dấu là spam.
- **Nhà cung cấp hosting của chúng tôi và Cloudflare**, cho website, trang tài khoản và máy chủ mà các ứng dụng liên lạc. Cloudflare cũng đếm lượt xem trang bằng Cloudflare Web Analytics và kiểm tra form đăng ký bản tin bằng Turnstile.
- **Google**, cho Google Analytics trên website và tài liệu.
- **Crisp**, cho chat trực tuyến trên mọi trang của website và trang tài khoản.
- **PostHog** (EU Cloud), dịch vụ phân tích sản phẩm của chúng tôi, nhận báo cáo sử dụng của các ứng dụng và các sự kiện từ máy chủ của chúng tôi về đăng nhập, mua hàng, thiết bị và nhóm, kèm mã tài khoản của bạn nhưng không bao giờ kèm địa chỉ email hay tên. Dữ liệu sử dụng mà ứng dụng cho Mac gửi thẳng tới PostHog đến kèm địa chỉ IP của máy Mac của bạn.
- **Grafana Labs** (Grafana Cloud), nhận log và trace của máy chủ chúng tôi và báo cáo lỗi của trang tài khoản.
- **Apple, GitHub và Google**, khi bạn đăng nhập tài khoản bằng các dịch vụ này.
- **jsDelivr**, nơi trình duyệt của bạn tải script thanh toán của {merchant} khi bạn trỏ tới một nút Mua.
- **Mintlify**, nơi lưu trữ trang tài liệu docs.tablepro.app.
- **GitHub**, nơi lưu nguồn cập nhật, danh mục plugin và các bản tải về, đồng thời cung cấp số star mà trang tài liệu hiển thị.

Chúng tôi không bán dữ liệu cá nhân và không chia sẻ dữ liệu đó với bên quảng cáo.

## Chuyển dữ liệu ra nước ngoài {#transfers}

Các dịch vụ nêu trên hoạt động ở nhiều quốc gia, nên dữ liệu của bạn có thể được xử lý bên ngoài quốc gia của bạn. {merchant}, Google, GitHub, Cloudflare và Mintlify xử lý dữ liệu tại Hoa Kỳ; Google làm việc này theo Khung bảo vệ quyền riêng tư dữ liệu EU-Hoa Kỳ (EU-US Data Privacy Framework) và các Điều khoản hợp đồng mẫu (Standard Contractual Clauses). PostHog xử lý dữ liệu tại Liên minh châu Âu. Khi pháp luật yêu cầu, việc chuyển dữ liệu từ EEA và Vương quốc Anh dựa trên các Điều khoản hợp đồng mẫu hoặc một cơ chế được phê duyệt khác.

## Thời gian lưu dữ liệu {#retention}

- **Báo cáo sử dụng và sự kiện phân tích**: máy chủ của chúng tôi không giữ bản sao nào sau khi đã chuyển chúng sang PostHog. Chúng tôi chưa đặt thời hạn cho chúng trong PostHog.
- **Dữ liệu từ máy chủ trước đây của chúng tôi**: một bản sao toàn bộ cơ sở dữ liệu của máy chủ đó được giữ vô thời hạn trong một kho lưu trữ. Bản sao gồm license, đơn hàng và thành viên nhóm kèm địa chỉ email và tên; các máy Mac đã kích hoạt license, kèm tên máy; người đăng ký bản tin và người đăng ký dùng thử bản beta; bản ghi các email máy chủ đó đã gửi; và các báo cáo sử dụng cùng nhật ký yêu cầu liên quan đến license mà máy chủ đó giữ, kèm địa chỉ IP.
- **Thiết bị**: được giữ khi còn dùng. Thiết bị không liên lạc trong 180 ngày sẽ bị gỡ, trừ khi một tệp offline cho thiết bị đó vẫn còn hiệu lực, và thiết bị đã gỡ bị xóa một năm sau.
- **Nhật ký kiểm tra của tài khoản**: được giữ khi tài khoản còn tồn tại, kèm địa chỉ IP và trình duyệt của từng thay đổi bạn thực hiện. Xóa tài khoản sẽ gỡ khỏi nhật ký các địa chỉ email của bạn cùng địa chỉ IP và trình duyệt của những việc bạn đã làm; bản ghi về từng thay đổi vẫn còn.
- **Đơn hàng**: được giữ cho mục đích thuế và kế toán. Xóa tài khoản sẽ gỡ địa chỉ email và tài khoản của bạn khỏi đơn hàng.
- **Thông báo từ {merchant}, Resend và Apple**: 180 ngày. Thông báo của {merchant} chứa tên, địa chỉ email và địa chỉ thanh toán của bạn; xóa tài khoản sẽ gỡ các thông tin đó sớm hơn khỏi những thông báo về các lần mua của bạn.
- **Team Library**: cho tới khi một mục được sửa hoặc xóa; mục đã xóa được giữ 90 ngày. Thư viện bị xóa cùng nhóm, và vẫn còn sau khi license kết thúc.
- **Liên kết và mã đăng nhập**: hết hạn sau 15 phút và bị xóa 7 ngày sau đó. Mỗi phiên đăng nhập trang tài khoản kéo dài 30 ngày. Token giữ một ứng dụng ở trạng thái đăng nhập hết hạn 90 ngày sau lần cuối ứng dụng dùng nó, và bị xóa 30 ngày sau đó.
- **Tài khoản đã xóa**: tài khoản, các cách đăng nhập, thiết bị, license và tư cách thành viên nhóm bị xóa ngay. Đơn hàng và nhật ký kiểm tra được giữ như mô tả ở trên. Những gì máy chủ trước đây lưu về bạn vẫn nằm trong kho lưu trữ của máy chủ đó, như mô tả ở trên.
- **Bản tin**: liên kết xác nhận và địa chỉ đã nhận liên kết bị xóa 7 ngày sau khi liên kết hết hạn. Địa chỉ đã xác nhận, hoặc được chuyển từ máy chủ trước đây, nằm trong danh sách của chúng tôi tại Resend cho tới khi chúng tôi xóa theo yêu cầu của bạn; sau khi bạn hủy đăng ký, địa chỉ được giữ ở trạng thái đã hủy đăng ký để không bản tin nào tới được địa chỉ đó.
- **Google Analytics**: dữ liệu ở cấp người dùng và cấp sự kiện được giữ 2 tháng, thời hạn lưu mặc định của Google mà property của chúng tôi đang dùng. Cookie của công cụ này tồn tại tối đa 2 năm, hoặc bị xóa khi bạn từ chối.
- **Cloudflare Web Analytics**: Cloudflare cho chúng tôi xem số liệu tổng về lượt xem trang trong sáu tháng gần nhất. Không có gì được lưu trong trình duyệt của bạn.
- **Chat trực tuyến và email hỗ trợ**: được Crisp và hộp thư của chúng tôi giữ cho tới khi bị xóa. Bạn có thể yêu cầu chúng tôi xóa các cuộc chat và email của bạn.
- **Nhật ký máy chủ web**: được giữ cho mục đích bảo mật và khắc phục sự cố. Chúng tôi chưa đặt thời hạn cố định cho các nhật ký này.
- **Log và trace của máy chủ, và báo cáo lỗi của trang tài khoản**: 14 ngày, trong Grafana Cloud.

## Quyền của bạn {#rights}

Tùy theo nơi bạn sống, bạn có thể yêu cầu chúng tôi:

- cung cấp một bản sao dữ liệu cá nhân chúng tôi đang giữ về bạn (quyền truy cập);
- sửa dữ liệu đó (quyền chỉnh sửa);
- xóa dữ liệu đó (quyền xóa), trừ những gì pháp luật buộc chúng tôi phải giữ;
- giới hạn cách chúng tôi sử dụng dữ liệu (quyền hạn chế xử lý);
- gửi dữ liệu cho bạn ở định dạng có cấu trúc, máy đọc được (quyền di chuyển dữ liệu);
- ngừng sử dụng dữ liệu dựa trên lợi ích hợp pháp (quyền phản đối).

Bạn có thể rút lại sự đồng ý bất cứ lúc nào, và có thể khiếu nại tới cơ quan bảo vệ dữ liệu nơi bạn sống. Để thực hiện bất kỳ quyền nào trong số này, hãy gửi email tới [{email}](mailto:{email}). Chúng tôi trả lời trong vòng 30 ngày. Trên [trang tài khoản]({account}), phần Cài đặt cũng cho bạn một bản sao dữ liệu tài khoản và xóa tài khoản. Với mọi thứ khác, như một địa chỉ nhận bản tin hoặc một máy Mac không có tài khoản, hãy cho chúng tôi biết yêu cầu liên quan tới địa chỉ email, license key hay thiết bị nào. Dữ liệu do {merchant}, Google, Crisp hoặc GitHub nắm giữ còn chịu sự điều chỉnh của chính sách riêng của họ.

**Cư dân California.** Đạo luật Quyền riêng tư người tiêu dùng California (CCPA) cho bạn quyền được biết chúng tôi thu thập thông tin cá nhân nào, yêu cầu chúng tôi xóa thông tin đó, từ chối việc bán thông tin đó, và không bị đối xử khác biệt khi thực hiện các quyền này. Chúng tôi không bán thông tin cá nhân.

## Trẻ em {#children}

TablePro không hướng tới trẻ em dưới 16 tuổi, và chúng tôi không cố ý thu thập dữ liệu cá nhân của trẻ em. Nếu bạn cho rằng một trẻ em đã cung cấp dữ liệu cá nhân cho chúng tôi, hãy liên hệ và chúng tôi sẽ xóa dữ liệu đó.

## Bảo mật {#security}

Lưu lượng giữa các ứng dụng, website, trang tài khoản và máy chủ của chúng tôi dùng HTTPS. Tài khoản TablePro không có mật khẩu. Liên kết và mã đăng nhập, các token giữ ứng dụng ở trạng thái đăng nhập, và token API của nhóm được lưu dưới dạng giá trị băm. Tác vụ gửi email chứa liên kết và mã đăng nhập giữ nguyên văn hai giá trị này cho tới khi tác vụ bị xóa: một ngày sau khi email được gửi, hoặc 7 ngày sau khi chúng tôi ngừng thử gửi. Cả hai hết hiệu lực 15 phút sau khi bạn yêu cầu. Quyền truy cập vào hệ thống của chúng tôi chỉ dành cho {publisherName} và các nhà cung cấp dịch vụ được liệt kê trong mục [Bên nhận dữ liệu](#sharing). Không hệ thống nào an toàn tuyệt đối. Để báo một lỗ hổng bảo mật, hãy xem [trang Bảo mật](/vi/security#report) hoặc gửi email tới [{email}](mailto:{email}).

## Thay đổi chính sách {#changes}

Khi chính sách này thay đổi, chúng tôi cập nhật nó tại đây với ngày "Cập nhật lần cuối" mới, và thông báo trực tiếp cho bạn khi pháp luật yêu cầu.

## Liên hệ {#contact}

Với các câu hỏi về quyền riêng tư hoặc về chính sách này, hãy gửi email tới [{email}](mailto:{email}).
