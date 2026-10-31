const panel = document.querySelector('#pokemon-panel');
const status = document.querySelector('#app-status');
const primaryType = document.querySelector('#type-select-primary');
const secondaryType = document.querySelector('#type-select-secondary');
const typeMessage = document.querySelector('#type-chart-message');
const typeChart = document.querySelector('#type-chart');
const speciesFilter = document.querySelector('#species-filter');
const speciesList = document.querySelector('#species-list');
const speciesCount = document.querySelector('#species-count');
const varietiesGrid = document.querySelector('#varieties-grid');
const varietiesStatus = document.querySelector('#varieties-status');
const varietyCount = document.querySelector('#variety-count');
const typeColors = { normal: '#a8a77a', fire: '#ee8130', water: '#6390f0', electric: '#f7d02c', grass: '#7ac74c', ice: '#96d9d6', fighting: '#c22e28', poison: '#a33ea1', ground: '#e2bf65', flying: '#a98ff3', psychic: '#f95587', bug: '#a6b91a', rock: '#b6a136', ghost: '#735797', dragon: '#6f35fc', dark: '#705746', steel: '#b7b7ce', fairy: '#d685ad' };
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);
let currentSpecies = [];

function typePill(type) {
  const color = typeColors[type] ?? '#777';
  return `<span class="type-pill" style="--type-color:${color}">${escapeHtml(type)}</span>`;
}

function formatStatName(name) {
  return name.replaceAll('-', ' ').replace('special', 'sp.').toUpperCase();
}

export function showSearchReady() {
  status.textContent = 'Search the field guide by Pokemon name or Pokedex number.';
}

export function renderLoading() {
  panel.innerHTML = '<div class="state-message"><span class="loader"></span><p>Consulting the field guide...</p></div>';
}

export function renderError(message) {
  panel.innerHTML = `<div class="state-message error-state"><span class="state-symbol">!</span><p>${escapeHtml(message)}</p></div>`;
}

export function renderVarietiesLoading() {
  varietyCount.textContent = 'LOADING';
  varietiesStatus.innerHTML = '<span class="loader" aria-hidden="true"></span><span>Gathering available forms...</span>';
  varietiesGrid.innerHTML = '';
}

export function renderVarietiesError(message) {
  varietyCount.textContent = 'UNAVAILABLE';
  varietiesStatus.textContent = message;
  varietiesGrid.innerHTML = '';
}

export function renderVarieties(varieties, selectedPokemonId) {
  const failures = varieties.filter(({ summary }) => !summary).length;
  varietyCount.textContent = `${varieties.length} ${varieties.length === 1 ? 'FORM' : 'FORMS'}`;
  if (varieties.length === 1 && !failures) {
    varietiesStatus.textContent = 'This species has one listed form.';
  } else if (failures) {
    varietiesStatus.textContent = `Showing ${varieties.length - failures} available form${varieties.length - failures === 1 ? '' : 's'}; ${failures} could not be loaded.`;
  } else {
    varietiesStatus.textContent = 'Select a form to view its full field record.';
  }

  varietiesGrid.innerHTML = varieties.map(({ name, isDefault, summary, error }, index) => {
    if (!summary) {
      return `<article class="variety-card variety-unavailable"><span class="variety-badge">UNAVAILABLE</span><h3>${escapeHtml(capitalize(name.replaceAll('-', ' ')))}</h3><p>${escapeHtml(error || 'This form could not be loaded.')}</p></article>`;
    }
    const selected = summary.id === selectedPokemonId;
    const art = summary.images[0]
      ? `<img class="variety-art" src="${escapeHtml(summary.images[0])}" alt="Artwork of ${escapeHtml(summary.name.replaceAll('-', ' '))}" loading="lazy" />`
      : '<span class="variety-art-placeholder" aria-label="Artwork unavailable">✳</span>';
    const typeLabels = summary.types.length ? summary.types.map(typePill).join('') : '<span class="no-stats">Types unavailable</span>';
    return `<button class="variety-card${selected ? ' variety-selected' : ''}" type="button" data-variety-index="${index}" aria-pressed="${selected}">
      <span class="variety-badges">${isDefault ? '<span class="variety-badge default-badge">DEFAULT FORM</span>' : '<span class="variety-badge alternate-badge">ALTERNATE FORM</span>'}</span>
      <span class="variety-artwork">${art}</span><span class="variety-name">${escapeHtml(capitalize(summary.name.replaceAll('-', ' ')))}</span>
      <span class="variety-types">${typeLabels}</span></button>`;
  }).join('');

  varietiesGrid.querySelectorAll('.variety-art').forEach((image) => {
    image.addEventListener('error', () => {
      image.replaceWith(Object.assign(document.createElement('span'), {
        className: 'variety-art-placeholder',
        ariaLabel: 'Artwork unavailable',
        textContent: '✳',
      }));
    }, { once: true });
  });
}

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

export function renderPokemon(pokemon) {
  const number = pokemon.id == null ? '----' : String(pokemon.id).padStart(4, '0');
  const artwork = pokemon.images.length
    ? `<img class="pokemon-art" data-image-index="0" src="${escapeHtml(pokemon.images[0])}" alt="Illustration of ${escapeHtml(pokemon.name)}" />`
    : '<div class="missing-art" role="img" aria-label="Artwork unavailable">✳</div>';
  const dimensions = [
    pokemon.height == null ? null : `HEIGHT <b>${pokemon.height} m</b>`,
    pokemon.weight == null ? null : `WEIGHT <b>${pokemon.weight} kg</b>`,
  ].filter(Boolean).join('<span>·</span>');
  const stats = pokemon.stats.length
    ? pokemon.stats.map(({ name, value }) => `<div class="stat-row"><span>${escapeHtml(formatStatName(name))}</span><div class="stat-track"><i style="--stat-width:${Math.min((value / 255) * 100, 100)}%"></i></div><b>${value}</b></div>`).join('')
    : '<p class="no-stats">Base stats are unavailable for this record.</p>';

  panel.innerHTML = `<div class="pokemon-visual">${artwork}<span class="specimen-number">NO. ${number}</span></div>
    <div class="pokemon-details"><p class="empty-kicker">SPECIES RECORD · NO. ${number}</p><h3>${escapeHtml(capitalize(pokemon.name.replaceAll('-', ' ')))}</h3>
    <div class="type-list">${pokemon.types.length ? pokemon.types.map(typePill).join('') : '<span class="no-stats">Type details unavailable</span>'}</div>
    ${dimensions ? `<p class="pokemon-facts">${dimensions}</p>` : ''}
    <div class="ability-notes"><span>KNOWN ABILITIES</span><p>${pokemon.abilities.map((ability) => escapeHtml(capitalize(ability.replaceAll('-', ' ')))).join(' · ') || 'Not recorded'}</p></div>
    <div class="base-stats"><div class="stats-heading"><span>BASE STATS</span><span>0 — 255</span></div>${stats}</div>
    <span class="record-meta"><span class="meta-dot"></span> FIELD RECORD UPDATED</span></div>`;

  const image = panel.querySelector('.pokemon-art');
  if (image) {
    image.addEventListener('error', () => {
      const nextIndex = Number(image.dataset.imageIndex) + 1;
      if (pokemon.images[nextIndex]) {
        image.dataset.imageIndex = String(nextIndex);
        image.src = pokemon.images[nextIndex];
      } else {
        image.replaceWith(Object.assign(document.createElement('div'), {
          className: 'missing-art', role: 'img', ariaLabel: 'Artwork unavailable', textContent: '✳',
        }));
      }
    });
  }
}
