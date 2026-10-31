const formatStatName = (name) => name.replaceAll('-', ' ').replace('special', 'sp.').toUpperCase();

export default function PokemonStats({ stats }) {
  if (!stats.length) return <p className="no-stats">Base stats are unavailable for this record.</p>;

  return (
    <div className="base-stats">
      <div className="stats-heading"><span>BASE STATS</span><span>0 — 255</span></div>
      {stats.map(({ name, value }) => (
        <div className="stat-row" key={name}>
          <span>{formatStatName(name)}</span>
          <div className="stat-track" aria-label={`${formatStatName(name)} ${value} out of 255`}>
            <i style={{ '--stat-width': `${Math.min((value / 255) * 100, 100)}%` }} />
          </div>
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}
