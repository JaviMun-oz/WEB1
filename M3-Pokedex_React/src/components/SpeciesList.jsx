import { useState } from 'react';

export default function SpeciesList({ pokemon }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase().replaceAll(' ', '-');
  const visiblePokemon = pokemon.filter(({ name }) => name.includes(normalizedQuery));

  return (
    <section className="type-species" aria-labelledby="species-list-heading">
      <div className="species-list-heading">
        <h3 id="species-list-heading">POKÉMON WITH TYPE</h3>
        <span>{normalizedQuery ? `${visiblePokemon.length}/${pokemon.length}` : pokemon.length}</span>
      </div>
      <input
        className="species-filter"
        type="search"
        placeholder="Filter Pokémon…"
        aria-label="Filter Pokémon by name"
        value={query}
        disabled={!pokemon.length}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="species-list" aria-live="polite">
        {!pokemon.length
          ? <p>Choose a type to see its Pokémon.</p>
          : !visiblePokemon.length
            ? <p>No matches. Try another name.</p>
            : visiblePokemon.map(({ id, name }) => (
              <div className="species-entry" key={`${id ?? 'unknown'}-${name}`}>
                <span>{id == null ? '—' : `#${String(id).padStart(4, '0')}`}</span>
                <b>{name.replaceAll('-', ' ')}</b>
              </div>
            ))}
      </div>
    </section>
  );
}
