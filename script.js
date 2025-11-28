//-----------------------------------------
// 🌤 今日心天氣 · AI 智能版（工程師重構版）
//-----------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    //-----------------------------------------
    // 📌 DOM 統一集中管理
    //-----------------------------------------
    const DOM = {
        btn: document.querySelector(".submit-btn"),
        resultBox: document.getElementById("result"),
        loading: document.getElementById("loadingText"),
        output: document.getElementById("weatherOutput"),

        sleep: document.getElementById("sleep"),
        bodyFree: document.getElementById("body-free"),
        moodFree: document.getElementById("mood-free"),
    };

    //-----------------------------------------
    // 📌 Checkbox 工具
    //-----------------------------------------
    const getChecked = id =>
        [...document.querySelectorAll(`#${id} input[type="checkbox"]:checked`)]
            .map(el => el.value);

    //-----------------------------------------
    // 📌 合併工具（去重）
    //-----------------------------------------
    const mergeUnique = (a, b) => [...new Set([...a, ...b])];

    //-----------------------------------------
    // 📌 AI 弱語意模型（資料集中管理）
    //-----------------------------------------
    const EMOTION_RULES = [
        { kw: ["累", "疲", "倦", "撐"], score: -3, out: "明顯疲累" },
        { kw: ["緊", "僵"], score: -2, out: "肩頸緊" },
        { kw: ["暈", "頭重"], score: -2, out: "小頭暈" },
        { kw: ["悶", "壓"], score: -3, out: "胸悶" },
        { kw: ["焦", "不安"], score: -4, out: "焦慮" },
        { kw: ["煩"], score: -2, out: "小煩悶" },
        { kw: ["低落", "難過"], score: -3, out: "小低落" },
        { kw: ["哭", "淚"], score: -4, out: "想哭" },
        { kw: ["亂", "爆掉", "不穩"], score: -5, out: "情緒不穩" },

        // 正向
        { kw: ["還好", "平靜", "ok", "可以"], score: +2, out: "平靜" },
        { kw: ["穩", "安定"], score: +3, out: "穩定" },
    ];

    //-----------------------------------------
    // 📌 AI 語意分析
    //-----------------------------------------
    function analyzeEmotion(text) {
        if (!text) return { score: 0, inferred: [] };

        let score = 0;
        let inferred = [];
        const t = text.toLowerCase();

        EMOTION_RULES.forEach(rule => {
            rule.kw.forEach(k => {
                if (t.includes(k)) {
                    score += rule.score;
                    inferred.push(rule.out);
                }
            });
        });

        return { score, inferred };
    }

    //-----------------------------------------
    // ⭐ 分數計算（拆成小 Functions）
    //-----------------------------------------

    function calcSleepScore(sleep) {
        return sleep * 2; // 中性 5 → 10 分
    }

    function calcBodyScore(list) {
        let score = 0;
        list.forEach(item => {
            if (["明顯疲累", "胸悶"].includes(item)) score -= 3;
            if (["肩頸緊", "小頭暈", "反覆頭暈"].includes(item)) score -= 1;
            if (["強烈焦慮"].includes(item)) score -= 4;
        });
        return score;
    }

    function calcMoodScore(list) {
        let score = 0;
        list.forEach(m => {
            if (["情緒不穩", "想哭", "明顯低落"].includes(m)) score -= 3;
            if (["小煩悶", "小低落", "胸口悶"].includes(m)) score -= 1;
            if (["平靜"].includes(m)) score += 2;
            if (["穩定"].includes(m)) score += 4;
        });
        return score;
    }

    function calcFreeTextScore(bodyAI, moodAI) {
        return (bodyAI.score + moodAI.score) * 0.3; // 降低權重
    }

    //-----------------------------------------
    // ☁️ 天氣決定器（獨立）
    //-----------------------------------------
    function getWeatherResult(score) {
        if (score >= 18)
            return ["☀️ 晴朗", "你今天能量很足，心很亮。", "適合進度、創作、挑戰。"];

        if (score >= 10)
            return ["🌤 微晴", "整體穩定，只有小雲。", "輕量節奏，動靜皆宜。"];

        if (score >= 4)
            return ["☁️ 陰陰的", "有些累，但你依然很努力。", "做最簡單的一件事就好。"];

        if (score >= -3)
            return ["🌧 小雨", "身心在耗能，需要慢下來。", "休息一下，讓自己被接住。"];

        return ["⛈ 暴雨", "你今天承受很多。", "優先照顧心和身。"];
    }

    //-----------------------------------------
    // 🎨 Render 結果（獨立）
    //-----------------------------------------
    function renderWeather(weather, reason, suggestion) {
        DOM.output.innerHTML = `
            <div class="weather-card">
                <div class="weather-tag">${weather}</div>
                <p class="weather-text">${reason}</p>

                <div class="weather-stats-box">
                    <p class="main-accent-title">⚡ 今日的建議節奏：</p>
                    <ul class="weather-advice"><li>${suggestion}</li></ul>
                </div>

                <p class="weather-end">我陪著你，你不用一個人面對今天的天氣。</p>
            </div>
        `;
    }

    //-----------------------------------------
    // 🌤 主邏輯（變得超乾淨）
    //-----------------------------------------
    function generateWeather() {

        // ⭐ 睡眠（可空 → 中性 5）
        const sleep = DOM.sleep.value === "" ? 5 : Number(DOM.sleep.value);

        const body = getChecked("body-group");
        const mood = getChecked("mood-group");

        const bodyAI = analyzeEmotion(DOM.bodyFree.value);
        const moodAI = analyzeEmotion(DOM.moodFree.value);

        const finalBody = mergeUnique(body, bodyAI.inferred);
        const finalMood = mergeUnique(mood, moodAI.inferred);

        // 📌 計算總分
        const score =
            calcSleepScore(sleep) +
            calcBodyScore(finalBody) +
           calcMoodScore(finalMood) +
            calcFreeTextScore(bodyAI, moodAI);

        // UI Loading
        DOM.resultBox.style.display = "block";
        DOM.loading.style.display = "block";
        DOM.output.style.display = "none";
        DOM.loading.innerText = "等一下，我正在讀取你的心天氣…";

        setTimeout(() => {
            const [weather, reason, suggestion] = getWeatherResult(score);
            DOM.loading.style.display = "none";
            DOM.output.style.display = "block";
            renderWeather(weather, reason, suggestion);
        }, 900);
    }

    //-----------------------------------------
    // 🔘 事件啟動
    //-----------------------------------------
    DOM.btn.addEventListener("click", generateWeather);
});