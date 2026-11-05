// After vite build and prerender.mjs: the service worker (dist/sw.js), by
// Workbox, precaching every file the site has (the app, its drawings, every
// page's own HTML), so the site works offline once visited: the dongle
// needs USB, not the internet. /adxl345 is served from adxl345.html (the
// precache's clean URLs); an address it doesn't have, from index.html (the app's Not
// found). A new release waits until the page says to reload (lib/pwa.js).
import { generateSW } from 'workbox-build';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist', import.meta.url)); // no trailing slash: Workbox's glob finds nothing with one

const { count, size, warnings } = await generateSW({
  globDirectory: DIST,
  globPatterns: ['**/*.{html,js,css,svg,png,ico,webmanifest,xml,txt}'],
  globIgnores: ['sw.js', 'workbox-*.js', '404.html', 'setup.html'],
  swDest: `${DIST}/sw.js`,
  navigateFallback: '/index.html',
  skipWaiting: false, // a new release waits for the page's reload
  clientsClaim: true,
  sourcemap: false,
  mode: 'production',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
});
for (const w of warnings) console.warn(`sw: ${w}`);
console.log(`sw: ${count} files precached, ${(size / 1024).toFixed(0)} KiB`);
