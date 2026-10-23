# Pokédex Field Notes

## Access the application

From the `M2-Pokedex` directory, run:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite in your browser (usually `http://localhost:5173/`).

## Forms and variants

Search for a Pokémon species to see its default and alternate forms. Select a form card to open that form's record and update the type chart. Variety data comes from PokéAPI's `/pokemon-species/{name}` endpoint; form details are fetched from the `/pokemon/{id or name}` resource URLs returned there.
