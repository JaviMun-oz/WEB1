import TypeBadge from './TypeBadge.jsx';

const groups = [
  { label: 'VULNERABLE', className: 'matchup-weak', matches: ({ multiplier }) => multiplier >= 2 },
  { label: 'IMMUNE', className: 'matchup-immune', matches: ({ multiplier }) => multiplier === 0 },
  { label: 'RESISTANT', className: 'matchup-resistant', matches: ({ multiplier }) => multiplier > 0 && multiplier < 1 },
  { label: 'NEUTRAL', className: 'matchup-neutral', matches: ({ multiplier }) => multiplier === 1 },
];

export default function TypeMatchups({ rows, loading, error }) {
  if (loading) return <div className="chart-loading" role="status"><span className="loader" /></div>;
  if (error) return <p className="type-chart-message" role="alert">{error}</p>;
  if (!rows.length) return <p className="type-chart-message">Choose one or two defending types to see their matchups.</p>;

  return (
    <div className="type-chart">
      {groups.map(({ label, className, matches }) => {
        const matchups = rows.filter(matches);
        if (!matchups.length) return null;

        return (
          <section className={`matchup-group ${className}`} key={className}>
            <h4>{label}</h4>
            <div className="matchup-types">
              {matchups.map(({ type, multiplier }) => (
                <span className="matchup-type" key={type}>
                  <TypeBadge type={type} /><b>×{multiplier}</b>
                </span>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
