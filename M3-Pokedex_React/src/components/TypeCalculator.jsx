import { useEffect, useMemo, useState } from 'react';
import { getTypesByName } from '../api/pokeapi.js';
import { calculateTypeEffectiveness, getPokemonForTypes, normalizeTypeResponse } from '../logic/types.js';
import SpeciesList from './SpeciesList.jsx';
import TypeMatchups from './TypeMatchups.jsx';
import TypeSelector from './TypeSelector.jsx';

export default function TypeCalculator({ selectedTypes, onTypesChange }) {
  const [typeRecords, setTypeRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedTypes.length) {
      setTypeRecords([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError('');

    // Type records come from the API; calculations and displayed lists are derived from those records.
    getTypesByName(selectedTypes, { signal: controller.signal })
      .then((responses) => {
        if (!controller.signal.aborted) setTypeRecords(responses.map(normalizeTypeResponse));
      })
      .catch((requestError) => {
        if (!controller.signal.aborted && requestError.name !== 'AbortError') {
          setTypeRecords([]);
          setError(requestError.message || 'Type information could not be loaded.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [selectedTypes]);

  const matchups = useMemo(() => typeRecords.length ? calculateTypeEffectiveness(typeRecords) : [], [typeRecords]);
  const pokemon = useMemo(() => getPokemonForTypes(typeRecords), [typeRecords]);
  const visiblePokemon = loading ? [] : pokemon;
  const selectedNames = selectedTypes.map((type) => type[0].toUpperCase() + type.slice(1));

  return (
    <aside className="effectiveness-card type-calculator" aria-labelledby="effectiveness-heading">
      <div className="section-heading"><span className="section-index">02</span><h2 id="effectiveness-heading">TYPE NOTES</h2></div>
      <div className="effectiveness-panel">
        <div className="type-glyph" aria-hidden="true">◈</div>
        <p className="empty-kicker">ELEMENTAL FIELD NOTES</p>
        <TypeSelector selectedTypes={selectedTypes} onChange={onTypesChange} />
        <p className="type-chart-message">
          {error || (selectedNames.length ? `Defending type${selectedNames.length > 1 ? 's' : ''}: ${selectedNames.join(' + ')}.` : 'Search for a Pokémon or choose a type above to explore its matchups.')}
        </p>
        <TypeMatchups rows={matchups} loading={loading} error={error} />
        <SpeciesList key={selectedTypes.join('|')} pokemon={visiblePokemon} />
      </div>
    </aside>
  );
}
