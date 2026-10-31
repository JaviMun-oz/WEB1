import { capitalize, escapeHtml, typePill } from './helpers.js';

const varietiesGrid = document.querySelector('#varieties-grid');
const varietiesStatus = document.querySelector('#varieties-status');
const varietyCount = document.querySelector('#variety-count');
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