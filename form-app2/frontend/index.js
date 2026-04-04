"use strict";
import { validateForm } from "./validate.js";
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
const modal = document.getElementById("termsModal");
const openBtn = document.getElementById("openTerms");
const closeBtn = document.getElementById("closeTerms");
// state管理
const state = {
    name: "",
    email: "",
    message: "",
    agree: false,
};
// LocalStorageキー
const STORAGE_KEY = "contactFormData";
// 初期化
function init() {
    loadState();
    render();
    // エラー初期化
    nameError.textContent = "";
    emailError.textContent = "";
    messageError.textContent = "";
    agreeError.textContent = "";
    updateButton();
}
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
    agreeEl.checked = Boolean(state.agree);
}
// バリデーション
function validate() {
    const errors = validateForm(state);
    nameError.textContent = errors.name || "";
    emailError.textContent = errors.email || "";
    messageError.textContent = errors.message || "";
    agreeError.textContent = errors.agree || "";
    return Object.keys(errors).length === 0;
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
// 入力チェック
function checkForm() {
    const valid =
        nameEl.value.trim() !== "" &&
        emailEl.value.trim() !== "" &&
        messageEl.value.trim() !== "" &&
        agreeEl.checked;
    btn.disabled = !valid;
}
function openModal() {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}
function closeModal() {
    modal.classList.remove("show");
    document.body.style.overflow = "";
}
// 入力イベント
nameEl.addEventListener("input", () => {
    state.name = nameEl.value;
    saveState();
    updateButton();
});
nameEl.addEventListener("blur", () => {
    if (!state.name.trim()) {
        nameError.textContent = "名前は必須です";
    } else {
        nameError.textContent = "";
    }
});
emailEl.addEventListener("input", () => {
    state.email = emailEl.value;
    saveState();
    updateButton();
});
emailEl.addEventListener("blur", () => {
    if (!state.email.trim()) {
        emailError.textContent = "メールは必須です";
    } else if (!state.email.match(/^[^\s@]+@[^\s@]+$/)) {
        emailError.textContent = "メール形式が不正です";
    } else {
        emailError.textContent = "";
    }
});
messageEl.addEventListener("input", () => {
    state.message = messageEl.value;
    saveState();
    updateButton();
});
messageEl.addEventListener("blur", () => {
    if (!state.message.trim()) {
        messageError.textContent = "お問い合わせ内容は必須です";
    } else {
        messageError.textContent = "";
    }
});
agreeEl.addEventListener("change", () => {
    state.agree = agreeEl.checked;
    saveState();
    updateButton();
});
// 初回ロード
window.addEventListener("DOMContentLoaded", init);
// 送信
form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    saveState();
    // 確認画面へ(次ステップ)
    location.href = "confirm.html";
});
// 開く
openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
});
// 閉じる
closeBtn.addEventListener("click", closeModal);
// 背景クリックで閉じる
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});
// ESCキー対応
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
});