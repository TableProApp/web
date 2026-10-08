---
title: 隱私權政策
description: TablePro App、網站與帳戶入口網站收集哪些資訊、傳送至何處、保存多久，以及如何變更或刪除。
updatedAt: "2026-10-08"
---

本政策涵蓋 Mac 版 TablePro、iPhone 與 iPad 版 TablePro、位於 tablepro.app 的網站、位於 docs.tablepro.app 的文件，以及位於 tablepro.app/account 的帳戶入口網站。它描述各產品目前實際傳送和儲存的資訊。兩款 App 均採用 AGPLv3 開放原始碼，您可在 [TablePro 儲存庫]({github})中查看傳送下列資料的程式碼。

## 概要 {#summary}

- Mac App 每天向 TablePro 傳送一次使用情況報告。此功能預設開啟，可以關閉。iPhone 與 iPad App 僅在您開啟後傳送。
- 啟用授權後，Mac App 每隔 {revalidateDays} 天向我們的伺服器驗證一次，驗證資訊包含 Mac 名稱。
- 您執行的查詢、結果與密碼不會傳送給 TablePro。例外是您自行選擇發佈至 Team Library 的連線設定（從不包含密碼）與已儲存查詢。
- AI 請求從 Mac App 直接傳送至您設定的 AI 供應商，不經過我們。
- 我們的伺服器儲存每份使用情況報告與授權驗證請求的 IP 位址，並為每份報告查詢所屬國家。我們尚未設定這些紀錄的保存期限。
- 網站使用不設定 Cookie 的 Cloudflare Web Analytics 統計網頁瀏覽量。網站也載入 Google Analytics，但只有獲得您的允許才設定 Cookie。每個網頁還會載入線上聊天服務 Crisp，它會設定自己的 Cookie。
- 購買由我們的 merchant of record {merchant} 負責銷售。

## 誰負責處理 {#controller}

發佈 App 和本網站的 TablePro 是此處所述個人資料的責任方（資料控制者）。如對本政策或您的資料有疑問，請寄送郵件至 [{email}](mailto:{email})。

## Mac 版 TablePro {#mac-app}

### 使用情況報告 {#mac-usage-report}

Mac App 啟動約十秒後向 `api.tablepro.app` 傳送使用情況報告，之後在執行期間每天傳送一次。**此功能預設開啟，首次傳送前不會徵求同意**。若要關閉，請進入**設定 > 一般 > 隱私**（Settings > General > Privacy）並取消勾選**分享匿名使用資料**（Share anonymous usage data）。

報告包含：

- 機器 ID：Mac 硬體 UUID 的 SHA-256 雜湊值（UUID 本身從不傳送）；
- 平台、App 版本、macOS 版本、處理器架構與 App 語言；
- 已開啟連線的資料庫類型名稱（如 PostgreSQL）與已開啟的連線數量；
- 是否已啟用授權；
- 首次嘗試連線與首次成功連線的日期和時間；
- 更新設定（安裝方式及檢查頻率）。報告抵達時，我們的伺服器會捨棄這些設定。

報告從不包含主機名稱、使用者名稱、密碼、查詢或列資料。

伺服器保存每份報告及其來源 IP 位址，接著將 IP 位址傳送至 ip-api.com 查詢國家；失敗時依序嘗試 ipinfo.io 和 geoplugin.net。這些查詢使用未加密的 HTTP。國家資訊與報告一起儲存。由於下述授權驗證使用相同機器 ID，已啟用授權的 Mac 所傳送的報告可與該授權關聯。

### 授權驗證 {#mac-license}

Mac App 僅在您輸入授權金鑰後連線至授權伺服器。它會在啟用時、距上次驗證至少 {revalidateDays} 天後的啟動時，以及此後每隔 {revalidateDays} 天驗證。每次驗證傳送：

- 授權金鑰；
- 上述機器 ID；
- macOS 中設定的 Mac 名稱（其中經常包含您的姓名）；
- App 版本與 macOS 版本。

停用某台 Mac 時只傳送授權金鑰和機器 ID。

伺服器記錄每個授權請求的 IP 位址和內容，並將每台已啟用 Mac 的機器 ID、名稱與授權一起保存。帳戶入口網站依名稱列出這些 Mac。如果無法連線至伺服器，付費功能可自上次成功驗證起繼續使用 {graceDays} 天。

### Team Library {#library}

Team Library 是 Team 授權的功能。當您在連線上選擇**分享 > 發佈到團隊庫…**（Share > Publish to Team Library…），或在 Favorites 側邊欄選擇**將已儲存的查詢發佈到團隊…**（Publish Saved Queries to Team…）時，Mac App 將您發佈的內容上傳至伺服器：

- 連線設定：主機、連接埠、資料庫名稱、使用者名稱、SSH 和 SSL 設定、驅動程式選項、啟動指令、Tunnel Command 設定、Safe Mode 等級與 AI 設定，但絕不包含密碼；
- 已儲存查詢：名稱、SQL 文字、關鍵字與檔案夾。

使用同一 Team 授權的 Mac 在啟動時下載資源庫，最多每週一次；執行發佈的 Mac 會在發佈後立即重新下載。再次發佈會取代先前發佈的內容。移除團隊成員會刪除該成員發佈的所有內容。授權到期或被停用後，資源庫仍會保留在我們的伺服器上，直到您要求刪除。

另一項 Team 功能 Team Catalog 會將不含密碼的連線檔案寫入您選擇的共用檔案夾，不經過我們的伺服器。

### 更新與外掛程式 {#mac-updates}

- **更新檢查**。Mac App 每天從 GitHub（`raw.githubusercontent.com`）下載一次更新摘要。除所有網路請求都會帶有的 IP 位址和含 App 版本的 User-Agent 外，請求不會傳送其他 Mac 資訊。若要關閉，請進入**設定 > 一般 > 軟體更新**（Settings > General > Software Update）並取消勾選**自動檢查更新**（Automatically check for updates）。更新本身也從 GitHub 下載。
- **外掛程式目錄**。App 啟動時與開啟外掛程式設定時，會從 GitHub 下載可用驅動程式和佈景主題清單。沒有關閉此行為的設定。您安裝的驅動程式和佈景主題從 GitHub 下載，外掛程式瀏覽器透過 GitHub API 取得下載次數。

GitHub 會隨這些請求收到您的 IP 位址，這些請求適用 GitHub 自身的隱私權聲明。

### 您選擇使用的服務 {#mac-third-parties}

只有設定後，Mac App 才會直接向以下服務傳送資料，從不經過 TablePro：

- **您的資料庫、SSH 伺服器與代理伺服器**接收連線向其傳送的資訊。
- **AI 供應商**。加入供應商並使用 AI 助理或行內建議時，請求直接傳送給該供應商或 Mac 本機執行的模型。預設包含資料庫類型與名稱、結構中的資料表和欄位定義，以及目前查詢。僅在您開啟相應選項後才傳送結果列。適用供應商自身的條款。加入 GitHub Copilot 會從 npm 下載其語言伺服器，其「向 GitHub 傳送遙測資料」（Send telemetry to GitHub）設定預設開啟。
- **登入服務**：連線使用時的 Microsoft Entra ID、Google、Amazon Web Services 和 Cloudflare Access。
- **Apple Maps**：在地圖上顯示結果時提供地圖圖磚。
- **DuckDB**：查詢首次使用某個擴充功能時提供該擴充功能。
- **MCP 用戶端**。MCP 伺服器預設關閉。您開啟它，或已設定的 MCP 用戶端啟動 TablePro 橋接程式或與其配對時，它會啟動，且僅監聽 Mac 本機（127.0.0.1）。連線的 AI 用戶端（如 Claude 或 Cursor）接收其要求的結果，並依自身條款傳送至其服務。
- **您加入的 MCP 伺服器**。AI 工作階段會將您核准的工具呼叫及其引數傳送至該伺服器。

### 留在 Mac 上的資料 {#mac-local}

密碼保存在 macOS 鑰匙圈中。連線清單、查詢歷史、Query Insights、Data Rewind 快照、設定與開啟的分頁儲存在 Mac 上。App 參照磁碟上的 SSH 金鑰，不會複製它們。App 不包含當機報告工具或第三方分析程式庫。

## iPhone 與 iPad 版 TablePro {#ios-app}

**除非您開啟分享使用資料（Share Usage Data），否則不會向 TablePro 傳送任何資訊**。您可在首次啟動時或之後的**設定 > 隱私權**（Settings > Privacy）中開啟。開啟後，App 每天向與 Mac App 相同的伺服器傳送一次報告，伺服器以相同方式儲存和查詢其 IP 位址。報告包含 Apple 為裝置上的 App 分配的識別碼的 SHA-256 雜湊值、平台、App 和 iOS 版本、處理器架構、App 語言、已開啟連線的資料庫類型名稱、已開啟的連線數量，以及首次嘗試連線、首次成功連線與首次執行查詢的日期和時間。不包含更新設定，並一律回報未啟用授權，因為 App 沒有這兩項內容。

App 不會發起授權驗證、更新檢查或外掛程式請求。除選用報告外，它僅連線至您的資料庫和 SSH 伺服器、開啟 iCloud Sync 時的 Apple iCloud，以及 SQL Server 連線使用 Microsoft Entra ID 登入時的 Microsoft。

在裝置上，密碼和貼上的 SSH 金鑰保存在鑰匙圈中，憑證從不同步。查詢歷史留在裝置上。連線會加入裝置的 Spotlight 索引，以便搜尋。查詢執行期間，除非您開啟**設定 > 即時動態 > 隱藏查詢**（Settings > Live Activities > Hide Query），其即時動態會在鎖定畫面和展開的動態島上顯示 SQL。

如果您在 iPhone 或 iPad 設定中選擇與 App 開發者共享分析資料，Apple 可能透過 App Store Connect 向我們提供當機報告和使用統計。App 本身沒有當機報告工具或第三方分析程式庫。

## iCloud Sync 與接力 {#icloud}

iCloud Sync 在 Mac、iPhone 與 iPad 上均預設關閉，直到您開啟。開啟後，紀錄會傳送至您自己 iCloud 帳戶內的私有資料庫（容器 `iCloud.com.TablePro`）。TablePro 無法讀取它們。

- 在 Mac 上，您可選擇同步連線、群組與標籤、設定、SSH 設定檔、認證資料設定檔（名稱和使用者名稱，從不包含密碼）、資料表和資料庫喜好項目、已儲存查詢（包括 SQL 文字）以及資料表檔案夾。連線紀錄包含主機、連接埠、使用者名稱、資料庫名稱、SSH 和 SSL 設定、啟動指令、連線前指令碼與 AI 規則。查詢歷史、Data Rewind 快照和密碼來源從不同步。
- iPhone 與 iPad 同步連線、群組和標籤。
- 密碼僅在您同時開啟 Mac 上 Sync Categories 中的**密碼**（Passwords），或 iPhone 與 iPad 上的**同步密碼**（Sync Passwords）後同步，使用 iCloud 鑰匙圈。在 Mac 上，這也會同步 TablePro 保存在鑰匙圈中的其他機密資訊，例如 AI 供應商金鑰和授權金鑰。

Mac 上的 iCloud Sync 屬於 Starter 或 Team 授權功能，在 iPhone 與 iPad 上免費。

接力透過 Apple 在您的裝置之間傳遞目前連線的 ID 和開啟的資料表名稱。沒有開啟資料表時，傳遞連線名稱；連線沒有名稱時則傳遞主機。不會傳送設定或認證資料。

## 網站 {#website}

**託管**。網站和帳戶入口網站執行於我們的伺服器上，由 Cloudflare 提供前端服務。與任何網頁伺服器一樣，它們會收到您的 IP 位址、瀏覽器 User-Agent 和請求的每個網頁網址。

**Cloudflare Web Analytics**。Cloudflare 在網站和帳戶入口網站網頁中加入 Web Analytics 指令碼。瀏覽器從 `static.cloudflareinsights.com` 載入它，每次瀏覽網頁都會向 Cloudflare 回報網頁、連結來源網站、載入耗時，以及瀏覽器、作業系統和裝置類型。Cloudflare 會補充連線所屬國家。指令碼不設定 Cookie，也不在瀏覽器中保存資訊；Cloudflare 聲明不會使用 IP 位址或瀏覽器資訊對您進行指紋識別。Cloudflare 向我們提供網頁或國家的瀏覽量等彙總資料，不提供每位訪客的紀錄。合法依據：正當利益。

**Google Analytics**。網站在每個網頁以 Consent Mode 載入 Google Analytics。在您於 Cookie 提問中選擇**允許**之前，它不設定 Cookie，僅為每個網頁向 Google 傳送無 Cookie 訊號，不在裝置上儲存識別碼。允許後，Google Analytics 設定 `_ga` 和 `_ga_<ID>` Cookie，統計網頁瀏覽、下載點擊和開始結帳等造訪行為。廣告儲存、廣告個人化和廣告使用者資料始終被拒絕。Google 聲明 Google Analytics 4 不記錄或儲存 IP 位址。我們的 Google Analytics 資源使用 Google 預設保留期：使用者層級與事件層級資料收集後兩個月由 Google 刪除。保存彙總而非識別碼的標準報表不受影響。合法依據：您對 Cookie 的同意。

**線上聊天**。網站和帳戶入口網站的每個網頁都顯示聊天供應商 Crisp 的按鈕。網頁載入完成後，瀏覽器從 `client.crisp.chat` 載入 Crisp 指令碼，Crisp 會設定 [Cookie 與瀏覽器儲存空間](#cookies)中所述的 Cookie。Crisp 收到 IP 位址、瀏覽器資訊、瀏覽的網頁網址和您撰寫的訊息，並在您開始對話後保留 IP 位址。我們只向 Crisp 提供網頁語言，不提供您的其他資訊。Crisp 位於法國。

**結帳指令碼**。當您將指標移至購買按鈕或用 Tab 鍵聚焦時，瀏覽器從 jsDelivr（`cdn.jsdelivr.net`）載入 {merchant} 的結帳指令碼。jsDelivr 會收到 IP 位址和瀏覽器資訊。只有點按後，結帳頁面才從 {merchant} 開啟。

**購買歸因**。首次造訪網站時，瀏覽器在本機儲存空間保存名為 `tablepro:attribution` 的首次造訪紀錄，期限為 90 天：造訪來源（所點按連結中的 `ref` 或 `utm_*` 標籤，或來源網站）、進入的網頁和時間。開始購買時，該紀錄隨結帳請求傳送。我們的伺服器會捨棄它：不會驗證、讀取或儲存，也不會傳給 {merchant}。

**文件**。位於 docs.tablepro.app 的文件由 Mintlify 代管。每開啟一頁，Mintlify 都會收到您的 IP 位址和瀏覽器資訊；頁面從 Google Fonts 載入字型。文件無法讀取您在本網站的回答，因此會另外提出 Cookie 問題。在您於文件中選擇 **Allow** 之前，它不設定 Cookie，也不保存訪客 ID。允許後，Google Analytics 設定 `_ga` 和 `_ga_<ID>` Cookie 並統計您對文件的造訪，Mintlify 則在本機儲存空間保存一個隨機訪客 ID `mintlify_anonymous_id` 用於計數。文件頁尾的 **Cookie settings** 可變更您的回答；拒絕後兩者都會被刪除。合法依據：您的同意。

僅閱讀網站不會設定網站自身的 Cookie。訂閱郵件、開始結帳或驗證折扣碼會向伺服器傳送請求，設定兩個帳戶入口網站 Cookie：`tablepro-session` 與 `XSRF-TOKEN`。網站在瀏覽器中保存的全部資訊列於 [Cookie 與瀏覽器儲存空間](#cookies)。

## 購買 {#purchases}

授權由 merchant of record 與經銷商 {merchant}（Polar Software, Inc.）銷售。您依據 {merchant} 的購買者條款和隱私權政策購買。{merchant} 負責收款、計算並繳納銷售稅或加值稅、寄送收據和發票，並處理付款問題和爭議。它收集姓名、電子郵件地址、帳單地址和付款資訊。我們不會看到完整信用卡資訊。

我們從 {merchant} 收到您的電子郵件地址、您輸入的姓名和帳單地址、購買內容、金額、訂單及訂閱 ID，以及之後的續訂、取消和退款等變更。我們向 {merchant} 提供購買頁面的語言，以便我們的郵件使用該語言。發票、收據、付款方式和訂閱可在 [{merchant} 客戶入口網站]({portal})中管理，使用購買時的電子郵件地址登入。退款詳情請參閱[退款政策](/zh-Hant/refund-policy)，授權的使用範圍請參閱[服務條款](/zh-Hant/terms)。

## 帳戶入口網站 {#account}

位於 tablepro.app/account 的[帳戶入口網站](/account?locale=zh-Hant)供授權購買者使用。我們向購買時的電子郵件地址寄送登入連結；連結僅可使用一次，15 分鐘後到期。入口網站顯示授權、已啟用的 Mac（依名稱列出），以及 Team 授權的成員、邀請、席位和 Team Library。

我們將電子郵件地址與授權、訂單一起保存，並保存您使用的語言，以便以該語言寄送郵件。邀請他人加入團隊時，我們保存其電子郵件地址和角色，並寄送包含邀請代碼的郵件。

## 電子報 {#newsletter}

訂閱版本說明時，我們保存電子郵件地址和訂閱頁面的語言。我們先寄送確認連結，每封電子報均附有取消訂閱連結。取消訂閱後不再寄送電子報；若還希望刪除地址，請寄送郵件給我們。

## Cookie 與瀏覽器儲存空間 {#cookies}

僅閱讀公開網站不會設定網站自身的 Cookie；訂閱電子報或開始結帳會設定以下兩個絕對必要的入口網站 Cookie。Cloudflare Web Analytics 不設定 Cookie，也不在瀏覽器中儲存資訊。Google Analytics Cookie 在您允許之前不會設定。Crisp 在聊天載入後為每個網頁設定 Cookie。此處的資訊不用於廣告，也不會出售。

- **`_ga` 和 `_ga_<ID>`**（Google Analytics Cookie，最長兩年，僅在允許分析時）：瀏覽器的隨機識別碼及目前造訪狀態。拒絕或之後變更回答時會刪除。合法依據：同意。
- **`tablepro:analytics-consent`**（本機儲存空間，直至您清除）：保存對分析提問的回答，避免每個網頁重複詢問。網站和帳戶入口網站共用。合法依據：履行您的選擇所絕對必要。
- **`tablepro:attribution`**（本機儲存空間，90 天）：[網站](#website)一節所述的首次造訪紀錄。不包含您的識別碼，僅隨結帳請求傳送，伺服器之後捨棄。合法依據：正當利益。
- **`theme`** 和 **`tablepro:banner-dismissed`**（本機儲存空間，直至您清除）：保存所選淺色、深色或系統外觀，以及關閉的橫幅和隱藏期限：30 天；若您表示已有授權或購買授權，則為一年。合法依據：正當利益。
- **`mintlify_anonymous_id`**（docs.tablepro.app 的本機儲存空間，由 Mintlify 設定，僅在您於文件中允許 Google Analytics 時）：[網站](#website)一節所述的訪客 ID。拒絕後即刪除。文件另外保存自己的 `tablepro:analytics-consent` 回答。合法依據：同意。
- **以 `crisp-client/` 開頭的 Cookie**（Crisp，例如 `crisp-client/session/…`；六個月，再次造訪時延長；聊天載入後每個網頁都會設定）：在網頁和造訪之間保持聊天與對話。合法依據：為每個網頁提供支援的正當利益。
- **`tablepro-session` 和 `XSRF-TOKEN`**（帳戶入口網站 Cookie，兩小時）：保持登入並保護入口網站表單免受跨站請求偽造。購買確認和電子報等入口網站網頁也會設定；從本網站任意網頁訂閱電子報、開始結帳或驗證折扣碼也會設定。合法依據：絕對必要。

您可隨時透過每頁頁尾的 **Cookie 設定**或以下入口變更、撤回分析回答：

<cookie-settings></cookie-settings>

## 合法依據 {#lawful-basis}

對於歐洲經濟區和英國的讀者，GDPR 與 UK GDPR 下的合法依據為：

- **契約**（第 6 條第 1 款 (b)）：授權銷售和提供、授權驗證、帳戶入口網站和 Team Library。
- **正當利益**（第 6 條第 1 款 (f)）：Mac App 使用報告及國家查詢、授權請求日誌、安全和濫用防範、網頁伺服器日誌、Cloudflare Web Analytics、購買歸因紀錄和每個網頁的線上聊天。
- **同意**（第 6 條第 1 款 (a)）：Google Analytics Cookie、iPhone 與 iPad App 使用報告、電子報和您主動發起的線上聊天。
- **法律義務**（第 6 條第 1 款 (c)）：稅務與會計紀錄，以及對合法請求的回應。

## 資料接收方 {#sharing}

我們僅向營運 TablePro 所需的服務分享個人資料：

- **{merchant}**：購買交易的 merchant of record。
- **電子郵件寄送服務商**：寄送登入連結、我們提供的收據、團隊邀請和電子報。
- **託管服務商及 Cloudflare**：執行網站、帳戶入口網站和 App 連線的伺服器。Cloudflare 也透過 Web Analytics 統計網頁瀏覽量。
- **Google**：網站、文件和帳戶入口網站上的 Google Analytics。
- **Crisp**：網站和帳戶入口網站每個網頁的線上聊天。
- **jsDelivr**：在指標移至購買按鈕時向瀏覽器提供 {merchant} 的結帳指令碼。
- **Mintlify**：代管位於 docs.tablepro.app 的文件。
- **ip-api.com、ipinfo.io 和 geoplugin.net**：接收使用報告的 IP 位址以查詢國家。
- **GitHub**：託管更新摘要、外掛程式目錄和下載內容。

我們不出售個人資料，也不與廣告商分享。

## 國際傳輸 {#transfers}

以上服務在多個國家營運，因此您的資料可能在居住國之外處理。{merchant}、Google、GitHub、Cloudflare 和 Mintlify 在美國處理資料；Google 依據 EU-US Data Privacy Framework 和標準契約條款處理。在法律要求時，從歐洲經濟區和英國傳輸資料採用標準契約條款或其他獲准機制。

## 資料保留期限 {#retention}

- **使用報告**及其 IP 位址、國家：未設保留期限，也不會自動刪除。
- **授權紀錄**：已啟用 Mac 的 ID、名稱，以及包含 IP 位址的授權請求日誌，在授權存在期間保留，不會自動刪除。
- **訂單**：為稅務和會計用途保留。
- **Team Library**：直到重新發佈、移除發佈者或您要求刪除；授權結束後仍保留。
- **帳戶登入連結**：15 分鐘後到期並刪除。入口網站工作階段持續兩小時。
- **電子報**：直到取消訂閱或依您的要求刪除地址。
- **Google Analytics**：使用者層級與事件層級資料保留兩個月，即我們資源所用的 Google 預設期限。Cookie 最長保留兩年，或在拒絕時刪除。
- **Cloudflare Web Analytics**：向我們顯示最近六個月的網頁瀏覽彙總，不在瀏覽器中保存資訊。
- **線上聊天與支援郵件**：在 Crisp 和我們的信箱中保留至刪除。您可要求刪除對話和郵件。
- **網頁伺服器日誌**：為安全和問題排查保留，尚未設定固定期限。

## 您的權利 {#rights}

視居住地而定，您可以要求我們：

- 提供我們持有的個人資料副本（存取）；
- 更正資料（更正）；
- 刪除資料（刪除），法律要求保留的除外；
- 限制使用方式（限制）；
- 以結構化、機器可讀格式提供資料（可攜）；
- 停止基於正當利益使用資料（反對）。

您可隨時撤回同意，並向資料保護機關申訴。行使上述權利，請寄送郵件至 [{email}](mailto:{email})。我們會在 30 天內回應。資料刪除由人工處理，請告知相關電子郵件地址、授權金鑰或裝置。{merchant}、Google、Crisp 或 GitHub 持有的資料還適用其自身政策。

**加利福尼亞州居民**。California Consumer Privacy Act 賦予您了解我們收集哪些個人資訊、要求刪除、拒絕出售，以及不因行使這些權利而受到差別待遇的權利。我們不出售個人資訊。

## 兒童 {#children}

TablePro 不以十六歲以下兒童為對象，也不會在明知的情況下收集其個人資料。如您認為兒童向我們提供了個人資料，請聯絡，我們會刪除。

## 安全 {#security}

App、網站、帳戶入口網站與我們的伺服器之間使用 HTTPS。[使用情況報告](#mac-usage-report)中所述國家查詢為例外，使用未加密的 HTTP。帳戶登入連結僅以雜湊形式保存，系統存取限於營運 TablePro 的人員。沒有系統完全安全。回報弱點請寄送郵件至 [{email}](mailto:{email})。

## 政策變更 {#changes}

本政策變更時，我們會在此更新並註明新的「最後更新」日期；法律要求時，我們會直接通知您。

## 聯絡方式 {#contact}

如對隱私權或本政策有疑問，請寄送郵件至 [{email}](mailto:{email})。
