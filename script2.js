//------------------------------------------------------
// 「心天氣紀錄」純淨版 script.js
//------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    // ---------------------------------------------------
    // 🆔 UUID + userAlias（個人識別碼）
    // ---------------------------------------------------
    function getUUID() {
        let id = localStorage.getItem("myUUID");
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("myUUID", id);
        }
        return id;
    }

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


    // ---------------------------------------------------
    // 📄【紀錄頁】讀取 CSV（trim 修復版）
    // ---------------------------------------------------

    const CSV_URL =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vReMWrHOhNT6Ia8CHhYBO7wWN7tADRCL8vFKJTAIwPnWOEwuZioYWEoOBX_bFY7pizn5VRpkRxpy29b/pub?output=csv";

    async function loadCSV() {
        const res = await fetch(CSV_URL);
        const text = await res.text();

        return text
            .trim()
            .split("\n")
            .map(r =>
                r.split(",").map(c => (c || "").trim()) // 清洗字元
            );
    }

    async function renderHistory() {
        const rows = await loadCSV();
        const header = rows[0];
        const dataRows = rows.slice(1);

        const output = document.getElementById("historyOutput");

        // 使用 trim 避免 CSV 隱藏字元問題
        const myData = dataRows.filter(
            r => (r[1] || "").trim() === userAlias.trim()
        );

        if (myData.length === 0) {
            output.innerHTML = "<p class='placeholder'>目前沒有找到你的紀錄。</p>";
            return;
        }

        // ---- 桌面版表格 ----
        let html = "<table class='history-table'><tr>";
        header.forEach(h => html += `<th>${h}</th>`);
        html += "</tr>";

        myData.forEach(row => {
            html += "<tr>";
            row.forEach(col => html += `<td>${col}</td>`);
            html += "</tr>";
        });

        html += "</table>";

        output.innerHTML = html;

        // ---- 手機卡片模式 ----
        renderMobileCards(myData, header);
    }

    renderHistory();
});



// -------------------------------------------------------
// 📱 手機卡片渲染器（獨立純淨版）
// -------------------------------------------------------
function isMobileView() {
    const flag = getComputedStyle(document.body).getPropertyValue("--mobile-flag");
    return flag.trim() === "true";
}


function renderMobileCards(rows, header) {

    // 📌 使用 CSS RWD 的 matchMedia 判斷手機
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    if (!isMobile) return;

    const wrapper = document.querySelector(".history-table-wrapper");
    const cardList = document.createElement("div");
    cardList.className = "history-card-list";

    rows.forEach(r => {
        const card = document.createElement("div");
        card.className = "history-card";

        const o = {};
        header.forEach((h, i) => (o[h] = r[i]));

        card.innerHTML = `
            <div class="row"><span class="label">時間</span><span>${o.timestamp}</span></div>
            <div class="row"><span class="label">睡眠</span><span>${o.sleep}</span></div>
            <div class="row"><span class="label">身體</span><span>${o.body}</span></div>
            <div class="row"><span class="label">心情</span><span>${o.mood}</span></div>
            <div class="row"><span class="label">分數</span><span>${o.score}</span></div>
            <div class="row"><span class="label">天氣</span><span class="weather">${o.weather}</span></div>
            <div class="row"><span class="label">建議</span><span>${o.suggestion}</span></div>
        `;

        cardList.appendChild(card);
    });

    wrapper.appendChild(cardList);
}