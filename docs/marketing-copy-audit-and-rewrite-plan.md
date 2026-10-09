# TablePro — audit wording, research và kế hoạch rewrite marketing site

Ngày review: 2026-10-09. Trạng thái: **đã được cho phép triển khai English; đang chờ review bản English trước khi dịch**.

Implementation và checklist review hiện hành: [English copy review](marketing-copy-english-review.md). Các phần dưới giữ lại research và proposal ban đầu; yêu cầu mới của owner ưu tiên English trước, cho phép đổi cấu trúc, và giữ nguyên các locale khác đến khi English được duyệt.

Tài liệu này là bản phân tích và kế hoạch biên tập, không thay thế positioning hiện hành cho đến khi được duyệt. Các câu tiếng Anh bên dưới là bản nháp để đánh giá hướng viết; chưa phải toàn bộ catalog dịch hoặc nội dung đã xác minh lại với binary của app.

**Cách review nhanh:** đọc mục 1 và 5 để chốt hướng; mục 6 để cảm nhận copy homepage; mục 8–9 để xem phạm vi từng trang database/comparison; mục 13–15 để review implementation, nghiệm thu và các lựa chọn còn mở. Các mục còn lại là evidence và briefing chi tiết.

## 1. Những quyết định đã có và hướng đề xuất

### Đã xác nhận từ cuộc trao đổi

- Rewrite toàn bộ marketing site để giảm cảm giác AI, quảng cáo sáo và dài dòng.
- Phân tích, research và review kế hoạch trước khi sửa site.
- Identity của TablePro phải độc lập với nền tảng: không đưa Mac, Linux hoặc Windows vào headline chung.
- Desktop hiện tại tập trung vào Mac; sau này có thể có Linux/Windows. Không viết copy như thể các bản đó đã phát hành.
- Vòng audit ban đầu chỉ tạo Markdown. Owner sau đó cho phép implement song song, English trước; các ngôn ngữ khác chờ approval.

### Đề xuất cần review

Giọng viết: người làm công cụ giới thiệu nó cho người dùng hiểu công việc của mình. Ngắn, cụ thể, có chọn lọc. Dùng tính năng và hành vi thật để tạo sức thuyết phục.

Identity đề xuất:

> A native database client.

Subtitle đề xuất, triển khai bằng token lấy từ engine catalog:

> Run queries, browse and edit data in {featuredEngines} and more.

Giữ subtitle hiện tại về ý nghĩa; giảm headline bằng cách bỏ “for developers”. Không cần thay mọi câu chỉ để tạo khác biệt.

Đặt nền tảng, kiến trúc, OS requirement và nơi tải trong availability/download. Tính năng riêng nền tảng vẫn ghi phạm vi tại chính tính năng đó. Không dùng “cross-platform” khi desktop mới có Mac.

**Lưu ý về iOS:** `resources/data/platforms.json` hiện ghi Mac và iPhone/iPad là `released`, Linux là `prototype`, Windows là `none`. Kế hoạch này hiểu ý “hiện tại chỉ Mac” là hướng desktop; không tự ý xóa sản phẩm iOS đã có trong repo. Nếu chủ sản phẩm muốn ngừng giới thiệu iOS, đó là một quyết định phạm vi riêng, không phải hệ quả tự động của rewrite.

## 2. Phạm vi, phương pháp và giới hạn của audit

### Nguồn nội bộ

| Nguồn | Vai trò |
|---|---|
| `resources/data/content/en/` | 59 JSON, gồm page copy, hub labels và auxiliary copy |
| `resources/data/content/vi/` | Đối chiếu mẫu homepage, feature, database và comparison để đánh giá translationese |
| `resources/js/i18n/messages/en/` | 16 file: 15 namespace và một file composition, bao phủ navigation, footer, CTA, pricing, forms, consent, errors, SEO và các nhãn dùng chung |
| `resources/blog/` | 16 bài English: 10 release/product announcements, 6 guides |
| `resources/data/legal/en/` | Privacy, terms và refund policy |
| `resources/data/{facts,platforms,engines,paid-features,pricing,comparisons,assets}.json` | Facts, availability, giá, giới hạn, evidence và asset status |
| `resources/js/pages/`, `resources/js/components/` | Nơi copy xuất hiện, độ lặp và cấu trúc render |
| `routes/localized.php`, slug classes, SEO page registry | Phạm vi URL, locale và loại trang |
| `docs/rebuild/design/`, `CLAUDE.md`, `docs/localization.md`, tests | Các ràng buộc khi implement |

Audit bao phủ mọi nhóm trang và từng database/comparison slug. Đọc sâu các trang chính và các phần quyết định của từng trang con: lead, section structure, claim đặc thù, giới hạn, switching và FAQ. Đánh giá English làm bản gốc; Vietnamese mới được đối chiếu mẫu, chưa phải proofread toàn bộ. Các ngôn ngữ khác đã được xác định phạm vi triển khai nhưng chưa được biên tập từng câu.

Không có trong kết quả này: browser screenshot audit từng breakpoint, user interview, conversion analytics, benchmark sản phẩm hoặc kiểm thử lại mọi claim với binary. Các nhận xét về sức thuyết phục là đánh giá biên tập, không phải kết quả A/B test.

Research dùng website/tài liệu chính thức, đọc ngày 2026-10-09. Chọn cả database clients trực tiếp và công cụ developer để so sánh cách dùng từ, cấu trúc câu, thông điệp, CTA và độ sâu nội dung. Không coi site nổi tiếng là chuẩn tuyệt đối.

### Số liệu để hiểu quy mô

Đếm gần đúng trên string của English JSON, bỏ SEO/OG, shared `labels`, một số ID/path/asset fields và inline HTML tags; token như `{featuredEngines}` vẫn tính là một từ. Có thể còn tính một số string phụ. Đây là **source-word estimate**, không phải word count của trang đã render. Không bao gồm các namespace TS, legal Markdown và blog.

| Nguồn | Số từ nguồn gần đúng |
|---|---:|
| Home | 1.010 |
| iOS | 1.473 |
| Pricing page JSON, chưa cộng cards/chrome | 731 |
| FAQ | 1.900 |
| Querying | 933 |
| Connections | 1.499 |
| AI & MCP | 1.272 |
| PostgreSQL page | 1.138 |
| DynamoDB page | 950 |
| TablePlus comparison | 908 |
| DataGrip comparison | 1.098 |

Mật độ thực tế trên homepage còn tăng khi thay token bằng danh sách engine/format/provider và render pricing cards. Vấn đề không chỉ là tổng số từ; quan trọng hơn là số ý phải xử lý trong mỗi khối.

## 3. Kết luận audit hiện trạng

### 3.1. Copy đã có facts tốt, nhưng thiếu lựa chọn biên tập

Điểm mạnh nên giữ:

- Nói rõ free/paid, không giả vờ toàn bộ tính năng đều miễn phí.
- Comparison có nguồn, ngày kiểm tra và điểm mạnh của đối thủ.
- Nhiều câu mô tả hành vi thật: edits chờ đến khi save, Preview SQL, dữ liệu AI đi đến provider nào.
- Có availability, paid-feature labels và engine limits thay vì claim chung cho mọi platform.
- Không có benchmark tốc độ/memory tự bịa.
- CTA như Download, Get Starter, Get Team dễ hiểu.

Điểm yếu chính: copy đang cố đồng thời làm nhiệm vụ giới thiệu, hướng dẫn thao tác, giải thích implementation và công bố giới hạn.

Ví dụ `home.workflows.rows[0].body` chứa autocomplete, parameters, history, saved queries, SQL folders, Git status, EXPLAIN diagram và baseline comparison. Người đọc không được hướng đến một chi tiết đáng nhớ.

### 3.2. Các pattern tạo cảm giác AI

| Pattern thực tế | Hệ quả | Hướng sửa |
|---|---|---|
| Heading lặp chuỗi “write, run and understand”, “compare, sync and copy” | Nhịp câu đồng đều và có vẻ được tạo theo template | Xen kẽ tên tính năng và thao tác cụ thể; không áp công thức ba động từ |
| Lead mở bằng “For anyone who…”, “For working with…”, “For when…” | Câu mở dài trước khi nói app làm gì | Bắt đầu trực tiếp bằng tác vụ |
| Nhiều đoạn danh sách tính năng viết thành prose | Khó quét; mọi thứ có cùng trọng lượng | Chọn một ý chính, một hoặc hai chi tiết hỗ trợ |
| “The iPhone and iPad app does part of it.” lặp trên feature leads | Dễ thấy template, lại không nói rõ phần nào | Availability cụ thể và link tới bản mobile |
| “Free to use, with optional paid features” lặp nhiều | Business model thành lời giải thích thường trực | Nói đủ ở hero/pricing, còn nơi khác dùng badge/link phù hợp |
| Định nghĩa framework/runtime trong hero | Người đọc gặp kiến trúc trước khi hiểu tác vụ | Đưa “what native means” sang FAQ/About/availability detail |
| Meta-copy như “Each row says…”, “newest first” | Site giải thích chính bố cục của nó | Nói nội dung người đọc sẽ tìm được |
| Câu nào cũng nêu caveat ngay sau claim | Tạo cảm giác tự vệ và ngắt nhịp | Giữ caveat quan trọng gần claim; đưa hướng dẫn sâu vào docs |

Đếm exact repeated sentences trong English source thấy câu về việc chưa có Windows/Linux xuất hiện 8 lần; câu “The iPhone and iPad app does part of it.” xuất hiện 4 lần. Việc lặp giữa các trang độc lập có thể cần thiết. Cần giảm lặp **trên cùng một trang** và đưa facts nền tảng về nguồn dữ liệu chung, không xóa facts chỉ vì chúng xuất hiện nhiều lần.

### 3.3. Một số vấn đề về độ mới và nhất quán

- `blog.json.header.lead` vẫn chỉ nói release announcements, nhưng repo đã có 6 guides và UI labels phân loại Guides/Release notes. Intro cần phản ánh cả hai.
- Blog SEO dùng “TablePro team”, trong khi About mô tả một individual developer. “Team” có thể là byline hiện hành; không tự sửa tác giả của bài cũ. Copy chung nên dùng “TablePro” để tránh thêm cảm giác công ty không cần thiết.
- Positioning document vẫn chứa baseline Mac 0.77/0.76, còn platform catalog đã ghi 0.78. Không lấy version trong tài liệu rebuild cũ làm facts hiện tại.
- Sitemap document còn mô tả blog archive và locale coverage theo trạng thái trước khi có guides. Implement phải đối chiếu registry/controller hiện tại, rồi cập nhật tài liệu.
- Asset manifest có 126 `supplied`, 21 `placeholder`. Không thể giả định mọi screenshot cần cho copy mới đều đã có. Phải kiểm tra từng asset ID và bản crop/locale trước khi cắt phần giải thích nhờ ảnh.
- Glossary Việt và app-label rules hiện chặt hơn đề xuất trong chat trước. Không tự ý bỏ thuật ngữ/tên menu bắt buộc trong implementation.

## 4. Research: học gì từ các site khác

Các đoạn trích dưới đây được giữ ngắn. Nhận xét về tone là diễn giải của người review. Không suy ra conversion hoặc chất lượng sản phẩm từ copy.

### 4.1. Các mẫu gần TablePro nhất

| Sản phẩm và nguồn | Wording quan sát | Điều đáng học | Điều không lấy làm chuẩn |
|---|---|---|---|
| [Postico](https://eggerapps.at/postico2/) | “The native Mac app for PostgreSQL”; đoạn editing bắt đầu từ thao tác người dùng | Danh từ cụ thể, câu có đối tượng, mô tả đủ để hình dung app | Platform-specific identity không hợp yêu cầu TablePro; vẫn có tính từ quảng cáo |
| [TablePlus](https://tableplus.com/) | “Inline edit”, “Advanced filters”, “Open anything” | Feature name quen thuộc và mô tả ngắn bên dưới | Những lời hứa tổng quát về productivity và ngăn mọi sai sót |
| [Beekeeper](https://www.beekeeperstudio.io/) | “Write SQL”, “Open Lots of Tabs” | Những việc hằng ngày được nói bằng từ bình thường | Headline mang lời hứa cảm xúc và một số đoạn sales khá mạnh |
| [DataGrip features](https://lp.jetbrains.com/datagrip/features-overview/) | “Work with data”, “Work with files”, “Run queries” | Nhóm theo việc cần làm, dẫn sang phần chi tiết | Các modifiers quảng cáo và intro mang tính giải thích trang |
| [Sequel Ace](https://sequel-ace.com/) | “MySQL/MariaDB database management for macOS” | Category rõ, requirements/install là thông tin dễ tìm | Trang chủ thiên documentation; không dùng làm mẫu toàn bộ marketing flow |
| [HeidiSQL](https://www.heidisql.com/) | Overview đi thẳng vào loại dữ liệu, tác vụ và engines | Vocabulary của người dùng database, ít vòng vo | Không chuyển feature inventory dài sang homepage TablePro |

Postico là reference chính về sự cụ thể. TablePlus là reference cho nhãn feature. Không copy tagline hoặc nhịp toàn bộ site của một đối thủ.

### 4.2. Các đối chiếu bổ sung

| Sản phẩm và nguồn | Quan sát | Ứng dụng cho TablePro |
|---|---|---|
| [DBeaver Community](https://dbeaver.io/) | Overview, downloads và release information cùng hiện diện | Giữ đường tới release/docs rõ; tránh để changelog lấn át giới thiệu |
| [DbGate](https://dbgate.org/) | Site chuyển tới domain chính thức dbgate.io; giới thiệu SQL/NoSQL và nhiều cách dùng | Category và distribution mode là facts, nên tách khỏi slogan |
| [Navicat Premium](https://www.navicat.com/en/products/navicat-premium) | Feature navigation cụ thể; intro dài, nhiều tính từ và lời hứa tổng quát | Học taxonomy; giảm kiểu đoạn “tất cả lợi ích trong một câu” |
| [pgAdmin](https://www.pgadmin.org/) | “The PostgreSQL management tool”; platform nằm ở lớp installation | Ví dụ tốt về identity category và availability tách nhau |
| [MongoDB Compass](https://www.mongodb.com/products/tools/compass) | Trang riêng cho công cụ chuyên MongoDB | Database-specific page nên giải thích đặc thù engine, không lặp homepage |
| [phpMyAdmin](https://www.phpmyadmin.net/) | Overview gắn công cụ với MySQL/MariaDB, tài liệu và community | Giữ tên tác vụ quen thuộc; không mượn giọng enterprise |
| [MySQL Workbench](https://www.mysql.com/products/workbench/) | Nhóm “Develop”, “Administer”, “Analyze Performance” | Chia theo workflow nhưng không nhất thiết mọi heading đều là ba động từ |
| [Microsoft SSMS overview](https://learn.microsoft.com/en-us/ssms/sql-server-management-studio-ssms) | Mô tả phạm vi quản trị và query | Reference cho boundaries của comparison; đây là docs, không phải mẫu tone landing page |

Đã thử mở site Sequel Pro bằng công cụ research nhưng không truy cập được. Điều này chỉ là hạn chế của lần truy cập, **không đủ bằng chứng** để viết rằng site đã đóng hay sản phẩm đã ngừng. Comparison status phải kiểm tra release/repository/source hiện có riêng.

### 4.3. Developer products: dùng làm reference có chọn lọc

| Nguồn | Ví dụ | Nhận xét |
|---|---|---|
| [Linear](https://linear.app/) | “The product development system for teams and agents” | Một statement trung tâm, phần sau phát triển theo nhóm việc; tone hiện tại vẫn khá marketing |
| [Raycast](https://www.raycast.com/) | “Your shortcut to everything.” | Headline có ý riêng và nhiều ví dụ thao tác; không cần mượn các câu cảm xúc hoặc modifiers sáo |
| [Zed](https://zed.dev/) | “Your last next editor” | Có cá tính, subtitle giải thích sản phẩm và download rõ; không cần viết một slogan tương tự cho TablePro |

TablePro chưa cần headline ẩn dụ. “A native database client.” là một lựa chọn biên tập có chủ đích: người đọc nhận ra loại sản phẩm trước, rồi đánh giá bằng screenshot và workflow.

### 4.4. Pricing và feature detail

- [Postico pricing](https://eggerapps.at/postico2/buy.html): phân biệt người mua và điều kiện license. TablePro nên nói rõ phạm vi license bằng ngôn ngữ đơn giản; không áp cùng business model.
- [TablePlus pricing](https://tableplus.com/pricing): device count, thời hạn updates và one-time payment là thông tin gần lựa chọn mua. Với TablePro, unit/seat và subscription end cũng phải dễ thấy ở nơi chọn gói.
- [Beekeeper pricing](https://www.beekeeperstudio.io/pricing/): paid cards và feature matrix có vai trò khác nhau. Cards giúp lựa chọn; matrix dành cho đối chiếu chi tiết. TablePro nên tránh lặp toàn bộ matrix vào lead/card description.
- [Beekeeper Data Browser](https://www.beekeeperstudio.io/features/table-data): tác vụ được chia thành navigation, editing và filtering. Nhưng trang này vẫn có import “coming soon”, khác với homepage đã giới thiệu import. Không dùng một marketing page làm nguồn duy nhất để kết luận feature hiện tại.

### Kết luận áp dụng

1. Gọi tên sản phẩm và công việc bằng từ quen thuộc.
2. Mỗi block có một điều muốn người đọc nhớ.
3. Screenshot chứng minh hành vi, không chỉ trang trí.
4. Headline, availability, commercial terms và docs có vai trò riêng.
5. Một site có thể dài mà vẫn dễ đọc nếu các tầng thông tin rõ; đừng tối ưu chỉ số từ bằng cách xóa facts.

## 5. Quy tắc viết mới và kiến trúc thông điệp

### 5.1. Identity bền khi thêm nền tảng

| Lớp | Ví dụ | Nguồn / quy tắc |
|---|---|---|
| Identity | A native database client. | Không OS, version, runtime cụ thể, số lượng engine |
| Category description | Query, browse and edit data across supported databases | Không hứa hỗ trợ mọi engine hay mọi thao tác trên mọi platform |
| Availability | Download for Mac; requirement; architecture | Lấy từ released platform data |
| Capability scope | AI & MCP: Mac; iCloud Sync: platform/tier rõ | Capability matrix hoặc badge từ facts |
| Implementation detail | AppKit, SwiftUI, Keychain, Sparkle | FAQ, Security, About hoặc docs khi thực sự hữu ích |
| Commercial terms | Starter activations; Team seat unit | Pricing data, không tự chuyển thành license cross-platform |

Không làm identity phụ thuộc vào việc tương lai vẫn dùng Swift, AppKit hoặc cùng driver architecture. “Native” là lời mô tả sản phẩm hiện tại; khi phát hành một platform mới vẫn phải kiểm tra claim này có đúng với bản đó.

Không hứa “sau này chỉ đổi JSON là xong”. Model/component hiện tại vẫn có Mac/iOS-specific branches. Mục tiêu của rewrite là không phải viết lại positioning và prose chung; việc thêm installer, architecture, licenses và capability data vẫn là công việc của lần phát hành platform mới.

### 5.2. Thứ tự thông điệp

| Câu hỏi người đọc | Nội dung trả lời | Vị trí chính |
|---|---|---|
| Đây là gì? | Native database client | Hero |
| Có database tôi dùng không? | Supported engines | Hero subtitle, database section/hub |
| Tôi làm việc gì với nó? | Query, edit, inspect schema, move data | Workflow sections |
| Điểm cụ thể đáng thử? | Autocomplete; staged edits; Preview SQL; import connections | Screenshot + body |
| Mất tiền phần nào? | Free core; paid additions; platform scope | Hero note, pricing |
| Dùng trên máy tôi được không? | Released build, OS, architecture | Download/availability |
| Có hợp workflow của tôi không? | Engine-specific limits; comparison; permissions | Detail pages |
| Ai làm và có tin được không? | Maker, source, release history, accurate security facts | Footer/About/Security |

### 5.3. Sentence và vocabulary rules

- Heading thường 2–7 từ English; có thể dài hơn khi cần chính xác.
- Introduction thường 1–2 câu, không giải thích lại tên trang.
- Homepage feature body thường 25–45 từ English sau interpolation; không quá ba tính năng chính mỗi body.
- Chủ ngữ và động từ rõ: TablePro suggests, edits wait, import connections, export results.
- Hạn chế *powerful, seamless, effortlessly, intuitive, modern, ultimate, supercharge, unlock your potential* khi không thêm thông tin cụ thể.
- Không tự cấm mọi tính từ: native, read-only, encrypted, local có thể mang thông tin thật.
- Không ép mọi đoạn thành cùng số câu hoặc cùng nhịp; tránh tạo một template AI mới.
- “Safe Mode” là tên tính năng; không dùng “safe” như bảo đảm mọi write đều được bảo vệ.
- “Free” mô tả app/core feature; dùng AI provider có thể phát sinh phí của provider. AI section phải nói điều này ở lớp detail.
- Open source và paid features có thể cùng tồn tại. Không viết “free forever” hoặc hứa cập nhật trọn đời khi chưa có điều khoản đó.
- Không dùng đối thủ làm nền cho claim “lighter/faster/better”; không có benchmark thì không có so sánh performance.

### 5.4. Mức độ chi tiết

| Marketing giữ lại | Marketing giữ ngắn + link | Docs giải thích sâu |
|---|---|---|
| Tác vụ, định dạng chính, database support | Scope theo engine/platform | Connection form fields |
| Free/paid tier, seat unit | Safe Mode behavior và default quan trọng | Toàn bộ level/permission pipeline |
| Preview trước save, undo trước save | Data Rewind giới hạn và không thay backup | Retention/size limit và algorithm |
| Provider tự chọn, dữ liệu gửi tới đâu | AI write approvals và provider costs | Shortcuts, token setup, tool list |
| Cloud sign-in, SSH support | Driver/tool prerequisites | Runtime, timeout, protocol và cấu hình |

Các facts về bill, mất dữ liệu, bảo mật hoặc khác biệt có thể khiến người dùng chọn sai không được giấu sau docs link. Chuyển nội dung chỉ sau khi xác định trang đích thực sự chứa thông tin đó; ghi rõ phần còn thiếu thay vì xóa trước.

## 6. Homepage: audit từng section và copy draft

Giữ mười section hiện tại trong vòng triển khai đầu để review tác động wording riêng. Không tự đổi vị trí Sponsors đã được ghi là quyết định của owner. Các ID/legacy anchors tiếp tục tồn tại.

Mục tiêu biên tập: giảm khoảng 40–55% phần prose giới thiệu trước pricing cards. Đây là target để thử, không phải kết quả đã đo hoặc điều kiện ép cắt facts.

| Section / key | Vấn đề | Đề xuất |
|---|---|---|
| `hero.title` | “for developers” thêm ít thông tin | A native database client. |
| `hero.subtitle` | Đã khá trực tiếp | Giữ ý; engine list vẫn lấy từ data |
| `hero.native` | Giải thích framework/runtime ngay hero | Chuyển câu đầy đủ sang FAQ; hero không cần thêm slogan thay thế |
| `hero.business` | Dài nhưng thông tin cần có | Hai câu ngắn, paid-platform token và pricing link gần nhau |
| `databases.title` | Phân loại database dài như catalog | Supported databases |
| `databases.lead` | Driver delivery xuất hiện trước lý do chọn app | Hỗ trợ engine trước; plugin delivery một dòng phụ hoặc hub link |
| `sponsors` | Nhãn ổn | Giữ Sponsors/Sponsor TablePro; không diễn giải thành endorsement |
| `workflows.title` | Đưa Mac vào heading tổng quát | Working with your databases; phạm vi đặt bằng availability line riêng |
| `workflows.rows` | Quá nhiều subfeatures/row | Một workflow/row, link đúng detail page |
| `safety` | Levels, iOS, Agent và Rewind chen nhau | Đưa Safe Mode thành ý chính; Rewind và Agent về detail phù hợp |
| `ai` | Nhiều đoạn providers, modes, permissions | Một đoạn về assistant, một đoạn về MCP; provider và approval detail ở trang riêng |
| `platforms` | Lặp framework và feature inventory | Availability/requirements và khác biệt sử dụng thật |
| `switch` | Nhiều importer và project formats | Import existing connections + project settings; exception ngắn từ data |
| `pricing` | Lead kể lại cả matrix | Một câu free core, một câu paid additions; cards làm phần còn lại |
| `openSource` | “ready to download” thêm ít ý | Open source; maker/funding một đoạn ngắn |

### 6.1. Hero

**EN draft**

> A native database client.
>
> Run queries, browse and edit data in {featuredEngines} and more.
>
> Download for Mac
>
> {requirement} · {architectures}
>
> Free to use and open source. Paid plans add features to the {paidPlatformApps}. See pricing.

App Store action tiếp tục render theo trạng thái platform hiện có. Khi chưa có release Linux/Windows, không có CTA giả hoặc “coming soon” mặc định.

**VI direction**

> Database client native.
>
> Chạy query, xem và chỉnh sửa dữ liệu trên {featuredEngines} và nhiều cơ sở dữ liệu khác.

Headline VI cần owner review về độ tự nhiên; phương án “Ứng dụng native để làm việc với cơ sở dữ liệu.” tự nhiên hơn với người đọc rộng nhưng dài hơn và thay category term. Đề xuất giữ thuật ngữ hiện hành trong vòng đầu.

### 6.2. Database section

> Supported databases
>
> PostgreSQL, MySQL, SQLite, MongoDB, Redis and more.
>
> See supported databases.

Đây là bản thể hiện, không hardcode danh sách lần nữa trong JSON. Chỉ cần một intro nếu logo/list đã nói cùng nội dung. Giữ platform support khác nhau trong table/availability. Driver download mechanism để ở hub hoặc một note ngắn.

### 6.3. Năm workflow rows

| Row ID giữ nguyên | Heading đề xuất | Body draft | Phạm vi / lưu ý |
|---|---|---|---|
| `query` | SQL editor | Autocomplete suggests tables and columns from your schema. Save queries you reuse and search your query history. | Current desktop scope; EXPLAIN có link riêng, không cố nhét vào cùng body |
| `edit` | Preview your changes | Edits wait until you save. Review the SQL first, or undo changes in the tab. | Staged grid edits, không hứa SQL typed vào editor cũng đợi save |
| `schema` | Compare databases | Compare schema or data and generate a script for the target database. Review changes that could remove data before including them. | Badge Compare & Sync / Starter; engine support detail gần link |
| `files` | Import and export | Import {importFormats} files where supported. Export tables or query results as {exportFormats}. | Formats từ data, plugin format availability giữ đúng; Data Files là secondary link |
| `connect` | Connect to your servers | Use SSH tunnels, TLS or supported cloud sign-in methods. Keep saved connections organized with groups and tags. | Không hứa mọi engine có mọi auth method; passwords/source detail ở Connections |

Row `schema` sẽ tập trung Compare & Sync thay vì gộp ER diagram, users/roles và cross-engine copy. Các feature đó vẫn ở Schema page/hub và có thể là link phụ nếu layout cho phép.

### 6.4. Safety

> Safe Mode
>
> Set a Safe Mode level for each connection. Alert asks before writes; stricter levels can require Touch ID or your password.
>
> Safe Mode settings

Availability ghi current platform. Detail phải giữ default Silent, destructive-statement safeguards và engine exceptions. Không viết “Every write needs your approval” hoặc “Protect production from mistakes”. Rewind giữ badge paid ở trang editing, không dùng làm lời hứa khôi phục mọi thay đổi.

### 6.5. AI & MCP

> AI assistant and MCP
>
> Explain or fix SQL with the provider you choose. Use a cloud provider or a model running locally.
>
> Connect clients such as {mcpClients} to your saved connections through the built-in MCP server.

Nhãn availability: current Mac scope, Free. Trang detail nói rõ provider charges, dữ liệu gửi, read/write permissions và sự khác nhau giữa assistant provider và external MCP client. Không ngụ ý AI mặc định được bật hoặc mọi local model đều gọi tools.

### 6.6. Platforms

Heading tiếp tục dùng released-device token, không list nền tảng tương lai. Cards giữ download/badge, requirements và link tới capabilities. Bỏ đoạn giải thích cả framework, Keychain, Touch ID và update mechanism cùng lúc.

Mobile body draft:

> Browse tables, run queries and edit rows on {devices}. See supported databases and features.

Đây là mô tả nhóm tác vụ, không dùng để khẳng định Redis mobile có table browser. Trên trang `/ios` phải làm rõ support theo engine.

Sync note draft:

> iCloud Sync shares connections across supported Apple devices. It requires {tier} on the {macApp}.

App/platform names và tier phải render từ data hiện có. Không mở rộng iCloud sang Windows/Linux bằng cách thay danh từ chung.

### 6.7. Switching

> Bring your connections
>
> Import saved connections from {apps}, including passwords where supported. Or read database settings from your project files.
>
> Import connections

Nếu data chia importer có/không passwords, render hai nhóm đúng thay vì một câu hứa tất cả. Open Project Folder không được mô tả là scan mọi config format.

### 6.8. Pricing

> Free, Starter and Team
>
> Use the core app for free. Paid plans add features such as {starterExamples} to the {paidPlatformApps}.

Cards và platform note nói tiếp phần Team/mobile, không lặp full list ở lead. Dùng paid-feature/platform data để phát sinh ví dụ, không chép list lần thứ hai.

### 6.9. Open source

> Open source
>
> TablePro is open source under the AGPLv3, including its paid-feature code. Licenses and sponsors fund development.
>
> Made by {maker} in {city}, {country}.
>
> View source · About TablePro

Không thêm “no investors” vào mọi trang. Giữ nếu owner thấy có ý nghĩa ở About; không thay bằng claim “no tracking” vì Mac usage reports mặc định bật.

## 7. Features: kế hoạch cho hub và cả bảy trang

### 7.1. Hub `/features`

Title: `Features`. Lead draft: `Query, edit and work with data across supported databases.`

Không mở trang bằng việc app mobile làm ít hơn desktop. Scope hiển thị ở availability note và link mobile riêng.

| Slug | Card title đề xuất | Summary draft |
|---|---|---|
| `querying` | SQL editor | Autocomplete, saved queries and searchable history. Inspect query plans on supported engines. |
| `data-editing` | Data editing | Filter rows, follow foreign keys and review edits before saving. |
| `schema` | Schema | Inspect relationships, change table structure and compare supported databases. |
| `import-export` | Import and export | Move data between files and supported databases, or open a data file on its own. |
| `ai-mcp` | AI and MCP | Use your preferred AI provider, or connect an external client through MCP (Model Context Protocol). |
| `connections` | Connections | SSH tunnels, cloud sign-in and connections imported from other apps. |
| `sync-and-teams` | Sync and sharing | Sync through iCloud or share connections and queries with your team. |

Giữ official feature/plan names. Paid badges và platform note gần card hoặc shared summary; không kể toàn bộ features trong mỗi card.

### 7.2. Querying `/features/querying`

Title draft: `SQL editor`. Lead: `Write SQL with schema-aware autocomplete. Save queries you reuse, search your history and inspect plans on supported engines.`

| Anchor hiện có | Hướng rewrite |
|---|---|
| `editor` | Autocomplete là ý chính; một ví dụ alias/CTE nếu screenshot minh họa. Formatting/Vim là dòng phụ. Chuyển run-shortcut list và transaction exceptions sang docs |
| `history` | Chia parameters, history và saved SQL files thành khối ngắn. Giữ distinction linked SQL folder miễn phí với Linked Folders trả phí |
| `open-quickly` | Giữ tìm tables/views/queries và tab restore; không giải thích toàn bộ tab-state fields |
| `performance`, `explain` | Plan visualization và baseline comparison; giữ engine availability. Noise percentage ở docs |
| `query-insights` | Nêu phát hiện slow/failing queries từ local history; badge Starter; không hứa server-wide monitoring |
| `results` | Charts và maps là hai feature riêng, paid status khác nhau. Giữ Apple map-tile note nếu nói dữ liệu local |
| `other-languages` | Một link tới engine-specific query languages; không gọi MongoDB/Redis là SQL |
| `iphone` | Scope ngắn và link `/ios`; bảng giữ no autocomplete/EXPLAIN/saved queries |

Mục tiêu 450–700 từ visible prose, chưa tính bảng dài; có thể hơn nếu engine caveat cần thiết.

### 7.3. Data editing `/features/data-editing`

Title: `Data editing`. Lead: `Filter rows, follow foreign keys and edit values in the grid. Changes wait until you save, with SQL available to review first.`

| Anchor | Hướng rewrite |
|---|---|
| `browse`, `filters` | Tìm rows, sort/filter, highlight; bỏ count-estimate threshold khỏi intro |
| `foreign-keys` | Follow referenced row và value picker; JSON viewer là secondary block |
| `edit` | Staged edits → Preview SQL → Save. Undo chỉ trước save; query-result eligibility giữ note ngắn |
| `safe-mode` | Per-connection levels, default và destructive checks. Không hứa Read-Only hoạt động giống nhau trên mọi engine |
| `data-rewind` | Restore previous values; Starter; caveat không thay backup và không undo external changes/cascades giữ visible |
| `documents-and-keys` | MongoDB documents và Redis keys có thao tác khác rows; link riêng |
| `iphone` | Row editing khác staged desktop editing; primary-key requirement vẫn có |

Không dùng “without surprises” làm lời hứa production. Kiểm tra claim “nothing is sent before save” chỉ áp dụng data-editing action đang mô tả.

### 7.4. Schema `/features/schema`

Title: `Schema and database comparison`. Lead: `Inspect table relationships, change supported table structures and compare databases before applying a sync script.`

| Anchor | Hướng rewrite |
|---|---|
| `structure` | Columns/indexes/constraints với DDL preview; giữ read-only/partial-engine availability |
| `er-diagram` | Xem relationships, export diagram; visible note read-only, không phải designer |
| `objects`, `table-folders` | Source của routines/triggers và organization; tránh runtime inventory ở intro |
| `compare-sync` | Source/target, schema/data, generated script; Starter; review destructive changes |
| `copy` | Copy/transfer giữa supported engines; type approximations và unsupported target phải rõ |
| `administer` | Users & Roles/dashboard chỉ trên engines hỗ trợ; không mô tả như DBA suite cho tất cả |
| `iphone` | Structure inspection, không schema editor; link mobile |

Ba việc inspect schema, compare, copy không phải cùng một feature. Layout phân biệt được chúng mà không buộc thêm ba trang mới.

### 7.5. Import/export `/features/import-export`

Title: `Import and export`. Lead: `Import files into supported tables and export tables or query results. Open CSV, JSON and Excel files without a database connection.`

| Anchor | Hướng rewrite |
|---|---|
| `import` | Formats, column mapping, existing/new table; transaction behavior là note đúng scope; error-policy setup sang docs |
| `export` | Tables/results; grid cap khác streamed export; format/plugin scope giữ rõ |
| `data-files` | Open/filter/clean data file; XLSX read-only note ngay tại file capability |
| `backup` | Engine dump tools và prerequisites; không gọi export result là backup |
| `files` | SQLite/DuckDB/Parquet/Beancount là workflows khác; đường tới engine page |
| Existing inter-database section | Copy/transfer có link Schema thay vì giải thích lần nữa |
| `iphone` | Copy/share loaded rows và Shortcuts import-like actions; không nói có desktop import dialog |

Giữ distinction CSV import trực tiếp và `.csv.gz` mở qua Data Files; Excel import chỉ first sheet. Không rút gọn thành “Import any spreadsheet”.

### 7.6. AI/MCP `/features/ai-mcp`

Title: `AI assistant and MCP`. Lead: `Explain or fix SQL with your preferred provider. Connect AI clients to saved connections through MCP (Model Context Protocol).`

| Anchor | Hướng rewrite |
|---|---|
| `assistant` | Provider tự chọn; cloud/local; provider fees; schema/query context và opt-in result rows |
| `in-the-editor` | Review/Explain/Optimize/Fix với một screenshot, không liệt kê cả phím tắt |
| `agent-mode` | Phân biệt Ask/Edit/Agent chat và full-window Agent. Ask không chạy statements; write approval phụ thuộc mode/connection. Giữ Silent caveat |
| `mcp` | External clients dùng saved connections; password không chuyển cho client; một ví dụ request cụ thể |
| `permissions` | Tóm tắt token scope + per-connection access + approval + Safe Mode; docs giữ pipeline đầy đủ |
| `outside-servers` | Hướng kết nối ngược với external tools; không gộp vào built-in server claim |
| `automation` | AppleScript, URL, shell command và Raycast: phân biệt open với execute |
| `privacy` | Direct-to-provider, local models, external-client data transfer; không viết “your data never leaves” |
| Mobile scope | Một availability note, không thêm phần phủ định dài nếu table đã thể hiện |

Đề xuất giữ trang này dài hơn các feature khác, khoảng 650–900 từ prose. Copy AI ngắn quá dễ làm người đọc hiểu sai quyền thực thi.

### 7.7. Connections `/features/connections`

Title: `Connections`. Lead: `Save and organize connections, reach private servers through SSH and sign in with supported cloud accounts.`

| Anchor | Hướng rewrite |
|---|---|
| `organize` | Groups/tags/favorites/multiple connections; bỏ tên mọi form tab khỏi prose |
| `import` | Other app / project config / AWS là ba đường rõ; importer/password exceptions giữ gần link |
| `network` | SSH/TLS; jump hosts; proxies/tunnel commands. Protocol/auth details tới docs |
| `cloud-auth` | AWS IAM, Entra, Google với supported-engine scope; không gọi universal SSO |
| `credentials` | Keychain/secret sources, free credential profiles và paid Environment Variables phân biệt |
| `policies` | Safe Mode, AI policy và External Clients có mục đích khác; tóm tắt và link |
| `iphone` | Những gì mobile hỗ trợ, không “does part of it” |

Giữ setup prerequisites quan trọng như provider CLI hoặc OAuth client khi mô tả một workflow thực tế; bỏ PATH directory inventory khỏi marketing introduction.

### 7.8. Sync/teams `/features/sync-and-teams`

Title: `Sync and sharing`. Lead: `Sync connections through iCloud, share connection files or publish connections and queries to your team.`

| Anchor | Hướng rewrite |
|---|---|
| `icloud-sync` | Apple-device scope và Starter trên Mac; passwords opt-in riêng |
| `handoff` | Continue saved connection/table; không nói chuyển cả query session |
| `share` | Connection file/link; password-free default; paid scope Encrypted Export |
| `linked-folders` | Connection files, không SQL folders; source commands ignored là detail note |
| `team` | Team Catalog = shared folder; Team Library = TablePro server. Hai mô hình data flow khác nhau |
| `seats` | Một seat = một activated Mac hiện tại; không viết một seat = một người |
| `iphone` | iCloud/Handoff/file support; không Team Library/Catalog |

Không thay “Mac” bằng “device” trong license copy để chuẩn bị tương lai: việc đó sẽ đổi nghĩa thương mại. Chỉ abstraction hóa nơi có data hỗ trợ.

## 8. Database hub và toàn bộ 23 trang database

### 8.1. Hub `/databases`

Title: `Supported databases`. Lead draft: `Find your database and check its supported features.`

Catalog/table đã thể hiện engines và categories. Giữ query language, driver source, platform support. Dùng facts cho count nếu cần, không biến count thành tagline identity. “No database needs a license” đổi thành câu chính xác hơn: `Every supported database connection is included in Free.`

Không cần rewrite tagline của toàn bộ engine catalog thành lời quảng cáo. Rút mỗi tagline về một hoặc hai đặc thù để đọc được trong table. Giới hạn vẫn từ `content/{locale}/engines.json` và facts.

### 8.2. Template đề xuất cho engine detail

1. H1 gọi tên client/GUI của engine; platform không nằm trong H1 chung.
2. Lead 1–2 câu nêu thao tác đặc thù, không kể cả connect/admin/import.
3. Availability, driver/prerequisite và free status từ dữ liệu.
4. Khoảng 3–5 nhóm chính: connect ngắn, query/browse, schema/admin nếu có, move data.
5. Limits ảnh hưởng quyết định vẫn visible; setup/troubleshooting sâu có docs link.
6. FAQ chỉ cho câu hỏi không trùng body; related pages và download.

Đề xuất đổi H1 `{Engine} client for {devices}` thành `{Engine} client` và giữ platform ở availability. Meta title có thể dùng platform token ở lớp SEO nếu phù hợp search intent, không cần cố xóa Mac khỏi mọi technical tutorial/comparison URL.

### 8.3. Checklist riêng từng trang

Mỗi hàng có angle và draft lead. Đây là briefing để viết body, không được dùng draft lead để bỏ limits đang có trong engine data.

| Route | H1 / lead draft | Giữ làm điểm đặc thù | Chi tiết rút khỏi introduction / giới hạn cần giữ |
|---|---|---|---|
| `/postgresql-client` | **PostgreSQL client.** Query PostgreSQL, browse schemas and edit rows with SQL previews. Inspect EXPLAIN plans and PostgreSQL-specific data types. | jsonb/arrays/PostGIS, schemas, plans, roles | Libpq option list và maintenance flags tới docs; column-reorder script-only giữ |
| `/mysql-client` | **MySQL client.** Query MySQL and edit rows with SQL previews. Manage supported users, sessions and backups from the same connection. | MySQL/MariaDB family, IAM, admin | Auth/network inventory giảm; TCP-only, local socket và LOAD DATA refusal giữ |
| `/sql-server-client` | **SQL Server client.** Run T-SQL scripts with GO batches and PRINT output. Connect with a SQL login, Kerberos or Microsoft Entra ID. | T-SQL batches và authentication | Không hứa toàn bộ SSMS behavior; no execution-plan view, named instances, NTLM và transaction behavior giữ |
| `/sqlite-client` | **SQLite client.** Open a SQLite file, run SQL and inspect its tables. Review supported structure changes before applying them. | Local/remote files, extensions, sample DB | Finder-specific steps ở install/availability; SQLCipher/SEE unsupported, remote extensions và iOS copy behavior giữ |
| `/mongodb-client` | **MongoDB client.** Browse collections, query with mongosh-style syntax and edit documents as Extended JSON. | Shell syntax, field operations, Atlas | Không nói là mongosh binary; no transactions/GridFS/change streams/pipeline builder giữ |
| `/redis-gui` | **Redis GUI.** Browse keys by prefix, inspect their types and TTLs, and run Redis commands. | Key tree, Sentinel/Cluster, TTL | Grid sửa string values; other types qua commands; Safe Mode counts reads as writes và mobile query-only giữ |
| `/redshift-client` | **Amazon Redshift client.** Query provisioned clusters or Serverless workgroups. Inspect sort keys, distribution styles and external schemas. | Warehouse metadata, Spectrum/datashares | PostgreSQL shared driver là detail; EXPLAIN text và backup-tool caveat giữ |
| `/oracle-client` | **Oracle client.** Run SQL and PL/SQL without installing Oracle Instant Client. Read DBMS_OUTPUT alongside query results. | No Instant Client prerequisite, SQL*Plus-style scripts | Swift protocol implementation sang docs; mTLS/wallet/auth boundaries và commit behavior giữ đúng |
| `/clickhouse-client` | **ClickHouse client.** Run analytical queries, inspect plans and pipelines, and manage table parts and partitions. | Query progress/cancel, MergeTree Parts | HTTP/native port distinction; mutation/transaction limits giữ; không hứa row update thông thường |
| `/duckdb-client` | **DuckDB client.** Open a DuckDB database or query Parquet, CSV and JSON files with SQL. | Files as views, EXPLAIN, no local server setup | Read-only data-file views, file locking và experimental remote mode giữ |
| `/cassandra-client` | **Cassandra and ScyllaDB client.** Browse keyspaces, run CQL and edit rows by their primary keys. | CQL, ScyllaDB, Amazon Keyspaces | Paging/filter scans, no transaction và incomplete DDL representation không biến mất |
| `/dynamodb-gui` | **Amazon DynamoDB GUI.** Browse items, query by keys and inspect consumed read capacity. Edit typed values or run PartiQL requests. | Query vs Scan, capacity, typed items | Scan cost và no grid transaction gần claim; detailed action list/IAM setup tới docs |
| `/bigquery-client` | **Google BigQuery client.** Write GoogleSQL, estimate query cost and set a billed-bytes limit. | Dry run, bytes billed, Cloud Storage unload | Cost estimates không guarantee bill; identical-row edits và no import giữ |
| `/snowflake-client` | **Snowflake client.** Query and edit tables, switch warehouses and roles, and export to a stage. | Session context, account sign-in, VARIANT | Auth method matrix sang docs; warehouse requirement, DDL limits và timestamp behavior giữ |
| `/cloudflare-d1-client` | **Cloudflare D1 client.** Browse D1 databases in your Cloudflare account and run SQLite queries through its API. | Account database switch, REST access | No cross-request transaction/session và no import giữ; token creation steps tới docs |
| `/turso-client` | **Turso and libSQL client.** Connect with a database URL and token. Browse tables and run SQLite queries. | Remote/local libSQL distinction | Remote no transactions, extensions/local scope và no import giữ |
| `/elasticsearch-client` | **Elasticsearch client.** Run Query DSL requests and browse index documents in a grid. Edit documents by their IDs. | REST console, mapping-derived fields | Không gọi SQL client; mappings read-only/no import và query-window issue giữ |
| `/etcd-gui` | **etcd GUI.** Browse keys by prefix, change values and manage leases with etcdctl-style commands. | Prefix tree, leases, command editor | Không gọi etcdctl binary; Read-Only blocking all commands và auth-change cautions giữ |
| `/kafka-client` | **Kafka client.** Inspect topic messages and consumer lag, or produce a test message with KafkaQL. | Read-position control, lag, test messages | KafkaQL riêng TablePro; no message editing và SSH broker limitations giữ |
| `/surrealdb-client` | **SurrealDB client.** Run SurrealQL and edit record fields while preserving their types. | Record links/types, script execution | Schema read-only; transaction within one request và relation-edit limits giữ |
| `/teradata-client` | **Teradata client.** Query and edit Teradata without installing separate client software. Browse databases, users, procedures and macros. | Driver prerequisite, namespace/model | Swift implementation detail giảm; auth/TLS và same-engine copy restrictions giữ |
| `/trino-client` | **Trino client.** Query across catalogs, inspect plans and cancel running queries. | Cross-catalog joins, plan modes | Connector-dependent writes, duplicate-row edits và autocommit phải rõ |
| `/beancount-client` | **Beancount client.** Query a ledger as SQL tables or use BQL with rledger. Edit the source ledger in your own text editor. | Ledger projection, source locations, watch/reload | Backend prerequisite và read-only giữ; launchctl/PATH hướng dẫn tới docs |

### 8.4. Family engines và redirects

Không tạo thêm route chỉ để tăng SEO copy. Giữ family sections, facts và anchors cho:

- MySQL family: MariaDB, TiDB, OceanBase, Databend.
- PostgreSQL family: CockroachDB, PGlite; Redshift đã có page riêng.
- Cassandra family: ScyllaDB.
- Turso page: libSQL remote/local.
- Search/vector engines không có trang riêng vẫn có supported-engine row/tagline/limits đúng, không quảng cáo như chưa có support.

Các route đã merge như `/mariadb-client`, `/cockroachdb-client`, `/pglite-client`, `/scylladb-client` tiếp tục redirect. Cắt body không được làm mất đích anchor.

## 9. Compare hub và cả 15 trang comparison

### 9.1. Hub `/compare`

Title: `Compare database clients`. Lead draft: `Compare features, supported databases and licensing. Each page includes sources and a checked date.`

“Choose by situation” hữu ích, nhưng mỗi entry chỉ nêu một lý do đặc thù. Bảng tổng hợp làm nhiệm vụ đối chiếu. Methodology rút xuống một đoạn ở cuối, giữ source links/date.

### 9.2. Template detail

- H1 và intro 1–2 câu gọi đúng category/edition, không kể cả business model hai sản phẩm ngay đầu.
- Short answer: khoảng 2–3 lý do mỗi bên, không cố nhét mọi lợi thế.
- Table: nơi chính cho platform, prices, engines, source/license và feature scope.
- Body: giải thích 3–5 khác biệt đáng quyết định, tránh lặp lại table thành prose.
- Switching: importer/path/prerequisites và những gì không chuyển.
- FAQ: chỉ các câu chưa được trả lời rõ phía trên.
- Sources: ngày, edition/version và link trực tiếp. Các facts cũ được kiểm tra lại khi implement.

Không có bài “TablePro thắng”. Các câu kỹ thuật về Electron/Java chỉ là kiến trúc, không tự chứng minh performance.

### 9.3. Angle và nội dung bắt buộc từng trang

| Slug | Angle biên tập / intro draft | Giữ và kiểm tra lại khi implement |
|---|---|---|
| `tableplus` | TablePlus and TablePro are native database clients. Compare their free features, licensing and supported platforms. | Free tab/window limits, licenses/updates, engine differences, Setapp importer. Similar-name independence note để ở cuối/sources |
| `datagrip` | DataGrip is a database IDE. TablePro is a native database client with optional paid features. | Non-commercial/commercial distinction; inspections/VCS; TablePro Git scope; passwords behind master password |
| `dbeaver` | Compare DBeaver Community and paid editions with TablePro’s supported databases and features. | Edition-dependent NoSQL/AI/visual tools; JDBC coverage; workspace importer; không generalize paid features của mọi edition |
| `beekeeper-studio` | Beekeeper Studio and TablePro are open-source database clients with different free and paid features. | Community/paid engines, AI tiers, cloud workspaces, local-only connection import, license continuity |
| `navicat` | Compare Navicat Premium, Premium Lite and TablePro by features, licensing and supported databases. | Edition/modeling scope, cloud/on-prem, scheduling; `.ncx` file và password handling |
| `sequel-ace` | Sequel Ace focuses on MySQL and MariaDB. TablePro also supports other database types. | Both native/open-source; không claim một bên không maintained; password import exceptions |
| `sequel-pro` | Sequel Ace is the direct successor to Sequel Pro. TablePro is another option when you need more database types. | Alternatives format; verified historical status/date; migration chain. Failure mở website không phải proof đóng site |
| `postico` | Postico focuses on PostgreSQL. TablePro connects to PostgreSQL and other supported databases. | Focused tool strengths, license/evaluation distinction, OS requirements, admin differences và importer scope |
| `heidisql` | HeidiSQL and TablePro are database clients with different engine and platform support. | Current Mac build/architecture, Firebird/Interbase/ProxySQL support, no importer. Recheck hiện trạng trước publication |
| `phpmyadmin` | phpMyAdmin runs on a web server. TablePro connects from a native desktop app. | Hosting/cPanel workflow; server setup boundary; không fear-based security framing; no importer |
| `mysql-workbench` | Compare Oracle’s MySQL Workbench with TablePro for MySQL and other databases. | Current new Workbench so với old releases; SQL notebooks/JS/TS, server-version support, backup/migration features |
| `pgadmin` | pgAdmin focuses on PostgreSQL administration. TablePro supports PostgreSQL alongside other databases. | Desktop/server mode, debugger/jobs/schema tools; cả hai có AI nên không viết đối thủ không có AI |
| `dbgate` | DbGate offers desktop and web clients. Compare its editions with TablePro’s native client. | Community/Premium boundaries, query designer, cloud connections, no importer; browser deployment không phải app native |
| `mongodb-compass` | Compass is a dedicated MongoDB GUI. TablePro places MongoDB alongside your other databases. | Pipeline builder/schema analysis/modeling/visual explain/live metrics; TablePro mongosh-style shell; no native connection importer |
| `ssms` | Looking for a SQL Server client outside Windows? Compare TablePro’s scope with SQL Server Management Studio. | Alternatives format, not parity replacement; Agent/Always On/admin/execution plan gaps; current Microsoft Mac recommendation |

Platform limitations hiện đang hardcode ở nhiều comparison. Đề xuất tập trung vào platform cells/tokens thay vì lặp “no Windows or Linux” cả lead, stronger và limits. Chỉ refactor khi có đúng dynamic data; trước khi platform mới released, limitation vẫn phải thấy rõ.

Suggested target: 500–850 từ prose/trang comparison, có thể hơn ở edition-heavy products. Không áp một quota cho mọi trang.

## 10. Pricing, Download, iOS và các trang còn lại

### 10.1. Pricing `/pricing`

**Vấn đề:** page lead, cards, matrix, license, billing và FAQ lặp facts. Một số mô tả card định nghĩa Free bằng thứ nó thiếu. Các đoạn máy chủ kiểm tra license, merchant xử lý payment và invite mechanics dài hơn mức cần ở lớp lựa chọn gói.

**Intro draft**

> Pricing
>
> Start with Free. Starter and Team add features to the {paidPlatformApps}.

Không dùng “Start” để ngụ ý free trial; ngay cạnh cards phải có `No trial period.` hoặc câu tương đương. Free là gói dùng lâu dài, paid features có scope rõ.

| Thành phần | Copy direction / draft |
|---|---|
| Free description | Query, browse and edit your databases. |
| Free includes | All supported database connections; SQL editor and data grid; AI assistant and MCP; Safe Mode. Platform scope mobile riêng |
| Starter description | Add database comparison, query insights, data rewind and other {paidPlatformApps} features. Feature names/examples từ data, không hardcode list trong implementation |
| Team description | Share connections and saved queries with your team. Includes Starter. |
| Starter activation | One person, up to {count} Macs. Giữ unit hiện tại, không đổi thành devices |
| Team activation | One activated Mac per seat. |
| Monthly caption | Renews monthly until cancelled. |
| Yearly caption | Renews yearly until cancelled. Savings từ data nếu dùng; unit phải là yearly total hoặc billed-yearly đúng |
| One-time caption | Pay once. No expiry date. Không hứa future updates |
| Refund note | Refund terms, including eligible renewals, vẫn có; không đổi thành slogan satisfaction guarantee |
| Taxes/merchant | USD, tax checkout và merchant đúng current provider; detail ở billing |

Giữ matrix như reference đầy đủ. “How licenses work” gồm người/máy, activation, offline window, subscription end và one-time. Payload/license-check implementation có thể trong disclosure hoặc Security/Privacy link nhưng không xóa offline limitation.

Paid feature microcopy:

| Feature | Một câu draft |
|---|---|
| Compare & Sync | Compare supported databases and generate a sync script. |
| Query Insights | Find slow and failing queries in this device’s local query history. Current scope/badge vẫn là Mac |
| Result Charts | Plot query results as charts. |
| Data Rewind | Review and restore eligible values from a recent save. |
| iCloud Sync | Sync supported data through your iCloud account. |
| Linked Folders | Read shared connection files from a folder. |
| Encrypted Export | Export connection files with passwords protected by a passphrase. |
| Environment Variables | Use environment values in supported connection fields. |
| Team Catalog | Publish connection files to a shared folder. |
| Team Library | Share connections and saved queries through TablePro’s server. |

Không viết paid charts cạnh free map dưới một badge chung. Không mô tả Team Library là password sharing. App Store miễn phí không có nghĩa paid Mac sync miễn phí.

### 10.2. Download `/download`

Title: `Download TablePro`. Lead draft: `Choose a build for your device.` Nếu cấu trúc hiện tại chỉ có Mac download + App Store, có thể bỏ lead và để cards tự giải thích.

Thứ tự đề xuất: current release/build choices → requirements → install alternatives → first run → updates/older versions → unsupported platforms.

- Keep `Download for Apple silicon`, `Download for Intel`, Homebrew, checksum và release-not-loaded fallback.
- Không tự chọn architecture chỉ dựa trên browser; current code chỉ gợi ý, không guarantee chip detection.
- Release-not-loaded draft: `Release details are unavailable. Open the latest release on GitHub to choose a build.` Chỉ dùng nếu button behavior vẫn khớp.
- After-click draft: `Open {file} and drag TablePro into Applications.` Không khẳng định download đã thành công.
- Drivers: một note rõ missing driver cần network lần đầu; không dồn runtime inventory vào install steps.
- Updates giữ signed verification và automation settings ở detail; staged rollouts không cần dài ở intro.
- Other-platform state từ data. Không thêm waitlist/release date vì user chưa yêu cầu.

### 10.3. iPhone/iPad `/ios`

Platform-specific landing page được phép gọi tên platform. Đây không phải identity toàn sản phẩm.

Title giữ `TablePro for iPhone and iPad`.

Lead draft:

> Browse tables, run queries and edit rows on your phone or tablet. Free, with no in-app purchases.

Phải có engine availability ngay dưới để tránh hiểu Redis cũng browse/edit rows. Không cần câu “not a copy of the Mac app” trong hero.

| Khối | Hướng biên tập |
|---|---|
| Databases | Supported mobile engines + synced-only scope; bundled drivers một note |
| Browse | Row cards, filter, foreign-key preview, row edit; primary-key requirement |
| Query | Run/stop/share result; history/result limits giữ; Live Activity một câu riêng |
| Security | SSH/TLS/Keychain; SQL Server TLS verification exception vẫn visible |
| Safe Mode/app lock | Write confirmation và Face ID lock là hai thứ khác nhau |
| iPad | Multitasking/keyboard; không cần toàn bộ shortcut inventory |
| With Mac | iCloud/Handoff; paid Mac requirement; password opt-in |
| Automation | Shortcuts/widgets/Spotlight; locked-device constraints nếu mô tả background writes |
| Limits/known issues | Rút trùng lặp nhưng giữ actual version-specific issues |
| Privacy | Opt-in report và link policy; không bỏ sự khác nhau với desktop report |

Target 650–950 từ prose. Không rút bằng cách bỏ platform-specific limits.

### 10.4. About `/about`

Giữ phần identity hiện tại: maker, location, nguồn code và contact đã có facts. Không tạo founder story, mission statement hoặc số người dùng mới.

Intro draft:

> TablePro is made by {maker} in {city}, {country}. Licenses and sponsors fund its development.

Owner có thể chọn first person nếu muốn giọng cá nhân; default vẫn third person để không đổi chủ thể phát ngôn bất ngờ. Seller/Sponsors identity verification là detail, không cần mở bài.

Source/license, contact và brand downloads giữ dễ tìm. Policies chuyển thành link group nếu paragraphs chỉ kể mỗi trang có gì. “No investors” giữ ở đây nếu owner thích, không lặp toàn site.

### 10.5. FAQ `/faq`

Giữ nhóm câu hỏi, giảm mỗi answer về câu trả lời trực tiếp trước rồi detail/link. Intro có thể bỏ; heading đã đủ.

| Nhóm hiện có | Hướng sửa |
|---|---|
| General | What is/free/open source/work: 1–2 câu; native explanation đặt ở đây |
| Platforms | Released platforms/OS/languages từ data; không roadmap commitment |
| Databases | Support list, drivers, SSH/TLS, credentials, importer scope |
| Pricing/licenses | Giá link tới pricing; seat/offline/end/refund giữ exact semantics |
| Privacy/network | Mac opt-out vs iOS opt-in, AI direct-provider, Team Library exception |
| Account/team | Sign-in/invite/seat/cancel steps; không hứa mọi teammate có web account |
| Switching | Không trả lời “No” tuyệt đối về setup lại nếu importer không hỗ trợ app của người đọc |

Ví dụ answer draft:

> Is TablePro free? Yes. The core app has no trial period. Paid plans add features to the {paidPlatformApps}.

> Do I need an account? No account is required to use the app. Purchasers use the account portal to manage licenses.

> Can I import my connections? TablePro imports connections from supported clients. Password support depends on how the source app stores them.

FAQ hiện nói “short answers” nhưng khoảng 1.900 source words. Target 1.000–1.400 là hợp lý để thử, không phải yêu cầu xóa câu hỏi cần thiết.

### 10.6. Security `/security`

Đây là nơi detail tạo trust; không rewrite thành lợi ích quảng cáo. Giữ headings dễ tra cứu và limits cạnh từng control.

Lead draft: `How TablePro stores credentials, sends data and handles updates and database safeguards.`

Các phần cần giữ: credentials, outbound data, distribution/signatures, Safe Mode/defaults, MCP local/auth/access, open source, private vulnerability reporting.

Đề xuất đổi các heading dài “What protects a database from a mistake” thành “Database safeguards”, “How the apps reach you” thành “App distribution”. Giữ Mac không sandboxed, plugin credential access và telemetry/IP retention facts; không đặt “secure by default” thay cho facts này.

### 10.7. Legal: Privacy, Terms, Refund policy

Không đổi commercial/legal meaning trong dự án wording. Audit editorial: intro dễ hiểu, headings/links/defined terms nhất quán, thông tin khớp pricing/security. Không sửa điều khoản theo lời tư vấn pháp lý trong tài liệu này.

| Trang | Công việc cụ thể |
|---|---|
| Privacy | Giữ summary, Mac usage report default, license payload, Team Library, providers, cookies/chat/analytics, retention và contact; bỏ prose meta nếu có nhưng không bỏ disclosure |
| Terms | Soát tên plans/license/device counts/renewals/support/cancellation với pricing data; giữ nguyên nghĩa warranty/liability/governing-law |
| Refund policy | Purchase và renewal window, refund channel, original method, suspension, cancellation distinction; không rút thành một “money-back guarantee” mơ hồ |

Các statement về chat loading phải đối chiếu code hiện tại; sitemap cũ có mô tả click-to-load nhưng privacy/FAQ hiện nói loads on every page. Không sửa policy theo trí nhớ hoặc theo positioning cũ.

## 11. Blog: index, sáu guides và mười announcements

### 11.1. Index và chrome

Intro draft: `Database guides and release notes from TablePro.`

Giữ groups Guides/Release notes, title/date/description rõ. Bỏ “newest first” và “Not every release gets a post” khỏi intro. Link changelog vẫn có cho complete release notes.

Archive note draft: `This post describes {release} when it was released. See current features and the changelog.` Giữ date và links. Correction notes không bị xóa hoặc sửa thành marketing copy.

### 11.2. Guides

Guides được phép có platform trong title vì giải quyết truy vấn cụ thể. Không đổi URL có `-mac` chỉ để làm brand platform-neutral.

| File / slug | Review và hướng sửa |
|---|---|
| `open-sqlite-file-mac` | Giữ đường CLI và TablePro, mở bằng thao tác ngắn; troubleshooting và encryption/file-lock limits giữ |
| `postgresql-ssh-tunnel-mac` | Giữ `ssh -L` example, app steps, auth/jump host và unix-socket boundary; giảm câu mở giải thích bố cục |
| `connect-postgresql-mysql-docker-mac` | Port publishing → localhost connection → Compose import; không dồn platform/container networking caveats vào intro |
| `import-csv-postgresql-mysql` | Giữ CLI bulk loaders và GUI alternatives; transaction/error modes, first-sheet, compressed-file scope cần đủ detail |
| `connect-amazon-rds-mac` | Connection prerequisites/network và auth trước app steps; không nói app giải quyết AWS security-group configuration tự động |
| `claude-code-cursor-database-mcp` | Giữ actual config, enable server, access scopes, Safe Mode và log; không biến thành AI productivity article |

Tutorial instructions phải kiểm tra với current app labels trước sửa. Dùng examples nhỏ, không viết lại lệnh/code chỉ để đổi tone. Mục tiêu là dẫn người đọc tới kết quả nhanh hơn, không ép tutorial xuống độ dài homepage.

### 11.3. Announcements / archive

| File | Cách xử lý |
|---|---|
| `tablepro-0-67` | Giữ lịch sử charts/editor/statement runs; archive note và current CTA/chrome được rút |
| `tablepro-0-68` | Compare & Sync/routines/grid là facts phiên bản; không thay bằng khả năng hiện tại |
| `tablepro-0-69` | Rewind announcement; giữ điều kiện restore, không sửa thành undo mọi committed write |
| `tablepro-0-70` | Review lead về tính năng phiên bản được công bố; giữ version/date và historical body |
| `tablepro-0-72` | Giữ historical scope; shared CTA/archive copy được sửa |
| `tablepro-0-73` | Giữ historical scope; không áp capability hiện tại ngược vào bài |
| `tablepro-0-74` | Giữ dated correction về map tiles; không xóa evidence của claim cũ |
| `tablepro-0-76` | Giữ release-specific instructions và giới hạn đã công bố |
| `tablepro-0-77` | Giữ engine/runtime/version detail ở archive; không chuyển nguyên kiểu văn này lên homepage |
| `tablepro-for-iphone` | Giữ launch context và dated correction về jump hosts/transactions/in-memory SQLite |

Đề xuất **không rewrite body archive hàng loạt**. Rewrite toàn bộ marketing surface vẫn bao gồm index, cards, CTAs và notes, nhưng historical articles không phải copy quảng cáo hiện hành. Nếu owner muốn sửa body các bài cũ, làm batch riêng có diff và bảo toàn datePublished/corrections.

## 12. Copy dùng chung, SEO, assets và localization

### 12.1. Tất cả 16 file catalog English

| Namespace | Phạm vi review |
|---|---|
| `nav` | Giữ Features/Databases/Pricing/Download/Compare; feature-menu descriptions ngắn, tên feature nhất quán |
| `footer` | Links ổn; newsletter nói nội dung gửi trước; copyright/maker/license đúng data |
| `pricing` | Cards/cycle/matrix/refund/tax/checkout theo mục 10.1; không đổi unit hoặc policy |
| `download` | CTA rõ platform/architecture; fallback và after-click khớp hành vi |
| `platforms` | Released availability, requirement text, app names, unsupported state; không rename Apple-specific facts thành universal |
| `seo` | Product short bỏ “for developers” nếu chọn headline mới; long không định nghĩa mọi native app đều Swift |
| `blog` | Index/related/latest/archive/correction copy; không sai archive semantics |
| `forms` | Success/error trực tiếp, có next step; không đổi validation/API semantics |
| `consent` | Consent category/provider rõ; Allow/Decline ngang nhau, không dùng persuasive sales copy |
| `banner` | Current banner mang lời mời mua lặp ở mọi trang; đề xuất rút hoặc owner quyết định tắt, không tự đổi config |
| `errors` | 404/410/locale-only content state có link hành động rõ; không hài hước ép buộc |
| `controls` | Nhãn chức năng chuẩn; chỉ sửa khi khó hiểu |
| `common` | List joiners, count labels và nhãn chung; giữ whole-sentence interpolation |
| `assets` | Alt/captions: nói hình thực sự cho thấy gì, không chèn lợi ích marketing |
| `a11y` | Giữ descriptive accessible names/skip link; không rút mất mục đích điều khiển |
| `index` | Namespace composition/types; chỉ thay shape nếu có schema change đã review |

`index` là file composition, không phải copy surface độc lập. Tên nền tảng/device labels phải từ catalog, không hardcode vào page copy. Bảng này theo dõi toàn bộ file hiện tại, không phải số URL.

### 12.2. Microcopy draft

| Vị trí | Draft / quyết định |
|---|---|
| Generic closing CTA | Download TablePro; availability-specific buttons phía dưới |
| Pricing link | See pricing |
| Source link | View source / View on GitHub; chọn một nhãn cho mỗi loại destination |
| Newsletter title | Release notes by email |
| Newsletter body | Occasional release notes. Unsubscribe in any email. |
| Newsletter success | Check your inbox to confirm your subscription. |
| Checkout failure | Couldn't open checkout. Try again. |
| Connection/network form error | Couldn't reach the server. Check your connection and try again. |
| Invalid code | This code is invalid or has expired. |
| Discount success | Code accepted: {amount} off at checkout. |
| Consent | Current specific Google Analytics question và Allow/Decline đã ổn; giữ |
| FAQ contact | Need help? Email {email} or open an issue on GitHub. |
| Optional banner | Paid plans add {examples}. See plans. Cần length-budget và tier accuracy; không mặc định bật |

Không thay CTA nhất quán bằng các biến thể kiểu “Get started”, “Explore”, “Experience TablePro” nếu thực tế hành động là download.

### 12.3. SEO và social copy

SEO title và hero có chức năng khác nhau. Identity không chứa platform; search title có thể render released platforms hoặc giữ query-specific Mac intent ở guide/alternatives page.

| Page family | Title/meta direction |
|---|---|
| Home | TablePro: native, open-source database client; availability trong metadata nếu lấy đúng released data |
| Feature | Specific feature + TablePro; description 1–2 câu chức năng, không feature inventory |
| Database | Engine client/GUI + TablePro; scope metadata không hứa desktop capabilities có trên mobile |
| Compare | TablePro vs Product hoặc alternatives title phù hợp; không “best alternative” tự phong |
| Pricing | Free, Starter and Team; terms chi tiết trong page |
| Download | Download TablePro; released-device summary từ data |
| Blog | Actual post intent; preserve archive dates/titles theo quyết định ở mục 11 |

Giữ existing schema IDs `/#organization`, `/#app`, `/#ios-app`; đổi descriptions không đổi identity IDs. Meta length constraints hiện trong tests: title ≤60; EN description ≤155; VI ≤160. Đây là constraint repo, không phải cam kết Google luôn hiển thị từng ký tự.

OG text từ `og` blocks, `lang/{locale}/og.php`, asset/copy inputs phải đồng bộ với wording mới. Nếu OG image chứa old headline thì cần regenerate trong phase verification; document-only turn này không generate.

### 12.4. Screenshots và captions

- Homepage query row dùng autocomplete screenshot, editing row dùng Preview SQL, comparison row dùng Compare & Sync; caption không mô tả thứ ngoài ảnh.
- Alt draft: `SQL editor suggesting columns from the connected database.` Không thêm “powerful/intuitive”.
- Một hình chỉ cần caption khi giúp hiểu thao tác. Không dùng alt để nhồi SEO keywords.
- Preserve slot IDs, source evidence và light/dark/localized crop rules.
- Với 21 placeholder hiện có, ghi rõ ảnh nào thiếu. Không xóa body dựa vào screenshot chưa render trong production.
- Nếu headline đổi ảnh hưởng OG text/layout, cập nhật asset brief/copy fields và generated handoff theo workflow repo trong implementation.

### 12.5. Vietnamese và 10 locale khác

12 supported locales: en, vi, es, de, fr, ja, pt-BR, zh-Hans, ko, zh-Hant, it, id. Không để page copy EN mới nhưng chrome/SEO các locale khác vẫn mô tả old positioning.

Vietnamese có hai việc khác nhau:

1. Viết lại nhịp câu theo ý, bỏ translationese như “những query đáng giữ”, “làm được một phần trong số đó”.
2. Giữ glossary/tên sản phẩm/tên menu bắt buộc của repo. Nếu muốn thay glossary, đó là thay đổi riêng phải cập nhật shared files và wording guards đồng bộ.

Đề xuất vòng đầu không đổi thuật ngữ developer đã chuẩn hóa. Giữ `query`, `schema`, `data grid`, feature/plan names; dùng “khóa chính/khóa ngoại”, “Tải về”, “bạn” theo rules hiện có. Không dịch mọi tên UI sang tiếng Việt mới hoặc xóa English label bắt buộc trong ngoặc. Cách giảm ngoặc là giảm menu-path instructions khỏi marketing prose và dẫn docs.

Mỗi locale được viết whole sentences với same tokens/tags. Không fallback English vào page locale khác. Token/structure parity và font/line-break review là bắt buộc. Editorial fluency của 10 locale còn lại chưa được xác nhận trong audit này; không gọi bản dịch tự động là đã native-proofread.

## 13. Plan implement sau khi owner review

### Phase 0 — chốt brief và baseline

Deliverable: brief đã duyệt, copy inventory baseline, decisions và scope.

- Chốt headline, audience term, tone, degree of shortening.
- Chốt có giữ banner/sponsors placement; default giữ placement/config hiện tại.
- Chốt archive-body policy và localization rollout.
- Dùng platform/facts catalog hiện tại làm baseline; đánh dấu docs rebuild cũ cần cập nhật.
- Đánh giá rendered prose/asset availability; không dùng JSON source counts như visible page counts.

### Phase 1 — English homepage, pricing và shared copy

Files chính:

- `resources/data/content/en/{home,pricing,paid-features,download,blog}.json`
- `resources/js/i18n/messages/en/{seo,pricing,nav,footer,download,blog,banner,forms}.ts` theo scope cần thiết
- `resources/js/components/home/`, `resources/js/components/pricing/`, `resources/js/pages/Home.tsx` nếu cần structure change

Ưu tiên content-only edits. Nếu bỏ hero native explanation hoặc đổi section layout, chỉnh đúng component thay vì để key rỗng cho tests pass. Phân biệt schema-preserving rewrite với schema change.

Review checkpoint: home + pricing đọc liền mạch, free/paid/platform hiểu trong lần quét đầu; screenshot và heading khớp.

### Phase 2 — features và database pages

- Rewrite 8 feature JSON, 24 database JSON, engine taglines/limits trong `content/en/engines.json`.
- Giữ anchors/route/asset IDs và facts tokens.
- Với mỗi phần chuyển sang docs, lập destination map: source key → docs URL/anchor → thông tin đích có/thiếu.
- Không viết vào docs repo ngoài workspace như bước ngầm. Nếu trang đích thiếu, giữ fact cần thiết trên site và ghi backlog migration.
- Render database family sections và engine-limit tables sau rewrite để chắc không bị mất content từ auxiliary engine strings.

Review checkpoint: mỗi trang engine có angle riêng và limits rõ; không còn cùng intro template lặp tất cả.

### Phase 3 — comparisons, secondary pages và blog surface

- Rewrite 16 comparison JSON; recheck volatile competitor facts từ primary sources.
- Rewrite iOS, FAQ, About, Security; legal chỉ editorial consistency, không đổi nghĩa.
- Blog index/shared CTA/archive notes; guides sửa introductions/headings/steps có vấn đề, không rewrite historical bodies theo default.
- Đối chiếu source edition/date/version; không mở rộng research thành change business facts của TablePro.

Review checkpoint: comparison công bằng, switching đúng, historical posts không bị biến thành current claims.

### Phase 4 — localization và metadata

- Viết VI theo EN đã duyệt; sau đó cập nhật 10 locale còn lại.
- Cập nhật cùng content shape/tokens/tags trong mọi locale bị ảnh hưởng.
- Cập nhật chrome, SEO, OG strings và localized asset captions theo scope.
- Không ship key removal/schema change chỉ ở EN/VI làm các locale còn lại fail hoặc hiển thị old text.
- Có thể chia batch phát triển, nhưng publication chỉ sau khi affected locale paths hợp lệ và nội dung không fallback.

### Phase 5 — verification và final review

Chạy checks hiện có thích hợp; không thêm tests chỉ để khóa exact phrasing của mỗi câu mới.

| Check | Mục đích |
|---|---|
| `npm run typecheck` | Catalog shape, props, feature/availability models |
| `npm run test:js` | Interpolation, NFC, catalog conventions, content/render utilities |
| Relevant Pest content/localization suites | Token/tag parity, required facts, forbidden wording, app labels |
| Feature/Database/Compare/Pricing/Landing tests | Page schema, anchors, availability, billing units, links |
| SEO tests | Titles, descriptions, canonical/hreflang, JSON-LD/OG consistency |
| `npm run build` | Client + SSR production build |
| SSR-enabled render checks | No placeholder tokens, English leakage, unavailable-platform CTAs |
| Browser review | Mobile/desktop line breaks, density, long locale text, captions, screenshots |
| `npm run check:shared` nếu shared files đổi | Không lệch account-app/shared contracts |
| `php artisan test --compact` ở final integration | Full existing suite sau khi các batch đã hoàn tất |

Visual review đề xuất ở 375px, 768px và 1440px; thêm 320px cho banner/forms nếu giữ. EN/VI full primary pages; các locale dài/CJK kiểm tra representative pages. Nếu một check cần SSR service/fixtures, dùng setup hiện có trong repo; không báo pass khi bị skip vì service chưa chạy.

Các tests hiện đang giữ exact structural/editorial constraints có thể cần cập nhật theo brief mới. Ví dụ MCP expansion ở lead, required section IDs, glossary và SEO bounds. Thay tests chỉ khi expectation đã được thay thế có chủ đích, không xóa factual guards để rút copy.

### Phase 6 — đồng bộ docs và handoff

- Update `docs/rebuild/design/positioning.md` với approved identity, detail rules, current fact-source reference và glossary decisions.
- Update sitemap/design docs phần structure/blog/locale behavior đã thay đổi.
- Component README/schema docs nếu key/shape đổi.
- Asset briefs/generated handoff nếu caption/slot role thay đổi.
- Final diff review theo page family, locale và claims moved-to-docs ledger.
- Chỉ deploy khi user yêu cầu ở bước sau; việc duyệt bản plan không tự tương đương yêu cầu deploy.

## 14. Ràng buộc triển khai và tiêu chí nghiệm thu

### Ràng buộc kỹ thuật

- `routes/localized.php`, slug constants và redirects không đổi chỉ vì wording.
- Giữ `#pricing` vì app đã phát hành mở link này; giữ legacy home anchors và required feature anchors.
- Data về prices, devices, seats, versions, providers, engine counts và paid features vẫn có một nguồn.
- Whole-sentence interpolation; giữ token/tag parity; không ghép fragments để tạo sentence.
- Không thay list/date/currency formatting sang `Intl` khi SSR/client contract dùng formatter riêng.
- Không đổi analytics event names/download destinations/checkout/newsletter API khi sửa CTA text.
- Không thêm session, credential, database hoặc API key vào marketing repo.
- Shared files đổi phải theo `docs/shared-files.md`; owner review copy không ngầm cho phép đổi account app behavior.
- Linux/Windows chỉ là hướng tương lai. Các current negative facts có thể data-drive để giảm sửa lặp; native claim, installer/license/capabilities của bản mới vẫn phải được kiểm tra khi release.

### Tiêu chí nghiệm thu editorial

- Đọc hero biết loại sản phẩm, một số databases và cách tải; không phải đọc framework explanation.
- Mỗi homepage row có một tác vụ chính và một chi tiết đáng nhớ.
- Không còn lead công thức “For anyone…” trên mọi feature page.
- Free/paid scope và platform scope dễ tìm, không lặp business model trong mọi paragraph.
- Native/general workflow identity không chứa platform/version/count cố định.
- Database pages dùng đúng model: rows, documents, keys, messages hoặc ledgers.
- Safe Mode/AI/restore wording không hứa nhiều hơn hành vi hiện tại.
- Pricing unit, renewals, subscription end, offline check và refund semantics không đổi.
- Comparison nêu strengths của cả hai, nguồn và ngày rõ; không benchmark tự bịa.
- Blog introduction phản ánh guides + releases; archive dates/corrections được giữ.
- Every moved fact có docs destination hoặc vẫn ở nơi appropriate; không “rút gọn” bằng mất thông tin.
- Metadata và localized copy không mâu thuẫn với visible content.
- Không có claims về platform chưa released hoặc capabilities chưa có.

## 15. Các điểm owner cần review

### Đề xuất mặc định của người review

| Quyết định | Đề xuất |
|---|---|
| Identity | A native database client. |
| “for developers” | Bỏ khỏi hero/product short; dùng audience tự nhiên ở trang cần thiết |
| Tone | Cụ thể theo Postico; nhãn feature theo ngôn ngữ quen thuộc; không slogan hóa mọi section |
| Homepage | Giữ section order vòng đầu, giảm prose trước; chưa redesign |
| Technical detail | Giữ decision-changing caveats, chuyển setup/implementation sâu có destination map |
| Platform expansion | Identity ổn định; availability/capability/license vẫn fact-driven |
| Sponsors | Giữ vị trí hiện tại |
| License banner | Owner chọn giữ/rút/tắt; chưa thay config |
| Blog archive | Giữ body lịch sử, sửa shared marketing surface |
| Vietnamese glossary | Giữ hiện hành vòng đầu; rewrite câu, không tự đổi terms |
| Localization | Toàn bộ 12 locale có nội dung mới hợp lệ trước publication |
| Rollout | Batch theo page family; final diff và visual review trước deployment riêng |

### Những câu hỏi thực sự ảnh hưởng kết quả

1. Headline ngắn ở trên có đúng giọng bạn muốn, hay giữ “for developers” vì lý do audience?
2. Với homepage, bạn muốn rút text trong layout hiện tại trước, hay đồng thời giảm/gộp section? Đề xuất rút text trước để dễ đánh giá.
3. Banner mời mua license ở mọi trang có còn cần không? Đây là phần dễ tạo marketing vibe ngay cả khi body đã tốt.
4. Có muốn chỉnh body các announcement cũ không? Đề xuất giữ lịch sử và sửa current surface.
5. Nếu muốn thay glossary VI rộng hơn, cần review riêng vì affects shared conventions/tests.

Không cần quyết định lại việc headline tránh platform: điều đó đã được xác nhận và là constraint của toàn bộ plan.

---

**Trạng thái cuối lần nghiên cứu này:** chỉ tạo tài liệu review. Chưa rewrite JSON/TS/Markdown của site, chưa đổi component, tests, facts, giá, route, platform status, assets hoặc deployment.
