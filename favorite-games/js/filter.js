"use strict";
export function filterGames(games, state) {
    return games.filter(game => {
        return (
            game.title.toLowerCase().includes(state.keyword) &&
            (state.genre === "all" || game.genre === state.genre) &&
            (!state.showFavoritesOnly || state.favorites.includes(Number(game.id)))
        );
    });
}