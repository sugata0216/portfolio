"use strict";
// 表示したいポケモン
const pokemonList = ["sprigatito", "lucario", "eevee", "tropius", "wailord", "applin", "bulbasaur", "gardevoir"];
// 日本語変換
const nameJP = {
    sprigatito: "ニャオハ",
    lucario: "ルカリオ",
    eevee: "イーブイ",
    tropius: "トロピウス",
    wailord: "ホエルオー",
    applin: "カジッチュ",
    bulbasaur: "フシギダネ",
    gardevoir: "サーナイト"
};
const typeJP = {
    normal: "ノーマル",
    fire: "ほのお",
    water: "みず",
    grass: "くさ",
    electric: "でんき",
    ice: "こおり",
    fighting: "かくとう",
    poison: "どく",
    ground: "じめん",
    flying: "ひこう",
    psychic: "エスパー",
    bug: "むし",
    rock: "いわ",
    ghost: "ゴースト",
    dragon: "ドラゴン",
    dark: "あく",
    steel: "はがね",
    fairy: "フェアリー"
};
document.addEventListener("DOMContentLoaded", () => {
    // 要素取得
    const container = document.querySelector(".card-container");
    const searchInput = document.getElementById("search");
    const filterButtons = document.querySelectorAll(".filters button");
    const loading = document.getElementById("loading");
    const errorUI = document.getElementById("error");
    const retryBtn = document.getElementById("retry-btn");
    // 状態
    let allPokemon = [];
    let currentFilter = "all";
    let favorites = getFavorites();
    let currentPage = 1;
    const perPage = 4;
    // ローディング
    function hideLoading() {
        loading.classList.add("hidden");
    }
    // API取得
    async function fetchPokemon() {
        container.innerHTML = "Loading...";
        try {
            showSkeleton();
            hideError();
            console.log("開始");
            container.innerHTML = "";
                const detailedData = await Promise.all(
                    pokemonList.map(async (name) => {
                        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
                        if (!res.ok) throw new Error("ステータスエラー: " + res.status);
                        return res.json();
                    })
                );
                allPokemon = detailedData;
                render();
        } catch (error) {
            container.innerHTML = "取得に失敗しました";
            console.error("エラー詳細:", error);
            showError();
            alert("ポケモンの取得に失敗しました");
        } finally {
            setTimeout(hideLoading, 300);
            console.log("終了");
        }
    }
    // 描画
    function render() {
        container.innerHTML = "";
        const keyword = searchInput.value.toLowerCase();
        const filtered = allPokemon.filter(pokemon => {
            const jpName = nameJP[pokemon.name] || pokemon.name;
            const nameMatch = jpName
                .toLowerCase()
                .includes(keyword);
            const typeMatch =
                currentFilter === "all" ||
                pokemon.types.some(t => t.type.name === currentFilter);
            return nameMatch && typeMatch;
        });
        if (filtered.length === 0) {
            container.innerHTML = "<p>見つかりませんでした</p>";
            document.getElementById("page-info").textContent = "0 / 0";
            document.getElementById("prev").disabled = true;
            document.getElementById("next").disabled = true;
            return;
        }
        const totalPages = Math.ceil(filtered.length / perPage);
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        const start = (currentPage - 1) * perPage;
        const end = start + perPage;
        const paginated = filtered.slice(start, end);
        paginated.forEach(pokemon => {
            const card = createCard(pokemon);
            container.appendChild(card);
        });
        updatePagination(filtered.length);
    }
    // カード生成
    function createCard(pokemon) {
        const card = document.createElement("div");
        card.classList.add("card");
        const name = pokemon.name;
        const image = pokemon.sprites.front_default;
        const types = pokemon.types.map(t => typeJP[t.type.name]);
        // お気に入り判定
        const isFav = favorites.includes(name);
        card.innerHTML = `
            <button class="fav-btn ${isFav ? "active" : ""}">♥</button>
            <img src="${image}" alt="${name}"> 
            <h2>${nameJP[name] || name}</h2>
            <p>タイプ: ${types.join(", ")}</p>
        `;
        // お気に入り
        const favBtn = card.querySelector(".fav-btn");
        favBtn.addEventListener("click", (e) => {
            console.log("♥クリック");
            e.stopPropagation();
            if (favorites.includes(name)) {
                favorites = favorites.filter(f => f !== name);
                favBtn.classList.remove("active");
            } else {
                favorites.push(name);
                favBtn.classList.add("active");
            }
            localStorage.setItem("favorites", JSON.stringify(favorites));
        });
        // モーダル
        card.addEventListener("click", (e) => {
            const isFav = e.target.closest(".fav-btn");
            if (isFav) {
                console.log("ハート経由なのでモーダル開かない");
                return;
            }
            console.log("カードクリック");
            showModal(pokemon);
        });
        return card;
    }
    // モーダル
    function showModal(pokemon) {
        const modal = document.querySelector(".modal");
        const modalImg = document.getElementById("modal-img");
        const modalName = document.getElementById("modal-name");
        const modalType = document.getElementById("modal-type");
        modalImg.src = pokemon.sprites.front_default;
        modalName.textContent = nameJP[pokemon.name] || pokemon.name;
        modalType.textContent = pokemon.types.map(t => typeJP[t.type.name] || t.type.name).join(", ");
        // ハート消す
        const favBtn = modal.querySelector(".fav-btn");
        if (favBtn) favBtn.style.display = "none";
        modal.style.display = "flex";
    }
    function showError() {
        errorUI.classList.remove("hidden");
    }
    function hideError() {
        errorUI.classList.add("hidden");
    }
    function showSkeleton() {
        container.innerHTML = "";
        for (let i = 0; i < 8; i++) {
            const skeletonCard = document.createElement("div");
            skeletonCard.classList.add("card");
            skeletonCard.innerHTML = `
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-text" style="width: 80%"></div>
            <div class="skeleton skeleton-small"></div>
            `;
            container.appendChild(skeletonCard);
        }
    }
    function updatePagination(total) {
        const totalPages = Math.ceil(total / perPage);
        document.getElementById("page-info").textContent =
        `${currentPage} / ${totalPages}`;
        document.getElementById("prev").disabled = currentPage === 1;
        document.getElementById("next").disabled = currentPage === totalPages;
    }
    function setActiveFilter(filter) {
        currentFilter = filter;
            filterButtons.forEach(btn => {
                btn.classList.toggle("active", btn.dataset.filter === filter);
            });
            currentPage = 1;
            render();
    }
    retryBtn.addEventListener("click", () => {
        fetchPokemon();
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".modal").style.display = "none";
    });
    // フィルター
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            console.log("クリック", btn.dataset.filter);
            setActiveFilter(btn.dataset.filter);
        });
    });
    // 検索
    searchInput.addEventListener("input", () => {
        currentPage = 1;
        render();
    });
    document.getElementById("prev").addEventListener("click", () => {
        currentPage--;
        render();
    });
    document.getElementById("next").addEventListener("click", () => {
        currentPage++;
        render();
    });
    // 初期化処理
    fetchPokemon();
});
// LocalStorage
function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}