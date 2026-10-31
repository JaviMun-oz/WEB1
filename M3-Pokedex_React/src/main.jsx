import React from 'react';
import { createRoot } from 'react-dom/client';

// This starter confirms the React/Vite entry works before the interface is migrated.
function App() {
  return <main><h1>Pokédex Field Notes</h1><p>React migration starter</p></main>;
}

createRoot(document.getElementById('root')).render(<App />);
