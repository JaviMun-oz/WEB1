const API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';
const SPECIES_API_URL = 'https://pokeapi.co/api/v2/pokemon-species/';
const TYPE_API_URL = 'https://pokeapi.co/api/v2/type/';
const CACHE_PREFIX = 'pokedex-cache:v1:';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 12_000;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const makeError = (message, kind, status, options) => Object.assign(new Error(message, options), { kind, status });

function readCache(url, validate) {
  const key = `${CACHE_PREFIX}${url}`;
  try {
    const storage = globalThis.localStorage;
    if (!storage) return null;
    const serialized = storage.getItem(key);
    if (!serialized) return null;

    const entry = JSON.parse(serialized);
    if (entry?.version !== 1 || !Number.isFinite(entry.expiresAt) || entry.expiresAt <= Date.now() || !validate(entry.data)) {
      storage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    try { globalThis.localStorage?.removeItem(key); } catch { /* Storage may be unavailable. */ }
    return null;
  }
}

function writeCache(url, data) {
  try {
    globalThis.localStorage?.setItem(`${CACHE_PREFIX}${url}`, JSON.stringify({
      version: 1,
      expiresAt: Date.now() + CACHE_TTL_MS,
      data,
    }));
  } catch {
    // Quota, privacy settings, or browser storage restrictions should not break search.
  }
}

function isPokemonPayload(data) {
  return isObject(data)
    && Number.isInteger(data.id)
    && data.id > 0
    && typeof data.name === 'string'
    && (!('types' in data) || Array.isArray(data.types))
    && (!('abilities' in data) || Array.isArray(data.abilities))
    && (!('stats' in data) || Array.isArray(data.stats))
    && (!('sprites' in data) || isObject(data.sprites));
}

function isSpeciesPayload(data) {
  return isObject(data)
    && typeof data.name === 'string'
    && Array.isArray(data.varieties);
}

function isTypePayload(data) {
  if (!isObject(data) || typeof data.name !== 'string' || !isObject(data.damage_relations)) return false;
  if ('pokemon' in data && !Array.isArray(data.pokemon)) return false;
  return ['double_damage_from', 'half_damage_from', 'no_damage_from'].every(
    (key) => !(key in data.damage_relations) || Array.isArray(data.damage_relations[key]),
  );
}

async function fetchJSON(url, { signal, validate = isObject } = {}) {
  const cached = readCache(url, validate);
  if (cached) return cached;

  const requestController = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    requestController.abort();
  }, REQUEST_TIMEOUT_MS);
  const forwardAbort = () => requestController.abort();
  if (signal?.aborted) forwardAbort();
  else signal?.addEventListener('abort', forwardAbort, { once: true });

  try {
    let response;
    try {
      response = await fetch(url, { signal: requestController.signal });
    } catch (error) {
      if (signal?.aborted) throw Object.assign(new Error('Request was cancelled.'), { name: 'AbortError' });
      if (timedOut) throw makeError('The field guide took too long to respond. Please try again.', 'timeout');
      throw makeError('We could not reach the field guide. Check your connection and try again.', 'network', undefined, { cause: error });
    }

    if (!response.ok) {
      if (response.status === 404) throw makeError('That record could not be found.', 'http', response.status);
      throw makeError(`The field guide returned an HTTP ${response.status} error. Please try again.`, 'http', response.status);
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      if (signal?.aborted) throw Object.assign(new Error('Request was cancelled.'), { name: 'AbortError' });
      if (timedOut) throw makeError('The field guide took too long to respond. Please try again.', 'timeout');
      throw makeError('The field guide returned an empty or unreadable response.', 'invalid-data', undefined, { cause: error });
    }
    if (!validate(data)) throw makeError('The field guide returned incomplete or invalid data.', 'invalid-data');

    writeCache(url, data);
    return data;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

/** Retrieve a Pokemon by name or number, resolving base species to its default variety. */
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

/** Fetch one or two type records together for calculations and membership lists. */
export function getTypesByName(names, { signal } = {}) {
  const uniqueNames = [...new Set((Array.isArray(names) ? names : []).map((name) => String(name).trim().toLowerCase()).filter(Boolean))];
  return Promise.all(uniqueNames.map((name) => fetchJSON(`${TYPE_API_URL}${encodeURIComponent(name)}`, { signal, validate: isTypePayload })));
}
