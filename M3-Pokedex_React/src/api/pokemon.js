import { API_BASE_URL, SPECIES_API_URL, fetchJSON, isObject, isPokemonPayload, isSpeciesPayload, makeError, readCache, writeCache } from './client.js';

export async function getPokemonByName(query, { signal } = {}) {
  const identifier = String(query ?? '').trim().toLowerCase().replaceAll(' ', '-');
  if (!identifier) throw new Error('Enter a Pokemon name or number to search.');

  const resolvedSearch = readCache(`resolved-pokemon:${identifier}`, isPokemonPayload);
  if (resolvedSearch) return resolvedSearch;

  try {
    return await fetchJSON(`${API_BASE_URL}${encodeURIComponent(identifier)}`, { signal, validate: isPokemonPayload });
  } catch (error) {
    if (error.name === 'AbortError' || error.status !== 404 || /^\d+$/.test(identifier)) throw error;

    let species;
    try {
      species = await fetchJSON(`${SPECIES_API_URL}${encodeURIComponent(identifier)}`, { signal, validate: isSpeciesPayload });
    } catch (speciesError) {
      if (speciesError.name === 'AbortError') throw speciesError;
      if (speciesError.status === 404) {
        throw makeError(`We could not find "${identifier}". Check the name or Pokedex number and try again.`, 'http', 404);
      }
      throw speciesError;
    }

    const varieties = species.varieties.filter(isObject);
    const defaultVariety = varieties.find(({ is_default }) => is_default) ?? varieties[0];
    if (!defaultVariety?.pokemon?.url) {
      throw makeError(`We found ${identifier}, but its default form is unavailable.`, 'invalid-data');
    }
    const pokemon = await fetchJSON(defaultVariety.pokemon.url, { signal, validate: isPokemonPayload });
    writeCache(`resolved-pokemon:${identifier}`, pokemon);
    return pokemon;
  }
}

/** Retrieve every available form for the species that owns a Pokémon record. */
export async function getPokemonVarieties(pokemonRecord, { signal } = {}) {
  const speciesName = pokemonRecord?.species?.name;
  if (typeof speciesName !== 'string' || !speciesName) {
    throw makeError('This Pokémon record does not include its species information.', 'invalid-data');
  }

  const species = await fetchJSON(`${SPECIES_API_URL}${encodeURIComponent(speciesName)}`, { signal, validate: isSpeciesPayload });
  const varieties = species.varieties
    .filter((variety) => isObject(variety) && isObject(variety.pokemon)
      && typeof variety.pokemon.name === 'string'
      && typeof variety.pokemon.url === 'string')
    .map((variety) => ({
      name: variety.pokemon.name,
      isDefault: variety.is_default === true,
      url: variety.pokemon.url,
    }));

  if (!varieties.length) {
    throw makeError(`No available forms were listed for ${speciesName}.`, 'invalid-data');
  }

  const results = await Promise.allSettled(varieties.map(({ url }) =>
    fetchJSON(url, { signal, validate: isPokemonPayload }),
  ));

  return {
    speciesName,
    varieties: results.map((result, index) => result.status === 'fulfilled'
      ? { name: varieties[index].name, isDefault: varieties[index].isDefault, pokemon: result.value, error: null }
      : { name: varieties[index].name, isDefault: varieties[index].isDefault, pokemon: null, error: result.reason?.message ?? 'Form data could not be loaded.' }),
  };
}
