import { capitalize, escapeHtml, typePill } from './helpers.js';

const primaryType = document.querySelector('#type-select-primary');
const secondaryType = document.querySelector('#type-select-secondary');
const typeMessage = document.querySelector('#type-chart-message');
const typeChart = document.querySelector('#type-chart');
const speciesFilter = document.querySelector('#species-filter');
const speciesList = document.querySelector('#species-list');
const speciesCount = document.querySelector('#species-count');
let currentSpecies = [];
export function initializeTypeCalculator(types) {
  for (const select of [primaryType, secondaryType]) {
    for (const type of types) {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = capitalize(type);
      select.append(option);
    }
  }
}

export function setTypeSelections(types) {
  primaryType.value = types[0] ?? '';
  secondaryType.value = types[1] ?? '';
}

export function getTypeSelections() {
  return [primaryType.value, secondaryType.value].filter(Boolean);
}

export function renderTypeLoading(types) {
  currentSpecies = [];
  speciesFilter.value = '';
  speciesFilter.disabled = true;
  speciesCount.textContent = '...';
  speciesList.innerHTML = '<p>Loading the species list...</p>';
  typeChart.innerHTML = '<div class="chart-loading"><span class="loader"></span></div>';
  typeMessage.textContent = `Looking up ${types.join(' and ')} type relations...`;
}

export function renderTypeError(message) {
  currentSpecies = [];
  speciesFilter.disabled = true;
  speciesCount.textContent = '0';
  speciesList.innerHTML = '<p>Species are unavailable until the type data loads.</p>';
  typeChart.innerHTML = '';
  typeMessage.textContent = message;
}

export function renderTypeResults(records, effectivenessRows, pokemon) {
  const selectedNames = records.map(({ name }) => capitalize(name));
  typeMessage.textContent = `Defending type${records.length > 1 ? 's' : ''}: ${selectedNames.join(' + ')}.`;
  const groups = [
    { label: 'VULNERABLE', predicate: ({ multiplier }) => multiplier >= 2, className: 'matchup-weak' },
    { label: 'IMMUNE', predicate: ({ multiplier }) => multiplier === 0, className: 'matchup-immune' },
    { label: 'RESISTANT', predicate: ({ multiplier }) => multiplier > 0 && multiplier < 1, className: 'matchup-resistant' },
    { label: 'NEUTRAL', predicate: ({ multiplier }) => multiplier === 1, className: 'matchup-neutral' },
  ];
  typeChart.innerHTML = groups.map(({ label, predicate, className }) => {
    const rows = effectivenessRows.filter(predicate);
    if (!rows.length) return '';
    return `<section class="matchup-group ${className}"><h4>${label}</h4><div class="matchup-types">${rows.map(({ type, multiplier }) => `<span class="matchup-type">${typePill(type)}<b>×${multiplier}</b></span>`).join('')}</div></section>`;
  }).join('');

  currentSpecies = pokemon;
  speciesFilter.disabled = !pokemon.length;
  speciesFilter.value = '';
  renderSpeciesList('');
}

function renderSpeciesList(query) {
  const normalizedQuery = query.trim().toLowerCase().replaceAll(' ', '-');
  const visiblePokemon = currentSpecies.filter(({ name }) => name.includes(normalizedQuery));
  if (!currentSpecies.length) {
    speciesList.innerHTML = '<p>No Pokemon are listed for this selection.</p>';
  } else if (!visiblePokemon.length) {
    speciesList.innerHTML = '<p>No matches. Try another name.</p>';
  } else {
    speciesList.innerHTML = visiblePokemon.map(({ id, name }) => `<div class="species-entry"><span>${id == null ? '—' : `#${String(id).padStart(4, '0')}`}</span><b>${escapeHtml(capitalize(name.replaceAll('-', ' ')))}</b></div>`).join('');
  }
  speciesCount.textContent = normalizedQuery ? `${visiblePokemon.length}/${currentSpecies.length}` : String(currentSpecies.length);
}

export function filterPokemonList(query) {
  renderSpeciesList(query);
}