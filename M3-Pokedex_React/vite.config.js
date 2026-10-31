import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Enable React's JSX transform and Fast Refresh during development.
export default defineConfig({
  plugins: [react()],
});
