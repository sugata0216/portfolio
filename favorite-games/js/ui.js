"use strict";
export function renderStars(num) {
    return "★".repeat(num) + "☆".repeat(5 - num);
}
export function createCard(game, isFavorite) {
    return `
        <div class="card" data-id="${game.id}">
            <img src="${game.img}" alt="${game.title}">
            <h3>${game.title}</h3>
            <p>${game.genre}</p>
            <p>${renderStars(game.rating)}</p>
            <button aria-label="お気に入り登録" class="fav-btn ${isFavorite ? "active" : ""}"
                aria-pressed="${isFavorite}">
                ${isFavorite ? "❤️" : "🤍"}
            </button>
            </div>
        `;
}