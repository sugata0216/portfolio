"use strict";
import { games } from "./data.js";
import { createCard } from "./ui.js";
import { filterGames } from "./filter.js";
// 状態管理
const state = {
    keyword: "",
    genre: "all",
    favorites: JSON.parse(localStorage.getItem("favorites")) || [],
    showFavoritesOnly: false
};
const gameList = document.getElementById("game-list");
const searchInput = document.getElementById("search");
const filter = document.getElementById("filter");
const favOnlyBtn = document.getElementById("fav-only");
const statusLabel = document.getElementById("status-label");
let timeout;
// 表示関数
function renderGameList() {
    let filtered = games.filter(game => {
        return (
            game.title.toLowerCase().includes(state.keyword) &&
            (state.genre === "all" || game.genre === state.genre) &&
            (!state.showFavoritesOnly || state.favorites.includes(Number(game.id)))
        );
    });
    if (filtered.length === 0) {
        gameList.innerHTML = "<p>該当するゲームがありません</p>";
        return;
    }
    gameList.innerHTML = filtered
        .map(g => createCard(g, state.favorites.includes(g.id)))
        .join("");
    updateStatus();
}
// ジャンル自動生成
function initGenres() {
    const genreList = [
        ...new Set(
            games
                // 空白除去
                .map(g => g.genre?.trim())
                // 空を除外
                .filter(g => g)
        )
    ];
    const genres = [
        {value: "all", label: "すべて" },
        ...genreList.map(g => ({ value: g, label: g}))
    ];
    filter.innerHTML = genres
        .map(g => `<option value="${g.value}">${g.label}</option>`)
        .join("");
}
function updateStatus() {
    statusLabel.textContent = state.showFavoritesOnly
        ? "❤️ お気に入りのみ表示中"
        : "すべてのゲームを表示中";
}
// 入力イベント
searchInput.addEventListener("input", (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        state.keyword = e.target.value.toLowerCase();
        renderGameList();
    }, 300);
});
filter.addEventListener("change", (e) => {
    state.genre = e.target.value;
    renderGameList();
});
favOnlyBtn.addEventListener("click", () => {
    state.showFavoritesOnly = !state.showFavoritesOnly;
    favOnlyBtn.classList.toggle("active");
    favOnlyBtn.setAttribute("aria-pressed", state.showFavoritesOnly);
    // テキスト変更
    favOnlyBtn.textContent = state.showFavoritesOnly 
    ? "❤️ お気に入りのみ" : 
    "🤍 すべて表示";
    renderGameList();
});
gameList.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const id = Number(card.dataset.id);
    const favBtn = e.target.closest(".fav-btn");
    if (favBtn) {
        if (state.favorites.includes(id)) {
            state.favorites = state.favorites.filter(f => f !== id);
        } else {
            state.favorites.push(id);
        }
        try {
            localStorage.setItem("favorites", JSON.stringify(state.favorites));
        } catch (e) {
            console.error("保存に失敗しました", e);
        }
        renderGameList();
        // 他の処理に行かない
        return;
    }
});
// 初期表示
initGenres();
renderGameList();