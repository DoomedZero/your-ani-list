import { fetchAnimeLists } from "./api/anilist.js";

const homeView = document.getElementById("homeView");
const listView = document.getElementById("listView");
const navLinks = document.querySelectorAll("[data-view]");
const statusTabs = document.querySelectorAll("[data-status].status-tab");
const animeSearch = document.getElementById("animeSearch");
const animeGrid = document.getElementById("animeGrid");
const listTitle = document.getElementById("listTitle");
const listStatus = document.getElementById("listStatus");
const pickNextButton = document.getElementById("pickNextButton");
const pickAgainButton = document.getElementById("pickAgainButton");
const nextPick = document.getElementById("nextPick");
const pickTitle = document.getElementById("pickTitle");
const pickMessage = document.getElementById("pickMessage");
const pickCover = document.getElementById("pickCover");

const statusDetails = {
    COMPLETED: {
        title: "Completed",
        description: "Every story you've finished."
    },
    PLANNING: {
        title: "Planning",
        description: "The stories waiting for you."
    },
    DROPPED: {
        title: "Dropped",
        description: "Stories you decided not to continue."
    }
};

let animeLists = {
    COMPLETED: [],
    PLANNING: [],
    DROPPED: []
};
let activeStatus = "COMPLETED";
let activeView = "home";
let dataLoaded = false;
let loadingFailed = false;

function showView(view, status = activeStatus) {
    activeView = view;
    homeView.hidden = view !== "home";
    listView.hidden = view !== "list";

    navLinks.forEach((link) => {
        const isActive = link.dataset.view === view;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });

    if (view === "list") {
        setStatus(status);
        renderSearchResults();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function setStatus(status) {
    if (!statusDetails[status]) status = "COMPLETED";
    activeStatus = status;
    const details = statusDetails[status];

    listTitle.textContent = details.title;

    statusTabs.forEach((tab) => {
        const isActive = tab.dataset.status === status;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-pressed", String(isActive));
    });
}

function animeTitle(anime) {
    return anime.media.title.english || anime.media.title.romaji || "Untitled anime";
}

function showList(list) {
    animeGrid.innerHTML = list.map((anime) => {
        const title = animeTitle(anime);
        const cover = anime.media.coverImage?.large;
        return `
            <article class="anime-card">
                ${cover
                    ? `<img src="${cover}" alt="Cover of ${escapeHTML(title)}" loading="lazy">`
                    : `<div class="cover-placeholder" aria-label="No cover available">No cover</div>`}
                <h2>${escapeHTML(title)}</h2>
            </article>
        `;
    }).join("");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function renderSearchResults() {
    if (!dataLoaded) {
        animeGrid.innerHTML = "";
        listStatus.textContent = loadingFailed
            ? "Couldn't load your list. Please try refreshing the page."
            : "Loading your collection...";
        return;
    }

    const searchText = animeSearch.value.trim().toLowerCase();
    const filteredList = animeLists[activeStatus].filter((anime) =>
        animeTitle(anime).toLowerCase().includes(searchText)
    );

    showList(filteredList);
    listStatus.textContent = filteredList.length === 0
        ? (searchText ? "No anime found. Try another search." : "No anime in this list yet.")
        : `${filteredList.length} anime`;
}

function pickNextAnime() {
    if (!dataLoaded) {
        nextPick.hidden = false;
        pickTitle.textContent = loadingFailed ? "Couldn't load your list" : "Your list is still loading";
        pickMessage.textContent = loadingFailed
            ? "Please refresh the page and try again."
            : "Give it a moment, then try picking again.";
        pickCover.hidden = true;
        return;
    }

    const planning = animeLists.PLANNING;
    if (planning.length === 0) {
        nextPick.hidden = false;
        pickTitle.textContent = "Nothing in Planning yet";
        pickMessage.textContent = "Add a title to your AniList Planning list and it can show up here.";
        pickCover.hidden = true;
        return;
    }

    const anime = planning[Math.floor(Math.random() * planning.length)];
    pickTitle.textContent = animeTitle(anime);
    pickMessage.textContent = "Maybe this is the story for your next quiet evening.";
    pickCover.hidden = !anime.media.coverImage?.large;
    if (!pickCover.hidden) {
        pickCover.src = anime.media.coverImage.large;
        pickCover.alt = `Cover of ${animeTitle(anime)}`;
    }
    nextPick.hidden = false;
}

navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const view = link.dataset.view;
        const status = link.dataset.status || activeStatus;
        showView(view, status);
        history.replaceState(null, "", view === "home" ? "#home" : `#list`);
    });
});

statusTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        setStatus(tab.dataset.status);
        renderSearchResults();
    });
});

animeSearch.addEventListener("input", renderSearchResults);
pickNextButton.addEventListener("click", () => {
    pickNextAnime();
    nextPick.scrollIntoView({ behavior: "smooth", block: "center" });
});
pickAgainButton.addEventListener("click", pickNextAnime);

const hash = window.location.hash.slice(1);
const initialStatus = statusDetails[hash.toUpperCase()] ? hash.toUpperCase() : "COMPLETED";
const initialView = hash === "list" || statusDetails[hash.toUpperCase()] ? "list" : "home";
showView(initialView, initialStatus);

fetchAnimeLists()
    .then((lists) => {
        animeLists = lists;
        dataLoaded = true;
        if (activeView === "list") renderSearchResults();
    })
    .catch((error) => {
        console.error(error);
        loadingFailed = true;
        if (activeView === "list") renderSearchResults();
    });
