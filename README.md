🌤️ 今日心天氣（Today’s Inner Weather）

一個以 情緒 × 天氣隱喻 打造的療癒系 Web 小工具。
使用者可以依照當下狀態選擇「今日心情天氣」，系統會回傳對應的建議節奏，並自動保存個人紀錄。
此版本已特別針對 手機版排版、卡片樣式、主題色一致性 做完整優化。

⸻

📌 專案介紹（Overview）

「今日心天氣」是一款以 self-care、情緒覺察 為主題的前端作品，使用者可以：
	•	評估今日睡眠、身體狀態、情緒狀態
	•	自由輸入心情文字（系統會額外分析）
	•	取得專屬「心天氣」：晴朗／微晴／陰／小雨／暴雨
	•	查看「心天氣建議節奏」
	•	自動寫入 Google Sheet（後端資料庫）
	•	在「我的心天氣紀錄」頁面中查看自己的歷史紀錄

整個網站僅使用 前端技術 + Apps Script 無後端架構 即可完成資料儲存與呈現。

⸻

🛠 技術架構（Tech Stack）

Frontend
	•	HTML5
	•	CSS3（客製化 UI 樣式）
	•	JavaScript（邏輯運算、UUID、fetch、資料處理）

Backend / Database
	•	Google Apps Script（接收 POST）
	•	Google Sheet（資料儲存）
	•	CSV 讀取解析（history 頁面）

Other
	•	UUID（localStorage 建立個人識別碼）
	•	無伺服器資料儲存架構
	•	RWD 手機版設計

⸻

🧠 核心功能（Features）

1. 心天氣生成器

根據使用者的：
	•	睡眠分數
	•	身體狀態（checkbox）
	•	情緒狀態（checkbox）
	•	自由輸入語句（自動語意判讀）

計算出心天氣分數 → 轉換成 5 種天氣。

2. AI-style 情緒語意分析

非模型，而是利用語義規則判斷使用者文字中的情緒訊號，例如：

Keyword	Tag	Score
累、疲	明顯疲累	-3
焦	焦慮	-4
平靜、ok	平靜	+1
穩、安定	穩定	+2

讓「自由輸入」也影響當日心天氣。

3. 個人化 UUID → userAlias

首次進入網站會建立：

localStorage.myUUID
localStorage.userMap

每位使用者都會被分配成 user1 / user2 / user3…
用於 Google Sheet 資料區隔。

4. 心天氣紀錄頁（History Page）
	•	從公開 CSV 讀取 Google Sheet
	•	依照 userAlias 過濾資料
	•	以表格形式呈現完整記錄

⸻

📂 專案結構（Project Structure）

VC-Day21/
│
├── index.html        # 今日心天氣首頁
├── history.html      # 歷史紀錄頁
├── style.css         # 主樣式
├── script.js         # JS 主程式（分析＋寫入＋讀取）
└── /images           # 圖片資源（如 icon）


⸻

🚀 使用方式（How to Use）

	1.	在首頁輸入睡眠、身體狀態、情緒狀態
	2.	填寫自由輸入欄位（可觸發 AI-style 分析）
	3.	點選「查看今天的心天氣」
	4.	取得今日心天氣＋節奏建議
	5.	資料會自動寫入 Google Sheet
	6.	點選「查看心天氣紀錄」→ 進入歷史頁面查看完整紀錄


⸻
⸻

🌐 Demo 網址（GitHub Pages）

👉 https://aitong0113.github.io/VC-Day21/


⸻

✍️ 作者（Author）

Abbie Lin ｜ Frontend & UI/UX Designer

跨心理 × 設計 × 前端的創作者。

💌 GitHub: https://github.com/aitong0113

