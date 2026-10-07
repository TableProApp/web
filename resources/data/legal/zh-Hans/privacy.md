---
title: 隐私政策
description: TablePro 应用、网站和账户门户收集什么信息、发送到哪里、保存多久，以及如何更改或删除。
updatedAt: "2026-10-05"
---

本政策涵盖 Mac 版 TablePro、iPhone 和 iPad 版 TablePro、位于 tablepro.app 的网站，以及位于 tablepro.app/account 的账户门户。它描述各产品目前实际发送和存储的信息。两款应用均采用 AGPLv3 开源，您可在 [TablePro 仓库]({github})中查看发送下列数据的代码。

## 概要 {#summary}

- Mac 应用每天向 TablePro 发送一次使用情况报告。该功能默认开启，可以关闭。iPhone 和 iPad 应用仅在您开启后发送。
- 激活许可证后，Mac 应用每隔 {revalidateDays} 天向我们的服务器验证一次，验证信息包含 Mac 名称。
- 您运行的查询、结果和密码不会发送给 TablePro。例外是您自行选择发布到 Team Library 的连接设置（从不包含密码）和已保存查询。
- AI 请求从 Mac 应用直接发送至您设置的 AI 提供商，不经过我们。
- 我们的服务器存储每份使用情况报告和许可证验证请求的 IP 地址，并为每份报告查询所属国家。我们尚未设置这些记录的保存期限。
- 网站使用不设置 Cookie 的 Cloudflare Web Analytics 统计页面浏览量。网站也加载 Google Analytics，但只有获得您的允许才设置 Cookie。每个页面还会加载在线聊天服务 Crisp，它会设置自己的 Cookie。
- 购买由我们的名义销售商 {merchant} 负责销售。

## 谁负责处理 {#controller}

发布应用和本网站的 TablePro 是此处所述个人数据的责任方（数据控制者）。如对本政策或您的数据有疑问，请发送邮件至 [{email}](mailto:{email})。

## Mac 版 TablePro {#mac-app}

### 使用情况报告 {#mac-usage-report}

Mac 应用启动约十秒后向 `api.tablepro.app` 发送使用情况报告，随后在运行期间每天发送一次。**该功能默认开启，首次发送前不会征求同意。**要关闭，请进入 **Settings > General > Privacy** 并取消勾选 **Share anonymous usage data**。

报告包含：

- 机器 ID：Mac 硬件 UUID 的 SHA-256 哈希值（UUID 本身从不发送）；
- 平台、应用版本、macOS 版本、处理器架构和应用语言；
- 连接所用数据库类型的名称（如 PostgreSQL）和连接数量；
- 是否已激活许可证；
- 首次尝试连接、首次成功连接和首次运行查询的日期；
- 更新设置（安装方式及检查频率）。报告抵达时，我们的服务器会丢弃这些设置。

报告从不包含主机名、用户名、密码、查询或行数据。

服务器保存每份报告及其来源 IP 地址，然后将 IP 地址发送至 ip-api.com 查询国家；失败时依次尝试 ipinfo.io 和 geoplugin.net。这些查询使用未加密的 HTTP。国家信息与报告一起存储。由于下述许可证验证使用相同机器 ID，已激活许可证的 Mac 所发送的报告可与该许可证关联。

### 许可证验证 {#mac-license}

Mac 应用仅在您输入许可证密钥后联系许可证服务器。它会在激活时、距上次验证至少 {revalidateDays} 天后的启动时，以及此后每隔 {revalidateDays} 天验证。每次验证发送：

- 许可证密钥；
- 上述机器 ID；
- macOS 中设置的 Mac 名称（其中经常包含您的姓名）；
- 应用版本和 macOS 版本。

停用某台 Mac 时只发送许可证密钥和机器 ID。

服务器记录每个许可证请求的 IP 地址和内容，并将每台已激活 Mac 的机器 ID、名称与许可证一起保存。账户门户按名称列出这些 Mac。如果无法连接服务器，付费功能可自上次成功验证起继续使用 {graceDays} 天。

### Team Library {#library}

Team Library 是 Team 许可证的功能。当您在连接上选择 **Share > Publish to Team Library…**，或在 Favorites 侧边栏选择 **Publish Saved Queries to Team…** 时，Mac 应用将您发布的内容上传至服务器：

- 连接设置：主机、端口、数据库名、用户名、SSH 和 SSL 设置、驱动选项、启动命令、Tunnel Command 设置、安全模式级别和 AI 设置，但绝不包含密码；
- 已保存查询：名称、SQL 文本、关键词和文件夹。

使用同一 Team 许可证的 Mac 在启动时下载库，最多每周一次；执行发布的 Mac 会在发布后立即重新下载。再次发布会替换此前发布的内容。移除团队成员会删除该成员发布的所有内容。许可证到期或被暂停后，库仍会保留在我们的服务器上，直到您要求删除。

另一项 Team 功能 Team Catalog 会将不含密码的连接文件写入您选择的共享文件夹，不经过我们的服务器。

### 更新和插件 {#mac-updates}

- **更新检查。**Mac 应用每天从 GitHub（`raw.githubusercontent.com`）下载一次更新源。除所有网络请求都会携带的 IP 地址和含应用版本的 User-Agent 外，请求不会发送其他 Mac 信息。要关闭，请进入 **Settings > General > Software Update** 并取消勾选 **Automatically check for updates**。更新本身也从 GitHub 下载。
- **插件目录。**应用启动时和打开插件设置时，会从 GitHub 下载可用驱动和主题列表。没有关闭此行为的设置。您安装的驱动和主题从 GitHub 下载，插件浏览器通过 GitHub API 获取下载次数。

GitHub 会随这些请求收到您的 IP 地址，这些请求适用 GitHub 自身的隐私声明。

### 您选择使用的服务 {#mac-third-parties}

只有设置后，Mac 应用才会直接向以下服务发送数据，从不经过 TablePro：

- **您的数据库、SSH 服务器和代理**接收连接向其发送的信息。
- **AI 提供商。**添加提供商并使用 AI 助手或行内建议时，请求直接发送给该提供商或 Mac 本地运行的模型。默认包含数据库类型和名称、结构中的表和列定义，以及当前查询。仅在您开启相应选项后才发送结果行。适用提供商自身的条款。添加 GitHub Copilot 会从 npm 下载其语言服务器，其“Send telemetry to GitHub”设置默认开启。
- **登录服务**：连接使用时的 Microsoft Entra ID、Google、Amazon Web Services 和 Cloudflare Access。
- **Apple Maps**：在地图上显示结果时提供地图瓦片。
- **DuckDB**：查询首次使用某个扩展时提供该扩展。
- **MCP 客户端。**MCP 服务器默认关闭。您开启它，或已设置的 MCP 客户端启动 TablePro 桥接程序或与其配对时，它会启动，且仅监听 Mac 本地（127.0.0.1）。连接的 AI 客户端（如 Claude 或 Cursor）接收其请求的结果，并按自身条款发送至其服务。
- **您添加的 MCP 服务器。**AI 会话会将您批准的工具调用及其参数发送至该服务器。

### 留在 Mac 上的数据 {#mac-local}

密码保存在 macOS 钥匙串中。连接列表、查询历史、Query Insights、Data Rewind 快照、设置和打开的选项卡存储在 Mac 上。应用引用磁盘上的 SSH 密钥，不会复制它们。应用不包含崩溃报告工具或第三方分析库。

## iPhone 和 iPad 版 TablePro {#ios-app}

**除非您开启 Share Usage Data，否则不会向 TablePro 发送任何信息**。您可在首次启动时或之后的 **Settings > Privacy** 中开启。开启后，应用每天向与 Mac 应用相同的服务器发送一次报告，服务器以相同方式存储和查询其 IP 地址。报告包含 Apple 为设备上的应用分配的标识符的 SHA-256 哈希值、平台、应用和 iOS 版本、处理器架构、应用语言、所用数据库类型名称、连接数量，以及相同的首次使用日期。不包含更新设置或许可证密钥，因为应用没有这两项内容。

应用不会发起许可证验证、更新检查或插件请求。除可选报告外，它仅连接您的数据库和 SSH 服务器、开启 iCloud 同步时的 Apple iCloud，以及 SQL Server 连接使用 Microsoft Entra ID 登录时的 Microsoft。

在设备上，密码和粘贴的 SSH 密钥保存在钥匙串中，证书从不同步。查询历史留在设备上。连接会加入设备的 Spotlight 索引，以便搜索。查询运行期间，除非您开启 **Settings > Live Activities > Hide Query**，其实时活动会在锁屏和展开的灵动岛上显示 SQL。

如果您在 iPhone 或 iPad 设置中选择与应用开发者共享分析数据，Apple 可能通过 App Store Connect 向我们提供崩溃报告和使用统计。应用本身没有崩溃报告工具或第三方分析库。

## iCloud 同步和 Handoff {#icloud}

iCloud 同步在 Mac、iPhone 和 iPad 上均默认关闭，直到您开启。开启后，记录会发送至您自己 iCloud 账户内的私有数据库（容器 `iCloud.com.TablePro`）。TablePro 无法读取它们。

- 在 Mac 上，您可选择同步连接、分组和标签、设置、SSH 配置、凭据配置（名称和用户名，从不包含密码）、表和数据库收藏、已保存查询（包括 SQL 文本）以及表文件夹。连接记录包含主机、端口、用户名、数据库名、SSH 和 SSL 设置、启动命令、连接前脚本和 AI 规则。查询历史、Data Rewind 快照和密码来源从不同步。
- iPhone 和 iPad 同步连接、分组和标签。
- 密码仅在您同时开启 Mac 上 Sync Categories 中的 **Passwords**，或 iPhone 和 iPad 上的 **Sync Passwords** 后同步，使用 iCloud 钥匙串。在 Mac 上，这也会同步 TablePro 保存在钥匙串中的其他机密信息，如 AI 提供商密钥和许可证密钥。

Mac 上的 iCloud 同步属于 Starter 或 Team 许可证功能，在 iPhone 和 iPad 上免费。

Handoff 通过 Apple 在您的设备之间传递当前连接的 ID 和打开的表名。没有打开表时，传递连接名称；连接没有名称时则传递主机。不会发送设置或凭据。

## 网站 {#website}

**托管。**网站和账户门户运行在我们的服务器上，由 Cloudflare 提供前置服务。与任何网络服务器一样，它们会收到您的 IP 地址、浏览器 User-Agent 和请求的每个页面地址。

**Cloudflare Web Analytics。**Cloudflare 在网站和账户门户页面中加入 Web Analytics 脚本。浏览器从 `static.cloudflareinsights.com` 加载它，每次浏览页面都会向 Cloudflare 报告页面、链接来源网站、加载耗时，以及浏览器、操作系统和设备类型。Cloudflare 会补充连接所属国家。脚本不设置 Cookie，也不在浏览器中保存信息；Cloudflare 声明不会使用 IP 地址或浏览器信息对您进行指纹识别。Cloudflare 向我们提供页面或国家的浏览量等汇总数据，不提供每位访客的记录。合法依据：合法利益。

**Google Analytics。**网站在每个页面以 Consent Mode 加载 Google Analytics。在您于 Cookie 提问中选择**允许**之前，它不设置 Cookie，仅为每个页面向 Google 发送无 Cookie 信号，不在设备上存储标识符。允许后，Google Analytics 设置 `_ga` 和 `_ga_<ID>` Cookie，统计页面浏览、下载点击和开始结账等访问行为。广告存储、广告个性化和广告用户数据始终被拒绝。Google 声明 Google Analytics 4 不记录或存储 IP 地址。我们的 Google Analytics 媒体资源使用 Google 默认保留期：用户级和事件级数据收集后两个月由 Google 删除。保存汇总而非标识符的标准报告不受影响。合法依据：您对 Cookie 的同意。

**在线聊天。**网站和账户门户的每个页面都显示聊天提供商 Crisp 的按钮。页面加载完成后，浏览器从 `client.crisp.chat` 加载 Crisp 脚本，Crisp 会设置 [Cookie 和浏览器存储](#cookies)中所述的 Cookie。Crisp 收到 IP 地址、浏览器信息、浏览的页面地址和您撰写的消息，并在您开始对话后保留 IP 地址。我们只向 Crisp 提供页面语言，不提供您的其他信息。Crisp 位于法国。

**结账脚本。**当您将指针移至购买按钮或用 Tab 键聚焦时，浏览器从 jsDelivr（`cdn.jsdelivr.net`）加载 {merchant} 的结账脚本。jsDelivr 会收到 IP 地址和浏览器信息。只有点击后，结账页面才从 {merchant} 打开。

**购买归因。**首次到访网站时，浏览器在本地存储中保存名为 `tablepro:attribution` 的首访记录，期限为 90 天：访问来源（所点击链接中的 `ref` 或 `utm_*` 标签，或来源网站）、进入的页面和时间。开始购买时，该记录随结账请求发送。我们的服务器会丢弃它：不会验证、读取或存储，也不会传给 {merchant}。

仅阅读网站不会设置网站自身的 Cookie。订阅邮件、开始结账或验证优惠码会向服务器发送请求，设置两个账户门户 Cookie：`tablepro-session` 和 `XSRF-TOKEN`。网站在浏览器中保存的全部信息列于 [Cookie 和浏览器存储](#cookies)。

## 购买 {#purchases}

许可证由名义销售商和经销商 {merchant}（Polar Software, Inc.）销售。您依据 {merchant} 的购买者条款和隐私政策购买。{merchant} 负责收款、计算并缴纳销售税或增值税、发送收据和发票，并处理付款问题和争议。它收集姓名、邮箱地址、账单地址和支付信息。我们不会看到完整银行卡信息。

我们从 {merchant} 收到您的邮箱地址、您输入的姓名和账单地址、购买内容、金额、订单及订阅 ID，以及之后的续订、取消和退款等变更。我们向 {merchant} 提供购买页面的语言，以便我们的邮件使用该语言。发票、收据、付款方式和订阅可在 [{merchant} 客户门户]({portal})中管理，使用购买时的邮箱地址登录。退款详情请参阅[退款政策](/zh-Hans/refund-policy)，许可证的使用范围请参阅[服务条款](/zh-Hans/terms)。

## 账户门户 {#account}

位于 tablepro.app/account 的[账户门户](/account?locale=zh-Hans)供许可证购买者使用。我们向购买时的邮箱地址发送登录链接；链接仅可使用一次，15 分钟后到期。门户显示许可证、已激活的 Mac（按名称列出），以及 Team 许可证的成员、邀请、席位和 Team Library。

我们将邮箱地址与许可证、订单一起保存，并保存您使用的语言，以便以该语言发送邮件。邀请他人加入团队时，我们保存其邮箱地址和角色，并发送包含邀请代码的邮件。

## 邮件订阅 {#newsletter}

订阅发行说明时，我们保存邮箱地址和订阅页面的语言。我们先发送确认链接，每封邮件均附有退订链接。退订后不再发送订阅邮件；若还希望删除地址，请发邮件给我们。

## Cookie 和浏览器存储 {#cookies}

仅阅读公开网站不会设置网站自身的 Cookie；订阅邮件或开始结账会设置以下两个严格必要的门户 Cookie。Cloudflare Web Analytics 不设置 Cookie，也不在浏览器中存储信息。Google Analytics Cookie 在您允许之前不会设置。Crisp 在聊天加载后为每个页面设置 Cookie。此处的信息不用于广告，也不会出售。

- **`_ga` 和 `_ga_<ID>`**（Google Analytics Cookie，最长两年，仅在允许分析时）：浏览器的随机标识符及当前访问状态。拒绝或之后更改回答时会删除。合法依据：同意。
- **`tablepro:analytics-consent`**（本地存储，直至您清除）：保存对分析提问的回答，避免每个页面重复询问。网站和账户门户共用。合法依据：履行您的选择所严格必要。
- **`tablepro:attribution`**（本地存储，90 天）：[网站](#website)一节所述的首访记录。不包含您的标识符，仅随结账请求发送，服务器随后丢弃。合法依据：合法利益。
- **`theme`** 和 **`tablepro:banner-dismissed`**（本地存储，直至您清除）：保存所选浅色、深色或系统主题，以及关闭的横幅和隐藏期限：30 天；若您表示已持有许可证或购买许可证，则为一年。合法依据：合法利益。
- **以 `crisp-client/` 开头的 Cookie**（Crisp，如 `crisp-client/session/…`；六个月，再次访问时续期；聊天加载后每个页面都会设置）：在页面和访问之间保持聊天及对话。合法依据：为每个页面提供支持的合法利益。
- **`tablepro-session` 和 `XSRF-TOKEN`**（账户门户 Cookie，两小时）：保持登录并保护门户表单免受跨站请求伪造。购买确认和邮件订阅等门户页面也会设置；从本网站任意页面订阅邮件、开始结账或验证优惠码也会设置。合法依据：严格必要。

您可随时通过每页页脚的 **Cookie 设置**或以下入口更改、撤回分析回答：

<cookie-settings></cookie-settings>

## 合法依据 {#lawful-basis}

对于欧洲经济区和英国的读者，GDPR 与 UK GDPR 下的合法依据为：

- **合同**（第 6 条第 1 款 (b)）：许可证销售和提供、许可证验证、账户门户和 Team Library。
- **合法利益**（第 6 条第 1 款 (f)）：Mac 应用使用报告及国家查询、许可证请求日志、安全和滥用防范、网络服务器日志、Cloudflare Web Analytics、购买归因记录和每个页面的在线聊天。
- **同意**（第 6 条第 1 款 (a)）：Google Analytics Cookie、iPhone 和 iPad 应用使用报告、邮件订阅和您主动发起的在线聊天。
- **法律义务**（第 6 条第 1 款 (c)）：税务与会计记录，以及对合法请求的回应。

## 数据接收方 {#sharing}

我们仅向运营 TablePro 所需的服务共享个人数据：

- **{merchant}**：购买交易的名义销售商。
- **邮件发送服务商**：发送登录链接、我们提供的收据、团队邀请和订阅邮件。
- **托管服务商及 Cloudflare**：运行网站、账户门户和应用连接的服务器。Cloudflare 也通过 Web Analytics 统计页面浏览量。
- **Google**：网站和账户门户上的 Google Analytics。
- **Crisp**：网站和账户门户每个页面的在线聊天。
- **jsDelivr**：在指针移至购买按钮时向浏览器提供 {merchant} 的结账脚本。
- **ip-api.com、ipinfo.io 和 geoplugin.net**：接收使用报告的 IP 地址以查询国家。
- **GitHub**：托管更新源、插件目录和下载内容。

我们不出售个人数据，也不与广告商共享。

## 国际传输 {#transfers}

以上服务在多个国家运营，因此您的数据可能在居住国之外处理。{merchant}、Google、GitHub 和 Cloudflare 在美国处理数据；Google 依据 EU-US Data Privacy Framework 和标准合同条款处理。在法律要求时，从欧洲经济区和英国传输数据采用标准合同条款或其他获批机制。

## 数据保留期限 {#retention}

- **使用报告**及其 IP 地址、国家：未设保留期限，也不会自动删除。
- **许可证记录**：已激活 Mac 的 ID、名称，以及包含 IP 地址的许可证请求日志，在许可证存在期间保留，不会自动删除。
- **订单**：为税务和会计用途保留。
- **Team Library**：直到重新发布、移除发布者或您要求删除；许可证结束后仍保留。
- **账户登录链接**：15 分钟后到期并删除。门户会话持续两小时。
- **邮件订阅**：直到退订或按您的要求删除地址。
- **Google Analytics**：用户级和事件级数据保留两个月，即我们媒体资源所用的 Google 默认期限。Cookie 最长保留两年，或在拒绝时删除。
- **Cloudflare Web Analytics**：向我们显示最近六个月的页面浏览汇总，不在浏览器中保存信息。
- **在线聊天及支持邮件**：在 Crisp 和我们的邮箱中保留至删除。您可要求删除对话和邮件。
- **网络服务器日志**：为安全和故障排查保留，尚未设置固定期限。

## 您的权利 {#rights}

视居住地而定，您可以要求我们：

- 提供我们持有的个人数据副本（访问）；
- 更正数据（更正）；
- 删除数据（删除），法律要求保留的除外；
- 限制使用方式（限制）；
- 以结构化、机器可读格式提供数据（可携带）；
- 停止基于合法利益使用数据（反对）。

您可随时撤回同意，并向数据保护机构投诉。行使上述权利，请发送邮件至 [{email}](mailto:{email})。我们会在 30 天内回应。数据删除由人工处理，请告知相关邮箱地址、许可证密钥或设备。{merchant}、Google、Crisp 或 GitHub 持有的数据还适用其自身政策。

**加利福尼亚州居民。**California Consumer Privacy Act 赋予您了解我们收集哪些个人信息、要求删除、拒绝出售，以及不因行使这些权利而受到差别待遇的权利。我们不出售个人信息。

## 儿童 {#children}

TablePro 不面向十六岁以下儿童，也不会在明知的情况下收集其个人数据。如您认为儿童向我们提供了个人数据，请联系，我们会删除。

## 安全 {#security}

应用、网站、账户门户与我们的服务器之间使用 HTTPS。[使用情况报告](#mac-usage-report)中所述国家查询为例外，使用未加密的 HTTP。账户登录链接仅以哈希形式保存，系统访问限于运营 TablePro 的人员。没有系统完全安全。报告漏洞请发送邮件至 [{email}](mailto:{email})。

## 政策变更 {#changes}

本政策变更时，我们会在此更新并注明新的“最后更新”日期；法律要求时，我们会直接通知您。

## 联系方式 {#contact}

如对隐私或本政策有疑问，请发送邮件至 [{email}](mailto:{email})。
