//------------------------------------------------------
// 🌤 今日心天氣（輸入頁）—「最貼近真人狀態」最終模型版
//------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    const isIndex = document.querySelector(".submit-btn") !== null;
    if (!isIndex) return;

    //------------------------------------------------------
    // 🆔 UUID + userAlias（個人識別碼）
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
    // 📌 AI 語義分析（輕權重）
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
    // 🌈 分析 + 寫入 Google Sheet
    //------------------------------------------------------

    const GAS_URL =
        "https://script.google.com/macros/s/AKfycbxmIG16QhFUhSBfyKUh7PF3IjVXHOrR6RzBKjAMQ4UVsxD-P2-AaYbOl6-C7YG0jSiatg/exec";

    const btn = document.querySelector(".submit-btn");
    const resultBox = document.getElementById("result");
    const weatherOutput = document.getElementById("weatherOutput");
    const loadingText = document.getElementById("loadingText");

    btn.addEventListener("click", async () => {

        //------------------------------------------------------
        // 🔸 基本欄位：睡眠
        //------------------------------------------------------
        const sleep = Number(document.getElementById("sleep").value);

        if (!sleep && sleep !== 0) {
            resultBox.style.display = "block";
            loadingText.innerText = "🌧 請填寫睡眠分數唷～";
            return;
        }

        //------------------------------------------------------
        // 🔸 Checkbox + 自由輸入
        //------------------------------------------------------
        const body = getCheckedValues("body-group");
        const mood = getCheckedValues("mood-group");

        const bodyFree = document.getElementById("body-free").value.trim();
        const moodFree = document.getElementById("mood-free").value.trim();
        const directionFree = document.getElementById("direction-free").value.trim();

        // AI 推論
        const bodyAI = analyzeTextEmotion(bodyFree);
        const moodAI = analyzeTextEmotion(moodFree);

        // 合併 + 去重複
        const finalBody = [...new Set([...body, ...bodyAI.inferred])];
        const finalMood = [...new Set([...mood, ...moodAI.inferred])];


        //------------------------------------------------------
        // ⭐ 1. 睡眠分數
        //------------------------------------------------------
        let score = 0;

        if (sleep >= 7) score += 10;
        else if (sleep === 6) score += 8;
        else if (sleep === 5) score += 5;
        else if (sleep === 4) score += 2;
        else if (sleep === 3) score += 0;
        else if (sleep === 2) score -= 2;
        else if (sleep === 1) score -= 4;
        else if (sleep === 0) score -= 6;


        //------------------------------------------------------
        // ⭐ 2. 身體扣分
        //------------------------------------------------------
        finalBody.forEach(b => {
            if (["明顯疲累", "胸悶"].includes(b)) score -= 2;
            if (["肩頸緊", "小頭暈"].includes(b)) score -= 1;
        });

        //------------------------------------------------------
        // ⭐ 3. 心情扣分 / 加分
        //------------------------------------------------------
        finalMood.forEach(m => {
            if (m === "明顯低落") score -= 3;
            if (m === "想哭") score -= 3;
            if (["小低落", "小煩悶"].includes(m)) score -= 1;
            if (m === "焦慮") score -= 2;

            if (m === "平靜") score += 2;
            if (m === "穩定") score += 3;
        });

        //------------------------------------------------------
        // ⭐ 4. AI 自由輸入推論
        //------------------------------------------------------
        score += (bodyAI.score + moodAI.score) * 0.2;


        //------------------------------------------------------
        // ⭐ 5. 天氣分類
        //------------------------------------------------------
        let weather, reason, suggestion;

        if (score >= 12) {
            weather = "☀️ 晴朗";
            reason = "你的能量正在發光～";
            suggestion = "適合推進計畫、創作、開展新的可能。";
        } else if (score >= 7) {
            weather = "🌤 微晴";
            reason = "你的狀態不錯。";
            suggestion = "做一些輕量任務剛剛好。";
        } else if (score >= 3) {
            weather = "☁️ 陰";
            reason = "身體或心有些內縮。";
            suggestion = "放鬆節奏，選擇容易做的事。";
        } else if (score >= -3) {
            weather = "🌧 小雨";
            reason = "今天有點辛苦，你值得被溫柔看見。";
            suggestion = "好好休息一下，補充能量。";
        } else {
            weather = "⛈ 暴雨";
            reason = "你承受了很多，需要被好好接住。";
            suggestion = "停一下，好好照顧自己。";
        }


        //------------------------------------------------------
        // ⭐ UI Loading 動畫
        //------------------------------------------------------
        resultBox.style.display = "block";
        loadingText.style.display = "block";
        weatherOutput.style.display = "none";


        //------------------------------------------------------
        // ⭐ note 整合自由輸入（空白→ "-"）
        //------------------------------------------------------
        const finalNote =
            [bodyFree, moodFree, directionFree]
                .filter(x => x && x.trim() !== "")
                .join(" / ") || "-";


        //------------------------------------------------------
        // ⭐ 寫入 Google Sheet
        //------------------------------------------------------
        const payload = {
            userId: userAlias,
            sleep,
            body: finalBody.length ? finalBody.join("、") : "-",
            mood: finalMood.length ? finalMood.join("、") : "-",
            score,
            weather,
            reason,
            suggestion,
            note: finalNote
        };

        await fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });


        //------------------------------------------------------
        // ⭐ 顯示結果（0.9 秒後）
        //------------------------------------------------------
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