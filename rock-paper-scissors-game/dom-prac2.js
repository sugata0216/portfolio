"use strict";
/* 「ぽん！」と表示する要素を取得 */
const pon = document.getElementById("pon");
const goo = document.getElementById("goo");
const choki = document.getElementById("choki");
const par = document.getElementById("par");
/* ユーザーの手を表示する場所 */
const user_hand = document.getElementById("user_hand");
/* コンピュータの手を表示する場所 */
const computer_hand = document.getElementById("computer_hand");
/* 勝敗結果を表示する場所 */
const victory_or_defeat = document.getElementById("victory_or_defeat");
const judgeTable = {
    "グー":   { "チョキ": "あなたの勝ち!", "パー": "あなたの負け・・・" },
    "チョキ": { "パー": "あなたの勝ち!", "グー": "あなたの負け・・・" },
    "パー":   { "グー": "あなたの勝ち!", "チョキ": "あなたの負け・・・" }
};
function computer_pon() {
    /* 配列に3つの手を格納 */
    const hands = ["グー", "チョキ", "パー"];
    /* 
       Math.random() → 0以上1未満の乱数
       ×3 → 0〜2.999...
       Math.floor() → 小数切り捨て
       → 0,1,2 のどれか
       
       → 配列のどれかをランダム取得
    */
    return hands[Math.floor(Math.random() * hands.length)];
}
function janken_judge(u_hand, c_hand) {
    if (u_hand === c_hand) {
        return "あいこ!";
    }
    return judgeTable[u_hand][c_hand];
}
function playJanken(u_hand) {
    pon.textContent = "ぽん!";
    user_hand.textContent = u_hand;

    const c_hand = computer_pon();
    computer_hand.textContent = c_hand;

    const result = janken_judge(u_hand, c_hand);
    victory_or_defeat.textContent = result;
}
goo.onclick   = () => playJanken("グー");
choki.onclick = () => playJanken("チョキ");
par.onclick   = () => playJanken("パー");