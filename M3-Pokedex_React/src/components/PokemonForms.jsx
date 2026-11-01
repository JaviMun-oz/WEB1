import PokemonFormCard from './PokemonFormCard.jsx';

export default function PokemonForms({ varieties, loading, error, selectedId, onSelect }) {
  if (!loading && !error && !varieties.length) return null;

  return (
    <section className="varieties-card" aria-labelledby="varieties-heading">
      <div className="section-heading">
        <span className="section-index">03</span><h2 id="varieties-heading">FORMS &amp; VARIANTS</h2>
        <span className="rule" />
        <span className="record-stamp">{loading ? 'LOADING' : `${varieties.length} FORMS`}</span>
      </div>
      <p className="varieties-intro">Explore every recorded form. Choose a card to open its field record and update the type notes.</p>
      {loading
        ? <div className="varieties-status" role="status"><span className="loader" />Gathering available forms...</div>
        : error
          ? <div className="varieties-status" role="status">{error}</div>
          : <div className="varieties-grid">
            {varieties.map((variety) => (
              <PokemonFormCard
                variety={variety}
                selected={variety.summary?.id === selectedId}
                onSelect={onSelect}
                key={variety.summary?.id ?? variety.name}
              />
            ))}
          </div>}
    </section>
  );
}
