"use strict";
// フォーム全体を取得
const form = document.getElementById("registerForm");
// エラーメッセージを表示する<ul>要素を取得
const errorList = document.getElementById("errorMessages");
// 送信ボタンを取得
const submitBtn = document.getElementById("submitBtn");
// 利用規約チェックボックスを取得
const terms = document.getElementById("terms");
function updateSubmitButton() {
  submitBtn.disabled = !terms.checked;
}
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("formData");
  if (saved) {
    const data = JSON.parse(saved);
    form.last_name.value = data.lastName || "";
    form.first_name.value = data.firstName || "";
    form.address.value = data.address || "";
    form.email.value = data.email || "";
    form.tel.value = data.tel || "";
    form.birthday.value = data.birthday || "";
    form.age.value = data.age || "";
    // 規約
    form.terms.checked = data.terms || false;
  }
  updateSubmitButton();
});

/* 規約チェックで送信ボタンON */
terms.addEventListener("change", updateSubmitButton);
form.addEventListener("submit", e => {
  // ページリロードを止める
  e.preventDefault();
  // 前回表示されたエラーを消す
  errorList.innerHTML = "";
  /* 入力データをまとめてオブジェクト化 */
  const data = {
    // trim()は前後の空白を削除
    lastName: form.last_name.value.trim(),
    firstName: form.first_name.value.trim(),
    address: form.address.value.trim(),
    email: form.email.value.trim(),
    tel: form.tel.value.trim(),
    birthday: form.birthday.value,
    age: form.age.value,
    // 性別が未選択の場合は空文字を入れる
    gender: form.gender.value || "",
    // パスワード
    password: form.password.value,
    passwordConfirm: form.password_confirm.value,
    // 1.NodeListを配列に変換 [...form.magazine]
    // 2.チェックされているものだけ抽出 filter()
    // 3.valueだけ取り出す map()
    magazine: [...form.magazine]
      .filter(c => c.checked)
      .map(c => c.value),
    // 利用規約のチェック状態（true / false）
    terms: form.terms.checked
  };

  /* バリデーション */
  const errors = [];
  // 姓が未入力ならエラー追加
  if (!data.lastName) errors.push("姓は必須です");
  // 名が未入力ならエラー追加
  if (!data.firstName) errors.push("名は必須です");
  // メール未入力
  if (!data.email) errors.push("メールアドレスは必須です");
  // パスワードが8文字未満ならエラー
  if (data.password.length < 8)
    errors.push("パスワードは8文字以上必要です");
  // パスワードが一致しない場合
  if (data.password !== data.passwordConfirm)
    errors.push("パスワードが一致しません");
  // 利用規約未チェック
  if (!data.terms)
    errors.push("利用規約に同意してください");
  /* エラーがある場合の処理 */
  if (errors.length > 0) {
    // エラーの数だけ<li>を作る
    errors.forEach(err => {
      // <li>要素を生成
      const li = document.createElement("li");
      // エラーメッセージをセット
      li.textContent = err;
      // <ul>に追加
      errorList.appendChild(li);
    });
    // 画面を一番上へ
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
    // ここで処理を終了
    return;
  }

  /* 保存して確認画面へ */
  localStorage.setItem("formData", JSON.stringify(data));
  // confirm.htmlへページ遷移
  location.href = "confirm.html";
});
form.addEventListener("input", () => {
  const data = {
    lastName: form.last_name.value,
    firstName: form.first_name.value,
    address: form.address.value,
    email: form.email.value,
    tel: form.tel.value,
    birthday: form.birthday.value,
    age: form.age.value,
    gender: form.gender.value || "",
    magazine: [...form.magazine]
      .filter(c => c.checked)
      .map(c => c.value),
    terms: form.terms.checked
  };
  localStorage.setItem("formData", JSON.stringify(data));
});