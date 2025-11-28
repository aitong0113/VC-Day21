//-----------------------------------------
// 🌤 今日心天氣 · 完整整合 JS（含自由填寫智能判斷）
//-----------------------------------------

const btn = document.querySelector(".submit-btn");
const resultBox = document.getElementById("result");
const weatherOutput = document.getElementById("weatherOutput");
const loadingText = document.getElementById("loadingText");

btn.addEventListener("click", generateWeather);


//-----------------------------------------
// 📘 情緒詞彙（自由填寫判斷用）
//-----------------------------------------
const emotionDict = {
    positive: ["好", "還行", "舒服", "ok", "穩定", "平靜", "安心", "不錯"],
    weakPositive: ["普通", "還好", "可以"],
    negative: ["不好", "悶", "煩", "煩悶", "不舒服", "低落", "胸悶"],
    anxiety: ["焦", "緊張", "壓力", "不安", "慌"],
    sad: ["難過", "哭", "想哭", "委屈", "崩潰"],
    tired: ["累", "疲倦", "無力", "想睡"],
};

// emoji 分數
const emojiScores = {
    "🙂": +1, "😊": +2, "🥰": +3,
    "😐": 0,
    "😢": -3, "😭": -4,
    "😡": -3, "🤬": -5,
    "😴": -2, "🥱": -1,
    "😩": -2, "😫": -2,
};


//-----------------------------------------
// 📘 自由填寫情緒分析
//-----------------------------------------
function analyzeTextEmotion(text) {
    if (!text || text.trim() === "") return 0;

    let score = 0;
    const lowered = text.toLowerCase();

    // emoji
    [...text].forEach(ch => { if (emojiScores[ch]) score += emojiScores[ch]; });

    // 詞彙判斷
    for (let w of emotionDict.positive) if (lowered.includes(w)) score += 2;
    for (let w of emotionDict.weakPositive) if (lowered.includes(w)) score += 1;
    for (let w of emotionDict.negative) if (lowered.includes(w)) score -= 2;
    for (let w of emotionDict.anxiety) if (lowered.includes(w)) score -= 3;
    for (let w of emotionDict.sad) if (lowered.includes(w)) score -= 3;
    for (let w of emotionDict.tired) if (lowered.includes(w)) score -= 2;

    return score;
}



//-----------------------------------------
// 🎛 主流程
//-----------------------------------------
function generateWeather() {

    // 睡眠
    const sleep = Number(document.getElementById("sleep").value);

    // 身體狀態
    const bodyChecks = [...document.querySelectorAll(
        '.card:nth-of-type(2) input[type="checkbox"]:checked'
    )].map(x => x.value);

    // 心情
    const moodChecks = [...document.querySelectorAll(
        '.card:nth-of-type(3) input[type="checkbox"]:checked'
    )].map(x => x.value);

    // 自由填寫（身體/心情/方向/時間）
    const bodyText = document.querySelector('.card:nth-of-type(2) .input-text').value;
    const moodText = document.querySelector('.card:nth-of-type(3) .input-text').value;
    const goalText = document.querySelector('.card:nth-of-type(4) .input-text').value;
    const timeText = document.querySelector('.card:nth-of-type(5) .input-text').value;


    //-----------------------------------------
    // 🛑 沒填睡眠 → 阻擋
    //-----------------------------------------
    if (!sleep && sleep !== 0) {
        resultBox.style.display = "block";
        loadingText.style.display = "block";
        loadingText.innerText = "🌧 填一下睡眠分數，我才能看懂心天氣唷。";
        weatherOutput.style.display = "none";
        return;
    }


    //-----------------------------------------
    // ⏳ Loading 狀態
    //-----------------------------------------
    resultBox.style.display = "block";
    loadingText.style.display = "block";
    loadingText.innerText = "等一下，我正在讀取你的心天氣…";
    weatherOutput.style.display = "none";
    weatherOutput.innerHTML = "";


    //-----------------------------------------
    // 🧠 加權計算邏輯（整合你的原本邏輯 + NLP）
    //-----------------------------------------
    let score = 0;

    // 原本邏輯：睡眠
    if (sleep >= 7) score += 2;
    else if (sleep <= 3) score -= 2;

    // 原本邏輯：心情勾選
    if (moodChecks.includes("穩定")) score += 2;
    if (moodChecks.includes("平靜")) score += 1;
    if (moodChecks.includes("普通")) score += 0;
    if (moodChecks.includes("小煩悶") || moodChecks.includes("小低落")) score -= 1;
    if (moodChecks.includes("焦慮") || moodChecks.includes("胸口悶")) score -= 2;
    if (moodChecks.includes("情緒不穩") || moodChecks.includes("想哭")) score -= 3;

    // 原本邏輯：身體
    if (bodyChecks.includes("明顯疲累")) score -= 3;
    if (bodyChecks.includes("輕微疲倦") || bodyChecks.includes("小頭暈")) score -= 1;
    if (bodyChecks.includes("強烈焦慮")) score -= 4;

    // NLP（自由文字）
    score += analyzeTextEmotion(bodyText);
    score += analyzeTextEmotion(moodText);
    score += analyzeTextEmotion(goalText);
    score += analyzeTextEmotion(timeText);


    //-----------------------------------------
    // ☁️ 天氣分類
    //-----------------------------------------
    let weather = "";
    let reason = "";
    let suggestion = "";

    if (score >= 3) {
        weather = "☀️ 晴朗";
        reason = "你今天的身心亮度都很不錯，情緒穩穩的。";
        suggestion = "可以安排需要專注的任務，創作或學習都很順。";
    }
    else if (score >= 1) {
        weather = "🌤 微晴";
        reason = "你的基底狀態是穩定的，只是有些小雲飄著。";
        suggestion = "做一些輕量任務，例如整理桌面或複習筆記。";
    }
    else if (score === 0) {
        weather = "🌥 淡淡的雲";
        reason = "有些說不出的感覺，但沒關係，我在。";
        suggestion = "做一件最簡單、最不費力的事，就是今天的任務。";
    }
    else if (score >= -2) {
        weather = "☁️ 陰陰的";
        reason = "身體或心有些悶悶的雲層。";
        suggestion = "喝點溫水、伸展一下，做些低負荷的小事就很棒。";
    }
    else if (score >= -5) {
        weather = "🌧 小雨";
        reason = "情緒或焦慮正在落雨，但你很努力了。";
        suggestion = "今天適合休息，讓自己被接住。";
    }
    else {
        weather = "⛈ 暴雨";
        reason = "身心正在發出明顯訊號需要休息。";
        suggestion = "請優先照顧自己，喝水、休息、補充能量。";
    }


    //-----------------------------------------
    // 🕒 顯示結果
    //-----------------------------------------
    setTimeout(() => {
        loadingText.style.display = "none";
        weatherOutput.style.display = "block";
        weatherOutput.classList.add("fade-in");

        weatherOutput.innerHTML = `
            <div class="weather-card">
                <div class="weather-tag">${weather}</div>
                <p class="weather-subtext">${reason}</p>

                <div class="weather-stats-box">
                    <p class="weather-subtitle main-accent-title">⚡ 今日的建議節奏：</p>
                    <ul class="weather-advice">
                        <li>${suggestion}</li>
                    </ul>
                </div>

                <p class="weather-end">我陪著你，你不用一個人面對今天的天氣。</p>
            </div>
        `;
    }, 1200);
}