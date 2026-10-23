/** Convert a PokéAPI response into the clean data shape used by the interface. */
export function normalizePokemon(data) {
  const sprites = data?.sprites ?? {};
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
    types: (data?.types ?? []).map(({ type }) => type?.name).filter(Boolean),
    abilities: (data?.abilities ?? [])
      .map(({ ability }) => ability?.name)
      .filter(Boolean),
    stats: (data?.stats ?? [])
      .map(({ base_stat: value, stat }) => ({ name: stat?.name, value }))
      .filter(({ name, value }) => name && Number.isFinite(value)),
  };
}
