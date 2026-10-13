import { completedList, planningList } from "./api/anilist.js";

const animeGrid = document.getElementById("animeGrid");

function showList(list) {
  animeGrid.innerHTML = list.map((anime) => `
    <article class="anime-card">
      <img src="${anime.media.coverImage.large}" alt="${anime.media.title.romaji}">
      <h2>${anime.media.title.english || anime.media.title.romaji}</h2>
    </article>
  `).join("");
}


document.getElementById("completedLink").addEventListener("click", (event) => {
  event.preventDefault();
  showList(completedList);
});

document.getElementById("planningLink").addEventListener("click", (event) => {
  event.preventDefault();
  showList(planningList);
});