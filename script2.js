//------------------------------------------------------
// 📘 心天氣紀錄（最終穩定整合版）
//------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    //---------------------------------------------------
    // 🆔 UUID（每台裝置固定不同）
    //---------------------------------------------------
    function getUUID() {
        let id = localStorage.getItem("myUUID");
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("myUUID", id);
        }
        return id;
    }

    //---------------------------------------------------
    // ⭐ userX（每台裝置只有一個 user 編號）
    //---------------------------------------------------
    function getUserAlias() {
        const uuid = getUUID();
        let map = JSON.parse(localStorage.getItem("userMap") || "{}");

        if (!map[uuid]) {
            const next = Object.keys(map).length + 1;
            map[uuid] = `user${next}`;   // user1 / user2 / user3…
            localStorage.setItem("userMap", JSON.stringify(map));
        }
        return map[uuid];
    }

    const userAlias = getUserAlias(); // ⭐ 與輸入頁一致


    //---------------------------------------------------
    // 📄 CSV URL（記得更新成你自己的）
    //---------------------------------------------------
    const CSV_URL =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSVuma4D1e-wojt__hQyH-BySTz2RdihXOHmU7JXuoAD4zfqy2tHgV5hz5F4x-OQv13IXej2kxSI7Vt/pub?output=csv";


    //---------------------------------------------------
    // 📥 讀取 CSV
    //---------------------------------------------------
    async function loadCSV() {
        const res = await fetch(CSV_URL, { cache: "no-store" });
        const text = await res.text();

        return text
            .trim()
            .split("\n")
            .map(r => r.split(",").map(c => (c || "").trim()));
    }


    //---------------------------------------------------
    // 📌 渲染紀錄
    //---------------------------------------------------
    async function renderHistory() {

        const rows = await loadCSV();
        const header = rows[0];
        const dataRows = rows.slice(1);

        const output = document.getElementById("historyOutput");

        // ⭐ 找出自己的 userId（第 2 欄＝ index 1）
        const myData = dataRows.filter(
            r => (r[1] || "").trim() === userAlias.trim()
        );

        if (myData.length === 0) {
            output.innerHTML =
                "<p class='placeholder'>目前沒有找到你的紀錄。</p>";
            return;
        }

        //---------------------------------------------------
        // 🖥 桌面版表格
        //---------------------------------------------------
        let html = "<table class='history-table'><tr>";
        header.forEach(h => (html += `<th>${h}</th>`));
        html += "</tr>";

        myData.forEach(row => {
            html += "<tr>";

            row.forEach((col, i) => {
                col = (col || "").replace(/\n/g, "").trim() || "-";

                let cls = "";
                if (i === 5) cls = "score-cell"; // 分數欄高亮

                html += `<td class="${cls}">${col}</td>`;
            });

            html += "</tr>";
        });

        html += "</table>";
        output.innerHTML = html;

        //---------------------------------------------------
        // 📱 手機版卡片
        //---------------------------------------------------
        renderMobileCards(myData, header);
    }

    renderHistory();
});


//------------------------------------------------------
// 📱 手機卡片渲染
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

        // 轉成物件格式（header → value）
        const o = {};
        header.forEach((h, i) => {
            o[h] = (r[i] || "-").trim() || "-";
        });

        const t = key => o[key] ?? "-"; // 安全取值


        card.innerHTML = `
            <div class="row"><span class="label">時間</span><span class="value">${t("timestamp")}</span></div>
            <div class="row"><span class="label">睡眠</span><span class="value">${t("sleep")}</span></div>
            <div class="row"><span class="label">身體</span><span class="value">${t("body")}</span></div>
            <div class="row"><span class="label">心情</span><span class="value">${t("mood")}</span></div>
            <div class="row score"><span class="label">分數</span><span class="value">${t("score")}</span></div>
            <div class="row"><span class="label">天氣</span><span class="value">${t("weather")}</span></div>
            <div class="row"><span class="label">狀態解讀</span><span class="value">${t("insight")}</span></div>
            <div class="row"><span class="label">今日建議</span><span class="value">${t("suggestion")}</span></div>
            <div class="row"><span class="label">補充紀錄</span><span class="value">${t("note")}</span></div>
        `;

        cardList.appendChild(card);
    });

    wrapper.appendChild(cardList);
}
