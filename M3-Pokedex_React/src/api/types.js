import { TYPE_API_URL, fetchJSON, isTypePayload } from './client.js';

/** Fetch one or two type records together for calculations and membership lists. */
export function getTypesByName(names, { signal } = {}) {
  const uniqueNames = [...new Set((Array.isArray(names) ? names : []).map((name) => String(name).trim().toLowerCase()).filter(Boolean))];
  return Promise.all(uniqueNames.map((name) => fetchJSON(`${TYPE_API_URL}${encodeURIComponent(name)}`, { signal, validate: isTypePayload })));
}