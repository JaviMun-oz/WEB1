import { getPokemonByName } from './api/pokeapi.js';
import { normalizePokemon } from './logic/pokemon.js';
import { getTypeMatchups } from './logic/types.js';
import { renderError, renderLoading, renderPokemon, renderTypeMatchups, showSearchReady } from './ui/render.js';
import './style.css';

const form = document.querySelector('#search-form');
const searchInput = document.querySelector('#pokemon-search');
const status = document.querySelector('#app-status');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    status.textContent = 'Enter a Pokémon name or number to begin.';
    searchInput.focus();
    return;
  }

  renderLoading();
  status.textContent = `Looking for ${query}…`;
  try {
    const rawPokemon = await getPokemonByName(query);
    const pokemon = normalizePokemon(rawPokemon);
    renderPokemon(pokemon);
    renderTypeMatchups(getTypeMatchups(pokemon.types));
    status.textContent = `${pokemon.name} field record loaded.`;
  } catch (error) {
    renderError(error.message);
    status.textContent = error.message;
  }
});

showSearchReady();
