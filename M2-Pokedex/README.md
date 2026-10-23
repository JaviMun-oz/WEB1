# Pokédex Field Notes

## Access the application

Node.js and npm are required in order to run the Pokedex.
From the `M2-Pokedex` directory, run:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite in your browser (usually `http://localhost:5173/`).

## Core Features

This application is an interactive Pokedex that allows users to search for Pokémon and explore their essential information like type matchups, stats, and forms. 

**Pokedex Search**: Search for Pokémon by name or Pokedex number, displaying their sprites, types, abilities, and base stats.

**Type and effectiveness chart**: Displays the selected Pokemon's weaknesses, resistances, and immunities, including combined multipliers for dual-type Pokemon.

**Type lookup**: Allows users to manually select one or two Pokemon types to check their defensive effectiveness without searching for a specific Pokémon.

## Forms and variants

Search for a Pokémon species to see its default and alternate forms. Select a form card to open that form's record and update the type chart. Variety data comes from PokéAPI's `/pokemon-species/{name}` endpoint; form details are fetched from the `/pokemon/{id or name}` resource URLs returned there.

## Project Structure

The application uses JavaScript ES modules to separate its different functionalities.

**index.html**: Contains the main HTML structure of the application.

**src/app.js**: Handles user interactions and coordinates the different modules.

**src/api/pokeapi.js**: Handles API requests, responses and caching.

**src/logic/pokemon.js**: Processes the Pokémon data retrieved from PokeAPI.

**src/logic/types.js**: Calculates type effectiveness and dual-type combinations.

**src/ui/render.js**: Displays Pokémon information and updates the interface.

**src/style.css**: Handles the application's appearance and layout.

**package.json**: Contains project dependencies and Vite commands.

## Autopsy

### Asynchronous Operations

When searching for a Pokémon, the information needs to be retrieved from PokéAPI. The relevant functions are handlePokemonSearch() in app.js and getPokemonByName() in pokeapi.js. Using fetch, the application sends a request to PokéAPI, then uses async/await to handle the response without blocking the browser interface. Promise.all retrieves multiple type records concurrently, rejecting if any request fails. Promise.allSettled handles the requests for alternate Pokémon varieties, allowing individual requests to fail without discarding successful results.

### Data Transformation

The application uses array methods such as `map`, `filter`, and `reduce` to transform the information retrieved from PokéAPI into data that can be displayed and calculated.
In `normalizePokemon()`, the API returns complex objects for Pokémon types, abilities, and stats, which are then converted by `map()` into simpler values that the interface can use. `filter()` removes missing or invalid data, such as unavailable images.
In `calculateTypeEffectiveness()`, `reduce()` combines the defensive multipliers of a Pokémon's types, such as calculating a 4× weakness from two individual 2× weaknesses. `reduce()` is also used in `normalizeTypeResponse()` to remove duplicate entries from type lists.

### Error Handling and Caching

When the application searches for an invalid Pokémon, such as `asdfgh`, PokéAPI returns an HTTP 404 response. The application displays an error instead of crashing. If the user loses their internet connection, the application catches the failed request using `try/catch`. `AbortController` allows the application to cancel requests that take too long. If data is missing, the application handles the unavailable information without breaking the interface.

Using `localStorage`, the application caches successfully retrieved information instead of downloading it every time a Pokémon is searched. This improves efficiency since previously retrieved information can be reused for later searches.

### Application Flow

The application is coordinated by `app.js`, which handles user interactions and connects the different modules. The user searches for a Pokémon using its name or Pokédex number. The search event is handled by `app.js`, then `pokeapi.js` retrieves the information from PokéAPI or the cache. `pokemon.js` processes the data, and `types.js` handles type calculations. `render.js` updates the page with the Pokémon's information. Selecting an alternate form or manually changing the type lookup triggers another update using the relevant modules.











