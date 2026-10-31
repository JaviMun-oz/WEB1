/** Convert a PokéAPI response into the clean data shape used by the interface. */
export function normalizePokemon(data) {
  const sprites = data?.sprites && typeof data.sprites === 'object' ? data.sprites : {};
  const images = [
    sprites.other?.['official-artwork']?.front_default,
    sprites.other?.home?.front_default,
    sprites.front_default,
  ].filter((image) => typeof image === 'string' && image.length > 0);

  return {
    id: data?.id ?? null,
    name: data?.name ?? 'Unknown species',
    images,
    height: Number.isFinite(data?.height) ? data.height / 10 : null,
    weight: Number.isFinite(data?.weight) ? data.weight / 10 : null,
    types: (Array.isArray(data?.types) ? data.types : [])
      .map((entry) => entry?.type?.name)
      .filter((name) => typeof name === 'string' && name.length > 0),
    abilities: (Array.isArray(data?.abilities) ? data.abilities : [])
      .map((entry) => entry?.ability?.name)
      .filter((name) => typeof name === 'string' && name.length > 0),
    stats: (Array.isArray(data?.stats) ? data.stats : [])
      .map((entry) => ({ name: entry?.stat?.name, value: entry?.base_stat }))
      .filter(({ name, value }) => name && Number.isFinite(value)),
  };
}
