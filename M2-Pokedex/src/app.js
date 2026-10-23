import { getPokemonByName } from './api/pokeapi.js';
import { normalizePokemon } from './logic/pokemon.js';
import { renderError, renderLoading, renderPokemon, renderTypeNotes, showSearchReady } from './ui/render.js';
import './style.css';

const form = document.querySelector('#search-form');
const searchInput = document.querySelector('#pokemon-search');
const status = document.querySelector('#app-status');
let activeRequestId = 0;
let activeController;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    status.textContent = 'Enter a Pokemon name or number to begin.';
    searchInput.focus();
    return;
  }

  const requestId = ++activeRequestId;
  activeController?.abort();
  activeController = new AbortController();
  renderLoading();
  status.textContent = `Looking for ${query}...`;

  try {
    const rawPokemon = await getPokemonByName(query, { signal: activeController.signal });
    if (requestId !== activeRequestId) return;
    const pokemon = normalizePokemon(rawPokemon);
    renderPokemon(pokemon);
    renderTypeNotes();
    status.textContent = `${pokemon.name} field record loaded.`;
  } catch (error) {
    if (requestId !== activeRequestId || error.name === 'AbortError') return;
    renderError(error.message);
    status.textContent = error.message;
  }
});

showSearchReady();
