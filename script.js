//-----------------------------------------
// 🌤 今日心天氣 · 主功能（完整可直接貼）
//-----------------------------------------

// 主要 DOM
const btn = document.querySelector(".submit-btn");
const resultBox = document.getElementById("result");
const weatherOutput = document.getElementById("weatherOutput");
const loadingText = document.getElementById("loadingText");

// 監聽按鈕
btn.addEventListener("click", generateWeather);


//-----------------------------------------
// 🎛 Step 1：主要計算流程
//-----------------------------------------
function generateWeather() {
    // ➤ 讀取「睡眠分數」
    const sleep = Number(document.getElementById("sleep").value);

    // ➤ 讀取「身體狀態」勾選
    const bodyChecks = [...document.querySelectorAll(
        '.card:nth-of-type(2) input[type="checkbox"]:checked'
    )].map(x => x.value);

    // ➤ 讀取「心情天氣」勾選
    const moodChecks = [...document.querySelectorAll(
        '.card:nth-of-type(3) input[type="checkbox"]:checked'
    )].map(x => x.value);


    //-----------------------------------------
    // 🛑 Step 2：阻擋沒填睡眠分數
    //-----------------------------------------
    if (!sleep && sleep !== 0) {
        resultBox.style.display = "block";
        loadingText.style.display = "block";
        loadingText.innerText = "🌧 填一下睡眠分數，我才能看懂心天氣唷。";
        weatherOutput.style.display = "none";
        return;
    }

    //-----------------------------------------
    // ⏳ Step 3：顯示 loading 動畫
    //-----------------------------------------
    resultBox.style.display = "block";      // 顯示外框
    loadingText.style.display = "block";    // 顯示讀取中文字
    loadingText.innerText = "等一下，我正在讀取你的心天氣…";
    weatherOutput.style.display = "none";   // 隱藏結果
    weatherOutput.innerHTML = "";           // 清空舊內容


    //-----------------------------------------
    // 🧠 Step 4：開始計算心天氣
    //-----------------------------------------

    let weather = "";
    let reason = "";
    let suggestion = "";

    // ☀️ 晴朗
    if (sleep >= 7 && moodChecks.includes("穩定")) {
        weather = "☀️ 晴朗";
        reason = "你今天的身心亮度都很不錯，情緒穩穩的。";
        suggestion = "可以安排需要專注的任務，創作或學習都很順。";
    }

    // 🌤 微晴
    else if (sleep >= 5 && moodChecks.some(m => ["普通", "平靜"].includes(m))) {
        weather = "🌤 微晴";
        reason = "你的基底狀態是穩定的，只是有些小雲飄著。";
        suggestion = "做一些輕量任務，例如整理桌面或複習筆記。";
    }

    // ☁️ 陰陰的
    else if (
        bodyChecks.includes("胸悶") ||
        moodChecks.includes("小低落") ||
        moodChecks.includes("小煩悶")
    ) {
        weather = "☁️ 陰陰的";
        reason = "身體或心有些悶悶的雲層。";
        suggestion = "喝點溫水、伸展一下，做些低負荷小事就很棒。";
    }

    // 🌧 小雨
    else if (
        moodChecks.includes("情緒不穩") ||
        moodChecks.includes("想哭") ||
        bodyChecks.includes("強烈焦慮")
    ) {
        weather = "🌧 小雨";
        reason = "情緒或焦慮正在落雨，但你很努力了。";
        suggestion = "適合好好休息，讓自己被接住。";
    }

    // ⛈ 暴雨
    else if (sleep <= 2 && bodyChecks.includes("明顯疲累")) {
        weather = "⛈ 暴雨";
        reason = "身體正在發出明顯訊號需要休息。";
        suggestion = "請優先休息，喝水、補充食物、躺下。";
    }

    // 🌥 默默的雲（預設）
    else {
        weather = "🌥 淡淡的雲";
        reason = "有些說不出的感覺，但沒關係。";
        suggestion = "做一件最簡單、最不費力的事，就是今天的任務。";
    }


    //-----------------------------------------
    // 🕒 Step 5：延遲 1.2 秒 → 顯示結果
    //-----------------------------------------
    setTimeout(() => {
        loadingText.style.display = "none";

        weatherOutput.style.display = "block";
        weatherOutput.classList.add("fade-in");

        weatherOutput.innerHTML = `
    <div class="weather-card">

      <div class="weather-tag">${weather}</div>

      <div class="weather-main">
        <p class="weather-text">${reason}</p>
      </div>

      <div class="weather-stats-box">
        <p class="weather-subtitle">⚡ 今日的建議節奏：</p>
        <p class="weather-advice">${suggestion}</p>
      </div>

      <p class="weather-end">我陪著你，你不用一個人面對今天的天氣。</p>

    </div>
  `;
    }, 1200);
}



