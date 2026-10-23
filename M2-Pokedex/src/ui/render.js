const panel = document.querySelector('#pokemon-panel');
const effectiveness = document.querySelector('#effectiveness-panel');
const status = document.querySelector('#app-status');
const typeColors = { normal: '#a8a77a', fire: '#ee8130', water: '#6390f0', electric: '#f7d02c', grass: '#7ac74c', ice: '#96d9d6', fighting: '#c22e28', poison: '#a33ea1', ground: '#e2bf65', flying: '#a98ff3', psychic: '#f95587', bug: '#a6b91a', rock: '#b6a136', ghost: '#735797', dragon: '#6f35fc', dark: '#705746', steel: '#b7b7ce', fairy: '#d685ad' };
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

function typePill(type) {
  const color = typeColors[type] ?? '#777';
  return `<span class="type-pill" style="--type-color:${color}">${escapeHtml(type)}</span>`;
}

export function showSearchReady() {
  status.textContent = 'Search interface ready. Pokémon data will be connected in a later phase.';
}

export function renderLoading() {
  panel.innerHTML = '<div class="state-message"><span class="loader"></span><p>Consulting the field guide…</p></div>';
  effectiveness.innerHTML = '<div class="state-message"><span class="loader"></span><p>Preparing type notes…</p></div>';
}

export function renderError(message) {
  panel.innerHTML = `<div class="state-message error-state"><span class="state-symbol">!</span><p>${escapeHtml(message)}</p></div>`;
  effectiveness.innerHTML = '<div class="state-message"><p>Type notes will appear when a species is available.</p></div>';
}

export function renderPokemon(pokemon) {
  const number = String(pokemon.id).padStart(4, '0');
  const artwork = pokemon.image
    ? `<img class="pokemon-art" src="${escapeHtml(pokemon.image)}" alt="Illustration of ${escapeHtml(pokemon.name)}" />`
    : '<div class="missing-art" aria-label="No artwork available">✳</div>';
  panel.innerHTML = `<div class="pokemon-visual">${artwork}<span class="specimen-number">NO. ${number}</span></div>
    <div class="pokemon-details"><p class="empty-kicker">SPECIES RECORD · NO. ${number}</p><h3>${escapeHtml(capitalize(pokemon.name))}</h3>
    <div class="type-list">${pokemon.types.map(typePill).join('')}</div>
    <p class="pokemon-facts">HEIGHT <b>${pokemon.height} m</b><span>·</span> WEIGHT <b>${pokemon.weight} kg</b></p>
    <div class="ability-notes"><span>KNOWN ABILITIES</span><p>${pokemon.abilities.map((ability) => escapeHtml(capitalize(ability.replaceAll('-', ' ')))).join(' · ') || 'Not recorded'}</p></div>
    <span class="record-meta"><span class="meta-dot"></span> FIELD RECORD UPDATED</span></div>`;
}

export function renderTypeMatchups(matchups) {
  const group = (title, items, className) => `<div class="matchup-group"><h4 class="${className}">${title}</h4><div class="matchup-types">${items.length ? items.map(({ type, multiplier }) => `${typePill(type)}<small>×${multiplier}</small>`).join('') : '<span class="no-matchups">None recorded</span>'}</div></div>`;
  effectiveness.innerHTML = `${group('VULNERABLE · SUPER EFFECTIVE', matchups.vulnerable, 'weak-label')}${group('RESISTANT · LESS EFFECTIVE', matchups.resistant, 'strong-label')}${matchups.immune.length ? `<div class="matchup-group"><h4 class="strong-label">IMMUNE</h4><div class="matchup-types">${matchups.immune.map((type) => `${typePill(type)}<small>×0</small>`).join('')}</div></div>` : ''}`;
}
