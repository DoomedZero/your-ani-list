import { fetchAnimeLists } from "./api/anilist.js";

const homeView = document.getElementById("homeView");
const listView = document.getElementById("listView");

const navLinks = document.querySelectorAll("[data-view]");
const animeSearch = document.getElementById("animeSearch");
const animeGrid = document.getElementById("animeGrid");
const listTitle = document.getElementById("listTitle");
const listEyebrow = document.getElementById("listEyebrow");
const listDescription = document.getElementById("listDescription");
const listStatus = document.getElementById("listStatus");

let completedList = [];
let planningList = [];
let activeList = [];
let activeView = "home";
let dataLoaded = false;
let loadingFailed = false;

function showView(view) {
    activeView = view;

    homeView.hidden = view !== "home";
    listView.hidden = view === "home";

    navLinks.forEach((link) => {
        const isActive = link.dataset.view === view;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    if (view === "completed" || view === "planning") {
        activeList = view === "completed" ? completedList : planningList;

        listTitle.textContent =
            view === "completed" ? "Completed" : "Planning";

        listEyebrow.textContent =
            view === "completed" ? "YOUR COLLECTION" : "UP NEXT";

        listDescription.textContent =
            view === "completed"
                ? "Every story you've finished."
                : "The stories waiting for you.";

        renderSearchResults();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showList(list) {
    animeGrid.innerHTML = list.map((anime) => `
        <article class="anime-card">
            <img
                src="${anime.media.coverImage.large}"
                alt="${anime.media.title.romaji}"
                loading="lazy"
            >
            <h2>${anime.media.title.english || anime.media.title.romaji}</h2>
        </article>
    `).join("");
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

    const filteredList = activeList.filter((anime) => {
        const title =
            anime.media.title.english || anime.media.title.romaji;

        return title.toLowerCase().includes(searchText);
    });

    showList(filteredList);

    listStatus.textContent = filteredList.length === 0
        ? "No anime found. Try another search."
        : `${filteredList.length} anime`;
}

// Handle navigation
navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const view = link.dataset.view;

        showView(view);
        history.replaceState(null, "", `#${view}`);
    });
});

// Handle search
animeSearch.addEventListener("input", renderSearchResults);

// Show the homepage immediately.
const initialView = ["completed", "planning"].includes(
    window.location.hash.slice(1)
)
    ? window.location.hash.slice(1)
    : "home";

showView(initialView);

// Load AniList data in the background.
fetchAnimeLists()
    .then((data) => {
        completedList = data.completedList;
        planningList = data.planningList;
        dataLoaded = true;

        if (activeView === "completed" || activeView === "planning") {
            activeList =
                activeView === "completed" ? completedList : planningList;

            renderSearchResults();
        }
    })
    .catch((error) => {
        console.error(error);
        loadingFailed = true;

        if (activeView === "completed" || activeView === "planning") {
            renderSearchResults();
        }
    });