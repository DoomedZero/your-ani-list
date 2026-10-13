import { completedList, planningList } from "./api/anilist.js";

const animeGrid = document.getElementById("animeGrid");
const completedLink = document.getElementById("completedLink");
const planningLink = document.getElementById("planningLink");

function showList(list) {
  animeGrid.innerHTML = list.map((anime) => `
    <article class="anime-card">
      <img src="${anime.media.coverImage.large}" alt="${anime.media.title.romaji}">
      <h2>${anime.media.title.english || anime.media.title.romaji}</h2>
    </article>
  `).join("");
}

function setActiveList(activeButton, inactiveButton) {
  activeButton.classList.add("active");
  inactiveButton.classList.remove("active");

  activeButton.setAttribute("aria-pressed", "true");
  inactiveButton.setAttribute("aria-pressed", "false");
}

showList(completedList)
setActiveList(completedLink, planningLink);

document.getElementById("completedLink").addEventListener("click", (event) => {
  showList(completedList);
  setActiveList(completedLink, planningLink);
});

document.getElementById("planningLink").addEventListener("click", (event) => {
  showList(planningList);
  setActiveList(planningLink, completedLink);
});