import { auth } from "./firebase.js";
export function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        alert("ログインしてください");
        return false;
    }
    return true;
}