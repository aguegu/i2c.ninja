// After vite build and prerender.mjs: the service worker (dist/sw.js), by
// Workbox. Pages go to the network first: online, each comes through
// Cloudflare as usual (its Web Analytics beacon added on the way, so a
// returning visit counts) and fresh; a copy is kept as it passes. Offline,
// the failsafe: a page opened before from its copy, any other from the
// precached app shell (index.html), whose router opens the page asked for.
// The app's scripts, styles and drawings are precached, cache-first. A new
// release waits until the page says to reload (lib/pwa.js).
import { generateSW } from 'workbox-build';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist', import.meta.url)); // no trailing slash: Workbox's glob finds nothing with one
const NETWORK_TIMEOUT_S = 5; // a page from the network this slow: its kept copy instead, if there is one

const { count, size, warnings } = await generateSW({
  globDirectory: DIST,
  // the pages' own HTML not precached: precached, they'd be served from the
  // cache before the network was asked; only the app shell, for offline
  globPatterns: ['index.html', '**/*.{js,css,svg,png,ico,webmanifest}'],
  globIgnores: ['sw.js', 'workbox-*.js'],
  swDest: `${DIST}/sw.js`,
  runtimeCaching: [{
    urlPattern: ({ request }) => request.mode === 'navigate',
    handler: 'NetworkFirst',
    options: {
      cacheName: 'pages',
      networkTimeoutSeconds: NETWORK_TIMEOUT_S,
      precacheFallback: { fallbackURL: '/index.html' },
    },
  }],
  skipWaiting: false, // a new release waits for the page's reload
  clientsClaim: true,
  sourcemap: false,
  mode: 'production',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
});
for (const w of warnings) console.warn(`sw: ${w}`);
console.log(`sw: ${count} files precached, ${(size / 1024).toFixed(0)} KiB; pages network first`);
