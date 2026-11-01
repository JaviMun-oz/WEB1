import TypeBadge from './TypeBadge.jsx';

export default function VarietySelector({ varieties, loading, error, selectedId, onSelect }) {
  if (!loading && !error && !varieties.length) return null;

  return (
    <section className="varieties-card" aria-labelledby="varieties-heading">
      <div className="section-heading">
        <span className="section-index">03</span><h2 id="varieties-heading">FORMS &amp; VARIANTS</h2>
        <span className="rule" /><span className="record-stamp">{loading ? 'LOADING' : `${varieties.length} FORMS`}</span>
      </div>
      <p className="varieties-intro">Explore every recorded form. Choose a card to open its field record and update the type notes.</p>
      {loading
        ? <div className="varieties-status" role="status"><span className="loader" />Gathering available forms...</div>
        : error
          ? <div className="varieties-status" role="status">{error}</div>
          : <div className="varieties-grid">
            {varieties.map(({ name, isDefault, summary, error: varietyError }) => summary
              ? <button className={`variety-card${summary.id === selectedId ? ' variety-selected' : ''}`} type="button" key={summary.id ?? name} aria-pressed={summary.id === selectedId} onClick={() => onSelect(summary)}>
                <span className="variety-badges"><span className={`variety-badge${isDefault ? ' default-badge' : ' alternate-badge'}`}>{isDefault ? 'DEFAULT FORM' : 'ALTERNATE FORM'}</span></span>
                <span className="variety-artwork">{summary.images[0] ? <img className="variety-art" src={summary.images[0]} alt={`Artwork of ${summary.name.replaceAll('-', ' ')}`} loading="lazy" /> : <span className="variety-art-placeholder" aria-label="Artwork unavailable">✳</span>}</span>
                <span className="variety-name">{summary.name.replaceAll('-', ' ')}</span>
                <span className="variety-types">{summary.types.map((type) => <TypeBadge type={type} key={type} />)}</span>
              </button>
              : <article className="variety-card variety-unavailable" key={name}><span className="variety-badge">UNAVAILABLE</span><h3>{name.replaceAll('-', ' ')}</h3><p>{varietyError || 'This form could not be loaded.'}</p></article>)}
          </div>}
    </section>
  );
}
