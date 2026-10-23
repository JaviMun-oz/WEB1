export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

/** Keep only the type response data needed by the calculator and species list. */
export function normalizeTypeResponse(data) {
  const relations = data?.damage_relations ?? {};
  const pokemon = (data?.pokemon ?? [])
    .map(({ pokemon: entry }) => {
      const id = Number(entry?.url?.match(/\/pokemon\/(\d+)\/?$/)?.[1]);
      return entry?.name ? { name: entry.name, id: Number.isFinite(id) ? id : null } : null;
    })
    .filter(Boolean)
    .reduce((unique, entry) => {
      if (!unique.some(({ name }) => name === entry.name)) unique.push(entry);
      return unique;
    }, [])
    .sort((first, second) => (first.id ?? Infinity) - (second.id ?? Infinity) || first.name.localeCompare(second.name));

  return {
    name: data?.name ?? '',
    pokemon,
    damageRelations: {
      doubleFrom: (relations.double_damage_from ?? []).map(({ name }) => name),
      halfFrom: (relations.half_damage_from ?? []).map(({ name }) => name),
      noFrom: (relations.no_damage_from ?? []).map(({ name }) => name),
    },
  };
}

/** Combine defensive type multipliers, returning one row for each attacking type. */
export function calculateTypeEffectiveness(typeRecords) {
  const normalized = typeRecords.map((record) => record.damageRelations ? record : normalizeTypeResponse(record));
  return POKEMON_TYPES.map((attackingType) => {
    const multiplier = normalized.reduce((value, defendingType) => {
      const relations = defendingType.damageRelations;
      if (relations.noFrom.includes(attackingType)) return 0;
      if (relations.doubleFrom.includes(attackingType)) return value * 2;
      if (relations.halfFrom.includes(attackingType)) return value * 0.5;
      return value;
    }, 1);
    return { type: attackingType, multiplier };
  });
}

/** One-type list, or intersection when two types are selected. */
export function getPokemonForTypes(typeRecords) {
  if (!typeRecords.length) return [];
  const lists = typeRecords.map((record) => record.pokemon);
  if (lists.length === 1) return lists[0];
  const sharedNames = lists.slice(1).reduce((names, list) => {
    const currentNames = new Set(list.map(({ name }) => name));
    return names.filter((name) => currentNames.has(name));
  }, lists[0].map(({ name }) => name));
  const firstTypePokemon = new Map(lists[0].map((entry) => [entry.name, entry]));
  return sharedNames.map((name) => firstTypePokemon.get(name));
}
