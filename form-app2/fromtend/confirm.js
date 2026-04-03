"use strict";
const STORAGE_KEY = "contactFormData";
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
// 表示
window.addEventListener("DOMContentLoaded", () => {
    const data = getData();
    if (!data) {
        location.href = "index.html";
        return;
    }
    document.getElementById("name").textContent = data.name;
    document.getElementById("email").textContent = data.email;
    document.getElementById("message").textContent = data.message;
})
// 送信処理
const btn = document.getElementById("submitBtn");
const loading = document.getElementById("loading");
btn.addEventListener("click", async () => {
    const data = getData();
    if (!data) return;
    btn.style.display = "none";
    loading.style.display = "block";
    try {
        const response = await fetch("https://portfolio-3asr.onrender.com/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error("送信失敗");
        }
        // 成功
        localStorage.removeItem(STORAGE_KEY);
        location.href = "thanks.html";
    } catch (error) {
        alert("送信に失敗しました。もう一度お試しください。");
        btn.disabled = false;
        loading.style.disabled = "none";
        console.error(error);
    }
});