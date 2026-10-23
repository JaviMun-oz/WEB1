const API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';
const SPECIES_API_URL = 'https://pokeapi.co/api/v2/pokemon-species/';
const TYPE_API_URL = 'https://pokeapi.co/api/v2/type/';

async function fetchJSON(url, signal) {
  let response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('We could not reach the field guide. Check your connection and try again.');
  }
  if (!response.ok) {
    if (response.status === 404) {
      const error = new Error('That Pokemon or type could not be found. Check the name and try again.');
      error.status = response.status;
      throw error;
    }
    throw new Error('The field guide could not load that record. Please try again in a moment.');
  }
  try {
    return await response.json();
  } catch {
    throw new Error('The field guide returned an unreadable record. Please try again.');
  }
}

/** Retrieve one Pokemon by name or Pokedex number. */
export async function getPokemonByName(query, { signal } = {}) {
  const identifier = String(query).trim().toLowerCase().replaceAll(' ', '-');
  if (!identifier) throw new Error('Enter a Pokemon name or Pokedex number to search.');

  try {
    return await fetchJSON(`${API_BASE_URL}${encodeURIComponent(identifier)}`, signal);
  } catch (error) {
    if (error.name === 'AbortError' || error.status !== 404 || /^\d+$/.test(identifier)) throw error;

    let species;
    try {
      species = await fetchJSON(`${SPECIES_API_URL}${encodeURIComponent(identifier)}`, signal);
    } catch (speciesError) {
      if (speciesError.name === 'AbortError') throw speciesError;
      if (speciesError.status === 404) {
        throw new Error(`We could not find "${identifier}". Check the name or Pokedex number and try again.`);
      }
      throw speciesError;
    }

    const defaultVariety = species.varieties?.find(({ is_default }) => is_default) ?? species.varieties?.[0];
    if (!defaultVariety?.pokemon?.url) {
      throw new Error(`We found ${identifier}, but its default form is unavailable.`);
    }
    return fetchJSON(defaultVariety.pokemon.url, signal);
  }
}

/** Fetch one or two type records together for calculations and membership lists. */
export function getTypesByName(names, { signal } = {}) {
  const uniqueNames = [...new Set(names.map((name) => String(name).trim().toLowerCase()).filter(Boolean))];
  return Promise.all(uniqueNames.map((name) => fetchJSON(`${TYPE_API_URL}${encodeURIComponent(name)}`, signal)));
}
