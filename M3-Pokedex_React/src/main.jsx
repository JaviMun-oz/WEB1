import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getPokemonByName, getPokemonVarieties } from './api/pokeapi.js';
import { normalizePokemon } from './logic/pokemon.js';
import Header from './components/Header.jsx';
import SearchBar from './components/SearchBar.jsx';
import PokemonCard from './components/PokemonCard.jsx';
import Footer from './components/Footer.jsx';
import TypeCalculator from './components/TypeCalculator.jsx';
import VarietySelector from './components/VarietySelector.jsx';
import './style.css';

function App() {
  const [query, setQuery] = useState('');
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [varietiesLoading, setVarietiesLoading] = useState(false);
  const [varietiesError, setVarietiesError] = useState('');
  const activeRequest = useRef(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function handleSearch(event) {
    event.preventDefault();
    const searchTerm = query.trim();
    if (!searchTerm) {
      setError('Enter a Pokémon name or Pokédex number to begin.');
      return;
    }

    // Cancel the previous lookup so a slow response cannot replace a newer search.
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setError('');
    setPokemon(null);
    setVarieties([]);
    setVarietiesError('');
    setVarietiesLoading(true);

    try {
      const record = await getPokemonByName(searchTerm, { signal: controller.signal });
      if (!controller.signal.aborted) {
        const normalizedPokemon = normalizePokemon(record);
        setPokemon(normalizedPokemon);
        setSelectedTypes(normalizedPokemon.types.slice(0, 2));

        // Load forms independently so the record and type notes can appear first.
        getPokemonVarieties(record, { signal: controller.signal })
          .then((result) => {
            if (!controller.signal.aborted) {
              setVarieties(result.varieties.map((variety) => ({
                ...variety,
                summary: variety.pokemon ? normalizePokemon(variety.pokemon) : null,
              })));
            }
          })
          .catch((varietyError) => {
            if (!controller.signal.aborted && varietyError.name !== 'AbortError') setVarietiesError(varietyError.message);
          })
          .finally(() => {
            if (!controller.signal.aborted) setVarietiesLoading(false);
          });
      }
    } catch (searchError) {
      if (searchError.name !== 'AbortError') setError(searchError.message || 'The Pokémon record could not be loaded.');
      if (!controller.signal.aborted) setVarietiesLoading(false);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function selectVariety(selectedPokemon) {
    setPokemon(selectedPokemon);
    setSelectedTypes(selectedPokemon.types.slice(0, 2));
  }

  return (
    <div className="app-shell">
      <Header />
      <main>
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">A living catalogue · Est. 1996</p>
          <h1 id="page-title">Every Pokémon<br /><em>has a story.</em></h1>
          <p className="intro-copy">A field guide for curious trainers. Search a species to explore its traits, habitats, and elemental affinities.</p>
        </section>

        <SearchBar query={query} onQueryChange={setQuery} onSubmit={handleSearch} />
        <section className="record-layout" aria-label="Pokémon field record">
          <PokemonCard pokemon={pokemon} loading={loading} error={error} />
          <TypeCalculator selectedTypes={selectedTypes} onTypesChange={setSelectedTypes} />
        </section>
        <VarietySelector varieties={varieties} loading={varietiesLoading} error={varietiesError} selectedId={pokemon?.id} onSelect={selectVariety} />
      </main>
      <Footer />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
