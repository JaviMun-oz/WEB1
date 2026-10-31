export const API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';
export const SPECIES_API_URL = 'https://pokeapi.co/api/v2/pokemon-species/';
export const TYPE_API_URL = 'https://pokeapi.co/api/v2/type/';
export const CACHE_PREFIX = 'pokedex-cache:v1:';
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const REQUEST_TIMEOUT_MS = 12_000;

export const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
export const makeError = (message, kind, status, options) => Object.assign(new Error(message, options), { kind, status });

export function readCache(url, validate) {
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

export function writeCache(url, data) {
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

export function isPokemonPayload(data) {
  return isObject(data)
    && Number.isInteger(data.id)
    && data.id > 0
    && typeof data.name === 'string'
    && (!('types' in data) || Array.isArray(data.types))
    && (!('abilities' in data) || Array.isArray(data.abilities))
    && (!('stats' in data) || Array.isArray(data.stats))
    && (!('sprites' in data) || isObject(data.sprites));
}

export function isSpeciesPayload(data) {
  return isObject(data)
    && typeof data.name === 'string'
    && Array.isArray(data.varieties);
}

export function isTypePayload(data) {
  if (!isObject(data) || typeof data.name !== 'string' || !isObject(data.damage_relations)) return false;
  if ('pokemon' in data && !Array.isArray(data.pokemon)) return false;
  return ['double_damage_from', 'half_damage_from', 'no_damage_from'].every(
    (key) => !(key in data.damage_relations) || Array.isArray(data.damage_relations[key]),
  );
}

// Cached entries are validated before use; network requests also support cancellation and timeout.
export async function fetchJSON(url, { signal, validate = isObject } = {}) {
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