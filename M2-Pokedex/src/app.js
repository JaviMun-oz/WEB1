import { getPokemonByName, getPokemonVarieties, getTypesByName } from './api/pokeapi.js';
import { normalizePokemon } from './logic/pokemon.js';
import { calculateTypeEffectiveness, getPokemonForTypes, normalizeTypeResponse, POKEMON_TYPES } from './logic/types.js';
import { filterPokemonList, getTypeSelections, initializeTypeCalculator, renderError, renderLoading, renderPokemon, renderTypeError, renderTypeLoading, renderTypeResults, renderVarieties, renderVarietiesError, renderVarietiesLoading, setTypeSelections, showSearchReady } from './ui/render.js';
import './style.css';

const form = document.querySelector('#search-form');
const searchInput = document.querySelector('#pokemon-search');
const typePanel = document.querySelector('#effectiveness-panel');
const speciesFilter = document.querySelector('#species-filter');
const varietiesGrid = document.querySelector('#varieties-grid');
const status = document.querySelector('#app-status');
let activePokemonRequestId = 0;
let activePokemonController;
let activeTypeRequestId = 0;
let activeTypeController;
let currentVarieties = [];

initializeTypeCalculator(POKEMON_TYPES);

async function updateTypeCalculator(types) {
  const selectedTypes = [...new Set((Array.isArray(types) ? types : []).filter(Boolean))].slice(0, 2);
  const requestId = ++activeTypeRequestId;
  activeTypeController?.abort();

  const controller = new AbortController();
  activeTypeController = controller;
  try {
    if (!selectedTypes.length) {
      renderTypeError('Choose one or two types to see their matchups and associated Pokemon.');
      return false;
    }

    renderTypeLoading(selectedTypes);
    const responses = await getTypesByName(selectedTypes, { signal: controller.signal });
    if (requestId !== activeTypeRequestId) return;
    const records = responses.map(normalizeTypeResponse);
    const effectivenessRows = calculateTypeEffectiveness(records);
    const pokemon = getPokemonForTypes(records);
    renderTypeResults(records, effectivenessRows, pokemon);
    status.textContent = `Type chart ready for ${selectedTypes.join(' and ')}. ${pokemon.length} Pokemon listed.`;
    return true;
  } catch (error) {
    if (requestId !== activeTypeRequestId || error.name === 'AbortError') return;
    renderTypeError(error.message);
    status.textContent = error.message;
    return false;
  }
}

async function loadVarieties(pokemonRecord, selectedPokemonId, requestId, signal) {
  renderVarietiesLoading();
  try {
    const result = await getPokemonVarieties(pokemonRecord, { signal });
    if (requestId !== activePokemonRequestId) return null;
    currentVarieties = result.varieties.map((variety) => ({
      ...variety,
      summary: variety.pokemon ? normalizePokemon(variety.pokemon) : null,
    }));
    if (currentVarieties.every(({ summary }) => !summary)) {
      renderVarietiesError('The available forms were found, but none of their details could be loaded. Please try again.');
      return { loaded: 0, total: currentVarieties.length };
    }
    renderVarieties(currentVarieties, selectedPokemonId);
    return {
      loaded: currentVarieties.filter(({ summary }) => Boolean(summary)).length,
      total: currentVarieties.length,
    };
  } catch (error) {
    if (requestId !== activePokemonRequestId || error.name === 'AbortError') return null;
    renderVarietiesError(error.message || 'Available forms could not be loaded. Please try again.');
    return null;
  }
}

async function handlePokemonSearch(event) {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    status.textContent = 'Enter a Pokemon name or number to begin.';
    searchInput.focus();
    return;
  }

  const requestId = ++activePokemonRequestId;
  activePokemonController?.abort();
  activeTypeRequestId += 1;
  activeTypeController?.abort();
  const controller = new AbortController();
  activePokemonController = controller;
  renderLoading();
  renderVarietiesLoading();
  currentVarieties = [];
  status.textContent = `Looking for ${query}...`;

  try {
    const rawPokemon = await getPokemonByName(query, { signal: controller.signal });
    if (requestId !== activePokemonRequestId) return;
    const pokemon = normalizePokemon(rawPokemon);
    renderPokemon(pokemon);
    setTypeSelections(pokemon.types.slice(0, 2));
    const [typeChartLoaded, varietyResult] = await Promise.all([
      updateTypeCalculator(pokemon.types.slice(0, 2)),
      loadVarieties(rawPokemon, pokemon.id, requestId, controller.signal),
    ]);
    if (requestId === activePokemonRequestId && typeChartLoaded) {
      const formMessage = !varietyResult
        ? ' Forms could not be loaded.'
        : varietyResult.loaded < varietyResult.total
          ? ` ${varietyResult.loaded} of ${varietyResult.total} forms loaded.`
          : ` ${varietyResult.loaded} form${varietyResult.loaded === 1 ? '' : 's'} available.`;
      status.textContent = `${pokemon.name.replaceAll('-', ' ')} field record and type chart loaded.${formMessage}`;
    }
  } catch (error) {
    if (requestId !== activePokemonRequestId || error.name === 'AbortError') return;
    renderError(error.message);
    renderVarietiesError(error.message);
    status.textContent = error.message;
  }
}

form.addEventListener('submit', (event) => {
  void handlePokemonSearch(event).catch((error) => {
    renderError('Something went wrong while opening this field record. Please try again.');
    renderVarietiesError('Available forms could not be loaded. Please try again.');
    status.textContent = error?.message || 'Unexpected search error.';
  });
});

typePanel.addEventListener('change', (event) => {
  if (!event.target.matches('.type-select')) return;
  let selections = getTypeSelections();
  if (selections.length === 2 && selections[0] === selections[1]) {
    if (event.target.id === 'type-select-primary') {
      setTypeSelections([selections[0]]);
    } else {
      setTypeSelections([selections[0]]);
    }
    selections = getTypeSelections();
  } else if (!selections[0] && selections[1]) {
    setTypeSelections([selections[1]]);
    selections = getTypeSelections();
  }
  void updateTypeCalculator(selections).catch((error) => {
    renderTypeError('Something went wrong while calculating type matchups. Please try again.');
    status.textContent = error?.message || 'Unexpected type calculator error.';
  });
});

speciesFilter.addEventListener('input', () => filterPokemonList(speciesFilter.value));

async function selectVariety(index) {
  const variety = currentVarieties[index];
  if (!variety?.pokemon || !variety.summary) return;

  activePokemonRequestId += 1;
  activePokemonController?.abort();
  const pokemon = variety.summary;
  renderPokemon(pokemon);
  setTypeSelections(pokemon.types.slice(0, 2));
  renderVarieties(currentVarieties, pokemon.id);
  const typeChartLoaded = await updateTypeCalculator(pokemon.types.slice(0, 2));
  if (typeChartLoaded) status.textContent = `${pokemon.name.replaceAll('-', ' ')} form selected. Type chart updated.`;
}

varietiesGrid.addEventListener('click', (event) => {
  const card = event.target.closest('[data-variety-index]');
  if (!card) return;
  void selectVariety(Number(card.dataset.varietyIndex)).catch((error) => {
    status.textContent = error?.message || 'This form could not be opened.';
  });
});

showSearchReady();
