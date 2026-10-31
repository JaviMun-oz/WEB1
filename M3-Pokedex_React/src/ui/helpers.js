const typeColors = { normal: '#a8a77a', fire: '#ee8130', water: '#6390f0', electric: '#f7d02c', grass: '#7ac74c', ice: '#96d9d6', fighting: '#c22e28', poison: '#a33ea1', ground: '#e2bf65', flying: '#a98ff3', psychic: '#f95587', bug: '#a6b91a', rock: '#b6a136', ghost: '#735797', dragon: '#6f35fc', dark: '#705746', steel: '#b7b7ce', fairy: '#d685ad' };
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export function typePill(type) {
  const color = typeColors[type] ?? '#777';
  return `<span class="type-pill" style="--type-color:${color}">${escapeHtml(type)}</span>`;
}

export function formatStatName(name) {
  return name.replaceAll('-', ' ').replace('special', 'sp.').toUpperCase();
}