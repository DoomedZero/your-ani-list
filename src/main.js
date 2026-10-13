import { completedList, planningList } from "./api/anilist.js";

const animeGrid = document.getElementById("animeGrid");

animeGrid.innerHTML = completedList.map((anime) => `
  <article class="anime-card">
    <img src="${anime.media.coverImage.large}" alt="${anime.media.title.romaji}">
    <h2>${anime.media.title.english || anime.media.title.romaji}</h2>
  </article>
`).join("");