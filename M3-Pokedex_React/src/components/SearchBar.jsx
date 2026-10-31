export default function SearchBar({ query, onQueryChange, onSubmit }) {
  return (
    <section className="search-section" aria-label="Pokémon search">
      <form className="search-form" role="search" onSubmit={onSubmit}>
        <label className="search-label" htmlFor="pokemon-search">FIND A SPECIES</label>
        <div className="search-control">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            id="pokemon-search"
            name="pokemon"
            type="search"
            placeholder="Try a name or Pokédex number…"
            autoComplete="off"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <button type="submit">SEARCH <span aria-hidden="true">↗</span></button>
        </div>
        <p className="search-hint">A field guide is best explored one discovery at a time.</p>
      </form>
    </section>
  );
}
