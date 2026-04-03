"use strict";
// allPokemon(ポケモンデータの配列)を受け取り、中身があるかを確認
function testFetch(allPokemon) {
    if (allPokemon.length === 0) {
        console.error("データ取得失敗");
    } else {
        console.log("データ取得成功");
    }
}
function runTests(allPokemon) {
    // テスト中に予期しないエラーが起きても、ページ全体がクラッシュしないように保護している
    try {
        // ポケモンデータが1件以上あるか
        console.assert(allPokemon.length > 0, "データなし");
        // .card要素がHTML上に1つ以上表示されているか
        const cards = document.querySelectorAll(".card");
        console.assert(cards.length > 0,"カードが表示されていない");
    } catch (e) {
        console.error("テスト中にエラー:", e);
    }
}