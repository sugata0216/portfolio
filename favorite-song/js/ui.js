"use strict";
export function renderCards(songs = [], state, auth) {
    const container = document.getElementById("container");
    container.innerHTML = "";
    // お気に入りフィルター
    const filtered = state.showFavOnly
        ? songs.filter(song => state.favorites.includes(song.id))
        : songs;
    if (!filtered || filtered.length === 0) {
        container.innerHTML = `
            <div class="empty">
                ${state.showFavOnly ? "♥ お気に入りがありません" : "🎵 曲がまだありません"}
            </div>
        `;
        return;
    }
    filtered.forEach(song => {
        const isFav = state.favorites.includes(song.id);
        const isOwner = song.uid === auth.currentUser?.uid;
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.id = song.id;
        card.dataset.video = song.video;
        card.dataset.desc = song.desc;
        card.innerHTML = `
            <button class="fav-btn ${isFav ? "active" : ""}">
                ${isFav ? "♥" : "♡"}
            </button>
            ${isOwner ? '<button class="edit-btn">編集</button>' : ""}
            ${isOwner ? '<button class="delete-btn">削除</button>' : ""}
            <img src="${song.img}">
            <div class="info">
                <span class="info-title">${song.title}</span>
                <span class="info-artist">${song.artist}</span>
            </div>
        `;
        container.appendChild(card);
    });
}
export function updateAuthUI(user) {
    const nameEl = document.getElementById("user-name");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    if (user) {
        nameEl.textContent = `👋 ${user.displayName}`;
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        nameEl.textContent = "未ログイン";
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }
}