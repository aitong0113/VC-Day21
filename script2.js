//------------------------------------------------------
// 心天氣紀錄（最終穩定版）
//------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    // UUID（每台手機都會不同）
    function getUUID() {
        let id = localStorage.getItem("myUUID");
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("myUUID", id);
        }
        return id;
    }

    // userX（每台裝置都會獨立）
    function getUserAlias() {
        const uuid = getUUID();
        let map = JSON.parse(localStorage.getItem("userMap") || "{}");

        if (!map[uuid]) {
            const next = Object.keys(map).length + 1;
            map[uuid] = `user${next}`;
            localStorage.setItem("userMap", JSON.stringify(map));
        }
        return map[uuid];
    }

    const userAlias = getUserAlias();


    //---------------------------------------------------
    // 📄 你的 CSV URL
    //---------------------------------------------------
    const CSV_URL =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vReMWrHOhNT6Ia8CHhYBO7wWN7tADRCL8vFKJTAIwPnWOEwuZioYWEoOBX_bFY7pizn5VRpkRxpy29b/pub?output=csv";


    async function loadCSV() {
        const res = await fetch(CSV_URL);
        const text = await res.text();

        return text
            .trim()
            .split("\n")
            .map(r => r.split(",").map(c => (c || "").trim()));
    }


    async function renderHistory() {
        const rows = await loadCSV();
        const header = rows[0];       // 表頭
        const dataRows = rows.slice(1);

        const output = document.getElementById("historyOutput");

        // ⭐ 過濾 userId（第 2 欄 index=1）
        const myData = dataRows.filter(r => (r[1] || "").trim() === userAlias.trim());

        if (myData.length === 0) {
            output.innerHTML = "<p class='placeholder'>目前沒有找到你的紀錄。</p>";
            return;
        }

        //------------------------------
        // 🖥 桌面版表格
        //------------------------------
        let html = "<table class='history-table'><tr>";
        header.forEach(h => html += `<th>${h}</th>`);
        html += "</tr>";

        myData.forEach(row => {
            html += "<tr>";

            row.forEach((col, i) => {
                col = (col || "").replace(/\n/g, "").trim();
                if (!col) col = "-";     // 空白補 "-"

                let cls = "";
                if (i === 5) cls = "score-cell"; // score 欄固定不換行

                html += `<td class="${cls}">${col}</td>`;
            });

            html += "</tr>";
        });

        html += "</table>";
        output.innerHTML = html;

        //------------------------------
        // 📱 手機卡片
        //------------------------------
        renderMobileCards(myData, header);
    }

    renderHistory();
});


//------------------------------------------------------
// 📱 手機卡片渲染（最終安全版）
//------------------------------------------------------

function renderMobileCards(rows, header) {

    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    if (!isMobile) return;

    const wrapper = document.querySelector(".history-table-wrapper");

    const cardList = document.createElement("div");
    cardList.className = "history-card-list";

    rows.forEach(r => {
        const card = document.createElement("div");
        card.className = "history-card";

        // 將資料變成物件（key = 表頭）
        const o = {};
        header.forEach((h, i) => {
            o[h] = (r[i] || "-").trim() || "-";
        });

        // ✨ 安全取得欄位：不存在就 "-"
        const t = (key) => o[key] ?? "-";

        card.innerHTML = `
            <div class="row"><span class="label">時間</span><span class="value">${t("timestamp")}</span></div>
            <div class="row"><span class="label">睡眠</span><span class="value">${t("sleep")}</span></div>
            <div class="row"><span class="label">身體</span><span class="value">${t("body")}</span></div>
            <div class="row"><span class="label">心情</span><span class="value">${t("mood")}</span></div>
            <div class="row score"><span class="label">分數</span><span class="value">${t("score")}</span></div>

            <div class="row"><span class="label">天氣</span><span class="value">${t("weather")}</span></div>
            <div class="row"><span class="label">狀態解讀</span><span class="value">${t("reason")}</span></div>
            <div class="row"><span class="label">今日建議</span><span class="value">${t("suggestion")}</span></div>
            <div class="row"><span class="label">補充紀錄</span><span class="value">${t("note")}</span></div>
        `;

        cardList.appendChild(card);
    });

    wrapper.appendChild(cardList);
}