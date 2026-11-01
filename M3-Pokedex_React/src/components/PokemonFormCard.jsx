import TypeBadge from './TypeBadge.jsx';

export default function PokemonFormCard({ variety, selected, onSelect }) {
  const { name, isDefault, summary, error } = variety;

  if (!summary) {
    return (
      <article className="variety-card variety-unavailable" aria-label={`${name.replaceAll('-', ' ')} unavailable`}>
        <span className="variety-badge">UNAVAILABLE</span>
        <h3>{name.replaceAll('-', ' ')}</h3>
        <p>{error || 'This form could not be loaded.'}</p>
      </article>
    );
  }

  const displayName = summary.name.replaceAll('-', ' ');
  return (
    <button
      className={`variety-card${selected ? ' variety-selected' : ''}`}
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(variety.pokemon)}
    >
      <span className="variety-badges">
        <span className={`variety-badge${isDefault ? ' default-badge' : ' alternate-badge'}`}>
          {isDefault ? 'DEFAULT FORM' : 'ALTERNATE FORM'}
        </span>
      </span>
      <span className="variety-artwork">
        {summary.images[0]
          ? <img className="variety-art" src={summary.images[0]} alt={`Artwork of ${displayName}`} loading="lazy" />
          : <span className="variety-art-placeholder" aria-label="Artwork unavailable">✳</span>}
      </span>
      <span className="variety-name">{displayName}</span>
      <span className="variety-types">{summary.types.map((type) => <TypeBadge type={type} key={type} />)}</span>
    </button>
  );
}
