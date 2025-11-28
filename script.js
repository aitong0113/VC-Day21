//-----------------------------------------
// 🌤 今日心天氣 · 最終版（含自由輸入情緒判讀）
//-----------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    const btn = document.querySelector(".submit-btn");
    const resultBox = document.getElementById("result");
    const weatherOutput = document.getElementById("weatherOutput");
    const loadingText = document.getElementById("loadingText");

    btn.addEventListener("click", generateWeather);

    // 工具：讀取 checkbox 群組
    function getCheckedValues(selector) {
        return [...document.querySelectorAll(`${selector} input[type="checkbox"]:checked`)]
            .map(x => x.value);
    }

    // 工具：自由輸入 → 關鍵字判讀
    function detectKeywords(text) {
        const lower = text.toLowerCase();

        const keywordMap = {
            "疲": "明顯疲累",
            "累": "明顯疲累",
            "倦": "輕微疲倦",
            "撐": "明顯疲累",

            "緊": "肩頸緊",
            "僵": "肩頸緊",

            "暈": "小頭暈",
            "頭重": "小頭暈",

            "悶": "胸悶",
            "壓": "胸悶",

            "焦": "焦慮",
            "不安": "焦慮",

            "煩": "小煩悶",
            "低落": "小低落",
            "難過": "小低落",

            "哭": "想哭",
            "淚": "想哭",

            "亂": "情緒不穩",
        };

        let detected = [];

        for (let key in keywordMap) {
            if (lower.includes(key)) detected.push(keywordMap[key]);
        }

        return detected;
    }

    // 🌤 主運算
    function generateWeather() {

        const sleep = Number(document.getElementById("sleep").value);

        const body = getCheckedValues("#body-group");
        const mood = getCheckedValues("#mood-group");

        const bodyFreeText = document.querySelector("#body-free")?.value || "";
        const moodFreeText = document.querySelector("#mood-free")?.value || "";

        // ➤ 自由輸入 + 關鍵字推論
        const bodyFromText = detectKeywords(bodyFreeText);
        const moodFromText = detectKeywords(moodFreeText);

        // ➤ 合併（不重複）
        const finalBody = [...new Set([...body, ...bodyFromText])];
        const finalMood = [...new Set([...mood, ...moodFromText])];

        // 展示區初始化
        resultBox.style.display = "block";
        weatherOutput.style.display = "none";
        loadingText.style.display = "block";

        if (!sleep && sleep !== 0) {
            loadingText.innerText = "🌧 填一下睡眠分數，我才能看懂心天氣唷。";
            return;
        }

        loadingText.innerText = "等一下，我正在讀取你的心天氣…";
        weatherOutput.innerHTML = "";

        // 🌦 規則
        const rules = [
            {
                match: sleep >= 7 && finalMood.includes("穩定"),
                weather: "☀️ 晴朗",
                reason: "你今天的身心亮度都很不錯，情緒穩穩的。",
                suggestion: "可以安排需要專注的任務，創作或學習都很順。",
            },
            {
                match: sleep >= 5 && finalMood.some(m => ["普通", "平靜"].includes(m)),
                weather: "🌤 微晴",
                reason: "你的基底狀態是穩定的，只是有些小雲飄著。",
                suggestion: "做一些輕量任務，例如整理桌面或複習筆記。",
            },
            {
                match: finalBody.includes("胸悶") ||
                       finalMood.includes("小低落") ||
                       finalMood.includes("小煩悶"),
                weather: "☁️ 陰陰的",
                reason: "身體或心有些悶悶的雲層。",
                suggestion: "喝點溫水、伸展一下，做些低負荷小事就很棒。",
            },
            {
                match: finalMood.includes("情緒不穩") ||
                       finalMood.includes("想哭") ||
                       finalBody.includes("強烈焦慮"),
                weather: "🌧 小雨",
                reason: "情緒或焦慮正在落雨，但你很努力了。",
                suggestion: "適合好好休息，讓自己被接住。",
            },
            {
                match: sleep <= 2 && finalBody.includes("明顯疲累"),
                weather: "⛈ 暴雨",
                reason: "身體正在發出明顯訊號需要休息。",
                suggestion: "請優先休息，喝水、補充食物、躺下。",
            }
        ];

        // 預設（如果都沒命中）
        let weather = "🌥 淡淡的雲";
        let reason = "有些說不出的感覺，但沒關係。";
        let suggestion = "做一件最簡單、最不費力的事，就是今天的任務。";

        for (let r of rules) {
            if (r.match) {
                weather = r.weather;
                reason = r.reason;
                suggestion = r.suggestion;
                break;
            }
        }

        // 顯示結果
        setTimeout(() => {
            loadingText.style.display = "none";
            weatherOutput.style.display = "block";
            weatherOutput.classList.add("fade-in");

            weatherOutput.innerHTML = `
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
        }, 1000);
    }
});