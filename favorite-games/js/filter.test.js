import { filterGames } from "./filter.js";
const games = [
    { id: 1, title: "ポケモン", genre: "RPG" },
    { id: 2, title: "ゼルダ", genre: "アクション" }
];
test("キーワード検索", () => {
    const state = {
        keyword: "ポケ",
        genre: "all",
        favorites: [],
        showFavoritesOnly: false
    };
    const result = filterGames(games, state);
    expect(result.length).toBe(1);
});
test("ジャンルフィルタ", () => {
    const state = {
        keyword: "",
        genre: "RPG",
        favorites: [],
        showFavoritesOnly: false
    };
    const result = filterGames(games, state);
    expect(result[0].title).toBe("ポケモン");
});
test("お気に入りのみ", () => {
    const state = {
        keyword: "",
        genre: "all",
        favorites: [1],
        showFavoritesOnly: true
    };
    const result = filterGames(games, state);
    expect(result.length).toBe(1);
});