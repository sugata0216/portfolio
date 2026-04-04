const { validateForm } = require("./validate.cjs");
describe("フォームバリデーション", () => {
    test("すべて正常ならエラーなし", () => {
        // 入力データを用意
        const state = {
            name: "テスト",
            email: "test@example.com",
            message: "内容",
            agree: true
        };
        //　関数を実行
        const result = validateForm(state);
        // resultが{}と完全に一致するか検証
        expect(result).toEqual({});
    });
    test("名前未入力", () => {
        const state = {
            // 名前だけ空
            name: "",
            email: "test@example.com",
            message: "内容",
            agree: true
        };
        const result = validateForm(state);
        expect(result.name).toBe("名前は必須です");
    });
    test("メール形式不正", () => {
        const state = {
            name: "テスト",
            // @も.もない不正な形式
            email: "aaa",
            message: "内容",
            agree: true
        };
        const result = validateForm(state);
        expect(result.email).toBe("メール形式が不正です");
    });
    test("チェック未同意", () => {
        const state = {
            name: "テスト",
            email: "test@example.com",
            message: "内容",
            // 同意チェックなし
            agree: false
        };
        const result = validateForm(state);
        expect(result.agree).toBe("同意してください");
    });
});