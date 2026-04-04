"use strict";
const STORAGE_KEY = "contactFormData";
// 要素取得
const btn = document.getElementById("submitBtn");
const loading = document.getElementById("loading");
// データ取得
function getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data);
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}
// サニタイズ(XSS対策)
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, (char) => {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}
// 初期表示
window.addEventListener("DOMContentLoaded", () => {
    const data = getData();
    if (!data) {
        alert("入力データがありません");
        location.href = "index.html";
        return;
    }
    // 表示
    document.getElementById("name").textContent = escapeHTML(data.name);
    document.getElementById("email").textContent = escapeHTML(data.email);
    document.getElementById("message").textContent = escapeHTML(data.message);
})
// 送信処理(API連携)
btn.addEventListener("click", async () => {
    const data = getData();
    if (!data) return;
    btn.style.display = "none";
    loading.style.display = "block";
    try {
        const API_URL = "https://portfolio-3asr.onrender.com";
        const response = await fetch(`${API_URL}/api/contact`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("送信失敗");
        // 成功
        alert("送信が完了しました");
        localStorage.removeItem(STORAGE_KEY);
        location.href = "thanks.html";
    } catch (error) {
        alert("送信に失敗しました。もう一度お試しください。");
        btn.disabled = false;
        loading.style.display = "none";
        console.error(error);
    }
});