---
title: 隱私政策
description: TablePro 收集的資料、用途、接收方、儲存時間，以及您的選擇和權利。
updatedAt: "2026-11-05"
---

本政策涵蓋 Mac、Linux、iPhone 和 iPad 上的 TablePro；tablepro.app；docs.tablepro.app；以及帳戶、購買、支援和郵件訂閱服務。[技術清單](https://docs.tablepro.app/security/privacy)列出欄位、端點和控制選項。App原始碼位於[公開倉庫]({github})。

## 概要 {#summary}

普通查詢和結果在您的裝置與資料庫之間傳輸。使用資料不含 SQL、結果行或憑據。您主動釋出到 Team Library、傳送給支援或與 AI 及外部工具共享的內容會到達相應接收方。

Mac 和 Linux 預設開啟使用資料，可關閉。已發布的 iPhone 和 iPad App只在您同意後傳送報告。直接傳送的分析資料可關聯帳戶和購買記錄。關閉不會停止帳戶請求或伺服器分析。

網站統計訪問並在每頁載入 Crisp。Google Analytics Cookie 需要您的選擇。郵件訂閱測量開啟和點選。刪除帳戶仍會留下部分記錄，包括 PostHog 和 Crisp 中的資料。請閱讀[儲存期限](#retention)和[權利](#rights)。[控制者](#controller)也接受無帳戶的隱私請求。

<span id="contact"></span>

## 負責方 {#controller}

{publisherName} 是位於 {publisherCity}、{publisherCountry} 的獨立開發者，也是本政策所述個人資料的控制者。聯絡 [{email}](mailto:{email})。我們沒有資料保護官。對於團隊，我們作為控制者管理帳戶、邀請和服務記錄。Team Library 釋出內容按團隊指示處理；團隊決定釋出什麼及誰能訪問。

<span id="lawful-basis"></span>

## 收集的資料和目的 {#data-use}

對於歐洲經濟區和英國，各目的列明法律依據：合同（第 6(1)(b) 條）、合法利益（6(1)(f)）、同意（6(1)(a)）或法定義務（6(1)(c)）。我們不做產生法律或類似重大影響的自動決策。

<span id="mac-account"></span>

### 帳戶和裝置 {#account}

免費本地使用無需帳戶。帳戶服務需要電子郵箱。我們儲存姓名、語言、登入方式、授權、訂單、裝置、團隊角色及席位。Mac 和 Linux 裝置註冊傳送機器標識、裝置名、平臺及App/系統版本。裝置名可能包含您的姓名。此流程與使用資料分開。目的和依據是按合同提供帳戶與套餐。

登入使用郵件連結和驗證碼、通行金鑰或 Apple、GitHub、Google。通行金鑰記錄包括公鑰、名稱、同步狀態和使用日期。身份提供方給出 ID 和已驗證郵箱；Apple 還可能提供姓名。Apple 令牌加密儲存，在解綁或刪除帳戶時撤銷。帳戶變更記錄附帶 IP 和使用者代理。合法利益是保護帳戶及調查濫用。

[帳戶門戶]({account})提供資料及登入方式修改、裝置管理、JSON 匯出和帳戶刪除。擁有含其他成員的團隊時不能刪除帳戶。刪除會終止訂閱，不退款。[儲存期限](#retention)說明保留內容。

### 購買 {#purchases}

{merchant}（Polar Software, Inc.）是 merchant of record 和轉售商，按自己的條款收集姓名、郵箱、賬單地址及付款資訊，處理付款、稅務、收據和爭議。我們從不接收完整銀行卡資訊。

我們為結賬、稅務和幣種傳送購買內容、語言、訪問來源及 IP。我們接收買方及賬單詳情、金額、訂單/訂閱 ID、續訂、取消和退款。訂單保留郵箱、賬單國家、金額及來源歸因。未登入購買會在必要時為該郵箱建立未驗證帳戶。取消原因和評論傳送至 {merchant} 並隨訂閱儲存。處理履行購買合同；稅務及會計記錄履行法定義務。缺少必要資訊無法結賬。在 [{merchant} 門戶]({portal})管理賬單；參閱[條款](/zh-Hant/terms)和[退款](/zh-Hant/refund-policy)。

### 團隊和共享內容 {#library}

邀請人提供郵箱、角色及席位選擇。所有者和管理員檢視成員姓名/郵箱、邀請及團隊變更，包括受邀地址，但看不到審計 IP 或瀏覽器。成員檢視團隊、套餐、席位數及自己的角色。我們按合同使用這些記錄提供團隊服務。

在 Mac 釋出到 Team Library 會把連線設定和已儲存查詢上傳伺服器，供有許可權成員使用。設定包括主機、埠、資料庫、使用者名稱、SSH/SSL、啟動命令、Tunnel Command 和 AI 設定。查詢包括名稱、SQL、關鍵詞和資料夾。結構化密碼欄位被排除；SQL 或自由文字中輸入的秘密不會自動刪除。庫顯示最後修改者。退出團隊不會自動清除共享內容。參閱[刪除時間](#retention)。Team Catalog 則寫入您選擇的共享資料夾。

### 使用和服務分析 {#analytics}

我們的合法利益是瞭解使用、修復問題及統計購買。Mac 和 Linux 傳送[App](#apps)中所述資料。伺服器也向 PostHog 傳送登入、購買、裝置和團隊事件，含帳戶 ID，不含姓名/郵箱。這些 ID 將App使用與服務活動關聯。開關停止App事件，不停止必要帳戶請求或伺服器事件。透過[權利](#rights)提出反對或刪除要求。

### 訂閱郵件和電子郵件 {#newsletter}

Amazon SES 傳送驗證碼、邀請、帳戶通知和訂閱郵件。服務郵件履行您請求的服務。新郵件訂閱需確認並基於同意。我們儲存地址、語言、註冊/確認時間、IP、使用者代理、註冊頁面及同意文字版本。

每封訂閱郵件透過圖片和 `links.news.tablepro.app` 測量每位收件人的開啟及點選。Amazon SES 接收時間、連結、IP 和使用者代理，再傳給伺服器統計。遮蔽圖片停止開啟測量，不停止點選測量。退訂及郵件連結不被跟蹤。沒有單獨的測量開關。透過郵件或郵件App的一鍵退訂停止接收；之後不發確認郵件。重新訂閱需確認。永久退信及垃圾郵件投訴會停止傳送。透過[聯絡](#controller)要求刪除地址。

舊伺服器名單中所有未退訂地址均已遷移，無論是否確認，包括買家、授權持有人和 beta 註冊者。已退訂地址保持退訂；退信/投訴地址進入抑制名單。參閱[儲存期限](#retention)。

### 支援 {#support}

您傳送的訊息、附件及診斷會到達我們和所用支援服務，其中可能包含您附上的資料庫內容或秘密。網站/門戶載入聊天時，Crisp 接收 IP、瀏覽器及瀏覽頁面。開始對話後保留 IP。我們提供頁面語言；門戶已登入時還提供帳戶郵箱和 ID。每頁載入聊天基於提供支援的合法利益。您發起的對話基於同意。

## 您的App {#apps}

| App和版本 | 使用資料 | 控制 |
| --- | --- | --- |
| Mac 0.86.0，從 0.86.0-beta.1 起 | 直接發往 PostHog；預設開啟 | Settings > General > Privacy |
| Linux 從 0.1.0-beta.1 起 | 直接發往 PostHog；預設開啟 | Preferences > General > Privacy |
| 已發布的 iPhone 和 iPad | 經伺服器報告；同意前關閉 | Settings > Privacy |

<span id="mac-local"></span>

### 裝置上的資料 {#local-data}

連線列表、查詢歷史、本地日誌和標籤頁留在裝置，除非您選擇共享。資料庫流量發往所選伺服器。密碼使用平臺憑據儲存。Mac 引用磁碟原位置的 SSH 金鑰。使用分析不含主機名、使用者名稱、SQL、行或憑據。[整合](#integrations)、Team Library 和支援有本文說明的例外。

### Mac {#mac-app}

以下直接分析和帳戶行為從 0.86.0 開始，包括 0.86.0-beta.1。登入會註冊 Mac 並獲取套餐。帳戶令牌留在該 Mac 鑰匙圈，絕不透過 iCloud Keychain 同步。已有授權金鑰換成登入後在本地刪除。

#### Mac 使用資料 {#mac-usage-report}

預設開啟，傳送首個事件前不會詢問。在 **設定 > 一般 > 隱私 (Settings > General > Privacy)** 關閉 **分享使用資料 (Share usage data)**。關閉狀態啟動不會執行 PostHog 庫。不傳送自動崩潰報告；PostHog 崩潰捕獲被禁用。

事件涵蓋每日使用及開啟連線的型別/數量、首次嘗試連線、成功連線及首次執行查詢（按資料庫型別）、付費功能限制及原因、升級點選、登入方式/退出，以及授權購買提示的展示和回答。PostHog 新增裝置、螢幕、網路、會話、App和系統資訊，並接收 IP 推算大致位置。登入前使用隨機安裝 ID，不建個人檔案。登入後使用帳戶 ID，檔案含版本、架構、語言及推算位置。退出生成新隨機 ID。參閱[欄位和端點](https://docs.tablepro.app/security/privacy#usage-data)。

#### 更新和外掛 {#mac-updates}

App透過 updates.tablepro.app 從 GitHub 獲取更新源和外掛目錄。下載及下載計數也訪問 GitHub。請求帶 IP 和使用者代理。在 **設定 > 一般 > 軟體更新 (Settings > General > Software Update)** 關閉 **自動檢查更新 (Automatically check for updates)** 可停止自動檢查。外掛目錄沒有關閉選項。[技術說明](https://docs.tablepro.app/security/privacy#update-checks)也列出舊版本更新源。

#### 較早的 Mac 版本 {#mac-license}

0.86.0 前，同一預設開啟的開關控制傳送至伺服器的報告。包含機器 ID 雜湊、系統/App詳情、連線型別/數量、授權狀態、首次嘗試及成功日期。更新設定會傳送，但伺服器丟棄。當前伺服器附 Cloudflare 國家資訊轉發 PostHog，不帶 IP 或授權金鑰，不建立個人檔案。機器 ID 可關聯帳戶裝置。目前不儲存專門的心跳歷史，但任務、日誌、備份和舊檔案可能保留資料。參閱[儲存期限](#retention)。

舊版僅在輸入金鑰後訪問授權服務。檢查傳送金鑰、機器 ID、Mac 名及版本。裝置記錄屬於帳戶；啟用/停用審計附 IP 和使用者代理。[技術清單](https://docs.tablepro.app/security/privacy#older-mac-reports)列出欄位與時間。

### iPhone 和 iPad {#ios-app}

已發布App在首次啟動或 **設定 > 隱私權 (Settings > Privacy)** 啟用 **分享使用資料 (Share Usage Data)** 前不傳送使用報告。依據為同意。每日報告經伺服器向 PostHog 轉發，不含 IP，附 Cloudflare 國家且無個人檔案。包含 Apple 裝置標識雜湊、平臺、版本、架構、語言、連線型別/數量及首次嘗試、成功和首次執行查詢的日期。始終報告無授權；無更新設定。App不檢查帳戶、授權、更新或外掛。

資料庫/SSH、可選 iCloud 及 SQL Server 的 Microsoft Entra 登入會向相應服務發資料。密碼和貼上的 SSH 金鑰在鑰匙圈；證書和歷史在裝置。連線加入本地 Spotlight 索引。執行中查詢的 Live Activity 可在鎖定畫面顯示 SQL，除非開啟 Hide Query。另有 Apple 的 Share With App Developers 設定，可透過 App Store Connect 向我們提供崩潰報告及統計。App本身無崩潰報告器或第三方分析庫。參閱 [iOS](https://docs.tablepro.app/ios#privacy)。

### Linux {#linux-app}

從 0.1.0-beta.1 起，登入按[帳戶](#account)所述註冊裝置。秘密使用桌面金鑰環。包管理器更新遵循所選分發方設定。App不自動上傳崩潰報告。

#### Linux 使用資料 {#linux-usage-data}

從 0.1.0-beta.1 預設開啟。在 Preferences > General > Privacy 關閉 Share usage data。事件直接到 PostHog EU：每日使用及連線型別/數量、首次嘗試/成功及按型別的首次查詢、登入/退出、升級點選、授權提示展示及 Buy 回答。附安裝/帳戶 ID、版本、架構、介面語言及 SDK 中繼資料。PostHog 接收 IP 並推算位置。登入前隨機 ID，無個人檔案；之後帳戶檔案關聯使用和購買。退出重置 ID。事件不含主機名、SQL、行或憑據。裝置註冊另外包含主機名。

關閉停止新傳送，已在途請求可能完成。不會清除舊事件或停止帳戶請求/伺服器分析。參閱[儲存期限](#retention)、[權利](#rights)及[技術清單](https://docs.tablepro.app/security/privacy#linux-usage-data)。

<span id="mac-third-parties"></span>

## 您選擇的服務 {#integrations}

資料庫、SSH 和代理提供方直接接收您要求的流量。配置後的連線登入服務接收認證請求。Apple Maps 提供地圖圖塊；DuckDB 提供查詢用擴充套件。下載的連線/AI 輔助程式訪問其提供方。各自條款適用。

### iCloud 和 Handoff {#icloud}

可選 iCloud Sync 將連線、分組、標籤、設定、查詢及 SSH 配置存入私人 CloudKit。 在 Mac 上，還會同步資料表和資料庫的喜好項目與資料夾，以及認證設定檔的名稱、使用者名稱和密碼模式，不含設定檔中的密碼。Apple 託管，我們無法讀取。密碼同步單獨控制，預設關閉，使用端到端加密 iCloud Keychain。Mac 上也適用於寫入同一儲存的其他秘密，如 AI 金鑰及舊授權金鑰。帳戶令牌從不同步。Mac 需 Pro 或 Team；iOS 免費。Handoff 在 Apple 裝置間傳連線 ID 和表名，無表時傳連線名/主機，不傳憑據。參閱[控制](https://docs.tablepro.app/features/icloud-sync)。

### AI 和外部工具 {#ai-tools}

AI 請求直接發往所選提供方或本地模型，可能包含提示、結構、SQL 和對話。附加網格結果行預設關閉。獲准的 AI 查詢工具返回的結果也進入對話並傳送至提供方，不受附加開關限制。GitHub Copilot 從 npm 下載輔助程式，初始開啟向 GitHub 傳送遙測資料 (Send telemetry to GitHub)。

MCP 預設關閉，禁用時無法啟動，包括橋接和配對請求。啟用後，已認證客戶端可按授權請求資料。AI 客戶端可將結果發至自己的服務。外部 MCP 伺服器接收已批准的工具引數。參閱 [AI/MCP 控制](https://docs.tablepro.app/security/privacy#ai-providers)。

## 網站和瀏覽器儲存 {#website}

伺服器及 Cloudflare 接收 IP、使用者代理和頁面請求。Cloudflare Web Analytics 統計瀏覽、來源、載入時間、瀏覽器/系統/裝置類別及國家，不使用瀏覽器儲存或指紋。合法利益是瞭解和維護網站。

Google Analytics 以 Consent Mode 載入。在 Allow 前傳送無 Cookie、無已存裝置 ID 的頁面訊號。同意後啟用 Cookie 及訪問、下載、結賬測量。廣告儲存、個性化及廣告使用者資料始終拒絕。Google 表示 GA4 不儲存 IP。

Crisp 在網站/門戶每頁載入，見[支援](#support)。指向或 Tab 到 Buy 會從 jsDelivr 載入 {merchant} 指令碼，向其提供 IP/瀏覽器；點選才開啟結賬。開始訂閱表單會載入 Turnstile 防濫用，依據合法利益。國家查詢和時區用於語言/地區優惠建議，依據合法利益；請求無 Cookie，頁面不儲存回答。

首次訪問建立 `tablepro:attribution`，儲存 90 天：標籤/來源、著陸頁和日期。結賬時伺服器將來源作為中繼資料傳給 {merchant}，隨訂單儲存，並隨結賬/付款事件發給 PostHog。著陸頁和日期不保留。依據是衡量購買來源的合法利益。公開訂閱、結賬和優惠請求省略憑據，不設門戶 Cookie。門戶無分析指令碼，但伺服器傳送服務事件。

### 文件網站 {#docs}

Mintlify 託管 docs.tablepro.app。頁面、Google Fonts 和 GitHub 星標請求向這些提供方披露 IP/瀏覽器。文件單獨詢問分析同意。Allow 前不儲存分析 Cookie 或訪客 ID。Allow 啟用 Google Analytics 和 Mintlify ID。文件頁尾 Cookie settings 可撤回並刪除它們。主站選擇不會跨到此來源。

### Cookie 和儲存 {#cookies}

Cloudflare Web Analytics 不在瀏覽器儲存內容。公開頁面不設第一方 Cookie。以下儲存期限與提供方保留期不同。必要儲存維持登入或選擇；同意和合法利益用途列在此處。

| 名稱/服務 | 目的與觸發 | 期限與控制 |
| --- | --- | --- |
| `_ga`, `_ga_<ID>` | 同意後的 Google Analytics | 最長 2 年；拒絕即刪除 |
| `tablepro:analytics-consent` | 必要的選擇記錄，網站/文件各自儲存 | 直到清除 |
| `tablepro:attribution` | 隨結賬傳送首次來源；合法利益 | 90 天 |
| `theme`, `tablepro:language`, `tablepro:campaign-closed`, `tablepro:linux-install` | 外觀、所選/忽略語言、已關閉促銷、所選 Linux 安裝方式；合法利益 | 直到清除；門戶主題獨立 |
| `mintlify_anonymous_id` | 文件訪客 ID，在該處同意後 | 直到清除或拒絕 |
| `crisp-client/` Cookie | 每頁載入後的聊天延續；合法利益 | 6 個月，返回續期 |
| `__Host-tp_session` | 必要門戶登入 | 登入後 30 天；登入過程最多 10 分鐘；退出刪除 |
| `locale`, `context`, `sign-in-return-to` | 門戶語言、Personal/團隊檢視、返回頁；合法利益 | 前兩項直到清除；返回頁 15 分鐘 |

在頁尾 Cookie settings 或此處更改分析同意：

<cookie-settings></cookie-settings>

## 接收方 {#sharing}

| 接收方 | 資料與目的 |
| --- | --- |
| [OVH]({ovhPrivacy}) | 伺服器及服務記錄託管 |
| [Cloudflare]({cloudflarePrivacy}) | DNS/代理、R2/備份、Turnstile、Cloudflare Web Analytics |
| [Amazon Web Services]({awsPrivacy}) | Amazon SES 郵件、投遞及互動；CloudFront 連結、SNS/SQS 事件 |
| [PostHog EU]({posthogPrivacy}) | App/伺服器分析；帳戶 ID，無姓名/郵箱；直接請求含 IP |
| [{merchant}]({merchantPrivacy}) | 獨立 merchant of record；結賬、賬單及購買 |
| [Crisp]({crispPrivacy}) | 聊天、瀏覽器/頁面及已登入帳戶身份 |
| [Google]({googlePrivacy}) | 網站/文件分析及字型；所選帳戶登入 |
| [Mintlify]({mintlifyPrivacy}) | 文件託管和獲同意的測量 |
| [GitHub]({githubPrivacy}) | 下載、更新、外掛、星標、公開 issue 和可選登入 |
| [Apple]({applePrivacy}) | 可選登入；App/整合所述服務及診斷 |
| [jsDelivr]({jsdelivrPrivacy}) | 結賬指令碼請求含 IP/瀏覽器 |

團隊成員按角色接收共享內容及帳戶詳情。整合接收您指定傳送的資料。我們不出售個人資料或為廣告共享。其他披露僅在法律要求時進行。提供方自己的政策也適用。

## 處理地點 {#transfers}

OVH 伺服器和 Amazon SES 在新加坡（SES 為 `ap-southeast-1`）。PostHog 在歐盟。Crisp 總部在法國。{publisherName} 從越南運營。美國提供方，包括 {merchant}、Google、GitHub、Cloudflare、Amazon Web Services 和 Mintlify，在美國處理資料。儲存和備份可能涉及其他國家。所需 EEA/英國保障依賴各提供方的標準合同條款或其他批准機制；Google 也使用 EU-US Data Privacy Framework。透過[聯絡](#controller)查詢保障詳情。

## 儲存期限 {#retention}

表中註明未設期限的專案確實沒有期限。刪除帳戶不會刪除 PostHog 或 Crisp 資料。透過[聯絡](#controller)發郵件，我們會按請求在這些提供方刪除。

| 記錄 | 儲存與刪除 |
| --- | --- |
| PostHog 分析 | 未設期限。關閉仍保留舊事件。可請求刪除。 |
| 處理任務和伺服器日誌 | 任務在傳送/重試期間可能儲存報告。日誌用於安全及排錯。未設總體期限，不承諾無伺服器副本。 |
| 裝置 | 包括已移除裝置，保留至刪除帳戶 |
| 帳戶和審計 | 刪除帳戶、登入方式、裝置、授權及成員關係。審計無期限保留；移除郵箱欄位及操作者 IP/使用者代理，但自由文字內地址可能仍在。 |
| 訂單和提供方通知 | 稅務/會計訂單未設期限。刪除移除帳戶/郵箱關聯。{merchant}、Amazon SES 和 Apple 事件保留；清理被刪帳戶的購買個人資訊、郵件收件人/互動詳情。 |
| Team Library | 已刪專案保留最後版本用於同步。普通刪除團隊後 30 天刪庫，期間可恢復。刪除唯一所有者帳戶立即刪團隊和庫。授權結束不刪庫。 |
| 認證 | 連結/驗證碼 15 分鐘過期，7 天后刪除。門戶會話 30 天。App令牌末次使用 90 天后過期，再過 30 天刪除。郵件任務儲存明文直到清理：傳送後一天或放棄傳送後 7 天。 |
| 郵件訂閱 | 新未確認地址 30 天后刪除。已確認/遷移地址到請求刪除或同郵箱帳戶刪除為止。退訂仍保留地址並標為退訂。 |
| 抑制名單 | 退信/投訴地址及首次/末次日期在帳戶/訂閱刪除後仍保留，以阻止再發。未設期限。 |
| Google Analytics | 使用者/事件資料 2 個月；彙總標準報告另計 |
| Cloudflare Web Analytics | 我們可檢視最近六個月瀏覽總數 |
| 支援 | Crisp 對話和郵箱訊息保留至刪除，包括按請求刪除。未設期限。 |
| 備份和遷移檔案 | 未設期限。刪帳戶不刪副本。舊完整資料庫含姓名/郵箱、授權、訂單、團隊、裝置名、訂閱者、beta 註冊、郵件、使用報告及帶 IP 的授權日誌。 |

## 選擇和權利 {#rights}

使用App開關、網站/文件 Cookie settings 和退訂更改可選處理。撤回同意只向後生效，不影響之前處理的合法性。開關不刪舊資料或停止伺服器分析。在[門戶 Settings]({account})匯出或刪帳戶；並非涵蓋保留表中所有記錄。

依居住地，可要求訪問、更正、刪除、限制、可攜帶或反對合法利益處理。無需帳戶：郵件[聯絡](#controller)。我們可能詢問查詢記錄所需資訊，如安裝 ID。切勿透過郵件明文傳送授權金鑰。我們在一個月內答覆。您可向資料保護機關投訴。法律儲存義務可能限制刪除。

### 地區權利 {#regional-rights}

**加利福尼亞州居民**。California Consumer Privacy Act 賦予您了解我們收集哪些個人資訊、要求刪除、拒絕出售，以及不因行使這些權利而受到差別待遇的權利。我們不出售個人資訊。

## 兒童 {#children}

TablePro 不面向 16 歲以下兒童，我們不會明知而收集其個人資料。如認為兒童已向我們提供資料，請聯絡我們刪除。

## 安全 {#security}

服務流量使用 HTTPS。帳戶無密碼。登入憑據及團隊 API 令牌以雜湊儲存，[儲存期限](#retention)中的臨時郵件任務除外。系統訪問限於 {publisherName} 和[接收方](#sharing)。沒有系統絕對安全。透過[安全頁面](/zh-Hant/security#report)報告漏洞。

## 變更 {#changes}

頁面顯示最後更新日期。舊版本保留在[公開網站倉庫歷史]({webGithub}/commits/main/resources/data/legal/en/privacy.md)。新用途開始前我們會更新本政策，依法直接通知，並在需要時重新徵求同意。
