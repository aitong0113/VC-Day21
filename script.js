//------------------------------------------------------
// 🌤 今日心天氣 × 我的心天氣紀錄（整合版 script.js）
//------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    // 偵測是否是首頁或紀錄頁
    const isIndex = document.querySelector(".submit-btn") !== null;
    const isHistory = document.getElementById("historyOutput") !== null;

    //---------------------------------------------
    // 🆔 UUID + 匿名 userAlias
    //---------------------------------------------
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


    //---------------------------------------------
    // 📌 Checkbox values
    //---------------------------------------------
    function getCheckedValues(id) {
        return [...document.querySelectorAll(`#${id} input:checked`)].map(x => x.value);
    }

    //---------------------------------------------
    // 📌 AI-style 情緒語義分析
    //---------------------------------------------
    function analyzeTextEmotion(text) {
        if (!text) return { score: 0, inferred: [] };

        const t = text.toLowerCase();
        let score = 0;
        let out = [];

        const rules = [
            { kw: ["累", "疲"], score: -3, out: "明顯疲累" },
            { kw: ["緊", "僵"], score: -2, out: "肩頸緊" },
            { kw: ["暈", "頭重"], score: -2, out: "小頭暈" },
            { kw: ["悶", "壓"], score: -3, out: "胸悶" },
            { kw: ["焦"], score: -4, out: "焦慮" },
            { kw: ["煩"], score: -2, out: "小煩悶" },
            { kw: ["低落"], score: -3, out: "小低落" },
            { kw: ["哭", "淚"], score: -4, out: "想哭" },

            { kw: ["平靜", "ok", "還好"], score: +1, out: "平靜" },
            { kw: ["穩", "安定"], score: +2, out: "穩定" }
        ];

        rules.forEach(r => {
            r.kw.forEach(k => {
                if (t.includes(k)) {
                    score += r.score;
                    out.push(r.out);
                }
            });
        });

        return { score, inferred: out };
    }

    //------------------------------------------------------
    // 🌈 【首頁】啟動分析
    //------------------------------------------------------
    if (isIndex) {

        const btn = document.querySelector(".submit-btn");
        const resultBox = document.getElementById("result");
        const loadingText = document.getElementById("loadingText");
        const weatherOutput = document.getElementById("weatherOutput");

        // ⭐⭐⭐ 把這裡貼上你的 /exec ⭐⭐⭐
        const GAS_URL = "https://script.google.com/macros/s/AKfycbxmIG16QhFUhSBfyKUh7PF3IjVXHOrR6RzBKjAMQ4UVsxD-P2-AaYbOl6-C7YG0jSiatg/exec";

        btn.addEventListener("click", async () => {

            const sleep = Number(document.getElementById("sleep").value);
            if (!sleep && sleep !== 0) {
                resultBox.style.display = "block";
                loadingText.innerText = "🌧 請填寫睡眠分數唷～";
                return;
            }

            // Checkbox
            const body = getCheckedValues("body-group");
            const mood = getCheckedValues("mood-group");

            // Free text
            const bodyFree = document.getElementById("body-free").value;
            const moodFree = document.getElementById("mood-free").value;

            const bodyAI = analyzeTextEmotion(bodyFree);
            const moodAI = analyzeTextEmotion(moodFree);

            const finalBody = [...new Set([...body, ...bodyAI.inferred])];
            const finalMood = [...new Set([...mood, ...moodAI.inferred])];

            // ---------------- 分數 ----------------
            let score = sleep * 1.5;

            finalBody.forEach(b => {
                if (["明顯疲累", "胸悶"].includes(b)) score -= 4;
                if (["肩頸緊", "小頭暈"].includes(b)) score -= 2;
            });

            finalMood.forEach(m => {
                if (["明顯低落"].includes(m)) score -= 5;
                if (["小煩悶", "小低落"].includes(m)) score -= 2;
                if (["平靜"].includes(m)) score += 1;
                if (["穩定"].includes(m)) score += 2;
            });

            score += (bodyAI.score + moodAI.score) * 0.5;

            // ---------------- 天氣 ----------------
            let weather, reason, suggestion;

            if (score >= 12) {
                weather = "☀️ 晴朗";
                reason = "你今天能量很足！";
                suggestion = "適合創作、推進任務。";
            } else if (score >= 6) {
                weather = "🌤 微晴";
                reason = "今天狀態大致穩定。";
                suggestion = "做些輕量任務很適合。";
            } else if (score >= 1) {
                weather = "☁️ 陰";
                reason = "有些疲倦。";
                suggestion = "做簡單的事就好。";
            } else if (score >= -5) {
                weather = "🌧 小雨";
                reason = "狀態需要被接住。";
                suggestion = "好好休息一下。";
            } else {
                weather = "⛈ 暴雨";
                reason = "你承受很多。";
                suggestion = "停一下，照顧自己。";
            }

            // ---------------- 顯示 loading ----------------
            resultBox.style.display = "block";
            weatherOutput.style.display = "none";
            loadingText.style.display = "block";

            // ---------------- 📌 回傳到 Google Sheet ----------------
            const payload = {
                userAlias,
                sleep,
                body: finalBody,
                mood: finalMood,
                score,
                weather,
                reason,
                suggestion,
                note: moodFree + " / " + bodyFree
            };

            await fetch(GAS_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            // ---------------- 顯示結果 ----------------
            setTimeout(() => {
                loadingText.style.display = "none";
                weatherOutput.style.display = "block";

                weatherOutput.innerHTML = `
                    <div class="weather-card">
                        <div class="weather-tag">${weather}</div>
                        <p class="weather-text">${reason}</p>
                        <div class="weather-stats-box">
                            <p class="main-accent-title">⚡ 今日建議節奏</p>
                            <ul class="weather-advice"><li>${suggestion}</li></ul>
                        </div>
                        <p class="weather-end">我陪著你，不用一個人面對今天。</p>
                    </div>
                `;
            }, 900);
        });

        // ⭐ 開新分頁跳到紀錄頁
        const goHistory = document.getElementById("goHistory");
        if (goHistory) {
            goHistory.addEventListener("click", () => {
                window.open("history.html", "_blank");
            });
        }
    }

    //------------------------------------------------------
    // 📄 【紀錄頁】讀取 Google Sheet CSV
    //------------------------------------------------------
    if (isHistory) {

        const CSV_URL =
            "https://docs.google.com/spreadsheets/d/e/2PACX-1vReMWrHOhNT6Ia8CHhYBO7wWN7tADRCL8vFKJTAIwPnWOEwuZioYWEoOBX_bFY7pizn5VRpkRxpy29b/pub?output=csv";

        async function loadCSV() {
            const res = await fetch(CSV_URL);
            const text = await res.text();
            return text.split("\n").map(r => r.split(","));
        }

        async function renderHistory() {

            const rows = await loadCSV();
            const header = rows[0];
            const dataRows = rows.slice(1);

            const output = document.getElementById("historyOutput");

            const data = dataRows.filter(r => r[1] === userAlias);

            if (data.length === 0) {
                output.innerHTML = "<p class='placeholder'>目前沒有找到你的紀錄。</p>";
                return;
            }

            let html = "<table class='history-table'><tr>";
            header.forEach(h => html += `<th>${h}</th>`);
            html += "</tr>";

            data.forEach(row => {
                html += "<tr>";
                row.forEach(col => html += `<td>${col}</td>`);
                html += "</tr>";
            });

            html += "</table>";

            output.innerHTML = html;
        }

        renderHistory();
    }
});