const API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';

/** Retrieve one Pokemon by name or Pokedex number. */
export async function getPokemonByName(query, { signal } = {}) {
  const identifier = String(query).trim().toLowerCase().replaceAll(' ', '-');
  if (!identifier) throw new Error('Enter a Pokemon name or Pokedex number to search.');

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${encodeURIComponent(identifier)}`, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('We could not reach the field guide. Check your connection and try again.');
  }

  if (!response.ok) {
    if (response.status === 404) throw new Error(`We could not find "${identifier}". Check the name or Pokedex number and try again.`);
    throw new Error('The field guide could not load that record. Please try again in a moment.');
  }

  try {
    return await response.json();
  } catch {
    throw new Error('The field guide returned an unreadable record. Please try again.');
  }
}
