"use strict";
function testFetch(allPokemon) {
    if (allPokemon.length === 0) {
        console.error("データ取得失敗");
    } else {
        console.log("データ取得成功");
    }
}
function runTests(allPokemon) {
    try {
        console.assert(allPokemon.length > 0, "データなし");
        const cards = document.querySelectorAll(".card");
        console.assert(cards.length > 0,"カードが表示されていない");
    } catch (e) {
        console.error("テスト中にエラー:", e);
    }
}