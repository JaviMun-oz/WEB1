/** Convert a PokéAPI response into the smaller shape used by the interface. */
export function normalizePokemon(data) {
  return {
    id: data.id,
    name: data.name,
    image: data.sprites?.other?.['official-artwork']?.front_default ?? data.sprites?.front_default ?? '',
    height: data.height / 10,
    weight: data.weight / 10,
    types: data.types.map(({ type }) => type.name),
    abilities: data.abilities.map(({ ability }) => ability.name),
  };
}
