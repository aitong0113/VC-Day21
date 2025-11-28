//------------------------------------------------------
// 🌤 今日心天氣（輸入頁）— 平衡後專業版
//------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    const isIndex = document.querySelector(".submit-btn") !== null;
    if (!isIndex) return;

    //------------------------------------------------------
    // 🆔 UUID + userAlias
    //------------------------------------------------------
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

    //------------------------------------------------------
    // 📌 Checkbox 工具
    //------------------------------------------------------
    function getCheckedValues(id) {
        return [...document.querySelectorAll(`#${id} input:checked`)].map(x => x.value);
    }

    //------------------------------------------------------
    // 📌 AI-style 語義分析（新版權重較輕）
    //------------------------------------------------------
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
    // 🌈 寫入 Google Sheet + 天氣判斷（新版平衡模型）
    //------------------------------------------------------

    const GAS_URL =
        "https://script.google.com/macros/s/AKfycbxmIG16QhFUhSBfyKUh7PF3IjVXHOrR6RzBKjAMQ4UVsxD-P2-AaYbOl6-C7YG0jSiatg/exec";

    const btn = document.querySelector(".submit-btn");
    const resultBox = document.getElementById("result");
    const weatherOutput = document.getElementById("weatherOutput");
    const loadingText = document.getElementById("loadingText");

    btn.addEventListener("click", async () => {

        const sleep = Number(document.getElementById("sleep").value);
        if (!sleep && sleep !== 0) {
            resultBox.style.display = "block";
            loadingText.innerText = "🌧 請填寫睡眠分數唷～";
            return;
        }

        const body = getCheckedValues("body-group");
        const mood = getCheckedValues("mood-group");

        const bodyFree = document.getElementById("body-free").value;
        const moodFree = document.getElementById("mood-free").value;

        const bodyAI = analyzeTextEmotion(bodyFree);
        const moodAI = analyzeTextEmotion(moodFree);

        const finalBody = [...new Set([...body, ...bodyAI.inferred])];
        const finalMood = [...new Set([...mood, ...moodAI.inferred])];

        //-------------------- 🌟 新分數計算 --------------------
        let score = sleep * 2;   // ⭐ 睡眠權重↑

        // ⭐ 身體負向扣分（溫和版）
        finalBody.forEach(b => {
            if (["明顯疲累", "胸悶"].includes(b)) score -= 2;
            if (["肩頸緊", "小頭暈"].includes(b)) score -= 1;
        });

        // ⭐ 心情負向扣分（較柔和）
        finalMood.forEach(m => {
            if (["明顯低落"].includes(m)) score -= 3;
            if (["小煩悶", "小低落"].includes(m)) score -= 1;
            if (["焦慮"].includes(m)) score -= 2;
            if (["平靜"].includes(m)) score += 1;
            if (["穩定"].includes(m)) score += 2;
        });

        // ⭐ AI 推測扣分減弱
        score += (bodyAI.score + moodAI.score) * 0.3;

        //-------------------- 🌟 新天氣模型 --------------------
        let weather, reason, suggestion;

        if (score >= 14) {
            weather = "☀️ 晴朗"; reason = "你的能量正在發光～"; suggestion = "適合推進計畫、創作、做想做的事。";
        } else if (score >= 8) {
            weather = "🌤 微晴"; reason = "整體狀態不錯。"; suggestion = "做一些輕量任務剛剛好。";
        } else if (score >= 3) {
            weather = "☁️ 陰"; reason = "今天有點內縮。"; suggestion = "放鬆節奏，做容易的事就好。";
        } else if (score >= -3) {
            weather = "🌧 小雨"; reason = "辛苦你了。"; suggestion = "今天適合被接住、溫柔照顧自己。";
        } else {
            weather = "⛈ 暴雨"; reason = "你承受真的很多。"; suggestion = "停一下，好好保護自己的狀態。";
        }

        //-------------------- UI Loading --------------------
        resultBox.style.display = "block";
        loadingText.style.display = "block";
        weatherOutput.style.display = "none";

        //-------------------- ⭐ 寫入 Google Sheet --------------------
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

        //-------------------- 顯示結果 --------------------
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

});
