import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Root path — this app is deployed at the domain root on Vercel, not under
  // a repo-name subpath like GitHub Pages requires. Do not set this to
  // "/Vinayaka/" or any other subpath.
  base: '/',
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 4173 },
});
