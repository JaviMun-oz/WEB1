import { useState } from 'react';
import PokemonStats from './PokemonStats.jsx';
import TypeBadge from './TypeBadge.jsx';

function SearchState({ loading, error }) {
  if (loading) return <div className="state-message" role="status"><span className="loader" /><p>Consulting the field guide...</p></div>;
  if (error) return <div className="state-message error-state" role="alert"><span className="state-symbol">!</span><p>{error}</p></div>;

  return (
    <div className="pokemon-panel empty-panel">
      <div className="empty-art" aria-hidden="true">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" />
        <div className="pokeball"><span /></div><span className="spark spark-a">✳</span><span className="spark spark-b">✦</span>
        <span className="art-caption">SPECIMEN AWAITING DISCOVERY</span>
      </div>
      <div className="empty-copy">
        <p className="empty-kicker">YOUR NEXT DISCOVERY</p>
        <h3>The wild is<br /><em>full of wonder.</em></h3>
        <p>Enter a Pokémon’s name or number above to open its field record. Its portrait, traits, and base stats will appear here.</p>
        <span className="record-meta"><span className="meta-dot" /> NO SPECIMEN SELECTED</span>
      </div>
    </div>
  );
}

export default function PokemonCard({ pokemon, loading, error }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [imageUnavailable, setImageUnavailable] = useState(false);

  return (
    <article className="record-card" aria-labelledby="record-heading">
      <div className="section-heading">
        <span className="section-index">01</span><h2 id="record-heading">SPECIES RECORD</h2>
        <span className="rule" /><span className="record-stamp">FIELD LOG</span>
      </div>
      {!pokemon || loading || error
        ? <SearchState loading={loading} error={error} />
        : <PokemonRecord key={pokemon.id} pokemon={pokemon} imageIndex={imageIndex} setImageIndex={setImageIndex} imageUnavailable={imageUnavailable} setImageUnavailable={setImageUnavailable} />}
    </article>
  );
}

function PokemonRecord({ pokemon, imageIndex, setImageIndex, imageUnavailable, setImageUnavailable }) {
  const number = String(pokemon.id).padStart(4, '0');
  const image = pokemon.images[imageIndex];

  return (
      <div className="pokemon-panel pokemon-record-panel">
        <div className="pokemon-visual">
          {image && !imageUnavailable
            ? <img className="pokemon-art" src={image} alt={`Artwork of ${pokemon.name.replaceAll('-', ' ')}`} onError={() => imageIndex < pokemon.images.length - 1 ? setImageIndex((index) => index + 1) : setImageUnavailable(true)} />
            : <div className="missing-art" role="img" aria-label="Artwork unavailable">✳</div>}
          <span className="specimen-number">NO. {number}</span>
        </div>
        <div className="pokemon-details">
          <p className="empty-kicker">SPECIES RECORD · NO. {number}</p>
          <h3>{pokemon.name.replaceAll('-', ' ')}</h3>
          <div className="type-list">{pokemon.types.map((type) => <TypeBadge type={type} key={type} />)}</div>
          <p className="pokemon-facts">
            {pokemon.height != null && <>HEIGHT <b>{pokemon.height} m</b></>}
            {pokemon.height != null && pokemon.weight != null && <span>·</span>}
            {pokemon.weight != null && <>WEIGHT <b>{pokemon.weight} kg</b></>}
          </p>
          <div className="ability-notes"><span>KNOWN ABILITIES</span><p>{pokemon.abilities.map((ability) => ability.replaceAll('-', ' ')).join(' · ') || 'Not recorded'}</p></div>
          <PokemonStats stats={pokemon.stats} />
          <span className="record-meta"><span className="meta-dot" /> FIELD RECORD UPDATED</span>
        </div>
      </div>
  );
}
