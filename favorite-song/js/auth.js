import { auth, provider } from "./firebase.js";
import { 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
// ログイン
export async function login() {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        if (error.code === "auth/popup-closed-by-user") {
            return null;
        }
        throw error;
    }
}
// ログアウト
export async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
}
// 状態監視
export function observeAuth(callback) {
    onAuthStateChanged(auth, (user) => {
        callback(user);
    });
}
// 現在ユーザー
export function getCurrentUser() {
    return auth.currentUser;
}