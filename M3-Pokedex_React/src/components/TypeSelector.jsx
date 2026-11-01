import { POKEMON_TYPES } from '../logic/types.js';

export default function TypeSelector({ selectedTypes, onChange }) {
  function updateType(slot, value) {
    const next = [...selectedTypes];
    next[slot] = value;

    // Promote the optional type if the primary selection is cleared, and avoid duplicate slots.
    if (slot === 0 && !value && next[1]) return onChange([next[1]]);
    if (next[0] && next[0] === next[1]) next[1] = '';
    onChange(next.filter(Boolean).slice(0, 2));
  }

  return (
    <div className="type-selector">
      <label className="type-select-label" htmlFor="type-select-primary">DEFENDING TYPE</label>
      <select id="type-select-primary" className="type-select" value={selectedTypes[0] ?? ''} onChange={(event) => updateType(0, event.target.value)}>
        <option value="">Choose a type</option>
        {POKEMON_TYPES.map((type) => <option value={type} key={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}
      </select>

      <label className="type-select-label" htmlFor="type-select-secondary">SECOND TYPE <span>OPTIONAL</span></label>
      <select id="type-select-secondary" className="type-select" value={selectedTypes[1] ?? ''} onChange={(event) => updateType(1, event.target.value)}>
        <option value="">No second type</option>
        {POKEMON_TYPES.filter((type) => type !== selectedTypes[0]).map((type) => <option value={type} key={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}
      </select>
    </div>
  );
}
