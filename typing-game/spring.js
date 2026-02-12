"use strict";

// ゲームの状態管理
const state = {
  difficulty: null, // 難易度（easy / normal / hard）
  themeIndex: 0, // 今何番目の単語か
  miss: 0, // ミスタイプ数
  countSeconds: 3, // カウントダウン秒数
  downTimerSeconds: 60, // 残り時間
  isGameStarted: false, // ゲーム中かどうか
  isPaused: false, // 一時停止中か
  isCounting: false, // カウントダウン中か
  isTimerRunning: false, // タイマーが動いているか
};

let chooseTheme = []; // 今回選ばれた単語リスト
let countInterval; // カウントダウン用タイマー
let downTimerInterval; // ゲーム用タイマー

/* DOM */
const dom = {
  input: document.getElementById("input_field"),
  theme: document.getElementById("theme"),
  mistake: document.getElementById("mistake"),
  countdown: document.getElementById("count"),
  rest: document.getElementById("rest"),
};

const overlay = {
  start: document.getElementById("startpopupOverlay"),
  press: document.getElementById("presspopupOverlay"),
  count: document.getElementById("countpopupOverlay"),
  game: document.getElementById("gamepopupOverlay"),
  pause: document.getElementById("pausepopupOverlay"),
  result: document.getElementById("resultpopupOverlay"),
};

/* お題 */
const themes = {
  easy: [
    ["island","rabbit","orange","in","china","streamer","off","on","radio","wave"],
    ["control","monitor","set","next","audio","by","scan","ask","solve","core"]
  ],
  normal: [
    ["telephone","adventure","motorcycle","kangaroo","chocolate","watermelon","sunflower","calculator","astronaut","pineapple"],
    ["impossible","stainless","resistant","definition","interface","wireless","synthetic","personality","application","headline"]
  ],
  hard: [
    ["lilac","kaijuunohanauta","kawaiidakejadamedesuka","saudade","zankokunatenshinothese","sayonaraelegy","marigold","dryflower","366nichi","bansanka"],
    ["darling","queserasera","suiheisen","chankapana","ikuokukonen","kanade","takanenohanakosan","cherry","chiisanakoinouta","tenbyounouta"]
  ]
};

/* ポップアップのコントロール */
function show(el) {
  el.style.display = "flex"; // 表示
}
function hide(el) {
  el.style.display = "none"; // 非表示
}

/* ゲームの流れに関する処理 */
function selectDifficulty(level) {
  state.difficulty = level; // 難易度保存
  notice.style.display = "none";
  hide(overlay.start); // スタート画面を消す
  show(overlay.press); // 「Press Space」表示
  document.addEventListener("keydown", waitSpaceKey);
}

function waitSpaceKey(e) {
  if (e.key === " ") { // スペースキーなら
    document.removeEventListener("keydown", waitSpaceKey);
    hide(overlay.press);
    show(overlay.count);
    startCountDown();
  }
}

function startCountDown() {
  if (state.isCounting) return;
  state.isCounting = true;

  countInterval = setInterval(() => {
    if (state.countSeconds > 0) {
      dom.countdown.textContent = state.countSeconds;
      state.countSeconds--;
    } else {
      dom.countdown.textContent = "Start";
      clearInterval(countInterval);
      state.isCounting = false;

      setTimeout(() => {
        hide(overlay.count);
        startGame();
      }, 1000);
    }
  }, 1000);
}

function startGame() {
  overlay.game.style.pointerEvents = "auto";
  state.isGameStarted = true;
  state.themeIndex = 0;
  state.downTimerSeconds = 60;

  const list = themes[state.difficulty];
  chooseTheme = list[Math.floor(Math.random() * list.length)];

  show(overlay.game);
  dom.input.focus(); // 自動的に入力欄にカーソルを合わせる
  updateThemeDisplay();
  startTimer();
}

function finishGame() {
  clearInterval(downTimerInterval);
  state.isTimerRunning = false;
  state.isGameStarted = false;
  dom.input.disabled = true;
  hide(overlay.game);
  show(overlay.result);

  document.getElementById("missRest").textContent =
    `ミスタイプ数:${state.miss}、経過秒数:${60 - state.downTimerSeconds}秒`;
}

/* タイピングに関する処理 */
dom.input.addEventListener("input", () => {
  if (!state.isGameStarted || state.isPaused) return;

  const current = dom.input.value;
  const target = chooseTheme[state.themeIndex];

  if (current === target) {
    state.themeIndex++;
    dom.input.value = "";

    if (state.themeIndex >= chooseTheme.length) {
      finishGame();
      return;
    }
  } else {
    const correct = target.slice(0, current.length);
    if (current !== correct) {
      state.miss++;
      dom.mistake.textContent = `ミスタイプ数:${state.miss}`;
      dom.input.value = current.slice(0, -1);
    }
  }
  updateThemeDisplay();
});

function updateThemeDisplay() {
  const word = chooseTheme[state.themeIndex];
  const input = dom.input.value;

  const correct = word.slice(0, input.length);
  const rest = word.slice(input.length);

  dom.theme.innerHTML = `<span style="color:green">${correct}</span>${rest}`;
}

/* タイマーに関する処理 */
function startTimer() {
  if (state.isTimerRunning) return;
  state.isTimerRunning = true;

  downTimerInterval = setInterval(() => {
    state.downTimerSeconds--;
    dom.rest.textContent = `残り時間:${state.downTimerSeconds}秒`;

    if (state.downTimerSeconds <= 0) {
      finishGame();
    }
  }, 1000);
}

function pauseGame() {
  state.isPaused = true;
  clearInterval(downTimerInterval);
  state.isTimerRunning = false;
  dom.input.disabled = true;
  show(overlay.pause);
  overlay.game.style.pointerEvents = "none";
}

function resumeGame() {
  state.isPaused = false;
  dom.input.disabled = false;
  hide(overlay.pause);
  overlay.game.style.pointerEvents = "auto";
  startTimer();
  dom.input.focus();
}

/* リセットに関する処理  */
function resetState() {
  clearInterval(downTimerInterval);

  Object.assign(state, {
    themeIndex: 0,
    miss: 0,
    countSeconds: 3,
    downTimerSeconds: 60,
    isGameStarted: false,
    isPaused: false,
    isCounting: false,
    isTimerRunning: false,
  });
  dom.input.disabled = false;
  dom.input.value = "";
  dom.mistake.textContent = "ミスタイプ数:0";
  dom.rest.textContent = "残り時間:60秒";
  dom.countdown.textContent = "";
}

function returnTop() {
  resetState();
  notice.style.display = "block";
  hide(overlay.pause);
  hide(overlay.game);
  hide(overlay.result);
  show(overlay.start);
}

/* イベント処理 */
document.getElementById("easy").onclick = () => selectDifficulty("easy");
document.getElementById("normal").onclick = () => selectDifficulty("normal");
document.getElementById("hard").onclick = () => selectDifficulty("hard");

document.getElementById("pause").onclick = pauseGame;
document.getElementById("resume").onclick = resumeGame;
document.getElementById("top").onclick = returnTop;
document.getElementById("once").onclick = () => {
  resetState();
  hide(overlay.result);
  show(overlay.count);
  startCountDown();
};
document.getElementById("return").onclick = returnTop;
const notice = document.getElementById("notice");