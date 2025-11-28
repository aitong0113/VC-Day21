//-----------------------------------------
// 🌤 今日心天氣 · NLP-mini 智能情緒判斷 完整版
//-----------------------------------------

const btn = document.querySelector(".submit-btn");
const resultBox = document.getElementById("result");
const weatherOutput = document.getElementById("weatherOutput");
const loadingText = document.getElementById("loadingText");

btn.addEventListener("click", generateWeather);


//-----------------------------------------
// 📘 一、情緒字典（詞彙庫）
//-----------------------------------------
const emotionDict = {
  positive: ["好", "還行", "舒服", "ok", "穩定", "平靜", "安心", "放鬆", "不錯", "變好", "還可以"],
  weakPositive: ["有點好", "還好", "普通", "可以"],
  negative: ["不好", "不太好", "糟", "不舒服", "悶", "低落", "煩", "煩悶", "悶悶", "胸悶", "不順"],
  anxiety: ["焦", "緊張", "壓力", "不安", "慌", "害怕"],
  sad: ["難過", "哭", "想哭", "委屈", "崩潰", "空虛"],
  tired: ["累", "沒力", "無力", "疲倦", "想睡", "提不起勁"],
  angry: ["生氣", "氣", "不爽", "煩躁", "激動"],
  confused: ["不知道", "說不上來", "混亂", "不知道為什麼"]
};

//-----------------------------------------
// 📘 二、Emoji 情緒力量
//-----------------------------------------
const emojiScores = {
  "🙂": +1, "😊": +2, "🥰": +3, "✨": +1, "👍": +1,
  "😐": 0,  "😶": 0,
  "🥲": -1, "😔": -1, "😕": -1,
  "😢": -3, "😭": -4, "😞": -2,
  "😡": -4, "🤬": -5, "😠": -3,
  "💔": -4, "🫠": -2, "😵‍💫": -3,
  "😩": -2, "😫": -2
};


//-----------------------------------------
// 📘 三、智能情緒分析（自由填寫）
//-----------------------------------------
function analyzeTextEmotion(text) {
  if (!text || text.trim() === "") return 0;

  let score = 0;
  const lowered = text.toLowerCase();

  // 1) emoji 判斷
  [...text].forEach(ch => { if (emojiScores[ch]) score += emojiScores[ch]; });

  // 2) 詞彙庫判斷
  for (let word of emotionDict.positive) if (lowered.includes(word)) score += 2;
  for (let word of emotionDict.weakPositive) if (lowered.includes(word)) score += 1;

  for (let word of emotionDict.negative) if (lowered.includes(word)) score -= 2;
  for (let word of emotionDict.anxiety) if (lowered.includes(word)) score -= 3;
  for (let word of emotionDict.sad) if (lowered.includes(word)) score -= 3;
  for (let word of emotionDict.tired) if (lowered.includes(word)) score -= 2;
  for (let word of emotionDict.angry) if (lowered.includes(word)) score -= 3;
  for (let word of emotionDict.confused) if (lowered.includes(word)) score -= 1;

  // 3) 語氣強度判定
  if (/超|好|很/.test(text) && /累|煩|低落|不舒服|想哭/.test(text)) score -= 1;
  if (/超|很|好/.test(text) && /好/.test(text)) score += 1;

  return score;
}


//-----------------------------------------
// 🎛 Step 1：整合所有資料
//-----------------------------------------
function generateWeather() {

  const sleep = Number(document.getElementById("sleep").value);

  const bodyChecks = [...document.querySelectorAll(
    '.card:nth-of-type(2) input[type="checkbox"]:checked'
  )].map(x => x.value);

  const moodChecks = [...document.querySelectorAll(
    '.card:nth-of-type(3) input[type="checkbox"]:checked'
  )].map(x => x.value);

  const bodyText = document.querySelector('.card:nth-of-type(2) .input-text').value;
  const moodText = document.querySelector('.card:nth-of-type(3) .input-text').value;
  const goalText = document.querySelector('.card:nth-of-type(4) .input-text').value;
  const timeText = document.querySelector('.card:nth-of-type(5) .input-text').value;


  //-----------------------------------------
  // 🛑 沒有填睡眠 → 阻擋
  //-----------------------------------------
  if (!sleep && sleep !== 0) {
    resultBox.style.display = "block";
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
  // 🧠 NLP 情緒整合計算
  //-----------------------------------------
  let totalScore = 0;

  // 勾選項
  if (moodChecks.includes("穩定") || moodChecks.includes("平靜")) totalScore += 2;
  if (moodChecks.includes("普通")) totalScore += 1;
  if (moodChecks.includes("小煩悶") || moodChecks.includes("小低落")) totalScore -= 1;
  if (moodChecks.includes("焦慮") || moodChecks.includes("胸口悶")) totalScore -= 2;
  if (moodChecks.includes("情緒不穩") || moodChecks.includes("想哭")) totalScore -= 3;

  // 身體狀態
  if (bodyChecks.includes("明顯疲累")) totalScore -= 3;
  if (bodyChecks.includes("輕微疲倦") || bodyChecks.includes("小頭暈")) totalScore -= 1;
  if (bodyChecks.includes("強烈焦慮")) totalScore -= 4;

  // NLP 文字分析
  totalScore += analyzeTextEmotion(bodyText);
  totalScore += analyzeTextEmotion(moodText);
  totalScore += analyzeTextEmotion(goalText);
  totalScore += analyzeTextEmotion(timeText);

  // 睡眠分數加權
  if (sleep >= 7) totalScore += 2;
  if (sleep <= 3) totalScore -= 2;


  //-----------------------------------------
  // ☁️ 天氣分類
  //-----------------------------------------
  let weather = "";
  let reason = "";
  let suggestion = "";

  if (totalScore >= 3) {
    weather = "☀️ 晴朗";
    reason = "你的狀態明亮、穩穩的，很棒。";
    suggestion = "可以安排需要能量的任務，今天是順風日。";
  } else if (totalScore >= 1) {
    weather = "🌤 微晴";
    reason = "整體基調是平穩的，有些小雲但沒關係。";
    suggestion = "做些輕量工作、慢慢推進今天的步伐。";
  } else if (totalScore === 0) {
    weather = "🌥 淡淡的雲";
    reason = "有些說不出的感覺，但我陪著你。";
    suggestion = "做一件最簡單、最不費力的小事就很足夠。";
  } else if (totalScore >= -2) {
    weather = "☁️ 陰陰的";
    reason = "情緒或身體有些悶，辛苦你了。";
    suggestion = "喝點溫水、深呼吸，先照顧你的步伐。";
  } else if (totalScore >= -5) {
    weather = "🌧 小雨";
    reason = "情緒在落雨，但你真的很努力了。";
    suggestion = "今天適合休息，把自己放在優先。";
  } else {
    weather = "⛈ 暴雨";
    reason = "身心正在發出強烈訊號。";
    suggestion = "請溫柔地停下來，讓自己被接住。";
  }


  //-----------------------------------------
  // 🕒 延遲呈現結果
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
          <p class="weather-advice">${suggestion}</p>
        </div>

        <p class="weather-end">我陪著你，你不用一個人面對今天的天氣。</p>
      </div>
    `;
  }, 1200);
}