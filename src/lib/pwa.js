// The service worker (built by scripts/sw.mjs), registered in a production
// build on i2c.ninja only: the dev server, and a build previewed on our own
// machines (localhost, the bench's addresses), stay uncached, so a test always
// runs the newest build; one registered there before is taken out. A new release, once
// downloaded, waits; updateReady turns true and the page offers a reload
// (applyUpdate), so a running lesson isn't cut off.
import { ref } from 'vue';
import { Workbox } from 'workbox-window';

export const updateReady = ref(false);
let wb = null;

const ON_SITE = typeof location !== 'undefined' && /(^|\.)i2c\.ninja$/.test(location.hostname);

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  if (!ON_SITE) {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
    return;
  }
  wb = new Workbox('/sw.js');
  wb.addEventListener('waiting', () => { updateReady.value = true; });
  wb.addEventListener('controlling', () => window.location.reload());
  wb.register();
}

export function applyUpdate() {
  wb?.messageSkipWaiting();
}
