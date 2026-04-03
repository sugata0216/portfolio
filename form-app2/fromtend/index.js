"use strict";
// 要素取得
const form = document.getElementById("contactForm");
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const messageEl = document.getElementById("message");
const agreeEl = document.getElementById("agree");
const inputs = document.querySelectorAll("input, textarea");
const btn = document.getElementById("confirmBtn");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const messageError = document.getElementById("messageError");
const agreeError = document.getElementById("agreeError");
// state管理
const state = {
    name: "",
    email: "",
    message: "",
    agree: false,
};
// LocalStorageキー
const STORAGE_KEY = "contactFormData";
// 保存
function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
// 復元
function loadState() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    try {
        const parsed = JSON.parse(data);
        Object.assign(state, parsed);
    } catch {
        localStorage.removeItem(STORAGE_KEY);
    }
}
// DOMへ反映
function render() {
    nameEl.value = state.name;
    emailEl.value = state.email;
    messageEl.value = state.message;
    agreeEl.checked = state.agree;
}
// バリデーション
function validate() {
    let valid = true;
    if (!state.name.trim()) {
        nameError.textContent = "名前は必須です";
        valid = false;
    } else nameError.textContent = "";
    if (!state.email.trim()) {
        emailError.textContent = "メールアドレスは必須です";
        valid = false;
    } else emailError.textContent = "";
    if (!state.message.trim()) {
        messageError.textContent = "お問い合わせ内容は必須です";
        valid = false;
    } else messageError.textContent = "";
    if (!state.agree) {
        agreeError.textContent = "規約に同意してください";
        valid = false;
    } else agreeError.textContent = "";
    return valid;
}
// ボタン制御
function updateButton() {
    btn.disabled = !(
        state.name.trim() &&
        state.email.trim() &&
        state.message.trim() &&
        state.agree
    );
}
// 入力イベント
nameEl.addEventListener("input", () => {
    state.name = nameEl.value;
    saveState();
    validate();
    updateButton();
});
emailEl.addEventListener("input", () => {
    state.email = emailEl.value;
    saveState();
    validate();
    updateButton();
});
messageEl.addEventListener("input", () => {
    state.message = messageEl.value;
    saveState();
    validate();
    updateButton();
});
agreeEl.addEventListener("change", () => {
    state.agree = agreeEl.checked;
    saveState();
    validate();
    updateButton();
});
// 初期化
function init() {
    loadState();
    render();
    validate();
    updateButton();
}
// 初回ロード
window.addEventListener("DOMContentLoaded", init);
window.addEventListener("pageshow", init);
// 入力チェック
function checkForm() {
    const valid =
        nameEl.value.trim() !== "" &&
        emailEl.value.trim() !== "" &&
        messageEl.value.trim() !== "" &&
        agreeEl.checked;
    btn.disabled = !valid;
}
// ページ読み込まれた時、保存済みのデータを入力欄に自動で反映する
window.addEventListener("load", () => {
    nameEl.value = localStorage.getItem("name") || "";
    emailEl.value = localStorage.getItem("email") || "";
    messageEl.value = localStorage.getItem("message") || "";
    agreeEl.value = localStorage.getItem("agree") === "true";
    checkForm();
});
window.addEventListener("pageshow", () => {
    checkForm();
});
// 送信
form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    saveState();
    // 確認画面へ(次ステップ)
    location.href = "confirm.html";
});