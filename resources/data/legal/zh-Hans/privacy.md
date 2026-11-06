---
title: 隐私政策
description: TablePro 收集的数据、用途、接收方、保存时间，以及您的选择和权利。
updatedAt: "2026-11-05"
---

本政策涵盖 Mac、Linux、iPhone 和 iPad 上的 TablePro；tablepro.app；docs.tablepro.app；以及账户、购买、支持和邮件订阅服务。[技术清单](https://docs.tablepro.app/security/privacy)列出字段、端点和控制选项。应用源码位于[公开仓库]({github})。

## 概要 {#summary}

普通查询和结果在您的设备与数据库之间传输。使用数据不含 SQL、结果行或凭据。您主动发布到 Team Library、发送给支持或与 AI 及外部工具共享的内容会到达相应接收方。

Mac 和 Linux 默认开启使用数据，可关闭。已发布的 iPhone 和 iPad 应用只在您同意后发送报告。直接发送的分析数据可关联账户和购买记录。关闭不会停止账户请求或服务器分析。

网站统计访问并在每页加载 Crisp。Google Analytics Cookie 需要您的选择。邮件订阅测量打开和点击。删除账户仍会留下部分记录，包括 PostHog 和 Crisp 中的数据。请阅读[保存期限](#retention)和[权利](#rights)。[控制者](#controller)也接受无账户的隐私请求。

<span id="contact"></span>

## 负责方 {#controller}

{publisherName} 是位于 {publisherCity}、{publisherCountry} 的独立开发者，也是本政策所述个人数据的控制者。联系 [{email}](mailto:{email})。我们没有数据保护官。对于团队，我们作为控制者管理账户、邀请和服务记录。Team Library 发布内容按团队指示处理；团队决定发布什么及谁能访问。

<span id="lawful-basis"></span>

## 收集的数据和目的 {#data-use}

对于欧洲经济区和英国，各目的列明法律依据：合同（第 6(1)(b) 条）、合法利益（6(1)(f)）、同意（6(1)(a)）或法定义务（6(1)(c)）。我们不做产生法律或类似重大影响的自动决策。

<span id="mac-account"></span>

### 账户和设备 {#account}

免费本地使用无需账户。账户服务需要电子邮箱。我们保存姓名、语言、登录方式、许可证、订单、设备、团队角色及席位。Mac 和 Linux 设备注册发送机器标识、设备名、平台及应用/系统版本。设备名可能包含您的姓名。此流程与使用数据分开。目的和依据是按合同提供账户与套餐。

登录使用邮件链接和验证码、通行密钥或 Apple、GitHub、Google。通行密钥记录包括公钥、名称、同步状态和使用日期。身份提供方给出 ID 和已验证邮箱；Apple 还可能提供姓名。Apple 令牌加密保存，在解绑或删除账户时撤销。账户变更记录附带 IP 和用户代理。合法利益是保护账户及调查滥用。

[账户门户]({account})提供资料及登录方式修改、设备管理、JSON 导出和账户删除。拥有含其他成员的团队时不能删除账户。删除会终止订阅，不退款。[保存期限](#retention)说明保留内容。

### 购买 {#purchases}

{merchant}（Polar Software, Inc.）是 merchant of record 和转售商，按自己的条款收集姓名、邮箱、账单地址及付款信息，处理付款、税务、收据和争议。我们从不接收完整银行卡信息。

我们为结账、税务和币种发送购买内容、语言、访问来源及 IP。我们接收买方及账单详情、金额、订单/订阅 ID、续订、取消和退款。订单保留邮箱、账单国家、金额及来源归因。未登录购买会在必要时为该邮箱创建未验证账户。取消原因和评论发送至 {merchant} 并随订阅保存。处理履行购买合同；税务及会计记录履行法定义务。缺少必要信息无法结账。在 [{merchant} 门户]({portal})管理账单；参阅[条款](/zh-Hans/terms)和[退款](/zh-Hans/refund-policy)。

### 团队和共享内容 {#library}

邀请人提供邮箱、角色及席位选择。所有者和管理员查看成员姓名/邮箱、邀请及团队变更，包括受邀地址，但看不到审计 IP 或浏览器。成员查看团队、套餐、席位数及自己的角色。我们按合同使用这些记录提供团队服务。

在 Mac 发布到 Team Library 会把连接设置和已保存查询上传服务器，供有权限成员使用。设置包括主机、端口、数据库、用户名、SSH/SSL、启动命令、Tunnel Command 和 AI 设置。查询包括名称、SQL、关键词和文件夹。结构化密码字段被排除；SQL 或自由文本中输入的秘密不会自动删除。库显示最后修改者。退出团队不会自动清除共享内容。参阅[删除时间](#retention)。Team Catalog 则写入您选择的共享文件夹。

### 使用和服务分析 {#analytics}

我们的合法利益是了解使用、修复问题及统计购买。Mac 和 Linux 发送[应用](#apps)中所述数据。服务器也向 PostHog 发送登录、购买、设备和团队事件，含账户 ID，不含姓名/邮箱。这些 ID 将应用使用与服务活动关联。开关停止应用事件，不停止必要账户请求或服务器事件。通过[权利](#rights)提出反对或删除要求。

### 订阅邮件和电子邮件 {#newsletter}

Amazon SES 发送验证码、邀请、账户通知和订阅邮件。服务邮件履行您请求的服务。新邮件订阅需确认并基于同意。我们保存地址、语言、注册/确认时间、IP、用户代理、注册页面及同意文本版本。

每封订阅邮件通过图片和 `links.news.tablepro.app` 测量每位收件人的打开及点击。Amazon SES 接收时间、链接、IP 和用户代理，再传给服务器统计。屏蔽图片停止打开测量，不停止点击测量。退订及邮件链接不被跟踪。没有单独的测量开关。通过邮件或邮件应用的一键退订停止接收；之后不发确认邮件。重新订阅需确认。永久退信及垃圾邮件投诉会停止发送。通过[联系](#controller)要求删除地址。

旧服务器名单中所有未退订地址均已迁移，无论是否确认，包括买家、许可证持有人和 beta 注册者。已退订地址保持退订；退信/投诉地址进入抑制名单。参阅[保存期限](#retention)。

### 支持 {#support}

您发送的消息、附件及诊断会到达我们和所用支持服务，其中可能包含您附上的数据库内容或秘密。网站/门户加载聊天时，Crisp 接收 IP、浏览器及浏览页面。开始对话后保留 IP。我们提供页面语言；门户已登录时还提供账户邮箱和 ID。每页加载聊天基于提供支持的合法利益。您发起的对话基于同意。

## 您的应用 {#apps}

| 应用和版本 | 使用数据 | 控制 |
| --- | --- | --- |
| Mac 0.86.0，从 0.86.0-beta.1 起 | 直接发往 PostHog；默认开启 | Settings > General > Privacy |
| Linux 从 0.1.0-beta.1 起 | 直接发往 PostHog；默认开启 | Preferences > General > Privacy |
| 已发布的 iPhone 和 iPad | 经服务器报告；同意前关闭 | Settings > Privacy |

<span id="mac-local"></span>

### 设备上的数据 {#local-data}

连接列表、查询历史、本地日志和标签页留在设备，除非您选择共享。数据库流量发往所选服务器。密码使用平台凭据存储。Mac 引用磁盘原位置的 SSH 密钥。使用分析不含主机名、用户名、SQL、行或凭据。[集成](#integrations)、Team Library 和支持有本文说明的例外。

### Mac {#mac-app}

以下直接分析和账户行为从 0.86.0 开始，包括 0.86.0-beta.1。登录会注册 Mac 并获取套餐。账户令牌留在该 Mac 钥匙串，绝不通过 iCloud Keychain 同步。已有许可证密钥换成登录后在本地删除。

#### Mac 使用数据 {#mac-usage-report}

默认开启，发送首个事件前不会询问。在 **设置 > 通用 > 隐私 (Settings > General > Privacy)** 关闭 **共享使用数据 (Share usage data)**。关闭状态启动不会运行 PostHog 库。不发送自动崩溃报告；PostHog 崩溃捕获被禁用。

事件涵盖每日使用及打开连接的类型/数量、首次尝试连接、成功连接及首次运行查询（按数据库类型）、付费功能限制及原因、升级点击、登录方式/退出，以及许可证购买提示的展示和回答。PostHog 添加设备、屏幕、网络、会话、应用和系统信息，并接收 IP 推算大致位置。登录前使用随机安装 ID，不建个人档案。登录后使用账户 ID，档案含版本、架构、语言及推算位置。退出生成新随机 ID。参阅[字段和端点](https://docs.tablepro.app/security/privacy#usage-data)。

#### 更新和插件 {#mac-updates}

应用通过 updates.tablepro.app 从 GitHub 获取更新源和插件目录。下载及下载计数也访问 GitHub。请求带 IP 和用户代理。在 **设置 > 通用 > 软件更新 (Settings > General > Software Update)** 关闭 **自动检查更新 (Automatically check for updates)** 可停止自动检查。插件目录没有关闭选项。[技术说明](https://docs.tablepro.app/security/privacy#update-checks)也列出旧版本更新源。

#### 较早的 Mac 版本 {#mac-license}

0.86.0 前，同一默认开启的开关控制发送至服务器的报告。包含机器 ID 哈希、系统/应用详情、连接类型/数量、许可证状态、首次尝试及成功日期。更新设置会发送，但服务器丢弃。当前服务器附 Cloudflare 国家信息转发 PostHog，不带 IP 或许可证密钥，不创建个人档案。机器 ID 可关联账户设备。目前不保存专门的心跳历史，但任务、日志、备份和旧档案可能保留数据。参阅[保存期限](#retention)。

旧版仅在输入密钥后访问许可证服务。检查发送密钥、机器 ID、Mac 名及版本。设备记录属于账户；激活/停用审计附 IP 和用户代理。[技术清单](https://docs.tablepro.app/security/privacy#older-mac-reports)列出字段与时间。

### iPhone 和 iPad {#ios-app}

已发布应用在首次启动或 **设置 > 隐私 (Settings > Privacy)** 启用 **共享使用数据 (Share Usage Data)** 前不发送使用报告。依据为同意。每日报告经服务器向 PostHog 转发，不含 IP，附 Cloudflare 国家且无个人档案。包含 Apple 设备标识哈希、平台、版本、架构、语言、连接类型/数量及首次尝试、成功和首次运行查询的日期。始终报告无许可证；无更新设置。应用不检查账户、许可证、更新或插件。

数据库/SSH、可选 iCloud 及 SQL Server 的 Microsoft Entra 登录会向相应服务发数据。密码和粘贴的 SSH 密钥在钥匙串；证书和历史在设备。连接加入本地 Spotlight 索引。运行中查询的 Live Activity 可在锁屏显示 SQL，除非开启 Hide Query。另有 Apple 的 Share With App Developers 设置，可通过 App Store Connect 向我们提供崩溃报告及统计。应用本身无崩溃报告器或第三方分析库。参阅 [iOS](https://docs.tablepro.app/ios#privacy)。

### Linux {#linux-app}

从 0.1.0-beta.1 起，登录按[账户](#account)所述注册设备。秘密使用桌面密钥环。包管理器更新遵循所选分发方设置。应用不自动上传崩溃报告。

#### Linux 使用数据 {#linux-usage-data}

从 0.1.0-beta.1 默认开启。在 Preferences > General > Privacy 关闭 Share usage data。事件直接到 PostHog EU：每日使用及连接类型/数量、首次尝试/成功及按类型的首次查询、登录/退出、升级点击、许可证提示展示及 Buy 回答。附安装/账户 ID、版本、架构、界面语言及 SDK 元数据。PostHog 接收 IP 并推算位置。登录前随机 ID，无个人档案；之后账户档案关联使用和购买。退出重置 ID。事件不含主机名、SQL、行或凭据。设备注册另外包含主机名。

关闭停止新发送，已在途请求可能完成。不会清除旧事件或停止账户请求/服务器分析。参阅[保存期限](#retention)、[权利](#rights)及[技术清单](https://docs.tablepro.app/security/privacy#linux-usage-data)。

<span id="mac-third-parties"></span>

## 您选择的服务 {#integrations}

数据库、SSH 和代理提供方直接接收您要求的流量。配置后的连接登录服务接收认证请求。Apple Maps 提供地图图块；DuckDB 提供查询用扩展。下载的连接/AI 辅助程序访问其提供方。各自条款适用。

### iCloud 和 Handoff {#icloud}

可选 iCloud Sync 将连接、分组、标签、设置、查询及 SSH 配置存入私人 CloudKit。 在 Mac 上，还会同步表和数据库收藏夹及文件夹，以及凭据配置的名称、用户名和密码模式，不含配置中的密码。Apple 托管，我们无法读取。密码同步单独控制，默认关闭，使用端到端加密 iCloud Keychain。Mac 上也适用于写入同一存储的其他秘密，如 AI 密钥及旧许可证密钥。账户令牌从不同步。Mac 需 Pro 或 Team；iOS 免费。Handoff 在 Apple 设备间传连接 ID 和表名，无表时传连接名/主机，不传凭据。参阅[控制](https://docs.tablepro.app/features/icloud-sync)。

### AI 和外部工具 {#ai-tools}

AI 请求直接发往所选提供方或本地模型，可能包含提示、结构、SQL 和对话。附加网格结果行默认关闭。获准的 AI 查询工具返回的结果也进入对话并发往提供方，不受附加开关限制。GitHub Copilot 从 npm 下载辅助程序，初始开启向 GitHub 发送遥测数据 (Send telemetry to GitHub)。

MCP 默认关闭，禁用时无法启动，包括桥接和配对请求。启用后，已认证客户端可按授权请求数据。AI 客户端可将结果发至自己的服务。外部 MCP 服务器接收已批准的工具参数。参阅 [AI/MCP 控制](https://docs.tablepro.app/security/privacy#ai-providers)。

## 网站和浏览器存储 {#website}

服务器及 Cloudflare 接收 IP、用户代理和页面请求。Cloudflare Web Analytics 统计浏览、来源、加载时间、浏览器/系统/设备类别及国家，不使用浏览器存储或指纹。合法利益是了解和维护网站。

Google Analytics 以 Consent Mode 加载。在 Allow 前发送无 Cookie、无已存设备 ID 的页面信号。同意后启用 Cookie 及访问、下载、结账测量。广告存储、个性化及广告用户数据始终拒绝。Google 表示 GA4 不存储 IP。

Crisp 在网站/门户每页加载，见[支持](#support)。指向或 Tab 到 Buy 会从 jsDelivr 加载 {merchant} 脚本，向其提供 IP/浏览器；点击才打开结账。开始订阅表单会加载 Turnstile 防滥用，依据合法利益。国家查询和时区用于语言/地区优惠建议，依据合法利益；请求无 Cookie，页面不保存回答。

首次访问创建 `tablepro:attribution`，保存 90 天：标签/来源、着陆页和日期。结账时服务器将来源作为元数据传给 {merchant}，随订单保存，并随结账/付款事件发给 PostHog。着陆页和日期不保留。依据是衡量购买来源的合法利益。公开订阅、结账和优惠请求省略凭据，不设门户 Cookie。门户无分析脚本，但服务器发送服务事件。

### 文档网站 {#docs}

Mintlify 托管 docs.tablepro.app。页面、Google Fonts 和 GitHub 星标请求向这些提供方披露 IP/浏览器。文档单独询问分析同意。Allow 前不保存分析 Cookie 或访客 ID。Allow 启用 Google Analytics 和 Mintlify ID。文档页脚 Cookie settings 可撤回并删除它们。主站选择不会跨到此来源。

### Cookie 和存储 {#cookies}

Cloudflare Web Analytics 不在浏览器保存内容。公开页面不设第一方 Cookie。以下存储期限与提供方保留期不同。必要存储维持登录或选择；同意和合法利益用途列在此处。

| 名称/服务 | 目的与触发 | 期限与控制 |
| --- | --- | --- |
| `_ga`, `_ga_<ID>` | 同意后的 Google Analytics | 最长 2 年；拒绝即删除 |
| `tablepro:analytics-consent` | 必要的选择记录，网站/文档各自保存 | 直到清除 |
| `tablepro:attribution` | 随结账发送首次来源；合法利益 | 90 天 |
| `theme`, `tablepro:language`, `tablepro:campaign-closed`, `tablepro:linux-install` | 外观、所选/忽略语言、已关闭促销、所选 Linux 安装方式；合法利益 | 直到清除；门户主题独立 |
| `mintlify_anonymous_id` | 文档访客 ID，在该处同意后 | 直到清除或拒绝 |
| `crisp-client/` Cookie | 每页加载后的聊天延续；合法利益 | 6 个月，返回续期 |
| `__Host-tp_session` | 必要门户登录 | 登录后 30 天；登录过程最多 10 分钟；退出删除 |
| `locale`, `context`, `sign-in-return-to` | 门户语言、Personal/团队视图、返回页；合法利益 | 前两项直到清除；返回页 15 分钟 |

在页脚 Cookie settings 或此处更改分析同意：

<cookie-settings></cookie-settings>

## 接收方 {#sharing}

| 接收方 | 数据与目的 |
| --- | --- |
| [OVH]({ovhPrivacy}) | 服务器及服务记录托管 |
| [Cloudflare]({cloudflarePrivacy}) | DNS/代理、R2/备份、Turnstile、Cloudflare Web Analytics |
| [Amazon Web Services]({awsPrivacy}) | Amazon SES 邮件、投递及互动；CloudFront 链接、SNS/SQS 事件 |
| [PostHog EU]({posthogPrivacy}) | 应用/服务器分析；账户 ID，无姓名/邮箱；直接请求含 IP |
| [{merchant}]({merchantPrivacy}) | 独立 merchant of record；结账、账单及购买 |
| [Crisp]({crispPrivacy}) | 聊天、浏览器/页面及已登录账户身份 |
| [Google]({googlePrivacy}) | 网站/文档分析及字体；所选账户登录 |
| [Mintlify]({mintlifyPrivacy}) | 文档托管和获同意的测量 |
| [GitHub]({githubPrivacy}) | 下载、更新、插件、星标、公开 issue 和可选登录 |
| [Apple]({applePrivacy}) | 可选登录；应用/集成所述服务及诊断 |
| [jsDelivr]({jsdelivrPrivacy}) | 结账脚本请求含 IP/浏览器 |

团队成员按角色接收共享内容及账户详情。集成接收您指定发送的数据。我们不出售个人数据或为广告共享。其他披露仅在法律要求时进行。提供方自己的政策也适用。

## 处理地点 {#transfers}

OVH 服务器和 Amazon SES 在新加坡（SES 为 `ap-southeast-1`）。PostHog 在欧盟。Crisp 总部在法国。{publisherName} 从越南运营。美国提供方，包括 {merchant}、Google、GitHub、Cloudflare、Amazon Web Services 和 Mintlify，在美国处理数据。存储和备份可能涉及其他国家。所需 EEA/英国保障依赖各提供方的标准合同条款或其他批准机制；Google 也使用 EU-US Data Privacy Framework。通过[联系](#controller)查询保障详情。

## 保存期限 {#retention}

表中注明未设期限的项目确实没有期限。删除账户不会删除 PostHog 或 Crisp 数据。通过[联系](#controller)发邮件，我们会按请求在这些提供方删除。

| 记录 | 保存与删除 |
| --- | --- |
| PostHog 分析 | 未设期限。关闭仍保留旧事件。可请求删除。 |
| 处理任务和服务器日志 | 任务在发送/重试期间可能保存报告。日志用于安全及排错。未设总体期限，不承诺无服务器副本。 |
| 设备 | 包括已移除设备，保留至删除账户 |
| 账户和审计 | 删除账户、登录方式、设备、许可证及成员关系。审计无期限保留；移除邮箱字段及操作者 IP/用户代理，但自由文本内地址可能仍在。 |
| 订单和提供方通知 | 税务/会计订单未设期限。删除移除账户/邮箱关联。{merchant}、Amazon SES 和 Apple 事件保留；清理被删账户的购买个人信息、邮件收件人/互动详情。 |
| Team Library | 已删项目保留最后版本用于同步。普通删除团队后 30 天删库，期间可恢复。删除唯一所有者账户立即删团队和库。许可证结束不删库。 |
| 认证 | 链接/验证码 15 分钟过期，7 天后删除。门户会话 30 天。应用令牌末次使用 90 天后过期，再过 30 天删除。邮件任务保存明文直到清理：发送后一天或放弃发送后 7 天。 |
| 邮件订阅 | 新未确认地址 30 天后删除。已确认/迁移地址到请求删除或同邮箱账户删除为止。退订仍保留地址并标为退订。 |
| 抑制名单 | 退信/投诉地址及首次/末次日期在账户/订阅删除后仍保留，以阻止再发。未设期限。 |
| Google Analytics | 用户/事件数据 2 个月；汇总标准报告另计 |
| Cloudflare Web Analytics | 我们可查看最近六个月浏览总数 |
| 支持 | Crisp 对话和邮箱消息保留至删除，包括按请求删除。未设期限。 |
| 备份和迁移档案 | 未设期限。删账户不删副本。旧完整数据库含姓名/邮箱、许可证、订单、团队、设备名、订阅者、beta 注册、邮件、使用报告及带 IP 的许可证日志。 |

## 选择和权利 {#rights}

使用应用开关、网站/文档 Cookie settings 和退订更改可选处理。撤回同意只向后生效，不影响之前处理的合法性。开关不删旧数据或停止服务器分析。在[门户 Settings]({account})导出或删账户；并非涵盖保留表中所有记录。

依居住地，可要求访问、更正、删除、限制、可携带或反对合法利益处理。无需账户：邮件[联系](#controller)。我们可能询问查找记录所需信息，如安装 ID。切勿通过邮件明文发送许可证密钥。我们在一个月内答复。您可向数据保护机关投诉。法律保存义务可能限制删除。

### 地区权利 {#regional-rights}

**加利福尼亚州居民**。California Consumer Privacy Act 赋予您了解我们收集哪些个人信息、要求删除、拒绝出售，以及不因行使这些权利而受到差别待遇的权利。我们不出售个人信息。

## 儿童 {#children}

TablePro 不面向 16 岁以下儿童，我们不会明知而收集其个人数据。如认为儿童已向我们提供数据，请联系我们删除。

## 安全 {#security}

服务流量使用 HTTPS。账户无密码。登录凭据及团队 API 令牌以哈希保存，[保存期限](#retention)中的临时邮件任务除外。系统访问限于 {publisherName} 和[接收方](#sharing)。没有系统绝对安全。通过[安全页面](/zh-Hans/security#report)报告漏洞。

## 变更 {#changes}

页面显示最后更新日期。旧版本保留在[公开网站仓库历史]({webGithub}/commits/main/resources/data/legal/en/privacy.md)。新用途开始前我们会更新本政策，依法直接通知，并在需要时重新征求同意。
