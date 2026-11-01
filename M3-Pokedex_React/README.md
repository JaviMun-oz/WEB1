# Pokédex Field Notes

## Access the application

Node.js and npm are required in order to run the Pokedex.
From the `M3-Pokedex_React` directory, run:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite in your browser (usually `http://localhost:5173/`).

The application uses React 19 along with Vite.

## Core Features

This application is an interactive Pokedex that allows users to search for Pokémon and explore their essential information like type matchups, stats, and forms. 

**Pokedex Search**: Search for Pokémon by name or Pokedex number, displaying their sprites, types, abilities, and base stats.

**Type and effectiveness chart**: Displays the selected Pokemon's weaknesses, resistances, and immunities, including combined multipliers for dual-type Pokemon.

**Type lookup**: Allows users to manually select one or two Pokemon types to check their defensive effectiveness without searching for a specific Pokémon.

**Pokeball and Ultraball Mode**: The user may press the `N` key or press the button located at the top right of the screen to switch between a light Pokeball mode and a dark Ultraball mode. The selected theme is saved using `localStorage`, allowing the application to remember the user's preference when it is opened again.

## Forms and variants

Search for a Pokémon species to see its default and alternate forms. Select a form card to open that form's record and update the type chart. Variety data comes from PokéAPI's `/pokemon-species/{name}` endpoint; form details are fetched from the `/pokemon/{id or name}` resource URLs returned there. With the addition of React, selecting a different Pokémon form updates the application's state, causing React to re-render the relevant components with the newly selected Pokémon's information.

## Project Structure

The application uses JavaScript ES modules to separate its different functionalities.

**index.html**: Provides the HTML document and root element into which React renders the application.

**src/main.jsx**: Contains `App()` which manages queries, records, loading, errors and the selected types. App() coordinates the React components and passes data and event handlers through props.

**src/components/**: This can be split into certain responsibilities:
	SearchBar, PokemonCard, and PokemonStats handle searching and displaying Pokémon.
	
	PokemonForms and PokemonFormCard handle the alternate Pokémon forms.

	TypeCalculator, TypeMatchups, TypeSelector and SpeciesList handle type related functionality.

	Header and Footer provide the surrounding layout.

**src/hooks/**: There are two custom hooks
	useTheme.js, which manages the selected visual theme with useState. useEffect updates the theme attribute, saves the selection and registers the `N` key shortcut.

	usePokemonVarieties.js manages the Pokémon variety data separately from the main component. It allows the main component to consume variety data without containing all the fetching logic itself.

**src/api/**: Separated the api into:
	pokemon.js handles Pokémon-related API requests.

	types.js handles type-related API requests.

	client.js provides shared request functionality, including communication and error handling.

**src/logic/types.js**: Calculates type effectiveness and dual-type combinations.

**src/logic/pokemon.js**: It processes and normalizes the Pokémon data returned by PokéAPI.

**src/style.css**: Handles the application's appearance and layout.

**package.json**: Contains project dependencies and Vite commands.

## Autopsy

### Asynchronous Operations

When searching for a Pokémon, the information needs to be retrieved from PokéAPI. The search is coordinated by the App() component in main.jsx, while the API modules handle requests to PokéAPI. Using fetch, the application sends a request to PokéAPI, then uses async/await to handle the response without blocking the browser interface. Promise.all retrieves multiple type records concurrently, rejecting if any request fails. Promise.allSettled handles the requests for alternate Pokémon varieties, allowing individual requests to fail without discarding successful results. 

useState stores values such as the current Pokémon, loading status, and errors. When those values change, React re-renders the relevant interface. useEffect allows the application to synchronize with external systems, including making requests when a dependency changes. AbortController allows pending requests to be cancelled when they are no longer needed, helping prevent outdated responses from interfering with newer searches. By updating the loading, error, and Pokémon states, React can automatically display the appropriate information without manually modifying the HTML elements.

### Data Transformation

The application uses array methods such as `map`, `filter`, and `reduce` to transform the information retrieved from PokéAPI into data that can be displayed and calculated.
In `normalizePokemon()`, the API returns complex objects for Pokémon types, abilities, and stats, which are then converted by `map()` into simpler values that the interface can use. `filter()` removes missing or invalid data, such as unavailable images.
In `calculateTypeEffectiveness()`, `reduce()` combines the defensive multipliers of a Pokémon's types, such as calculating a 4× weakness from two individual 2× weaknesses. `reduce()` is also used in `normalizeTypeResponse()` to remove duplicate entries from type lists.
With React, the type calculator derives its effectiveness results from the currently selected types, and the relevant components are re-rendered when the selected types change.

### Error Handling and Caching

When the application searches for an invalid Pokémon, such as `asdfgh`, PokéAPI returns an HTTP 404 response. The application displays an error instead of crashing. If the user loses their internet connection, the application catches the failed request using `try/catch`. `AbortController` allows the application to cancel requests that take too long. If data is missing, the application handles the unavailable information without breaking the interface.

Using `localStorage`, the application caches successfully retrieved information instead of downloading it every time a Pokémon is searched. This improves efficiency since previously retrieved information can be reused for later searches.

With React, `App()` manages values such as loading, errors, and the currently selected Pokémon. When a request starts, the application displays a loading indicator. If the request fails, an error message is displayed. If it succeeds, the Pokémon's information is rendered.

### Application Flow

First, the user enters a Pokémon name or number into the search bar and submits it. App() then handles the search, managing the loading, error, and Pokémon states. The Pokémon's state is also managed by App(). The API modules will retrieve the information from pokeAPI or the cache, if it has been searched before. The logic modules will then normalize the Pokémon data, and calculate the type effectiveness. When the Pokémon state changes, React re-renders the relevant components to display the updated information.

### React Architecture and State Management

The application divides the interface into reusable components, such as SearchBar, PokemonCard and TypeCalculator. These describe what React should display. Props then allow for a parent component to pass information or callback functions to its children. This makes it easier to reuse and maintain in the future. 

App() then uses useState to manage the changing information. When a state changes, React schedules a re-rendering of the component. This allows for the interface to respond to searches without manipulating the DOM. useEffect then synchronizes with external systems. useTheme uses effects to synchronize the selected theme with the browser. It updates the theme attribute, persists the selection in LocalStorage, and registers the N keyboard shortcut. Effects can also return cleanup functions, such as removing the keyboard event listener when it is no longer needed. usePokemonVarieties() handles Pokémon variety retrieval and its associated state. Separating these functionalities into custom hooks keeps their logic outside the main App() component, making the application easier to organize and maintain.


## Use of AI.

I used the Codex extension within VS Code as a programming assistant to develop the application in phases.

Example prompts:

"Using the React 19 project established in Phase 1, implement the core Pokédex interface."

"Redesign the existing React Pokédex application's visual style around two Pokémon-inspired themes: a classic Poké Ball theme for light mode and an Ultra Ball theme for dark mode."

(Both prompts included additional requirements, which have been omitted here for clarity.)

I did not write any of the application's code manually. However, I reviewed the implemented features and tested the application to check that it worked as intended.
I also used ChatGPT to help plan the development phases, review the assignment requirements, and understand the generated code while preparing this README. 





