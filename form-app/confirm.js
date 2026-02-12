// 変数の誤字や未宣言変数の使用などをエラーにしてくれる
"use strict";
// localStorageから "formData" という名前のデータを取得
const data = JSON.parse(localStorage.getItem("formData"));
// 確認用テーブル（tbody）の要素を取得
const list = document.getElementById("confirmList");

const genderMap = {
  "0": "男",
  "1": "女",
  "2": "その他"
};

const magazineMap = {
  "1": "IT",
  "2": "営業",
  "3": "接客",
  "4": "医療"
};

// 1項目分をテーブルに追加する関数
function add(label, value) {
  const tbody = document.getElementById('confirmList');

  const tr = document.createElement('tr');

  const th = document.createElement('th');
  th.textContent = label;

  const td = document.createElement('td');
  td.textContent = value || '未入力';

  tr.appendChild(th);
  tr.appendChild(td);
  tbody.appendChild(tr);
}

add("姓", data.lastName);
add("名", data.firstName);
add("住所", data.address);
add("メール", data.email);
add("電話番号", data.tel);
add("生年月日", data.birthday);
add("年齢", data.age);
add("性別", genderMap[data.gender]);
add(
  "希望メールマガジン",
  data.magazine.map(m => magazineMap[m]).join("、") || "なし"
);

document.getElementById("back").onclick = () => history.back();

document.getElementById("complete").onclick = () => {
  localStorage.removeItem("formData");
  alert("送信が完了しました（デモ）");
  location.href = "form.html";
};