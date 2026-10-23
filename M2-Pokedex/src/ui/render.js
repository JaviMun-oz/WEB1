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

export function renderTypeNotes() {
  effectiveness.innerHTML = `<div class="type-glyph" aria-hidden="true">◈</div>
    <p class="empty-kicker">ELEMENTAL FIELD NOTES</p>
    <h3>Know your<br /><em>surroundings.</em></h3>
    <p>Type strengths and vulnerabilities will be charted here in a future field update.</p>
    <div class="legend"><span><i class="legend-dot strong"></i> ADVANTAGE</span><span><i class="legend-dot weak"></i> VULNERABILITY</span></div>`;
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
    <div class="pokemon-details"><p class="empty-kicker">SPECIES RECORD · NO. ${number}</p><h3>${escapeHtml(capitalize(pokemon.name))}</h3>
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
          className: 'missing-art',
          role: 'img',
          ariaLabel: 'Artwork unavailable',
          textContent: '✳',
        }));
      }
    });
  }
}
