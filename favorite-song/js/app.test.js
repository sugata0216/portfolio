import { describe, it, expect } from "vitest";
// テスト対象の関数をコピー
function validateTitle(value) {
    if (!value) return "曲名を入力してください";
    return "";
}
function validateArtist(value) {
    if (!value) return "アーティスト名を入力してください";
    return "";
}
function validateVideo(value) {
    if (!value) return "YouTube IDを入力してください";
    if (value.length != 11) return "";
    if (!/^[a-zA-Z0-9_-]{11}$/.test(value)) {
        return "YouTube IDが不正です";
    }
    return "";
}
// validateTitleのテスト
describe("validateTitle", () => {
    it("空文字のエラーを返す", () => {
        expect(validateTitle("")).toBe("曲名を入力してください");
    });
    it("値がある場合空文字を返す", () => {
        expect(validateTitle("粉雪")).toBe("");
    });
});
// validateArtistのテスト
describe("validateArtist", () => {
    it("空文字の場合エラーを返す", () => {
        expect(validateArtist("")).toBe("アーティスト名を入力してください");
    });
    it("値がある場合空文字を返す", () => {
        expect(validateArtist("レミオロメン")).toBe("");
    });
});
// validateVideoのテスト
describe("validateVideo", () => {
    it("空文字の場合エラーを返す", () => {
        expect(validateVideo("")).toBe("YouTube IDを入力してください");
    });
    it("11文字の有効なIDの場合空文字を返す", () => {
        expect(validateVideo("dQw4w9WgXcQ")).toBe("");
    });
    it("11文字未満の場合空文字を返す", () => {
        expect(validateVideo("abc")).toBe("");
    });
    it("不正な文字を含む場合エラーを返す", () => {
        expect(validateVideo("あいうえおかきく!")).toBe("");
    });
});