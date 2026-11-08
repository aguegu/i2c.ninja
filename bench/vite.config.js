// The bench's own build (production Vue, as the site ships):
//   npx vite build --config bench/vite.config.js   -> bench/dist
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [vue(), tailwindcss()],
  build: { outDir: 'dist', emptyOutDir: true },
});
