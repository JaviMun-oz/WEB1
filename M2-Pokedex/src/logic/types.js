const TYPE_CHART = {
  normal: { weak: ['fighting'], resistant: [], immune: ['ghost'] },
  fire: { weak: ['water', 'ground', 'rock'], resistant: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immune: [] },
  water: { weak: ['electric', 'grass'], resistant: ['fire', 'water', 'ice', 'steel'], immune: [] },
  electric: { weak: ['ground'], resistant: ['electric', 'flying', 'steel'], immune: [] },
  grass: { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resistant: ['water', 'electric', 'grass', 'ground'], immune: [] },
  ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resistant: ['ice'], immune: [] },
  fighting: { weak: ['flying', 'psychic', 'fairy'], resistant: ['bug', 'rock', 'dark'], immune: [] },
  poison: { weak: ['ground', 'psychic'], resistant: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immune: [] },
  ground: { weak: ['water', 'grass', 'ice'], resistant: ['poison', 'rock'], immune: ['electric'] },
  flying: { weak: ['electric', 'ice', 'rock'], resistant: ['grass', 'fighting', 'bug'], immune: ['ground'] },
  psychic: { weak: ['bug', 'ghost', 'dark'], resistant: ['fighting', 'psychic'], immune: [] },
  bug: { weak: ['fire', 'flying', 'rock'], resistant: ['grass', 'fighting', 'ground'], immune: [] },
  rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resistant: ['normal', 'fire', 'poison', 'flying'], immune: [] },
  ghost: { weak: ['ghost', 'dark'], resistant: ['poison', 'bug'], immune: ['normal', 'fighting'] },
  dragon: { weak: ['ice', 'dragon', 'fairy'], resistant: ['fire', 'water', 'electric', 'grass'], immune: [] },
  dark: { weak: ['fighting', 'bug', 'fairy'], resistant: ['ghost', 'dark'], immune: ['psychic'] },
  steel: { weak: ['fire', 'fighting', 'ground'], resistant: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immune: ['poison'] },
  fairy: { weak: ['poison', 'steel'], resistant: ['fighting', 'bug', 'dark'], immune: ['dragon'] },
};

/** Return attacking types grouped by their damage multiplier against this Pokémon. */
export function getTypeMatchups(defendingTypes = []) {
  const multipliers = new Map(Object.keys(TYPE_CHART).map((type) => [type, 1]));
  for (const defendingType of defendingTypes) {
    const chart = TYPE_CHART[defendingType];
    if (!chart) continue;
    for (const type of chart.weak) multipliers.set(type, multipliers.get(type) * 2);
    for (const type of chart.resistant) multipliers.set(type, multipliers.get(type) * 0.5);
    for (const type of chart.immune) multipliers.set(type, 0);
  }
  return {
    vulnerable: [...multipliers].filter(([, value]) => value > 1).map(([type, multiplier]) => ({ type, multiplier })),
    resistant: [...multipliers].filter(([, value]) => value > 0 && value < 1).map(([type, multiplier]) => ({ type, multiplier })),
    immune: [...multipliers].filter(([, value]) => value === 0).map(([type]) => type),
  };
}
