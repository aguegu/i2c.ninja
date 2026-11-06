// The device and physics pages this browser opened last, newest first, kept in
// localStorage: on this device only, nothing sent anywhere (the site has no
// backend), offline too. Storage may be blocked (a private window, site data
// cleared or refused): then the list just stays empty. Other tabs follow
// through the storage event.
import { ref } from 'vue';
import { DEVICE_LINKS, PHYSICS_LINKS } from './nav.js';

const KEY = 'i2c.ninja/recent';
const MAX = 4;
// each page that counts, with its label, a note and its kind
const PAGES = new Map([
  ...DEVICE_LINKS.map((l) => [l.to, { ...l, kind: 'device' }]),
  ...PHYSICS_LINKS.map((l) => [l.to, { ...l, note: 'Physics', kind: 'physics' }]),
]);

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v.filter((r) => r && PAGES.has(r.to) && typeof r.at === 'number').slice(0, MAX) : [];
  } catch {
    return [];
  }
}

// [{ to, at (ms) }], newest first
export const recent = ref(load());

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(recent.value));
  } catch {
    // storage blocked: kept for this page's life only
  }
}

// a page opened: to the top if it's a device or physics page (its own path,
// as the router matched it, so an alias counts as its page)
export function record(path) {
  if (!PAGES.has(path)) return;
  recent.value = [{ to: path, at: Date.now() }, ...recent.value.filter((r) => r.to !== path)].slice(0, MAX);
  save();
}

export function clearRecent() {
  recent.value = [];
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => { if (e.key === KEY) recent.value = load(); });
}

// the recent list with each page's label, note and kind ('device', 'physics');
// kind given: only those
export const withLabels = (list, kind) => list.map((r) => ({ ...PAGES.get(r.to), at: r.at })).filter((r) => !kind || r.kind === kind);

// "just now", "5 min ago", "3 h ago", "yesterday", "4 days ago"
export function ago(at, now = Date.now()) {
  const m = Math.round((now - at) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}
