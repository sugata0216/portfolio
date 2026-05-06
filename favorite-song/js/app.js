"use strict";
import { renderCards, updateAuthUI } from "./ui.js";
import { 
    doc as firestoreDoc,
    addDoc,
    setDoc,
    collection,
    deleteDoc,
    updateDoc,
    onSnapshot,
    getDocs,
    query,
    where
 } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { login, logout, observeAuth } from "./auth.js";
import { requireAuth } from "./guard.js";
import { auth, provider, db } from "./firebase.js";
// 状態管理
let songs = [];
// ローカルストレージから取得
const state = {
    favorites: JSON.parse(localStorage.getItem("favorites")) || [],
    editingId: null,
    showFavOnly: false
};
// モーダル要素
const modal = document.getElementById("modal");
const player = document.getElementById("youtube-player");
const closeBtn = document.getElementById("close");
const container = document.getElementById("container");
const formModal = document.getElementById("form-modal");
const openBtn = document.getElementById("open-form-btn");
const closeForm = document.getElementById("close-form");
const modalContent = document.querySelector(".modal-content");
let startY = 0;
let currentY = 0;
let isDragging = false;
const app = document.getElementById("app");
const titleInput = document.getElementById("title");
const artistInput = document.getElementById("artist");
const videoInput = document.getElementById("video");
document.querySelector("#add-form button[type='submit']").disabled = true;
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
let cropper = null;
let croppedBlob = null;
// 画像
const fileInput = document.getElementById("image-file");
const cropModal = document.getElementById("crop-modal");
const cropImage = document.getElementById("crop-image");
const preview = document.getElementById("preview");
const floadBtn = document.querySelector(".floating-btn");
const zoomRange = document.getElementById("zoom-range");
// お気に入り
async function toggleFavorite(id) {
    const user = auth.currentUser;
    if (!user) {
        showToast("ログインしてください", "error");
        return;
    }
    const favId = `${user.uid}_${id}`;
    const favRef = firestoreDoc(db, "favorites", favId);
    if (state.favorites.includes(id)) {
        // お気に入り解除
        state.favorites = state.favorites.filter(f => f !== id);
        await deleteDoc(favRef);
    } else {
        // お気に入り追加
        state.favorites.push(id);
        await setDoc(favRef, {
            uid: user.uid,
            songId: id
        });
    }
    renderCards(songs, state, auth);
}
function openModal(card) {
    document.getElementById("modal-title").textContent = 
        card.querySelector(".info-title")?.textContent || "";
    document.getElementById("modal-artist").textContent = 
        card.querySelector(".info-artist")?.textContent || "";
    document.getElementById("modal-desc").textContent = card.dataset.desc;
    player.src = `https://www.youtube.com/embed/${card.dataset.video}`;
    modal.classList.add("show");
}
function setupEvents() {
    const container = document.getElementById("container");
    const search = document.getElementById("search");
    // クリック
    container.addEventListener("click", handleClick);
    // 検索
    search.addEventListener("input", handleSearch);
}
function handleClick(e) {
    const favBtn = e.target.closest(".fav-btn");
    const deleteBtn = e.target.closest(".delete-btn");
    const card = e.target.closest(".card");
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
        e.stopPropagation();
        startEdit(card.dataset.id);
    }
    else if (deleteBtn) {
        e.stopPropagation();
        handleDelete(card.dataset.id);
    }
    else if (favBtn) {
        e.stopPropagation();
        toggleFavorite(card.dataset.id);
    } 
    else if (card) {
        openModal(card);
    }
}
function handleSearch(e) {
    const keyword = e.target.value.toLowerCase();
    const cards = document.querySelectorAll(".card");
    let visibleCount = 0;
    cards.forEach(card => {
        const title = card.querySelector(".info-title")?.textContent.toLowerCase() || "";
        const artist = card.querySelector(".info-artist")?.textContent.toLowerCase() || "";
        const isMatch = title.includes(keyword) || artist.includes(keyword);
        card.style.display =isMatch ? "block" : "none";
        if (isMatch) visibleCount++;
    });
    showEmptyMessage(visibleCount === 0);
}
async function deleteSong(id) {
    try {
        await deleteDoc(firestoreDoc(db, "songs", id));
    } catch (e) {
        console.error("削除エラー", e);
    }
}
async function handleDelete(id) {
    const confirmed = await showConfirm("本当に削除しますか?", "削除");
    if (!confirmed) return;
    await deleteSong(id);
    renderCards(songs, state, auth);
}
function startEdit(id) {
    const song = songs.find(s => s.id === id);
    document.getElementById("title").value = song.title;
    document.getElementById("artist").value = song.artist;
    document.getElementById("video").value = song.video;
    document.getElementById("desc").value = song.desc;
    state.editingId = id;
    // 現在の画像をプレビューに表示
    if (song.img) {
        preview.innerHTML = `
            <img src="${song.img}">
            <button type="button" id="remove-img">×</button>
        `;
        croppedBlob = null;
        document.getElementById("file-name").textContent = "現在の画像を使用中";
        document.getElementById("remove-img").addEventListener("click", () => {
            croppedBlob = null;
            preview.innerHTML = "";
            fileInput.value = "";
            document.getElementById("file-name").textContent = "選択されていません";
        });
    } else {
        preview.innerHTML = "";
    }
    document.querySelector("#form-modal h2").textContent = "曲を編集";
    document.querySelector("#add-form button[type='submit']").textContent = "更新";
    checkFormValidity();
    formModal.classList.add("show");
}
function showEmptyMessage(isEmpty) {
    let msg = document.getElementById("empty-message");
    if (!msg) {
        msg = document.createElement("div");
        msg.id = "empty-message";
        msg.className = "empty";
        document.getElementById("container").after(msg);
    }
    msg.textContent = isEmpty
        ? "該当する曲の投稿が見つかりませんでした"
        : "";
    msg.style.display = isEmpty ? "block" : "none";
}
function closeModal() {
    modal.classList.add("closing");
    setTimeout(() => {
       modal.classList.remove("show", "closing");
       player.src = "";
       modalContent.style.transform = "translateY(0)"; 
    }, 300);
}
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
    if (value.length !== 11) return "";
    if (!/^[a-zA-Z0-9_-]{11}$/.test(value)) {
        return "YouTube IDが不正です";
    }
    return "";
}
function showValidation(input, message, errorId) {
    const error = document.getElementById(errorId);
    error.textContent = message;
    input.classList.remove("input-error", "input-ok");
    if (message) {
        input.classList.add("input-error");
    } else {
        input.classList.add("input-ok");
    }
    checkFormValidity();
}
function checkFormValidity() {
    const isValid =
        !validateTitle(titleInput.value) &&
        !validateArtist(artistInput.value) &&
        !validateVideo(videoInput.value);
    document.querySelector("#add-form button[type='submit']").disabled = !isValid;
}
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    if (type === "error") toast.style.background = "crimson";
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
       toast.classList.remove("show");
       setTimeout(() => toast.remove(), 300); 
    }, 2500);
}
function closeModalSmooth(modal) {
    const content = modal.querySelector(".modal-content");
    content.style.animation = 
        "modalSpring 0.4s cubic-bezier(.17,.67,.3,1.33) reverse";
    setTimeout(() => {
       modal.classList.remove("show");
       content.style.animation = "";
    }, 300);
}
function uploadImage(file) {
    const cloudName = "dxfa6ehkz";
    const uploadPreset = "erdwzr2h";
    return new Promise((resolve, reject) => {
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                resolve(data.secure_url);
            } else reject();
        };
        xhr.onerror = reject;
        xhr.open("POST", url);
        xhr.send(formData);
    });
}
function validate() {
    return (
        titleInput.value &&
        artistInput.value &&
        videoInput.value.length === 11
    );
}
function openFormModal() {
    formModal.classList.add("show");
}
function closeFormModal() {
    formModal.classList.remove("show");
}
async function saveSong(song) {
    if (state.editingId) {
        await updateDoc(doc(db, "songs", state.editingId), song);
        state.editingId = null;
        showToast("更新しました");
    } else {
        await addDoc(collection(db, "songs"), song);
        showToast("投稿しました");
    }
}
function showConfirm(message, okText="はい") {
    return new Promise((resolve) => {
        const modal = document.getElementById("confirm-modal");
        document.getElementById("confirm-message").textContent = message;
        document.getElementById("confirm-ok").textContent = okText;
        modal.classList.add("show");
        const onOk = () => {
            modal.classList.remove("show");
            cleanup();
            resolve(true);
        };
        const onCancel = () => {
            modal.classList.remove("show");
            cleanup();
            resolve(false);
        };
        const cleanup = () => {
            document.getElementById("confirm-ok").removeEventListener("click", onOk);
            document.getElementById("confirm-cancel").removeEventListener("click", onCancel)
        };
        document.getElementById("confirm-ok").addEventListener("click", onOk);
        document.getElementById("confirm-cancel").addEventListener("click", onCancel);
    });
}
// 閉じる
closeBtn.addEventListener("click", () => {
    modal.classList.remove("show");
    player.src = "";
});
// 背景クリックでも閉じる
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("show");
        player.src = "";
    }
});
onSnapshot(collection(db, "songs"), (snapshot) => {
    songs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    renderCards(songs, state, auth);
    const loader = document.getElementById("loader");
    loader.classList.add("hide");
});
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
});
document.querySelectorAll(".card").forEach(card => {
    observer.observe(card);
});
openBtn.onclick = () => {
    if (!formModal.classList.contains("show")) {
        state.editingId = null;
        document.querySelector("#form-modal h2").textContent = "曲を追加";
        document.querySelector("#add-form button").textContent = "追加";
        preview.innerHTML = "";
        croppedBlob = null;
        document.getElementById("file-name").textContent = "選択されていません";
        formModal.classList.add("show");
    }
};
closeForm.onclick = () => {
    formModal.classList.remove("show");
    state.editingId = null;
    document.querySelector("#form-modal h2").textContent = "曲を追加";
    document.querySelector("#add-form button[type='submit']").textContent = "追加";
};
formModal.addEventListener("click", (e) => {
    if (e.target === formModal) {
        formModal.classList.remove("show");
        state.editingId = null;
        document.querySelector("#form-modal h2").textContent = "曲を追加";
        document.querySelector("#add-form button").textContent = "追加";
        preview.innerHTML = "";
        croppedBlob = null;
        document.getElementById("file-name").textContent = "選択されていません";
    }
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        formModal.classList.remove("show");
        cropModal.classList.remove("show");
    }
});
document.getElementById("filter-fav").onclick = () => {
    state.showFavOnly = !state.showFavOnly;
    document.getElementById("filter-fav").classList.toggle("active", state.showFavOnly);
    renderCards(songs, state, auth);
};
modalContent.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
    isDragging = true;
});
modalContent.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    // 下方向だけ動かす
    if (diff > 0) {
        modalContent.style.transform = `translate'(${diff}px)`;
    }
});
modalContent.addEventListener("touchend", () => {
  isDragging = false;
  const diff = currentY - startY;
  if (diff > 120) {
    closeModal();
  } else {
    // 元に戻る
    modalContent.style.transform = "translateY(0)";
  }
});
modalContent.addEventListener("mousedown", (e) => {
    startY = e.clientY;
    isDragging = true;
});
document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    currentY = e.clientY;
    const diff = currentY - startY;
    if (diff > 0) {
        modalContent.style.transform = `translateY(${diff}px)`;
    }
});
document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    const diff = currentY - startY;
    if (diff > 120) {
        closeModal();
    } else {
        modalContent.style.transform = "translateY(0)";
    }
});
titleInput.addEventListener("input", () => {
    showValidation(titleInput, validateTitle(titleInput.value), "title-error");
});
artistInput.addEventListener("input", () => {
    showValidation(artistInput, validateArtist(artistInput.value), "artist-error");
});
videoInput.addEventListener("input", () => {
    showValidation(videoInput, validateVideo(videoInput.value), "video-error");
});
loginBtn.onclick = async () => {
    loginBtn.textContent = "ログイン中...";
    loginBtn.disabled = true;
    try {
        const user = await login();
        if (user) {
            showToast("ログイン成功!");
        }
    } catch (error) {
        showToast("ログイン失敗", "error");
    } finally {
        loginBtn.textContent = "ログイン";
        loginBtn.disabled = false;
    }
};
logoutBtn.onclick = async () => {
    const confirmed = await showConfirm("ログアウトしますか?", "ログアウト");
    if (!confirmed) return;
    try {
        await logout();
        showToast("ログアウトしました");
    } catch (error) {
        showToast("ログアウト失敗", "error");
    }
};
observeAuth(async (user) => {
    updateAuthUI(user);
    if (user) {
        // ログイン時にお気に入りをFireStoreから取得
        const { getDocs, query, where } = await import(
            "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
        );
        const q = query(
            collection(db, "favorites"),
            where("uid", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        state.favorites = snapshot.docs.map(doc => doc.data().songId);
        localStorage.removeItem("favorites");
        renderCards(songs, state, auth);
    } else {
        state.favorites = [];
        renderCards(songs, state, auth);
    }
});
document.getElementById("crop-btn").addEventListener("click", () => {
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({
        width: 500,
        height: 500
    });
    canvas.toBlob((blob) => {
        croppedBlob = blob;
        // プレビュー更新
        const url = URL.createObjectURL(blob);
        preview.innerHTML = `
            <img src="${url}">
            <button type="button" id="remove-img">×</button>
        `;
        document.getElementById("remove-img").addEventListener("click", () => {
            croppedBlob = null;
            preview.innerHTML = "";
            fileInput.value = "";
        });
        cropModal.classList.remove("show");
        cropper.destroy();
        cropper = null;
    }, "image/jpeg", 0.9);
});
document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = (y / rect.height - 0.5) * -10;
        const rotateY = (x / rect.width - 0.5) * 10;
        card.style.transform = 
            `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });
    card.addEventListener("mouseleave", () => {
        card.style.transform = "none";
    });
});
document.addEventListener("click", (e) => {
    const target = e.target.closest("button .card");
    if (!target) return;
    const circle = document.createElement("span");
    circle.classList.add("ripple");
    const rect = target.getBoundingClientRect();
    circle.style.left = `${e.clientX - rect.left}px`;
    circle.style.top = `${e.clientY - rect.top}px`;
    target.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
});
document.addEventListener("mousemove", (e) => {
    const rect = floadBtn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 120) {
        floadBtn.style.transform =
            `translate(${dx * 0.2}px, ${dy * 0.2}px) scale(1.1)`;
    } else {
        floadBtn.style.transform = "";
    }
});
if (zoomRange) {
    zoomRange.addEventListener("input", () => {
        if (!cropper) return;
        cropper.zoomTo(zoomRange.value);
    });
}
document.getElementById("crop-modal").addEventListener("click", (e) => {
    if (e.target === "crop-modal") {
        e.currentTarget.classList.remove("show");
    }
});
document.getElementById("close-crop").addEventListener("click", () => {
    cropModal.classList.remove("show");
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    cropImage.src = "";
    // 同じファイルを再選択できるようにリセット
    fileInput.value = "";
});
document.getElementById("cancel-crop").addEventListener("click", () => {
    cropModal.classList.remove("show");
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    cropImage.src = "";
    fileInput.value = "";
});
document.getElementById("skip-crop").addEventListener("click", () => {
    const file = fileInput.files[0];
    if (!file) return;
    // Blobとしてそのまま使用
    croppedBlob = file;
    // プレビュー更新
    const url = URL.createObjectURL(file);
    preview.innerHTML = `
        <img src="${url}">
        <button type="button" id="remove-img">×</button>
    `;
    document.getElementById("remove-img").addEventListener("click", () => {
        croppedBlob = null;
        preview.innerHTML = "";
        fileInput.value = "";
        document.getElementById("file-name").textContent = "選択されていません";
    });
    // モーダルを閉じる
    cropModal.classList.remove("show");
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    cropImage.src = "";
});
document.addEventListener("DOMContentLoaded", async () => {
    setupEvents();
    document.getElementById("file-select-btn").addEventListener("click", () => {
        fileInput.click();
    });
    formModal.classList.remove("show");
    // 追加・更新
    const form = document.getElementById("add-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validate()) {
            showToast("入力が不足しています", "error");
            return;
        }
        const file = document.getElementById("image-file")?.files[0];
        const user = auth.currentUser;
        if (!user) {
            showToast("ログインしてください", "error");
            return;
        };
        let imageUrl = "";
        // 編集モードの場合は既存の画像URLを引き継ぐ
        if (state.editingId) {
            const currentSong = songs.find(s => s.id === state.editingId);
            imageUrl = currentSong?.img || "";
        }
        // 新しい画像が選択されていれば上書き
        if (croppedBlob) {
            imageUrl = await uploadImage(croppedBlob);
        }
        const song = {
            title: titleInput.value,
            artist: artistInput.value,
            img: imageUrl,
            video: videoInput.value,
            desc: document.getElementById("desc").value,
            uid: user.uid
        };
        try {
            if (state.editingId) {
                // 編集モード
                await updateDoc(
                    firestoreDoc(db, "songs", state.editingId), 
                    song
                );
                state.editingId = null;
                showToast("更新しました!");
            } else {
                // 追加モード
                await addDoc(collection(db, "songs"), song);
                showToast("投稿しました!");
            }
            renderCards(songs, state, auth);
            e.target.reset();
            preview.innerHTML = "";
            croppedBlob = null;
            formModal.classList.remove("show");
            document.querySelector("#add-form button[type='submit']").textContent = "追加";
            closeModalSmooth(formModal);
        } catch (err) {
            showToast("エラーが発生しました", "error");
        }
    });
    if (!fileInput) {
        return;
    }
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        // ファイル名を表示
        document.getElementById("file-name").textContent =
            file ? file.name : "選択されていません";
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            showToast("画像を選択してください", "error");
            return;
        }
        // 古いCropperを必ず破棄
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        const url = URL.createObjectURL(file);
        // モーダルを先に表示
        cropModal.classList.add("show");
        // crop-imageをリセット
        cropImage.src = "";
        const initCropper = () => {
            if (typeof Cropper === "undefined") {
                return;
            }
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            cropper = new Cropper(cropImage, {
                aspectRatio: 1,
                viewMode: 2,
                autoCropArea: 0.8,
            });
        };
        if (cropImage.complete && cropImage.naturalWidth > 0) {
            // キャッシュ済みの場合
            initCropper();
        } else {
            cropImage.onload = initCropper;
        }
        cropImage.src = url;
    });
});
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    setTimeout(() => {
       loader.classList.add("hide"); 
    }, 500);
});