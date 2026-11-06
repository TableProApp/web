---
title: Chính sách quyền riêng tư
description: Dữ liệu TablePro thu thập, mục đích, bên nhận, thời gian lưu giữ và quyền lựa chọn của bạn.
updatedAt: "2026-11-05"
---

Chính sách này áp dụng cho TablePro trên Mac, Linux, iPhone và iPad; tablepro.app; docs.tablepro.app; cùng dịch vụ tài khoản, mua hàng, hỗ trợ và newsletter. [Danh mục kỹ thuật](https://docs.tablepro.app/security/privacy) liệt kê trường dữ liệu, endpoint và cách kiểm soát. Mã nguồn ứng dụng nằm trong [repository công khai]({github}).

## Tóm tắt {#summary}

Query và kết quả thông thường đi giữa thiết bị và database của bạn. Dữ liệu sử dụng không chứa SQL, hàng dữ liệu hay thông tin xác thực. Nội dung bạn chủ động đăng lên Team Library, gửi hỗ trợ hoặc chia sẻ với AI và công cụ ngoài sẽ đến những bên nhận đó.

Dữ liệu sử dụng trên Mac và Linux được bật mặc định, có công tắc tắt. Ứng dụng iPhone và iPad đã phát hành chỉ gửi báo cáo sau khi bạn đồng ý. Analytics gửi trực tiếp từ ứng dụng có thể liên kết với tài khoản và giao dịch. Tắt công tắc không dừng lưu lượng tài khoản hay analytics từ máy chủ.

Website dùng analytics và tải Crisp trên mọi trang. Cookie Google Analytics cần lựa chọn của bạn. Newsletter đo lượt mở và nhấp. Xóa tài khoản vẫn để lại một số bản ghi, gồm dữ liệu tại PostHog và Crisp. Đọc [thời gian lưu giữ](#retention) và [quyền của bạn](#rights) trước khi chọn. [Bên kiểm soát](#controller) tiếp nhận yêu cầu quyền riêng tư, kể cả khi bạn không có tài khoản.

<span id="contact"></span>

## Bên chịu trách nhiệm {#controller}

{publisherName}, lập trình viên cá nhân tại {publisherCity}, {publisherCountry}, là bên kiểm soát dữ liệu cá nhân mô tả ở đây. Liên hệ [{email}](mailto:{email}). Chúng tôi không có cán bộ bảo vệ dữ liệu. Với nhóm, chúng tôi kiểm soát bản ghi tài khoản, lời mời và dịch vụ. Nội dung Team Library được xử lý theo chỉ dẫn của nhóm; nhóm quyết định nội dung đăng và người được truy cập.

<span id="lawful-basis"></span>

## Dữ liệu và mục đích sử dụng {#data-use}

Với EEA và Anh, cơ sở pháp lý được nêu theo mục đích: hợp đồng (Điều 6(1)(b)), lợi ích chính đáng (6(1)(f)), sự đồng ý (6(1)(a)) hoặc nghĩa vụ pháp lý (6(1)(c)). Chúng tôi không đưa ra quyết định tự động có tác động pháp lý hoặc tác động đáng kể tương tự.

<span id="mac-account"></span>

### Tài khoản và thiết bị {#account}

Việc dùng miễn phí trên máy không yêu cầu tài khoản. Dịch vụ tài khoản cần email của bạn. Chúng tôi lưu tên, ngôn ngữ, phương thức đăng nhập, license, đơn hàng, thiết bị, vai trò và seat trong nhóm. Đăng ký thiết bị Mac và Linux gửi mã máy, tên thiết bị, nền tảng và phiên bản ứng dụng/hệ điều hành. Tên thiết bị có thể chứa tên bạn. Đây là luồng riêng với dữ liệu sử dụng. Mục đích và cơ sở là cung cấp tài khoản và gói theo hợp đồng.

Đăng nhập dùng link và mã qua email, passkey, hoặc Apple, GitHub hay Google. Bản ghi passkey gồm khóa công khai, tên, trạng thái sync và ngày dùng. Nhà cung cấp danh tính gửi ID và email đã xác minh; Apple có thể gửi thêm tên. Token Apple được mã hóa và thu hồi khi bạn bỏ liên kết hoặc xóa tài khoản. Chúng tôi ghi thay đổi tài khoản kèm IP và user agent. Lợi ích chính đáng là bảo vệ tài khoản và điều tra lạm dụng.

[Cổng tài khoản]({account}) cho phép sửa hồ sơ và cách đăng nhập, quản lý thiết bị, xuất dữ liệu JSON và xóa tài khoản. Bạn chưa thể xóa khi sở hữu nhóm còn thành viên khác. Xóa chấm dứt subscription mà không hoàn tiền. [Thời gian lưu giữ](#retention) giải thích phần còn lại.

### Mua hàng {#purchases}

{merchant} (Polar Software, Inc.) là merchant of record và bên bán lại. Họ thu tên, email, địa chỉ thanh toán và thông tin trả tiền theo điều khoản riêng. Họ xử lý thanh toán, thuế, biên nhận và tranh chấp. Chúng tôi không nhận đầy đủ thông tin thẻ.

Chúng tôi gửi mặt hàng, ngôn ngữ, nguồn truy cập và IP để checkout, tính thuế và chọn tiền tệ. Chúng tôi nhận thông tin người mua/thanh toán, số tiền, ID đơn hàng/subscription, gia hạn, hủy và hoàn tiền. Đơn hàng giữ email, quốc gia thanh toán, số tiền và nguồn truy cập. Mua khi chưa đăng nhập tạo tài khoản chưa xác minh cho email đó nếu chưa có. Lý do hủy và bình luận đến {merchant} và được lưu với subscription. Xử lý thực hiện hợp đồng mua hàng; bản ghi thuế/kế toán đáp ứng nghĩa vụ pháp lý. Thiếu thông tin bắt buộc thì checkout không hoàn tất. Quản lý thanh toán ở [cổng {merchant}]({portal}); xem [điều khoản](/vi/terms) và [hoàn tiền](/vi/refund-policy).

### Nhóm và nội dung chia sẻ {#library}

Người mời cung cấp email, vai trò và lựa chọn seat. Chủ sở hữu và admin thấy tên/email thành viên, lời mời và thay đổi trong nhóm, gồm địa chỉ được mời, nhưng không thấy IP hay trình duyệt trong audit log. Thành viên thấy nhóm, gói, số seat và vai trò của mình. Chúng tôi dùng các bản ghi để cung cấp dịch vụ nhóm theo hợp đồng.

Trên Mac, đăng lên Team Library gửi cài đặt connection và query đã lưu đến máy chủ cho thành viên có quyền. Cài đặt gồm host, port, database, username, tùy chọn SSH/SSL, lệnh khởi động, Tunnel Command và AI. Query gồm tên, SQL, từ khóa và thư mục. Các trường mật khẩu có cấu trúc bị loại; bí mật gõ vào SQL hay văn bản tự do không được loại bỏ. Thư viện hiển thị người sửa cuối. Rời nhóm không tự xóa nội dung chung. Xem [thời điểm xóa](#retention). Team Catalog ghi file vào thư mục chia sẻ bạn chọn.

### Analytics ứng dụng và dịch vụ {#analytics}

Lợi ích chính đáng của chúng tôi là hiểu cách sử dụng, sửa lỗi và đo giao dịch. Mac và Linux gửi dữ liệu mô tả ở [Ứng dụng](#apps). Máy chủ cũng gửi PostHog sự kiện đăng nhập, mua hàng, thiết bị và nhóm, với ID tài khoản nhưng không có tên/email. ID nối hoạt động ứng dụng với dịch vụ. Công tắc chỉ dừng sự kiện sử dụng từ ứng dụng; không dừng yêu cầu tài khoản bắt buộc hay sự kiện máy chủ. Dùng [quyền của bạn](#rights) để phản đối hoặc yêu cầu xóa.

### Newsletter và email {#newsletter}

Amazon SES gửi mã đăng nhập, lời mời, thông báo tài khoản và newsletter. Email dịch vụ thực hiện dịch vụ bạn yêu cầu. Đăng ký newsletter mới cần xác nhận và dựa trên sự đồng ý. Chúng tôi lưu email, ngôn ngữ, ngày đăng ký/xác nhận, IP, user agent, trang đăng ký và phiên bản nội dung đồng ý.

Mỗi newsletter đo lượt mở và nhấp của mọi người nhận qua ảnh và `links.news.tablepro.app`. Amazon SES nhận thời gian, link nhấp, IP và user agent, rồi gửi về máy chủ để đếm. Chặn ảnh dừng đo mở, không dừng đo nhấp. Link hủy đăng ký và link email không được theo dõi. Không có công tắc riêng cho việc đo. Hủy trong newsletter hoặc qua nút một lần nhấp của ứng dụng email để dừng nhận; không có email xác nhận sau đó. Đăng ký lại cần xác nhận. Email trả lại vĩnh viễn và báo spam dừng gửi tiếp. Yêu cầu xóa địa chỉ qua [liên hệ](#controller).

Danh sách máy chủ cũ chuyển mọi địa chỉ chưa hủy đăng ký sang, dù đã xác nhận hay chưa, gồm người mua, chủ license và người đăng ký beta. Địa chỉ đã hủy giữ nguyên; địa chỉ bị trả lại hoặc báo spam vào danh sách chặn gửi. [Thời gian lưu giữ](#retention) áp dụng cho các bản ghi này.

### Hỗ trợ {#support}

Tin nhắn, file đính kèm và chẩn đoán bạn gửi đến chúng tôi và dịch vụ hỗ trợ bạn dùng. Chúng có thể chứa dữ liệu database hoặc bí mật bạn thêm vào. Crisp nhận IP, thông tin trình duyệt và trang đã xem khi chat tải trên website và cổng tài khoản. Họ giữ IP nếu bạn bắt đầu trò chuyện. Chúng tôi cung cấp ngôn ngữ trang và, khi đăng nhập cổng, email/ID tài khoản. Tải chat trên mọi trang phục vụ lợi ích chính đáng về hỗ trợ. Cuộc trò chuyện bạn bắt đầu dựa trên sự đồng ý.

## Ứng dụng của bạn {#apps}

| Ứng dụng và phiên bản | Dữ liệu sử dụng | Kiểm soát |
| --- | --- | --- |
| Mac 0.86.0, từ 0.86.0-beta.1 | Trực tiếp đến PostHog; bật mặc định | Cài đặt > Cài đặt chung > Quyền riêng tư (Settings > General > Privacy) |
| Linux từ 0.1.0-beta.1 | Trực tiếp đến PostHog; bật mặc định | Preferences > General > Privacy |
| iPhone và iPad đã phát hành | Báo cáo qua máy chủ; tắt đến khi đồng ý | Cài đặt > Quyền riêng tư (Settings > Privacy) |

<span id="mac-local"></span>

### Dữ liệu trên thiết bị {#local-data}

Danh sách connection, lịch sử query, log cục bộ và tab mở nằm trên thiết bị trừ khi bạn chọn chia sẻ. Lưu lượng database đến máy chủ bạn chọn. Mật khẩu dùng kho thông tin xác thực của nền tảng. Trên Mac, SSH key được tham chiếu tại vị trí trên đĩa. Analytics không chứa hostname, username, SQL, hàng hay thông tin xác thực. [Tích hợp](#integrations), Team Library và hỗ trợ có các ngoại lệ mô tả ở đây.

### Mac {#mac-app}

Analytics trực tiếp và tài khoản sau đây bắt đầu từ 0.86.0, gồm 0.86.0-beta.1. Đăng nhập đăng ký Mac và tải gói của bạn. Token tài khoản nằm trong Keychain của Mac đó và không sync qua iCloud Keychain. License key hiện có được đổi thành đăng nhập rồi xóa trên máy.

#### Dữ liệu sử dụng trên Mac {#mac-usage-report}

Dữ liệu sử dụng bật mặc định; ứng dụng không hỏi trước sự kiện đầu tiên. Tắt **Chia sẻ dữ liệu sử dụng (Share usage data)** trong **Cài đặt > Cài đặt chung > Quyền riêng tư (Settings > General > Privacy)**. Khởi động khi tắt không chạy thư viện PostHog. Không gửi báo cáo crash tự động; crash reporter của PostHog bị tắt.

Sự kiện gồm dùng hằng ngày với loại/số connection mở, lần thử connection, kết nối thành công và query đầu tiên theo loại database, chặn tính năng trả phí và lý do, nhấp nâng cấp, cách đăng nhập/đăng xuất, hiển thị và trả lời lời mời mua license. PostHog thêm ngữ cảnh thiết bị, màn hình, mạng, session, ứng dụng và hệ thống. Họ nhận IP và suy ra vị trí gần đúng. Trước đăng nhập, sự kiện dùng ID ngẫu nhiên của bản cài, không tạo hồ sơ cá nhân. Sau đăng nhập dùng ID tài khoản, với hồ sơ chứa phiên bản ứng dụng/OS, kiến trúc, ngôn ngữ và vị trí suy ra. Đăng xuất tạo ID ngẫu nhiên mới. Xem [trường dữ liệu và endpoint](https://docs.tablepro.app/security/privacy#usage-data).

#### Cập nhật và plugin {#mac-updates}

Ứng dụng tải update feed và danh mục plugin từ GitHub qua updates.tablepro.app. File tải và số lượt tải plugin cũng đến GitHub. Yêu cầu mang IP và user agent. Tắt **Tự động kiểm tra cập nhật (Automatically check for updates)** trong **Cài đặt > Cài đặt chung > Cập nhật phần mềm (Settings > General > Software Update)** để dừng kiểm tra tự động. Danh mục plugin không có công tắc tắt. [Chi tiết kỹ thuật](https://docs.tablepro.app/security/privacy#update-checks) gồm feed cũ của các bản trước.

#### Các bản Mac cũ {#mac-license}

Trước 0.86.0, dữ liệu sử dụng là báo cáo gửi máy chủ dưới cùng công tắc bật mặc định. Báo cáo chứa mã máy đã băm, thông tin hệ thống/ứng dụng, loại/số connection mở, trạng thái license và ngày thử/thành công đầu tiên. Cài đặt cập nhật được gửi nhưng máy chủ bỏ đi. Máy chủ hiện tại chuyển sang PostHog kèm quốc gia từ Cloudflare, không kèm IP hay license key, không tạo hồ sơ cá nhân. Mã máy có thể nối với thiết bị tài khoản. Hiện không giữ lịch sử heartbeat riêng, nhưng job, log, backup và bản lưu cũ có thể giữ dữ liệu. Xem [lưu giữ](#retention).

Bản cũ chỉ gọi dịch vụ license sau khi bạn nhập key. Kiểm tra gửi key, mã máy, tên Mac và phiên bản ứng dụng/OS. Thiết bị thuộc tài khoản; kích hoạt và hủy kích hoạt được ghi audit kèm IP/user agent. [Danh mục kỹ thuật](https://docs.tablepro.app/security/privacy#older-mac-reports) giữ trường dữ liệu và thời điểm.

### iPhone và iPad {#ios-app}

Ứng dụng đã phát hành không gửi báo cáo sử dụng cho đến khi bạn bật **Chia sẻ dữ liệu sử dụng (Share Usage Data)** lúc mở lần đầu hoặc trong **Cài đặt > Quyền riêng tư (Settings > Privacy)**. Cơ sở là sự đồng ý. Báo cáo hằng ngày qua máy chủ, được chuyển sang PostHog không kèm IP, có quốc gia từ Cloudflare và không tạo hồ sơ cá nhân. Nó chứa mã thiết bị Apple đã băm, nền tảng, phiên bản ứng dụng/iOS, kiến trúc, ngôn ngữ, loại/số connection mở và ngày thử, thành công, query đầu tiên. Nó luôn báo không có license; không có cài đặt cập nhật. Ứng dụng không kiểm tra tài khoản, license, cập nhật hay plugin.

Kết nối database/SSH, iCloud tùy chọn và đăng nhập Microsoft Entra cho SQL Server gửi dữ liệu đến các dịch vụ đó. Mật khẩu và SSH key dán vào ở Keychain; chứng chỉ và lịch sử query ở thiết bị. Connection vào chỉ mục Spotlight cục bộ. Live Activity của query đang chạy có thể hiện SQL trên màn hình khóa trừ khi bật Hide Query. Riêng cài đặt Share With App Developers của Apple có thể gửi báo cáo crash và thống kê qua App Store Connect. Ứng dụng không có crash reporter hay thư viện analytics bên thứ ba. Xem [chi tiết iOS](https://docs.tablepro.app/ios#privacy).

### Linux {#linux-app}

Từ 0.1.0-beta.1, đăng nhập đăng ký thiết bị theo mục [tài khoản](#account). Bí mật dùng keyring của desktop. Cập nhật qua trình quản lý gói theo nhà phân phối bạn chọn. Ứng dụng không gửi báo cáo crash tự động.

#### Dữ liệu sử dụng trên Linux {#linux-usage-data}

Dữ liệu sử dụng bật mặc định từ 0.1.0-beta.1. Tắt Share usage data trong Preferences > General > Privacy. Sự kiện trực tiếp đến PostHog EU: dùng hằng ngày với loại/số connection mở, thử/thành công đầu tiên và query đầu tiên theo loại, đăng nhập/đăng xuất, nhấp nâng cấp, hiển thị lời mời mua license và chọn Buy. Chúng mang ID bản cài hoặc tài khoản, phiên bản ứng dụng/hệ thống, kiến trúc, ngôn ngữ giao diện và metadata SDK. PostHog nhận IP và suy ra vị trí gần đúng. Trước đăng nhập là ID ngẫu nhiên và không có hồ sơ cá nhân; sau đăng nhập hồ sơ nối sử dụng với mua hàng. Đăng xuất đặt lại ID. Không có hostname, SQL, hàng hay thông tin xác thực trong sự kiện. Đăng ký thiết bị riêng có hostname.

Tắt dừng gửi mới. Yêu cầu đang gửi có thể hoàn tất. Nó không xóa sự kiện cũ hay dừng yêu cầu tài khoản và analytics máy chủ. Xem [lưu giữ](#retention), [quyền](#rights) và [danh mục kỹ thuật](https://docs.tablepro.app/security/privacy#linux-usage-data).

<span id="mac-third-parties"></span>

## Dịch vụ bạn chọn {#integrations}

Nhà cung cấp database, SSH và proxy nhận lưu lượng bạn yêu cầu trực tiếp từ ứng dụng. Dịch vụ đăng nhập connection nhận yêu cầu xác thực khi được cấu hình. Apple Maps cung cấp ô bản đồ; DuckDB cung cấp extension cho query. Helper kết nối và AI tải về liên hệ nhà cung cấp của chúng. Những dịch vụ này có điều khoản riêng.

### iCloud và Handoff {#icloud}

iCloud Sync tùy chọn lưu connection, nhóm, tag, cài đặt, query đã lưu và SSH profile vào CloudKit riêng của bạn. Trên Mac, iCloud còn đồng bộ mục yêu thích và thư mục của bảng/cơ sở dữ liệu, cùng tên credential profile, tên người dùng và chế độ mật khẩu, không bao giờ gồm mật khẩu của profile. Apple lưu trữ; chúng tôi không đọc được. Sync mật khẩu là lựa chọn riêng, tắt mặc định, dùng iCloud Keychain mã hóa đầu cuối. Trên Mac nó áp dụng cả bí mật khác ghi qua kho đó, như AI key và license key cũ. Token tài khoản không sync. Sync Mac cần Pro hoặc Team; iOS miễn phí. Handoff truyền ID connection và tên bảng, hoặc tên/host connection khi không mở bảng, giữa thiết bị Apple của bạn. Không gửi thông tin xác thực. Xem [kiểm soát sync](https://docs.tablepro.app/features/icloud-sync).

### AI và công cụ ngoài {#ai-tools}

Yêu cầu AI đi thẳng đến nhà cung cấp hoặc model cục bộ bạn chọn. Prompt, schema, SQL hiện tại và nội dung trò chuyện có thể được gửi. Đính kèm hàng từ grid tắt mặc định. Kết quả từ công cụ query AI đã được cấp quyền cũng vào cuộc trò chuyện và đến nhà cung cấp, độc lập với công tắc đính kèm. GitHub Copilot tải helper từ npm và lựa chọn Gửi telemetry đến GitHub (Send telemetry to GitHub) bật ban đầu.

MCP tắt mặc định và không thể chạy khi bị tắt, kể cả qua bridge hay yêu cầu ghép đôi. Khi bật, client đã xác thực có thể yêu cầu dữ liệu theo quyền bạn cấp. Client AI kết nối có thể gửi kết quả về dịch vụ của nó. MCP server ngoài nhận tham số công cụ đã duyệt. Xem [kiểm soát AI và MCP](https://docs.tablepro.app/security/privacy#ai-providers).

## Website và lưu trữ trình duyệt {#website}

Máy chủ và Cloudflare nhận IP, user agent và trang được yêu cầu. Cloudflare Web Analytics đếm lượt xem, nguồn giới thiệu, thời gian tải, loại trình duyệt/OS/thiết bị và quốc gia, không lưu trong trình duyệt hay tạo fingerprint. Lợi ích chính đáng là hiểu và duy trì website.

Google Analytics tải ở Consent Mode. Trước Allow, nó gửi tín hiệu trang không cookie và không ID thiết bị đã lưu. Đồng ý bật cookie và đo lượt truy cập, tải về và checkout. Lưu trữ quảng cáo, cá nhân hóa và dữ liệu quảng cáo luôn bị từ chối. Google nói GA4 không lưu IP.

Crisp tải trên mọi trang website và cổng, như mục [hỗ trợ](#support). Trỏ hoặc tab đến Buy tải script {merchant} từ jsDelivr, bên nhận IP và thông tin trình duyệt; nhấp mở checkout. Bắt đầu form newsletter tải Cloudflare Turnstile chống lạm dụng, theo lợi ích chính đáng. Tra quốc gia và múi giờ giúp gợi ý ngôn ngữ/ưu đãi khu vực theo lợi ích chính đáng; yêu cầu không cookie và trang không lưu câu trả lời.

Lượt đầu tạo `tablepro:attribution` trong 90 ngày: tag/referrer, trang đích và ngày. Khi checkout, máy chủ chuyển nguồn lượt truy cập cho {merchant} làm metadata, giữ với đơn hàng và gửi PostHog cùng sự kiện checkout/thanh toán. Trang đích và ngày không được giữ. Cơ sở là lợi ích chính đáng trong đo nguồn mua hàng. Yêu cầu newsletter, checkout và mã giảm giá công khai bỏ credentials và không đặt cookie cổng. Cổng không chạy script analytics, nhưng máy chủ gửi sự kiện dịch vụ.

### Website tài liệu {#docs}

Mintlify lưu trữ docs.tablepro.app. Yêu cầu trang, Google Fonts và số sao GitHub tiết lộ IP/thông tin trình duyệt cho các bên đó. Docs hỏi đồng ý analytics riêng. Trước Allow, không lưu cookie analytics hay ID khách. Allow bật Google Analytics và ID Mintlify. Cookie settings ở footer docs rút lại lựa chọn và xóa chúng. Lựa chọn website không chuyển sang origin đó.

### Cookie và lưu trữ {#cookies}

Cloudflare Web Analytics không lưu gì trong trình duyệt. Trang công khai không đặt cookie bên thứ nhất. Các mục sau có thời hạn riêng, khác lưu giữ của nhà cung cấp. Lưu trữ cần thiết duy trì đăng nhập hoặc lựa chọn; mục đích đồng ý và lợi ích chính đáng được nêu ở đây.

| Tên/dịch vụ | Mục đích và lúc tạo | Thời hạn và kiểm soát |
| --- | --- | --- |
| `_ga`, `_ga_<ID>` | Google Analytics, chỉ sau đồng ý | Tối đa 2 năm; từ chối sẽ xóa |
| `tablepro:analytics-consent` | Bản ghi lựa chọn cần thiết; riêng trên website và docs | Đến khi xóa |
| `tablepro:attribution` | Nguồn lượt đầu gửi cùng checkout; lợi ích chính đáng | 90 ngày |
| `theme`, `tablepro:language`, `tablepro:campaign-closed`, `tablepro:linux-install` | Giao diện, ngôn ngữ chọn/bỏ qua, thông báo sale đã đóng, cách cài trên Linux đã chọn; lợi ích chính đáng | Đến khi xóa; theme cổng riêng |
| `mintlify_anonymous_id` | ID khách docs, chỉ sau đồng ý tại đó | Đến khi xóa hoặc từ chối |
| Cookie `crisp-client/` | Duy trì chat trên mọi trang sau khi tải; lợi ích chính đáng | 6 tháng, gia hạn khi quay lại |
| `__Host-tp_session` | Đăng nhập cổng cần thiết | 30 ngày khi đăng nhập; tối đa 10 phút trong quá trình; đăng xuất xóa |
| `locale`, `context`, `sign-in-return-to` | Ngôn ngữ cổng, chế độ Personal/nhóm, trang quay lại; lợi ích chính đáng | Hai mục đầu đến khi xóa; trang quay lại 15 phút |

Đổi đồng ý analytics bằng Cài đặt cookie ở footer hoặc tại đây:

<cookie-settings></cookie-settings>

## Bên nhận dữ liệu {#sharing}

| Bên nhận | Dữ liệu và mục đích |
| --- | --- |
| [OVH]({ovhPrivacy}) | Máy chủ và bản ghi dịch vụ |
| [Cloudflare]({cloudflarePrivacy}) | DNS/proxy, R2 và backup, Turnstile, Cloudflare Web Analytics |
| [Amazon Web Services]({awsPrivacy}) | Email Amazon SES, giao thư và tương tác newsletter; link CloudFront, sự kiện SNS/SQS |
| [PostHog EU]({posthogPrivacy}) | Analytics ứng dụng/máy chủ; ID tài khoản, không tên/email; yêu cầu trực tiếp kèm IP |
| [{merchant}]({merchantPrivacy}) | Merchant of record độc lập; checkout, thanh toán và đơn hàng |
| [Crisp]({crispPrivacy}) | Chat, dữ liệu trình duyệt/trang, danh tính tài khoản đăng nhập |
| [Google]({googlePrivacy}) | Analytics website/docs và font docs; đăng nhập tài khoản nếu chọn |
| [Mintlify]({mintlifyPrivacy}) | Lưu trữ docs và đo khách đã đồng ý |
| [GitHub]({githubPrivacy}) | Tải về, cập nhật, plugin, sao docs, issue công khai và đăng nhập tùy chọn |
| [Apple]({applePrivacy}) | Đăng nhập tùy chọn; dịch vụ Apple và chẩn đoán tại mục ứng dụng/tích hợp |
| [jsDelivr]({jsdelivrPrivacy}) | Yêu cầu script checkout kèm IP và thông tin trình duyệt |

Thành viên nhóm nhận nội dung chung và thông tin tài khoản theo vai trò. Tích hợp bạn chọn nhận dữ liệu bạn gửi. Chúng tôi không bán dữ liệu cá nhân hay chia sẻ cho quảng cáo. Tiết lộ khác chỉ khi pháp luật yêu cầu. Chính sách riêng của nhà cung cấp cũng áp dụng cho dịch vụ của họ.

## Nơi xử lý dữ liệu {#transfers}

Máy chủ OVH và Amazon SES ở Singapore (`ap-southeast-1` cho SES). PostHog ở EU. Crisp đặt tại Pháp. {publisherName} hoạt động từ Việt Nam. Các nhà cung cấp Mỹ, gồm {merchant}, Google, GitHub, Cloudflare, Amazon Web Services và Mintlify, xử lý tại Mỹ. Lưu trữ và backup có thể ở quốc gia khác của bạn. Biện pháp EEA/Anh bắt buộc dựa vào Standard Contractual Clauses hoặc cơ chế được chấp thuận của từng nhà cung cấp; Google còn dùng EU-US Data Privacy Framework. Hỏi qua [liên hệ](#controller) về biện pháp áp dụng.

## Thời gian lưu giữ {#retention}

Chúng tôi chưa đặt giới hạn thời gian tại những mục ghi như vậy. Xóa tài khoản không xóa dữ liệu tại PostHog hay Crisp. Gửi email qua [liên hệ](#controller) để yêu cầu xóa tại các bên này.

| Bản ghi | Lưu giữ và xóa |
| --- | --- |
| Analytics PostHog | Chưa đặt giới hạn. Tắt để lại sự kiện trước đó. Yêu cầu xóa. |
| Job xử lý và log máy chủ | Job có thể giữ báo cáo khi gửi/thử lại. Log dùng cho bảo mật và xử lý lỗi. Chưa đặt giới hạn tổng; không cam kết máy chủ không giữ bản sao. |
| Thiết bị | Gồm thiết bị đã gỡ, đến khi xóa tài khoản |
| Tài khoản và audit | Xóa ngay tài khoản, cách đăng nhập, thiết bị, license và tư cách thành viên. Audit còn vô thời hạn; xóa trường email và IP/user agent của người thực hiện, nhưng địa chỉ trong văn bản tự do có thể còn. |
| Đơn hàng và thông báo nhà cung cấp | Đơn hàng giữ cho thuế/kế toán, chưa có giới hạn. Xóa bỏ liên kết tài khoản/email. Sự kiện {merchant}, Amazon SES và Apple còn; thông tin cá nhân mua hàng và người nhận/tương tác email được xóa cho tài khoản đã xóa. |
| Team Library | Mục đã xóa giữ phiên bản cuối để sync. Xóa nhóm thường xóa thư viện sau 30 ngày, trong thời gian đó có thể khôi phục. Xóa tài khoản chủ sở hữu duy nhất xóa nhóm/thư viện ngay. License hết không xóa thư viện. |
| Xác thực | Link/mã hết hạn sau 15 phút, xóa 7 ngày sau. Session cổng 30 ngày. Token ứng dụng hết hạn 90 ngày sau lần dùng cuối, xóa 30 ngày sau. Job email giữ link/mã rõ đến cleanup: một ngày sau gửi hoặc 7 ngày sau bỏ gửi. |
| Newsletter | Địa chỉ mới chưa xác nhận bị xóa sau 30 ngày. Địa chỉ đã xác nhận/chuyển sang giữ đến khi yêu cầu xóa hoặc xóa tài khoản dùng địa chỉ đó. Hủy vẫn giữ địa chỉ với trạng thái đã hủy. |
| Danh sách chặn gửi | Địa chỉ bounce/spam và ngày đầu/cuối còn sau xóa tài khoản/đăng ký để ngăn gửi tiếp. Chưa có giới hạn. |
| Google Analytics | Dữ liệu người dùng/sự kiện: 2 tháng; báo cáo tổng hợp chuẩn là riêng |
| Cloudflare Web Analytics | Chúng tôi xem được tổng lượt xem sáu tháng gần nhất |
| Hỗ trợ | Crisp và email giữ đến khi xóa, gồm theo yêu cầu. Chưa có giới hạn. |
| Backup và bản lưu chuyển đổi | Chưa có giới hạn. Xóa tài khoản không xóa các bản này. Bản lưu toàn database cũ gồm tên/email, license, đơn hàng, nhóm, tên thiết bị, subscriber, beta signup, email, báo cáo sử dụng và log license kèm IP. |

## Lựa chọn và quyền của bạn {#rights}

Dùng công tắc ứng dụng, Cookie settings trên website/docs và hủy newsletter để đổi xử lý tùy chọn. Rút đồng ý có hiệu lực về sau, không làm mất tính hợp lệ của xử lý trước đó. Công tắc không xóa dữ liệu cũ hay dừng analytics máy chủ. Trong [Settings của cổng]({account}), xuất hoặc xóa tài khoản; các nút này không bao gồm mọi bản ghi trong bảng lưu giữ.

Tùy nơi sống, yêu cầu truy cập, sửa, xóa, hạn chế, di chuyển hoặc phản đối xử lý theo lợi ích chính đáng. Yêu cầu được tiếp nhận kể cả khi chưa có tài khoản: email qua [liên hệ](#controller). Chúng tôi có thể hỏi thông tin cần để tìm bản ghi, như ID bản cài. Không gửi license key rõ qua email. Chúng tôi trả lời trong một tháng. Bạn có thể khiếu nại với cơ quan bảo vệ dữ liệu. Nghĩa vụ lưu giữ pháp lý có thể giới hạn quyền xóa.

### Quyền theo khu vực {#regional-rights}

**Cư dân California.** Đạo luật Quyền riêng tư người tiêu dùng California (CCPA) cho bạn quyền được biết chúng tôi thu thập thông tin cá nhân nào, yêu cầu chúng tôi xóa thông tin đó, từ chối việc bán thông tin đó, và không bị đối xử khác biệt khi thực hiện các quyền này. Chúng tôi không bán thông tin cá nhân.

## Trẻ em {#children}

TablePro không hướng đến trẻ dưới 16 tuổi và chúng tôi không cố ý thu thập dữ liệu cá nhân của trẻ. Nếu bạn cho rằng trẻ đã cung cấp dữ liệu, liên hệ để chúng tôi xóa.

## Bảo mật {#security}

Lưu lượng đến dịch vụ dùng HTTPS. Tài khoản không có mật khẩu. Thông tin đăng nhập và API token của nhóm được lưu dạng hash, với ngoại lệ job email tạm thời tại mục [lưu giữ](#retention). Chỉ {publisherName} và nhà cung cấp trong [Bên nhận dữ liệu](#sharing) có quyền truy cập hệ thống. Không hệ thống nào an toàn tuyệt đối. Báo lỗ hổng qua [trang bảo mật](/vi/security#report).

## Thay đổi {#changes}

Trang hiển thị ngày cập nhật cuối. Bản trước còn trong [lịch sử repository web công khai]({webGithub}/commits/main/resources/data/legal/en/privacy.md). Chúng tôi cập nhật trước khi dùng dữ liệu cho mục đích mới, thông báo trực tiếp khi luật yêu cầu và xin lại sự đồng ý khi cần.
