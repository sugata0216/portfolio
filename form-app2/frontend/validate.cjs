function validateForm(state) {
    const errors = {};
    if (!state.name.trim()) {
        errors.name = "名前は必須です";
    }
    if (!state.email.trim()) {
        errors.email = "メールは必須です";
    } else if (!state.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.email = "メール形式が不正です";
    }
    if (!state.message.trim()) {
        errors.message = "内容は必須です";
    }
    if (!state.agree) {
        errors.agree = "同意してください";
    }
    return errors;
}
module.exports = { validateForm };