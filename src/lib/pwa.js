// The service worker (built by scripts/sw.mjs), registered in a production
// build only: the dev server stays uncached. A new release, once
// downloaded, waits; updateReady turns true and the page offers a reload
// (applyUpdate), so a running lesson isn't cut off.
import { ref } from 'vue';
import { Workbox } from 'workbox-window';

export const updateReady = ref(false);
let wb = null;

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  wb = new Workbox('/sw.js');
  wb.addEventListener('waiting', () => { updateReady.value = true; });
  wb.addEventListener('controlling', () => window.location.reload());
  wb.register();
}

export function applyUpdate() {
  wb?.messageSkipWaiting();
}
