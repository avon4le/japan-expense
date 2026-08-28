# 🗾 日本旅遊記帳（單檔版）

跟爸爸去日本旅遊用的記帳 App。手機瀏覽器直接開就能用：手動輸入、拍收據 / Suica 截圖辨識、
自動換算台幣、分帳結算、圖表、匯出 CSV / JSON。

- **App 只有一個檔案**：`index.html`（HTML + CSS + JavaScript 全包），沒有安裝、沒有建置步驟。
- **記帳資料存在你手機瀏覽器**（localStorage），不會上傳任何地方。
- **拍照辨識**走「中繼站」呼叫 Google Gemini（因為台灣的電信網路會擋掉瀏覽器直接連 Google AI）。
- **配色**內建 6 種主題，隨時可換（頂端 🎨 或設定頁），不影響資料。

> **目前狀態**：已部署完成、拍照辨識可用。
> App 版本標記在「設定」頁最底部（例如 `版本 2026-08-28b`），可用來確認有沒有拿到最新檔。

---

## 架構（這三塊怎麼串起來）

```
 手機/電腦瀏覽器
   │  打開 App 網頁
   ▼
 GitHub Pages  ── https://<你的GH帳號>.github.io/japan-expense/
   （只放一個 index.html 靜態檔，免費）
   │
   │  拍照辨識時，App 把壓縮後的圖 POST 到 ↓
   ▼
 Cloudflare Worker 中繼站 ── https://japan-receipt-proxy.<你的CF帳號>.workers.dev
   （Gemini 金鑰藏在這裡，免費，繞過電信網路對「瀏覽器→Google」的封鎖）
   │
   ▼
 Google Gemini API（模型 gemini-3.6-flash，免費額度每天約 1500 次）
```

記帳資料**完全不經過**上面任何一段，只待在你這支手機的瀏覽器裡。

---

## 一、放上線（GitHub Pages，免費、不用信用卡）

做完會得到網址 `https://<你的帳號>.github.io/japan-expense/`。

1. **GitHub 帳號**：<https://github.com/> → Sign up / Sign in
2. **建 repository**：右上 ＋ → New repository → 名稱 `japan-expense` → **Public** → 勾 Add a README file → Create
3. **上傳**：repo 頁 → Add file → Upload files → 拖入 `index.html` → **Commit changes**
4. **開 Pages**：repo → Settings → 左側 Pages → Source 選 *Deploy from a branch* → Branch `main` / `/(root)` → Save
5. 等 1～3 分鐘，重新整理 Pages 頁，上面出現網址 → 點開看到記帳畫面就成功

### 之後要更新 App

1. 把新的 `index.html` 存到電腦
2. repo → Add file → Upload files → 拖入覆蓋 → **Commit changes**
3. 等 1～3 分鐘 → 開網頁按 **Ctrl + Shift + R**（電腦）強制刷新
4. 設定頁最底部確認「版本」字串是新的
5. 手機：關掉 App 分頁重開；主畫面 App 有時要移除重加

> 不用再在網址加 `?v=數字`，那只是改版過程中的臨時招數。用乾淨網址即可。

---

## 二、架中繼站（Cloudflare Workers，免費、不用信用卡，約 10 分鐘）

**為什麼一定要**：台灣的電信網路（家用 + 行動都一樣）會間歇性擋掉「瀏覽器直接 POST 到 Google AI」，
造成一直「連線逾時」。中繼站在伺服器上跑，不受這個限制。金鑰也藏在中繼站裡，不進網頁。

### 步驟

1. **註冊**：<https://dash.cloudflare.com/sign-up> → email 註冊、驗證、登入
2. **建 Worker**：左側 **Compute** → Workers & Pages → **Create application** → **Start with Hello World!**
   → 名稱 `japan-receipt-proxy` → Deploy
3. **貼程式碼**：部署後進 **Edit code** → 編輯器內容全刪 → 貼上 `cloudflare-worker.js` 全部內容
4. **填金鑰**：把第一行 `const GEMINI_KEY = "貼上你的_AIza_開頭金鑰";` 引號中間換成你的 Gemini 金鑰
5. 右上 **Deploy**
6. **拿網址**：Worker 頁面顯示 `https://japan-receipt-proxy.<你的帳號>.workers.dev`
   → 貼到瀏覽器開，看到 `API relay. Use POST.` 就代表活著

### 申請 Gemini 金鑰（貼進 Worker 用）

1. <https://aistudio.google.com/apikey> → Google 帳號登入 → 同意條款
2. **Create API key** → **Create API key in a new project**（一定要「新專案」，用既有的可能綁到付費方案）
3. 複製 `AIza...` 那串 → 貼到 Worker 第 1 行
4. （建議）到金鑰設定頁把用途限制成只有 *Generative Language API*

### 之後要換金鑰

Cloudflare → Worker `japan-receipt-proxy` → Edit code → 改 `GEMINI_KEY` 那行 → Deploy。
（App 不用動）

---

## 三、把中繼站填進 App

1. App → 設定 → **📷 拍照辨識**
2. **中繼站網址** 欄貼 `https://japan-receipt-proxy.<你的帳號>.workers.dev`
3. 「API 金鑰」欄**留空**（金鑰在中繼站裡）
4. 按 **測試連線是否可用** → 看到「✅ 中繼站正常！」
5. 每一支裝置 / 每個瀏覽器都要各填一次（設定存在該瀏覽器本機）

---

## 四、裝到手機主畫面

- **iPhone**：一定用 **Safari** 開乾淨網址 → 分享鈕 ⬆️ → 加入主畫面 → 加入
  - 加完打開主畫面圖示 → 設定 → 若中繼站網址空白，再貼一次
- **Android**：Chrome 開 → ⋮ → 加到主畫面 / 安裝應用程式

---

## 五、日常使用

- **記一筆**：下方 **＋**。只有「金額、分類」必填。
- **拍照辨識**：記一筆畫面上方 **📷** → 選收據照 / Suica 截圖
  - 收據 → 自動填金額、店名、分類，**確認後再存**
  - Suica 截圖 → 列出多筆，勾選要的，可改金額，一次加入
- **分帳**：每筆選「付款人（爸爸/我）」+「分攤（平分/個人）」→ 首頁顯示誰要還誰多少
- **匯率**：設定 → 匯率。每筆記下當時匯率；回國可改實際匯率後按「用目前匯率重算全部」
- **匯出**：設定 → 資料備份 → **匯出 CSV**（Excel 可開）。**建議每天匯出一次備份。**
- **換手機**：舊機「匯出 JSON 備份」（含中繼站網址等設定）→ 新機「從 JSON 備份還原」

---

## 六、以後想調整 / 優化（改哪裡）

大部分東西**在 App 設定頁就能改，不用碰程式碼**：

| 想改的東西 | 怎麼做 |
|---|---|
| 分類、城市、快速記帳按鈕、預算、預設付款人 | 設定頁直接改 |
| 配色主題 / 自訂主色 / 深色模式 | 設定頁「配色主題」或頂端 🎨 |
| 匯率 | 設定頁「匯率」 |
| 辨識模型（想試更快 / 更準） | 設定頁「辨識模型」：`gemini-3.6-flash`(預設，免費額度多) / `gemini-3.5-flash` / `gemini-3.7-flash`(最新但免費每天僅約 20 次) |
| PIN 碼鎖 | 設定頁 |

要動程式碼（`index.html`）時，這些位置可以找：

| 想做的事 | 在 `index.html` 找 |
|---|---|
| 加 / 改欄位（例如加「發票號碼」） | `openEntryModal()` 的表單、`rowHtml()` / `entryHtml()` 顯示、CSV 匯出的 `cols` |
| 改 AI 辨識抓什麼（例如多抓稅額、改分類清單） | 常數 `RECEIPT_PROMPT` 那段中文提示 |
| 改辨識圖片解析度 / 畫質（辨識更準 vs 更省流量） | `fileToJpegBase64(file, shortTarget=1100, longMax=4000, quality=0.8)` 的三個數字 |
| 改「連線失敗重試」次數 / 等待 / 逾時 | `postWithRetry(...)` 的 `tries` / `waits` / `timeoutMs` |
| 改預設值（匯率、分類、快速按鈕…出廠設定） | 常數 `DEFAULT_STATE` |
| 加新配色主題 | 常數 `PALETTES`，照現有一組的格式加（要 light/dark 兩套 + chart 顏色 + icon） |
| 改版本標記 | 搜尋 `版本 2026-`（每次改版建議把日期/字母往後跳，方便確認有沒有拿到新版） |
| 穩定版 / 測試版的判斷、獨立資料 | 檔案最前面 `IS_BETA` / `LS_KEY`（見下一節） |
| 中繼站行為（例如加防濫用、記錄用量） | `cloudflare-worker.js`，改完在 Cloudflare 重新 Deploy |

改完流程都一樣：存檔 → 上傳 GitHub 覆蓋 → Commit → 等一下 → 強制刷新。
（或把想要的改動告訴 Claude，讓它改好新的 `index.html` 給你覆蓋。）

---

## 七、穩定版 / 測試版（改新功能又不怕改壞）

App 內建了「測試版」機制：**檔名含 `beta` 就自動變測試版** ——
用**獨立的資料儲存空間**（不會碰到你的正式旅行資料），頂端顯示「🧪 測試版」標記。

### 做法

同一個 repo 裡放兩個檔：

| 檔名 | 網址 | 用途 |
|---|---|---|
| `index.html` | `https://<帳號>.github.io/japan-expense/` | **穩定版**，你每天用的、加到手機主畫面的 |
| `beta.html` | `https://<帳號>.github.io/japan-expense/beta.html` | **測試版**，試新功能用 |

### 流程

1. **開新功能**：把目前的 `index.html` 複製一份、改名 `beta.html`，上傳到 repo（兩個檔並存）
2. 要改東西時，**只改 `beta.html`**，上傳 → 開 `.../beta.html` 測（會看到 🧪 標記、資料是空的獨立一份）
3. 想用正式資料測 → 穩定版「匯出 JSON」→ 測試版「從 JSON 備份還原」（互不影響）
4. **測到滿意** → 把 `beta.html` 的內容整個複製，覆蓋 `index.html` 上傳 → 穩定版就升級了
5. `beta.html` 可以留著，下次改再從穩定版重新複製一份覆蓋它

### 重點

- 兩個檔的**記帳資料完全分開**（`jp-expense-v1` vs `jp-expense-beta`），測試版壞掉也動不到正式資料
- 穩定版 `index.html` **只在「promote 測試版」時才動**，平常不碰 → 你手機上的 App 永遠是穩的
- 兩個都可以指向**同一個中繼站**，不用架第二個

---

## 八、疑難排解

| 症狀 | 原因 / 處理 |
|---|---|
| 辨識失敗，訊息有 `quota` / `exceeded` / `limit: 20` | 免費額度用完。若模型是 `gemini-3.7-flash` → 換 `gemini-3.6-flash`（每天 1500 次）。額度按**太平洋時間**每天重置。 |
| 一直「連線逾時（30/45 秒沒回應）」 | 網路在擋 POST。① 確認有填**中繼站網址**、不是直連 ② 多按幾次測試（會自動重試）③ 換網路 / 換時段 ④ 都不行 → 把中繼站換到非 `workers.dev` 的自訂網域 |
| `測試連線` 說「中繼站有回應但出錯」 | 中繼站連得到，是它裡面的金鑰有問題 → 檢查 Worker 第 1 行金鑰、或該金鑰的專案是否綁到沒錢的付費方案（重開一個新專案的金鑰） |
| 中繼站網址 / 設定「不見了」 | 設定存在**該瀏覽器本機**。用了無痕視窗、換了瀏覽器、iOS 主畫面 App 與 Safari 分開儲存 → 都會這樣。正式用一律用「一般的 Safari / Chrome」；主畫面 App 內再貼一次即可。用「匯出 JSON」備份可避免重貼。 |
| 換了新版還是舊畫面 | 等 3 分鐘 → `Ctrl + Shift + R`（電腦）→ 看設定頁底部版本字串。手機把分頁關掉重開。 |
| 直接開網址看到 `API relay. Use POST.` | 正常，代表中繼站活著（那是它對 GET 的回應）。 |

---

## 檔案清單

| 檔案 | 說明 |
|---|---|
| `index.html` | 整個 App（穩定版）。上傳到 GitHub 的就是這個。 |
| `beta.html` | *（可選）* 從 `index.html` 複製改名而來的測試版，自動用獨立資料。見第七節。 |
| `cloudflare-worker.js` | 中繼站程式碼。貼到 Cloudflare Worker 用（記得填金鑰）。 |
| `README.md` | 這份說明。 |
