import { useEffect, useState } from 'react';
import { getPokemonVarieties } from '../api/pokeapi.js';
import { normalizePokemon } from '../logic/pokemon.js';

const emptyState = { speciesName: null, varieties: [], loading: false, error: '' };

export default function usePokemonVarieties(pokemonRecord) {
  const speciesName = pokemonRecord?.species?.name ?? null;
  const [state, setState] = useState(emptyState);

  useEffect(() => {
    if (!speciesName) {
      setState(emptyState);
      return undefined;
    }

    const controller = new AbortController();
    setState({ speciesName, varieties: [], loading: true, error: '' });

    // The API only needs species identity here; form selection should not refetch sibling forms.
    getPokemonVarieties({ species: { name: speciesName } }, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;

        // Keep failed entries beside successful forms so one bad request does not hide the rest.
        const varieties = result.varieties.map((variety) => ({
          ...variety,
          summary: variety.pokemon ? normalizePokemon(variety.pokemon) : null,
        }));
        setState({ speciesName, varieties, loading: false, error: '' });
      })
      .catch((requestError) => {
        if (!controller.signal.aborted && requestError.name !== 'AbortError') {
          setState({ speciesName, varieties: [], loading: false, error: requestError.message || 'Available forms could not be loaded.' });
        }
      });

    return () => controller.abort();
  }, [speciesName]);

  // During the render before the effect runs, don't expose the previous species' forms.
  if (state.speciesName !== speciesName) {
    return { varieties: [], loading: Boolean(speciesName), error: '' };
  }
  return { varieties: state.varieties, loading: state.loading, error: state.error };
}
