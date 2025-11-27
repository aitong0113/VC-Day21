document.querySelector(".submit-btn").addEventListener("click", generateWeather);

function generateWeather() {
  const sleep = Number(document.getElementById("sleep").value);

  const bodyChecks = [
    ...document.querySelectorAll(
      '.card:nth-of-type(2) input[type="checkbox"]:checked'
    ),
  ].map(x => x.value);

  const moodChecks = [
    ...document.querySelectorAll(
      '.card:nth-of-type(3) input[type="checkbox"]:checked'
    ),
  ].map(x => x.value);

  const resultCard = document.getElementById("result");

  // 沒填睡眠分數 → 阻擋
  if (!sleep && sleep !== 0) {
    resultCard.innerHTML = `
      <p class="placeholder">🌧 填一下睡眠分數，我才能看懂心天氣唷。</p>`;
    return;
  }

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

  // 🌥 默默的雲
  else {
    weather = "🌥 淡淡的雲";
    reason = "有些說不出的感覺，但沒關係。";
    suggestion = "做一件最簡單、最不費力的事，就是今天的任務。";
  }

  // 顯示結果
  resultCard.innerHTML = `
    <div class="weather-preview">
      <h2 class="weather-title">${weather}</h2>
      <p class="weather-reason">${reason}</p>

      <div class="weather-box">
        <p class="weather-subtitle">🌦 今天的建議節奏：</p>
        <ul class="weather-list">
          <li>${suggestion}</li>
        </ul>
      </div>

      <p class="weather-end">我在，你不用一個人面對今天的天氣。</p>
    </div>
  `;
}

